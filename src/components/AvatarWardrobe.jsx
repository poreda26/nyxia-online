import {chargeDiamonds,settle,applyEntitlement} from '../utils/diamondCharge';
import {useEffect,useRef,useState} from 'react';
import Avatar from './Avatar';
import {PLAYER_AVATARS,playerAvatarId} from '../data/avatars';
import {AVATAR_FRAMES} from '../data/avatarFrames';
import {avatarPrice,ownsCosmetic,selectCosmetic} from '../utils/avatarCosmetics';
import {useTranslation} from '../i18n/LanguageContext';
export default function AvatarWardrobe({player,setPlayer,onClose}){
 const [chargeError,setChargeError]=useState(false);
 const {lang}=useTranslation(),en=lang==='en',ref=useRef(null);
 const [tab,setTab]=useState('avatar'),[preview,setPreview]=useState(playerAvatarId(player));
 useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close()},[]);
 const frames=tab==='frame',catalog=frames?[{id:null,name:'Çerçevesiz',en:'No frame',price:0},...AVATAR_FRAMES]:PLAYER_AVATARS;
 const chosen=catalog.find(a=>a.id===preview),owned=ownsCosmetic(player,tab,preview),price=owned?0:frames?chosen?.price:avatarPrice(chosen);
 const active=(frames?player.avatarFrameId||null:playerAvatarId(player))===preview&&owned;
 const changeTab=t=>{setTab(t);setPreview(t==='frame'?player.avatarFrameId||null:playerAvatarId(player))};
 return <dialog ref={ref} className="avatar-wardrobe" aria-label={en?'Avatar and frames':'Avatar ve çerçeveler'} onCancel={onClose} onClose={onClose}>
  <header><h2>{en?'Your identity':'Kimliğini özelleştir'}</h2><button aria-label={en?'Close':'Kapat'} onClick={onClose}>✕</button></header>
  <div className="wardrobe-preview"><Avatar player={player} id={frames?playerAvatarId(player):preview} frameId={frames?preview:player.avatarFrameId||null} size={72}/><div><strong>{en?'Diamonds':'Elmas'}: {player.diamonds||0} ◆</strong><p>{en?'Permanent unlock · cosmetic only':'Kalıcı satın alım · yalnızca görünüm'}</p></div></div>
  <div className="wardrobe-tabs"><button aria-pressed={!frames} onClick={()=>changeTab('avatar')}>{en?'Avatars':'Avatarlar'}</button><button aria-pressed={frames} onClick={()=>changeTab('frame')}>{en?'Frames':'Çerçeveler'}</button></div>
  <div className="wardrobe-grid">{catalog.map(a=>{const have=ownsCosmetic(player,tab,a.id),cost=frames?a.price:avatarPrice(a);return <button key={a.id||'none'} aria-label={en?(a.en||a.name):a.name} aria-pressed={a.id===preview} onClick={()=>setPreview(a.id)}><Avatar id={frames?playerAvatarId(player):a.id} frameId={frames?a.id:null} size={48}/><small>{have?(a.id===(frames?player.avatarFrameId||null:playerAvatarId(player))?'✓':en?'Owned':'Sende'):`${cost} ◆`}</small></button>})}</div>
  <footer>{chargeError&&<p role="alert" style={{color:'#E8A5AF',fontSize:12,margin:'0 0 8px'}}>{en?'Purchase failed: check your connection or diamonds.':'Satın alma olmadı: bağlantını ve elmasını kontrol et.'}</p>}<button disabled={!chosen||active||(!owned&&(player.diamonds||0)<price)} onClick={async()=>{setChargeError(false);const dry=selectCosmetic(player,tab,preview);if((player.diamonds||0)>(dry.diamonds||0)){const charge=await chargeDiamonds('avatarCosmetic',`${tab}:${preview}`);if(!charge.ok){if(charge.code!=='BUSY')setChargeError(true);return;}setPlayer(p=>applyEntitlement(selectCosmetic(settle(p,charge),tab,preview),charge.entitlement));}else setPlayer(p=>selectCosmetic(p,tab,preview));}}>{active?(en?'Equipped':'Kuşanıldı'):!owned&&(player.diamonds||0)<price?(en?'Not enough diamonds':'Yetersiz elmas'):owned?(en?'Equip':'Kuşan'):`${price} ◆ · ${en?'Buy & equip':'Satın al ve kuşan'}`}</button></footer>
 </dialog>;
}
