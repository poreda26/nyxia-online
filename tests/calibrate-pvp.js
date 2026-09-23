import {PVP_POWER_CURVE,PVP_UPGRADE_CURVE} from '../src/utils/pvpBalance';
import {fixture,simulateDuel} from './balance-fixtures';

for(const [idx,[tier,level]] of [[1,15],[2,25],[3,40],[4,50],[5,60],[6,65]].entries())for(const [pi,plus] of [1,5,8].entries()){
 for(const c of ['rogue','mage'])PVP_UPGRADE_CURVE[c][level]??=[1,1,1];
 const fighters=['warrior','rogue','mage'].map(c=>fixture(c,level,tier,plus)),r0=PVP_UPGRADE_CURVE.rogue[level][pi],m0=PVP_UPGRADE_CURVE.mage[level][pi];let best={loss:Infinity};
 for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++){
  const r=r0*(1+x*.04),m=m0*(1+y*.04);PVP_UPGRADE_CURVE.rogue[level][pi]=r;PVP_UPGRADE_CURVE.mage[level][pi]=m;
  const rates=[[0,1],[0,2],[1,2]].map(([a,b])=>{let wins=0;for(let i=1;i<=500;i++)wins+=simulateDuel(fighters[a],fighters[b],i*7127).winner===0;return wins/500;});
  const loss=Math.max(...rates.map(p=>Math.abs(p-.5)))+rates.reduce((s,p)=>s+(p-.5)**2,0);
  if(loss<best.loss)best={loss,r,m};
 }
 PVP_UPGRADE_CURVE.rogue[level][pi]=best.r;PVP_UPGRADE_CURVE.mage[level][pi]=best.m;
}
console.log(JSON.stringify(PVP_UPGRADE_CURVE));

