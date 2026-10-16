import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer, db, RPL_DB } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('Comments Feature: Saves comments in general_details during registration and verifies in DB, Lookup & Admin API', async () => {
  const testMobile = '9999988888';
  const testComment = 'Room near ground floor requested. Vegetarian food preference.';

  // 1. Submit Registration with comments in general_details
  const regRes = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'Comment Test Athlete',
      email: 'comment_test@example.com',
      mobile: `+91 ${testMobile}`,
      check_in_date: '2026-12-25',
      check_out_date: '2026-12-27',
      payment_status: 'pending',
      general_details: {
        centre: 'Mumbai',
        gender: 'Male',
        dateOfBirth: '1995-05-15',
        tshirtSize: 'XL',
        accommodationRequired: 'Yes',
        foodPreference: 'Regular',
        selectedSports: ['cricket'],
        comments: testComment,
        additionalNotes: testComment,
      },
      answers: {
        comments: testComment,
        additionalNotes: testComment,
      },
    }),
  });

  assert.strictEqual(regRes.status, 200);
  assert.ok(regRes.data.success);
  const regId = regRes.data.registration_id || regRes.data.id;
  assert.ok(regId, 'Registration ID must be present');

  // 2. Verify directly from MySQL database that general_details contains comments
  const [rows] = await db.query(
    `SELECT id, full_name, mobile, general_details FROM ${RPL_DB}.rpl_registrations WHERE mobile = ? OR mobile LIKE ?`,
    [testMobile, `%${testMobile}%`]
  );

  assert.ok(rows.length > 0, 'Database must have saved the registration');
  const savedRow = rows[0];
  const savedGen = typeof savedRow.general_details === 'string'
    ? JSON.parse(savedRow.general_details)
    : savedRow.general_details;

  assert.strictEqual(savedGen.comments, testComment, 'Comments must match in database general_details');
  assert.strictEqual(savedGen.additionalNotes, testComment, 'additionalNotes must match in database general_details');

  // 3. Verify Player Lookup API returns comments in general_details
  const lookupRes = await apiRequest(`/api/player-lookup?mobile=${testMobile}`);
  assert.strictEqual(lookupRes.status, 200);
  assert.ok(lookupRes.data.found, 'Player must be found by mobile');

  const lookupGen = lookupRes.data.registration?.generalDetails || lookupRes.data.registration?.general_details || lookupRes.data.general_details || {};
  assert.strictEqual(lookupGen.comments, testComment, 'Player lookup must return comments in general_details');
  assert.strictEqual(lookupGen.additionalNotes, testComment, 'Player lookup must return additionalNotes in general_details');

  // 4. Verify Admin Registrations API returns the player with comments intact
  const adminRes = await apiRequest('/api/admin/registrations');
  assert.strictEqual(adminRes.status, 200);
  const regList = Array.isArray(adminRes.data?.data) ? adminRes.data.data : (adminRes.data?.registrations || adminRes.data || []);
  const adminPlayer = regList.find(
    (p) => p.mobile && p.mobile.includes(testMobile)
  );

  assert.ok(adminPlayer, 'Admin registrations list must contain the test player');
  const adminGen = adminPlayer.general_details || {};
  assert.strictEqual(adminGen.comments, testComment, 'Admin endpoint must return comments in general_details');
  assert.strictEqual(adminGen.additionalNotes, testComment, 'Admin endpoint must return additionalNotes in general_details');

  // 5. Verify Admin Update can edit comments and persist them
  const updatedComment = 'Updated: Ground floor room confirmed by coordinator.';
  const updateRes = await apiRequest(`/api/admin/registrations/${savedRow.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      general_details: {
        ...adminGen,
        comments: updatedComment,
        additionalNotes: updatedComment,
      },
    }),
  });

  assert.strictEqual(updateRes.status, 200);

  // 6. Verify updated comments in database
  const [updatedRows] = await db.query(
    `SELECT general_details FROM ${RPL_DB}.rpl_registrations WHERE id = ?`,
    [savedRow.id]
  );
  const updatedGen = typeof updatedRows[0].general_details === 'string'
    ? JSON.parse(updatedRows[0].general_details)
    : updatedRows[0].general_details;

  assert.strictEqual(updatedGen.comments, updatedComment, 'Updated comments must be persisted in general_details');

  // Cleanup: Delete the test registration
  await db.query(`DELETE FROM ${RPL_DB}.rpl_registrations WHERE id = ?`, [savedRow.id]);
});
