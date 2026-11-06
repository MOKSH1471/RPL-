-- Migration 009: Harden admin security with must_change_password and token_version
ALTER TABLE `rpl_admin_users`
ADD COLUMN `must_change_password` BOOLEAN DEFAULT FALSE AFTER `is_active`,
ADD COLUMN `token_version` INT DEFAULT 1 AFTER `must_change_password`;

-- Flag default seed accounts to force password change on first login
UPDATE `rpl_admin_users`
SET `must_change_password` = TRUE
WHERE `username` IN ('admin', 'scorer');

