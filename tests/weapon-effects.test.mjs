import test from 'node:test';
import assert from 'node:assert/strict';
import {weaponEffects} from '../src/data/weaponEffects.js';
test('upgrade threshold and ice alias follow equipped item without mutation',()=>{
 const item={upgradeLevel:6,element:'glacier'},before=JSON.stringify(item);
 assert.deepEqual(weaponEffects(item),[]);
 assert.equal(JSON.stringify(item),before);
 assert.deepEqual(weaponEffects({...item,upgradeLevel:7}),[{key:'ice',color:'#6ce7ff',strong:false}]);
 assert.equal(weaponEffects({...item,upgradeLevel:8})[0].strong,true);
 assert.deepEqual(weaponEffects(null),[]);
 assert.deepEqual(weaponEffects({upgradeLevel:8}),[]);
});
test('all real elemental bonuses are retained, unknown and zero bonuses excluded',()=>{
 const item={upgradeLevel:8,element:'flame',elements:[{key:'flame',bonus:12},{key:'glacier',bonus:8},{key:'lightning',bonus:5},{key:'poison',bonus:0},{key:'unknown',bonus:9}]};
 assert.deepEqual(weaponEffects(item).map(e=>e.key),['flame','ice','lightning']);
 assert.equal(weaponEffects({upgradeLevel:7,element:'poison'})[0].color,'#dc65ff');
});
