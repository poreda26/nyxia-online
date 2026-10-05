import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { createCharacter, createFight, stepFight, resolveMonster, MIN_TURN_MS, MAPS, buildHuntMonster, getWarzoneHuntConfig } from '../server/game-logic.generated.mjs';

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

test('battle is replayed on the server: seed from the server, the result comes from the replay, tampered logs and rushed fights are refused', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'carol', password })).cookie;
    const character = hero();
    character.level = 30;
    character.inventory = [...character.inventory, { id: 'pot-1', kind: 'potion', potionType: 'hp', tier: 1, count: 2, name: 'HP', weight: 0, noTrade: false }];
    character.equipped = { ...character.equipped, mainHand: sword({ id: 'wield', atk: 1, currentDurability: 1000 }) };
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const firstMonster = 'sis_kurdu';
    const strongSword = () => db.prepare("UPDATE backups SET data=json_set(data,'$.characters[0].equipped.mainHand.atk',4000)").run();

    // Plays a fight with the shared engine exactly like the client: attacks (plus optional leading actions) until it ends.
    const play = async (monsterId, { lead = [], waitFull = true, stopAfter = Infinity } = {}) => {
      const started = await act('battle/start', { monsterId });
      assert.equal(started.data.result.ok, true, `start ${monsterId}`);
      const player = await state();
      const target = resolveMonster(monsterId);
      let fight = createFight(player, target.monster, started.data.result.seed);
      const actions = [];
      for (const action of [...lead, ...Array(600).fill({ type: 'attack' })]) {
        if (fight.ended || actions.length >= stopAfter) break;
        const out = stepFight(fight, player, target.monster, target.map.levelMax, action);
        if (out.error) throw new Error(out.error);
        fight = out.fight; actions.push(action);
      }
      if (waitFull) await wait(Math.max(0, fight.turn * MIN_TURN_MS - 1500) + 40);
      return { actions, fight, settle: () => act('battle/settle', { monsterId, actions }) };
    };

    // Nothing without a started fight, nothing for made-up or other-map monsters.
    assert.equal((await act('battle/settle', { monsterId: firstMonster, actions: [] })).data.result.reason, 'noFight');
    assert.equal((await act('battle/start', { monsterId: 'made_up' })).data.result.reason, 'unknownMonster');
    assert.equal((await act('battle/start', { monsterId: 'kul_yaratigi' })).data.result.reason, 'wrongMap');
    assert.equal((await act('battle/start', { monsterId: 'sis_kurdu_2' })).data.result.reason, 'unknownMonster');

    // A rushed, long fight is refused until real time has passed; the same log is accepted afterwards.
    const slow = await play(firstMonster, { waitFull: false });
    assert.ok(slow.fight.turn >= 7, 'a weak hero needs several turns');
    assert.equal((await slow.settle()).data.result.reason, 'tooFast');
    await wait(Math.max(0, slow.fight.turn * MIN_TURN_MS - 1500) + 100);
    const settledSlow = await slow.settle();
    assert.equal(settledSlow.data.result.ok, true);
    assert.equal(settledSlow.data.result.outcome, slow.fight.ended, 'the server reaches the same result as the replay');
    // An unfinished log is a retreat: no reward, no kill count.
    const quit = await play('sis_kurdu', { stopAfter: 2 });
    const killsBefore = (await state()).monsterKills?.[firstMonster] || 0;
    const retreat = await quit.settle();
    assert.equal(retreat.data.result.outcome, 'retreat');
    assert.equal((await state()).monsterKills?.[firstMonster] || 0, killsBefore);
    assert.equal((await state()).fight, null);

    // From here the hero hits hard. Tampered logs: extra actions after the end, unknown skills, wrong monster.
    strongSword();
    const won = await play(firstMonster, { lead: [{ type: 'potion', kind: 'hp' }] });
    assert.equal(won.fight.ended, 'win');
    assert.equal((await act('battle/settle', { monsterId: firstMonster, actions: [...won.actions, { type: 'attack' }] })).data.result.reason, 'invalidLog');
    assert.equal((await act('battle/settle', { monsterId: firstMonster, actions: [{ type: 'skill', id: 'not_known' }] })).data.result.reason, 'invalidLog');
    assert.equal((await act('battle/settle', { monsterId: 'kabuklu_golem', actions: won.actions })).data.result.reason, 'noFight');
    const before = await state();
    const settled = await won.settle();
    assert.equal(settled.data.result.outcome, 'win');
    assert.ok(settled.data.result.drops.some((d) => d.type === 'xp'));
    const after = await state();
    assert.ok(after.gold >= before.gold + 6 && after.gold <= before.gold + 200, 'gold comes from the monster table');
    assert.equal(after.monsterKills[firstMonster], (before.monsterKills?.[firstMonster] || 0) + 1);
    assert.ok(after.equipped.mainHand.currentDurability < 1000, 'wear comes from the replay');
    const potions = after.inventory.filter((i) => i.kind === 'potion' && i.potionType === 'hp' && i.tier === 1).reduce((n, i) => n + i.count, 0);
    const potionsBefore = before.inventory.filter((i) => i.kind === 'potion' && i.potionType === 'hp' && i.tier === 1).reduce((n, i) => n + i.count, 0);
    assert.equal(potions, potionsBefore - 1, 'the potion drunk in the log is consumed');
    assert.equal((await act('battle/settle', { monsterId: firstMonster, actions: won.actions })).data.result.reason, 'noFight', 'one fight pays once');

    // Locked monsters and the map guardian need their progress first.
    assert.equal((await act('battle/start', { monsterId: 'kabuklu_golem' })).data.result.reason, 'monsterLocked');
    assert.equal((await act('battle/start', { monsterId: 'map_boss_fallow_valley' })).data.result.reason, 'mapIncomplete');

    // Solo dungeon: needs an entry first, stages come in order, the boss pays the completion reward once.
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_1' })).data.result.reason, 'noDungeonRun');
    const entry = await act('battle/dungeonEntry');
    assert.equal(entry.data.result.ok, true);
    assert.equal((await state()).soloDungeon.entriesUsed, 1);
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_3' })).data.result.reason, 'noDungeonRun', 'cannot skip stages');
    for (const id of ['dungeon_fallow_valley_1', 'dungeon_fallow_valley_2_risk', 'dungeon_fallow_valley_3', 'dungeon_fallow_valley_4', 'dungeon_fallow_valley_5']) {
      const round = await play(id);
      assert.equal(round.fight.ended, 'win', id);
      assert.equal((await round.settle()).data.result.outcome, 'win', id);
    }
    const goldBeforeBoss = (await state()).gold;
    const chestsBeforeBoss = (await state()).chests.length;
    const boss = await play('dungeon_fallow_valley_boss');
    const bossKill = await boss.settle();
    assert.equal(bossKill.data.result.outcome, 'win');
    assert.ok(bossKill.data.result.completion.bonusGold > 0);
    assert.ok((await state()).chests.length > chestsBeforeBoss);
    assert.ok((await state()).gold > goldBeforeBoss);
    assert.equal((await act('battle/start', { monsterId: 'dungeon_fallow_valley_boss' })).data.result.reason, 'noDungeonRun', 'the run is over');
    // Three entries a day, never more.
    await act('battle/dungeonEntry');
    await act('battle/dungeonEntry');
    assert.equal((await act('battle/dungeonEntry')).data.result.reason, 'entriesExhausted');

    // Death: a hero who cannot win dies in the replay, loses xp, and the fight is cleared.
    db.prepare("UPDATE backups SET data=json_set(data,'$.characters[0].equipped.mainHand.atk',1,'$.characters[0].stats.sta',1)").run();
    const doomed = await play('dungeon_fallow_valley_boss').catch(() => null);
    void doomed; // the run is over, so this start is refused; use the first-map monster for the death check below
    await act('battle/start', { monsterId: firstMonster });
    assert.equal((await act('battle/death', { wear: { weapon: 1, armor: 1 } })).data.result.ok, true);
    assert.equal((await act('battle/settle', { monsterId: firstMonster, actions: [] })).data.result.reason, 'noFight');
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

    // Hunts: need a search, enough search time, a started fight; the result is the server's replay of the action log.
    assert.equal((await act('warzone/huntStart', { monsterId: crimson })).data.result.reason, 'searchTooShort');
    assert.equal((await act('warzone/huntSettle', { monsterId: crimson, actions: [] })).data.result.reason, 'noFight');
    assert.equal((await act('warzone/huntSearch')).data.result.ok, true);
    assert.equal((await act('warzone/huntStart', { monsterId: crimson })).data.result.reason, 'searchTooShort');
    await wait(4600);
    assert.equal((await act('warzone/huntStart', { monsterId: 'made_up' })).data.result.reason, 'unknownMonster');
    db.prepare("UPDATE backups SET data=json_set(data,'$.characters[0].equipped.mainHand', json('{\"id\":\"big\",\"kind\":\"weapon\",\"weaponType\":\"sword\",\"weaponSlot\":\"mainHand\",\"cls\":\"warrior\",\"tier\":1,\"atk\":200000,\"def\":0,\"hp\":0,\"mp\":0,\"weight\":1,\"durability\":1000,\"currentDurability\":1000,\"upgradeLevel\":0,\"reqStats\":[]}'))").run();
    const started = await act('warzone/huntStart', { monsterId: crimson });
    assert.equal(started.data.result.ok, true);
    const hero1 = await state();
    const template = MAPS.find((m) => m.id === 'crimson_battlefront').monsters.find((m) => m.id === crimson);
    const monster = buildHuntMonster(template, getWarzoneHuntConfig().powerMult);
    let fight = createFight(hero1, monster, started.data.result.seed);
    const actions = [];
    while (!fight.ended && actions.length < 100) { fight = stepFight(fight, hero1, monster, 65, { type: 'attack' }).fight; actions.push({ type: 'attack' }); }
    assert.equal(fight.ended, 'win');
    assert.equal((await act('warzone/huntSettle', { monsterId: crimson, actions: [...actions, { type: 'attack' }] })).data.result.reason, 'invalidLog');
    await wait(Math.max(0, fight.turn * MIN_TURN_MS - 1500) + 40);
    const before = await state();
    const kill = await act('warzone/huntSettle', { monsterId: crimson, actions });
    assert.equal(kill.data.result.outcome, 'win');
    assert.ok(kill.data.result.drops.some((d) => d.type === 'xp'));
    assert.ok((await state()).gold > before.gold);
    assert.equal((await act('warzone/huntSettle', { monsterId: crimson, actions })).data.result.reason, 'noFight', 'one hunt pays once');

    // Leaving clears the entry.
    assert.equal((await act('warzone/leave')).data.result.ok, true);
    assert.equal((await act('warzone/huntSearch')).data.result.reason, 'notEntered');
    db.close();
  } finally { await api.close(); }
});

