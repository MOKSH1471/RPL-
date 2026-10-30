import React, { useState, useEffect, useRef } from 'react';
import { CricketMatch } from '@/types';
import { fetchScorecardMatches, calculateStandings } from '@/lib/cricketData';
import { MatchCard } from './MatchCard';
import { MatchDetailsModal } from './MatchDetailsModal';
import { StandingsTable } from './StandingsTable';
import { LeadersStats } from './LeadersStats';
import {
  Search,
  RefreshCw,
  ArrowLeft,
  Clock,
} from 'lucide-react';

interface ScorecardPageProps {
  onBackToHome: () => void;
}

type TabType = 'matches' | 'overview' | 'table' | 'stats';
type FilterStatus = 'all' | 'live' | 'upcoming' | 'completed';

export const ScorecardPage: React.FC<ScorecardPageProps> = ({ onBackToHome }) => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedMatch, setSelectedMatch] = useState<CricketMatch | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const selectedMatchIdRef = useRef<string | null>(null);
  selectedMatchIdRef.current = selectedMatch ? selectedMatch.id : null;

  // Load matches from database & local cache
  const loadMatches = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await fetchScorecardMatches();
      setMatches(data);

      // Keep open modal in sync with live ball delivery
      if (selectedMatchIdRef.current) {
        const active = data.find((m) => m.id === selectedMatchIdRef.current);
        if (active) setSelectedMatch(active);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error fetching live matches:', err);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  // 1. Initial load
  useEffect(() => {
    loadMatches();
  }, []);

  // 2. Real-time BroadcastChannel sync from Admin Scorer (0ms instantaneous latency!)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel('rpl_cricket_live_sync');
    channel.onmessage = (event) => {
      const { type, match, matches: incomingMatches } = event.data || {};

      if (type === 'MATCH_UPDATED' && match && match.id) {
        setMatches((prev) => {
          const idx = prev.findIndex((m) => m.id === match.id);
          if (idx >= 0) {
            return prev.map((m) => (m.id === match.id ? match : m));
          }
          return [match, ...prev];
        });

        setSelectedMatch((curr) => {
          if (curr && curr.id === match.id) {
            return match;
          }
          return curr;
        });

        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else if (type === 'MATCHES_LIST_UPDATED' && Array.isArray(incomingMatches)) {
        setMatches(incomingMatches);
        if (selectedMatchIdRef.current) {
          const found = incomingMatches.find((m) => m.id === selectedMatchIdRef.current);
          if (found) setSelectedMatch(found);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // 3. Real-time Server-Sent Events (SSE) listener (cross-port instant sync)
  useEffect(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/cricket/matches/stream');
      es.onmessage = (event) => {
        try {
          const streamMatches = JSON.parse(event.data);
          if (Array.isArray(streamMatches)) {
            setMatches(streamMatches);
            if (selectedMatchIdRef.current) {
              const active = streamMatches.find((m: any) => m.id === selectedMatchIdRef.current);
              if (active) setSelectedMatch(active);
            }
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        } catch (err) {
          console.error('Error parsing SSE match stream:', err);
        }
      };
    } catch (e) {
      console.warn('SSE connection failed, falling back to polling:', e);
    }

    return () => {
      if (es) es.close();
    };
  }, []);

  // 4. Storage event listener (cross-tab fallback sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rpl_cricket_active_match' || e.key === 'rpl_cricket_matches_list') {
        loadMatches(false);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 5. Background network poll to server (every 1s if match is live or empty, else 2s)
  useEffect(() => {
    const hasLiveMatch = matches.some((m) => m.status === 'live' || m.status === 'innings_break');
    const intervalMs = hasLiveMatch || matches.length === 0 ? 1000 : 2000;

    const interval = setInterval(() => {
      loadMatches(false);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [matches]);

  // Filter matches based on search query & status chip
  const filteredMatches = matches.filter((m) => {
    if (filterStatus === 'live' && m.status !== 'live' && m.status !== 'innings_break') {
      return false;
    }
    if (filterStatus === 'upcoming' && m.status !== 'upcoming') {
      return false;
    }
    if (filterStatus === 'completed' && m.status !== 'completed') {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.teamA?.name && m.teamA.name.toLowerCase().includes(q)) ||
      (m.teamB?.name && m.teamB.name.toLowerCase().includes(q)) ||
      (m.teamA?.shortName && m.teamA.shortName.toLowerCase().includes(q)) ||
      (m.teamB?.shortName && m.teamB.shortName.toLowerCase().includes(q)) ||
      (m.venue && m.venue.toLowerCase().includes(q)) ||
      (m.stage && m.stage.toLowerCase().includes(q))
    );
  });

  const liveMatches = matches.filter(
    (m) => m.status === 'live' || m.status === 'innings_break'
  );
  const standings = calculateStandings(matches);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 font-sans">
      {/* ── Header Strip with Back Link & Title ── */}
      <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-1.5 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to RPL Home</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
              RPL Season 9
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ball-by-Ball Live</span>
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight mt-1">
            Tournament <span className="text-amber-600">Scorecard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Real-time live scores updated ball-by-ball from the Admin Scorer
          </p>
        </div>

        {/* Live sync status & refresh button */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Synced: {lastSyncTime}
          </span>
          <button
            type="button"
            onClick={() => loadMatches(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Sports Navigation & Filter Bar (No Horizontal Scrolling) ── */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 p-2.5 sm:p-3.5 shadow-xs mb-6 space-y-3">
        {/* Main Tab Switcher (4-Column Grid: Fits every phone screen with zero scrolling) */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              activeTab === 'matches'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Matches</span>
            {liveMatches.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer text-center ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer text-center truncate ${
              activeTab === 'table'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="hidden sm:inline">Points </span>Table
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer text-center ${
              activeTab === 'stats'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stats
          </button>
        </div>

        {/* Secondary Bar for Matches Tab: Filters + Compact Search (Clean wrapping, no scrollbars) */}
        {activeTab === 'matches' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Filter Chips (flex-wrap: no horizontal scrollbar) */}
            <div className="flex flex-wrap items-center gap-1.5 py-0.5">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All ({matches.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('live')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                  filterStatus === 'live'
                    ? 'bg-emerald-600 text-white font-black shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Live ({liveMatches.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('upcoming')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  filterStatus === 'upcoming'
                    ? 'bg-slate-800 text-white font-black shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('completed')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  filterStatus === 'completed'
                    ? 'bg-slate-800 text-white font-black shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Results
              </button>
            </div>

            {/* Compact Search Bar */}
            <div className="relative w-full sm:w-64 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or venue..."
                className="w-full pl-8 pr-14 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[11px] text-slate-400 hover:text-slate-700 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Tab Content ── */}
      <div className="max-w-3xl mx-auto">
        {/* TAB 1: MATCHES */}
        {activeTab === 'matches' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Match Cards List */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-xs sm:text-sm">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
                <span>Loading real-time match data...</span>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-xs space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  {searchQuery ? 'No Matches Found' : 'No Matches Scheduled Yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {searchQuery
                    ? 'No matches match your search query. Try searching for a different team or venue.'
                    : 'As soon as an admin or scorer creates or scores a match in the Admin Scorer portal, it will immediately appear here with live ball-by-ball updates.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSelect={(m) => setSelectedMatch(m)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {liveMatches.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Spotlight Match</span>
                </div>
                <MatchCard
                  match={liveMatches[0]}
                  onSelect={(m) => setSelectedMatch(m)}
                />
              </div>
            )}

            <StandingsTable standings={standings} />
            <LeadersStats matches={matches} />
          </div>
        )}

        {/* TAB 3: TABLE */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            <StandingsTable standings={standings} />
          </div>
        )}

        {/* TAB 4: STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <LeadersStats matches={matches} />
          </div>
        )}
      </div>

      {/* ── Comprehensive Scorecard Detail Modal ── */}
      <MatchDetailsModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
};
