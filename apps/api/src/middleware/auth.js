import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import db, { RPL_DB } from '../config/db.js';

/**
 * Verify JWT authentication token from Authorization header.
 * Also supports fallback via X-Admin-Secret header for server-to-server / CI test calls.
 */
export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const adminSecret = req.headers['x-admin-secret'];

    // 1. Fallback for internal / CI scripts using ADMIN_API_SECRET
    if (adminSecret && process.env.ADMIN_API_SECRET && adminSecret === process.env.ADMIN_API_SECRET) {
      req.user = {
        id: 0,
        username: 'system_admin',
        name: 'System Admin',
        role: 'SUPER_ADMIN',
        permissions: ['dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'],
      };
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: jwtErr.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.',
      });
    }

    // Optional quick validation against DB to verify user is still active
    try {
      const [rows] = await db.query(
        `SELECT id, username, name, role, permissions, is_active FROM ${RPL_DB}.rpl_admin_users WHERE id = ? LIMIT 1`,
        [decoded.id]
      );

      if (!rows || rows.length === 0 || !rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account not found or has been deactivated.',
        });
      }

      const user = rows[0];
      let permissions = [];
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []);
      } catch (e) {
        permissions = [];
      }

      req.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: Array.isArray(permissions) ? permissions : [],
      };
    } catch (dbErr) {
      // If DB check fails, fallback to decoded JWT payload safely
      req.user = {
        id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
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
