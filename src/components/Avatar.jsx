import FantasyPortrait from './FantasyPortrait';
import PortraitArt from './PortraitArt';
import {useId} from 'react';
import actors from '../assets/battle/actors-v1.png';
import {PLAYER_AVATARS,CLAN_AVATARS,playerAvatarId} from '../data/avatars';
import {useTranslation} from '../i18n/LanguageContext';
import './SocialIdentity.css';
export default function Avatar({id,player,clan=false,size=44,label}){
 const uid=useId(),catalog=clan?CLAN_AVATARS:PLAYER_AVATARS;
 const art=catalog.find(a=>a.id===(id||playerAvatarId(player)))||catalog[0];
 return <span className={`identity-avatar ${clan?'identity-crest':''}`} style={{width:size,height:size,'--identity-color':art.color}} role="img" aria-label={label||art.name} data-avatar={art.id}>
  {clan?<svg viewBox="0 0 100 110" aria-hidden="true"><defs><linearGradient id={uid} x2=".8" y2="1"><stop stopColor="#fff0cc"/><stop offset=".5" stopColor={art.color}/><stop offset="1" stopColor="#6d4b30"/></linearGradient></defs><path d="M9 12L50 3L91 12V62Q87 87 50 105Q13 87 9 62Z" fill="#101824" stroke={`url(#${uid})`} strokeWidth="3"/><path d="M16 19L50 11L84 19V61Q78 82 50 95Q22 82 16 61Z" fill={art.color} fillOpacity=".12" stroke={art.color} strokeOpacity=".4"/><path d={art.path} fill={`url(#${uid})`} fillOpacity=".5" stroke={`url(#${uid})`} strokeWidth="2.7" strokeLinejoin="round"/><path d="M43 88L50 82L57 88L50 95Z" fill={`url(#${uid})`}/></svg>:art.fantasy?<FantasyPortrait art={art} uid={uid}/>:art.portrait?<PortraitArt art={art} uid={uid}/>:<svg viewBox={art.rect.join(' ')} aria-hidden="true"><image href={actors} width="1448" height="1086"/></svg>}
 </span>;
}
export function AvatarPicker({value,onChange,clan=false,disabled=false}){
 const {lang}=useTranslation();
 return <fieldset className={`avatar-picker ${clan?'crest-picker':'portrait-picker'}`} disabled={disabled}><legend>{lang==='en'?(clan?'Choose a clan crest':'Choose your avatar'):(clan?'Klan arması seç':'Avatarını seç')}</legend><div>{(clan?CLAN_AVATARS:PLAYER_AVATARS).map(a=><button type="button" key={a.id} aria-pressed={value===a.id} onClick={()=>onChange(a.id)} aria-label={lang==='en'?(a.en||a.name):a.name} title={lang==='en'?(a.en||a.name):a.name}><Avatar id={a.id} clan={clan} size={52}/>{clan&&<span>{lang==='en'?(a.en||a.name):a.name}</span>}</button>)}</div></fieldset>;
}
export function PlayerAvatarPicker({player,setPlayer}){
 const {lang}=useTranslation();
 return <details className="avatar-customize"><summary><Avatar player={player}/><span>{lang==='en'?'Change avatar':'Avatarı değiştir'}<small>{lang==='en'?`All ${PLAYER_AVATARS.length} avatars are free · tap to choose`:`${PLAYER_AVATARS.length} avatarın tamamı ücretsiz · seçmek için dokun`}</small></span><b>✦</b></summary><AvatarPicker value={playerAvatarId(player)} onChange={avatarId=>setPlayer(p=>({...p,avatarId}))}/></details>;
}
