import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { createCharacter } from '../server/game-logic.generated.mjs';

const password = 'long-test-password-123';

async function boot() {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-game-'));
  const database = join(dir, 'test.sqlite');
  const api = createApi({ database, origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  return { api, call, database };
}

const sword = (over = {}) => ({ id: 'sword-1', kind: 'weapon', name: 'Test Blade', weaponType: 'sword', weaponSlot: 'mainHand', cls: 'warrior', tier: 1, atk: 30, def: 0, hp: 0, mp: 0, weight: 2, durability: 1000, currentDurability: 1000, upgradeLevel: 0, reqStats: [], ...over });
const hero = () => ({ ...createCharacter('warrior', 'human', 'Hero'), id: 'hero' });

test('economy actions run on the server, ignore forged client state and survive bad requests', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'alice', password })).cookie;
    const character = hero();
    character.inventory = [...character.inventory, sword(), sword({ id: 'bound', name: 'Bound Blade', noTrade: true }), sword({ id: 'worn', name: 'Worn Blade', currentDurability: 400 })];
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const act = (type, payload = {}, key = 'hero') => call('game/act', { characterKey: key, type, payload }, cookie);
    const db = new DatabaseSync(database);

    // Off by default: nothing can be done through the server yet, and the legacy sync still works.
    assert.equal((await act('inventory/sell', { itemId: 'sword-1' })).status, 409);
    assert.equal((await call('me', null, cookie)).data.economy, false);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    assert.equal((await call('me', null, cookie)).data.economy, true);

    // Selling: the server looks the item up itself and prices it itself.
    const startGold = (await call('backup', null, cookie)).data.data.characters[0].gold;
    const sold = await act('inventory/sell', { itemId: 'sword-1' });
    assert.equal(sold.status, 200);
    assert.equal(sold.data.result.ok, true);
    assert.equal(sold.data.result.gold, 42);
    assert.deepEqual(Object.keys(sold.data.patch).sort(), ['gold', 'inventory'], 'only the changed fields are returned');
    assert.equal(sold.data.patch.gold, startGold + 42);
    assert.equal(sold.data.patch.inventory.some((i) => i.id === 'sword-1'), false);
    assert.ok(sold.data.revision > 1);
    assert.equal((await act('inventory/sell', { itemId: 'sword-1' })).data.result.reason, 'itemNotFound', 'cannot sell the same item twice');
    assert.equal((await act('inventory/sell', { itemId: 'bound' })).data.result.reason, 'noTrade');
    assert.equal((await act('inventory/sell', { itemId: 'nope' })).data.result.ok, false);

    // Forged saves do not stick: gold, items, equipment and the bank snap back to the server truth.
    const stored = (await call('backup', null, cookie)).data;
    const forged = structuredClone(stored.data);
    forged.characters[0].gold = 999999999;
    forged.characters[0].inventory.push(sword({ id: 'forged', atk: 99999 }));
    forged.bank[0].push(sword({ id: 'forged-bank' }));
    forged.bankGold = 5e8;
    forged.characters[1] = { ...hero(), id: 'newbie', nickname: 'Newbie', gold: 777777, inventory: [sword({ id: 'forged2' })], equipped: {} };
    assert.equal((await call('backup', { revision: stored.revision, data: forged }, cookie, 'PUT')).status, 200);
    const after = (await call('backup', null, cookie)).data.data;
    assert.equal(after.characters[0].gold, startGold + 42);
    assert.equal(after.characters[0].inventory.some((i) => i.id === 'forged'), false);
    assert.equal(after.bank[0].length, 0);
    assert.equal(after.bankGold, 0);
    assert.ok(after.characters[1].gold < 1000, 'a new character starts with the starting gold of the rules, not the claimed one');
    assert.equal(after.characters[1].inventory.some((i) => i.id === 'forged2'), false);

    // Equip / unequip.
    const revision = () => db.prepare('SELECT revision FROM backups WHERE account=1').get().revision;
    const wornOn = await act('inventory/equip', { itemId: 'worn' });
    assert.equal(wornOn.data.result.ok, true);
    assert.equal(wornOn.data.patch.equipped.mainHand.id, 'worn');
    assert.equal((await act('inventory/unequip', { slot: 'mainHand' })).data.patch.inventory.some((i) => i.id === 'worn'), true);
    assert.equal((await act('inventory/equip', { itemId: 'worn' })).data.patch.equipped.mainHand.id, 'worn');

    // Repair costs gold the server holds; a repair with nothing to fix changes nothing.
    const beforeRepair = (await call('backup', null, cookie)).data.data.characters[0];
    const repaired = await act('inventory/repairAll');
    assert.equal(repaired.data.result.ok, true);
    assert.ok(repaired.data.patch.gold < beforeRepair.gold);
    assert.equal(repaired.data.patch.equipped.mainHand.currentDurability, repaired.data.patch.equipped.mainHand.durability);
    const rev = revision();
    assert.equal((await act('inventory/repairAll')).data.result.ok, false);
    assert.equal(revision(), rev, 'a refused action writes nothing');

    // Bank: items and gold, with caps.
    const dep = await act('inventory/depositItem', { itemId: 'bound', page: 0 });
    assert.equal(dep.data.result.ok, true);
    assert.equal(dep.data.bank[0].length, 1);
    assert.equal((await act('inventory/withdrawItem', { itemId: 'bound', page: 0 })).data.bank[0].length, 0);
    assert.equal((await act('inventory/depositItem', { itemId: 'bound', page: 9 })).data.result.reason, 'invalidPage');
    const goldBefore = (await call('backup', null, cookie)).data.data.characters[0].gold;
    const dg = await act('inventory/depositGold', { amount: 10 });
    assert.equal(dg.data.bankGold, 10);
    assert.equal(dg.data.patch.gold, goldBefore - 10);
    assert.equal((await act('inventory/depositGold', { amount: goldBefore })).data.result.reason, 'notEnoughGold');
    assert.equal((await act('inventory/depositGold', { amount: -5 })).data.result.reason, 'invalidAmount');
    assert.equal((await act('inventory/depositGold', { amount: 2.5 })).data.result.reason, 'invalidAmount');
    assert.equal((await act('inventory/withdrawGold', { amount: 11 })).data.result.reason, 'notEnoughBankGold');
    assert.equal((await act('inventory/withdrawGold', { amount: 10 })).data.patch.gold, goldBefore);

    // Bad requests never crash the server.
    assert.equal((await act('nope/nothing')).data.result.reason, 'unknownAction');
    assert.equal((await act('__proto__')).data.result.reason, 'unknownAction');
    assert.equal((await call('game/act', { characterKey: 'hero', type: 'inventory/sell', payload: 'x' }, cookie)).data.result.reason, 'invalidPayload');
    assert.equal((await act('inventory/sell', {}, 'ghost')).status, 404);
    assert.equal((await call('game/act', { type: 'inventory/sell' }, cookie)).status, 400);
    assert.equal((await call('game/act', { characterKey: 'hero', type: 'inventory/sell', payload: { itemId: 'x' } })).status, 401);

    // Another account is untouched by all of this.
    const bob = (await call('register', { name: 'bob', password })).cookie;
    assert.equal((await call('game/act', { characterKey: 'hero', type: 'inventory/sell', payload: { itemId: 'worn' } }, bob)).status, 409);
    db.close();
  } finally { await api.close(); }
});

