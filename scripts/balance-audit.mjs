import { build } from 'esbuild';
const source = `
import {initialPlayer,totalStats,playerMaxHp,playerDef,equipItem,armorSetDamageReduction} from './src/utils/player';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor} from './src/utils/loot';
import {CLASSES} from './src/data/classes';
import {MAPS} from './src/data/maps';
import {mitigate,hitChance} from './src/utils/combat';
import {comparablePlayer,pvpSnapshot,rollPvpDamage} from './src/utils/pvpBalance';
const fixtures=[];
for(const cls of Object.keys(CLASSES)) {
 console.log(cls);
 for(const map of [...MAPS,{...MAPS[0],levelMin:1},{...MAPS.at(-1),levelMin:65,tier:6}]) {
  const level=map.levelMin,tier=Math.min(map.tier,level<60?4:5);
  let p=initialPlayer(cls,'karus','Audit');p.level=level;p.awakened=level>=60;
  let points=10+3*(level-1);
  if(cls==='mage'){const intGoal=[0,70,100,124,160,160][tier];const n=Math.min(points,Math.max(0,intGoal-p.stats.int));p.stats.int+=n;points-=n;}
  p.stats[CLASSES[cls].mainStat]+=Math.min(points,255-p.stats[CLASSES[cls].mainStat]);
  const candidates=gmWeaponTemplates(cls).filter(w=>w.tier<=map.tier).map(w=>gmBuildWeaponById(cls,w.id,3)).filter(w=>!equipItem(p,w).blocked).sort((a,b)=>b.atk-a.atk);
  if(candidates[0])p=equipItem(p,candidates[0]).player;
  for(const slot of ['head','chest','legs','gauntlets','boots'])for(let t=1;t<=tier;t++){const a=gmBuildArmor(cls,slot,t,3);if(a&&!equipItem(p,a).blocked)p=equipItem(p,a).player;}
  const m=map.monsters.at(-1),atk=totalStats(p).atk,hp=playerMaxHp(p),def=playerDef(p);
  fixtures.push(p);
  const out=mitigate(CLASSES[cls].atk+atk*.9,m.def,120)*(1+.8*CLASSES[cls].crit)*hitChance(p.stats.dex,m.atk,level);
  const incoming=mitigate(m.atk,def,170)*(1-armorSetDamageReduction(p,'monster'))*hitChance(m.atk,p.stats.dex,map.levelMax);
  console.log(JSON.stringify({level,tier,weapon:p.equipped.mainHand.name,atk,hp,def,turns:+(m.hp/out).toFixed(1),survive:+(hp/incoming).toFixed(1)}));
 }
}
let seed=7421;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const plus of [1,3,5,8])for(const ref of fixtures.filter(p=>p.class==='warrior')){
 ref.equipped.mainHand=gmBuildWeaponById('warrior',gmWeaponTemplates('warrior').find(w=>w.name===ref.equipped.mainHand.name)?.id||'w0',plus);
 const players=Object.keys(CLASSES).map(c=>comparablePlayer(ref,c));
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){
  let wins=0,turns=0;const A=pvpSnapshot(players[a]),B=pvpSnapshot(players[b]);
  for(let run=0;run<1000;run++){let ah=A.hp,bh=B.hp;let turn=run%2;
   for(let t=0;t<200;t++){if(turn===0)bh-=rollPvpDamage(A,B,rng)||0;else ah-=rollPvpDamage(B,A,rng)||0;turn=1-turn;if(ah<=0||bh<=0){wins+=bh<=0?1:0;turns+=t+1;break;}}
  }
  console.log(JSON.stringify({pvp:ref.level,plus,pair:A.cls+'/'+B.cls,win:wins/10,actions:Math.round(turns/1000)}));
 }
}
`;
const result=await build({stdin:{contents:source,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.png':'dataurl','.svg':'dataurl'}});
const {createRequire}=await import('node:module');
new Function('require',result.outputFiles[0].text)(createRequire(import.meta.url));
