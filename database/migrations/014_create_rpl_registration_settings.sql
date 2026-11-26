-- Migration: 014_create_rpl_registration_settings.sql
-- Description: Key-value table for admin-configurable registration mode (open / waitlist / closed) and waitlist banner text

CREATE TABLE IF NOT EXISTS rpl_registration_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO rpl_registration_settings (setting_key, setting_value) VALUES
('player_registration_mode', 'open'),
('waitlist_banner_message', 'Player registrations for RPL Season 9 are currently full and accepting Waitlist entries only. Please complete the form below to join the waitlist — we will notify you on WhatsApp with a payment link if a spot opens up. (Spectator registrations are still open!)'),
('closed_message', 'Player registrations for RPL Season 9 are now closed.');
