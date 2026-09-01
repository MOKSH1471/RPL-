-- MySQL Dynamic Registration Schema for RPL
-- Creates prefixed tables in your connected database (aashray)

-- Optional Cleanup: Remove previous un-prefixed tables if they exist
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS registration_fields;
DROP TABLE IF EXISTS sports;

-- 1. RPL Sports / Categories
CREATE TABLE IF NOT EXISTS rpl_sports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RPL Registration Fields (Questions configuration)
CREATE TABLE IF NOT EXISTS rpl_registration_fields (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    sport_id VARCHAR(50),
    field_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'select', 'multiselect', 'date', 'file'
    options JSON DEFAULT NULL,       -- List of dropdown options
    validation_rules JSON DEFAULT NULL, -- {'required': true, 'min': 2, etc.}
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES rpl_sports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. RPL Registrations (Submissions)
CREATE TABLE IF NOT EXISTS rpl_registrations (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    sport_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    player_photo_url VARCHAR(500) DEFAULT NULL, -- Clean Google Drive or card_db photo URL
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    payment_utr VARCHAR(50) DEFAULT NULL, -- 12-digit UPI UTR / Transaction Reference
    payment_receipt_url VARCHAR(500) DEFAULT NULL, -- Clean Google Drive receipt URL
    general_details JSON DEFAULT NULL, -- Clean basic details & selected sports
    sport_answers JSON DEFAULT NULL, -- Sport-specific questionnaire grouped by sport
    answers JSON NOT NULL, -- Consolidated responses
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES rpl_sports(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
