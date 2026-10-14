process.env.NODE_ENV = 'test';

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
          OR full_name LIKE '%Test%'
          OR full_name LIKE '%Draft%'
          OR full_name LIKE '%Player%'
          OR full_name LIKE '%Champion%'
          OR full_name LIKE '%Guest%'
          OR full_name LIKE '%Veteran%'
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
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}
