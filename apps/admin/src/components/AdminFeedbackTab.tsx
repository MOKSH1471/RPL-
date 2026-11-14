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
} from 'lucide-react';
import { fetchAdminFeedbacks, FeedbackItem, FetchFeedbacksResponse } from '@/lib/api';

export function AdminFeedbackTab() {
  const [formFilter, setFormFilter] = useState<'all' | 'rpl_event' | 'auction_day'>('all');
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

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminFeedbacks({
        form_type: formFilter,
        search: searchTerm,
        page,
        limit: 50,
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

  useEffect(() => {
    setPage(1);
  }, [formFilter, searchTerm]);

  useEffect(() => {
    loadFeedbacks();
  }, [formFilter, page]);

  // Client-side search filter fallback
  const filteredFeedbacks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return feedbacks.filter((item) => {
      if (formFilter !== 'all' && item.form_type !== formFilter) return false;
      if (!q) return true;
      return (
        item.full_name?.toLowerCase().includes(q) ||
        item.mobile?.includes(q) ||
        item.feedback_text?.toLowerCase().includes(q)
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

  // Export to CSV (fetches full list without truncation)
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
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
        'Feedback & Suggestions',
        'Memorable Moment',
        'Raw Ratings JSON',
      ];

      const rows = exportItems.map((f) => [
        sanitizeCsvCell(f.id),
        sanitizeCsvCell(f.form_type === 'rpl_event' ? 'Season 9 Main Event' : 'Auction Day'),
        sanitizeCsvCell(new Date(f.created_at).toLocaleString('en-IN')),
        sanitizeCsvCell(f.full_name || ''),
        sanitizeCsvCell(f.mobile || ''),
        sanitizeCsvCell(f.overall_rating || ''),
        sanitizeCsvCell(f.feedback_text || ''),
        sanitizeCsvCell(f.wow_moment || ''),
        sanitizeCsvCell(JSON.stringify(f.ratings || {})),
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `RPL_Feedback_Export_${formFilter}_${new Date().toISOString().slice(0, 10)}.csv`
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
    <div className="space-y-6">
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
              <p className="text-xs text-slate-500 mt-0.5">
                Master submissions from Season 9 Event and Auction Day
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={loadFeedbacks}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredFeedbacks.length === 0 || isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exporting Full CSV...' : 'Export to Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* ── Form Selector Tabs & Search Filter ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Form Selector (Segmented buttons) */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setFormFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              formFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Responses ({stats.total_submissions})
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('rpl_event')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              formFilter === 'rpl_event'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Form 1: Season 9 Event ({stats.rpl_event})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormFilter('auction_day')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              formFilter === 'auction_day'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Form 2: Auction Day ({stats.auction_day})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by participant name or mobile..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/20 font-medium"
          />
        </div>
      </div>

      {/* ── Responses Table ── */}
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
                      <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {f.full_name || 'Anonymous'}
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
                      {new Date(f.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Overall Score */}
                    <td className="py-3.5 px-4 text-center">
                      {f.overall_rating ? (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{f.overall_rating} / 5</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Feedback preview */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 text-xs">
                      {f.feedback_text || f.wow_moment || (
                        <span className="text-slate-400 italic">No written comment</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
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
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedFeedback.form_type === 'rpl_event'
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
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        selectedFeedback.form_type === 'rpl_event'
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
                    {new Date(selectedFeedback.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
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
                              className={`w-4 h-4 ${
                                typeof val === 'number' && star <= val
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
    </div>
  );
}

export default AdminFeedbackTab;

