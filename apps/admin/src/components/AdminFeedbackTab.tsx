import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquareHeart,
  Star,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Phone,
  User,
  Gavel,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Filter,
  Sparkles,
  Heart,
  Utensils,
  MapPin,
  Flame,
  Shirt,
  Music,
  BarChart2,
  Copy,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  Loader2,
  Check,
  Users,
  Send,
  TrendingUp,
} from 'lucide-react';
import {
  fetchAdminFeedbacks,
  fetchFeedbackSettings,
  updateFeedbackSettings,
  fetchNonRespondents,
  FeedbackItem,
  FetchFeedbacksResponse,
  FeedbackSettingsResponse,
  NonRespondentItem,
} from '@/lib/api';
import {
  formatDateTimeIST,
  formatFullDateTimeIST,
  formatDateIST,
  parseDbDate,
} from '@/lib/dateUtils';

type FilterType = 'all' | 'rpl_event' | 'auction_day' | 'critical' | 'non_respondents';

export function AdminFeedbackTab() {
  const [formFilter, setFormFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState<FetchFeedbacksResponse['stats']>({
    rpl_event: 0,
    rpl_event_avg: 0,
    auction_day: 0,
    auction_day_avg: 0,
    total_submissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showWowGallery, setShowWowGallery] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  // Non-Respondents Follow-up state
  const [nonRespondents, setNonRespondents] = useState<NonRespondentItem[]>([]);
  const [nonRespondentsTotal, setNonRespondentsTotal] = useState(0);
  const [nonRespondentsLoading, setNonRespondentsLoading] = useState(false);
  const [nonRespondentsPage, setNonRespondentsPage] = useState(1);
  const [copiedAllPhones, setCopiedAllPhones] = useState(false);

  // Settings & Expiry Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [rplStatus, setRplStatus] = useState<'open' | 'closed' | 'scheduled'>('open');
  const [rplExpiresAt, setRplExpiresAt] = useState<string>('');
  const [rplCloseMessage, setRplCloseMessage] = useState<string>('');
  const [auctionStatus, setAuctionStatus] = useState<'open' | 'closed' | 'scheduled'>('open');
  const [auctionExpiresAt, setAuctionExpiresAt] = useState<string>('');
  const [auctionCloseMessage, setAuctionCloseMessage] = useState<string>('');
  const [liveSettings, setLiveSettings] = useState<FeedbackSettingsResponse['settings'] | null>(null);

  const DEFAULT_RPL_CLOSE_MSG =
    'Feedback collection for RPL Season 9 has now concluded. The organizing committee sincerely thanks every player, captain, and volunteer who shared their thoughts. See you in Season 10!';

  const DEFAULT_AUCTION_CLOSE_MSG =
    'Feedback collection for the RPL Season 9 Auction Ceremony has now concluded. The organizing committee sincerely thanks every attendee who shared their inputs. See you in Season 10!';

  const formatToDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = parseDbDate(dateStr);
    if (!d || isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetchFeedbackSettings();
      if (res && res.settings) {
        setLiveSettings(res.settings);
        setRplStatus(res.settings.rpl_event?.status || 'open');
        setRplExpiresAt(formatToDateTimeLocal(res.settings.rpl_event?.expires_at));
        setRplCloseMessage(
          res.settings.rpl_event?.close_message || res.settings.rpl_event_close_message || DEFAULT_RPL_CLOSE_MSG
        );
        setAuctionStatus(res.settings.auction_day?.status || 'open');
        setAuctionExpiresAt(formatToDateTimeLocal(res.settings.auction_day?.expires_at));
        setAuctionCloseMessage(
          res.settings.auction_day?.close_message || res.settings.auction_day_close_message || DEFAULT_AUCTION_CLOSE_MSG
        );
      }
    } catch (err) {
      console.error('Failed to load feedback settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await updateFeedbackSettings({
        rpl_event_status: rplStatus,
        rpl_event_expires_at: rplStatus === 'scheduled' && rplExpiresAt ? new Date(rplExpiresAt).toISOString() : null,
        rpl_event_close_message: rplCloseMessage.trim() || DEFAULT_RPL_CLOSE_MSG,
        auction_day_status: auctionStatus,
        auction_day_expires_at: auctionStatus === 'scheduled' && auctionExpiresAt ? new Date(auctionExpiresAt).toISOString() : null,
        auction_day_close_message: auctionCloseMessage.trim() || DEFAULT_AUCTION_CLOSE_MSG,
      });
      if (res && res.settings) {
        setLiveSettings(res.settings);
      }
      setShowSettingsModal(false);
      setSaveSuccessMsg('Feedback settings saved and applied live to all forms!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update feedback settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const isCriticalFeedback = (item: FeedbackItem): boolean => {
    if (item.overall_rating && item.overall_rating <= 2) return true;
    const checkValues = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'number' && val === 1) return true;
        if (typeof val === 'object' && checkValues(val)) return true;
      }
      return false;
    };
    return checkValues(item.ratings);
  };

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminFeedbacks({
        form_type: formFilter === 'critical' ? 'all' : formFilter,
        search: searchTerm,
        page,
        limit: 100,
      });
      if (res && res.data) {
        setFeedbacks(res.data);
        setTotalRecords(res.total || 0);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNonRespondents = async () => {
    setNonRespondentsLoading(true);
    try {
      const res = await fetchNonRespondents({
        search: searchTerm,
        page: nonRespondentsPage,
        limit: 50,
      });
      if (res && res.data) {
        setNonRespondents(res.data);
        setNonRespondentsTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load non-respondents:', err);
    } finally {
      setNonRespondentsLoading(false);
    }
  };

  const handleCopyAllPhoneNumbers = async () => {
    try {
      const res = await fetchNonRespondents({
        search: searchTerm,
        page: 1,
        limit: 2000,
      });
      const phones = (res?.data || []).map((p) => p.mobile.replace(/\D/g, '').slice(-10)).filter(Boolean);
      if (phones.length === 0) {
        alert('No pending phone numbers found to copy.');
        return;
      }
      await navigator.clipboard.writeText(phones.join(', '));
      setCopiedAllPhones(true);
      setTimeout(() => setCopiedAllPhones(false), 3000);
    } catch (err) {
      console.error('Failed to copy phone numbers:', err);
      alert('Failed to copy phone numbers');
    }
  };

  useEffect(() => {
    setPage(1);
    setNonRespondentsPage(1);
  }, [formFilter, searchTerm]);

  useEffect(() => {
    if (formFilter === 'non_respondents') {
      loadNonRespondents();
    } else {
      loadFeedbacks();
    }
  }, [formFilter, page, nonRespondentsPage]);

  const criticalCount = useMemo(() => {
    return feedbacks.filter(isCriticalFeedback).length;
  }, [feedbacks]);

  const wowMomentsList = useMemo(() => {
    return feedbacks
      .filter((f) => Boolean(f.wow_moment && f.wow_moment.trim().length > 0))
      .map((f) => ({
        id: f.id,
        name: f.full_name || 'Participant',
        mobile: f.mobile,
        form_type: f.form_type,
        overall_rating: f.overall_rating,
        date: f.created_at,
        quote: f.wow_moment!.trim(),
      }));
  }, [feedbacks]);

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, { sum: number; count: number; label: string }> = {
      overall: { sum: 0, count: 0, label: 'Overall Tournament Experience' },
      officiating: { sum: 0, count: 0, label: 'Match Officiating & Umpires' },
      ground: { sum: 0, count: 0, label: 'Ground & Arena Conditions' },
      hospitality: { sum: 0, count: 0, label: 'Meals & Food Hospitality' },
      opening: { sum: 0, count: 0, label: 'Opening Ceremony' },
      closing: { sum: 0, count: 0, label: 'Closing Ceremony & Awards' },
      jersey: { sum: 0, count: 0, label: 'Jersey & Tournament Kit' },
      auction_overall: { sum: 0, count: 0, label: 'Auction Day Flow & Atmosphere' },
    };

    feedbacks.forEach((f) => {
      if (f.overall_rating) {
        if (f.form_type === 'rpl_event') {
          categories.overall.sum += f.overall_rating;
          categories.overall.count++;
        } else {
          categories.auction_overall.sum += f.overall_rating;
          categories.auction_overall.count++;
        }
      }

      const r = f.ratings || {};
      if (r.tournament) {
        const offRating = r.tournament.officiating ?? r.tournament.umpiring;
        if (typeof offRating === 'number') {
          categories.officiating.sum += offRating;
          categories.officiating.count++;
        }
        if (typeof r.tournament.ground === 'number') {
          categories.ground.sum += r.tournament.ground;
          categories.ground.count++;
        }
      }
      if (r.hospitality) {
        ['accommodation', 'food_catering', 'transport', 'support', 'breakfast', 'dining', 'hydration', 'stay'].forEach((k) => {
          if (typeof r.hospitality[k] === 'number') {
            categories.hospitality.sum += r.hospitality[k];
            categories.hospitality.count++;
          }
        });
      }
      if (r.opening_ceremony) {
        ['hosting', 'sound', 'av_visuals', 'program', 'costumes', 'reception', 'march_past', 'torch', 'food_refreshment'].forEach((k) => {
          if (typeof r.opening_ceremony[k] === 'number') {
            categories.opening.sum += r.opening_ceremony[k];
            categories.opening.count++;
          }
        });
      }
      if (r.jersey_caps) {
        ['jersey_fit', 'jersey_quality', 'cap_quality', 'caps'].forEach((k) => {
          if (typeof r.jersey_caps[k] === 'number') {
            categories.jersey.sum += r.jersey_caps[k];
            categories.jersey.count++;
          }
        });
      }
      const closingRating = (f.metadata && typeof f.metadata.closing_ceremony === 'number')
        ? f.metadata.closing_ceremony
        : (typeof r.closing_ceremony === 'number' ? r.closing_ceremony : null);
      if (closingRating !== null) {
        categories.closing.sum += closingRating;
        categories.closing.count++;
      }
      if (f.form_type === 'auction_day') {
        ['food', 'venue', 'ambience', 'ceremony', 'hospitality'].forEach((k) => {
          if (typeof r[k] === 'number') {
            categories.auction_overall.sum += r[k];
            categories.auction_overall.count++;
          }
        });
      }
    });

    return Object.entries(categories)
      .filter(([_, data]) => data.count > 0)
      .map(([key, data]) => ({
        key,
        label: data.label,
        average: Number((data.sum / data.count).toFixed(1)),
        count: data.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [feedbacks]);

  // Client-side search filter fallback
  const filteredFeedbacks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return feedbacks.filter((item) => {
      if (formFilter === 'critical') {
        if (!isCriticalFeedback(item)) return false;
      } else if (formFilter !== 'all' && item.form_type !== formFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.full_name?.toLowerCase().includes(q) ||
        item.mobile?.includes(q) ||
        item.feedback_text?.toLowerCase().includes(q) ||
        item.wow_moment?.toLowerCase().includes(q)
      );
    });
  }, [feedbacks, formFilter, searchTerm]);

  // Sanitize cell to prevent CSV Formula Injection in Excel
  const sanitizeCsvCell = (val: any) => {
    let str = String(val ?? '');
    if (/^[=\+\-@]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Export to CSV with structured question sub-category columns
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (formFilter === 'non_respondents') {
        const nrRes = await fetchNonRespondents({
          search: searchTerm,
          limit: 2000,
        });
        const pendingItems = nrRes?.data || nonRespondents;
        if (pendingItems.length === 0) return;

        const nrHeaders = ['Player ID', 'Participant Name', 'Registered Mobile', 'Sport', 'Registered On'];
        const nrRows = pendingItems.map((p) => [
          sanitizeCsvCell(p.id),
          sanitizeCsvCell(p.full_name || ''),
          sanitizeCsvCell(p.mobile || ''),
          sanitizeCsvCell(p.sport_id || 'Cricket'),
          sanitizeCsvCell(p.submitted_at ? formatDateTimeIST(p.submitted_at) : ''),
        ]);

        const nrCsvContent = '\uFEFF' + [nrHeaders.join(','), ...nrRows.map((r) => r.join(','))].join('\n');
        const nrBlob = new Blob([nrCsvContent], { type: 'text/csv;charset=utf-8;' });
        const nrUrl = URL.createObjectURL(nrBlob);
        const nrLink = document.createElement('a');
        nrLink.href = nrUrl;
        nrLink.setAttribute('download', `RPL_Pending_Feedback_FollowUp_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(nrLink);
        nrLink.click();
        document.body.removeChild(nrLink);
        URL.revokeObjectURL(nrUrl);
        return;
      }

      const res = await fetchAdminFeedbacks({
        form_type: formFilter,
        search: searchTerm,
        limit: 2000,
      });
      const exportItems = res?.data || filteredFeedbacks;
      if (exportItems.length === 0) return;

      const headers = [
        'Submission ID',
        'Form Type',
        'Date & Time',
        'Participant Name',
        'Mobile Number',
        'Overall Rating (1-5)',
        'Needs Attention (Critical)',
        'Participated Sports',
        // Tournament Experience
        'Tournament - Officiating',
        'Tournament - Ground',
        'Tournament - Schedule',
        'Tournament - Cricket',
        'Tournament - Womens Cricket',
        'Tournament - Kaccha Pakka',
        'Tournament - Football',
        'Tournament - Table Tennis',
        'Tournament - Carrom',
        // Opening Ceremony
        'Opening Ceremony - Attended',
        'Opening Ceremony - Hosting',
        'Opening Ceremony - Sound',
        'Opening Ceremony - AV & Visuals',
        'Opening Ceremony - Program',
        'Opening Ceremony - Costumes & Theme',
        // Hospitality & Logistics
        'Hospitality - Accommodation',
        'Hospitality - Food & Catering',
        'Hospitality - Transport Logistics',
        'Hospitality - Volunteer Support',
        // Jersey & Caps
        'Kit - Jersey Fit',
        'Kit - Jersey Quality',
        'Kit - Cap Quality',
        // Closing Ceremony
        'Closing Ceremony - Attended',
        'Closing Ceremony - Rating (1-5)',
        // Auction Day
        'Auction - Food & Refreshments',
        'Auction - Venue & Comfort',
        'Auction - Ambience & Vibe',
        'Auction - Bidding Flow',
        'Auction - Table Support',
        // Text & Notes
        'Feedback & Suggestions',
        'Organizing Committee Note',
        'Personal WOW Moment',
      ];

      const rows = exportItems.map((f) => {
        const r = f.ratings || {};
        const meta = f.metadata || {};
        const t = r.tournament || {};
        const o = r.opening_ceremony || {};
        const h = r.hospitality || {};
        const j = r.jersey_caps || {};

        const isOpeningNA = Boolean(
          meta.opening_ceremony_na ||
          meta.openingCeremonyNA ||
          o.attended === false ||
          (f.form_type === 'rpl_event' && !['hosting', 'sound', 'av_visuals', 'program', 'costumes'].some((k) => typeof o[k] === 'number'))
        );
        const isClosingNA = Boolean(
          meta.closing_ceremony_na ||
          meta.closingCeremonyNA ||
          meta.closing_ceremony === null ||
          meta.closing_ceremony === 'na'
        );
        const closingScore = isClosingNA
          ? 'Did Not Attend'
          : (meta.closing_ceremony ?? r.closing_ceremony ?? '');

        const parts = String(f.feedback_text || '').split('\n\n[RPL Team Note]: ');
        const mainFeedback = parts[0] || '';
        const teamNote = parts[1] || '';

        return [
          sanitizeCsvCell(f.id),
          sanitizeCsvCell(f.form_type === 'rpl_event' ? 'Season 9 Main Event' : 'Auction Day'),
          sanitizeCsvCell(formatDateTimeIST(f.created_at)),
          sanitizeCsvCell(f.full_name || ''),
          sanitizeCsvCell(f.mobile || ''),
          sanitizeCsvCell(f.overall_rating || ''),
          sanitizeCsvCell(isCriticalFeedback(f) ? 'YES (Critical)' : 'No'),
          sanitizeCsvCell(Array.isArray(meta.sports_labels) ? meta.sports_labels.join(', ') : ''),
          // Tournament
          sanitizeCsvCell(t.officiating ?? t.umpiring ?? ''),
          sanitizeCsvCell(t.ground ?? ''),
          sanitizeCsvCell(t.schedule ?? ''),
          sanitizeCsvCell(t.cricket ?? ''),
          sanitizeCsvCell(t.cricket_women ?? ''),
          sanitizeCsvCell(t.cricket_kp ?? ''),
          sanitizeCsvCell(t.football ?? ''),
          sanitizeCsvCell(t.table_tennis ?? ''),
          sanitizeCsvCell(t.carrom ?? ''),
          // Opening Ceremony
          sanitizeCsvCell(isOpeningNA ? 'Did Not Attend' : 'Attended'),
          sanitizeCsvCell(isOpeningNA ? 'N/A' : (o.hosting ?? '')),
          sanitizeCsvCell(isOpeningNA ? 'N/A' : (o.sound ?? '')),
          sanitizeCsvCell(isOpeningNA ? 'N/A' : (o.av_visuals ?? '')),
          sanitizeCsvCell(isOpeningNA ? 'N/A' : (o.program ?? '')),
          sanitizeCsvCell(isOpeningNA ? 'N/A' : (o.costumes ?? '')),
          // Hospitality
          sanitizeCsvCell(h.accommodation ?? h.stay ?? ''),
          sanitizeCsvCell(h.food_catering ?? h.dining ?? ''),
          sanitizeCsvCell(h.transport ?? ''),
          sanitizeCsvCell(h.support ?? ''),
          // Jersey
          sanitizeCsvCell(j.jersey_fit ?? ''),
          sanitizeCsvCell(j.jersey_quality ?? ''),
          sanitizeCsvCell(j.cap_quality ?? j.caps ?? ''),
          // Closing Ceremony
          sanitizeCsvCell(isClosingNA ? 'Did Not Attend' : 'Attended'),
          sanitizeCsvCell(closingScore),
          // Auction
          sanitizeCsvCell(f.form_type === 'auction_day' ? (r.food ?? '') : ''),
          sanitizeCsvCell(f.form_type === 'auction_day' ? (r.venue ?? '') : ''),
          sanitizeCsvCell(f.form_type === 'auction_day' ? (r.ambience ?? '') : ''),
          sanitizeCsvCell(f.form_type === 'auction_day' ? (r.ceremony ?? '') : ''),
          sanitizeCsvCell(f.form_type === 'auction_day' ? (r.hospitality ?? '') : ''),
          // Text
          sanitizeCsvCell(mainFeedback),
          sanitizeCsvCell(teamNote),
          sanitizeCsvCell(f.wow_moment || ''),
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `RPL_Feedback_Structured_Export_${formFilter}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export feedback CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* ── Floating Success Toast ── */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/60 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── Header Title & Actions ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Feedback & Survey Center
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500">
                  Master submissions from Season 9 Event and Auction Day
                </p>
                {liveSettings && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                        liveSettings.rpl_event?.is_closed
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : liveSettings.rpl_event?.status === 'scheduled'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${liveSettings.rpl_event?.is_closed ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      Event: {liveSettings.rpl_event?.is_closed ? 'Closed' : liveSettings.rpl_event?.status === 'scheduled' ? 'Scheduled' : 'Live'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                        liveSettings.auction_day?.is_closed
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : liveSettings.auction_day?.status === 'scheduled'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${liveSettings.auction_day?.is_closed ? 'bg-rose-500' : 'bg-purple-500'}`} />
                      Auction: {liveSettings.auction_day?.is_closed ? 'Closed' : liveSettings.auction_day?.status === 'scheduled' ? 'Scheduled' : 'Live'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => {
              loadSettings();
              setShowSettingsModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Set feedback schedule & expiry deadlines without touching server config"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Expiry &amp; Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWowGallery((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showWowGallery ? 'Hide Wow Moments' : `Wow Moments (${wowMomentsList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadSettings();
              if (formFilter === 'non_respondents') {
                loadNonRespondents();
                loadFeedbacks();
              } else {
                loadFeedbacks();
              }
            }}
            disabled={loading || nonRespondentsLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || nonRespondentsLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={((formFilter === 'non_respondents' ? nonRespondents.length === 0 : filteredFeedbacks.length === 0)) || isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exporting Full CSV...' : 'Export to Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── Wow Moments Showcase Gallery ── */}
      {showWowGallery && (
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 rounded-3xl border border-amber-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900">
                  🌟 Season 9 Memorable &amp; Wow Moments Showcase
                </h3>
                <p className="text-xs text-slate-600">
                  {wowMomentsList.length} quotes shared by participants for committee presentation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWowGallery(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Close Gallery
            </button>
          </div>

          {wowMomentsList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No written wow moments submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wowMomentsList.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {m.form_type === 'rpl_event' ? 'Main Event' : 'Auction Day'}
                      </span>
                      {m.overall_rating && (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{m.overall_rating}★</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif italic text-slate-800 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-3">
                      &ldquo;{m.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.mobile}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`"${m.quote}" — ${m.name}`);
                        setCopiedQuoteId(m.id);
                        setTimeout(() => setCopiedQuoteId(null), 2000);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Copy Quote"
                    >
                      {copiedQuoteId === m.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Summary Stat Cards (Turnout Rate & Submissions Breakdown) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Turnout & Coverage */}
        <div className="bg-white rounded-3xl border border-emerald-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Turnout &amp; Coverage
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
              <span>{stats.turnout_percent ?? 0}%</span>
              <span className="text-xs font-bold text-emerald-600">Turnout</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {stats.unique_submitters ?? 0} of {stats.approved_players ?? 0} approved players
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Submissions
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.total_submissions}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Across both feedback forms</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
        </div>

        {/* Main Event Stats */}
        <div className="bg-white rounded-3xl border border-amber-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Season 9 Event
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                {stats.rpl_event}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
              <span>{stats.rpl_event_avg > 0 ? stats.rpl_event_avg : '—'}</span>
              <span className="text-xs font-bold text-amber-500">/ 5.0 ⭐</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Avg Overall Experience</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Auction Day Stats */}
        <div className="bg-white rounded-3xl border border-purple-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                Auction Day
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                {stats.auction_day}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
              <span>{stats.auction_day_avg > 0 ? stats.auction_day_avg : '—'}</span>
              <span className="text-xs font-bold text-purple-500">/ 5.0 ⭐</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Avg Overall Rating</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Star Rating Distribution Bar (Instant Sentiment Analysis) ── */}
      {stats.rating_distribution && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Star Rating &amp; Sentiment Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Overall rating breakdown across all submitted participant evaluations
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total Rated:{' '}
              <strong className="text-slate-800">
                {(stats.rating_distribution[5] || 0) +
                  (stats.rating_distribution[4] || 0) +
                  (stats.rating_distribution[3] || 0) +
                  (stats.rating_distribution[2] || 0) +
                  (stats.rating_distribution[1] || 0)}
              </strong>
            </div>
          </div>

          {(() => {
            const r5 = stats.rating_distribution[5] || 0;
            const r4 = stats.rating_distribution[4] || 0;
            const r3 = stats.rating_distribution[3] || 0;
            const r2 = stats.rating_distribution[2] || 0;
            const r1 = stats.rating_distribution[1] || 0;
            const total = r5 + r4 + r3 + r2 + r1;

            if (total === 0) {
              return (
                <div className="text-xs text-slate-400 italic py-2">
                  No overall ratings recorded yet.
                </div>
              );
            }

            const p5 = Math.round((r5 / total) * 100);
            const p4 = Math.round((r4 / total) * 100);
            const p3 = Math.round((r3 / total) * 100);
            const p2 = Math.round((r2 / total) * 100);
            const p1 = Math.round((r1 / total) * 100);

            return (
              <div className="space-y-3">
                {/* Stacked Horizontal Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner p-0.5 gap-0.5">
                  {r5 > 0 && (
                    <div
                      style={{ width: `${(r5 / total) * 100}%` }}
                      className="h-full bg-emerald-500 rounded-sm transition-all duration-500"
                      title={`5 Stars: ${r5} (${p5}%)`}
                    />
                  )}
                  {r4 > 0 && (
                    <div
                      style={{ width: `${(r4 / total) * 100}%` }}
                      className="h-full bg-teal-500 rounded-sm transition-all duration-500"
                      title={`4 Stars: ${r4} (${p4}%)`}
                    />
                  )}
                  {r3 > 0 && (
                    <div
                      style={{ width: `${(r3 / total) * 100}%` }}
                      className="h-full bg-amber-400 rounded-sm transition-all duration-500"
                      title={`3 Stars: ${r3} (${p3}%)`}
                    />
                  )}
                  {r2 > 0 && (
                    <div
                      style={{ width: `${(r2 / total) * 100}%` }}
                      className="h-full bg-orange-400 rounded-sm transition-all duration-500"
                      title={`2 Stars: ${r2} (${p2}%)`}
                    />
                  )}
                  {r1 > 0 && (
                    <div
                      style={{ width: `${(r1 / total) * 100}%` }}
                      className="h-full bg-rose-500 rounded-sm transition-all duration-500"
                      title={`1 Star: ${r1} (${p1}%)`}
                    />
                  )}
                </div>

                {/* Rating Distribution Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1">
                  <div className="flex items-center space-x-2 bg-emerald-50/60 border border-emerald-100 px-3 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-800">5★ Excellent</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r5} ({p5}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-teal-50/60 border border-teal-100 px-3 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-800">4★ Good</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r4} ({p4}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-amber-50/60 border border-amber-100 px-3 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-800">3★ Average</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r3} ({p3}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-orange-50/60 border border-orange-100 px-3 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-800">2★ Fair</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r2} ({p2}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-rose-50/60 border border-rose-100 px-3 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-800">1★ Poor</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r1} ({p1}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Category Performance Breakdown (Average Rating by Area) ── */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Category Performance Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Average ratings aggregated across all participant responses
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryBreakdown((prev) => !prev)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span>{showCategoryBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}</span>
              {showCategoryBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showCategoryBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-2">
              {categoryBreakdown.map((cat) => {
                const pct = Math.min(100, Math.round((cat.average / 5) * 100));
                const barColor =
                  cat.average >= 4.3
                    ? 'bg-emerald-500'
                    : cat.average >= 3.5
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                return (
                  <div key={cat.key} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{cat.label}</span>
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-extrabold text-slate-900">{cat.average}</span>
                        <span className="text-amber-500">★</span>
                        <span className="text-[10px] text-slate-400">({cat.count} rated)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Form Selector Tabs & Search Filter ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Form Selector (Segmented buttons) */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFormFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${formFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            All Responses ({stats.total_submissions})
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('rpl_event')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${formFilter === 'rpl_event'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Season 9 Event ({stats.rpl_event})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('auction_day')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${formFilter === 'auction_day'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Auction Day ({stats.auction_day})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${formFilter === 'critical'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
              }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>⚠️ Needs Attention ({criticalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('non_respondents')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${formFilter === 'non_respondents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              Pending Follow-Up ({stats.approved_players ? Math.max(0, stats.approved_players - (stats.unique_submitters || 0)) : 0})
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              formFilter === 'non_respondents'
                ? 'Search pending player by name or mobile...'
                : 'Search by participant name or mobile...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/20 font-medium"
          />
        </div>
      </div>

      {/* ── Table View: Pending Non-Respondents OR Feedback Responses ── */}
      {formFilter === 'non_respondents' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Action Bar for Non-Respondents */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Pending Participant Follow-Ups ({nonRespondentsTotal})</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Approved registered players who haven't submitted feedback yet. Send individual WhatsApp reminders or copy numbers for broadcast.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyAllPhoneNumbers}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Copy all pending player phone numbers separated by comma"
            >
              {copiedAllPhones ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied All to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy All Numbers (Broadcast)</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">Registered Mobile</th>
                  <th className="py-3.5 px-4">Sport / Registration</th>
                  <th className="py-3.5 px-4">Registered On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nonRespondentsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                      <span>Loading pending participants...</span>
                    </td>
                  </tr>
                ) : nonRespondents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      <span className="block font-bold text-slate-700">All caught up!</span>
                      <span className="text-xs text-slate-400">
                        {searchTerm ? 'No pending players matching your search.' : 'All approved players have submitted their feedback!'}
                      </span>
                    </td>
                  </tr>
                ) : (
                  nonRespondents.map((p) => {
                    const cleanPhone = p.mobile.replace(/\D/g, '').slice(-10);
                    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                    const feedbackLink = isLocal
                      ? 'http://localhost:3000/#/feedback'
                      : 'https://rpl-s9.vercel.app/#/feedback';
                    const whatsappMsg = `Jai Sadgurudev Vandan! 🙏\n\nDear ${p.full_name || 'Participant'},\n\nWe would love to know your experience at Raj Premier League Season 9! Your feedback helps the organizing committee make future tournaments and ceremonies even better.\n\nTake 2 minutes to share your thoughts here:\n${feedbackLink}\n\nThank you!\nRPL Season 9 Organizing Committee`;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{p.full_name || 'Participant'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(0, 8)}...</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{p.mobile}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                            {p.sport_id || 'Cricket'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDateIST(p.submitted_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reminder</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Non-Respondents */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{nonRespondents.length}</strong> of{' '}
              <strong className="text-slate-800">{nonRespondentsTotal}</strong> pending players
              {nonRespondentsTotal > 50 && (
                <span className="ml-1 text-[11px] text-slate-400">
                  (Page {nonRespondentsPage} of {Math.max(1, Math.ceil(nonRespondentsTotal / 50))})
                </span>
              )}
            </div>
            {nonRespondentsTotal > 50 && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={nonRespondentsPage <= 1 || nonRespondentsLoading}
                  onClick={() => setNonRespondentsPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700 px-2">Page {nonRespondentsPage}</span>
                <button
                  type="button"
                  disabled={nonRespondentsPage * 50 >= nonRespondentsTotal || nonRespondentsLoading}
                  onClick={() => setNonRespondentsPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Responses Table ── */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Form Type</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Overall</th>
                  <th className="py-3.5 px-4">Feedback Summary</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                      <span>Loading feedback responses...</span>
                    </td>
                  </tr>
                ) : filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <MessageSquareHeart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <span className="block font-bold text-slate-600">No feedback submissions found</span>
                      <span className="text-xs text-slate-400">
                        {searchTerm
                          ? 'Try clearing your search query'
                          : 'Submissions from /rpl-feedback and /auction-feedback will appear here automatically.'}
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedFeedback(f)}
                      className="hover:bg-amber-50/20 transition-colors cursor-pointer group"
                    >
                      {/* Participant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {f.full_name || 'Anonymous'}
                          </span>
                          {isCriticalFeedback(f) && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                              <span>Needs Attention</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{f.mobile}</span>
                        </div>
                      </td>

                      {/* Form Type Badge */}
                      <td className="py-3.5 px-4">
                        {f.form_type === 'rpl_event' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                            <Trophy className="w-3 h-3 text-amber-600" />
                            <span>Season 9 Event</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold">
                            <Gavel className="w-3 h-3 text-purple-600" />
                            <span>Auction Day</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDateTimeIST(f.created_at)}
                      </td>

                      {/* Overall Score */}
                      <td className="py-3.5 px-4 text-center">
                        {f.overall_rating ? (
                          <div
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-xs border ${f.overall_rating <= 2
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                              }`}
                          >
                            <Star
                              className={`w-3 h-3 ${f.overall_rating <= 2
                                ? 'fill-rose-400 text-rose-500'
                                : 'fill-amber-400 text-amber-400'
                                }`}
                            />
                            <span>{f.overall_rating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Feedback preview */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 text-xs">
                        {f.feedback_text ? (
                          <div className="truncate font-medium text-slate-800">{f.feedback_text}</div>
                        ) : null}
                        {f.wow_moment ? (
                          <div className="flex items-center gap-1 text-[11px] text-pink-700 truncate mt-0.5">
                            <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500 shrink-0" />
                            <span className="italic truncate">&ldquo;{f.wow_moment}&rdquo;</span>
                          </div>
                        ) : null}
                        {!f.feedback_text && !f.wow_moment && (
                          <span className="text-slate-400 italic">No written comment</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/91${f.mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                              `Jai Sadgurudev Vandan! ${f.full_name || 'Participant'},\n\nThank you for sharing your feedback for Raj Premier League Season 9. We noticed some areas where your experience could have been better, and the organizing committee would love to understand how we can improve for future seasons.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all shadow-2xs ${isCriticalFeedback(f)
                              ? 'bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border-emerald-200'
                              }`}
                            title="WhatsApp Follow-up"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeedback(f);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination & Response Counter ── */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{filteredFeedbacks.length}</strong> of{' '}
              <strong className="text-slate-800">{totalRecords}</strong> submissions
              {totalRecords > 50 && (
                <span className="ml-1 text-[11px] text-slate-400">
                  (Page {page} of {Math.max(1, Math.ceil(totalRecords / 50))})
                </span>
              )}
            </div>
            {totalRecords > 50 && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700 px-2">Page {page}</span>
                <button
                  type="button"
                  disabled={page * 50 >= totalRecords || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detailed Response Modal ── */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedFeedback.form_type === 'rpl_event'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                >
                  {selectedFeedback.form_type === 'rpl_event' ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Gavel className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${selectedFeedback.form_type === 'rpl_event'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                        }`}
                    >
                      {selectedFeedback.form_type === 'rpl_event'
                        ? 'Season 9 Main Event'
                        : 'Auction Day Ceremony'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedFeedback.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    📱 {selectedFeedback.mobile} &bull; 🕒{' '}
                    {formatFullDateTimeIST(selectedFeedback.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/91${selectedFeedback.mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                    `Jai Sadgurudev Vandan! ${selectedFeedback.full_name || 'Participant'},\n\nThank you for sharing your feedback for Raj Premier League Season 9.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs sm:text-sm">
              {/* Overall Rating Callout */}
              {selectedFeedback.overall_rating && (
                <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 flex items-center justify-between">
                  <span className="font-bold text-amber-900">Overall Rating Score</span>
                  <div className="inline-flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200 font-black text-amber-700 text-base shadow-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{selectedFeedback.overall_rating} / 5</span>
                  </div>
                </div>
              )}

              {/* Category Ratings Breakdown */}
              <div>
                <h4 className="font-display font-extrabold text-sm text-slate-900 mb-3 uppercase tracking-wider text-[11px] text-slate-400">
                  Category Ratings Breakdown
                </h4>

                {selectedFeedback.form_type === 'auction_day' ? (
                  /* Auction Day Simple Rows */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(selectedFeedback.ratings || {}).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${typeof val === 'number' && star <= val
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                                }`}
                            />
                          ))}
                          <span className="text-xs font-mono font-bold text-slate-700 ml-1">
                            {val}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Main Event Nested Groups */
                  <div className="space-y-4">
                    {Object.entries(selectedFeedback.ratings || {}).map(([groupKey, groupVals]) => {
                      if (!groupVals || typeof groupVals !== 'object') return null;
                      return (
                        <div
                          key={groupKey}
                          className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5"
                        >
                          <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                            {groupKey.replace(/_/g, ' ')}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(groupVals).map(([rKey, rVal]) => (
                              <div
                                key={rKey}
                                className="bg-white p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between"
                              >
                                <span className="text-xs font-medium text-slate-700 capitalize">
                                  {rKey.replace(/_/g, ' ')}
                                </span>
                                <span className="font-bold text-amber-600 font-mono text-xs">
                                  ⭐ {String(rVal)}/5
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Written Feedback Text */}
              {selectedFeedback.feedback_text && (
                <div className="space-y-1.5">
                  <h4 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                    Feedback & Suggestions
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedFeedback.feedback_text}
                  </div>
                </div>
              )}

              {/* WOW Moment */}
              {selectedFeedback.wow_moment && (
                <div className="space-y-1.5">
                  <h4 className="font-display font-extrabold text-sm text-pink-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>Personal Memorable / &ldquo;WOW&rdquo; Moment</span>
                  </h4>
                  <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedFeedback.wow_moment}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Schedule & Expiry Controls Modal ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900">
                    Feedback Schedule &amp; Expiry Controls
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set deadlines or toggle forms open/closed without touching environment variables
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveSettings} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. Main Tournament Feedback Schedule */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Season 9 Main Event Feedback
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      rplStatus === 'closed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : rplStatus === 'scheduled'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {rplStatus === 'closed' ? 'Closed' : rplStatus === 'scheduled' ? 'Scheduled Auto-Close' : 'Always Open'}
                  </span>
                </div>

                {/* 3-Way Mode Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRplStatus('open')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      rplStatus === 'open'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟢 Always Open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRplStatus('scheduled');
                      if (!rplExpiresAt) {
                        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        setRplExpiresAt(formatToDateTimeLocal(nextWeek.toISOString()));
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      rplStatus === 'scheduled'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟡 Set Deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => setRplStatus('closed')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      rplStatus === 'closed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔴 Close Now
                  </button>
                </div>

                {/* Scheduled Date & Time Picker */}
                {rplStatus === 'scheduled' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Close Form Automatically On:</span>
                      <span className="text-[11px] font-normal text-slate-500">Indian Standard Time (IST)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={rplExpiresAt}
                      onChange={(e) => setRplExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required={rplStatus === 'scheduled'}
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1 py-0.5">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                          setRplExpiresAt(formatToDateTimeLocal(d.toISOString()));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                          setRplExpiresAt(formatToDateTimeLocal(d.toISOString()));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRplExpiresAt('2026-12-28T23:59');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        End of Season 9 (28 Dec 23:59)
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Event Closed Message */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Announcement Message when Main Event Form is Closed:
                    </label>
                    <button
                      type="button"
                      onClick={() => setRplCloseMessage(DEFAULT_RPL_CLOSE_MSG)}
                      className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Restore Default
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={rplCloseMessage}
                    onChange={(e) => setRplCloseMessage(e.target.value)}
                    placeholder="Enter the announcement message displayed when Main Event feedback is closed..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* 2. Auction Ceremony Feedback Schedule */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-purple-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Auction Ceremony Feedback
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      auctionStatus === 'closed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : auctionStatus === 'scheduled'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {auctionStatus === 'closed' ? 'Closed' : auctionStatus === 'scheduled' ? 'Scheduled Auto-Close' : 'Always Open'}
                  </span>
                </div>

                {/* 3-Way Mode Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAuctionStatus('open')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      auctionStatus === 'open'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟣 Always Open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuctionStatus('scheduled');
                      if (!auctionExpiresAt) {
                        const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
                        setAuctionExpiresAt(formatToDateTimeLocal(nextWeek.toISOString()));
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      auctionStatus === 'scheduled'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟡 Set Deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuctionStatus('closed')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      auctionStatus === 'closed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔴 Close Now
                  </button>
                </div>

                {/* Scheduled Date & Time Picker */}
                {auctionStatus === 'scheduled' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Close Form Automatically On:</span>
                      <span className="text-[11px] font-normal text-slate-500">Indian Standard Time (IST)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={auctionExpiresAt}
                      onChange={(e) => setAuctionExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required={auctionStatus === 'scheduled'}
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1 py-0.5">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                          setAuctionExpiresAt(formatToDateTimeLocal(d.toISOString()));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                          setAuctionExpiresAt(formatToDateTimeLocal(d.toISOString()));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>
                )}

                {/* Auction Ceremony Closed Message */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Announcement Message when Auction Ceremony Form is Closed:
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuctionCloseMessage(DEFAULT_AUCTION_CLOSE_MSG)}
                      className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                    >
                      Restore Default
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={auctionCloseMessage}
                    onChange={(e) => setAuctionCloseMessage(e.target.value)}
                    placeholder="Enter the announcement message displayed when Auction Ceremony feedback is closed..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Live...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Apply Changes Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFeedbackTab;

