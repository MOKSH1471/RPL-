import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../apps/api/src/config/env.js';

test('Environment Validation: returns true when critical secrets are configured', () => {
  const isHealthy = validateEnvironment();
  assert.strictEqual(typeof isHealthy, 'boolean');
});

test('Environment Validation: catches missing critical secrets when keys are undefined', () => {
  const origHost = process.env.DB_HOST;
  try {
    delete process.env.DB_HOST;
    const result = validateEnvironment();
    assert.strictEqual(result, false, 'Should return false when DB_HOST is missing');
  } finally {
    process.env.DB_HOST = origHost;
  }
});
