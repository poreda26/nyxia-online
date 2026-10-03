import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { createWallet } from '../server/wallet.mjs';
import { DAILY_LOGIN_DIAMONDS, WEEKLY_RANK_REWARDS } from '../src/data/diamondPrices.js';

const fail = (status, error) => Object.assign(new Error(error), { status, error });
const DAY = 24 * 3600 * 1000;
const NOON = Date.UTC(2026, 5, 10, 9, 0, 0); // İstanbul öğle

test('wallet module: balances, prices, daily login streak and weekly rank are enforced by the server', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE accounts(id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE backups(account INTEGER PRIMARY KEY, revision INTEGER, data TEXT, updated INTEGER)');
  db.exec("INSERT INTO accounts(id,name) VALUES (1,'a'),(2,'b')");
  // An existing balance in an old backup is adopted exactly once.
  db.prepare('INSERT INTO backups VALUES(1,3,?,0)').run(JSON.stringify({ diamonds: 700, characters: [] }));
  const wallet = createWallet(db, { fail });
  assert.equal(wallet.balance(1), 700);
  db.prepare('UPDATE backups SET data=? WHERE account=1').run(JSON.stringify({ diamonds: 99999, characters: [] }));
  assert.equal(wallet.balance(1), 700, 'a later backup can never raise the balance');
  assert.equal(wallet.balance(2), 0);

  // Prices come from the server table; unknown purchases and shortfalls are refused.
  assert.throws(() => wallet.spend(1, 'bonusScroll', null, null, NOON), /NOT_ENOUGH_DIAMONDS/);
  assert.throws(() => wallet.spend(1, 'madeUp', null, null, NOON), /INVALID_PURCHASE/);
  assert.throws(() => wallet.spend(1, 'premium', 'platinum', null, NOON), /INVALID_PURCHASE/);
  assert.equal(wallet.balance(1), 700, 'refused purchases change nothing');
  assert.deepEqual(wallet.spend(1, 'raceScroll', null, null, NOON), { diamonds: 200, price: 500 });
  assert.throws(() => wallet.spend(1, 'dye', 'crimson', null, NOON), /NOT_ENOUGH_DIAMONDS/);
  assert.equal(wallet.credit(1, 3000, 'gm-grant', 'test', NOON), 3200);
  assert.deepEqual(wallet.spend(1, 'premium', 'mythic', null, NOON), { diamonds: 200, price: 3000 });
  assert.throws(() => wallet.credit(1, -5, 'x'), /INVALID_AMOUNT/);
  assert.equal(db.prepare('SELECT SUM(delta) s FROM wallet_ledger WHERE account=1').get().s, wallet.balance(1), 'ledger always adds up to the balance');

  // Daily login: once per Istanbul day per character, streak resets after a gap, cycle pays the 6th and 7th day.
  const awards = [];
  for (let day = 0; day < 8; day++) {
    const claim = wallet.dailyLogin(2, 'hero', NOON + day * DAY);
    assert.equal(claim.streak, day + 1);
    awards.push(claim.diamondsAwarded);
    if (day === 0) assert.throws(() => wallet.dailyLogin(2, 'hero', NOON + 5000), /DAILY_ALREADY_CLAIMED/);
  }
  assert.deepEqual(awards, [...DAILY_LOGIN_DIAMONDS, DAILY_LOGIN_DIAMONDS[0]]);
  assert.equal(wallet.balance(2), 20);
  assert.equal(wallet.dailyLogin(2, 'hero', NOON + 10 * DAY).streak, 1, 'a missed day restarts the streak');
  assert.equal(wallet.dailyLogin(2, 'second', NOON + 10 * DAY).streak, 1, 'each character has its own claim');

  // Weekly rank: server decides the amount, one claim per character per week, ranks outside the podium pay nothing.
  assert.deepEqual(wallet.weeklyRank(1, 'hero', '2026-W20', 1).diamondsAwarded, WEEKLY_RANK_REWARDS[0]);
  assert.equal(wallet.weeklyRank(1, 'hero', '2026-W20', 1).diamondsAwarded, 0, 'second claim for the same week pays nothing');
  assert.equal(wallet.weeklyRank(1, 'hero', '2026-W21', 4).diamondsAwarded, 0);
  assert.equal(wallet.weeklyRank(1, 'hero', '2026-W21', null).diamondsAwarded, 0);
  assert.equal(wallet.weeklyRank(1, 'hero', '2026-W22', 2).diamondsAwarded, WEEKLY_RANK_REWARDS[1]);
  assert.throws(() => wallet.weeklyRank(1, 'hero', '', 1), /INVALID_WEEK/);

  // Backups are pinned to the server balance.
  const data = wallet.clampBackup(1, { diamonds: 123456, characters: [{ diamonds: 5 }, null, { diamonds: 1e9 }] });
  assert.equal(data.diamonds, wallet.balance(1));
  assert.equal(data.characters[0].diamonds, wallet.balance(1));
  assert.equal(data.characters[2].diamonds, wallet.balance(1));
});

