import { Router } from 'express';
import db, { RPL_DB, AASHRAY_DB } from '../config/db.js';

const router = Router();

// Player / Mumukshu Lookup by Mobile Number (First from rpl_registrations, then fallback to card_db)
export const handlePlayerLookup = async (req, res) => {
  const { mobile, cardno, query: searchParam } = req.query;
  const input = String(mobile || cardno || searchParam || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'Mobile number or Card number is required' });
  }

  try {
    const digitsOnly = input.replace(/\D/g, '');
    const cleanMobile = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    console.log(`[PLAYER / MUMUKSHU LOOKUP] Input: "${input}" | Digits: "${digitsOnly}" | Clean 10-digit: "${cleanMobile}"`);

    if (cleanMobile.length < 5 && digitsOnly.length < 5) {
      return res.json({ found: false, message: 'Search term too short' });
    }

    // 1. First priority: Check if this player ALREADY has a registration in rpl_registrations
    const [regRows] = await db.query(
      `SELECT id, full_name, email, mobile, DATE_FORMAT(check_in_date, '%Y-%m-%d') as check_in_date, DATE_FORMAT(check_out_date, '%Y-%m-%d') as check_out_date, player_photo_url, payment_status, payment_utr, payment_receipt_url, general_details, sport_answers, submitted_at FROM ${RPL_DB}.rpl_registrations WHERE mobile = ? OR mobile LIKE ? ORDER BY submitted_at DESC LIMIT 1`,
      [cleanMobile, `%${cleanMobile}`]
    );

    if (regRows.length > 0) {
      const reg = regRows[0];
      let parsedGeneralDetails = {};
      let parsedSportAnswers = {};
      try {
        parsedGeneralDetails = typeof reg.general_details === 'string' ? JSON.parse(reg.general_details) : (reg.general_details || {});
      } catch (e) {
        parsedGeneralDetails = {};
      }
      try {
        parsedSportAnswers = typeof reg.sport_answers === 'string' ? JSON.parse(reg.sport_answers) : (reg.sport_answers || {});
      } catch (e) {
        parsedSportAnswers = {};
      }

      const rawReceipts = reg.payment_receipt_url || parsedGeneralDetails.payment_receipt_url || parsedGeneralDetails.payment_receipt || '';
      const receiptList = Array.isArray(parsedGeneralDetails.paymentReceipts) && parsedGeneralDetails.paymentReceipts.length > 0
        ? parsedGeneralDetails.paymentReceipts
        : String(rawReceipts).split(',').map((s) => s.trim()).filter(Boolean);

      const rawUtrs = reg.payment_utr || parsedGeneralDetails.payment_utr || '';
      const utrList = Array.isArray(parsedGeneralDetails.paymentUtrs) && parsedGeneralDetails.paymentUtrs.length > 0
        ? parsedGeneralDetails.paymentUtrs
        : String(rawUtrs).split(',').map((s) => s.trim()).filter(Boolean);

      const savedSports = Array.isArray(parsedGeneralDetails.selectedSports)
        ? parsedGeneralDetails.selectedSports
        : Object.keys(parsedSportAnswers);

      const previouslyPaidSportsCount = Math.max(1, savedSports.length);
      const hasPreviouslyPaid = (reg.payment_status || '').toLowerCase() === 'approved' || receiptList.length > 0 || utrList.length > 0;

      return res.json({
        found: true,
        isExistingRegistration: true,
        registration: {
          id: reg.id,
          fullName: reg.full_name,
          email: reg.email,
          mobile: reg.mobile,
          checkInDate: reg.check_in_date,
          checkOutDate: reg.check_out_date,
          playerPhotoUrl: reg.player_photo_url,
          paymentStatus: reg.payment_status,
          paymentUtr: reg.payment_utr,
          paymentReceiptUrl: reg.payment_receipt_url,
          receiptList,
          utrList,
          previouslyPaidSportsCount,
          hasPreviouslyPaid,
          generalDetails: parsedGeneralDetails,
          sportAnswers: parsedSportAnswers,
          cardNo: parsedGeneralDetails.cardNo || null,
        },
        data: {
          cardNo: parsedGeneralDetails.cardNo || null,
          fullName: reg.full_name,
          gender: parsedGeneralDetails.gender || 'Male',
          dateOfBirth: parsedGeneralDetails.dateOfBirth || '',
          email: reg.email,
          centre: parsedGeneralDetails.centre || '',
          photoUrl: reg.player_photo_url || '',
          isMumukshu: !!parsedGeneralDetails.cardNo,
        },
      });
    }

    // 2. Second priority: If no registration yet, query card_db for Mumukshu auto-fill STRICTLY BY MOBILE NUMBER ONLY
    const cardDbQuery = `SELECT cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, mobno, email, center, pfp 
       FROM ${AASHRAY_DB}.card_db 
       WHERE mobno = ? 
          OR mobno LIKE ? 
          OR REPLACE(REPLACE(REPLACE(REPLACE(mobno, ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?
       LIMIT 1`;
    const queryParams = [
      cleanMobile, 
      `%${cleanMobile}`, 
      `%${cleanMobile}`
    ];

    const [rows] = await db.query(cardDbQuery, queryParams);

    if (rows.length === 0) {
      console.log(`[MUMUKSHU LOOKUP] Result: Not found for mobile "${cleanMobile}"`);
      return res.json({ found: false, message: 'Not found in rpl_registrations or card_db' });
    }

    const member = rows[0];
    console.log(`[MUMUKSHU LOOKUP] Result: Found member "${member.issuedto}" (card #${member.cardno}) strictly by mobile "${cleanMobile}"`);

    let formattedGender = 'Male';
    if (member.gender === 'F' || member.gender === 'Female') formattedGender = 'Female';
    const formattedDob = member.dob || '';

    return res.json({
      found: true,
      isExistingRegistration: false,
      data: {
        cardNo: member.cardno,
        fullName: member.issuedto || '',
        mobile: member.mobno || cleanMobile,
        gender: formattedGender,
        dateOfBirth: formattedDob,
        email: member.email || '',
        centre: member.center || '',
        photoUrl: member.pfp || '',
        isMumukshu: true,
      },
    });
  } catch (error) {
    console.error('Player lookup error:', error);
    res.status(500).json({ error: 'Failed to query player data' });
  }
};

