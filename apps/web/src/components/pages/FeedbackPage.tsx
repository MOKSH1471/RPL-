import React, { useState, useEffect, useRef } from 'react';
import {
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
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { lookupPlayer, submitFeedback, fetchExistingFeedback, fetchFeedbackPublicStatus } from '@/lib/api';

function extractCleanMobile(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits.slice(0, 10);
}

interface FeedbackPageProps {
  onBackToHome?: () => void;
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
  isNA?: boolean;
  onToggleNA?: () => void;
  naLabel?: string;
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
  isNA = false,
  onToggleNA,
  naLabel = 'Did not attend?',
}) => {
  const [hovered, setHovered] = useState<{ rowId: string; star: number } | null>(null);

  return (
    <div
      id={id}
      className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-colors ${hasError && !isNA ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
        }`}
    >
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${accentBg}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
              {title} {!isNA && <span className="text-rose-500">*</span>}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleNA && (
            <button
              type="button"
              onClick={onToggleNA}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${isNA
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                }`}
            >
              {isNA ? '✓ Marked: Did Not Attend' : naLabel}
            </button>
          )}
          {hasError && !isNA && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Required</span>
            </span>
          )}
        </div>
      </div>

      {isNA ? (
        <div className="p-6 text-center bg-slate-50/60 flex flex-col items-center justify-center gap-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Marked as &ldquo;Did Not Attend&rdquo;. Questions in this section are skipped.
          </p>
          <button
            type="button"
            onClick={onToggleNA}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            Click here to rate this section instead
          </button>
        </div>
      ) : (
        <>
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
                              className={`w-5 h-5 sm:w-5 sm:h-5 transition-colors ${filled
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
        </>
      )}
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
  isNA?: boolean;
  onToggleNA?: () => void;
  naLabel?: string;
}

const LinearScaleCard: React.FC<LinearScaleCardProps> = ({
  id,
  question,
  lowLabel,
  highLabel,
  value,
  onChange,
  hasError,
  isNA = false,
  onToggleNA,
  naLabel = 'Did not attend?',
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${hasError && !isNA ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
        }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
          {question} {!isNA && <span className="text-rose-500">*</span>}
        </h3>
        <div className="flex items-center gap-2">
          {onToggleNA && (
            <button
              type="button"
              onClick={onToggleNA}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${isNA
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                }`}
            >
              {isNA ? '✓ Marked: Did Not Attend' : naLabel}
            </button>
          )}
          {hasError && !isNA && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Required</span>
            </span>
          )}
        </div>
      </div>

      {isNA ? (
        <div className="p-5 text-center bg-slate-50/60 rounded-2xl flex flex-col items-center justify-center gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Marked as &ldquo;Did Not Attend&rdquo;. Closing ceremony rating skipped.
          </p>
          <button
            type="button"
            onClick={onToggleNA}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            Click here to rate closing ceremony instead
          </button>
        </div>
      ) : (
        <>
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
                    className={`h-12 rounded-2xl font-display font-extrabold text-base border transition-all cursor-pointer active:scale-95 ${active
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
        </>
      )}
    </div>
  );
};

function serializeFeedbackValues(data: {
  tournamentExp: Record<string, StarValue>;
  openingCeremony: Record<string, StarValue>;
  openingCeremonyNA: boolean;
  hospitality: Record<string, StarValue>;
  jerseyCaps: Record<string, StarValue>;
  closingCeremony: ScaleValue;
  closingCeremonyNA: boolean;
  overallExp: ScaleValue;
  leagueFeedback: string;
  teamFeedback: string;
  wowMoment: string;
}): string {
  const sortObj = (obj: Record<string, any>) => {
    const sorted: Record<string, any> = {};
    Object.keys(obj || {})
      .sort()
      .forEach((k) => {
        if (obj[k] !== undefined && obj[k] !== null) sorted[k] = obj[k];
      });
    return sorted;
  };

  return JSON.stringify({
    tournamentExp: sortObj(data.tournamentExp),
    openingCeremony: data.openingCeremonyNA ? {} : sortObj(data.openingCeremony),
    openingCeremonyNA: Boolean(data.openingCeremonyNA),
    hospitality: sortObj(data.hospitality),
    jerseyCaps: sortObj(data.jerseyCaps),
    closingCeremony: data.closingCeremonyNA ? null : data.closingCeremony,
    closingCeremonyNA: Boolean(data.closingCeremonyNA),
    overallExp: data.overallExp ?? null,
    leagueFeedback: (data.leagueFeedback || '').trim(),
    teamFeedback: (data.teamFeedback || '').trim(),
    wowMoment: (data.wowMoment || '').trim(),
  });
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
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

  // Edit Mode & Draft states
  const [isExistingSubmission, setIsExistingSubmission] = useState(false);
  const [existingSubmissionDate, setExistingSubmissionDate] = useState<string | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [hasDraftContent, setHasDraftContent] = useState(false);
  const [isFormClosed, setIsFormClosed] = useState(false);
  const [closeMessage, setCloseMessage] = useState<string | null>(null);
  const [paymentPendingInfo, setPaymentPendingInfo] = useState<{
    name: string;
    status: string;
  } | null>(null);
  const [openingCeremonyNA, setOpeningCeremonyNA] = useState(false);
  const [closingCeremonyNA, setClosingCeremonyNA] = useState(false);

  // 0. Check public feedback status on initial mount to immediately show if form is closed
  useEffect(() => {
    fetchFeedbackPublicStatus('rpl_event')
      .then((res) => {
        if (res && res.is_closed) {
          setIsFormClosed(true);
          if (res.close_message) setCloseMessage(res.close_message);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Restore draft from localStorage on initial mount (only if mobile was saved)
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem('rpl_feedback_draft_v1');
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.mobile && String(draft.mobile).length === 10) {
          setMobile(draft.mobile);
          if (draft.tournamentExp) setTournamentExp(draft.tournamentExp);
          if (draft.openingCeremony) setOpeningCeremony(draft.openingCeremony);
          if (draft.hospitality) setHospitality(draft.hospitality);
          if (draft.leagueFeedback) setLeagueFeedback(draft.leagueFeedback);
          if (draft.jerseyCaps) setJerseyCaps(draft.jerseyCaps);
          if (draft.closingCeremony !== undefined) setClosingCeremony(draft.closingCeremony);
          if (draft.overallExp !== undefined) setOverallExp(draft.overallExp);
          if (draft.teamFeedback) setTeamFeedback(draft.teamFeedback);
          if (draft.wowMoment) setWowMoment(draft.wowMoment);
          if (draft.openingCeremonyNA !== undefined) setOpeningCeremonyNA(draft.openingCeremonyNA);
          if (draft.closingCeremonyNA !== undefined) setClosingCeremonyNA(draft.closingCeremonyNA);
          setHasDraftContent(true);
        }
      }
    } catch { }
  }, []);

  // 2. Auto-save in-progress draft whenever any field changes (only for verified mobile)
  useEffect(() => {
    if (submitted || !isVerified || mobile.length !== 10) return;
    try {
      const hasAny = Boolean(
        Object.keys(tournamentExp).length > 0 ||
        Object.keys(openingCeremony).length > 0 ||
        Object.keys(hospitality).length > 0 ||
        Object.keys(jerseyCaps).length > 0 ||
        leagueFeedback.trim() ||
        teamFeedback.trim() ||
        wowMoment.trim() ||
        overallExp !== null ||
        closingCeremony !== null ||
        openingCeremonyNA ||
        closingCeremonyNA
      );
      setHasDraftContent(hasAny);

      if (hasAny) {
        localStorage.setItem(
          'rpl_feedback_draft_v1',
          JSON.stringify({
            mobile,
            tournamentExp,
            openingCeremony,
            hospitality,
            leagueFeedback,
            jerseyCaps,
            closingCeremony,
            overallExp,
            teamFeedback,
            wowMoment,
            openingCeremonyNA,
            closingCeremonyNA,
            savedAt: Date.now(),
          })
        );
      }
    } catch { }
  }, [
    mobile,
    isVerified,
    tournamentExp,
    openingCeremony,
    hospitality,
    leagueFeedback,
    jerseyCaps,
    closingCeremony,
    overallExp,
    teamFeedback,
    wowMoment,
    openingCeremonyNA,
    closingCeremonyNA,
    submitted,
  ]);

  // Reset ratings & comments state helper
  const clearFormValues = () => {
    setTournamentExp({});
    setOpeningCeremony({});
    setHospitality({});
    setJerseyCaps({});
    setClosingCeremony(null);
    setOverallExp(null);
    setLeagueFeedback('');
    setTeamFeedback('');
    setWowMoment('');
    setOpeningCeremonyNA(false);
    setClosingCeremonyNA(false);
    setHasDraftContent(false);
    setInitialSnapshot(null);
  };

  // Handle typing mobile number: purely digits, 10-digit limit with smart country code trimming
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = extractCleanMobile(e.target.value);
    setMobile(cleanDigits);
    setLookupError(null);
    setPaymentPendingInfo(null);

    if (cleanDigits.length < 10) {
      setIsVerified(false);
      setName('');
      setUserSports([]);
      setUserSportsLabels([]);
      setIsExistingSubmission(false);
      setExistingSubmissionDate(null);
      setPaymentPendingInfo(null);
      clearFormValues();
    }
  };

  // Direct paste handler to avoid browser native maxLength truncation
  const handleMobilePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanDigits = extractCleanMobile(pastedText);
    setMobile(cleanDigits);
    setLookupError(null);
    setPaymentPendingInfo(null);

    if (cleanDigits.length < 10) {
      setIsVerified(false);
      setName('');
      setUserSports([]);
      setUserSportsLabels([]);
      setIsExistingSubmission(false);
      setExistingSubmissionDate(null);
      setPaymentPendingInfo(null);
      clearFormValues();
    }
  };

  // Dynamic automatic check as soon as 10 digits are entered
  useEffect(() => {
    if (mobile.length !== 10) return;

    let isCancelled = false;
    setIsLookingUp(true);
    setLookupError(null);
    setPaymentPendingInfo(null);

    lookupPlayer(mobile)
      .then((res) => {
        if (isCancelled) return;
        setIsLookingUp(false);

        if (res && res.found && res.registration) {
          const reg = res.registration;
          const participantName = reg.fullName || res.data?.fullName || '';
          const isApproved = String(reg.paymentStatus || '').toLowerCase() === 'approved';

          if (!isApproved) {
            setIsVerified(false);
            setName('');
            setUserSports([]);
            setUserSportsLabels([]);
            setIsExistingSubmission(false);
            setExistingSubmissionDate(null);
            clearFormValues();
            setPaymentPendingInfo({
              name: participantName,
              status: reg.paymentStatus || 'pending',
            });
            setLookupError(null);
            return;
          }

          setPaymentPendingInfo(null);
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

          // Check if previous feedback exists for this mobile number to enable edit mode
          fetchExistingFeedback(mobile, 'rpl_event')
            .then((fbRes) => {
              if (isCancelled) return;
              if (fbRes?.is_closed) {
                setIsFormClosed(true);
                if (fbRes.close_message) setCloseMessage(fbRes.close_message);
              }

              if (fbRes && fbRes.exists && fbRes.feedback) {
                const fb = fbRes.feedback;
                setIsExistingSubmission(true);
                setExistingSubmissionDate(fb.created_at || null);

                // Set server ratings directly
                setTournamentExp(fb.ratings?.tournament || {});
                setHospitality(fb.ratings?.hospitality || {});
                setJerseyCaps(fb.ratings?.jersey_caps || {});
                setOverallExp(fb.overall_rating || null);

                // Detect Opening Ceremony "Did Not Attend" state:
                // Marked NA if flag is set, attended is false, or no opening ceremony categories were rated
                const hasValidOpeningRatings = OPENING_CEREMONY_ROWS.some(
                  (r) => typeof fb.ratings?.opening_ceremony?.[r.id] === 'number'
                );
                const isOpeningNA = Boolean(
                  fb.metadata?.opening_ceremony_na === true ||
                  fb.metadata?.openingCeremonyNA === true ||
                  fb.ratings?.opening_ceremony?.attended === false ||
                  !hasValidOpeningRatings
                );
                setOpeningCeremonyNA(isOpeningNA);
                setOpeningCeremony(isOpeningNA ? {} : (fb.ratings?.opening_ceremony || {}));

                // Detect Closing Ceremony "Did Not Attend" state:
                const isClosingNA = Boolean(
                  fb.metadata?.closing_ceremony_na === true ||
                  fb.metadata?.closingCeremonyNA === true ||
                  fb.metadata?.closing_ceremony === null ||
                  fb.metadata?.closing_ceremony === 'na' ||
                  (!fb.metadata?.closing_ceremony && !fb.ratings?.closing_ceremony && fb.overall_rating)
                );
                setClosingCeremonyNA(isClosingNA);
                if (isClosingNA) {
                  setClosingCeremony(null);
                } else if (fb.metadata && fb.metadata.closing_ceremony) {
                  setClosingCeremony(Number(fb.metadata.closing_ceremony) as ScaleValue);
                } else if (fb.ratings && fb.ratings.closing_ceremony) {
                  setClosingCeremony(Number(fb.ratings.closing_ceremony) as ScaleValue);
                }

                setWowMoment(fb.wow_moment || '');
                const loadedLeague = fb.feedback_text ? fb.feedback_text.split('\n\n[RPL Team Note]: ')[0] || '' : '';
                const loadedTeam = fb.feedback_text ? fb.feedback_text.split('\n\n[RPL Team Note]: ')[1] || '' : '';
                setLeagueFeedback(loadedLeague);
                setTeamFeedback(loadedTeam);

                // Store clean initial snapshot for dirty state checking
                const loadedClosing = isClosingNA
                  ? null
                  : fb.metadata && fb.metadata.closing_ceremony
                  ? (Number(fb.metadata.closing_ceremony) as ScaleValue)
                  : fb.ratings && fb.ratings.closing_ceremony
                  ? (Number(fb.ratings.closing_ceremony) as ScaleValue)
                  : null;

                setInitialSnapshot(
                  serializeFeedbackValues({
                    tournamentExp: fb.ratings?.tournament || {},
                    openingCeremony: isOpeningNA ? {} : (fb.ratings?.opening_ceremony || {}),
                    openingCeremonyNA: isOpeningNA,
                    hospitality: fb.ratings?.hospitality || {},
                    jerseyCaps: fb.ratings?.jersey_caps || {},
                    closingCeremony: loadedClosing,
                    closingCeremonyNA: isClosingNA,
                    overallExp: fb.overall_rating || null,
                    leagueFeedback: loadedLeague,
                    teamFeedback: loadedTeam,
                    wowMoment: fb.wow_moment || '',
                  })
                );
              } else {
                setIsExistingSubmission(false);
                setExistingSubmissionDate(null);
                setInitialSnapshot(null);

                // Check if an in-progress draft exists SPECIFICALLY for this mobile number
                let restored = false;
                try {
                  const rawDraft = localStorage.getItem('rpl_feedback_draft_v1');
                  if (rawDraft) {
                    const draft = JSON.parse(rawDraft);
                    if (draft.mobile === mobile) {
                      if (draft.tournamentExp) setTournamentExp(draft.tournamentExp);
                      if (draft.openingCeremony) setOpeningCeremony(draft.openingCeremony);
                      if (draft.hospitality) setHospitality(draft.hospitality);
                      if (draft.leagueFeedback) setLeagueFeedback(draft.leagueFeedback);
                      if (draft.jerseyCaps) setJerseyCaps(draft.jerseyCaps);
                      if (draft.closingCeremony !== undefined) setClosingCeremony(draft.closingCeremony);
                      if (draft.overallExp !== undefined) setOverallExp(draft.overallExp);
                      if (draft.teamFeedback) setTeamFeedback(draft.teamFeedback);
                      if (draft.wowMoment) setWowMoment(draft.wowMoment);
                      if (draft.openingCeremonyNA !== undefined) setOpeningCeremonyNA(draft.openingCeremonyNA);
                      if (draft.closingCeremonyNA !== undefined) setClosingCeremonyNA(draft.closingCeremonyNA);
                      setHasDraftContent(true);
                      restored = true;
                    }
                  }
                } catch { }

                // If no existing submission and no matching draft for this number, ensure form is fresh & clean
                if (!restored) {
                  clearFormValues();
                }
              }
            })
            .catch(() => { });
        } else if (res && res.found && res.data) {
          setPaymentPendingInfo(null);
          setIsVerified(false);
          setName('');
          setUserSports([]);
          setUserSportsLabels([]);
          clearFormValues();
          setLookupError(
            `Found member record for ${res.data.fullName}, but no Season 9 registration was found for this mobile number.`
          );
        } else {
          setPaymentPendingInfo(null);
          setIsVerified(false);
          setName('');
          setUserSports([]);
          setUserSportsLabels([]);
          clearFormValues();
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

  // Form dirty state: when in Edit Mode, enable update button only when answers have been modified
  const isFormChanged = React.useMemo(() => {
    if (!isExistingSubmission || !initialSnapshot) return true;
    const currentSnapshot = serializeFeedbackValues({
      tournamentExp,
      openingCeremony,
      openingCeremonyNA,
      hospitality,
      jerseyCaps,
      closingCeremony,
      closingCeremonyNA,
      overallExp,
      leagueFeedback,
      teamFeedback,
      wowMoment,
    });
    return currentSnapshot !== initialSnapshot;
  }, [
    isExistingSubmission,
    initialSnapshot,
    tournamentExp,
    openingCeremony,
    openingCeremonyNA,
    hospitality,
    jerseyCaps,
    closingCeremony,
    closingCeremonyNA,
    overallExp,
    leagueFeedback,
    teamFeedback,
    wowMoment,
  ]);

  const isMatrixComplete = (rows: MatrixRowConfig[], values: Record<string, StarValue>) =>
    rows.every((r) => values[r.id] !== undefined && values[r.id] !== null);

  // Dynamic Question-wise Form Progress Tracker (adapts to player's active sports and attendance)
  const totalQuestionsCount = React.useMemo(() => {
    let total = activeTournamentRows.length; // Base tournament operations + player's registered sports
    total += openingCeremonyNA ? 1 : OPENING_CEREMONY_ROWS.length; // 1 (if NA) or 3 rating rows
    total += HOSPITALITY_ROWS.length; // 5 hospitality rating rows
    total += JERSEY_CAPS_ROWS.length; // 2 jersey/cap rating rows
    total += 1; // Closing ceremony rating (or NA)
    total += 1; // Overall rating
    return Math.max(total, 1);
  }, [activeTournamentRows, openingCeremonyNA]);

  const completedQuestionsCount = React.useMemo(() => {
    if (!isVerified) return 0;
    let count = 0;

    // 1. Tournament dynamic sports + operations ratings
    activeTournamentRows.forEach((r) => {
      if (tournamentExp[r.id] !== undefined && tournamentExp[r.id] !== null) count++;
    });

    // 2. Opening ceremony (either NA or individual star ratings)
    if (openingCeremonyNA) {
      count += 1;
    } else {
      OPENING_CEREMONY_ROWS.forEach((r) => {
        if (openingCeremony[r.id] !== undefined && openingCeremony[r.id] !== null) count++;
      });
    }

    // 3. Hospitality & Food ratings
    HOSPITALITY_ROWS.forEach((r) => {
      if (hospitality[r.id] !== undefined && hospitality[r.id] !== null) count++;
    });

    // 4. Jersey & Caps ratings
    JERSEY_CAPS_ROWS.forEach((r) => {
      if (jerseyCaps[r.id] !== undefined && jerseyCaps[r.id] !== null) count++;
    });

    // 5. Closing ceremony (either rated or marked NA)
    if (closingCeremonyNA || closingCeremony !== null) count++;

    // 6. Overall event rating
    if (overallExp !== null) count++;

    return count;
  }, [
    isVerified,
    activeTournamentRows,
    tournamentExp,
    openingCeremonyNA,
    openingCeremony,
    hospitality,
    jerseyCaps,
    closingCeremonyNA,
    closingCeremony,
    overallExp,
  ]);

  const progressPercent = isVerified
    ? Math.min(100, Math.round((completedQuestionsCount / totalQuestionsCount) * 100))
    : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'RPL Season 9 — Event Feedback Form',
          text: 'Share your feedback for Raj Premier League Season 9 (25–27 Dec 2026).',
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const missingMobile = attemptedSubmit && (!isVerified || mobile.length !== 10);
  const missingTournament = attemptedSubmit && !isMatrixComplete(activeTournamentRows, tournamentExp);
  const missingOpening = attemptedSubmit && !openingCeremonyNA && !isMatrixComplete(OPENING_CEREMONY_ROWS, openingCeremony);
  const missingHospitality = attemptedSubmit && !isMatrixComplete(HOSPITALITY_ROWS, hospitality);
  const missingLeagueText = false;
  const missingJersey = attemptedSubmit && !isMatrixComplete(JERSEY_CAPS_ROWS, jerseyCaps);
  const missingClosing = attemptedSubmit && !closingCeremonyNA && closingCeremony === null;
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
      : !openingCeremonyNA && !isMatrixComplete(OPENING_CEREMONY_ROWS, openingCeremony)
        ? 'fb-opening'
        : !isMatrixComplete(HOSPITALITY_ROWS, hospitality)
          ? 'fb-hospitality'
          : !isMatrixComplete(JERSEY_CAPS_ROWS, jerseyCaps)
            ? 'fb-jersey'
            : !closingCeremonyNA && closingCeremony === null
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
        opening_ceremony: openingCeremonyNA ? { attended: false } : openingCeremony,
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
        sports_labels: userSportsLabels,
        closing_ceremony: closingCeremonyNA ? null : closingCeremony,
        opening_ceremony_na: openingCeremonyNA,
        closing_ceremony_na: closingCeremonyNA,
      },
      allow_update: isExistingSubmission,
    })
      .then((res) => {
        setIsSubmitting(false);
        setIsUpdated(Boolean(res?.is_update));
        setSubmitted(true);
        try {
          localStorage.removeItem('rpl_feedback_draft_v1');
        } catch { }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Failed to submit feedback. Please try again.');
      });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('rpl_feedback_draft_v1');
    } catch { }
    setMobile('');
    setName('');
    setIsVerified(false);
    setIsLookingUp(false);
    setLookupError(null);
    setUserSports([]);
    setUserSportsLabels([]);
    setTournamentExp({});
    setOpeningCeremony({});
    setOpeningCeremonyNA(false);
    setHospitality({});
    setLeagueFeedback('');
    setJerseyCaps({});
    setClosingCeremony(null);
    setClosingCeremonyNA(false);
    setOverallExp(null);
    setTeamFeedback('');
    setWowMoment('');
    setIsExistingSubmission(false);
    setExistingSubmissionDate(null);
    setIsUpdated(false);
    setHasDraftContent(false);
    setAttemptedSubmit(false);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* ── Sticky Navigation Header ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/rpl-logo.png"
              alt="RPL Logo"
              className="h-7 w-auto object-contain drop-shadow-2xs"
            />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-display">
              Season 9 Feedback
            </span>
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
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                {isUpdated ? 'Feedback Updated Successfully' : 'Feedback Submitted Successfully'}
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                {isUpdated ? `Feedback Updated, ${name}!` : `Thank You, ${name}!`}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isUpdated
                  ? 'Your updated feedback for Raj Premier League Season 9 has been recorded successfully.'
                  : 'Your feedback for Raj Premier League Season 9 has been recorded. The organizing committee truly appreciates your valuable inputs!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🏏 *Raj Premier League Season 9 Feedback*\n\nHey Team! Just submitted my feedback for RPL Season 9. Please take 2 minutes and submit yours too:\n${window.location.origin}${window.location.pathname}#/feedback`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Share with Teammates on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Response</span>
              </button>
            </div>
          </div>
        ) : isFormClosed ? (
          /* Closed Form Window State Upfront (Hard Closed - No new submissions and no editing) */
          <div className="rounded-3xl border border-amber-300 bg-white p-8 sm:p-12 text-center shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                Feedback Window Concluded
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                RPL Season 9 Feedback is Closed
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {closeMessage || 'Feedback collection for RPL Season 9 has now concluded. The organizing committee sincerely thanks every player, captain, and volunteer who shared their thoughts. See you in Season 10!'}
              </p>
            </div>
          </div>
        ) : (
          /* ── Feedback Form Questions ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-28 sm:pb-32">
            {/* 1. Mobile Number & Dynamic Player Lookup */}
            <div
              id="fb-mobile"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${missingMobile
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
                  onPaste={handleMobilePaste}
                  placeholder="Enter your 10-digit mobile number (e.g. 9876543210)"
                  maxLength={20}
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

              {/* Payment Verification Pending Banner */}
              {paymentPendingInfo && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-extrabold text-amber-950">Payment Verification Pending</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/90 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {paymentPendingInfo.status}
                    </span>
                  </div>
                  <p className="text-amber-900 leading-relaxed font-medium">
                    Registration found for <strong className="text-slate-900">{paymentPendingInfo.name}</strong>, but payment verification is currently <strong className="uppercase">{paymentPendingInfo.status}</strong>. Only participants with approved payment can submit feedback.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    If you have already paid, please check with the RPL organizers to approve your payment status.
                  </p>
                </div>
              )}

              {isVerified && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          Verified Participant
                        </span>
                      </div>
                      <p className="mt-0.5 font-display font-extrabold text-base sm:text-lg text-slate-900 truncate">
                        {name}
                      </p>
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

            {/* Edit Mode Banner when existing submission was loaded */}
            {isVerified && isExistingSubmission && (
              <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-300 p-5 shadow-xs flex items-start gap-3.5 text-amber-950">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-amber-950 text-sm">
                      Previous Feedback Found
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                      Edit Mode
                    </span>
                  </div>
                  <p className="text-amber-800 leading-relaxed font-medium">
                    You previously submitted feedback for RPL Season 9{existingSubmissionDate ? ` on ${new Date(existingSubmissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Your earlier ratings and comments are pre-filled below. You can update any answers and submit your changes.
                  </p>
                </div>
              </div>
            )}

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
                  isNA={openingCeremonyNA}
                  onToggleNA={() => setOpeningCeremonyNA((prev) => !prev)}
                  naLabel="Did not attend?"
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
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <label htmlFor="feedback-league-input" className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                      Any Feedback related to RPL Cricket / Women&apos;s Cricket / Kaccha Pakka / Football / Table Tennis / Carrom League{' '}
                      <span className="text-xs font-semibold text-slate-400 font-sans ml-1">(Optional)</span>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Tell us what worked well or what we can improve in match formats, rules, or scheduling.
                  </p>
                  <textarea
                    id="feedback-league-input"
                    rows={4}
                    value={leagueFeedback}
                    onChange={(e) => setLeagueFeedback(e.target.value)}
                    placeholder="Share your league feedback, highlights, or suggestions here (Optional)..."
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
                  isNA={closingCeremonyNA}
                  onToggleNA={() => setClosingCeremonyNA((prev) => !prev)}
                  naLabel="Did not attend?"
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
                disabled={isSubmitting || (isExistingSubmission && !isFormChanged)}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition-all inline-flex items-center justify-center gap-2 ${
                  isExistingSubmission && !isFormChanged
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white hover:shadow-xl active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
                title={isExistingSubmission && !isFormChanged ? 'No changes made to update' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isExistingSubmission ? 'Updating...' : 'Submitting to Database...'}</span>
                  </>
                ) : isExistingSubmission ? (
                  isFormChanged ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Update Feedback</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>No Changes to Update</span>
                    </>
                  )
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

                  <div className="flex items-center gap-3">
                    {hasDraftContent && !isExistingSubmission && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Draft auto-saved</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2 px-3"
                    >
                      Clear form
                    </button>
                  </div>
                </div>

                {/* Floating Form Completion Status Bar */}
                <aside
                  aria-label="Form completion progress"
                  className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all duration-300 pointer-events-auto"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">
                        Completion Progress
                      </span>
                    </span>
                    <span
                      className={`font-mono px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 border ${
                        progressPercent === 100
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {progressPercent === 100 ? (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>All {totalQuestionsCount} ratings completed (100%)</span>
                        </span>
                      ) : (
                        `${completedQuestionsCount} of ${totalQuestionsCount} ratings (${progressPercent}%)`
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </aside>
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

