import React, { useState } from 'react';
import {
  Bed,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  Building2,
  Search,
  User,
  Loader2,
} from 'lucide-react';
import { assignRoomNumber } from '@/lib/api';

interface AdminAccommodationTabProps {
  accommodationList: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function AdminAccommodationTab({
  accommodationList,
  loading,
  onRefresh,
}: AdminAccommodationTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = accommodationList.filter((item) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = item.full_name?.toLowerCase().includes(term);
      const matchPhone = item.mobile?.includes(term);
      const matchCentre = item.centre?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchCentre) return false;
    }

    if (genderFilter !== 'all') {
      if (item.gender !== genderFilter) return false;
    }

    return true;
  });

  const handleRoomChange = (bookingId: string, value: string) => {
    setRoomInputs((prev) => ({ ...prev, [bookingId]: value }));
  };

  const handleSaveRoom = async (bookingId: string) => {
    const roomVal = roomInputs[bookingId];
    if (!roomVal || !roomVal.trim()) {
      alert('Please enter a room number.');
      return;
    }

    try {
      setSavingId(bookingId);
      await assignRoomNumber(bookingId, roomVal.trim());
      onRefresh();
    } catch (err: any) {
      alert('Failed to assign room: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Filter Controls */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Accommodation & Room Allocation
              </h3>
              <p className="text-xs text-slate-500">
                Allocate designated RPL rooms directly to tournament participants
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Gender Wing Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Wings</option>
              <option value="Male">Male Wing</option>
              <option value="Female">Female Wing</option>
            </select>
          </div>

        </div>
      </div>

      {/* Accommodation Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Centre / Gender</th>
                <th className="py-3.5 px-4">Stay Dates</th>
                <th className="py-3.5 px-4">Booking Reference</th>
                <th className="py-3.5 px-4">Allocated Room</th>
                <th className="py-3.5 px-4 text-center">Save Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                    Loading accommodation requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    No participants requiring accommodation found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const mainBooking = item.bookings?.[0];
                  const bookingId = mainBooking?.bookingid || item.registration_id;
                  const currentRoom = mainBooking?.roomno || 'UNASSIGNED';
                  const inputValue = roomInputs[bookingId] !== undefined ? roomInputs[bookingId] : (currentRoom === 'UNASSIGNED' || currentRoom === 'RPL_UNASSIGNED' ? '' : currentRoom);

                  return (
                    <tr key={item.registration_id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* 1. Participant Name & Phone */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">{item.full_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.mobile}</span>
                      </td>

                      {/* 2. Centre & Gender Wing */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{item.centre}</span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mt-0.5 ${
                            item.gender === 'Female'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.gender}
                        </span>
                      </td>

                      {/* 3. Stay Dates */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div className="space-y-0.5">
                          <span className="font-bold block">
                            {item.check_in_date || '2026-12-24'} → {item.check_out_date || '2026-12-26'}
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-sans font-semibold">
                            Official RPL Stay
                          </span>
                        </div>
                      </td>

                      {/* 4. Booking Reference */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {mainBooking?.bookingid ? (
                          <span>{mainBooking.bookingid.slice(0, 8)}...</span>
                        ) : (
                          <span className="italic text-slate-400">Direct Entry</span>
                        )}
                      </td>

                      {/* 5. Editable Room Number Input */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="e.g. 2A, Room 105"
                            value={inputValue}
                            onChange={(e) => handleRoomChange(bookingId, e.target.value)}
                            className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-inner"
                          />
                          {currentRoom && currentRoom !== 'UNASSIGNED' && currentRoom !== 'RPL_UNASSIGNED' && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Assigned</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Save Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={savingId === bookingId || !mainBooking?.bookingid}
                          onClick={() => handleSaveRoom(bookingId)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs transition-all flex items-center space-x-1 mx-auto disabled:opacity-40"
                        >
                          {savingId === bookingId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save</span>
                        </button>
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
