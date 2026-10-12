-- Migration 004: Create rpl_razorpay_webhook audit table (Aashray Audit-First Pattern)
CREATE TABLE IF NOT EXISTS rpl_razorpay_webhook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(100) NULL,
    order_id VARCHAR(100) NULL,
    event VARCHAR(100) NOT NULL,
    json LONGTEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rpl_webhook_payment_id (payment_id),
    INDEX idx_rpl_webhook_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
