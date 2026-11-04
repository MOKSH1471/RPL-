-- Migration 008: Create rpl_admin_users table for RBAC & Role Management
CREATE TABLE IF NOT EXISTS `rpl_admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'SCORECARD_ADMIN',
  `permissions` JSON NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  INDEX `idx_admin_username` (`username`),
  INDEX `idx_admin_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default Super Admin account (username: admin / password: admin@rpl2026)
INSERT INTO `rpl_admin_users` (`username`, `name`, `password_hash`, `role`, `permissions`, `is_active`, `created_by`)
SELECT 'admin', 'RPL Super Admin', '$2b$10$GdZ05z/omJ7lsm2w0wCypeUNJHPyTt6SCdUBvjLO6RfiPNNqs/Az6', 'SUPER_ADMIN', JSON_ARRAY('dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'), TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM `rpl_admin_users` WHERE `username` = 'admin');

-- Seed default Scorecard Admin account (username: scorer / password: scorer@rpl2026)
INSERT INTO `rpl_admin_users` (`username`, `name`, `password_hash`, `role`, `permissions`, `is_active`, `created_by`)
SELECT 'scorer', 'Pitch Match Scorer', '$2b$10$Xib4iYNS/17fTEfNdpGA6uSQM0Jv76BLybBp4NrJ8pvZGfGpeH8Gi', 'SCORECARD_ADMIN', JSON_ARRAY('scorer'), TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM `rpl_admin_users` WHERE `username` = 'scorer');
