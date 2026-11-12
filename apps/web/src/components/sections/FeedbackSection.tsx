import React from 'react';
import { InView } from '@/components/ui/in-view';
import { MessageSquareHeart, Star, ArrowRight, Sparkles } from 'lucide-react';

interface FeedbackSectionProps {
  onOpenFeedback: () => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ onOpenFeedback }) => {
  return (
    <section
      id="feedback"
      className="py-14 md:py-20 relative z-10 w-full max-w-full overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <InView
          viewOptions={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-pink-50/70 border border-amber-200/90 p-6 sm:p-10 md:p-12 shadow-lg shadow-amber-900/5">
            {/* Subtle ambient accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-pink-400/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-300/80 text-amber-950 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>RPL Season 9 • 25–27 Dec 2026</span>
                </div>

                <h2
                  className="font-display font-extrabold text-slate-900 tracking-tight"
                  style={{ fontSize: 'clamp(1.5rem, 3.2vw + 0.25rem, 2.75rem)' }}
                >
                  Share Your Season 9 <span className="text-gradient-vibrant">Event Feedback</span>
                </h2>

                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                  Played, cheered, or attended at Shrimad Rajchandra Aatma Tatva Research Centre? Rate your league experience, opening &amp; closing ceremonies, kit, hospitality, and share your favourite &ldquo;WOW&rdquo; moment!
                </p>

                <div className="flex items-center space-x-1.5 pt-1 text-xs font-bold text-amber-800">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <span>Takes ~2 minutes · Covers all 6 Season 9 Leagues</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
                <button
                  type="button"
                  onClick={onOpenFeedback}
                  className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95 transition-all inline-flex items-center justify-center space-x-2.5 cursor-pointer group"
                >
                  <MessageSquareHeart className="w-5 h-5" />
                  <span>Open Feedback Form</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
};

export default FeedbackSection;

