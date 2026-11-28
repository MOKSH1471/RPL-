import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Shirt,
  Building2,
  Trophy,
  Activity,
  Bed,
  IndianRupee,
  TrendingUp,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { aggregateCentresCount } from '@/lib/centreUtils';
import type { MasterFilterPreset } from './AdminRegistrationsTab';

interface AdminDashboardTabProps {
  stats: any;
  registrations?: any[];
  loading: boolean;
  onNavigateToRegistrations?: (preset: MasterFilterPreset) => void;
}

export function AdminDashboardTab({ stats, registrations, loading, onNavigateToRegistrations }: AdminDashboardTabProps) {
  const [copiedJerseySummary, setCopiedJerseySummary] = React.useState(false);

  const { totalRegistrations, activeRegistrations, payment, financials, accommodationCount, sportsCount, tshirtSizes, centresCount } = stats || {};

  // Compute full 90's Nostalgia opt-in count from registrations (covers nostalgiaSport + sport_answers + selectedSports)
  const effectiveSportsCount = React.useMemo(() => {
    const merged: Record<string, number> = { ...(sportsCount || {}) };
    if (registrations && registrations.length > 0) {
      let nostalgiaOptIns = 0;
      registrations.forEach((r: any) => {
        const gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
        const isTestEmail = Boolean(r.email && (r.email.endsWith('@example.com') || r.email.endsWith('@test.com')));
        if (r.is_archived || gen.isArchived || isTestEmail) return;
        if ((r.payment_status || 'pending').toLowerCase() === 'waitlist') return;

        const sel = Array.isArray(gen.selectedSports) ? gen.selectedSports.map((s: any) => String(s).toLowerCase()) : [];
        const ans = typeof r.sport_answers === 'string' ? JSON.parse(r.sport_answers || '{}') : (r.sport_answers || {});
        const hasNostalgiaGen = Boolean(
          (gen.nostalgiaSport && gen.nostalgiaSport !== 'None') ||
          (gen.nostalgia_sport && gen.nostalgia_sport !== 'None')
        );
        if (sel.includes('90s-nostalgia') || hasNostalgiaGen || Boolean(ans['90s-nostalgia'])) {
          nostalgiaOptIns++;
        }
      });
      if (nostalgiaOptIns > 0) {
        merged['90s-nostalgia'] = nostalgiaOptIns;
      }
    }
    return merged;
  }, [sportsCount, registrations]);

  const sortedCentres = React.useMemo(() => aggregateCentresCount(centresCount), [centresCount]);
  const topCentres = React.useMemo(() => sortedCentres.filter(([, count]) => count >= 3), [sortedCentres]);
  const longTailCentres = React.useMemo(() => sortedCentres.filter(([, count]) => count < 3), [sortedCentres]);
  const maxCentreCount = sortedCentres[0]?.[1] || 1;

  const { jerseyInventory, extraTshirtsCount } = React.useMemo(() => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    if (registrations && registrations.length > 0) {
      const counts: Record<string, number> = {};
      let extraCount = 0;
      registrations.forEach((r: any) => {
        const gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
        const isTestEmail = Boolean(r.email && (r.email.endsWith('@example.com') || r.email.endsWith('@test.com')));
        if (r.is_archived || gen.isArchived || isTestEmail) return;
        if ((r.payment_status || 'pending').toLowerCase() === 'waitlist') return;

        const sel = Array.isArray(gen.selectedSports) ? gen.selectedSports : [];
        const isSpectator = gen.registrationType === 'spectator' || sel.includes('spectator') || r.sport_id === 'spectator';
        const spectatorHasTshirt = gen.spectatorTshirt === 'Yes' || gen.extraTshirt === 'Yes';
        const playerHasExtra = !isSpectator && gen.extraTshirt === 'Yes';
        const qty = !isSpectator ? (1 + (playerHasExtra ? 1 : 0)) : (spectatorHasTshirt ? 1 : 0);
        if (qty <= 0) return;
        if (playerHasExtra) extraCount++;

        let rawSize = (gen.tshirtSize || '').trim().toUpperCase();
        if (rawSize === 'XXL') rawSize = '2XL';
        if (rawSize === 'XXXL') rawSize = '3XL';
        if (!rawSize) return;
        const matched = sizes.find((k) => rawSize === k || rawSize.startsWith(k));
        if (matched) {
          counts[matched] = (counts[matched] || 0) + qty;
        }
      });
      return {
        jerseyInventory: sizes.map((size) => ({ size, qty: counts[size] || 0 })),
        extraTshirtsCount: extraCount,
      };
    }

    return {
      jerseyInventory: sizes.map((size) => {
        const qty =
          tshirtSizes?.[size] ||
          (size === '2XL'
            ? (tshirtSizes?.['2XL'] || 0) + (tshirtSizes?.['XXL'] || 0)
            : size === '3XL'
              ? (tshirtSizes?.['3XL'] || 0) + (tshirtSizes?.['XXXL'] || 0)
              : 0);
        return { size, qty };
      }),
      extraTshirtsCount: 0,
    };
  }, [tshirtSizes, registrations]);

  const totalJerseys = React.useMemo(
    () => jerseyInventory.reduce((sum, item) => sum + item.qty, 0),
    [jerseyInventory]
  );
  const maxJerseyQty = React.useMemo(
    () => Math.max(1, ...jerseyInventory.map((item) => item.qty)),
    [jerseyInventory]
  );

  const nostalgiaGamesBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let optedInParticipants = 0;
    if (registrations && registrations.length > 0) {
      registrations.forEach((r: any) => {
        const gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
        const isTestEmail = Boolean(r.email && (r.email.endsWith('@example.com') || r.email.endsWith('@test.com')));
        if (r.is_archived || gen.isArchived || isTestEmail) return;
        if ((r.payment_status || 'pending').toLowerCase() === 'waitlist') return;

        const ans = typeof r.sport_answers === 'string' ? JSON.parse(r.sport_answers || '{}') : (r.sport_answers || {});
        const raw = gen.nostalgiaSport || gen.nostalgia_sport || ans['90s-nostalgia']?.sport;
        if (!raw || raw === 'None') return;

        optedInParticipants++;
        const items = Array.isArray(raw)
          ? raw.map((s: any) => String(s).trim()).filter(Boolean)
          : String(raw).split(',').map((s) => s.trim()).filter(Boolean);
        items.forEach((game) => {
          counts[game] = (counts[game] || 0) + 1;
        });
      });
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      entries,
      optedInParticipants,
      maxGameCount: entries[0]?.[1] || 1,
    };
  }, [registrations]);

  if (loading || !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Live Statistics...</p>
      </div>
    );
  }

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const sportLabels: Record<string, string> = {
    cricket: 'Underarm Turf Cricket',
    football: 'Turf Football',
    'table-tennis': 'Table Tennis',
    carrom: 'Carrom League',
    'womens-sports': "Women's League",
    'kaccha-pakka': 'Kaccha Pakka Cricket League',
    spectator: 'Spectator (90’s Nostalgia Pass)',
    '90s-nostalgia': '90’s Nostalgia Games (Opted In)',
  };

  const handleCopyJerseySummary = () => {
    const parts = jerseyInventory
      .filter((item) => item.qty > 0)
      .map((item) => `${item.size}: ${item.qty}`);
    const summary = `RPL Jersey Size Order Summary — ${parts.join(', ')} | Total: ${totalJerseys} Jerseys`;
    navigator.clipboard?.writeText(summary);
    setCopiedJerseySummary(true);
    setTimeout(() => setCopiedJerseySummary(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verified Collections */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ status: 'approved' })}
          title="View Verified Paid participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-sm relative overflow-hidden hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Verified Collections</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
              {formatINR(financials?.totalRevenue || (payment?.approved || 0) * 3600)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">Bank-cleared registration fees</p>
        </button>

        {/* Pending Collections */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ status: 'pending' })}
          title="View Pending Review participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-sm relative overflow-hidden hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Review Dues</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {formatINR(financials?.pendingRevenue || (payment?.pending || 0) * 3600)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-400/80 font-medium">Under review / UTR verification</p>
        </button>

        {/* Projected Total */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Projected Tournament Pool</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-300 tracking-tight">
              {formatINR(financials?.potentialRevenue || ((payment?.approved || 0) + (payment?.pending || 0)) * 3600)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-400/80 font-medium">100% verified conversion potential</p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Total Registrations */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToRegistrations?.({})}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToRegistrations?.({})}
          title="View all participants in Master Registrations"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Participants</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{activeRegistrations ?? totalRegistrations}</span>
            <span className="text-xs font-semibold text-slate-400">entries</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToRegistrations?.({ regType: 'player' });
              }}
              className="px-1.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
            >
              🏃 {stats.playersCount || 0} Players
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToRegistrations?.({ regType: 'spectator' });
              }}
              className="px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
            >
              🎟️ {stats.spectatorsCount || 0} Spectators
            </button>
            {(payment?.waitlist || 0) > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToRegistrations?.({ status: 'waitlist' });
                }}
                className="px-1.5 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors cursor-pointer"
              >
                ⏳ {payment.waitlist} Waitlist
              </button>
            )}
          </div>
        </div>

        {/* Approved Payments */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ status: 'approved' })}
          title="View Verified Paid participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Paid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">{payment?.approved || 0}</span>
            <span className="text-xs font-semibold text-slate-400">verified</span>
          </div>
        </button>

        {/* Pending Review */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ status: 'pending' })}
          title="View Pending Review participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-orange-300 transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-orange-600 tracking-tight">{payment?.pending || 0}</span>
            <span className="text-xs font-semibold text-slate-400">under review</span>
          </div>
        </button>

        {/* Rejected */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ status: 'rejected' })}
          title="View Rejected participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600 tracking-tight">{payment?.rejected || 0}</span>
            <span className="text-xs font-semibold text-slate-400">invalid proof</span>
          </div>
        </button>

        {/* Accommodation */}
        <button
          type="button"
          onClick={() => onNavigateToRegistrations?.({ acc: 'Yes' })}
          title="View Ashram Stay participants in Master Registrations"
          className="text-left p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Ashram Stays</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-cyan-700 tracking-tight">{accommodationCount || 0}</span>
            <span className="text-xs font-semibold text-slate-400">requested</span>
          </div>
        </button>

      </div>

      {/* Two Column Section: Sport Distribution & Jersey Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sports Distribution Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">Sports Registration Breakdown</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Players / Sport</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {Object.entries(effectiveSportsCount).map(([key, count]: [string, any]) => {
              const total = totalRegistrations || 1;
              const percent = Math.round((count / total) * 100);
              const label = sportLabels[key] || key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => onNavigateToRegistrations?.({ sport: key })}
                  title={`View ${label} participants in Master Registrations`}
                  className="w-full text-left px-2 py-1.5 -mx-2 rounded-xl space-y-1 hover:bg-amber-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 group-hover:text-amber-700 transition-colors">{label}</span>
                    <span className="text-slate-900 font-mono">
                      {count} <span className="text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* T-Shirt / Jersey Size Inventory Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Shirt className="w-5 h-5 text-orange-600" />
              <h3 className="font-extrabold text-base text-slate-900">Jersey Size Inventory</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-extrabold font-mono"
                title={extraTshirtsCount > 0 ? `Includes ${extraTshirtsCount} extra T-shirt${extraTshirtsCount > 1 ? 's' : ''}` : undefined}
              >
                {totalJerseys} Jerseys
              </span>
              <button
                type="button"
                onClick={handleCopyJerseySummary}
                title="Copy size breakdown for vendor"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                {copiedJerseySummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {jerseyInventory.map(({ size, qty }) => {
              const sharePercent = totalJerseys > 0 ? Math.round((qty / totalJerseys) * 100) : 0;
              const barWidth = qty > 0 ? Math.max(4, Math.round((qty / maxJerseyQty) * 100)) : 0;
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => onNavigateToRegistrations?.({ jersey: size })}
                  title={`View ${size} jersey participants in Master Registrations`}
                  className={`w-full text-left px-2 py-1.5 -mx-2 rounded-xl space-y-1 hover:bg-orange-50/70 transition-colors cursor-pointer group ${qty === 0 ? 'opacity-45' : ''
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 group-hover:text-orange-700 font-mono transition-colors">{size}</span>
                    <span className="text-slate-900 font-mono">
                      {qty} <span className="text-slate-400 font-normal">({sharePercent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 90's Nostalgia Games Breakdown */}
      {nostalgiaGamesBreakdown.entries.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">90’s Nostalgia Games Breakdown</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {nostalgiaGamesBreakdown.optedInParticipants} Participants Opted In
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {nostalgiaGamesBreakdown.entries.map(([game, count]) => {
              const optedPercent = Math.round(
                (count / Math.max(1, nostalgiaGamesBreakdown.optedInParticipants)) * 100
              );
              const barWidth = Math.max(6, Math.round((count / nostalgiaGamesBreakdown.maxGameCount) * 100));
              return (
                <button
                  type="button"
                  key={game}
                  onClick={() => onNavigateToRegistrations?.({ search: game })}
                  title={`View ${game} participants in Master Registrations`}
                  className="w-full text-left p-2 -mx-2 rounded-xl space-y-1 hover:bg-amber-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-slate-700 group-hover:text-amber-700 truncate transition-colors">{game}</span>
                    <span className="text-slate-900 font-mono shrink-0">
                      {count} <span className="text-slate-400 font-normal">({optedPercent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Centre-wise Participant Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Geographic Centre Distribution</h3>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {sortedCentres.length} Centres • {totalRegistrations || 0} Participants
          </span>
        </div>

        {/* Ranked Top Centres (≥ 3 participants) */}
        {topCentres.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {topCentres.map(([centre, count], idx) => {
              const sharePercent = Math.round((count / (totalRegistrations || 1)) * 100);
              const barWidth = Math.max(6, Math.round((count / maxCentreCount) * 100));
              return (
                <button
                  type="button"
                  key={centre}
                  onClick={() => onNavigateToRegistrations?.({ search: centre })}
                  title={`View ${centre} participants in Master Registrations`}
                  className="w-full text-left p-2 -mx-2 rounded-xl space-y-1 hover:bg-amber-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 group-hover:text-amber-700 truncate flex items-center gap-1.5 transition-colors">
                      <span className="text-[10px] font-mono text-slate-400 w-4">#{idx + 1}</span>
                      <span>{centre}</span>
                    </span>
                    <span className="text-slate-900 font-mono shrink-0">
                      {count} <span className="text-slate-400 font-normal">({sharePercent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Compact Long-Tail Centres (1–2 participants) */}
        {longTailCentres.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Other Centres (1–2 Participants)
            </span>
            <div className="flex flex-wrap gap-2">
              {longTailCentres.map(([centre, count]) => (
                <button
                  type="button"
                  key={centre}
                  onClick={() => onNavigateToRegistrations?.({ search: centre })}
                  title={`View ${centre} participants in Master Registrations`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  <span>{centre}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-mono text-[11px] font-bold">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
