import assert from 'node:assert/strict';
import {LOOT_ADMIN_CATALOG} from '../src/data/lootAdminCatalog.js';
import {DEFAULT_DROP_CONFIG} from '../src/data/dropRules.js';
import {applyLiveDropConfig} from '../src/utils/dropConfig.js';
import {rollConfiguredLoot,rollChestLoot,rollSpecialChestLoot,rollMapLoot} from '../src/utils/loot.js';
import {grantMonsterReward} from '../src/utils/monsterRewards.js';
import {initialPlayer} from '../src/utils/player.js';
import {MAPS} from '../src/data/maps.js';
for(const template of LOOT_ADMIN_CATALOG){
 const item=rollConfiguredLoot([{key:template.key,level:1,weight:1}]);
 assert.ok(item?.id,template.key);assert.equal(item.name,template.name,template.key);
}
const weapon=LOOT_ADMIN_CATALOG.find(x=>x.kind==='weapon'&&x.class==='mage');
const config=structuredClone(DEFAULT_DROP_CONFIG);config.chestTables={'1':[{key:weapon.key,level:7,weight:1}],special:[{key:weapon.key,level:8,weight:1}]};
const map=MAPS[0],monster=map.monsters[0];
config.maps[map.id].monsters[monster.id]={goldMin:1,goldMax:1,xp:1,dropChance:1,chestChance:0,loot:[{key:weapon.key,level:7,weight:1}]};
applyLiveDropConfig(config);
assert.equal(rollChestLoot(1).name,weapon.name);assert.equal(rollChestLoot(1).upgradeLevel,7);assert.equal(rollSpecialChestLoot('warrior').upgradeLevel,8);
const reward=grantMonsterReward(initialPlayer('warrior','elmorad','test'),monster,map);
assert.ok(reward.player.inventory.some(i=>i.name===weapon.name&&i.upgradeLevel===7));
// Map default pools must not accidentally use tier-specific chest tables.
for(let i=0;i<10;i++)assert.notEqual(rollMapLoot(1).upgradeLevel,7);
applyLiveDropConfig(DEFAULT_DROP_CONFIG);assert.notEqual(rollChestLoot(1).upgradeLevel,7);
console.log('All',LOOT_ADMIN_CATALOG.length,'catalog entries build; live chest, special chest, monster rewards and reset passed.');
