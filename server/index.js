import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Google Drive API Configuration
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/drive.file']
);

const drive = google.drive({ version: 'v3', auth });

// Configure Multer (memory storage for uploads)
const upload = multer({ storage: multer.memoryStorage() });

// --- ENDPOINTS ---

// 1. Get all active sports
app.get('/api/sports', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM rpl_sports WHERE is_active = TRUE');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

// 2. Get all registration fields (questions)
app.get('/api/registration-fields', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rpl_registration_fields ORDER BY sort_order ASC');
    // Parse JSON columns in MySQL (some drivers return them parsed, others return them as strings/buffers)
    const fields = rows.map(field => ({
      ...field,
      options: typeof field.options === 'string' ? JSON.parse(field.options) : field.options,
      validation_rules: typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : field.validation_rules,
    }));
    res.json(fields);
  } catch (error) {
    console.error('Error fetching registration fields:', error);
    res.status(500).json({ error: 'Failed to fetch registration fields' });
  }
});

// 2b. Mumukshu Lookup by Mobile Number (from card_db)
app.get('/api/mumukshu-lookup', async (req, res) => {
  const { mobile } = req.query;

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  try {
    // Strip non-digits (remove +91, spaces, hyphens)
    const digitsOnly = String(mobile).replace(/\D/g, '');
    const cleanMobile = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    if (cleanMobile.length < 7) {
      return res.json({ found: false, message: 'Invalid mobile number length' });
    }

    const [rows] = await db.query(
      "SELECT cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, mobno, email, center, pfp FROM card_db WHERE mobno = ? OR mobno LIKE ? LIMIT 1",
      [cleanMobile, `%${cleanMobile}`]
    );

    if (rows.length === 0) {
      return res.json({ found: false, message: 'Not found in card_db' });
    }

    const member = rows[0];

    // Format gender
    let formattedGender = 'Male';
    if (member.gender === 'F') formattedGender = 'Female';

    // Format date of birth directly as YYYY-MM-DD string (no timezone shift)
    const formattedDob = member.dob || '';

    return res.json({
      found: true,
      data: {
        cardNo: member.cardno,
        fullName: member.issuedto || '',
        gender: formattedGender,
        dateOfBirth: formattedDob,
        email: member.email || '',
        centre: member.center || '',
        photoUrl: member.pfp || '',
        isMumukshu: true,
      },
    });
  } catch (error) {
    console.error('Mumukshu lookup error:', error);
    res.status(500).json({ error: 'Failed to query card_db' });
  }
});

// 3. Handle File Uploads (Photo / Payment Screenshot to Google Drive)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct player-branded filename (e.g. Purvit_Shah_Photo.jpg or Vatsal_Shah_Payment_Receipt.jpg)
    const customName = req.body.customName;
    const cleanPrefix = customName
      ? String(customName).trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_')
      : 'RPL';
    const ext = req.file.originalname.includes('.')
      ? req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))
      : '.jpg';
    const finalFileName = `${cleanPrefix}_${Date.now()}${ext}`;

    // A. Google Apps Script Webhook Upload (Easiest Method)
    if (process.env.GOOGLE_DRIVE_WEBHOOK_URL) {
      const base64Data = req.file.buffer.toString('base64');
      const response = await fetch(process.env.GOOGLE_DRIVE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Data,
          mimeType: req.file.mimetype,
          fileName: finalFileName,
        }),
      });

      const responseText = await response.text();
      try {
        const result = JSON.parse(responseText);
        if (result && result.url) {
          return res.json({ url: result.url });
        }
      } catch {
        console.error('Google Apps Script response error:', responseText);
        return res.status(500).json({ error: 'Google Drive Webhook error. Please ensure folder ID is replaced in script.' });
      }
    }

    // B. Google Service Account Upload
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: finalFileName,
        parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: bufferStream,
      };

      const driveResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      await drive.permissions.create({
        fileId: driveResponse.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return res.json({ url: driveResponse.data.webViewLink });
    }

    return res.status(500).json({ error: 'No Google Drive upload configuration found in .env.' });
  } catch (error) {
    console.error('Google Drive upload error:', error);
    res.status(500).json({ error: 'Google Drive upload server error' });
  }
});

// Helper to look up answer value regardless of snake_case or camelCase
function getFieldValue(answers, fieldKey) {
  if (!answers || typeof answers !== 'object') return undefined;
  if (answers[fieldKey] !== undefined && answers[fieldKey] !== null && answers[fieldKey] !== '') {
    return answers[fieldKey];
  }

  // snake_case -> camelCase (e.g. tshirt_size -> tshirtSize, date_of_birth -> dateOfBirth)
  const camelKey = fieldKey.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  if (answers[camelKey] !== undefined && answers[camelKey] !== null && answers[camelKey] !== '') {
    return answers[camelKey];
  }

  // camelCase -> snake_case (e.g. tshirtSize -> tshirt_size)
  const snakeKey = fieldKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  if (answers[snakeKey] !== undefined && answers[snakeKey] !== null && answers[snakeKey] !== '') {
    return answers[snakeKey];
  }

  // Case-insensitive / underscore-insensitive lookup
  const cleanKey = fieldKey.toLowerCase().replace(/_/g, '');
  for (const [k, v] of Object.entries(answers)) {
    if (k.toLowerCase().replace(/_/g, '') === cleanKey && v !== undefined && v !== null && v !== '') {
      return v;
    }
  }

  return undefined;
}

