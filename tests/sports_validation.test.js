import { test } from 'node:test';
import assert from 'node:assert/strict';

const VALID_SPORTS = [
  'cricket',
  'football',
  'badminton',
  'table-tennis',
  'carrom',
  'pickleball',
  'volleyball',
  'womens-sports',
  'kaccha-pakka',
  'spectator',
];

const VALID_TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function validateSportsSelection(sportsList) {
  if (!Array.isArray(sportsList) || sportsList.length === 0) {
    return { valid: false, error: 'At least one sport must be selected' };
  }

  const seen = new Set();
  for (const sport of sportsList) {
    if (!VALID_SPORTS.includes(sport)) {
      return { valid: false, error: `Invalid sport selected: ${sport}` };
    }
    if (seen.has(sport)) {
      return { valid: false, error: `Duplicate sport selected: ${sport}` };
    }
    seen.add(sport);
  }

  if (sportsList.length > 5) {
    return { valid: false, error: 'Cannot enroll in more than 5 sports due to schedule overlaps' };
  }

  return { valid: true, error: null };
}

function validateJerseyNumber(numStr) {
  if (numStr === null || numStr === undefined || numStr === '') return { valid: true }; // optional
  const num = Number(numStr);
  if (!/^\d{1,2}$/.test(String(numStr).trim()) || isNaN(num) || num < 0 || num > 99) {
    return { valid: false, error: 'Jersey number must be an integer between 0 and 99' };
  }
  return { valid: true };
}

function validateTshirtSize(size) {
  if (!size) return { valid: false, error: 'T-shirt size is required' };
  const upper = String(size).trim().toUpperCase();
  if (!VALID_TSHIRT_SIZES.includes(upper)) {
    return { valid: false, error: `Invalid T-Shirt size: ${size}. Must be one of ${VALID_TSHIRT_SIZES.join(', ')}` };
  }
  return { valid: true, sanitized: upper };
}

test('Sports Validation: accepts valid single and multi-sport choices', () => {
  assert.strictEqual(validateSportsSelection(['cricket']).valid, true);
  assert.strictEqual(validateSportsSelection(['football', 'badminton']).valid, true);
  assert.strictEqual(validateSportsSelection(['cricket', 'volleyball', 'pickleball']).valid, true);
});

