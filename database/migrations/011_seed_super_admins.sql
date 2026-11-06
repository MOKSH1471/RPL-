-- Migration 011: Seed additional Super Admin accounts (shraddha.maniar, tejas.maniar, vinit.haria)
INSERT INTO `rpl_admin_users` (`username`, `name`, `password_hash`, `role`, `permissions`, `is_active`, `must_change_password`, `created_by`)
SELECT 'shraddha.maniar', 'Shraddha Maniar', '$2b$10$FJZOgeZqPhRrKD9gwunS5OEA2XLFxHxusSgiUQ1w4JxSWJCI37xJu', 'SUPER_ADMIN', JSON_ARRAY('dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'), TRUE, TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM `rpl_admin_users` WHERE `username` = 'shraddha.maniar');

INSERT INTO `rpl_admin_users` (`username`, `name`, `password_hash`, `role`, `permissions`, `is_active`, `must_change_password`, `created_by`)
SELECT 'tejas.maniar', 'Tejas Maniar', '$2b$10$KQotKnxarhcT5jnPydIjcuDWoURJ6cqNYuT1SDfLhDtVyJQ3DqyY2', 'SUPER_ADMIN', JSON_ARRAY('dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'), TRUE, TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM `rpl_admin_users` WHERE `username` = 'tejas.maniar');

INSERT INTO `rpl_admin_users` (`username`, `name`, `password_hash`, `role`, `permissions`, `is_active`, `must_change_password`, `created_by`)
SELECT 'vinit.haria', 'Vinit Haria', '$2b$10$ltGxxNVz1WRPbbKXYS9sWudjfICdQikszBuqo3vPQ8ggtZ.VfWAaO', 'SUPER_ADMIN', JSON_ARRAY('dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'), TRUE, TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM `rpl_admin_users` WHERE `username` = 'vinit.haria');
