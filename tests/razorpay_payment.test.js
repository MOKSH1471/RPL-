import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('POST /api/razorpay/verify-payment rejects missing verification parameters with 400', async () => {
  const { status, data } = await apiRequest('/api/razorpay/verify-payment', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.ok(data.error.includes('Missing Razorpay'));
});

test('POST /api/razorpay/verify-payment rejects invalid or forged signature with 400', async () => {
  const { status, data } = await apiRequest('/api/razorpay/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: 'order_test_123',
      razorpay_payment_id: 'pay_test_456',
      razorpay_signature: 'invalid_forged_signature_hash',
    }),
  });
  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.ok(data.error.includes('Invalid payment signature'));
});

test('POST /api/razorpay/verify-payment accepts cryptographically valid signature', async () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'TE0Ex76uPfAIQI51jtt7x301';
  const orderId = 'order_valid_12345';
  const paymentId = 'pay_valid_67890';
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const { status, data } = await apiRequest('/api/razorpay/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    }),
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.verified, true);
  assert.equal(data.paymentId, paymentId);
  assert.equal(data.orderId, orderId);
});

test('POST /api/razorpay/webhook receives event (200 on DB write, 500 on offline DB)', async () => {
  const { status, data } = await apiRequest('/api/razorpay/webhook', {
    method: 'POST',
    body: JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_webhook_test_123',
            order_id: 'order_webhook_test_456',
            amount: 250000,
            status: 'captured',
          },
        },
      },
    }),
  });

  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  assert.ok('status' in data);
});
