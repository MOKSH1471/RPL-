import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import crypto from 'crypto';
import db from './db.js';
import { processAccommodationBooking } from './services/roomBookingService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health & Readiness Probes (Public, lightweight, outside rate limits)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
});

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
const handleMumukshuLookup = async (req, res) => {
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

    // Format date of birth directly as YYYY-MM-DD string
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
        photoUrl: '',
        isMumukshu: true,
      },
    });
  } catch (error) {
    console.error('Mumukshu lookup error:', error);
    res.status(500).json({ error: 'Failed to query card_db' });
  }
};

app.get('/api/mumukshu-lookup', handleMumukshuLookup);
app.get('/api/card/lookup', handleMumukshuLookup);


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
    const cleanReceiptUrl = payment_receipt_url || sanitizedAnswers.payment_receipt_url || null;
    const cleanCheckInDate = req.body.check_in_date || sanitizedAnswers.checkInDate || sanitizedAnswers.check_in_date || '2026-12-24';
    const cleanCheckOutDate = req.body.check_out_date || sanitizedAnswers.checkOutDate || sanitizedAnswers.check_out_date || '2026-12-26';

    // Combined lookup object for dynamic validation
    const lookupAnswers = {
      full_name: cleanFullName,
      fullName: cleanFullName,
      email: cleanEmail,
      mobile: cleanMobile,
      mobile_number: cleanMobile,
      mobileNumber: cleanMobile,
      ...cleanGeneralDetails,
      ...sanitizedAnswers,
    };

    // A. Fetch rules for this registration
    const [fields] = await db.query(
      'SELECT field_key, field_type, label, options, validation_rules FROM rpl_registration_fields WHERE sport_id = ? OR sport_id IS NULL',
      [activeSport]
    );

    const validationErrors = {};

    // B. Run Dynamic Validation
    fields.forEach((field) => {
      const value = getFieldValue(lookupAnswers, field.field_key);
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
       (id, full_name, email, mobile, check_in_date, check_out_date, player_photo_url, payment_status, payment_utr, payment_receipt_url, general_details, sport_answers) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        id,
        cleanFullName,
        cleanEmail,
        cleanMobile,
        cleanCheckInDate,
        cleanCheckOutDate,
        cleanPhotoUrl,
        cleanPaymentUtr,
        cleanReceiptUrl,
        JSON.stringify(cleanGeneralDetails),
        JSON.stringify(cleanSportAnswers),
      ]
    );

    console.log(`[RPL Registration SUCCESS] Player "${cleanFullName}" saved to rpl_registrations with ID: ${id}`);

    // D. Automatically process Room Booking & Transactions if accommodation is required
    const accommodationResult = await processAccommodationBooking({
      cardno: cleanGeneralDetails.cardNo || null,
      fullName: cleanFullName,
      email: cleanEmail,
      mobile: cleanMobile,
      centre: cleanGeneralDetails.centre || 'Mumbai',
      gender: cleanGeneralDetails.gender || 'Male',
      checkInDate: cleanCheckInDate,
      checkOutDate: cleanCheckOutDate,
      accommodationRequired: cleanGeneralDetails.accommodationRequired || 'No',
    });

    if (accommodationResult.booked) {
      console.log(`[RPL Accommodation SUCCESS] Bookings and transactions created for "${cleanFullName}":`, accommodationResult.bookings);
    }

    res.json({
      success: true,
      message: 'Registration submitted successfully',
      registration_id: id,
      accommodation: accommodationResult,
    });
  } catch (error) {
    console.error('Registration processing error:', error);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});



// --- ADMIN API ENDPOINTS (Direct Access Mode) ---


