import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPS} from '../src/data/maps.js';
import {buildSoloDungeonStages} from '../src/data/soloDungeon.js';
import {battleVisualFor} from '../src/data/battleVisuals.js';

test('all 27 map enemies have distinct in-bounds artwork without changing game data',()=>{
 const before=JSON.stringify(MAPS);let count=0;
 for(const map of MAPS){
  const used=new Set();
  for(const monster of map.monsters){
   const art=battleVisualFor(monster);assert.equal(art.mapId,map.id);
   const [x,y,w,h]=art.rect;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=art.size[0]&&y+h<=art.size[1]);
   assert.ok(!used.has(art.index));used.add(art.index);count++;
  }
 }
 assert.equal(count,27);assert.equal(JSON.stringify(MAPS),before);
});
test('all 36 dungeon stages resolve to their own region, including bosses',()=>{
 for(const map of MAPS){
  const stages=buildSoloDungeonStages(map),before=JSON.stringify(stages);
  assert.equal(stages.length,6);
  for(const stage of stages) assert.equal(battleVisualFor(stage).mapId,map.id);
  assert.equal(JSON.stringify(stages),before);
 }
});
test('unknown monster retains fallback interface',()=>{
 assert.equal(battleVisualFor({id:'unknown'}),null);
 assert.equal(battleVisualFor(null),null);
});
