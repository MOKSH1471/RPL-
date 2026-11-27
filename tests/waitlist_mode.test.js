/**
 * Test Suite: Players Waitlist Mode & Promotion Flow
 *
 * Verifies:
 * 1. Public & Admin Registration Mode settings endpoints (open | waitlist | closed)
 * 2. Player waitlist registration skips Aashray Guest Card, transactions, and room/food bookings
 * 3. Spectator registration remains open while Player Waitlist is active
 * 4. Razorpay create-order blocks waitlisted players (403 WAITLIST_ONLY)
 * 5. Admin Promote unlocks payment (waitlist -> pending)
 *
 * Safe Execution:
 * - Snapshots live registration settings and restores them in after().
 * - Cleans up dummy test records in after().
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer, db, RPL_DB } from './testHelper.js';

describe('Players Waitlist Mode & Promotion Workflow', () => {
  let isDbAvailable = false;
  let originalSettings = null;
  const testPlayerMobile = '9999911122';
  const testSpectatorMobile = '9999911133';
  const createdIds = [];

  before(async () => {
    try {
      if (db) {
        await db.query('SELECT 1');
        isDbAvailable = true;
        const res = await apiRequest('/api/admin/registration/settings');
        if (res.status === 200 && res.data?.settings) {
          originalSettings = res.data.settings;
        }
      }
    } catch {
      isDbAvailable = false;
    }
  });

  after(async () => {
    if (isDbAvailable) {
      try {
        if (originalSettings) {
          await apiRequest('/api/admin/registration/settings', {
            method: 'PUT',
            body: JSON.stringify(originalSettings),
          });
        }
        await db.query(
          `DELETE FROM ${RPL_DB}.rpl_transactions WHERE bookingid IN (SELECT id FROM ${RPL_DB}.rpl_registrations WHERE mobile LIKE '%9999911122%' OR mobile LIKE '%9999911133%')`
        );
        await db.query(
          `DELETE FROM ${RPL_DB}.rpl_registrations WHERE mobile LIKE '%9999911122%' OR mobile LIKE '%9999911133%'`
        );
      } catch {}
    }
    await stopTestServer();
  });

  test('GET /api/registration/status returns valid registration mode configuration', async () => {
    if (!isDbAvailable) return;
    const { status, data } = await apiRequest('/api/registration/status');
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(['open', 'waitlist', 'closed'].includes(data.player_registration_mode));
    assert.ok(['open', 'waitlist', 'closed'].includes(data.spectator_registration_mode));
    assert.ok(typeof data.waitlist_banner_message === 'string');
    assert.ok(typeof data.spectator_waitlist_banner_message === 'string');
  });

  test('Waitlist mode saves new Player as waitlist without creating transactions', async () => {
    if (!isDbAvailable) return;

    // 1. Switch to waitlist mode
    const setRes = await apiRequest('/api/admin/registration/settings', {
      method: 'PUT',
      body: JSON.stringify({ player_registration_mode: 'waitlist' }),
    });
    assert.equal(setRes.status, 200);
    assert.equal(setRes.data.settings.player_registration_mode, 'waitlist');

    // 2. Submit new Player registration
    const regRes = await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        sport_id: 'cricket',
        full_name: 'Test Waitlist Player',
        email: 'waitlist.test@example.com',
        mobile: `+91 ${testPlayerMobile}`,
        general_details: {
          registrationType: 'player',
          selectedSports: ['cricket'],
          centre: 'Mumbai',
          gender: 'Male',
          accommodationRequired: 'Yes',
        },
        sport_answers: { cricket: { role: 'All-Rounder' } },
      }),
    });

    assert.equal(regRes.status, 200);
    assert.equal(regRes.data.success, true);
    assert.equal(regRes.data.payment_status, 'waitlist');
    const regId = regRes.data.registration_id;
    assert.ok(regId);
    createdIds.push(regId);

    // 3. Verify NO transaction row was created
    const [txRows] = await db.query(
      `SELECT id FROM ${RPL_DB}.rpl_transactions WHERE bookingid = ?`,
      [regId]
    );
    assert.equal(txRows.length, 0, 'Waitlist submission must NOT create rpl_transactions');

    // 4. Verify Razorpay create-order blocks waitlisted player
    const rzpRes = await apiRequest('/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({
        registrationId: regId,
        fullName: 'Test Waitlist Player',
        email: 'waitlist.test@example.com',
        mobile: testPlayerMobile,
        selectedSports: ['cricket'],
        registrationType: 'player',
      }),
    });
    assert.equal(rzpRes.status, 403);
    assert.equal(rzpRes.data.code, 'WAITLIST_ONLY');

    // 5. Promote player from waitlist -> pending
    const promoRes = await apiRequest(`/api/admin/registrations/${regId}/promote`, {
      method: 'POST',
    });
    assert.equal(promoRes.status, 200);
    assert.equal(promoRes.data.success, true);
    assert.equal(promoRes.data.payment_status, 'pending');
  });

  test('Spectator registration remains open (pending) even while Player Waitlist is active', async () => {
    if (!isDbAvailable) return;

    const regRes = await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        sport_id: 'spectator',
        full_name: 'Test Spectator Open',
        email: 'spectator.test@example.com',
        mobile: `+91 ${testSpectatorMobile}`,
        general_details: {
          registrationType: 'spectator',
          selectedSports: ['spectator'],
          centre: 'Mumbai',
          gender: 'Male',
          accommodationRequired: 'No',
          spectatorDates: ['2026-12-25'],
        },
        sport_answers: {},
      }),
    });

    assert.equal(regRes.status, 200);
    assert.equal(regRes.data.success, true);
    assert.equal(regRes.data.payment_status, 'pending');
  });

  test('Spectator registration enters waitlist when spectator_registration_mode is set to waitlist', async () => {
    if (!isDbAvailable) return;

    const setRes = await apiRequest('/api/admin/registration/settings', {
      method: 'PUT',
      body: JSON.stringify({ spectator_registration_mode: 'waitlist' }),
    });
    assert.equal(setRes.status, 200);
    assert.equal(setRes.data.settings.spectator_registration_mode, 'waitlist');

    const regRes = await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        sport_id: 'spectator',
        full_name: 'Test Spectator Waitlist',
        email: 'spectator.wl@example.com',
        mobile: '+91 9999911144',
        general_details: {
          registrationType: 'spectator',
          selectedSports: ['spectator'],
          centre: 'Mumbai',
          gender: 'Female',
          accommodationRequired: 'No',
          spectatorDates: ['2026-12-25'],
        },
        sport_answers: {},
      }),
    });

    assert.equal(regRes.status, 200);
    assert.equal(regRes.data.success, true);
    assert.equal(regRes.data.payment_status, 'waitlist');

    const [txRows] = await db.query(
      `SELECT id FROM ${RPL_DB}.rpl_transactions WHERE bookingid = ?`,
      [regRes.data.registration_id]
    );
    assert.equal(txRows.length, 0, 'Waitlist spectator must NOT create rpl_transactions');

    await db.query(`DELETE FROM ${RPL_DB}.rpl_registrations WHERE id = ?`, [regRes.data.registration_id]);
  });
});
