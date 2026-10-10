-- ========================================================
-- Rollback Script: rollback_cricket.sql
-- Removes cricket tables without affecting existing registration/payment tables
-- ========================================================

DROP TABLE IF EXISTS rpl_cricket_matches;
DROP TABLE IF EXISTS rpl_cricket_teams;
DELETE FROM _rpl_migrations WHERE migration_name = '004_create_cricket_tables.sql';
