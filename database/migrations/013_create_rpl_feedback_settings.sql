-- Migration: 013_create_rpl_feedback_settings.sql
-- Description: Key-value table for admin-configurable feedback window, schedule and expiry settings

CREATE TABLE IF NOT EXISTS rpl_feedback_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO rpl_feedback_settings (setting_key, setting_value) VALUES
('rpl_event_status', 'open'),
('rpl_event_expires_at', NULL),
('rpl_event_close_message', 'Feedback collection for RPL Season 9 has now concluded. The organizing committee sincerely thanks every player, captain, and volunteer who shared their thoughts. See you in Season 10!'),
('auction_day_status', 'open'),
('auction_day_expires_at', NULL),
('auction_day_close_message', 'Feedback collection for the RPL Season 9 Auction Ceremony has now concluded. The organizing committee sincerely thanks every attendee who shared their inputs. See you in Season 10!'),
('close_message', 'Feedback collection for RPL Season 9 has now concluded. The organizing committee sincerely thanks every player, captain, and volunteer who shared their thoughts. See you in Season 10!');
