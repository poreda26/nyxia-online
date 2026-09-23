import {fixture,simulateDuel} from './balance-fixtures';
import {pvpSnapshot,pvpSkillPower} from '../src/utils/pvpBalance';
import {makeWings} from '../src/utils/wings';
import {ACCESSORY_SETS} from '../src/data/accessories';
import {gmBuildAccessory} from '../src/utils/loot';
import {applyLevelData} from '../src/utils/upgrade';
const rows=[];
for(const cls of ['warrior','rogue','mage']){
 for(const mode of ['baseline','wings','boosts','antiMatch','antiWrong']){
  const a=fixture(cls,60,5),b=fixture(cls,60,5);
  if(mode==='wings')a.equipped.wings=makeWings('dawn');
  if(mode==='boosts')a.activeBoosts={atk:Date.now()+600000,def:Date.now()+600000,hp:Date.now()+600000};
  if(mode.startsWith('anti')){const vs=mode==='antiMatch'?b.equipped.mainHand.weaponType:(b.equipped.mainHand.weaponType==='staff'?'bow':'staff');const t=ACCESSORY_SETS.ring.find(t=>t.tier===5&&t.defenseAbility?.vs===vs);a.equipped.ring1=gmBuildAccessory('ring',5,3,t.name);}
  let wins=0;for(let i=1;i<=2000;i++)wins+=simulateDuel(a,b,1237*i).winner===0;
  rows.push({cls,mode,winPct:wins/20});
 }
}
let regressions=[];
for(const cls of ['warrior','rogue','mage'])for(const [tier,level] of [[1,15],[2,25],[3,40],[4,50],[5,60],[6,65]]){
 const p=fixture(cls,level,tier),weapon=p.equipped.mainHand;let previous=0;
 for(let plus=1;plus<=8;plus++){p.equipped.mainHand=applyLevelData(weapon,plus);const power=pvpSnapshot(p).atk*pvpSkillPower(cls,level,plus);if(power<previous)regressions.push({cls,tier,plus,previous,power});previous=power;}
}
console.log(JSON.stringify({bonuses:rows,upgradeRegressions:regressions},null,2));
