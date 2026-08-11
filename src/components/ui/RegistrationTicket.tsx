import React from 'react';
import { RegistrationFormData } from '@/types';
import { CheckCircle2, QrCode, MessageCircle, User } from 'lucide-react';

interface RegistrationTicketProps {
  data: RegistrationFormData;
  registrationId: string;
  onReset: () => void;
}

export const RegistrationTicket: React.FC<RegistrationTicketProps> = ({
  data,
  registrationId,
  onReset,
}) => {
  const getLeagueTheme = () => {
    switch (data.league) {
      case 'cricket':
        return {
          title: 'Cricket League',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          cardBg: 'bg-[#FFFBEB] border-amber-300',
          textGradient: 'from-amber-700 via-orange-600 to-amber-600',
          iconColor: 'text-amber-700',
        };
      case 'football':
        return {
          title: 'Football League',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          cardBg: 'bg-[#ECFDF5] border-emerald-300',
          textGradient: 'from-emerald-700 via-teal-600 to-emerald-600',
          iconColor: 'text-emerald-700',
        };
      case 'womens':
        return {
          title: "Women's League",
          badge: 'bg-pink-100 text-pink-800 border-pink-300',
          cardBg: 'bg-[#FDF2F8] border-pink-300',
          textGradient: 'from-pink-700 via-rose-600 to-pink-600',
          iconColor: 'text-pink-700',
        };
    }
  };

  const theme = getLeagueTheme();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner Message */}
      <div className="p-6 rounded-2xl text-center border border-emerald-300 bg-emerald-50 shadow-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          Registration Confirmed!
        </h3>
        <p className="text-slate-700 text-sm md:text-base font-medium">
          You are officially registered for <span className="font-bold text-slate-900">Raj Premier League S9</span>. Gmail compose has been launched to send your details.
        </p>
      </div>

      {/* The Digital Sports Pass Ticket */}
      <div className={`relative rounded-3xl overflow-hidden p-6 md:p-8 border ${theme.cardBg} shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-display text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border bg-white text-slate-800 border-slate-300 shadow-sm">
                Vitraag Vigyaan
              </span>
              <span className={`font-display text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border ${theme.badge}`}>
                {theme.title}
              </span>
            </div>
            <h2 className={`font-display text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
              Raj Premier League S9
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-600 block uppercase font-bold tracking-wider">Pass ID</span>
            <span className="font-mono text-lg font-extrabold text-amber-700">{registrationId}</span>
          </div>
        </div>

        {/* Ticket Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-4">
              {data.photoDataUrl ? (
                <img src={data.photoDataUrl} alt={data.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-300 shadow-sm shrink-0">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">Participant Name</span>
                <span className="text-xl md:text-2xl font-bold text-slate-900">{data.fullName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">Centre</span>
                <span className="text-base font-bold text-slate-900">{data.centre}</span>
              </div>
              <div>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">Date of Birth</span>
                <span className="text-base font-bold text-slate-900">{data.dateOfBirth}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">
                  {data.league === 'cricket' ? 'Role' : data.league === 'football' ? 'Position' : 'Category'}
                </span>
                <span className={`text-base font-extrabold ${theme.iconColor}`}>
                  {data.cricketRole || data.footballPosition || data.womensCategory}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">Mobile Number</span>
                <span className="text-base font-bold text-slate-900">{data.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* QR Code Entry Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-300 shadow-sm text-center">
            <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center mb-2">
              <QrCode className="w-24 h-24 text-slate-900" />
            </div>
            <span className="text-[10px] text-slate-600 uppercase font-mono font-bold tracking-widest">
              Scan at Entry
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200">
          <a
            href="https://chat.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Join Official WhatsApp Group</span>
          </a>

          <button
            onClick={onReset}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold transition-all border border-slate-300 shadow-sm"
          >
            Register Another Participant
          </button>
        </div>
      </div>
    </div>
  );
};
