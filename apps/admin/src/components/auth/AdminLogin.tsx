import React, { useState } from 'react';
import { Trophy, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginAdmin, AdminUser } from '@/lib/api';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser, token: string) => void;
  onBackToHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginAdmin(username.trim(), password.trim());
      if (response.success && response.user) {
        onLoginSuccess(response.user, response.token);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'scorer') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin@rpl2026');
    } else {
      setUsername('scorer');
      setPassword('scorer@rpl2026');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Dynamic Radiant Ambient Background to Match Main Website */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[15%] w-[60vw] h-[60vw] bg-gradient-to-tl from-orange-300/30 via-pink-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] bg-amber-200/20 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#d9770615_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 border border-slate-200 shadow-xs shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-none">
              RPL <span className="text-amber-600">Season 9</span>
            </span>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1 block">
              Sports Championship • Admin Console
            </span>
          </div>
        </div>

        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-slate-700 hover:text-amber-700 font-bold transition-all flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200 shadow-2xs cursor-pointer"
          >
            <span>Public Site</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </button>
        )}
      </header>

      {/* Center Auth Card */}
      <div className="relative z-10 max-w-md w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-900/5">
          
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Restricted Access</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Super Admin or Scorecard credentials required
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or scorer"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pills for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-semibold mb-2.5 text-center">
              Quick Sign-In Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="py-2 px-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 text-left transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
              >
                <span className="text-base">👑</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                  <div className="text-[10px] text-amber-700 font-mono">admin</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('scorer')}
                className="py-2 px-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 text-left transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
              >
                <span className="text-base">🏏</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Scorecard Admin</div>
                  <div className="text-[10px] text-emerald-700 font-mono">scorer</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer info */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200/60">
        RPL Season 9 Organizing Committee • Role-Based Access Control (RBAC) System
      </footer>
    </div>
  );
};
