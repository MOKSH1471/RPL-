/**
 * guestCardService.js
 *
 * Auto-creates an Aashray card_db entry for RPL players who are not
 * existing Mumukshus. This gives them a proper Aashray identity so they can:
 *   1. Log into the Aashray App using their mobile number
 *   2. Book pre/post RPL stay themselves (before Dec 25 / after Dec 27)
 *   3. Appear correctly in room booking with gender, DOB, photo
 *
 * Card defaults:
 *   - status       = 'offprem'   (off-premises / external)
 *   - res_status   = 'GUEST'     (guest, not a resident mumukshu)
 *   - active       = 1
 *   - password     = bcrypt('vitraag', 10)   ← same as Aashray new registrees
 *   - issuedto     = 'RPL-<fullName>'        ← prefixed for easy identification
 */

import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { cleanDomesticPhone } from '../utils/phoneFormatter.js';
import logger from '../config/logger.js';

const AASHRAY_DB = process.env.AASHRAY_DB || 'aashray';
const DEFAULT_PASSWORD = 'vitraag';

// Pre-compute the hash once at module load (avoids re-hashing on every call)
let _cachedHash = null;
async function getDefaultPasswordHash() {
  if (!_cachedHash) {
    _cachedHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  }
  return _cachedHash;
}

/**
 * Ensures a card_db entry exists for a non-mumukshu RPL player.
 * Supports executing inside an atomic database transaction via optional `connection`.
 *
 * @param {Object} params
 * @param {string} params.fullName
 * @param {string} params.mobile        - mobile number
 * @param {string} params.email
 * @param {string} params.gender        - 'Male' | 'Female' | 'Other'
 * @param {string} params.dob           - YYYY-MM-DD
 * @param {string} params.centre
 * @param {string} [params.photoUrl]    - optional player photo URL
 * @param {string} [params.referrerCardNo] - referrer mumukshu's cardNo (host for guest_relationship)
 * @param {Object} [params.connection]  - optional MySQL connection for atomic transaction
 * @returns {Promise<string|null>}      - The 10-digit cardNo, or null on failure
 */
export async function ensureGuestCard({ fullName, mobile, email, gender, dob, centre, photoUrl, referrerCardNo, connection = null }) {
  const q = connection || db;
  try {
    const mobile10 = cleanDomesticPhone(mobile);
    if (!mobile10 || mobile10.length < 10) return null;

    // 1. Check if card already exists for this mobile number
    const [existing] = await q.query(
      `SELECT cardno FROM ${AASHRAY_DB}.card_db WHERE mobno = ? OR mobno = ? LIMIT 1`,
      [mobile10, Number(mobile10)]
    );

    if (existing.length > 0 && existing[0].cardno) {
      const existingCardNo = String(existing[0].cardno);
      logger.info(`[GUEST CARD] Existing Aashray card found for mobile ${mobile10}: ${existingCardNo}`);
      return existingCardNo;
    }

    // 2. Generate next available cardno (MAX numeric cardno + 1, padded to 10 digits)
    const [maxResult] = await q.query(
      `SELECT MAX(CAST(cardno AS UNSIGNED)) as max_cardno 
       FROM ${AASHRAY_DB}.card_db 
       WHERE cardno REGEXP '^[0-9]+$'`
    );
    const nextCardNo = String((Number(maxResult[0]?.max_cardno) || 0) + 1).padStart(10, '0');

    // 3. Map gender: 'Female' → 'F', everything else → 'M'
    const genderChar = gender === 'Female' ? 'F' : 'M';

    // 4. Hash the default password
    const passwordHash = await getDefaultPasswordHash();

    // 5. Insert into Aashray card_db
    await q.query(
      `INSERT INTO ${AASHRAY_DB}.card_db 
       (cardno, issuedto, gender, dob, mobno, email, center, pfp,
        password, status, res_status, active, updatedBy, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'offprem', 'GUEST', 1, 'RPL_SYSTEM', NOW(), NOW())`,
      [
        nextCardNo,
        `RPL-${String(fullName || '').trim().slice(0, 48)}`,
        genderChar,
        dob || null,
        mobile10,
        (email || '').trim().slice(0, 100),
        (centre || 'Mumbai').slice(0, 50),
        photoUrl || null,
        passwordHash,
      ]
    );

    logger.info(
      `[GUEST CARD CREATED] cardNo=${nextCardNo} | name="${fullName}" | mobile=${mobile10} | gender=${genderChar} | centre=${centre}`
    );

    // 6. Create guest_relationship: referrer (host) → new RPL player (guest), type='friend'
    const hostCardNo = referrerCardNo || null;
    if (hostCardNo) {
      try {
        await q.query(
          `INSERT INTO ${AASHRAY_DB}.guest_relationship 
           (cardno, guest, type, updatedBy, createdAt, updatedAt)
           VALUES (?, ?, 'friend', 'RPL_SYSTEM', NOW(), NOW())`,
          [hostCardNo, nextCardNo]
        );
        logger.info(`[GUEST RELATIONSHIP] ${hostCardNo} → ${nextCardNo} (friend)`);
      } catch (relErr) {
        logger.warn(`[GUEST RELATIONSHIP WARNING] Could not create relationship: ${relErr.message}`);
      }
    } else {
      logger.info(`[GUEST RELATIONSHIP] No referrerCardNo provided for ${nextCardNo} — skipping relationship entry`);
    }

    return nextCardNo;

  } catch (err) {
    logger.warn(`[GUEST CARD WARNING] Could not create/find guest card for mobile ${mobile}: ${err.message}`);
    return null;
  }
}

export default { ensureGuestCard };
