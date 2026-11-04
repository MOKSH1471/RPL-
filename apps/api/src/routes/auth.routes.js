import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { RPL_DB } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

// Constant pre-computed bcrypt hash to eliminate timing-based user enumeration
const DUMMY_HASH = '$2b$10$7EqJtq98hPqEX7fNZaFWoO.8/hR9Keqj1pS1p5g3j1l0Vq3a2b1c2';

// POST /api/auth/login - Authenticate admin or scorer
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Query user from rpl_admin_users
    const [rows] = await db.query(
      `SELECT * FROM ${RPL_DB}.rpl_admin_users WHERE LOWER(username) = ? LIMIT 1`,
      [cleanUsername]
    );

    if (!rows || rows.length === 0) {
      // Execute dummy bcrypt comparison so request takes equal time
      await bcrypt.compare(String(password), DUMMY_HASH).catch(() => {});
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the Super Admin.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    let permissions = [];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []);
    } catch (e) {
      permissions = [];
    }

    // Update last_login
    db.query(`UPDATE ${RPL_DB}.rpl_admin_users SET last_login = NOW() WHERE id = ?`, [user.id]).catch(() => {});

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: Array.isArray(permissions) ? permissions : [],
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: tokenPayload.permissions,
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

// GET /api/auth/me - Verify session & retrieve current logged-in user profile
router.get('/auth/me', verifyAuth, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

export default router;

