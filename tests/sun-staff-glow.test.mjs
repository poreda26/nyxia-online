import test from 'node:test';
import assert from 'node:assert/strict';
import {weaponGeometry} from '../src/data/weaponGeometry.js';
function inside(path,x,y){const pts=path.slice(1,-1).split('L').map(p=>p.split(',').map(Number));let hit=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[a,b]=pts[i],[c,d]=pts[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;}
test('sun staff left rays glow for both races without catching the face or shoulder',()=>{
 for(const frameIndex of [1,4]){
  const {head}=weaponGeometry({atlasKey:'mage-7',frameIndex,size:[1254,1254],weaponName:'Güneş Çekirdeği'});
  for(const point of [[254,91],[260,42],[262,119],[330,165]])assert.ok(inside(head,...point),`ray ${point}`);
  for(const point of [[235,125],[249,190],[265,207]])assert.equal(inside(head,...point),false,`body ${point}`);
 }
});
