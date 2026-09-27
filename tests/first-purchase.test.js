import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBonusGear} from '../src/utils/firstPurchaseBonus.js';
import {gmBuildWeaponById,gmWeaponTemplates} from '../src/utils/loot.js';
import {FIRST_PURCHASE_WEAPONS,weaponVisualItem} from '../src/data/firstPurchaseWeapons.js';
import {characterAppearance} from '../src/data/characterAppearance.js';
import {weaponEffects} from '../src/data/weaponEffects.js';
import {rebalanceSavedWeapon} from '../src/data/balancedWeapons.js';
import {applyLevelData} from '../src/utils/upgrade.js';
import {PLAYER_AVATARS,CLAN_AVATARS} from '../src/data/avatars.js';
for(const [cls,reward] of Object.entries(FIRST_PURCHASE_WEAPONS)) test(`${cls}: bound reward has reference +3 stats and source +7 art`,()=>{
 const gear=buildBonusGear(cls),item=gear.find(i=>i.kind==='weapon');
 const template=gmWeaponTemplates(cls).find(w=>w.name===reward.reference);
 const reference=gmBuildWeaponById(cls,template.id,3);
 for(const key of Object.keys(reference).filter(k=>!['id','name','noTrade','lore'].includes(k))) assert.deepEqual(item[key],reference[key],key);
 assert.equal(item.name,reward.name);assert.equal(item.noTrade,true);assert.equal(item.upgradeLocked,true);
 assert.equal(gear.filter(i=>i.kind==='armor'&&i.upgradeLevel===6).length,5);
 assert.deepEqual(rebalanceSavedWeapon(JSON.parse(JSON.stringify(item))),item);
 assert.equal(applyLevelData(item,8),item);
 const look=weaponVisualItem(item);assert.equal(look.upgradeLevel,7);assert.equal(look.name,reward.appearance);
 assert.ok(weaponEffects(item).length);
 for(const race of ['human','karus']) {
  const player={class:cls,race,equipped:{mainHand:item}};
  const actual=characterAppearance(player),expected=characterAppearance({...player,equipped:{mainHand:look}});
  assert.equal(actual.supported,true);assert.equal(actual.atlasKey,expected.atlasKey);assert.equal(actual.frameIndex,expected.frameIndex);
 }
});
test('twelve distinct selectable identities and crests',()=>{
 for(const list of [PLAYER_AVATARS,CLAN_AVATARS]) {assert.equal(list.length,12);assert.equal(new Set(list.map(a=>a.id)).size,12);}
});
