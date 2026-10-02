import { Router } from 'express';
import db, { RPL_DB, AASHRAY_DB } from '../config/db.js';
import { sanitizeDate } from '../utils/helpers.js';
import { processAccommodationBooking } from '../../services/roomBookingService.js';

const router = Router();

// 1. Admin Endpoint: Aggregated Stats & Analytics
router.get('/admin/stats', async (req, res) => {
  try {
    const [regs] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registrations`);

    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let archivedCount = 0;
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
      let gen = {};
      try {
        gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      } catch (e) {
        gen = {};
      }

      const isArchived = Boolean(r.is_archived || gen.isArchived);

      if (isArchived) {
        archivedCount++;
        return; // Exclude archived players from active tallies
      }

      const pStatus = (r.payment_status || 'pending').toLowerCase();
      if (pStatus === 'approved') approved++;
      else if (pStatus === 'rejected') rejected++;
      else pending++;

      if (gen.accommodationRequired === 'Yes') {
        accommodationCount++;
      }

      const rawSize = (gen.tshirtSize || '').trim();
      const matchedSizeKey = Object.keys(tshirtSizes).find((k) => rawSize.startsWith(k)) || 'Other';
      tshirtSizes[matchedSizeKey] = (tshirtSizes[matchedSizeKey] || 0) + 1;

      const centreName = gen.centre || 'Unspecified';
      centresCount[centreName] = (centresCount[centreName] || 0) + 1;

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
        activeRegistrations: regs.length - archivedCount,
        archivedCount,
        payment: { approved, pending, rejected, archived: archivedCount },
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
router.get('/admin/registrations', async (req, res) => {
  const { payment_status, search, sport } = req.query;
  try {
    let query = `SELECT * FROM ${RPL_DB}.rpl_registrations`;
    const params = [];
    const conditions = [];

    if (payment_status && payment_status !== 'all') {
      if (payment_status === 'archived') {
        conditions.push('(is_archived = TRUE OR JSON_EXTRACT(general_details, "$.isArchived") = true)');
      } else {
        conditions.push('payment_status = ?');
        params.push(payment_status);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY submitted_at DESC';

    const [rows] = await db.query(query, params);

    let formatted = rows.map((r) => {
      const parsedGeneral = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      const parsedSport = typeof r.sport_answers === 'string' ? JSON.parse(r.sport_answers || '{}') : (r.sport_answers || {});

      const isArchived = Boolean(r.is_archived || parsedGeneral.isArchived);

      const paymentReceiptUrl = 
        r.payment_receipt_url || 
        parsedGeneral.payment_receipt_url || 
        parsedGeneral.payment_receipt || 
        parsedGeneral.paymentReceiptUrl || 
        parsedGeneral.paymentReceipt || 
        null;

      const playerPhotoUrl = 
        r.player_photo_url || 
        parsedGeneral.player_photo_url || 
        parsedGeneral.photoDriveUrl || 
        parsedGeneral.photoUrl || 
        null;

      const paymentUtr = 
        r.payment_utr || 
        parsedGeneral.payment_utr || 
        parsedGeneral.paymentUtr || 
        null;

      return {
        ...r,
        is_archived: isArchived,
        archived_at: r.archived_at || parsedGeneral.archivedAt || null,
        player_photo_url: playerPhotoUrl,
        payment_receipt_url: paymentReceiptUrl,
        payment_utr: paymentUtr,
        general_details: { ...parsedGeneral, isArchived },
        sport_answers: parsedSport,
        answers: { ...parsedGeneral, ...parsedSport, isArchived },
      };
    });

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
router.patch('/admin/registrations/:id', async (req, res) => {
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
    const [existing] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registrations WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }

    const current = existing[0];
    const updatedFullName = full_name !== undefined ? String(full_name).trim() : current.full_name;
    const updatedEmail = email !== undefined ? String(email).trim() : current.email;
    const updatedMobile = mobile !== undefined ? String(mobile).trim() : current.mobile;
    const updatedPaymentStatus = payment_status !== undefined ? payment_status : current.payment_status;
    const updatedPaymentUtr = payment_utr !== undefined ? payment_utr : current.payment_utr;
    const updatedCheckIn = sanitizeDate(check_in_date !== undefined ? check_in_date : current.check_in_date);
    const updatedCheckOut = sanitizeDate(check_out_date !== undefined ? check_out_date : current.check_out_date);

    let updatedGeneral = current.general_details;
    if (general_details !== undefined) {
      updatedGeneral = typeof general_details === 'object' && general_details !== null ? JSON.stringify(general_details) : general_details;
    } else if (typeof updatedGeneral === 'object' && updatedGeneral !== null) {
      updatedGeneral = JSON.stringify(updatedGeneral);
    }

    let updatedSport = current.sport_answers;
    if (sport_answers !== undefined) {
      updatedSport = typeof sport_answers === 'object' && sport_answers !== null ? JSON.stringify(sport_answers) : sport_answers;
    } else if (typeof updatedSport === 'object' && updatedSport !== null) {
      updatedSport = JSON.stringify(updatedSport);
    }

    await db.query(
      `UPDATE ${RPL_DB}.rpl_registrations 
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
    res.status(500).json({ success: false, error: error.message || 'Failed to update player details.' });
  }
});