// 1. Admin Endpoint: Aggregated Stats & Analytics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [regs] = await db.query('SELECT * FROM rpl_registrations');

    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let accommodationCount = 0;

    const sportsCount = {
      cricket: 0,
      football: 0,
      badminton: 0,
      'table-tennis': 0,
      pickleball: 0,
      volleyball: 0,
      'womens-sports': 0,
    };

    const tshirtSizes = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
      Other: 0,
    };

    const centresCount = {};

    regs.forEach((r) => {
      // Payment status
      const pStatus = (r.payment_status || 'pending').toLowerCase();
      if (pStatus === 'approved') approved++;
      else if (pStatus === 'rejected') rejected++;
      else pending++;

      // General Details parsing
      let gen = {};
      try {
        gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      } catch (e) {
        gen = {};
      }

      // Accommodation
      if (gen.accommodationRequired === 'Yes') {
        accommodationCount++;
      }

      // T-shirt size
      const rawSize = (gen.tshirtSize || '').trim();
      const matchedSizeKey = Object.keys(tshirtSizes).find((k) => rawSize.startsWith(k)) || 'Other';
      tshirtSizes[matchedSizeKey] = (tshirtSizes[matchedSizeKey] || 0) + 1;

      // Centre
      const centreName = gen.centre || 'Unspecified';
      centresCount[centreName] = (centresCount[centreName] || 0) + 1;

      // Sports
      const selected = Array.isArray(gen.selectedSports) ? gen.selectedSports : [];
      selected.forEach((s) => {
        const sKey = String(s).toLowerCase();
        if (sportsCount[sKey] !== undefined) {
          sportsCount[sKey]++;
        } else {
          sportsCount[sKey] = 1;
        }
      });
    });

    res.json({
      success: true,
      stats: {
        totalRegistrations: regs.length,
        payment: { approved, pending, rejected },
        accommodationCount,
        sportsCount,
        tshirtSizes,
        centresCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, error: 'Failed to compute admin statistics.' });
  }
});

// 2. Admin Endpoint: List submissions with multi-filtering
app.get('/api/admin/registrations', async (req, res) => {
  const { payment_status, search, sport } = req.query;
  try {
    let query = 'SELECT * FROM rpl_registrations';
    const params = [];
    const conditions = [];

    if (payment_status && payment_status !== 'all') {
      conditions.push('payment_status = ?');
      params.push(payment_status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY submitted_at DESC';

    const [rows] = await db.query(query, params);

    // Format JSON fields
    let formatted = rows.map((r) => {
      const parsedGeneral = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      const parsedSport = typeof r.sport_answers === 'string' ? JSON.parse(r.sport_answers || '{}') : (r.sport_answers || {});

      return {
        ...r,
        general_details: parsedGeneral,
        sport_answers: parsedSport,
        answers: { ...parsedGeneral, ...parsedSport },
      };
    });

    // In-memory search & sport filter if query provided
    if (search) {
      const term = String(search).toLowerCase();
      formatted = formatted.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(term) ||
          r.email?.toLowerCase().includes(term) ||
          r.mobile?.includes(term) ||
          r.payment_utr?.toLowerCase().includes(term) ||
          r.general_details?.centre?.toLowerCase().includes(term) ||
          r.general_details?.customJerseyName?.toLowerCase().includes(term)
      );
    }

    if (sport && sport !== 'all') {
      formatted = formatted.filter((r) => {
        const sports = r.general_details?.selectedSports || [];
        return Array.isArray(sports) && sports.includes(sport);
      });
    }

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registrations.' });
  }
});

// 3. Admin Endpoint: Update Registration (Full Player Edit & Payment Status)
app.patch('/api/admin/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    email,
    mobile,
    payment_status,
    payment_utr,
    check_in_date,
    check_out_date,
    general_details,
    sport_answers,
  } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM rpl_registrations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }

    const current = existing[0];
    const updatedFullName = full_name !== undefined ? full_name.trim() : current.full_name;
    const updatedEmail = email !== undefined ? email.trim() : current.email;
    const updatedMobile = mobile !== undefined ? mobile.trim() : current.mobile;
    const updatedPaymentStatus = payment_status !== undefined ? payment_status : current.payment_status;
    const updatedPaymentUtr = payment_utr !== undefined ? payment_utr : current.payment_utr;
    const updatedCheckIn = check_in_date !== undefined ? check_in_date : current.check_in_date;
    const updatedCheckOut = check_out_date !== undefined ? check_out_date : current.check_out_date;

    const updatedGeneral = general_details !== undefined ? JSON.stringify(general_details) : current.general_details;
    const updatedSport = sport_answers !== undefined ? JSON.stringify(sport_answers) : current.sport_answers;

    await db.query(
      `UPDATE rpl_registrations 
       SET full_name = ?, email = ?, mobile = ?, payment_status = ?, payment_utr = ?, check_in_date = ?, check_out_date = ?, general_details = ?, sport_answers = ?
       WHERE id = ?`,
      [
        updatedFullName,
        updatedEmail,
        updatedMobile,
        updatedPaymentStatus,
        updatedPaymentUtr,
        updatedCheckIn,
        updatedCheckOut,
        updatedGeneral,
        updatedSport,
        id,
      ]
    );

    res.json({ success: true, message: 'Player details updated successfully.' });
  } catch (error) {
    console.error('Error updating player details:', error);
    res.status(500).json({ success: false, error: 'Failed to update player details.' });
  }
});

