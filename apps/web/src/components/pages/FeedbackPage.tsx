import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Share2,
  Send,
  Trophy,
  Heart,
  Shirt,
  Utensils,
  Music,
  MessageSquareHeart,
  AlertCircle,
  RotateCcw,
  Phone,
  Loader2,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { lookupPlayer, submitFeedback } from '@/lib/api';

interface FeedbackPageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

type StarValue = 1 | 2 | 3 | 4 | 5 | null;
type ScaleValue = 1 | 2 | 3 | 4 | 5 | null;

interface MatrixRowConfig {
  id: string;
  label: string;
  sportKey?: string;
}

const ALL_TOURNAMENT_ROWS: MatrixRowConfig[] = [
  { id: 'rpl_cricket', label: 'RPL Cricket League Experience', sportKey: 'cricket' },
  { id: 'womens_cricket', label: "Women's Cricket League Experience", sportKey: 'womens-sports' },
  { id: 'kaccha_pakka', label: 'Kaccha Pakka Cricket League Experience', sportKey: 'kaccha-pakka' },
  { id: 'football', label: 'Football League Experience', sportKey: 'football' },
  { id: 'table_tennis', label: 'Table Tennis League Experience', sportKey: 'table-tennis' },
  { id: 'carrom', label: 'Carrom League Experience', sportKey: 'carrom' },
  { id: 'officiating', label: 'Match Officiating / Umpiring & Referees' },
  { id: 'ground_conditions', label: 'Ground & Arena Conditions' },
  { id: 'schedule_management', label: 'Schedule Management' },
];

// Helper to normalize and map database sport keys to row IDs
const SPORT_ALIAS_MAP: Record<string, string> = {
  cricket: 'rpl_cricket',
  rpl_cricket: 'rpl_cricket',
  'womens-sports': 'womens_cricket',
  'womens_sports': 'womens_cricket',
  'womens-cricket': 'womens_cricket',
  womens_cricket: 'womens_cricket',
  'kaccha-pakka': 'kaccha_pakka',
  kaccha_pakka: 'kaccha_pakka',
  kacchapakka: 'kaccha_pakka',
  football: 'football',
  'table-tennis': 'table_tennis',
  'table_tennis': 'table_tennis',
  tt: 'table_tennis',
  carrom: 'carrom',
};

const OPENING_CEREMONY_ROWS: MatrixRowConfig[] = [
  { id: 'hosting', label: 'Hosting' },
  { id: 'sound', label: 'Sound' },
  { id: 'av', label: 'AV & Visuals' },
  { id: 'program', label: 'Program' },
  { id: 'costumes', label: 'Costumes & Theme' },
];

const HOSPITALITY_ROWS: MatrixRowConfig[] = [
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'food_catering', label: 'Food & Catering (Quality of Main Meals)' },
  { id: 'late_night_snacks', label: 'Late Night Snacks' },
  { id: 'transport', label: 'Transport & Check-in Logistics' },
];

const JERSEY_CAPS_ROWS: MatrixRowConfig[] = [
  { id: 'jersey_quality', label: 'Jersey Quality and Fabric' },
  { id: 'jersey_fit', label: 'Jersey Fit and Comfort' },
  { id: 'jersey_design', label: 'Jersey Design' },
  { id: 'cap_durability', label: 'Cap Fit & Durability' },
];

const STAR_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Outstanding',
};

interface StarMatrixCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentBg: string;
  rows: MatrixRowConfig[];
  values: Record<string, StarValue>;
  onChange: (rowId: string, val: StarValue) => void;
  hasError?: boolean;
}

