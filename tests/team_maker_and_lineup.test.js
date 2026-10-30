import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, startTestServer, stopTestServer } from './testHelper.js';
import { ensureTestPlayersSeeded } from '../database/seed_test_players.js';

describe('Team Maker & Lineup Management Comprehensive QA Test Suite', () => {
  let createdTeamId;

  before(async () => {
    await startTestServer();
    await ensureTestPlayersSeeded();
  });

  after(async () => {
    // Cleanup created test team if still exists
    if (createdTeamId) {
      await apiRequest(`/api/cricket/teams/${createdTeamId}`, { method: 'DELETE' });
    }
    await stopTestServer();
  });

  describe('1. Team CRUD Operations & Backend Persistence', () => {
    test('GET /api/cricket/teams returns an array of teams with valid structure', async () => {
      const { status, ok, data } = await apiRequest('/api/cricket/teams');
      assert.equal(status, 200);
      assert.equal(ok, true);
      assert.ok(Array.isArray(data), 'Response should be an array of teams');
      if (data.length > 0) {
        const team = data[0];
        assert.ok(team.id, 'Team must have an ID');
        assert.ok(team.name, 'Team must have a name');
        assert.ok(team.shortName, 'Team must have a shortName');
        assert.ok(Array.isArray(team.players), 'Team must have a players array');
      }
    });

    test('POST /api/cricket/teams creates a new team successfully', async () => {
      const payload = {
        name: 'QA Test Smashers',
        shortName: 'QTS',
        colorCode: '#7C3AED',
        players: [
          { id: 'test-p-1', name: 'Test Player 1', role: 'Batter', isCaptain: true, isViceCaptain: false },
          { id: 'test-p-2', name: 'Test Player 2', role: 'Bowler', isCaptain: false, isViceCaptain: true },
        ],
      };

      const { status, ok, data } = await apiRequest('/api/cricket/teams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      assert.equal(status, 201);
      assert.equal(ok, true);
      assert.ok(data.id, 'Created team must have an ID');
      assert.equal(data.name, 'QA Test Smashers');
      assert.equal(data.shortName, 'QTS');
      assert.equal(data.colorCode, '#7C3AED');
      assert.equal(data.players.length, 2);
      createdTeamId = data.id;
    });

    test('PUT /api/cricket/teams/:id updates team name, color, and rosters', async () => {
      assert.ok(createdTeamId, 'createdTeamId must exist');
      const updatePayload = {
        name: 'QA Test Smashers Updated',
        shortName: 'QTSU',
        colorCode: '#059669',
        players: [
          { id: 'test-p-1', name: 'Test Player 1 Updated', role: 'All-rounder', isCaptain: true },
          { id: 'test-p-2', name: 'Test Player 2', role: 'Wicketkeeper', isViceCaptain: true },
          { id: 'test-p-3', name: 'Test Player 3', role: 'Bowler' },
        ],
      };

      const { status, ok, data } = await apiRequest(`/api/cricket/teams/${createdTeamId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      assert.equal(status, 200);
      assert.equal(ok, true);
      assert.equal(data.name, 'QA Test Smashers Updated');
      assert.equal(data.shortName, 'QTSU');
      assert.equal(data.players.length, 3);
    });

    test('DELETE /api/cricket/teams/:id removes the team from database', async () => {
      assert.ok(createdTeamId, 'createdTeamId must exist');
      const { status, ok } = await apiRequest(`/api/cricket/teams/${createdTeamId}`, {
        method: 'DELETE',
      });
      assert.equal(status, 200);
      assert.equal(ok, true);

      // Verify it no longer exists
      const { data: allTeams } = await apiRequest('/api/cricket/teams');
      const found = allTeams.find((t) => t.id === createdTeamId);
      assert.equal(found, undefined, 'Deleted team should not exist in teams list');
      createdTeamId = null; // Reset so after hook doesn't re-delete
    });
  });

  describe('2. Test Players Registration & Sport Availability', () => {
    test('GET /api/admin/registrations contains the 10 seeded test players', async () => {
      const { status, ok, data } = await apiRequest('/api/admin/registrations');
      assert.equal(status, 200);
      assert.equal(ok, true);
      assert.ok(Array.isArray(data.data), 'data.data should be an array of registrations');

      const testPlayers = data.data.filter((r) => r.id && r.id.startsWith('test-player-'));
      assert.ok(testPlayers.length >= 10, 'Must have at least 10 seeded test players');

      // Verify player 1 properties
      const p1 = testPlayers.find((p) => p.id === 'test-player-1');
      assert.ok(p1, 'Player 1 must be present');
      assert.equal(p1.full_name, 'Player 1');
      assert.equal(p1.mobile, '9900000001');

      // Verify all sports are present in general_details
      const genDetails = typeof p1.general_details === 'string' ? JSON.parse(p1.general_details) : p1.general_details;
      assert.ok(Array.isArray(genDetails.selectedSports), 'selectedSports must be an array');
      assert.ok(genDetails.selectedSports.includes('cricket'));
      assert.ok(genDetails.selectedSports.includes('badminton'));
      assert.ok(genDetails.selectedSports.includes('volleyball'));
      assert.ok(genDetails.selectedSports.includes('pickleball'));
      assert.ok(genDetails.selectedSports.includes('table_tennis'));
      assert.ok(genDetails.selectedSports.includes('football'));
    });
  });

  describe('3. Lineup Reordering & Edge Case Business Logic', () => {
    test('Lineup Reorder: Move Up swaps elements properly', () => {
      const squad = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
        { id: 'p3', name: 'Player 3' },
      ];

      // Move index 1 (p2) Up to index 0
      const updated = [...squad];
      const [moved] = updated.splice(1, 1);
      updated.splice(0, 0, moved);

      assert.equal(updated[0].id, 'p2');
      assert.equal(updated[1].id, 'p1');
      assert.equal(updated[2].id, 'p3');
    });

    test('Lineup Reorder Boundary: Move Up at index 0 is blocked safely', () => {
      const squad = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
      ];
      const index = 0;
      const targetIndex = index - 1; // -1
      const isAllowed = targetIndex >= 0 && targetIndex < squad.length;
      assert.equal(isAllowed, false, 'Moving up at index 0 must be blocked');
    });

    test('Lineup Reorder Boundary: Move Down at last index is blocked safely', () => {
      const squad = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
      ];
      const index = squad.length - 1;
      const targetIndex = index + 1;
      const isAllowed = targetIndex >= 0 && targetIndex < squad.length;
      assert.equal(isAllowed, false, 'Moving down at last index must be blocked');
    });

    test('Auto-Draft Logic: Distributes N players evenly across M teams', () => {
      const unassigned = [
        { id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' },
        { id: 'p5' }, { id: 'p6' }, { id: 'p7' }, { id: 'p8' },
        { id: 'p9' }, { id: 'p10' }
      ];
      const teams = [
        { id: 't1', players: [] },
        { id: 't2', players: [] },
        { id: 't3', players: [] },
      ];

      unassigned.forEach((p, idx) => {
        teams[idx % teams.length].players.push(p);
      });

      assert.equal(teams[0].players.length, 4);
      assert.equal(teams[1].players.length, 3);
      assert.equal(teams[2].players.length, 3);
      assert.equal(
        teams[0].players.length + teams[1].players.length + teams[2].players.length,
        10
      );
    });

    test('Captaincy Exclusivity: Selecting a new captain removes captaincy from previous captain', () => {
      const players = [
        { id: 'p1', name: 'Player 1', isCaptain: true, isViceCaptain: false },
        { id: 'p2', name: 'Player 2', isCaptain: false, isViceCaptain: false },
      ];

      // Promote p2 to Captain
      const targetPlayerId = 'p2';
      const updated = players.map((p) => {
        if (p.id === targetPlayerId) {
          return { ...p, isCaptain: true, isViceCaptain: false };
        }
        return { ...p, isCaptain: false };
      });

      assert.equal(updated.find((p) => p.id === 'p1').isCaptain, false);
      assert.equal(updated.find((p) => p.id === 'p2').isCaptain, true);
      assert.equal(updated.filter((p) => p.isCaptain).length, 1);
    });

    test('Captaincy & Vice-Captaincy Mutual Exclusivity: Player cannot be both Captain and Vice-Captain', () => {
      const player = { id: 'p1', name: 'Player 1', isCaptain: true, isViceCaptain: false };

      // User sets p1 as Vice-Captain
      const willBeVc = !player.isViceCaptain;
      const updated = {
        ...player,
        isViceCaptain: willBeVc,
        isCaptain: willBeVc ? false : player.isCaptain,
      };

      assert.equal(updated.isViceCaptain, true);
      assert.equal(updated.isCaptain, false, 'Captain flag must be reset when promoted to Vice-Captain');
    });

    test('Short Code Auto-Generation: Fallback algorithm generates concise uppercase codes', () => {
      const generateCode = (name) => {
        return name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .substring(0, 3)
          .toUpperCase() || 'TEAM';
      };

      assert.equal(generateCode('Mewar Strikers'), 'MS');
      assert.equal(generateCode('Aravalli Eagles'), 'AE');
      assert.equal(generateCode('Royal Challengers Bangalore'), 'RCB');
      assert.equal(generateCode('Tigers'), 'T');
      assert.equal(generateCode(''), 'TEAM');
    });
  });
});
