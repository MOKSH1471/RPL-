import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db, { RPL_DB, AASHRAY_DB } from '../config/db.js';
import razorpay from '../config/razorpay.js';
import { processAccommodationBooking } from '../services/roomBookingService.js';
import { ensureGuestCard } from '../services/guestCardService.js';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

const router = Router();

// 1. Create Razorpay Order with Locked Calculated Fee & Draft Registration Persistence (Aashray Standard)
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      selectedSports = [],
      extraTshirt,
      isExistingPlayer = false,
      previouslyPaidSportsCount = 0,
      hasPreviouslyPaid = false,
      registrationId,
      registrationPayload,
    } = req.body;

    const regPayload = registrationPayload || {};
    const cleanGeneral = regPayload.general_details || regPayload.answers || {};
    const regType = req.body.registrationType || regPayload.registrationType || cleanGeneral.registrationType || (selectedSports.includes('spectator') ? 'spectator' : 'player');
    const isSpectator = regType === 'spectator';
    const accomRequired = req.body.accommodationRequired || regPayload.accommodationRequired || cleanGeneral.accommodationRequired || 'No';
    const extraTshirtChoice = extraTshirt || regPayload.extraTshirt || regPayload.spectatorTshirt || cleanGeneral.spectatorTshirt || cleanGeneral.extraTshirt || 'No';
    const extraTshirtCost = extraTshirtChoice === 'Yes' ? 500 : 0;

    let computedFee;

    if (isSpectator) {
      // Spectator Pass: With Stay = ₹2,700 (compulsory 3 days), Without Stay = ₹630. T-Shirt optional = +₹500.
      const spectatorBase = accomRequired === 'Yes' ? 2700 : 630;
      if (isExistingPlayer && hasPreviouslyPaid) {
        computedFee = extraTshirtCost;
      } else {
        computedFee = spectatorBase + extraTshirtCost;
      }
    } else if (isExistingPlayer && hasPreviouslyPaid) {
      computedFee = extraTshirtCost;
    } else {
      const existingFamily = req.body.existingRplFamily || cleanGeneral.existingRplFamily || 'No';
      const playerBase = existingFamily === 'Yes' ? 2700 : 3000;
      computedFee = playerBase + extraTshirtCost;
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
    const cleanFullName = (regPayload.full_name || regPayload.fullName || fullName || '').trim();
    const cleanEmail = (regPayload.email || email || '').trim();
    const cleanMobile = (regPayload.mobile || regPayload.mobileNumber || mobile || '').trim();
    const mobile10 = cleanDomesticPhone(cleanMobile);

    // Resolve or find existing registration ID
    let targetRegId = registrationId || regPayload.registration_id || null;
    let existingReg = null;

    if (targetRegId || mobile10) {
      try {
        const [existingRegs] = await db.query(
          `SELECT id, full_name, email, mobile, payment_status, player_photo_url, general_details, sport_answers 
           FROM ${RPL_DB}.rpl_registrations 
           WHERE id = ? OR mobile = ? OR mobile LIKE ? 
           ORDER BY submitted_at DESC LIMIT 1`,
          [targetRegId || '', cleanMobile, `%${mobile10}`]
        );
        if (existingRegs.length > 0) {
          existingReg = existingRegs[0];
          targetRegId = existingReg.id;
        }
      } catch (dbErr) {
        logger.warn(`[REGISTRATION LOOKUP NOTICE] DB lookup failed or offline: ${dbErr.message}`);
      }
    }

    if (!targetRegId) {
      targetRegId = uuidv4();
    }

    // Resolve Card Number (Aashray standard card or guest card)
    let cardNoVal = cleanGeneral.cardNo || null;

    if (!cardNoVal && existingReg) {
      try {
        const prevGen = typeof existingReg.general_details === 'string' ? JSON.parse(existingReg.general_details) : (existingReg.general_details || {});
        cardNoVal = prevGen.cardNo || null;
      } catch (e) {}
    }

    if (!cardNoVal && mobile10) {
      try {
        cardNoVal = await ensureGuestCard({
          fullName: cleanFullName,
          mobile: mobile10,
          email: cleanEmail,
          gender: cleanGeneral.gender || 'Male',
          dob: cleanGeneral.dateOfBirth || null,
          centre: cleanGeneral.centre || 'Mumbai',
          photoUrl: regPayload.player_photo_url || cleanGeneral.player_photo_url || null,
        });
      } catch (cardErr) {
        logger.warn(`[GUEST CARD AUTO-CREATE NOTICE] ${cardErr.message}`);
      }
    }

    if (!cardNoVal) {
      cardNoVal = `GUEST_${mobile10 ? mobile10.slice(-6) : 'RPL'}`;
    }

    // A. Check if the specific registration is already approved (unless returning player adding new sports)
    const isAddingNewSports = isExistingPlayer && hasPreviouslyPaid;
    if (registrationId && existingReg && existingReg.id === registrationId && existingReg.payment_status === 'approved' && !isAddingNewSports) {
      return res.status(409).json({
        success: false,
        error: 'Payment has already been received and approved for this registration. Please check your status.',
        registrationId: targetRegId,
      });
    }

    const amountInPaise = Math.round(computedFee * 100);
    const receiptId = `rpl_${targetRegId.replace(/-/g, '').slice(0, 14)}_${Date.now().toString().slice(-6)}`;

    // B. Order Reusability & Idempotency Check (Aashray Standard: resolveOrderForTransactions)
    let order = null;
    let isReusedOrder = false;

    try {
      const [activeTxns] = await db.query(
        `SELECT id, razorpay_order_id, amount, status FROM ${RPL_DB}.rpl_transactions 
         WHERE bookingid = ? AND razorpay_order_id IS NOT NULL 
         ORDER BY createdAt DESC LIMIT 1`,
        [targetRegId]
      );

      if (activeTxns.length > 0 && activeTxns[0].razorpay_order_id) {
        const prevTx = activeTxns[0];
        if (prevTx.status === 'completed' && !isAddingNewSports) {
          return res.status(409).json({
            success: false,
            error: 'Payment has already been received for this registration. Please contact support if you need assistance.',
            registrationId: targetRegId,
          });
        }

        try {
          const existingOrder = await razorpay.orders.fetch(prevTx.razorpay_order_id);
          if (existingOrder) {
            if (existingOrder.status === 'paid' || (Number(existingOrder.amount_paid) > 0)) {
              return res.status(409).json({
                success: false,
                error: 'Payment has already been completed for this order on Razorpay. Please verify your registration status.',
                registrationId: targetRegId,
              });
            }

            // Reuse if amount matches and order is still open
            if (Number(existingOrder.amount) === amountInPaise && ['created', 'attempted'].includes(existingOrder.status)) {
              order = existingOrder;
              isReusedOrder = true;
              logger.info(`[RAZORPAY ORDER REUSE] Reusing open order ${order.id} (₹${computedFee}) for ${cleanFullName} (${targetRegId})`);
            }
          }
        } catch (fetchErr) {
          logger.warn(`[RAZORPAY ORDER INSPECTION NOTICE] Could not inspect order ${prevTx.razorpay_order_id}: ${fetchErr.message}`);
        }
      }
    } catch (checkErr) {
      logger.warn(`[RAZORPAY ORDER REUSE CHECK WARNING] ${checkErr.message}`);
    }

    if (!order) {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          fullName: String(cleanFullName || '').slice(0, 40),
          mobile: String(cleanMobile || '').slice(0, 15),
          email: String(cleanEmail || '').slice(0, 40),
          registrationId: String(targetRegId).slice(0, 36),
          sports: Array.isArray(selectedSports) ? selectedSports.join(', ').slice(0, 40) : 'Cricket',
        },
      });

      logger.info(`[RAZORPAY ORDER CREATED] Order ID: ${order.id} | Amount: ₹${computedFee} (${amountInPaise} paise) | Receipt: ${receiptId} | Player: ${cleanFullName} (${targetRegId})`);
    }

    // Persist Draft Registration Record in rpl_registrations (Aashray Standard Phase 1)
    try {
      let prevGeneral = {};
      let prevSports = {};
      if (existingReg) {
        try {
          prevGeneral = typeof existingReg.general_details === 'string' ? JSON.parse(existingReg.general_details) : (existingReg.general_details || {});
        } catch (e) {}
        try {
          prevSports = typeof existingReg.sport_answers === 'string' ? JSON.parse(existingReg.sport_answers) : (existingReg.sport_answers || {});
        } catch (e) {}
      }

      const mergedGeneral = {
        ...prevGeneral,
        ...cleanGeneral,
        selectedSports: selectedSports.length > 0 ? selectedSports : (prevGeneral.selectedSports || ['cricket']),
        cardNo: cardNoVal,
        razorpay_order_id: order.id,
        paymentMethod: 'Razorpay',
      };
      const mergedSports = {
        ...prevSports,
        ...(regPayload.sport_answers || {}),
      };

      const cleanCheckIn = regPayload.check_in_date || cleanGeneral.checkInDate || '2026-12-25';
      const cleanCheckOut = regPayload.check_out_date || cleanGeneral.checkOutDate || '2026-12-27';
      const cleanPhoto = regPayload.player_photo_url || cleanGeneral.player_photo_url || existingReg?.player_photo_url || null;
      const currentStatus = existingReg?.payment_status === 'approved' ? 'approved' : 'pending';

      if (existingReg) {
        await db.query(
          `UPDATE ${RPL_DB}.rpl_registrations 
           SET full_name = COALESCE(NULLIF(?, ''), full_name),
               email = COALESCE(NULLIF(?, ''), email),
               mobile = COALESCE(NULLIF(?, ''), mobile),
               check_in_date = ?,
               check_out_date = ?,
               player_photo_url = COALESCE(?, player_photo_url),
               payment_status = ?,
               general_details = ?,
               sport_answers = ?,
               submitted_at = NOW()
           WHERE id = ?`,
          [
            cleanFullName,
            cleanEmail,
            cleanMobile,
            cleanCheckIn,
            cleanCheckOut,
            cleanPhoto,
            currentStatus,
            JSON.stringify(mergedGeneral),
            JSON.stringify(mergedSports),
            targetRegId,
          ]
        );
        logger.info(`[RAZORPAY PRE-ORDER] Draft registration updated for "${cleanFullName}" (ID: ${targetRegId})`);
      } else {
        await db.query(
          `INSERT INTO ${RPL_DB}.rpl_registrations
           (id, full_name, email, mobile, check_in_date, check_out_date, player_photo_url, payment_status, payment_utr, payment_receipt_url, general_details, sport_answers, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, ?, ?, NOW())`,
          [
            targetRegId,
            cleanFullName,
            cleanEmail,
            cleanMobile,
            cleanCheckIn,
            cleanCheckOut,
            cleanPhoto,
            JSON.stringify(mergedGeneral),
            JSON.stringify(mergedSports),
          ]
        );
        logger.info(`[RAZORPAY PRE-ORDER] Draft registration created for "${cleanFullName}" (ID: ${targetRegId}, Status: pending)`);
      }
    } catch (draftErr) {
      logger.warn(`[RAZORPAY DRAFT REGISTRATION WARNING] Could not persist draft registration: ${draftErr.message}`);
    }

    // Persist Transaction Intent with real registration ID & Card Number in rpl_transactions
    try {
      const sportsList = Array.isArray(selectedSports) ? selectedSports.join(', ') : 'Cricket';
      const txnCategory = isSpectator ? 'spectator' : 'sports';

      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_transactions 
         (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
         VALUES (?, ?, ?, ?, 0, 'PENDING', ?, 'pending', 'RAZORPAY_PRE_ORDER', NOW(), NOW(), ?)
         ON DUPLICATE KEY UPDATE 
           cardno = VALUES(cardno),
           category = VALUES(category),
           amount = VALUES(amount),
           description = VALUES(description),
           updatedAt = NOW()`,
        [
          cardNoVal,
          targetRegId,
          txnCategory,
          computedFee,
          `RPL Season 9 Registration (${sportsList}) - Order Initiated (${cleanFullName || 'Participant'})`,
          order.id,
        ]
      );
    } catch (dbErr) {
      logger.warn(`[RAZORPAY PRE-RECORD WARNING] Could not pre-record transaction: ${dbErr.message}`);
    }

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      amountInRupees: computedFee,
      currency: order.currency,
      registrationId: targetRegId,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_RNd5s35aK8yS9h',
      reused: isReusedOrder,
    });
  } catch (error) {
    logger.error(`Error creating Razorpay order: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize payment gateway.',
    });
  }
});

