import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, stopTestServer, db, RPL_DB } from './testHelper.js';

let adminToken = '';
let scorerToken = '';

before(async () => {
  // Ensure default seed state before running tests
  await db.query(
    `UPDATE ${RPL_DB}.rpl_admin_users 
     SET password_hash = '$2b$10$GdZ05z/omJ7lsm2w0wCypeUNJHPyTt6SCdUBvjLO6RfiPNNqs/Az6',
         must_change_password = TRUE,
         token_version = 1,
         failed_login_attempts = 0,
         locked_until = NULL,
         is_active = TRUE
     WHERE username = 'admin'`
  );
  await db.query(
    `UPDATE ${RPL_DB}.rpl_admin_users 
     SET password_hash = '$2b$10$Xib4iYNS/17fTEfNdpGA6uSQM0Jv76BLybBp4NrJ8pvZGfGpeH8Gi',
         must_change_password = TRUE,
         token_version = 1,
         failed_login_attempts = 0,
         locked_until = NULL,
         is_active = TRUE
     WHERE username = 'scorer'`
  );
});

after(async () => {
  // Reset admin and scorer to default seed states
  try {
    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users 
       SET password_hash = '$2b$10$GdZ05z/omJ7lsm2w0wCypeUNJHPyTt6SCdUBvjLO6RfiPNNqs/Az6',
           must_change_password = TRUE,
           token_version = 1,
         failed_login_attempts = 0,
         locked_until = NULL,
         is_active = TRUE
       WHERE username = 'admin'`
    );
    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users 
       SET password_hash = '$2b$10$Xib4iYNS/17fTEfNdpGA6uSQM0Jv76BLybBp4NrJ8pvZGfGpeH8Gi',
           must_change_password = TRUE,
           token_version = 1,
         failed_login_attempts = 0,
         locked_until = NULL,
         is_active = TRUE
       WHERE username = 'scorer'`
    );
  } catch {}
  await stopTestServer();
});

test('RBAC Auth: POST /api/auth/login rejects invalid credentials with 401', async () => {
  const { status, data } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
  });
  assert.strictEqual(status, 401);
  assert.strictEqual(data.success, false);
  assert.ok(data.message.includes('Invalid username or password'));
});

test('RBAC Auth: POST /api/auth/login returns JWT, user profile, and must_change_password=true for default seed account', async () => {
  const { status, data, headers } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin@rpl2026' }),
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.token, 'Must return JWT token');
  assert.strictEqual(data.user.username, 'admin');
  assert.strictEqual(data.user.role, 'SUPER_ADMIN');
  assert.strictEqual(data.user.must_change_password, true);

  const cookieHeader = headers.get('set-cookie');
  assert.ok(cookieHeader && cookieHeader.includes('rpl_admin_token'), 'Must set HttpOnly session cookie');
  adminToken = data.token;
});

test('RBAC Security: Unauthenticated request to /api/admin/stats is blocked with 401', async () => {
  const { status, data } = await apiRequest('/api/admin/stats', {
    headers: { Authorization: '', 'x-admin-secret': '' },
  });
  assert.strictEqual(status, 401);
  assert.strictEqual(data.success, false);
  assert.ok(data.message.includes('Authentication required'));
});

test('RBAC Security: Request to /api/admin/stats with must_change_password=true is blocked with 403', async () => {
  const { status, data } = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(status, 403);
  assert.strictEqual(data.code, 'PASSWORD_CHANGE_REQUIRED');
  assert.ok(data.message.includes('change your default password'));
});

test('RBAC Password Policy: rejects weak passwords (length, numbers, symbols, common defaults)', async () => {
  // Test short password
  const res1 = await apiRequest('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ currentPassword: 'admin@rpl2026', newPassword: 'short' }),
  });
  assert.strictEqual(res1.status, 400);
  assert.ok(res1.data.message.includes('8 characters'));

  // Test missing uppercase/lowercase/numbers
  const res2 = await apiRequest('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ currentPassword: 'admin@rpl2026', newPassword: 'alllowercasenonumber!' }),
  });
  assert.strictEqual(res2.status, 400);

  // Test common password
  const res3 = await apiRequest('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ currentPassword: 'admin@rpl2026', newPassword: 'password123' }),
  });
  assert.strictEqual(res3.status, 400);
});

test('RBAC Password Policy: accepts strong password, clears must_change_password, and enables access', async () => {
  const strongNewPassword = 'Admin@RPL2026!StrongPass#9';
  const { status, data } = await apiRequest('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ currentPassword: 'admin@rpl2026', newPassword: strongNewPassword }),
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.user.must_change_password, false);
  assert.ok(data.token, 'Must return updated token with new token_version');
  adminToken = data.token;

  // Now /api/admin/stats must succeed
  const statsRes = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsRes.data.success, true);
  assert.ok('stats' in statsRes.data);
});

