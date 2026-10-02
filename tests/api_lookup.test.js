import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('GET /api/player-lookup without parameters returns 400 Bad Request', async () => {
  const { status, data } = await apiRequest('/api/player-lookup');
  assert.equal(status, 400);
  assert.ok(data.error);
});

test('GET /api/player-lookup with too-short query returns found: false', async () => {
  const { status, data } = await apiRequest('/api/player-lookup?mobile=12');
  assert.equal(status, 200);
  assert.equal(data.found, false);
});

test('GET /api/referrer-lookup without mobile returns 400 Bad Request', async () => {
  const { status, data } = await apiRequest('/api/referrer-lookup');
  assert.equal(status, 400);
  assert.ok(data.error);
});

test('GET /api/referrer-lookup with non-10-digit number prompts for valid 10 digits', async () => {
  const { status, data } = await apiRequest('/api/referrer-lookup?mobile=12345');
  assert.equal(status, 200);
  assert.equal(data.found, false);
  assert.ok(data.message.includes('10-digit'));
});

test('GET /mumukshu-lookup root-level alias behaves identically', async () => {
  const { status, data } = await apiRequest('/mumukshu-lookup');
  assert.equal(status, 400);
  assert.ok(data.error);
});
