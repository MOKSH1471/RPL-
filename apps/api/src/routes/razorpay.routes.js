import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db, { RPL_DB } from '../config/db.js';
import razorpay from '../config/razorpay.js';
import { processAccommodationBooking } from '../services/roomBookingService.js';

const router = Router();

// 1. Create Razorpay Order with Locked Calculated Fee
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      selectedSports = [],
      isExistingPlayer = false,
      previouslyPaidSportsCount = 0,
      hasPreviouslyPaid = false,
      registrationId,
    } = req.body;

    const sportsCount = Math.max(1, Array.isArray(selectedSports) ? selectedSports.length : 1);
    let computedFee;

    if (isExistingPlayer && hasPreviouslyPaid) {
      const newlyAddedSports = Math.max(0, sportsCount - Number(previouslyPaidSportsCount || 0));
      computedFee = newlyAddedSports * 400;
    } else {
      computedFee = 2500 + Math.max(0, sportsCount - 1) * 400;
    }

    if (computedFee <= 0) {
      return res.json({
        success: true,
        orderId: null,
        amount: 0,
        amountInRupees: 0,
        currency: 'INR',
        message: 'No payment required',
      });
    }

    const amountInPaise = Math.round(computedFee * 100);
    const receiptId = `rpl_${(registrationId || uuidv4()).replace(/-/g, '').slice(0, 14)}_${Date.now().toString().slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        fullName: String(fullName || '').slice(0, 40),
        mobile: String(mobile || '').slice(0, 15),
        sports: Array.isArray(selectedSports) ? selectedSports.join(', ').slice(0, 40) : 'Cricket',
      },
    });

    console.log(`[RAZORPAY ORDER CREATED] Order ID: ${order.id}, Amount: ₹${computedFee} (${amountInPaise} paise) for "${fullName}"`);

    // 1. Pre-Payment Intent: Record initiated transaction before checkout
    try {
      const cleanMobDigits = String(mobile || '').replace(/\D/g, '');
      const cardNoVal = req.body.cardNo || `GUEST_${cleanMobDigits.slice(-6) || 'RPL'}`;
      const sportsList = Array.isArray(selectedSports) ? selectedSports.join(', ') : 'Cricket';
      const initialBookingId = registrationId || `PENDING_${order.id.slice(-12)}`;

      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_transactions 
         (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
         VALUES (?, ?, 'sports', ?, 0, 'PENDING', ?, 'pending', 'RAZORPAY_INTENT', NOW(), NOW(), ?)
         ON DUPLICATE KEY UPDATE 
           amount = VALUES(amount),
           description = VALUES(description),
           updatedAt = NOW()`,
        [
          cardNoVal,
          initialBookingId,
          computedFee,
          `RPL Season 9 Registration (${sportsList}) - Pre-Payment Intent`,
          order.id,
        ]
      );
    } catch (intentErr) {
      console.warn('[PRE-PAYMENT INTENT NOTICE]', intentErr.message);
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      amountInRupees: computedFee,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TivKrz1oOVPG55',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate Razorpay order.',
    });
  }
});

