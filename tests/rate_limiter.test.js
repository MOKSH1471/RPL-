import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../apps/api/src/middleware/rateLimiter.js';

test('Rate Limiter: allows requests up to max limit and triggers 429 when exceeded', () => {
  // Save original NODE_ENV
  const origEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production'; // simulate production to activate limiter logic

  try {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: 3,
      message: 'Rate limit exceeded',
      enabledInTest: true,
    });

    const mockReq = { ip: '192.168.1.50', headers: {}, socket: {} };
    let statusSet = null;
    let jsonOutput = null;
    let retryAfterHeader = null;

    const mockRes = {
      status(code) {
        statusSet = code;
        return this;
      },
      json(data) {
        jsonOutput = data;
        return this;
      },
      setHeader(name, val) {
        if (name === 'Retry-After') retryAfterHeader = val;
      },
    };

    let nextCallCount = 0;
    const mockNext = () => { nextCallCount++; };

    // Request 1: allowed
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCallCount, 1);
    assert.strictEqual(statusSet, null);

    // Request 2: allowed
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCallCount, 2);

    // Request 3: allowed (max = 3)
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCallCount, 3);

    // Request 4: rejected with 429
    limiter(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCallCount, 3, 'Next should not be called when rate limit is exceeded');
    assert.strictEqual(statusSet, 429);
    assert.strictEqual(jsonOutput.success, false);
    assert.strictEqual(jsonOutput.error, 'Rate limit exceeded');
    assert.ok(retryAfterHeader > 0, 'Retry-After header must be set');

    // Request from a different IP: allowed
    const otherReq = { ip: '10.0.0.1', headers: {}, socket: {} };
    limiter(otherReq, mockRes, mockNext);
    assert.strictEqual(nextCallCount, 4, 'Different IP must have independent rate window');
  } finally {
    process.env.NODE_ENV = origEnv;
  }
});
