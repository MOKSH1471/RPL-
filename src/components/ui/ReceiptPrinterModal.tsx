import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { ReceiptPrinter, ReceiptPrinterProps } from './ReceiptPrinter';

interface ReceiptPrinterModalProps extends ReceiptPrinterProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ReceiptPrinterModal: React.FC<ReceiptPrinterModalProps> = ({
  isOpen,
  onClose,
  title = 'RPL Season 9 Official Receipt & Pass',
  ...printerProps
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-3xl p-5 sm:p-7 border border-amber-200 shadow-2xl my-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Printer Stage */}
          <div className="py-2">
            <ReceiptPrinter {...printerProps} autoPrint={true} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReceiptPrinterModal;
