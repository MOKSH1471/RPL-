import pool, { RPL_DB } from '../apps/api/src/config/db.js';

const ALL_SPORTS = ['cricket', 'badminton', 'volleyball', 'pickleball', 'table_tennis', 'football'];

const ROLES = ['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper', 'Batter', 'All-rounder', 'Bowler', 'Batter', 'All-rounder', 'Bowler'];
const CITIES = ['Mumbai', 'Surat', 'Ahmedabad', 'Pune', 'Vadodara', 'Delhi', 'Bengaluru', 'Rajkot', 'Bhavnagar', 'Jaipur'];

async function seedTestPlayers() {
  console.log('🚀 [SEED] Seeding 10 test players into database:', RPL_DB);

  try {
    for (let i = 1; i <= 10; i++) {
      const id = `test-player-${i}`;
      const fullName = `Player ${i}`;
      const email = `player${i}@test.com`;
      const mobile = `99000000${i.toString().padStart(2, '0')}`;
      const role = ROLES[i - 1];
      const city = CITIES[i - 1];

      const generalDetails = JSON.stringify({
        selectedSports: ALL_SPORTS,
        centre: city,
        city: city,
        gender: i % 3 === 0 ? 'Female' : 'Male',
        playingRole: role,
        isTestPlayer: true,
      });

      const sportAnswers = JSON.stringify({
        cricket_role: role,
        role: role,
        batting_style: i % 2 === 0 ? 'Left Hand Bat' : 'Right Hand Bat',
        bowling_style: i % 2 === 0 ? 'Left Arm Spin' : 'Right Arm Medium Fast',
      });

      await pool.query(
        `INSERT INTO ${RPL_DB}.rpl_registrations 
          (id, full_name, email, mobile, check_in_date, check_out_date, payment_status, general_details, sport_answers)
         VALUES (?, ?, ?, ?, '2026-12-25', '2026-12-27', 'approved', ?, ?)
         ON DUPLICATE KEY UPDATE 
           full_name = VALUES(full_name),
           email = VALUES(email),
           mobile = VALUES(mobile),
           payment_status = VALUES(payment_status),
           general_details = VALUES(general_details),
           sport_answers = VALUES(sport_answers)`,
        [id, fullName, email, mobile, generalDetails, sportAnswers]
      );

      console.log(`✅ Seeded ${fullName} (${mobile}) for sports: ${ALL_SPORTS.join(', ')}`);
    }

    console.log('🎉 Successfully seeded all 10 test players into MySQL!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test players:', error);
    process.exit(1);
  }
}

seedTestPlayers();
