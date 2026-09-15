import test from 'node:test';
import assert from 'node:assert/strict';
import {armorEffect} from '../src/data/armorEffects.js';
import {ARMOR_SETS} from '../src/data/armorSets.js';
import {weaponEffects} from '../src/data/weaponEffects.js';
import {CASTER_WEAPONS} from '../src/data/casterWeapons.js';
import {weaponGeometry} from '../src/data/weaponGeometry.js';
import {readFileSync} from 'node:fs';

test('every armor piece lights only at +7/+8 and never changes item values',()=>{
 for(const a of ARMOR_SETS)for(let plus=1;plus<=8;plus++){
  const item={...a,upgradeLevel:plus,id:'saved',def:143},before=JSON.stringify(item),fx=armorEffect(item,a.cls,a.slot);
  if(plus<7)assert.equal(fx,null);else{assert.equal(fx.tier,a.tier);assert.equal(fx.strong,plus===8);assert.equal(fx.plus,plus)}
  assert.equal(JSON.stringify(item),before);
  assert.equal(armorEffect(item,a.cls,'wrong-slot'),null);
 }
 assert.equal(armorEffect(null,'mage','chest'),null);
});
test('armor intensity, radius and blur increase for every higher tier',()=>{
 for(const cls of ['warrior','rogue','mage'])for(const plus of [7,8]){
  let prev=null;
  for(let tier=1;tier<=5;tier++){
   const a=ARMOR_SETS.find(a=>a.cls===cls&&a.slot==='chest'&&a.tier===tier),fx=armorEffect({...a,upgradeLevel:plus},cls,'chest');
   if(prev)for(const key of ['intensity','radius','blur'])assert.ok(fx[key]>prev[key],key);
   prev=fx;
  }
 }
});
test('missing staff element metadata restores cosmetic palettes without changing combat data',()=>{
 for(const name of ['Prismatic Triad Staff',"Ron's Staff"]){
  const item={name,weaponType:'staff',upgradeLevel:8,element:null,elements:null,atk:222},before=JSON.stringify(item);
  assert.deepEqual(weaponEffects(item).map(e=>e.key),['flame','ice','lightning']);assert.equal(JSON.stringify(item),before);
 }
 for(const w of CASTER_WEAPONS){
  assert.ok(weaponEffects({...w,upgradeLevel:8}).length,w.name);
  assert.equal(weaponEffects({...w,upgradeLevel:6}).length,0);
 }
 assert.equal(weaponEffects({name:'Wooden Staff',upgradeLevel:8})[0].key,'arcane');
});
test('all staff stems remain straight and overlap their head crop in both races',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../src/data/characterWeaponManifest.json',import.meta.url)));
 for(const b of manifest.filter(b=>b.cls==='mage'))for(const [col,[name]] of b.items.entries()){
  if(name.startsWith('__'))continue;
  for(const row of [0,1]){
   const g=weaponGeometry({atlasKey:b.key,frameIndex:col+row*3,size:[1254,1254],weaponName:name});
   assert.match(g.stem,/^M[\d.,-]+L[\d.,-]+$/,name);
   assert.ok(g.butt.length>0,name);
   const [tail,tip]=g.stem.slice(1).split('L').map(p=>p.split(',').map(Number));
   assert.ok(tip[1]<tail[1],name);
   const box=g.head.match(/-?\d+(?:\.\d+)?/g).map(Number),xs=box.filter((_,i)=>i%2===0),ys=box.filter((_,i)=>i%2===1);
   assert.ok(tip[0]>=Math.min(...xs)&&tip[0]<=Math.max(...xs)&&tip[1]>=Math.min(...ys)&&tip[1]<=Math.max(...ys),name+' head/stem overlap');
   for(const [x,y] of g.hands)assert.ok(Math.abs((x-tail[0])*(tip[1]-tail[1])-(y-tail[1])*(tip[0]-tail[0]))<.001,name);
  }
 }
});
