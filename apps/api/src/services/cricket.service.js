import pool, { RPL_DB } from '../config/db.js';

/**
 * Fetch all cricket teams with squads
 */
export async function getAllTeams() {
  const [rows] = await pool.query(`SELECT * FROM rpl_cricket_teams ORDER BY name ASC`);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    shortName: r.short_name,
    logoUrl: r.logo_url,
    colorCode: r.color_code,
    players: typeof r.players === 'string' ? JSON.parse(r.players) : (r.players || []),
  }));
}

/**
 * Create or save a new team with roster
 */
export async function createTeam(team) {
  const id = team.id || `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const name = team.name || 'New Team';
  const shortName = team.shortName || team.name?.substring(0, 3).toUpperCase() || 'NEW';
  const logoUrl = team.logoUrl || null;
  const colorCode = team.colorCode || '#F59E0B';
  const players = JSON.stringify(team.players || []);

  await pool.query(
    `INSERT INTO rpl_cricket_teams (id, name, short_name, logo_url, color_code, players)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       short_name = VALUES(short_name),
       logo_url = VALUES(logo_url),
       color_code = VALUES(color_code),
       players = VALUES(players)`,
    [id, name, shortName, logoUrl, colorCode, players]
  );

  return { id, name, shortName, logoUrl, colorCode, players: team.players || [] };
}

/**
 * Update an existing team
 */
export async function updateTeam(id, team) {
  const name = team.name;
  const shortName = team.shortName;
  const logoUrl = team.logoUrl;
  const colorCode = team.colorCode;
  const players = JSON.stringify(team.players || []);

  await pool.query(
    `UPDATE rpl_cricket_teams 
     SET name = COALESCE(?, name),
         short_name = COALESCE(?, short_name),
         logo_url = COALESCE(?, logo_url),
         color_code = COALESCE(?, color_code),
         players = ?
     WHERE id = ?`,
    [name, shortName, logoUrl, colorCode, players, id]
  );

  return { id, ...team };
}

/**
 * Delete a team
 */
export async function deleteTeam(id) {
  await pool.query(`DELETE FROM rpl_cricket_teams WHERE id = ?`, [id]);
  return { success: true, id };
}

/**
 * Fetch all matches with team details & innings JSON
 */
export async function getAllMatches() {
  const teams = await getAllTeams();
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const [rows] = await pool.query(`
    SELECT * FROM rpl_cricket_matches 
    ORDER BY match_number ASC, created_at DESC
  `);

  return rows.map((r) => {
    const teamA = teamMap.get(r.team_a_id) || {
      id: r.team_a_id,
      name: 'Team A',
      shortName: 'TMA',
      colorCode: '#D97706',
      players: [],
    };
    const teamB = teamMap.get(r.team_b_id) || {
      id: r.team_b_id,
      name: 'Team B',
      shortName: 'TMB',
      colorCode: '#0891B2',
      players: [],
    };

    return {
      id: r.id,
      tournamentName: r.tournament_name,
      matchNumber: r.match_number,
      stage: r.stage,
      venue: r.venue,
      oversPerSide: r.overs_per_side,
      teamA,
      teamB,
      tossWinnerId: r.toss_winner_id,
      tossDecision: r.toss_decision,
      status: r.status,
      currentInningsNumber: r.current_innings_number || 1,
      target: r.target,
      winnerTeamId: r.winner_team_id,
      resultSummary: r.result_summary,
      innings1: typeof r.innings1 === 'string' ? JSON.parse(r.innings1) : r.innings1,
      innings2: r.innings2
        ? typeof r.innings2 === 'string'
          ? JSON.parse(r.innings2)
          : r.innings2
        : undefined,
      streamOverlayToken: r.stream_overlay_token,
    };
  });
}

/**
 * Fetch a single match by ID
 */
export async function getMatchById(id) {
  const matches = await getAllMatches();
  return matches.find((m) => m.id === id) || null;
}

/**
 * Create a new scheduled match
 */
export async function createMatch(m) {
  const [result] = await pool.query(
    `INSERT INTO rpl_cricket_matches
      (id, tournament_name, match_number, stage, venue, overs_per_side, team_a_id, team_b_id, toss_winner_id, toss_decision, status, current_innings_number, target, innings1, innings2, stream_overlay_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       match_number = VALUES(match_number)`,
    [
      m.id,
      m.tournamentName || 'RPL Season 9 Premier Cup',
      m.matchNumber || 1,
      m.stage || 'League Match',
      m.venue || 'RPL Main Stadium',
      m.oversPerSide || 10,
      m.teamA?.id || m.team_a_id,
      m.teamB?.id || m.team_b_id,
      m.tossWinnerId || null,
      m.tossDecision || null,
      m.status || 'upcoming',
      m.currentInningsNumber || 1,
      m.target || null,
      JSON.stringify(m.innings1 || {}),
      m.innings2 ? JSON.stringify(m.innings2) : null,
      m.streamOverlayToken || null,
    ]
  );
  return getMatchById(m.id);
}

/**
 * Update a match (live scores, status, winner, balls)
 */
export async function updateMatch(id, m) {
  await pool.query(
    `UPDATE rpl_cricket_matches SET
      status = ?,
      current_innings_number = ?,
      target = ?,
      winner_team_id = ?,
      result_summary = ?,
      innings1 = ?,
      innings2 = ?,
      overs_per_side = ?
     WHERE id = ?`,
    [
      m.status || 'live',
      m.currentInningsNumber || 1,
      m.target || null,
      m.winnerTeamId || null,
      m.resultSummary || null,
      JSON.stringify(m.innings1 || {}),
      m.innings2 ? JSON.stringify(m.innings2) : null,
      m.oversPerSide || 10,
      id,
    ]
  );
  return getMatchById(id);
}

/**
 * Delete a match
 */
export async function deleteMatch(id) {
  await pool.query(`DELETE FROM rpl_cricket_matches WHERE id = ?`, [id]);
  return { success: true, deletedId: id };
}
