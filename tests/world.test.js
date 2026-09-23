import {MAPS} from '../src/data/maps';
import {WINGS,wingMultiplier,wingDexBonus} from '../src/data/wings';
import {makeWings,buyWings} from '../src/utils/wings';
import {equippedStatBonus,totalStats,playerMaxMp,unequipItem} from '../src/utils/player';
import { heroFrame, ATTACK_DURATION } from '../src/world/animation';
import { warriorFrame, warriorWeaponUrl, weaponLight, drawWarrior, armorVariant } from '../src/world/warriorVisuals';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, WORLD, CAMP, OBSTACLES, canStand, command, stepWorld, moveActor, distance, respawn, inCombat } from '../src/world/engine';
import { initialPlayer, playerMaxHp, xpToNext, migratePlayer, equipItem } from '../src/utils/player';
import { grantMonsterReward } from '../src/utils/monsterRewards';
import { saveCharacterSlot, loadAccount } from '../src/utils/storage';
import { learnFreeSkills } from '../src/utils/skills';
import { buildMapBoss } from '../src/data/mapBosses';
import { canFightMapBoss } from '../src/utils/mapBoss';
import { buildDungeonStageChoices } from '../src/data/soloDungeon';
import { MAP_COLLECTIONS, collectionProgress, claimCollection } from '../src/utils/collection';
import { WEEKLY_QUESTS } from '../src/data/weeklyQuests';
import { weeklyQuestProgress } from '../src/utils/weeklyQuests';
import {BALANCED_WEAPONS,rebalanceSavedWeapon} from '../src/data/balancedWeapons';
import {ORIGINAL_WEAPONS} from '../src/data/originalWeapons';
import {itemImageFor} from '../src/data/itemImages';
import {characterAppearance,CHARACTER_IDENTITIES} from '../src/data/characterAppearance';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor,gmBuildAccessory} from '../src/utils/loot';
import {pvpSnapshot,rollPvpDamage,comparablePlayer} from '../src/utils/pvpBalance';
import {canUpgradeAccessory,upgradeAccessory} from '../src/utils/accessoryUpgrade';
import {ACCESSORY_SETS} from '../src/data/accessories';
const player=()=>learnFreeSkills(initialPlayer('warrior','karus','WorldTest'));

test('every weapon has a distinct held pose for both races, driven by real equip state',()=>{
 assert.equal(new Set(CHARACTER_IDENTITIES).size,6);
 for(const [cls,weapons] of Object.entries(BALANCED_WEAPONS))for(const race of ['human','karus']){
  let p={...initialPlayer(cls,race,'VisualTest'),level:65,stats:{str:300,dex:300,int:300,mag:300,sta:300}};
  const keys=new Set();
  for(const w of weapons){
   const t=gmWeaponTemplates(cls).find(t=>t.name===w.name),item=gmBuildWeaponById(cls,t.id,1);
   const next=equipItem({...p,inventory:[item]},item);assert.equal(next.blocked,null);
   p=next.player;const a=characterAppearance(p);
   assert.equal(a.weaponName,w.name);assert.equal(a.identity,race+'-'+cls);assert.equal(a.supported,true);
   assert.ok(a.frame?.mask,w.name+' missing held art');assert.equal(a.size.length,2);
   assert.ok(!keys.has(a.key),w.name+' reuses held pose');keys.add(a.key);
   const saved=migratePlayer(JSON.parse(JSON.stringify(p)));assert.equal(characterAppearance(saved).key,a.key);
  }
  const empty=characterAppearance({...p,equipped:{...p.equipped,mainHand:null}});
  assert.equal(empty.weaponName,null);assert.ok(empty.frame?.mask);
 }
});

