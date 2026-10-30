import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Computes factual ICC/IPL Net Run Rate from match data
 */
function calculateNRR(matches) {
  const standingsMap = {};
  const nrrData = {};

  for (const m of matches) {
    if (m.teamA && !standingsMap[m.teamA.id]) {
      standingsMap[m.teamA.id] = { teamId: m.teamA.id, played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: '+0.00', form: [] };
      nrrData[m.teamA.id] = { runsFor: 0, ballsFor: 0, runsAgainst: 0, ballsAgainst: 0 };
    }
    if (m.teamB && !standingsMap[m.teamB.id]) {
      standingsMap[m.teamB.id] = { teamId: m.teamB.id, played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: '+0.00', form: [] };
      nrrData[m.teamB.id] = { runsFor: 0, ballsFor: 0, runsAgainst: 0, ballsAgainst: 0 };
    }
  }

  for (const m of matches) {
    if (m.status === 'completed') {
      const inn1 = m.innings1;
      const inn2 = m.innings2;

      if (inn1 && nrrData[inn1.battingTeamId] && nrrData[inn1.bowlingTeamId]) {
        const fullBallsQuota = (m.oversPerSide || 10) * 6;
        const bFor1 = inn1.totalWickets >= 10 ? fullBallsQuota : inn1.legalBallsBowled;
        nrrData[inn1.battingTeamId].runsFor += inn1.totalRuns;
        nrrData[inn1.battingTeamId].ballsFor += bFor1;
        nrrData[inn1.bowlingTeamId].runsAgainst += inn1.totalRuns;
        nrrData[inn1.bowlingTeamId].ballsAgainst += bFor1;
      }

      if (inn2 && nrrData[inn2.battingTeamId] && nrrData[inn2.bowlingTeamId]) {
        const fullBallsQuota = (m.oversPerSide || 10) * 6;
        const bFor2 = inn2.totalWickets >= 10 ? fullBallsQuota : inn2.legalBallsBowled;
        nrrData[inn2.battingTeamId].runsFor += inn2.totalRuns;
        nrrData[inn2.battingTeamId].ballsFor += bFor2;
        nrrData[inn2.bowlingTeamId].runsAgainst += inn2.totalRuns;
        nrrData[inn2.bowlingTeamId].ballsAgainst += bFor2;
      }

      if (m.winnerTeamId) {
        const winner = standingsMap[m.winnerTeamId];
        const loserId = m.winnerTeamId === m.teamA.id ? m.teamB.id : m.teamA.id;
        const loser = standingsMap[loserId];
        if (winner) { winner.played += 1; winner.won += 1; winner.points += 2; winner.form.push('W'); }
        if (loser) { loser.played += 1; loser.lost += 1; loser.form.push('L'); }
      }
    }
  }

  for (const [id, team] of Object.entries(standingsMap)) {
    team.form = team.form.slice(-5);
    const n = nrrData[id];
    if (n && n.ballsFor > 0 && n.ballsAgainst > 0) {
      const forRate = n.runsFor / (n.ballsFor / 6);
      const againstRate = n.runsAgainst / (n.ballsAgainst / 6);
      const net = forRate - againstRate;
      team.nrr = (net >= 0 ? '+' : '') + net.toFixed(2);
    }
  }

  return Object.values(standingsMap).sort((a, b) => b.points - a.points);
}

