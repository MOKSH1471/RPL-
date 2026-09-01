import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { ArrowLeft, Target, CheckCircle2, QrCode, MessageCircle, Shield, Award } from 'lucide-react';

interface FootballLeagueSiteProps {
  onBackToHome: () => void;
}

export const FootballLeagueSite: React.FC<FootballLeagueSiteProps> = ({ onBackToHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState('');
  const [formData, setFormData] = useState<any>(null);

  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    const id = `FOOT9-${Math.floor(100000 + Math.random() * 900000)}`;
    setPassId(id);
    setFormData(data);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669'],
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0612] text-slate-100 relative selection:bg-emerald-500 selection:text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 solid-nav py-4 border-b border-emerald-500/20 bg-[#0A1412]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-4 py-2 rounded-full solid-card"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RPL Main Site</span>
          </button>

          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-extrabold text-lg text-white">
              Football League <span className="text-emerald-400">S9</span>
            </span>
          </div>
        </div>
      </header>

      {/* Football Dedicated Hero Banner */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-[#0E1A1A] via-[#091212] to-[#0A0612] border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 inline-block mb-4">
            Official Football Championship Context Site
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6">
            RPL Season 9 <span className="text-gradient-emerald">Football League</span>
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Fast-paced 7-a-side turf tournament. Complete your dedicated player profile and football questionnaire below.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="solid-card p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Match Format</span>
              <span className="font-display text-sm font-bold text-emerald-400">7-A-Side Turf</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Awards</span>
              <span className="font-display text-sm font-bold text-emerald-400">Golden Boot & Glove</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Footwear</span>
              <span className="font-display text-sm font-bold text-emerald-400">Turf Shoes Required</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Knockouts</span>
              <span className="font-display text-sm font-bold text-emerald-400">Group + Penalty Shootouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Form or Ticket Pass */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        {submitted ? (
          <div className="solid-card-emerald p-8 rounded-3xl border border-emerald-500/40 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-white">
              Football Registration Complete!
            </h2>
            <p className="text-slate-200 text-sm">
              Your official Football Pass ID: <span className="font-mono text-emerald-400 font-bold">{passId}</span>
            </p>

            <div className="solid-card p-6 rounded-2xl text-left space-y-3 bg-[#0E1A1A] border border-emerald-500/30">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Name</span>
                <span className="text-white font-bold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Position</span>
                <span className="text-emerald-400 font-bold">{formData.position}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Preferred Foot</span>
                <span className="text-white font-semibold">{formData.preferredFoot}</span>
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
              className="inline-flex items-center space-x-2 py-3.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Join Official Football WhatsApp Group</span>
            </a>
          </div>
        ) : (
          <div className="solid-card-emerald p-8 md:p-10 rounded-3xl border border-emerald-500/40">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">
              Football League Player Questionnaire
            </h2>
            <p className="text-slate-200 text-sm text-center mb-8">
              Please answer the following football-specific questions for position evaluation.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  {...register('fullName')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 21"
                    {...register('age')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Center / City *</label>
                  <select
                    {...register('center')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
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
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Primary Position *</label>
                  <select
                    {...register('position')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Striker / Forward">Striker / Forward</option>
                    <option value="Winger / Attacking Midfielder">Winger / Attacking Midfielder</option>
                    <option value="Central Midfielder">Central Midfielder</option>
                    <option value="Defender / Center Back">Defender / Center Back</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Preferred Foot *</label>
                  <select
                    {...register('preferredFoot')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Right Foot">Right Foot</option>
                    <option value="Left Foot">Left Foot</option>
                    <option value="Both Feet (Ambidextrous)">Both Feet (Ambidextrous)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Turf Experience Level</label>
                  <select
                    {...register('experience')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Casual / Beginner">Casual / Beginner</option>
                    <option value="Regular Turf Player">Regular Turf Player</option>
                    <option value="Competitive League Player">Competitive League Player</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Jersey Size</label>
                <select
                  {...register('jerseySize')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base md:text-lg transition-all"
              >
                Submit Football Registration
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
