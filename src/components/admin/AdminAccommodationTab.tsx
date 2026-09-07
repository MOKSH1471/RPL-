import React, { useState, useMemo } from 'react';
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
  Users,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { assignRoomNumber } from '@/lib/api';

interface AdminAccommodationTabProps {
  accommodationList: any[];
  loading: boolean;
  onRefresh: () => void;
}

interface RoomSummaryItem {
  roomNo: string;
  beds: number;
  allottedCount: number;
  occupants: Array<{
    name: string;
    mobile: string;
    gender: string;
    centre: string;
  }>;
  primaryGender?: string;
}

export function AdminAccommodationTab({
  accommodationList,
  loading,
  onRefresh,
}: AdminAccommodationTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [roomSearch, setRoomSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | 'available' | 'full'>('all');
  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // 1. Dynamic Room Allotment Summary Computation
  const { roomSummaryList, kpis } = useMemo(() => {
    const roomMap = new Map<string, RoomSummaryItem>();
    const seenAllottedUsers = new Set<string>();
    const seenUnassignedUsers = new Set<string>();

    accommodationList.forEach((item) => {
      const userKey = `${item.full_name}_${item.mobile || ''}`.trim();
      const mainBooking = item.bookings?.[0];
      const rawRoom = mainBooking?.roomno;
      const cleanRoom = (rawRoom || '').trim().toUpperCase();

      const isAssigned = cleanRoom && cleanRoom !== 'UNASSIGNED' && cleanRoom !== 'RPL_UNASSIGNED';

      if (isAssigned) {
        seenAllottedUsers.add(userKey);
        if (!roomMap.has(cleanRoom)) {
          roomMap.set(cleanRoom, {
            roomNo: cleanRoom,
            beds: 4, // Most rooms have 4 beds
            allottedCount: 0,
            occupants: [],
          });
        }

        const currentRoom = roomMap.get(cleanRoom)!;
        const alreadyInRoom = currentRoom.occupants.some(
          (occ) => (occ.mobile && item.mobile && occ.mobile === item.mobile) || occ.name === item.full_name
        );

        if (!alreadyInRoom) {
          currentRoom.allottedCount++;
          currentRoom.occupants.push({
            name: item.full_name,
            mobile: item.mobile,
            gender: item.gender,
            centre: item.centre,
          });
        }

        if (!currentRoom.primaryGender) {
          currentRoom.primaryGender = item.gender;
        }
      } else {
        if (!seenAllottedUsers.has(userKey)) {
          seenUnassignedUsers.add(userKey);
        }
      }
    });

    // Remove any user from unassigned set if they are allotted in any room
    seenAllottedUsers.forEach((u) => seenUnassignedUsers.delete(u));

    const sortedRooms = Array.from(roomMap.values()).sort((a, b) =>
      a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
    );

    const totalRooms = sortedRooms.length;
    const totalBedsCapacity = sortedRooms.reduce((acc, r) => acc + r.beds, 0);
    const totalAllottedGuests = sortedRooms.reduce((acc, r) => acc + r.allottedCount, 0);
    const vacantBedsInActiveRooms = Math.max(0, totalBedsCapacity - totalAllottedGuests);
    const unassignedGuests = seenUnassignedUsers.size;

    return {
      roomSummaryList: sortedRooms,
      kpis: {
        totalRooms,
        totalBedsCapacity,
        totalAllottedGuests,
        vacantBedsInActiveRooms,
        unassignedGuests,
      },
    };
  }, [accommodationList]);

  // 2. Filtered Room Summary List
  const filteredRoomSummary = useMemo(() => {
    return roomSummaryList.filter((room) => {
      if (roomSearch) {
        const query = roomSearch.toLowerCase();
        const matchRoomNo = room.roomNo.toLowerCase().includes(query);
        const matchOccupant = room.occupants.some((occ) => occ.name.toLowerCase().includes(query));
        if (!matchRoomNo && !matchOccupant) return false;
      }

      if (roomFilter === 'available') {
        return room.allottedCount < room.beds;
      }
      if (roomFilter === 'full') {
        return room.allottedCount >= room.beds;
      }

      return true;
    });
  }, [roomSummaryList, roomSearch, roomFilter]);

  // 3. Filtered Participant List
  const filteredParticipants = useMemo(() => {
    const seenMobiles = new Set<string>();
    const uniqueParticipants = [];

    for (const item of accommodationList) {
      const rawDigits = (item.mobile || '').replace(/\D/g, '');
      const key = (rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits) || item.registration_id;
      if (!seenMobiles.has(key)) {
        seenMobiles.add(key);
        uniqueParticipants.push(item);
      }
    }

    return uniqueParticipants.filter((item) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = item.full_name?.toLowerCase().includes(term);
        const matchPhone = item.mobile?.includes(term);
        const matchCentre = item.centre?.toLowerCase().includes(term);
        const mainBooking = item.bookings?.[0];
        const matchRoom = mainBooking?.roomno?.toLowerCase().includes(term);
        if (!matchName && !matchPhone && !matchCentre && !matchRoom) return false;
      }

      if (genderFilter !== 'all') {
        if (item.gender !== genderFilter) return false;
      }

      return true;
    });
  }, [accommodationList, searchTerm, genderFilter]);

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

  const handleQuickFilterRoom = (roomNo: string) => {
    setSearchTerm(roomNo);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* SECTION 1: DYNAMIC ROOM ALLOTMENT SUMMARY (CLEAN LIGHT RPL THEME) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Top Summary Header & KPI Cards */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    Room Allotment Summary
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold border border-amber-200">
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Real-time bed allocation and occupancy across all Ashram tournament rooms (Standard 4 beds/room)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-auto">
              <button
                type="button"
                onClick={onRefresh}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Refresh Counts</span>
              </button>
            </div>
          </div>

          {/* Quick Metric KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-[10px] uppercase font-bold text-amber-800/80 block tracking-wider">
                Rooms Utilized
              </span>
              <span className="text-2xl font-black text-amber-800 font-display">
                {kpis.totalRooms}
              </span>
              <span className="text-[10px] text-amber-700/80 block mt-0.5 font-medium">Active rooms</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                Total Beds Capacity
              </span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {kpis.totalBedsCapacity}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">@ 4 beds/room</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="text-[10px] uppercase font-bold text-emerald-800/80 block tracking-wider">
                Total Allotted
              </span>
              <span className="text-2xl font-black text-emerald-700 font-display">
                {kpis.totalAllottedGuests}
              </span>
              <span className="text-[10px] text-emerald-700/80 block mt-0.5 font-medium">Assigned guests</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
              <span className="text-[10px] uppercase font-bold text-teal-800/80 block tracking-wider">
                Vacant Beds
              </span>
              <span className="text-2xl font-black text-teal-700 font-display">
                {kpis.vacantBedsInActiveRooms}
              </span>
              <span className="text-[10px] text-teal-700/80 block mt-0.5 font-medium">Available to allot</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-rose-800/80 block tracking-wider">
                Unassigned Guests
              </span>
              <span className="text-2xl font-black text-rose-600 font-display">
                {kpis.unassignedGuests}
              </span>
              <span className="text-[10px] text-rose-600/80 block mt-0.5 font-medium">Need room number</span>
            </div>
          </div>
        </div>

        {/* 3-Column Summary Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Summary Table Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Allotment Summary Table (3 Columns)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                {filteredRoomSummary.length} {filteredRoomSummary.length === 1 ? 'Room' : 'Rooms'}
              </span>
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter room or guest..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All Rooms</option>
                <option value="available">Has Vacant Beds (&lt;4)</option>
                <option value="full">Full Rooms (4/4)</option>
              </select>
            </div>
          </div>

          {/* The Exact 3-Column Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5 w-5/12">1. Room No.</th>
                  <th className="py-3.5 px-5 w-3/12">2. No. of Beds</th>
                  <th className="py-3.5 px-5 w-4/12">3. Total Alloted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-slate-400 font-bold">
                      Computing room allotment summary...
                    </td>
                  </tr>
                ) : filteredRoomSummary.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-600">No rooms currently allocated.</p>
                      <p className="text-[11px] text-slate-500">
                        Assign a room number to any participant below, and it will dynamically appear in this summary table.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRoomSummary.map((item) => {
                    const isFull = item.allottedCount === item.beds;
                    const isOverbooked = item.allottedCount > item.beds;
                    const vacantCount = Math.max(0, item.beds - item.allottedCount);
                    const occupancyPercentage = Math.min(100, Math.round((item.allottedCount / item.beds) * 100));

                    return (
                      <tr
                        key={item.roomNo}
                        className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                        onClick={() => handleQuickFilterRoom(item.roomNo)}
                        title={`Click to filter participant table for Room ${item.roomNo}`}
                      >
                        
                        {/* 1. ROOM NO. */}
                        <td className="py-4 px-5 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-black text-sm tracking-wide shadow-xs">
                                Room {item.roomNo}
                              </span>
                              {item.primaryGender && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    item.primaryGender === 'Female'
                                      ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {item.primaryGender} Wing
                                </span>
                              )}
                            </div>

                            {/* Occupant Tags List */}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {item.occupants.map((occ, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200"
                                >
                                  <User className="w-2.5 h-2.5 text-slate-500" />
                                  <span>{occ.name}</span>
                                  {occ.centre && (
                                    <span className="text-slate-500 font-normal">({occ.centre})</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* 2. NO. OF BEDS */}
                        <td className="py-4 px-5 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-1.5">
                              <Bed className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="font-extrabold text-slate-900 text-sm">
                                {item.beds} Beds
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                (Standard)
                              </span>
                            </div>

                            {/* Visual Bed Occupancy Progress Bar */}
                            <div className="w-full max-w-[140px] h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOverbooked
                                    ? 'bg-rose-500'
                                    : isFull
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${occupancyPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 3. TOTAL ALLOTTED */}
                        <td className="py-4 px-5 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900 text-sm font-display">
                                {item.allottedCount} Allotted
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isOverbooked
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : isFull
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                {isOverbooked
                                  ? '⚠️ Overbooked'
                                  : isFull
                                  ? '🔵 Full (4/4)'
                                  : `🟢 ${vacantCount} ${vacantCount === 1 ? 'Bed' : 'Beds'} Vacant`}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 text-[11px] text-amber-700 font-semibold group-hover:text-amber-800">
                              <span>Click row to view participants</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
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

      {/* ========================================================================= */}
      {/* SECTION 2: PARTICIPANT ROOM ALLOCATION & MANAGEMENT TABLE */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Header & Filter Controls */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Participant Room Assignment
                </h3>
                <p className="text-xs text-slate-500">
                  Assign designated room numbers to tournament participants requesting stay
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, room or centre..."
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

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  title="Clear search filter"
                >
                  Clear
                </button>
              )}
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
                ) : filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400">
                      No participants requiring accommodation found.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((item) => {
                    const mainBooking = item.bookings?.[0];
                    const bookingId = mainBooking?.bookingid || item.registration_id;
                    const currentRoom = mainBooking?.roomno || 'UNASSIGNED';
                    const inputValue =
                      roomInputs[bookingId] !== undefined
                        ? roomInputs[bookingId]
                        : currentRoom === 'UNASSIGNED' || currentRoom === 'RPL_UNASSIGNED'
                        ? ''
                        : currentRoom;

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
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs transition-all flex items-center space-x-1 mx-auto disabled:opacity-40 cursor-pointer"
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

    </div>
  );
}
