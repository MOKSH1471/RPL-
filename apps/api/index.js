import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Import modular routes
import healthRoutes from './src/routes/health.routes.js';
import sportsRoutes from './src/routes/sports.routes.js';
import lookupRoutes, { handlePlayerLookup, handleReferrerLookup } from './src/routes/lookup.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import registrationRoutes from './src/routes/registration.routes.js';
import razorpayRoutes from './src/routes/razorpay.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Health & Readiness Probes (Root level)
app.use('/', healthRoutes);

// 2. Core API Routes (Mounted under /api)
app.use('/api', sportsRoutes);
app.use('/api', lookupRoutes);
app.use('/api', uploadRoutes);
app.use('/api', registrationRoutes);
app.use('/api', razorpayRoutes);
app.use('/api', adminRoutes);

// 3. Fallback Root-Level Aliases for Lookups (backward compatibility)
app.get('/mumukshu-lookup', handlePlayerLookup);
app.get('/card/lookup', handlePlayerLookup);
app.get('/referrer-lookup', handleReferrerLookup);
app.get('/reference-lookup', handleReferrerLookup);

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
