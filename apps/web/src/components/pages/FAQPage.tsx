import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ArrowLeft,
  Search,
  ChevronDown,
  Users,
  Trophy,
  Calendar,
  Ticket,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';

interface FAQPageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
}

interface FAQItem {
  id: string;
  category: 'registration' | 'leagues' | 'football' | 'schedule' | 'spectator' | 'rules' | 'contact';
  question: string;
  answer: string | React.ReactNode;
  tags?: string[];
  important?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'registration', label: 'Registration & Fees', icon: <Users className="w-4 h-4" /> },
  { id: 'leagues', label: 'Leagues & Eligibility', icon: <Trophy className="w-4 h-4" /> },
  { id: 'football', label: 'Football & Single-Sport', icon: <Calendar className="w-4 h-4" /> },
  { id: 'schedule', label: 'Schedule & Stay', icon: <Clock className="w-4 h-4" /> },
  { id: 'spectator', label: 'Spectator Passes', icon: <Ticket className="w-4 h-4" /> },
  { id: 'rules', label: 'Rules & Rosters', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'contact', label: 'Official Coordinators', icon: <Phone className="w-4 h-4" /> },
] as const;

const FAQ_DATA: FAQItem[] = [
  // 1. Registration Confirmation & Fees
  {
    id: 'reg-confirmation',
    category: 'registration',
    question: 'Does registering in a league guarantee my participation?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>No, registration does not automatically guarantee final entry.</strong> All applications are reviewed by the RPL Organizing Committee to balance team compositions, scheduling windows, and arena capacities.
        </p>
        <p>
          Once draft selections and team rosters are officially structured, you will receive an official confirmation via WhatsApp and SMS with your team assignment and jersey allocation.
        </p>
      </div>
    ),
    tags: ['Confirmation', 'Roster', 'Approval'],
    important: true,
  },
  {
    id: 'player-fees',
    category: 'registration',
    question: 'What is the registration fee for players, and what does it include?',
    answer: (
      <div className="space-y-3">
        <p>The standard player registration is an all-inclusive 3-day sports &amp; stay package:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
              Returning RPL Family
            </span>
            <span className="text-2xl font-black text-slate-900">₹2,700</span>
            <span className="text-xs text-slate-600 block mt-1">For members who participated in prior RPL seasons</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block mb-1">
              New Participants
            </span>
            <span className="text-2xl font-black text-slate-900">₹3,000</span>
            <span className="text-xs text-slate-600 block mt-1">First-time athletes joining the RPL family</span>
          </div>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
          <li><strong>Stay:</strong> 2-night stay (25 Dec check-in to 27 Dec check-out) at Shrimad Rajchandra Ashram.</li>
          <li><strong>Meals:</strong> All daily sattvic vegetarian meals and late-night tournament snacks.</li>
          <li><strong>Sports:</strong> Unlimited entry across all selected eligible leagues and 90s Nostalgia Games.</li>
          <li><strong>Kit:</strong> One official RPL Season 9 tournament jersey included free! <em>(Extra t-shirts can be purchased for ₹500).</em></li>
        </ul>
      </div>
    ),
    tags: ['Pricing', 'Package', 'Player Fee'],
  },

  // 2. Leagues & Eligibility
  {
    id: 'female-main-league',
    category: 'leagues',
    question: 'Can female players participate in both the Female League and the RPL Main Cricket League?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>Yes!</strong> All registered female players can participate in the <strong>Women’s Cricket League</strong>.
        </p>
        <p>
          Additionally, based on performance trials and registration records, the RPL Organizing Committee will select <strong>18 outstanding female athletes</strong> who will earn a prestigious spot to draft and compete directly in the <strong>RPL Main Cricket League</strong> alongside male players.
        </p>
      </div>
    ),
    tags: ['Women’s League', 'Main League', 'Selection'],
  },
  {
    id: 'female-multiple-leagues',
    category: 'leagues',
    question: 'I am a female player. Can I register for multiple leagues?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>Yes, absolutely.</strong> Female athletes are welcome to register across the Women’s Cricket League, Table Tennis, Carrom, and the 90s Nostalgia Games.
        </p>
        <p>
          Entry to the RPL Main Cricket League is reserved for the 18 selected female players chosen by the committee.
        </p>
        <div className="p-3 rounded-lg bg-slate-100 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <em>Note on scheduling:</em> The organizing committee will make every effort to accommodate multi-sport registrations; however, if two matches overlap on court, players may be prioritized for specific games.
          </span>
        </div>
      </div>
    ),
    tags: ['Multi-Sport', 'Female Athletes'],
  },
  {
    id: 'male-multiple-leagues',
    category: 'leagues',
    question: 'I am a male player. Can I register for multiple leagues?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>Yes, you are encouraged to register for multiple sports!</strong> Male players can participate in:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
          <li>RPL Main Cricket League</li>
          <li>Football Championship League (Matches held entirely on 27 Dec)</li>
          <li>Table Tennis Championship (Free add-on)</li>
          <li>Carrom League (Free add-on)</li>
          <li>90s Nostalgia Games (Dec 25–26, finals Dec 27)</li>
        </ul>
        <p className="text-xs text-slate-600">
          <em>Age Note:</em> To play in the <strong>Kachha Pakka League</strong>, participants must meet the age eligibility requirement (aged 16 &amp; below OR 56 &amp; above).
        </p>
      </div>
    ),
    tags: ['Multi-Sport', 'Male Athletes'],
  },
  {
    id: 'kaccha-pakka-age',
    category: 'leagues',
    question: 'Who is eligible to participate in the Kachha Pakka League?',
    answer: (
      <div className="space-y-2">
        <p>
          The Kachha Pakka League is a beloved tournament tradition that unites the raw enthusiasm of our youngest stars with the wisdom and sportsmanship of our elders.
        </p>
        <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 font-medium text-xs">
          <strong>Official Age Criteria:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li><strong>Junior Division:</strong> Age 16 and below (&le; 16 years)</li>
            <li><strong>Veteran Division:</strong> Age 56 and above (&ge; 56 years)</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          The registration portal automatically checks Date of Birth to enable Kachha Pakka selection for eligible age groups.
        </p>
      </div>
    ),
    tags: ['Kachha Pakka', 'Age Limit', 'Juniors & Veterans'],
  },
  {
    id: 'table-tennis-carrom-addon',
    category: 'leagues',
    question: 'Are Table Tennis and Carrom separate leagues or add-on tournaments?',
    answer: (
      <div className="space-y-2">
        <p>
          Table Tennis and Carrom are <strong>free, complimentary add-on tournaments</strong> open to all participants (male, female, juniors, and veterans).
        </p>
        <p className="text-xs text-slate-600">
          To enter Table Tennis or Carrom, simply select them as add-on sports alongside any primary league (Main Cricket, Women’s Cricket, Kachha Pakka, or Football). There is <strong>no extra registration fee</strong> for these championships.
        </p>
      </div>
    ),
    tags: ['Table Tennis', 'Carrom', 'Add-on Sports'],
  },

  // 3. Single-Sport & Football Participation
  {
    id: 'football-schedule-fee',
    category: 'football',
    question: 'If I only want to play in the Football League, do I need to attend all three days?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>No, full 3-day attendance is not mandatory for Football.</strong> The entire RPL Football Championship takes place on the final day, <strong>Sunday, 27 December 2026</strong>.
        </p>
        <p>
          If your schedule is constrained, you can arrive on Sunday morning specifically for football. The tournament registration fee is <strong>₹2,700 for returning RPL Family</strong> (or <strong>₹3,000 for new players</strong>), which covers your tournament entry, team jersey, meals, and facility amenities.
        </p>
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
          💡 <strong>Tip:</strong> We highly recommend attending all three days (25–27 Dec) so you don't miss out on the Grand Opening Ceremony, team practice matches, and the fun-filled 90s Nostalgia Games on 25–26 December!
        </div>
      </div>
    ),
    tags: ['Football', 'Single-Day', '27 December'],
    important: true,
  },

  // 4. Tournament Schedule & Stay Extensions
  {
    id: 'tournament-timings',
    category: 'schedule',
    question: 'What are the exact tournament dates, timings, and standard stay inclusions?',
    answer: (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="font-bold text-slate-900 block">Tournament Starts</span>
            <span className="text-amber-700 font-semibold">Friday, 25 Dec 2026 at 8:00 AM</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="font-bold text-slate-900 block">Tournament Concludes</span>
            <span className="text-amber-700 font-semibold">Sunday, 27 Dec 2026 at 10:00 PM</span>
          </div>
        </div>
        <p>
          The standard registration includes a <strong>2-night stay (Check-in: 25 Dec, Check-out: 27 Dec)</strong> at the Shrimad Rajchandra Aatma Tatva Research Centre, Parli, all sattvic vegetarian meals, late-night snacks, and unlimited access to all matches and ceremonies.
        </p>
      </div>
    ),
    tags: ['Timings', 'Dates', 'Ashram Stay'],
  },
  {
    id: 'early-arrival-extension',
    category: 'schedule',
    question: 'What if I need to arrive early (e.g., 24 Dec) or extend my stay past 27 Dec?',
    answer: (
      <div className="space-y-2">
        <p>
          You can easily arrange an early arrival or extended stay directly through the registration form:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700">
          <li>In the <strong>Accommodation</strong> section of the registration form, select your custom dates in the <strong>Check-In Date</strong> and <strong>Check-Out Date</strong> calendar pickers.</li>
          <li>Mention your arrival schedule or special requests in the <strong>Comments &amp; Special Requests</strong> text box.</li>
          <li>The RPL Hospitality and Aashray Desk team will pre-coordinate your extended room booking.</li>
        </ol>
        <p className="text-xs text-slate-500 italic">
          *Note: Standard Research Centre charges for extra nights and meals outside the tournament dates will apply directly at the Ashram desk.
        </p>
      </div>
    ),
    tags: ['Early Arrival', 'Extended Stay', 'Hospitality'],
  },

  // 5. Spectator Packages & 90s Nostalgia Games
  {
    id: 'spectator-packages',
    category: 'spectator',
    question: 'What spectator pass options are available, and what are the charges?',
    answer: (
      <div className="space-y-3">
        <p>We offer two spectator tiers designed for family members, devotees, and cheerleaders:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Single-Day Day Pass (Without Stay)
            </span>
            <span className="text-xl font-black text-slate-900">₹630 <span className="text-xs font-normal text-slate-500">/ day</span></span>
            <p className="text-xs text-slate-600 mt-1">
              Pick 1, 2, or all 3 days. Includes arena entry, match viewing, cheering zones, and late-night snacks.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 block mb-1">
              3-Day Experience (With Stay)
            </span>
            <span className="text-xl font-black text-slate-900">₹2,700 <span className="text-xs font-normal text-slate-500">total</span></span>
            <p className="text-xs text-slate-600 mt-1">
              Includes full 2-night stay, all daily meals, late-night snacks, match access, and full entry to 90s Nostalgia Games!
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          <em>T-shirt Add-on:</em> Spectators can optionally add an official RPL Season 9 commemorative t-shirt for +₹500.
        </p>
      </div>
    ),
    tags: ['Spectator Pass', 'Day Pass', 'Visitor'],
  },
  {
    id: 'spectator-single-day-overnight',
    category: 'spectator',
    question: 'Can I get a 1-day spectator pass that includes an overnight stay and full meals?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>No, that is not possible.</strong> Due to room allocation policies and dining management at the Research Centre, overnight accommodation and full meal packages cannot be booked on a single-day basis.
        </p>
        <p className="text-xs text-slate-700">
          If you require overnight stay and regular ashram dining, you must select the <strong>Full 3-Day Spectator Package with Accommodation (₹2,700)</strong>.
        </p>
      </div>
    ),
    tags: ['Stay Policy', 'Overnight Stay'],
  },
  {
    id: 'spectator-nostalgia-games',
    category: 'spectator',
    question: 'Can I participate in the 90s Nostalgia Games if I register as a spectator?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong>Yes!</strong> Registered spectators are warmly invited to compete in the <strong>90s Nostalgia Games</strong> (Lemon &amp; Spoon Race, Duckwalk Race, Skipping, Ring Race, and Relay Race).
        </p>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
          ⚠️ <strong>Attendance Requirement:</strong> The 90s Nostalgia Games is an official tournament culminating in grand finals on Sunday, 27 December 2026. To preserve competition fairness, spectator participants must opt for the <strong>3-Day Experience</strong> (either with stay or all 3 days without stay). Single-day or 2-day day-pass holders cannot participate in Nostalgia tournaments.
        </div>
      </div>
    ),
    tags: ['90s Nostalgia', 'Spectator Entry', 'Finals'],
  },

  // 6. Rules, Regulations & Match Lineups
  {
    id: 'rules-regulations',
    category: 'rules',
    question: 'Where can I find the official tournament rules, pitch guidelines, and team lineups?',
    answer: (
      <div className="space-y-2">
        <p>
          Comprehensive rulebooks, turf pitch rules (e.g., spin bowling only for bowlers), team rosters, and group-stage schedules will be officially published after registration closes and team auctions/drafts conclude.
        </p>
        <p className="text-xs text-slate-700">
          All finalized schedules and live scores will be accessible on this portal and announced via the official RPL WhatsApp community.
        </p>
      </div>
    ),
    tags: ['Rulebook', 'Turf Rules', 'Team Lineups'],
  },

  // 7. Official Coordinators & Contact
  {
    id: 'coordinators-contact',
    category: 'contact',
    question: 'Whom should I contact if I have specific questions about a sport or my registration?',
    answer: (
      <div className="space-y-3">
        <p>You can reach out directly to the respective RPL coordinators for your domain:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-sm">Registration &amp; Accommodation</span>
            <span className="text-slate-600 block">• Mr. Vinitbhai Hariya</span>
            <span className="text-slate-600 block">• Miss Jesal Shah</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-sm">Cricket, Kachha Pakka &amp; Women’s League</span>
            <span className="text-slate-600 block">• Mr. Hiren bhai Sanghvi</span>
            <span className="text-slate-600 block">• Mr. Prashant bhai Vora</span>
            <span className="text-slate-600 block">• Mrs. Shraddha Maniar</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-sm">90s Nostalgia Games</span>
            <span className="text-slate-600 block">• Mr. Tejas bhai Sanghvi</span>
            <span className="text-slate-600 block">• Mr. Vinitbhai Hariya</span>
            <span className="text-slate-600 block">• Mrs. Shraddha Maniar</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-sm">Football &amp; Table Tennis League</span>
            <span className="text-slate-600 block">• Mr. Nijesh bhai Shah</span>
            <span className="text-slate-600 block">• Mr. Paras bhai Doshi</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <span className="font-bold text-slate-900 block text-sm">Carrom Championship League</span>
            <span className="text-slate-600 block">• Mr. Prashant bhai Vora &amp; Mr. Jaisal Shah</span>
          </div>
        </div>
      </div>
    ),
    tags: ['Coordinators', 'Support', 'Committee'],
    important: true,
  },
];

