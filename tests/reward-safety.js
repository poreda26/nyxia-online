import {applyLiveDropConfig,DEFAULT_DROP_CONFIG} from '../src/utils/dropConfig';
import assert from 'node:assert/strict';
import {initialPlayer,MAX_GOLD} from '../src/utils/player';
import {openChestSafely,openChestsSafely} from '../src/utils/chests';
import {BAG_SLOTS} from '../src/utils/inventory';
import {MAPS} from '../src/data/maps';
import {buildSoloDungeonStages,buildDungeonStageChoices} from '../src/data/soloDungeon';
import {grantMonsterReward} from '../src/utils/monsterRewards';
import {premiumGoldMultiplier,premiumDropMultiplier,premiumExpMultiplier,premiumSellMultiplier,premiumRepairDiscount} from '../src/utils/premium';
const reward={id:'won',kind:'weapon',name:'Test',weight:1};
let p={...initialPlayer('warrior','elmorad','Chest'),inventory:[],chests:[{id:'one',tier:1},{id:'two',special:true,tier:6}]};
const full={...p,inventory:Array.from({length:BAG_SLOTS},(_,i)=>({...reward,id:`item${i}`}))};
let calls=0;
assert.equal(openChestSafely(full,'one',()=>{calls++;return reward;}).player,full);assert.equal(calls,0);
assert.equal(openChestsSafely(full,()=>reward).player,full);
const heavy=openChestSafely(p,'one',()=>({...reward,weight:100000}));assert.equal(heavy.player,p);assert.equal(heavy.opened,false);
assert.equal(openChestSafely(p,'one',()=>null).player,p);
assert.equal(openChestSafely(p,'missing',()=>reward).player,p);
const almost={...full,inventory:full.inventory.slice(1)};
const partial=openChestsSafely(almost,()=>reward);assert.equal(partial.items.length,1);assert.equal(partial.player.chests.length,1);assert.equal(partial.player.chests[0].id,'two');assert.equal(partial.player.milestones.chestsOpened,1);
const one=openChestSafely(p,'one',()=>reward);assert.equal(one.player.inventory.length,1);assert.equal(one.player.chests.length,1);assert.equal(openChestSafely(one.player,'one',()=>reward).opened,false);
const realRandom=Math.random;let comparisons=0;
try{
 for(const cls of ['warrior','rogue','mage'])for(const map of MAPS){
  const monsters=[...map.monsters,...buildSoloDungeonStages(map).flatMap((m,i)=>m.isBoss?[m]:buildDungeonStageChoices(map,i)),{...map.monsters.at(-1),id:`map_boss_${map.id}`}];
  for(const monster of monsters)for(const roll of [.05,.5,.95]){
   const base={...initialPlayer(cls,'elmorad','Premium'),level:Math.min(map.levelMin||1,60),gold:0};
   Math.random=()=>roll;
   const plain=grantMonsterReward(base,monster,map),gold=plain.player.gold;
   for(const [tier,mult,exp] of [['mythic',1.10,2],['apex',1.05,1.5]]){
    const paid={...base,premium:{tier,expiresAt:Date.now()+86400000}};
    const result=grantMonsterReward(paid,monster,map);
    assert.equal(result.player.gold,Math.round(gold*mult),`${cls}/${monster.id}/${tier}`);
    assert.ok(result.player.gold>=gold);
    const xp=plain.drops.find(d=>d.type==='xp')?.amount||0;
    assert.equal(result.drops.find(d=>d.type==='xp')?.amount||0,Math.round(xp*exp));
    assert.equal(premiumExpMultiplier(paid),exp);assert.ok(premiumDropMultiplier(paid)>1);assert.ok(premiumSellMultiplier(paid)>1);assert.ok(premiumRepairDiscount(paid)>0);
    assert.equal(premiumGoldMultiplier({...paid,premium:{tier,expiresAt:1}}),1);
    comparisons++;
   }
  }
 }
 const map=MAPS[0],monster=map.monsters[0],base={...p,gold:0,chests:[],inventory:[]};
 Math.random=()=>.5;
 const plainGold=grantMonsterReward(base,monster,map).player.gold;
 const boosted={...base,premium:{tier:'mythic',expiresAt:Date.now()+100000},activeBoosts:{gold:Date.now()+100000}};
 assert.equal(grantMonsterReward(boosted,monster,map,{goldMult:2}).player.gold,Math.round(plainGold*1.1*1.25*2));
 const rules=structuredClone(DEFAULT_DROP_CONFIG);rules.maps[map.id].monsters[monster.id].dropChance=.5;rules.maps[map.id].monsters[monster.id].chestChance=.5;applyLiveDropConfig(rules);
 for(const [tier,r] of [['mythic',.525],['apex',.507]]){
  Math.random=()=>r;
  const free=grantMonsterReward(base,monster,map),paid=grantMonsterReward({...base,premium:{tier,expiresAt:Date.now()+100000}},monster,map);
  assert.equal(free.player.inventory.length,0);assert.equal(free.player.chests.length,0);
  assert.equal(paid.player.inventory.length,1);assert.equal(paid.player.chests.length,1);
 }
 applyLiveDropConfig(DEFAULT_DROP_CONFIG);
 const capped={...p,gold:MAX_GOLD,premium:{tier:'mythic',expiresAt:Date.now()+10000}};
 assert.equal(grantMonsterReward(capped,MAPS[0].monsters[0],MAPS[0]).player.gold,MAX_GOLD);
}finally{Math.random=realRandom;applyLiveDropConfig(DEFAULT_DROP_CONFIG);}
console.log(`Chest atomicity/full bag/weight/partial bulk passed; ${comparisons} class/monster/premium gold comparisons passed.`);
