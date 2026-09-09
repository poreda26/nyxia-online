import { ATTACK_DURATION } from './animation';
import humanUrl from '../assets/world/warrior-human-v4.png';
import orcUrl from '../assets/world/warrior-orc-v4.png';
import armorUrl from '../assets/world/warrior-armor-v4.png';
import swordUrl from '../assets/items/sword-base.png';
import axeUrl from '../assets/items/axe-base.png';
import hammerUrl from '../assets/items/hammer-base.png';
import { itemImageFor } from '../data/itemImages';

export const WARRIOR_SIZE = 134;
export const warriorAssets = { human: humanUrl, orc: orcUrl };
export const warriorArmorUrl=armorUrl;

// Positions are local fractions of a cell, measured against the exported atlas.
// Weapon grips are separate from the body; equipment never alters combat state.
const hands = [
  [.35,.53],[.33,.52],[.32,.50],[.45,.55],
  [.76,.43],[.78,.54],[.74,.45],[.73,.47],
  [.36,.055],[.40,.30],[.81,.30],[.47,.36],
  [.60,.045],[.67,.25],[.78,.20],[.69,.25],
];
const orcHands=[
  [.34,.56],[.34,.55],[.31,.56],[.28,.55],
  [.77,.53],[.79,.53],[.77,.54],[.76,.51],
  [.34,.09],[.45,.21],[.94,.26],[.40,.38],
  [.74,.105],[.73,.18],[.94,.18],[.71,.27],
];
const heads=[
  [.62,.14],[.57,.15],[.53,.15],[.56,.15],
  [.56,.13],[.59,.13],[.55,.13],[.53,.13],
  [.58,.18],[.58,.19],[.54,.20],[.53,.18],
  [.46,.15],[.47,.16],[.48,.14],[.50,.16],
];

export function armorVariant(item) {
  if(!item)return null;
  if(/^Chitin Shell (Helmet|Pauldron)$/.test(item.name))return 1;
  if(/^Chitin Armor (Helmet|Pauldron)$/.test(item.name))return 0;
  return null;
}

export function measureArmorAtlas(img) {
  const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const {data}=ctx.getImageData(0,0,img.width,img.height),frames=[];
  for(let row=0;row<2;row++)for(let col=0;col<4;col++) {
    const x=Math.round(col*img.width/4),y=Math.round(row*img.height/2);
    const w=Math.round((col+1)*img.width/4)-x,h=Math.round((row+1)*img.height/2)-y;
    let left=w,top=h,right=0,bottom=0;
    for(let sy=0;sy<h;sy++)for(let sx=0;sx<w;sx++)if(data[((y+sy)*img.width+x+sx)*4+3]>96){
      left=Math.min(left,sx);top=Math.min(top,sy);right=Math.max(right,sx+1);bottom=Math.max(bottom,sy+1);
    }
    if(right<=left||bottom<=top)throw new Error('Empty armor atlas cell');
    frames.push({x:x+left,y:y+top,w:right-left,h:bottom-top});
  }
  return frames;
}

export function warriorFrame(world) {
  const attacking=world.swingUntil>world.time;
  const phase=attacking?Math.min(3,Math.floor(Math.max(0,world.time-(world.swingStarted??0))/ATTACK_DURATION*4))
    :world.actor.moving?Math.floor((world.actor.walkTime||0)*8)%4:1;
  const row=(world.actor.back?1:0)+(attacking?2:0);
  return { row,column:phase,index:row*4+phase,attacking };
}

export function warriorWeaponUrl(weapon) {
  if(!weapon)return null;
  // +7/+8 inventory art includes an opaque effects card. Use the user's clean
  // base silhouette in-world and add the elemental light on a separate layer.
  return itemImageFor(weapon.name,0) || ({sword:swordUrl,axe:axeUrl,mace:hammerUrl,hammer:hammerUrl}[weapon.weaponType]??null);
}

export function weaponLight(weapon) {
  if(!weapon || (weapon.upgradeLevel||0)<7)return null;
  const name=weapon.name||'';
  const element=String(weapon.element||weapon.elementType||'').toLowerCase();
  if(/poison/.test(element)||/Halberd|Raptor|Glave/.test(name))return '#96ed66';
  if(/glacier|ice/.test(element)||/Avedon|Blade Axe/.test(name))return '#83dfff';
  if(/lightning/.test(element)||/Stormweaver|Giantic|Large Hacker|Weight Hammer|Iron Impact|Totamic/.test(name))return '#b3a0ff';
  return '#ffae64';
}

