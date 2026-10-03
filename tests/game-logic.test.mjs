import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundleGameLogic } from '../scripts/build-game-logic.mjs';

test('the server game-logic bundle is up to date with src/game (run: npm run build:logic)', async () => {
  const fresh = await bundleGameLogic();
  const committed = readFileSync(fileURLToPath(new URL('../server/game-logic.generated.mjs', import.meta.url)), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(committed, fresh);
});
