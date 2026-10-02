-- Migration 003: Align table collations and add performance indexes for Razorpay order lookups and mobile searches
ALTER TABLE rpl_transactions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE rpl_razorpay_webhook CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_rpl_tx_order_id ON rpl_transactions (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_rpl_reg_mobile ON rpl_registrations (mobile);
