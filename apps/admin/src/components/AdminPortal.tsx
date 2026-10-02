import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  LayoutDashboard,
  Users,
  Bed,
  FileSpreadsheet,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { fetchAdminStats, fetchAdminRegistrations, fetchAdminAccommodation } from '@/lib/api';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminRegistrationsTab } from './AdminRegistrationsTab';
import { AdminAccommodationTab } from './AdminAccommodationTab';
import { AdminExportTab } from './AdminExportTab';
import { PlayerDetailModal } from './PlayerDetailModal';

interface AdminPortalProps {
  onBackToHome: () => void;
}

export function AdminPortal({ onBackToHome }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'accommodation' | 'exports'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [accommodationList, setAccommodationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const loadData = async (isInitial = false) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const [statsRes, regsRes, accRes] = await Promise.all([
        fetchAdminStats().catch(() => ({ stats: null })),
        fetchAdminRegistrations().catch(() => ({ data: [] })),
        fetchAdminAccommodation().catch(() => ({ data: [] })),
      ]);

      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (regsRes && regsRes.data) setRegistrations(regsRes.data);
      if (accRes && accRes.data) setAccommodationList(accRes.data);
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
            <button
              type="button"
              onClick={onBackToHome}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h1 className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight leading-none whitespace-nowrap">
                    RPL Season 9
                  </h1>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider border border-amber-300 whitespace-nowrap shrink-0">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap truncate">
                  <span className="sm:hidden">Admin Console</span>
                  <span className="hidden sm:inline">Organizing Committee Management Console</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Refresh & Stats Counter */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={loading}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live DB Connected</span>
            </div>
          </div>

        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto mobile-hide-scrollbar py-2">

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'dashboard'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'registrations'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Registrations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 font-mono text-[10px]">
              {registrations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accommodation')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'accommodation'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Bed className="w-4 h-4" />
            <span>Room Allotment</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-800 font-mono text-[10px]">
              {accommodationList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exports')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'exports'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1-Click Exports</span>
          </button>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {activeTab === 'dashboard' && (
          <AdminDashboardTab stats={stats} loading={loading} />
        )}

        {activeTab === 'registrations' && (
          <AdminRegistrationsTab
            registrations={registrations}
            loading={loading}
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

        {activeTab === 'exports' && (
          <AdminExportTab
            registrations={registrations}
            accommodationList={accommodationList}
          />
        )}

      </main>

      {/* Player Detail & Edit Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
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

    </div>
  );
}