test('battle income is decided by the server: fights must be started, kills are priced from data, dungeon stages run in order', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'carol', password })).cookie;
    const character = hero();
    character.level = 30;
    character.inventory = [...character.inventory, { id: 'pot-1', kind: 'potion', potionType: 'hp', tier: 1, count: 2, name: 'HP', weight: 0, noTrade: false }];
    character.equipped = { ...character.equipped, mainHand: sword({ id: 'wield', currentDurability: 1000 }) };
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const firstMonster = 'sis_kurdu';

    // No reward without a started fight, none for unknown monsters, none for another map's monsters.
    assert.equal((await act('battle/kill', { monsterId: firstMonster })).data.result.reason, 'noFight');
    assert.equal((await act('battle/start', { monsterId: 'made_up' })).data.result.reason, 'unknownMonster');
    assert.equal((await act('battle/start', { monsterId: 'kul_yaratigi' })).data.result.reason, 'wrongMap');
    assert.equal((await act('battle/start', { monsterId: 'sis_kurdu_2' })).data.result.reason, 'unknownMonster');

    // A kill straight after the start is refused; after the minimum time the server pays the data-driven reward.
    assert.equal((await act('battle/start', { monsterId: firstMonster })).data.result.ok, true);
    assert.equal((await act('battle/kill', { monsterId: firstMonster })).data.result.reason, 'tooFast');
    await wait(750);
    const before = await state();
    const kill = await act('battle/kill', { monsterId: firstMonster, wear: { weapon: 40, armor: 5000 } });
    assert.equal(kill.data.result.ok, true);
    assert.ok(kill.data.result.drops.some((d) => d.type === 'xp'));
    const after = await state();
    assert.ok(after.gold >= before.gold + 6 && after.gold <= before.gold + 200, 'gold comes from the monster table, not from the client');
    assert.equal(after.monsterKills[firstMonster], 1);
    assert.equal(after.equipped.mainHand.currentDurability, 960, 'reported weapon wear is applied');
    assert.equal((await act('battle/kill', { monsterId: firstMonster })).data.result.reason, 'noFight', 'one fight pays once');

    // Locked monsters and the map guardian need their progress first.
    assert.equal((await act('battle/start', { monsterId: 'kabuklu_golem' })).data.result.reason, 'monsterLocked');
    assert.equal((await act('battle/start', { monsterId: 'map_boss_fallow_valley' })).data.result.reason, 'mapIncomplete');

    // Potions are consumed on the server; healing uses the reported hp.
    const potionCount = async () => (await state()).inventory.filter((i) => i.kind === 'potion' && i.potionType === 'hp' && i.tier === 1).reduce((n, i) => n + i.count, 0);
    const potionsBefore = await potionCount();
    const potion = await act('battle/potion', { kind: 'hp', hp: 1, mp: 0 });
    assert.equal(potion.data.result.ok, true);
    assert.ok(potion.data.result.healed > 0);
    assert.equal(await potionCount(), potionsBefore - 1);
    assert.equal((await act('battle/potion', { kind: 'nonsense' })).data.result.reason, 'invalidKind');

    // Solo dungeon: needs an entry first, stages come in order, the boss pays the completion reward once.
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_1' })).data.result.reason, 'noDungeonRun');
    const entry = await act('battle/dungeonEntry');
    assert.equal(entry.data.result.ok, true);
    assert.equal((await state()).soloDungeon.entriesUsed, 1);
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_3' })).data.result.reason, 'noDungeonRun', 'cannot skip stages');
    for (const id of ['dungeon_fallow_valley_1', 'dungeon_fallow_valley_2_risk', 'dungeon_fallow_valley_3', 'dungeon_fallow_valley_4', 'dungeon_fallow_valley_5']) {
      assert.equal((await act('battle/start', { monsterId: id })).data.result.ok, true, id);
      await wait(720);
      assert.equal((await act('battle/kill', { monsterId: id })).data.result.ok, true, id);
    }
    const goldBeforeBoss = (await state()).gold;
    const chestsBeforeBoss = (await state()).chests.length;
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_boss' })).data.result.ok, true);
    await wait(720);
    const bossKill = await act('battle/kill', { monsterId: 'dungeon_fallow_valley_boss' });
    assert.equal(bossKill.data.result.ok, true);
    assert.ok(bossKill.data.result.completion.bonusGold > 0);
    assert.ok((await state()).chests.length > chestsBeforeBoss);
    assert.ok((await state()).gold > goldBeforeBoss);
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_boss' })).data.result.reason, 'noDungeonRun', 'the run is over');
    // Three entries a day, never more.
    await act('battle/dungeonEntry');
    await act('battle/dungeonEntry');
    assert.equal((await act('battle/dungeonEntry')).data.result.reason, 'entriesExhausted');

    // Death costs xp and clears the fight; teleport charges the gate fee and respects the level lock.
    await act('battle/start', { monsterId: firstMonster });
    const death = await act('battle/death', { wear: { weapon: 1, armor: 1 } });
    assert.equal(death.data.result.ok, true);
    assert.equal((await act('battle/kill', { monsterId: firstMonster })).data.result.reason, 'noFight');
    assert.equal((await act('map/teleport', { mapId: 'nowhere' })).data.result.reason, 'unknownMap');
    assert.equal((await act('map/teleport', { mapId: 'fallow_valley' })).data.result.reason, 'sameMap');
    db.close();
  } finally { await api.close(); }
});

