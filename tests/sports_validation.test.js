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
