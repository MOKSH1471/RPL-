-- Migration 007: Add archived_at column to rpl_registrations
ALTER TABLE rpl_registrations ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER is_archived;
