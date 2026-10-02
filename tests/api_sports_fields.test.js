import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('GET /api/sports responds with 200 (connected DB) or 500 (offline DB with error message)', async () => {
  const { status, data } = await apiRequest('/api/sports');
  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  if (status === 200) {
    assert.ok(Array.isArray(data), 'Response should be an array of sports');
  } else {
    assert.ok('error' in data, 'Error response should have error key');
  }
});

test('GET /api/registration-fields responds with 200 (connected DB) or 500 (offline DB with error message)', async () => {
  const { status, data } = await apiRequest('/api/registration-fields');
  assert.ok([200, 500].includes(status), `Expected 200 or 500, got ${status}`);
  if (status === 200) {
    assert.ok(Array.isArray(data), 'Response should be an array of fields');
  } else {
    assert.ok('error' in data, 'Error response should have error key');
  }
});
