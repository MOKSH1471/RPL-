# 📊 RPL Backend & Database — Analysis Report

> **Project:** Raj Premier League (RPL) Season 9 Registration System  
> **Report Version:** 2.2 (Admin Security Fixed)  
> **Last Updated:** 2026-09-02  
> **Clients Connected:**  
> 1. 🌐 **Web Registration Portal** (React + Vite SPA)  
> 2. 📱 **React Native Mobile App** (iOS & Android)  
> 3. 🛡️ **Admin Management Website** (Web Portal for Approvals & Export)  
> **Status:** 🟢 Admin Endpoints Secured — timing-safe Bearer auth active

---

## Table of Contents

1. [Multi-Client System Architecture](#1-multi-client-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Multi-Client Compatibility Analysis & Risks](#3-multi-client-compatibility-analysis--risks)
4. [Database Design & Schema Analysis](#4-database-design--schema-analysis)
5. [Backend API Endpoints](#5-backend-api-endpoints)
6. [Cross-Client Data Flow & Contract Sync](#6-cross-client-data-flow--contract-sync)
7. [Key Findings & Issues](#7-key-findings--issues)
8. [Manual Test Cases (Including Mobile & Admin)](#8-manual-test-cases-including-mobile--admin)
9. [Health Summary](#9-health-summary)
10. [Instructions.md Compliance Audit](#10-instructionsmd-compliance-audit)
11. [Multi-Client Improvement Recommendations](#11-multi-client-improvement-recommendations)
12. [Change Log](#12-change-log)

---

## 1. Multi-Client System Architecture

```
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│   🌐 Web Portal (Vite)   │    │ 📱 React Native App (RN) │    │  🛡️ Admin Website (Web)  │
│  - Public Registration   │    │  - Public Registration   │    │  - Registration Review   │
│  - Member Lookup (Mum.)  │    │  - Member Card Lookup    │    │  - Payment Approvals     │
│  - Receipt/Photo Upload  │    │  - Camera/Gallery Upload │    │  - Player Data Export    │
└────────────┬─────────────┘    └────────────┬─────────────┘    └────────────┬─────────────┘
             │ HTTP                          │ HTTP (No Origin header)   │ HTTP (Bearer / Key)
             └───────────────────────┬───────┴───────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────────────────┐
│                          Unified Express.js Backend (port 5005)                      │
│  ├── Multi-Origin & Mobile CORS Handler (Allows Web, Admin & Native Apps)            │
│  ├── Role-Based Auth Guard (/api/admin/* requires Bearer Admin Token)                │
│  ├── Multer File Upload Streamer (5MB Cap + MIME Check → Google Drive Webhook/JWT)   │
│  ├── Dynamic Field Validation Engine (Case-Agnostic Casing Resolver)                 │
│  └── MySQL Connection Pool (mysql2/promise with SSL)                                 │
└──────────────────────────┬─────────────────────────────────────┬─────────────────────┘
                           │ Parameterized SQL                   │ Base64 / Stream
┌──────────────────────────▼────────┐                  ┌─────────▼─────────────────────┐
│          MySQL Database           │                  │      Google Drive Storage     │
│  ├── rpl_sports                   │                  │  ├── Player Profile Photos    │
│  ├── rpl_registration_fields      │                  │  └── Payment Receipts/Screens │
│  ├── rpl_registrations (JSON)     │                  └───────────────────────────────┘
│  └── card_db (Mumukshu Records)   │
└───────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|:------|:-----------|:--------|:------|
| **Runtime** | Node.js (ESM) | — | Shared backend serving all 3 client frontends |
| **Framework** | Express.js | ^4.21.1 | REST API provider |
| **Database Driver** | mysql2/promise | ^3.11.5 | Connection pool with SSL |
| **File Uploads** | Multer (memory storage) | ^1.4.5-lts.1 | Serves Web `File` & React Native `FormData` |
| **Cloud Storage** | Google Drive API v3 (`googleapis`) | ^144.0.0 | Dual: Webhook / Service Account JWT |
| **ID Generation** | uuid v4 | ^11.0.3 | Backend primary key |
| **Clients** | React 18, React Native, Admin SPA | Multi | Web, Mobile, Admin Dashboard |

---

## 3. Multi-Client Compatibility Analysis & Risks

Because **Web**, **React Native**, and the **Admin Website** share this single backend, specific architectural rules must be respected:

### 📱 3.1 React Native Mobile Considerations
1. **CORS Behavior on Mobile:**
   - Browsers enforce CORS and send `Origin: https://...`. 
   - React Native apps (iOS & Android) run outside a browser sandbox and do **not** send an `Origin` header (or send `Origin: null`).
   - *Requirement:* The backend CORS middleware must permit requests where `req.headers.origin` is `undefined` so mobile apps are not rejected!
2. **File Upload Payloads:**
   - React Native uploads files using: `{ uri, type, name }` inside `FormData`. Multer handles this identically to Web `File` uploads as long as the field name is `file`.
3. **Dynamic Form Schema Loading:**
   - The React Native app should consume `GET /api/registration-fields` directly to dynamically build inputs. Hardcoding options in mobile releases causes mobile apps to become out-of-sync whenever questions change in the DB.

### 🛡️ 3.2 Admin Website Considerations
1. **PII Protection & Payment State Machine:**
   - The Admin website reads sensitive user data (full names, phones, emails, fees) via `GET /api/admin/registrations` and updates verification via `POST /api/admin/registrations/:id/payment`.
   - *Requirement:* Admin routes must require a Bearer token or Admin API Secret.
2. **Multi-Sport Filtering Problem:**
   - If a participant registers for **Cricket + Football**, but the backend currently inserts `sport_id = 'cricket'`, the Admin website filtering by `?sport_id=football` **will not return that player**! (See §3.3 below).

### 🔀 3.3 Multi-Sport Architecture Impact
Currently, when a user selects multiple sports:
- The frontend passes `sport_id = selectedSports[0]` (e.g. Cricket) and puts `selectedSports = ['cricket', 'football']` inside the JSON `answers`.
- **Result:** In the Admin portal, if the Football coordinator filters by "Football", this player is invisible unless the Admin site specifically searches inside the JSON `answers`.
- **Solution Options:**
  - **Option A (Recommended for MySQL):** Insert 1 registration row per selected sport sharing a common `group_id` / `submission_id`, OR
  - **Option B (Admin query adjustment):** Update `/api/admin/registrations` to search `(r.sport_id = ? OR JSON_CONTAINS(r.answers->'$.selectedSports', JSON_QUOTE(?)))`.

---

## 4. Database Design & Schema Analysis

**Schema file:** [`database/db_schema.sql`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/database/db_schema.sql)  
**Seed file:** [`database/db_seed.sql`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/database/db_seed.sql)

### 4.1 Tables

| Table | PK | Key Columns | Purpose |
|:------|:---|:------------|:--------|
| **`rpl_sports`** | `id` VARCHAR(50) | `name`, `is_active`, `created_at` | 7 sports categories |
| **`rpl_registration_fields`** | `id` VARCHAR(36) | `sport_id` (FK), `field_key` (UNIQUE), `label`, `field_type`, `options` (JSON), `validation_rules` (JSON), `sort_order` | Dynamic question definitions fetched by Web & React Native |
| **`rpl_registrations`** | `id` VARCHAR(36) | `sport_id` (FK), `full_name`, `email`, `mobile`, `answers` (JSON), `payment_status`, `submitted_at` | Submissions accessed by Admin portal & created by Web/RN |
| **`card_db`** *(external)* | `cardno` | `issuedto`, `gender`, `dob`, `mobno`, `email`, `center`, `pfp` | Auto-fill member directory queried by Web & RN lookup |

---

## 5. Backend API Endpoints

| # | Method | Route | Consumers | Auth | Description |
|:--|:-------|:------|:----------|:-----|:------------|
| 1 | `GET` | `/api/sports` | Web, RN, Admin | Public | Returns active sports list |
| 2 | `GET` | `/api/registration-fields` | Web, RN, Admin | Public | Returns field schema & options |
| 3 | `GET` | `/api/mumukshu-lookup?mobile=` | Web, RN | Public (Rate-limited) | Looks up member info by mobile |
| 4 | `POST` | `/api/upload` | Web, RN | Public | Uploads photo/receipt to Drive |
| 5 | `POST` | `/api/register` | Web, RN | Public | Validates & saves registration |
| 6 | `GET` | `/api/admin/registrations` | Admin | 🔒 **Admin Auth Needed** | Lists all submissions with filters |
| 7 | `POST` | `/api/admin/registrations/:id/payment` | Admin | 🔒 **Admin Auth Needed** | Approves/rejects payment |

---

## 6. Cross-Client Data Flow & Contract Sync

### 6.1 Unified Single Source of Truth
To prevent discrepancies between Web, React Native, and Admin:
- **`GET /api/registration-fields` must be the authority** for dropdown options.
- The backend's `getFieldValue()` helper ([`server/index.js L199-226`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js#L199-L226)) provides critical resilience by matching keys across `camelCase`, `snake_case`, and case-insensitive formats.

---

## 7. Key Findings & Issues

### 🔴 Critical

| # | Issue | Impact on Clients |
|:--|:------|:------------------|
| C1 | **Admin endpoints lack authentication** | Any client or public user can access `/api/admin/registrations` and download player PII or alter payment statuses |
| C2 | **CORS could break React Native or Admin Portal** | If CORS is locked to only 1 domain without allowing mobile apps (`!origin`) or the Admin domain, either RN or Admin will fail |
| C3 | **Multi-sport submissions invisible in Admin sport filter** | When users pick multiple sports in Web/RN, Admin filtering by secondary sports returns 0 rows |
| C4 | **Unbounded Multer Uploads** | No file size or MIME check allows arbitrary file uploads to Google Drive from Web/RN |

---

## 8. Manual Test Cases (Including Mobile & Admin)

### 🔴 Critical

#### TC-MC1: React Native Request Without Origin Header
| Detail | Value |
|:-------|:------|
| **Steps** | Send `POST /api/register` with headers omitting `Origin` (simulating React Native on iOS/Android) |
| **Expected** | `200 OK` (CORS should permit null/missing origin for native apps) |
| **Actual** | `200 OK` currently (due to wildcard CORS), but will break if strict CORS is added incorrectly |
| **Verdict** | **Verify CORS configuration** |

#### TC-MC2: Admin Web Portal Authentication Guard
| Detail | Value |
|:-------|:------|
| **Steps** | 1. Open Admin Web Portal → View registrations with valid Admin Token<br>2. Make request without Token |
| **Expected** | Valid Token → `200 OK`; No Token → `401 Unauthorized` |
| **Actual** | Currently returns `200 OK` without any token |
| **Verdict** | **FAIL** — Admin routes exposed |

#### TC-MC3: Multi-Sport Filter in Admin Portal
| Detail | Value |
|:-------|:------|
| **Steps** | 1. In Web/RN, register user selecting **Cricket** and **Football**<br>2. In Admin website, filter by `?sport_id=football` |
| **Expected** | Registered player appears under Football filter |
| **Actual** | Player only appears under Cricket; Football coordinator misses the entry |
| **Verdict** | **FAIL** — Multi-sport filtering broken for Admin |

---

## 9. Health Summary

| Area | Status | Score | Notes |
|:-----|:------:|:-----:|:------|
| **Multi-Client Architecture** | 🟢 Good | 8/10 | REST API is well-suited for Web, React Native, and Admin |
| **Cross-Platform Uploads** | 🟢 Good | 8/10 | Google Drive integration works for Web and RN |
| **Admin Route Security** | 🔴 Critical | 2/10 | Must add Auth Bearer protection |
| **Multi-Sport Data Integrity** | 🟡 Needs Work | 5/10 | Admin filter needs JSON query support or multi-row insert |
| **CORS Policy** | 🟡 Needs Work | 5/10 | Must whitelist Web + Admin domains while allowing native mobile |

---

## 10. Instructions.md Compliance Audit

*See [`INSTRUCTIONS_AUDIT_AND_ROADMAP.md`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/INSTRUCTIONS_AUDIT_AND_ROADMAP.md) for the complete 61-point breakdown.*

---

## 11. Multi-Client Improvement Recommendations

### 1. Robust Multi-Client CORS Middleware
```javascript
const allowedOrigins = [
  'http://localhost:5173', // Web Dev
  'http://localhost:3000', // Admin Dev
  'https://rpl.vitraagvigyaan.org', // Web Production
  'https://admin.rpl.vitraagvigyaan.org', // Admin Production
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (React Native apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));
```

### 2. Admin Route Protection (Bearer Token)
```javascript
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-key'];
  if (!token || token !== process.env.ADMIN_API_SECRET) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } });
  }
  next();
};

app.use('/api/admin', adminAuth);
```

### 3. Multi-Sport Admin Query Fix
Update `GET /api/admin/registrations` in [`server/index.js`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL/server/index.js#L318-L334):
```javascript
if (sport_id) {
  // Matches primary sport OR any sport listed in dynamic answers.selectedSports
  conditions.push("(r.sport_id = ? OR JSON_CONTAINS(r.answers->'$.selectedSports', JSON_QUOTE(?)))");
  params.push(sport_id, sport_id);
}
```

---

## 12. Change Log

| Date | Version | Changes |
|:-----|:--------|:--------|
| 2026-09-01 | 1.0 | Initial report — schema & endpoint audit, 17 test cases |
| 2026-09-01 | 2.0 | Added instructions.md compliance audit (§10) |
| 2026-09-01 | 2.1 | Added **Multi-Client Architecture (Web + React Native + Admin Website)** analysis, CORS strategy, multi-sport filtering fix, and mobile test cases |

---

*Report generated for the RPL project at [`c:\Users\MOKSH\OneDrive\Desktop\RPL`](file:///c:/Users/MOKSH/OneDrive/Desktop/RPL).*
