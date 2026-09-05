import React, { useState, useEffect, useRef } from 'react';
import { RegistrationFormData } from '@/types';
import { printerAudio } from '@/lib/printerAudio';
import {
  Printer,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Download,
  RotateCcw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Scissors,
} from 'lucide-react';

import { downloadReceiptAsImage } from '@/lib/receiptImageGenerator';

export interface ReceiptPrinterProps {
  data: Partial<RegistrationFormData> & {
    fullName?: string;
    mobileNumber?: string;
    email?: string;
    centre?: string;
    tshirtSize?: string;
    selectedSports?: string[];
    league?: string;
    foodPreference?: string;
    accommodationRequired?: string;
    checkInDate?: string;
    checkOutDate?: string;
    customJerseyName?: string;
    preferredJerseyNumber?: string;
    countryCode?: string;
    payment_utr?: string;
    payment_receipt?: string;
    paymentReceiptUrl?: string;
    cardNo?: string;
  };
  registrationId?: string;
  autoPrint?: boolean;
  onTearComplete?: () => void;
  className?: string;
}

export const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({
  data,
  registrationId = 'RPL9-884920',
  autoPrint = true,
  onTearComplete,
  className = '',
}) => {
  // Mode is strictly smooth fluid per requirements
  const mode = 'smooth';
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const cutterFlashRef = useRef<HTMLDivElement>(null);

  // Check if payment photo / receipt is attached
  const hasPaymentProof = Boolean(
    data.payment_receipt ||
    data.paymentReceiptUrl ||
    (data as any).paymentReceipt ||
    (data.payment_utr && data.payment_utr.trim().length > 0)
  );

  const sportsList =
    data.selectedSports && data.selectedSports.length > 0
      ? data.selectedSports
      : [data.league || 'cricket'];

  const formatSportName = (s: string) => {
    switch (s) {
      case 'cricket':
        return 'Cricket Championship';
      case 'football':
        return 'Football Championship';
      case 'badminton':
        return 'Badminton Championship';
      case 'table-tennis':
        return 'Table Tennis';
      case 'pickleball':
        return 'Pickleball Open';
      case 'volleyball':
        return 'Volleyball / Throwball';
      case 'womens-sports':
      case 'womens':
        return "Women's Multi-Sport";
      default:
        return s;
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    printerAudio.setSoundEnabled(next);
  };

  // Trigger Smooth Fluid Print (2.5s duration)
  const triggerPrint = () => {
    if (isPrinting) return;

    const paper = paperRef.current;
    const flash = cutterFlashRef.current;
    if (!paper) return;

    // Reset classes & force reflow
    paper.classList.remove(
      'tearing',
      'retracted',
      'printed',
      'printing-classic',
      'printing-smooth',
      'vibrating'
    );
    if (flash) flash.classList.remove('active');
    void paper.offsetWidth;

    setIsPrinting(true);
    setIsPrinted(false);
    setIsTearing(false);

    const animDuration = 2500;
    printerAudio.playPrinterSound('smooth', animDuration);
    paper.classList.add('printing-smooth');

    setTimeout(() => {
      if (paperRef.current) {
        paperRef.current.classList.remove('printing-smooth');
        paperRef.current.classList.add('printed');
      }
      setIsPrinting(false);
      setIsPrinted(true);
    }, animDuration);
  };

  // Trigger Pointer-driven Tear Animation
  const triggerTear = () => {
    if (!isPrinted || isPrinting || isTearing) return;

    setIsTearing(true);
    printerAudio.playTearSound();

    if (cutterFlashRef.current) {
      cutterFlashRef.current.classList.add('active');
    }

    if (paperRef.current) {
      paperRef.current.classList.add('tearing');
    }

    setTimeout(() => {
      if (paperRef.current) {
        paperRef.current.classList.remove('tearing', 'printed');
        paperRef.current.classList.add('retracted');
      }
      if (cutterFlashRef.current) {
        cutterFlashRef.current.classList.remove('active');
      }
      setIsPrinted(false);
      setIsTearing(false);
      if (onTearComplete) onTearComplete();
    }, 550);
  };

  // Auto-print automatically on screen when mounted (synced with scroll into view)
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        triggerPrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopySummary = () => {
    const summary = `
RAJ PREMIER LEAGUE SEASON 9
Official Participant Pass
Registration ID: ${registrationId}
Player: ${data.fullName || 'Participant'}
Sports: ${sportsList.map(formatSportName).join(', ')}
Centre: ${data.centre || 'Mumbai'}
Stay: ${data.accommodationRequired === 'Yes' ? 'Dec 25-27' : 'Self-Arranged'}
Status: ${hasPaymentProof ? 'PAYMENT SUCCESSFUL' : 'PAYMENT DUE'}
    `.trim();

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadReceipt = () => {
    downloadReceiptAsImage({
      registrationId,
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      countryCode: data.countryCode,
      centre: data.centre,
      cardNo: data.cardNo,
      tshirtSize: data.tshirtSize,
      customJerseyName: data.customJerseyName,
      preferredJerseyNumber: data.preferredJerseyNumber,
      accommodationRequired: data.accommodationRequired,
      foodPreference: data.foodPreference,
      sportsList: sportsList.map(formatSportName),
      hasPaymentProof,
      paymentUtr: data.payment_utr,
    });
  };

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Centered Controls Bar ABOVE the Machine */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full border border-amber-200 shadow-sm z-40 max-w-full">
        {/* Re-Print / Print Button located ABOVE the machine */}
        <button
          type="button"
          disabled={isPrinting}
          onClick={triggerPrint}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPrinted ? <RotateCcw className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
          <span>{isPrinting ? 'Printing Pass...' : isPrinted ? 'Re-print Pass' : 'Print Pass'}</span>
        </button>

        <div className="w-px h-4 bg-slate-200" />

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Direct Receipt Image Download (.png) */}
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Download Receipt Image (.png)"
        >
          <Download className="w-4 h-4 text-amber-600" />
        </button>

        {/* Copy pass */}
        <button
          type="button"
          onClick={handleCopySummary}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Copy Pass Info"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main 3D Metallic Dispenser Stage */}
      <div className="rpl-printer-stage">
        <div className="rpl-machine-unit">
          {/* Top 3D Metallic Hood Bar */}
          <div className="rpl-machine-hood-top">
            <div className="rpl-hood-highlight" />
          </div>

          {/* Dark Slit Mouth where paper feeds out */}
          <div className="rpl-machine-slot-slit" />

          {/* Cutter Blade Flash Light Effect */}
          <div className="rpl-cutter-blade-flash" ref={cutterFlashRef} />

          {/* Bottom Metallic Lip Base */}
          <div className="rpl-machine-hood-bottom">
            <div className="rpl-hood-shadow" />
          </div>

          {/* Paper Viewport Container */}
          <div className="rpl-paper-viewport">
            {/* Animated Thermal Paper - Interactive Pointer Tear on Click/Drag */}
            <div
              className={`rpl-receipt-paper-wrapper group ${isPrinted ? 'printed cursor-grab active:cursor-grabbing hover:brightness-[0.99]' : 'retracted'}`}
              ref={paperRef}
              onClick={() => {
                if (isPrinted && !isPrinting && !isTearing) {
                  triggerTear();
                }
              }}
              title={isPrinted ? 'Click with pointer to tear off receipt!' : undefined}
            >
              {/* Pointer Tear Hint Badge */}
              {isPrinted && !isPrinting && !isTearing && (
                <div className="absolute top-2 right-2.5 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 text-[8px] font-mono shadow-xs backdrop-blur-xs transition-transform group-hover:scale-105 pointer-events-none">
                  <Scissors className="w-2.5 h-2.5 text-amber-400" />
                  <span>Click to tear</span>
                </div>
              )}

              {/* Receipt Content */}
              <div className="rpl-receipt-content">
                {/* Header & RPL Emblem */}
                <div className="flex items-start justify-between gap-2 border-b border-dashed border-neutral-400/80 pb-2.5 mb-2">
                  <div>
                    <div className="text-[11px] font-extrabold tracking-wider text-slate-950 uppercase">
                      RAJ PREMIER LEAGUE
                    </div>
                    <div className="text-[9px] font-bold text-amber-800 tracking-wider">
                      SEASON 9 • TOURNAMENT PASS
                    </div>
                    <div className="text-[8px] text-neutral-500 font-mono mt-0.5">
                      {registrationId}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-center p-1 shrink-0 shadow-xs">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                </div>

                {/* DYNAMIC PAYMENT STATUS BADGE */}
                {hasPaymentProof ? (
                  <div className="my-2 text-center bg-emerald-50 border-2 border-emerald-500/80 p-2 rounded-lg shadow-xs">
                    <div className="text-xs font-black tracking-widest text-emerald-800 uppercase flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PAYMENT SUCCESSFUL</span>
                    </div>
                    <div className="text-[8px] text-emerald-700 font-semibold tracking-wider uppercase mt-0.5">
                      VERIFIED PASS • 25-27 DEC 2026 | RESEARCH CENTRE
                    </div>
                  </div>
                ) : (
                  <div className="my-2 text-center bg-amber-50 border-2 border-amber-500/80 p-2 rounded-lg shadow-xs">
                    <div className="text-xs font-black tracking-widest text-amber-800 uppercase flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>PAYMENT DUE</span>
                    </div>
                    <div className="text-[8px] text-amber-700 font-semibold tracking-wider uppercase mt-0.5">
                      ATTACH PROOF AT DESK • RESEARCH CENTRE
                    </div>
                  </div>
                )}

                <div className="rpl-receipt-divider" />

                {/* Participant Details Rows */}
                <div className="space-y-1 text-[9.5px]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">PLAYER:</span>
                    <span className="font-extrabold text-slate-950 text-right max-w-[190px] truncate">
                      {data.fullName || 'RPL Athlete'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">CONTACT:</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {data.countryCode || '+91'} {data.mobileNumber || '9876543210'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">CENTRE:</span>
                    <span className="font-bold text-slate-900">
                      {data.centre || 'Mumbai'}
                      {data.cardNo ? ` (${data.cardNo})` : ''}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">JERSEY:</span>
                    <span className="font-mono font-bold text-amber-800">
                      SIZE {data.tshirtSize || 'L'}
                      {data.customJerseyName ? ` • ${data.customJerseyName}` : ''}
                      {data.preferredJerseyNumber ? ` #${data.preferredJerseyNumber}` : ''}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">HOSPITALITY:</span>
                    <span className="font-medium text-slate-800 text-[8.5px]">
                      {data.accommodationRequired === 'Yes' ? 'Stay: Dec 25-27' : 'Self-Arranged'} • {data.foodPreference || 'Regular'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-500 font-bold uppercase">PROOF:</span>
                    <span className={`font-mono font-bold text-[8.5px] truncate max-w-[190px] ${hasPaymentProof ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {data.payment_utr && (data.payment_receipt || data.paymentReceiptUrl)
                        ? `UTR: ${data.payment_utr} (SS ATTACHED)`
                        : data.payment_utr
                        ? `UTR: ${data.payment_utr}`
                        : (data.payment_receipt || data.paymentReceiptUrl)
                        ? 'PAYMENT SCREENSHOT ATTACHED'
                        : 'PAYMENT DUE (NO PROOF)'}
                    </span>
                  </div>
                </div>

                <div className="rpl-receipt-divider" />

                {/* Registered Sports */}
                <div className="mb-2">
                  <div className="text-[8.5px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                    CHAMPIONSHIP ARENAS (1X INCLUDED)
                  </div>
                  <div className="space-y-1">
                    {sportsList.map((sport, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px]">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <span>•</span> {formatSportName(sport)}
                        </span>
                        <span className="font-mono font-semibold text-emerald-700">INCLUDED</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rpl-receipt-divider-solid" />

                {/* Status / Total breakdown */}
                <div className="space-y-0.5 text-[9px] mb-2">
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>Tournament Registration</span>
                    <span className="font-mono">{hasPaymentProof ? 'VERIFIED' : 'PENDING PROOF'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>Player Kit & Pass</span>
                    <span className="font-mono">INCLUDED</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-black text-[11px] pt-1 border-t border-neutral-400 mt-1">
                    <span>TOTAL STATUS</span>
                    <span className={`font-mono ${hasPaymentProof ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {hasPaymentProof ? 'PAYMENT SUCCESSFUL' : 'PAYMENT DUE'}
                    </span>
                  </div>
                </div>

                {/* Authentic Barcode Graphic & Number */}
                <div className="rpl-barcode-graphic">
                  <div className="rpl-barcode-lines" />
                  <div className="text-[8px] font-mono tracking-widest text-neutral-600 font-bold">
                    {registrationId || 'TXN-RPL9-884920'}
                  </div>
                </div>

                {/* Footer Greeting */}
                <div className="text-center mt-3 pt-2 border-t border-dashed border-neutral-300">
                  <div className="text-[8px] font-black text-slate-900 tracking-wider uppercase">
                    ★ PLAY WITH PASSION • WIN WITH GRACE ★
                  </div>
                  <div className="text-[7.5px] text-neutral-500 uppercase tracking-widest mt-0.5 font-semibold">
                    RPL S9 ORGANIZING COMMITTEE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Pointer Tear Helper Text */}
        <p className="text-[11px] text-slate-500 font-medium text-center mt-3">
          {isPrinting
            ? 'Rolling out your official RPL Season 9 pass...'
            : isPrinted
            ? 'Official pass dispensed. Click the receipt with your pointer to tear it off!'
            : 'Pass ready in dispenser.'}
        </p>
      </div>
    </div>
  );
};

export default ReceiptPrinter;
