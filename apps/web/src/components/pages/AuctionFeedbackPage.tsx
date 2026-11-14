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
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { lookupPlayer, submitFeedback } from '@/lib/api';

interface AuctionFeedbackPageProps {
  onBackToHome: () => void;
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

  // Ratings & Feedback states
  const [ratings, setRatings] = useState<Record<string, StarValue>>({});
  const [hoveredRow, setHoveredRow] = useState<{ rowId: string; star: number } | null>(null);
  const [overallRating, setOverallRating] = useState<ScaleValue>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [favouriteMoment, setFavouriteMoment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle typing mobile number: 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(rawDigits);
    setLookupError(null);

    if (rawDigits.length < 10) {
      setIsVerified(false);
      setName('');
    }
  };

  // Dynamic automatic check as soon as 10 digits are typed
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
        } else if (res && res.found && res.data) {
          setName(res.data.fullName || '');
          setIsVerified(true);
        } else {
          // Allow typing name even if participant is an auction guest or supporter
          setIsVerified(true);
          if (!name.trim()) setName('');
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setIsLookingUp(false);
        setIsVerified(true); // Don't block user if offline/network hiccup
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

  const missingMobile = attemptedSubmit && mobile.length !== 10;
  const missingName = attemptedSubmit && !name.trim();
  const missingRatings = attemptedSubmit && !isAllRatingsComplete;
  const missingOverall = attemptedSubmit && overallRating === null;
  const missingFeedback = attemptedSubmit && !feedbackText.trim();

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

    if (!feedbackText.trim()) {
      const el = document.getElementById('fb-auction-suggestions');
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
    })
      .then(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Failed to submit auction feedback. Please try again.');
      });
  };

  const handleReset = () => {
    setMobile('');
    setName('');
    setIsLookingUp(false);
    setIsVerified(false);
    setLookupError(null);
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-600 transition-colors cursor-pointer group"
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
                Auction Day Feedback
              </span>
            </div>
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
                Feedback Received
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                Thank You, {name || 'Participant'}!
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Your feedback for the RPL Season 9 Auction Day has been recorded. The committee appreciates your time and support!
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
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-sm shadow-md inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to RPL Home</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Auction Feedback Form Questions ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* 1. Participant Details (Mobile & Name) */}
            <div
              id="fb-auction-user"
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${
                missingMobile || missingName
                  ? 'border-rose-400 ring-2 ring-rose-500/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Mobile Number */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="auction-mobile-input"
                      className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span>Mobile Number</span>
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
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold tracking-wider"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {isLookingUp ? (
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                      ) : isVerified && name ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="auction-name-input"
                      className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span>Your Name</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    {missingName && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Please enter your name</span>
                      </span>
                    )}
                  </div>
                  <input
                    id="auction-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

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
              className={`bg-white rounded-3xl border shadow-xs p-5 sm:p-6 transition-colors ${
                missingFeedback ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label
                  htmlFor="auction-feedback-textarea"
                  className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2"
                >
                  <MessageSquareHeart className="w-5 h-5 text-purple-600" />
                  <span>Any Feedback or Suggestions for Auction Day</span>
                  <span className="text-rose-500">*</span>
                </label>
                {missingFeedback && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Tell us what went well, what could be improved in the bidding format, timing, or refreshments for future seasons.
              </p>
              <textarea
                id="auction-feedback-textarea"
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your suggestions and thoughts on the auction ceremony..."
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
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:via-pink-700 hover:to-amber-600 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Auction Feedback</span>
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

