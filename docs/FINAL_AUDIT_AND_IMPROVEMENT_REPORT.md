# 🏆 RPL Season 9 — Final Architectural Audit & Improvement Plan

> **System:** Raj Premier League (RPL) Registration & Tournament Management Platform  
> **Connected Clients:**  
> - 🌐 **Web Registration Portal** (React 18 + Vite SPA)  
> - 📱 **Mobile Application** (React Native for iOS & Android)  
> - 🛡️ **Admin Management Portal** (Web Dashboard for Player Review & Payment Approval)  
> **Database:** MySQL (Relational + JSON Hybrid)  
> **Storage:** Google Drive API v3 / Google Apps Script Webhook  
> **Date:** 2026-09-01  
> **Document Status:** Complete & Actionable

---

## 📌 Executive Summary

The RPL Season 9 registration platform provides a rich user interface with dynamic sport selection and instant member lookup (`card_db`). 

However, because **three independent client applications (Web, Mobile, Admin)** communicate with the same backend, the current codebase has **8 critical flaws** spanning security exposure, multi-client data inconsistency, missing query logic for multi-sport players, and unrestricted file uploads.

This document serves as the definitive reference detailing **everything that is wrong**, the exact **risk/impact**, and the **precise code-level solutions** to fix them.

---

## 🚨 Summary of What Is Wrong (The Top 8 Issues)

| # | Flaw | Severity | Affected Clients | Impact |
|:--|:---|:---:|:---|:---|
| **1** | **Admin Endpoints Are Completely Unprotected** | 🔴 **Critical** | Admin Website | Anyone can view all participant PII (phone, email, names) and approve/reject payments without a password or token. |
| **2** | **Multi-Sport Players Invisible in Admin Filters** | 🔴 **Critical** | Admin, Web, Mobile | When a player registers for Cricket + Football, only Cricket is saved as `sport_id`. In Admin, filtering by Football returns **0 results**. |
| **3** | **Unrestricted File Uploads in Multer** | 🔴 **Critical** | Web, Mobile | No file size ceiling (OOM server crash risk) and no MIME-type filtering (executable files could be uploaded to Drive). |
| **4** | **CORS Configuration Risk for React Native** | 🟡 **High** | React Native, Admin | Standard CORS will block React Native mobile apps because native HTTP clients don't send browser `Origin` headers. |
| **5** | **No Duplicate Registration Safeguard** | 🟡 **High** | Web, Mobile, DB | The same person can register 50 times with the same email/sport, polluting tournament data and distorting team counts. |
| **6** | **Frontend ↔ Database Option Value Mismatches** | 🟡 **High** | Web, Mobile, DB | Form labels ("Right-hand bat", "Men Doubles") don't match DB seed values ("Right Hand", "Doubles"). Validation relies on loose matching. |
| **7** | **Dual / Desynchronized Registration IDs** | 🟡 **Medium** | Web, Mobile, Admin | The frontend generates its own `RPL9-XXXXXX` ID for the user's ticket, while MySQL generates a UUID. Admin cannot search by ticket ID. |
| **8** | **No Health Checks or Centralized Error Handler** | 🟢 **Medium** | Backend Server | No `/health` or `/ready` endpoints for cloud monitoring; unhandled exceptions can leak internal stack traces to clients. |

---

## 🛠 In-Depth Breakdown & Exact Solutions

---

### Issue 1: Admin Endpoints Have Zero Authentication

