import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ARMOR_SETS} from '../src/data/armorSets.js';
import {armorTier,armorAtlas,armorRegions,ARMOR_SLOTS,characterArmorRig} from '../src/data/armorRig.js';
const frames=JSON.parse(readFileSync(new URL('../src/data/characterAtlasFrames.json',import.meta.url)));
test('all 75 catalog armor pieces have both race frames and resolve independently without changing equipment',()=>{
 assert.equal(ARMOR_SETS.length,75);
 for(const item of ARMOR_SETS){
  const equipped={...item,id:'saved-id',upgradeLevel:8};const before=JSON.stringify(equipped);
  assert.equal(armorTier(equipped,item.cls,item.slot),item.tier);
  for(const slot of ARMOR_SLOTS.filter(s=>s!==item.slot))assert.equal(armorTier(equipped,item.cls,slot),0);
  assert.equal(JSON.stringify(equipped),before);
  const key=armorAtlas(item.cls,item.tier);
  assert.ok(existsSync(new URL(`../src/assets/characters/weapons/${key}.png`,import.meta.url)));
  assert.equal(frames[key].frames.length,6,key);
  assert.ok(frames[key].frames.every(f=>f.mask.length>0),key);
 }
});
test('empty and unknown armor remain cloth; mixed tiers follow actual slots in all six identities',()=>{
 for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
  const equipped=Object.fromEntries(ARMOR_SLOTS.map((slot,i)=>[slot,ARMOR_SETS.find(a=>a.cls===cls&&a.slot===slot&&a.tier===i+1)]));
  const a={atlasKey:cls==='warrior'?'warrior-4':`${cls}-0`,frameIndex:(race==='karus'?3:0)+(cls==='warrior'?2:0),size:[1254,1254]};
  const p={class:cls,race,equipped},before=JSON.stringify(p),rig=characterArmorRig(p,a);
  assert.deepEqual(Object.values(rig.tiers),[1,2,3,4,5]);assert.equal(JSON.stringify(p),before);
  assert.deepEqual(Object.values(characterArmorRig({...p,equipped:{}},a).tiers),[0,0,0,0,0]);
  assert.equal(armorTier({name:'Unknown Armor'},cls,'chest'),0);
 }
});
function inside(d,x,y){return d.split('M').slice(1).some(p=>{const points=p.replace('Z','').split('L').map(v=>v.split(',').map(Number));let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,e]=points[j];if((b>y)!==(e>y)&&x<(c-a)*(y-b)/(e-b)+a)hit=!hit;}return hit;});}
test('Human Warrior chest patch is owned by chest, never the gauntlet overlay',()=>{
 const regions=armorRegions('warrior',2,0);
 for(const [x,y] of [[160,285],[165,289],[171,291]]){
  assert.ok(inside(regions.chest,x,y));assert.equal(inside(regions.gauntlets,x,y),false);
 }
 assert.ok(inside(regions.gauntlets,191,318),'fingers remain part of gloves');
});
test('helmets exclude shoulder spikes and robe collars',()=>{
 for(const [cls,x,y] of [['warrior',100,145],['rogue',130,180],['mage',151,145]]) {
  const r=armorRegions(cls,cls==='warrior'?2:0,0);
  assert.equal(inside(r.head,x,y),false,cls);
  assert.ok(inside(r.chest,x,y),cls);
 }
});