const StarMatrixCard: React.FC<StarMatrixCardProps> = ({
  id,
  title,
  subtitle,
  icon,
  accentBg,
  rows,
  values,
  onChange,
  hasError,
}) => {
  const [hovered, setHovered] = useState<{ rowId: string; star: number } | null>(null);

  return (
    <div
      id={id}
      className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-colors ${
        hasError ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
      }`}
    >
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${accentBg}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
              {title} <span className="text-rose-500">*</span>
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {hasError && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Required</span>
          </span>
        )}
      </div>

      {/* Desktop column legend */}
      <div className="hidden sm:grid sm:grid-cols-12 px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <div className="col-span-6">Category</div>
        <div className="col-span-6 text-right pr-2">Rating (1 = Poor, 5 = Best)</div>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((row) => {
          const val = values[row.id];
          const numericVal = typeof val === 'number' ? val : 0;
          const activeHover = hovered?.rowId === row.id ? hovered.star : 0;
          const displayStars = activeHover || numericVal;

          return (
            <div
              key={row.id}
              className="px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 hover:bg-amber-50/25 transition-colors"
            >
              <div className="sm:col-span-6 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {row.label}
                </span>
                {val === null && hasError && (
                  <span className="text-[10px] font-bold text-rose-600 sm:hidden">
                    Select rating
                  </span>
                )}
              </div>

              <div className="sm:col-span-6 flex items-center sm:justify-end gap-2 flex-wrap">
                <div
                  className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80"
                  onMouseLeave={() => setHovered(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= displayStars;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onChange(row.id, star as 1 | 2 | 3 | 4 | 5)}
                        onMouseEnter={() => setHovered({ rowId: row.id, star })}
                        aria-label={`Rate ${row.label} ${star} out of 5`}
                        className="p-0.5 sm:p-1 rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer touch-manipulation"
                      >
                        <Star
                          className={`w-5 h-5 sm:w-5 sm:h-5 transition-colors ${
                            filled
                              ? 'fill-amber-400 text-amber-500 drop-shadow-2xs'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] font-semibold text-slate-500 min-w-[92px] text-right hidden md:inline-block">
                  {numericVal > 0 ? STAR_LABELS[numericVal] : 'Not rated'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface LinearScaleCardProps {
  id: string;
  question: string;
  lowLabel: string;
  highLabel: string;
  value: ScaleValue;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
  hasError?: boolean;
}

const LinearScaleCard: React.FC<LinearScaleCardProps> = ({
  id,
  question,
  lowLabel,
  highLabel,
  value,
  onChange,
  hasError,
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${
        hasError ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
          {question} <span className="text-rose-500">*</span>
        </h3>
        {hasError && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Required</span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-xl">
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{lowLabel}</span>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1">
          {([1, 2, 3, 4, 5] as const).map((num) => {
            const active = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={`h-12 rounded-2xl font-display font-extrabold text-base border transition-all cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-50 hover:bg-amber-50/70 text-slate-700 border-slate-200 hover:border-amber-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{highLabel}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-2 sm:hidden">
        <span>1 = {lowLabel}</span>
        <span>5 = {highLabel}</span>
      </div>
    </div>
  );
};

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  onBackToHome,
  onRegisterClick,
  onCheckPassClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Player Verification states
  const [mobile, setMobile] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [userSports, setUserSports] = useState<string[]>([]);
  const [userSportsLabels, setUserSportsLabels] = useState<string[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [tournamentExp, setTournamentExp] = useState<Record<string, StarValue>>({});
  const [openingCeremony, setOpeningCeremony] = useState<Record<string, StarValue>>({});
  const [hospitality, setHospitality] = useState<Record<string, StarValue>>({});
  const [leagueFeedback, setLeagueFeedback] = useState('');
  const [jerseyCaps, setJerseyCaps] = useState<Record<string, StarValue>>({});
  const [closingCeremony, setClosingCeremony] = useState<ScaleValue>(null);
  const [overallExp, setOverallExp] = useState<ScaleValue>(null);
  const [teamFeedback, setTeamFeedback] = useState('');
  const [wowMoment, setWowMoment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle typing mobile number: purely digits, 10-digit limit
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(rawDigits);
    setLookupError(null);

    if (rawDigits.length < 10) {
      setIsVerified(false);
      setName('');
      setUserSports([]);
      setUserSportsLabels([]);
    }
  };

  // Dynamic automatic check as soon as 10 digits are entered
  useEffect(() => {
    if (mobile.length !== 10) return;

    let isCancelled = false;
    setIsLookingUp(true);
    setLookupError(null);

    lookupPlayer(mobile)
      .then((res) => {
        if (isCancelled) return;
        setIsLookingUp(false);

        if (res && res.found && res.registration) {
          const reg = res.registration;
          const participantName = reg.fullName || res.data?.fullName || '';
          setName(participantName);
          setIsVerified(true);

          // Extract participated sports from registration
          const genSports = Array.isArray(reg.generalDetails?.selectedSports)
            ? reg.generalDetails.selectedSports
            : [];
          const rawSports: string[] = Array.isArray(reg.selectedSports) && reg.selectedSports.length > 0
            ? reg.selectedSports
            : genSports.length > 0
            ? genSports
            : Object.keys(reg.sportAnswers || {});

          const sportsSet = new Set<string>();
          const labelsList: string[] = [];

          rawSports.forEach((sportKey) => {
            const normalized = String(sportKey).toLowerCase().trim();
            const rowId = SPORT_ALIAS_MAP[normalized];
            if (rowId) {
              sportsSet.add(rowId);
              const matchedRow = ALL_TOURNAMENT_ROWS.find((r) => r.id === rowId);
              if (matchedRow && !labelsList.includes(matchedRow.label)) {
                labelsList.push(matchedRow.label.replace(' Experience', ''));
              }
            }
          });

          // Fallback if no specific sport key matched: show all tournament leagues so participant is not locked out
          if (sportsSet.size === 0) {
            ALL_TOURNAMENT_ROWS.forEach((r) => {
              if (r.sportKey) sportsSet.add(r.id);
            });
            labelsList.push('Tournament Participant');
          }

          setUserSports(Array.from(sportsSet));
          setUserSportsLabels(labelsList);
        } else if (res && res.found && res.data) {
          setIsVerified(false);
          setName('');
          setUserSports([]);
          setUserSportsLabels([]);
          setLookupError(
            `Found member record for ${res.data.fullName}, but no Season 9 registration was found for this mobile number.`
          );
        } else {
          setIsVerified(false);
          setName('');
          setUserSports([]);
          setUserSportsLabels([]);
          setLookupError(
            'Mobile number not found in Season 9 registrations. Please verify your 10-digit registered number.'
          );
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setIsLookingUp(false);
        setLookupError('Could not verify mobile number right now. Please check your connection.');
      });

    return () => {
      isCancelled = true;
    };
  }, [mobile]);

  // Filter tournament rows: ONLY participated sports + general operations
  const activeTournamentRows = React.useMemo(() => {
    if (!isVerified) return [];
    return ALL_TOURNAMENT_ROWS.filter((row) => {
      if (!row.sportKey) return true; // Operations rows (Officiating, Ground, Schedule)
      return userSports.includes(row.id);
    });
  }, [isVerified, userSports]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'RPL Season 9 — Event Feedback Form',
          text: 'Share your feedback for Raj Premier League Season 9 (25–27 Dec 2026).',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isMatrixComplete = (rows: MatrixRowConfig[], values: Record<string, StarValue>) =>
    rows.every((r) => values[r.id] !== undefined && values[r.id] !== null);

  const missingMobile = attemptedSubmit && (!isVerified || mobile.length !== 10);
  const missingTournament = attemptedSubmit && !isMatrixComplete(activeTournamentRows, tournamentExp);
  const missingOpening = attemptedSubmit && !isMatrixComplete(OPENING_CEREMONY_ROWS, openingCeremony);
  const missingHospitality = attemptedSubmit && !isMatrixComplete(HOSPITALITY_ROWS, hospitality);
  const missingLeagueText = attemptedSubmit && !leagueFeedback.trim();
  const missingJersey = attemptedSubmit && !isMatrixComplete(JERSEY_CAPS_ROWS, jerseyCaps);
  const missingClosing = attemptedSubmit && closingCeremony === null;
  const missingOverall = attemptedSubmit && overallExp === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!isVerified) {
      const el = document.getElementById('fb-mobile');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const firstInvalidId = !isMatrixComplete(activeTournamentRows, tournamentExp)
      ? 'fb-tournament'
      : !isMatrixComplete(OPENING_CEREMONY_ROWS, openingCeremony)
      ? 'fb-opening'
      : !isMatrixComplete(HOSPITALITY_ROWS, hospitality)
      ? 'fb-hospitality'
      : !leagueFeedback.trim()
      ? 'fb-league-text'
      : !isMatrixComplete(JERSEY_CAPS_ROWS, jerseyCaps)
      ? 'fb-jersey'
      : closingCeremony === null
      ? 'fb-closing'
      : overallExp === null
      ? 'fb-overall'
      : null;

    if (firstInvalidId) {
      const el = document.getElementById(firstInvalidId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    submitFeedback({
      form_type: 'rpl_event',
      mobile,
      full_name: name,
      ratings: {
        tournament: tournamentExp,
        opening_ceremony: openingCeremony,
        hospitality: hospitality,
        jersey_caps: jerseyCaps,
      },
      overall_rating: overallExp,
      feedback_text: [leagueFeedback, teamFeedback ? `[RPL Team Note]: ${teamFeedback}` : '']
        .filter(Boolean)
        .join('\n\n'),
      wow_moment: wowMoment,
      metadata: {
        sports: userSports,
        closing_ceremony: closingCeremony,
      },
    })
      .then(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Failed to submit feedback. Please try again.');
      });
  };

  const handleReset = () => {
    setMobile('');
    setName('');
    setIsVerified(false);
    setIsLookingUp(false);
    setLookupError(null);
    setUserSports([]);
    setUserSportsLabels([]);
    setTournamentExp({});
    setOpeningCeremony({});
    setHospitality({});
    setLeagueFeedback('');
    setJerseyCaps({});
    setClosingCeremony(null);
    setOverallExp(null);
    setTeamFeedback('');
    setWowMoment('');
    setAttemptedSubmit(false);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* ── Sticky Navigation Header ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
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
                Season 9 Feedback
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
            title="Share Feedback Form Link"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{copied ? 'Link Copied!' : 'Share Form'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-200/90 p-6 sm:p-8 shadow-md mb-6">
          <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Event Feedback</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>25th – 27th December 2026</span>
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">
              RPL Season 9 <span className="text-gradient-vibrant">Feedback Form</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
              Thank you for being a part of the <strong className="text-slate-900">Raj Premier League Season 9 (2026)</strong>. Your feedback is essential to help us improve and make future seasons even more memorable. Please take a few minutes to share your thoughts on the tournament held at{' '}
              <strong className="text-slate-900">Shrimad Rajchandra Aatma Tatva Research Centre</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Shrimad Rajchandra Aatma Tatva Research Centre</span>
              </span>
              <span className="text-rose-600 font-semibold">* Indicates required question</span>
            </div>
          </div>
        </div>

        {submitted ? (
          /* ── Confirmation Screen (UI Preview) ── */
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-md space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                UI Preview Complete
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                Thank You, {name}!
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Your RPL Season 9 feedback form passed all UI checks. Once connected to a backend or Google Sheet endpoint, responses will be saved automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Response</span>
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to RPL Home</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Feedback Form Questions ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* 1. Mobile Number & Dynamic Player Lookup */}
            <div
              id="fb-mobile"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${
                missingMobile
                  ? 'border-rose-400 ring-2 ring-rose-500/15'
                  : isVerified
                  ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label htmlFor="feedback-mobile-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>Registered Mobile Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                {missingMobile && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Valid 10-digit registered mobile required</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="feedback-mobile-input"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="Enter your 10-digit mobile number (e.g. 9876543210)"
                  maxLength={10}
                  className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all font-semibold tracking-wider"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {isLookingUp ? (
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  ) : isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : null}
                </div>
              </div>

              {/* Status & Auto-filled details */}
              {isLookingUp && (
                <p className="mt-2.5 text-xs text-amber-600 font-medium flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking database for Season 9 registration...</span>
                </p>
              )}

              {lookupError && (
                <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}

              {isVerified && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          Verified Participant
                        </span>
                      </div>
                      <h4 className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                        {name}
                      </h4>
                    </div>
                  </div>

                  {userSportsLabels.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">
                        Participated in:
                      </span>
                      {userSportsLabels.map((lbl) => (
                        <span
                          key={lbl}
                          className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isVerified ? (
              /* Locked Placeholder when mobile not verified */
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center bg-white/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-800">
                    Enter Your Mobile Number to Continue
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Once verified, questions for the specific leagues you participated in will automatically unlock.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Feedback Form Questions unlocked once verified */
              <>
                {/* 2. Tournament Experience */}
                <StarMatrixCard
                  id="fb-tournament"
                  title="Tournament Experience"
                  subtitle="Rate each Season 9 league you participated in and tournament operations"
                  icon={<Trophy className="w-5 h-5 text-amber-700" />}
                  accentBg="bg-amber-100 border border-amber-200"
                  rows={activeTournamentRows}
                  values={tournamentExp}
                  onChange={(rowId, val) =>
                    setTournamentExp((prev) => ({ ...prev, [rowId]: val }))
                  }
                  hasError={missingTournament}
                />

            {/* 3. Opening Ceremony */}
            <StarMatrixCard
              id="fb-opening"
              title="Opening Ceremony"
              subtitle="Share your rating for the RPL Season 9 Opening Ceremony"
              icon={<Music className="w-5 h-5 text-pink-700" />}
              accentBg="bg-pink-100 border border-pink-200"
              rows={OPENING_CEREMONY_ROWS}
              values={openingCeremony}
              onChange={(rowId, val) =>
                setOpeningCeremony((prev) => ({ ...prev, [rowId]: val }))
              }
              hasError={missingOpening}
            />

            {/* 4. Hospitality & Logistics */}
            <StarMatrixCard
              id="fb-hospitality"
              title="Hospitality & Logistics"
              subtitle="Stay at Shrimad Rajchandra Aatma Tatva Research Centre, meals, and transport"
              icon={<Utensils className="w-5 h-5 text-emerald-700" />}
              accentBg="bg-emerald-100 border border-emerald-200"
              rows={HOSPITALITY_ROWS}
              values={hospitality}
              onChange={(rowId, val) =>
                setHospitality((prev) => ({ ...prev, [rowId]: val }))
              }
              hasError={missingHospitality}
            />

            {/* 5. League-Specific Feedback */}
            <div
              id="fb-league-text"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${
                missingLeagueText ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label htmlFor="feedback-league-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                  Any Feedback related to RPL Cricket / Women&apos;s Cricket / Kaccha Pakka / Football / Table Tennis / Carrom League{' '}
                  <span className="text-rose-500">*</span>
                </label>
                {missingLeagueText && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Tell us what worked well or what we can improve in match formats, rules, or scheduling.
              </p>
              <textarea
                id="feedback-league-input"
                rows={4}
                value={leagueFeedback}
                onChange={(e) => setLeagueFeedback(e.target.value)}
                placeholder="Share your league feedback here..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all font-medium resize-y"
              />
            </div>

            {/* 6. RPL Jersey and Caps */}
            <StarMatrixCard
              id="fb-jersey"
              title="RPL Season 9 Jersey and Caps"
              subtitle="Rate the official Season 9 tournament kit"
              icon={<Shirt className="w-5 h-5 text-sky-700" />}
              accentBg="bg-sky-100 border border-sky-200"
              rows={JERSEY_CAPS_ROWS}
              values={jerseyCaps}
              onChange={(rowId, val) =>
                setJerseyCaps((prev) => ({ ...prev, [rowId]: val }))
              }
              hasError={missingJersey}
            />

            {/* 7. Closing Ceremony & Trophy Presentation */}
            <LinearScaleCard
              id="fb-closing"
              question="How would you rate the closing ceremony experience and trophy presentation?"
              lowLabel="Needs Improvement"
              highLabel="Outstanding"
              value={closingCeremony}
              onChange={(val) => setClosingCeremony(val)}
              hasError={missingClosing}
            />

            {/* 8. Overall Experience */}
            <LinearScaleCard
              id="fb-overall"
              question="Overall Experience"
              lowLabel="Poor"
              highLabel="Unforgettable"
              value={overallExp}
              onChange={(val) => setOverallExp(val)}
              hasError={missingOverall}
            />

            {/* 9. Feedback for the RPL team */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <MessageSquareHeart className="w-5 h-5 text-amber-600 shrink-0" />
                <label htmlFor="feedback-team-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  Feedback for the RPL Team
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Any suggestions, shoutouts, or ideas for Season 10?
              </p>
              <textarea
                id="feedback-team-input"
                rows={3}
                value={teamFeedback}
                onChange={(e) => setTeamFeedback(e.target.value)}
                placeholder="Write a note for the organizing team (optional)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all font-medium resize-y"
              />
            </div>

            {/* 10. Personal "WOW" Moment */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <Heart className="w-5 h-5 text-pink-600 shrink-0" />
                <label htmlFor="feedback-wow-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  What was your personal &ldquo;WOW&rdquo; moment of the tournament?
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                A last-ball thriller, a great catch, a moment with friends, or anything special from 25–27 Dec!
              </p>
              <textarea
                id="feedback-wow-input"
                rows={3}
                value={wowMoment}
                onChange={(e) => setWowMoment(e.target.value)}
                placeholder="Share your favourite memory from RPL Season 9 (optional)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all font-medium resize-y"
              />
            </div>

            {submitError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit & Clear Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2 px-3"
              >
                Clear form
              </button>
            </div>
          </>
        )}
      </form>
    )}
      </main>

      <Footer
        onRegisterClick={onRegisterClick}
        onCheckPassClick={onCheckPassClick}
      />
    </div>
  );
};

export default FeedbackPage;

