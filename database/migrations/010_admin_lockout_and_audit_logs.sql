-- Migration 010: Add account lockout columns and login audit log table
ALTER TABLE `rpl_admin_users`
ADD COLUMN `failed_login_attempts` INT DEFAULT 0 AFTER `token_version`,
ADD COLUMN `locked_until` TIMESTAMP NULL AFTER `failed_login_attempts`;

CREATE TABLE IF NOT EXISTS `rpl_admin_login_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `username` VARCHAR(50) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_login_logs_user` (`username`, `attempted_at`),
  INDEX `idx_login_logs_attempted` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

