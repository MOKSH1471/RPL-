import { test } from 'node:test';
import assert from 'node:assert/strict';

// Core Admin Filter Utility
function filterRegistrations(registrations, { statusFilter = 'all', sportFilter = 'all', accFilter = 'all' } = {}) {
  return registrations.filter((r) => {
    let gen = {};
    try {
      gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
    } catch (e) {
      gen = {};
    }

    const isArchived = Boolean(r.is_archived || gen.isArchived);

    // Status filter
    if (statusFilter === 'archived') {
      if (!isArchived) return false;
    } else if (statusFilter !== 'all') {
      if (isArchived) return false;
      const pStatus = (r.payment_status || 'pending').toLowerCase();
      if (pStatus !== statusFilter) return false;
    }

    // Sport filter
    if (sportFilter !== 'all') {
      let sports = [];
      try {
        sports = typeof r.sports === 'string' ? JSON.parse(r.sports || '[]') : (r.sports || []);
      } catch (e) {
        sports = [];
      }
      if (!Array.isArray(sports) || !sports.includes(sportFilter)) return false;
    }

    // Accommodation filter
    if (accFilter !== 'all') {
      const acc = gen.accommodationRequired || r.accommodation_required || 'No';
      if (acc !== accFilter) return false;
    }

    return true;
  });
}

// Flat Roster Exporter
function formatRosterRow(r) {
  let gen = {};
  let sports = [];
  try {
    gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
  } catch (e) {}
  try {
    sports = typeof r.sports === 'string' ? JSON.parse(r.sports || '[]') : (r.sports || []);
  } catch (e) {}

  return {
    id: r.id,
    fullName: r.full_name || gen.fullName || '',
    mobile: r.mobile || gen.mobile || '',
    gender: gen.gender || r.gender || '',
    sports: Array.isArray(sports) ? sports.join(', ') : '',
    paymentStatus: r.payment_status || 'pending',
    paymentId: r.payment_id || gen.paymentId || 'N/A',
    accommodation: gen.accommodationRequired || 'No',
    roomNo: r.room_number || gen.allocatedRoom || 'UNASSIGNED',
  };
}

// Stats Aggregator
function aggregateRegistrationStats(registrations) {
  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let archived = 0;
  let accommodationCount = 0;
  const sportsCount = {};

  for (const r of registrations) {
    let gen = {};
    let sports = [];
    try {
      gen = typeof r.general_details === 'string' ? JSON.parse(r.general_details || '{}') : (r.general_details || {});
      sports = typeof r.sports === 'string' ? JSON.parse(r.sports || '[]') : (r.sports || []);
    } catch (e) {}

    const isArchived = Boolean(r.is_archived || gen.isArchived);
    if (isArchived) {
      archived++;
      continue;
    }

    const pStatus = (r.payment_status || 'pending').toLowerCase();
    if (pStatus === 'approved') approved++;
    else if (pStatus === 'rejected') rejected++;
    else pending++;

    if (gen.accommodationRequired === 'Yes' || r.accommodation_required === 'Yes') {
      accommodationCount++;
    }

    if (Array.isArray(sports)) {
      for (const s of sports) {
        sportsCount[s] = (sportsCount[s] || 0) + 1;
      }
    }
  }

  return {
    total: registrations.length,
    active: registrations.length - archived,
    approved,
    pending,
    rejected,
    archived,
    accommodationCount,
    sportsCount,
  };
}

// --- Test Suites ---

test('Admin Registrations: filters by payment status correctly', () => {
  const dataset = [
    { id: '1', payment_status: 'approved', is_archived: 0 },
    { id: '2', payment_status: 'pending', is_archived: 0 },
    { id: '3', payment_status: 'rejected', is_archived: 0 },
    { id: '4', payment_status: 'approved', is_archived: 1 }, // archived
  ];

  const approved = filterRegistrations(dataset, { statusFilter: 'approved' });
  assert.strictEqual(approved.length, 1);
  assert.strictEqual(approved[0].id, '1');

  const archived = filterRegistrations(dataset, { statusFilter: 'archived' });
  assert.strictEqual(archived.length, 1);
  assert.strictEqual(archived[0].id, '4');
});

