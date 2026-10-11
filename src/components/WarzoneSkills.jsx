import {classSkills} from '../utils/skills';
import SkillIcon from './SkillIcon';
import {useTranslation} from '../i18n/LanguageContext';
export default function WarzoneSkills({player,state={},onUse,disabled=false}){
 const {t}=useTranslation(),skills=classSkills(player.class);
 return <div className="warzone-skills" aria-label={t('extra.warzoneSkillsAria')}>{(player.skills?.loadout||[]).map((id,i)=>{
  const s=skills.find(s=>s.id===id&&player.skills?.known?.includes(id));if(!s)return null;
  const cd=state.skillCooldowns?.[id]||0;
  return <button key={i} disabled={disabled||cd>0||player.mp<s.mpCost} onClick={()=>onUse(id)} title={`${t(`character.skills.${s.id}.name`)} · ${s.mpCost} MP`}><SkillIcon skill={s} effectType={s.effect.type} size={30}/><span>{t(`character.skills.${s.id}.name`)}</span><small>{cd?t('extra.turnsShort',{n:cd}):`${s.mpCost} MP`}</small></button>;
 })}<small>{t('extra.warzoneSkillsHint')}</small></div>;
}
