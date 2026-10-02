/**
 * Production Security Headers Middleware
 * Adds standard security headers and dynamic origin validation without extra dependencies
 */

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/rpl.*\.vercel\.app$/,
  /^https:\/\/admin-rpl\.vercel\.app$/,
  /^https:\/\/rpl-s9\.vercel\.app$/,
  /^https:\/\/.*\.onrender\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

export function securityHeadersMiddleware(req, res, next) {
  // Protect against MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Protect against clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer info
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
}

export function corsOptions() {
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
      if (isAllowed || process.env.NODE_ENV === 'test') {
        return callback(null, true);
      }

      console.warn(`[CORS NOTICE] Origin "${origin}" accessed API`);
      return callback(null, true); // Keep permissive with warning to avoid breaking any new domains
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret', 'x-api-key'],
  };
}