test('RBAC Role Guard: Scorecard Admin is restricted strictly to scoring and denied access to admin tabs', async () => {
  // Login as scorer
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'scorer', password: 'scorer@rpl2026' }),
  });
  assert.strictEqual(loginRes.status, 200);
  scorerToken = loginRes.data.token;

  // Change scorer password to satisfy must_change_password
  const changeRes = await apiRequest('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${scorerToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ currentPassword: 'scorer@rpl2026', newPassword: 'Scorer@RPL2026!StrongPitch' }),
  });
  scorerToken = changeRes.data.token;

  // Scorer attempting to view stats must be blocked with 403 Forbidden
  const statsRes = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${scorerToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(statsRes.status, 403);
  assert.ok(statsRes.data.message.includes('Access denied'));

  // Scorer attempting to access user management must be blocked with 403 Forbidden
  const usersRes = await apiRequest('/api/admin/users', {
    headers: { Authorization: `Bearer ${scorerToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(usersRes.status, 403);
  assert.ok(usersRes.data.message.includes('Super Admin privileges required'));
});

test('RBAC Token Revocation: POST /api/auth/logout immediately invalidates active JWT tokens', async () => {
  // Logout using adminToken
  const logoutRes = await apiRequest('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(logoutRes.status, 200);

  // Subsequent call with the now-logged-out adminToken must be rejected with 401 SESSION_REVOKED
  const checkRes = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(checkRes.status, 401);
  assert.strictEqual(checkRes.data.code, 'SESSION_REVOKED');
});

test('Security Hardening: Account lockout activates after 5 consecutive failed logins', async () => {
  // Ensure scorer attempts are reset
  await db.query(
    `UPDATE ${RPL_DB}.rpl_admin_users 
     SET failed_login_attempts = 0, locked_until = NULL 
     WHERE username = 'scorer'`
  );

  // Attempt 1 through 4: Should return 401 with remaining attempts warning
  for (let i = 1; i <= 4; i++) {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'scorer', password: 'incorrect_password' }),
    });
    assert.strictEqual(res.status, 401);
    assert.ok(res.data.message.includes('remaining before temporary lockout'));
  }

  // 5th attempt: triggers 15-minute lockout (status 429)
  const lockRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'scorer', password: 'incorrect_password' }),
  });
  assert.strictEqual(lockRes.status, 429);
  assert.ok(lockRes.data.message.includes('Account locked due to 5 consecutive failed login attempts'));

  // Subsequent login attempt while locked must immediately return 429
  const lockedAttempt = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'scorer', password: 'Scorer@RPL2026!StrongPitch' }),
  });
  assert.strictEqual(lockedAttempt.status, 429);
  assert.ok(lockedAttempt.data.message.includes('temporarily locked'));

  // Unlock scorer account for subsequent tests
  await db.query(
    `UPDATE ${RPL_DB}.rpl_admin_users 
     SET failed_login_attempts = 0, locked_until = NULL 
     WHERE username = 'scorer'`
  );
});

test('Security Hardening: Self-demotion and self-permission modification is blocked', async () => {
  // Re-login as admin
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'Admin@RPL2026!StrongPass#9' }),
  });
  assert.strictEqual(loginRes.status, 200);
  const activeAdminToken = loginRes.data.token;
  const adminId = loginRes.data.user.id;

  // Super Admin trying to demote own role to SCORECARD_ADMIN
  const demoteRes = await apiRequest(`/api/admin/users/${adminId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${activeAdminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ role: 'SCORECARD_ADMIN' }),
  });
  assert.strictEqual(demoteRes.status, 400);
  assert.ok(demoteRes.data.message.includes('You cannot modify your own role or permissions'));

  // Super Admin trying to strip own permissions
  const permsRes = await apiRequest(`/api/admin/users/${adminId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${activeAdminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ permissions: ['scorer'] }),
  });
  assert.strictEqual(permsRes.status, 400);
  assert.ok(permsRes.data.message.includes('You cannot modify your own role or permissions'));

  // But updating own display name is allowed
  const nameRes = await apiRequest(`/api/admin/users/${adminId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${activeAdminToken}`, 'x-admin-secret': '' },
    body: JSON.stringify({ name: 'Super Admin Organiser' }),
  });
  assert.strictEqual(nameRes.status, 200);
  assert.strictEqual(nameRes.data.success, true);
});

test('Security Hardening: GET /api/admin/users/login-logs returns login audit trail', async () => {
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'Admin@RPL2026!StrongPass#9' }),
  });
  const activeAdminToken = loginRes.data.token;

  const logsRes = await apiRequest('/api/admin/users/login-logs', {
    headers: { Authorization: `Bearer ${activeAdminToken}`, 'x-admin-secret': '' },
  });
  assert.strictEqual(logsRes.status, 200);
  assert.strictEqual(logsRes.data.success, true);
  assert.ok(Array.isArray(logsRes.data.data));
  assert.ok(logsRes.data.data.length > 0);

  const latestLog = logsRes.data.data[0];
  assert.ok('id' in latestLog);
  assert.ok('username' in latestLog);
  assert.ok('status' in latestLog);
  assert.ok('attempted_at' in latestLog);
});
