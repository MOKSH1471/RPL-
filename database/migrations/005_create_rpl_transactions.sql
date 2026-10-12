-- Migration 005: Create rpl_transactions table if not exists
CREATE TABLE IF NOT EXISTS rpl_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cardno VARCHAR(50) NOT NULL,
    bookingid VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'sports',
    amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    upi_ref VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    updatedBy VARCHAR(100) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    INDEX idx_rpl_tx_order_id (razorpay_order_id),
    INDEX idx_rpl_tx_bookingid (bookingid),
    INDEX idx_rpl_tx_cardno (cardno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