test('inventory inspection does not change the equipped appearance, upgrade keeps grip pose',()=>{
 const p=initialPlayer('warrior','human','Preview'),a=characterAppearance(p);
 assert.ok(a.frame?.mask);assert.equal(characterAppearance({...p,selectedItem:{name:'Yırtıcı Pençe'}}).key,a.key);
 const upgraded=characterAppearance({...p,equipped:{...p.equipped,mainHand:{...p.equipped.mainHand,upgradeLevel:8}}});
 assert.equal(upgraded.frameIndex,a.frameIndex);assert.equal(upgraded.atlasKey,a.atlasKey);assert.equal(upgraded.upgrade,8);
 const unknown=characterAppearance({...p,equipped:{mainHand:{name:'unknown legacy'}}});
 assert.equal(unknown.supported,false);assert.ok(unknown.frame);
});
test('original replacements have unique names, art, requirements and attributes',()=>{
 const names=Object.values(BALANCED_WEAPONS).flat().map(w=>w.name);
 assert.equal(new Set(names).size,names.length);
 assert.ok(names.every(n=>!n.includes(' · Muhafız')&&!n.includes(' · Avcı')));
 const images=ORIGINAL_WEAPONS.map(w=>itemImageFor(w.name,1));
 assert.ok(images.every(Boolean));assert.equal(new Set(images).size,20);
 for(const c of ['warrior','rogue','mage'])for(let tier=1;tier<=6;tier++){
  const news=BALANCED_WEAPONS[c].filter(w=>w.tier===tier);
  assert.equal(new Set(news.map(w=>JSON.stringify(w.levels[0]))).size,news.length);
  assert.equal(new Set(news.map(w=>JSON.stringify(w.reqStats))).size,news.length);
 }
});
test('all retired clones migrate exactly once without losing upgrade or ownership',()=>{
 for(const w of ORIGINAL_WEAPONS){
  const old={id:'owned-'+w.id,kind:'weapon',cls:w.cls,name:w.legacyName,tier:w.tier,upgradeLevel:7,durability:100,currentDurability:25,balanceVersion:1,owner:'kept'};
  const next=rebalanceSavedWeapon(old);
  const fresh=gmBuildWeaponById(w.cls,gmWeaponTemplates(w.cls).find(x=>x.name===w.name).id,7);
  for(const key of ['atk','hp','mp','weaponType','attackSpeed','range','icon','weaponSlot'])assert.equal(next[key],fresh[key],w.name+' '+key);
  assert.equal(next.name,w.name);assert.equal(next.id,old.id);assert.equal(next.owner,'kept');assert.equal(next.upgradeLevel,7);
  assert.ok(Math.abs(next.currentDurability/next.durability-.25)<.001);
  assert.equal(rebalanceSavedWeapon(next),next);
 }
});
test('every class and tier has three weapons and strictly increasing +1 to +8 power',()=>{
 for(const [cls,table] of Object.entries(BALANCED_WEAPONS))for(let tier=1;tier<=6;tier++){
  assert.ok(table.filter(w=>w.tier===tier).length>=3);
  for(const w of table.filter(w=>w.tier===tier))for(let i=1;i<8;i++)assert.ok(w.levels[i].atk>w.levels[i-1].atk);
 }
});
test('weapon migration preserves identity, plus, ownership and durability ratio',()=>{
 const w=gmBuildWeaponById('warrior',gmWeaponTemplates('warrior').find(w=>w.tier===2).id,5);
 const old={...w,balanceVersion:undefined,atk:9999,currentDurability:w.durability/2,custom:'preserve'};
 const next=rebalanceSavedWeapon(old);
 assert.equal(next.id,old.id);assert.equal(next.upgradeLevel,5);assert.equal(next.custom,'preserve');
 assert.equal(next.atk,w.atk);assert.equal(next.currentDurability,next.durability/2);
 assert.equal(rebalanceSavedWeapon(next),next);
});
test('PvP uses reproducible symmetric rules and matching fighters split wins',()=>{
 const a=pvpSnapshot(player());let seed=231;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let wins=0;
 for(let i=0;i<1000;i++){let x=a.hp,y=a.hp,turn=i%2;for(let t=0;t<300;t++){if(turn===0)y-=rollPvpDamage(a,a,random)||0;else x-=rollPvpDamage(a,a,random)||0;turn=1-turn;if(x<=0||y<=0){wins+=y<=0?1:0;break;}}}
 assert.ok(wins>440&&wins<560, String(wins));
});
test('T4 Warrior and archer Rogue remain within the beta PvP win band',()=>{
 let warrior=initialPlayer('warrior','human','T4 Warrior');
 warrior={...warrior,level:45,stats:{...warrior.stats,str:65+10+3*44}};
 const weapon=gmWeaponTemplates('warrior').filter((item)=>item.tier===4&&item.atk).sort((a,b)=>b.atk-a.atk)[0];
 warrior=equipItem(warrior,gmBuildWeaponById('warrior',weapon.id,5)).player;
 for(const slot of ['head','chest','legs','gauntlets','boots'])warrior=equipItem(warrior,gmBuildArmor('warrior',slot,4,5)).player;
 const accessories=[['necklace','Ejder Muhafızı Kolye'],['belt','Ejder Muhafızı Kemer'],['ring','Ejder Muhafızı Yüzük'],['ring','Ejder Muhafızı Yüzük'],['earring','Ejder Muhafızı Küpe'],['earring','Ejder Muhafızı Küpe']];
 let rogue=comparablePlayer(warrior,'rogue');
 for(const [slot,name] of accessories){
  warrior=equipItem(warrior,gmBuildAccessory(slot,4,3,name)).player;
  rogue=equipItem(rogue,gmBuildAccessory(slot,4,3,name.replace('Ejder Muhafızı','Fırtına Avcısı'))).player;
 }
 for(const p of [warrior,rogue])for(const slot of ['head','chest','legs','gauntlets','boots','mainHand'])assert.equal(p.equipped[slot]?.tier,4,`${p.class} ${slot}`);
 const a=pvpSnapshot(warrior),b=pvpSnapshot(rogue);let seed=71;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 let warriorWins=0;const fights=2000;
 for(let i=0;i<fights;i++){let ah=a.hp,bh=b.hp,turn=i%2;for(let t=0;t<400;t++){if(turn===0)bh-=rollPvpDamage(a,b,random)||0;else ah-=rollPvpDamage(b,a,random)||0;turn=1-turn;if(ah<=0||bh<=0){warriorWins+=bh<=0;break;}}}
 const rate=warriorWins/fights;
 console.log(`T4 +5 / accessory +3: Warrior ${rate*100}%, Rogue ${(1-rate)*100}% (2000 duels)`);
 assert.ok(rate>=.44&&rate<=.56,`Warrior win rate ${rate}; W ${JSON.stringify(a)} R ${JSON.stringify(b)}`);
});
test('universal tier accessories merge three matching copies and locked map rings do not',()=>{
 for(const slot of ['earring','necklace','ring','belt']){
  assert.equal(ACCESSORY_SETS[slot].length,27);
  for(let tier=1;tier<=5;tier++)assert.equal(ACCESSORY_SETS[slot].filter((item)=>item.tier===tier).length,tier===5?9:3);
 }
 const copies=[0,1,2].map(()=>gmBuildAccessory('ring',4,0,'Ejder Muhafızı Yüzük'));
 const p={...player(),inventory:[...copies,{id:'paper',kind:'accessoryScroll',count:1}]};
 assert.equal(canUpgradeAccessory(p,copies[0]).ok,true);
 const result=upgradeAccessory(p,copies[0].id);
 assert.equal(result.upgraded,true);assert.equal(result.item.upgradeLevel,1);assert.ok(result.item.def>copies[0].def);
 const locked=gmBuildAccessory('ring',2,0,'Volkan Güç Yüzüğü');
 assert.equal(canUpgradeAccessory({...p,inventory:[locked,locked,locked]},locked).ok,false);
});
test('consumables cannot corrupt equipment or disappear through equip',()=>{
 const scroll={id:'accessory-paper',kind:'accessoryScroll',count:3};
 const p={...player(),inventory:[scroll]};const result=equipItem(p,scroll);
 assert.ok(result.blocked);assert.equal(result.player,p);assert.equal(result.player.inventory[0].count,3);
});
test('PvP counts item STR once and Mage armor MP does not turn into attack',()=>{
 const p=player(),base=pvpSnapshot(p);
 const geared={...p,equipped:{...p.equipped,ring1:{kind:'accessory',statBonus:{str:10}}}};
 const allocated={...p,stats:{...p.stats,str:p.stats.str+10}};
 assert.ok(pvpSnapshot(geared).atk>base.atk);assert.equal(pvpSnapshot(geared).atk,pvpSnapshot(allocated).atk);
 const m=initialPlayer('mage','human','Mage');
 const armor={kind:'armor',class:'mage',upgradeLevel:8,def:0,hp:0};
 assert.equal(pvpSnapshot({...m,equipped:{...m.equipped,chest:armor}}).atk,pvpSnapshot(m).atk);
});
function settle(w,p,seconds=.45) {
  const events=[];
  for(let i=0;i<Math.ceil(seconds/.05);i++){const r=stepWorld(w,p,{x:0,y:0},.05,()=>.1);p=r.player;events.push(...r.events);}
  return {player:p,events};
}
function encounter() {
  const w=createWorld();w.actor.x=710;w.actor.y=665;w.target=w.monsters[0].id;
  return w;
}
test('spawn, NPC camp and all monster homes are walkable',()=>{
  const w=createWorld();assert.ok(canStand(w.actor.x,w.actor.y));
  w.monsters.forEach(m=>assert.ok(canStand(m.x,m.y),m.id));
});
test('diagonal movement has no speed advantage and respects terrain',()=>{
  const a={x:760,y:700},b={...a};moveActor(a,1,0,.1);moveActor(b,1,1,.1);
  assert.ok(Math.abs(distance(a,{x:760,y:700})-distance(b,{x:760,y:700}))<.001);
  const o=OBSTACLES[2];assert.equal(canStand(o.x,o.y),false);
  const edge={x:WORLD.width-WORLD.edge,y:400};moveActor(edge,1,0,.1);assert.equal(edge.x,WORLD.width-WORLD.edge);
});
test('camp and range reject attacks without spending mana or yielding loot',()=>{
  let p=player();const w=createWorld();w.target=w.monsters[0].id;const hp=w.monsters[0].hp;
  assert.equal(command(w,p,{type:'attack'}).player,p);assert.equal(w.monsters[0].hp,hp);
  w.actor={x:750,y:850};command(w,p,{type:'attack'});assert.equal(w.monsters[0].hp,hp);
});
test('cooldown prevents click bursts and a kill is rewarded exactly once',()=>{
  let p=player();const w=encounter();w.monsters[0].hp=1;
  const started=command(w,p,{type:'attack'},()=>0.1);assert.equal(w.monsters[0].hp,1);const first=settle(w,started.player);p=first.player;
  assert.equal(p.monsterKills.sis_kurdu,1);assert.equal(w.monsters[0].state,'dead');
  assert.equal(p.dailyQuests.killsToday,1);assert.equal(first.events.length,1);
  for(let i=0;i<30;i++)p=command(w,p,{type:'attack'},()=>0.1).player;
  assert.equal(p.monsterKills.sis_kurdu,1);
});
test('equipment damage uses current stats; changing weapon affects next hit',()=>{
  const p=player(),w=encounter();command(w,p,{type:'attack'},()=>0.1);settle(w,p);const damage=w.monsters[0].template.hp-w.monsters[0].hp;
  const strong={...p,equipped:{...p.equipped,mainHand:{kind:'weapon',atk:150}}},w2=encounter();command(w2,strong,{type:'attack'},()=>0.1);settle(w2,strong);
  assert.ok(w2.monsters[0].template.hp-w2.monsters[0].hp>damage);
});
test('known skill spends mana once, unknown skill and empty mana do not attack',()=>{
  const p=player(),w=encounter();const skill=p.skills.known[0];assert.ok(skill);
  const result=command(w,p,{type:'skill',id:skill},()=>.1);assert.ok(result.player.mp<p.mp);
  assert.equal(command(w,result.player,{type:'skill',id:skill},()=>.1).player,result.player);
  const w2=encounter(),empty={...p,mp:0};assert.equal(command(w2,empty,{type:'skill',id:skill}).player,empty);assert.equal(w2.monsters[0].hp,w2.monsters[0].template.hp);
  assert.equal(command(w2,p,{type:'skill',id:'invalid'}).player,p);
});
test('a full resource does not consume a potion and shared cooldown prevents spam',()=>{
  const p=player(),w=createWorld();assert.equal(command(w,p,{type:'potion',kind:'hp'}).player,p);
  const hurt={...p,hp:1};const healed=command(w,hurt,{type:'potion',kind:'hp'}).player;
  assert.ok(healed.hp>1);assert.notDeepEqual(healed.inventory,hurt.inventory);
  assert.equal(command(w,healed,{type:'potion',kind:'mp'}).player,healed);
});
test('paused and suspended catch-up frames cause no movement or damage burst',()=>{
  const p=player(),w=encounter();w.paused=true;const before={...w.actor};assert.equal(stepWorld(w,p,{x:1,y:0},30).player,p);assert.deepEqual(w.actor,before);
  w.paused=false;stepWorld(w,p,{x:1,y:0},30);assert.ok(distance(w.actor,before)<=WORLD.speed*.05+.001);
});
test('death penalty happens once and respawn returns to camp',()=>{
  const w=encounter();w.monsters[0].y=w.actor.y-30;w.monsters[0].cooldown=0;
  let p={...player(),hp:1,xp:100};p=stepWorld(w,p,{x:0,y:0},.05,()=>0).player;
  assert.ok(w.death);assert.equal(p.hp,playerMaxHp(p));const xp=p.xp;
  for(let i=0;i<20;i++)p=stepWorld(w,p,{x:0,y:0},.05,()=>0).player;
  assert.equal(p.xp,xp);respawn(w);assert.equal(w.death,null);assert.equal(distance(w.actor,CAMP),0);
});
test('returning to camp disengages enemies without awarding a kill',()=>{
  const p=player(),w=encounter();w.monsters[0].state='chase';w.actor={x:CAMP.x,y:CAMP.y};
  const result=stepWorld(w,p,{x:0,y:0},.05);assert.equal(inCombat(w),false);assert.equal(result.player,p);assert.equal(w.kills,0);
});
test('shared rewards level up, retain unrelated fields and do not mutate input',()=>{
  const p={...player(),xp:xpToNext(1)-1,customFutureField:'preserved'};const copy=JSON.stringify(p);
  const result=grantMonsterReward(p,WORLD.map.monsters[0],WORLD.map);
  assert.ok(result.player.level>p.level);assert.equal(result.player.customFutureField,'preserved');assert.equal(JSON.stringify(p),copy);
});
test('world progression persists through the existing character-slot storage',()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  const w=encounter();w.monsters[0].hp=1;const p=settle(w,command(w,player(),{type:'attack'},()=>.1).player).player;
  saveCharacterSlot('world-test',0,p);const restored=loadAccount('world-test').characters[0];
  assert.equal(restored.gold,p.gold);assert.equal(restored.monsterKills.sis_kurdu,1);assert.deepEqual(restored.inventory,p.inventory);
});

