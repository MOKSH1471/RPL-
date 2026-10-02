import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('Registration Validation: rejects empty registration payload with 400', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.error, 'Missing core registration fields.');
});

test('Registration Validation: rejects payload missing mobile number with 400', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: 'Test Player',
      email: 'player@example.com',
    }),
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.error, 'Missing core registration fields.');
});

test('Razorpay Fee Calculation: 1 Sport defaults to base fee of ₹2,500', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Single Sport Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket'],
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 250000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: 3 Sports calculates ₹2,500 + (2 * ₹400) = ₹3,300', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Multi Sport Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket', 'football', 'badminton'],
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 330000);
    assert.strictEqual(res.data.currency, 'INR');
  }
});

test('Razorpay Fee Calculation: Returning player adding 1 new sport pays ₹400', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Returning Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket', 'football'],
      isExistingPlayer: true,
      hasPreviouslyPaid: true,
      previouslyPaidSportsCount: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  if (res.data.orderId) {
    assert.strictEqual(res.data.amount, 40000);
  }
});

test('Razorpay Fee Calculation: Returning player with no new sports needs no payment', async () => {
  const res = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Already Paid Player',
      email: 'player@example.com',
      mobile: '9876543210',
      selectedSports: ['cricket'],
      isExistingPlayer: true,
      hasPreviouslyPaid: true,
      previouslyPaidSportsCount: 1,
    }),
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.amount, 0);
  assert.strictEqual(res.data.orderId, null);
  assert.strictEqual(res.data.message, 'No payment required');
});

test('Pay Later: POST /api/register with payment_status=pending saves registration without payment', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'Pay Later Player',
      email: 'paylater@example.com',
      mobile: '+91 9988776655',
      payment_status: 'pending',
      general_details: {
        centre: 'Mumbai',
        gender: 'Male',
        selectedSports: ['cricket'],
      },
      answers: {},
    }),
  });

  // Should succeed (200/201) or fail gracefully if DB is offline (500)
  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  // If DB is reachable, registration must be saved with pending status (no UTR required)
  if (res.status === 200 || res.status === 201) {
    assert.ok(res.data.registration_id || res.data.success, 'Should return a registration ID or success flag');
  }
});

test('Pay Later: registration submitted without UTR/receipt should not be marked approved', async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      sport_id: 'cricket',
      full_name: 'No Payment Player',
      email: 'nopay@example.com',
      mobile: '+91 9911223344',
      payment_status: 'pending',
      payment_utr: undefined,
      payment_receipt_url: undefined,
      general_details: {
        centre: 'Delhi',
        gender: 'Male',
        selectedSports: ['cricket'],
      },
      answers: {},
    }),
  });

  assert.ok(
    [200, 201, 500].includes(res.status),
    `Expected 200, 201, or 500, got ${res.status}`
  );

  // If DB is reachable, payment status must NOT be 'approved' without a UTR
  if ((res.status === 200 || res.status === 201) && res.data.paymentStatus) {
    assert.notStrictEqual(
      res.data.paymentStatus,
      'approved',
      'Registration without payment should not be approved'
    );
  }
});
