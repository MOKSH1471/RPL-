# RPL Cricket Scorer — Database Impact & Migration Report

**Document Version:** 1.0  
**Target Environment:** Production / Staging MySQL Database  
**Author:** Engineering Team  
**Review Status:** Pending Stakeholder Approval  
**Risk Level:** **Low / Zero-Breaking Risk**  

---

## 1. Executive Summary

This report outlines the proposed database changes required to enable **Cricket Match Scheduling**, **Toss Results**, **Live Ball-by-Ball Scoring**, and **Scorecard Publishing** within the RPL platform.

* **Current Database Footprint:** **6 tables** (dedicated strictly to Registrations and Razorpay Payments).
* **Proposed Addition:** Exactly **2 new tables** (`rpl_cricket_teams` and `rpl_cricket_matches`).
* **Existing Data Impact:** **ZERO.** No existing tables, columns, indexes, or records will be dropped, altered, or locked.
* **Estimated Execution Time:** < 100 milliseconds.
* **Downtime Required:** **0 seconds** (can be executed while the server is live).

---

## 2. Current vs. Proposed Database State

### Current State (Beekeeper Studio: 6 Entities)
| Table Name | Purpose | Impact by this Proposal |
|---|---|---|
| `_rpl_migrations` | Migration version tracking | Unchanged |
| `rpl_razorpay_webhook` | Payment event logs | Unchanged |
| `rpl_registration_fields` | Dynamic form questions | Unchanged |
| `rpl_registrations` | Participant profiles & signups | Unchanged |
| `rpl_sports` | Sports list (Badminton, Cricket, etc.) | Unchanged |
| `rpl_transactions` | Payment verification receipts | Unchanged |

---

### Proposed State (Beekeeper Studio: 8 Entities)
| Table Name | Type | Purpose |
|---|---|---|
| `rpl_cricket_teams` | **NEW** | Stores teams (*Raj Tigers, Patan Panthers*) and their full player squads inside a structured `players JSON` column. |
| `rpl_cricket_matches` | **NEW** | Stores the entire match fixture (overs, toss, venue, status) and full live scoring state inside `innings1 JSON` and `innings2 JSON`. |

---

## 3. Detailed Table Specifications

### Table 1: `rpl_cricket_teams`
Stores team identities and their squad rosters.