test('walk uses alternating frames and back view, idle stops the cycle',()=>{
  const w=createWorld();moveActor(w.actor,0,-1,.15);const a=heroFrame(w,0);
  assert.equal(a.row,1);assert.equal(a.column,1);
  moveActor(w.actor,0,-1,.15);assert.notEqual(heroFrame(w,0).column,a.column);
  moveActor(w.actor,0,0,.05);assert.equal(heroFrame(w,0).column,1);
});
test('attack plays once, pause freezes impact, then movement resumes',()=>{
  const w=encounter(),p=player();command(w,p,{type:'attack'},()=>.1);
  assert.equal(heroFrame(w,1).column,4);const hp=w.monsters[0].hp;
  w.paused=true;settle(w,p);assert.equal(w.monsters[0].hp,hp);assert.equal(w.time,0);
  w.paused=false;const r=settle(w,p,.30);assert.ok(w.monsters[0].hp<hp);
  settle(w,r.player,.35);assert.equal(heroFrame(w,1).attacking,false);
});
test('Rogue starts with a bow, rejects daggers and old dagger saves migrate without stat loss',()=>{
  const p=initialPlayer('rogue','karus','Archer');assert.equal(p.equipped.mainHand.weaponType,'bow');
  const old={...p,equipped:{...p.equipped,mainHand:{...p.equipped.mainHand,name:'Dagger',weaponType:'dagger',upgradeLevel:5}}};
  const migrated=migratePlayer(old);assert.equal(migrated.equipped.mainHand.weaponType,'bow');
  assert.equal(migrated.equipped.mainHand.upgradeLevel,5);assert.equal(migrated.equipped.mainHand.id,old.equipped.mainHand.id);
  assert.ok(equipItem(p,{kind:'weapon',weaponType:'dagger'}).blocked);
});
test('archer shoots a projectile and ranged impact is deferred',()=>{
  const w=encounter(),p=learnFreeSkills(initialPlayer('rogue','karus','Archer'));w.actor.y=780;
  const hp=w.monsters[0].hp;command(w,p,{type:'attack'},()=>.1);
  assert.equal(w.projectile.kind,'arrow');assert.equal(w.monsters[0].hp,hp);
  const r=settle(w,p,.25);assert.equal(w.monsters[0].hp,hp);
  settle(w,r.player,.2);assert.ok(w.monsters[0].hp<hp);
});

