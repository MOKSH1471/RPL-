import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, CheckCircle2, QrCode, MessageCircle, Flame, Shield, Award, Calendar, MapPin, Zap } from 'lucide-react';

interface CricketLeagueSiteProps {
  onBackToHome: () => void;
  customQuestionsText?: string;
}

export const CricketLeagueSite: React.FC<CricketLeagueSiteProps> = ({ onBackToHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState('');
  const [formData, setFormData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    const id = `CRIC9-${Math.floor(100000 + Math.random() * 900000)}`;
    setPassId(id);
    setFormData(data);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#EA580C'],
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0612] text-slate-100 relative selection:bg-amber-500 selection:text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 solid-nav py-4 border-b border-amber-500/20 bg-[#0E0A1A]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors px-4 py-2 rounded-full solid-card"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RPL Main Site</span>
          </button>

          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-display font-extrabold text-lg text-white">
              Cricket League <span className="text-amber-400">S9</span>
            </span>
          </div>
        </div>
      </header>

      {/* Cricket Dedicated Hero Banner */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-[#1C1322] via-[#120B1A] to-[#0A0612] border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 inline-block mb-4">
            Official Cricket Championship Context Site
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6">
            RPL Season 9 <span className="text-gradient-amber">Cricket League</span>
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            High-octane T20 leather ball tournament. Complete your dedicated player profile and cricket questionnaire below.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="solid-card p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Format</span>
              <span className="font-display text-sm font-bold text-amber-400">T20 Leather Ball</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Selection</span>
              <span className="font-display text-sm font-bold text-amber-400">Draft & Auction</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Equipment</span>
              <span className="font-display text-sm font-bold text-amber-400">Full Cricket Gear</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Matches</span>
              <span className="font-display text-sm font-bold text-amber-400">Day & Night Stadium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Form or Ticket Pass */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        {submitted ? (
          <div className="solid-card-amber p-8 rounded-3xl border border-amber-500/40 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-white">
              Cricket Registration Complete!
            </h2>
            <p className="text-slate-200 text-sm">
              Your official Cricket Pass ID: <span className="font-mono text-amber-400 font-bold">{passId}</span>
            </p>

            <div className="solid-card p-6 rounded-2xl text-left space-y-3 bg-[#140E24] border border-amber-500/30">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Name</span>
                <span className="text-white font-bold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Role</span>
                <span className="text-amber-400 font-bold">{formData.role}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Batting Stance</span>
                <span className="text-white font-semibold">{formData.battingStance}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Bowling Style</span>
                <span className="text-white font-semibold">{formData.bowlingStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 text-xs font-bold uppercase">Center</span>
                <span className="text-white font-semibold">{formData.center}</span>
              </div>
            </div>

            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Join Official Cricket WhatsApp Group</span>
            </a>
          </div>
        ) : (
          <div className="solid-card-amber p-8 md:p-10 rounded-3xl border border-amber-500/40">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">
              Cricket League Player Questionnaire
            </h2>
            <p className="text-slate-200 text-sm text-center mb-8">
              Please answer the following cricket-specific questions accurately for draft evaluation.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  {...register('fullName')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    {...register('phone')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 22"
                    {...register('age')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Center / City *</label>
                  <select
                    {...register('center')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Surat">Surat</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="London">London (UK)</option>
                    <option value="USA">USA / Canada</option>
                    <option value="Other">Other Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Primary Cricket Role *</label>
                  <select
                    {...register('role')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Batter">Batter</option>
                    <option value="Fast Bowler">Fast Bowler</option>
                    <option value="Spin Bowler">Spin Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Batting Stance *</label>
                  <select
                    {...register('battingStance')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Right-Handed">Right-Handed</option>
                    <option value="Left-Handed">Left-Handed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Bowling Style *</label>
                  <select
                    {...register('bowlingStyle')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Right-Arm Fast">Right-Arm Fast / Medium</option>
                    <option value="Right-Arm Spin">Right-Arm Off/Leg Spin</option>
                    <option value="Left-Arm Fast">Left-Arm Fast / Medium</option>
                    <option value="Left-Arm Spin">Left-Arm Spin</option>
                    <option value="Does Not Bowl">Does Not Bowl</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Preferred Batting Order</label>
                  <select
                    {...register('battingOrder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Top Order (1-3)">Top Order (1-3)</option>
                    <option value="Middle Order (4-6)">Middle Order (4-6)</option>
                    <option value="Lower Order / Finisher">Lower Order / Finisher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Jersey Size</label>
                  <select
                    {...register('jerseySize')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Pre-formed Team Name (Optional)</label>
                <input
                  type="text"
                  placeholder="If registering along with a squad"
                  {...register('teamName')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base md:text-lg transition-all"
              >
                Submit Cricket Registration
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
