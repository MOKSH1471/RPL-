import React from 'react';
import { RegistrationFormData } from '@/types';
import { CheckCircle2, MessageCircle, Trophy, AlertCircle } from 'lucide-react';
import { ReceiptPrinter } from './ReceiptPrinter';

interface RegistrationSuccessProps {
  data: RegistrationFormData;
  registrationId: string;
  onReset: () => void;
}

export const RegistrationTicket: React.FC<RegistrationSuccessProps> = ({
  data,
  registrationId,
  onReset,
}) => {
  const receiptContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scrollToDispenser = () => {
      if (receiptContainerRef.current) {
        const rect = receiptContainerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Scroll so the dispenser is positioned comfortably right in front of user
        const targetY = scrollTop + rect.top - 85;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    };

    scrollToDispenser();
    const timer = setTimeout(scrollToDispenser, 120);
    return () => clearTimeout(timer);
  }, []);

  const sportsList =
    data.selectedSports && data.selectedSports.length > 0
      ? data.selectedSports
      : [data.league || 'cricket'];
  const isSpectator = data.registrationType === 'spectator' || sportsList.includes('spectator');
  const specDatesList: string[] = Array.isArray((data as any).spectatorDates) && (data as any).spectatorDates.length > 0
    ? (data as any).spectatorDates
    : Array.isArray((data as any).spectatorDays) && (data as any).spectatorDays.length > 0
      ? (data as any).spectatorDays
      : ((data as any).checkInDate && (data as any).checkOutDate
          ? ((data as any).checkInDate === (data as any).checkOutDate ? [(data as any).checkInDate] : [(data as any).checkInDate, (data as any).checkOutDate])
          : ['2026-12-25']);

  const specDayCount = Math.max(1, specDatesList.length);
  const hasStay = data.accommodationRequired === 'Yes' || (data as any).spectatorOption === 'with-stay';
  const isSpectatorAll3Days = isSpectator && (hasStay || specDayCount >= 3);

  const formatDatesPretty = (dates: string[]) => {
    if (!dates || dates.length === 0) return 'Dec 25-27';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = dates.map(d => {
      const parts = String(d).trim().split('-');
      if (parts.length === 3) {
        return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
      }
      return d;
    });
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;
    return formatted.join(', ');
  };

  const formatSportName = (sport: string) => {
    switch (sport) {
      case 'cricket':
        return 'Underarm Turf Cricket';
      case 'football':
        return 'Turf Football';
      case 'badminton':
        return 'Badminton';
      case 'table-tennis':
        return 'Table Tennis';
      case 'carrom':
        return 'Carrom League';
      case 'pickleball':
        return 'Pickleball';
      case 'volleyball':
        return 'Volleyball / Throwball';
      case 'womens-sports':
      case 'womens':
        return "Women's League";
      case 'kaccha-pakka':
        return 'Kaccha Pakka Cricket League';
      case 'spectator':
        return hasStay
          ? 'Spectator Pass (With Stay)'
          : `Spectator Pass (${specDayCount} ${specDayCount === 1 ? 'Day' : 'Days'} • ${formatDatesPretty(specDatesList)})`;
      default:
        return sport;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* 3D THERMAL RECEIPT DISPENSER - HERO CENTERPIECE AT TOP */}
      <div
        ref={receiptContainerRef}
        className="rounded-3xl p-5 sm:p-7 border-2 border-emerald-300 bg-white shadow-xl scroll-mt-24"
      >
        <div className="flex flex-col items-center justify-center text-center mb-4">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs mb-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ENTRY RECORDED • OFFICIAL PASS DISPENSER</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            Registration Saved!
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
            Thank you, <strong className="text-slate-950">{data.fullName}</strong>. Your official tournament pass is rolling out below:
          </p>
        </div>

        <ReceiptPrinter
          data={data}
          registrationId={registrationId}
          autoPrint={true}
        />
      </div>

      {/* PARTICIPANT DETAILS SUMMARY CARD */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                Participant Details
              </h3>
              <p className="text-slate-500 text-xs font-semibold">Raj Premier League Season 9</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              {data.registrationType === 'spectator' ? 'Spectator Name' : 'Player Name'}
            </span>
            <span className="font-extrabold text-slate-900 text-base">{data.fullName}</span>
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
              {data.registrationType === 'spectator' ? 'Tournament T-Shirt' : 'Jersey Size'}
            </span>
            <span className="font-bold text-amber-700 text-base font-mono">
              {data.registrationType === 'spectator' ? (
                (data.spectatorTshirt === 'Yes' || data.extraTshirt === 'Yes')
                  ? `Purchased (Size ${data.tshirtSize || 'L'})`
                  : 'Not Ordered'
              ) : (
                <>
                  {data.tshirtSize}
                  {data.extraTshirt === 'Yes' && ' (+1 Extra)'}
                </>
              )}
            </span>
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

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              Accommodation & Stay
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {hasStay ? (
                <span>RPL Stay ({data.checkInDate || '2026-12-25'} → {data.checkOutDate || '2026-12-27'})</span>
              ) : (
                <span>
                  {isSpectator
                    ? `Without Stay • ${specDayCount} ${specDayCount === 1 ? 'Day Pass' : 'Days Pass'} (${formatDatesPretty(specDatesList)})`
                    : 'Self-Arranged'} {data.stayingRoomNumber ? `• ${data.stayingRoomNumber}` : ''}
                </span>
              )}
            </span>
          </div>

          {data.nostalgiaSport && data.nostalgiaSport !== 'None' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block mb-0.5">
                {Array.isArray(data.nostalgiaSport) && data.nostalgiaSport.length > 1 ? '90’s Nostalgia Games' : '90’s Nostalgia Game'}
              </span>
              <span className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <span>🕹️</span>
                <span>{Array.isArray(data.nostalgiaSport) ? data.nostalgiaSport.join(', ') : data.nostalgiaSport}</span>
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block mb-0.5">
                  {isSpectator
                    ? `Official Spectator Pass (${hasStay ? 'With Stay' : `${specDayCount} ${specDayCount === 1 ? 'Day Pass' : 'Days Pass'}`})`
                    : `Tournament Pass (${sportsList.length} ${sportsList.length === 1 ? 'Sport' : 'Sports'})`}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">
                  {isSpectator
                    ? (hasStay
                      ? 'Full Meals, Night Snacks & 90’s Nostalgia Games Included'
                      : (isSpectatorAll3Days
                        ? 'Night Snacks & 90’s Nostalgia Games Included (Daytime meals not included)'
                        : `Night Snacks Included for ${formatDatesPretty(specDatesList)} (Daytime meals not included)`))
                    : 'All selected sports included in event pass'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-amber-900 text-lg sm:text-xl font-display">
                  ₹{(data.totalAmount || (isSpectator ? (hasStay ? 2700 : (specDayCount * 400)) : (data.existingRplFamily === 'Yes' ? 2700 : 3000))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Information & Action Buttons */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-md space-y-4 mb-4 sm:mb-6">
            {/* Official Registration Confirmation Note */}
            <div className="p-4 rounded-2xl flex flex-col space-y-2.5 text-xs bg-emerald-50/80 border border-emerald-200 text-emerald-900">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  Your tournament entry has been successfully recorded in the official database. Join the WhatsApp group below to stay updated on schedules, match fixtures, and tournament kit distribution!
                </p>
              </div>
              <div className="pt-2 border-t border-emerald-200/70 flex items-center space-x-2 text-[11px] font-bold text-amber-900">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Tournament Policy: No refund in case of no show or cancellation.</span>
              </div>
            </div>

            {/* Action Buttons: Equal Size Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 items-stretch">
              <a
                href="https://chat.whatsapp.com/BsJ9WZGzpyaKYEphAOwtPq?s=sw&p=a&mlu=4&ilr=4&iam=0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full min-h-[56px] py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center text-center space-x-2"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Join Official WhatsApp Group</span>
              </a>

              <button
                type="button"
                onClick={onReset}
                className="w-full h-full min-h-[56px] py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all border border-slate-300 flex items-center justify-center text-center space-x-2 cursor-pointer"
              >
                <span>Register Another Participant</span>
              </button>
            </div>
      </div>
    </div>
  );
};

export default RegistrationTicket;