test('new warrior atlas keeps attack frames tied to impact time and pauses',()=>{
  const w=encounter(),p=player();command(w,p,{type:'attack'},()=>.1);
  assert.equal(warriorFrame(w).row,3); // Encounter target is north of the actor.
  settle(w,p,.30);assert.equal(warriorFrame(w).column,2);
  const pose=warriorFrame(w);w.paused=true;settle(w,p,3);
  assert.deepEqual(warriorFrame(w),pose);
  w.paused=false;settle(w,p,.35);assert.equal(warriorFrame(w).attacking,false);
  w.actor.back=true;assert.equal(warriorFrame(w).row,1);
});

test('world weapon art reuses base items, removes unequipped weapon and separates upgrade light',()=>{
  const w={name:'Serap',weaponType:'sword',upgradeLevel:1};
  assert.ok(warriorWeaponUrl(w));assert.equal(weaponLight(w),null);
  assert.equal(warriorWeaponUrl({...w,upgradeLevel:8}),warriorWeaponUrl(w));
  assert.notEqual(weaponLight({...w,upgradeLevel:8}),weaponLight({...w,name:'Fırtına Ustası',upgradeLevel:8}));
  assert.equal(warriorWeaponUrl(null),null);assert.equal(weaponLight(null),null);
});

test('optional warrior art falls back without drawing or touching persistent state',()=>{
  const p=player(),w=createWorld(),before=JSON.stringify({w,p});
  const ctx={save(){throw Error('Missing assets must not draw');}};
  assert.equal(drawWarrior(ctx,w,p,{}),false);
  assert.equal(JSON.stringify({w,p}),before);
  const calls=[];const drawing={save(){},restore(){},translate(){},scale(){},drawImage(...args){calls.push(args);}};
  const image={width:1254,height:1254};
  const frames=Array.from({length:16},()=>({x:0,y:0,w:314,h:314,foot:.94}));
  assert.equal(drawWarrior(drawing,w,p,{warriors:{orc:image},warriorFrames:{orc:frames}}),true);
  assert.equal(calls.length,1);assert.equal(JSON.stringify({w,p}),before);
});

