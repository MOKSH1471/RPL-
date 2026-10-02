import React from 'react';
import {
  Download,
  FileSpreadsheet,
  Shirt,
  Trophy,
  Bed,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  exportMasterRegistrations,
  exportJerseyVendorSheet,
  exportSportSquadSheet,
  exportAccommodationGateList,
} from '@/lib/exportUtils';

interface AdminExportTabProps {
  registrations: any[];
  accommodationList: any[];
}

export function AdminExportTab({ registrations, accommodationList }: AdminExportTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Overview Intro */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <span>1-Click Excel & CSV Export Hub</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
            Download production-ready reports for uniform manufacturers, sport team captains, auctioneers, and Ashram security reception.
          </p>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 bg-white border border-amber-300 rounded-full text-xs font-black text-amber-900 shadow-sm">
          {registrations.length} Total Records
        </span>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Master Database Export */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Master Registration Database</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete raw database export with participant identity, contact details, stay dates, payment verification, and Drive links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportMasterRegistrations(registrations)}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Master CSV ({registrations.length} Rows)</span>
          </button>
        </div>

        {/* 2. Jersey Manufacturing Order Sheet */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Jersey Vendor Production Sheet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clean sheet for uniform printers containing Player Name, Custom Name on Jersey Back, Preferred Number, and T-shirt Size.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportJerseyVendorSheet(registrations)}
            className="w-full py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Jersey Order Sheet</span>
          </button>
        </div>

        {/* 3. Cricket Auction List */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Cricket Squad & Auction Sheet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formatted player pool for Cricket team captains with playing roles, batting/bowling style, and match experience.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportSportSquadSheet(registrations, 'cricket', 'Cricket')}
            className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Cricket Squad CSV</span>
          </button>
        </div>

        {/* 4. Badminton Match Draw Sheet */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Badminton Tournament Draw Sheet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Singles and doubles player pool categorized by playing hand and skill level for fixtures and draw scheduling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportSportSquadSheet(registrations, 'badminton', 'Badminton')}
            className="w-full py-2.5 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Badminton Draw CSV</span>
          </button>
        </div>

        {/* 5. Football Roster */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Football League Roster</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Player list grouped by field position (Forward, Midfield, Defense, Goalkeeper) and dominant foot.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportSportSquadSheet(registrations, 'football', 'Football')}
            className="w-full py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Football Roster CSV</span>
          </button>
        </div>

        {/* 6. Accommodation & Ashram Gate List */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Bed className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Ashram Gate & Room Allotment List</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official guest check-in sheet with stay dates and allocated room numbers for Ashram security reception.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportAccommodationGateList(accommodationList)}
            className="w-full py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Ashram Gate List</span>
          </button>
        </div>

      </div>

    </div>
  );
}