#### What is Wrong:
In [`server/index.js`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js#L315-L376), `GET /api/admin/registrations` and `POST /api/admin/registrations/:id/payment` have no authentication middleware. Any person on the internet can hit these URLs and download all player records or tamper with payment approval states.

#### Solution:
Add an `adminAuth` middleware that enforces an `ADMIN_API_SECRET` token sent in the `Authorization: Bearer <secret>` header or `x-admin-key` header.

```javascript
// server/middleware/adminAuth.js
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_API_SECRET;

  if (!adminSecret) {
    console.error('FATAL: ADMIN_API_SECRET is not configured in server .env');
    return res.status(500).json({ success: false, error: 'Server authentication configuration error' });
  }

  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.headers['x-admin-key'];

  if (token !== adminSecret) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Admin authentication required.' }
    });
  }
  next();
};
```

---

### Issue 2: Multi-Sport Registrations Hidden in Admin Filters

#### What is Wrong:
When a user selects multiple sports (e.g. `['cricket', 'football']`), the frontend sends `sport_id: 'cricket'` and stores the full array inside `answers.selectedSports`. 
When the Admin portal coordinator filters by `GET /api/admin/registrations?sport_id=football`, the SQL query executes `WHERE r.sport_id = 'football'`. **This player will not appear in the football list.**

#### Solution:
Update the SQL query in `server/index.js` to search both the primary `sport_id` column and the JSON array in `answers.selectedSports`:

```javascript
// In server/index.js -> GET /api/admin/registrations
if (sport_id) {
  // Matches primary sport OR any sport selected inside answers JSON
  conditions.push("(r.sport_id = ? OR JSON_CONTAINS(r.answers->'$.selectedSports', JSON_QUOTE(?)))");
  params.push(sport_id, sport_id);
}
```

---

### Issue 3: Unrestricted File Uploads in Multer

#### What is Wrong:
[`server/index.js L30`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js#L30) uses raw `multer({ storage: multer.memoryStorage() })`.
- No `fileSize` ceiling: A malicious user or huge image can crash Node.js with an Out-of-Memory (OOM) error.
- No `fileFilter`: Users could upload `.exe`, `.html`, or scripts to your Google Drive.

#### Solution:
Add a 5MB size limit and restrict allowed MIME types to safe image and document formats:

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes Max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images and PDF files are allowed.'));
    }
  },
});
```

---

### Issue 4: Multi-Client CORS Strategy (Web + React Native + Admin)

#### What is Wrong:
- Web and Admin portals run on different origins (`rpl.vitraagvigyaan.org` vs `admin.rpl.vitraagvigyaan.org` vs `localhost`).
- React Native mobile apps on iOS/Android **do not send an `Origin` header** (it is `undefined`). If a strict CORS library is added without handling `!origin`, all mobile requests will be blocked.

#### Solution:
Implement a dynamic CORS allowlist that permits listed web domains while allowing native mobile requests:

```javascript
const allowedOrigins = [
  'http://localhost:5173',               // Web Registration Local
  'http://localhost:3000',               // Admin Portal Local
  'https://rpl.vitraagvigyaan.org',       // Web Registration Production
  'https://admin.rpl.vitraagvigyaan.org', // Admin Portal Production
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (React Native apps, mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
}));
```

---

### Issue 5: No Duplicate Registration Detection

#### What is Wrong:
[`server/index.js L298-302`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js#L298-L302) performs an immediate `INSERT` without checking if the player has already registered for that sport. Accidental double-clicks or repeated submissions create duplicate database entries.

#### Solution:
Add a pre-insert duplicate check:

```javascript
// In server/index.js -> POST /api/register
const cleanEmail = email.trim().toLowerCase();
const [existing] = await db.query(
  "SELECT id FROM rpl_registrations WHERE LOWER(email) = ? AND (sport_id = ? OR JSON_CONTAINS(answers->'$.selectedSports', JSON_QUOTE(?))) LIMIT 1",
  [cleanEmail, activeSport, activeSport]
);

