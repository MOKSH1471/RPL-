# 📋 RPL Codebase Audit & Improvement Roadmap

> **Reference Document:** [`instructions.md`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/instructions.md) (Full-Stack Project Blueprint & Standards)  
> **Target Project:** Raj Premier League (RPL) Season 9 Registration System  
> **Connected Clients:** 🌐 Web Portal (Vite), 📱 React Native Mobile App, 🛡️ Admin Website  
> **Date:** 2026-09-01  
> **Overall Compliance Score:** **23%** (14/61 items compliant)

---

## 🎯 Executive Summary

A comprehensive line-by-line audit of the current RPL codebase was conducted against the standards defined in [`instructions.md`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/instructions.md), with full consideration for the **three interconnected client applications**:
1. **Web Registration Portal** (React + Vite SPA)
2. **React Native Mobile App** (iOS / Android)
3. **Admin Management Website** (Approvals & Player Export)

While the registration UI is dynamic and responsive, the **backend requires security middleware, CORS tuning for multi-client & mobile access, route protection for the Admin portal, and data query fixes for multi-sport filtering**.

---

## 📊 Compliance Scorecard

| Category | Items Evaluated | Compliant (✅) | Partial (⚠️) | Non-Compliant (❌) | Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Tech Stack & Dependencies** | 16 | 1 | 3 | 11 | **6%** |
| **2. Repository Structure** | 9 | 4 | 1 | 4 | **44%** |
| **3. Backend Architecture** | 9 | 0 | 1 | 7 | **0%** |
| **4. Backend Security & Auth** | 10 | 1 | 1 | 7 | **10%** |
| **5. Frontend Architecture & Security**| 11 | 4 | 3 | 2 | **36%** |
| **6. Git & Environment Hygiene** | 6 | 4 | 0 | 2 | **67%** |
| **TOTAL** | **61** | **14** | **9** | **33** | **23%** |

---

## 🔍 Detailed Multi-Client Gap Analysis

### 1. Security & Authentication Gaps (Critical)
- ❌ **Unprotected Admin Endpoints:** `/api/admin/registrations` and `/api/admin/registrations/:id/payment` have no authentication or authorization checks.
- ❌ **Missing Security Middleware:** `helmet` (security headers), `express-rate-limit` (brute-force/scraping prevention), and explicit CORS allowlist are missing.
- ❌ **Unrestricted File Uploads:** `multer.memoryStorage()` has no file size ceiling (e.g. 5MB) and no MIME-type filtering.
- ❌ **No Duplicate Registration Safeguard:** Users can submit infinite registrations with the same email and mobile.

### 2. Multi-Client & CORS Considerations (High)
- ⚠️ **React Native CORS:** React Native apps do not send an `Origin` header. Any new CORS configuration must explicitly allow requests where `!origin` is true.
- ⚠️ **Multi-Origin Web + Admin Support:** CORS must allow both the user registration site (`https://rpl.vitraagvigyaan.org`) and the admin portal (`https://admin.rpl.vitraagvigyaan.org`).
- ⚠️ **Multi-Sport Admin Filtering:** Registrations with multiple sports currently store secondary sports only in `answers.selectedSports` JSON. The Admin SQL query needs `JSON_CONTAINS` to ensure secondary sports appear when filtered by sports coordinators.

---

## 🛠 Actionable Improvement Roadmap

### 🚀 Phase 1: Multi-Client Security Hardening (P0)

#### Step 1.1: Install Security Packages
```bash
cd server
npm install helmet express-rate-limit
```

#### Step 1.2: Multi-Origin & Mobile-Safe CORS Middleware
Update [`server/index.js`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js):
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 1. Security Headers
app.use(helmet());

// 2. Multi-Client CORS (Supports Web, Admin Dashboard, and React Native)
const allowedOrigins = [
  'http://localhost:5173',               // Web Registration Dev
  'http://localhost:3000',               // Admin Web Dev
  'https://rpl.vitraagvigyaan.org',       // Web Registration Prod
  'https://admin.rpl.vitraagvigyaan.org', // Admin Web Prod
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (React Native mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));

// 3. Request Size Guard
app.use(express.json({ limit: '10kb' }));

// 4. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const lookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many lookup requests. Please try again later.' }
});
app.use('/api/mumukshu-lookup', lookupLimiter);
```

#### Step 1.3: Secure File Uploads in Multer (Web + RN Compatible)
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.'));
    }
  },
});
```

#### Step 1.4: Add Admin Authentication Guard
```javascript
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_API_SECRET;

  if (!adminSecret) {
    console.error('ADMIN_API_SECRET is not configured in .env');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const token = authHeader?.replace('Bearer ', '') || req.headers['x-admin-key'];

  if (token !== adminSecret) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized admin access' }
    });
  }
  next();
};

app.use('/api/admin', requireAdminAuth);
```

---

### 🧱 Phase 2: Architecture & Multi-Sport Data Sync (P1)

#### Step 2.1: Fix Multi-Sport Filtering in Admin API
Update `GET /api/admin/registrations` in [`server/index.js`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js):
```javascript
// Ensure players registered for multiple sports show up under all selected sports
if (sport_id) {
  conditions.push("(r.sport_id = ? OR JSON_CONTAINS(r.answers->'$.selectedSports', JSON_QUOTE(?)))");
  params.push(sport_id, sport_id);
}
```

#### Step 2.2: Implement Health & Readiness Checks
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', database: 'disconnected' });
  }
});
```

#### Step 2.3: Centralized Error Handler Middleware
```javascript
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

---

### 📊 Phase 3: Data Integrity & Cross-Platform Alignment (P2)

#### Step 3.1: Synchronize Option Values Across Clients
Ensure the Web app, React Native app, and Admin portal all draw their dynamic questions and dropdown options directly from `GET /api/registration-fields`.

#### Step 3.2: Duplicate Registration Prevention
```javascript
const [existing] = await db.query(
  'SELECT id FROM rpl_registrations WHERE email = ? AND sport_id = ? LIMIT 1',
  [email.trim().toLowerCase(), activeSport]
);

if (existing.length > 0) {
  return res.status(409).json({
    success: false,
    error: {
      code: 'DUPLICATE_REGISTRATION',
      message: `A registration for ${email} in this sport category already exists.`
    }
  });
}
```

---

## 📋 Multi-Client Checklist

- [ ] **P0.1** Configure multi-origin CORS supporting Web, Admin, and React Native (`!origin`)
- [ ] **P0.2** Secure `/api/admin/*` endpoints with Bearer Token / Admin API Secret
- [ ] **P0.3** Add size (5MB) & MIME type restrictions to Multer
- [ ] **P1.1** Update Admin `GET /api/admin/registrations` to search `answers.selectedSports` JSON
- [ ] **P1.2** Add `/health` & `/ready` monitoring endpoints
- [ ] **P1.3** Implement central Express error handler
- [ ] **P2.1** Add duplicate registration check for email + sport
- [ ] **P2.2** Ensure React Native app fetches dynamic questions from `/api/registration-fields`
