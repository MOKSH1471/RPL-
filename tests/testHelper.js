process.env.NODE_ENV = 'test';

// Circuit breaker: Prevent test execution against production database
const dbHost = (process.env.DB_HOST || '').toLowerCase();
const isAwsProd = dbHost.includes('rds.amazonaws.com') ||
                  dbHost.includes('prod') ||
                  dbHost.includes('13.126.') ||
                  dbHost.includes('13.232.');

if (isAwsProd && process.env.ALLOW_PROD_TESTS !== '1') {
  console.error(`\n🚨 [TEST CIRCUIT BREAKER] Tests aborted! Refusing to run tests against production database: "${process.env.DB_HOST}".`);
  console.error('Please configure .env to point to Dev/Staging before running test suites.\n');
  process.exit(1);
}

if (!process.env.ADMIN_API_SECRET) {
  process.env.ADMIN_API_SECRET = 'test_admin_secret_ci_key_2026';
}

import http from 'http';
import app from '../apps/api/index.js';
import db, { RPL_DB } from '../apps/api/src/config/db.js';

export { db, RPL_DB };

let server;
let baseUrl;

export async function archiveTestRegistrations() {
  try {
    await db.query(`
      UPDATE ${RPL_DB}.rpl_registrations
      SET is_archived = 1, archived_at = NOW()
      WHERE is_archived = 0
        AND (
          email LIKE '%@example.com'
          OR email LIKE '%@test.com'
        )
    `);
  } catch {}
}

export async function startTestServer() {
  if (server) return baseUrl;
  await archiveTestRegistrations();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
  return baseUrl;
}

export async function stopTestServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  await archiveTestRegistrations();
  try {
    await db.end();
  } catch {}
}

export async function apiRequest(endpoint, options = {}) {
  const base = await startTestServer();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // If calling an admin or cricket management route without any auth header explicitly specified, inject CI admin secret
  if (
    (endpoint.startsWith('/api/admin') || endpoint.startsWith('/api/cricket')) &&
    !('x-admin-secret' in (options.headers || {})) &&
    !('Authorization' in (options.headers || {}))
  ) {
    headers['x-admin-secret'] = process.env.ADMIN_API_SECRET;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}