if (existing.length > 0) {
  return res.status(409).json({
    success: false,
    error: `You have already registered for ${activeSport}. If you need to make changes, please contact the coordinator.`
  });
}
```

---

### Issue 6: Option Value Inconsistencies

#### What is Wrong:
There are naming differences between frontend types, database seed data, and dynamic field configurations:

| Field | Client Display Value | Database Seed Value | Action Required |
|:---|:---|:---|:---|
| **Batting Style** | `"Right-hand bat"` | `"Right Hand"` | Standardize `db_seed.sql` to `"Right-hand bat"` |
| **Bowling Style** | `"Right-arm Fast / Medium"` | `"Right-arm Fast"` | Standardize `db_seed.sql` to client format |
| **Football Position** | `"Forward / Striker"` | `"Forward"` | Standardize `db_seed.sql` to client format |
| **TT Grip** | `"Shakehand Grip"` | `"Shakehand"` | Standardize `db_seed.sql` to client format |
| **Pickleball Category** | `"Men Singles"`, `"Men Doubles"` | `"Singles"`, `"Doubles"` | Align `db_seed.sql` with multi-category options |

#### Solution:
1. Update [`database/db_seed.sql`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/database/db_seed.sql) to use the exact client-friendly strings.
2. Ensure both the **Web portal** and **React Native app** fetch questions dynamically from `GET /api/registration-fields` so changes to questions are instantly reflected without app updates.

---

### Issue 7: Unify Registration Ticket ID Generation

#### What is Wrong:
- The React frontend generates `RPL9-123456` locally using `Math.random()`.
- The MySQL database stores a UUID (`uuidv4()`).
- The user is given a ticket ID that does not exist in the database!

#### Solution:
Generate the branded `RPL9-XXXXXX` ID on the **backend server**, save it as the primary key in MySQL, and return it in the API response:

```javascript
// In POST /api/register
const registrationId = `RPL9-${Math.floor(100000 + Math.random() * 900000)}`;

await db.query(
  'INSERT INTO rpl_registrations (id, sport_id, full_name, email, mobile, answers) VALUES (?, ?, ?, ?, ?, ?)',
  [registrationId, activeSport, full_name, email, mobile, JSON.stringify(answers)]
);

return res.json({
  success: true,
  message: 'Registration submitted successfully',
  registration_id: registrationId
});
```

---

### Issue 8: Health Probes, Rate Limiting & Central Error Handler

#### What is Wrong:
- No `/health` or `/ready` endpoints for deployment environments (Render / Railway / AWS).
- No rate limiting on `/api/mumukshu-lookup` (scraping risk for phone directory).
- Missing central error handling middleware.

#### Solution:
Add monitoring and error middleware in `server/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

// Health Probes
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Rate Limiter on Lookup
app.use('/api/mumukshu-lookup', rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many search requests. Please slow down.' }
}));

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
```

---

## 📋 Comprehensive Implementation Checklist

Follow this checklist to apply all fixes systematically:

### Phase 1: Security & Auth (Immediate)
- [ ] Create `server/middleware/adminAuth.js` and protect all `/api/admin/*` routes.
- [ ] Add `ADMIN_API_SECRET` to `server/.env` and update the Admin website to send `Authorization: Bearer <token>`.
- [ ] Install `helmet` and `express-rate-limit` in `server/`.
- [ ] Add 5MB size limit and image/PDF MIME type filter to Multer in `server/index.js`.
- [ ] Configure multi-client CORS supporting Web, Admin, and React Native (`!origin`).

### Phase 2: Database & Data Synchronization (Day 1)
- [ ] Update `GET /api/admin/registrations` SQL query to use `JSON_CONTAINS` for multi-sport filtering.
- [ ] Add pre-insert duplicate check on `email` + `sport_id` in `/api/register`.
- [ ] Make backend generate and return the unified `RPL9-XXXXXX` registration ID.
- [ ] Update `database/db_seed.sql` dropdown options to match user-facing labels.

### Phase 3: Infrastructure & Reliability (Day 2)
- [ ] Add `/health` and `/ready` endpoints.
- [ ] Add rate limiting on `/api/mumukshu-lookup` and `/api/upload`.
- [ ] Add centralized Express error handler.
- [ ] Uninstall unused `qrcode` dependency from `server/package.json`.

---

*This report is saved in the project root as [`FINAL_AUDIT_AND_IMPROVEMENT_REPORT.md`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/FINAL_AUDIT_AND_IMPROVEMENT_REPORT.md).*
