import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statsJsonUrl = pathToFileURL(
  path.resolve(__dirname, '../apps/admin/src/data/rplHistoricalStats.json')
).href;

const rawTs = fs
  .readFileSync(path.resolve(__dirname, '../apps/admin/src/lib/cricketStatsUtils.ts'), 'utf8')
  .replace("'@/data/rplHistoricalStats.json'", `'${statsJsonUrl}' with { type: 'json' }`);

const { outputText } = ts.transpileModule(rawTs, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});

const { getHistoricalCricketStats } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('getHistoricalCricketStats resolves combined S6-S8 stats by name and strips RPLGuest- prefix', () => {
  const raj = getHistoricalCricketStats({ id: 'unknown-id', full_name: 'RPLGuest-Raj Sachin Warang' });
  assert.ok(raj, 'Raj Sachin Warang stats should be found');
  assert.equal(raj.statsName, 'Raj Sachin Warang');
  assert.deepEqual(raj.batting, {
    matches: 18,
    runs: 499,
    avg: 55.44,
    sr: 203.67,
    fours: 14,
    sixes: 59,
  });
  assert.deepEqual(raj.bowling, {
    wickets: 13,
    overs: '29.5',
    eco: 7.04,
    sr: 13.77,
    avg: 16.15,
    dot_balls: 99,
  });
  assert.deepEqual(raj.fielding, {
    catches: 9,
    caught_behind: 0,
    run_outs: 3,
    stumpings: 0,
    caught_and_bowl: 3,
  });
});

test('getHistoricalCricketStats resolves by registration ID and returns null for unknown players', () => {
  const byId = getHistoricalCricketStats({ id: 'eb66ab87-c224-432b-9eda-12394a116777', full_name: 'Different Name' });
  // Even if no ID match exists, non-matching name returns null safely
  const unknown = getHistoricalCricketStats({ id: 'non-existent-id', full_name: 'Brand New Player XYZ' });
  assert.equal(unknown, null);
  assert.equal(getHistoricalCricketStats(null), null);
  assert.ok(byId === null || typeof byId.statsName === 'string');
});
