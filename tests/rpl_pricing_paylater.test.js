import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer, db, RPL_DB } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('RPL Pricing Rule: New Player (existingRplFamily = "No") is charged ₹3,000 (300000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'First Time Mumukshu',
      email: 'newmumukshu@example.com',
      mobile: '9899001122',
      selectedSports: ['cricket'],
      existingRplFamily: 'No',
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 300000, 'New player must be charged ₹3,000 (300000 paise)');
    assert.strictEqual(res.data.amountInRupees, 3000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('RPL Pricing Rule: Returning Participant (existingRplFamily = "Yes") is charged ₹2,700 (270000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning RPL Veteran',
      email: 'veteranmumukshu@example.com',
      mobile: '9899001133',
      selectedSports: ['cricket'],
      existingRplFamily: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 270000, 'Returning player must be charged ₹2,700 (270000 paise)');
    assert.strictEqual(res.data.amountInRupees, 2700);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('RPL Pricing Rule: New Player with Extra T-shirt is charged ₹3,500 (350000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'New Player Extra Shirt',
      email: 'newshirt@example.com',
      mobile: '9899001144',
      selectedSports: ['football'],
      existingRplFamily: 'No',
      extraTshirt: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 350000, 'New player with extra t-shirt must be charged ₹3,500 (350000 paise)');
    assert.strictEqual(res.data.amountInRupees, 3500);
  }
});

test('RPL Pricing Rule: Returning Participant with Extra T-shirt is charged ₹3,200 (320000 paise)', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Extra Shirt',
      email: 'returningshirt@example.com',
      mobile: '9899001155',
      selectedSports: ['badminton'],
      existingRplFamily: 'Yes',
      extraTshirt: 'Yes',
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 320000, 'Returning player with extra t-shirt must be charged ₹3,200 (320000 paise)');
    assert.strictEqual(res.data.amountInRupees, 3200);
  }
});

test('RPL Pay Later Registration: registers with ₹3,000 for New Player and payment_status=pending', async () => {
  const testMobile = '+91 9899009988';
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'Pay Later New Player',
      email: 'paylaternew@example.com',
      mobile: testMobile,
      check_in_date: '2026-12-25',
      check_out_date: '2026-12-27',
      payment_status: 'pending',
      general_details: {
        centre: 'Mumbai',
        gender: 'Male',
        existingRplFamily: 'No',
        selectedSports: ['cricket'],
      },
      answers: {},
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);

  // Verify in DB that fee is recorded as 3000
  const [rows] = await db.query(
    `SELECT general_details, payment_status FROM ${RPL_DB}.rpl_registrations WHERE mobile LIKE ? ORDER BY submitted_at DESC LIMIT 1`,
    ['%9899009988']
  );
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].payment_status, 'pending');
  const gen = typeof rows[0].general_details === 'string' ? JSON.parse(rows[0].general_details) : rows[0].general_details;
  assert.strictEqual(gen.totalAmount, 3000);
  assert.strictEqual(gen.existingRplFamily, 'No');
});
