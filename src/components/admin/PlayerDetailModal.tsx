import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageCircle,
  Edit3,
  Save,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shirt,
  User,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { updateRegistration, updatePaymentStatus } from '@/lib/api';

interface PlayerDetailModalProps {
  player: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function PlayerDetailModal({ player, onClose, onRefresh }: PlayerDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const gen = player.general_details || {};
  const sportAns = player.sport_answers || {};

  // Editable form state
  const [formData, setFormData] = useState({
    full_name: player.full_name || '',
    email: player.email || '',
    mobile: player.mobile || '',
    centre: gen.centre || 'Mumbai',
    gender: gen.gender || 'Male',
    dateOfBirth: gen.dateOfBirth || '',
    tshirtSize: gen.tshirtSize || 'L',
    customJerseyName: gen.customJerseyName || '',
    preferredJerseyNumber: gen.preferredJerseyNumber || '',
    foodPreference: gen.foodPreference || 'Jain',
    accommodationRequired: gen.accommodationRequired || 'No',
    check_in_date: player.check_in_date || gen.checkInDate || '2026-12-24',
    check_out_date: player.check_out_date || gen.checkOutDate || '2026-12-26',
    payment_status: player.payment_status || 'pending',
    payment_utr: player.payment_utr || '',
  });

  const handleQuickPaymentStatus = async (status: 'approved' | 'rejected' | 'pending') => {
    try {
      setActionLoading(true);
      await updatePaymentStatus(player.id, status);
      onRefresh();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updatedGeneral = {
        ...gen,
        centre: formData.centre,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        tshirtSize: formData.tshirtSize,
        customJerseyName: formData.customJerseyName,
        preferredJerseyNumber: formData.preferredJerseyNumber,
        foodPreference: formData.foodPreference,
        accommodationRequired: formData.accommodationRequired,
        checkInDate: formData.check_in_date,
        checkOutDate: formData.check_out_date,
      };

      await updateRegistration(player.id, {
        full_name: formData.full_name,
        email: formData.email,
        mobile: formData.mobile,
        payment_status: formData.payment_status,
        payment_utr: formData.payment_utr,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        general_details: updatedGeneral,
      });

      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert('Error saving player changes: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp link generator
  const cleanPhone = (player.mobile || '').replace(/\D/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waMessage = encodeURIComponent(
    `Jai Jinendra ${player.full_name},\nRegarding your Raj Premier League Season 9 registration (ID: ${player.id.slice(0, 8)})...`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                  {player.full_name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    player.payment_status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : player.payment_status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {player.payment_status || 'pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {player.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Player</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">

          {/* Action Ribbon: Verification & Quick WhatsApp */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Payment Verification:
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  disabled={actionLoading || player.payment_status === 'approved'}
                  onClick={() => handleQuickPaymentStatus('approved')}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading || player.payment_status === 'rejected'}
                  onClick={() => handleQuickPaymentStatus('rejected')}
                  className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                {player.payment_status !== 'pending' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleQuickPaymentStatus('pending')}
                    className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
                  >
                    Reset Pending
                  </button>
                )}
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Player</span>
            </a>
          </div>

          {/* Proof Documents Section: Photo & Payment Receipt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Player Photo Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Player Photo</span>
                </span>
                {player.player_photo_url && (
                  <a
                    href={player.player_photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                  >
                    <span>Open Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {player.player_photo_url ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-48">
                  <img
                    src={player.player_photo_url}
                    alt={player.full_name}
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No photo attached
                </div>
              )}
            </div>

            {/* Payment Proof Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Payment Proof (Receipt)</span>
                </span>
                {player.payment_receipt_url && (
                  <a
                    href={player.payment_receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <span>Open Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">UTR / Ref:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {player.payment_utr || 'Not Provided'}
                </span>
              </div>

              {player.payment_receipt_url ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-40">
                  <img
                    src={player.payment_receipt_url}
                    alt="Payment Receipt"
                    className="max-h-40 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No receipt screenshot uploaded
                </div>
              )}
            </div>
          </div>

          {/* Form Details: View Mode vs Edit Mode */}
          {!isEditing ? (
            <div className="space-y-6">
              
              {/* Basic & Demographic Info */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Participant Identity & Logistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Mobile</span>
                    <span className="font-bold text-slate-900">{player.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Email</span>
                    <span className="font-bold text-slate-900 truncate block">{player.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Centre</span>
                    <span className="font-bold text-slate-900">{gen.centre || 'Mumbai'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Gender</span>
                    <span className="font-bold text-slate-900">{gen.gender || 'Male'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">DOB</span>
                    <span className="font-bold text-slate-900">{gen.dateOfBirth || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Jersey Size</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
                      {gen.tshirtSize || 'L'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Jersey Name</span>
                    <span className="font-bold text-slate-900">{gen.customJerseyName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Jersey Number</span>
                    <span className="font-bold text-slate-900">{gen.preferredJerseyNumber || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Sports & Questionnaire Answers */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selected Sports & Questionnaire
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(gen.selectedSports || []).map((sportKey: string) => (
                    <span
                      key={sportKey}
                      className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 font-extrabold text-xs uppercase tracking-wider"
                    >
                      {sportKey}
                    </span>
                  ))}
                </div>

                {Object.keys(sportAns).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {Object.entries(sportAns).map(([sportKey, answers]: [string, any]) => (
                      <div
                        key={sportKey}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                      >
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                          {sportKey} Questions:
                        </h4>
                        <div className="space-y-1 text-xs">
                          {Object.entries(answers || {}).map(([qKey, aVal]: [string, any]) => (
                            <div key={qKey} className="flex justify-between border-b border-slate-200/50 pb-1">
                              <span className="text-slate-500 capitalize">{qKey.replace(/([A-Z])/g, ' $1')}:</span>
                              <strong className="text-slate-800">{String(aVal)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific questionnaire answers.</p>
                )}
              </div>

              {/* Stay & Accommodation */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accommodation & Stay
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Accommodation Needed</span>
                    <span className="font-bold text-slate-900">{gen.accommodationRequired || 'No'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Check-In Date</span>
                    <span className="font-bold text-slate-900">{player.check_in_date || '2026-12-24'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Check-Out Date</span>
                    <span className="font-bold text-slate-900">{player.check_out_date || '2026-12-26'}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* EDIT MODE FORM */
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-amber-900 text-xs font-bold">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Editing Participant Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Centre</label>
                  <input
                    type="text"
                    value={formData.centre}
                    onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jersey Size</label>
                  <select
                    value={formData.tshirtSize}
                    onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Jersey Name</label>
                  <input
                    type="text"
                    value={formData.customJerseyName}
                    onChange={(e) => setFormData({ ...formData, customJerseyName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Number</label>
                  <input
                    type="text"
                    value={formData.preferredJerseyNumber}
                    onChange={(e) => setFormData({ ...formData, preferredJerseyNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment UTR</label>
                  <input
                    type="text"
                    value={formData.payment_utr}
                    onChange={(e) => setFormData({ ...formData, payment_utr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Accommodation</label>
                  <select
                    value={formData.accommodationRequired}
                    onChange={(e) => setFormData({ ...formData, accommodationRequired: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="No">No, Self-Arranged</option>
                    <option value="Yes">Yes, Needed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-amber-200/80">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
