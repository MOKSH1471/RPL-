import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  Trophy,
  Plus,
  Trash2,
  Search,
  Filter,
  Shuffle,
  Download,
  Check,
  Crown,
  X,
  UserPlus,
  RefreshCw,
  Palette,
  ChevronDown,
  Sparkles,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CricketTeam, CricketPlayer } from '@/types/cricket';
import {
  fetchCricketTeamsFromDb,
  saveCricketTeamToDb,
  deleteCricketTeamFromDb,
} from '@/lib/cricketApi';
import { DEFAULT_TEAMS } from '@/lib/cricketMockData';

interface AdminTeamMakerTabProps {
  registrations: any[];
  loading?: boolean;
  onRefresh?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Amber Gold', hex: '#D97706', bg: 'bg-amber-600', text: 'text-amber-500' },
  { name: 'Cyan Blue', hex: '#0891B2', bg: 'bg-cyan-600', text: 'text-cyan-500' },
  { name: 'Emerald Green', hex: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-500' },
  { name: 'Purple Royal', hex: '#7C3AED', bg: 'bg-purple-600', text: 'text-purple-500' },
  { name: 'Rose Red', hex: '#E11D48', bg: 'bg-rose-600', text: 'text-rose-500' },
  { name: 'Indigo Deep', hex: '#4F46E5', bg: 'bg-indigo-600', text: 'text-indigo-500' },
  { name: 'Orange Flame', hex: '#EA580C', bg: 'bg-orange-600', text: 'text-orange-500' },
  { name: 'Slate Dark', hex: '#334155', bg: 'bg-slate-700', text: 'text-slate-400' },
];

const AVAILABLE_SPORTS = [
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'table_tennis', name: 'Table Tennis', icon: '🏓' },
  { id: 'football', name: 'Football', icon: '⚽' },
];

const DEFAULT_TEST_PLAYERS: CricketPlayer[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const roles = [
    'Batter',
    'Bowler',
    'All-rounder',
    'Wicketkeeper',
    'Batter',
    'All-rounder',
    'Bowler',
    'Batter',
    'All-rounder',
    'Bowler',
  ];
  const cities = [
    'Mumbai',
    'Surat',
    'Ahmedabad',
    'Pune',
    'Vadodara',
    'Delhi',
    'Bengaluru',
    'Rajkot',
    'Bhavnagar',
    'Jaipur',
  ];
  return {
    id: `test-player-${num}`,
    registrationId: `test-player-${num}`,
    name: `Player ${num}`,
    mobile: `99000000${num.toString().padStart(2, '0')}`,
    centre: cities[i],
    role: roles[i],
    battingStyle: num % 2 === 0 ? 'Left Hand Bat' : 'Right Hand Bat',
    bowlingStyle: num % 2 === 0 ? 'Left Arm Spin' : 'Right Arm Medium Fast',
    avatarUrl: undefined,
  };
});

