import { randomBytes } from 'crypto';
import logger from '../config/logger.js';

/**
 * Strips sensitive fields (passwords, secrets, tokens, OTPs) from request logs
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const SENSITIVE = ['password', 'token', 'secret', 'otp', 'pin', 'razorpay_signature'];
  const safe = { ...body };
  for (const key of Object.keys(safe)) {
    if (SENSITIVE.some((s) => key.toLowerCase().includes(s))) {
      safe[key] = '[REDACTED]';
    }
  }
  return safe;
}

function truncate(str, maxLen = 500) {
  if (!str) return str;
  return str.length > maxLen ? str.slice(0, maxLen) + '…[truncated]' : str;
}

/**
 * HTTP Logger Middleware (Aashray Standard):
 * - Assigns unique correlationId (from x-request-id header or random hex)
 * - Emits x-request-id in response header
 * - Attaches req.log with correlationId baked in
 * - Measures request duration and logs request_completed
 */
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  const correlationId = req.headers['x-request-id'] || randomBytes(6).toString('hex');
  req.correlationId = correlationId;
  res.setHeader('X-Request-Id', correlationId);

  req.log = logger.child({
    correlationId,
    method: req.method,
    path: req.originalUrl,
  });

  // Skip verbose health checks from flooding log files
  const isHealthCheck = req.originalUrl === '/health' || req.originalUrl === '/ready' || req.originalUrl === '/api/health';
  if (!isHealthCheck) {
    const sanitized = sanitizeBody(req.body);
    const hasBody = sanitized && typeof sanitized === 'object' && Object.keys(sanitized).length > 0;
    req.log.info('request_received', {
      ip: req.ip,
      userAgent: req.headers['user-agent'] ? truncate(req.headers['user-agent'], 100) : undefined,
      ...(hasBody && { body: JSON.stringify(sanitized).slice(0, 1000) }),
    });
  }

  const originalSend = res.send;
  let logged = false;

  res.send = function (body) {
    if (!logged) {
      logged = true;
      const duration = Date.now() - start;
      const logFn = res.statusCode >= 500
        ? 'error'
        : res.statusCode >= 400
          ? 'warn'
          : 'info';

      if (!isHealthCheck || res.statusCode >= 400) {
        req.log[logFn]('request_completed', {
          statusCode: res.statusCode,
          durationMs: duration,
          ...(res.statusCode >= 400 && {
            responseBody: truncate(typeof body === 'string' ? body : JSON.stringify(body)),
          }),
        });
      }
    }
    return originalSend.call(this, body);
  };

  next();
};

export default httpLogger;
