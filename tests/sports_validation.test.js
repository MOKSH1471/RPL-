import { test } from 'node:test';
import assert from 'node:assert/strict';

const VALID_SPORTS = [
  'cricket',
  'football',
  'badminton',
  'table-tennis',
  'pickleball',
  'volleyball',
  'womens-sports',
  'kaccha-pakka',
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

test('Age Eligibility: verifies age 16 and below, and 56 and above for Kaccha Pakka League', () => {
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

test('90s Nostalgia: verifies the 7 nostalgia sports and TT/Carrom league note with canonical capitalization', () => {
  const NOSTALGIA_SPORTS = [
    'Carrom',
    'Lemon spoon with book on head',
    'Duckwalk',
    'Skipping',
    'Ring race (Couple or 2 ppl)',
    'Relay race (Names may change)',
    'Table tennis',
  ];

  assert.strictEqual(NOSTALGIA_SPORTS.length, 7);

  function hasRegistrationBasisNote(sport) {
    return sport === 'Carrom' || sport === 'Table tennis';
  }

  assert.strictEqual(hasRegistrationBasisNote('Carrom'), true);
  assert.strictEqual(hasRegistrationBasisNote('Table tennis'), true);
  assert.strictEqual(hasRegistrationBasisNote('Skipping'), false);
  assert.strictEqual(hasRegistrationBasisNote('Duckwalk'), false);
  assert.strictEqual(hasRegistrationBasisNote('Ring race (Couple or 2 ppl)'), false);
  assert.strictEqual(hasRegistrationBasisNote('Relay race (Names may change)'), false);
  assert.strictEqual(hasRegistrationBasisNote('Lemon spoon with book on head'), false);
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
    formatNostalgiaSports(['Carrom', 'Duckwalk', 'Skipping']),
    'Carrom, Duckwalk, Skipping'
  );
  assert.strictEqual(
    formatNostalgiaSports(['Lemon spoon with book on head']),
    'Lemon spoon with book on head'
  );
  assert.strictEqual(formatNostalgiaSports(['None']), 'None');
  assert.strictEqual(formatNostalgiaSports([]), 'None');

  // Legacy single string tests
  assert.strictEqual(formatNostalgiaSports('Carrom'), 'Carrom');
  assert.strictEqual(formatNostalgiaSports('None'), 'None');

  // Edge cases
  assert.strictEqual(formatNostalgiaSports(null), 'None');
  assert.strictEqual(formatNostalgiaSports(undefined), 'None');
});

test('90s Nostalgia: canonical capitalization mapping normalizes legacy lowercase strings', () => {
  const CANONICAL_MAP = {
    'carrom': 'Carrom',
    'lemon spoon with book on head': 'Lemon spoon with book on head',
    'duckwalk': 'Duckwalk',
    'skipping': 'Skipping',
    'ring race(couple or 2 ppl)': 'Ring race (Couple or 2 ppl)',
    'ring race (couple or 2 ppl)': 'Ring race (Couple or 2 ppl)',
    'relay race (names may change)': 'Relay race (Names may change)',
    'table tennis': 'Table tennis',
  };

  function normalizeNostalgiaSport(sport) {
    if (!sport || typeof sport !== 'string') return sport;
    const lower = sport.trim().toLowerCase();
    return CANONICAL_MAP[lower] || sport;
  }

  assert.strictEqual(normalizeNostalgiaSport('duckwalk'), 'Duckwalk');
  assert.strictEqual(
    normalizeNostalgiaSport('lemon spoon with book on head'),
    'Lemon spoon with book on head'
  );
  assert.strictEqual(
    normalizeNostalgiaSport('ring race(couple or 2 ppl)'),
    'Ring race (Couple or 2 ppl)'
  );
  assert.strictEqual(normalizeNostalgiaSport('Duckwalk'), 'Duckwalk');
});

