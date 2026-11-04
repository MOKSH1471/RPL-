import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Key,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  AdminUser,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
  deleteAdminUser,
} from '@/lib/api';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser;
}

const ALL_AVAILABLE_TABS = [
  { id: 'dashboard', label: 'Overview Dashboard' },
  { id: 'registrations', label: 'Master Registrations' },
  { id: 'accommodation', label: 'Room Allotment' },
  { id: 'transactions', label: 'Payments & Financial Audit' },
  { id: 'exports', label: '1-Click Exports' },
  { id: 'teams', label: 'Team Maker' },
  { id: 'scorer', label: 'Live Cricket Scorer' },
];

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state for Add or Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleType, setFormRoleType] = useState<'SUPER_ADMIN' | 'SCORECARD_ADMIN' | 'CUSTOM'>('SCORECARD_ADMIN');
  const [formCustomRoleName, setFormCustomRoleName] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>(['scorer']);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset state
  const [resetTargetUser, setResetTargetUser] = useState<AdminUser | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleOpenAddForm = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    setFormRoleType('SCORECARD_ADMIN');
    setFormCustomRoleName('');
    setFormPermissions(['scorer']);
    setShowPassword(false);
    setIsFormOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleOpenEditForm = (u: AdminUser) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormPassword('');

    if (u.role === 'SUPER_ADMIN') {
      setFormRoleType('SUPER_ADMIN');
      setFormCustomRoleName('');
      setFormPermissions(ALL_AVAILABLE_TABS.map((t) => t.id));
    } else if (u.role === 'SCORECARD_ADMIN') {
      setFormRoleType('SCORECARD_ADMIN');
      setFormCustomRoleName('');
      setFormPermissions(['scorer']);
    } else {
      setFormRoleType('CUSTOM');
      setFormCustomRoleName(u.role);
      setFormPermissions(u.permissions || []);
    }

    setIsFormOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleRoleTypeChange = (newType: 'SUPER_ADMIN' | 'SCORECARD_ADMIN' | 'CUSTOM') => {
    setFormRoleType(newType);
    if (newType === 'SUPER_ADMIN') {
      setFormPermissions(ALL_AVAILABLE_TABS.map((t) => t.id));
    } else if (newType === 'SCORECARD_ADMIN') {
      setFormPermissions(['scorer']);
    } else {
      if (formPermissions.length === 0) setFormPermissions(['scorer']);
    }
  };

  const togglePermission = (tabId: string) => {
    if (formPermissions.includes(tabId)) {
      setFormPermissions(formPermissions.filter((p) => p !== tabId));
    } else {
      setFormPermissions([...formPermissions, tabId]);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const assignedRole =
      formRoleType === 'SUPER_ADMIN'
        ? 'SUPER_ADMIN'
        : formRoleType === 'SCORECARD_ADMIN'
        ? 'SCORECARD_ADMIN'
        : formCustomRoleName.trim() || 'CUSTOM_ROLE';

    try {
      if (editingUser) {
        // Update existing user
        await updateAdminUser(editingUser.id, {
          name: formName.trim(),
          role: assignedRole,
          permissions: formRoleType === 'SUPER_ADMIN' ? ALL_AVAILABLE_TABS.map((t) => t.id) : formPermissions,
        });
        setSuccessMsg(`User '${editingUser.username}' updated successfully.`);
      } else {
        // Create new user
        if (!formPassword || formPassword.trim().length < 8) {
          throw new Error('Initial password must be at least 8 characters long.');
        }
        await createAdminUser({
          name: formName.trim(),
          username: formUsername.trim().toLowerCase(),
          password: formPassword.trim(),
          role: assignedRole,
          permissions: formRoleType === 'SUPER_ADMIN' ? ALL_AVAILABLE_TABS.map((t) => t.id) : formPermissions,
        });
        setSuccessMsg(`New admin '${formUsername.trim()}' created successfully.`);
      }

      setIsFormOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.id === currentUser.id) {
      setError('You cannot deactivate your own active session.');
      return;
    }
    try {
      await updateAdminUser(user.id, { is_active: !user.is_active });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.id === currentUser.id) {
      setError('You cannot delete your own account.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to permanently delete user '${user.username}'?`);
    if (!confirmed) return;

    try {
      await deleteAdminUser(user.id);
      setSuccessMsg(`User '${user.username}' deleted.`);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetPasswordVal.trim()) return;
    if (resetPasswordVal.trim().length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setResetSubmitting(true);
    setError(null);
    try {
      await resetAdminUserPassword(resetTargetUser.id, resetPasswordVal.trim());
      setSuccessMsg(`Password successfully reset for user '${resetTargetUser.username}'.`);
      setResetTargetUser(null);
      setResetPasswordVal('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setResetSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Admin Roles &amp; Access Control
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create custom admin roles, assign usernames &amp; passwords, and configure tab permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Feedback Banner */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Add New Admin / Role</span>
            </button>
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all border border-slate-200"
              title="Refresh Users List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Accounts: <span className="font-extrabold text-slate-900">{users.length}</span>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && users.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-semibold flex flex-col items-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span>Loading admin accounts...</span>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 hidden md:table-cell">Permitted Tabs</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isSuper = u.role === 'SUPER_ADMIN';
                    const isScorer = u.role === 'SCORECARD_ADMIN';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold text-[9px] uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                              isSuper
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isScorer
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            }`}
                          >
                            <span>{isSuper ? '👑 Super Admin' : isScorer ? '🏏 Scorecard Admin' : `🛡️ ${u.role}`}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 hidden md:table-cell">
                          {isSuper ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Full Access (All 7 Tabs)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(u.permissions || []).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200 uppercase"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              u.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            } ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={isSelf ? 'Cannot toggle self' : 'Toggle active status'}
                          >
                            {u.is_active ? <UserCheck className="w-3 h-3 text-emerald-600" /> : <UserX className="w-3 h-3 text-slate-400" />}
                            <span>{u.is_active ? 'Active' : 'Disabled'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetUser(u);
                                setResetPasswordVal('');
                                setError(null);
                                setSuccessMsg(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(u)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={isSelf ? 'Cannot delete self' : 'Delete user'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* ── Add / Edit Admin User Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingUser ? `Edit Admin @${editingUser.username}` : 'Create New Admin / Scorer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Patel (Match Scorer)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium outline-hidden"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Username (Unique identifier)
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. scorer_ground1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono outline-hidden"
                    required
                  />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Role Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Role Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleTypeChange('SUPER_ADMIN')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      formRoleType === 'SUPER_ADMIN'
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    👑 Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleTypeChange('SCORECARD_ADMIN')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      formRoleType === 'SCORECARD_ADMIN'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏏 Scorer Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleTypeChange('CUSTOM')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      formRoleType === 'CUSTOM'
                        ? 'bg-indigo-100 border-indigo-400 text-indigo-950 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🛡️ Custom Role
                  </button>
                </div>
              </div>

              {/* Custom Role Name */}
              {formRoleType === 'CUSTOM' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Custom Role Title
                  </label>
                  <input
                    type="text"
                    value={formCustomRoleName}
                    onChange={(e) => setFormCustomRoleName(e.target.value)}
                    placeholder="e.g. Accommodation Lead / Accounts Officer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-amber-500 font-semibold outline-hidden"
                    required
                  />
                </div>
              )}

              {/* Granular Tab Permission Checkboxes */}
              {formRoleType === 'CUSTOM' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Permitted Admin Tabs:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {ALL_AVAILABLE_TABS.map((tab) => {
                      const isChecked = formPermissions.includes(tab.id);
                      return (
                        <label
                          key={tab.id}
                          className="flex items-center space-x-2 text-xs font-medium cursor-pointer select-none text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(tab.id)}
                            className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                          />
                          <span>{tab.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">
              Reset Password for @{resetTargetUser.username}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a new password for {resetTargetUser.name}.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-amber-500 font-mono outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm disabled:opacity-50"
                >
                  {resetSubmitting ? 'Resetting...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

