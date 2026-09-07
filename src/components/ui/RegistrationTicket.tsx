import React from 'react';
import { RegistrationFormData } from '@/types';
import { CheckCircle2, MessageCircle, Mail } from 'lucide-react';
import { ReceiptPrinter } from './ReceiptPrinter';

interface RegistrationSuccessProps {
  data: RegistrationFormData;
  registrationId: string;
  onReset: () => void;
  onPrintingChange?: (isPrinting: boolean) => void;
}

export const RegistrationTicket: React.FC<RegistrationSuccessProps> = ({
  data,
  registrationId,
  onReset,
  onPrintingChange,
}) => {
  const receiptContainerRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(true);

  const handlePrintingState = (printing: boolean) => {
    setIsPrinting(printing);
    if (onPrintingChange) onPrintingChange(printing);
  };

  React.useEffect(() => {
    if (onPrintingChange) onPrintingChange(true);

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 relative">
      {/* Full-Screen Cinema Blur Backdrop - covers entire screen at z-40 */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md transition-all duration-500 pointer-events-none ${
          isPrinting ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* 3D THERMAL RECEIPT DISPENSER - Sits at z-50 in FRONT of blur overlay, 100% UNBLURRED */}
      <div
        ref={receiptContainerRef}
        className={`rounded-3xl p-5 sm:p-7 border-2 border-emerald-300 bg-white shadow-xl scroll-mt-24 relative transition-all duration-500 ${
          isPrinting ? 'z-50 ring-4 ring-amber-400/80 shadow-2xl scale-[1.01]' : 'z-10'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center mb-4">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs mb-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ENTRY RECORDED • OFFICIAL PASS DISPENSER</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            Registration Confirmed!
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
            Thank you, <strong className="text-slate-950">{data.fullName}</strong>. Your official tournament pass is rolling out below:
          </p>
        </div>

        <ReceiptPrinter
          data={data}
          registrationId={registrationId}
          autoPrint={true}
          onPrintingChange={handlePrintingState}
        />
      </div>

      {/* Bottom Information & Action Buttons - Sits behind z-40 while printing */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-md space-y-4 relative transition-all duration-500 ${
          isPrinting ? 'z-30 opacity-40' : 'z-10'
        }`}
      >
        {/* Email Verification Callout Note */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
          <Mail className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
          <p className="leading-relaxed">
            A pre-filled Gmail compose window was launched to email your registration details to{' '}
            <strong className="text-amber-950 font-bold">rpl@rajpremierleague.com</strong>. Please click "Send" in Gmail if prompted.
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
