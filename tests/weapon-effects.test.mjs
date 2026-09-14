import test from 'node:test';
import assert from 'node:assert/strict';
import {weaponEffects,weaponEffectPolygon} from '../src/data/weaponEffects.js';
function includesPoint(polygon,x,y){const points=polygon.split(' ').map(p=>p.split(',').map(Number));let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
test('Avedon both axe tips and Raptor curved blade remain inside effects for both races',()=>{
 for(const row of [0,1]){
  const axe=weaponEffectPolygon({atlasKey:'warrior-1',frameIndex:2+row*3,size:[1254,1254]});
  for(const [x,y] of [[.58,.08],[.98,.30]])assert.ok(includesPoint(axe,(2+x)*418,(row+y)*627));
  assert.equal(includesPoint(axe,2.4*418,(row+.5)*627),false);
  const scythe=weaponEffectPolygon({atlasKey:'warrior-raptor-v2',frameIndex:row*3,size:[1254,1254]});
  assert.ok(includesPoint(scythe,1.10*418,(row+.40)*627));
 }
});
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