// 2. Cryptographic Verification of Razorpay Payment & Instant Player Auto-Approval
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationPayload,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Razorpay payment verification parameters.',
      });
    }

    // A. Cryptographic Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET || 'TE0Ex76uPfAIQI51jtt7x301';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error(`[RAZORPAY SIGNATURE MISMATCH] Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }

    console.log(`[RAZORPAY PAYMENT VERIFIED] Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id}`);

    // B. Auto-approve and save registration if registrationPayload is included
    if (registrationPayload) {
      const regBody = {
        ...registrationPayload,
        payment_status: 'approved',
        payment_utr: razorpay_payment_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      };

      let savedRegistrationId = registrationPayload.registration_id || null;
      let internalSaveError = null;

      try {
        const full_name = regBody.full_name || regBody.fullName || '';
        const email = regBody.email || '';
        const mobile = regBody.mobile || regBody.mobileNumber || '';
        const rawMobileDigits = mobile.replace(/\D/g, '');
        const mobile10 = rawMobileDigits.length > 10 ? rawMobileDigits.slice(-10) : rawMobileDigits;

        const cleanGeneralDetails = regBody.general_details || regBody.answers || {};
        cleanGeneralDetails.payment_utr = razorpay_payment_id;
        cleanGeneralDetails.razorpay_payment_id = razorpay_payment_id;
        cleanGeneralDetails.razorpay_order_id = razorpay_order_id;
        cleanGeneralDetails.paymentMethod = 'Razorpay';

        const cleanSportAnswers = regBody.sport_answers || {};
        const cleanPhotoUrl = regBody.player_photo_url || cleanGeneralDetails.player_photo_url || cleanGeneralDetails.photoUrl || null;
        const cleanCheckInDate = regBody.check_in_date || cleanGeneralDetails.checkInDate || '2026-12-25';
        const cleanCheckOutDate = regBody.check_out_date || cleanGeneralDetails.checkOutDate || '2026-12-27';

        const [existingRegs] = await db.query(
          `SELECT id, full_name, email, mobile, payment_status, player_photo_url, payment_utr, payment_receipt_url, general_details, sport_answers FROM ${RPL_DB}.rpl_registrations WHERE id = ? OR mobile = ? OR mobile LIKE ? ORDER BY submitted_at DESC LIMIT 1`,
          [regBody.registration_id || '', mobile, `%${mobile10}`]
        );

        let regId = uuidv4();
        let isUpdate = false;

        if (existingRegs.length > 0) {
          isUpdate = true;
          regId = existingRegs[0].id;

          let prevGeneral = {};
          let prevSports = {};
          try {
            prevGeneral = typeof existingRegs[0].general_details === 'string' ? JSON.parse(existingRegs[0].general_details) : (existingRegs[0].general_details || {});
          } catch (e) { prevGeneral = {}; }
          try {
            prevSports = typeof existingRegs[0].sport_answers === 'string' ? JSON.parse(existingRegs[0].sport_answers) : (existingRegs[0].sport_answers || {});
          } catch (e) { prevSports = {}; }

          const mergedSportAnswers = { ...prevSports, ...cleanSportAnswers };
          const mergedGeneralDetails = { ...prevGeneral, ...cleanGeneralDetails };
          const allSelectedSports = Array.from(new Set([
            ...(Array.isArray(prevGeneral.selectedSports) ? prevGeneral.selectedSports : []),
            ...(Array.isArray(cleanGeneralDetails.selectedSports) ? cleanGeneralDetails.selectedSports : []),
            ...Object.keys(mergedSportAnswers),
          ]));
          mergedGeneralDetails.selectedSports = allSelectedSports;

          const prevUtrs = String(existingRegs[0].payment_utr || prevGeneral.payment_utr || '').split(',').map(s => s.trim()).filter(Boolean);
          const mergedUtrList = Array.from(new Set([...prevUtrs, razorpay_payment_id]));
          mergedGeneralDetails.paymentUtrs = mergedUtrList;
          mergedGeneralDetails.payment_utr = mergedUtrList.join(', ');

          await db.query(
            `UPDATE ${RPL_DB}.rpl_registrations 
             SET full_name = ?, email = ?, mobile = ?, check_in_date = ?, check_out_date = ?, 
                 player_photo_url = ?, payment_status = 'approved', payment_utr = ?, 
                 general_details = ?, sport_answers = ?, is_archived = FALSE, submitted_at = NOW() 
             WHERE id = ?`,
            [
              full_name.trim(),
              email.trim(),
              mobile.trim(),
              cleanCheckInDate,
              cleanCheckOutDate,
              cleanPhotoUrl || existingRegs[0].player_photo_url || null,
              mergedUtrList.join(', '),
              JSON.stringify(mergedGeneralDetails),
              JSON.stringify(mergedSportAnswers),
              regId,
            ]
          );
        } else {
          await db.query(
            `INSERT INTO ${RPL_DB}.rpl_registrations 
             (id, full_name, email, mobile, check_in_date, check_out_date, player_photo_url, payment_status, payment_utr, general_details, sport_answers, is_archived, submitted_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, FALSE, NOW())`,
            [
              regId,
              full_name.trim(),
              email.trim(),
              mobile.trim(),
              cleanCheckInDate,
              cleanCheckOutDate,
              cleanPhotoUrl,
              razorpay_payment_id,
              JSON.stringify(cleanGeneralDetails),
              JSON.stringify(cleanSportAnswers),
            ]
          );
        }

        savedRegistrationId = regId;

        // C. Record transaction in RPL.rpl_transactions
        const sportsList = Array.isArray(cleanGeneralDetails.selectedSports) ? cleanGeneralDetails.selectedSports.join(', ') : 'Sports';
        const cardNoVal = cleanGeneralDetails.cardNo || `GUEST_${mobile10.slice(-6) || 'RPL'}`;
        const finalAmount = cleanGeneralDetails.totalAmount || cleanGeneralDetails.calculatedFee || 2500;

        await db.query(
          `INSERT INTO ${RPL_DB}.rpl_transactions 
           (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
           VALUES (?, ?, 'sports', ?, 0, ?, ?, 'completed', 'RAZORPAY_AUTO', NOW(), NOW(), ?)
           ON DUPLICATE KEY UPDATE 
             amount = VALUES(amount),
             upi_ref = VALUES(upi_ref),
             description = VALUES(description),
             status = 'completed',
             updatedAt = NOW(),
             razorpay_order_id = VALUES(razorpay_order_id)`,
          [
            cardNoVal,
            regId,
            finalAmount,
            razorpay_payment_id,
            `RPL Season 9 Registration (${sportsList}) - Paid via Razorpay`,
            razorpay_order_id,
          ]
        );

        // D. Process Pre/Post stay requests if accommodation is required
        if (cleanGeneralDetails.accommodationRequired === 'Yes') {
          await processAccommodationBooking({
            cardno: cleanGeneralDetails.cardNo || null,
            fullName: full_name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            centre: cleanGeneralDetails.centre || 'Mumbai',
            gender: cleanGeneralDetails.gender || 'Male',
            checkInDate: cleanCheckInDate,
            checkOutDate: cleanCheckOutDate,
            accommodationRequired: 'Yes',
          });
        }
      } catch (saveErr) {
        console.error('[RAZORPAY SAVE REGISTRATION ERROR]', saveErr);
        internalSaveError = saveErr.message;
      }

      return res.json({
        success: true,
        verified: true,
        message: 'Payment verified and registration approved successfully.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        registrationId: savedRegistrationId,
        error: internalSaveError,
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Payment signature verified successfully.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed.',
    });
  }
});

