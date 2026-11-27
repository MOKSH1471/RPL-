import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCentreName, aggregateCentresCount } from '../apps/admin/src/lib/centreUtils.ts';

test('normalizeCentreName normalizes spelling, casing, and spacing variants', () => {
  assert.equal(normalizeCentreName('Research centre'), 'Research Centre');
  assert.equal(normalizeCentreName('Reaserch centre'), 'Research Centre');
  assert.equal(normalizeCentreName('  Research   Centre '), 'Research Centre');
  assert.equal(normalizeCentreName('Banglore'), 'Bangalore');
  assert.equal(normalizeCentreName('South Bombay'), 'South Mumbai');
  assert.equal(normalizeCentreName('Seva'), 'Seva Kutir');
  assert.equal(normalizeCentreName('Raigarh(MH)'), 'Raigarh (MH)');
  assert.equal(normalizeCentreName(''), 'Unspecified');
  assert.equal(normalizeCentreName(null, 'Mumbai'), 'Mumbai');
});

test('aggregateCentresCount merges alias counts and sorts descending', () => {
  const merged = aggregateCentresCount({
    'Research Centre': 4,
    'Research centre': 1,
    'Reaserch centre': 1,
    Bangalore: 1,
    Banglore: 1,
    'South Mumbai': 3,
    'South Bombay': 1,
    Mulund: 21,
  });

  assert.deepEqual(merged, [
    ['Mulund', 21],
    ['Research Centre', 6],
    ['South Mumbai', 4],
    ['Bangalore', 2],
  ]);
});
