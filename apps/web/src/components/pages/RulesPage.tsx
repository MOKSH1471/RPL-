import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Trophy,
  Zap,
  Clock,
  ShieldCheck,
  Scale,
  Sparkles,
  Share2,
  Check,
  ChevronRight,
  Award,
  BookOpen,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface RulesPageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

type RuleCategory =
  | 'all'
  | 'format'
  | 'batting'
  | 'bowling'
  | 'meeraben'
  | 'powerball'
  | 'fielding'
  | 'timings';

interface RuleItem {
  id: number;
  category: RuleCategory;
  categoryLabel: string;
  plainText: string;
  text: React.ReactNode;
}

export const RulesPage: React.FC<RulesPageProps> = ({
  onBackToHome,
  onRegisterClick,
  onCheckPassClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory>('all');
  const [copiedRuleId, setCopiedRuleId] = useState<number | null>(null);

  const rules: RuleItem[] = [
    {
      id: 1,
      category: 'format',
      categoryLabel: 'Match Format',
      plainText:
        'Matches will be played for 6 overs including one MeeraBen Over…Maximum 1 overs per bowler...Over Format (1,1,1,1,1,1) (First Meeraben over compulsory).',
      text: (
        <>
          Matches will be played for 6 overs including one MeeraBen Over… Maximum 1 overs per bowler... Over Format (1,1,1,1,1,1){' '}
          <span className="font-bold text-slate-900">
            (First Meeraben over compulsory)
          </span>
          .
        </>
      ),
    },
    {
      id: 2,
      category: 'format',
      categoryLabel: 'Quarter / Finals',
      plainText:
        'For Quarter Finals – Semi Finals & Finals – Matches will be held for 8 overs (Overs Format – 2,2,1,1,1,1) – First Meeraben Over Compulsory.',
      text: (
        <>
          For Quarter Finals – Semi Finals &amp; Finals – Matches will be held for 8 overs{' '}
          <span className="font-bold text-slate-900">
            (Overs Format – 2,2,1,1,1,1) – First Meeraben Over Compulsory
          </span>
          .
        </>
      ),
    },
    {
      id: 3,
      category: 'format',
      categoryLabel: 'Squad & Players',
      plainText:
        'On field there can be 11 players, all 11 can bat, there is no LAST MAN STANDING. If a team doesn’t have 11 players they’ll have to play with short players. (Their owner can play instead of the Player but no one else)',
      text: (
        <>
          On field there can be 11 players, all 11 can bat, there is no <strong>LAST MAN STANDING</strong>. If a team doesn’t have 11 players they’ll have to play with short players.{' '}
          <span className="font-bold text-slate-900">
            (Their owner can play instead of the Player but no one else)
          </span>
        </>
      ),
    },
    {
      id: 4,
      category: 'batting',
      categoryLabel: 'Dismissals',
      plainText: 'No leg before wicket.',
      text: <>No leg before wicket (LBW).</>,
    },
    {
      id: 5,
      category: 'fielding',
      categoryLabel: 'Fielding',
      plainText:
        'Run out can be direct hit or if bowler, fielder, wicketkeeper hit wickets with ball in same hand.',
      text: (
        <>
          Run out can be direct hit or if bowler, fielder, wicketkeeper hit wickets with ball in same hand.
        </>
      ),
    },
    {
      id: 6,
      category: 'bowling',
      categoryLabel: 'Deliveries',
      plainText: 'Wide and no ball as per cricket rules.',
      text: <>Wide and no ball as per standard cricket rules.</>,
    },
    {
      id: 7,
      category: 'bowling',
      categoryLabel: 'Bowling Speed',
      plainText:
        'Fast bowling is not allowed and will be called No ball after 2 warnings. First two fast balls warning will be considered dead balls.',
      text: (
        <>
          Fast bowling is not allowed and will be called No ball after 2 warnings. First two fast balls warning will be considered dead balls.
        </>
      ),
    },
    {
      id: 8,
      category: 'batting',
      categoryLabel: 'Retirement Rule',
      plainText:
        'A batsman has to retire if he crosses 36 Individual runs. This Rule is applicable for League stages only. He can Bat again if the complete team gets dismissed. But Please Note Last Man Batting is not allowed…',
      text: (
        <>
          A batsman has to retire if he crosses 36 Individual runs.{' '}
          <span className="font-bold text-slate-900">
            This Rule is applicable for League stages only. He can Bat again if the complete team gets dismissed. But Please Note Last Man Batting is not allowed…
          </span>
        </>
      ),
    },
    {
      id: 9,
      category: 'meeraben',
      categoryLabel: 'Meeraben Over',
      plainText:
        'In Meeraben over 1 wicket = minus 5 runs for batting side. Whatever runs scored by batting side will be divided by 2 (Applicable only for Haribhai batsmen) and then 5 runs will be deducted from the total…Meeraben bowling to Meeraben batsmen normal cricket rules are applicable.',
      text: (
        <>
          In Meeraben over 1 wicket = minus 5 runs for batting side.{' '}
          <span className="font-bold text-slate-900">
            Whatever runs scored by batting side will be divided by 2 (Applicable only for Haribhai batsmen) and then 5 runs will be deducted from the total… Meeraben bowling to Meeraben batsmen normal cricket rules are applicable.
          </span>
        </>
      ),
    },
    {
      id: 10,
      category: 'meeraben',
      categoryLabel: 'Meeraben Scoring',
      plainText:
        'In Meeraben batting 1 touch = 1 run, one running run =2, 4=8, 6=12 (Meeraben getting out while batting in the Meeraben over is not equal to minus 5 run).',
      text: (
        <>
          In Meeraben batting:{' '}
          <span className="font-bold text-slate-900">
            1 touch = 1 run, one running run = 2, 4 = 8, 6 = 12 (Meeraben getting out while batting in the Meeraben over is not equal to minus 5 run).
          </span>
        </>
      ),
    },
    {
      id: 11,
      category: 'meeraben',
      categoryLabel: 'Meeraben Bowling',
      plainText: 'Spin bowling to Meeraben player is allowed.',
      text: (
        <>
          <span className="font-bold text-slate-900">
            Spin bowling to Meeraben player is allowed.
          </span>
        </>
      ),
    },
    {
      id: 12,
      category: 'fielding',
      categoryLabel: 'Field Placements',
      plainText:
        'Max 3 fielders on boundary behind the 3rd last pole including the boundary pole (which is the last pole). Max 5 fielders behind bowler. No restrictions in the number of fielders inside the bowling line.',
      text: (
        <>
          Max 3 fielders on boundary behind the 3rd last pole including the boundary pole (which is the last pole). Max 5 fielders behind bowler. No restrictions in the number of fielders inside the bowling line.
        </>
      ),
    },
    {
      id: 13,
      category: 'fielding',
      categoryLabel: 'Net Taps & Stumping',
      plainText:
        '2 or more taps is dead ball but if ball goes wide then it will be considered wide. Stumping in such wide balls will be considered out.',
      text: (
        <>
          2 or more taps is dead ball but if ball goes wide then it will be considered wide. Stumping in such wide balls will be considered out.
        </>
      ),
    },
    {
      id: 14,
      category: 'fielding',
      categoryLabel: 'Turf Boundaries',
      plainText:
        'If the ball goes outside the playing turf on either side, it is declared as 1 run. Batsmen’s crossing is allowed.',
      text: (
        <>
          If the ball goes outside the playing turf on either side, it is declared as 1 run. Batsmen’s crossing is allowed.
        </>
      ),
    },
    {
      id: 15,
      category: 'timings',
      categoryLabel: 'Match Clock & Penalties',
      plainText:
        'Kindly adhere to the timings since a match has to be completed within 30 minutes. Penalty of 5 runs/over will be levied depending upon the no of over left to be bowled. Each team will have 15 minutes to complete their quota of 6 overs. Even the team bowling 1st will be levied a penalty of 5 runs per over which is bowled after 15 minutes. Time wasting while arguing with the umpire will also be considered in the 15 minutes that each team has to complete the overs. For example – while batting if a team argues and wastes time - that much time will be added to their time while they are bowling.',
      text: (
        <>
          Kindly adhere to the timings since a match has to be completed within <strong>30 minutes</strong>.{' '}
          <span className="text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Penalty of 5 runs/over will be levied depending upon the no of over left to be bowled.
          </span>{' '}
          Each team will have 15 minutes to complete their quota of 6 overs. Even the team bowling 1st will be levied a penalty of 5 runs per over which is bowled after 15 minutes. Time wasting while arguing with the umpire will also be considered in the 15 minutes that each team has to complete the overs. For example – while batting if a team argues and wastes time - that much time will be added to their time while they are bowling.
        </>
      ),
    },
    {
      id: 16,
      category: 'bowling',
      categoryLabel: 'Bowling Action',
      plainText:
        'A bowler cannot run and bowl while bowling. Walking 1-2 steps is allowed but evasive or side arm action is prohibited. Hiding the ball while bowling is not allowed. Evasive Action will be given no ball after two warnings. Evasive action ball will be considered dead ball for first two warnings',
      text: (
        <>
          A bowler cannot run and bowl while bowling. Walking 1-2 steps is allowed but evasive or side arm action is prohibited. Hiding the ball while bowling is not allowed. Evasive Action will be given no ball after two warnings. Evasive action ball will be considered dead ball for first two warnings.
        </>
      ),
    },
    {
      id: 17,
      category: 'bowling',
      categoryLabel: 'Full Toss Height',
      plainText:
        'Above waist height full toss or one tap above waist height is a no ball. Runs scored of this ball will be considered as extra runs.',
      text: (
        <>
          Above waist height full toss or one tap above waist height is a no ball. Runs scored of this ball will be considered as extra runs.
        </>
      ),
    },
    {
      id: 18,
      category: 'fielding',
      categoryLabel: 'Net Touches',
      plainText: 'If the ball touches the nets above and, on the side, it is considered as one tap.',
      text: <>If the ball touches the nets above and, on the side, it is considered as one tap.</>,
    },
    {
      id: 19,
      category: 'bowling',
      categoryLabel: 'Crease & Lines',
      plainText:
        'While bowling, if the front leg is completely outside the front line or side line then it is considered as a no ball by umpire.',
      text: (
        <>
          While bowling, if the front leg is completely outside the front line or side line then it is considered as a no ball by umpire.
        </>
      ),
    },
    {
      id: 20,
      category: 'bowling',
      categoryLabel: 'Side Call',
      plainText:
        'If the bowler doesn’t say SIDE while starting his/her over, then it will be given no ball by umpire. SIDE to be said to the umpire at the start of every over.',
      text: (
        <>
          If the bowler doesn’t say <strong>"SIDE"</strong> while starting his/her over, then it will be given no ball by umpire.{' '}
          <span className="font-bold text-slate-900">
            SIDE to be said to the umpire at the start of every over.
          </span>
        </>
      ),
    },
    {
      id: 21,
      category: 'meeraben',
      categoryLabel: 'Umpire Protocol',
      plainText:
        'Meeraben over to be conveyed to the main umpire and scorer before start of over. Leg umpire will signal so that all are aware including scorer.',
      text: (
        <>
          Meeraben over to be conveyed to the main umpire and scorer before start of over. Leg umpire will signal so that all are aware including scorer.
        </>
      ),
    },
    {
      id: 22,
      category: 'timings',
      categoryLabel: 'Dugout Protocol',
      plainText: 'All batting team players should wait inside the batting dugout.',
      text: <>All batting team players should wait inside the batting dugout.</>,
    },
    {
      id: 23,
      category: 'timings',
      categoryLabel: 'Toss Presence',
      plainText:
        'Every team is requested to present at the toss counter 30 minutes’ prior their actual match schedule. If the team or captain is not present during that time the other team will be given winning points.',
      text: (
        <>
          Every team is requested to present at the toss counter <strong>30 minutes prior</strong> their actual match schedule. If the team or captain is not present during that time the other team will be given winning points.
        </>
      ),
    },
    {
      id: 24,
      category: 'fielding',
      categoryLabel: 'Wicketkeeper Swap',
      plainText: 'Change of wicketkeeper should be conveyed to leg umpire or else leg umpire will call it a No Ball.',
      text: (
        <>
          Change of wicketkeeper should be conveyed to leg umpire or else leg umpire will call it a No Ball.
        </>
      ),
    },
    {
      id: 25,
      category: 'format',
      categoryLabel: 'Tie-Breaker & NRR',
      plainText:
        'In case of teams tied on points after the league stage, NRR formula will be used to decide which team goes ahead. The calculation of NRR will be as per Cric-heroes.',
      text: (
        <>
          In case of teams tied on points after the league stage, NRR formula will be used to decide which team goes ahead. The calculation of NRR will be as per <strong>Cric-heroes</strong>.
        </>
      ),
    },
    {
      id: 26,
      category: 'bowling',
      categoryLabel: 'Free Hit Penalty',
      plainText: 'In case of NO BALL, 1 run will be given to the opponent team (free hit as per cricket rules)',
      text: (
        <>
          In case of NO BALL, 1 run will be given to the opponent team (free hit as per cricket rules).
        </>
      ),
    },
    {
      id: 27,
      category: 'batting',
      categoryLabel: 'Extras & Overthrows',
      plainText:
        'Over throws, Byes and Leg Byes are allowed (running between the wickets is required to score extra runs)',
      text: (
        <>
          Over throws, Byes and Leg Byes are allowed (running between the wickets is required to score extra runs).
        </>
      ),
    },
    {
      id: 28,
      category: 'batting',
      categoryLabel: 'Running Runs',
      plainText: 'Players can score runs by running while the ball is in the ground.',
      text: <>Players can score runs by running while the ball is in the ground.</>,
    },
    {
      id: 29,
      category: 'meeraben',
      categoryLabel: 'Opening Pairing',
      plainText:
        'This Year Both Meeraben will Open the Batting and also 1st Over to be bowled by Meeraben – Meeraben to Meeraben rules Apply & Meeraben to Haribhai Rules Apply.',
      text: (
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            This Year Both Meeraben will Open the Batting and also 1st Over to be bowled by Meeraben –
          </p>
          <p className="text-slate-700 font-medium">
            Meeraben to Meeraben rules Apply &amp; Meeraben to Haribhai Rules Apply.
          </p>
        </div>
      ),
    },
    {
      id: 30,
      category: 'batting',
      categoryLabel: 'Retired Out',
      plainText:
        'Batsmen / Batswomen can be Retired Out during the match. (Meeraben cannot be retired during the First Over)',
      text: (
        <>
          <span className="font-bold text-slate-900">
            Batsmen / Batswomen can be Retired Out during the match. (Meeraben cannot be retired during the First Over)
          </span>
        </>
      ),
    },
  ];

  const powerballRules = [
    {
      id: 'pb-1',
      title: '3rd Ball Powerball',
      text: 'Every 3rd ball of the over will be a Powerball.',
    },
    {
      id: 'pb-2',
      title: '2X Runs Multiplier',
      text: 'In batting Powerball, the runs scored off the Powerball will be doubled for the batting team. This means if the batting team scores 2 runs then it will be considered as 4 runs.',
    },
    {
      id: 'pb-3',
      title: '-5 Runs Wicket Penalty',
      text: 'If the batting team loses a wicket in the Powerball 5 runs per wicket will be deducted.',
    },
    {
      id: 'pb-4',
      title: 'Wide & No-Ball Extension',
      text: 'If a no ball or wide ball is bowled the power ball will continue. The runs scored in that no ball and also in the subsequent proper powerball will be doubled. For the wide ball 2 runs will be accorded.',
    },
    {
      id: 'pb-5',
      title: 'Team Responsibility',
      text: "It is the responsibility of both sides to keep a tab on the Powerball. Umpire's signal is not mandatory for Powerball to be considered.",
    },
  ];

  const categories: { id: RuleCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Rules (30)', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'powerball', label: '⚡ Powerball', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'meeraben', label: '🌸 Meeraben Rules', icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'format', label: 'Match Format', icon: <Trophy className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'batting', label: 'Batting & Runs', icon: <Award className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'bowling', label: 'Bowling & Actions', icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'fielding', label: 'Fielding & Turf', icon: <Scale className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'timings', label: 'Timings & Dugout', icon: <Clock className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Category filter
      if (selectedCategory !== 'all' && selectedCategory !== 'powerball') {
        if (rule.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rule.plainText.toLowerCase().includes(q) ||
          rule.categoryLabel.toLowerCase().includes(q) ||
          String(rule.id).includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyRule = (rule: RuleItem) => {
    navigator.clipboard.writeText(`RPL Season 8 Rule #${rule.id}: ${rule.plainText}`);
    setCopiedRuleId(rule.id);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  const handleShareRules = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RAJ PREMIER LEAGUE (SEASON 8) - Turf Cricket Rules 2026',
        text: 'Official Turf Cricket 2026 Final Rules & Regulations for RPL Season 8.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* ── 1. Sticky Navigation Header (Light Theme) ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-shadow duration-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          {/* Left: Back button & brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <img
                src="/rpl-logo.png"
                alt="RPL Logo"
                className="h-6 w-auto object-contain drop-shadow-2xs"
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
                Turf Cricket Rules
              </span>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareRules}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
              title="Share Rules URL"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="py-1.5 px-3.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Player Registration</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Light Theme Hero Section (Clean Light Canvas) ── */}
      <section className="relative bg-white border-b border-slate-200 py-10 sm:py-14 px-4 overflow-hidden">
        {/* Subtle ambient radiant lighting matching main page */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* RPL Season Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-widest mb-3 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>RAJ PREMIER LEAGUE (SEASON 8)</span>
          </div>

          {/* Main Tournament Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 tracking-tight font-display text-slate-900">
            TURF CRICKET – <span className="text-amber-600">2026</span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-slate-700 mb-4 font-display tracking-wide">
            Final Rules &amp; Regulations
          </p>

          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
            Official rulebook for team captains, players, and umpires. Familiarize yourself with the 6-over format, MeeraBen dynamics, and the Powerball 2x scoring multiplier.
          </p>

          {/* Search Box in Light Theme */}
          <div className="mt-7 max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules (e.g. powerball, meeraben, 36 runs, side, fine)..."
                className="w-full pl-12 pr-16 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs outline-none transition-all text-xs sm:text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Quick Overview Grid ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: 6 / 8 Overs Format */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5 hover:border-amber-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Format</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block font-display">
                6 Overs Quota
              </span>
              <span className="text-[11px] text-amber-800 font-semibold block">1st Meeraben Over Compulsory</span>
            </div>
          </div>

          {/* Card 2: Powerball Feature */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5 hover:border-amber-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Powerball Mechanic</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block font-display">
                Every 3rd Ball = 2x
              </span>
              <span className="text-[11px] text-amber-800 font-semibold block">-5 Runs on Wicket Lost</span>
            </div>
          </div>

          {/* Card 3: Match Timing */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5 hover:border-amber-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Clock</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block font-display">
                30 Mins Total
              </span>
              <span className="text-[11px] text-purple-700 font-semibold block">15 min/side (5-run fine/over)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Main Body: Category Filters & Rule Cards ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-amber-300 shadow-sm border border-slate-900'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter if searching */}
        {searchQuery && (
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing {filteredRules.length} matching rule{filteredRules.length === 1 ? '' : 's'} for &ldquo;
              <strong className="text-slate-800">{searchQuery}</strong>&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* ── Powerball Spotlight Banner (Light Theme) ── */}
        {(selectedCategory === 'all' || selectedCategory === 'powerball') && !searchQuery && (
          <div className="rounded-3xl bg-amber-50/60 border border-amber-200 p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950 font-display">
                    POWERBALL RULES
                  </h3>
                  <span className="text-[11px] text-slate-600 font-medium">Critical Match Multiplier Guidelines</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-widest shadow-2xs">
                Active Every Over
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {powerballRules.map((pb, idx) => (
                <div
                  key={pb.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm leading-relaxed shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs mb-0.5">{pb.title}</div>
                      <div className="text-slate-700 font-medium leading-relaxed">
                        {pb.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Meeraben Special Scoring Matrix (Light Theme) ── */}
        {(selectedCategory === 'all' || selectedCategory === 'meeraben') && !searchQuery && (
          <div className="rounded-3xl bg-rose-50/50 border border-rose-200 p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-rose-950 font-display">
                    Meeraben Scoring &amp; Over Rules
                  </h3>
                  <span className="text-[11px] text-slate-600 font-medium">Special scoring multipliers &amp; Wicket deductions</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase tracking-widest">
                Special Guidelines
              </span>
            </div>

            {/* Quick Multiplier Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1 Touch</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-600 font-display">= 1 Run</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1 Running</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-600 font-display">= 2 Runs</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Boundary (4)</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-600 font-display">= 8 Runs</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maximum (6)</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-600 font-display">= 12 Runs</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-rose-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              <strong className="text-slate-900">Wicket in Meeraben Over:</strong> 1 wicket = <strong>minus 5 runs</strong> for the batting side. Whatever runs scored by the batting side will be <strong>divided by 2</strong> (applicable only for Haribhai batsmen) and then 5 runs will be deducted from the total. <em>(Note: Meeraben getting out while batting in the Meeraben over does NOT subtract 5 runs).</em>
            </div>
          </div>
        )}

        {/* ── Rules List (Consistent Light Theme) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Showing {filteredRules.length} {filteredRules.length === 1 ? 'Rule' : 'Rules'}
            </span>
          </div>

          {filteredRules.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1 font-display">No matching rules found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                We couldn&apos;t find a rule matching &ldquo;{searchQuery}&rdquo;. Try another search term or reset filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                View All Rules
              </button>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const isCopied = copiedRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  id={`rule-${rule.id}`}
                  className="rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header Row: ID, Badges, Copy */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs shrink-0 bg-slate-900 text-white">
                          #{rule.id}
                        </span>

                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                          {rule.categoryLabel}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyRule(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 shrink-0"
                        title="Copy Rule Text"
                        aria-label={`Copy Rule #${rule.id}`}
                      >
                        {isCopied ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </span>
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Rule Text */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {rule.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── 5. Tournament Governance & Authority Card (Light Card Theme) ── */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 font-display">
                Tournament Governance &amp; Umpire Authority
              </h4>
              <span className="text-xs text-slate-500 font-medium">Strictly enforced across all tournament matches</span>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm leading-relaxed pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
              <strong className="text-slate-900">RPL Committee Rights:</strong> The RPL TEAM reserves all rights to change, alter and modify any decision with regards to the RAJ PREMIER LEAGUE - Turf Cricket Tournament, at any point before and during the tournament without any prior notifications.
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800">
              <strong className="text-amber-900">Note — Umpire's Decision is Final:</strong> Any argument with the umpire will lead to deduction of runs or in worst case disqualification of the player/team. In case of any query only the captain can consult the umpire but arguing will lead to penalty of runs or disqualification.
            </div>
          </div>
        </div>

        {/* ── 6. Coordinator & Helpline Callout ── */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
              Have a Query Regarding Rules or Roster?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Connect with our tournament coordinators for captain meetings, draft clarifications, or umpire inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href="tel:+919321001499"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold tracking-wide shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Call Helpline</span>
            </a>

            <a
              href="https://wa.me/919321001499"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
            </a>

            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Site</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── 7. Global Official Footer ── */}
      <Footer onRegisterClick={onRegisterClick} onCheckPassClick={onCheckPassClick} />
    </div>
  );
};

export default RulesPage;
