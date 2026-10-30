-- ========================================================
-- Migration: 004_create_cricket_tables.sql
-- Description: Creates 2 lightweight hybrid tables for RPL Cricket Scorer
-- ========================================================

CREATE TABLE IF NOT EXISTS rpl_cricket_teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    color_code VARCHAR(20) DEFAULT '#F59E0B',
    players JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
