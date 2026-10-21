import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

const AASHRAY_DB = process.env.AASHRAY_DB || 'aashray';
export const RPL_START_DATE = '2026-12-25';
export const RPL_END_DATE = '2026-12-27';

export const RPL_TOURNAMENT_DATES = ['2026-12-25', '2026-12-26', '2026-12-27'];

export function calculateNights(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Process food/meal bookings in central Aashray food_db for tournament dates.
 * Dates: Dec 25, Dec 26, Dec 27 (2026).
 * All 3 meals: breakfast=1, lunch=1, dinner=1.
 */
export async function processFoodBooking({
  cardno,
  foodPreference = 'Regular',
  connection = null,
}) {
  if (!cardno) {
    return { booked: false, message: 'Card number required for food booking' };
  }

  const q = connection || db;
  const now = new Date();
  const spicyVal = (typeof foodPreference === 'string' && foodPreference.toLowerCase().includes('non-spicy')) ? 0 : 1;
  const foodBookingsCreated = [];

  for (const dateStr of RPL_TOURNAMENT_DATES) {
    try {
      const [existing] = await q.query(
        `SELECT id FROM ${AASHRAY_DB}.food_db WHERE cardno = ? AND date = ? LIMIT 1`,
        [cardno, dateStr]
      );

      if (existing.length > 0) {
        const foodId = existing[0].id;
        await q.query(
          `UPDATE ${AASHRAY_DB}.food_db 
           SET breakfast = 1, lunch = 1, dinner = 1, spicy = ?, updatedBy = 'RPL_APP', updatedAt = ? 
           WHERE id = ?`,
          [spicyVal, now, foodId]
        );
        foodBookingsCreated.push({ id: foodId, date: dateStr, action: 'updated', spicy: spicyVal });
      } else {
        const foodId = uuidv4();
        await q.query(
          `INSERT INTO ${AASHRAY_DB}.food_db 
           (id, cardno, bookedBy, date, breakfast, breakfast_plate_issued, lunch, lunch_plate_issued, dinner, dinner_plate_issued, hightea, spicy, updatedBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 1, 0, 1, 0, 1, 0, 'NONE', ?, 'RPL_APP', ?, ?)`,
          [foodId, cardno, null, dateStr, spicyVal, now, now]
        );
        foodBookingsCreated.push({ id: foodId, date: dateStr, action: 'created', spicy: spicyVal });
      }
    } catch (err) {
      logger.error(`Error processing food booking for ${cardno} on ${dateStr}: ${err.message}`, { error: err });
    }
  }

  return {
    booked: foodBookingsCreated.length > 0,
    foodBookings: foodBookingsCreated,
  };
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

  const guestCardNo = cardno || `GUEST_${cleanMobDigits.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

  try {
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
    await executor.query(
      `INSERT INTO ${AASHRAY_DB}.card_db 
       (cardno, issuedto, gender, mobno, email, center, active, status, res_status, updatedBy, password, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'offprem', 'GUEST', 'RPL_REGISTRATION', 'rpl_guest', ?, ?)
       ON DUPLICATE KEY UPDATE issuedto = VALUES(issuedto)`,
      [guestCardNo, fullName || 'RPL Participant', mappedGender, mobNum, email || null, centre || 'Mumbai', now, now]
    );
    return guestCardNo;
  } catch (err) {
    logger.warn(`Notice ensuring guest card_db record: ${err.message}`);
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
  spectatorOption,
  registrationType = 'player',
  foodPreference = 'Regular',
  bookMeals,
  connection = null,
}) {
  const isSpectator = registrationType === 'spectator';
  const hasRoom = isSpectator
    ? (accommodationRequired === 'Yes' || spectatorOption === 'with-stay')
    : (accommodationRequired === 'Yes');

  const shouldBookMeals = bookMeals !== undefined
    ? Boolean(bookMeals)
    : hasRoom;

  if (!hasRoom && !shouldBookMeals) {
    return { booked: false, foodBooked: false, message: 'Accommodation not requested' };
  }

  const q = connection || db;

  const validCardNo = await ensureCardRecord({ cardno, fullName, mobile, gender, email, centre, executor: q });
  const mappedGender = gender === 'Female' ? 'F' : 'M';
  const bookingsCreated = [];
  const now = new Date();

  try {
    if (hasRoom) {
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
                null,
                'NA',
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
           SET status = 'pending checkin', roomno = 'NA', bookedBy = NULL, updatedAt = ? 
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
           VALUES (?, ?, ?, 'NA', ?, ?, ?, 'nac', 'pending checkin', ?, 'RPL_APP', ?, ?)`,
          [rplBookingId, validCardNo, null, RPL_START_DATE, RPL_END_DATE, rplNights, mappedGender, now, now]
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
                null,
                'NA',
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
    }

    // -------------------------------------------------------------
    // Meals: Dec 25, 26, 27 (All 3 meals: breakfast, lunch, dinner)
    // -------------------------------------------------------------
    let foodResult = { booked: false, foodBookings: [] };
    if (shouldBookMeals) {
      foodResult = await processFoodBooking({
        cardno: validCardNo,
        foodPreference,
        connection: q,
      });
    }

    return {
      booked: hasRoom && bookingsCreated.length > 0,
      cardno: validCardNo,
      bookings: bookingsCreated,
      foodBooked: foodResult.booked,
      foodBookings: foodResult.foodBookings,
      message: !hasRoom ? 'Accommodation not requested' : undefined,
    };
  } catch (error) {
    logger.error(`Error processing room/food booking: ${error.message}`, { error });
    return {
      booked: false,
      foodBooked: false,
      error: error.message,
    };
  }
}