// 4. Admin Endpoint: Update Payment Status (Quick 1-Click Action)
router.post('/admin/registrations/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid payment status.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE ${RPL_DB}.rpl_registrations SET payment_status = ? WHERE id = ?`,
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

// 5. Admin Endpoint: Archive / Unarchive Registration
router.post('/admin/registrations/:id/archive', async (req, res) => {
  const { id } = req.params;
  const shouldArchive = req.body.is_archived !== undefined ? Boolean(req.body.is_archived) : true;

  try {
    const [existing] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registrations WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }

    const reg = existing[0];
    let gen = {};
    try {
      gen = typeof reg.general_details === 'string' ? JSON.parse(reg.general_details || '{}') : (reg.general_details || {});
    } catch (e) {
      gen = {};
    }

    const cardNos = new Set();
    if (gen.cardNo) cardNos.add(String(gen.cardNo).trim());

    const cleanMobile = (reg.mobile || '').replace(/\D/g, '');
    const mob10 = cleanMobile.length > 10 ? cleanMobile.slice(-10) : cleanMobile;

    if (mob10) {
      const [cards] = await db.query(
        `SELECT cardno FROM ${AASHRAY_DB}.card_db WHERE mobno = ? OR mobno LIKE ? OR LPAD(cardno, 10, '0') = LPAD(?, 10, '0')`,
        [mob10, `%${mob10}`, gen.cardNo || '']
      );
      cards.forEach((c) => cardNos.add(String(c.cardno)));
    }

    const cardList = Array.from(cardNos).filter(Boolean);

    if (shouldArchive) {
      gen.isArchived = true;
      gen.archivedAt = new Date().toISOString();

      await db.query(
        `UPDATE ${RPL_DB}.rpl_registrations 
         SET is_archived = TRUE, archived_at = NOW(), general_details = ? 
         WHERE id = ?`,
        [JSON.stringify(gen), id]
      );

      let cancelledBookingsCount = 0;
      let cancelledTransactionsCount = 0;

      try {
        const [rplTxRes] = await db.query(
          `UPDATE ${RPL_DB}.rpl_transactions 
           SET status = 'cancelled', updatedAt = NOW() 
           WHERE bookingid = ? OR cardno IN (?)`,
          [id, cardList.length > 0 ? cardList : ['NONE']]
        );
        cancelledTransactionsCount += rplTxRes.affectedRows || 0;
      } catch (rplTxErr) {
        console.warn('[RPL Archive] Notice updating RPL.rpl_transactions:', rplTxErr.message);
      }

      if (cardList.length > 0) {
        try {
          const [bookRes] = await db.query(
            `UPDATE ${AASHRAY_DB}.room_booking 
             SET status = 'cancelled', updatedAt = NOW() 
             WHERE cardno IN (?) 
               AND (updatedBy IN ('RPL_TEAM', 'RPL_APP') OR roomno IN ('RPL_UNASSIGNED', 'UNASSIGNED') OR (checkin >= '2026-12-20' AND checkin <= '2026-12-30'))`,
            [cardList]
          );
          cancelledBookingsCount = bookRes.affectedRows || 0;
        } catch (bookErr) {
          console.warn('[RPL Archive] Notice updating room_booking:', bookErr.message);
        }

        try {
          const [txRes] = await db.query(
            `UPDATE ${AASHRAY_DB}.transactions 
             SET status = 'cancelled', updatedAt = NOW() 
             WHERE cardno IN (?) AND (updatedBy IN ('RPL', 'RPL_APP') OR description LIKE '%RPL%')`,
            [cardList]
          );
          cancelledTransactionsCount += txRes.affectedRows || 0;
        } catch (txErr) {
          console.warn('[RPL Archive] Notice updating aashray.transactions:', txErr.message);
        }
      }

      console.log(`[RPL ARCHIVE] Registration "${reg.full_name}" (${id}) moved to archive. Cancelled ${cancelledBookingsCount} room bookings and ${cancelledTransactionsCount} transactions.`);

      return res.json({
        success: true,
        message: `Player "${reg.full_name}" has been moved to archive. Room and kit allocations have been set to cancelled.`,
        is_archived: true,
        archived_at: new Date().toISOString(),
        released: {
          room_bookings: cancelledBookingsCount,
          transactions: cancelledTransactionsCount,
        }
      });
    } else {
      // Unarchive
      gen.isArchived = false;
      delete gen.archivedAt;

      await db.query(
        `UPDATE ${RPL_DB}.rpl_registrations 
         SET is_archived = FALSE, archived_at = NULL, general_details = ? 
         WHERE id = ?`,
        [JSON.stringify(gen), id]
      );

      try {
        await db.query(
          `UPDATE ${RPL_DB}.rpl_transactions 
           SET status = 'completed', updatedAt = NOW() 
           WHERE bookingid = ? OR cardno IN (?)`,
          [id, cardList.length > 0 ? cardList : ['NONE']]
        );
      } catch (rplTxErr) {
        console.warn('[RPL Unarchive] Notice restoring RPL.rpl_transactions:', rplTxErr.message);
      }

      let accommodationRestored = null;
      if (gen.accommodationRequired === 'Yes') {
        try {
          accommodationRestored = await processAccommodationBooking({
            cardno: gen.cardNo || null,
            fullName: reg.full_name,
            email: reg.email,
            mobile: reg.mobile,
            centre: gen.centre || 'Mumbai',
            gender: gen.gender || 'Male',
            checkInDate: reg.check_in_date || gen.checkInDate || '2026-12-25',
            checkOutDate: reg.check_out_date || gen.checkOutDate || '2026-12-27',
            accommodationRequired: 'Yes',
          });
        } catch (accErr) {
          console.error('[RPL UNARCHIVE] Error restoring accommodation:', accErr);
        }
      }

      console.log(`[RPL UNARCHIVE] Registration "${reg.full_name}" (${id}) restored to active.`);

      return res.json({
        success: true,
        message: `Player "${reg.full_name}" has been restored to active status.`,
        is_archived: false,
        accommodation: accommodationRestored,
      });
    }
  } catch (error) {
    console.error('Error toggling archive status:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update archive status.' });
  }
});

