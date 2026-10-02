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

## 📁 Repository Structure

```text
RPL/
├── database/                  # MySQL DDL Schemas & Seeds
│   ├── db_schema.sql          # Table definitions (rpl_sports, rpl_registration_fields, rpl_registrations)
│   └── db_seed.sql            # Seed sports data & questionnaire fields
│
├── docs/                      # Architectural reports & audits
│   ├── BACKEND_DATABASE_REPORT.md
│   ├── FINAL_AUDIT_AND_IMPROVEMENT_REPORT.md
│   └── INSTRUCTIONS_AUDIT_AND_ROADMAP.md
│
├── public/                    # Static assets, fonts, official payment QR, & compressed photo gallery
│   ├── fonts/                 # Conthrax font assets
│   └── rpl-photos/            # Tournament match photos & WebP thumbnails
│
├── server/                    # Express.js REST API Backend
│   ├── services/              # Accommodation booking & external services
│   ├── db.js                  # MySQL2 connection pool with SSL
│   ├── index.js               # REST API endpoints, Razorpay orders, webhooks, admin auth
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Backend environment configuration
│
├── src/                       # Frontend React Application
│   ├── components/
│   │   ├── admin/             # Admin Portal (Dashboard, Registrations grid, Accommodations, Export)
│   │   ├── layout/            # Navbar, Footer
│   │   ├── league/            # Dedicated League Sub-Views (Cricket, Football, Women's)
│   │   ├── pages/             # Registration wizard, Privacy Policy, Terms & Conditions
│   │   ├── sections/          # Landing sections (Hero, About, Leagues, Schedule, Gallery)
│   │   └── ui/                # UI design system & interactive widgets
│   ├── lib/                   # API client (api.ts), validation, dynamic schemas, export utils
│   ├── types/                 # TypeScript interfaces & types
│   ├── App.tsx                # Client-side router & entry point
│   ├── main.tsx               # React root DOM render
│   └── index.css              # Custom Tailwind & theme utility layer
│
├── index.html                 # HTML index entry point
├── package.json               # Frontend package dependencies & scripts
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript root configuration
├── vercel.json                # Vercel deployment & SPA routing rewrites
└── vite.config.ts             # Vite build configuration (single source of truth)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (Active LTS) installed on your machine.

### Installation

1. Navigate to the project folder:
   ```bash
   cd RPL
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

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
