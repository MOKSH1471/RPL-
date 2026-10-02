import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { RPL_DB } from '../config/db.js';
import { getFieldValue } from '../utils/helpers.js';
import { processAccommodationBooking } from '../services/roomBookingService.js';
import { ensureGuestCard } from '../services/guestCardService.js';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

const router = Router();

// Handle Registration (Dynamic Validation & Atomic Save)
router.post('/register', async (req, res) => {
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
    const mobile10 = cleanDomesticPhone(cleanMobile);

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

    if (req.body.referrerMobile) cleanGeneralDetails.referrerMobile = req.body.referrerMobile;
    if (req.body.referrerName) cleanGeneralDetails.referrerName = req.body.referrerName;
    if (req.body.referrerCardNo) cleanGeneralDetails.referrerCardNo = req.body.referrerCardNo;

    const cleanSportAnswers = sport_answers || {};

    const cleanPhotoUrl = 
      player_photo_url || 
      sanitizedAnswers.photoDriveUrl || 
      sanitizedAnswers.player_photo_url || 
      cleanGeneralDetails.player_photo_url || 
      cleanGeneralDetails.photoDriveUrl || 
      cleanGeneralDetails.photoUrl || 
      null;

    const cleanPaymentUtr = 
      payment_utr || 
      sanitizedAnswers.payment_utr || 
      sanitizedAnswers.paymentUtr || 
      cleanGeneralDetails.payment_utr || 
      cleanGeneralDetails.paymentUtr || 
      null;

    const cleanReceiptUrl = 
      payment_receipt_url || 
      req.body.payment_receipt || 
      sanitizedAnswers.payment_receipt_url || 
      sanitizedAnswers.payment_receipt || 
      sanitizedAnswers.paymentReceiptUrl || 
      sanitizedAnswers.paymentReceipt || 
      cleanGeneralDetails.payment_receipt_url || 
      cleanGeneralDetails.payment_receipt || 
      cleanGeneralDetails.paymentReceiptUrl || 
      cleanGeneralDetails.paymentReceipt || 
      null;

    const cleanCheckInDate = req.body.check_in_date || sanitizedAnswers.checkInDate || sanitizedAnswers.check_in_date || '2026-12-25';
    const cleanCheckOutDate = req.body.check_out_date || sanitizedAnswers.checkOutDate || sanitizedAnswers.check_out_date || '2026-12-27';

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
      `SELECT field_key, field_type, label, options, validation_rules FROM ${RPL_DB}.rpl_registration_fields WHERE sport_id = ? OR sport_id IS NULL`,
      [activeSport]
    );

    const validationErrors = {};

    // B. Run Dynamic Validation
    fields.forEach((field) => {
      const value = getFieldValue(lookupAnswers, field.field_key);
      const rules = typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : (field.validation_rules || {});
      const options = typeof field.options === 'string' ? JSON.parse(field.options) : (field.options || []);

      if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
        if (['full_name', 'email', 'mobile', 'centre'].includes(field.field_key)) {
          validationErrors[field.field_key] = `${field.label} is required.`;
          return;
        } else {
          logger.warn(`[RPL Validation Notice] Field '${field.field_key}' is empty, proceeding with save.`);
        }
      }

      if (field.field_type === 'select' && value && Array.isArray(options) && options.length > 0) {
        const isMatch = options.some((opt) => {
          const optStr = String(typeof opt === 'object' ? opt.value || opt.id || opt.label : opt).toLowerCase();
          const valStr = String(value).toLowerCase();
          return optStr === valStr || valStr.includes(optStr) || optStr.includes(valStr);
        });
        if (!isMatch) {
          logger.warn(`[RPL Validation Notice] Option '${value}' for '${field.field_key}' accepted.`);
        }
      }

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
      logger.warn('[RPL Registration Warning] Validation errors:', validationErrors);
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // C. Atomic Transaction for Multi-Table Writes (Aashray Standard)
    const connection = await db.getConnection();
    await connection.beginTransaction();

    let id;
    let isUpdate = false;
    let finalGeneralDetails = cleanGeneralDetails;
    let finalPaymentStatus = 'pending';
    let accommodationResult = { booked: false };

    try {
      const [existingRegs] = await connection.query(
        `SELECT id, full_name, email, mobile, payment_status, player_photo_url, payment_utr, payment_receipt_url, general_details, sport_answers FROM ${RPL_DB}.rpl_registrations WHERE id = ? OR mobile = ? OR mobile LIKE ? ORDER BY submitted_at DESC LIMIT 1`,
        [req.body.registration_id || '', cleanMobile, `%${mobile10}`]
      );

      if (existingRegs.length > 0) {
        isUpdate = true;
        const prevRow = existingRegs[0];
        id = prevRow.id;

        let prevGeneral = {};
        let prevSports = {};
        try {
          prevGeneral = typeof prevRow.general_details === 'string' ? JSON.parse(prevRow.general_details) : (prevRow.general_details || {});
        } catch (e) {
          prevGeneral = {};
        }
        try {
          prevSports = typeof prevRow.sport_answers === 'string' ? JSON.parse(prevRow.sport_answers) : (prevRow.sport_answers || {});
        } catch (e) {
          prevSports = {};
        }

        const mergedSportAnswers = { ...prevSports, ...cleanSportAnswers };
        const mergedGeneralDetails = { ...prevGeneral, ...cleanGeneralDetails };
        const allSelectedSports = Array.from(new Set([
          ...(Array.isArray(prevGeneral.selectedSports) ? prevGeneral.selectedSports : []),
          ...(Array.isArray(cleanGeneralDetails.selectedSports) ? cleanGeneralDetails.selectedSports : []),
          ...Object.keys(mergedSportAnswers),
        ]));
        mergedGeneralDetails.selectedSports = allSelectedSports;
        const computedSportsCount = Math.max(1, allSelectedSports.length);
        const prevSportsCount = Math.max(1, Array.isArray(prevGeneral.selectedSports) ? prevGeneral.selectedSports.length : 1);
        const newlyAddedSportsCount = Math.max(0, computedSportsCount - prevSportsCount);
        const computedFee = 2500 + Math.max(0, computedSportsCount - 1) * 400;

        const prevUtrs = String(prevRow.payment_utr || prevGeneral.payment_utr || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const newUtrs = String(cleanPaymentUtr || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const mergedUtrList = Array.from(new Set([...prevUtrs, ...newUtrs]));
        const finalPaymentUtr = mergedUtrList.length > 0 ? mergedUtrList.join(', ') : null;

        const prevReceipts = String(prevRow.payment_receipt_url || prevGeneral.payment_receipt_url || prevGeneral.payment_receipt || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const newReceipts = String(cleanReceiptUrl || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const mergedReceiptList = Array.from(new Set([...prevReceipts, ...newReceipts]));
        const finalReceiptUrl = mergedReceiptList.length > 0 ? mergedReceiptList.join(', ') : null;

        const isAlreadyPaid = (prevRow.payment_status || '').toLowerCase() === 'approved' || prevReceipts.length > 0 || prevUtrs.length > 0;
        const incrementalFee = isAlreadyPaid ? newlyAddedSportsCount * 400 : computedFee;

        mergedGeneralDetails.totalAmount = computedFee;
        mergedGeneralDetails.calculatedFee = computedFee;
        mergedGeneralDetails.incrementalFee = incrementalFee;
        mergedGeneralDetails.paymentReceipts = mergedReceiptList;
        mergedGeneralDetails.paymentUtrs = mergedUtrList;
        mergedGeneralDetails.payment_receipt = finalReceiptUrl;
        mergedGeneralDetails.payment_receipt_url = finalReceiptUrl;
        mergedGeneralDetails.paymentReceiptUrl = finalReceiptUrl;
        mergedGeneralDetails.payment_utr = finalPaymentUtr;
        finalGeneralDetails = mergedGeneralDetails;

        const finalPhotoUrl = cleanPhotoUrl || prevRow.player_photo_url || null;
        const hasNewPayment = newUtrs.length > 0 || newReceipts.length > 0;
        const hasNewSports = newlyAddedSportsCount > 0;
        const incomingStatusIsPending = (req.body.payment_status || '').toLowerCase() === 'pending';

        if (prevRow.payment_status === 'approved') {
          if (hasNewSports && !hasNewPayment && incomingStatusIsPending) {
            finalPaymentStatus = 'approved_due';
          } else {
            finalPaymentStatus = 'approved';
          }
        } else {
          finalPaymentStatus = 'pending';
        }

        await connection.query(
          `UPDATE ${RPL_DB}.rpl_registrations 
           SET full_name = ?, email = ?, mobile = ?, check_in_date = ?, check_out_date = ?, 
               player_photo_url = ?, payment_status = ?, payment_utr = ?, payment_receipt_url = ?, 
               general_details = ?, sport_answers = ?, submitted_at = NOW() 
           WHERE id = ?`,
          [
            cleanFullName,
            cleanEmail,
            cleanMobile,
            cleanCheckInDate,
            cleanCheckOutDate,
            finalPhotoUrl,
            finalPaymentStatus,
            finalPaymentUtr,
            finalReceiptUrl,
            JSON.stringify(mergedGeneralDetails),
            JSON.stringify(mergedSportAnswers),
            id,
          ]
        );

        logger.info(`[RPL Registration UPDATE] Player "${cleanFullName}" updated in rpl_registrations with ID: ${id} (Fee: ₹${computedFee})`);
      } else {
        id = uuidv4();
        const newSportsCount = Math.max(1, Array.isArray(cleanGeneralDetails.selectedSports) ? cleanGeneralDetails.selectedSports.length : 1);
        const newFee = 2500 + Math.max(0, newSportsCount - 1) * 400;
        cleanGeneralDetails.totalAmount = newFee;
        cleanGeneralDetails.calculatedFee = newFee;

        // Auto-create an Aashray guest card within the transaction
        if (!cleanGeneralDetails.cardNo) {
          const guestCardNo = await ensureGuestCard({
            fullName: cleanFullName,
            mobile: mobile10,
            email: cleanEmail,
            gender: cleanGeneralDetails.gender || 'Male',
            dob: cleanGeneralDetails.dateOfBirth || null,
            centre: cleanGeneralDetails.centre || 'Mumbai',
            photoUrl: cleanPhotoUrl || null,
            referrerCardNo: cleanGeneralDetails.referrerCardNo || null,
            connection,
          });
          if (guestCardNo) {
            cleanGeneralDetails.cardNo = guestCardNo;
            logger.info(`[RPL Registration] Assigned Aashray guest card ${guestCardNo} to new player "${cleanFullName}"`);
          }
        }

        await connection.query(
          `INSERT INTO ${RPL_DB}.rpl_registrations 
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

        logger.info(`[RPL Registration SUCCESS] Player "${cleanFullName}" saved to rpl_registrations with ID: ${id} (Fee: ₹${newFee})`);
      }

      // Record transaction in RPL.rpl_transactions ledger
      const sportsList = Array.isArray(finalGeneralDetails.selectedSports) && finalGeneralDetails.selectedSports.length > 0
        ? finalGeneralDetails.selectedSports.join(', ')
        : (req.body.sport_id || 'Cricket');
      const txnStatus = (finalPaymentStatus || 'pending') === 'approved' ? 'completed' : 'pending';
      const cardNoVal = finalGeneralDetails.cardNo || `GUEST_${mobile10.slice(-6) || 'RPL'}`;
      const finalFeeVal = finalGeneralDetails.incrementalFee !== undefined 
        ? finalGeneralDetails.incrementalFee 
        : (finalGeneralDetails.calculatedFee || finalGeneralDetails.totalAmount || 2500);

      await connection.query(
        `INSERT INTO ${RPL_DB}.rpl_transactions 
         (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
         ON DUPLICATE KEY UPDATE 
           amount = VALUES(amount),
           upi_ref = VALUES(upi_ref),
           description = VALUES(description),
           status = VALUES(status),
           updatedAt = NOW(),
           razorpay_order_id = COALESCE(VALUES(razorpay_order_id), razorpay_order_id)`,
        [
          cardNoVal,
          id,
          'sports',
          finalFeeVal,
          0,
          finalGeneralDetails.payment_utr || 'NA',
          `RPL Season 9 Registration (${sportsList})`,
          txnStatus,
          'RPL_APP',
          req.body.razorpay_order_id || null,
        ]
      );

      // Process Room Booking within the transaction
      accommodationResult = await processAccommodationBooking({
        cardno: finalGeneralDetails.cardNo || null,
        fullName: cleanFullName,
        email: cleanEmail,
        mobile: cleanMobile,
        centre: finalGeneralDetails.centre || 'Mumbai',
        gender: finalGeneralDetails.gender || 'Male',
        checkInDate: cleanCheckInDate,
        checkOutDate: cleanCheckOutDate,
        accommodationRequired: finalGeneralDetails.accommodationRequired || 'No',
        connection,
      });

      // Commit transaction
      await connection.commit();
      logger.info(`[RPL Registration TRANSACTION COMMITTED] ID: ${id}`);
    } catch (txErr) {
      await connection.rollback();
      logger.error(`[RPL Registration TRANSACTION ROLLBACK] Registration failed: ${txErr.message}`, { error: txErr });
      throw txErr;
    } finally {
      connection.release();
    }

    if (accommodationResult.booked) {
      logger.info(`[RPL Accommodation SUCCESS] Pre/Post stay requests synced for "${cleanFullName}":`, accommodationResult.bookings);
    }

    res.json({
      success: true,
      isUpdate,
      message: isUpdate ? 'Registration updated successfully' : 'Registration submitted successfully',
      registration_id: id,
      accommodation: accommodationResult,
    });
  } catch (error) {
    logger.error(`Registration processing error: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});

export default router;
