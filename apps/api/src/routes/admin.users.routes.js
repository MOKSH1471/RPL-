import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db, { RPL_DB } from '../config/db.js';
import { verifyAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all user management routes with verifyAuth & requireSuperAdmin
router.use('/admin/users', verifyAuth, requireSuperAdmin);

// 1. GET /api/admin/users - List all admin accounts
router.get('/admin/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, name, role, permissions, is_active, created_by, created_at, last_login
       FROM ${RPL_DB}.rpl_admin_users
       ORDER BY id ASC`
    );

    const users = rows.map((u) => {
      let permissions = [];
      try {
        permissions = typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || []);
      } catch (e) {
        permissions = [];
      }
      return {
        ...u,
        permissions: Array.isArray(permissions) ? permissions : [],
      };
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin users.', error: error.message });
  }
});

// 2. POST /api/admin/users - Create a new admin or custom role user
router.post('/admin/users', async (req, res) => {
  try {
    const { username, name, password, role, permissions } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and full name are required.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check if username is already taken
    const [existing] = await db.query(
      `SELECT id FROM ${RPL_DB}.rpl_admin_users WHERE LOWER(username) = ? LIMIT 1`,
      [cleanUsername]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Username '${cleanUsername}' is already taken. Please choose another.`,
      });
    }

    // Determine permissions array
    const assignedRole = (role || 'SCORECARD_ADMIN').trim();
    let permsArray = [];

    if (assignedRole === 'SUPER_ADMIN') {
      permsArray = ['dashboard', 'registrations', 'accommodation', 'transactions', 'exports', 'teams', 'scorer', 'users'];
    } else if (assignedRole === 'SCORECARD_ADMIN') {
      permsArray = ['scorer'];
    } else if (Array.isArray(permissions)) {
      permsArray = permissions;
    } else {
      permsArray = ['scorer'];
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(String(password), 10);

    const [result] = await db.query(
      `INSERT INTO ${RPL_DB}.rpl_admin_users (username, name, password_hash, role, permissions, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [
        cleanUsername,
        String(name).trim(),
        passwordHash,
        assignedRole,
        JSON.stringify(permsArray),
        req.user?.username || 'admin',
      ]
    );

    res.status(201).json({
      success: true,
      message: `Admin user '${cleanUsername}' created successfully.`,
      data: {
        id: result.insertId,
        username: cleanUsername,
        name: String(name).trim(),
        role: assignedRole,
        permissions: permsArray,
        is_active: true,
      },
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin user.', error: error.message });
  }
});

// 3. PATCH /api/admin/users/:id - Edit role, name, permissions or active status
router.patch('/admin/users/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { name, role, permissions, is_active } = req.body;

    const [existing] = await db.query(
      `SELECT * FROM ${RPL_DB}.rpl_admin_users WHERE id = ? LIMIT 1`,
      [targetId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    // Prevent deactivating own account
    if (req.user?.id === targetId && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active session.',
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(String(role).trim());
    }

    if (permissions !== undefined) {
      const permsArray = Array.isArray(permissions) ? permissions : [];
      updates.push('permissions = ?');
      values.push(JSON.stringify(permsArray));
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(Boolean(is_active));
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No changes provided.' });
    }

    values.push(targetId);
    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Admin user updated successfully.',
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin user.', error: error.message });
  }
});

// 4. POST /api/admin/users/:id/password - Reset password for an admin user
router.post('/admin/users/:id/password', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.',
      });
    }

    const [existing] = await db.query(
      `SELECT id, username FROM ${RPL_DB}.rpl_admin_users WHERE id = ? LIMIT 1`,
      [targetId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    await db.query(
      `UPDATE ${RPL_DB}.rpl_admin_users SET password_hash = ? WHERE id = ?`,
      [passwordHash, targetId]
    );

    res.json({
      success: true,
      message: `Password reset successfully for user '${existing[0].username}'.`,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.', error: error.message });
  }
});

// 5. DELETE /api/admin/users/:id - Delete an admin user
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    // Prevent deleting own account
    if (req.user?.id === targetId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Check target exists
    const [existing] = await db.query(
      `SELECT id, username, role FROM ${RPL_DB}.rpl_admin_users WHERE id = ? LIMIT 1`,
      [targetId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    // Guard: Prevent deleting the last Super Admin
    if (existing[0].role === 'SUPER_ADMIN') {
      const [superCount] = await db.query(
        `SELECT COUNT(*) as count FROM ${RPL_DB}.rpl_admin_users WHERE role = 'SUPER_ADMIN' AND is_active = TRUE`
      );
      if (superCount[0]?.count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only remaining Super Admin account.',
        });
      }
    }

    await db.query(`DELETE FROM ${RPL_DB}.rpl_admin_users WHERE id = ?`, [targetId]);

    res.json({
      success: true,
      message: `Admin user '${existing[0].username}' has been deleted.`,
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete admin user.', error: error.message });
  }
});

export default router;
