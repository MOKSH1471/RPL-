import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { RPL_DB } from '../apps/api/src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEAMS_DATA = [
  {
    id: 'team-raj-tigers',
    name: 'Raj Tigers',
    short_name: 'RT',
    color_code: '#D97706',
    players: JSON.stringify([
      { id: 'rt-1', name: 'Rohit Sharma (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 45 },
      { id: 'rt-2', name: 'Virat Kohli', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 18 },
      { id: 'rt-3', name: 'Suryakumar Yadav', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 63 },
      { id: 'rt-4', name: 'Rishabh Pant (WK)', role: 'Wicketkeeper', battingStyle: 'Left Hand Bat', jerseyNumber: 17 },
      { id: 'rt-5', name: 'Hardik Pandya', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast Medium', jerseyNumber: 33 },
      { id: 'rt-6', name: 'Ravindra Jadeja', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Orthodox', jerseyNumber: 8 },
      { id: 'rt-7', name: 'Axar Patel', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Orthodox', jerseyNumber: 20 },
      { id: 'rt-8', name: 'Jasprit Bumrah', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 93 },
      { id: 'rt-9', name: 'Mohammed Shami', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 11 },
      { id: 'rt-10', name: 'Kuldeep Yadav', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Wrist Spin', jerseyNumber: 23 },
      { id: 'rt-11', name: 'Arshdeep Singh', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Fast Medium', jerseyNumber: 2 },
      { id: 'rt-12', name: 'Sanju Samson', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 9 },
    ]),
  },
  {
    id: 'team-patan-panthers',
    name: 'Patan Panthers',
    short_name: 'PP',
    color_code: '#0891B2',
    players: JSON.stringify([
      { id: 'pp-1', name: 'Shubman Gill (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 77 },
      { id: 'pp-2', name: 'KL Rahul (WK)', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 1 },
      { id: 'pp-3', name: 'Shreyas Iyer', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 96 },
      { id: 'pp-4', name: 'Shivam Dube', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Medium', jerseyNumber: 25 },
      { id: 'pp-5', name: 'Rinku Singh', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 35 },
      { id: 'pp-6', name: 'Washington Sundar', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Off Spin', jerseyNumber: 5 },
      { id: 'pp-7', name: 'Nitish Kumar Reddy', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 27 },
      { id: 'pp-8', name: 'Bhuvneshwar Kumar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 15 },
      { id: 'pp-9', name: 'Mohammed Siraj', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 73 },
      { id: 'pp-10', name: 'Yuzvendra Chahal', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 3 },
      { id: 'pp-11', name: 'Avesh Khan', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 6 },
      { id: 'pp-12', name: 'Jitesh Sharma', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 99 },
    ]),
  },
  {
    id: 'team-aravalli-eagles',
    name: 'Aravalli Eagles',
    short_name: 'AE',
    color_code: '#059669',
    players: JSON.stringify([
      { id: 'ae-1', name: 'Ruturaj Gaikwad (C)', role: 'Batter', battingStyle: 'Right Hand Bat', jerseyNumber: 31 },
      { id: 'ae-2', name: 'Yashasvi Jaiswal', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 64 },
      { id: 'ae-3', name: 'Tilak Varma', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 72 },
      { id: 'ae-4', name: 'Ishan Kishan (WK)', role: 'Wicketkeeper', battingStyle: 'Left Hand Bat', jerseyNumber: 32 },
      { id: 'ae-5', name: 'Deepak Hooda', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Off Spin', jerseyNumber: 57 },
      { id: 'ae-6', name: 'Shardul Thakur', role: 'All-rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 54 },
      { id: 'ae-7', name: 'Harshit Rana', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 22 },
      { id: 'ae-8', name: 'Ravi Bishnoi', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 56 },
      { id: 'ae-9', name: 'Prasidh Krishna', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Fast', jerseyNumber: 24 },
      { id: 'ae-10', name: 'Mukesh Kumar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium Fast', jerseyNumber: 49 },
      { id: 'ae-11', name: 'Mayank Yadav', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Express Fast', jerseyNumber: 14 },
    ]),
  },
  {
    id: 'team-royal-strikers',
    name: 'Mewar Strikers',
    short_name: 'MS',
    color_code: '#7C3AED',
    players: JSON.stringify([
      { id: 'ms-1', name: 'Devdutt Padikkal', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 37 },
      { id: 'ms-2', name: 'Abhishek Sharma', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Slow Left Arm', jerseyNumber: 4 },
      { id: 'ms-3', name: 'Sai Sudharsan', role: 'Batter', battingStyle: 'Left Hand Bat', jerseyNumber: 21 },
      { id: 'ms-4', name: 'Dhruv Jurel (WK)', role: 'Wicketkeeper', battingStyle: 'Right Hand Bat', jerseyNumber: 16 },
      { id: 'ms-5', name: 'Rahul Tewatia', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right Arm Leg Spin', jerseyNumber: 92 },
      { id: 'ms-6', name: 'Shahbaz Ahmed', role: 'All-rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Slow Left Arm', jerseyNumber: 29 },
      { id: 'ms-7', name: 'Deepak Chahar', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Medium', jerseyNumber: 90 },
      { id: 'ms-8', name: 'Umran Malik', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Express Fast', jerseyNumber: 28 },
      { id: 'ms-9', name: 'Varun Chakaravarthy', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right Arm Mystery Spin', jerseyNumber: 26 },
      { id: 'ms-10', name: 'Khaleel Ahmed', role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Left Arm Fast Medium', jerseyNumber: 71 },
      { id: 'ms-11', name: 'T Natarajan', role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left Arm Medium Fast', jerseyNumber: 44 },
    ]),
  },
];

async function applyCricketModule() {
  console.log('🚀 [CRICKET DB] Applying Cricket Module directly to database:', RPL_DB);

  try {
    // 1. Create Tables directly
    console.log('⚡ [CRICKET DB] Creating rpl_cricket_teams table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rpl_cricket_teams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(10) NOT NULL,
        logo_url VARCHAR(500) DEFAULT NULL,
        color_code VARCHAR(20) DEFAULT '#F59E0B',
        players JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('⚡ [CRICKET DB] Creating rpl_cricket_matches table...');
    await pool.query(`
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
        INDEX idx_match_status (status),
        INDEX idx_match_number (match_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ [CRICKET DB] Tables rpl_cricket_teams and rpl_cricket_matches are ready!');

    // 2. Seed the 4 demo teams from the UI into the DB
    console.log('🏏 [CRICKET DB] Seeding 4 Teams (Raj Tigers, Patan Panthers, Aravalli Eagles, Mewar Strikers)...');
    for (const team of TEAMS_DATA) {
      await pool.query(
        `INSERT INTO rpl_cricket_teams (id, name, short_name, color_code, players)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           short_name = VALUES(short_name),
           color_code = VALUES(color_code),
           players = VALUES(players)`,
        [team.id, team.name, team.short_name, team.color_code, team.players]
      );
    }
    console.log('✅ [CRICKET DB] All 4 Teams seeded successfully!');

    // 3. Seed Initial Match (Match 1)
    const initialInnings1 = {
      inningsNumber: 1,
      battingTeamId: 'team-raj-tigers',
      bowlingTeamId: 'team-patan-panthers',
      totalRuns: 0,
      totalWickets: 0,
      legalBallsBowled: 0,
      extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
      activeStrikerId: 'rt-1',
      activeNonStrikerId: 'rt-2',
      activeBowlerId: 'pp-8',
      batsmen: [
        { playerId: 'rt-1', name: 'Rohit Sharma (C)', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isStriker: true, isOut: false },
        { playerId: 'rt-2', name: 'Virat Kohli', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isStriker: false, isOut: false }
      ],
      bowlers: [
        { playerId: 'pp-8', name: 'Bhuvneshwar Kumar', legalBalls: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0, wides: 0, noballs: 0 }
      ],
      balls: [],
      currentOverBalls: [],
      fallOfWickets: [],
      isCompleted: false,
    };

    await pool.query(
      `INSERT INTO rpl_cricket_matches 
        (id, tournament_name, match_number, stage, venue, overs_per_side, team_a_id, team_b_id, toss_winner_id, toss_decision, status, current_innings_number, innings1, stream_overlay_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         match_number = VALUES(match_number)`,
      [
        'match-rpl-s9-01',
        'RPL Season 9 Premier Cup',
        1,
        'League Match 1',
        'RPL Main Stadium (Under Floodlights)',
        10,
        'team-raj-tigers',
        'team-patan-panthers',
        'team-raj-tigers',
        'bat',
        'live',
        1,
        JSON.stringify(initialInnings1),
        'rpl_obs_live_89f41b2c'
      ]
    );
    console.log('✅ [CRICKET DB] Initial Match seeded into rpl_cricket_matches!');

    console.log('🎉 [CRICKET DB] Done! Open Beekeeper Studio and refresh to see the 2 new entities with seeded data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ [CRICKET DB] Error applying cricket module:', err);
    process.exit(1);
  }
}

applyCricketModule();