test('armor layers follow each equipped slot, back view and unequip without changing player',()=>{
  const p=player(),w=createWorld(),draws=[];
  const ctx={save(){},restore(){},translate(){},scale(){},drawImage(...args){draws.push(args);}};
  const body={},armor={};
  const art={warriors:{orc:body},warriorFrames:{orc:Array.from({length:16},()=>({x:0,y:0,w:314,h:314,foot:.95}))},
    warriorArmor:armor,armorFrames:Array.from({length:8},(_,i)=>({x:i*100,y:0,w:80,h:100}))};
  p.equipped.chest={name:'Chitin Armor Pauldron'};p.equipped.head={name:'Chitin Shell Helmet'};
  const before=JSON.stringify(p);drawWarrior(ctx,w,p,art);
  assert.deepEqual(draws.slice(1).map(d=>d[1]),[0,600]);assert.equal(JSON.stringify(p),before);
  draws.length=0;w.actor.back=true;drawWarrior(ctx,w,p,art);
  assert.deepEqual(draws.slice(1).map(d=>d[1]),[100,700]);
  draws.length=0;p.equipped.head=null;drawWarrior(ctx,w,p,art);assert.equal(draws.length,2);
  assert.equal(armorVariant({name:'Leather Cap'}),null);
});

test('map boss is daily, uses normal rewards and grants one extra chest',()=>{
  const p=player(),map={...WORLD.map,dropChance:0,chestChance:0},boss=buildMapBoss(map),result=grantMonsterReward(p,boss,map);
  assert.equal(canFightMapBoss(result.player,map.id).ok,false);
  assert.equal(result.player.chests.length,p.chests.length+1);
  assert.equal(result.player.weeklyQuests.bosses,1);
});

