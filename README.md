# Raj Premier League (RPL Season 9) — Registration Web Application

> **Annual Community Sports Championship**  
> A high-performance, vibrant single-page web application featuring multi-league registration, interactive options stepper, Motion navigation, and auto-generated digital pass tickets.

---

## 🌟 Features & Highlights

- **Vibrant & Positive Design System**: Crisp light canvas (`#F8FAFC`) with radiant ambient mesh lighting (Warm Gold, Fresh Emerald, Soft Rose) reflecting sportsmanship and positivity.
- **Three Championship Arenas**:
  - 🏏 **Cricket League**: Flagship T20 leather ball championship under stadium lights.
  - ⚽ **Football League**: 7-a-side turf knockouts with Golden Boot awards.
  - 🏐 **Women's Sports League**: Multi-sport tournament featuring Cricket, Football, and Throwball.
- **Interactive 5-Step Options Stepper**:
  - Step 1: Arena Choice & Gmail Dispatch Target Configuration
  - Step 2: Personal & Contact Information (+91 Mobile, Email, DOB, Centre)
  - Step 3: Photo Upload with Live Preview & RPL Identity
  - Step 4: Apparel (XS–XXXL), Food Preference (Regular, Non-Spicy), Logistics
  - Step 5: League-Specific Position Questionnaire (Batter, Bowler, Striker, Category)
- **Gmail Auto-Dispatch Integration**: Submitting the form automatically launches a pre-filled Gmail compose URL with structured registration details ready to send.
- **Digital Sports Pass Ticket**: Generates an instant pass ticket complete with QR code entry badge and confetti celebration.
- **Motion Navigation Menu**: Fixed header with spring-eased scroll threshold transitions, layout-animated active section indicators, and mobile drawer scroll locking.
- **Mobile-First Touch Optimization**: 48px minimum tap targets, native mobile input keypads (`inputMode="tel"`, `inputMode="email"`), and zero-layout-shift scroll reveals.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | React 18 + Vite |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS + Vanilla CSS Tokens |
| **Motion Engine** | Framer Motion / Motion Primitives |
| **Forms & Validation** | React Hook Form + Zod Schema Validation |
| **Icons** | Lucide React |
| **Effects** | Canvas Confetti |

---

## 📁 Repository Structure (Monorepo)

```text
RPL/
├── apps/
│   ├── web/                   # [PUBLIC] React 18 + Vite Registration Portal
│   │   ├── src/               # Landing sections, dynamic multi-sport registration wizard, Razorpay checkout
│   │   ├── public/            # Static assets & tournament photos
│   │   ├── package.json       # Workspace: @rpl/web
│   │   ├── vite.config.ts
│   │   └── vercel.json        # Single Page App routing rewrites
│   │
│   ├── admin/                 # [ADMIN] Dedicated React 18 + Vite Management Portal
│   │   ├── src/               # KPI dashboard, registrations grid, payment approval, room allocations, CSV exporter
│   │   ├── package.json       # Workspace: @rpl/admin
│   │   ├── vite.config.ts
│   │   └── vercel.json
│   │
│   └── api/                   # [BACKEND] Express.js REST API
│       ├── src/               # Modular config, routes (sports, lookup, razorpay, admin), utils
│       ├── services/          # Accommodation booking logic
│       ├── index.js           # Express app bootstrap
│       └── package.json       # Workspace: @rpl/api
│
├── server/                    # Backward-compatible backend mirror (for Render deployments)
├── database/                  # MySQL DDL Schemas & Seeds
│   ├── db_schema.sql          # Table definitions (rpl_sports, rpl_registration_fields, rpl_registrations)
│   └── db_seed.sql            # Seed sports data & questionnaire fields
│
├── docs/                      # Architectural reports & audits
│   ├── BACKEND_DATABASE_REPORT.md
│   ├── FINAL_AUDIT_AND_IMPROVEMENT_REPORT.md
│   └── INSTRUCTIONS_AUDIT_AND_ROADMAP.md
│
├── package.json               # Root monorepo workspace orchestrator
└── README.md
```

---

## 🚀 Getting Started

### Installation
From the repository root, install dependencies across all apps:
```bash
npm install
```

### Local Development
* **Run Public User Site**: `npm run dev:web` (or `npm run dev`)
* **Run Admin Dashboard**: `npm run dev:admin`
* **Run Backend API Server**: `npm run dev:api` (or `npm run server`)

### Production Builds
* **Build Public Web App**: `npm run build:web`
* **Build Admin App**: `npm run build:admin`
* **Build Everything**: `npm run build:all`

4. To test on mobile devices connected to the same Wi-Fi network:
   ```bash
   npm run dev -- --host
   ```

---

## 📦 Production Build

To compile a production-ready bundle:

```bash
npm run build
```

The optimized output will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🛡️ Git & Security Hygiene

- **Secrets & Credentials**: Private `.env` configuration files and `node_modules/` are excluded via `.gitignore` and `.cursorignore`.
- **Target Repository Placement**: Designed to sit under `admin/RPL/` inside the **`SRATRC/aashray-admin`** GitHub repository.

---

© 2026 Raj Premier League (RPL Season 9). All rights reserved.
