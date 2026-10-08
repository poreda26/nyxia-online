import {clanAllowed} from '../data/clanPermissions';
import {useRetreatGuard} from '../utils/useRetreatGuard';
import {confirmRetreat} from '../utils/confirmRetreat';
import { playHit, playMiss, playHurt, playPotion, playSkill } from "../audio/sfx";
import {usePotion,bestAvailablePotionTier} from '../utils/potions';
import {getActiveCharacterKey} from '../utils/api';
import EncounterScreen from './EncounterScreen';
import SkillIcon from './SkillIcon';
import {classSkills} from '../utils/skills';
import BattleScene from './BattleScene';
import {prepareWarzoneAction} from '../utils/warzoneCombat';
import './WarzoneTab.css';
import { useState, useEffect, useRef, useCallback } from "react";
import { Swords, Lock, Users, ScrollText, Heart, Zap, Sword, Plus, ArrowLeft, Castle } from "./icons/GameIcons";
import { styles } from "../styles";
import DungeonEncounter from './DungeonEncounter';
import { useTranslation, formatServerError } from "../i18n/LanguageContext";
import { fetchClanDungeon, enterClanDungeon, attackClanDungeon, leaveClanDungeon, fetchClanDungeonLog } from "../services/clanService";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, rollHit, varyDamage } from "../utils/combat";
import { wingDexBonus } from "../data/wings";
import { applyDeathPenalty,armorSetDamageReduction,playerMaxHp,playerMaxMp } from "../utils/player";
import { addItemToInventory, makeClanMaterialStack } from "../utils/inventory";
import { CLAN_DUNGEON_MATERIALS, MID_BOSS_INDEX, FINAL_BOSS_INDEX } from "../data/clanDungeon";

const fmtClock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const fmtNum = (n) => Math.round(n).toLocaleString("tr-TR");

