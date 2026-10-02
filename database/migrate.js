import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { RPL_DB } from '../apps/api/src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations() {
  console.log('🔄 [MIGRATIONS] Starting database migrations on database:', RPL_DB);

  try {
    // 1. Ensure migrations table exists to track applied migrations
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${RPL_DB}._rpl_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Read all .sql files in migrations directory sorted alphabetically
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // 3. Fetch already applied migrations
    const [appliedRows] = await db.query(`SELECT migration_name FROM ${RPL_DB}._rpl_migrations`);
    const appliedNames = new Set(appliedRows.map((r) => r.migration_name));

    for (const file of files) {
      if (appliedNames.has(file)) {
        console.log(`⏩ [MIGRATIONS] Skipping already applied: ${file}`);
        continue;
      }

      console.log(`⚡ [MIGRATIONS] Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Strip comments and split statements by semicolon
      const statements = sql
        .replace(/--.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await db.query(statement);
        } catch (stmtErr) {
          // If index or table already exists (errno 1061 / 1050), proceed safely
          if (stmtErr.errno === 1061 || stmtErr.errno === 1050) {
            console.log(`ℹ️ [MIGRATIONS] Index or table already exists, skipping: ${stmtErr.sqlMessage}`);
          } else {
            throw stmtErr;
          }
        }
      }

      await db.query(`INSERT INTO ${RPL_DB}._rpl_migrations (migration_name) VALUES (?)`, [file]);
      console.log(`✅ [MIGRATIONS] Successfully applied: ${file}`);
    }

    console.log('🎉 [MIGRATIONS] All database migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [MIGRATIONS] Migration failed with error:', error);
    process.exit(1);
  }
}

runMigrations();