// 2. Verify Razorpay Payment Signature & Process Registration Atomically
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

    // A. Cryptographic Signature Verification with Timing-Safe comparison (Aashray Standard)
    const secret = process.env.RAZORPAY_KEY_SECRET || 'TE0Ex76uPfAIQI51jtt7x301';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const signatureMatches = (expectedSignature.length === razorpay_signature.length) &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    // B. Direct Server-to-Server Fallback Fetch (Aashray Enterprise Fallback)
    let verifiedPayment = null;
    if (!signatureMatches) {
      logger.warn(`[RAZORPAY SIGNATURE CHECK FAILED] Attempting direct server-to-server fetch for payment ${razorpay_payment_id}...`);
      try {
        verifiedPayment = await razorpay.payments.fetch(razorpay_payment_id);
      } catch (fetchErr) {
        logger.warn(`[RAZORPAY DIRECT FETCH ERROR] ${fetchErr.message}`);
      }

      const isDirectlyConfirmed = verifiedPayment &&
        verifiedPayment.order_id === razorpay_order_id &&
        (verifiedPayment.status === 'captured' || verifiedPayment.status === 'authorized');

      if (!isDirectlyConfirmed) {
        logger.error(`[RAZORPAY SIGNATURE MISMATCH] Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Verification failed.',
        });
      }
      logger.info(`[RAZORPAY DIRECT FETCH SUCCESS] Direct API confirmed payment: ${verifiedPayment.id} (Status: ${verifiedPayment.status})`);
    } else {
      try {
        verifiedPayment = await razorpay.payments.fetch(razorpay_payment_id);
      } catch (fetchErr) {
        // Safe to proceed with valid HMAC signature
      }
    }

    // C. Server-Side Amount Reconciliation (Aashray Tamper Prevention)
    if (verifiedPayment && registrationPayload) {
      const cleanGeneral = registrationPayload.general_details || {};
      const expectedRupees = cleanGeneral.incrementalFee || cleanGeneral.calculatedFee || cleanGeneral.totalAmount;
      if (expectedRupees && Number(expectedRupees) > 0) {
        const actualPaidRupees = Math.round(Number(verifiedPayment.amount) / 100);
        if (actualPaidRupees < Number(expectedRupees)) {
          logger.error(`[RAZORPAY AMOUNT MISMATCH] Expected ₹${expectedRupees}, but Razorpay captured ₹${actualPaidRupees}`);
          return res.status(400).json({
            success: false,
            error: `Payment amount discrepancy. Expected ₹${expectedRupees}, but received ₹${actualPaidRupees}.`,
          });
        }
      }
    }

    logger.info(`[RAZORPAY PAYMENT VERIFIED] Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id}`);

    // D. Auto-approve and save registration atomically if registrationPayload is included
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

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        const full_name = regBody.full_name || regBody.fullName || '';
        const email = regBody.email || '';
        const mobile = regBody.mobile || regBody.mobileNumber || '';
        const mobile10 = cleanDomesticPhone(mobile);

        const cleanGeneralDetails = regBody.general_details || regBody.answers || {};
        cleanGeneralDetails.payment_utr = razorpay_payment_id;
        cleanGeneralDetails.razorpay_payment_id = razorpay_payment_id;
        cleanGeneralDetails.razorpay_order_id = razorpay_order_id;
        cleanGeneralDetails.paymentMethod = 'Razorpay';

        const cleanSportAnswers = regBody.sport_answers || {};
        const cleanPhotoUrl = regBody.player_photo_url || cleanGeneralDetails.player_photo_url || cleanGeneralDetails.photoUrl || null;
        const cleanCheckInDate = regBody.check_in_date || cleanGeneralDetails.checkInDate || '2026-12-25';
        const cleanCheckOutDate = regBody.check_out_date || cleanGeneralDetails.checkOutDate || '2026-12-27';

        const [existingRegs] = await connection.query(
          `SELECT id, full_name, email, mobile, payment_status, player_photo_url, payment_utr, payment_receipt_url, general_details, sport_answers 
           FROM ${RPL_DB}.rpl_registrations 
           WHERE id = ? OR mobile = ? OR mobile LIKE ? 
           ORDER BY submitted_at DESC LIMIT 1 
           FOR UPDATE`,
          [regBody.registration_id || '', mobile, `%${mobile10}`]
        );

        // Idempotency Check: If already approved and settled, commit immediately and return success
        if (existingRegs.length > 0 && existingRegs[0].payment_status === 'approved') {
          await connection.commit();
          logger.info(`[RAZORPAY VERIFY IDEMPOTENT] Registration "${existingRegs[0].id}" already approved.`);
          return res.json({
            success: true,
            verified: true,
            message: 'Payment already verified and registration approved.',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            registrationId: existingRegs[0].id,
          });
        }

        let regId = uuidv4();

        if (existingRegs.length > 0) {
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

          await connection.query(
            `UPDATE ${RPL_DB}.rpl_registrations 
             SET full_name = ?, email = ?, mobile = ?, check_in_date = ?, check_out_date = ?, 
                 player_photo_url = ?, payment_status = 'approved', payment_utr = ?, 
                 general_details = ?, sport_answers = ?, submitted_at = NOW() 
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
          await connection.query(
            `INSERT INTO ${RPL_DB}.rpl_registrations 
             (id, full_name, email, mobile, check_in_date, check_out_date, player_photo_url, payment_status, payment_utr, general_details, sport_answers, submitted_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, NOW())`,
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

        // Record transaction in RPL.rpl_transactions
        const sportsList = Array.isArray(cleanGeneralDetails.selectedSports) ? cleanGeneralDetails.selectedSports.join(', ') : 'Sports';
        const isSpectator = cleanGeneralDetails.registrationType === 'spectator' || (Array.isArray(cleanGeneralDetails.selectedSports) && cleanGeneralDetails.selectedSports.includes('spectator'));
        const txnCategory = isSpectator ? 'spectator' : 'sports';
        const cardNoVal = cleanGeneralDetails.cardNo || `GUEST_${mobile10.slice(-6) || 'RPL'}`;
        const finalAmount = cleanGeneralDetails.incrementalFee !== undefined && cleanGeneralDetails.incrementalFee !== null
          ? cleanGeneralDetails.incrementalFee
          : (cleanGeneralDetails.calculatedFee || cleanGeneralDetails.totalAmount || 2700);

        await connection.query(
          `INSERT INTO ${RPL_DB}.rpl_transactions 
           (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
           VALUES (?, ?, ?, ?, 0, ?, ?, 'completed', 'RAZORPAY_AUTO', NOW(), NOW(), ?)
           ON DUPLICATE KEY UPDATE 
             category = VALUES(category),
             amount = VALUES(amount),
             upi_ref = VALUES(upi_ref),
             description = VALUES(description),
             status = 'completed',
             updatedAt = NOW(),
             razorpay_order_id = VALUES(razorpay_order_id)`,
          [
            cardNoVal,
            regId,
            txnCategory,
            finalAmount,
            razorpay_payment_id,
            `RPL Season 9 Registration (${sportsList}) - Paid via Razorpay`,
            razorpay_order_id,
          ]
        );

        // Process Accommodation Booking within transaction
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
            connection,
          });
        }

        await connection.commit();
        logger.info(`[RAZORPAY VERIFY TRANSACTION COMMITTED] Registration: ${savedRegistrationId}`);
      } catch (saveErr) {
        await connection.rollback();
        logger.error(`[RAZORPAY SAVE REGISTRATION ERROR - ROLLBACK] ${saveErr.message}`, { error: saveErr });
        internalSaveError = saveErr.message;
      } finally {
        connection.release();
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
    logger.error(`Error verifying Razorpay payment: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed.',
    });
  }
});

// 3. Razorpay Server-to-Server Webhook (Immutable Audit Log & Fail-Safe Auto-Approval)
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const event = req.body.event || 'unknown';
    const payload = req.body.payload || {};
    const payment = payload.payment?.entity || {};
    const order = payload.order?.entity || {};

    const paymentId = payment.id || null;
    const orderId = payment.order_id || order.id || null;

    logger.info(`[RAZORPAY WEBHOOK] Event: ${event} | Payment ID: ${paymentId} | Order ID: ${orderId}`);

    // Audit-First Logging: Record the delivery into audit table
    try {
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_razorpay_webhook (payment_id, order_id, event, json, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [paymentId, orderId, event, JSON.stringify(req.body)]
      );
    } catch (logErr) {
      logger.warn(`[RAZORPAY WEBHOOK AUDIT LOG ERROR] ${logErr.message}`);
    }

    // Timing-Safe Cryptographic Signature Verification
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret && receivedSignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      const rawContent = req.rawBody || JSON.stringify(req.body);
      shasum.update(rawContent);
      const expectedDigest = shasum.digest('hex');

      const matches = (expectedDigest.length === receivedSignature.length) &&
        crypto.timingSafeEqual(Buffer.from(expectedDigest), Buffer.from(receivedSignature));

      if (!matches) {
        logger.warn(`[RAZORPAY WEBHOOK SIGNATURE MISMATCH] Expected: ${expectedDigest}, Received: ${receivedSignature}`);
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    // Fail-Safe Webhook Fallback: Upsert transaction & approve player registration in an atomic transaction
    if (event === 'payment.captured' || event === 'order.paid') {
      if (orderId) {
        const payerPhone = cleanDomesticPhone(payment.contact || (payment.notes && payment.notes.mobile) || '');
        let targetRegId = null;
        let targetReg = null;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
          // Locate registration by existing transaction or player mobile with pessimistic row lock (Aashray Standard)
          const [matchedTx] = await connection.query(
            `SELECT id, bookingid, status FROM ${RPL_DB}.rpl_transactions WHERE razorpay_order_id = ? LIMIT 1 FOR UPDATE`,
            [orderId]
          );

          if (matchedTx.length > 0 && matchedTx[0].status === 'completed') {
            logger.info(`[RAZORPAY WEBHOOK IDEMPOTENT] Order ${orderId} already completed by concurrent verify handler.`);
            await connection.commit();
            return res.json({ status: 'ok', message: 'Order already settled.' });
          }

          if (matchedTx.length > 0 && matchedTx[0].bookingid && !matchedTx[0].bookingid.startsWith('PENDING_') && !matchedTx[0].bookingid.startsWith('WEBHOOK_')) {
            targetRegId = matchedTx[0].bookingid;
            const [foundRegs] = await connection.query(
              `SELECT id, full_name, mobile, general_details, payment_status FROM ${RPL_DB}.rpl_registrations WHERE id = ? LIMIT 1 FOR UPDATE`,
              [targetRegId]
            );
            if (foundRegs.length > 0) targetReg = foundRegs[0];
          } else if (payerPhone && payerPhone.length === 10) {
            const [matchedRegs] = await connection.query(
              `SELECT id, full_name, mobile, general_details, payment_status FROM ${RPL_DB}.rpl_registrations 
               WHERE (REPLACE(REPLACE(mobile, '+91', ''), ' ', '') LIKE ? OR id = ?)
               ORDER BY submitted_at DESC LIMIT 1 FOR UPDATE`,
              [`%${payerPhone}`, payment.notes?.registration_id || '']
            );
            if (matchedRegs.length > 0) {
              targetReg = matchedRegs[0];
              targetRegId = targetReg.id;
            }
          }

          // Prepare transaction data & insert/upsert into rpl_transactions
          const finalAmount = Math.round(Number(payment.amount || 270000) / 100);
          let cardNoVal = `GUEST_${payerPhone ? payerPhone.slice(-6) : 'RPL'}`;
          let playerName = targetReg?.full_name || payment.notes?.full_name || 'Participant';

          let isSpectator = false;
          if (targetReg?.general_details) {
            try {
              const gd = typeof targetReg.general_details === 'string' ? JSON.parse(targetReg.general_details) : targetReg.general_details;
              if (gd.cardNo) cardNoVal = gd.cardNo;
              if (gd.registrationType === 'spectator' || (Array.isArray(gd.selectedSports) && gd.selectedSports.includes('spectator'))) {
                isSpectator = true;
              }
            } catch (e) {}
          }
          if (targetReg?.sport_id === 'spectator') isSpectator = true;
          const txnCategory = isSpectator ? 'spectator' : 'sports';

          await connection.query(
            `INSERT INTO ${RPL_DB}.rpl_transactions 
             (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt, razorpay_order_id)
             VALUES (?, ?, ?, ?, 0, ?, ?, 'completed', 'RAZORPAY_WEBHOOK', NOW(), NOW(), ?)
             ON DUPLICATE KEY UPDATE 
               bookingid = COALESCE(VALUES(bookingid), bookingid),
               category = VALUES(category),
               amount = VALUES(amount),
               upi_ref = COALESCE(VALUES(upi_ref), upi_ref),
               status = 'completed',
               updatedAt = NOW()`,
            [
              cardNoVal,
              targetRegId || `WEBHOOK_${orderId.slice(-8)}`,
              txnCategory,
              finalAmount,
              paymentId,
              `RPL Season 9 Registration - Paid via Razorpay (${playerName})`,
              orderId,
            ]
          );

          // Mark player registration as approved if matched
          if (targetRegId) {
            await connection.query(
              `UPDATE ${RPL_DB}.rpl_registrations 
               SET payment_status = 'approved', payment_utr = COALESCE(?, payment_utr), submitted_at = COALESCE(submitted_at, NOW()) 
               WHERE id = ?`,
              [paymentId, targetRegId]
            );
            logger.info(`[RAZORPAY FAIL-SAFE APPROVED] Registration "${targetRegId}" confirmed via webhook.`);
          }

          await connection.commit();
        } catch (webhookTxErr) {
          await connection.rollback();
          logger.error(`[RAZORPAY WEBHOOK TRANSACTION ROLLBACK] ${webhookTxErr.message}`);
          throw webhookTxErr;
        } finally {
          connection.release();
        }
      }
    }

    // Failure Telemetry: Track failed payment attempts
    if (event === 'payment.failed') {
      const errorCode = payment.error_code || 'PAYMENT_FAILED';
      const errorDesc = payment.error_description || payment.error_reason || 'Payment failed';
      logger.warn(`[RAZORPAY FAILURE TELEMETRY] Order ID: ${orderId} | Code: ${errorCode} | Reason: ${errorDesc}`);

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
          logger.warn(`[FAILURE TELEMETRY LOG NOTICE] ${failErr.message}`);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error(`[RAZORPAY WEBHOOK ERROR] ${error.message}`, { error });
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

    logger.warn(`[RAZORPAY CLIENT FAILURE] Order ID: ${orderId} | Code: ${errorCode} | Reason: ${errorDesc}`);

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
    logger.warn(`[PAYMENT FAILURE ENDPOINT NOTICE] ${err.message}`);
    res.json({ success: false, error: err.message });
  }
});

export default router;
