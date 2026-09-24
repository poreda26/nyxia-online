import React from 'react';
import {createRoot} from 'react-dom/client';
import Figure from '../src/components/CharacterFigure';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor} from '../src/utils/loot';
const root=createRoot(document.getElementById('root'));
window.gallery=(cls,race)=>root.render(<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',background:'#172029',color:'#fff'}}>{[1,2,3,4,5].map(tier=><section key={tier} style={{height:390}}><p>T{tier} {cls} {race}</p><div style={{height:340}}><Figure player={{class:cls,race,equipped:{mainHand:gmBuildWeaponById(cls,gmWeaponTemplates(cls)[0].id,1),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map(slot=>[slot,gmBuildArmor(cls,slot,tier,1)]))}}}/></div></section>)}</div>);
window.gallery('warrior','human');

window.weapons=(cls,race,start=0)=>root.render(<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',background:'#172029',color:'#fff'}}>{gmWeaponTemplates(cls).slice(start,start+5).map((w,i)=><section key={w.id} style={{height:390}}><p>{w.name}</p><div style={{height:340}}><Figure player={{class:cls,race,equipped:{mainHand:gmBuildWeaponById(cls,w.id,8),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map((slot,j)=>[slot,gmBuildArmor(cls,slot,(i+j)%5+1,7+j%2)]))}}}/></div></section>)}</div>);

window.scythe=(race='human',plus=7,weaponName='Yırtıcı Pençe')=>root.render(<div style={{height:620,width:500,background:'#172029'}}><Figure player={{class:'warrior',race,equipped:{mainHand:gmBuildWeaponById('warrior',gmWeaponTemplates('warrior').find(w=>w.name===weaponName).id,plus),...Object.fromEntries(['head','chest','legs','gauntlets','boots'].map(slot=>[slot,gmBuildArmor('warrior',slot,4,8)]))}}}/></div>);
