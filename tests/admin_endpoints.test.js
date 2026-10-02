import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('GET /api/admin/stats responds with structured statistics object or DB error', async () => {
  const { status, data } = await apiRequest('/api/admin/stats');
  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  if (status === 200) {
    assert.equal(data.success, true);
    assert.ok('stats' in data, 'Stats object must be returned');
    assert.ok('totalRegistrations' in data.stats);
    assert.ok('payment' in data.stats);
    assert.ok('financials' in data.stats, 'financials must be in stats');
    assert.ok('totalRevenue' in data.stats.financials);
    assert.ok('pendingRevenue' in data.stats.financials);
  } else {
    assert.equal(data.success, false);
    assert.ok('error' in data);
  }
});

test('POST /api/admin/registrations/:id/payment rejects invalid status string', async () => {
  const { status, data } = await apiRequest('/api/admin/registrations/test-id/payment', {
    method: 'POST',
    body: JSON.stringify({ status: 'invalid_status_value' }),
  });
  assert.equal(status, 400);
  assert.ok(data.error.includes('Invalid payment status'));
});

test('POST /api/admin/accommodation/assign validates bookingid and roomno', async () => {
  const { status, data } = await apiRequest('/api/admin/accommodation/assign', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert.equal(status, 400);
  assert.equal(data.success, false);
});