test('wallet API: spend, GM grants, backup pinning, clan charges and account deletion', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-wallet-'));
  const database = join(dir, 'test.sqlite');
  const api = createApi({ database, origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, { method = body ? 'POST' : 'GET', key } = {}) => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(key ? { 'X-Character-Key': key } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  const backupOf = (diamonds) => ({ characters: [{ id: 'hero', nickname: 'Hero', level: 5, diamonds }, null, null], bank: [[]], diamonds });
  try {
    const owner = (await call('register', { name: 'owner', password })).cookie;
    const player = (await call('register', { name: 'player', password })).cookie;
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO panel_owner VALUES(1,1)').run();

    // A fresh account starts at 0 no matter what its first backup claims.
    assert.equal((await call('backup', { revision: 0, data: backupOf(999999) }, player, { method: 'PUT' })).status, 200);
    assert.equal((await call('wallet', null, player)).data.diamonds, 0);
    const restored = (await call('backup', null, player)).data.data;
    assert.equal(restored.diamonds, 0);
    assert.equal(restored.characters[0].diamonds, 0);

    // Nobody but a GM can create diamonds; spending needs a real balance.
    assert.equal((await call('wallet/gm-grant', { amount: 5000 }, player)).status, 403);
    assert.equal((await call('wallet/spend', { kind: 'premium', key: 'mythic', characterKey: 'hero' }, player)).status, 409);
    assert.equal((await call('wallet/gm-grant', { amount: 5000 }, owner)).data.diamonds, 5000);
    assert.equal((await call('wallet/gm-grant', { amount: -1 }, owner)).status, 400);
    assert.equal((await call('wallet/gm-grant', { amount: 5000000 }, owner)).status, 400);

    // The server prices the purchase itself; the client cannot pass its own number.
    const bought = await call('wallet/spend', { kind: 'premium', key: 'mythic', price: 1, characterKey: 'hero' }, owner);
    assert.equal(bought.data.diamonds, 2000);
    assert.equal(bought.data.price, 3000);
    assert.equal(bought.data.entitlement.premium.tier, 'mythic');
    assert.equal((await call('wallet/spend', { kind: 'premium', key: 'nope', characterKey: 'hero' }, owner)).status, 400);
    assert.equal((await call('wallet/spend', { kind: 'wings', key: 'dawn' }, owner)).data.diamonds, 0);
    assert.equal((await call('wallet/spend', { kind: 'wings', key: 'dawn' }, owner)).status, 409);

    // Overwriting the backup with a huge balance changes nothing.
    await call('wallet/gm-grant', { amount: 1000 }, owner);
    const pinned = await call('backup', { revision: 0, data: backupOf(10_000_000) }, owner, { method: 'PUT' });
    assert.equal(pinned.status, 200);
    const owned = (await call('backup', null, owner)).data.data;
    assert.equal(owned.diamonds, 1000);
    assert.equal(owned.characters[0].diamonds, 1000);

    // Founding a clan and donating diamonds are charged on the server, atomically.
    assert.equal((await call('clan', { name: 'Altın Kurt' }, owner, { key: 'hero' })).status, 200);
    assert.equal((await call('wallet', null, owner)).data.diamonds, 500);
    const donated = await call('clan/donate', { currency: 'diamonds', amount: 200 }, owner, { key: 'hero' });
    assert.equal(donated.status, 200);
    assert.equal(donated.data.diamonds, 300);
    const tooMuch = await call('clan/donate', { currency: 'diamonds', amount: 301 }, owner, { key: 'hero' });
    assert.equal(tooMuch.status, 409);
    assert.equal((await call('wallet', null, owner)).data.diamonds, 300);
    assert.equal((await call('clan/mine', null, owner, { key: 'hero' })).data.clan.treasury.diamonds, 200);

    // Not enough diamonds to found a clan: nothing is created.
    assert.equal((await call('clan', { name: 'Gümüş Kurt' }, player, { key: 'hero' })).status, 409);
    assert.equal(db.prepare("SELECT COUNT(*) n FROM clans WHERE name='Gümüş Kurt'").get().n, 0);

    // Daily login and weekly rank go through the server.
    const login = await call('wallet/daily-login', { characterKey: 'hero' }, player);
    assert.equal(login.status, 200);
    assert.equal(login.data.streak, 1);
    assert.equal((await call('wallet/daily-login', { characterKey: 'hero' }, player)).status, 409);
    assert.equal((await call('wallet/daily-login', { characterKey: '' }, player)).status, 400);
    assert.equal((await call('wallet/weekly-rank', { characterKey: 'hero', weekId: '2026-W20', rank: 1 }, player)).data.diamonds, WEEKLY_RANK_REWARDS[0]);
    assert.equal((await call('wallet/weekly-rank', { characterKey: 'hero', weekId: '2026-W20', rank: 1 }, player)).data.diamondsAwarded, 0);

    // Deleting the account leaves no wallet behind.
    assert.equal((await call('account/delete', { password }, player)).status, 200);
    for (const table of ['wallets', 'wallet_ledger', 'daily_login_claims', 'weekly_rank_claims']) {
      assert.equal(db.prepare(`SELECT COUNT(*) n FROM ${table} WHERE account=2`).get().n, 0, table);
    }
    db.close();
  } finally { await api.close(); }
});
