-- Migration 002: Add Performance Indexes for Lookups and Dashboard Queries
CREATE INDEX idx_rpl_reg_mobile ON rpl_registrations (mobile);
CREATE INDEX idx_rpl_reg_payment_status ON rpl_registrations (payment_status);
CREATE INDEX idx_rpl_reg_submitted_at ON rpl_registrations (submitted_at);
