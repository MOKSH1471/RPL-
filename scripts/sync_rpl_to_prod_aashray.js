/**
 * sync_rpl_to_prod_aashray.js
 *
 * Extracts RPL-generated Aashray records (guest cards, relationships, and tournament room bookings)
 * from the Dev database (Aiven Cloud) and formats them into a ready-to-run SQL script for the
 * Production AWS database (AASHRAY AWS).
 *
 * Usage:
 *   node scripts/sync_rpl_to_prod_aashray.js
 *
 * Output:
 *   Generates 'sync_rpl_to_prod_aashray.sql' ready to paste into Beekeeper Studio or run via CLI.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { AASHRAY_DB, RPL_DB } from '../apps/api/src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputSqlFile = path.join(__dirname, '../sync_rpl_to_prod_aashray.sql');

function escapeSqlVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${str}'`;
}

async function syncAashrayData() {
  console.log('🔄 [RPL SYNC] Reading RPL records from Dev database (Aiven Cloud)...');

  try {
    // 1. Fetch non-test RPL Guest Cards
    const [cards] = await db.query(`
      SELECT 
        cardno, issuedto, gender, DATE_FORMAT(dob, '%Y-%m-%d') as dob, 
        mobno, email, center, pfp, password, status, res_status, 
        active, updatedBy, createdAt, updatedAt
      FROM ${AASHRAY_DB}.card_db
      WHERE (updatedBy IN ('RPL_SYSTEM', 'RPL_REGISTRATION') OR issuedto LIKE 'RPL-%')
        AND mobno NOT LIKE '989900%'
        AND issuedto NOT LIKE '%Test%'
        AND issuedto NOT LIKE '%Draft%'
      ORDER BY cardno ASC
    `);

    console.log(`📋 Found ${cards.length} RPL Guest Card(s) to sync.`);

    // 2. Fetch RPL Guest Relationships
    const [relationships] = await db.query(`
      SELECT cardno, guest, type, updatedBy, createdAt, updatedAt
      FROM ${AASHRAY_DB}.guest_relationship
      WHERE updatedBy = 'RPL_SYSTEM'
      ORDER BY id ASC
    `);

    console.log(`🤝 Found ${relationships.length} Host-Guest Relationship(s) to sync.`);

    // 3. Fetch Active RPL Room Bookings for Tournament
    const [bookings] = await db.query(`
      SELECT 
        bookingid, cardno, bookedBy, roomno, 
        DATE_FORMAT(checkin, '%Y-%m-%d') as checkin, 
        DATE_FORMAT(checkout, '%Y-%m-%d') as checkout, 
        nights, roomtype, status, gender, updatedBy, createdAt, updatedAt
      FROM ${AASHRAY_DB}.room_booking
      WHERE (checkin >= '2026-12-20' AND checkout <= '2026-12-31')
        AND updatedBy IN ('RPL_TEAM', 'RPL_APP')
        AND status != 'cancelled'
      ORDER BY checkin ASC, cardno ASC
    `);

    console.log(`🏨 Found ${bookings.length} Tournament Room Booking(s) to sync.`);

    // 4. Construct Consolidated SQL script
    const sqlChunks = [];
    sqlChunks.push('-- =================================================================');
    sqlChunks.push(`-- RPL -> AASHRAY PROD DATABASE SYNC SCRIPT`);
    sqlChunks.push(`-- Generated At: ${new Date().toISOString()}`);
    sqlChunks.push(`-- Contains: ${cards.length} Cards, ${relationships.length} Relationships, ${bookings.length} Room Bookings`);
    sqlChunks.push('-- =================================================================\n');
    sqlChunks.push('USE aashray;\n');

    // A. Sync Cards
    if (cards.length > 0) {
      sqlChunks.push('-- 1. SYNC RPL GUEST CARDS (card_db)');
      for (const c of cards) {
        sqlChunks.push(`INSERT INTO aashray.card_db 
  (cardno, issuedto, gender, dob, mobno, email, center, pfp, password, status, res_status, active, updatedBy, createdAt, updatedAt)
VALUES (
  ${escapeSqlVal(c.cardno)}, ${escapeSqlVal(c.issuedto)}, ${escapeSqlVal(c.gender)}, ${escapeSqlVal(c.dob)},
  ${escapeSqlVal(c.mobno)}, ${escapeSqlVal(c.email)}, ${escapeSqlVal(c.center)}, ${escapeSqlVal(c.pfp)},
  ${escapeSqlVal(c.password)}, ${escapeSqlVal(c.status)}, ${escapeSqlVal(c.res_status)}, ${escapeSqlVal(c.active)},
  ${escapeSqlVal(c.updatedBy)}, ${escapeSqlVal(c.createdAt)}, ${escapeSqlVal(c.updatedAt)}
)
ON DUPLICATE KEY UPDATE 
  issuedto = VALUES(issuedto),
  gender = VALUES(gender),
  dob = VALUES(dob),
  mobno = VALUES(mobno),
  email = VALUES(email),
  center = VALUES(center),
  pfp = VALUES(pfp),
  updatedAt = VALUES(updatedAt);`);
      }
      sqlChunks.push('');
    }

    // B. Sync Relationships
    if (relationships.length > 0) {
      sqlChunks.push('-- 2. SYNC GUEST RELATIONSHIPS (guest_relationship)');
      for (const r of relationships) {
        sqlChunks.push(`INSERT INTO aashray.guest_relationship 
  (cardno, guest, type, updatedBy, createdAt, updatedAt)
VALUES (
  ${escapeSqlVal(r.cardno)}, ${escapeSqlVal(r.guest)}, ${escapeSqlVal(r.type)},
  ${escapeSqlVal(r.updatedBy)}, ${escapeSqlVal(r.createdAt)}, ${escapeSqlVal(r.updatedAt)}
)
ON DUPLICATE KEY UPDATE 
  type = VALUES(type),
  updatedAt = VALUES(updatedAt);`);
      }
      sqlChunks.push('');
    }

    // C. Sync Room Bookings
    if (bookings.length > 0) {
      sqlChunks.push('-- 3. SYNC TOURNAMENT ROOM BOOKINGS (room_booking)');
      for (const b of bookings) {
        // Enforce valid roomno 'NA' if unassigned
        const cleanRoom = (!b.roomno || b.roomno === 'UNASSIGNED' || b.roomno === 'RPL_UNASSIGNED') ? 'NA' : b.roomno;
        sqlChunks.push(`INSERT INTO aashray.room_booking 
  (bookingid, cardno, bookedBy, roomno, checkin, checkout, nights, roomtype, status, gender, updatedBy, createdAt, updatedAt)
VALUES (
  ${escapeSqlVal(b.bookingid)}, ${escapeSqlVal(b.cardno)}, ${escapeSqlVal(b.bookedBy)}, ${escapeSqlVal(cleanRoom)},
  ${escapeSqlVal(b.checkin)}, ${escapeSqlVal(b.checkout)}, ${escapeSqlVal(b.nights)}, ${escapeSqlVal(b.roomtype)},
  ${escapeSqlVal(b.status)}, ${escapeSqlVal(b.gender)}, ${escapeSqlVal(b.updatedBy)},
  ${escapeSqlVal(b.createdAt)}, ${escapeSqlVal(b.updatedAt)}
)
ON DUPLICATE KEY UPDATE 
  roomno = VALUES(roomno),
  checkin = VALUES(checkin),
  checkout = VALUES(checkout),
  nights = VALUES(nights),
  status = VALUES(status),
  updatedAt = VALUES(updatedAt);`);
      }
      sqlChunks.push('');
    }

    fs.writeFileSync(outputSqlFile, sqlChunks.join('\n'), 'utf8');

    console.log(`\n✅ [RPL SYNC SUCCESS] SQL sync file generated successfully!`);
    console.log(`📁 File Path: ${outputSqlFile}`);
    console.log(`\n📌 How to apply:`);
    console.log(`  1. Open Beekeeper Studio (connected to 'AASHRAY AWS').`);
    console.log(`  2. Paste the contents of '${path.basename(outputSqlFile)}'.`);
    console.log(`  3. Click 'Run' to apply updates to Prod.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ [RPL SYNC ERROR] Failed to generate sync SQL:', error);
    process.exit(1);
  }
}

syncAashrayData();
