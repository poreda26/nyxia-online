import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createWheel, pickWheelPrize, WHEEL_PRIZE_IDS } from '../server/wheel.mjs';

const fail = (status, error) => Object.assign(new Error(error), { status, error });
const setup = () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE accounts(id INTEGER PRIMARY KEY, name TEXT)');
  db.exec("INSERT INTO accounts(id,name) VALUES (1,'a'),(2,'b')");
  return { db, wheel: createWheel(db, { fail }) };
};
const NOON = Date.UTC(2026, 5, 10, 9, 0, 0); // İstanbul 12:00
const DAY = 24 * 3600 * 1000;

test('hidden odds match the published design: 1% mythic, 1% apex, 0.5% wing, rest scrolls', () => {
  const counts = {};
  for (let roll = 0; roll < 10000; roll++) { const id = pickWheelPrize(roll); counts[id] = (counts[id] || 0) + 1; }
  assert.equal(counts.mythic_1d, 100);
  assert.equal(counts.apex_3d, 100);
  assert.equal(counts.wing, 50);
  const scrolls = Object.entries(counts).filter(([id]) => !['mythic_1d', 'apex_3d', 'wing'].includes(id)).reduce((s, [, n]) => s + n, 0);
  assert.equal(scrolls, 9750);
  assert.equal(WHEEL_PRIZE_IDS.length, 12);
});

test('one spin per Istanbul day, pending prizes block a new spin, and claim is idempotent-safe', () => {
  const { wheel } = setup();
  assert.equal(wheel.status(1, NOON).canSpin, true);
  const spin = wheel.spin(1, NOON, 0);
  assert.equal(spin.prize, 'mythic_1d');
  assert.equal(spin.spunAt, NOON);
  assert.throws(() => wheel.spin(1, NOON + 1000, 0), /WHEEL_PRIZE_PENDING/);
  const pending = wheel.status(1, NOON + 1000);
  assert.equal(pending.pending, 'mythic_1d');
  assert.equal(pending.canSpin, false);
  assert.equal(pending.spunAt, NOON);
  assert.deepEqual(wheel.claim(1), { ok: true });
  assert.throws(() => wheel.claim(1), /NO_PENDING_PRIZE/);
  assert.throws(() => wheel.spin(1, NOON + 2000, 5000), /WHEEL_ALREADY_SPUN/);
  const state = wheel.status(1, NOON + 2000);
  assert.equal(state.canSpin, false);
  assert.equal(state.nextSpinAt, Date.UTC(2026, 5, 10, 21, 0, 0)); // İstanbul gece yarısı
  // Başka hesap etkilenmez; ertesi gün tekrar çevrilir.
  assert.equal(wheel.status(2, NOON).canSpin, true);
  assert.equal(wheel.status(1, NOON + DAY).canSpin, true);
  assert.equal(wheel.spin(1, NOON + DAY, 9999).prize, 'scroll_bonus');
});

test('rolling in the last seconds before Istanbul midnight still honours the day boundary', () => {
  const { wheel } = setup();
  const lateNight = Date.UTC(2026, 5, 10, 20, 59, 59);
  wheel.spin(1, lateNight, 500);
  wheel.claim(1);
  assert.equal(wheel.status(1, lateNight + 1000).canSpin, true);
});
