import {usePotion,bestAvailablePotionTier} from '../utils/potions';
import {getActiveCharacterKey} from '../utils/api';
import EncounterScreen from './EncounterScreen';
import BattleScene from './BattleScene';
import WarzoneSkills from './WarzoneSkills';
import {prepareWarzoneAction} from '../utils/warzoneCombat';
import './WarzoneTab.css';
import { useState, useEffect, useRef, useCallback } from "react";
import { Swords, Lock, Users, ScrollText, Heart, Zap } from "lucide-react";
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
export default function ClanDungeonPanel({ player, setPlayer, cls, atk, def, pushToast }) {
  const { t, lang } = useTranslation();
  const [state, setState] = useState(null);
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
    if (busy) return;
    setBusy(true);
    try { await leaveClanDungeon(); await refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
    finally { setBusy(false); }
  };

  const handleAttack = async (actionId=null) => {
    if(defeated||attackingRef.current||!state?.lockedByMe||player.hp<=0||Date.now()-lastAttack.current<900)return;
    const stageMon=state.stage;
    const potionKind=actionId==='potion_hp'?'hp':actionId==='potion_mp'?'mp':null;
    const skillId=potionKind?null:actionId;
    let potion=null;
    if(potionKind){
      if((effects.potionCooldowns?.[potionKind]||0)>0)return;
      const tier=bestAvailablePotionTier(player,potionKind);
      if(!tier||player[potionKind]>=(potionKind==='hp'?playerMaxHp(player):playerMaxMp(player)))return;
      potion=usePotion(player,potionKind,tier);if(potion.reason)return;
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
      if(res.droppedMaterial){next=addItemToInventory(next,makeClanMaterialStack(res.droppedMaterial,1)).player;pushToast(t('clan.toastMaterialDropped',{material:CLAN_DUNGEON_MATERIALS[res.droppedMaterial].name}),'loot');}
      if(res.stageCleared)pushToast(res.completed?t('clan.toastDungeonCompleted'):t('clan.toastStageCleared',{index:state.stageIndex}),'loot');
      const potionCooldowns=Object.fromEntries(Object.entries(effects.potionCooldowns||{}).map(([k,v])=>[k,Math.max(0,v-1)]));
      if(potionKind)potionCooldowns[potionKind]=2;
      setEffects({...action.state,potionCooldowns});
      setVisual({id:Date.now(),skillId,label:action.skill?.name||(potionKind?(potionKind==='hp'?'Can İksiri':'Mana İksiri'):t('clan.dungeonAttackBtn')),type:potionKind?'potion':action.skill?.effect.type||'attack',outgoing:{hit,crit:isCrit&&!skillId&&!potionKind,damage:potion?.healed||action.heal||Math.min(damage,state.monsterHp),heal:!!potionKind||action.heal>0},incoming:res.stageCleared?null:{hit:enemyHit,damage:incoming}});
      const died=next.hp<=0;
      if(died){next=applyDeathPenalty(next).player;setDefeated(true);pushToast(t('clan.toastDefeated'),'warn');}
      setPlayer(next);
      if(died)await leaveClanDungeon();
      await refresh();
    }catch(error){pushToast(formatServerError(t,error),'warn');await refresh();}
    finally{attackingRef.current=false;setBusy(false);}
  };

  if (!state) return <div className="clan-status" role="status">{lang === "en" ? "Loading dungeon…" : "Zindan yükleniyor…"}</div>;

  const { stage, monsterHp, completed, locked, lockedByMe, lockedByName, lockedUntil, attempts, stageIndex, totalStages } = state;
  const lockRemainingMs = lockedUntil ? Math.max(0, lockedUntil - Date.now()) : 0;

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
      {lockedByMe&&!completed&&<EncounterScreen title={stage.name} onLeave={handleLeave} busy={busy}><div className="battle-mobile"><BattleScene player={player} monster={{...stage,visualSourceId:stage.isFinalBoss?'dungeon_crimson_battlefront_boss':stage.isMidBoss?'dungeon_ruined_sanctuary_boss':undefined,id:stage.isFinalBoss?'dungeon_crimson_battlefront_boss':stage.isMidBoss?'dungeon_ruined_sanctuary_boss':`dungeon_ashen_canyon_${stageIndex}`}} battle={{monsterHp,monsterMaxHp:stage.hp}} map={{name:lang==='en'?'Clan Dungeon':'Klan Zindanı'}} visual={visual}/></div><WarzoneSkills player={player} state={effects} onUse={handleAttack} disabled={defeated||busy||player.hp<=0}/><button className="rpg-action" style={{...styles.primaryBtn,background:cls.color,width:'100%',marginTop:14}} disabled={defeated||busy||player.hp<=0} onClick={()=>handleAttack()}><Swords size={16}/>{t('clan.dungeonAttackBtn')}</button><div style={{display:'flex',gap:8,marginTop:10}}>{['hp','mp'].map(kind=><button key={kind} style={{...styles.potionBtn,flex:1}} disabled={defeated||busy||player.hp<=0||!bestAvailablePotionTier(player,kind)||(effects.potionCooldowns?.[kind]||0)>0||player[kind]>=(kind==='hp'?playerMaxHp(player):playerMaxMp(player))} onClick={()=>handleAttack('potion_'+kind)}>{kind==='hp'?<Heart size={15}/>:<Zap size={15}/>} {kind.toUpperCase()} {(effects.potionCooldowns?.[kind]||0)>0?`${effects.potionCooldowns[kind]} tur`:player.inventory.filter(i=>i.kind==='potion'&&i.potionType===kind).reduce((n,i)=>n+(i.count||0),0)}</button>)}</div><p className="encounter-status">{stageIndex} / {totalStages} · {fmtClock(lockRemainingMs)}</p></EncounterScreen>}
      {stage&&<DungeonEncounter stage={stage} hp={monsterHp} index={stageIndex} total={totalStages} completed={completed}/>}
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
      ) : lockedByMe ? (
        <p className="encounter-status">{lang==='en'?'Battle in progress':'Karşılaşma devam ediyor'}</p>
      ) : (
        <>
          {attempts.entriesLeft === 0 ? (
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>
              {attempts.cooldownRemainingMs > 0 ? t("clan.dungeonCooldownLabel", { time: fmtClock(attempts.cooldownRemainingMs) }) : t("clan.dungeonNoEntriesLeft")}
            </div>
          ) : (
            <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(busy ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }} disabled={busy} onClick={handleEnter}>
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
