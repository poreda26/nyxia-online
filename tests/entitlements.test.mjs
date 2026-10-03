import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';

test('purchased rights live on the server: premium, dyes, cosmetics, slots and wheel premium', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-ent-'));
  const database = join(dir, 'test.sqlite');
  const api = createApi({ database, origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  const hero = (extra = {}) => ({ id: 'hero', nickname: 'Hero', level: 10, diamonds: 0, ...extra });
  const backupOf = (character, unlockedSlots) => ({ characters: [character, null, null], bank: [[]], diamonds: 0, ...(unlockedSlots ? { unlockedSlots } : {}) });
  const spend = (cookie, body) => call('wallet/spend', { characterKey: 'hero', ...body }, cookie);
  try {
    const owner = (await call('register', { name: 'owner', password })).cookie; // becomes GM through panel_owner
    const player = (await call('register', { name: 'player', password })).cookie;
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO panel_owner VALUES(1,1)').run();
    const readBackup = async (cookie) => (await call('backup', null, cookie)).data.data;

    // 1) A forged backup cannot create rights.
    const forged = hero({ premium: { tier: 'mythic', expiresAt: Date.now() + 365 * 86400000 }, premiumBoost: { tier: 'mythic', expiresAt: Date.now() + 1e10 }, ownedDyes: ['gold', 'bogus'], ownedAvatars: ['a1'], ownedAvatarFrames: ['f1'], armorDye: 'gold', avatarFrameId: 'f1' });
    assert.equal((await call('backup', { revision: 0, data: backupOf(forged, 3) }, owner, 'PUT')).status, 200);
    const pinned = await readBackup(owner);
    assert.deepEqual(pinned.characters[0].premium, { tier: null, expiresAt: null });
    assert.equal('premiumBoost' in pinned.characters[0], false);
    assert.deepEqual(pinned.characters[0].ownedDyes, []);
    assert.deepEqual(pinned.characters[0].ownedAvatars, []);
    assert.equal(pinned.characters[0].armorDye, null);
    assert.equal(pinned.characters[0].avatarFrameId, null);
    assert.equal(pinned.unlockedSlots, 2, 'the third slot cannot be forged');

    // 2) Buying rights needs diamonds, is priced and granted by the server, and cannot be repeated.
    assert.equal((await spend(owner, { kind: 'premium', key: 'apex' })).status, 409);
    await call('wallet/gm-grant', { amount: 20000 }, owner);
    const apex = await spend(owner, { kind: 'premium', key: 'apex' });
    assert.equal(apex.status, 200);
    assert.equal(apex.data.entitlement.premium.tier, 'apex');
    const left = apex.data.entitlement.premium.expiresAt - Date.now();
    assert.ok(left > 14.9 * 86400000 && left <= 15 * 86400000);
    const balance = apex.data.diamonds;
    assert.equal((await spend(owner, { kind: 'premium', key: 'apex' })).status, 409);
    assert.equal((await call('wallet', null, owner)).data.diamonds, balance, 'a refused purchase costs nothing');
    assert.equal((await spend(owner, { kind: 'premium', key: 'mythic' })).data.entitlement.premium.tier, 'mythic', 'Apex can be upgraded to Mythic');
    assert.equal((await spend(owner, { kind: 'premium', key: 'apex' })).status, 409, 'nothing below an active Mythic');
    assert.equal((await call('wallet/spend', { kind: 'premium', key: 'apex' }, owner)).status, 400, 'a character is required');

    const dye = await spend(owner, { kind: 'dye', key: 'crimson' });
    assert.deepEqual(dye.data.entitlement.ownedDyes, ['crimson']);
    assert.equal((await spend(owner, { kind: 'dye', key: 'crimson' })).status, 409);
    assert.equal((await spend(owner, { kind: 'dye', key: 'rainbow' })).status, 400);
    assert.deepEqual((await spend(owner, { kind: 'avatarCosmetic', key: 'frame:gold' })).data.entitlement.ownedAvatarFrames, ['gold']);
    assert.deepEqual((await spend(owner, { kind: 'avatarCosmetic', key: 'avatar:wolf' })).data.entitlement.ownedAvatars, ['wolf']);
    assert.equal((await spend(owner, { kind: 'avatarCosmetic', key: 'wolf' })).status, 400);
    const slot = await call('wallet/spend', { kind: 'slotUnlock' }, owner);
    assert.equal(slot.data.entitlement.unlockedSlots, 3);
    assert.equal((await call('wallet/spend', { kind: 'slotUnlock' }, owner)).status, 409);

    // 3) The backup shows the server's truth and re-forging again changes nothing.
    await call('backup', { revision: 1, data: backupOf(hero({ premium: { tier: null, expiresAt: null }, ownedDyes: [], armorDye: 'crimson' }), 2) }, owner, 'PUT');
    const truth = await readBackup(owner);
    assert.equal(truth.characters[0].premium.tier, 'mythic');
    assert.deepEqual(truth.characters[0].ownedDyes, ['crimson']);
    assert.equal(truth.characters[0].armorDye, 'crimson', 'an owned dye can stay equipped');
    assert.equal(truth.unlockedSlots, 3);
    const live = (await call('wallet?characterKey=hero', null, owner)).data;
    assert.equal(live.entitlement.premium.tier, 'mythic');
    assert.equal((await call('wallet?characterKey=other', null, owner)).data.entitlement.premium.tier, null, 'rights belong to one character');

    // 4) Wheel premium is granted on claim, atomically; a missing character keeps the prize pending.
    db.prepare("INSERT INTO wheel_spins(account_id,day_key,prize,spun_at,claimed) VALUES(2,'2026-01-01','apex_3d',1,0)").run();
    assert.equal((await call('wheel/claim', {}, player)).status, 400);
    assert.equal(db.prepare('SELECT claimed FROM wheel_spins WHERE account_id=2').get().claimed, 0, 'rolled back');
    await call('backup', { revision: 0, data: backupOf(hero()) }, player, 'PUT');
    const claimed = await call('wheel/claim', { characterKey: 'hero' }, player);
    assert.equal(claimed.status, 200);
    assert.equal(claimed.data.entitlement.premiumBoost.tier, 'apex');
    const boostLeft = claimed.data.entitlement.premiumBoost.expiresAt - Date.now();
    assert.ok(boostLeft > 2.9 * 86400000 && boostLeft <= 3 * 86400000);
    assert.equal((await call('wheel/claim', { characterKey: 'hero' }, player)).status, 404);
    // Same tier extends instead of restarting.
    db.prepare("UPDATE wheel_spins SET prize='apex_3d', claimed=0 WHERE account_id=2").run();
    const extended = await call('wheel/claim', { characterKey: 'hero' }, player);
    assert.ok(extended.data.entitlement.premiumBoost.expiresAt - Date.now() > 5.9 * 86400000);
    // Item prizes need no character.
    db.prepare("UPDATE wheel_spins SET prize='scroll_bonus', claimed=0 WHERE account_id=2").run();
    assert.equal((await call('wheel/claim', {}, player)).status, 200);

    // 5) GM premium: only GMs, and it grants without charging.
    assert.equal((await call('entitlements/gm-premium', { characterKey: 'hero', tier: 'mythic' }, player)).status, 403);
    const before = (await call('wallet', null, owner)).data.diamonds;
    assert.equal((await call('entitlements/gm-premium', { characterKey: 'alt', tier: 'apex' }, owner)).data.entitlement.premium.tier, 'apex');
    assert.equal((await call('wallet', null, owner)).data.diamonds, before);

    // 6) Existing accounts keep what they legitimately had (one-time adoption, durations capped).
    const legacy = (await call('register', { name: 'legacy', password })).cookie;
    const legacyData = backupOf(hero({ premium: { tier: 'apex', expiresAt: Date.now() + 900 * 86400000 }, ownedDyes: ['violet', 'bogus'], ownedAvatars: ['x1'] }), 3);
    db.prepare('INSERT INTO backups VALUES(?,?,?,?)').run(3, 1, JSON.stringify(legacyData), Date.now());
    const adopted = await readBackup(legacy);
    assert.equal(adopted.characters[0].premium.tier, 'apex');
    assert.ok(adopted.characters[0].premium.expiresAt - Date.now() <= 15 * 86400000, 'forged long premium is capped');
    assert.deepEqual(adopted.characters[0].ownedDyes, ['violet']);
    assert.deepEqual(adopted.characters[0].ownedAvatars, ['x1']);
    assert.equal(adopted.unlockedSlots, 3);

    // 7) Deleting an account removes its rights.
    assert.equal((await call('account/delete', { password }, legacy)).status, 200);
    for (const table of ['entitlements', 'entitlement_seed']) assert.equal(db.prepare(`SELECT COUNT(*) n FROM ${table} WHERE account=3`).get().n, 0, table);
    db.close();
  } finally { await api.close(); }
});
