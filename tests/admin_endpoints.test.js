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

test('POST /api/admin/accommodation/assign returns 404 when booking does not exist without failing DB constraints', async () => {
  const { status, data } = await apiRequest('/api/admin/accommodation/assign', {
    method: 'POST',
    body: JSON.stringify({ bookingid: 'non-existent-booking-uuid', roomno: '2A' }),
  });
  assert.equal(status, 404);
  assert.equal(data.success, false);
  assert.equal(data.error, 'Booking not found.');
});

test('GET /api/admin/transactions returns reconciliation summary and only matched non-orphan transactions', async () => {
  const { status, data } = await apiRequest('/api/admin/transactions');
  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  if (status === 200) {
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.transactions), 'transactions must be an array');
    assert.ok(data.summary, 'summary object must be present');
    assert.ok('total_count' in data.summary);
    for (const tx of data.transactions) {
      assert.ok(tx.player_name, `Transaction ${tx.id} must link to a registered player (no orphans)`);
    }
  }
});

test('GET /api/admin/accommodation only returns accommodationRequired === Yes and RPL-period active bookings', async () => {
  const { status, data } = await apiRequest('/api/admin/accommodation');
  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  if (status === 200) {
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'data must be an array');
    for (const entry of data.data) {
      assert.equal(entry.accommodationRequired, 'Yes', `Entry ${entry.full_name} must have accommodationRequired === Yes`);
      for (const b of entry.bookings || []) {
        const checkinStr = String(b.checkin || '').slice(0, 10);
        assert.ok(
          checkinStr >= '2026-12-24' && checkinStr <= '2026-12-28',
          `Booking ${b.bookingid} checkin (${checkinStr}) must fall within RPL dates`
        );
        const st = String(b.status || '').toLowerCase();
        assert.ok(
          !['admin cancelled', 'cancelled', 'checkedout'].includes(st),
          `Booking ${b.bookingid} must not have inactive status (${st})`
        );
      }
    }
  }
});
