import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { ArrowLeft, Heart, CheckCircle2, QrCode, MessageCircle, Shield, Award } from 'lucide-react';

interface WomensLeagueSiteProps {
  onBackToHome: () => void;
}

export const WomensLeagueSite: React.FC<WomensLeagueSiteProps> = ({ onBackToHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState('');
  const [formData, setFormData] = useState<any>(null);

  const { register, handleSubmit, watch } = useForm();
  const selectedSport = watch('sportCategory', "Women's Cricket");

  const onSubmit = (data: any) => {
    const id = `WOM9-${Math.floor(100000 + Math.random() * 900000)}`;
    setPassId(id);
    setFormData(data);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#F472B6', '#DB2777'],
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0612] text-slate-100 relative selection:bg-pink-500 selection:text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 solid-nav py-4 border-b border-pink-500/20 bg-[#160A1A]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors px-4 py-2 rounded-full solid-card"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RPL Main Site</span>
          </button>

          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="font-display font-extrabold text-lg text-white">
              Women's League <span className="text-pink-400">S9</span>
            </span>
          </div>
        </div>
      </header>

      {/* Women's Dedicated Hero Banner */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-[#1F0E20] via-[#140816] to-[#0A0612] border-b border-pink-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300 inline-block mb-4">
            Official Women's Championship Context Site
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6">
            RPL Season 9 <span className="text-gradient-magenta">Women's League</span>
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Empowerment on the field. Multi-sport championship featuring Women's Cricket, Women's Football, and Throwball.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="solid-card p-4 rounded-xl border border-pink-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Sports Offered</span>
              <span className="font-display text-sm font-bold text-pink-400">Cricket, Football, Throwball</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-pink-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Divisions</span>
              <span className="font-display text-sm font-bold text-pink-400">Youth & Senior Brackets</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-pink-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Team Format</span>
              <span className="font-display text-sm font-bold text-pink-400">Individual & Group Entry</span>
            </div>
            <div className="solid-card p-4 rounded-xl border border-pink-500/30">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Trophy</span>
              <span className="font-display text-sm font-bold text-pink-400">Championship Shield</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Form or Ticket Pass */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        {submitted ? (
          <div className="solid-card-magenta p-8 rounded-3xl border border-pink-500/40 text-center space-y-6">
            <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto border border-pink-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-white">
              Women's Registration Complete!
            </h2>
            <p className="text-slate-200 text-sm">
              Your official Women's League Pass ID: <span className="font-mono text-pink-400 font-bold">{passId}</span>
            </p>

            <div className="solid-card p-6 rounded-2xl text-left space-y-3 bg-[#1A0E1F] border border-pink-500/30">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Name</span>
                <span className="text-white font-bold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Sport</span>
                <span className="text-pink-400 font-bold">{formData.sportCategory}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 text-xs font-bold uppercase">Specific Role</span>
                <span className="text-white font-semibold">{formData.role}</span>
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
              className="inline-flex items-center space-x-2 py-3.5 px-8 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-extrabold text-sm transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Join Official Women's League WhatsApp Group</span>
            </a>
          </div>
        ) : (
          <div className="solid-card-magenta p-8 md:p-10 rounded-3xl border border-pink-500/40">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">
              Women's League Player Questionnaire
            </h2>
            <p className="text-slate-200 text-sm text-center mb-8">
              Please select your sport category and fill out your specific player details.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  {...register('fullName')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    {...register('age')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Center / City *</label>
                  <select
                    {...register('center')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-pink-400"
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
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Primary Sport Category *</label>
                  <select
                    {...register('sportCategory')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-pink-400"
                  >
                    <option value="Women's Cricket">Women's Cricket</option>
                    <option value="Women's Football">Women's Football</option>
                    <option value="Throwball">Throwball</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Specific Role / Position in {selectedSport} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batter / Forward / Court Attacker"
                  {...register('role')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Jersey Size</label>
                <select
                  {...register('jerseySize')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-pink-400"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-400 text-slate-950 font-extrabold text-base md:text-lg transition-all"
              >
                Submit Women's League Registration
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
