import React, { useState } from 'react';
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
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface FeedbackPageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

type StarValue = 1 | 2 | 3 | 4 | 5 | 'na' | null;
type ScaleValue = 1 | 2 | 3 | 4 | 5 | null;

interface MatrixRowConfig {
  id: string;
  label: string;
  allowNA?: boolean;
}

const TOURNAMENT_EXPERIENCE_ROWS: MatrixRowConfig[] = [
  { id: 'rpl_cricket', label: 'RPL Cricket League Experience', allowNA: true },
  { id: 'womens_cricket', label: "Women's Cricket League Experience", allowNA: true },
  { id: 'kaccha_pakka', label: 'Kaccha Pakka Cricket League Experience', allowNA: true },
  { id: 'football', label: 'Football League Experience', allowNA: true },
  { id: 'table_tennis', label: 'Table Tennis League Experience', allowNA: true },
  { id: 'carrom', label: 'Carrom League Experience', allowNA: true },
  { id: 'officiating', label: 'Match Officiating / Umpiring & Referees' },
  { id: 'ground_conditions', label: 'Ground & Arena Conditions' },
  { id: 'schedule_management', label: 'Schedule Management' },
];

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

                {row.allowNA && (
                  <button
                    type="button"
                    onClick={() => onChange(row.id, val === 'na' ? null : 'na')}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      val === 'na'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                    }`}
                    title="Select if you did not participate in this league"
                  >
                    Didn't Play
                  </button>
                )}

                <span className="text-[11px] font-semibold text-slate-500 min-w-[92px] text-right hidden md:inline-block">
                  {val === 'na'
                    ? 'N/A'
                    : numericVal > 0
                    ? STAR_LABELS[numericVal]
                    : 'Not rated'}
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

  const missingName = attemptedSubmit && !name.trim();
  const missingTournament = attemptedSubmit && !isMatrixComplete(TOURNAMENT_EXPERIENCE_ROWS, tournamentExp);
  const missingOpening = attemptedSubmit && !isMatrixComplete(OPENING_CEREMONY_ROWS, openingCeremony);
  const missingHospitality = attemptedSubmit && !isMatrixComplete(HOSPITALITY_ROWS, hospitality);
  const missingLeagueText = attemptedSubmit && !leagueFeedback.trim();
  const missingJersey = attemptedSubmit && !isMatrixComplete(JERSEY_CAPS_ROWS, jerseyCaps);
  const missingClosing = attemptedSubmit && closingCeremony === null;
  const missingOverall = attemptedSubmit && overallExp === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    const firstInvalidId = !name.trim()
      ? 'fb-name'
      : !isMatrixComplete(TOURNAMENT_EXPERIENCE_ROWS, tournamentExp)
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

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setName('');
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
            {/* 1. Name */}
            <div
              id="fb-name"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${
                missingName ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label htmlFor="feedback-name-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  Name <span className="text-rose-500">*</span>
                </label>
                {missingName && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Please enter your name</span>
                  </span>
                )}
              </div>
              <input
                id="feedback-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
              />
            </div>

            {/* 2. Tournament Experience */}
            <StarMatrixCard
              id="fb-tournament"
              title="Tournament Experience"
              subtitle="Rate each Season 9 league and tournament operations (tap “Didn't Play” for leagues you weren't part of)"
              icon={<Trophy className="w-5 h-5 text-amber-700" />}
              accentBg="bg-amber-100 border border-amber-200"
              rows={TOURNAMENT_EXPERIENCE_ROWS}
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

            {/* Submit & Clear Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2 px-3"
              >
                Clear form
              </button>
            </div>
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

