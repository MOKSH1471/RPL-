-- Seed Data for RPL Database
-- Populates questions and sports in your connected database (e.g. aashray)

-- 1. Seed Sports into rpl_sports
INSERT INTO rpl_sports (id, name, is_active) VALUES
('cricket', 'Cricket League', TRUE),
('football', 'Football League', TRUE),
('badminton', 'Badminton League', TRUE),
('table-tennis', 'Table Tennis League', TRUE),
('pickleball', 'Pickleball League', TRUE),
('volleyball', 'Volleyball / Throwball League', TRUE),
('womens-sports', 'Womens Sports League', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), is_active=VALUES(is_active);

-- 2. Seed Fields into rpl_registration_fields
INSERT INTO rpl_registration_fields (id, sport_id, field_key, label, field_type, options, validation_rules, sort_order) VALUES
-- Common Fields (Identity & Logistics)
('f_full_name', NULL, 'full_name', 'Full Name', 'text', NULL, '{"required": true, "min": 2, "max": 60}', 1),
('f_mobile', NULL, 'mobile_number', 'Mobile Number', 'text', NULL, '{"required": true, "min": 7, "max": 16}', 2),
('f_email', NULL, 'email', 'Email Address', 'text', NULL, '{"required": true}', 3),
('f_centre', NULL, 'centre', 'Centre Name', 'text', NULL, '{"required": true}', 4),
('f_tshirt_size', NULL, 'tshirt_size', 'Jersey / T-Shirt Size', 'select', '["XS", "S", "M", "L", "XL", "XXL", "XXXL"]', '{"required": true}', 5),
('f_date_of_birth', NULL, 'date_of_birth', 'Date of Birth', 'date', NULL, '{"required": true}', 6),
('f_gender', NULL, 'gender', 'Gender', 'select', '["Male", "Female", "Other"]', '{"required": true}', 7),
('f_food_preference', NULL, 'food_preference', 'Food Preference', 'select', '["Jain", "Swaminarayan", "Regular Veg", "Special Diet"]', '{"required": true}', 8),
('f_accommodation', NULL, 'accommodation_required', 'Accommodation Required', 'select', '["Yes", "No"]', '{"required": true}', 9),
('f_rpl_family', NULL, 'existing_rpl_family', 'Existing RPL Family Member?', 'select', '["Yes", "No"]', '{"required": true}', 10),
('f_photo', NULL, 'photo', 'Profile Photo (Passport / ID)', 'file', NULL, '{"required": false}', 11),

-- Cricket Dynamic Fields
('f_cricket_role', 'cricket', 'cricket_role', 'Cricket Playing Role', 'select', '["Batter", "Bowler", "All-Rounder", "Wicketkeeper-Batter"]', '{"required": true}', 10),
('f_cricket_batting', 'cricket', 'batting_style', 'Batting Style', 'select', '["Right Hand", "Left Hand"]', '{"required": true}', 11),
('f_cricket_bowling', 'cricket', 'bowling_style', 'Bowling Style', 'select', '["Right-arm Fast", "Right-arm Spin", "Left-arm Fast", "Left-arm Spin", "None"]', '{"required": true}', 12),
('f_cricket_experience', 'cricket', 'cricket_experience', 'Cricket Playing Experience & History', 'text', NULL, '{"required": false}', 13),

-- Football Dynamic Fields
('f_football_pos', 'football', 'football_position', 'Preferred Football Position', 'select', '["Goalkeeper", "Defender", "Midfielder", "Forward"]', '{"required": true}', 20),
('f_football_foot', 'football', 'preferred_foot', 'Preferred Foot', 'select', '["Right Foot", "Left Foot", "Both"]', '{"required": true}', 21),
('f_football_exp', 'football', 'football_experience', 'Football Playing Experience & History', 'text', NULL, '{"required": false}', 22),

-- Badminton Dynamic Fields
('f_badminton_cat', 'badminton', 'badminton_category', 'Badminton Category', 'select', '["Singles", "Doubles", "Mixed Doubles"]', '{"required": true}', 30),
('f_badminton_hand', 'badminton', 'badminton_hand', 'Playing Hand', 'select', '["Right Handed", "Left Handed"]', '{"required": true}', 31),
('f_badminton_exp', 'badminton', 'badminton_experience', 'Badminton Playing Experience', 'text', NULL, '{"required": false}', 32),

-- Table Tennis Dynamic Fields
('f_tt_cat', 'table-tennis', 'tt_category', 'Table Tennis Category', 'select', '["Singles", "Doubles"]', '{"required": true}', 40),
('f_tt_grip', 'table-tennis', 'tt_grip', 'Table Tennis Grip', 'select', '["Shakehand", "Penhold"]', '{"required": true}', 41),
('f_tt_exp', 'table-tennis', 'tt_experience', 'Table Tennis Experience', 'text', NULL, '{"required": false}', 42),

-- Pickleball Dynamic Fields
('f_pickle_cat', 'pickleball', 'pickleball_category', 'Pickleball Category', 'select', '["Singles", "Doubles", "Mixed Doubles"]', '{"required": true}', 50),
('f_pickle_skill', 'pickleball', 'pickleball_skill', 'Self-Assessed Skill Level', 'select', '["Beginner", "Intermediate", "Advanced"]', '{"required": true}', 51),
('f_pickle_partner', 'pickleball', 'pickleball_partner', 'Preferred Partner (if Doubles)', 'text', NULL, '{"required": false}', 52),
('f_pickle_exp', 'pickleball', 'pickleball_experience', 'Pickleball Playing Experience', 'text', NULL, '{"required": false}', 53),

-- Volleyball / Throwball Dynamic Fields
('f_volley_role', 'volleyball', 'volleyball_role', 'Playing Role', 'select', '["Setter", "Attacker", "Libero", "Universal"]', '{"required": true}', 60),
('f_volley_exp', 'volleyball', 'volleyball_experience', 'Volleyball Experience', 'text', NULL, '{"required": false}', 61),

-- Womens Sports Dynamic Fields
('f_womens_cat', 'womens-sports', 'womens_category', 'Sports Selection', 'select', '["Cricket", "Football", "Throwball"]', '{"required": true}', 70),
('f_womens_role', 'womens-sports', 'womens_playing_role', 'Playing Role / Position Details', 'text', NULL, '{"required": true}', 71),
('f_womens_exp', 'womens-sports', 'womens_experience', 'Sports Experience Description', 'text', NULL, '{"required": false}', 72),

-- Optional Customizations
('f_custom_jersey_name', NULL, 'custom_jersey_name', 'Custom Jersey Name', 'text', NULL, '{"required": false}', 80),
('f_jersey_number', NULL, 'preferred_jersey_number', 'Preferred Jersey Number', 'text', NULL, '{"required": false}', 81),
('f_team_name', NULL, 'preferred_team_name', 'Preferred Team Name', 'text', NULL, '{"required": false}', 82),
('f_notes', NULL, 'additional_notes', 'Additional Notes / Comments', 'text', NULL, '{"required": false}', 83),

-- Payment Verification Fields
('f_payment_utr', NULL, 'payment_utr', 'Payment UTR / Transaction ID', 'text', NULL, '{"required": true}', 90),
('f_payment_receipt', NULL, 'payment_receipt', 'Upload Payment Receipt Screenshot', 'file', NULL, '{"required": true}', 91)
ON DUPLICATE KEY UPDATE 
sport_id=VALUES(sport_id), 
label=VALUES(label), 
field_type=VALUES(field_type), 
options=VALUES(options), 
validation_rules=VALUES(validation_rules), 
sort_order=VALUES(sort_order);
