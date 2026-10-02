-- Migration 001: Initial RPL Core Schema
CREATE TABLE IF NOT EXISTS rpl_sports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpl_registration_fields (
    id VARCHAR(36) PRIMARY KEY,
    sport_id VARCHAR(50),
    field_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    options JSON DEFAULT NULL,
    validation_rules JSON DEFAULT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES rpl_sports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpl_registrations (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    check_in_date DATE DEFAULT '2026-12-25',
    check_out_date DATE DEFAULT '2026-12-27',
    player_photo_url VARCHAR(500) DEFAULT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_utr VARCHAR(50) DEFAULT NULL,
    payment_receipt_url VARCHAR(500) DEFAULT NULL,
    general_details JSON DEFAULT NULL,
    sport_answers JSON DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
