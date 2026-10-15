import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getFieldValue, sanitizeDate } from '../apps/api/src/utils/helpers.js';

test('getFieldValue: resolves direct snake_case key', () => {
  const answers = { tshirt_size: 'XL' };
  assert.equal(getFieldValue(answers, 'tshirt_size'), 'XL');
});

test('getFieldValue: resolves camelCase fallback for snake_case target', () => {
  const answers = { tshirtSize: 'M' };
  assert.equal(getFieldValue(answers, 'tshirt_size'), 'M');
});

test('getFieldValue: resolves snake_case fallback for camelCase target', () => {
  const answers = { full_name: 'Test Player' };
  assert.equal(getFieldValue(answers, 'fullName'), 'Test Player');
});

test('getFieldValue: resolves case-insensitive match', () => {
  const answers = { DATEOFBIRTH: '1995-05-15' };
  assert.equal(getFieldValue(answers, 'date_of_birth'), '1995-05-15');
});

test('getFieldValue: returns undefined for missing or empty values', () => {
  assert.equal(getFieldValue({}, 'missing_key'), undefined);
  assert.equal(getFieldValue(null, 'key'), undefined);
  assert.equal(getFieldValue({ empty: '' }, 'empty'), undefined);
});

test('sanitizeDate: formats YYYY-MM-DD strings properly', () => {
  assert.equal(sanitizeDate('2026-12-25'), '2026-12-25');
  assert.equal(sanitizeDate('2026-12-25T10:30:00.000Z'), '2026-12-25');
});

test('sanitizeDate: handles Date objects', () => {
  const d = new Date('2026-10-02T00:00:00.000Z');
  assert.equal(sanitizeDate(d), '2026-10-02');
});

test('sanitizeDate: returns null for invalid or null inputs', () => {
  assert.equal(sanitizeDate(null), null);
  assert.equal(sanitizeDate(''), null);
  assert.equal(sanitizeDate('invalid-date-string'), null);
});

test('calculateAge: correctly calculates age from YYYY-MM-DD string', () => {
  function calculateAge(dobString) {
    if (!dobString || typeof dobString !== 'string') return null;
    const parts = dobString.trim().split('-');
    if (parts.length < 3) return null;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    return age;
  }

  const currentYear = new Date().getFullYear();
  assert.equal(calculateAge(`${currentYear - 15}-01-01`), 15);
  assert.equal(calculateAge(`${currentYear - 16}-01-01`), 16);
  assert.equal(calculateAge(`${currentYear - 56}-01-01`), 56);
  assert.equal(calculateAge(`${currentYear - 60}-01-01`), 60);
  assert.equal(calculateAge(null), null);
  assert.equal(calculateAge(''), null);
});
