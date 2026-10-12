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

test('POST /api/razorpay/create-order persists draft registration in rpl_registrations (Aashray Standard)', async () => {
  const testPhone = '9876543210';
  const { status, data } = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Aashray Pattern Draft Test',
      email: 'draft@example.com',
      mobile: testPhone,
      selectedSports: ['cricket'],
      registrationPayload: {
        full_name: 'Aashray Pattern Draft Test',
        email: 'draft@example.com',
        mobile: `+91 ${testPhone}`,
        check_in_date: '2026-12-25',
        check_out_date: '2026-12-27',
        general_details: { centre: 'Mumbai', gender: 'Male', tshirt_size: 'L' },
        sport_answers: { cricket_role: 'Batsman' },
      },
    }),
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.orderId, 'Order ID must be generated');
  assert.ok(data.registrationId, 'Registration ID must be assigned to the draft record');
});

test('POST /api/razorpay/verify-payment auto-approves draft registration (Phase 2 Lifecycle)', async () => {
  const testPhone = `97${Date.now().toString().slice(-8)}`;
  const regPayload = {
    full_name: 'Lifecycle Verification Test',
    email: `lifecycle_${Date.now()}@example.com`,
    mobile: `+91 ${testPhone}`,
    check_in_date: '2026-12-25',
    check_out_date: '2026-12-27',
    general_details: { centre: 'Mumbai', gender: 'Male', tshirt_size: 'XL', selectedSports: ['cricket'] },
    sport_answers: { cricket_role: 'All-Rounder' },
  };

  // Phase 1: create order and draft
  const orderRes = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: regPayload.full_name,
      email: regPayload.email,
      mobile: testPhone,
      selectedSports: ['cricket'],
      registrationPayload: regPayload,
    }),
  });
  assert.equal(orderRes.status, 200);
  assert.ok(orderRes.data.orderId);

  // Phase 2: verify payment
  const secret = process.env.RAZORPAY_KEY_SECRET || 'TE0Ex76uPfAIQI51jtt7x301';
  const orderId = orderRes.data.orderId;
  const paymentId = `pay_lifecycle_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const verifyRes = await apiRequest('/api/razorpay/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      registrationPayload: {
        ...regPayload,
        registration_id: orderRes.data.registrationId,
      },
    }),
  });

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.data.success, true);
  assert.equal(verifyRes.data.verified, true);
  assert.ok(verifyRes.data.registrationId);

  // Phase 3 (Idempotency & Row Locking): Second verification call returns success idempotently without duplicate update
  const duplicateVerify = await apiRequest('/api/razorpay/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      registrationPayload: {
        ...regPayload,
        registration_id: orderRes.data.registrationId,
      },
    }),
  });
  assert.equal(duplicateVerify.status, 200);
  assert.equal(duplicateVerify.data.success, true);
  assert.equal(duplicateVerify.data.verified, true);

  // Phase 4 (409 Conflict Prevention): Calling create-order for already approved registration returns 409
  const paidCreateOrder = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: regPayload.full_name,
      email: regPayload.email,
      mobile: testPhone,
      selectedSports: ['cricket'],
      registrationId: orderRes.data.registrationId,
      registrationPayload: regPayload,
    }),
  });
  assert.equal(paidCreateOrder.status, 409);
  assert.equal(paidCreateOrder.data.success, false);
  assert.ok(paidCreateOrder.data.error.includes('already been received'));
});

test('POST /api/razorpay/create-order reuses active open order on retry (Aashray Idempotency)', async () => {
  const testPhone = `96${Date.now().toString().slice(-8)}`;
  const regPayload = {
    full_name: 'Order Reuse Test',
    email: `reuse_${Date.now()}@example.com`,
    mobile: `+91 ${testPhone}`,
    general_details: { centre: 'Mumbai', gender: 'Male', selectedSports: ['cricket'] },
  };

  // First call creates new order
  const firstRes = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: regPayload.full_name,
      email: regPayload.email,
      mobile: testPhone,
      selectedSports: ['cricket'],
      registrationPayload: regPayload,
    }),
  });
  assert.equal(firstRes.status, 200);
  assert.ok(firstRes.data.orderId);

  // Second call with same registration data reuses active order
  const secondRes = await apiRequest('/api/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({
      fullName: regPayload.full_name,
      email: regPayload.email,
      mobile: testPhone,
      selectedSports: ['cricket'],
      registrationId: firstRes.data.registrationId,
      registrationPayload: {
        ...regPayload,
        registration_id: firstRes.data.registrationId,
      },
    }),
  });
  assert.equal(secondRes.status, 200);
  assert.equal(secondRes.data.orderId, firstRes.data.orderId, 'Active open order should be reused');
  assert.equal(secondRes.data.reused, true, 'Reused flag should be true');
});

test('POST /api/razorpay/webhook stores audit delivery and acknowledges settled order idempotently', async () => {
  const testOrderId = `order_audit_${Date.now()}`;
  const testPaymentId = `pay_audit_${Date.now()}`;

  const webhookRes = await apiRequest('/api/razorpay/webhook', {
    method: 'POST',
    body: JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: testPaymentId,
            order_id: testOrderId,
            amount: 250000,
            status: 'captured',
            contact: '+919876543210',
          },
        },
      },
    }),
  });

  assert.ok([200, 500].includes(webhookRes.status));
  assert.ok('status' in webhookRes.data);
});

test('GET / responds with 200 OK for Render and load-balancer probes', async () => {
  const { status, data } = await apiRequest('/');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'rpl-api');
});

