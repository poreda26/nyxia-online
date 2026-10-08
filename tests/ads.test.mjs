import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createWallet } from '../server/wallet.mjs';
import { createAds, pickAdReward, AD_COOLDOWN_MS } from '../server/ads.mjs';

const fail = (status, error) => Object.assign(new Error(error), { status, error });
const T0 = Date.UTC(2026, 9, 8, 9, 0, 0);

function setup(options = {}) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE accounts(id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE backups(account INTEGER PRIMARY KEY, revision INTEGER, data TEXT, updated INTEGER)');
  db.exec("INSERT INTO accounts(id,name) VALUES (1,'owner'),(2,'other')");
  const wallet = createWallet(db, { fail });
  return { db, wallet, ads: createAds(db, { fail, wallet, ...options }) };
}

test('reward amount is 5, 10 or 15 and chosen by the server', () => {
  assert.deepEqual([0, 59, 60, 89, 90, 99].map((r) => pickAdReward(r)), [5, 5, 10, 10, 15, 15]);
  for (let i = 0; i < 200; i++) assert.ok([5, 10, 15].includes(pickAdReward()));
});

test('ads are off for everyone except allowed test accounts, and cannot be started otherwise', () => {
  const { ads } = setup({ mode: 'off', testAccounts: ['owner'] });
  assert.equal(ads.status(2, 'other', T0).enabled, false);
  assert.throws(() => ads.start(2, 'other', T0), /ADS_DISABLED/);
  assert.equal(ads.status(1, 'owner', T0).canWatch, true);
});

test('test mode: reward only after the ad had time to play, then 6 hour cooldown', () => {
  const { ads, wallet } = setup({ mode: 'off', testAccounts: ['owner'] });
  const { ticket } = ads.start(1, 'owner', T0);
  assert.deepEqual(ads.claim(1, 'owner', ticket, T0 + 500), { rewarded: false, pending: true });
  assert.equal(wallet.balance(1), 0);
  const paid = ads.claim(1, 'owner', ticket, T0 + 5000);
  assert.equal(paid.rewarded, true);
  assert.ok([5, 10, 15].includes(paid.amount));
  assert.equal(wallet.balance(1), paid.amount);
  assert.deepEqual(ads.claim(1, 'owner', ticket, T0 + 6000), paid, 'claiming again never pays twice');
  assert.equal(wallet.balance(1), paid.amount);
  assert.throws(() => ads.start(1, 'owner', T0 + 6000), /AD_COOLDOWN/);
  assert.equal(ads.status(1, 'owner', T0 + 6000).nextAt, T0 + 5000 + AD_COOLDOWN_MS);
  assert.doesNotThrow(() => ads.start(1, 'owner', T0 + 5000 + AD_COOLDOWN_MS));
  assert.throws(() => ads.claim(2, 'other', ticket, T0 + 7000), /AD_TICKET_NOT_FOUND/, 'tickets belong to one account');
});

test('admob mode: the client claim pays nothing, only a Google-signed callback does, once', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = publicKey.export({ type: 'spki', format: 'pem' });
  const { ads, wallet } = setup({ mode: 'admob', fetchKeys: async () => [{ keyId: '77', pem }] });
  const { ticket, userId } = ads.start(1, 'owner', T0);
  assert.deepEqual(ads.claim(1, 'owner', ticket, T0 + 60000), { rewarded: false, pending: true });
  assert.equal(wallet.balance(1), 0);

  const signed = (params, key = privateKey) => {
    const content = new URLSearchParams(params).toString();
    const signature = sign('sha256', Buffer.from(content), key).toString('base64url');
    return `${content}&signature=${signature}&key_id=77`;
  };
  const query = signed({ ad_network: '5450213213286189855', ad_unit: '1', custom_data: ticket, reward_amount: '1', reward_item: 'x', timestamp: String(T0), transaction_id: 'tx-1', user_id: userId });

  await assert.rejects(() => ads.ssv(query.replace('tx-1', 'tx-2'), T0 + 61000), /INVALID_SSV/, 'tampered content is refused');
  const other = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
  await assert.rejects(() => ads.ssv(signed({ custom_data: ticket, transaction_id: 'tx-3', user_id: userId }, other), T0 + 61000), /INVALID_SSV/, 'wrong key is refused');
  assert.equal(wallet.balance(1), 0);

  assert.deepEqual(await ads.ssv(query, T0 + 61000), { ok: true });
  const after = wallet.balance(1);
  assert.ok([5, 10, 15].includes(after));
  assert.deepEqual(await ads.ssv(query, T0 + 62000), { ok: true, duplicate: true });
  assert.equal(wallet.balance(1), after, 'the same transaction never pays twice');
  assert.equal(ads.claim(1, 'owner', ticket, T0 + 63000).rewarded, true);
  assert.equal(wallet.balance(1), after);

  // A valid callback that arrives inside the cooldown pays nothing.
  const second = ads.start(1, 'owner', T0 + AD_COOLDOWN_MS + 70000);
  const early = signed({ custom_data: second.ticket, transaction_id: 'tx-4', user_id: userId });
  assert.equal(wallet.balance(1), after);
  assert.deepEqual(await ads.ssv(early, T0 + 62000), { ok: true });
  assert.equal(wallet.balance(1), after);
});
