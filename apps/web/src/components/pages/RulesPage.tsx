import React, { useState, useMemo } from 'react';
import {
  FileText,
  ArrowLeft,
  Search,
  Zap,
  Sparkles,
  Trophy,
  Shield,
  Clock,
  AlertTriangle,
  Scale,
  Users,
  Target,
  Flame,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface RulesPageProps {
  onBackToHome: () => void;
  onScorecardClick?: () => void;
}

type CategoryTab =
  | 'all'
  | 'powerball'
  | 'meeraben'
  | 'format'
  | 'bowling'
  | 'batting'
  | 'fielding'
  | 'timings'
  | 'conduct';

export const RulesPage: React.FC<RulesPageProps> = ({ onBackToHome, onScorecardClick }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: CategoryTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'all', label: 'All Rules', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'powerball', label: '⚡ Powerball (New)', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'meeraben', label: '🌸 Meeraben Rules', icon: <Sparkles className="w-4 h-4 text-pink-500" /> },
    { id: 'format', label: 'Match Format', icon: <Trophy className="w-4 h-4 text-blue-500" /> },
    { id: 'bowling', label: 'Bowling Rules', icon: <Target className="w-4 h-4 text-emerald-500" /> },
    { id: 'batting', label: 'Batting & Crease', icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { id: 'fielding', label: 'Fielding Limits', icon: <Shield className="w-4 h-4 text-indigo-500" /> },
    { id: 'timings', label: 'Timings & Penalties', icon: <Clock className="w-4 h-4 text-red-500" /> },
    { id: 'conduct', label: 'Code of Conduct', icon: <Scale className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ── Top Bar ── */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-bold text-[11px] uppercase tracking-wider border border-amber-500/25">
                Season 8 / 2026
              </span>
              <span className="text-xs text-slate-500 font-medium">Turf Cricket Regulations</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScorecardClick && (
              <button
                type="button"
                onClick={onScorecardClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Matches</span>
              </button>
            )}
            <a
              href="https://docs.google.com/document/d/1ebK1tatVr6BfUt7D36yC7pWYwa1s1QFQwVOy-QXDQY4/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Open Official Google Doc"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Google Doc</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-14 sm:py-20 px-4 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.18),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-5 shadow-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>RAJ PREMIER LEAGUE — TURF CRICKET</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Official Rules &amp; Regulations
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Final approved tournament rulebook for RPL Turf Cricket 2026. Includes all new Powerball rules,
            Meeraben opening guidelines, timing caps, and umpire protocols.
          </p>

          {/* Quick Notice Pill */}
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Updated with New Additions &amp; Highlighted Regulations</span>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules (e.g. Powerball, Meeraben, No ball, Penalty, 36 runs)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 border border-slate-700 focus:border-amber-500 outline-none text-sm font-medium transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-amber-300 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: POWERBALL RULES (Special Highlight)
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'powerball') && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-3xl border-2 border-amber-400/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-bl-2xl shadow-xs">
              ⚡ Exclusive RPL Rule
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Powerball Rules
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  High-stakes 3rd ball mechanic applicable to every single over
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Every 3rd Ball is a Powerball</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6">
                  Every 3rd legal delivery of every over is officially designated as a <strong>Powerball</strong>.
                  Both teams are required to keep track; umpire signal is not mandatory for Powerball status.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Runs Scored are DOUBLED (2X)</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6">
                  In batting Powerball, all runs scored off the bat are doubled for the batting team.
                  For example: 1 run becomes <strong>2</strong>, 2 runs become <strong>4</strong>, 4 becomes <strong>8</strong>, and a 6 becomes <strong>12 runs</strong>!
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-red-200/80 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Wicket on Powerball = MINUS 5 Runs (-5)</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6">
                  If the batting team loses a wicket on the Powerball, <strong>5 runs will be deducted (-5)</strong> from the team total alongside the loss of wicket.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Wide &amp; No Ball Powerball Continuation</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6">
                  If a wide or no-ball is bowled on the Powerball, the Powerball continues! Runs scored off the no-ball and the subsequent proper Powerball are doubled. For a wide ball, <strong>2 runs</strong> are awarded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2: MEERABEN RULES (Women Player Feature)
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'meeraben') && (
          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-white rounded-3xl border-2 border-pink-300 shadow-md p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Meeraben Special Rules
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Regulations governing women participation, opening over, and scoring multipliers
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-pink-200 p-5 shadow-xs">
                <h3 className="font-bold text-pink-900 text-sm mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-black">1</span>
                  Opening Batting &amp; Compulsory 1st Over
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pl-8">
                  Both Meeraben players will <strong>Open the Batting</strong>, and the <strong>1st Over of the match must be bowled by a Meeraben player</strong>.
                  Meeraben players cannot be retired out during the first over.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-pink-200 p-5 shadow-xs">
                <h3 className="font-bold text-pink-900 text-sm mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-black">2</span>
                  Meeraben Batting Multipliers
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pl-8 mt-3">
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-center">
                    <div className="text-xs text-slate-500 font-bold uppercase">1 Touch</div>
                    <div className="text-lg font-black text-pink-600 mt-0.5">1 Run</div>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-center">
                    <div className="text-xs text-slate-500 font-bold uppercase">1 Running Run</div>
                    <div className="text-lg font-black text-pink-600 mt-0.5">2 Runs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-center">
                    <div className="text-xs text-slate-500 font-bold uppercase">Boundary 4</div>
                    <div className="text-lg font-black text-pink-600 mt-0.5">8 Runs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-center">
                    <div className="text-xs text-slate-500 font-bold uppercase">Maximum 6</div>
                    <div className="text-lg font-black text-pink-600 mt-0.5">12 Runs</div>
                  </div>
                </div>
                <p className="text-slate-500 text-xs pl-8 mt-2.5 italic">
                  * Meeraben getting out while batting in the Meeraben over is NOT equal to minus 5 runs.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-pink-200 p-5 shadow-xs">
                <h3 className="font-bold text-pink-900 text-sm mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-black">3</span>
                  Meeraben Over Wicket &amp; Run Deduction Rules
                </h3>
                <ul className="text-slate-700 text-xs sm:text-sm space-y-2 pl-8 list-disc">
                  <li>
                    In the Meeraben over, <strong>1 wicket = minus 5 runs (-5)</strong> for the batting side.
                  </li>
                  <li>
                    Whatever runs scored by the batting side will be <strong>divided by 2</strong> (applicable only for Haribhai batsmen), and then 5 runs will be deducted from the total.
                  </li>
                  <li>
                    Meeraben bowling to Meeraben batsmen: normal cricket rules are fully applicable.
                  </li>
                  <li>
                    Spin bowling to Meeraben players is permitted.
                  </li>
                  <li>
                    The Meeraben over must be formally conveyed to the main umpire and scorer prior to start. The leg umpire will signal so all participants are aware.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3: MATCH FORMAT & OVERS
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'format') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Match Format &amp; Overs
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Innings lengths, bowler quotas, squad size, and team substitutes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  League Stage (6 Overs)
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Matches will be played for <strong>6 overs</strong> including one Meeraben over. Maximum 1 over per bowler (Over format: 1, 1, 1, 1, 1, 1). First Meeraben over is compulsory.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Quarter-Finals, Semi-Finals &amp; Finals (8 Overs)
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Knockout matches will be held for <strong>8 overs</strong> (Over format: 2, 2, 1, 1, 1, 1). First Meeraben over is compulsory.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  11 Players on Field (No Last Man Standing)
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  On the field there can be 11 players; all 11 can bat. There is <strong>NO LAST MAN STANDING</strong>. If a team doesn't have 11 players, they must play short.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Team Owner Substitute Rule
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  If a player is missing, the official team owner can take the field instead of the player, but absolutely no outside substitutes are permitted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4: BOWLING RULES & RESTRICTIONS
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'bowling') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-black shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Bowling Rules &amp; Restrictions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Speed restrictions, delivery action, crease lines, and mandatory umpire calls
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Fast Bowling is NOT Allowed:</strong>
                  Fast bowling will be called No Ball after 2 warnings. The first two fast ball warnings will be considered dead balls.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">No Run-Up Bowling:</strong>
                  A bowler cannot run and bowl. Walking 1–2 steps is allowed, but evasive or side-arm action is strictly prohibited. Hiding the ball while bowling is not allowed. Evasive action will be called No Ball after two warnings (first two are dead balls).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Waist-Height Full Toss:</strong>
                  Above waist height full toss or one tap above waist height is a No Ball. Runs scored off this ball will be considered as extra runs.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Crease Line Crossing:</strong>
                  While bowling, if the front leg is completely outside the front line or side line, it is called a No Ball by the umpire.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Mandatory "SIDE" Declaration:</strong>
                  If the bowler doesn’t say <strong>SIDE</strong> while starting his/her over, it will be called a No Ball by the umpire. "SIDE" must be audibly said to the umpire at the start of every over.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Wicketkeeper Change Notification:</strong>
                  Any change of wicketkeeper must be formally conveyed to the leg umpire, or else the leg umpire will call a No Ball.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Free Hit on No Balls:</strong>
                  In case of a No Ball, 1 run will be awarded to the opponent team alongside a Free Hit as per cricket rules.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 5: BATTING, DISMISSALS & NET TAP RULES
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'batting') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Batting &amp; Dismissals
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Retirement thresholds, net contact rules, run out criteria, and scoring extras
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <strong className="text-amber-900 font-bold block text-sm">
                  ⚡ 36-Run Individual Retirement Rule
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  A batsman must retire if he crosses <strong>36 individual runs</strong>. This rule is applicable for League stages only. He can bat again only if the complete team gets dismissed (Last man batting is not allowed).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🚫 No Leg Before Wicket (No LBW)
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  There is <strong>no LBW</strong> dismissal in RPL Turf Cricket under any circumstances.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🥅 Net Contact = One Tap
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  If the ball touches the nets above (roof) or on the side, it is counted as <strong>one tap</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  2 or More Taps = Dead Ball
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Two or more taps is considered a dead ball. However, if the ball goes wide it remains a wide ball. Stumping on such wide balls will be considered OUT.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🌐 Ball Outside Playing Turf = 1 Run
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  If the ball goes outside the playing turf on either side, it is declared as <strong>1 run</strong>. Batsmen crossing is allowed.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🎯 Run Out Requirements
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  A run out can be a direct hit or executed if the bowler, fielder, or wicketkeeper hits the wickets with the ball in the same hand.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🏃 Byes, Leg Byes &amp; Overthrows
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Overthrows, byes, and leg byes are permitted (running between the wickets is required to score extra runs). Players can score runs by running while the ball is live.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">
                  🚪 Voluntary Retired Out
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Batsmen / Batswomen can choose to be Retired Out during the match (except Meeraben during the First Over).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 6: FIELDING RESTRICTIONS
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'fielding') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Field Placement Restrictions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Boundary pole markers, bowler boundary lines, and dugout requirements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="text-3xl font-black text-indigo-600">3</div>
                <div className="font-bold text-slate-900">Max on Boundary</div>
                <p className="text-slate-600 text-xs">
                  Maximum 3 fielders on the boundary behind the 3rd last pole including the boundary pole (which is the last pole).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="text-3xl font-black text-indigo-600">5</div>
                <div className="font-bold text-slate-900">Behind Bowler</div>
                <p className="text-slate-600 text-xs">
                  Maximum 5 fielders permitted behind the bowler at the point of delivery.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="text-3xl font-black text-indigo-600">∞</div >
                <div className="font-bold text-slate-900">Inside Bowling Line</div>
                <p className="text-slate-600 text-xs">
                  No restrictions in the number of fielders positioned inside the bowling line.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Dugout Requirement:</strong> All batting team players must wait inside the designated batting dugout during live play.</span>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 7: MATCH TIMINGS & OVER PENALTIES
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'timings') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-black shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Match Timings &amp; Over Penalties
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Strict 30-minute match limit, over penalties, and pre-match toss protocols
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-2">
                <h3 className="font-bold text-red-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>30 Minutes Match Limit &amp; 5 Runs/Over Penalty</span>
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Every match must be completed within <strong>30 minutes</strong>. Each team will have <strong>15 minutes to complete their quota of 6 overs</strong>.
                  A strict penalty of <strong>5 runs per over</strong> will be levied for every over bowled after 15 minutes.
                  The team bowling 1st will also be penalized 5 runs per over bowled after 15 minutes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Time-Wasting Deductions</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Time wasted arguing with the umpire will be counted against the team's 15-minute allotment. For example, if a team argues and wastes time while batting, that exact amount of time will be added against them when they bowl.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30 Minutes Prior Toss Attendance</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Every team is requested to be present at the toss counter <strong>30 minutes prior to their actual match schedule</strong>. If a team or captain is not present during that time, the opponent team will be awarded winning walkover points.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 8: CODE OF CONDUCT & TIEBREAKERS
            ════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'conduct') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-black shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Code of Conduct &amp; Tiebreakers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Umpire authority, dispute protocols, CricHeroes NRR calculations, and tournament rights
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>UMPIRE DECISION IS FINAL</span>
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  The umpire's decision is absolute and final. Any argument with the umpire will lead to deduction of runs or, in severe cases, immediate disqualification of the player or team. In case of any query, <strong>only the captain</strong> can consult with the umpire.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Tied Points &amp; CricHeroes NRR Formula</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  In case of teams tied on points after the league stage, the Net Run Rate (NRR) formula will be used to determine standings and qualification. The calculation of NRR will be as per the official <strong>CricHeroes</strong> platform.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>RPL Organizing Committee Rights</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  The RPL Team reserves all rights to change, alter, or modify any decision with regards to the RAJ PREMIER LEAGUE Turf Cricket Tournament at any point before and during the championship without prior notification.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