test('solo dungeon risk path increases challenge and reward',()=>{
  const [safe,risk]=buildDungeonStageChoices(WORLD.map,1);
  assert.equal(safe.risk,undefined);assert.equal(risk.risk,true);
  assert.ok(risk.hp>safe.hp&&risk.xp>safe.xp&&risk.goldMin>safe.goldMin);
});

test('collection and weekly quest progress survive in player state',()=>{
  const collection=MAP_COLLECTIONS[0];let p=player();
  p={...p,monsterKills:Object.fromEntries(collection.monsterIds.map(id=>[id,1]))};
  assert.equal(collectionProgress(p,collection).done,true);
  const claimed=claimCollection(p,collection.id);assert.equal(claimed.claimed,true);
  p={...claimed.player,weeklyQuests:{...claimed.player.weeklyQuests,kills:WEEKLY_QUESTS[0].target}};
  assert.equal(weeklyQuestProgress(p,WEEKLY_QUESTS[0]).done,true);
});


test('wings: purchase is atomic, both races and every class equip/swap/save with exact bonuses',()=>{
 for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
  const start={...initialPlayer(cls,race,'Wings'),diamonds:10000,level:40};
  let p=start;
  for(const design of WINGS){
   const bought=buyWings(p,design.id);assert.equal(bought.bought,true);assert.equal(bought.player.diamonds,p.diamonds-2000);
   const item=bought.player.inventory.at(-1),result=equipItem(bought.player,item);assert.equal(result.blocked,null);
   p=result.player;assert.equal(p.equipped.wings.id,item.id);
   assert.deepEqual(equippedStatBonus(p),{str:3,sta:3,dex:3,int:3,mag:3});
   assert.equal(wingMultiplier(p,'exp'),1.05);assert.equal(wingMultiplier(p,'drop'),1.05);assert.equal(wingMultiplier(p,'atk'),1.03);assert.equal(wingDexBonus(p),3);
   const copy=migratePlayer(JSON.parse(JSON.stringify(p)));assert.deepEqual(copy.equipped.wings,p.equipped.wings);
   assert.ok(playerMaxHp(p)>playerMaxHp(start));assert.ok(playerMaxMp(p)>playerMaxMp(start));
  }
  assert.equal(p.inventory.filter(i=>i.kind==='wings').length,4);
  const naked={...p,equipped:{...p.equipped,wings:null}};
  assert.equal(wingMultiplier(naked,'atk'),1);assert.equal(playerMaxHp(naked),playerMaxHp(start));
 }
 const poor=initialPlayer('warrior','human','Poor');assert.equal(buyWings(poor,'dawn').player,poor);assert.equal(buyWings(poor,'dawn').bought,false);
 const full={...poor,diamonds:2000,inventory:Array.from({length:32},(_,i)=>({id:String(i),kind:'weapon',weight:0}))};
 assert.equal(buyWings(full,'dawn').player,full);assert.equal(buyWings(full,'dawn').bought,false);
});

