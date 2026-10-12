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

CREATE TABLE IF NOT EXISTS rpl_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cardno VARCHAR(50) NOT NULL,
    bookingid VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'sports',
    amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    upi_ref VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    updatedBy VARCHAR(100) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    INDEX idx_rpl_tx_order_id (razorpay_order_id),
    INDEX idx_rpl_tx_bookingid (bookingid),
    INDEX idx_rpl_tx_cardno (cardno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpl_razorpay_webhook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(100) NULL,
    order_id VARCHAR(100) NULL,
    event VARCHAR(100) NOT NULL,
    json LONGTEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rpl_webhook_payment_id (payment_id),
    INDEX idx_rpl_webhook_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
