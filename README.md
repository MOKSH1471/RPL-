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
  - Step 4: Apparel (XS–XXXL), Food Preference (Jain, Swaminarayan, Veg), Logistics
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
├── public/                    # Static assets & icons
├── src/
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── sections/          # HeroSection, AboutSection, LeaguesSection, GallerySection, HowItWorksSection, RegisterSection
│   │   ├── ui/                # Stepper, InView, TextMorph, IntroSplash, GlareCard, MeshGradient, RegistrationTicket
│   │   └── league/            # Dedicated League Sub-Views
│   ├── lib/
│   │   └── validation.ts      # Zod validation schemas
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & types
│   ├── App.tsx                # Main App entry point
│   ├── main.tsx               # React root DOM render
│   └── index.css              # Custom Tailwind & theme utility layer
├── index.html                 # HTML index entry point
├── package.json               # Package dependencies & scripts
├── tailwind.config.js         # Tailwind configuration
└── vite.config.ts             # Vite build configuration
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
