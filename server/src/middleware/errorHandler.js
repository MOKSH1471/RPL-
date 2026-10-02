/**
 * Centralized Express Error Handling Middleware
 * Ensures every error or unmatched route responds with structured JSON
 */

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function globalErrorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

  console.error(`🚨 [ERROR] ${req.method} ${req.originalUrl} - Status ${status}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(isDev ? { stack: err.stack } : {}),
  });
}