test('wing attack bonus and monster EXP/drop rewards activate only while equipped',()=>{
 const base={...initialPlayer('warrior','human','WingMath'),level:10,inventory:[]};
 base.equipped.mainHand={id:'test',kind:'weapon',atk:100};
 const wing=makeWings('dawn'),wearing={...base,equipped:{...base.equipped,wings:wing}};
 const statsOnly={...base,equipped:{...base.equipped,necklace:{kind:'accessory',statBonus:wing.statBonus}}};
 assert.ok(Math.abs(totalStats(wearing).atk-totalStats(statsOnly).atk*1.03)<=1);
 assert.ok(Math.abs(pvpSnapshot(wearing).atk-pvpSnapshot(statsOnly).atk*1.03)<1e-8);
 assert.equal(pvpSnapshot(wearing).duelHp,pvpSnapshot(base).duelHp+12);
 const random=Math.random;Math.random=()=>.99;
 try {
  const map=MAPS[0],monster=map.monsters[0];
  const normal=grantMonsterReward(base,monster,map).drops.find(d=>d.type==='xp').amount;
  const boosted=grantMonsterReward(wearing,monster,map).drops.find(d=>d.type==='xp').amount;
  assert.ok(Math.abs(boosted-normal*1.05)<=1);
  Math.random=()=>map.chestChance*1.025;
  assert.equal(grantMonsterReward(base,monster,map).drops.some(d=>d.type==='chestDropped'),false);
  assert.equal(grantMonsterReward(wearing,monster,map).drops.some(d=>d.type==='chestDropped'),true);
  const full={...wearing,inventory:Array.from({length:32},(_,i)=>({id:String(i),weight:0}))};
  assert.equal(unequipItem(full,'wings').player,full);
  const removed=unequipItem({...wearing,hp:playerMaxHp(wearing),mp:playerMaxMp(wearing)},'wings');
  assert.equal(removed.removed,true);assert.equal(removed.player.equipped.wings,null);
  assert.equal(removed.player.hp,playerMaxHp(base));assert.equal(removed.player.mp,playerMaxMp(base));
  assert.equal(removed.player.inventory.at(-1).id,wing.id);
 }finally{Math.random=random;}
});


// Matched attack/defense isolates the skill budget from equipment scaling.
test('all 39 skills preserve three-class parity across defense and execute thresholds', async()=>{
 const {SKILLS_BY_CLASS}=await import('../src/data/skills');
 const {computeSkillDamage,computeSkillHeal}=await import('../src/utils/skills');
 const tables=Object.values(SKILLS_BY_CLASS);
 assert.equal(new Set(tables.flat().map(s=>s.id)).size,39);
 for(let i=0;i<13;i++) {
  const skills=tables.map(t=>t[i]);
  for(const skill of skills) {
   assert.equal(skill.mpCost,skills[0].mpCost);assert.equal(skill.cooldown,skills[0].cooldown);
   assert.deepEqual(skill.effect,skills[0].effect);
  }
  for(const atk of [20,100,500])for(const def of [0,100,400])for(const hp of [.2,.3,.8]) {
   const values=skills.map(skill=>computeSkillDamage(skill,{clsAtk:4,atk,monsterDef:def,monsterHpPct:hp,rand:()=>0}));
   assert.ok(values.every(v=>v===values[0]&&v>=1));
  }
  if(skills[0].effect.type==='heal') assert.ok(computeSkillHeal(skills[0],1000)<=250);
 }
});
test('buff recast replaces the same stat and lasts three full following actions', async()=>{
 const {refreshSkillBuff}=await import('../src/utils/skills');
 let buffs=refreshSkillBuff([{stat:'def',mult:1.2,turnsLeft:3}],{type:'buffAtk',mult:1.45,turns:3});
 buffs=refreshSkillBuff(buffs,{type:'buffAtk',mult:1.35,turns:3});
 assert.equal(buffs.length,2);assert.equal(buffs.find(b=>b.stat==='atk').mult,1.35);
 const active=[];
 for(let turn=0;turn<4;turn++) {buffs=buffs.map(b=>({...b,turnsLeft:b.turnsLeft-1})).filter(b=>b.turnsLeft>0);active.push(buffs.some(b=>b.stat==='atk'));}
 assert.deepEqual(active,[true,true,true,false]);
});