// Klan Dungeon (Clan Raid) — kullanıcının pasted spec'i. Hasar bu oyunun geri
// kalanıyla AYNI güven sınırında: istemci BattleTab'daki gerçek iki taraflı
// çarpışma formülüyle hasarı hesaplıyor, sunucu sadece akla yatkın bir üst
// sınırla (aşama HP'sinin yarısı) kabul ediyor ve paylaşımlı HP/aşama/kilit
// kaydını otoriter tutuyor. Bir "giriş" tek canavarla sınırlı değil — oyuncu
// ayrılana/ölene/zaman aşımına uğrayana kadar aynı kilitle ardışık aşamalara
// devam eder (bkz. server/app.mjs'teki aynı not).
export default function ClanDungeonPanel({ player, setPlayer, act, cls, atk, def, pushToast }) {
  const { t, lang } = useTranslation();
  const [state, setState] = useState(null);
  useRetreatGuard(!!state?.lockedByMe,lang);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [effects,setEffects]=useState({});
  const [visual,setVisual]=useState({id:0,type:null});
  const [entering,setEntering]=useState(false);
  const [defeated,setDefeated]=useState(false);
  const lastAttack=useRef(0);
  const attackingRef = useRef(false);
  const stateRef = useRef(null);
  const characterKeyRef=useRef(getActiveCharacterKey());
  stateRef.current = state;

  const refresh = useCallback(async () => {
    try {
      const [nextState, nextLog] = await Promise.all([fetchClanDungeon(), fetchClanDungeonLog()]);
      setState(nextState);
      if(!nextState.lockedByMe)setDefeated(false);
      setLog(nextLog);
    } catch { /* geçici ağ hatası — bir sonraki periyotta tekrar dener */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  // Kullanıcı isteği: "Klan panelinde canavarın can barı canlı dolsun/
  // boşalsın" — websocket yok, bu yüzden sık polling ile "canlı" hissi
  // taklit ediliyor (eskiden 6sn'deydi, çok daha çabuk hissettirsin diye 3sn'ye indirildi).
  useEffect(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  // Kilit sayacı (bkz. dungeonLockCountdown) saniyede bir tazeleniyor —
  // sunucudan tekrar veri çekmiyor, sadece Date.now()'a göre yeniden çiziyor
  // (aynı desen ClanTab.jsx'teki Klan Boss geri sayımında da var).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!state?.lockedUntil) return;
    const id = setInterval(() => forceTick((tk) => tk + 1), 1000);
    return () => clearInterval(id);
  }, [state?.lockedUntil]);

  // Sekmeden çıkarken (ScreenPanel'in key={tab} ile yeniden mount etmesi
  // yüzünden) kilidi elde tutuyorsak sunucuya bırakıyoruz — yoksa klanın
  // geri kalanı 5 dakikalık zaman aşımı dolana kadar bekler.
  useEffect(() => () => {
    if (stateRef.current?.lockedByMe) leaveClanDungeon(characterKeyRef.current).catch(() => {});
  }, []);

  useEffect(()=>{setEffects({});setVisual({id:0,type:null});},[state?.stageIndex]);
  const handleEnter = async () => {
    if (busy) return;
    setBusy(true);
    try { setEntering(true);await enterClanDungeon(); await refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); await refresh(); }
    finally { setBusy(false);setEntering(false); }
  };

  const handleLeave = async () => {
    if (busy || !(await confirmRetreat(lang))) return;
    setBusy(true);
    try { await leaveClanDungeon(); await refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
    finally { setBusy(false); }
  };

  // Sunucu ekonomisinde klan zindanı vuruşu: istemci yalnızca eylemi (saldır/beceri/pot) bildirir; hasarı, canavarın
  // karşılığını, aşınmayı, harcanan potu ve ölümü sunucu savaş motoru hesaplar (bkz. src/game/shared.js).
  const handleAttackServer = async (actionId=null) => {
    if(defeated||attackingRef.current||!state?.lockedByMe||player.hp<=0||Date.now()-lastAttack.current<900)return;
    const stageMon=state.stage;
    const potionKind=actionId==='potion_hp'?'hp':actionId==='potion_mp'?'mp':null;
    const skillId=potionKind?null:actionId;
    if(potionKind&&(effects.potionCooldowns?.[potionKind]||0)>0)return;
    const skill=skillId?classSkills(player.class).find(x=>x.id===skillId):null;
    attackingRef.current=true;setBusy(true);lastAttack.current=Date.now();
    try{
      const res=await attackClanDungeon({action:potionKind?{type:'potion',kind:potionKind}:skillId?{type:'skill',id:skillId}:{type:'attack'}});
      if(res.ok===false){
        const key={skillCooldown:'battle.skillOnCooldown',noMana:'battle.notEnoughMana',potionCooldown:'battle.potionOnCooldown',noPotion:'battle.noPotionsLeft'}[res.reason];
        if(key)pushToast(t(key),'warn');
        return;
      }
      act.applyServerPatch(res.shared);
      const r=res.shared.result;
      let outgoing=null,incoming=null;
      for(const ev of r.events){
        if(ev.kind==='attack'){outgoing={hit:ev.hit,crit:ev.crit,damage:ev.dmg};if(ev.hit)playHit({crit:ev.crit,cls:player.class});else playMiss();}
        else if(ev.kind==='skill'){outgoing={hit:true,heal:ev.effect==='heal',damage:ev.effect==='heal'?ev.healed:ev.dmg||0};playSkill(skill,player.class);}
        else if(ev.kind==='potion'){playPotion();if(ev.potion==='hp'&&ev.healed>0)outgoing={hit:true,heal:true,damage:ev.healed};}
        else if(ev.kind==='monster'){incoming={hit:ev.hit,damage:ev.dmg};if(ev.hit)playHurt();else playMiss();}
      }
      if(res.droppedMaterial){await act('clan/claimMaterials');pushToast(t('clan.toastMaterialDropped',{material:CLAN_DUNGEON_MATERIALS[res.droppedMaterial].name}),'loot');}
      if(res.stageCleared)pushToast(res.completed?t('clan.toastDungeonCompleted'):t('clan.toastStageCleared',{index:state.stageIndex}),'loot');
      setEffects({skillCooldowns:r.skillCooldowns,buffs:r.buffs,dot:r.dot,potionCooldowns:r.potionCooldowns});
      setVisual({id:Date.now(),skillId,label:skill?.name||(potionKind?(potionKind==='hp'?'Can İksiri':'Mana İksiri'):t('clan.dungeonAttackBtn')),type:potionKind?'potion':skill?.effect.type||'attack',outgoing,incoming});
      setPlayer(p=>({...p,hp:r.died?playerMaxHp(p):r.hp,mp:r.died?playerMaxMp(p):r.mp}));
      if(r.died){setDefeated(true);pushToast(t('clan.toastDefeated'),'warn');await leaveClanDungeon();}
      await refresh();
    }catch(error){pushToast(formatServerError(t,error),'warn');await refresh();}
    finally{attackingRef.current=false;setBusy(false);}
  };

  const handleAttack = async (actionId=null) => {
    if(act.isServer())return handleAttackServer(actionId);
    if(defeated||attackingRef.current||!state?.lockedByMe||player.hp<=0||Date.now()-lastAttack.current<900)return;
    const stageMon=state.stage;
    const potionKind=actionId==='potion_hp'?'hp':actionId==='potion_mp'?'mp':null;
    const skillId=potionKind?null:actionId;
    let potion=null;
    if(potionKind){
      if((effects.potionCooldowns?.[potionKind]||0)>0)return;
      const tier=bestAvailablePotionTier(player,potionKind);
      if(!tier||player[potionKind]>=(potionKind==='hp'?playerMaxHp(player):playerMaxMp(player)))return;
      // Tüketilen pot sunucuda düşer; can/mana burada uygulanır (bkz. BattleTab#handlePotion).
      attackingRef.current=true;
      const used=await act('battle/potion',{kind:potionKind,hp:player.hp,mp:player.mp});
      attackingRef.current=false;
      if(!used.ok){pushToast(t(used.reason==='network'?'battle.actionFailed':'battle.noPotionsLeft'),'warn');return;}
      potion={healed:used.healed,player:{...used.nextPlayer,[potionKind]:Math.min(potionKind==='hp'?playerMaxHp(player):playerMaxMp(player),player[potionKind]+used.healed)}};
    }
    const action=prepareWarzoneAction(potion?.player||player,{...stageMon,hp:state.monsterHp,maxHp:stageMon.hp},effects,skillId);
    if(action.error){pushToast(action.error,'warn');return;}
    attackingRef.current=true;setBusy(true);lastAttack.current=Date.now();
    try{
      const playerDex=player.stats.dex+wingDexBonus(player),isCrit=Math.random()<cls.crit;
      const hit=!!skillId||rollHit(playerDex,stageMon.atk,player.level);
      const basic=skillId||potionKind?0:hit?varyDamage(mitigate((cls.atk+atk*.9)*action.atkMult*(isCrit?1.8:1),stageMon.def,MONSTER_DEF_K)):0;
      const damage=Math.min(Math.max(0,Math.round(basic+action.damage)),Math.floor(stageMon.hp*.5));
      const res=await attackClanDungeon(damage);
      const enemyHit=!res.stageCleared&&rollHit(stageMon.atk,playerDex,player.level);
      const incoming=enemyHit?Math.max(1,Math.round(mitigate(stageMon.atk,def*action.defMult,PLAYER_DEF_K)*(1-armorSetDamageReduction(player,"monster")))):0;
      let next={...action.player,hp:Math.max(0,action.player.hp-incoming)};
      if(res.droppedMaterial){
        // Sunucu ekonomisinde düşen malzeme sunucuda beklemeye alınır, eylemle verilir; eski yolda burada eklenir.
        if(act.isServer()){await act('clan/claimMaterials');}else{setPlayer(p=>addItemToInventory(p,makeClanMaterialStack(res.droppedMaterial,1)).player);}
        pushToast(t('clan.toastMaterialDropped',{material:CLAN_DUNGEON_MATERIALS[res.droppedMaterial].name}),'loot');}
      if(res.stageCleared)pushToast(res.completed?t('clan.toastDungeonCompleted'):t('clan.toastStageCleared',{index:state.stageIndex}),'loot');
      const potionCooldowns=Object.fromEntries(Object.entries(effects.potionCooldowns||{}).map(([k,v])=>[k,Math.max(0,v-1)]));
      if(potionKind)potionCooldowns[potionKind]=2;
      setEffects({...action.state,potionCooldowns});
      setVisual({id:Date.now(),skillId,label:action.skill?.name||(potionKind?(potionKind==='hp'?'Can İksiri':'Mana İksiri'):t('clan.dungeonAttackBtn')),type:potionKind?'potion':action.skill?.effect.type||'attack',outgoing:{hit,crit:isCrit&&!skillId&&!potionKind,damage:potion?.healed||action.heal||Math.min(damage,state.monsterHp),heal:!!potionKind||action.heal>0},incoming:res.stageCleared?null:{hit:enemyHit,damage:incoming}});
      const died=next.hp<=0;
      if(died){await act('battle/death',{wear:{}});next={...next,hp:playerMaxHp(next),mp:playerMaxMp(next)};setDefeated(true);pushToast(t('clan.toastDefeated'),'warn');}
      // Yalnızca canlı can/mana yazılır; envanter/XP değişimleri eylemlerin yamasıyla zaten uygulandı.
      setPlayer(p=>({...p,hp:next.hp,mp:next.mp}));
      if(died)await leaveClanDungeon();
      await refresh();
    }catch(error){pushToast(formatServerError(t,error),'warn');await refresh();}
    finally{attackingRef.current=false;setBusy(false);}
  };

  if (!state) return <div className="clan-status" role="status">{lang === "en" ? "Loading dungeon…" : "Zindan yükleniyor…"}</div>;

  const { stage, monsterHp, completed, locked, lockedByMe, lockedByName, lockedUntil, attempts, stageIndex, totalStages } = state;
  const lockRemainingMs = lockedUntil ? Math.max(0, lockedUntil - Date.now()) : 0;

  const inFight = lockedByMe && !completed;
  const fightDisabled = defeated || busy || player.hp <= 0;
  const bossId = stage?.isFinalBoss ? "dungeon_crimson_battlefront_boss" : stage?.isMidBoss ? "dungeon_ruined_sanctuary_boss" : undefined;
  const fightMonster = { ...stage, visualSourceId: bossId, id: bossId || `dungeon_ashen_canyon_${stageIndex}` };

  const logLine = (entry) => {
    if (!entry.killed) return t("clan.dungeonLogHit", { name: entry.name, stage: entry.stageIndex, damage: fmtNum(entry.damage) });
    const isBoss = entry.stageIndex === MID_BOSS_INDEX || entry.stageIndex === FINAL_BOSS_INDEX;
    return t(isBoss ? "clan.dungeonLogKillBoss" : "clan.dungeonLogKill", { name: entry.name, stage: entry.stageIndex });
  };

  return (
    <div className="rpg-card" style={styles.itemDetailCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Swords size={18} color="#C9425A" strokeWidth={1.6} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 }}>{t("clan.dungeonTitle")}</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.dungeonDesc")}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        <span>{t("clan.dungeonStageLabel", { index: Math.min(stageIndex, totalStages), total: totalStages })}</span>
        <span>{t("clan.dungeonEntriesLeft", { count: attempts.entriesLeft })}</span>
      </div>

      {entering&&<EncounterScreen title={lang==='en'?'Entering dungeon':'Zindana giriliyor'} busy onLeave={()=>{}}><p className="encounter-status">{lang==='en'?'Waiting for the server…':'Sunucudan giriş onayı bekleniyor…'}</p></EncounterScreen>}
      {inFight && (
        <div className="battle-mobile" style={styles.battleArena}>
          <BattleScene player={player} monster={fightMonster} battle={{ monsterHp, monsterMaxHp: stage.hp }} map={{ name: lang === "en" ? "Clan Dungeon" : "Klan Zindanı" }} visual={visual} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#A34FD914", border: "1px solid #A34FD944" }}>
            <span style={{ fontSize: 11, color: "#A34FD9", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5 }}>
              <Castle size={12} /> {t("battle.dungeonStage", { current: Math.min(stageIndex, totalStages), total: totalStages })}
            </span>
            <span style={{ fontSize: 10, color: "var(--gold-text)", fontFamily: "var(--font-mono)" }}>{stage.isBoss ? t("battle.boss") : fmtClock(lockRemainingMs)}</span>
          </div>
          <details className="battle-history"><summary>{t("battle.combatLog")} · {log.length ? logLine(log[0]) : (visual.label || t("battle.readyForBattle"))}</summary>
            <div style={styles.combatLog}>{log.map((entry) => <div key={entry.id} style={styles.combatLogLine}>{logLine(entry)}</div>)}</div>
          </details>

          <div className="battle-skill-dock" aria-label={t("battle.skillsAriaLabel")} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
            {player.skills.loadout.map((skillId, i) => {
              if (!skillId) {
                return (
                  <div key={i} className="rpg-slot" style={{ ...styles.equipSlotCard, opacity: 0.4 }}>
                    <Plus size={12} color="var(--text-faint)" /><span className="battle-slot-label">{t("battle.empty")}</span>
                  </div>
                );
              }
              const skill = classSkills(player.class).find((sk) => sk.id === skillId);
              if (!skill) return null;
              const cdLeft = effects.skillCooldowns?.[skillId] || 0;
              const disabled = cdLeft > 0 || player.mp < skill.mpCost || fightDisabled;
              const skillLabel = t(`character.skills.${skill.id}.name`);
              return (
                <button
                  key={i}
                  className="rpg-slot" style={{ ...styles.equipSlotCard, borderColor: `${cls.color}66`, background: `${cls.color}12`, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}
                  onClick={() => handleAttack(skillId)}
                  disabled={disabled}
                  title={`${skillLabel} — MP ${skill.mpCost}`}
                >
                  <SkillIcon skill={skill} effectType={skill.effect.type} size={22} color={cls.color} /><span className="battle-slot-label">{skillLabel}</span>
                  <div style={{ fontSize: 7, marginTop: 2, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    {cdLeft > 0 ? cdLeft : `${skill.mpCost}mp`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="battle-action-dock" style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: fightDisabled ? 0.5 : 1 }} onClick={() => handleAttack()} disabled={fightDisabled}>
              <Sword size={15} /> {t("battle.attack")}
            </button>
            {[["hp", Heart, "#C9425A"], ["mp", Zap, "#4FC3D9"]].map(([kind, Icon, color]) => {
              const cooldown = effects.potionCooldowns?.[kind] || 0;
              const off = fightDisabled || cooldown > 0 || !bestAvailablePotionTier(player, kind) || player[kind] >= (kind === "hp" ? playerMaxHp(player) : playerMaxMp(player));
              const count = player.inventory.filter((i) => i.kind === "potion" && i.potionType === kind).reduce((n, i) => n + (i.count || 0), 0);
              return (
                <button key={kind} style={{ ...styles.potionBtn, opacity: off ? 0.5 : 1 }} onClick={() => handleAttack("potion_" + kind)} disabled={off}>
                  <Icon size={14} color={color} /> {cooldown > 0 ? cooldown : count}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <button style={{ ...styles.ghostBtn, flex: 1 }} onClick={handleLeave} disabled={busy}>
              <ArrowLeft size={13} /> {t("battle.retreat")}
            </button>
          </div>
        </div>
      )}
      {stage&&!inFight&&<DungeonEncounter stage={stage} hp={monsterHp} index={stageIndex} total={totalStages} completed={completed}/>}
      {completed ? (
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>{t("clan.dungeonCompletedToday")}</div>
      ) : locked && !lockedByMe ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <Lock size={13} /> {t("clan.dungeonLockedBy", { name: lockedByName })}
          </div>
          {lockRemainingMs > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              {t("clan.dungeonLockCountdown", { time: fmtClock(lockRemainingMs) })}
            </div>
          )}
        </div>
      ) : lockedByMe ? null : (
        <>
          {attempts.entriesLeft === 0 ? (
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>
              {attempts.cooldownRemainingMs > 0 ? t("clan.dungeonCooldownLabel", { time: fmtClock(attempts.cooldownRemainingMs) }) : t("clan.dungeonNoEntriesLeft")}
            </div>
          ) : (
            <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(busy ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }} disabled={busy||!clanAllowed(player.clan?.role,player.clan?.permissions,'dungeon')} onClick={handleEnter}>
              <Users size={12} /> {t("clan.dungeonEnterBtn")}
            </button>
          )}
        </>
      )}

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-faint)", marginBottom: 6 }}>
          <ScrollText size={12} /> {t("clan.dungeonLogTitle")}
        </div>
        {log.length === 0 ? (
          <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("clan.dungeonLogEmpty")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
            {log.map((entry) => (
              <div key={entry.id} style={{ fontSize: 10, color: entry.killed ? "var(--gold-text)" : "var(--text-muted)", lineHeight: 1.5 }}>
                {logLine(entry)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