```sql
CREATE TABLE IF NOT EXISTS rpl_cricket_teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    color_code VARCHAR(20) DEFAULT '#F59E0B',
    players JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Sample `players JSON` Structure:
```json
[
  {
    "id": "p-01",
    "name": "Shubman Gill",
    "role": "batsman",
    "battingStyle": "Right Hand Bat",
    "bowlingStyle": "Right Arm Off-break",
    "isCaptain": true
  },
  {
    "id": "p-02",
    "name": "Mohammed Shami",
    "role": "bowler",
    "battingStyle": "Right Hand Bat",
    "bowlingStyle": "Right Arm Fast"
  }
]
```

---

### Table 2: `rpl_cricket_matches`
Stores match scheduling, toss outcomes, live state, and complete delivery logs.

```sql
CREATE TABLE IF NOT EXISTS rpl_cricket_matches (
    id VARCHAR(50) PRIMARY KEY,
    tournament_name VARCHAR(100) NOT NULL DEFAULT 'RPL Season 9 Premier Cup',
    match_number INT NOT NULL,
    stage VARCHAR(50) DEFAULT 'League Match',
    venue VARCHAR(100) DEFAULT 'RPL Main Stadium',
    overs_per_side INT NOT NULL DEFAULT 10,
    
    -- Teams
    team_a_id VARCHAR(50) NOT NULL,
    team_b_id VARCHAR(50) NOT NULL,
    
    -- Toss
    toss_winner_id VARCHAR(50) DEFAULT NULL,
    toss_decision ENUM('bat', 'bowl') DEFAULT NULL,
    
    -- Match Status & Result
    status ENUM('upcoming', 'live', 'completed', 'abandoned') DEFAULT 'upcoming',
    winner_team_id VARCHAR(50) DEFAULT NULL,
    result_summary VARCHAR(255) DEFAULT NULL,
    
    -- Complete Live Scorecard & Delivery Log (JSON)
    current_innings_number TINYINT DEFAULT 1,
    target INT DEFAULT NULL,
    innings1 JSON DEFAULT NULL,
    innings2 JSON DEFAULT NULL,
    
    -- Broadcast & Timestamps
    stream_overlay_token VARCHAR(64) UNIQUE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_a_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (team_b_id) REFERENCES rpl_cricket_teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### What Is Stored Inside `innings1` and `innings2` JSON:
* **Runs & Overs:** `totalRuns`, `totalWickets`, `legalBallsBowled`.
* **Extras:** `wides`, `noballs`, `byes`, `legbyes`.
* **Batting Figures:** List of batsmen with runs, balls, 4s, 6s, strike rate, dismissal text.
* **Bowling Figures:** List of bowlers with overs, runs conceded, wickets, maidens, economy.
* **Ball-by-Ball Log:** Full history of every ball bowled with commentary and fall of wickets.

---

## 4. Architecture Rationale: Why 2 Tables Instead of 10?

| Aspect | 2-Table Hybrid Model (Selected) | 10-Table Strict Relational Model |
|---|---|---|
| **Beekeeper Studio Clutter** | **Clean**: Adds only 2 tables (Total: 8). | Cluttered: Adds 10 tables (Total: 16). |
| **Architectural Consistency** | Aligns with existing `rpl_registrations` schema which already uses `general_details JSON` and `sport_answers JSON`. | Diverges from existing codebase design. |
| **Query Complexity** | **1 query (`O(1)`)**: Fetches or saves the entire match instantly. | **Complex**: Requires 6-way SQL `JOIN` statements across tables on every ball. |
| **Write Performance** | Writing 1 ball update takes **1 atomic write**. | Requires separate inserts into `rpl_cricket_balls`, `rpl_cricket_batting_scorecards`, etc. |
| **Maintenance** | Schema stays clean and simple for RPL tournaments. | High overhead: 10 migration scripts, complex foreign key cascades. |

---

## 5. Risk Assessment & Safety Guarantees

1. **Isolation of Existing Tables:**
   * The new tables use the isolated namespace prefix `rpl_cricket_*`.
   * Neither `rpl_registrations` nor `rpl_transactions` will have any schema modifications.
2. **Transaction Safety:**
   * Script uses `CREATE TABLE IF NOT EXISTS`. Running the script multiple times is idempotent and completely safe.
3. **Rollback Strategy:**
   * If for any reason these tables need to be uninstalled, the rollback is completely risk-free and self-contained:
   ```sql
   DROP TABLE IF EXISTS rpl_cricket_matches;
   DROP TABLE IF EXISTS rpl_cricket_teams;
   ```
   * Rolling back has **zero effect** on registrations, payments, or other sports.

---

## 6. Ready-to-Run Migration Script

The entire change can be executed in a single command in **Beekeeper Studio** or any MySQL CLI:

```sql
-- ========================================================
-- RPL Cricket Module Database Migration
-- Safe & Idempotent (Leaves all existing 6 tables untouched)
-- ========================================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS rpl_cricket_teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    color_code VARCHAR(20) DEFAULT '#F59E0B',
    players JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Matches Table
CREATE TABLE IF NOT EXISTS rpl_cricket_matches (
    id VARCHAR(50) PRIMARY KEY,
    tournament_name VARCHAR(100) NOT NULL DEFAULT 'RPL Season 9 Premier Cup',
    match_number INT NOT NULL,
    stage VARCHAR(50) DEFAULT 'League Match',
    venue VARCHAR(100) DEFAULT 'RPL Main Stadium',
    overs_per_side INT NOT NULL DEFAULT 10,
    
    team_a_id VARCHAR(50) NOT NULL,
    team_b_id VARCHAR(50) NOT NULL,
    
    toss_winner_id VARCHAR(50) DEFAULT NULL,
    toss_decision ENUM('bat', 'bowl') DEFAULT NULL,
    
    status ENUM('upcoming', 'live', 'completed', 'abandoned') DEFAULT 'upcoming',
    winner_team_id VARCHAR(50) DEFAULT NULL,
    result_summary VARCHAR(255) DEFAULT NULL,
    
    current_innings_number TINYINT DEFAULT 1,
    target INT DEFAULT NULL,
    innings1 JSON DEFAULT NULL,
    innings2 JSON DEFAULT NULL,
    
    stream_overlay_token VARCHAR(64) UNIQUE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_a_id) REFERENCES rpl_cricket_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team_b_id) REFERENCES rpl_cricket_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. Approval Sign-Off

| Role | Name | Signature / Status | Date |
|---|---|---|---|
| Lead Developer | | `Approved` | 2026-10-10 |
| Database Administrator | | `Pending Review` | |
| Project Stakeholder | | `Pending Review` | |