// Referrer Lookup for Unregistered Players (Strictly by Mobile Number ONLY)
export const handleReferrerLookup = async (req, res) => {
  const { mobile, phone } = req.query;
  const input = String(mobile || phone || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'Referrer mobile number is required' });
  }

  try {
    const digitsOnly = input.replace(/\D/g, '');
    const cleanMobile = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    console.log(`[REFERRER LOOKUP] Checking strictly by phone: "${input}" -> 10-digit: "${cleanMobile}"`);

    if (cleanMobile.length !== 10) {
      return res.json({ found: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    // 1. Check if referrer is an existing registered player in rpl_registrations
    const [regRows] = await db.query(
      `SELECT id, full_name, email, mobile, general_details 
       FROM ${RPL_DB}.rpl_registrations 
       WHERE mobile = ? OR mobile LIKE ? 
       ORDER BY submitted_at DESC LIMIT 1`,
      [cleanMobile, `%${cleanMobile}`]
    );

    if (regRows.length > 0) {
      const reg = regRows[0];
      let gen = {};
      try {
        gen = typeof reg.general_details === 'string' ? JSON.parse(reg.general_details) : (reg.general_details || {});
      } catch (e) {
        gen = {};
      }

      return res.json({
        found: true,
        isExistingRegistration: true,
        registration: {
          id: reg.id,
          fullName: reg.full_name,
          email: reg.email,
          mobile: reg.mobile,
          cardNo: gen.cardNo || null,
          generalDetails: gen,
        },
        data: {
          cardNo: gen.cardNo || null,
          fullName: reg.full_name,
          centre: gen.centre || '',
          email: reg.email,
          isMumukshu: !!gen.cardNo,
        },
      });
    }

    // 2. Query central card_db STRICTLY by phone number (mobno)
    const [rows] = await db.query(
      `SELECT cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, mobno, email, center, pfp 
       FROM ${AASHRAY_DB}.card_db 
       WHERE mobno = ? 
          OR mobno LIKE ? 
          OR REPLACE(REPLACE(REPLACE(REPLACE(mobno, ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?
       LIMIT 1`,
      [cleanMobile, `%${cleanMobile}`, `%${cleanMobile}`]
    );

    if (rows.length === 0) {
      console.log(`[REFERRER LOOKUP] Not found for phone number: "${cleanMobile}"`);
      return res.json({ found: false, message: 'No registered Mumukshu found with this mobile number' });
    }

    const member = rows[0];
    console.log(`[REFERRER LOOKUP] Verified referrer: "${member.issuedto}" (card #${member.cardno}) strictly by phone "${cleanMobile}"`);

    return res.json({
      found: true,
      isExistingRegistration: false,
      data: {
        cardNo: member.cardno,
        fullName: member.issuedto || '',
        centre: member.center || '',
        email: member.email || '',
        isMumukshu: true,
      },
    });
  } catch (error) {
    console.error('Referrer lookup error:', error);
    res.status(500).json({ error: 'Failed to verify referrer' });
  }
};

// Route definitions with aliases
router.get('/player-lookup', handlePlayerLookup);
router.get('/mumukshu-lookup', handlePlayerLookup);
router.get('/card/lookup', handlePlayerLookup);

router.get('/referrer-lookup', handleReferrerLookup);
router.get('/reference-lookup', handleReferrerLookup);

export default router;
