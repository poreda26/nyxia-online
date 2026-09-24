import React from 'react';
import {createRoot} from 'react-dom/client';
import Figure from '../src/components/CharacterFigure';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor} from '../src/utils/loot';
import {characterAppearance} from '../src/data/characterAppearance';
import {characterArmorRig} from '../src/data/armorRig';
const root=createRoot(document.getElementById('root'));
window.gallery=(cls,race)=>root.render(<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',background:'#172029',color:'#fff'}}>{[1,2,3,4,5].map(tier=><section key={tier} style={{height:390}}><p>T{tier} {cls} {race}</p><div style={{height:340}}><Figure player={{class:cls,race,equipped:{mainHand:gmBuildWeaponById(cls,gmWeaponTemplates(cls)[0].id,1),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map(slot=>[slot,gmBuildArmor(cls,slot,tier,1)]))}}}/></div></section>)}</div>);
window.gallery('warrior','human');

window.gripCase=(cls,race,index=0,plus=7,tier=4)=>{
 const template=gmWeaponTemplates(cls)[index];if(!template)return null;
 const player={class:cls,race,equipped:{mainHand:gmBuildWeaponById(cls,template.id,plus),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map(slot=>[slot,tier?gmBuildArmor(cls,slot,tier,plus):null]))}};
 const a=characterAppearance(player),rig=characterArmorRig(player,a);
 root.render(<div style={{height:627,width:602}}><Figure player={player}/></div>);
 return {name:template.name,hand:rig.targetGeometry.hands[0],source:rig.sourceGeometry.hands[0],scale:rig.scale,dx:rig.dx,dy:rig.dy};
};

window.weapons=(cls,race,start=0)=>root.render(<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',background:'#172029',color:'#fff'}}>{gmWeaponTemplates(cls).slice(start,start+5).map((w,i)=><section key={w.id} style={{height:390}}><p>{w.name}</p><div style={{height:340}}><Figure player={{class:cls,race,equipped:{mainHand:gmBuildWeaponById(cls,w.id,8),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map((slot,j)=>[slot,gmBuildArmor(cls,slot,(i+j)%5+1,7+j%2)]))}}}/></div></section>)}</div>);

window.scythe=(race='human',plus=7,weaponName='Yırtıcı Pençe')=>root.render(<div style={{height:620,width:500,background:'#172029'}}><Figure player={{class:'warrior',race,equipped:{mainHand:gmBuildWeaponById('warrior',gmWeaponTemplates('warrior').find(w=>w.name===weaponName).id,plus),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map(slot=>[slot,gmBuildArmor('warrior',slot,4,8)]))}}}/></div>);
