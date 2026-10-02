import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { fetchAdminTransactions } from '@/lib/api';

export function AdminTransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminTransactions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      if (res && res.success) {
        setTransactions(res.transactions || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTransactions();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Reconciliation Metrics ── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.total_count || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Gateway intents & verified orders</p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Verified Revenue</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{(summary.total_completed_amount || 0).toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3">{summary.completed?.count || 0} confirmed payments</p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Initiated / Pending</p>
                <h3 className="text-2xl font-black text-amber-700 mt-1">{summary.pending?.count || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-amber-600 font-medium mt-3">In checkout or pending completion</p>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Failed / Cancelled</p>
                <h3 className="text-2xl font-black text-rose-700 mt-1">{summary.failed?.count || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-rose-600 font-medium mt-3">Bank declines or user dropoffs</p>
          </div>
        </div>
      )}

      {/* ── Controls: Search & Status Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto">
          {(['all', 'completed', 'pending', 'failed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by player, mobile, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            Search
          </button>
          <button
            type="button"
            onClick={loadTransactions}
            title="Refresh"
            className="p-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3 px-4">Player / Contact</th>
                <th className="py-3 px-4">Razorpay Order & Ref</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Description / Failure Cause</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transaction records found matching your filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCompleted = tx.status === 'completed';
                  const isPending = tx.status === 'pending';
                  const isFailed = tx.status === 'failed';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">
                          {tx.player_name || 'Guest / Intent User'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.player_mobile || tx.cardno || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-700 font-semibold">
                          <span>{tx.razorpay_order_id || '—'}</span>
                          {tx.razorpay_order_id && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(tx.razorpay_order_id, `order_${tx.id}`)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                          {copiedId === `order_${tx.id}` && (
                            <span className="text-[9px] text-emerald-600 font-bold">Copied!</span>
                          )}
                        </div>
                        {tx.upi_ref && tx.upi_ref !== 'PENDING' && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Payment ID: {tx.upi_ref}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-slate-900 text-sm">
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>COMPLETED</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>INITIATED</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="truncate text-slate-700 font-medium" title={tx.description}>
                          {tx.description || 'RPL Registration'}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
