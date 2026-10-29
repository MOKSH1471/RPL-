import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

interface TeamOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamOwnerModal: React.FC<TeamOwnerModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click handler */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg bg-white rounded-3xl border-2 border-emerald-300/80 shadow-2xl overflow-hidden my-auto p-6 sm:p-8 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/15"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                <span>🤝</span>
                <span>Franchise &amp; Partner Opportunities</span>
              </span>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-6">
              Partner with RPL to showcase your brand or lead an official tournament squad. For team ownership, title sponsorships, and franchise inquiries, connect with our organizing committee directly.
            </p>
          </div>

          <a
            href="https://wa.me/919321001499?text=Hello%20RPL%20Team%2C%20I%20am%20interested%20in%20Team%20Ownership%20and%20Sponsorship"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-3 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs xs:text-sm sm:text-base shadow-md flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all active:scale-95 min-h-[48px] whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
            <span className="whitespace-nowrap">Chat on WhatsApp: +91 9321001499</span>
          </a>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeamOwnerModal;

