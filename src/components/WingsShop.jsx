import {useState} from 'react';
import {Gem,Check} from 'lucide-react';
import {WINGS} from '../data/wings';
import {buyWings} from '../utils/wings';
import {useTranslation,formatReason} from '../i18n/LanguageContext';
import CharacterFigure from './CharacterFigure';
import WingArt from './WingArt';

export default function WingsShop({player,setPlayer,pushToast}) {
  const {t,lang}=useTranslation();
  const [selected,setSelected]=useState(player.equipped.wings?.wingId||WINGS[0].id);
  const [confirm,setConfirm]=useState(false);
  const wing=WINGS.find(w=>w.id===selected);
  const owned=[...player.inventory,player.equipped.wings].some(i=>i?.kind==='wings'&&i.wingId===selected);
  const name=lang==='tr'?wing.name:wing.nameEn;
  const purchase=()=>{
    const result=buyWings(player,selected);
    setConfirm(false);
    if(!result.bought){pushToast(formatReason(t,result,'shop.purchaseFailed'),'warn');return;}
    setPlayer(result.player);
    pushToast(lang==='tr'?`${name} çantana eklendi. Envanterden kuşanabilirsin.`:`${name} added to your bag. Equip it from Inventory.`,'loot');
  };
  return <section className="wings-shop" style={{'--wing-color':wing.color}}>
    <div className="wing-preview"><span>{lang==='tr'?'KARAKTERİNDE DENE':'TRY IT ON'}</span><CharacterFigure player={{...player,equipped:{...player.equipped,wings:{kind:'wings',wingId:selected}}}} align="xMidYMid meet"/><div className="wing-preview-ring"/></div>
    <h3>{name}</h3><p>{lang==='tr'?'Tüm sınıflar ve ırklar · Kalıcı kanat':'Every class and race · Permanent wings'}</p>
    <div className="wing-choices">{WINGS.map(w=><button key={w.id} aria-label={lang==='tr'?w.name:w.nameEn} aria-pressed={selected===w.id} style={{'--wing-color':w.color}} onClick={()=>{setSelected(w.id);setConfirm(false);}}><WingArt wingId={w.id}/><span>{lang==='tr'?w.name:w.nameEn}</span></button>)}</div>
    <div className="wing-bonuses"><span><b>+5%</b> EXP</span><span><b>+5%</b> Drop</span><span><b>+3%</b> ATK</span><span><b>+3</b> {lang==='tr'?'Tüm statlar':'All stats'}</span></div>
    <p className="wing-fineprint">{lang==='tr'?'Bonuslar yalnızca kuşanıldığında geçerlidir. Renkler aynı güce sahiptir. Yükseltilemez, satılamaz.':'Bonuses apply only while equipped. Every colour has equal power. Cannot be upgraded or sold.'}</p>
    {confirm?<div className="wing-purchase-confirm"><p>{lang==='tr'?`${name} için ${wing.price} elmas harcansın mı?`:`Spend ${wing.price} diamonds on ${name}?`}</p><button onClick={purchase}>{lang==='tr'?'Satın al':'Buy'}</button><button onClick={()=>setConfirm(false)}>{lang==='tr'?'Vazgeç':'Cancel'}</button></div>:<button className="wing-buy" disabled={owned||player.diamonds<wing.price} onClick={()=>setConfirm(true)}>{owned?<><Check size={16}/>{lang==='tr'?'Sahipsin':'Owned'}</>:<><Gem size={16}/>{wing.price.toLocaleString()} · {player.diamonds<wing.price?(lang==='tr'?'Yetersiz elmas':'Not enough diamonds'):(lang==='tr'?'Satın al':'Buy')}</>}</button>}
  </section>;
}
