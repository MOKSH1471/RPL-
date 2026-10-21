import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { lookupMumukshu } from '@/lib/api';
import { ReceiptPrinter } from './ReceiptPrinter';

interface UnregisteredPlayerData {
  mobile: string;
  fullName?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  centre?: string;
  cardNo?: string;
}

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMobile?: string;
  onRegisterNewPlayer?: (data: UnregisteredPlayerData) => void;
}

export function CheckStatusModal({
  isOpen,
  onClose,
  initialMobile = '',
  onRegisterNewPlayer,
}: CheckStatusModalProps) {
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [matchedRecord, setMatchedRecord] = useState<any | null>(null);
  const [unregisteredData, setUnregisteredData] = useState<UnregisteredPlayerData | null>(null);
  const [serverWakingHint, setServerWakingHint] = useState(false);

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setTimeout(() => setServerWakingHint(true), 2500);
    } else {
      setServerWakingHint(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!isOpen) {
      setSearchError(null);
      setMatchedRecord(null);
      setUnregisteredData(null);
      return;
    }
    if (initialMobile) {
      setMobile(initialMobile);
      handleSearchMobile(initialMobile);
    }
  }, [initialMobile, isOpen]);

  const handleSearchMobile = async (queryMobile: string) => {
    const cleanDigits = queryMobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      setUnregisteredData(null);
      return;
    }

    setLoading(true);
    setSearchError(null);
    setMatchedRecord(null);
    setUnregisteredData(null);

    try {
      const res = await lookupMumukshu(cleanDigits);
      if (res.found && res.isExistingRegistration && res.registration) {
        setMatchedRecord(res.registration);
        setUnregisteredData(null);
      } else {
        // Player not registered for RPL Season 9
        const details: UnregisteredPlayerData = {
          mobile: cleanDigits,
          fullName: res.data?.fullName,
          email: res.data?.email,
          gender: res.data?.gender,
          dateOfBirth: res.data?.dateOfBirth,
          centre: res.data?.centre,
          cardNo: res.data?.cardNo,
        };
        setUnregisteredData(details);
        setSearchError('No RPL Season 9 registration found with this mobile number. Please register as a new player.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search player records.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isApproved =
    matchedRecord &&
    ((matchedRecord.paymentStatus || '').toLowerCase() === 'approved' ||
      (matchedRecord.payment_status || '').toLowerCase() === 'approved');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Gradient */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center space-x-1.5">
                  <span>Find &amp; Check Tournament Pass</span>
                </h3>
                <p className="text-[11px] text-amber-200/80">Enter your 10-digit registered mobile number</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchMobile(mobile);
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number..."
                  className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-hidden text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Pass</span>
                  </>
                )}
              </button>
            </form>

            {/* Server Waking Indicator (Render Free Tier Cold-Start) */}
            {serverWakingHint && loading && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs flex items-center justify-center space-x-2 animate-in fade-in duration-300">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                <span className="font-medium">Connecting to secure cloud server... (waking up, please hold on ~15s)</span>
              </div>
            )}

            {/* Error Message */}
            {searchError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Result Display */}
            {matchedRecord && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Status Card Banner */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isApproved
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-100/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Player Record Found
                    </p>
                    <h4 className="font-black text-base text-slate-900">{matchedRecord.fullName}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Sports: {(matchedRecord.generalDetails?.selectedSports || ['Cricket']).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    {isApproved ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED &amp; APPROVED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>PAYMENT INCOMPLETE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Case 1: Incomplete / Unpaid -> Prompt to Register & Pay */}
                {!isApproved && (
                  <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/90 text-center space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-base">Payment Not Completed</h4>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        No confirmed tournament pass exists for this mobile number because payment was not completed during registration.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onRegisterNewPlayer) {
                          onRegisterNewPlayer({
                            mobile: matchedRecord.mobile.replace(/\D/g, '').slice(-10),
                            fullName: matchedRecord.fullName,
                            email: matchedRecord.email,
                            gender: matchedRecord.generalDetails?.gender,
                            dateOfBirth: matchedRecord.generalDetails?.dateOfBirth,
                            centre: matchedRecord.generalDetails?.centre,
                            cardNo: matchedRecord.generalDetails?.cardNo,
                          });
                        } else {
                          window.location.hash = '/register';
                        }
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-100" />
                      <span>Complete Registration &amp; Pay Online</span>
                    </button>
                  </div>
                )}

                {/* Case 2: Approved Pass -> Render Full Pass */}
                {isApproved && (
                  <div className="mt-4 pt-2 border-t border-slate-100">
                    <div className="text-center mb-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Official Player Pass Available Below</span>
                      </span>
                    </div>

                    <ReceiptPrinter
                      registrationId={matchedRecord.id}
                      data={{
                        ...(matchedRecord.generalDetails || matchedRecord.general_details || {}),
                        fullName: matchedRecord.fullName,
                        mobileNumber: matchedRecord.mobile,
                        email: matchedRecord.email,
                        centre: matchedRecord.generalDetails?.centre || 'Mumbai',
                        tshirtSize: matchedRecord.generalDetails?.tshirtSize,
                        extraTshirt: matchedRecord.generalDetails?.extraTshirt,
                        spectatorTshirt: matchedRecord.generalDetails?.spectatorTshirt,
                        spectatorOption: matchedRecord.generalDetails?.spectatorOption,
                        spectatorDates: matchedRecord.generalDetails?.spectatorDates,
                        spectatorDays: matchedRecord.generalDetails?.spectatorDays,
                        registrationType: matchedRecord.generalDetails?.registrationType || (matchedRecord.selectedSports?.includes('spectator') ? 'spectator' : 'player'),
                        customJerseyName: matchedRecord.generalDetails?.customJerseyName,
                        preferredJerseyNumber: matchedRecord.generalDetails?.preferredJerseyNumber,
                        accommodationRequired: matchedRecord.generalDetails?.accommodationRequired,
                        stayingRoomNumber: matchedRecord.generalDetails?.stayingRoomNumber,
                        foodPreference: matchedRecord.generalDetails?.foodPreference,
                        selectedSports: matchedRecord.generalDetails?.selectedSports || matchedRecord.selectedSports || ['cricket'],
                        checkInDate: matchedRecord.checkInDate || matchedRecord.check_in_date || matchedRecord.generalDetails?.checkInDate,
                        checkOutDate: matchedRecord.checkOutDate || matchedRecord.check_out_date || matchedRecord.generalDetails?.checkOutDate,
                        cardNo: matchedRecord.cardNo || matchedRecord.generalDetails?.cardNo,
                        paymentUtr: matchedRecord.payment_utr || matchedRecord.paymentUtr,
                        paymentStatus: 'approved',
                      }}
                      autoPrint={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Case 3: Player Not Registered in RPL Season 9 -> Quick Registration CTA */}
            {unregisteredData && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 mt-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {unregisteredData.fullName ? `Hello, ${unregisteredData.fullName}` : 'No Registration Found'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unregisteredData.fullName
                      ? 'You are not yet registered for RPL Season 9 with this number.'
                      : 'This mobile number is not registered for RPL Season 9.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onRegisterNewPlayer) {
                      onRegisterNewPlayer(unregisteredData);
                    } else {
                      window.location.hash = '/register';
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register as New Player</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
