import React, { useMemo, useState } from 'react';
import { BarChart3, Search, Download, Trophy, Sparkles, User, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { normalizeCentreName } from '@/lib/centreUtils';
import { getPlayerTags, getTagBadgeClass, getAllKnownTags } from '@/lib/tagUtils';
import { getHistoricalCricketStats } from '@/lib/cricketStatsUtils';

interface AdminCricketStatsTabProps {
  registrations: any[];
  loading: boolean;
  onSelectPlayer?: (player: any) => void;
}

type SortKey =
  | 'name'
  | 'matches'
  | 'runs'
  | 'batAvg'
  | 'batSr'
  | 'fours'
  | 'sixes'
  | 'wickets'
  | 'overs'
  | 'eco'
  | 'bowlSr'
  | 'bowlAvg'
  | 'dotBalls'
  | 'catches'
  | 'caughtBehind'
  | 'runOuts'
  | 'stumpings'
  | 'caughtAndBowl';

function oversToNumber(ov?: string | null): number | null {
  if (!ov) return null;
  const [o, b] = String(ov).split('.');
  return (Number(o) || 0) * 6 + (Number(b) || 0);
}

function normalizeRoleLabel(raw: string): string {
  const clean = String(raw || '').trim();
  if (!clean) return '';
  if (clean.toLowerCase().replace(/[-\s]+/g, '') === 'allrounder') return 'All-Rounder';
  return clean;
}

function escapeCSV(val: any) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function AdminCricketStatsTab({ registrations, loading, onSelectPlayer }: AdminCricketStatsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<'all' | 'cricket' | 'womens-cricket' | 'kaccha-pakka'>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'with-stats' | 'no-stats'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'runs',
    dir: 'desc',
  });

  const handleColumnSort = (key: SortKey) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: key === 'name' || key === 'eco' || key === 'bowlSr' || key === 'bowlAvg' ? 'asc' : 'desc' }
    );
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />;
    }
    return sortConfig.dir === 'asc'
      ? <ArrowUp className="w-2.5 h-2.5 text-amber-600 shrink-0" />
      : <ArrowDown className="w-2.5 h-2.5 text-amber-600 shrink-0" />;
  };

  const renderSortTh = (label: string, key: SortKey, extraClass = '') => (
    <th
      onClick={() => handleColumnSort(key)}
      className={`py-2 px-2.5 text-right cursor-pointer hover:text-slate-900 whitespace-nowrap group ${extraClass}`}
    >
      <span className="inline-flex items-center justify-end gap-1">
        <span>{label}</span>
        {renderSortIcon(key)}
      </span>
    </th>
  );

  const cricketPlayers = useMemo(() => {
    return (registrations || [])
      .filter((r) => {
        const gen = r.general_details || {};
        const isTest = Boolean(r.email && (r.email.endsWith('@example.com') || r.email.endsWith('@test.com')));
        const isArch = Boolean(r.is_archived || gen.isArchived || isTest);
        const isWait = String(r.payment_status || '').toLowerCase() === 'waitlist';
        if (isArch || isWait) return false;

        const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports : [];
        const womensCat = String(r.sport_answers?.['womens-sports']?.category || '').toLowerCase();
        const isWomensCricket = sports.includes('womens-sports') && womensCat.includes('cricket');
        return sports.includes('cricket') || sports.includes('kaccha-pakka') || isWomensCricket;
      })
      .map((r) => {
        const gen = r.general_details || {};
        const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports : [];
        const womensCat = String(r.sport_answers?.['womens-sports']?.category || '').toLowerCase();
        const isWomensCricket = sports.includes('womens-sports') && womensCat.includes('cricket');
        const leagues: string[] = [];
        if (sports.includes('cricket')) leagues.push("Men's Cricket");
        if (isWomensCricket) leagues.push("Women's Cricket");
        if (sports.includes('kaccha-pakka')) leagues.push('Kaccha Pakka');

        const ans = r.sport_answers?.cricket || r.sport_answers?.['womens-sports'] || {};
        const role = normalizeRoleLabel(ans.role || ans.playingRole || ans.playing_role || '');
        const battingStyle = ans.battingStyle || ans.batting_style || '';
        const bowlingStyle = ans.bowlingStyle || ans.bowling_style || '';
        const tags = getPlayerTags(r);

        const hist = getHistoricalCricketStats(r);
        const batting = hist?.batting || null;
        const bowling = hist?.bowling || null;
        const fielding = hist?.fielding || null;

        return {
          player: r,
          id: r.id,
          name: r.full_name,
          centre: normalizeCentreName(gen.centre, 'Mumbai'),
          gender: gen.gender || 'Male',
          leagues,
          hasMens: sports.includes('cricket'),
          hasWomens: isWomensCricket,
          hasKaccha: sports.includes('kaccha-pakka'),
          role,
          battingStyle,
          bowlingStyle,
          tags,
          statsName: hist?.statsName || null,
          batting,
          bowling,
          fielding,
          hasStats: Boolean(batting || bowling || fielding),
        };
      });
  }, [registrations]);

  const getSortValue = (p: (typeof cricketPlayers)[number], key: SortKey): number | string | null => {
    switch (key) {
      case 'name': return p.name;
      case 'matches': return p.batting?.matches ?? null;
      case 'runs': return p.batting?.runs ?? null;
      case 'batAvg': return p.batting?.avg ?? null;
      case 'batSr': return p.batting?.sr ?? null;
      case 'fours': return p.batting?.fours ?? null;
      case 'sixes': return p.batting?.sixes ?? null;
      case 'wickets': return p.bowling?.wickets ?? null;
      case 'overs': return oversToNumber(p.bowling?.overs);
      case 'eco': return p.bowling?.eco ?? null;
      case 'bowlSr': return p.bowling?.sr ?? null;
      case 'bowlAvg': return p.bowling?.avg ?? null;
      case 'dotBalls': return p.bowling?.dot_balls ?? null;
      case 'catches': return p.fielding?.catches ?? null;
      case 'caughtBehind': return p.fielding?.caught_behind ?? null;
      case 'runOuts': return p.fielding?.run_outs ?? null;
      case 'stumpings': return p.fielding?.stumpings ?? null;
      case 'caughtAndBowl': return p.fielding?.caught_and_bowl ?? null;
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cricketPlayers
      .filter((p) => {
        if (leagueFilter === 'cricket' && !p.hasMens) return false;
        if (leagueFilter === 'womens-cricket' && !p.hasWomens) return false;
        if (leagueFilter === 'kaccha-pakka' && !p.hasKaccha) return false;
        if (historyFilter === 'with-stats' && !p.hasStats) return false;
        if (historyFilter === 'no-stats' && p.hasStats) return false;
        if (roleFilter !== 'all' && p.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
        if (tagFilter !== 'all') {
          if (tagFilter === 'untagged') {
            if (p.tags.length > 0) return false;
          } else if (!p.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase())) {
            return false;
          }
        }
        if (term) {
          const matchName = p.name?.toLowerCase().includes(term);
          const matchStatsName = p.statsName?.toLowerCase().includes(term);
          const matchCentre = p.centre?.toLowerCase().includes(term);
          const matchRole = p.role?.toLowerCase().includes(term);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(term));
          if (!matchName && !matchStatsName && !matchCentre && !matchRole && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const va = getSortValue(a, sortConfig.key);
        const vb = getSortValue(b, sortConfig.key);
        if (sortConfig.key === 'name') {
          return sortConfig.dir === 'asc'
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
        }
        if (va === null && vb === null) return a.name.localeCompare(b.name);
        if (va === null) return 1;
        if (vb === null) return -1;
        return sortConfig.dir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
      });
  }, [cricketPlayers, leagueFilter, historyFilter, roleFilter, tagFilter, searchTerm, sortConfig]);

  const availableRoles = useMemo(
    () => Array.from(new Set(cricketPlayers.map((p) => p.role).filter(Boolean))).sort(),
    [cricketPlayers]
  );

  const summary = useMemo(() => {
    const withStats = cricketPlayers.filter((p) => p.hasStats).length;
    return {
      total: cricketPlayers.length,
      withStats,
      noStats: cricketPlayers.length - withStats,
    };
  }, [cricketPlayers]);

  const handleExportCSV = () => {
    const headers = [
      'Sr No',
      'S9 Full Name',
      'Name in RPL Stats',
      'Tags',
      'Centre',
      'Gender',
      'League(s)',
      'Role',
      'Batting Style',
      'Bowling Style',
      'Matches',
      'Runs',
      'Bat Avg',
      'Bat SR',
      '4s',
      '6s',
      'Wickets',
      'Overs',
      'Bowl Eco',
      'Bowl SR',
      'Bowl Avg',
      'Dot Balls',
      'Catches',
      'Caught Behind',
      'Run Out',
      'Stumping',
      'Caught & Bowl',
    ];
    const rows = filtered.map((p, idx) =>
      [
        idx + 1,
        escapeCSV(p.name),
        escapeCSV(p.statsName || '-'),
        escapeCSV(p.tags.join(', ')),
        escapeCSV(p.centre),
        escapeCSV(p.gender),
        escapeCSV(p.leagues.join(' / ')),
        escapeCSV(p.role || '-'),
        escapeCSV(p.battingStyle || '-'),
        escapeCSV(p.bowlingStyle || '-'),
        p.batting?.matches ?? '-',
        p.batting?.runs ?? '-',
        p.batting?.avg ?? '-',
        p.batting?.sr ?? '-',
        p.batting?.fours ?? '-',
        p.batting?.sixes ?? '-',
        p.bowling?.wickets ?? '-',
        p.bowling?.overs ?? '-',
        p.bowling?.eco ?? '-',
        p.bowling?.sr ?? '-',
        p.bowling?.avg ?? '-',
        p.bowling?.dot_balls ?? '-',
        p.fielding?.catches ?? '-',
        p.fielding?.caught_behind ?? '-',
        p.fielding?.run_outs ?? '-',
        p.fielding?.stumpings ?? '-',
        p.fielding?.caught_and_bowl ?? '-',
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RPL9_Combined_Cricket_Stats_S6_S8_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Cricket Stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-emerald-500/10 border border-amber-300/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>RPL Historical Cricket Stats (S6 + S7 + S8 Combined)</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Combined batting, bowling, and fielding career stats from Seasons 6–8 matched to Season 9 cricket registrants. Click any column header to sort.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Stats CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cricket Registrants</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{summary.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">With S6–S8 Stats</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{summary.withStats}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">New / No Past Stats</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{summary.noStats}</span>
        </div>
      </div>

      {/* Filters & Sort Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="relative w-full lg:w-56 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player, centre, role, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5">
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value as any)}
            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Leagues</option>
            <option value="cricket">Men's Cricket</option>
            <option value="womens-cricket">Women's Cricket</option>
            <option value="kaccha-pakka">Kaccha Pakka</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 max-w-[130px]"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 max-w-[125px]"
          >
            <option value="all">All Tags</option>
            <option value="untagged">Untagged</option>
            {getAllKnownTags(registrations).map((tag) => (
              <option key={tag} value={tag}>
                Tag: {tag}
              </option>
            ))}
          </select>

          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value as any)}
            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All ({summary.total})</option>
            <option value="with-stats">With Stats ({summary.withStats})</option>
            <option value="no-stats">New ({summary.noStats})</option>
          </select>

          <select
            value={['runs', 'wickets', 'matches', 'catches', 'name'].includes(sortConfig.key) ? sortConfig.key : 'runs'}
            onChange={(e) => {
              const k = e.target.value as SortKey;
              setSortConfig({ key: k, dir: k === 'name' ? 'asc' : 'desc' });
            }}
            className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="runs">Sort: Runs</option>
            <option value="wickets">Sort: Wickets</option>
            <option value="matches">Sort: Matches</option>
            <option value="catches">Sort: Catches</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Combined Stats Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 sticky left-0 bg-slate-50 z-10 min-w-[220px]">Player / Role / Tags</th>
                <th className="py-3 px-2 text-center bg-amber-50/50 border-l border-slate-200" colSpan={6}>
                  Batting (S6–S8)
                </th>
                <th className="py-3 px-2 text-center bg-emerald-50/50 border-l border-slate-200" colSpan={6}>
                  Bowling (S6–S8)
                </th>
                <th className="py-3 px-2 text-center bg-sky-50/50 border-l border-slate-200" colSpan={5}>
                  Fielding (S6–S8)
                </th>
              </tr>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 select-none">
                <th
                  onClick={() => handleColumnSort('name')}
                  className="py-2 px-3 sticky left-0 bg-slate-50/95 z-10 cursor-pointer hover:text-slate-900 group"
                >
                  <span className="inline-flex items-center gap-1">
                    <span>Name &amp; Details</span>
                    {renderSortIcon('name')}
                  </span>
                </th>
                {renderSortTh('Mat', 'matches', 'border-l border-slate-200')}
                {renderSortTh('Runs', 'runs')}
                {renderSortTh('Avg', 'batAvg')}
                {renderSortTh('SR', 'batSr')}
                {renderSortTh('4s', 'fours')}
                {renderSortTh('6s', 'sixes')}
                {renderSortTh('Wkts', 'wickets', 'border-l border-slate-200')}
                {renderSortTh('Ov', 'overs')}
                {renderSortTh('Eco', 'eco')}
                {renderSortTh('SR', 'bowlSr')}
                {renderSortTh('Avg', 'bowlAvg')}
                {renderSortTh('Dots', 'dotBalls')}
                {renderSortTh('C', 'catches', 'border-l border-slate-200')}
                {renderSortTh('CB', 'caughtBehind')}
                {renderSortTh('RO', 'runOuts')}
                {renderSortTh('St', 'stumpings')}
                {renderSortTh('C&B', 'caughtAndBowl')}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    No cricket players match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPlayer?.(p.player)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]" title={p.name}>
                          {p.name}
                        </span>
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${getTagBadgeClass(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{p.centre}</span>
                        {p.role && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/80 text-[9px] font-bold">
                            {p.role}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {p.leagues.map((lg) => (
                          <span
                            key={lg}
                            className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-bold"
                          >
                            {lg}
                          </span>
                        ))}
                        {p.statsName ? (
                          <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Trophy className="w-2.5 h-2.5" />
                            {p.statsName}
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Batting */}
                    <td className="py-2.5 px-2 text-right font-mono border-l border-slate-100">{p.batting?.matches ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">{p.batting?.runs ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.batting ? (p.batting.avg ?? '-') : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.batting ? p.batting.sr : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.batting?.fours ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.batting?.sixes ?? '-'}</td>

                    {/* Bowling */}
                    <td className="py-2.5 px-2 text-right font-mono font-extrabold text-emerald-700 border-l border-slate-100">
                      {p.bowling?.wickets ?? '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.bowling?.overs ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.bowling ? p.bowling.eco : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.bowling ? (p.bowling.sr ?? '-') : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.bowling ? (p.bowling.avg ?? '-') : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.bowling?.dot_balls ?? '-'}</td>

                    {/* Fielding */}
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-sky-700 border-l border-slate-100">
                      {p.fielding?.catches ?? '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.fielding?.caught_behind ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.fielding?.run_outs ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.fielding?.stumpings ?? '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{p.fielding?.caught_and_bowl ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
