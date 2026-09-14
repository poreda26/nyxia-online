import test from 'node:test';
import assert from 'node:assert/strict';
import {armorSampleParts,CHITIN_SAMPLE_ITEMS} from '../src/data/armorAppearance.js';
test('all 32 partial sets resolve only the actually equipped pieces in both races',()=>{
 const slots=Object.keys(CHITIN_SAMPLE_ITEMS);
 for(const race of ['human','karus'])for(let bits=0;bits<32;bits++){
  const equipped=Object.fromEntries(slots.filter((_,i)=>bits&(1<<i)).map(slot=>[slot,{id:slot,name:CHITIN_SAMPLE_ITEMS[slot],upgradeLevel:8}]));
  const p={class:'warrior',race,equipped},before=JSON.stringify(p);
  assert.deepEqual(armorSampleParts(p,{atlasKey:'warrior-4'}).map(p=>p.slot),Object.keys(equipped));
  assert.equal(JSON.stringify(p),before);
 }
});
test('sample never substitutes other armor sets, classes or unsupported weapons',()=>{
 const p={class:'warrior',equipped:{head:{name:'Chitin Shell Helmet'}}};
 assert.deepEqual(armorSampleParts(p,{atlasKey:'warrior-4'}),[]);
 p.equipped.head.name=CHITIN_SAMPLE_ITEMS.head;
 assert.deepEqual(armorSampleParts({...p,class:'rogue'},{atlasKey:'warrior-4'}),[]);
 assert.deepEqual(armorSampleParts(p,{atlasKey:'warrior-5'}),[]);
 assert.equal(armorSampleParts(p,{atlasKey:'warrior-4'})[0].slot,'head');
});