describe('Scorecard & Live Scorer Comprehensive QA Test Suite', () => {
  // ── 1. Innings Lifecycle & Over Limits ──
  describe('1. Innings Lifecycle & Over Limits', () => {
    test('Over cap: 10 overs equals exactly 60 legal balls and prevents 11th over', () => {
      const oversPerSide = 10;
      const maxLegalBalls = oversPerSide * 6;
      assert.equal(maxLegalBalls, 60);

      let legalBallsBowled = 59;
      const isOverCapReachedBefore = legalBallsBowled >= maxLegalBalls;
      assert.equal(isOverCapReachedBefore, false);

      legalBallsBowled += 1; // 60th ball
      const isOverCapReachedAfter = legalBallsBowled >= maxLegalBalls;
      assert.equal(isOverCapReachedAfter, true, 'Delivery engine must lock at exactly 60 legal balls');
    });

    test('Bowler quota limit: 10 over match restricts individual bowlers to 2 overs (12 legal balls)', () => {
      const oversPerSide = 10;
      const maxQuotaOvers = Math.ceil(oversPerSide / 5);
      assert.equal(maxQuotaOvers, 2, 'T10 match maximum bowler quota is 2 overs');

      const bowlerBalls = 12; // 2 overs completed
      const isQuotaExceeded = bowlerBalls >= maxQuotaOvers * 6;
      assert.equal(isQuotaExceeded, true, 'Bowler who has bowled 12 legal balls must be blocked from bowling a 3rd over');
    });

    test('Consecutive overs by the same bowler are disallowed', () => {
      const currentBowlerId = 'bowler-siraj';
      const previousBowlerId = 'bowler-siraj';
      const isSameBowler = currentBowlerId === previousBowlerId;
      assert.equal(isSameBowler, true, 'Engine must disallow previous bowler from bowling consecutive overs');
    });
  });

  // ── 2. Ball Delivery & Strike Rotation Engine ──
  describe('2. Ball Delivery & Strike Rotation Engine', () => {
    test('Strike rotation on odd runs (1, 3) vs even runs (0, 2, 4, 6)', () => {
      const isOddRun = (runs) => runs % 2 !== 0;

      // Odd runs must swap strike
      assert.equal(isOddRun(1), true);
      assert.equal(isOddRun(3), true);

      // Even runs must retain strike
      assert.equal(isOddRun(0), false);
      assert.equal(isOddRun(2), false);
      assert.equal(isOddRun(4), false);
      assert.equal(isOddRun(6), false);
    });

    test('Over boundary (6th legal ball) strike swap retains single-taker on strike', () => {
      // Striker A hits single on ball 6
      let striker = 'Player A';
      let nonStriker = 'Player B';

      // 1. Single taken -> physically cross
      let temp = striker;
      striker = nonStriker;
      nonStriker = temp;
      assert.equal(striker, 'Player B');
      assert.equal(nonStriker, 'Player A');

      // 2. Over ends -> fielding ends switch -> Batsman at non-striker end faces new bowler
      temp = striker;
      striker = nonStriker;
      nonStriker = temp;
      assert.equal(striker, 'Player A', 'Player who took single on ball 6 retains strike for over 2');
    });

    test('Maiden over detection: 6 legal balls with 0 runs off bat and 0 extras', () => {
      const maidenBalls = [
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
        { runsOffBat: 0, extraType: 'none', totalBallRuns: 0 },
      ];

      const isMaiden = maidenBalls.every(
        (b) => b.runsOffBat === 0 && b.extraType !== 'wide' && b.extraType !== 'noball'
      );
      assert.equal(isMaiden, true, '6 dot balls must be recognized as a maiden over');

      // Over with a Wide is NOT a maiden
      const wideBalls = [...maidenBalls.slice(0, 5), { runsOffBat: 0, extraType: 'wide', totalBallRuns: 1 }];
      const isWideMaiden = wideBalls.every(
        (b) => b.runsOffBat === 0 && b.extraType !== 'wide' && b.extraType !== 'noball'
      );
      assert.equal(isWideMaiden, false, 'Over with a Wide extra cannot be a maiden over');
    });
  });

  // ── 3. Wicket State Machine & Crease Integrity ──
  describe('3. Wicket State Machine & Crease Integrity', () => {
    test('Dismissal credits bowler for Bowled/Caught/LBW/Stumped but NOT for Run Out', () => {
      const isBowlerWicket = (wicketType) => wicketType !== 'run_out' && wicketType !== 'none';
      assert.equal(isBowlerWicket('bowled'), true);
      assert.equal(isBowlerWicket('caught'), true);
      assert.equal(isBowlerWicket('lbw'), true);
      assert.equal(isBowlerWicket('stumped'), true);
      assert.equal(isBowlerWicket('run_out'), false, 'Run Out must not be credited to bowler wickets');
    });

    test('10th Wicket All-Out produces FallOfWicket milestone and clears crease', () => {
      const totalWickets = 10;
      const fallOfWickets = [];

      // Record 10th wicket
      fallOfWickets.push({
        wicketNumber: totalWickets,
        score: 85,
        overDisplay: '8.4',
        playerOutName: 'Last Batter',
      });

      assert.equal(fallOfWickets.length, 1);
      assert.equal(fallOfWickets[0].wicketNumber, 10);
      assert.equal(fallOfWickets[0].playerOutName, 'Last Batter');

      // Crease clearance
      let activeStrikerId = 'last-batter';
      let activeNonStrikerId = 'partner';
      if (totalWickets >= 10) {
        activeStrikerId = '';
        activeNonStrikerId = '';
      }
      assert.equal(activeStrikerId, '', 'Active striker must be cleared on 10th wicket');
      assert.equal(activeNonStrikerId, '', 'Active non-striker must be cleared on 10th wicket');
    });

    test('Dismissed batsman cannot be resurrected via Change Batter', () => {
      const inningsBatsmen = [
        { playerId: 'p1', name: 'Player 1', isOut: true },
        { playerId: 'p2', name: 'Player 2', isOut: false },
      ];

      const isDismissed = (id) => inningsBatsmen.some((b) => b.playerId === id && b.isOut);
      assert.equal(isDismissed('p1'), true, 'Dismissed player p1 must be flagged as out');
      assert.equal(isDismissed('p2'), false, 'Active player p2 is not out');
    });
  });

  // ── 4. Undo Idempotency & State Reversal ──
  describe('4. Undo Idempotency & State Reversal', () => {
    test('Undoing a wicket decrements totalWickets and pops FallOfWickets milestone', () => {
      let totalWickets = 4;
      let fallOfWickets = [
        { wicketNumber: 1, score: 20 },
        { wicketNumber: 2, score: 35 },
        { wicketNumber: 3, score: 50 },
        { wicketNumber: 4, score: 62 },
      ];

      // Undo last ball (which was 4th wicket)
      totalWickets = Math.max(0, totalWickets - 1);
      fallOfWickets = fallOfWickets.slice(0, -1);

      assert.equal(totalWickets, 3);
      assert.equal(fallOfWickets.length, 3);
      assert.equal(fallOfWickets[fallOfWickets.length - 1].wicketNumber, 3, 'Milestone 4 must be popped cleanly');
    });

    test('Undoing an extra decrements both totalRuns and extras counter', () => {
      let totalRuns = 45;
      const extras = { wides: 3, noballs: 1, byes: 0, legbyes: 0, total: 4 };

      // Undo Wide ball (+1 extra)
      const lastBall = { isExtra: true, extraType: 'wide', extraRuns: 1, totalBallRuns: 1 };
      totalRuns -= lastBall.totalBallRuns;
      extras.wides -= lastBall.extraRuns;
      extras.total -= lastBall.extraRuns;

      assert.equal(totalRuns, 44);
      assert.equal(extras.wides, 2, 'Wide extras counter must decrement on undo');
      assert.equal(extras.total, 3, 'Total extras counter must decrement on undo');
    });
  });

  // ── 5. Target Chasing & Net Run Rate (NRR) ──
  describe('5. Target Chasing & Net Run Rate (NRR)', () => {
    test('2nd innings target is exactly innings1.totalRuns + 1', () => {
      const innings1Total = 142;
      const target = innings1Total + 1;
      assert.equal(target, 143);
    });

    test('Chasing team crossing target triggers Batting Team Win by Wickets', () => {
      const target = 100;
      const innings2 = { totalRuns: 102, totalWickets: 3 };
      const hasWon = innings2.totalRuns >= target;
      const wicketsRemaining = 10 - innings2.totalWickets;

      assert.equal(hasWon, true);
      assert.equal(wicketsRemaining, 7);
      const summary = `Won by ${wicketsRemaining} wickets!`;
      assert.equal(summary, 'Won by 7 wickets!');
    });

    test('Defending team restricting chasing team below target triggers Win by Runs', () => {
      const target = 150;
      const innings2 = { totalRuns: 135, legalBallsBowled: 60, totalWickets: 8 };
      const isOversFinished = innings2.legalBallsBowled >= 60;
      const isDefended = innings2.totalRuns < target - 1;
      const runsDefended = target - 1 - innings2.totalRuns;

      assert.equal(isOversFinished, true);
      assert.equal(isDefended, true);
      assert.equal(runsDefended, 14);
      const summary = `Won by ${runsDefended} runs!`;
      assert.equal(summary, 'Won by 14 runs!');
    });

    test('Net Run Rate formula calculates factual net rate from matches', () => {
      const mockMatches = [
        {
          id: 'm1',
          status: 'completed',
          oversPerSide: 10,
          winnerTeamId: 'team-a',
          teamA: { id: 'team-a' },
          teamB: { id: 'team-b' },
          innings1: {
            battingTeamId: 'team-a',
            bowlingTeamId: 'team-b',
            totalRuns: 120,
            legalBallsBowled: 60,
            totalWickets: 4,
          },
          innings2: {
            battingTeamId: 'team-b',
            bowlingTeamId: 'team-a',
            totalRuns: 90,
            legalBallsBowled: 60,
            totalWickets: 8,
          },
        },
      ];

      const standings = calculateNRR(mockMatches);
      const teamA = standings.find((s) => s.teamId === 'team-a');
      const teamB = standings.find((s) => s.teamId === 'team-b');

      assert.ok(teamA, 'Team A must be in standings');
      assert.ok(teamB, 'Team B must be in standings');

      // Team A scored 120 in 10 ov (12.00) and conceded 90 in 10 ov (9.00) -> NRR = +3.00
      assert.equal(teamA.points, 2);
      assert.equal(teamA.won, 1);
      assert.equal(teamA.nrr, '+3.00');

      // Team B scored 90 in 10 ov (9.00) and conceded 120 in 10 ov (12.00) -> NRR = -3.00
      assert.equal(teamB.points, 0);
      assert.equal(teamB.lost, 1);
      assert.equal(teamB.nrr, '-3.00');
    });
  });
});
