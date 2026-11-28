import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  LayoutDashboard,
  Users,
  Bed,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Activity,
  Shield,
  LogOut,
  UserCheck,
  MessageSquareHeart,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminRegistrations,
  fetchAdminAccommodation,
  AdminUser,
} from '@/lib/api';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminRegistrationsTab, MasterFilterPreset } from './AdminRegistrationsTab';
import { AdminAccommodationTab } from './AdminAccommodationTab';
import { AdminTransactionsTab } from './AdminTransactionsTab';
import { AdminExportTab } from './AdminExportTab';
import { AdminTeamMakerTab } from './AdminTeamMakerTab';
import { AdminFeedbackTab } from './AdminFeedbackTab';
import { PlayerDetailModal } from './PlayerDetailModal';
import { getAllKnownTags } from '@/lib/tagUtils';
import { ScorerPage } from './scorer/ScorerPage';
import { AdminUsersModal } from './AdminUsersModal';

export type AdminRole = 'admin' | 'scorer';

interface AdminPortalProps {
  currentUser?: AdminUser | null;
  onLogout?: () => void;
}

export function AdminPortal({ currentUser, onLogout }: AdminPortalProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isScorerOnly =
    currentUser?.role === 'SCORECARD_ADMIN' ||
    (!isSuperAdmin && currentUser?.permissions?.length === 1 && currentUser?.permissions?.[0] === 'scorer');

  const canViewDashboard = isSuperAdmin || currentUser?.permissions?.includes('dashboard');
  const canViewRegistrations = isSuperAdmin || currentUser?.permissions?.includes('registrations');
  const canViewAccommodation = isSuperAdmin || currentUser?.permissions?.includes('accommodation');
  const canViewTransactions = isSuperAdmin || currentUser?.permissions?.includes('transactions');
  const canViewExports = isSuperAdmin || currentUser?.permissions?.includes('exports');
  const canViewTeams = isSuperAdmin || currentUser?.permissions?.includes('teams');
  const canViewScorer = isSuperAdmin || currentUser?.permissions?.includes('scorer');
  const canViewFeedback = isSuperAdmin || currentUser?.permissions?.includes('dashboard') || currentUser?.permissions?.includes('registrations');

  // Compute initial active tab
  const getInitialTab = (): 'dashboard' | 'registrations' | 'accommodation' | 'transactions' | 'exports' | 'teams' | 'scorer' | 'feedback' => {
    if (isScorerOnly) return 'scorer';
    if (canViewDashboard) return 'dashboard';
    if (canViewRegistrations) return 'registrations';
    if (canViewAccommodation) return 'accommodation';
    if (canViewTransactions) return 'transactions';
    if (canViewExports) return 'exports';
    if (canViewTeams) return 'teams';
    if (canViewFeedback) return 'feedback';
    if (canViewScorer) return 'scorer';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'accommodation' | 'transactions' | 'exports' | 'teams' | 'scorer' | 'feedback'>(getInitialTab);
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [accommodationList, setAccommodationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [masterFilterPreset, setMasterFilterPreset] = useState<MasterFilterPreset | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = async (isInitial = false) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const promises: Promise<any>[] = [];
      if (canViewDashboard) {
        promises.push(fetchAdminStats().then((res) => ({ type: 'stats', data: res?.stats })).catch(() => ({ type: 'stats', data: null })));
      }
      if (canViewRegistrations || canViewExports || canViewTeams) {
        promises.push(fetchAdminRegistrations().then((res) => ({ type: 'regs', data: res?.data })).catch(() => ({ type: 'regs', data: [] })));
      }
      if (canViewAccommodation || canViewExports) {
        promises.push(fetchAdminAccommodation().then((res) => ({ type: 'acc', data: res?.data })).catch(() => ({ type: 'acc', data: [] })));
      }

      const results = await Promise.all(promises);
      results.forEach((r) => {
        if (r.type === 'stats' && r.data) setStats(r.data);
        if (r.type === 'regs' && r.data) setRegistrations(r.data);
        if (r.type === 'acc' && r.data) setAccommodationList(r.data);
      });
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      if (isInitial) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1600 - elapsed);
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoading(false);
        }, remaining);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">

      {/* ── Admin Fullscreen Loading Screen (rpl-14.jpg) ── */}
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-between overflow-hidden transition-opacity duration-700 ${
          isInitialLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isInitialLoading}
      >
        {/* Warm dark fallback visible before image decodes */}
        <div className="absolute inset-0 bg-[#1a1209]" />

        {/* Fullscreen rpl-14.jpg with framing focused on Papaji's face and bat */}
        <img
          src="/rpl-photos/rpl-14.jpg"
          alt="Papaji - RPL Season 9"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover object-[48%_38%] select-none"
        />

        {/* Soft, non-intrusive edge gradients (leaving Papaji's face bright and clear) */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Top minimal status pills */}
        <div className="relative z-10 w-full flex justify-between items-center max-w-5xl mx-auto px-4 sm:px-6 pt-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 shadow-lg text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase">RPL Admin Portal</span>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-amber-400/40 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Syncing Data…</span>
          </div>
        </div>

        {/* Bottom Loading Dock - keeps photo completely uncluttered */}
        <div className="relative z-10 w-full max-w-md mx-auto mb-6 px-4">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-2xl space-y-2.5 text-center">
            <div className="flex items-center justify-between text-xs font-semibold text-white/80">
              <span className="text-amber-300 font-extrabold tracking-wider uppercase text-[10px]">
                Raj Premier League • Season 9
              </span>
              <span className="text-[10px] font-mono text-white/50">Admin Console</span>
            </div>

            {/* Glowing amber progress line */}
            <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 h-full animate-marquee" />
            </div>

            <p className="text-[11px] text-white/70 font-medium">
              Connecting to database and fetching tournament records…
            </p>
          </div>
        </div>
      </div>

      {/* Top Admin Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h1 className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight leading-none whitespace-nowrap">
                    RPL Season 9
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider border border-amber-300 whitespace-nowrap shrink-0">
                    Admin Portal
                  </span>
                  {currentUser && (
                    <span
                      className={`hidden md:inline-block px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider border whitespace-nowrap shrink-0 ${
                        isSuperAdmin
                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                          : isScorerOnly
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                          : 'bg-indigo-100 text-indigo-950 border-indigo-400'
                      }`}
                    >
                      {isSuperAdmin ? '👑 Super Admin' : isScorerOnly ? '🏏 Scorecard Admin' : `🛡️ ${currentUser.role}`}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap truncate">
                  <span className="sm:hidden">Admin Console</span>
                  <span className="hidden sm:inline">Organizing Committee Management Console</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Refresh, Manage Roles & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsUsersModalOpen(true)}
                className="hidden sm:flex px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all items-center space-x-1.5 shadow-2xs cursor-pointer shrink-0"
                title="Manage Admin Accounts, Passwords & Roles"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Manage Roles</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden sm:flex px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-all items-center space-x-1.5 border border-slate-200 cursor-pointer shrink-0"
                title="Sign out of Console"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Logout</span>
              </button>
            )}

            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live DB</span>
            </div>

            {!isScorerOnly && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer shrink-0"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>

        {/* Desktop Single-Row Tab Navigation (Option 1 — fits all 8 tabs cleanly without scrolling) */}
        {!isScorerOnly && (() => {
          const activeRegsCount = registrations.filter((r) => !r.is_archived && !r.general_details?.isArchived).length;
          const navItems = [
            { id: 'dashboard' as const, label: 'Overview Dashboard', shortLabel: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />, visible: canViewDashboard },
            {
              id: 'registrations' as const,
              label: 'Master Registrations',
              shortLabel: 'Registrations',
              icon: <Users className="w-3.5 h-3.5 shrink-0" />,
              badge: activeRegsCount,
              badgeClass: 'bg-amber-500/20 text-amber-700',
              visible: canViewRegistrations,
            },
            {
              id: 'accommodation' as const,
              label: 'Room Allotment',
              shortLabel: 'Room Allotment',
              icon: <Bed className="w-3.5 h-3.5 shrink-0" />,
              badge: accommodationList.length,
              badgeClass: 'bg-cyan-500/20 text-cyan-800',
              visible: canViewAccommodation,
            },
            { id: 'transactions' as const, label: 'Payments & Audit', shortLabel: 'Payments & Audit', icon: <CreditCard className="w-3.5 h-3.5 shrink-0" />, visible: canViewTransactions },
            { id: 'exports' as const, label: '1-Click Exports', shortLabel: 'Exports', icon: <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />, visible: canViewExports },
            { id: 'teams' as const, label: 'Team Maker', shortLabel: 'Team Maker', icon: <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />, visible: canViewTeams },
            { id: 'feedback' as const, label: 'Feedback Center', shortLabel: 'Feedback', icon: <MessageSquareHeart className="w-3.5 h-3.5 text-amber-500 shrink-0" />, visible: canViewFeedback },
            {
              id: 'scorer' as const,
              label: 'Live Scorer',
              shortLabel: 'Live Scorer',
              icon: <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
              isScorer: true,
              visible: canViewScorer,
            },
          ].filter((item) => item.visible);

          return (
            <>
              <div className="hidden lg:flex max-w-7xl mx-auto px-6 lg:px-8 border-t border-slate-100 items-center justify-between gap-1 py-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                        item.isScorer
                          ? isActive
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                            : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                          : isActive
                            ? 'bg-slate-900 text-amber-300 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.shortLabel}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                            isActive && !item.isScorer
                              ? 'bg-amber-400/20 text-amber-300'
                              : item.badgeClass
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile / Tablet Hamburger Menu Drawer (matches customer-facing site style) */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="lg:hidden fixed inset-0 bg-slate-950/25 backdrop-blur-xs z-30"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="lg:hidden fixed left-3 right-3 top-[62px] z-40 bg-white rounded-3xl border border-slate-200 shadow-2xl p-3 space-y-1 max-h-[80vh] overflow-y-auto"
                    >
                      {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                              item.isScorer
                                ? isActive
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'text-slate-800 hover:bg-amber-50'
                                : isActive
                                  ? 'bg-amber-50 text-slate-900 border border-amber-200/80'
                                  : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center space-x-3">
                              {isActive && !item.isScorer && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              )}
                              {item.icon}
                              <span>{item.label}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              {item.badge !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${item.badgeClass}`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </span>
                          </button>
                        );
                      })}

                      {(isSuperAdmin || onLogout) && (
                        <div className="sm:hidden pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setIsUsersModalOpen(true);
                              }}
                              className="w-full px-4 py-3 rounded-2xl bg-amber-50 text-amber-950 border border-amber-200 text-sm font-bold flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center space-x-3">
                                <Shield className="w-4 h-4 text-amber-600" />
                                <span>Manage Roles</span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-amber-600" />
                            </button>
                          )}
                          {onLogout && (
                            <button
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                onLogout();
                              }}
                              className="w-full px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-bold flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center space-x-3">
                                <LogOut className="w-4 h-4 text-rose-600" />
                                <span>Logout</span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-rose-400" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            stats={stats}
            registrations={registrations}
            loading={loading}
            onNavigateToRegistrations={(preset) => {
              setMasterFilterPreset(preset);
              setActiveTab('registrations');
            }}
          />
        )}

        {activeTab === 'registrations' && (
          <AdminRegistrationsTab
            registrations={registrations}
            loading={loading}
            initialFilterPreset={masterFilterPreset}
            onConsumeFilterPreset={() => setMasterFilterPreset(null)}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'accommodation' && (
          <AdminAccommodationTab
            accommodationList={accommodationList}
            loading={loading}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'transactions' && (
          <AdminTransactionsTab />
        )}

        {activeTab === 'exports' && (
          <AdminExportTab
            registrations={registrations}
            accommodationList={accommodationList}
          />
        )}

        {activeTab === 'teams' && (
          <AdminTeamMakerTab
            registrations={registrations}
            loading={loading}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'feedback' && canViewFeedback && (
          <AdminFeedbackTab />
        )}

        {activeTab === 'scorer' && (
          <div className="rounded-3xl min-h-[85vh]">
            <ScorerPage
              onBackToHome={() => setActiveTab('dashboard')}
              isScorecardAdmin={isScorerOnly}
              initialView="hub"
            />
          </div>
        )}

      </main>

      {/* Player Detail & Edit Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          availableTags={getAllKnownTags(registrations)}
          onClose={() => setSelectedPlayer(null)}
          onRefresh={async () => {
            await loadData();
            // Refresh selected player with latest data
            const res = await fetchAdminRegistrations();
            const updated = res.data?.find((p: any) => p.id === selectedPlayer.id);
            if (updated) setSelectedPlayer(updated);
          }}
        />
      )}

      {/* Super Admin Users & Roles Management Modal */}
      {isSuperAdmin && currentUser && (
        <AdminUsersModal
          isOpen={isUsersModalOpen}
          onClose={() => setIsUsersModalOpen(false)}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}
