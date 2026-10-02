import db, { RPL_DB, AASHRAY_DB } from '../config/db.js';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

export async function lookupPlayer(input) {
  const cleanMobile = cleanDomesticPhone(input);

  logger.info(`[PLAYER / MUMUKSHU LOOKUP] Input: "${input}" | Normalized: "${cleanMobile}"`);

  if (cleanMobile.length < 5) {
    return { found: false, message: 'Search term too short' };
  }

  // 1. Check existing RPL registration
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

    return {
      found: true,
      isExistingRegistration: true,
      registration: {
        id: reg.id,
        fullName: reg.full_name,
        email: reg.email,
        mobile: reg.mobile,
        checkInDate: reg.check_in_date,
        checkOutDate: reg.check_out_date,
        paymentStatus: reg.payment_status,
        paymentUtr: reg.payment_utr,
        paymentReceiptUrl: reg.payment_receipt_url,
        paymentReceipts: receiptList,
        paymentUtrs: utrList,
        hasPreviouslyPaid,
        previouslyPaidSportsCount,
        selectedSports: savedSports,
        generalDetails: parsedGeneralDetails,
        sportAnswers: parsedSportAnswers,
        submittedAt: reg.submitted_at,
      },
      data: {
        cardNo: parsedGeneralDetails.cardNo || null,
        fullName: reg.full_name || '',
        gender: parsedGeneralDetails.gender || 'Male',
        dateOfBirth: parsedGeneralDetails.dateOfBirth || '',
        mobileNumber: reg.mobile || cleanMobile,
        email: reg.email || '',
        centre: parsedGeneralDetails.centre || '',
        photoUrl: reg.player_photo_url || '',
        isMumukshu: !!parsedGeneralDetails.cardNo,
      },
    };
  }

  // 2. Fallback to card_db
  const cardDbQuery = `SELECT cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, mobno, email, center, pfp 
     FROM ${AASHRAY_DB}.card_db 
     WHERE (mobno = ? OR mobno LIKE ?) AND (issuedto IS NOT NULL AND issuedto != '') 
     ORDER BY cardno DESC LIMIT 1`;

  const [rows] = await db.query(cardDbQuery, [cleanMobile, `%${cleanMobile}`]);

  if (rows.length === 0) {
    return {
      found: false,
      message: 'No record found matching this mobile number',
    };
  }

  const member = rows[0];
  logger.info(`[PLAYER / MUMUKSHU LOOKUP] Matched card_db for "${member.issuedto}" (card #${member.cardno}) via mobile "${cleanMobile}"`);

  let normalizedGender = 'Male';
  if (member.gender) {
    const g = String(member.gender).trim().toUpperCase();
    if (g === 'F' || g === 'FEMALE') normalizedGender = 'Female';
    else if (g === 'M' || g === 'MALE') normalizedGender = 'Male';
    else normalizedGender = member.gender;
  }

  return {
    found: true,
    isExistingRegistration: false,
    data: {
      cardNo: member.cardno,
      fullName: member.issuedto || '',
      gender: normalizedGender,
      dateOfBirth: member.dob || '',
      mobileNumber: member.mobno || cleanMobile,
      email: member.email || '',
      centre: member.center || '',
      photoUrl: member.pfp || '',
      isMumukshu: true,
    },
  };
}

export async function lookupReferrer(input) {
  const cleanMobile = cleanDomesticPhone(input);

  logger.info(`[REFERRER LOOKUP] Checking strictly by phone: "${input}" -> 10-digit: "${cleanMobile}"`);

  if (cleanMobile.length !== 10) {
    return {
      found: false,
      message: 'Please provide a valid 10-digit mobile number for referrer lookup',
    };
  }

  const cardDbQuery = `SELECT cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, mobno, email, center, pfp 
     FROM ${AASHRAY_DB}.card_db 
     WHERE (mobno = ? OR mobno LIKE ?) AND (issuedto IS NOT NULL AND issuedto != '') 
     ORDER BY cardno DESC LIMIT 1`;

  const [rows] = await db.query(cardDbQuery, [cleanMobile, `%${cleanMobile}`]);

  if (rows.length === 0) {
    return {
      found: false,
      message: 'No registered Ashram member found with this mobile number',
    };
  }

  const member = rows[0];
  logger.info(`[REFERRER LOOKUP] Verified referrer: "${member.issuedto}" (card #${member.cardno}) strictly by phone "${cleanMobile}"`);

  return {
    found: true,
    isExistingRegistration: false,
    data: {
      cardNo: member.cardno,
      fullName: member.issuedto || '',
      centre: member.center || '',
      email: member.email || '',
      isMumukshu: true,
    },
  };
}
