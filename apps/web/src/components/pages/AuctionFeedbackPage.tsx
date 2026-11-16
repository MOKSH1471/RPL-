import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Sparkles,
  CheckCircle2,
  Share2,
  Send,
  Gavel,
  Utensils,
  MapPin,
  Flame,
  Heart,
  MessageSquareHeart,
  AlertCircle,
  RotateCcw,
  Phone,
  Loader2,
  UserCheck,
  ShieldCheck,
  Smile,
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

interface AuctionFeedbackPageProps {
  onBackToHome?: () => void;
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

type StarValue = 1 | 2 | 3 | 4 | 5 | null;
type ScaleValue = 1 | 2 | 3 | 4 | 5 | null;

interface AuctionRatingRow {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const AUCTION_RATING_ROWS: AuctionRatingRow[] = [
  {
    id: 'food',
    label: 'Food & Refreshments',
    description: 'Quality, variety, and taste of meals, high tea & snacks provided',
    icon: <Utensils className="w-5 h-5 text-amber-600" />,
  },
  {
    id: 'venue',
    label: 'Venue & Seating Comfort',
    description: 'Seating arrangement, stage visibility, air conditioning & venue convenience',
    icon: <MapPin className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: 'ambience',
    label: 'Ambience & Atmosphere',
    description: 'Lighting, audio-visuals, live screens, stage decor & event vibe',
    icon: <Flame className="w-5 h-5 text-rose-600" />,
  },
  {
    id: 'ceremony',
    label: 'Entire Ceremony & Bidding Flow',
    description: 'Auction host/auctioneer, bidding pace, player draft rules & stage entertainment',
    icon: <Gavel className="w-5 h-5 text-purple-600" />,
  },
  {
    id: 'hospitality',
    label: 'Hospitality & Support',
    description: 'Welcome reception, volunteer guidance, coordination & team table support',
    icon: <Heart className="w-5 h-5 text-pink-600" />,
  },
];

const STAR_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Outstanding',
};

function serializeAuctionValues(data: {
  ratings: Record<string, StarValue>;
  overallRating: ScaleValue;
  feedbackText: string;
  favouriteMoment: string;
}): string {
  const sortedRatings: Record<string, any> = {};
  Object.keys(data.ratings || {})
    .sort()
    .forEach((k) => {
      if (data.ratings[k] !== undefined && data.ratings[k] !== null) {
        sortedRatings[k] = data.ratings[k];
      }
    });

  return JSON.stringify({
    ratings: sortedRatings,
    overallRating: data.overallRating ?? null,
    feedbackText: (data.feedbackText || '').trim(),
    favouriteMoment: (data.favouriteMoment || '').trim(),
  });
}

export const AuctionFeedbackPage: React.FC<AuctionFeedbackPageProps> = ({
  onBackToHome,
  onRegisterClick,
  onCheckPassClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Participant info
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [paymentPendingInfo, setPaymentPendingInfo] = useState<{
    name: string;
    status: string;
  } | null>(null);

  // Ratings & Feedback states
  const [ratings, setRatings] = useState<Record<string, StarValue>>({});
  const [hoveredRow, setHoveredRow] = useState<{ rowId: string; star: number } | null>(null);
  const [overallRating, setOverallRating] = useState<ScaleValue>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [favouriteMoment, setFavouriteMoment] = useState('');
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

  // 0. Check public auction feedback status on initial mount to immediately show if form is closed
  useEffect(() => {
    fetchFeedbackPublicStatus('auction_day')
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
      const rawDraft = localStorage.getItem('rpl_auction_feedback_draft_v1');
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.mobile && String(draft.mobile).length === 10) {
          setMobile(draft.mobile);
          if (draft.ratings) setRatings(draft.ratings);
          if (draft.overallRating !== undefined) setOverallRating(draft.overallRating);
          if (draft.feedbackText) setFeedbackText(draft.feedbackText);
          if (draft.favouriteMoment) setFavouriteMoment(draft.favouriteMoment);
          setHasDraftContent(true);
        }
      }
    } catch {}
  }, []);

  // 2. Auto-save in-progress draft whenever any field changes (only for verified mobile)
  useEffect(() => {
    if (submitted || !isVerified || mobile.length !== 10) return;
    try {
      const hasAny = Boolean(
        Object.keys(ratings).length > 0 ||
        overallRating !== null ||
        feedbackText.trim() ||
        favouriteMoment.trim()
      );
      setHasDraftContent(hasAny);

      if (hasAny) {
        localStorage.setItem(
          'rpl_auction_feedback_draft_v1',
          JSON.stringify({
            mobile,
            ratings,
            overallRating,
            feedbackText,
            favouriteMoment,
            savedAt: Date.now(),
          })
        );
      }
    } catch {}
  }, [mobile, isVerified, ratings, overallRating, feedbackText, favouriteMoment, submitted]);

  // Reset ratings & comments state helper
  const clearFormValues = () => {
    setRatings({});
    setOverallRating(null);
    setFeedbackText('');
    setFavouriteMoment('');
    setHasDraftContent(false);
    setInitialSnapshot(null);
  };

  // Handle typing mobile number: purely digits with smart country code trimming
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = extractCleanMobile(e.target.value);
    setMobile(cleanDigits);
    setLookupError(null);
    setPaymentPendingInfo(null);

    if (cleanDigits.length < 10) {
      setIsVerified(false);
      setName('');
      setPaymentPendingInfo(null);
      setIsExistingSubmission(false);
      setExistingSubmissionDate(null);
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
      setPaymentPendingInfo(null);
      setIsExistingSubmission(false);
      setExistingSubmissionDate(null);
      clearFormValues();
    }
  };

  // Dynamic automatic check as soon as 10 digits are typed
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

          // Check if previous auction feedback exists for this mobile number to enable edit mode
          fetchExistingFeedback(mobile, 'auction_day')
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

                // Set server ratings cleanly
                const serverRatings = fb.ratings && typeof fb.ratings === 'object' ? fb.ratings : {};
                const serverOverall = fb.overall_rating || null;
                const serverText = fb.feedback_text || '';
                const serverMoment = fb.wow_moment || '';

                setRatings(serverRatings);
                setOverallRating(serverOverall);
                setFeedbackText(serverText);
                setFavouriteMoment(serverMoment);

                // Store initial snapshot for dirty state checking
                setInitialSnapshot(
                  serializeAuctionValues({
                    ratings: serverRatings,
                    overallRating: serverOverall,
                    feedbackText: serverText,
                    favouriteMoment: serverMoment,
                  })
                );
              } else {
                setIsExistingSubmission(false);
                setExistingSubmissionDate(null);
                setInitialSnapshot(null);

                // Check if an in-progress draft exists SPECIFICALLY for this mobile number
                let restored = false;
                try {
                  const rawDraft = localStorage.getItem('rpl_auction_feedback_draft_v1');
                  if (rawDraft) {
                    const draft = JSON.parse(rawDraft);
                    if (draft.mobile === mobile) {
                      if (draft.ratings) setRatings(draft.ratings);
                      if (draft.overallRating !== undefined) setOverallRating(draft.overallRating);
                      if (draft.feedbackText) setFeedbackText(draft.feedbackText);
                      if (draft.favouriteMoment) setFavouriteMoment(draft.favouriteMoment);
                      setHasDraftContent(true);
                      restored = true;
                    }
                  }
                } catch {}

                // If no existing submission and no matching draft for this number, ensure form is fresh & clean
                if (!restored) {
                  clearFormValues();
                }
              }
            })
            .catch(() => {});
        } else if (res && res.found && res.data) {
          setPaymentPendingInfo(null);
          setIsVerified(false);
          setName('');
          clearFormValues();
          setLookupError(
            `Found member record for ${res.data.fullName}, but no Season 9 registration was found for this mobile number.`
          );
        } else {
          setPaymentPendingInfo(null);
          setIsVerified(false);
          setName('');
          clearFormValues();
          setLookupError(
            'Mobile number not found in Season 9 registrations. Only participants with approved payment can submit feedback.'
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

  const handleRatingChange = (rowId: string, val: StarValue) => {
    setRatings((prev) => ({ ...prev, [rowId]: val }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'RPL Season 9 — Auction Day Feedback Form',
          text: 'Share your feedback for the Raj Premier League Season 9 Auction Ceremony.',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isAllRatingsComplete = AUCTION_RATING_ROWS.every(
    (row) => ratings[row.id] !== undefined && ratings[row.id] !== null
  );

  // Form dirty state: when in Edit Mode, enable update button only when answers have been modified
  const isFormChanged = React.useMemo(() => {
    if (!isExistingSubmission || !initialSnapshot) return true;
    const currentSnapshot = serializeAuctionValues({
      ratings,
      overallRating,
      feedbackText,
      favouriteMoment,
    });
    return currentSnapshot !== initialSnapshot;
  }, [isExistingSubmission, initialSnapshot, ratings, overallRating, feedbackText, favouriteMoment]);

  // Dynamic Question-wise Form Progress Tracker (5 matrix rating rows + 1 overall rating)
  const totalQuestionsCount = AUCTION_RATING_ROWS.length + 1;
  const completedQuestionsCount = React.useMemo(() => {
    if (!isVerified) return 0;
    let count = 0;
    AUCTION_RATING_ROWS.forEach((row) => {
      if (ratings[row.id] !== undefined && ratings[row.id] !== null) count++;
    });
    if (overallRating !== null) count++;
    return count;
  }, [isVerified, ratings, overallRating]);
  const progressPercent = isVerified
    ? Math.min(100, Math.round((completedQuestionsCount / totalQuestionsCount) * 100))
    : 0;

  const missingMobile = attemptedSubmit && mobile.length !== 10;
  const missingName = attemptedSubmit && !name.trim();
  const missingRatings = attemptedSubmit && !isAllRatingsComplete;
  const missingOverall = attemptedSubmit && overallRating === null;
  const missingFeedback = false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (mobile.length !== 10 || !name.trim()) {
      const el = document.getElementById('fb-auction-user');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isAllRatingsComplete) {
      const el = document.getElementById('fb-auction-ratings');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (overallRating === null) {
      const el = document.getElementById('fb-auction-overall');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    submitFeedback({
      form_type: 'auction_day',
      mobile,
      full_name: name,
      ratings,
      overall_rating: overallRating,
      feedback_text: feedbackText,
      wow_moment: favouriteMoment,
      metadata: {
        page: 'auction-feedback',
      },
      allow_update: isExistingSubmission,
    })
      .then((res) => {
        setIsSubmitting(false);
        setIsUpdated(Boolean(res?.is_update));
        setSubmitted(true);
        try {
          localStorage.removeItem('rpl_auction_feedback_draft_v1');
        } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Failed to submit auction feedback. Please try again.');
      });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('rpl_auction_feedback_draft_v1');
    } catch {}
    setMobile('');
    setName('');
    setIsLookingUp(false);
    setIsVerified(false);
    setLookupError(null);
    setPaymentPendingInfo(null);
    setIsExistingSubmission(false);
    setExistingSubmissionDate(null);
    setIsUpdated(false);
    setHasDraftContent(false);
    setRatings({});
    setOverallRating(null);
    setFeedbackText('');
    setFavouriteMoment('');
    setAttemptedSubmit(false);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-400 selection:text-slate-950 font-sans">
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
              Auction Day Feedback
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
            title="Share Auction Feedback Form Link"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{copied ? 'Link Copied!' : 'Share Form'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-purple-200/90 p-6 sm:p-8 shadow-md mb-6">
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 absolute top-0 left-0 right-0" />
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-950 border border-purple-300 text-[11px] font-extrabold uppercase tracking-wider">
                <Gavel className="w-3.5 h-3.5 text-purple-600" />
                <span>Auction Day</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>RPL Season 9 Player Draft</span>
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">
              RPL Season 9 <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">Auction Feedback</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
              Thank you for attending the <strong className="text-slate-900">RPL Season 9 Auction Ceremony</strong>. We value your feedback on the food, venue, atmosphere, hospitality, and overall bidding ceremony to help us make future auctions even more thrilling!
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>RPL Season 9 Organizing Committee</span>
              </span>
              <span className="text-rose-600 font-semibold">* Indicates required question</span>
            </div>
          </div>
        </div>

        {submitted ? (
          /* ── Confirmation Screen ── */
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-md space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold uppercase tracking-wider">
                {isUpdated ? 'Auction Feedback Updated' : 'Feedback Received'}
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                {isUpdated ? `Feedback Updated, ${name}!` : `Thank You, ${name || 'Participant'}!`}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isUpdated
                  ? 'Your updated feedback for the RPL Season 9 Auction Day has been recorded.'
                  : 'Your feedback for the RPL Season 9 Auction Day has been recorded. The committee appreciates your time and support!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🔨 *RPL Season 9 Auction Ceremony Feedback*\n\nHey everyone! Just submitted my feedback for the RPL Season 9 Auction Day. Submit your feedback here:\n${window.location.origin}${window.location.pathname}#/auction-feedback`
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
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Response</span>
              </button>
            </div>
          </div>
        ) : isFormClosed ? (
          /* Closed Form Window State Upfront (Hard Closed - No new submissions and no editing) */
          <div className="rounded-3xl border border-purple-200 bg-white p-8 sm:p-12 text-center shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto">
              <Gavel className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                Feedback Window Concluded
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Auction Ceremony Feedback is Closed
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {closeMessage || 'Feedback collection for the RPL Season 9 Auction Ceremony has now concluded. The organizing committee sincerely thanks every attendee who shared their inputs. See you in Season 10!'}
              </p>
            </div>
          </div>
        ) : (
          /* ── Auction Feedback Form Questions ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-28 sm:pb-32">
            {/* 1. Participant Details (Mobile & Dynamic Lookup) */}
            <div
              id="fb-auction-user"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${
                missingMobile
                  ? 'border-rose-400 ring-2 ring-rose-500/15'
                  : isVerified
                  ? 'border-purple-300 ring-2 ring-purple-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label
                  htmlFor="auction-mobile-input"
                  className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>Registered Mobile Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                {missingMobile && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Valid 10-digit mobile required</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="auction-mobile-input"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={handleMobileChange}
                  onPaste={handleMobilePaste}
                  placeholder="Enter 10-digit registered mobile number"
                  maxLength={20}
                  className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold tracking-wider"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {isLookingUp ? (
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  ) : isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : null}
                </div>
              </div>

              {/* Status & Auto-filled details */}
              {isLookingUp && (
                <p className="mt-2.5 text-xs text-purple-600 font-medium flex items-center gap-1.5 animate-pulse">
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
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                          Verified Participant
                        </span>
                      </div>
                      <p className="mt-0.5 font-display font-extrabold text-base sm:text-lg text-slate-900 truncate">
                        {name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Mode Banner when existing auction feedback was loaded */}
            {isVerified && isExistingSubmission && (
              <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-300 p-5 shadow-xs flex items-start gap-3.5 text-purple-950">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-purple-950 text-sm">
                      Previous Auction Feedback Found
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                      Edit Mode
                    </span>
                  </div>
                  <p className="text-purple-800 leading-relaxed font-medium">
                    You previously submitted feedback for the RPL Season 9 Auction Day{existingSubmissionDate ? ` on ${new Date(existingSubmissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Your earlier ratings and responses are pre-filled below. You can update any answers and submit your changes.
                  </p>
                </div>
              </div>
            )}

            {!isVerified ? (
              /* Locked Placeholder when mobile not verified */
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center bg-white/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-base text-slate-700">
                    Enter Your Mobile Number to Continue
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Auction feedback is available for registered participants with verified and approved payment.
                  </p>
                </div>
              </div>
            ) : (
              <>
            {/* 2. Auction Experience Matrix (Food, Venue, Ambience, Entire Ceremony, Hospitality) */}
            <div
              id="fb-auction-ratings"
              className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-colors ${
                missingRatings ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
              }`}
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                    <Gavel className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                      Auction Day Experience <span className="text-rose-500">*</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rate each category of the RPL Season 9 Auction Ceremony (1 = Poor, 5 = Best)
                    </p>
                  </div>
                </div>
                {missingRatings && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Required</span>
                  </span>
                )}
              </div>

              {/* Desktop legend */}
              <div className="hidden sm:grid sm:grid-cols-12 px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div className="col-span-7">Category</div>
                <div className="col-span-5 text-right pr-2">Rating (1 = Poor, 5 = Best)</div>
              </div>

              <div className="divide-y divide-slate-100">
                {AUCTION_RATING_ROWS.map((row) => {
                  const val = ratings[row.id];
                  const numericVal = typeof val === 'number' ? val : 0;
                  const activeHover = hoveredRow?.rowId === row.id ? hoveredRow.star : 0;
                  const displayStars = activeHover || numericVal;

                  return (
                    <div
                      key={row.id}
                      className="px-4 sm:px-6 py-4 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 hover:bg-purple-50/20 transition-colors"
                    >
                      <div className="sm:col-span-7">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{row.label}</span>
                          {val === null && missingRatings && (
                            <span className="text-[10px] font-bold text-rose-600 sm:hidden">
                              Rate this
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>
                      </div>

                      <div className="sm:col-span-5 flex items-center sm:justify-end gap-2">
                        <div
                          className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80"
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {[1, 2, 3, 4, 5].map((star) => {
                            const filled = star <= displayStars;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(row.id, star as 1 | 2 | 3 | 4 | 5)}
                                onMouseEnter={() => setHoveredRow({ rowId: row.id, star })}
                                aria-label={`Rate ${row.label} ${star} out of 5`}
                                className="p-0.5 sm:p-1 rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer touch-manipulation"
                              >
                                <Star
                                  className={`w-5 h-5 transition-colors ${
                                    filled
                                      ? 'fill-amber-400 text-amber-500 drop-shadow-2xs'
                                      : 'text-slate-300 hover:text-amber-300'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 min-w-[85px] text-right hidden md:inline-block">
                          {numericVal > 0 ? STAR_LABELS[numericVal] : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Overall Auction Rating (Scale 1 to 5) */}
            <div
              id="fb-auction-overall"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${
                missingOverall ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                    Overall Auction Day Experience <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How would you rate the overall execution and excitement of the Auction?
                  </p>
                </div>
                {missingOverall && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Required</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-xl">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Needs Improvement
                </span>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1">
                  {([1, 2, 3, 4, 5] as const).map((num) => {
                    const active = overallRating === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOverallRating(num)}
                        className={`h-12 rounded-2xl font-display font-extrabold text-base border transition-all cursor-pointer active:scale-95 ${
                          active
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                            : 'bg-slate-50 hover:bg-purple-50/70 text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Unforgettable
                </span>
              </div>
            </div>

            {/* 4. Any Feedback or Suggestion */}
            <div
              id="fb-auction-suggestions"
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label
                  htmlFor="auction-feedback-textarea"
                  className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2"
                >
                  <MessageSquareHeart className="w-5 h-5 text-purple-600" />
                  <span>Any Feedback or Suggestions for Auction Day</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans ml-1">(Optional)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Tell us what went well, what could be improved in the bidding format, timing, or refreshments for future seasons.
              </p>
              <textarea
                id="auction-feedback-textarea"
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your suggestions and thoughts on the auction ceremony (Optional)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium resize-y"
              />
            </div>

            {/* 5. Highlight / Memorable Auction Moment (Optional) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <Smile className="w-5 h-5 text-amber-500 shrink-0" />
                <label
                  htmlFor="auction-moment-input"
                  className="font-display font-extrabold text-base sm:text-lg text-slate-900"
                >
                  Favourite or Most Memorable Auction Moment (Optional)
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                An intense bidding war, a surprising pick, a funny remark, or a favourite celebration!
              </p>
              <textarea
                id="auction-moment-input"
                rows={3}
                value={favouriteMoment}
                onChange={(e) => setFavouriteMoment(e.target.value)}
                placeholder="Share your highlight of the auction day..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium resize-y"
              />
            </div>

            {submitError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit & Reset Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || (isExistingSubmission && !isFormChanged)}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition-all inline-flex items-center justify-center gap-2 ${
                  isExistingSubmission && !isFormChanged
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:via-pink-700 hover:to-amber-600 text-white hover:shadow-xl active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
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
                      <span>Update Auction Feedback</span>
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
                    <span>Submit Auction Feedback</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                {hasDraftContent && !isExistingSubmission && (
                  <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
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
              aria-label="Auction form completion progress"
              className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">
                    Completion Progress
                  </span>
                </span>
                <span
                  className={`font-mono px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 border ${
                    progressPercent === 100
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-purple-50 text-purple-900 border-purple-200'
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
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 transition-all duration-300 ease-out rounded-full"
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

export default AuctionFeedbackPage;

