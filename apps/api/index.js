import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate critical startup environment variables
import { validateEnvironment } from './src/config/env.js';
validateEnvironment();

// Import modular routes & rate limiting
import healthRoutes from './src/routes/health.routes.js';
import sportsRoutes from './src/routes/sports.routes.js';
import lookupRoutes, { handlePlayerLookup, handleReferrerLookup } from './src/routes/lookup.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import registrationRoutes from './src/routes/registration.routes.js';
import razorpayRoutes from './src/routes/razorpay.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import { lookupRateLimiter, paymentRateLimiter, registrationRateLimiter } from './src/middleware/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorHandler.js';
import { securityHeadersMiddleware, corsOptions } from './src/middleware/security.js';

const app = express();
const port = process.env.PORT || 5005;

import pool from './src/config/db.js';

// Security & Parsing Middleware
app.use(securityHeadersMiddleware);
app.use(cors(corsOptions()));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured HTTP Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.originalUrl === '/health' || req.originalUrl === '/ready') return;
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 1. Health & Readiness Probes (Root level)
app.use('/', healthRoutes);

// 2. Sensitive Route Rate Limiting
app.use(['/api/player-lookup', '/mumukshu-lookup', '/card/lookup'], lookupRateLimiter);
app.use(['/api/referrer-lookup', '/referrer-lookup', '/reference-lookup'], lookupRateLimiter);
app.use('/api/register', registrationRateLimiter);
app.use('/api/razorpay', paymentRateLimiter);

// 3. Core API Routes (Mounted under /api)
app.use('/api', sportsRoutes);
app.use('/api', lookupRoutes);
app.use('/api', uploadRoutes);
app.use('/api', registrationRoutes);
app.use('/api', razorpayRoutes);
app.use('/api', adminRoutes);

// 4. Fallback Root-Level Aliases for Lookups (backward compatibility)
app.get('/mumukshu-lookup', handlePlayerLookup);
app.get('/card/lookup', handlePlayerLookup);
app.get('/referrer-lookup', handleReferrerLookup);
app.get('/reference-lookup', handleReferrerLookup);

// 5. Centralized 404 & Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server if not running in test runner
const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'));
if (!isTestEnv) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (0.0.0.0)`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n🛑 [SHUTDOWN] Received ${signal}. Gracefully stopping RPL server...`);
    server.close(async () => {
      console.log('🔒 [SHUTDOWN] HTTP listener closed. Draining database connections...');
      try {
        await pool.end();
        console.log('✅ [SHUTDOWN] Database pool closed successfully.');
      } catch (err) {
        console.error('⚠️ [SHUTDOWN] Error closing database pool:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export default app;