// 3. Razorpay Server-to-Server Webhook (Immutable Audit Log & Fail-Safe Auto-Approval)
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret && receivedSignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      const rawContent = req.rawBody || JSON.stringify(req.body);
      shasum.update(rawContent);
      const digest = shasum.digest('hex');

      if (digest !== receivedSignature) {
        console.warn('[RAZORPAY WEBHOOK WARNING] Webhook signature mismatch.');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event || 'unknown';
    const payload = req.body.payload || {};
    const payment = payload.payment?.entity || {};
    const order = payload.order?.entity || {};

    const paymentId = payment.id || null;
    const orderId = payment.order_id || order.id || null;

    console.log(`[RAZORPAY WEBHOOK] Event: ${event} | Payment ID: ${paymentId} | Order ID: ${orderId}`);

    // A. Immutable event log into RPL.rpl_razorpay_webhook
    try {
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_razorpay_webhook (payment_id, order_id, event, json, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [paymentId, orderId, event, JSON.stringify(req.body)]
      );
    } catch (logErr) {
      console.warn('[RAZORPAY WEBHOOK LOG ERROR]', logErr.message);
    }

    // B. Fail-Safe Webhook Fallback: Update transaction & approve player registration asynchronously
    if (event === 'payment.captured' || event === 'order.paid') {
      if (orderId) {
        await db.query(
          `UPDATE ${RPL_DB}.rpl_transactions 
           SET status = 'completed', upi_ref = COALESCE(?, upi_ref), updatedAt = NOW() 
           WHERE razorpay_order_id = ?`,
          [paymentId, orderId]
        );

        let targetRegId = null;
        const [matchedTx] = await db.query(
          `SELECT bookingid FROM ${RPL_DB}.rpl_transactions WHERE razorpay_order_id = ? LIMIT 1`,
          [orderId]
        );

        if (matchedTx.length > 0 && matchedTx[0].bookingid && !matchedTx[0].bookingid.startsWith('PENDING_')) {
          targetRegId = matchedTx[0].bookingid;
        } else {
          // Fail-Safe Fallback: Locate pending registration by payer contact or notes
          const payerPhone = (payment.contact || (payment.notes && payment.notes.mobile) || '').replace(/\D/g, '').slice(-10);
          if (payerPhone && payerPhone.length === 10) {
            const [matchedRegs] = await db.query(
              `SELECT id FROM ${RPL_DB}.rpl_registrations 
               WHERE REPLACE(REPLACE(mobile, '+91', ''), ' ', '') LIKE ? AND payment_status = 'pending' 
               ORDER BY submitted_at DESC LIMIT 1`,
              [`%${payerPhone}`]
            );
            if (matchedRegs.length > 0) {
              targetRegId = matchedRegs[0].id;
              // Link registration ID to transaction
              await db.query(
                `UPDATE ${RPL_DB}.rpl_transactions SET bookingid = ? WHERE razorpay_order_id = ?`,
                [targetRegId, orderId]
              );
            }
          }
        }

        if (targetRegId) {
          await db.query(
            `UPDATE ${RPL_DB}.rpl_registrations 
             SET payment_status = 'approved', payment_utr = COALESCE(?, payment_utr), submitted_at = NOW() 
             WHERE id = ?`,
            [paymentId, targetRegId]
          );
          console.log(`[RAZORPAY FAIL-SAFE APPROVED] Registration "${targetRegId}" confirmed via webhook.`);
        }
      }
    }

    // C. Failure Telemetry: Track failed payment attempts with root cause analysis
    if (event === 'payment.failed') {
      const errorCode = payment.error_code || 'PAYMENT_FAILED';
      const errorDesc = payment.error_description || payment.error_reason || 'Payment failed';
      console.warn(`[RAZORPAY FAILURE TELEMETRY] Order ID: ${orderId} | Code: ${errorCode} | Reason: ${errorDesc}`);

      if (orderId) {
        try {
          await db.query(
            `UPDATE ${RPL_DB}.rpl_transactions 
             SET status = 'failed', 
                 description = CONCAT(description, ' | Failure: [', ?, '] ', ?),
                 updatedAt = NOW() 
             WHERE razorpay_order_id = ? AND status != 'completed'`,
            [errorCode, String(errorDesc).slice(0, 100), orderId]
          );
        } catch (failErr) {
          console.warn('[FAILURE TELEMETRY LOG NOTICE]', failErr.message);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[RAZORPAY WEBHOOK ERROR]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 4. Client-Side Payment Failure Telemetry
router.post('/razorpay/payment-failed', async (req, res) => {
  try {
    const { orderId, error } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const errorCode = error?.code || 'CLIENT_DECLINED';
    const errorDesc = error?.description || error?.reason || 'User cancelled or payment failed';

    console.warn(`[RAZORPAY CLIENT FAILURE] Order ID: ${orderId} | Code: ${errorCode} | Reason: ${errorDesc}`);

    await db.query(
      `UPDATE ${RPL_DB}.rpl_transactions 
       SET status = 'failed', 
           description = CONCAT(description, ' | Failure: [', ?, '] ', ?),
           updatedAt = NOW() 
       WHERE razorpay_order_id = ? AND status != 'completed'`,
      [errorCode, String(errorDesc).slice(0, 100), orderId]
    );

    res.json({ success: true });
  } catch (err) {
    console.warn('[PAYMENT FAILURE ENDPOINT NOTICE]', err.message);
    res.json({ success: false, error: err.message });
  }
});

export default router;