// 4. Handle Registration (Dynamic Validation & Save)
app.post('/api/register', async (req, res) => {
  const {
    sport_id,
    full_name,
    email,
    mobile,
    player_photo_url,
    payment_utr,
    payment_receipt_url,
    general_details,
    sport_answers,
    answers,
  } = req.body;

  if (!full_name || !email || !mobile) {
    return res.status(400).json({ error: 'Missing core registration fields.' });
  }

  try {
    const activeSport = sport_id || 'cricket';
    const cleanFullName = full_name.trim();
    const cleanEmail = email.trim();
    const cleanMobile = mobile.trim();

    // Prepare clean sanitized answers (Ensure no raw base64 data URLs enter MySQL)
    const sanitizedAnswers = answers ? { ...answers } : {};
    delete sanitizedAnswers.photoDataUrl;
    if (typeof sanitizedAnswers.photoPreview === 'string' && sanitizedAnswers.photoPreview.startsWith('data:')) {
      delete sanitizedAnswers.photoPreview;
    }

    const cleanGeneralDetails = general_details ? { ...general_details } : { ...sanitizedAnswers };
    delete cleanGeneralDetails.photoDataUrl;
    if (typeof cleanGeneralDetails.photoPreview === 'string' && cleanGeneralDetails.photoPreview.startsWith('data:')) {
      delete cleanGeneralDetails.photoPreview;
    }

    const cleanSportAnswers = sport_answers || {};

    const cleanPhotoUrl = player_photo_url || sanitizedAnswers.photoDriveUrl || null;
    const cleanPaymentUtr = payment_utr || sanitizedAnswers.payment_utr || null;
    const cleanReceiptUrl = payment_receipt_url || sanitizedAnswers.payment_receipt || null;

    // A. Fetch rules for this registration
    const [fields] = await db.query(
      'SELECT field_key, field_type, label, options, validation_rules FROM rpl_registration_fields WHERE sport_id = ? OR sport_id IS NULL',
      [activeSport]
    );

    const validationErrors = {};

    // B. Run Dynamic Validation
    fields.forEach((field) => {
      const value = getFieldValue(sanitizedAnswers, field.field_key);
      const rules = typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : (field.validation_rules || {});
      const options = typeof field.options === 'string' ? JSON.parse(field.options) : (field.options || []);

      // Rule: Required check
      if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
        // Enforce core fields, warn on optional fields
        if (['full_name', 'email', 'mobile', 'centre'].includes(field.field_key)) {
          validationErrors[field.field_key] = `${field.label} is required.`;
          return;
        } else {
          console.warn(`[RPL Validation Notice] Field '${field.field_key}' is empty, proceeding with save.`);
        }
      }

      // Rule: Select option verification (permissive matching)
      if (field.field_type === 'select' && value && Array.isArray(options) && options.length > 0) {
        const isMatch = options.some((opt) => {
          const optStr = String(typeof opt === 'object' ? opt.value || opt.id || opt.label : opt).toLowerCase();
          const valStr = String(value).toLowerCase();
          return optStr === valStr || valStr.includes(optStr) || optStr.includes(valStr);
        });
        if (!isMatch) {
          console.warn(`[RPL Validation Notice] Option '${value}' for '${field.field_key}' accepted.`);
        }
      }

      // Rule: Numeric validation
      if (field.field_type === 'number' && value !== undefined && value !== null && value !== '') {
        const numVal = Number(value);
        if (isNaN(numVal)) {
          validationErrors[field.field_key] = `${field.label} must be a number.`;
        } else {
          if (rules.min !== undefined && numVal < rules.min) {
            validationErrors[field.field_key] = `${field.label} must be at least ${rules.min}.`;
          }
          if (rules.max !== undefined && numVal > rules.max) {
            validationErrors[field.field_key] = `${field.label} cannot exceed ${rules.max}.`;
          }
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      console.warn('[RPL Registration Warning] Validation errors:', validationErrors);
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // C. Save to MySQL rpl_registrations with organized columns
    const id = uuidv4();
    await db.query(
      `INSERT INTO rpl_registrations 
       (id, sport_id, full_name, email, mobile, player_photo_url, payment_status, payment_utr, payment_receipt_url, general_details, sport_answers, answers) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        id,
        activeSport,
        cleanFullName,
        cleanEmail,
        cleanMobile,
        cleanPhotoUrl,
        cleanPaymentUtr,
        cleanReceiptUrl,
        JSON.stringify(cleanGeneralDetails),
        JSON.stringify(cleanSportAnswers),
        JSON.stringify(sanitizedAnswers),
      ]
    );

    console.log(`[RPL Registration SUCCESS] Player "${cleanFullName}" saved to rpl_registrations with ID: ${id}`);
    res.json({ success: true, message: 'Registration submitted successfully', registration_id: id });
  } catch (error) {
    console.error('Registration processing error:', error);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});



// 5. Admin Endpoint: List submissions
app.get('/api/admin/registrations', async (req, res) => {
  const { sport_id, payment_status } = req.query;
  try {
    let query = 'SELECT r.*, s.name as sport_name FROM rpl_registrations r JOIN rpl_sports s ON r.sport_id = s.id';
    const params = [];

    const conditions = [];
    if (sport_id) {
      conditions.push('r.sport_id = ?');
      params.push(sport_id);
    }
    if (payment_status) {
      conditions.push('r.payment_status = ?');
      params.push(payment_status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY r.submitted_at DESC';

    const [rows] = await db.query(query, params);
    
    // Parse JSON answers for each registration
    const formatted = rows.map(r => ({
      ...r,
      answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// 6. Admin Endpoint: Update Payment Status
app.post('/api/admin/registrations/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid payment status.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE rpl_registrations SET payment_status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    res.json({ success: true, message: `Payment status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
