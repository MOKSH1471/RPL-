import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Shirt,
  Building2,
  Trophy,
  Activity,
  Bed,
} from 'lucide-react';

interface AdminDashboardTabProps {
  stats: any;
  loading: boolean;
}

export function AdminDashboardTab({ stats, loading }: AdminDashboardTabProps) {
  if (loading || !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Live Statistics...</p>
      </div>
    );
  }

  const { totalRegistrations, payment, accommodationCount, sportsCount, tshirtSizes, centresCount } = stats;

  const sportLabels: Record<string, string> = {
    cricket: 'Cricket',
    football: 'Football',
    badminton: 'Badminton',
    'table-tennis': 'Table Tennis',
    pickleball: 'Pickleball',
    volleyball: 'Volleyball / Throwball',
    'womens-sports': "Women's League",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Registrations */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Players</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalRegistrations}</span>
            <span className="text-xs font-semibold text-slate-400">entries</span>
          </div>
        </div>

        {/* Approved Payments */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Paid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">{payment?.approved || 0}</span>
            <span className="text-xs font-semibold text-slate-400">verified</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-orange-600 tracking-tight">{payment?.pending || 0}</span>
            <span className="text-xs font-semibold text-slate-400">under review</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600 tracking-tight">{payment?.rejected || 0}</span>
            <span className="text-xs font-semibold text-slate-400">invalid proof</span>
          </div>
        </div>

        {/* Accommodation */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Ashram Stays</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-cyan-700 tracking-tight">{accommodationCount || 0}</span>
            <span className="text-xs font-semibold text-slate-400">requested</span>
          </div>
        </div>

      </div>

      {/* Two Column Section: Sport Distribution & Jersey Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sports Distribution Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">Sports Registration Breakdown</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Players / Sport</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(sportsCount || {}).map(([key, count]: [string, any]) => {
              const total = totalRegistrations || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{sportLabels[key] || key}</span>
                    <span className="text-slate-900 font-mono">
                      {count} <span className="text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* T-Shirt / Jersey Size Inventory Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Shirt className="w-5 h-5 text-orange-600" />
              <h3 className="font-extrabold text-base text-slate-900">Jersey Size Inventory (Manufacturing)</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quantity</span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-1">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
              const qty = tshirtSizes?.[size] || 0;
              return (
                <div
                  key={size}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-1 hover:border-amber-300 transition-colors"
                >
                  <span className="text-[11px] font-black uppercase text-slate-500 block">{size}</span>
                  <span className="text-xl font-black text-slate-900 font-mono block">{qty}</span>
                  <span className="text-[10px] font-semibold text-slate-400">Jerseys</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Centre-wise Participant Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Building2 className="w-5 h-5 text-amber-600" />
          <h3 className="font-extrabold text-base text-slate-900">Geographic Centre Distribution</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(centresCount || {}).map(([centre, count]: [string, any]) => (
            <div
              key={centre}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5"
            >
              <span className="text-xs font-bold text-slate-700 block truncate">{centre}</span>
              <span className="text-lg font-black text-amber-600 font-mono block">{count}</span>
              <span className="text-[10px] text-slate-400 font-medium">Players</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
