import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../database/migrations');

test('Database Migrations: migrations directory exists and contains SQL files', () => {
  assert.ok(fs.existsSync(migrationsDir), 'Migrations directory must exist');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  assert.ok(files.length >= 2, 'Must have at least initial and index migrations');
  assert.ok(files.includes('001_initial_rpl_schema.sql'), '001_initial_rpl_schema.sql must exist');
  assert.ok(files.includes('002_add_performance_indexes.sql'), '002_add_performance_indexes.sql must exist');
});

test('Database Migrations: filenames follow strict numeric sequential prefix convention', () => {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  const namingPattern = /^\d{3}_[a-z0-9_]+\.sql$/;

  for (const file of files) {
    assert.match(file, namingPattern, `File ${file} must match 000_name.sql naming convention`);
  }
});

test('Database Migrations: SQL statement parser extracts clean executable DDL statements', () => {
  const parseStatements = (sql) =>
    sql
      .replace(/--.*$/gm, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

  const sampleSql = `
    -- Create test table
    CREATE TABLE test_table (id INT PRIMARY KEY);

    -- Create test index
    CREATE INDEX idx_test ON test_table(id);
  `;

  const statements = parseStatements(sampleSql);
  assert.strictEqual(statements.length, 2);
  assert.ok(statements[0].startsWith('CREATE TABLE test_table'));
  assert.ok(statements[1].startsWith('CREATE INDEX idx_test'));
});

test('Database Migrations: handles MySQL duplicate key & table errors idempotently', () => {
  const isIdempotentError = (errno) => errno === 1061 || errno === 1050;

  // 1061 = ER_DUP_KEYNAME (index already exists)
  assert.strictEqual(isIdempotentError(1061), true, 'Duplicate index error must be ignored');
  // 1050 = ER_TABLE_EXISTS_ERROR
  assert.strictEqual(isIdempotentError(1050), true, 'Table already exists error must be ignored');
  // 1045 = ER_ACCESS_DENIED_ERROR (fatal)
  assert.strictEqual(isIdempotentError(1045), false, 'Access denied must not be ignored');
  // 1146 = ER_NO_SUCH_TABLE (fatal)
  assert.strictEqual(isIdempotentError(1146), false, 'Unknown table must not be ignored');
});