test('Sports Validation: rejects duplicate sports in the same registration', () => {
  const result = validateSportsSelection(['cricket', 'football', 'cricket']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Duplicate sport selected'));
});

test('Sports Validation: rejects non-existent or unlisted sports', () => {
  const result = validateSportsSelection(['polo', 'curling']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Invalid sport selected'));
});

test('Sports Validation: validates jersey number range 0 to 99', () => {
  assert.strictEqual(validateJerseyNumber('7').valid, true);
  assert.strictEqual(validateJerseyNumber('10').valid, true);
  assert.strictEqual(validateJerseyNumber('99').valid, true);
  assert.strictEqual(validateJerseyNumber('0').valid, true);

  assert.strictEqual(validateJerseyNumber('100').valid, false);
  assert.strictEqual(validateJerseyNumber('-5').valid, false);
  assert.strictEqual(validateJerseyNumber('7A').valid, false);
  assert.strictEqual(validateJerseyNumber('abc').valid, false);
});

test('Sports Validation: validates and normalizes T-shirt sizes against official standard', () => {
  assert.strictEqual(validateTshirtSize('m').sanitized, 'M');
  assert.strictEqual(validateTshirtSize('XL').sanitized, 'XL');
  assert.strictEqual(validateTshirtSize('xxl').sanitized, 'XXL');

  assert.strictEqual(validateTshirtSize('XXXXXL').valid, false);
  assert.strictEqual(validateTshirtSize('MEDIUM').valid, false);
  assert.strictEqual(validateTshirtSize('').valid, false);
});

test('Sports Validation: accepts kaccha-pakka in valid sports', () => {
  assert.strictEqual(validateSportsSelection(['kaccha-pakka']).valid, true);
  assert.strictEqual(validateSportsSelection(['cricket', 'kaccha-pakka']).valid, true);
});

test('Sports Validation: accepts carrom in valid sports', () => {
  assert.strictEqual(validateSportsSelection(['carrom']).valid, true);
  assert.strictEqual(validateSportsSelection(['table-tennis', 'carrom']).valid, true);
});

test('Category Availability: tennis and carrom are available to all categories (male, female, kachapaka)', () => {
  function isSportAllowed(sportId, gender, age) {
    if (sportId === 'table-tennis' || sportId === 'carrom') return true;
    if (gender === 'Male' && sportId === 'womens-sports') return false;
    if (gender === 'Female' && (sportId === 'cricket' || sportId === 'football')) return false;
    if (sportId === 'kaccha-pakka') {
      if (age === null || age === undefined) return false;
      return age <= 16 || age >= 56;
    }
    return true;
  }

  // Male
  assert.strictEqual(isSportAllowed('table-tennis', 'Male', 25), true);
  assert.strictEqual(isSportAllowed('carrom', 'Male', 25), true);

  // Female
  assert.strictEqual(isSportAllowed('table-tennis', 'Female', 25), true);
  assert.strictEqual(isSportAllowed('carrom', 'Female', 25), true);

  // Kaccha Pakka (Junior <= 16)
  assert.strictEqual(isSportAllowed('table-tennis', 'Male', 12), true);
  assert.strictEqual(isSportAllowed('carrom', 'Male', 12), true);
  assert.strictEqual(isSportAllowed('table-tennis', 'Female', 14), true);
  assert.strictEqual(isSportAllowed('carrom', 'Female', 14), true);

  // Kaccha Pakka (Senior >= 56)
  assert.strictEqual(isSportAllowed('table-tennis', 'Male', 60), true);
  assert.strictEqual(isSportAllowed('carrom', 'Male', 60), true);
  assert.strictEqual(isSportAllowed('table-tennis', 'Female', 62), true);
  assert.strictEqual(isSportAllowed('carrom', 'Female', 62), true);
});

test('Sports Validation: accepts spectator in valid sports', () => {
  assert.strictEqual(validateSportsSelection(['spectator']).valid, true);
});

test('Spectator Pass Validation: verifies single-day (₹540), multi-day (₹1,080, ₹1,620), With Stay (₹2,700), optional T-shirt (+₹500), and omitted photo & family enrollment fields', () => {
  function validateSpectatorRules(payload) {
    if (payload.registrationType !== 'spectator') return { valid: false, error: 'Not spectator' };

    // Fee calculation
    const specDates = payload.spectatorDates || payload.spectatorDays || [];
    const daysCount = Array.isArray(specDates) && specDates.length > 0 ? specDates.length : (payload.daysCount || 1);
    const baseFee = payload.accommodationRequired === 'Yes' ? 2700 : (daysCount * 540);
    const tshirtCost = (payload.spectatorTshirt === 'Yes' || payload.extraTshirt === 'Yes') ? 500 : 0;
    const totalFee = baseFee + tshirtCost;

    // Sub-section 1.5 fields (Photo & Existing RPL Family) are omitted for spectators
    const requiresPhoto = false;
    const requiresFamilyEnrollment = false;
    const isNostalgiaEligible = payload.accommodationRequired === 'Yes' || (Array.isArray(payload.spectatorDates) && payload.spectatorDates.length === 3);

    return {
      valid: true,
      totalFee,
      daysCount,
      requiresPhoto,
      requiresFamilyEnrollment,
      isNostalgiaEligible,
      inclusions: [
        'Full Day Meals (Breakfast, Lunch, Dinner)',
        'Night Snacks & Refreshments',
        isNostalgiaEligible ? '1980s Retro & Nostalgia Games' : null,
        payload.accommodationRequired === 'Yes' ? 'Ashram Stay (Compulsory 3 Days)' : 'Self-Arranged Stay',
      ].filter(Boolean),
    };
  }

  // 1. Day Pass: 1 Day without stay, without T-shirt (₹540)
  const dayPass1 = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'No',
    spectatorDates: ['2026-12-25'],
    spectatorTshirt: 'No',
  });
  assert.strictEqual(dayPass1.valid, true);
  assert.strictEqual(dayPass1.totalFee, 540);
  assert.strictEqual(dayPass1.daysCount, 1);
  assert.strictEqual(dayPass1.requiresPhoto, false);
  assert.strictEqual(dayPass1.requiresFamilyEnrollment, false);
  assert.strictEqual(dayPass1.isNostalgiaEligible, false, '1-day spectator is NOT eligible for nostalgia games');

  // 2. Day Pass: 2 Days without stay, without T-shirt (₹1,260)
  const dayPass2 = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'No',
    spectatorDates: ['2026-12-25', '2026-12-26'],
    spectatorTshirt: 'No',
  });
  assert.strictEqual(dayPass2.totalFee, 1080);
  assert.strictEqual(dayPass2.daysCount, 2);
  assert.strictEqual(dayPass2.isNostalgiaEligible, false, '2-day spectator is NOT eligible for nostalgia games');

  // 3. Day Pass: 3 Days (All Dates) without stay, without T-shirt (₹1,620)
  const dayPass3 = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'No',
    spectatorDates: ['2026-12-25', '2026-12-26', '2026-12-27'],
    spectatorTshirt: 'No',
  });
  assert.strictEqual(dayPass3.totalFee, 1620);
  assert.strictEqual(dayPass3.daysCount, 3);
  assert.strictEqual(dayPass3.isNostalgiaEligible, true, '3-day spectator IS eligible for nostalgia games');

  // 4. Day Pass: 2 Days without stay, with T-shirt (₹1,080 + ₹500 = ₹1,580)
  const dayPassTshirt = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'No',
    spectatorDates: ['2026-12-25', '2026-12-26'],
    spectatorTshirt: 'Yes',
  });
  assert.strictEqual(dayPassTshirt.totalFee, 1580);
  assert.strictEqual(dayPassTshirt.isNostalgiaEligible, false);

  // 5. Pass with stay, without T-shirt (₹2,700)
  const stayPass = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'Yes',
    spectatorTshirt: 'No',
  });
  assert.strictEqual(stayPass.totalFee, 2700);
  assert.strictEqual(stayPass.isNostalgiaEligible, true, 'With stay spectator IS eligible for nostalgia games');

  // 6. Pass with stay, with T-shirt (₹3,200)
  const stayPassTshirt = validateSpectatorRules({
    registrationType: 'spectator',
    accommodationRequired: 'Yes',
    spectatorTshirt: 'Yes',
  });
  assert.strictEqual(stayPassTshirt.totalFee, 3200);
  assert.strictEqual(stayPassTshirt.isNostalgiaEligible, true);
});