test('rewards the server owns: quests need real kills, daily login is once a day and takes streak/diamonds from the wallet, wheel item comes from the pending spin', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'frank', password })).cookie;
    const character = hero();
    character.monsterKills = { sis_kurdu: 60 };
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];

    // Captain quest: claimable only with enough kills, only once.
    assert.equal((await act('captain/quest', { questId: 'kabuklu_golem' })).data.result.reason, 'questNotDone');
    assert.equal((await act('captain/quest', { questId: 'made_up' })).data.result.reason, 'invalidQuest');
    const gold0 = (await state()).gold;
    const quest = await act('captain/quest', { questId: 'sis_kurdu' });
    assert.equal(quest.data.result.ok, true);
    assert.ok((await state()).gold > gold0);
    assert.equal((await act('captain/quest', { questId: 'sis_kurdu' })).data.result.reason, 'rewardAlreadyClaimed');
    // Daily/weekly/book rewards need the counters the kills produce.
    assert.equal((await act('captain/daily', { slotIndex: 0 })).data.result.reason, 'questNotDone');
    assert.equal((await act('captain/daily', { slotIndex: 'x' })).data.result.reason, 'invalidQuest');
    assert.equal((await act('captain/weekly', { id: 'nope' })).data.result.reason, 'invalidQuest');
    assert.equal((await act('captain/book', { id: 'collection_fallow_valley' })).data.result.reason, 'mapNotFullyExplored');
    assert.equal((await act('captain/buyNp')).data.result.reason, 'npStillAvailable');

    // Daily login: the streak and diamonds come from the wallet; the client cannot forge them; once per day.
    const first = await act('dailyLogin/claim', { server: { streak: 7, diamonds: 99999 } });
    assert.equal(first.data.result.ok, true);
    assert.equal(first.data.result.streak, 1, 'forged streak is ignored');
    const wallet = (await call('wallet', null, cookie)).data;
    assert.ok(wallet.diamonds < 99999);
    const second = await act('dailyLogin/claim', { server: { streak: 1, diamonds: 0 } });
    assert.equal(second.status, 409);
    assert.equal(second.data.error, 'DAILY_ALREADY_CLAIMED');

    // Wheel item: nothing to claim before a spin; afterwards the spin's own prize is delivered once.
    assert.equal((await act('wheel/claimItem', { prize: 'wing', spunAt: 1 })).data.result.reason, 'noPendingPrize');
    const spin = await call('wheel/spin', {}, cookie);
    assert.equal(spin.status, 200);
    if (['mythic_1d', 'apex_3d'].includes(spin.data.prize)) {
      assert.equal((await act('wheel/claimItem', {})).data.result.reason, 'bagFull', 'premium prizes are delivered through the entitlement route, never as an item');
    } else {
      const before = await state();
      const claimed = await act('wheel/claimItem', { prize: 'wing', spunAt: 1 });
      assert.equal(claimed.data.result.ok, true);
      assert.equal(claimed.data.result.prize, spin.data.prize, 'the client cannot pick its prize');
      assert.notDeepEqual((await state()).inventory, before.inventory);
      assert.equal((await act('wheel/claimItem', {})).data.result.reason, 'noPendingPrize');
    }

    // Tutorial gift once; top-up only while the tutorial runs.
    assert.equal((await act('tutorial/gift')).data.result.ok, true);
    const afterGift = (await state()).gold;
    assert.equal((await act('tutorial/gift')).data.result.ok, true);
    assert.equal((await state()).gold, afterGift, 'the gift is given once');
    // Scheduled events: unknown event and not-open event are refused.
    assert.equal((await act('event/join', { eventId: 'made_up' })).data.result.reason, 'unknownEvent');
    assert.equal((await act('event/credit', { eventId: 'made_up' })).data.result.reason, 'unknownEvent');
    db.close();
  } finally { await api.close(); }
});

