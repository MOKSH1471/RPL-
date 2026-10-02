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
