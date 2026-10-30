# 🏏 CricHeroes-Like Features & Data Migration Guide for RPL

> **Document Status:** Reference Guide — covers live scoring features, CricHeroes data extraction, and migration to RPL's custom MySQL database.

---

## Table of Contents

1. [CricHeroes-Like Features to Add](#1-cricheroes-like-features-to-add)
2. [Architecture for Live Scoring](#2-architecture-for-live-scoring)
3. [Exporting Player Data for Auctions (CricAuction)](#3-exporting-player-data-for-auctions-cricauction)
4. [Importing & Managing Individual Rosters](#4-importing--managing-individual-rosters)
5. [Transferring Data FROM CricHeroes — The `cricheroes` Repo](#5-transferring-data-from-cricheroes--the-cricheroes-repo)

---

## 1. CricHeroes-Like Features to Add

Here are the key features CricHeroes offers that can be replicated natively in RPL:

| Feature | CricHeroes Equivalent | How to Build for RPL |
|---|---|---|
| 🔴 **Live Score Updates** | Real-time ball-by-ball scoring | WebSockets (Socket.io) + MySQL |
| 📊 **Match Scorecards** | Full innings breakdown | Structured DB tables + REST API |
| 🏆 **Points Table** | Tournament standings | Computed from match results |
| 👤 **Player Profiles** | Career stats per player | Aggregated from match data |
| 🥇 **Leaderboards** | Top run-scorers, wicket-takers | SQL aggregation queries |
| 📅 **Season History** | Past tournament archives | Season-based data partitioning |
| 🔔 **Score Notifications** | Push alerts for boundaries, wickets | Server-Sent Events or Web Push |
| 📱 **Live Score Ticker** | OBS score overlay widget | Embeddable HTML widget via token URL |
| 🎥 **Match Commentary** | Over-by-over text | Commentary table in DB |

---

## 2. Architecture for Live Scoring

The overall flow for live scoring on RPL works in three layers:

**Scorer Layer** — An admin or designated scorer uses a web/mobile interface to input each ball's outcome (runs, wicket, wide, no-ball etc.) in real time.

**Backend Layer** — The RPL Express server receives each ball event, saves it to MySQL, recalculates the current innings totals, and immediately broadcasts the updated score to all connected viewers via WebSocket.

**Viewer Layer** — Any user watching the live score page receives instant updates pushed from the server without needing to refresh. The same data can power an embeddable score ticker widget for social sharing or OBS overlays.

### Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + Socket.io |
| Database | MySQL — new tables alongside existing RPL schema |
| Frontend | React + Socket.io client |
| Scheduler | node-cron (for periodic syncs from CricHeroes if needed) |

---

## 3. Exporting Player Data for Auctions (CricAuction)

If RPL manages a player auction, CricHeroes provides a **CricAuction Sample Excel** download that can be used to export a clean list of individual players.

This spreadsheet contains the following fields for each player:

| Field | Description |
|---|---|
| **Player Name** | Full name as registered on CricHeroes |
| **Phone Number** | Registered contact number |
| **Age** | Player's age |
| **Cricket Skills** | e.g. Right-hand batsman, Wicketkeeper, etc. |
| **Jersey Size** | As provided during registration |
| **CricHeroes Profile URL** | Direct link to the player's public CricHeroes profile |

### How to Get It

1. Log in to the **CricHeroes Organizer Panel** on your computer.
2. Navigate to your tournament and open the **Players** section.
3. Look for the **Download CricAuction Excel** option.
4. The downloaded file can be directly used to set up an auction or imported into the RPL database for player mapping.

> This is an **official CricHeroes export** — no scraping required, and the data is clean and verified against registered player profiles.

---

## 4. Importing & Managing Individual Rosters

If you want to pull player data down or bulk-edit individual player rosters from your CricHeroes tournament:

### Steps

1. Log into the **CricHeroes Admin Portal** on your computer (not the mobile app).
2. Go to your **Tournament dashboard** and open the **Teams / Players** section.
3. Look for the option to **Download the template spreadsheet** — this contains all registered player details across your teams.
4. You can then:
   - Edit individual rows (e.g. assign players to specific teams, correct names, update roles).
   - **Upload the modified file back** to CricHeroes to sync the changes.
5. Once the roster is finalised on CricHeroes, use the `cricheroes` package (Section 5) or the CricAuction export (Section 3) to pull the confirmed data into the RPL database.

### What This Enables for RPL

| Use Case | Outcome |
|---|---|
| Assign players to auction pools | Clean roster ready for RPL draft/auction |
| Correct player names before import | Accurate data in RPL DB without manual fixes |
| Verify team compositions | Ensure squad data matches official registration |
| Keep RPL DB in sync with CricHeroes rosters | Re-download and re-import after any roster changes |

> This workflow is fully **official and supported** by CricHeroes — no third-party tools needed for roster management.

---

## 5. Transferring Data FROM CricHeroes — The `cricheroes` Repo

> There is **no official CricHeroes API**. The tool you were thinking of is a community-built Python package called **`cricheroes`**, available on PyPI and backed by a GitHub repository. Use this as a fallback when official exports don't cover all the data you need.

### The Repository

- **PyPI Package:** https://pypi.org/project/cricheroes/
- **What it does:** Scrapes publicly visible CricHeroes team pages and returns structured Python objects for teams, players, matches, and leaderboards.
- **Install command:** `pip install cricheroes`

### What It Can Fetch

| Data | Available? |
|---|---|
| Team roster and player names | ✅ Yes |
| Match results and dates | ✅ Yes |
| Team-level statistics | ✅ Yes |
| Batting / bowling leaderboards | ✅ Yes |
| Full ball-by-ball scorecard | ❌ No |
| Live match data | ❌ No |
| Player photos or contact info | ❌ No |

---

### Pros and Cons

| ✅ Pros | ❌ Cons |
|---|---|
| Free to use — no API key or payment needed | Unofficial and community-maintained; no SLA or support |
| Returns clean Python objects, easy to loop and insert into MySQL | Can break silently if CricHeroes changes their site structure |
| Works for any public CricHeroes team page | Requires Python environment (separate from your Node.js backend) |
| Good enough for historical season data and leaderboards | No ball-by-ball or live data — only match-level summaries |
| Only needs the team's CricHeroes URL to start | May require Selenium/ChromeDriver for pages that are JS-rendered |
| Can be scheduled via cron to periodically refresh data | Rate limiting risk — must add delays between requests to avoid being blocked |
| Open source — you can inspect and fix the scraping logic yourself | Data accuracy depends on CricHeroes — no way to verify against an official source |

---

### How the Migration Works (Conceptually)

1. You provide the CricHeroes team URLs for all RPL teams.
2. The Python script uses the `cricheroes` package to fetch players, match results, and leaderboard data for each team.
3. That data is written directly into your `rpl_cricket_stats` MySQL database using the `mysql-connector-python` library.
4. The RPL backend then reads from that database to power scorecards, leaderboards, and player profile pages on the website.
5. The migration can be re-run periodically to pick up new completed matches.

---

*Last updated: September 2026 | RPL Season 9*
