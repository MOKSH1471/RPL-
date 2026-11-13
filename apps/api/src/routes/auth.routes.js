import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { RPL_DB } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REMEMBER_EXPIRES_IN } from '../config/jwt.js';
import { verifyAuth, invalidateAuthCache } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/passwordPolicy.js';

const router = Router();

// Constant pre-computed bcrypt hash to eliminate timing-based user enumeration
const DUMMY_HASH = '$2b$10$7EqJtq98hPqEX7fNZaFWoO.8/hR9Keqj1pS1p5g3j1l0Vq3a2b1c2';

// 1. POST /api/auth/login - Authenticate admin or scorer
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password, rememberMe = false } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
    const userAgent = (req.headers['user-agent'] || '').slice(0, 255);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Query user from rpl_admin_users with SQL-level clock lock evaluation
    const [rows] = await db.query(
      `SELECT *, 
              (locked_until IS NOT NULL AND locked_until > NOW()) AS is_locked,
              TIMESTAMPDIFF(MINUTE, NOW(), locked_until) AS lock_remaining_minutes
       FROM ${RPL_DB}.rpl_admin_users 
       WHERE LOWER(username) = ? LIMIT 1`,
      [cleanUsername]
    );

    if (!rows || rows.length === 0) {
      // Record failed attempt for non-existent username
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (NULL, ?, 'NOT_FOUND', ?, ?)`,
        [cleanUsername, ip, userAgent]
      ).catch(() => {});

      // Execute dummy bcrypt comparison so request takes equal time
      await bcrypt.compare(String(password), DUMMY_HASH).catch(() => {});
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const user = rows[0];

    // Check account lockout (15 minutes after 5 consecutive failures)
    if (Boolean(user.is_locked)) {
      const remainingMinutes = Math.max(1, user.lock_remaining_minutes || 15);
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (?, ?, 'LOCKED', ?, ?)`,
        [user.id, cleanUsername, ip, userAgent]
      ).catch(() => {});

      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      });
    }

    if (!user.is_active) {
      await db.query(
        `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (?, ?, 'DEACTIVATED', ?, ?)`,
        [user.id, cleanUsername, ip, userAgent]
      ).catch(() => {});

      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the Super Admin.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      const currentAttempts = (user.failed_login_attempts || 0) + 1;
      const isNowLocked = currentAttempts >= 5;

      if (isNowLocked) {
        await db.query(
          `UPDATE ${RPL_DB}.rpl_admin_users SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`,
          [currentAttempts, user.id]
        ).catch(() => {});

        await db.query(
          `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (?, ?, 'LOCKED', ?, ?)`,
          [user.id, cleanUsername, ip, userAgent]
        ).catch(() => {});

        return res.status(429).json({
          success: false,
          message: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.',
        });
      } else {
        await db.query(
          `UPDATE ${RPL_DB}.rpl_admin_users SET failed_login_attempts = ? WHERE id = ?`,
          [currentAttempts, user.id]
        ).catch(() => {});

        await db.query(
          `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (?, ?, 'FAILED', ?, ?)`,
          [user.id, cleanUsername, ip, userAgent]
        ).catch(() => {});

        const remainingAttempts = 5 - currentAttempts;
        return res.status(401).json({
          success: false,
          message: `Invalid username or password. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining before temporary lockout.`,
        });
      }
    }

    // Reset failed attempts & unlock on success
    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?`,
      [user.id]
    ).catch(() => {});

    await db.query(
      `INSERT INTO ${RPL_DB}.rpl_admin_login_logs (user_id, username, status, ip_address, user_agent) VALUES (?, ?, 'SUCCESS', ?, ?)`,
      [user.id, cleanUsername, ip, userAgent]
    ).catch(() => {});

    let permissions = [];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []);
    } catch (e) {
      permissions = [];
    }

    // Generate JWT token with token_version for secure revocation
    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: Array.isArray(permissions) ? permissions : [],
      must_change_password: Boolean(user.must_change_password),
      token_version: user.token_version || 1,
    };

    const isRemember = Boolean(rememberMe);
    const tokenExpiresIn = isRemember ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
    const cookieMaxAge = isRemember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: tokenExpiresIn });

    // Set secure HttpOnly cookie (protects from XSS exfiltration)
    res.cookie('rpl_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      rememberMe: isRemember,
      expiresIn: tokenExpiresIn,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: tokenPayload.permissions,
        must_change_password: Boolean(user.must_change_password),
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
      error: error.message,
    });
  }
});

// 2. GET /api/auth/me - Verify session & retrieve current logged-in user profile
router.get('/auth/me', verifyAuth, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// 3. POST /api/auth/change-password - Change password for current logged-in user
router.post('/auth/change-password', verifyAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, rememberMe = false } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    const [rows] = await db.query(
      `SELECT id, username, password_hash, token_version FROM ${RPL_DB}.rpl_admin_users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    // Verify current password
    const isCurrentMatch = await bcrypt.compare(String(currentPassword), user.password_hash);
    if (!isCurrentMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password you entered is incorrect.',
      });
    }

    // Validate new password policy
    const policyResult = validatePasswordStrength(newPassword);
    if (!policyResult.valid) {
      return res.status(400).json({
        success: false,
        message: policyResult.message,
      });
    }

    // Ensure new password is not identical to current
    const isSamePassword = await bcrypt.compare(String(newPassword), user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password.',
      });
    }

    const newHash = await bcrypt.hash(String(newPassword).trim(), 10);
    const nextTokenVersion = (user.token_version || 1) + 1;

    // Update password, clear must_change_password flag, and increment token_version
    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users 
       SET password_hash = ?, must_change_password = FALSE, token_version = ? 
       WHERE id = ?`,
      [newHash, nextTokenVersion, req.user.id]
    );

    invalidateAuthCache(req.user.id);

    // Issue updated token with new token_version and must_change_password: false
    const updatedPayload = {
      ...req.user,
      must_change_password: false,
      token_version: nextTokenVersion,
    };

    const isRemember = Boolean(rememberMe);
    const tokenExpiresIn = isRemember ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
    const cookieMaxAge = isRemember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const newToken = jwt.sign(updatedPayload, JWT_SECRET, { expiresIn: tokenExpiresIn });

    res.cookie('rpl_admin_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.',
      token: newToken,
      rememberMe: isRemember,
      expiresIn: tokenExpiresIn,
      user: {
        ...req.user,
        must_change_password: false,
      },
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      error: error.message,
    });
  }
});

// 4. POST /api/auth/logout - Invalidate session & clear cookies
router.post('/auth/logout', verifyAuth, async (req, res) => {
  try {
    if (req.user && req.user.id) {
      // Increment token_version to invalidate prior JWTs server-side
      await db.query(
        `UPDATE ${RPL_DB}.rpl_admin_users SET token_version = token_version + 1 WHERE id = ?`,
        [req.user.id]
      ).catch(() => {});
      invalidateAuthCache(req.user.id);
    }

    res.clearCookie('rpl_admin_token', { path: '/' });
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    res.clearCookie('rpl_admin_token', { path: '/' });
    return res.json({ success: true, message: 'Logged out.' });
  }
});

export default router;
