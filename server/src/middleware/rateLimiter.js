/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 * Zero external dependencies. Automatically bypassed in test mode.
 */

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests from this IP, please try again after a minute.',
  enabledInTest = false,
} = {}) {
  const ipRequests = new Map();

  // Periodic garbage collection every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRequests.entries()) {
      const valid = timestamps.filter(time => now - time < windowMs);
      if (valid.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000).unref();

  return function rateLimiterMiddleware(req, res, next) {
    if (!enabledInTest && (process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test')))) {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const timestamps = ipRequests.get(ip) || [];
    const validTimestamps = timestamps.filter(time => now - time < windowMs);

    if (validTimestamps.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    validTimestamps.push(now);
    ipRequests.set(ip, validTimestamps);
    next();
  };
}

export const lookupRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Lookup request rate limit exceeded. Please wait a minute before searching again.',
});

export const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Payment attempt limit exceeded. Please try again after a few minutes.',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Registration rate limit exceeded. Please try again in a minute.',
});
