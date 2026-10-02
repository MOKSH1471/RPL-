import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer } from './testHelper.js';

after(async () => {
  await stopTestServer();
});

test('Security Headers: verifies strict protection headers are present on all responses', async () => {
  const res = await apiRequest('/health');
  assert.strictEqual(res.status, 200);

  const nosniff = res.headers.get('x-content-type-options');
  const frameOptions = res.headers.get('x-frame-options');
  const referrerPolicy = res.headers.get('referrer-policy');
  const xssProtection = res.headers.get('x-xss-protection');

  assert.strictEqual(nosniff, 'nosniff');
  assert.strictEqual(frameOptions, 'SAMEORIGIN');
  assert.strictEqual(referrerPolicy, 'strict-origin-when-cross-origin');
  assert.strictEqual(xssProtection, '1; mode=block');
});

test('404 Handler: unknown route responds with structured JSON and 404 status', async () => {
  const res = await apiRequest('/api/unknown-nonexistent-endpoint-test');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.data.success, false);
  assert.match(res.data.error, /Route not found/);
});

test('CORS: responds with Access-Control-Allow-Origin header for browser clients', async () => {
  const res = await apiRequest('/api/sports', {
    headers: {
      Origin: 'https://rpl-s9.vercel.app',
    },
  });

  const allowOrigin = res.headers.get('access-control-allow-origin');
  assert.ok(allowOrigin, 'Access-Control-Allow-Origin header must be present');
});
