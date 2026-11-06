import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import db, { RPL_DB } from '../config/db.js';

// Fast in-memory cache for user verification (TTL = 5 seconds)
// Short TTL guarantees rapid synchronization across multi-process clusters while avoiding redundant DB WAN lag
const userCache = new Map();
const CACHE_TTL_MS = 5 * 1000;

/**
 * Invalidate user verification cache (called when an admin edits, resets password, logs out, or deactivates a user)
 */
export function invalidateAuthCache(userId) {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}

/**
 * Verify JWT authentication token from HttpOnly cookie or Authorization header.
 * Also supports fallback via X-Admin-Secret header for internal / CI test calls.
 */
export async function verifyAuth(req, res, next) {
  try {
    const adminSecret = req.headers['x-admin-secret'];

    // 1. Fallback for internal / CI scripts using ADMIN_API_SECRET
    if (adminSecret && process.env.ADMIN_API_SECRET && adminSecret === process.env.ADMIN_API_SECRET) {
      req.user = {
        id: 0,
        username: 'system_admin',
        name: 'System Admin',
        role: 'SUPER_ADMIN',
        permissions: ['dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'],
        must_change_password: false,
        token_version: 1,
      };
      return next();
    }

    // 2. Extract token: Prefer HttpOnly cookie, fallback to Authorization Bearer header
    let token = null;
    if (req.cookies && req.cookies.rpl_admin_token) {
      token = req.cookies.rpl_admin_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid session token.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: jwtErr.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.',
      });
    }

    // 3. Fast in-memory cache lookup with token_version validation
    const now = Date.now();
    const cached = userCache.get(decoded.id);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      if (!cached.user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account not found or has been deactivated.',
        });
      }
      if (
        decoded.token_version !== undefined &&
        cached.user.token_version !== undefined &&
        decoded.token_version !== cached.user.token_version
      ) {
        userCache.delete(decoded.id);
        return res.status(401).json({
          success: false,
          code: 'SESSION_REVOKED',
          message: 'Session has been invalidated. Please log in again.',
        });
      }
      req.user = cached.user;
      return next();
    }

    // 4. Query fresh user state from MySQL
    try {
      const [rows] = await db.query(
        `SELECT id, username, name, role, permissions, is_active, must_change_password, token_version 
         FROM ${RPL_DB}.rpl_admin_users 
         WHERE id = ? LIMIT 1`,
        [decoded.id]
      );

      if (!rows || rows.length === 0 || !rows[0].is_active) {
        userCache.delete(decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Account not found or has been deactivated.',
        });
      }

      const user = rows[0];

      // Validate token_version for instant revocation across password resets or logouts
      if (
        decoded.token_version !== undefined &&
        user.token_version !== undefined &&
        decoded.token_version !== user.token_version
      ) {
        userCache.delete(decoded.id);
        return res.status(401).json({
          success: false,
          code: 'SESSION_REVOKED',
          message: 'Session has been invalidated. Please log in again.',
        });
      }

      let permissions = [];
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []);
      } catch (e) {
        permissions = [];
      }

      const verifiedUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: Array.isArray(permissions) ? permissions : [],
        is_active: Boolean(user.is_active),
        must_change_password: Boolean(user.must_change_password),
        token_version: user.token_version || 1,
      };

      userCache.set(decoded.id, { user: verifiedUser, timestamp: now });
      req.user = verifiedUser;
    } catch (dbErr) {
      // Fallback safely to cached user or decoded payload
      req.user = cached?.user || {
        id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
        must_change_password: Boolean(decoded.must_change_password),
        token_version: decoded.token_version || 1,
      };
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: error.message,
    });
  }
}

/**
 * Middleware: Enforces that default credentials must be changed before accessing protected resources
 */
export function requirePasswordChanged(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const path = (req.originalUrl || req.path).toLowerCase();
  const isAllowedWhenPasswordPending =
    path.includes('/password') ||
    path.includes('/change-password') ||
    path.includes('/logout') ||
    path.includes('/auth/me');

  if (req.user.must_change_password && !isAllowedWhenPasswordPending) {
    return res.status(403).json({
      success: false,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'You must change your default password before accessing administrative features.',
    });
  }

  next();
}

/**
 * Middleware: Restricts route to SUPER_ADMIN role only
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Super Admin privileges required.',
    });
  }

  next();
}

/**
 * Middleware: Requires a specific permission key (or SUPER_ADMIN)
 */
export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const userPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (!userPerms.includes(permissionKey)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Missing '${permissionKey}' permission.`,
      });
    }

    next();
  };
}

/**
 * Middleware: Requires ANY of the specified permission keys (or SUPER_ADMIN)
 */
export function requireAnyPermission(permissionKeys = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const userPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    const hasAny = permissionKeys.some((p) => userPerms.includes(p));

    if (!hasAny) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of [${permissionKeys.join(', ')}] permissions.`,
      });
    }

    next();
  };
}
