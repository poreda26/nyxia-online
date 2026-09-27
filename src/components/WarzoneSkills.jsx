import {classSkills} from '../utils/skills';
import SkillIcon from './SkillIcon';
export default function WarzoneSkills({player,state={},onUse,disabled=false}){
 const skills=classSkills(player.class);
 return <div className="warzone-skills" aria-label="Savaş Alanı becerileri">{(player.skills?.loadout||[]).map((id,i)=>{
  const s=skills.find(s=>s.id===id&&player.skills?.known?.includes(id));if(!s)return null;
  const cd=state.skillCooldowns?.[id]||0;
  return <button key={i} disabled={disabled||cd>0||player.mp<s.mpCost} onClick={()=>onUse(id)} title={`${s.name} · ${s.mpCost} MP`}><SkillIcon skill={s} effectType={s.effect.type} size={30}/><span>{s.name}</span><small>{cd?`${cd} tur`:`${s.mpCost} MP`}</small></button>;
 })}<small>Becerilerini Karakter → Beceriler bölümünden kuşan.</small></div>;
}