export const FAQPage: React.FC<FAQPageProps> = ({ onBackToHome, onRegisterClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'reg-confirmation': true,
    'player-fees': true,
    'football-schedule-fee': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.question.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Sticky Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Tournament</span>
          </button>

          <div className="flex items-center gap-3">
            {onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-20 px-4 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>RPL Season 9 Helpdesk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight font-display text-white">
            Frequently Asked <span className="text-amber-400">Questions</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
            Everything you need to know about participant eligibility, championship leagues, tournament stay packages, spectator passes, and coordinator contacts.
          </p>

          {/* Search Input Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. fees, football, kachha pakka, spectator, meals)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 border border-white/20 focus:border-amber-500 shadow-lg backdrop-blur-md outline-none transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
          <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredFAQs.length} matching question{filteredFAQs.length === 1 ? '' : 's'} for &ldquo;
              <strong className="text-slate-800">{searchQuery}</strong>&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-600 hover:underline font-semibold"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Accordion List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((item) => {
              const isOpen = Boolean(openItems[item.id]);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-amber-300 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {item.important && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            Key Info
                          </span>
                        )}
                        {item.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-amber-100 text-amber-700 rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              We couldn&apos;t find an answer matching &ldquo;{searchQuery}&rdquo;. Try another term or contact our organizing committee directly.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              View All Questions
            </button>
          </div>
        )}

        {/* Committee & Helpline Banner */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white p-8 sm:p-10 border border-amber-500/20 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Need Direct Assistance?</span>
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight font-display">
              Have a Specific Question?
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
              Our tournament coordinators and hospitality desk are here to assist with player entries, room arrangements, and group queries.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://chat.whatsapp.com/BsJ9WZGzpyaKYEphAOwtPq?s=sw&p=a&mlu=4&ilr=4&iam=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-md transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Official WhatsApp Community</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href="https://mail.google.com/mail/?view=cm&to=info.rplevents@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wide border border-white/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Email Organizers</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
