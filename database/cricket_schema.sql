-- ========================================================
-- RPL Native Cricket Database Schema
-- Focus: Live Scoring, Scorecards, Leaderboards, Squads & OBS Overlays
-- Safe execution: Uses IF NOT EXISTS
-- ========================================================

-- 1. Tournaments
CREATE TABLE IF NOT EXISTS rpl_cricket_tournaments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    season_name VARCHAR(50) NOT NULL DEFAULT 'RPL Season 9',
    format ENUM('T10', 'T20', 'BOX', 'CUSTOM') DEFAULT 'T10',
    overs_per_side INT NOT NULL DEFAULT 10,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Teams
CREATE TABLE IF NOT EXISTS rpl_cricket_teams (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url VARCHAR(500),
    color_code VARCHAR(20) DEFAULT '#00E5FF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES rpl_cricket_tournaments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Players (Linked to portal registrations where applicable)
CREATE TABLE IF NOT EXISTS rpl_cricket_players (
    id VARCHAR(36) PRIMARY KEY,
    registration_id VARCHAR(36) DEFAULT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('batsman', 'bowler', 'all_rounder', 'wicket_keeper') DEFAULT 'all_rounder',
    batting_style VARCHAR(50) DEFAULT 'Right Hand Bat',
    bowling_style VARCHAR(50) DEFAULT 'Right Arm Medium',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES rpl_registrations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Team Squads
CREATE TABLE IF NOT EXISTS rpl_cricket_squads (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    jersey_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES rpl_cricket_tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES rpl_cricket_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES rpl_cricket_players(id) ON DELETE CASCADE,
    UNIQUE KEY uq_tournament_player (tournament_id, player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Matches & Fixtures
CREATE TABLE IF NOT EXISTS rpl_cricket_matches (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    match_number INT NOT NULL,
    stage VARCHAR(50) DEFAULT 'League',
    team_a_id VARCHAR(36) NOT NULL,
    team_b_id VARCHAR(36) NOT NULL,
    venue VARCHAR(100) DEFAULT 'RPL Main Ground',
    match_datetime DATETIME,
    overs_per_side INT NOT NULL DEFAULT 10,
    toss_winner_team_id VARCHAR(36),
    toss_decision ENUM('bat', 'bowl'),
    status ENUM('upcoming', 'live', 'innings_break', 'completed', 'abandoned') DEFAULT 'upcoming',
    winner_team_id VARCHAR(36),
    result_summary VARCHAR(255),
    player_of_the_match_id VARCHAR(36),
    stream_overlay_token VARCHAR(64) UNIQUE, -- Public token for OBS Live Ticker
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES rpl_cricket_tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team_a_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (team_b_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (toss_winner_team_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (winner_team_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (player_of_the_match_id) REFERENCES rpl_cricket_players(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Innings
CREATE TABLE IF NOT EXISTS rpl_cricket_innings (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) NOT NULL,
    innings_number TINYINT NOT NULL, -- 1 or 2
    batting_team_id VARCHAR(36) NOT NULL,
    bowling_team_id VARCHAR(36) NOT NULL,
    total_runs INT DEFAULT 0,
    total_wickets INT DEFAULT 0,
    legal_balls_bowled INT DEFAULT 0,
    extras_wides INT DEFAULT 0,
    extras_noballs INT DEFAULT 0,
    extras_byes INT DEFAULT 0,
    extras_legbyes INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (match_id) REFERENCES rpl_cricket_matches(id) ON DELETE CASCADE,
    FOREIGN KEY (batting_team_id) REFERENCES rpl_cricket_teams(id),
    FOREIGN KEY (bowling_team_id) REFERENCES rpl_cricket_teams(id),
    UNIQUE KEY uq_match_innings (match_id, innings_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Real-Time Ball-by-Ball & Commentary
CREATE TABLE IF NOT EXISTS rpl_cricket_balls (
    id VARCHAR(36) PRIMARY KEY,
    innings_id VARCHAR(36) NOT NULL,
    over_number INT NOT NULL,
    ball_in_over INT NOT NULL,
    legal_ball_number INT NOT NULL,
    bowler_id VARCHAR(36) NOT NULL,
    striker_id VARCHAR(36) NOT NULL,
    non_striker_id VARCHAR(36) NOT NULL,
    runs_scored TINYINT DEFAULT 0,
    is_extra BOOLEAN DEFAULT FALSE,
    extra_type ENUM('none', 'wide', 'noball', 'bye', 'legbye') DEFAULT 'none',
    extra_runs TINYINT DEFAULT 0,
    is_wicket BOOLEAN DEFAULT FALSE,
    wicket_type ENUM('none', 'bowled', 'caught', 'run_out', 'lbw', 'stumped', 'hit_wicket') DEFAULT 'none',
    dismissed_player_id VARCHAR(36) DEFAULT NULL,
    fielder_id VARCHAR(36) DEFAULT NULL,
    commentary_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (innings_id) REFERENCES rpl_cricket_innings(id) ON DELETE CASCADE,
    FOREIGN KEY (bowler_id) REFERENCES rpl_cricket_players(id),
    FOREIGN KEY (striker_id) REFERENCES rpl_cricket_players(id),
    FOREIGN KEY (non_striker_id) REFERENCES rpl_cricket_players(id),
    FOREIGN KEY (dismissed_player_id) REFERENCES rpl_cricket_players(id),
    FOREIGN KEY (fielder_id) REFERENCES rpl_cricket_players(id),
    INDEX idx_innings_balls (innings_id, over_number, ball_in_over)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Batting Scorecards
CREATE TABLE IF NOT EXISTS rpl_cricket_batting_scorecards (
    id VARCHAR(36) PRIMARY KEY,
    innings_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    batting_position INT,
    runs INT DEFAULT 0,
    balls_faced INT DEFAULT 0,
    fours INT DEFAULT 0,
    sixes INT DEFAULT 0,
    strike_rate DECIMAL(6, 2) DEFAULT 0.00,
    is_out BOOLEAN DEFAULT FALSE,
    dismissal_text VARCHAR(100),
    bowler_id VARCHAR(36),
    fielder_id VARCHAR(36),
    FOREIGN KEY (innings_id) REFERENCES rpl_cricket_innings(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES rpl_cricket_players(id) ON DELETE CASCADE,
    UNIQUE KEY uq_innings_batsman (innings_id, player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bowling Scorecards
CREATE TABLE IF NOT EXISTS rpl_cricket_bowling_scorecards (
    id VARCHAR(36) PRIMARY KEY,
    innings_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    legal_balls_bowled INT DEFAULT 0,
    maidens INT DEFAULT 0,
    runs_conceded INT DEFAULT 0,
    wickets INT DEFAULT 0,
    economy DECIMAL(5, 2) DEFAULT 0.00,
    wides INT DEFAULT 0,
    noballs INT DEFAULT 0,
    FOREIGN KEY (innings_id) REFERENCES rpl_cricket_innings(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES rpl_cricket_players(id) ON DELETE CASCADE,
    UNIQUE KEY uq_innings_bowler (innings_id, player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Points Table
CREATE TABLE IF NOT EXISTS rpl_cricket_points_table (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    lost INT DEFAULT 0,
    tied INT DEFAULT 0,
    no_result INT DEFAULT 0,
    points INT DEFAULT 0,
    net_run_rate DECIMAL(6, 3) DEFAULT 0.000,
    FOREIGN KEY (tournament_id) REFERENCES rpl_cricket_tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES rpl_cricket_teams(id) ON DELETE CASCADE,
    UNIQUE KEY uq_tourney_team (tournament_id, team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