test('automatic skill duels are deterministic, bounded and immutable',async()=>{
 const {fixture,simulateDuel}=await import('./balance-fixtures');
 const {createDuel,stepDuel}=await import('../src/utils/duelEngine');
 const a=fixture('warrior',50,4),b=fixture('mage',50,4),before=JSON.stringify([a,b]);
 const first=simulateDuel(a,b,421);assert.deepEqual(first,simulateDuel(a,b,421));assert.equal(JSON.stringify([a,b]),before);
 assert.ok(first.finished&&first.round<=100);for(const f of first.fighters){assert.ok(f.mp>=0&&f.mp<=f.maxMp);assert.ok(f.hp>=0&&f.hp<=f.maxHp);}
 let state=createDuel(a,b,{seed:10,fullHealth:true}),used=[];while(!state.finished){state=stepDuel(state);used.push(...state.events.filter(e=>e.skillId));}
 assert.ok(used.some(e=>e.side===0)&&used.some(e=>e.side===1));assert.equal(stepDuel(state),state);
 let empty={...a,skills:{known:[],loadout:['w13']}};assert.equal(createDuel(empty,b).fighters[0].skills.length,0);
});
test('weapon anti-defense is type-specific, capped, upgradeable and ignores broken items',async()=>{
 const {fixture}=await import('./balance-fixtures');const {pvpDamage}=await import('../src/utils/pvpBalance');
 const a=fixture('warrior',60,5),b=fixture('rogue',60,5),plain=pvpSnapshot(b),attacker=pvpSnapshot(a);
 const ward=ACCESSORY_SETS.ring.find(i=>i.tier===6&&i.defenseAbility?.vs===attacker.weaponType);assert.ok(ward);
 const item=gmBuildAccessory('ring',6,3,ward.name);assert.equal(item.defenseAbility.value,9);
 b.equipped.ring1={...item,defenseAbility:{vs:attacker.weaponType,value:10000}};
 const defended=pvpSnapshot(b);const baseline=pvpDamage(attacker,{...defended,antiDef:{}},false,()=>.99),reduced=pvpDamage(attacker,defended,false,()=>.99);
 assert.ok(reduced>=baseline*.75-1&&reduced<baseline);assert.equal(pvpDamage({...attacker,weaponType:'staff'},defended,false,()=>.99),baseline);
 b.equipped.ring1.currentDurability=0;assert.equal(pvpSnapshot(b).antiDef[attacker.weaponType]||0,0);
 assert.equal(plain.antiDef[attacker.weaponType]||0,0);
});
test('PvP includes wings and active boosts once; EXP/drop bonuses never cause damage',async()=>{
 const {fixture}=await import('./balance-fixtures');let a=fixture('mage',60,5),base=pvpSnapshot(a);
 a.equipped.wings=makeWings('dawn');const wing=pvpSnapshot(a);assert.ok(wing.atk>base.atk&&wing.duelHp>base.duelHp);
 a.activeBoosts={atk:Date.now()+60000,def:Date.now()+60000,hp:Date.now()+60000};const boosted=pvpSnapshot(a);assert.ok(Math.abs(boosted.atk/wing.atk-1.2)<1e-8);assert.ok(Math.abs(boosted.def/wing.def-1.1)<1e-8);assert.equal(boosted.duelHp-wing.duelHp,100);
 a.activeBoosts={exp:Date.now()+60000,gold:Date.now()+60000,np:Date.now()+60000};assert.equal(pvpSnapshot(a).atk,wing.atk);
});
