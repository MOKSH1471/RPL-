-- Migration: 012_create_rpl_feedbacks.sql
-- Description: Creates a single unified feedback table for RPL Season 9 (Main Event & Auction Day)

CREATE TABLE IF NOT EXISTS rpl_feedbacks (
    id VARCHAR(36) PRIMARY KEY,
    form_type VARCHAR(50) NOT NULL, -- 'rpl_event' or 'auction_day'
    mobile VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    ratings JSON NOT NULL,
    overall_rating TINYINT DEFAULT NULL,
    feedback_text TEXT DEFAULT NULL,
    wow_moment TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feedback_form_type (form_type),
    INDEX idx_feedback_mobile (mobile),
    INDEX idx_feedback_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

