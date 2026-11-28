import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsSource = fs.readFileSync(
  path.resolve(__dirname, '../apps/admin/src/lib/tagUtils.ts'),
  'utf8'
);
const { outputText } = ts.transpileModule(tsSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { PRESET_PLAYER_TAGS, getPlayerTags, getAllKnownTags, getTagBadgeClass } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('getPlayerTags extracts trimmed, case-insensitive deduplicated tags', () => {
  assert.deepEqual(getPlayerTags({ general_details: { tags: [' Owner ', 'owner', 'RC Staff', '', null] } }), [
    'Owner',
    'RC Staff',
  ]);
  assert.deepEqual(getPlayerTags({ general_details: {} }), []);
  assert.deepEqual(getPlayerTags(null), []);
});

test('getAllKnownTags merges preset tags and custom tags across all registrations', () => {
  const known = getAllKnownTags([
    { general_details: { tags: ['Owner', 'Volunteer'] } },
    { general_details: { tags: ['volunteer', 'VIP'] } },
  ]);

  assert.deepEqual(known, [...PRESET_PLAYER_TAGS, 'Volunteer', 'VIP']);
});

test('getTagBadgeClass returns preset styles and fallback for custom tags', () => {
  assert.match(getTagBadgeClass('Owner'), /amber/);
  assert.match(getTagBadgeClass('Player'), /emerald/);
  assert.match(getTagBadgeClass('RC Staff'), /sky/);
  assert.match(getTagBadgeClass('School'), /violet/);
  assert.match(getTagBadgeClass('CustomTag'), /slate/);
});