test('Age Eligibility: verifies age 16 and below, and 56 and above for Kaccha Pakka Cricket League', () => {
  function isKacchaPakkaEligible(age) {
    if (age === null || age === undefined) return false;
    return age <= 16 || age >= 56;
  }

  assert.strictEqual(isKacchaPakkaEligible(10), true);
  assert.strictEqual(isKacchaPakkaEligible(16), true);
  assert.strictEqual(isKacchaPakkaEligible(17), false);
  assert.strictEqual(isKacchaPakkaEligible(25), false);
  assert.strictEqual(isKacchaPakkaEligible(55), false);
  assert.strictEqual(isKacchaPakkaEligible(56), true);
  assert.strictEqual(isKacchaPakkaEligible(65), true);
  assert.strictEqual(isKacchaPakkaEligible(null), false);
});

test('90s Nostalgia: verifies the 5 nostalgia games and canonical names', () => {
  const NOSTALGIA_SPORTS = [
    'Lemon & Spoon Race with Book Balancing',
    'Duckwalk Race',
    'Skipping Competition',
    'Ring Race',
    'Relay Race',
  ];

  assert.strictEqual(NOSTALGIA_SPORTS.length, 5);
  assert.strictEqual(NOSTALGIA_SPORTS.includes('Carrom'), false);
  assert.strictEqual(NOSTALGIA_SPORTS.includes('Table tennis'), false);
});

test('90s Nostalgia: formatNostalgiaSports helper formats array, legacy string, and empty selections correctly', () => {
  function formatNostalgiaSports(val) {
    if (!val) return 'None';
    if (Array.isArray(val)) {
      const filtered = val.filter((s) => s && s !== 'None');
      return filtered.length > 0 ? filtered.join(', ') : 'None';
    }
    return typeof val === 'string' && val.trim() ? val : 'None';
  }

  // Multi-select array tests
  assert.strictEqual(
    formatNostalgiaSports(['Duckwalk Race', 'Skipping Competition']),
    'Duckwalk Race, Skipping Competition'
  );
  assert.strictEqual(
    formatNostalgiaSports(['Lemon & Spoon Race with Book Balancing']),
    'Lemon & Spoon Race with Book Balancing'
  );
  assert.strictEqual(formatNostalgiaSports(['None']), 'None');
  assert.strictEqual(formatNostalgiaSports([]), 'None');

  // Legacy single string tests
  assert.strictEqual(formatNostalgiaSports('Duckwalk Race'), 'Duckwalk Race');
  assert.strictEqual(formatNostalgiaSports('None'), 'None');

  // Edge cases
  assert.strictEqual(formatNostalgiaSports(null), 'None');
  assert.strictEqual(formatNostalgiaSports(undefined), 'None');
});