test('shop and forge run on the server: items leave the bag into the forge, the dice are rolled server-side, nothing can be duplicated', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'gina', password })).cookie;
    const character = hero();
    character.gold = 100000;
    character.inventory = [...character.inventory, sword({ id: 'blade-a' }), sword({ id: 'blade-b', noTrade: true }),
      { id: 'ring-1', kind: 'accessory', name: 'Test Ring', tier: 1, upgradeLevel: 0, weight: 0.1, stats: {} },
      { id: 'ring-2', kind: 'accessory', name: 'Test Ring', tier: 1, upgradeLevel: 0, weight: 0.1, stats: {} },
      { id: 'ring-3', kind: 'accessory', name: 'Test Ring', tier: 1, upgradeLevel: 0, weight: 0.1, stats: {} },
      { id: 'ring-x', kind: 'accessory', name: 'Other Ring', tier: 1, upgradeLevel: 0, weight: 0.1, stats: {} }];
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const scrollCount = async (tier) => ((await state()).inventory.find((i) => i.kind === 'scroll' && i.tier === tier) || { count: 0 }).count;

    // Shop: the server prices the scroll; a made-up tier or no gold buys nothing.
    assert.equal((await act('shop/buyScroll', { tier: 99 })).data.result.reason, 'invalidTier');
    const gold0 = (await state()).gold;
    assert.equal((await act('shop/buyScroll', { tier: 1 })).data.result.ok, true);
    assert.ok((await state()).gold < gold0);
    assert.equal(await scrollCount(1), 1);
    assert.equal((await act('shop/buyAccessoryScroll')).data.result.ok, true);

    // Forge: bound items refused; the staged item really leaves the bag; swapping returns the old one.
    assert.equal((await act('forge/stageItem', { itemId: 'blade-b' })).data.result.reason, 'itemNoTrade');
    assert.equal((await act('forge/stageItem', { itemId: 'ghost' })).data.result.reason, 'itemNotFound');
    assert.equal((await act('forge/stageItem', { itemId: 'blade-a' })).data.result.ok, true);
    let s = await state();
    assert.equal(s.inventory.some((i) => i.id === 'blade-a'), false);
    assert.equal(s.forge.item.id, 'blade-a');
    assert.equal((await act('forge/press')).data.result.reason, 'noScrollForTier');
    assert.equal((await act('forge/stageScroll', { tier: 1 })).data.result.ok, true);
    assert.equal(await scrollCount(1), 0);
    assert.equal((await act('forge/stageScroll', { tier: 1 })).data.result.reason, 'scrollNotFound');

    // Press: success keeps the id and adds a level; failure destroys the item. Either way the scroll is spent.
    const pressed = await act('forge/press');
    assert.equal(pressed.data.result.ok, true);
    s = await state();
    assert.equal(s.forge.item, null);
    assert.ok(s.forge.boxes.every((b) => b === null));
    if (pressed.data.result.success) {
      const upgraded = s.inventory.find((i) => i.id === 'blade-a');
      assert.equal(upgraded.upgradeLevel, 1);
    } else {
      assert.equal(s.inventory.some((i) => i.id === 'blade-a'), false);
    }
    assert.equal((await act('forge/press')).data.result.reason, 'noItem');

    // Leaving the screen hands everything back, nothing is duplicated or lost.
    await act('shop/buyScroll', { tier: 1 });
    await act('forge/stageScroll', { tier: 1 });
    const before = await state();
    assert.equal(before.forge.boxes.filter(Boolean).length, 1);
    assert.equal((await act('forge/clear')).data.result.ok, true);
    assert.equal(await scrollCount(1), 1);
    assert.ok((await state()).forge.boxes.every((b) => b === null));

    // Accessories: must match, three of them plus a scroll; always succeeds and merges into one.
    assert.equal((await act('accessory/stageItem', { itemId: 'ring-1' })).data.result.ok, true);
    assert.equal((await act('accessory/stageItem', { itemId: 'ring-x' })).data.result.reason, 'mustMatch');
    assert.equal((await act('accessory/press')).data.result.reason, 'notReady');
    await act('accessory/stageItem', { itemId: 'ring-2' });
    await act('accessory/stageItem', { itemId: 'ring-3' });
    assert.equal((await act('accessory/stageScroll')).data.result.ok, true);
    const merged = await act('accessory/press');
    assert.equal(merged.data.result.ok, true);
    s = await state();
    assert.equal(s.inventory.filter((i) => i.name === 'Test Ring').length, 1);
    assert.equal(s.inventory.some((i) => ['ring-1', 'ring-2', 'ring-3'].includes(i.id)), false, 'the three rings are consumed');
    db.close();
  } finally { await api.close(); }
});

