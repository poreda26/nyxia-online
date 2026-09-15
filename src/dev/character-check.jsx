import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import CharacterFigure from '../components/CharacterFigure';
import ItemIcon from '../components/ItemIcon';
import {BALANCED_WEAPONS} from '../data/balancedWeapons';
import {ARMOR_SETS} from '../data/armorSets';
import {initialPlayer,equipItem} from '../utils/player';
import {gmBuildWeaponById,gmWeaponTemplates,gmBuildArmor} from '../utils/loot';
import arena from '../assets/battle/arena-v1.png';
const slots={head:'Kask',chest:'Göğüslük',legs:'Pantolon',gauntlets:'Ellik',boots:'Bot'};
function fresh(cls,race){let p={...initialPlayer(cls,race,'Önizleme'),level:65,awakened:true,stats:{str:300,dex:300,int:300,mag:300,sta:300}};const name={warrior:'Rusty Sword',rogue:'Bow',mage:'Wooden Staff'}[cls],t=gmWeaponTemplates(cls).find(w=>w.name===name),item=gmBuildWeaponById(cls,t.id,1);return equipItem({...p,inventory:[...p.inventory,item]},item).player;}
function takeOff(p,slot){const old=p.equipped[slot];return old?{...p,equipped:{...p.equipped,[slot]:null},inventory:[...p.inventory,old]}:p;}
function putArmor(p,slot,tier){if(!tier)return takeOff(p,slot);if(p.equipped[slot]?.tier===tier)return p;const item=gmBuildArmor(p.class,slot,tier,1),r=equipItem({...p,inventory:[...p.inventory,item]},item);if(r.blocked)throw Error(r.blocked);return r.player;}
function Demo(){const [p,setP]=useState(()=>fresh('warrior','human')),[plus,setPlus]=useState(1),[tier,setTier]=useState(4);
 function equip(name){if(!name){setP(takeOff(p,'mainHand'));return;}const t=gmWeaponTemplates(p.class).find(w=>w.name===name),item=gmBuildWeaponById(p.class,t.id,plus);setP(equipItem({...p,inventory:[...p.inventory,item]},item).player);}
 return <main><h1>Karakter, silah ve zırh</h1><p>Bu deneme oyun kaydını değiştirmez. Boş zırh yuvaları bez kıyafetli bedeni gösterir.</p><nav>
 <select aria-label="Sınıf" value={p.class} onChange={e=>{setP(fresh(e.target.value,p.race));setPlus(1)}}>{['warrior','rogue','mage'].map(c=><option key={c}>{c}</option>)}</select>
 <select aria-label="Irk" value={p.race} onChange={e=>setP({...p,race:e.target.value})}><option value="human">Human</option><option value="karus">Karus</option></select>
 <select aria-label="Upgrade" value={plus} onChange={e=>{setPlus(+e.target.value);if(p.equipped.mainHand)setP({...p,equipped:{...p.equipped,mainHand:{...p.equipped.mainHand,upgradeLevel:+e.target.value}}})}}>{[1,2,3,4,5,6,7,8].map(n=><option key={n}>{n}</option>)}</select></nav>
 <select className="weapon" aria-label="Silah" value={p.equipped.mainHand?.name||''} onChange={e=>equip(e.target.value)}><option value="">Silahsız</option>{BALANCED_WEAPONS[p.class].map(w=><option key={w.name}>{w.name}</option>)}</select>
 <div className="weapon-info">{p.equipped.mainHand&&<ItemIcon item={p.equipped.mainHand} size={68}/>}<span>{p.equipped.mainHand?.name||'Silahsız'} · +{plus}</span></div>
 <fieldset><legend>Zırh setleri · T1–T5</legend><nav><select aria-label="Set seviyesi" value={tier} onChange={e=>setTier(+e.target.value)}>{[1,2,3,4,5].map(t=><option key={t} value={t}>T{t}</option>)}</select><button onClick={()=>setP(Object.keys(slots).reduce((state,slot)=>putArmor(state,slot,tier),p))}>Seti kuşan</button><button onClick={()=>setP(Object.keys(slots).reduce(takeOff,p))}>Tüm zırhları çıkar</button></nav>
 <div className="armor-slots">{Object.entries(slots).map(([slot,label])=><label key={slot}><span>{label}</span><select aria-label={label} value={p.equipped[slot]?.tier||0} onChange={e=>setP(putArmor(p,slot,+e.target.value))}><option value="0">Çıkar / bez kıyafet</option>{ARMOR_SETS.filter(a=>a.cls===p.class&&a.slot===slot).map(a=><option key={a.name} value={a.tier}>T{a.tier} · {a.name}</option>)}</select></label>)}</div></fieldset>
 <div className="views"><section className="battle" style={{backgroundImage:`url(${arena})`}}><h2>Savaş görünümü</h2><CharacterFigure player={p}/></section><section className="inventory paperdoll-character"><h2>Kuşanılmış</h2><CharacterFigure player={p}/></section></div></main>;
}
document.head.insertAdjacentHTML('beforeend','<style>body{margin:0;background:#101719;color:#efdfc4;font:14px system-ui}main{max-width:850px;margin:auto;padding:18px}h1{font-size:24px}h2{font-size:14px;text-align:center}nav{display:flex;gap:8px;flex-wrap:wrap}select,button{padding:10px;background:#273137;color:#eee;border:1px solid #78715e;border-radius:8px;min-width:0}button{cursor:pointer}fieldset{border:1px solid #6e654e;border-radius:10px;margin-bottom:16px;padding:12px}.weapon{width:100%;margin:12px 0}.weapon-info{display:flex;align-items:center;gap:12px;margin-bottom:12px}.armor-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.armor-slots label{display:grid;gap:4px}.views{display:grid;grid-template-columns:2fr 1fr;gap:20px}.views section{height:430px;border:1px solid #916d40;border-radius:12px;overflow:hidden}.battle{background-size:cover;background-position:center}.inventory{background:linear-gradient(#b97a342f,#1d232a)}.views .character-figure{height:365px}@media(max-width:600px){.views{gap:8px;grid-template-columns:3fr 2fr}.views section{height:300px}.views .character-figure{height:250px}.armor-slots{grid-template-columns:1fr}}</style>');
createRoot(document.querySelector('#root')).render(<Demo/>);
