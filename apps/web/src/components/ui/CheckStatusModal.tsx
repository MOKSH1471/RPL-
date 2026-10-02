import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { lookupMumukshu, createRazorpayOrder, verifyRazorpayPayment, reportRazorpayPaymentFailure } from '@/lib/api';
import { ReceiptPrinter } from './ReceiptPrinter';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMobile?: string;
  autoTriggerPay?: boolean;
}

export function CheckStatusModal({
  isOpen,
  onClose,
  initialMobile = '',
  autoTriggerPay = false,
}: CheckStatusModalProps) {
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [matchedRecord, setMatchedRecord] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);
  const [serverWakingHint, setServerWakingHint] = useState(false);

  useEffect(() => {
    let timer: any;
    if (loading || isProcessingPayment) {
      timer = setTimeout(() => setServerWakingHint(true), 2500);
    } else {
      setServerWakingHint(false);
    }
    return () => clearTimeout(timer);
  }, [loading, isProcessingPayment]);

  useEffect(() => {
    if (initialMobile) {
      setMobile(initialMobile);
      handleSearchMobile(initialMobile);
    }
  }, [initialMobile, isOpen]);

  const handleSearchMobile = async (queryMobile: string) => {
    const cleanDigits = queryMobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setSearchError(null);
    setMatchedRecord(null);

    try {
      const res = await lookupMumukshu(cleanDigits);
      if (res.found && res.isExistingRegistration && res.registration) {
        setMatchedRecord(res.registration);

        if (autoTriggerPay && (res.registration.paymentStatus || 'pending') === 'pending') {
          // Trigger checkout automatically if deep-linked with ?pay=1
          setTimeout(() => {
            initiateRazorpayPayment(res.registration);
          }, 300);
        }
      } else {
        setSearchError('No RPL Season 9 registration found with this mobile number. Please register as a new player.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search player records.');
    } finally {
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = async (record: any) => {
    setIsProcessingPayment(true);
    try {
      const gen = record.generalDetails || {};
      const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports : ['cricket'];

      const prevUtrs = String(record.payment_utr || gen.payment_utr || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const hasPreviouslyPaid = prevUtrs.length > 0 || ['approved', 'approved_due'].includes((record.paymentStatus || record.payment_status || '').toLowerCase());
      const prevSportsCount = hasPreviouslyPaid ? Math.max(1, (gen.previouslyPaidSportsCount || (sports.length - 1)) ) : 0;

      const orderData = await createRazorpayOrder({
        fullName: record.fullName,
        email: record.email || '',
        mobile: record.mobile,
        selectedSports: sports,
        isExistingPlayer: true,
        hasPreviouslyPaid,
        previouslyPaidSportsCount: prevSportsCount,
        registrationId: record.id,
      });

      if (!orderData || !orderData.orderId) {
        throw new Error(orderData?.error || 'Failed to initiate Razorpay order.');
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TivKrz1oOVPG55',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Raj Premier League (RPL Season 9)',
        description: `Pending Fee for ${sports.length} Sport(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: record.fullName,
          email: record.email || '',
          contact: record.mobile.replace(/\D/g, '').slice(-10),
        },
        theme: {
          color: '#f59e0b',
        },
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationPayload: {
                registration_id: record.id,
                full_name: record.fullName,
                mobile: record.mobile,
                email: record.email,
                general_details: gen,
              },
            });

            // Mark completed
            const updated = {
              ...record,
              paymentStatus: 'approved',
              payment_status: 'approved',
              paymentUtr: response.razorpay_payment_id,
              payment_utr: response.razorpay_payment_id,
            };
            setMatchedRecord(updated);
            setPaymentSuccessData(updated);

            try {
              confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6'],
              });
            } catch {}
          } catch (vErr: any) {
            alert('Payment completed, but verification had an issue: ' + vErr.message);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            // Fallback poll: Check if webhook captured payment in the background
            setTimeout(() => {
              if (record.mobile) {
                handleSearchMobile(record.mobile);
              }
            }, 2500);
          },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        reportRazorpayPaymentFailure(orderData.orderId, response.error);
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err: any) {
      alert('Unable to open payment gateway: ' + (err.message || 'Payment Error'));
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  const isApproved =
    matchedRecord &&
    ((matchedRecord.paymentStatus || '').toLowerCase() === 'approved' ||
      (matchedRecord.payment_status || '').toLowerCase() === 'approved');

  // 'approved_due' = existing paid player who added new sports via Pay Later
  const isApprovedDue =
    matchedRecord &&
    ((matchedRecord.paymentStatus || '').toLowerCase() === 'approved_due' ||
      (matchedRecord.payment_status || '').toLowerCase() === 'approved_due');

  const isPending = !isApproved && (matchedRecord != null);

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
                  <span>Find Player Pass & Complete Payment</span>
                </h3>
                <p className="text-[11px] text-amber-200/80">Enter your 10-digit registered mobile number</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
                  placeholder="Enter 10-digit mobile number..."
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-4 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching...' : 'Find Pass'}</span>
              </button>
            </form>

            {/* Server Waking Indicator (Render Free Tier Cold-Start) */}
            {serverWakingHint && (loading || isProcessingPayment) && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2 animate-in fade-in duration-300">
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
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isApproved
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Player Record Found</p>
                    <h4 className="font-black text-base text-slate-900">{matchedRecord.fullName}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Sports: {(matchedRecord.generalDetails?.selectedSports || ['Cricket']).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    {isApproved ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED & APPROVED</span>
                      </span>
                    ) : isApprovedDue ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ADDITIONAL FEE DUE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>PAYMENT PENDING</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Case 1: Pending or ApprovedDue -> 1-Click Pay Now CTA */}
                {(isPending || isApprovedDue) && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {isApprovedDue ? 'Additional Sport Fee Due' : 'Registration Fee Due'}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">
                          ₹{(
                            () => {
                              const gen = matchedRecord.generalDetails || {};
                              const sports = Array.isArray(gen.selectedSports) ? gen.selectedSports : ['cricket'];
                              const prevUtrs = String(matchedRecord.payment_utr || gen.payment_utr || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                              const hadPrevPayment = prevUtrs.length > 0;
                              if (isApprovedDue && hadPrevPayment) {
                                // Incremental fee = total - already paid
                                const totalFee = 2500 + Math.max(0, sports.length - 1) * 400;
                                const prevSports = gen.previouslyPaidSportsCount || (sports.length - 1);
                                const prevFee = 2500 + Math.max(0, prevSports - 1) * 400;
                                return totalFee - prevFee;
                              }
                              return gen.incrementalFee || gen.calculatedFee || gen.totalAmount || 2500;
                            }
                          )()}
                        </h3>
                      </div>
                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => initiateRazorpayPayment(matchedRecord)}
                        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Opening Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Pay Now with Razorpay</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instant auto-approval via UPI, Netbanking, Cards. Your official pass and QR code will unlock immediately upon payment.
                    </p>
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
                        fullName: matchedRecord.fullName,
                        mobileNumber: matchedRecord.mobile,
                        email: matchedRecord.email,
                        centre: matchedRecord.generalDetails?.centre || 'Mumbai',
                        tshirtSize: matchedRecord.generalDetails?.tshirtSize,
                        customJerseyName: matchedRecord.generalDetails?.customJerseyName,
                        preferredJerseyNumber: matchedRecord.generalDetails?.preferredJerseyNumber,
                        accommodationRequired: matchedRecord.generalDetails?.accommodationRequired,
                        stayingRoomNumber: matchedRecord.generalDetails?.stayingRoomNumber,
                        foodPreference: matchedRecord.generalDetails?.foodPreference,
                        selectedSports: matchedRecord.generalDetails?.selectedSports || ['cricket'],
                        paymentUtr: matchedRecord.payment_utr || matchedRecord.paymentUtr,
                        paymentStatus: 'approved',
                      }}
                      autoPrint={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
