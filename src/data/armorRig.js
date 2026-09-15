import {ARMOR_SETS} from './armorSets.js';
import {CHITIN_SAMPLE_REGIONS} from './armorAppearance.js';
import {weaponGeometry} from './weaponGeometry.js';

export const ARMOR_SLOTS=['chest','legs','boots','gauntlets','head'];
export const ARMOR_POSES={warrior:'warrior-4',rogue:'rogue-0',mage:'mage-0'};
export function armorTier(item,cls,slot){return ARMOR_SETS.find(a=>a.cls===cls&&a.slot===slot&&a.name===item?.name)?.tier||0;}
export function armorAtlas(cls,tier){const base=ARMOR_POSES[cls];return tier===0?`${base}-cloth-base`:cls==='warrior'&&tier===4?'warrior-4-chitin-sample':`${base}-armor-t${tier}`;}
export function armorRegions(cls,col,row){
 if(cls==='warrior')return {...CHITIN_SAMPLE_REGIONS,
  head:'M135,50L258,50L258,155L238,200L183,193L155,178L145,150L135,135Z',
  chest:'M25,95L260,95L336,202L342,338L281,366L223,352L132,376L33,357Z',
 };
 if(cls==='mage')return {
  head:'M95,50L262,50L262,150L248,177L209,173L184,148L171,125L130,125L95,125Z',
  chest:'M25,125L258,125L329,171L349,334L234,365L76,360L14,260Z',
  legs:'M0,331L418,331L418,627L0,627Z',
  boots:'M0,529L113,529L136,627L0,627ZM280,538L418,538L418,627L265,627Z',
  gauntlets:'M131,282L177,280L197,289L220,283L240,299L236,320L215,335L187,327L153,317L128,308ZM259,198L282,195L300,211L300,235L320,247L330,270L316,291L287,279L277,251L258,238L252,216Z',
 };
 const cross=col===2;
 return {
  head:'M142,55L276,55L276,175L254,207L202,210L181,192L163,175L142,159Z',
  chest:'M29,150L278,150L409,196L409,292L283,292L282,366L94,366L62,276L20,246Z',
  legs:'M0,329L418,329L418,627L0,627Z',
  boots:'M0,492L115,492L144,627L0,627ZM277,501L418,501L418,627L267,627Z',
  gauntlets:cross?'M155,203L187,204L205,215L221,213L235,226L223,246L204,252L180,247L160,239ZM280,211L309,211L324,225L319,244L298,253L273,243L264,230Z':'M136,200L159,201L175,193L191,195L209,205L205,222L183,234L158,237L136,226ZM341,212L362,211L367,199L387,201L398,216L396,243L378,256L360,247L340,239Z',
 };
}
export function characterArmorRig(player,appearance){
 const cls=player.class,row=player.race==='karus'?1:0;
 const cross=cls==='rogue'&&['0:2','2:2','3:0','4:1','5:1','6:0'].includes(`${Number(appearance.atlasKey.split('-')[1])}:${appearance.frameIndex%3}`);
 const sourceKey=ARMOR_POSES[cls];
 if(!sourceKey)return null;
 const col=cls==='warrior'?2:cross?2:0;
 const frameIndex=row*3+col;
 const sourceGeometry=weaponGeometry({atlasKey:sourceKey,frameIndex,size:[1254,1254],weaponName:'source'});
 const targetGeometry=weaponGeometry(appearance);
 const a=sourceGeometry.hands[0],b=targetGeometry.hands[0];
 let scale=1,dx=0,dy=0;
 if(a&&b){scale=Math.max(.82,Math.min(1.08,(600-b[1])/(600-a[1])));dx=b[0]-a[0]*scale;dy=600*(1-scale);}
 return {cls,row,col,frameIndex,sourceKey,sourceGeometry,targetGeometry,scale,dx,dy,transform:`translate(${dx} ${dy}) scale(${scale})`,regions:armorRegions(cls,col,row),tiers:Object.fromEntries(ARMOR_SLOTS.map(slot=>[slot,armorTier(player.equipped?.[slot],cls,slot)]))};
}
