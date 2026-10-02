import { Router } from 'express';
import { Readable } from 'stream';
import upload from '../middleware/upload.js';
import drive from '../config/googleDrive.js';

const router = Router();

// Handle File Uploads (Photo / Payment Screenshot to Google Drive)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const customName = req.body.customName;
    const receiptIndex = req.body.receiptIndex ? Number(req.body.receiptIndex) : null;
    let cleanPrefix = customName
      ? String(customName).trim().replace(/[^a-zA-Z0-9_() -]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_')
      : 'RPL';

    if (receiptIndex && receiptIndex > 1 && !cleanPrefix.includes(`(${receiptIndex})`)) {
      cleanPrefix = `${cleanPrefix}_(${receiptIndex})`;
    }

    const ext = req.file.originalname.includes('.')
      ? req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))
      : '.jpg';
    const finalFileName = `${cleanPrefix}_${Date.now()}${ext}`;
    const fileType = req.body.fileType || (cleanPrefix.toLowerCase().includes('receipt') ? 'receipt' : 'photo');

    // A. Google Apps Script Webhook Upload
    if (process.env.GOOGLE_DRIVE_WEBHOOK_URL) {
      const base64Data = req.file.buffer.toString('base64');
      const response = await fetch(process.env.GOOGLE_DRIVE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Data,
          mimeType: req.file.mimetype,
          fileName: finalFileName,
          fileType: fileType,
          uploadType: fileType,
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

    // B. Google Service Account Direct Upload
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      const targetFolder = fileType === 'receipt'
        ? (process.env.GOOGLE_DRIVE_RECEIPT_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID)
        : (process.env.GOOGLE_DRIVE_PHOTO_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID);

      const fileMetadata = {
        name: finalFileName,
        parents: targetFolder ? [targetFolder] : [],
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

export default router;
