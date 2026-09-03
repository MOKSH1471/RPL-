import React, { useState, useEffect } from 'react';
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
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Admin Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                    RPL Season 9
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider border border-amber-300">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Organizing Committee Management Console
                </p>
              </div>
            </div>
          </div>

          {/* Quick Refresh & Stats Counter */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto py-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'dashboard'
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'registrations'
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'accommodation'
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'exports'
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
