-- Migration 006: Seed Kaccha Pakka League and Spectator Pass into rpl_sports
INSERT INTO rpl_sports (id, name, is_active) VALUES
('kaccha-pakka', 'Kaccha Pakka League', TRUE),
('spectator', 'Spectator Pass', TRUE)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    is_active = VALUES(is_active);
