import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultLootPool} from '../src/owner/lootPoolPreview.js';
import {DEFAULT_DROP_CONFIG} from '../src/data/dropRules.js';
import {LOOT_ADMIN_CATALOG} from '../src/data/lootAdminCatalog.js';
import {validateDropRules,dropMetadata} from '../server/drop-settings.mjs';
test('default pools retain probabilities and only contain buildable catalog keys',()=>{
 for(let tier=1;tier<=6;tier++)for(const options of [{},{mapTier:tier},...['warrior','rogue','mage'].map(specialClass=>({specialClass}))]){
  const rows=defaultLootPool(LOOT_ADMIN_CATALOG,tier,DEFAULT_DROP_CONFIG,options);
  assert.ok(Math.abs(rows.reduce((n,r)=>n+r.weight,0)-1)<1e-9,JSON.stringify({tier,options}));
  const rules=structuredClone(DEFAULT_DROP_CONFIG);rules.chestTables={'1':rows};
  assert.doesNotThrow(()=>validateDropRules(rules));
 }
});
test('empty monster pool survives validation; empty chest cannot publish; null restores defaults',()=>{
 const rules=structuredClone(DEFAULT_DROP_CONFIG),map=dropMetadata.maps[0],id=map.monsters[0].id;
 rules.maps[map.id].monsters[id].loot=[];
 assert.deepEqual(validateDropRules(rules).maps[map.id].monsters[id].loot,[]);
 rules.chestTables={'1':[]};assert.throws(()=>validateDropRules(rules));
 rules.chestTables={'1':null};assert.equal(validateDropRules(rules).chestTables['1'],null);
});
test('all solo paths have independently editable reward targets',()=>{
 for(const map of dropMetadata.maps){
  const solo=map.monsters.filter(m=>m.id.startsWith('dungeon_'));
  assert.equal(solo.length,11);
  for(const m of solo)assert.ok(DEFAULT_DROP_CONFIG.maps[map.id].monsters[m.id]);
 }
});