export function weaponGrip(weapon) {
  // Individual source orientations differ: axes/Raptor have lower-right grips.
  if(/^(Raptor|Glave)$/.test(weapon.name))return {x:.78,y:.77,rotation:Math.PI/2};
  if(/^(Giantic Axe|Avedon)$/.test(weapon.name)||weapon.weaponType==='axe')return {x:.70,y:.72,rotation:Math.PI/2};
  if(weapon.name==='Halberd')return {x:.49,y:.51,rotation:0};
  if(/hammer|mace/.test(weapon.weaponType||''))return {x:.49,y:.53,rotation:0};
  return {x:.28,y:.72,rotation:0};
}

// Alpha measurements run once after image load, never in the animation loop.
export function measureWarriorAtlas(img) {
  const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const {data}=ctx.getImageData(0,0,img.width,img.height),frames=[];
  for(let row=0;row<4;row++)for(let col=0;col<4;col++) {
    const x=Math.round(col*img.width/4),y=Math.round(row*img.height/4);
    const w=Math.round((col+1)*img.width/4)-x,h=Math.round((row+1)*img.height/4)-y;
    let foot=h-1;
    for(let sy=h-1;sy>=0;sy--) {
      let solid=0;for(let sx=0;sx<w;sx++)if(data[((y+sy)*img.width+x+sx)*4+3]>96)solid++;
      if(solid>=5){foot=sy+1;break;}
    }
    frames.push({x,y,w,h,foot:foot/h});
  }
  return frames;
}

function drawHeldWeapon(ctx,img,weapon,world,pose,foot,race) {
  if(!img||!weapon)return;
  const [hx,hy]=(race==='orc'?orcHands:hands)[pose.index];
  const long=/spear|javelin/.test(weapon.weaponType||'');
  const size=long?86:weapon.weaponType==='sword'?64:69;
  const width=size*img.width/Math.max(img.width,img.height),height=size*img.height/Math.max(img.width,img.height);
  const angle=pose.attacking?[-1.2,-.75,.75,.20][pose.column]:.38;
  const color=weaponLight(weapon);
  const grip=weaponGrip(weapon);
  ctx.save();ctx.translate((hx-.5)*WARRIOR_SIZE,(hy-foot)*WARRIOR_SIZE);ctx.rotate(angle+grip.rotation);
  if(color){
    const pulse=.8+.2*Math.sin(world.time*5),radius=(weapon.upgradeLevel>=8?15:10)*pulse;
    const gx=(.5-grip.x)*width,gy=(.4-grip.y)*height;
    const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,radius);
    glow.addColorStop(0,color+'88');glow.addColorStop(1,color+'00');
    ctx.fillStyle=glow;ctx.fillRect(gx-radius,gy-radius,radius*2,radius*2);
    ctx.shadowColor=color;ctx.shadowBlur=9+3*pulse;
  }
  ctx.drawImage(img,-width*grip.x,-height*grip.y,width,height);
  ctx.restore();
}

export function drawWarrior(ctx,world,player,art) {
  const race=player.race==='karus'?'orc':'human';
  const image=art.warriors?.[race],frames=art.warriorFrames?.[race];
  if(!image||!frames)return false;
  const pose=warriorFrame(world),f=frames[pose.index];
  ctx.save();ctx.translate(world.actor.x,world.actor.y);ctx.scale(world.actor.facing||1,1);
  ctx.drawImage(image,f.x,f.y,f.w,f.h,-WARRIOR_SIZE/2,-WARRIOR_SIZE*f.foot,WARRIOR_SIZE,WARRIOR_SIZE);
  drawArmorLayers(ctx,art,player,pose,f.foot);
  drawHeldWeapon(ctx,art.heldWeapon,player.equipped.mainHand,world,pose,f.foot,race);
  ctx.restore();return true;
}

function drawArmorLayers(ctx,art,player,pose,foot) {
  if(!art.warriorArmor||!art.armorFrames)return;
  const head=heads[pose.index],back=pose.row%2===1,size=WARRIOR_SIZE;
  for(const slot of ['chest','head']) {
    const variant=armorVariant(player.equipped[slot]);if(variant===null)continue;
    const f=art.armorFrames[(slot==='head'?4:0)+variant*2+(back?1:0)];
    const width=slot==='head'?size*.19:size*.27,height=slot==='head'?size*.24:size*.29;
    const cx=(head[0]-.5)*size+(slot==='chest'?(back?-2:-5):0);
    const cy=(head[1]-foot)*size+(slot==='head'?0:size*.20);
    ctx.drawImage(art.warriorArmor,f.x,f.y,f.w,f.h,cx-width/2,cy-height/2,width,height);
  }
}