test('Admin Registrations: filters by sport choice correctly', () => {
  const dataset = [
    { id: '1', sports: JSON.stringify(['cricket']), payment_status: 'approved' },
    { id: '2', sports: JSON.stringify(['football', 'badminton']), payment_status: 'approved' },
    { id: '3', sports: JSON.stringify(['cricket', 'football']), payment_status: 'approved' },
  ];

  const cricketPlayers = filterRegistrations(dataset, { sportFilter: 'cricket' });
  assert.strictEqual(cricketPlayers.length, 2);
  assert.deepStrictEqual(cricketPlayers.map(p => p.id), ['1', '3']);

  const badmintonPlayers = filterRegistrations(dataset, { sportFilter: 'badminton' });
  assert.strictEqual(badmintonPlayers.length, 1);
  assert.strictEqual(badmintonPlayers[0].id, '2');
});

test('Admin Registrations: filters by accommodation requirement', () => {
  const dataset = [
    { id: '1', general_details: JSON.stringify({ accommodationRequired: 'Yes' }) },
    { id: '2', general_details: JSON.stringify({ accommodationRequired: 'No' }) },
    { id: '3', general_details: JSON.stringify({}) },
  ];

  const withAcc = filterRegistrations(dataset, { accFilter: 'Yes' });
  assert.strictEqual(withAcc.length, 1);
  assert.strictEqual(withAcc[0].id, '1');

  const withoutAcc = filterRegistrations(dataset, { accFilter: 'No' });
  assert.strictEqual(withoutAcc.length, 2);
});

test('Admin Registrations: exports clean formatted roster rows for Excel/CSV', () => {
  const raw = {
    id: 'reg_abc123',
    full_name: 'Harshil K',
    mobile: '9876543210',
    sports: JSON.stringify(['cricket', 'badminton']),
    payment_status: 'approved',
    payment_id: 'pay_live_789',
    room_number: 'B-204',
    general_details: JSON.stringify({
      gender: 'Male',
      accommodationRequired: 'Yes',
    }),
  };

  const formatted = formatRosterRow(raw);
  assert.strictEqual(formatted.id, 'reg_abc123');
  assert.strictEqual(formatted.fullName, 'Harshil K');
  assert.strictEqual(formatted.mobile, '9876543210');
  assert.strictEqual(formatted.gender, 'Male');
  assert.strictEqual(formatted.sports, 'cricket, badminton');
  assert.strictEqual(formatted.paymentStatus, 'approved');
  assert.strictEqual(formatted.paymentId, 'pay_live_789');
  assert.strictEqual(formatted.accommodation, 'Yes');
  assert.strictEqual(formatted.roomNo, 'B-204');
});

test('Admin Registrations: aggregates tournament-wide stats and sport headcounts', () => {
  const dataset = [
    { id: '1', payment_status: 'approved', sports: JSON.stringify(['cricket']), general_details: JSON.stringify({ accommodationRequired: 'Yes' }) },
    { id: '2', payment_status: 'approved', sports: JSON.stringify(['cricket', 'football']), general_details: JSON.stringify({ accommodationRequired: 'No' }) },
    { id: '3', payment_status: 'pending', sports: JSON.stringify(['badminton']), general_details: JSON.stringify({ accommodationRequired: 'Yes' }) },
    { id: '4', payment_status: 'rejected', sports: JSON.stringify(['football']), is_archived: 1 },
  ];

  const stats = aggregateRegistrationStats(dataset);
  assert.strictEqual(stats.total, 4);
  assert.strictEqual(stats.active, 3);
  assert.strictEqual(stats.approved, 2);
  assert.strictEqual(stats.pending, 1);
  assert.strictEqual(stats.archived, 1);
  assert.strictEqual(stats.accommodationCount, 2);
  assert.strictEqual(stats.sportsCount.cricket, 2);
  assert.strictEqual(stats.sportsCount.football, 1);
  assert.strictEqual(stats.sportsCount.badminton, 1);
});
