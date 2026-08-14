import React from 'react';
import { RegistrationFormData } from '@/types';
import { CheckCircle2, MessageCircle, User, Mail, Sparkles, ArrowLeft, Trophy } from 'lucide-react';

interface RegistrationSuccessProps {
  data: RegistrationFormData;
  registrationId: string;
  onReset: () => void;
}

export const RegistrationTicket: React.FC<RegistrationSuccessProps> = ({
  data,
  onReset,
}) => {
  const sportsList =
    data.selectedSports && data.selectedSports.length > 0
      ? data.selectedSports
      : [data.league || 'cricket'];

  const formatSportName = (sport: string) => {
    switch (sport) {
      case 'cricket':
        return 'Cricket';
      case 'football':
        return 'Football';
      case 'badminton':
        return 'Badminton';
      case 'table-tennis':
        return 'Table Tennis';
      case 'pickleball':
        return 'Pickleball';
      case 'volleyball':
        return 'Volleyball / Throwball';
      case 'womens-sports':
      case 'womens':
        return "Women's League";
      default:
        return sport;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner Confirmation */}
      <div className="p-6 sm:p-8 rounded-3xl text-center border-2 border-emerald-300 bg-emerald-50/90 shadow-lg">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 block mb-1">
          ENTRY SUBMITTED
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Registration Confirmed!
        </h2>
        <p className="text-slate-700 text-sm sm:text-base font-medium max-w-lg mx-auto">
          Thank you, <strong className="text-slate-950">{data.fullName}</strong>. Your entry for{' '}
          <strong className="text-slate-950">Raj Premier League Season 9</strong> has been successfully recorded.
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl p-6 sm:p-8 border border-amber-200 bg-white shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                Participant Summary
              </h3>
              <p className="text-slate-500 text-xs font-semibold">Vitraag Vigyaan RPL S9</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {sportsList.map((sport) => (
              <span
                key={sport}
                className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-300 text-amber-900"
              >
                {formatSportName(sport)}
              </span>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Full Name
            </span>
            <span className="font-bold text-slate-900 text-base">{data.fullName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Contact Number
            </span>
            <span className="font-bold text-slate-900 text-base font-mono">
              {data.countryCode || '+91'} {data.mobileNumber}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Centre
            </span>
            <span className="font-bold text-slate-900 text-base">{data.centre}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Jersey Size
            </span>
            <span className="font-bold text-amber-700 text-base font-mono">{data.tshirtSize}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Email Address
            </span>
            <span className="font-semibold text-slate-800 text-sm truncate block">{data.email}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Food Preference
            </span>
            <span className="font-bold text-slate-900 text-base">{data.foodPreference}</span>
          </div>
        </div>

        {/* Email Verification Callout Note */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
          <Mail className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
          <p className="leading-relaxed">
            A pre-filled Gmail compose window was launched to email your registration details to{' '}
            <strong className="text-amber-950 font-bold">rpl@vitraagvigyaan.org</strong>. Please click "Send" in Gmail if prompted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href="https://chat.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md active:scale-95 min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Join Official WhatsApp Group</span>
          </a>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all border border-slate-300 min-h-[48px] cursor-pointer"
          >
            Register Another Participant
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTicket;
