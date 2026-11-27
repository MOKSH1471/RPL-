import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Printer,
  Archive,
  Download,
  Ticket,
  Sliders,
  ArrowUpCircle,
  X,
  Loader2,
  Check,
  Send,
} from 'lucide-react';
import {
  updatePaymentStatus,
  toggleArchiveRegistration,
  promoteFromWaitlist,
  fetchRegistrationSettings,
  updateRegistrationSettings,
  RegistrationSettings,
} from '@/lib/api';
import { getDriveDirectImageUrl, exportMasterRegistrations } from '@/lib/exportUtils';
import { ReceiptPrinterModal } from '@/components/ui/ReceiptPrinterModal';
import { useEscapeKey } from '@/lib/useEscapeKey';
import { normalizeCentreName } from '@/lib/centreUtils';


export interface MasterFilterPreset {
  search?: string;
  status?: string;
  sport?: string;
  acc?: string;
  regType?: 'all' | 'player' | 'spectator';
  jersey?: string;
}

interface AdminRegistrationsTabProps {
  registrations: any[];
  loading: boolean;
  initialFilterPreset?: MasterFilterPreset | null;
  onConsumeFilterPreset?: () => void;
  onSelectPlayer: (player: any) => void;
  onRefresh: () => void;
}

export function AdminRegistrationsTab({
  registrations,
  loading,
  initialFilterPreset,
  onConsumeFilterPreset,
  onSelectPlayer,
  onRefresh,
}: AdminRegistrationsTabProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilterPreset?.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilterPreset?.search || '');
  const [jerseyFilter, setJerseyFilter] = useState(initialFilterPreset?.jersey || 'all');
  const [statusFilter, setStatusFilter] = useState(initialFilterPreset?.status || 'all');
  const [sportFilter, setSportFilter] = useState(initialFilterPreset?.sport || 'all');
  const [accFilter, setAccFilter] = useState(initialFilterPreset?.acc || 'all');
  const [regTypeFilter, setRegTypeFilter] = useState<'all' | 'player' | 'spectator'>(initialFilterPreset?.regType || 'all');

  React.useEffect(() => {
    if (initialFilterPreset) {
      setSearchTerm(initialFilterPreset.search || '');
      setDebouncedSearch(initialFilterPreset.search || '');
      setStatusFilter(initialFilterPreset.status || 'all');
      setSportFilter(initialFilterPreset.sport || 'all');
      setAccFilter(initialFilterPreset.acc || 'all');
      setRegTypeFilter(initialFilterPreset.regType || 'all');
      setJerseyFilter(initialFilterPreset.jersey || 'all');
      setCurrentPage(1);
      onConsumeFilterPreset?.();
    }
  }, [initialFilterPreset]);
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptModalPlayer, setReceiptModalPlayer] = useState<any | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [regSettings, setRegSettings] = useState<RegistrationSettings>({
    player_registration_mode: 'open',
    waitlist_banner_message: '',
    closed_message: '',
    spectator_registration_mode: 'open',
    spectator_waitlist_banner_message: '',
    spectator_closed_message: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [modeToast, setModeToast] = useState<string | null>(null);
  const rowsPerPage = 15;

  const loadRegSettings = async () => {
    try {
      const res = await fetchRegistrationSettings();
      if (res && res.settings) {
        setRegSettings(res.settings);
      }
    } catch (err) {
      console.warn('Failed to load registration settings:', err);
    }
  };

  React.useEffect(() => {
    loadRegSettings();
  }, []);

  useEscapeKey(showModeModal, () => setShowModeModal(false));

  const waitlistCount = React.useMemo(() => {
    return registrations.filter((r) => {
      const gen = r.general_details || {};
      const isArchived = Boolean(r.is_archived || gen.isArchived);
      return !isArchived && String(r.payment_status || '').toLowerCase() === 'waitlist';
    }).length;
  }, [registrations]);

  // Debounce search input by 200ms to maintain smooth 60fps scrolling
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filter registrations
  const filtered = registrations.filter((r) => {
    const gen = r.general_details || {};
    const sports = gen.selectedSports || [];
    const isArchived = Boolean(r.is_archived || gen.isArchived);

    // Search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      const matchName = r.full_name?.toLowerCase().includes(term);
      const matchPhone = r.mobile?.includes(term);
      const matchEmail = r.email?.toLowerCase().includes(term);
      const matchUtr = r.payment_utr?.toLowerCase().includes(term);
      const normalizedCentre = normalizeCentreName(gen.centre, 'Mumbai').toLowerCase();
      const matchCentre = gen.centre?.toLowerCase().includes(term) || normalizedCentre.includes(term);
      const matchJerseyName = gen.customJerseyName?.toLowerCase().includes(term);
      const nostalgiaRaw = gen.nostalgiaSport || gen.nostalgia_sport || r.sport_answers?.['90s-nostalgia']?.sport;
      const matchNostalgia = Array.isArray(nostalgiaRaw)
        ? nostalgiaRaw.join(', ').toLowerCase().includes(term)
        : String(nostalgiaRaw || '').toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchEmail && !matchUtr && !matchCentre && !matchJerseyName && !matchNostalgia) {
        return false;
      }
    }

    // Status / Archive filter
    if (statusFilter === 'archived') {
      if (!isArchived) return false;
    } else {
      if (isArchived) return false; // Exclude archived from active roster views by default
      if (statusFilter !== 'all') {
        const pStatus = (r.payment_status || 'pending').toLowerCase();
        if (pStatus !== statusFilter) return false;
      }
    }

    // Sport filter
    if (sportFilter !== 'all') {
      if (sportFilter === '90s-nostalgia') {
        const hasNostalgia =
          (Array.isArray(sports) && sports.includes('90s-nostalgia')) ||
          Boolean(gen.nostalgiaSport && gen.nostalgiaSport !== 'None') ||
          Boolean(gen.nostalgia_sport && gen.nostalgia_sport !== 'None') ||
          Boolean(r.sport_answers?.['90s-nostalgia']);
        if (!hasNostalgia) return false;
      } else if (!Array.isArray(sports) || !sports.includes(sportFilter)) {
        return false;
      }
    }

    // Participant Type filter (Player vs Spectator)
    const isSpectator = gen.registrationType === 'spectator' || (Array.isArray(sports) && sports.includes('spectator')) || r.sport_id === 'spectator';
    if (regTypeFilter === 'player' && isSpectator) return false;
    if (regTypeFilter === 'spectator' && !isSpectator) return false;

    // Accommodation filter
    if (accFilter !== 'all') {
      const acc = gen.accommodationRequired || 'No';
      if (acc !== accFilter) return false;
    }

    // Jersey Size filter
    if (jerseyFilter !== 'all') {
      const spectatorHasTshirt = gen.spectatorTshirt === 'Yes' || gen.extraTshirt === 'Yes';
      if (isSpectator && !spectatorHasTshirt) return false;
      let rawSize = (gen.tshirtSize || '').trim().toUpperCase();
      if (rawSize === 'XXL') rawSize = '2XL';
      if (rawSize === 'XXXL') rawSize = '3XL';
      if (rawSize !== jerseyFilter && !rawSize.startsWith(jerseyFilter)) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleQuickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePaymentStatus(id, 'approved');
      onRefresh();
    } catch (err: any) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleQuickReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePaymentStatus(id, 'rejected');
      onRefresh();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const handlePromotePlayer = async (player: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Promote "${player.full_name}" from Waitlist?\n\n• Status will change to Pending\n• Razorpay payment will unlock for them\n• You can then send them their payment link on WhatsApp.`)) {
      return;
    }
    try {
      await promoteFromWaitlist(player.id);
      setModeToast(`${player.full_name} promoted! Click the amber Send Link icon to WhatsApp them.`);
      setTimeout(() => setModeToast(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert('Failed to promote player: ' + err.message);
    }
  };

  const handleSaveRegSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateRegistrationSettings(regSettings);
      if (res && res.settings) {
        setRegSettings(res.settings);
      }
      setShowModeModal(false);
      setModeToast(
        `Saved! Players: ${regSettings.player_registration_mode.toUpperCase()} | Spectators: ${regSettings.spectator_registration_mode.toUpperCase()}`
      );
      setTimeout(() => setModeToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update registration mode');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleArchive = async (player: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyArchived = Boolean(player.is_archived || player.general_details?.isArchived);

    const confirmMsg = isCurrentlyArchived
      ? `Restore "${player.full_name}" to active status?\n\n• Player will return to active tournament roster\n• Accommodation reservation will be re-processed.`
      : `Archive registration for "${player.full_name}"?\n\n• Player record and payment details will be safely preserved\n• Room bookings and jersey allocations will be released.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleArchiveRegistration(player.id, !isCurrentlyArchived);
      onRefresh();
    } catch (err: any) {
      alert('Failed to update archive status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">

      {modeToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/60 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{modeToast}</span>
        </div>
      )}

      {/* Registration Mode & Waitlist Control Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Live Status:
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              regSettings.player_registration_mode === 'waitlist'
                ? 'bg-orange-100 text-orange-900 border-orange-300'
                : regSettings.player_registration_mode === 'closed'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                regSettings.player_registration_mode === 'waitlist'
                  ? 'bg-orange-500'
                  : regSettings.player_registration_mode === 'closed'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
            />
            🏃 Players:{' '}
            {regSettings.player_registration_mode === 'waitlist'
              ? 'Waitlist'
              : regSettings.player_registration_mode === 'closed'
              ? 'Closed'
              : 'Open'}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              regSettings.spectator_registration_mode === 'waitlist'
                ? 'bg-orange-100 text-orange-900 border-orange-300'
                : regSettings.spectator_registration_mode === 'closed'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                regSettings.spectator_registration_mode === 'waitlist'
                  ? 'bg-orange-500'
                  : regSettings.spectator_registration_mode === 'closed'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
            />
            🎟️ Spectators:{' '}
            {regSettings.spectator_registration_mode === 'waitlist'
              ? 'Waitlist'
              : regSettings.spectator_registration_mode === 'closed'
              ? 'Closed'
              : 'Open'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatusFilter(statusFilter === 'waitlist' ? 'all' : 'waitlist');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border ${
              statusFilter === 'waitlist'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Waitlist ({waitlistCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadRegSettings();
              setShowModeModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Registration Mode</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">

          {/* Search Input */}
          <div className="relative w-full lg:w-64 xl:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, email, UTR, centre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 w-full lg:w-auto">

            {/* Participant Type Filter */}
            <select
              value={regTypeFilter}
              onChange={(e) => {
                setRegTypeFilter(e.target.value as 'all' | 'player' | 'spectator');
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Participants</option>
              <option value="player">🏃 Players Only</option>
              <option value="spectator">🎟️ Spectators Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending Review</option>
              <option value="waitlist">⏳ Waitlist</option>
              <option value="approved">Approved / Verified</option>
              <option value="rejected">Rejected</option>
              <option value="archived">📦 Archived Records</option>
            </select>

            {/* Sport Filter */}
            <select
              value={sportFilter}
              onChange={(e) => {
                setSportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Sports</option>
              <option value="cricket">Underarm Turf Cricket</option>
              <option value="football">Turf Football</option>
              <option value="table-tennis">Table Tennis</option>
              <option value="carrom">Carrom League</option>
              <option value="womens-sports">Women's League</option>
              <option value="kaccha-pakka">Kaccha Pakka Cricket League</option>
              <option value="spectator">🎟️ Spectator (90’s Nostalgia Pass)</option>
              <option value="90s-nostalgia">✨ 90’s Nostalgia Games (Opted In)</option>
            </select>

            {/* Accommodation Filter */}
            <select
              value={accFilter}
              onChange={(e) => {
                setAccFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Stays</option>
              <option value="Yes">Stay Needed (Ashram)</option>
              <option value="No">Self-Arranged</option>
            </select>

            {/* Jersey Size Filter */}
            <select
              value={jerseyFilter}
              onChange={(e) => {
                setJerseyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Jerseys</option>
              {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].map((sz) => (
                <option key={sz} value={sz}>
                  Size: {sz}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Counter Badge & Quick Export */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> matching participants
            </span>
            {(searchTerm || statusFilter !== 'all' || sportFilter !== 'all' || accFilter !== 'all' || regTypeFilter !== 'all' || jerseyFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSportFilter('all');
                  setAccFilter('all');
                  setRegTypeFilter('all');
                  setJerseyFilter('all');
                }}
                className="text-amber-600 font-bold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => exportMasterRegistrations(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download visible filtered registrations as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Quick Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Player / ID</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Centre & Info</th>
                <th className="py-3.5 px-4">Selected Sports</th>
                <th className="py-3.5 px-4">Jersey Size</th>
                <th className="py-3.5 px-4">Payment & UTR</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                    Loading registrations...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    No registrations match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((player) => {
                  const gen = player.general_details || {};
                  const sports = gen.selectedSports || [];
                  const cleanPhone = (player.mobile || '').replace(/\D/g, '');
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const waUrl = `https://wa.me/${waPhone}`;

                  const rawReceipts = player.payment_receipt_url || gen.payment_receipt_url || gen.payment_receipt || '';
                  const receiptList: string[] = Array.isArray(gen.paymentReceipts) && gen.paymentReceipts.length > 0
                    ? gen.paymentReceipts
                    : String(rawReceipts).split(',').map((s) => s.trim()).filter(Boolean);

                  const rawUtrs = player.payment_utr || gen.payment_utr || '';
                  const utrList: string[] = Array.isArray(gen.paymentUtrs) && gen.paymentUtrs.length > 0
                    ? gen.paymentUtrs
                    : String(rawUtrs).split(',').map((s) => s.trim()).filter(Boolean);

                  const isArchived = Boolean(player.is_archived || gen.isArchived);
                  const isSpectator = gen.registrationType === 'spectator' || (Array.isArray(sports) && sports.includes('spectator')) || player.sport_id === 'spectator';

                  return (
                    <tr
                      key={player.id}
                      onClick={() => onSelectPlayer(player)}
                      className={`${isArchived
                        ? 'bg-purple-50/30 opacity-75 hover:opacity-100 hover:bg-purple-50/50'
                        : 'hover:bg-amber-50/40'
                        } transition-colors cursor-pointer group`}
                    >

                      {/* 1. Player Info & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {player.player_photo_url ? (
                            <img
                              src={getDriveDirectImageUrl(player.player_photo_url)}
                              alt={player.full_name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : isSpectator ? (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shrink-0" title="90’s Nostalgia Pass (Photo Not Required)">
                              <Ticket className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                              {player.full_name}
                              {isSpectator && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-300">
                                  Spectator
                                </span>
                              )}
                              {isArchived && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-300">
                                  Archived
                                </span>
                              )}
                              {gen.cardNo && (
                                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                                  #{gen.cardNo}
                                </span>
                              )}
                              {(gen.comments || gen.additionalNotes || gen.additional_notes) && (
                                <span
                                  title={`Comment: ${gen.comments || gen.additionalNotes || gen.additional_notes}`}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-0.5"
                                >
                                  💬 Note
                                </span>
                              )}
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {player.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-800 block">{player.mobile}</span>
                        <span className="text-[11px] text-slate-400 font-sans truncate block max-w-[140px]">
                          {player.email}
                        </span>
                      </td>

                      {/* 3. Centre & Gender */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{normalizeCentreName(gen.centre, 'Mumbai')}</span>
                        <span className="text-[11px] text-slate-400">{gen.gender || 'Male'}</span>
                      </td>

                      {/* 4. Selected Sports */}
                      <td className="py-3.5 px-4">
                        {isSpectator ? (
                          <div className="flex flex-col gap-1 max-w-[160px]">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                              <Ticket className="w-3 h-3 text-indigo-600" />
                              <span>90’s Nostalgia Pass</span>
                            </span>
                            {(() => {
                              const specDates = Array.isArray(gen.spectatorDates) && gen.spectatorDates.length > 0
                                ? gen.spectatorDates
                                : Array.isArray(gen.spectatorDays) && gen.spectatorDays.length > 0
                                  ? gen.spectatorDays
                                  : [];
                              const dayCount = specDates.length > 0 ? specDates.length : 1;
                              const isAll3Days = gen.spectatorOption === 'with-stay' || gen.accommodationRequired === 'Yes' || dayCount >= 3;
                              return (
                                <>
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px]">
                                    {gen.spectatorOption === 'with-stay' || gen.accommodationRequired === 'Yes'
                                      ? '🏨 Stay (₹3,000)'
                                      : `☀️ Day Pass (${dayCount > 1 ? `${dayCount} Days • ` : ''}₹${dayCount * 720})`}
                                  </span>
                                  {isAll3Days && (gen.nostalgiaSport || gen.nostalgia_sport) && (
                                    <span
                                      className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center space-x-1"
                                      title={`90’s Nostalgia Pass: ${Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport) ? (gen.nostalgiaSport || gen.nostalgia_sport).join(', ') : (gen.nostalgiaSport || gen.nostalgia_sport)}`}
                                    >
                                      <span>🕹️</span>
                                      <span className="truncate max-w-[90px]">{Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport) ? (gen.nostalgiaSport || gen.nostalgia_sport).join(', ') : (gen.nostalgiaSport || gen.nostalgia_sport)}</span>
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {sports.map((s: string) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-[10px] uppercase tracking-wider"
                              >
                                {s}
                              </span>
                            ))}
                            {(gen.nostalgiaSport || gen.nostalgia_sport) && (
                              <span
                                className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center space-x-1"
                                title={`90s Nostalgia: ${Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport) ? (gen.nostalgiaSport || gen.nostalgia_sport).join(', ') : (gen.nostalgiaSport || gen.nostalgia_sport)}`}
                              >
                                <span>🕹️</span>
                                <span className="truncate max-w-[90px]">{Array.isArray(gen.nostalgiaSport || gen.nostalgia_sport) ? (gen.nostalgiaSport || gen.nostalgia_sport).join(', ') : (gen.nostalgiaSport || gen.nostalgia_sport)}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 5. Jersey Specs */}
                      <td className="py-3.5 px-4">
                        {isSpectator ? (
                          gen.spectatorTshirt === 'Yes' || gen.extraTshirt === 'Yes' ? (
                            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                              <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                                {gen.tshirtSize || 'L'}
                              </span>
                              <span className="font-black text-[9px] bg-indigo-100 text-indigo-900 border border-indigo-300 px-1.5 py-0.5 rounded-full">
                                +₹500 T-Shirt
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">No T-Shirt</span>
                          )
                        ) : (
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                              {gen.tshirtSize || 'L'}
                            </span>
                            {(gen.extraTshirt === 'Yes' || gen.extra_tshirt === 'Yes') && (
                              <span className="font-black text-[9px] bg-orange-100 text-orange-900 border border-orange-300 px-1.5 py-0.5 rounded-full">
                                +1 Extra
                              </span>
                            )}
                            {gen.customJerseyName && (
                              <span className="text-slate-800 font-bold truncate max-w-[100px]">
                                {gen.customJerseyName}
                              </span>
                            )}
                            {gen.preferredJerseyNumber && (
                              <span className="text-slate-400 font-mono">#{gen.preferredJerseyNumber}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 6. Payment Status & Proof */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            {isArchived ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                                Archived
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${player.payment_status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : player.payment_status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : player.payment_status === 'waitlist'
                                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                              >
                                {player.payment_status || 'pending'}
                              </span>
                            )}
                            {(() => {
                              const regSports = Array.isArray(gen.selectedSports) ? gen.selectedSports : [];
                              const isRegSpectator = gen.registrationType === 'spectator' || regSports.includes('spectator');
                              const hasRegCricket = regSports.some((s: string) => s === 'cricket' || s === 'womens-sports' || s === 'kaccha-pakka');
        const isRegFootballMulti = !isRegSpectator && regSports.includes('football') && hasRegCricket;
                              const hasRegTshirt = gen.extraTshirt === 'Yes' || gen.spectatorTshirt === 'Yes';
                              const isReturningFamily = gen.existingRplFamily === 'Yes';
                              const playerBaseFee = isReturningFamily ? 3600 : 3900;
                              const fallbackFee = isRegSpectator
                                ? ((gen.spectatorOption === 'with-stay' || gen.accommodationRequired === 'Yes') ? 3000 : ((gen.spectatorDates?.length || 1) * 720)) + (hasRegTshirt ? 500 : 0)
                                : (playerBaseFee + (isRegFootballMulti ? 500 : 0) + (hasRegTshirt ? 500 : 0));
                              return (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-mono font-bold text-[10px] border border-amber-200">
                                  ₹{(gen.totalAmount || fallbackFee).toLocaleString('en-IN')}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {utrList.map((utr, uIdx) => {
                              const isRzp = String(utr).startsWith('pay_');
                              return (
                                <span
                                  key={uIdx}
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center space-x-1 ${isRzp
                                    ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  title={utr}
                                >
                                  {isRzp && <span className="text-amber-500">⚡</span>}
                                  <span>{isRzp ? 'Razorpay: ' : 'UTR: '}{utr.length > 14 ? `${utr.slice(0, 14)}...` : utr}</span>
                                </span>
                              );
                            })}
                            {receiptList.map((url, rIdx) => (
                              <a
                                key={rIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                title={`Open Payment Receipt #${rIdx + 1} in Google Drive`}
                              >
                                <span>🧾 {receiptList.length > 1 ? `Receipt ${rIdx + 1}` : 'Receipt'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>

                        </div>
                      </td>

                      {/* 7. Quick Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">

                          {/* WhatsApp Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Promote from Waitlist Button */}
                          {!isArchived && player.payment_status === 'waitlist' && (
                            <button
                              type="button"
                              onClick={(e) => handlePromotePlayer(player, e)}
                              className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                              title="Promote from Waitlist (Unlock Payment)"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Send WhatsApp Payment Link (for Pending / Promoted players) */}
                          {!isArchived && (!player.payment_status || player.payment_status === 'pending') && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                `Jai Sadgurudev Vandan! 🙏\n\nHi ${player.full_name}, your slot for RPL Season 9 is open! Please click the link below to complete your payment and confirm your pass:\nhttps://rpl-s9.vercel.app/#/register?mobile=${String(player.mobile || '').replace(/\D/g, '').slice(-10)}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Send Payment Link via WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </a>
                          )}

                          {/* Quick Approve / Reject (Only for active players) */}
                          {!isArchived && player.payment_status !== 'approved' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickApprove(player.id, e)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approve Payment"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {!isArchived && player.payment_status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickReject(player.id, e)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Reject Payment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Print Receipt Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptModalPlayer(player);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Print RPL Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Archive / Unarchive Toggle Button (Eye Icon) */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleArchive(player, e)}
                            className={`p-1.5 rounded-lg transition-colors ${isArchived
                              ? 'text-purple-700 bg-purple-100 hover:bg-purple-200'
                              : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                              }`}
                            title={
                              isArchived
                                ? 'Unarchive / Restore Player (Bring back to Active & Re-allocate)'
                                : 'Archive Player (Release Room & Kit Allocations)'
                            }
                          >
                            {isArchived ? (
                              <EyeOff className="w-4 h-4 text-purple-700" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Thermal Receipt Modal */}
      {receiptModalPlayer && (
        <ReceiptPrinterModal
          isOpen={Boolean(receiptModalPlayer)}
          onClose={() => setReceiptModalPlayer(null)}
          registrationId={receiptModalPlayer.registration_id || `RPL9-${receiptModalPlayer.id}`}
          data={{
            ...(receiptModalPlayer.general_details || {}),
            fullName: receiptModalPlayer.full_name,
            mobileNumber: receiptModalPlayer.mobile,
            email: receiptModalPlayer.email,
            centre: receiptModalPlayer.general_details?.centre,
            tshirtSize: receiptModalPlayer.general_details?.tshirtSize,
            spectatorTshirt: receiptModalPlayer.general_details?.spectatorTshirt,
            spectatorOption: receiptModalPlayer.general_details?.spectatorOption,
            spectatorDates: receiptModalPlayer.general_details?.spectatorDates,
            spectatorDays: receiptModalPlayer.general_details?.spectatorDays,
            registrationType: receiptModalPlayer.general_details?.registrationType || (receiptModalPlayer.sport_id === 'spectator' ? 'spectator' : 'player'),
            selectedSports: receiptModalPlayer.general_details?.selectedSports || [receiptModalPlayer.sport_id],
            customJerseyName: receiptModalPlayer.general_details?.customJerseyName,
            preferredJerseyNumber: receiptModalPlayer.general_details?.preferredJerseyNumber,
            foodPreference: receiptModalPlayer.general_details?.foodPreference,
            accommodationRequired: receiptModalPlayer.general_details?.accommodationRequired,
            stayingRoomNumber: receiptModalPlayer.general_details?.stayingRoomNumber,
            checkInDate: receiptModalPlayer.check_in_date || receiptModalPlayer.general_details?.checkInDate,
            checkOutDate: receiptModalPlayer.check_out_date || receiptModalPlayer.general_details?.checkOutDate,
            payment_utr: receiptModalPlayer.payment_utr,
            cardNo: receiptModalPlayer.general_details?.cardNo,
          }}
        />
      )}

      {/* Registration Mode Settings Modal */}
      {showModeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowModeModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Registration Mode Controls</h3>
                  <p className="text-xs text-slate-500">Independently manage Player and Spectator (90&apos;s Nostalgia Pass) forms</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRegSettings} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Player Registration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    🏃 Player Registration
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['open', 'waitlist', 'closed'] as const).map((m) => (
                    <button
                      key={`player-${m}`}
                      type="button"
                      onClick={() => setRegSettings({ ...regSettings, player_registration_mode: m })}
                      className={`py-2 px-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        regSettings.player_registration_mode === m
                          ? m === 'waitlist'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : m === 'closed'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'waitlist' ? '⏳ Waitlist' : m === 'closed' ? '🔒 Closed' : '🟢 Open'}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Player Waitlist Banner Message:
                  </label>
                  <textarea
                    rows={4}
                    value={regSettings.waitlist_banner_message}
                    onChange={(e) => setRegSettings({ ...regSettings, waitlist_banner_message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* Section 2: Spectator Registration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    🎟️ Spectator (90&apos;s Nostalgia Pass)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['open', 'waitlist', 'closed'] as const).map((m) => (
                    <button
                      key={`spec-${m}`}
                      type="button"
                      onClick={() => setRegSettings({ ...regSettings, spectator_registration_mode: m })}
                      className={`py-2 px-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        regSettings.spectator_registration_mode === m
                          ? m === 'waitlist'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : m === 'closed'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'waitlist' ? '⏳ Waitlist' : m === 'closed' ? '🔒 Closed' : '🟢 Open'}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Spectator Waitlist Banner Message:
                  </label>
                  <textarea
                    rows={4}
                    value={regSettings.spectator_waitlist_banner_message}
                    onChange={(e) => setRegSettings({ ...regSettings, spectator_waitlist_banner_message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 leading-relaxed resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Apply Mode Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