test('warzone: entry fee, boss loot only against a real claim (consumed once), hunts need a search and a started fight', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'dave', password })).cookie;
    const character = hero();
    character.level = 55;
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const crimson = 'kizil_muhafiz';

    // Nothing works before entering; entering costs gold.
    assert.equal((await act('warzone/huntSearch')).data.result.reason, 'notEntered');
    const goldStart = (await state()).gold;
    assert.equal((await act('warzone/enter')).data.result.ok, true);
    assert.equal((await state()).gold, goldStart - 50);

    // Boss loot: no claim, no loot; a forged boss id is ignored; the claim is spent exactly once.
    assert.equal((await act('warzone/bossLoot', { claimId: 999, bossId: 'buz_krali' })).data.result.reason, 'noClaim');
    db.prepare('INSERT INTO boss_loot_claims(account,boss_id,created_at) VALUES(1,?,?)').run('kan_imparatoru', Date.now());
    const gold0 = (await state()).gold;
    const loot = await act('warzone/bossLoot', { claimId: 1, bossId: 'buz_krali' });
    assert.equal(loot.data.result.ok, true);
    assert.equal(loot.data.result.drops[0].type, 'gold');
    assert.ok(loot.data.result.drops[0].amount >= 300);
    assert.ok((await state()).gold >= gold0 + 300);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM boss_loot_claims').get().n, 0);
    assert.equal((await act('warzone/bossLoot', { claimId: 1 })).data.result.reason, 'noClaim');
    // Another account cannot spend this account's claim.
    db.prepare('INSERT INTO boss_loot_claims(account,boss_id,created_at) VALUES(1,?,?)').run('alev_tanrisi', Date.now());
    const bob = (await call('register', { name: 'erin', password })).cookie;
    assert.equal((await call('game/act', { characterKey: 'hero', type: 'warzone/bossLoot', payload: { claimId: 2 } }, bob)).status, 409);

    // Hunts: need a search, enough search time, then a started fight, then the minimum fight time.
    assert.equal((await act('warzone/huntStart', { monsterId: crimson })).data.result.reason, 'searchTooShort');
    assert.equal((await act('warzone/huntKill', { monsterId: crimson })).data.result.reason, 'noFight');
    assert.equal((await act('warzone/huntSearch')).data.result.ok, true);
    assert.equal((await act('warzone/huntStart', { monsterId: crimson })).data.result.reason, 'searchTooShort');
    await wait(4600);
    assert.equal((await act('warzone/huntStart', { monsterId: 'made_up' })).data.result.reason, 'unknownMonster');
    assert.equal((await act('warzone/huntStart', { monsterId: crimson })).data.result.ok, true);
    assert.equal((await act('warzone/huntKill', { monsterId: crimson })).data.result.reason, 'tooFast');
    await wait(750);
    const before = await state();
    const kill = await act('warzone/huntKill', { monsterId: crimson });
    assert.equal(kill.data.result.ok, true);
    assert.ok(kill.data.result.drops.some((d) => d.type === 'xp'));
    assert.ok((await state()).gold > before.gold);
    assert.equal((await act('warzone/huntKill', { monsterId: crimson })).data.result.reason, 'noFight', 'one hunt pays once');

    // Leaving clears the entry.
    assert.equal((await act('warzone/leave')).data.result.ok, true);
    assert.equal((await act('warzone/huntSearch')).data.result.reason, 'notEntered');
    db.close();
  } finally { await api.close(); }
});