// Fallback DELETE route (redirected to safe archive)
router.delete('/admin/registrations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registrations WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }
    const reg = existing[0];
    let gen = {};
    try {
      gen = typeof reg.general_details === 'string' ? JSON.parse(reg.general_details || '{}') : (reg.general_details || {});
    } catch (e) {
      gen = {};
    }
    gen.isArchived = true;
    gen.archivedAt = new Date().toISOString();

    await db.query(
      `UPDATE ${RPL_DB}.rpl_registrations SET is_archived = TRUE, archived_at = NOW(), general_details = ? WHERE id = ?`,
      [JSON.stringify(gen), id]
    );

    res.json({
      success: true,
      message: `Registration "${reg.full_name}" moved to archive safely.`,
      is_archived: true,
    });
  } catch (error) {
    console.error('Error in delete/archive handler:', error);
    res.status(500).json({ success: false, error: 'Failed to archive registration.' });
  }
});

// 6. Admin Endpoint: Accommodation Stay List & Room Bookings
router.get('/admin/accommodation', async (req, res) => {
  try {
    const [regs] = await db.query(`
      SELECT r.id, r.full_name, r.mobile, r.email, r.payment_status, r.check_in_date, r.check_out_date, r.general_details, r.is_archived
      FROM ${RPL_DB}.rpl_registrations r
      ORDER BY r.submitted_at DESC
    `);

    const [bookings] = await db.query(`
      SELECT bookingid, cardno, roomno, checkin, checkout, nights, status, updatedBy, createdAt
      FROM ${AASHRAY_DB}.room_booking
      ORDER BY createdAt DESC
    `);

    const seenMobiles = new Set();
    const uniqueRegs = [];
    for (const r of regs) {
      const rawDigits = (r.mobile || '').replace(/\D/g, '');
      const key = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
      const lookupKey = key || r.id;
      if (!seenMobiles.has(lookupKey)) {
        seenMobiles.add(lookupKey);
        uniqueRegs.push(r);
      }
    }

    const activeRegs = uniqueRegs.filter((r) => {
      let gen = {};
      try {
        gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      } catch (e) {
        gen = {};
      }
      return !r.is_archived && !gen.isArchived;
    });

    const accommodationList = activeRegs
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
router.post('/admin/accommodation/assign', async (req, res) => {
  const { bookingid, roomno } = req.body;

  if (!bookingid || !roomno) {
    return res.status(400).json({ success: false, error: 'bookingid and roomno are required.' });
  }

  try {
    const cleanRoomNo = String(roomno).trim().toUpperCase();

    await db.query(`
      INSERT INTO ${AASHRAY_DB}.roomdb (roomno, roomtype, gender, roomstatus, updatedBy)
      VALUES (?, 'nac', 'NA', 'available', 'RPL_ADMIN')
      ON DUPLICATE KEY UPDATE updatedBy = 'RPL_ADMIN'
    `, [cleanRoomNo]);

    const [result] = await db.query(
      `UPDATE ${AASHRAY_DB}.room_booking SET roomno = ?, status = ? WHERE bookingid = ?`,
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

export default router;
