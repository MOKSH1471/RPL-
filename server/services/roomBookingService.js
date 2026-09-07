import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const RPL_START_DATE = '2026-12-25';
const RPL_END_DATE = '2026-12-27';

function calculateNights(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Ensure placeholder rooms exist in roomdb to satisfy FK constraints.
 */
async function ensurePlaceholderRooms() {
  try {
    await db.query(`
      INSERT INTO roomdb (roomno, roomtype, gender, roomstatus, updatedBy)
      VALUES 
        ('RPL_UNASSIGNED', 'nac', 'NA', 'available', 'RPL_TEAM'),
        ('UNASSIGNED', 'nac', 'NA', 'available', 'RPL_APP')
      ON DUPLICATE KEY UPDATE roomstatus = VALUES(roomstatus)
    `);
  } catch (err) {
    console.warn('Notice ensuring placeholder rooms in roomdb:', err.message);
  }
}

/**
 * Ensure cardno exists in card_db to satisfy FK constraints.
 */
async function ensureCardRecord({ cardno, fullName, mobile, gender, email, centre }) {
  const now = new Date();
  const cleanMobDigits = (mobile || '').replace(/\D/g, '');
  const mobNum = Number(cleanMobDigits.slice(-10)) || 9999999999;
  const mappedGender = gender === 'Female' ? 'F' : 'M';

  // 1. If cardno provided, check if exists
  if (cardno) {
    const [existing] = await db.query('SELECT cardno FROM card_db WHERE cardno = ?', [cardno]);
    if (existing.length > 0) return cardno;
  }

  // 2. Try looking up by mobile
  if (cleanMobDigits.length >= 10) {
    const [byMob] = await db.query('SELECT cardno FROM card_db WHERE mobno = ?', [mobNum]);
    if (byMob.length > 0) return byMob[0].cardno;
  }

  // 3. Create a Guest Card in card_db if not found
  const guestCardNo = cardno || `GUEST_${cleanMobDigits.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;
  try {
    await db.query(
      `INSERT INTO card_db 
       (cardno, issuedto, gender, mobno, email, center, active, status, res_status, updatedBy, password, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'offprem', 'GUEST', 'RPL_REGISTRATION', 'rpl_guest', ?, ?)
       ON DUPLICATE KEY UPDATE issuedto = VALUES(issuedto)`,
      [guestCardNo, fullName || 'RPL Participant', mappedGender, mobNum, email || null, centre || 'Mumbai', now, now]
    );
    return guestCardNo;
  } catch (err) {
    console.warn('Notice creating guest card_db record:', err.message);
    return guestCardNo;
  }
}

/**
 * Process accommodation booking & ledger entries for RPL registrations.
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
}) {
  if (accommodationRequired !== 'Yes') {
    return { booked: false, message: 'Accommodation not requested' };
  }

  await ensurePlaceholderRooms();
  const validCardNo = await ensureCardRecord({ cardno, fullName, mobile, gender, email, centre });
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
        const [existingPre] = await db.query(
          "SELECT bookingid FROM room_booking WHERE cardno = ? AND checkout = ? LIMIT 1",
          [validCardNo, RPL_START_DATE]
        );

        if (existingPre.length > 0) {
          const preBookingId = existingPre[0].bookingid;
          await db.query(
            `UPDATE room_booking SET checkin = ?, nights = ?, updatedAt = ? WHERE bookingid = ?`,
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
          await db.query(
            `INSERT INTO room_booking 
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

          await db.query(
            `INSERT INTO transactions 
             (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              validCardNo,
              preBookingId,
              'room',
              0,
              0,
              'NA',
              `Pre-RPL Extended Stay (${checkInDate} to ${RPL_START_DATE}) - Ashram Allocation Pending`,
              'pending',
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
    // Window 2: Official RPL Tournament Stay (25 Dec -> 27 Dec)
    // -------------------------------------------------------------
    const rplNights = 2;
    const [existingRpl] = await db.query(
      "SELECT bookingid FROM room_booking WHERE cardno = ? AND (checkin = ? AND checkout = ?) LIMIT 1",
      [validCardNo, RPL_START_DATE, RPL_END_DATE]
    );

    let rplBookingId;
    if (existingRpl.length > 0) {
      rplBookingId = existingRpl[0].bookingid;
      bookingsCreated.push({
        type: 'official_rpl_stay',
        bookingid: rplBookingId,
        checkin: RPL_START_DATE,
        checkout: RPL_END_DATE,
        nights: rplNights,
        status: 'pending (RPL Team Allocation)',
        paidBy: 'Paid by RPL',
      });
    } else {
      rplBookingId = uuidv4();
      await db.query(
        `INSERT INTO room_booking 
         (bookingid, cardno, bookedBy, roomno, checkin, checkout, nights, roomtype, status, gender, updatedBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rplBookingId,
          validCardNo,
          validCardNo,
          'RPL_UNASSIGNED',
          RPL_START_DATE,
          RPL_END_DATE,
          rplNights,
          'nac',
          'pending',
          mappedGender,
          'RPL_TEAM',
          now,
          now,
        ]
      );

      await db.query(
        `INSERT INTO transactions 
         (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validCardNo,
          rplBookingId,
          'room',
          0,
          0,
          'NA',
          'Paid by RPL',
          'completed',
          'RPL',
          now,
          now,
        ]
      );

      bookingsCreated.push({
        type: 'official_rpl_stay',
        bookingid: rplBookingId,
        checkin: RPL_START_DATE,
        checkout: RPL_END_DATE,
        nights: rplNights,
        status: 'pending (RPL Team Allocation)',
        paidBy: 'Paid by RPL',
      });
    }

    // -------------------------------------------------------------
    // Window 3: Post-RPL Stay (e.g. 27 Dec -> 29 Dec)
    // -------------------------------------------------------------
    if (checkOutDate > RPL_END_DATE) {
      const postNights = calculateNights(RPL_END_DATE, checkOutDate);
      if (postNights > 0) {
        const [existingPost] = await db.query(
          "SELECT bookingid FROM room_booking WHERE cardno = ? AND checkin = ? LIMIT 1",
          [validCardNo, RPL_END_DATE]
        );

        if (existingPost.length > 0) {
          const postBookingId = existingPost[0].bookingid;
          await db.query(
            `UPDATE room_booking SET checkout = ?, nights = ?, updatedAt = ? WHERE bookingid = ?`,
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
          await db.query(
            `INSERT INTO room_booking 
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

          await db.query(
            `INSERT INTO transactions 
             (cardno, bookingid, category, amount, discount, upi_ref, description, status, updatedBy, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              validCardNo,
              postBookingId,
              'room',
              0,
              0,
              'NA',
              `Post-RPL Extended Stay (${RPL_END_DATE} to ${checkOutDate}) - Ashram Allocation Pending`,
              'pending',
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
    console.error('Error processing room booking & transaction:', error);
    return {
      booked: false,
      error: error.message,
    };
  }
}
