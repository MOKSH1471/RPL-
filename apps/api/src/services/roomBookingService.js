import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

const AASHRAY_DB = process.env.AASHRAY_DB || 'aashray';
export const RPL_START_DATE = '2026-12-25';
export const RPL_END_DATE = '2026-12-27';

export function calculateNights(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Ensure placeholder rooms exist in roomdb to satisfy FK constraints.
 */
async function ensurePlaceholderRooms(executor = db) {
  try {
    await executor.query(`
      INSERT INTO ${AASHRAY_DB}.roomdb (roomno, roomtype, gender, roomstatus, updatedBy)
      VALUES 
        ('RPL_UNASSIGNED', 'nac', 'NA', 'available', 'RPL_TEAM'),
        ('UNASSIGNED', 'nac', 'NA', 'available', 'RPL_APP')
      ON DUPLICATE KEY UPDATE roomstatus = VALUES(roomstatus)
    `);
  } catch (err) {
    logger.warn(`Notice ensuring placeholder rooms in roomdb: ${err.message}`);
  }
}

/**
 * Ensure cardno exists in card_db to satisfy FK constraints.
 */
async function ensureCardRecord({ cardno, fullName, mobile, gender, email, centre, executor = db }) {
  const now = new Date();
  const cleanMobDigits = cleanDomesticPhone(mobile);
  const mobNum = Number(cleanMobDigits) || 9999999999;
  const mappedGender = gender === 'Female' ? 'F' : 'M';

  // 1. If cardno provided, check if exists in central Aashray card_db
  if (cardno) {
    const [existing] = await executor.query(`SELECT cardno FROM ${AASHRAY_DB}.card_db WHERE cardno = ?`, [cardno]);
    if (existing.length > 0) return cardno;
  }

  // 2. Try looking up by mobile in central Aashray card_db
  if (cleanMobDigits.length >= 10) {
    const [byMob] = await executor.query(`SELECT cardno FROM ${AASHRAY_DB}.card_db WHERE mobno = ?`, [mobNum]);
    if (byMob.length > 0) return byMob[0].cardno;
  }

  // 3. Create a Guest Card in central Aashray card_db if not found
  const guestCardNo = cardno || `GUEST_${cleanMobDigits.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;
  try {
    await executor.query(
      `INSERT INTO ${AASHRAY_DB}.card_db 
       (cardno, issuedto, gender, mobno, email, center, active, status, res_status, updatedBy, password, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'offprem', 'GUEST', 'RPL_REGISTRATION', 'rpl_guest', ?, ?)
       ON DUPLICATE KEY UPDATE issuedto = VALUES(issuedto)`,
      [guestCardNo, fullName || 'RPL Participant', mappedGender, mobNum, email || null, centre || 'Mumbai', now, now]
    );
    return guestCardNo;
  } catch (err) {
    logger.warn(`Notice creating guest card_db record: ${err.message}`);
    return guestCardNo;
  }
}

/**
 * Process accommodation booking & ledger entries for RPL registrations.
 * Supports executing inside an atomic database transaction via optional `connection`.
 */
export async function processAccommodationBooking({
  cardno,
  fullName,
  mobile,
  email,
  centre,
  gender,
  checkInDate = RPL_START_DATE,
  checkOutDate = RPL_END_DATE,
  accommodationRequired = 'No',
  connection = null,
}) {
  if (accommodationRequired !== 'Yes') {
    return { booked: false, message: 'Accommodation not requested' };
  }

  const q = connection || db;

  await ensurePlaceholderRooms(q);
  const validCardNo = await ensureCardRecord({ cardno, fullName, mobile, gender, email, centre, executor: q });
  const mappedGender = gender === 'Female' ? 'F' : 'M';
  const bookingsCreated = [];
  const now = new Date();

  try {
    // -------------------------------------------------------------
    // Window 1: Pre-RPL Stay (e.g. 23 Dec -> 25 Dec)
    // -------------------------------------------------------------
    if (checkInDate < RPL_START_DATE) {
      const preNights = calculateNights(checkInDate, RPL_START_DATE);
      if (preNights > 0) {
        const [existingPre] = await q.query(
          `SELECT bookingid FROM ${AASHRAY_DB}.room_booking WHERE cardno = ? AND checkout = ? LIMIT 1`,
          [validCardNo, RPL_START_DATE]
        );

        if (existingPre.length > 0) {
          const preBookingId = existingPre[0].bookingid;
          await q.query(
            `UPDATE ${AASHRAY_DB}.room_booking SET checkin = ?, nights = ?, status = 'waiting', updatedAt = ? WHERE bookingid = ?`,
            [checkInDate, preNights, now, preBookingId]
          );
          bookingsCreated.push({
            type: 'pre_rpl_extended',
            bookingid: preBookingId,
            checkin: checkInDate,
            checkout: RPL_START_DATE,
            nights: preNights,
            status: 'waiting (Ashram Desk Allocation)',
            paidBy: 'User (Via Aashray App)',
          });
        } else {
          const preBookingId = uuidv4();
          await q.query(
            `INSERT INTO ${AASHRAY_DB}.room_booking 
             (bookingid, cardno, bookedBy, roomno, checkin, checkout, nights, roomtype, status, gender, updatedBy, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              preBookingId,
              validCardNo,
              validCardNo,
              'UNASSIGNED',
              checkInDate,
              RPL_START_DATE,
              preNights,
              'nac',
              'waiting',
              mappedGender,
              'RPL_APP',
              now,
              now,
            ]
          );

          bookingsCreated.push({
            type: 'pre_rpl_extended',
            bookingid: preBookingId,
            checkin: checkInDate,
            checkout: RPL_START_DATE,
            nights: preNights,
            status: 'waiting (Ashram Desk Allocation)',
            paidBy: 'User (Via Aashray App)',
          });
        }
      }
    }

    // -------------------------------------------------------------
    // Window 2: Official RPL Tournament Stay (25 Dec → 27 Dec)
    // Covered by the RPL registration fee — created as 'confirmed'.
    // -------------------------------------------------------------
    const rplNights = calculateNights(RPL_START_DATE, RPL_END_DATE); // always 2
    const [existingRpl] = await q.query(
      `SELECT bookingid FROM ${AASHRAY_DB}.room_booking 
       WHERE cardno = ? AND checkin = ? AND checkout = ? LIMIT 1`,
      [validCardNo, RPL_START_DATE, RPL_END_DATE]
    );

    if (existingRpl.length > 0) {
      await q.query(
        `UPDATE ${AASHRAY_DB}.room_booking 
         SET status = 'confirmed', roomno = 'RPL_UNASSIGNED', bookedBy = 'RPL_TEAM', updatedAt = ? 
         WHERE bookingid = ?`,
        [now, existingRpl[0].bookingid]
      );
      bookingsCreated.push({
        type: 'rpl_tournament',
        bookingid: existingRpl[0].bookingid,
        checkin: RPL_START_DATE,
        checkout: RPL_END_DATE,
        nights: rplNights,
        status: 'confirmed',
        paidBy: 'RPL Registration Fee (Included)',
      });
    } else {
      const rplBookingId = uuidv4();
      await q.query(
        `INSERT INTO ${AASHRAY_DB}.room_booking 
         (bookingid, cardno, bookedBy, roomno, checkin, checkout, nights, roomtype, status, gender, updatedBy, createdAt, updatedAt)
         VALUES (?, ?, 'RPL_TEAM', 'RPL_UNASSIGNED', ?, ?, ?, 'nac', 'confirmed', ?, 'RPL_APP', ?, ?)`,
        [rplBookingId, validCardNo, RPL_START_DATE, RPL_END_DATE, rplNights, mappedGender, now, now]
      );
      bookingsCreated.push({
        type: 'rpl_tournament',
        bookingid: rplBookingId,
        checkin: RPL_START_DATE,
        checkout: RPL_END_DATE,
        nights: rplNights,
        status: 'confirmed',
        paidBy: 'RPL Registration Fee (Included)',
      });
    }

    // -------------------------------------------------------------
    // Window 3: Post-RPL Stay (e.g. 27 Dec -> 29 Dec)
    // -------------------------------------------------------------
    if (checkOutDate > RPL_END_DATE) {
      const postNights = calculateNights(RPL_END_DATE, checkOutDate);
      if (postNights > 0) {
        const [existingPost] = await q.query(
          `SELECT bookingid FROM ${AASHRAY_DB}.room_booking WHERE cardno = ? AND checkin = ? LIMIT 1`,
          [validCardNo, RPL_END_DATE]
        );

        if (existingPost.length > 0) {
          const postBookingId = existingPost[0].bookingid;
          await q.query(
            `UPDATE ${AASHRAY_DB}.room_booking SET checkout = ?, nights = ?, status = 'waiting', updatedAt = ? WHERE bookingid = ?`,
            [checkOutDate, postNights, now, postBookingId]
          );
          bookingsCreated.push({
            type: 'post_rpl_extended',
            bookingid: postBookingId,
            checkin: RPL_END_DATE,
            checkout: checkOutDate,
            nights: postNights,
            status: 'waiting (Ashram Desk Allocation)',
            paidBy: 'User (Via Aashray App)',
          });
        } else {
          const postBookingId = uuidv4();
          await q.query(
            `INSERT INTO ${AASHRAY_DB}.room_booking 
             (bookingid, cardno, bookedBy, roomno, checkin, checkout, nights, roomtype, status, gender, updatedBy, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              postBookingId,
              validCardNo,
              validCardNo,
              'UNASSIGNED',
              RPL_END_DATE,
              checkOutDate,
              postNights,
              'nac',
              'waiting',
              mappedGender,
              'RPL_APP',
              now,
              now,
            ]
          );

          bookingsCreated.push({
            type: 'post_rpl_extended',
            bookingid: postBookingId,
            checkin: RPL_END_DATE,
            checkout: checkOutDate,
            nights: postNights,
            status: 'waiting (Ashram Desk Allocation)',
            paidBy: 'User (Via Aashray App)',
          });
        }
      }
    }

    return {
      booked: true,
      cardno: validCardNo,
      bookings: bookingsCreated,
    };
  } catch (error) {
    logger.error(`Error processing room booking: ${error.message}`, { error });
    return {
      booked: false,
      error: error.message,
    };
  }
}
