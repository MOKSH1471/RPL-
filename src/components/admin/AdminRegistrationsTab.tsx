import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageCircle,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { updatePaymentStatus, deleteRegistration } from '@/lib/api';
import { getDriveDirectImageUrl } from '@/lib/exportUtils';


interface AdminRegistrationsTabProps {
  registrations: any[];
  loading: boolean;
  onSelectPlayer: (player: any) => void;
  onRefresh: () => void;
}

export function AdminRegistrationsTab({
  registrations,
  loading,
  onSelectPlayer,
  onRefresh,
}: AdminRegistrationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [accFilter, setAccFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Filter registrations
  const filtered = registrations.filter((r) => {
    const gen = r.general_details || {};
    const sports = gen.selectedSports || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = r.full_name?.toLowerCase().includes(term);
      const matchPhone = r.mobile?.includes(term);
      const matchEmail = r.email?.toLowerCase().includes(term);
      const matchUtr = r.payment_utr?.toLowerCase().includes(term);
      const matchCentre = gen.centre?.toLowerCase().includes(term);
      const matchJerseyName = gen.customJerseyName?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchEmail && !matchUtr && !matchCentre && !matchJerseyName) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      const pStatus = (r.payment_status || 'pending').toLowerCase();
      if (pStatus !== statusFilter) return false;
    }

    // Sport filter
    if (sportFilter !== 'all') {
      if (!Array.isArray(sports) || !sports.includes(sportFilter)) return false;
    }

    // Accommodation filter
    if (accFilter !== 'all') {
      const acc = gen.accommodationRequired || 'No';
      if (acc !== accFilter) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleQuickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePaymentStatus(id, 'approved');
      onRefresh();
    } catch (err: any) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleQuickReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePaymentStatus(id, 'rejected');
      onRefresh();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete registration for "${name}"?`)) return;
    try {
      await deleteRegistration(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search & Multi-Filter Controls */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, email, UTR, centre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved / Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sport Filter */}
            <select
              value={sportFilter}
              onChange={(e) => {
                setSportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Sports</option>
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
              <option value="badminton">Badminton</option>
              <option value="table-tennis">Table Tennis</option>
              <option value="pickleball">Pickleball</option>
              <option value="volleyball">Volleyball</option>
              <option value="womens-sports">Women's League</option>
            </select>

            {/* Accommodation Filter */}
            <select
              value={accFilter}
              onChange={(e) => {
                setAccFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Stays</option>
              <option value="Yes">Stay Needed (Ashram)</option>
              <option value="No">Self-Arranged</option>
            </select>
          </div>

        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> matching participants
          </span>
          {(searchTerm || statusFilter !== 'all' || sportFilter !== 'all' || accFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSportFilter('all');
                setAccFilter('all');
              }}
              className="text-amber-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Player / ID</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Centre & Info</th>
                <th className="py-3.5 px-4">Selected Sports</th>
                <th className="py-3.5 px-4">Jersey Specs</th>
                <th className="py-3.5 px-4">Payment & UTR</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                    Loading registrations...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    No registrations match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((player) => {
                  const gen = player.general_details || {};
                  const sports = gen.selectedSports || [];
                  const cleanPhone = (player.mobile || '').replace(/\D/g, '');
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const waUrl = `https://wa.me/${waPhone}`;

                  return (
                    <tr
                      key={player.id}
                      onClick={() => onSelectPlayer(player)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      
                      {/* 1. Player Info & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {player.player_photo_url ? (
                            <img
                              src={getDriveDirectImageUrl(player.player_photo_url)}
                              alt={player.full_name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 block group-hover:text-amber-600 transition-colors">
                              {player.full_name}
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {player.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-800 block">{player.mobile}</span>
                        <span className="text-[11px] text-slate-400 font-sans truncate block max-w-[140px]">
                          {player.email}
                        </span>
                      </td>

                      {/* 3. Centre & Gender */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{gen.centre || 'Mumbai'}</span>
                        <span className="text-[11px] text-slate-400">{gen.gender || 'Male'}</span>
                      </td>

                      {/* 4. Selected Sports */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {sports.map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-[10px] uppercase tracking-wider"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 5. Jersey Specs */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                            {gen.tshirtSize || 'L'}
                          </span>
                          <span className="text-slate-800 font-bold truncate max-w-[100px]">
                            {gen.customJerseyName || '-'}
                          </span>
                          {gen.preferredJerseyNumber && (
                            <span className="text-slate-400 font-mono">#{gen.preferredJerseyNumber}</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Payment Status & Proof */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              player.payment_status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : player.payment_status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {player.payment_status || 'pending'}
                          </span>
                          {player.payment_utr && (
                            <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[110px]">
                              UTR: {player.payment_utr}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Quick Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          
                          {/* WhatsApp Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Quick Approve / Reject */}
                          {player.payment_status !== 'approved' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickApprove(player.id, e)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approve Payment"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {player.payment_status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickReject(player.id, e)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Reject Payment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Detail Drawer */}
                          <button
                            type="button"
                            onClick={() => onSelectPlayer(player)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            title="View / Edit Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(player.id, player.full_name, e)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