export function AdminTeamMakerTab({ registrations, loading = false, onRefresh }: AdminTeamMakerTabProps) {
  const [selectedSport, setSelectedSport] = useState<string>('cricket');
  const [teams, setTeams] = useState<CricketTeam[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Search & Filter in Player Pool
  const [searchTerm, setSearchTerm] = useState('');
  const [poolFilter, setPoolFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Modal State for New Team
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShortName, setNewTeamShortName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#D97706');
  const [newTeamLogoUrl, setNewTeamLogoUrl] = useState('');

  // Target team selector for quick-assign popup
  const [activeAssignPlayerId, setActiveAssignPlayerId] = useState<string | null>(null);

  // 1. Fetch existing teams from DB
  const loadTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const dbTeams = await fetchCricketTeamsFromDb();
      if (dbTeams && dbTeams.length > 0) {
        setTeams(dbTeams);
      } else {
        // Fallback to default teams if database is clean
        setTeams(DEFAULT_TEAMS);
      }
    } catch (err) {
      console.warn('Failed to fetch teams, using local fallback:', err);
      setTeams(DEFAULT_TEAMS);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  // 2. Parse Registered Players for the Selected Sport
  const registeredPlayers = useMemo(() => {
    const normalize = (str: string) => (str || '').toLowerCase().replace(/[-_\s]/g, '');
    const curSport = normalize(selectedSport);

    const fromRegs = registrations
      .filter((r) => {
        const isArchived = Boolean(r.is_archived || r.general_details?.isArchived);
        if (isArchived) return false;

        const gen = r.general_details || {};
        const sports = gen.selectedSports || [];
        const sportId = normalize(r.sport_id || '');

        // Match sport either by selectedSports array or r.sport_id
        const matchesArray =
          Array.isArray(sports) &&
          sports.some((s: string) => {
            const norm = normalize(s);
            return norm.includes(curSport) || curSport.includes(norm);
          });
        const matchesDirect = sportId.includes(curSport) || curSport.includes(sportId);

        // If sport is cricket and sports list is empty, default include if no other sport is specified
        if (!matchesArray && !matchesDirect && curSport === 'cricket' && (!sports || sports.length === 0)) {
          return true;
        }

        return matchesArray || matchesDirect;
      })
      .map((r) => {
        const gen = r.general_details || {};
        const answers = r.sport_answers || r.answers || {};

        // Extract role if available
        let role = 'Player';
        if (answers.cricket_role || answers.role) {
          role = answers.cricket_role || answers.role;
        } else if (answers.playing_role) {
          role = answers.playing_role;
        } else if (gen.playingRole) {
          role = gen.playingRole;
        }

        return {
          id: r.id,
          registrationId: r.id,
          name: r.full_name || 'Anonymous Player',
          mobile: r.mobile || '',
          centre: gen.centre || gen.city || 'General',
          role: role,
          battingStyle: answers.batting_style || answers.battingStyle || 'Right Hand Bat',
          bowlingStyle: answers.bowling_style || answers.bowlingStyle || 'Right Arm Medium',
          avatarUrl: r.player_photo_url || null,
        } as CricketPlayer;
      });

    // Merge in test players (Player 1 to Player 10) for testing across all sports
    const existingIds = new Set(fromRegs.map((p) => p.id));
    const merged = [...fromRegs];

    DEFAULT_TEST_PLAYERS.forEach((testPlayer) => {
      if (!existingIds.has(testPlayer.id)) {
        merged.push(testPlayer);
      }
    });

    return merged;
  }, [registrations, selectedSport]);

  // 3. Map of Player ID -> Assigned Team ID
  const playerAssignmentMap = useMemo(() => {
    const map = new Map<string, { teamId: string; teamName: string }>();
    teams.forEach((t) => {
      (t.players || []).forEach((p) => {
        map.set(p.id, { teamId: t.id, teamName: t.name });
        if (p.registrationId) {
          map.set(p.registrationId, { teamId: t.id, teamName: t.name });
        }
      });
    });
    return map;
  }, [teams]);

  // 4. Filtered Player Pool based on search & assignment status
  const filteredPlayerPool = useMemo(() => {
    return registeredPlayers.filter((p) => {
      const isAssigned = playerAssignmentMap.has(p.id) || (p.registrationId && playerAssignmentMap.has(p.registrationId));

      if (poolFilter === 'unassigned' && isAssigned) return false;
      if (poolFilter === 'assigned' && !isAssigned) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(term);
        const matchMobile = p.mobile?.includes(term);
        const matchCentre = p.centre?.toLowerCase().includes(term);
        const matchRole = p.role?.toLowerCase().includes(term);
        return matchName || matchMobile || matchCentre || matchRole;
      }

      return true;
    });
  }, [registeredPlayers, playerAssignmentMap, poolFilter, searchTerm]);

  // Handle Team Creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const shortName =
      newTeamShortName.trim().toUpperCase() ||
      newTeamName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 3)
        .toUpperCase() ||
      'TEAM';

    const newTeam: CricketTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newTeamName.trim(),
      shortName: shortName,
      colorCode: newTeamColor,
      logoUrl: newTeamLogoUrl.trim() || undefined,
      players: [],
    };

    setTeams((prev) => [...prev, newTeam]);
    setIsCreateModalOpen(false);
    setNewTeamName('');
    setNewTeamShortName('');
    setNewTeamColor('#D97706');
    setNewTeamLogoUrl('');

    // Persist to database
    await saveCricketTeamToDb(newTeam);
  };

  // Delete Team
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to delete team "${teamName}"? All assigned players will return to the unassigned pool.`)) {
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    await deleteCricketTeamFromDb(teamId);
  };

  // Assign Player to Team
  const handleAssignPlayer = (player: CricketPlayer, teamId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        // If player was already in this team, ignore
        if (team.id === teamId) {
          const exists = team.players.some((p) => p.id === player.id || p.registrationId === player.id);
          if (exists) return team;
          return {
            ...team,
            players: [...team.players, { ...player, isCaptain: false, isViceCaptain: false }],
          };
        }
        // Remove from any other team
        return {
          ...team,
          players: team.players.filter((p) => p.id !== player.id && p.registrationId !== player.id),
        };
      })
    );
    setActiveAssignPlayerId(null);
  };

  // Remove Player from Team
  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.filter((p) => p.id !== playerId && p.registrationId !== playerId),
        };
      })
    );
  };

  // Toggle Captain Status
  const handleToggleCaptain = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.map((p) => {
            if (p.id === playerId || p.registrationId === playerId) {
              const willBeCaptain = !p.isCaptain;
              return {
                ...p,
                isCaptain: willBeCaptain,
                isViceCaptain: willBeCaptain ? false : p.isViceCaptain,
              };
            }
            // If another player was captain and we just made this one captain, remove old captain
            return {
              ...p,
              isCaptain: false,
            };
          }),
        };
      })
    );
  };

  // Toggle Vice Captain Status
  const handleToggleViceCaptain = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.map((p) => {
            if (p.id === playerId || p.registrationId === playerId) {
              const willBeVc = !p.isViceCaptain;
              return {
                ...p,
                isViceCaptain: willBeVc,
                isCaptain: willBeVc ? false : p.isCaptain,
              };
            }
            return {
              ...p,
              isViceCaptain: false,
            };
          }),
        };
      })
    );
  };

  // Auto-Draft / Balance Unassigned Players
  const handleAutoDraft = () => {
    if (teams.length === 0) {
      alert('Please create at least one team before running Auto-Draft!');
      return;
    }

    const unassigned = registeredPlayers.filter(
      (p) => !playerAssignmentMap.has(p.id) && (!p.registrationId || !playerAssignmentMap.has(p.registrationId))
    );

    if (unassigned.length === 0) {
      alert('All registered players are already assigned to teams!');
      return;
    }

    // Shuffle unassigned players
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);

    const updatedTeams = teams.map((t) => ({ ...t, players: [...t.players] }));

    shuffled.forEach((player, idx) => {
      const targetTeamIndex = idx % updatedTeams.length;
      updatedTeams[targetTeamIndex].players.push({
        ...player,
        isCaptain: false,
        isViceCaptain: false,
      });
    });

    setTeams(updatedTeams);
  };

  // Save All Teams to MySQL DB
  const handleSaveAllTeams = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      for (const team of teams) {
        await saveCricketTeamToDb(team);
      }
      setSaveSuccessMsg('All teams and squads saved successfully to MySQL!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Failed to save teams: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Export Teams to CSV
  const handleExportTeams = () => {
    if (teams.length === 0) {
      alert('No teams available to export.');
      return;
    }

    const headers = ['Team Name', 'Team Short Code', 'Player Name', 'Role', 'Captaincy', 'Mobile', 'Centre'];
    const rows: string[][] = [];

    teams.forEach((team) => {
      if (team.players.length === 0) {
        rows.push([team.name, team.shortName, '(No Players Assigned)', '-', '-', '-', '-']);
      } else {
        team.players.forEach((player) => {
          let cap = 'Player';
          if (player.isCaptain) cap = 'Captain (C)';
          else if (player.isViceCaptain) cap = 'Vice-Captain (VC)';

          rows.push([
            team.name,
            team.shortName,
            player.name,
            player.role || 'Player',
            cap,
            player.mobile || '-',
            player.centre || '-',
          ]);
        });
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RPL_Season9_${selectedSport.toUpperCase()}_Teams.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Sport Selector Ribbon */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">RPL Team Maker</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider border border-amber-300">
                  {teams.length} Teams Built
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Draft and assign registered tournament players into official teams with captains and vice-captains.
              </p>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoDraft}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Evenly distribute unassigned registered players across all created teams"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-Draft</span>
            </button>

            <button
              type="button"
              onClick={handleExportTeams}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Download Team Sheets as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Team</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAllTeams}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-slate-900/20 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Squads'}</span>
            </button>
          </div>
        </div>

        {/* Save Notification alert */}
        {saveSuccessMsg && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Sport Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 mobile-hide-scrollbar border-t border-slate-100 pt-3">
          {AVAILABLE_SPORTS.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelectedSport(sport.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-amber-300 shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Player Pool (Left) + Teams Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Registered Players Pool (5 Cols on LG) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Registered Players ({registeredPlayers.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {filteredPlayerPool.length} displayed
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search player by name, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setPoolFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  poolFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({registeredPlayers.length})
              </button>
              <button
                type="button"
                onClick={() => setPoolFilter('unassigned')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  poolFilter === 'unassigned'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unassigned (
                {
                  registeredPlayers.filter(
                    (p) => !playerAssignmentMap.has(p.id) && (!p.registrationId || !playerAssignmentMap.has(p.registrationId))
                  ).length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setPoolFilter('assigned')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  poolFilter === 'assigned'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Assigned (
                {
                  registeredPlayers.filter(
                    (p) => playerAssignmentMap.has(p.id) || (p.registrationId && playerAssignmentMap.has(p.registrationId))
                  ).length
                }
                )
              </button>
            </div>
          </div>

          {/* Players List Container */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPlayerPool.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No players found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {searchTerm ? 'Try adjusting your search criteria' : `No registrations found for ${selectedSport}`}
                </p>
              </div>
            ) : (
              filteredPlayerPool.map((player) => {
                const assigned = playerAssignmentMap.get(player.id) || (player.registrationId ? playerAssignmentMap.get(player.registrationId) : null);
                const isDropdownOpen = activeAssignPlayerId === player.id;

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      assigned
                        ? 'bg-slate-50/70 border-slate-200/60'
                        : 'bg-white border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Player Info */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-extrabold text-xs text-slate-700 shrink-0 overflow-hidden">
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          player.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{player.name}</h4>
                          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono text-[9px] shrink-0">
                            {player.role || 'Player'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium mt-0.5">
                          {player.centre && (
                            <span className="flex items-center space-x-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{player.centre}</span>
                            </span>
                          )}
                          {player.mobile && (
                            <span className="flex items-center space-x-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{player.mobile}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action / Assignment Pill */}
                    <div className="relative shrink-0">
                      {assigned ? (
                        <div className="flex items-center space-x-1">
                          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] whitespace-nowrap">
                            {assigned.teamName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayerFromTeam(assigned.teamId, player.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from team"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            onClick={() => setActiveAssignPlayerId(isDropdownOpen ? null : player.id)}
                            className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-[10px] transition-all flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <UserPlus className="w-3 h-3 text-amber-600" />
                            <span>Add to Team</span>
                            <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                          </button>

                          {/* Quick Team Selection Dropdown */}
                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-fadeIn space-y-1">
                              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Select Target Team
                              </div>
                              {teams.length === 0 ? (
                                <p className="px-2 py-1 text-[11px] text-slate-400">Create a team first</p>
                              ) : (
                                teams.map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleAssignPlayer(player, t.id)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-950 transition-colors flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-1.5 truncate">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: t.colorCode }}
                                      />
                                      <span className="truncate">{t.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {t.players.length}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Teams Board (7 Cols on LG) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {selectedSport.toUpperCase()} Teams & Squads ({teams.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Click Captain or Vice-Captain toggles on assigned players to set leadership.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team</span>
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-800">No Teams Created Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the "+ New Team" button above to create your first team and start drafting registered players.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-amber-300 font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Create Team Now
                </button>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all"
                >
                  {/* Team Card Header Banner */}
                  <div
                    className="p-4 flex items-center justify-between text-white"
                    style={{ backgroundColor: team.colorCode || '#D97706' }}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-black/20 backdrop-blur-xs flex items-center justify-center font-extrabold text-xs text-white border border-white/20 shrink-0">
                        {team.shortName || team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-white tracking-tight truncate drop-shadow-xs">
                          {team.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                          {team.players.length} Players Drafted
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-all cursor-pointer"
                      title="Delete team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Team Squad List */}
                  <div className="p-3.5 flex-1 space-y-1.5 max-h-[300px] overflow-y-auto">
                    {team.players.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <UserPlus className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        <p className="text-xs font-semibold">No players drafted yet</p>
                        <p className="text-[10px] opacity-75">Add players from the left pool</p>
                      </div>
                    ) : (
                      team.players.map((player) => (
                        <div
                          key={player.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-2 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs text-slate-800 truncate">{player.name}</span>
                                {player.isCaptain && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] tracking-wider uppercase shrink-0">
                                    C
                                  </span>
                                )}
                                {player.isViceCaptain && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-cyan-600 text-white font-black text-[9px] tracking-wider uppercase shrink-0">
                                    VC
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium block truncate">
                                {player.role || 'Player'} {player.centre ? `• ${player.centre}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Quick Captaincy Controls */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleCaptain(team.id, player.id)}
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all cursor-pointer ${
                                player.isCaptain
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                              }`}
                              title="Set as Captain"
                            >
                              C
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleViceCaptain(team.id, player.id)}
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all cursor-pointer ${
                                player.isViceCaptain
                                  ? 'bg-cyan-600 text-white font-black shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-cyan-50'
                              }`}
                              title="Set as Vice-Captain"
                            >
                              VC
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePlayerFromTeam(team.id, player.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove player"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE NEW TEAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Create New Team</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Add a new squad for {selectedSport}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mewar Strikers, Surat Smashers"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Short Code (2-3 letters)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. MS, SS, RT (auto-filled if empty)"
                  value={newTeamShortName}
                  onChange={(e) => setNewTeamShortName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Team Theme Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = newTeamColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setNewTeamColor(color.hex)}
                        className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/10'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.bg}`} />
                        <span className="text-[10px] font-bold text-slate-700 truncate">{color.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
