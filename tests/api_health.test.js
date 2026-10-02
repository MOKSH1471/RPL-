import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('GET /health returns 200 with status ok and timestamp', async () => {
  const { status, data } = await apiRequest('/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
  assert.ok(data.timestamp, 'Timestamp should be present');
});

test('GET /ready returns status response with database state', async () => {
  const { status, data } = await apiRequest('/ready');
  assert.ok([200, 503].includes(status), 'Should return 200 or 503 depending on live DB connectivity');
  assert.ok('status' in data);
  assert.ok('database' in data);
});