test('90s Nostalgia: canonical capitalization mapping normalizes legacy lowercase strings', () => {
  const CANONICAL_MAP = {
    'lemon & spoon race with book balancing': 'Lemon & Spoon Race with Book Balancing',
    'lemon spoon with book on head': 'Lemon & Spoon Race with Book Balancing',
    'duckwalk race': 'Duckwalk Race',
    'duckwalk': 'Duckwalk Race',
    'skipping competition': 'Skipping Competition',
    'skipping': 'Skipping Competition',
    'ring race': 'Ring Race',
    'relay race': 'Relay Race',
  };

  function normalizeNostalgiaSport(sport) {
    if (!sport || typeof sport !== 'string') return sport;
    const lower = sport.trim().toLowerCase();
    return CANONICAL_MAP[lower] || sport;
  }

  assert.strictEqual(normalizeNostalgiaSport('duckwalk'), 'Duckwalk Race');
  assert.strictEqual(
    normalizeNostalgiaSport('lemon & spoon race with book balancing'),
    'Lemon & Spoon Race with Book Balancing'
  );
  assert.strictEqual(normalizeNostalgiaSport('ring race'), 'Ring Race');
  assert.strictEqual(normalizeNostalgiaSport('Relay Race'), 'Relay Race');
});

test('Cricket Turf Rules: accepts only approved spin bowling variations for Bowlers and rejects fast bowling', () => {
  const APPROVED_SPIN_STYLES = [
    'Off Spin (Off break)',
    'Leg Spin (Leg break)',
    'Left-Arm Orthodox Spin',
    'Left-Arm Unorthodox Spin',
  ];

  const DISALLOWED_FAST_STYLES = [
    'Fast',
    'Medium Fast',
    'Right-arm Fast',
    'Left-arm Fast',
    'Express Pace',
  ];

  function validateCricketBowlingStyle(role, style) {
    if (role !== 'Bowler') {
      return { required: false, valid: true };
    }
    if (!style || typeof style !== 'string' || !style.trim()) {
      return { required: true, valid: false, error: 'Bowling variation is required for Bowlers' };
    }
    const isApproved = APPROVED_SPIN_STYLES.includes(style.trim());
    if (!isApproved) {
      return {
        required: true,
        valid: false,
        error: `Invalid bowling style for turf cricket: "${style}". Only spin bowling variations are permitted.`,
      };
    }
    return { required: true, valid: true, style: style.trim() };
  }

  // Bowler with spin styles
  APPROVED_SPIN_STYLES.forEach((spin) => {
    const res = validateCricketBowlingStyle('Bowler', spin);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.required, true);
  });

  // Bowler with fast bowling styles -> rejected
  DISALLOWED_FAST_STYLES.forEach((pace) => {
    const res = validateCricketBowlingStyle('Bowler', pace);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('Only spin bowling variations are permitted'));
  });

  // Bowler with missing style -> rejected
  assert.strictEqual(validateCricketBowlingStyle('Bowler', '').valid, false);
  assert.strictEqual(validateCricketBowlingStyle('Bowler', null).valid, false);

  // Other roles do not require bowling style
  assert.strictEqual(validateCricketBowlingStyle('Batsman', null).valid, true);
  assert.strictEqual(validateCricketBowlingStyle('Wicket Keeper', null).valid, true);
  assert.strictEqual(validateCricketBowlingStyle('All-Rounder', null).valid, true);
});

test('League Types: verifies all 7 official RPL league types including spectator', () => {
  const VALID_LEAGUE_TYPES = [
    'cricket',
    'football',
    'womens',
    'table-tennis',
    'carrom',
    'kaccha-pakka',
    'spectator',
  ];

  function isValidLeagueType(type) {
    return VALID_LEAGUE_TYPES.includes(type);
  }

  assert.strictEqual(isValidLeagueType('cricket'), true);
  assert.strictEqual(isValidLeagueType('football'), true);
  assert.strictEqual(isValidLeagueType('womens'), true);
  assert.strictEqual(isValidLeagueType('table-tennis'), true);
  assert.strictEqual(isValidLeagueType('carrom'), true);
  assert.strictEqual(isValidLeagueType('kaccha-pakka'), true);
  assert.strictEqual(isValidLeagueType('spectator'), true);

  assert.strictEqual(isValidLeagueType('badminton'), false);
  assert.strictEqual(isValidLeagueType('unknown'), false);
});