// 4. Admin Endpoint: Update Payment Status (Quick 1-Click Action)
app.post('/api/admin/registrations/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected' or 'pending'

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

// 5. Admin Endpoint: Delete Registration
app.delete('/api/admin/registrations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM rpl_registrations WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }
    res.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, error: 'Failed to delete registration.' });
  }
});

// 6. Admin Endpoint: Accommodation Stay List & Room Bookings
app.get('/api/admin/accommodation', async (req, res) => {
  try {
    const [regs] = await db.query(`
      SELECT r.id, r.full_name, r.mobile, r.email, r.payment_status, r.check_in_date, r.check_out_date, r.general_details
      FROM rpl_registrations r
      ORDER BY r.submitted_at DESC
    `);

    const [bookings] = await db.query(`
      SELECT bookingid, cardno, roomno, checkin, checkout, nights, status, updatedBy, createdAt
      FROM room_booking
      ORDER BY createdAt DESC
    `);

    // Map bookings by cardno or contact
    const accommodationList = regs
      .map((r) => {
        let gen = {};
        try {
          gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
        } catch (e) {
          gen = {};
        }

        const userCardNo = gen.cardNo || null;
        const cleanMobile = (r.mobile || '').replace(/\D/g, '');
        const fallbackCardNo = `RPL_${cleanMobile}`;

        const userBookings = bookings.filter(
          (b) => (userCardNo && b.cardno === userCardNo) || b.cardno === fallbackCardNo || (b.cardno && b.cardno.includes(cleanMobile.slice(-6)))
        );

        return {
          registration_id: r.id,
          full_name: r.full_name,
          mobile: r.mobile,
          email: r.email,
          centre: gen.centre || 'Unspecified',
          gender: gen.gender || 'Male',
          accommodationRequired: gen.accommodationRequired || 'No',
          check_in_date: r.check_in_date,
          check_out_date: r.check_out_date,
          bookings: userBookings,
        };
      })
      .filter((r) => r.accommodationRequired === 'Yes' || r.bookings.length > 0);

    res.json({ success: true, data: accommodationList });
  } catch (error) {
    console.error('Error fetching accommodation stays:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch accommodation data.' });
  }
});

// 7. Admin Endpoint: Manual Room Number Assignment
app.post('/api/admin/accommodation/assign', async (req, res) => {
  const { bookingid, roomno } = req.body;

  if (!bookingid || !roomno) {
    return res.status(400).json({ success: false, error: 'bookingid and roomno are required.' });
  }

  try {
    const cleanRoomNo = String(roomno).trim().toUpperCase();

    // Ensure room exists in roomdb to satisfy FK
    await db.query(`
      INSERT INTO roomdb (roomno, roomtype, gender, roomstatus, updatedBy)
      VALUES (?, 'nac', 'NA', 'available', 'RPL_ADMIN')
      ON DUPLICATE KEY UPDATE updatedBy = 'RPL_ADMIN'
    `, [cleanRoomNo]);

    // Update room_booking
    const [result] = await db.query(
      'UPDATE room_booking SET roomno = ?, status = ? WHERE bookingid = ?',
      [cleanRoomNo, 'pending', bookingid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    res.json({ success: true, message: `Room "${cleanRoomNo}" assigned successfully!` });
  } catch (error) {
    console.error('Error assigning room:', error);
    res.status(500).json({ success: false, error: 'Failed to assign room number.' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