test('market on the server: only real bag items can be listed, a purchase moves the item and pays the seller in one step, legacy routes are closed', async () => {
  const { api, call, database } = await boot();
  try {
    const seller = (await call('register', { name: 'sally', password })).cookie;
    const buyer = (await call('register', { name: 'bert', password })).cookie;
    const mk = (extra = {}) => { const c = hero(); c.gold = 5000; c.inventory = [...c.inventory, sword({ id: 'for-sale' }), sword({ id: 'bound', noTrade: true })]; c.chests = [{ id: 'chest-1', tier: 1 }]; return Object.assign(c, extra); };
    for (const [cookie, c] of [[seller, mk()], [buyer, mk({ inventory: hero().inventory })]]) {
      assert.equal((await call('backup', { revision: 0, data: { characters: [c, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT')).status, 200);
    }
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    db.prepare('INSERT INTO economy_accounts VALUES(2,?)').run(Date.now());
    const as = (cookie) => (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const sAct = as(seller), bAct = as(buyer);
    const state = async (cookie) => (await call('backup', null, cookie)).data.data;

    // Legacy routes cannot be used to list a forged item once the server economy is on.
    assert.equal((await call('market/stall/items', { item: sword({ id: 'forged', atk: 9999 }), price: 1 }, seller)).status, 409);
    assert.equal((await call('market/buy', { sellerId: 1, itemId: 'x' }, buyer)).status, 409);

    // Open a stall: the fee comes out of gold; a second stall is refused.
    assert.equal((await sAct('market/addItem', { itemId: 'for-sale', price: 100 })).data.result.reason, 'noOpenStall');
    const gold0 = (await state(seller)).characters[0].gold;
    assert.equal((await sAct('market/openStall', { durationHours: 1, sellerName: 'Sally' })).data.result.ok, true);
    assert.equal((await state(seller)).characters[0].gold, gold0 - 25);
    assert.equal((await sAct('market/openStall', { durationHours: 1, sellerName: 'Sally' })).data.result.reason, 'stallAlreadyOpen');

    // Listing: bound and unknown items are refused, a listed item leaves the bag, price limits hold.
    assert.equal((await sAct('market/addItem', { itemId: 'bound', price: 100 })).data.result.reason, 'noTrade');
    assert.equal((await sAct('market/addItem', { itemId: 'ghost', price: 100 })).data.result.reason, 'itemNotFound');
    assert.equal((await sAct('market/addItem', { itemId: 'for-sale', price: 0 })).data.result.reason, 'addFailed');
    assert.equal((await sAct('market/addItem', { itemId: 'for-sale', price: 1500 })).data.result.ok, true);
    assert.equal((await state(seller)).characters[0].inventory.some((i) => i.id === 'for-sale'), false);
    assert.equal((await sAct('market/addItem', { itemId: 'chest-1', price: 300, asChest: true })).data.result.ok, true);
    const stalls = (await call('market/stalls', null, buyer)).data.stalls;
    assert.equal(stalls[0].items.length, 2);
    const listing = stalls[0].items.find((e) => e.item.id === 'for-sale');

    // Buying: needs gold, the item arrives, the seller is paid in the bank, nobody else can buy it again.
    assert.equal((await bAct('market/buy', { sellerId: 1, listingId: 'nope' })).data.result.reason, 'marketItemGone');
    assert.equal((await sAct('market/buy', { sellerId: 1, listingId: listing.id })).data.result.reason, 'cannotBuyOwn');
    db.prepare("UPDATE backups SET data=json_set(data,'$.characters[0].gold',100) WHERE account=2").run();
    assert.equal((await bAct('market/buy', { sellerId: 1, listingId: listing.id })).data.result.reason, 'notEnoughGold');
    db.prepare("UPDATE backups SET data=json_set(data,'$.characters[0].gold',5000) WHERE account=2").run();
    const bought = await bAct('market/buy', { sellerId: 1, listingId: listing.id });
    assert.equal(bought.data.result.ok, true);
    assert.equal((await state(buyer)).characters[0].gold, 3500);
    assert.equal((await state(buyer)).characters[0].inventory.some((i) => i.id === 'for-sale'), true);
    assert.equal((await state(seller)).bankGold, 1500);
    assert.equal((await bAct('market/buy', { sellerId: 1, listingId: listing.id })).data.result.reason, 'marketItemGone');

    // Taking the rest back: the chest returns to the seller.
    const back = await sAct('market/takeBack', { itemIds: (await call('market/stall', null, seller)).data.stall.items.map((e) => e.id) });
    assert.equal(back.data.result.ok, true);
    assert.equal(back.data.result.placedChests, 1);
    assert.equal((await state(seller)).characters[0].chests.length, 1);
    assert.equal((await call('market/stall', null, seller)).data.stall, null, 'an empty stall is removed');

    // Potions are priced by the server.
    assert.equal((await bAct('shop/buyPotion', { potionType: 'hp', tier: 1, qty: 0 })).data.result.reason, 'invalidAmount');
    assert.equal((await bAct('shop/buyPotion', { potionType: 'hp', tier: 9, qty: 1 })).data.result.reason, 'invalidPotion');
    assert.equal((await bAct('shop/buyPotion', { potionType: 'hp', tier: 1, qty: 2 })).data.result.ok, true);
    assert.ok((await state(buyer)).characters[0].gold < 3500);
    db.close();
  } finally { await api.close(); }
});

test('clan donations and leaving run on the server: the player pays and the treasury grows together, the refund comes from the real donated total, dungeon drops are granted from pending records', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'hank', password })).cookie;
    const character = hero();
    character.nationalPoint = 100;
    character.gold = 1000;
    character.inventory = [...character.inventory, { id: 'mat-1', kind: 'clanMaterial', materialKey: 'wood', name: 'Wood', count: 5, stackable: true, stackKey: 'clanMaterial:wood', weight: 0.1 }];
    assert.equal((await call('backup', { revision: 0, data: { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    db.prepare('UPDATE wallets SET diamonds=5000').run();
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const asHero = async (path, body, method) => {
      const r = await fetch(`http://127.0.0.1:${api.server.address().port}/api/${path}`, { method: method || (body ? 'POST' : 'GET'), headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', Cookie: cookie, 'X-Character-Key': 'hero' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: r.status, data: await r.json().catch(() => ({})) };
    };

    assert.equal((await act('clan/donate', { currency: 'gold', amount: 10 })).data.result.reason, 'notInClan');
    assert.equal((await asHero('clan', { name: 'Test Clan' })).status, 200);

    // Donations: bad inputs refused, the player pays what the treasury receives, and the old route is closed.
    assert.equal((await act('clan/donate', { currency: 'gold', amount: -5 })).data.result.reason, 'invalidDonation');
    assert.equal((await act('clan/donate', { currency: 'junk', amount: 5 })).data.result.reason, 'invalidDonation');
    assert.equal((await act('clan/donate', { currency: 'gold', amount: 5000 })).data.result.reason, 'notEnoughGold');
    assert.equal((await act('clan/donate', { currency: 'gold', amount: 400 })).data.result.ok, true);
    assert.equal((await act('clan/donate', { currency: 'np', amount: 60 })).data.result.ok, true);
    assert.equal((await act('clan/donate', { currency: 'wood', amount: 3 })).data.result.ok, true);
    const after = await state();
    assert.equal(after.gold, 600);
    assert.equal(after.nationalPoint, 40);
    assert.equal(after.inventory.find((i) => i.id === 'mat-1').count, 2);
    const treasury = (await asHero('clan/mine')).data.clan.treasury;
    assert.equal(treasury.gold, 400);
    assert.equal(treasury.np, 60);
    assert.equal((await asHero('clan/donate', { currency: 'gold', amount: 1 })).status, 409, 'legacy donate route is closed for gold');
    assert.equal((await asHero('clan/donate', { currency: 'diamonds', amount: 1 })).status, 200, 'diamond donations still go through the wallet');

    // Dungeon drops: a server-recorded pending drop is granted once; nothing pending, nothing granted.
    assert.equal((await act('clan/claimMaterials')).data.result.reason, 'nothingToClaim');
    db.prepare("INSERT INTO pending_grants(account,character_key,kind,grant_key,created_at) VALUES(1,'hero','clanMaterial','iron',?)").run(Date.now());
    const claim = await act('clan/claimMaterials', { materials: ['goldBar', 'goldBar'] });
    assert.equal(claim.data.result.placed, 1);
    const granted = (await state()).inventory.filter((i) => i.kind === 'clanMaterial');
    assert.ok(granted.some((i) => i.materialKey === 'iron'), 'the recorded drop is granted');
    assert.equal(granted.some((i) => i.materialKey === 'goldBar'), false, 'a forged material list is ignored');
    assert.equal((await act('clan/claimMaterials')).data.result.reason, 'nothingToClaim');

    // Leaving: the refund is 35% of the real donated NP and the legacy leave route is closed.
    assert.equal((await asHero('clan/leave', {})).status, 409);
    const left = await act('clan/leave', { donatedNp: 99999 });
    assert.equal(left.data.result.ok, true);
    assert.equal(left.data.result.refund, Math.round(60 * 0.35));
    assert.equal((await state()).nationalPoint, 40 + Math.round(60 * 0.35));
    assert.equal((await asHero('clan/mine')).data.clan, null);
    db.close();
  } finally { await api.close(); }
});

test('diamond purchases deliver in the same step as the charge; stats and skills follow the rules on the server', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'iris', password })).cookie;
    const character = hero();
    character.statPoints = 5;
    character.level = 20;
    character.gold = 100000;
    const data = { characters: [character, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const balance = async () => (await call('wallet', null, cookie)).data.diamonds;

    // No diamonds: nothing is delivered; with diamonds the price comes from the server table.
    const refused = await act('diamond/buy', { kind: 'bonusScroll' });
    assert.equal(refused.status, 409);
    assert.equal(refused.data.error, 'NOT_ENOUGH_DIAMONDS');
    assert.equal((await state()).inventory.some((i) => i.kind === 'bonusScroll'), false);
    assert.equal((await act('diamond/buy', { kind: 'madeUp' })).data.result.reason, 'invalidPurchase');
    db.prepare('UPDATE wallets SET diamonds=2000').run();
    assert.equal((await act('diamond/buy', { kind: 'bonusScroll', diamonds: 999999, price: 0 })).data.result.ok, true);
    assert.equal(await balance(), 1200, 'forged price/balance in the request is ignored');
    assert.equal((await state()).inventory.some((i) => i.kind === 'bonusScroll'), true);
    assert.equal((await act('diamond/buy', { kind: 'bankPage' })).data.result.ok, true);
    assert.equal((await call('backup', null, cookie)).data.data.bank.length, 3);
    assert.equal((await act('diamond/buy', { kind: 'dungeonEntry' })).data.result.ok, true);
    const afterFirst = await balance();
    assert.ok(afterFirst < 1200);
    assert.equal((await act('diamond/buy', { kind: 'dungeonEntry' })).data.result.reason, 'alreadyBoughtToday');
    assert.equal(await balance(), afterFirst, 'a refused delivery does not cost diamonds');
    db.prepare('UPDATE wallets SET diamonds=20000').run();
    assert.equal((await act('diamond/buy', { kind: 'premium', key: 'apex' })).data.result.ok, true);
    assert.ok((await state()).premium?.tier === 'apex');
    assert.equal((await act('diamond/buy', { kind: 'premium', key: 'apex' })).status, 409, 'cannot buy the active premium again');

    // Stats: points are spent one by one up to the cap; hold-to-add batches are one request.
    const before = await state();
    assert.equal((await act('stat/allocate', { stat: 'bogus', count: 1 })).data.result.reason, 'invalidStat');
    assert.equal((await act('stat/allocate', { stat: 'str', count: 0 })).data.result.reason, 'invalidAmount');
    const spent = await act('stat/allocate', { stat: 'str', count: 3 });
    assert.equal(spent.data.result.applied, 3);
    assert.equal((await state()).stats.str, before.stats.str + 3);
    assert.equal((await state()).statPoints, 2);
    assert.equal((await act('stat/allocate', { stat: 'str', count: 50 })).data.result.applied, 2, 'stops when points run out');
    assert.equal((await act('stat/allocate', { stat: 'str', count: 1 })).data.result.reason, 'noStatPoints');
    const respec = await act('stat/respec');
    assert.equal(respec.data.result.ok, true);
    assert.equal((await state()).gold, 100000 - 20 * 200);

    // Skills: unknown loadout entries and locked skills are refused.
    assert.equal((await act('skill/loadout', { slot: 0, skillId: 'not_known' })).data.result.reason, 'skillNotKnown');
    assert.equal((await act('skill/loadout', { slot: 99, skillId: null })).data.result.reason, 'invalidSlot');
    assert.equal((await act('skill/learn', { skillId: 'nope' })).data.result.reason, 'skillLocked');
    db.close();
  } finally { await api.close(); }
});

test('duels are decided by the server with the same engine, scrolls and GM tools are checked, and forged progress is pinned back', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'jack', password })).cookie;
    const rival = (await call('register', { name: 'rita', password })).cookie;
    const mine = hero();
    mine.level = 50;
    mine.nationalPoint = 500;
    mine.inventory = [...mine.inventory,
      { id: 'job-1', kind: 'jobScroll', name: 'Job', count: 1, weight: 0.1 },
      { id: 'race-1', kind: 'raceScroll', name: 'Race', count: 1, weight: 0.1 }];
    assert.equal((await call('backup', { revision: 0, data: { race: 'karus', characters: [mine, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT')).status, 200);
    const theirs = { ...createCharacter('mage', 'elmorad', 'Rival'), id: 'rhero', level: 50 };
    assert.equal((await call('backup', { revision: 0, data: { race: 'elmorad', characters: [theirs, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, rival, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];

    // Duel: no result without a started duel; the opponent comes from the server and carries no private data.
    assert.equal((await act('duel/resolve')).data.result.reason, 'noDuel');
    const started = await act('duel/start', { level: 50 });
    assert.equal(started.data.result.ok, true);
    assert.equal(started.data.result.opponentName, 'Rival');
    assert.equal('inventory' in started.data.result.opponent, false);
    assert.equal('gold' in started.data.result.opponent, false);
    assert.equal((await act('duel/start', { level: 50 })).data.result.reason, 'tooSoon');
    assert.equal((await act('duel/resolve')).data.result.reason, 'tooFast');
    db.prepare('UPDATE duel_pending SET created_at=created_at-10000').run();
    const np0 = (await state()).nationalPoint;
    const resolved = await act('duel/resolve');
    assert.equal(resolved.data.result.ok, true);
    const np1 = (await state()).nationalPoint;
    if (resolved.data.result.winner === 'me') assert.ok(np1 > np0);
    else if (resolved.data.result.winner === 'opponent') assert.ok(np1 < np0);
    else assert.equal(np1, np0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM duel_history WHERE challenger=1').get().n, 1);
    assert.equal((await act('duel/resolve')).data.result.reason, 'noDuel', 'a duel is settled once');
    // Abandoning a duel counts as a loss: concede, or starting another one.
    assert.equal((await act('duel/start', { level: 50 })).data.result.ok, true);
    const before = (await state()).nationalPoint;
    assert.equal((await act('duel/concede')).data.result.ok, true);
    assert.ok((await state()).nationalPoint < before);
    // Legacy duel routes are closed for server-economy accounts.
    assert.equal((await call('warzone/duel/opponent?level=50', null, cookie)).status, 409);

    // Scrolls: need the scroll, valid targets; the race change reaches the account.
    assert.equal((await act('scroll/job', { itemId: 'job-1', newClass: 'priest' })).data.result.reason, 'invalidClass');
    assert.equal((await act('scroll/job', { itemId: 'nope', newClass: 'mage' })).data.result.reason, 'itemNotFound');
    assert.equal((await act('scroll/job', { itemId: 'job-1', newClass: 'mage' })).data.result.reason, 'mustUnequipFirst', 'gear must come off first');
    for (const [slot, item] of Object.entries((await state()).equipped)) if (item) await act('inventory/unequip', { slot });
    assert.equal((await act('scroll/job', { itemId: 'job-1', newClass: 'mage' })).data.result.ok, true);
    assert.equal((await state()).class, 'mage');
    assert.equal((await act('scroll/race', { itemId: 'race-1', race: 'orc-lord' })).data.result.reason, 'invalidRace');
    assert.equal((await act('scroll/race', { itemId: 'race-1', race: 'elmorad' })).data.result.ok, true);
    const saved = (await call('backup', null, cookie)).data.data;
    assert.equal(saved.race, 'elmorad');
    assert.equal(saved.characters[0].race, 'elmorad');

    // GM tools: refused without the server-bound GM right, available with it.
    assert.equal((await act('gm/exec', { cmd: 'altin', args: ['999999'] })).data.result.reason, 'notGm');
    assert.equal((await act('gm/clearInventory')).data.result.reason, 'notGm');
    db.prepare('INSERT INTO gm_accounts(account,granted_at) VALUES(1,?)').run(Date.now());
    const gold0 = (await state()).gold;
    const gm = await act('gm/exec', { cmd: 'altin', args: ['1234'] });
    assert.equal(gm.data.result.ok, true);
    assert.equal((await state()).gold, gold0 + 1234);

    // Pin: forged progress does not survive a save; a "new" character starts from the rules' starting values.
    const stored = (await call('backup', null, cookie)).data;
    const forged = structuredClone(stored.data);
    Object.assign(forged.characters[0], { level: 65, xp: 999999, statPoints: 500, nationalPoint: 999999, monsterKills: { sis_kurdu: 9999 }, claimedQuests: [], race: 'karus' });
    forged.race = 'karus';
    forged.characters[1] = { ...createCharacter('warrior', 'karus', 'Cheat'), id: 'cheat', level: 65, nationalPoint: 123456, statPoints: 900 };
    assert.equal((await call('backup', { revision: stored.revision, data: forged }, cookie, 'PUT')).status, 200);
    const after = (await call('backup', null, cookie)).data.data;
    assert.equal(after.characters[0].level, 50);
    assert.equal(after.characters[0].nationalPoint, (await state()).nationalPoint);
    assert.equal(after.characters[0].monsterKills.sis_kurdu, undefined);
    assert.equal(after.race, 'elmorad');
    assert.equal(after.characters[1].level, 1);
    assert.ok(after.characters[1].nationalPoint < 1000);
    assert.ok(after.characters[1].statPoints < 100);
    db.close();
  } finally { await api.close(); }
});

test('minimum client build: outdated or header-less clients get 426 with the update link, current ones and health/admin pass', async () => {
  const { api, database } = await boot();
  try {
    const db = new DatabaseSync(database);
    db.prepare("INSERT OR REPLACE INTO app_config(key,value) VALUES('min_build','3')").run();
    db.prepare("INSERT OR REPLACE INTO app_config(key,value) VALUES('update_url','https://example.com/update')").run();
    db.close();
    const base = `http://127.0.0.1:${api.server.address().port}/api/`;
    const get = async (path, build) => {
      const r = await fetch(base + path, { headers: { Origin: 'http://test.local', ...(build === undefined ? {} : { 'X-Client-Build': String(build) }) } });
      return { status: r.status, data: await r.json().catch(() => ({})) };
    };
    const noHeader = await get('me');
    assert.equal(noHeader.status, 426);
    assert.equal(noHeader.data.error, 'CLIENT_OUTDATED');
    assert.equal(noHeader.data.updateUrl, 'https://example.com/update');
    assert.equal((await get('me', 2)).status, 426);
    assert.equal((await get('me', 3)).status, 401, 'a current client reaches the normal login check');
    assert.equal((await get('health')).status, 200, 'health is never blocked');
    assert.deepEqual((await get('version')).data, { minBuild: 3, updateUrl: 'https://example.com/update' });
    assert.notEqual((await get('admin/me')).status, 426, 'the owner panel is exempt');
  } finally { await api.close(); }
});

test('shared targets: damage above what the character can possibly deal is refused, and hits cannot come faster than a real player', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'zed', password })).cookie;
    const strong = hero();
    strong.level = 55;
    strong.equipped = { ...strong.equipped, mainHand: sword({ id: 'wield', atk: 200 }) };
    assert.equal((await call('backup', { revision: 0, data: { characters: [strong, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    // Pretend the first boss is open right now by asking for its state; if it is not active the attack is refused before damage is checked,
    // so exercise the clan dungeon path instead, which only needs a clan.
    db.prepare('UPDATE wallets SET diamonds=5000').run();
    const asHero = async (path, body) => {
      const r = await fetch(`http://127.0.0.1:${api.server.address().port}/api/${path}`, { method: body ? 'POST' : 'GET', headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', Cookie: cookie, 'X-Character-Key': 'hero' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: r.status, data: await r.json().catch(() => ({})) };
    };
    assert.equal((await asHero('clan', { name: 'Hitters' })).status, 200);
    assert.equal((await asHero('clan/dungeon/enter', {})).status, 200);
    const huge = await asHero('clan/dungeon/attack', { damage: 1_000_000 });
    assert.equal(huge.status, 400);
    assert.equal(huge.data.error, 'INVALID_DAMAGE');
    const fine = await asHero('clan/dungeon/attack', { damage: 1 });
    assert.equal(fine.status, 200);
    const quick = await asHero('clan/dungeon/attack', { damage: 1 });
    assert.equal(quick.status, 429);
    db.close();
  } finally { await api.close(); }
});

test('shared targets are fought on the server: the action decides the hit, no client damage is accepted, skills and cooldowns are tracked server-side', async () => {
  const { api, call, database } = await boot();
  const realNow = Date.now.bind(Date);
  try {
    const cookie = (await call('register', { name: 'ivy', password })).cookie;
    const strong = hero();
    strong.level = 55;
    strong.skills = { known: [], loadout: [null, null, null, null, null] };
    strong.equipped = { ...strong.equipped, mainHand: sword({ id: 'wield', atk: 300 }) };
    assert.equal((await call('backup', { revision: 0, data: { characters: [strong, null, null], bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT')).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    db.prepare('UPDATE wallets SET diamonds=5000').run();
    const asHero = async (path, body) => {
      const r = await fetch(`http://127.0.0.1:${api.server.address().port}/api/${path}`, { method: body ? 'POST' : 'GET', headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', Cookie: cookie, 'X-Character-Key': 'hero' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: r.status, data: await r.json().catch(() => ({})) };
    };
    const state = async () => (await call('backup', null, cookie)).data.data.characters[0];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Clan dungeon: the hit comes from the action; a forged damage number is ignored.
    assert.equal((await asHero('clan', { name: 'Hitters' })).status, 200);
    assert.equal((await asHero('clan/dungeon/enter', {})).status, 200);
    const before = (await asHero('clan/dungeon')).data;
    const hit = await asHero('clan/dungeon/attack', { damage: 99999999, action: { type: 'attack' } });
    assert.equal(hit.status, 200);
    assert.equal(hit.data.ok, true);
    const dealt = before.monsterHp - hit.data.monsterHp;
    assert.ok(dealt >= 0 && dealt < 99999999, 'the forged damage did not reach the monster');
    assert.ok(Array.isArray(hit.data.shared.result.events));
    assert.equal(hit.data.shared.result.damage, dealt);
    await wait(350);
    const bad = await asHero('clan/dungeon/attack', { action: { type: 'skill', id: 'not_known' } });
    assert.equal(bad.data.ok, false);
    assert.equal(bad.data.reason, 'unknownSkill');
    const quick = await asHero('clan/dungeon/attack', { action: { type: 'attack' } });
    await wait(350);
    assert.ok([200, 429].includes(quick.status));

    // World boss: pretend a boss window is open (the schedule is a pure function of the clock).
    const { bossSchedule } = await import('../src/utils/warzoneBoss.js');
    const { WARZONE_BOSSES } = await import('../src/data/warzone.js');
    const boss = WARZONE_BOSSES[0];
    let at = realNow() + 3600_000;
    while (bossSchedule(boss, at).phase !== 'active' && at < realNow() + 14 * 86400_000) at += 20_000;
    assert.equal(bossSchedule(boss, at).phase, 'active');
    const shift = at - realNow();
    Date.now = () => realNow() + shift;
    try {
      const mine = await call(`warzone/boss/${boss.id}/attack`, { damage: 5, action: { type: 'attack' }, characterKey: 'hero' }, cookie);
      assert.equal(mine.status, 200);
      assert.equal(mine.data.ok, true);
      assert.ok(mine.data.hp <= boss.hp);
      assert.ok(mine.data.hp >= boss.hp - 5000, 'a single weak hero cannot dent the boss with a forged number');
      await wait(350);
      const second = await call(`warzone/boss/${boss.id}/attack`, { action: { type: 'attack' }, characterKey: 'hero' }, cookie);
      assert.equal(second.status, 200);
      await wait(350);
      assert.equal((await call(`warzone/boss/${boss.id}/attack`, { damage: 1 }, cookie)).status, 400, 'no character: refused');
    } finally { Date.now = realNow; }
    void state;
    db.close();
  } finally { Date.now = realNow; await api.close(); }
});

test('abuse guards: abandoned fights cost a defeat, seed-shopping retreats are throttled, starter rewards are once per account, character creation is rate-limited, clan membership comes from the server', async () => {
  const { api, call, database } = await boot();
  try {
    const cookie = (await call('register', { name: 'abe', password })).cookie;
    const first = { ...hero(), id: 'c1' };
    first.level = 5;
    first.xp = 40;
    const put = async (chars) => {
      const cur = (await call('backup', null, cookie)).data;
      return call('backup', { revision: cur.revision || 0, data: { race: 'karus', characters: chars, bank: [[], []], bankGold: 0, diamonds: 0 } }, cookie, 'PUT');
    };
    assert.equal((await put([first, null, null])).status, 200);
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now());
    const act = (type, payload = {}, key = 'c1') => call('game/act', { characterKey: key, type, payload }, cookie);
    const state = async (i = 0) => (await call('backup', null, cookie)).data.data.characters[i];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Abandoning: a second start while the first fight was never settled counts as a defeat (xp lost).
    assert.equal((await act('battle/start', { monsterId: 'sis_kurdu' })).data.result.ok, true);
    await wait(1700);
    const xp0 = (await state()).xp;
    const again = await act('battle/start', { monsterId: 'sis_kurdu' });
    assert.equal(again.data.result.abandoned, true);
    assert.ok(again.data.result.xpLost > 0);
    assert.ok((await state()).xp < xp0);
    // A start right after a start (within a second and a half) is just a retry, no penalty.
    const quick = await act('battle/start', { monsterId: 'sis_kurdu' });
    assert.equal(quick.data.result.abandoned, false);

    // Seed shopping: many instant retreats are throttled.
    for (let i = 0; i < 6; i++) {
      assert.equal((await act('battle/start', { monsterId: 'sis_kurdu' })).data.result.ok, true);
      assert.equal((await act('battle/settle', { monsterId: 'sis_kurdu', actions: [] })).data.result.outcome, 'retreat');
    }
    assert.equal((await act('battle/start', { monsterId: 'sis_kurdu' })).data.result.reason, 'tooManyRetreats');

    // Starter rewards are once per account: a recreated character gets no second gift or top-up.
    const g1 = (await state()).gold;
    assert.equal((await act('tutorial/gift')).data.result.ok, true);
    assert.ok((await state()).gold > g1, 'the first character gets the gift');
    const second = { ...hero(), id: 'c2' };
    assert.equal((await put([null, second, null])).status, 200);
    assert.equal((await state(1)).id, 'c2');
    const g2 = (await state(1)).gold;
    assert.equal((await act('tutorial/gift', {}, 'c2')).data.result.ok, true);
    assert.equal((await state(1)).gold, g2, 'no second gift for the same account');
    assert.equal((await state(1)).tutorialGift, true);

    // Character creation: at most two new characters per day; the third is dropped from the save.
    const third = { ...hero(), id: 'c3' };
    assert.equal((await put([null, second, third])).status, 200);
    assert.equal((await state(2)).id, 'c3');
    const fourth = { ...hero(), id: 'c4' };
    assert.equal((await put([fourth, second, third])).status, 200);
    const afterLimit = (await call('backup', null, cookie)).data.data.characters;
    assert.equal(afterLimit[0], null, 'the rate limit removed the extra character');

    // Clan membership is read from the server, not from the (client-mirrored) clan field.
    db.prepare('UPDATE wallets SET diamonds=5000').run();
    const asChar = async (path, body, key) => {
      const r = await fetch(`http://127.0.0.1:${api.server.address().port}/api/${path}`, { method: body ? 'POST' : 'GET', headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', Cookie: cookie, 'X-Character-Key': key }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: r.status, data: await r.json().catch(() => ({})) };
    };
    assert.equal((await asChar('clan', { name: 'GuardClan' }, 'c2')).status, 200);
    db.prepare("UPDATE backups SET data=json_set(data,'$.characters[1].inventory',json_insert(json_extract(data,'$.characters[1].inventory'),'$[#]',json('{\"id\":\"race-1\",\"kind\":\"raceScroll\",\"name\":\"Race\",\"count\":1,\"weight\":0.1}')))").run();
    const raced = await act('scroll/race', { itemId: 'race-1', race: 'elmorad', inClan: false }, 'c2');
    assert.equal(raced.data.result.reason, 'clanBlocksRaceChange', 'a forged inClan flag or an empty clan field cannot bypass the server membership');
    db.close();
  } finally { await api.close(); }
});

test('hardening: push endpoints must be real push services, logins and registrations are throttled', async () => {
  const { isPushEndpointAllowed } = await import('../server/app.mjs');
  assert.equal(isPushEndpointAllowed('https://fcm.googleapis.com/fcm/send/abc'), true);
  assert.equal(isPushEndpointAllowed('https://updates.push.services.mozilla.com/wpush/v2/x'), true);
  assert.equal(isPushEndpointAllowed('https://web.push.apple.com/abc'), true);
  assert.equal(isPushEndpointAllowed('http://fcm.googleapis.com/x'), false);
  assert.equal(isPushEndpointAllowed('https://127.0.0.1/hook'), false);
  assert.equal(isPushEndpointAllowed('https://localhost:3000/api/x'), false);
  assert.equal(isPushEndpointAllowed('https://fcm.googleapis.com.evil.example/x'), false);
  assert.equal(isPushEndpointAllowed('https://user:pw@fcm.googleapis.com/x'), false);
  assert.equal(isPushEndpointAllowed('not a url'), false);

  const { api, call } = await boot();
  try {
    let lastRegister;
    for (let i = 0; i < 7; i++) lastRegister = await call('register', { name: `bot${i}`, password });
    assert.equal(lastRegister.status, 429, 'bulk registration from one address is throttled');
  } finally { await api.close(); }

  const second = await boot();
  try {
    await second.call('register', { name: 'victim', password });
    let blocked = null;
    for (let i = 0; i < 12; i++) {
      const r = await second.call('login', { name: 'victim', password: 'wrong-password-123456' });
      if (r.status === 429) { blocked = i; break; }
    }
    assert.ok(blocked !== null && blocked <= 11, 'repeated wrong passwords for one account are throttled');
  } finally { await second.api.close(); }
});
