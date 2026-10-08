import {useRetreatGuard} from '../utils/useRetreatGuard';
import {confirmRetreat} from '../utils/confirmRetreat';
import {askConfirm} from '../utils/gameConfirm';
import { chargeDiamonds, settle, reportChargeFailure } from "../utils/diamondCharge";
import MenuEmblem from './icons/MenuEmblem';
import BattleScene, {hasBattleScene} from './BattleScene';
import { useState, useEffect, useRef } from "react";
import { Lock, Flame, Sword, Heart, Zap, ArrowLeft, Plus, DoorOpen, Bot, Trophy, Castle, Gem } from "./icons/GameIcons";
import MonsterPortrait from './MonsterPortrait';
import { MAPS, findMap, highestUnlockedMap, GATE_TELEPORT_COST } from "../data/maps";
import { isMonsterUnlocked, isMapProgressUnlocked, monsterKillCount, KILLS_TO_UNLOCK_NEXT } from "../utils/mapProgress";
import { buildSoloDungeonStages, buildDungeonStageChoices, SOLO_DUNGEON_DAILY_LIMIT } from "../data/soloDungeon";
import { buildMapBoss } from "../data/mapBosses";
import { canFightMapBoss } from "../utils/mapBoss";
import { playerMaxHp, playerMaxMp, displayClassName, formatGold } from "../utils/player";
import { bestAvailablePotionTier, usePotion } from "../utils/potions";
import { createFight, stepFight, checkAction } from "../game/fight";
import { resolveMonster } from "../game/battle";
import { buyWithDiamonds, purchaseFailureText } from "../utils/diamondBuy";
import { hasAutoBattleAccess } from "../utils/premium";
import { classSkills } from "../utils/skills";
import { dungeonEntriesLeft, canEnterSoloDungeon, consumeDungeonEntry, buyExtraDungeonEntries, hasBoughtExtraDungeonEntryToday } from "../utils/soloDungeon";
import { EXTRA_DUNGEON_ENTRY_COST_DIAMONDS } from "../data/soloDungeon";
import { playHit, playMiss, playHurt, playLevelUp, playSkill, playPotion } from "../audio/sfx";
import { tierName } from "../data/itemRarity";
import { useTranslation } from "../i18n/LanguageContext";
import { accusativeName } from "../utils/turkish";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import BarTrack from "./shared/BarTrack";
import SkillIcon from "./SkillIcon";
import DeathModal from "./DeathModal";
import LevelUpModal from "./LevelUpModal";

// potionCooldowns: her tur bir azalır (bkz. tickBattleEffects) — Can/Mana
// potları 2 turda bir kullanılabilir, ikisi birlikte de basılamaz (bir pot
// kullanmak zaten bir tur harcar, bkz. handlePotion).
const EMPTY_BATTLE_EFFECTS = { skillCooldowns: {}, buffs: [], dot: null, potionCooldowns: { hp: 0, mp: 0 } };
const POTION_COOLDOWN_TURNS = 2;

function buffMultiplier(buffs, stat) {
  return buffs.filter((b) => b.stat === stat).reduce((mult, b) => mult * b.mult, 1);
}

// Otomatik Saldırı için beceri seçimi — düz saldırıdan önce denenir (bkz.
// aşağıdaki auto-battle effect'i). Öncelik sırası: bitirici (canavar eşiğin
// altındaysa) > henüz aktif olmayan bir güçlendirme > en güçlü hasar/DoT
// becerisi. Sadece bekleme süresi dolmuş VE mana yeten becerileri dener;
// hiçbiri uygun değilse null döner ve çağıran düz saldırıya düşer.
function pickAutoSkill({ loadout, playerClass, skillCooldowns, mp, monsterHpPct, buffs }) {
  const usable = loadout
    .filter(Boolean)
    .map((id) => classSkills(playerClass).find((s) => s.id === id))
    .filter((s) => s && (skillCooldowns[s.id] || 0) === 0 && mp >= s.mpCost);
  if (usable.length === 0) return null;

  const execute = usable.find((s) => s.effect.type === "execute" && monsterHpPct <= s.effect.hpPctThreshold);
  if (execute) return execute.id;

  const activeBuffStats = new Set(buffs.map((b) => b.stat));
  const buff = usable.find(
    (s) => (s.effect.type === "buffAtk" && !activeBuffStats.has("atk")) || (s.effect.type === "buffDef" && !activeBuffStats.has("def"))
  );
  if (buff) return buff.id;

  const damage = usable
    .filter((s) => s.effect.type === "damage" || s.effect.type === "dot")
    .sort((a, b) => (b.effect.mult || 1) - (a.effect.mult || 1))[0];
  return damage ? damage.id : null;
}

export default function BattleTab({ player, setPlayer, cls, def, atk, pushToast, act }) {
  const { t, tm, lang } = useTranslation();
  // data/skills.js'in `name` alanı Türkçe kalıyor (CharacterTab.jsx'in
  // t(`character.skills.${skill.id}.name`) yoluyla çevirdiği aynı veri) —
  // savaş ekranındaki beceri kutucukları/loglar da CharacterTab'la tutarlı
  // olsun diye aynı yoldan geçiyor.
  const skillName = (skill) => t(`character.skills.${skill.id}.name`);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const latestPlayer = useRef(player);
  latestPlayer.current = player;
  const [monster, setMonster] = useState(null); // active monster template
  const [battle, setBattle] = useState(null);
  useRetreatGuard(!!monster,lang); // {monsterHp, monsterMaxHp, log, playerHp}
  const [visual, setVisual] = useState({id:0,type:'',label:''});
  const showAction = (type,label,skillId) => setVisual(v => ({id:v.id+1,type,label,skillId}));
  const [shake, setShake] = useState(null); // 'player' | 'monster' | null
  const [pendingMap, setPendingMap] = useState(null); // map awaiting teleport confirmation
  const [deathInfo, setDeathInfo] = useState(null); // { xpLost } | null — drives DeathModal
  const [levelUpInfo, setLevelUpInfo] = useState(null); // { toLevel, statPointsGained, unlockedMap } | null — drives LevelUpModal
  const [victoryMonster, setVictoryMonster] = useState(null); // just-defeated monster template — drives the "Tekrar Savaş?" prompt
  // Günlük Solo Zindan — bkz. data/soloDungeon.js, utils/soloDungeon.js.
  // dungeonRun: { stages, index } | null — aktif bir zindan koşusu sürerken
  // aşama aşama ilerliyor (bkz. resolveMonsterTurn'daki dallanma), null ise
  // normal (haritadaki tekli canavar) savaş akışı işliyor.
  const [dungeonRun, setDungeonRun] = useState(null);
  const [dungeonComplete, setDungeonComplete] = useState(null); // { mapName, bonusGold, chestTier } | null
  const [dungeonChoice, setDungeonChoice] = useState(null); // { nextIndex, choices }
  const logRef = useRef(null);
  // Savaş motoru (game/fight.js): savaş burada oynanır, sunucu aynı tohum ve eylem dizisiyle baştan oynatıp sonucu
  // kendisi hesaplar (`battle/settle`). fightRef: motor durumu, actionsRef: oynanan eylemler, fightMonsterRef: savaşılan canavar.
  const fightRef = useRef(null);
  const actionsRef = useRef([]);
  const fightMonsterRef = useRef(null);
  const startRef = useRef(Promise.resolve());
  const actRef = useRef(act);
  actRef.current = act;
  // Sekmeden çıkarken yarım kalan savaş geri çekilme olarak bildirilir (aşınma ve harcanan potlar sunucuda işlenir).
  useEffect(() => () => {
    const fight = fightRef.current;
    if (fight && !fight.ended && fightMonsterRef.current) {
      actRef.current("battle/settle", { monsterId: fightMonsterRef.current, actions: actionsRef.current.slice() });
    }
    fightRef.current = null;
  }, []);

  // Oyuncunun en son ışınlandığı harita kalıcı — güvenlik amaçlı, artık
  // seviyesinin yetmediği bir haritaya işaret ediyorsa en yüksek açık
  // haritaya düş (normalde hiç olmamalı, bkz. utils/player.js#migratePlayer).
  const map = player.level >= findMap(player.currentMapId).levelMin
    ? findMap(player.currentMapId)
    : highestUnlockedMap(player.level);
  const locked = player.level < map.levelMin;
  const mapBoss = buildMapBoss(map);
  const mapBossCheck = canFightMapBoss(player, map.id);

  // Kapı: farklı bir haritaya geçmek GATE_TELEPORT_COST altın karşılığında —
  // aynı haritaya tekrar tıklamak ya da kilitli bir haritaya tıklamak
  // ücretsiz/etkisiz. Tıklama artık doğrudan ışınlamıyor, önce ücreti
  // gösteren bir onay modalı açıyor (bkz. render'daki pendingMap modalı) —
  // kullanıcının "ücreti belirt ve onay iste" isteği.
  const requestTeleport = (targetMap) => {
    if (player.level < targetMap.levelMin) return;
    const targetIdx = MAPS.findIndex((m) => m.id === targetMap.id);
    if (!isMapProgressUnlocked(player, targetIdx, MAPS)) return;
    if (targetMap.id === player.currentMapId) return;
    setPendingMap(targetMap);
  };

  const confirmTeleport = async () => {
    const targetMap = pendingMap;
    if (!targetMap) return;
    setPendingMap(null);
    const result = await act("map/teleport", { mapId: targetMap.id });
    if (!result.ok) {
      pushToast(result.reason === "notEnoughGold" ? t("battle.gateNeedsGold", { cost: GATE_TELEPORT_COST }) : t("battle.actionFailed"), "warn");
      return;
    }
    pushToast(t("battle.teleported", { map: targetMap.name, cost: GATE_TELEPORT_COST }), "default");
  };

  // Günlük Solo Zindan'a giriş — mevcut haritaya göre ölçeklenen 5 aşama +
  // boss üretir (bkz. data/soloDungeon.js#buildSoloDungeonStages), günlük
  // giriş hakkını hemen düşer (koşu yarıda bırakılsa/kaybedilse bile hak
  // geri gelmez, "günde 3 kez girilebilir" kullanıcı isteğinin doğal
  // sonucu) ve ilk aşamayla normal startBattle akışını başlatır.
  const enterSoloDungeon = async () => {
    if (locked) return;
    const check = canEnterSoloDungeon(player);
    if (!check.ok) { pushToast(t("battle.dungeonEntriesExhausted"), "warn"); return; }
    const stages = buildSoloDungeonStages(map);
    const entry = await act("battle/dungeonEntry");
    if (!entry.ok) { pushToast(t(entry.reason === "entriesExhausted" ? "battle.dungeonEntriesExhausted" : "battle.actionFailed"), "warn"); return; }
    setDungeonRun({ stages, index: 0 });
    startBattle(stages[0]);
  };

  const handleBuyDungeonEntries = async () => {
    if (act.isServer()) {
      const bought = await buyWithDiamonds(act, "dungeonEntry");
      if (!bought.ok) { pushToast(purchaseFailureText(t, bought), "warn"); return; }
      pushToast(t("battle.dungeonEntriesBought"), "loot");
      return;
    }
    const dry = buyExtraDungeonEntries(player);
    if (!dry.bought) {
      pushToast(t(dry.reason === "alreadyBoughtToday" ? "battle.dungeonEntriesAlreadyBoughtToday" : "battle.notEnoughDiamondsForEntries"), "warn");
      return;
    }
    const charge = await chargeDiamonds("dungeonEntry");
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = buyExtraDungeonEntries(settle(player, charge));
    setPlayer(result.player);
    pushToast(t("battle.dungeonEntriesBought"), "loot");
  };

  const chooseDungeonPath = (nextStage) => {
    if (!dungeonRun || !dungeonChoice) return;
    const nextIndex = dungeonChoice.nextIndex;
    setDungeonChoice(null);
    setDungeonRun({ ...dungeonRun, index: nextIndex });
    pushToast(nextStage.risk ? t("battle.riskyChosen") : t("battle.safeChosen"), "default");
    startBattle(nextStage, { preserveAutoBattle: true });
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battle?.log?.length]);

  // Guards the "attack spam" bug: without this, rapid clicks fired several
  // attack() calls before React committed the monster's death, so a single
  // burst of clicks could trigger loot/level-up multiple times off one kill
  // (or land hits on a monster that was already dead). attackLockRef blocks
  // re-entrant calls synchronously; battle.finished blocks any call that
  // arrives after the kill/defeat is already resolved but before the arena
  // closes.
  const attackLockRef = useRef(false);

  // Bir canavarı ELLE seçmek her zaman Otomatik Saldırı'yı kapalı başlatır
  // (ilk savaşa elle başlanmalı, kullanıcı isteği). Ama "Tekrar Savaş?"
  // sorusuna Evet dendiğinde (preserveAutoBattle: true) önceki açık durum
  // korunur — Hayır dendiğinde ya da savaştan çıkıldığında zaten ayrıca
  // kapatılıyor (bkz. victoryMonster modalı ve endBattle).
  //
  // HP/MP her yeni savaşın başında tam doluyor — önceden sadece bir
  // öldürmenin ARDINDAN doluyordu (bkz. applyLoot), Geri Çekil ile canı az
  // kaçıp yeni bir savaşa girmek o düşük canı taşıyordu (kullanıcının
  // bildirdiği bug). Artık nereden geliniyorsa gelinsin (fresh seçim ya da
  // Tekrar Savaş) her yeni savaş dolu can/manayla başlıyor.
  const startBattle = (m, { preserveAutoBattle = false } = {}) => {
    if(m.mapBoss){const gate=canFightMapBoss(latestPlayer.current,map.id);if(!gate.ok){pushToast(t(gate.reason==='mapIncomplete'?'battle.bossMapIncomplete':'battle.bossDefeatedToday'), 'warn');return;}}
    // Savaşı sunucuya bildir: ödül yalnızca bildirilmiş bir savaş için verilir ve savaşın tohumunu sunucu verir
    // (ilk eylem tohum gelene kadar bekler). Reddedilirse (kilitli canavar, zindan sırası...) savaş hemen kapanır.
    fightRef.current = null;
    actionsRef.current = [];
    fightMonsterRef.current = m.id;
    attackLockRef.current = true;
    const started = act("battle/start", { monsterId: m.id });
    startRef.current = started;
    started.then((r) => {
      if (!mountedRef.current) return;
      if (!r.ok || !Number.isInteger(r.seed)) {
        attackLockRef.current = false;
        setMonster(null);
        setBattle(null);
        setDungeonRun(null);
        pushToast(t(r.reason === "tooManyRetreats" ? "battle.tooManyRetreats" : "battle.actionFailed"), "warn");
        return;
      }
      if (r.abandoned) pushToast(t("battle.abandonedPenalty", { xp: r.xpLost || 0 }), "warn");
      fightRef.current = createFight(latestPlayer.current, resolveMonster(m.id)?.monster || m, r.seed);
      attackLockRef.current = false;
    });
    setMonster(m);
    setVisual({id:0,type:'',label:''});
    setBattle({
      monsterHp: m.hp,
      monsterMaxHp: m.hp,
      finished: false,
      log: [t("battle.log.appeared", { monster: tm(m) })],
      ...EMPTY_BATTLE_EFFECTS,
    });
    setPlayer((p) => {
      const healed = { ...p, hp: playerMaxHp(p), mp: playerMaxMp(p) };
      if (preserveAutoBattle) return healed;
      return healed.autoBattle?.enabled ? { ...healed, autoBattle: { ...healed.autoBattle, enabled: false } } : healed;
    });
  };

  // Savaştan çıkmak (Geri Çekil, ölüm, ya da Tekrar Savaş'a Hayır) Otomatik
  // Saldırı'yı her zaman kapatır — bir sonraki savaşa asla "açık" sızmaz.
  const endBattle = () => {
    attackLockRef.current = false;
    fightRef.current = null;
    actionsRef.current = [];
    setMonster(null);
    setBattle(null);
    setPlayer((p) => (p.autoBattle?.enabled ? { ...p, autoBattle: { ...p.autoBattle, enabled: false } } : p));
  };

  const pushLog = (log, line) => [...log.slice(-24), line];

  // IMPORTANT: setState updater functions must be pure. React 18 StrictMode
  // (dev only) invokes them twice on purpose to catch side effects hiding
  // inside — a setTimeout/pushToast/nested setPlayer call inside an updater
  // fires twice as a result, which was silently doubling gold/XP/loot on
  // kills. Every setPlayer call below is now either a pure updater or the
  // side effects (pushToast) are read from a plain local variable *after*
  // setPlayer returns, never from inside the updater itself.
  // grantMonsterReward React dışı olduğu için hazır Türkçe cümle yerine
  // typed bir `drops` dizisi döndürüyor (bkz. utils/monsterRewards.js'in
  // üstündeki not) — burada, hook'a erişimi olan bileşen tarafında t() ile
  // biçimlendiriliyor.
  const REASON_KEY = { "ağırlık kapasitesi dolu.": "battle.reason.weightFull", "çanta dolu.": "battle.reason.bagFull" };
  const formatDrop = (d) => {
    switch (d.type) {
      case "gold": return t("battle.drop.gold", { amount: formatGold(d.amount) });
      case "xp": return t("battle.drop.xp", { amount: d.amount });
      case "questComplete": return t("battle.drop.questComplete");
      case "questProgress": return t("battle.drop.questProgress", { current: d.current, target: d.target });
      case "dailyQuestComplete": return t("battle.drop.dailyQuestComplete", { target: d.target });
      case "itemDropped": return t("battle.drop.itemDropped", { kind: t(`battle.kind.${d.kind}`), name: d.itemName });
      case "itemDropFailed": return t("battle.drop.itemDropFailed", { name: d.itemName, reason: t(REASON_KEY[d.reason] || d.reason) });
      case "chestDropped": return t("battle.drop.chestDropped", { tier: tierName(lang, d.tier) });
      case "guardChest": return t("battle.drop.guardChest", { tier: tierName(lang, d.tier) });
      case "levelUpToast": return t("battle.drop.levelUpToast", { level: d.level, statPoints: d.statPoints });
      default: return "";
    }
  };
  // Savaş sonucu sunucuda baştan oynatılarak hesaplanır (battle/settle). İstek, savaş biter bitmez (animasyon
  // beklenmeden) gider; sonuç animasyon bitince gösterilir. Sunucu "çok erken" derse bir kez yeniden dener.
  const requestSettle = async (m) => {
    await startRef.current;
    const actions = actionsRef.current.slice();
    let result = await act("battle/settle", { monsterId: m.id, actions });
    if (!result.ok && result.reason === "tooFast") {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      result = await act("battle/settle", { monsterId: m.id, actions });
    }
    return result;
  };

  const applyLoot = async (m, pending = requestSettle(m)) => {
    const result = await pending;
    if (!mountedRef.current) return result.ok;
    if (!result.ok || result.outcome !== "win") { pushToast(t("battle.actionFailed"), "warn"); return false; }
    setPlayer((p) => ({ ...p, hp: playerMaxHp(p), mp: playerMaxMp(p) }));
    pushToast(result.blockedReasonKey ? t(result.blockedReasonKey) : result.drops.map(formatDrop).join("  ·  "), result.tone);
    // Kullanıcı isteği: "Seviye atladığımız zaman 5 Lvl oldun! tarzında bir
    // widget açılsın... buna bir ses ekle." — toast zaten "Seviye atladın!"
    // satırını taşıyor, bu modal/ses üstüne kutlama katmanı ekliyor.
    if (result.levelUp) {
      setLevelUpInfo(result.levelUp);
      playLevelUp();
    }
    // Solo Zindan'ın boss aşaması yenildiğinde normal ödüle EK tamamlama ödülü (bonus altın +
    // garanti sandık) sunucuda verilir; burada yalnızca gösterilir.
    if (result.completion) {
      pushToast(t("battle.dungeonCompleteToast", { boss: tm(m), gold: formatGold(result.completion.bonusGold), tier: tierName(lang, result.completion.chestTier) }), "level");
      setDungeonComplete({ mapName: map.name, bonusGold: result.completion.bonusGold, chestTier: result.completion.chestTier });
    }
    return true;
  };

  const ACTION_ERROR_KEY = { skillCooldown: "battle.skillOnCooldown", noMana: "battle.notEnoughMana", potionCooldown: "battle.potionOnCooldown", noPotion: "battle.noPotionsLeft" };

  // Tek bir oyuncu eylemi (saldırı / beceri / pot): motor turu hesaplar, arayüz olayları çizer.
  const doAction = (action) => {
    if (attackLockRef.current) return;
    const fight = fightRef.current;
    if (!battle || battle.finished || !fight || player.hp <= 0) return;
    const error = checkAction(fight, player, action);
    if (error) { if (ACTION_ERROR_KEY[error]) pushToast(t(ACTION_ERROR_KEY[error]), "warn"); return; }
    const engineMonster = resolveMonster(monster.id)?.monster || monster;
    const out = stepFight(fight, player, engineMonster, map.levelMax, action);
    if (out.error) return;
    attackLockRef.current = true;
    fightRef.current = out.fight;
    actionsRef.current.push(action);

    const skill = action.type === "skill" ? classSkills(player.class).find((x) => x.id === action.id) : null;
    if (action.type === "attack") showAction("attack", t("battle.actionAttack"));
    else if (skill) showAction(skill.effect.type, skillName(skill), skill.id);
    else showAction("potion", action.kind === "hp" ? t("battle.actionHpPotion") : t("battle.actionMpPotion"));

    let log = battle.log;
    let potionUsed = null;
    for (const ev of out.events) {
      if (ev.kind === "dot") log = pushLog(log, t("battle.log.dotDamage", { dmg: ev.dmg }));
      else if (ev.kind === "attack") {
        log = pushLog(log, !ev.hit ? t("battle.log.playerMiss") : ev.crit ? t("battle.log.criticalHit", { dmg: ev.dmg }) : t("battle.log.hit", { dmg: ev.dmg }));
        setVisual((v) => ({ ...v, outgoing: { hit: ev.hit, damage: ev.dmg, crit: ev.crit } }));
        if (ev.hit) playHit({ crit: ev.crit, cls: player.class }); else playMiss();
        setShake("monster");
        setTimeout(() => setShake(null), 260);
      } else if (ev.kind === "skill") {
        playSkill(skill, player.class);
        if (ev.effect === "damage" || ev.effect === "execute") {
          log = pushLog(log, t("battle.log.skillDamage", { skill: skillName(skill), dmg: ev.dmg }));
          setVisual((v) => ({ ...v, outgoing: { hit: true, damage: ev.dmg, crit: false } }));
          setShake("monster");
          setTimeout(() => setShake(null), 260);
        } else if (ev.effect === "heal") {
          log = pushLog(log, t("battle.log.skillHeal", { skill: skillName(skill), amount: ev.amount }));
          if (ev.healed > 0) setVisual((v) => ({ ...v, outgoing: { hit: true, heal: true, damage: ev.healed } }));
        } else if (ev.effect === "buff") {
          log = pushLog(log, t("battle.log.skillBuff", { skill: skillName(skill) }));
        } else if (ev.effect === "dot") {
          log = pushLog(log, t("battle.log.skillDot", { skill: skillName(skill) }));
          setShake("monster");
          setTimeout(() => setShake(null), 260);
        }
      } else if (ev.kind === "potion") {
        potionUsed = ev;
        playPotion();
        log = pushLog(log, ev.potion === "hp" ? t("battle.log.usedHpPotion", { n: ev.healed }) : t("battle.log.usedMpPotion", { n: ev.healed }));
        if (ev.potion === "hp" && ev.healed > 0) setVisual((v) => ({ ...v, outgoing: { hit: true, heal: true, damage: ev.healed } }));
      } else if (ev.kind === "monster") {
        setVisual((v) => ({ ...v, incoming: { hit: ev.hit, damage: ev.dmg } }));
        log = pushLog(log, ev.hit ? t("battle.log.monsterHit", { monster: tm(monster), dmg: ev.dmg }) : t("battle.log.monsterMiss", { monster: tm(monster) }));
        if (ev.hit) playHurt(); else playMiss();
        setShake("player");
        setTimeout(() => setShake(null), 260);
      }
    }

    const f = out.fight;
    // Can/mana ve (varsa) harcanan pot ekranda hemen yansır; kalıcı kayıt sunucudaki savaş sonucunda işlenir.
    setPlayer((p) => ({ ...p, hp: f.hp, mp: f.mp, ...(potionUsed ? { inventory: usePotion(p, potionUsed.potion, potionUsed.tier).player.inventory } : {}) }));
    const won = f.ended === "win";
    const lost = f.ended === "lose";
    if (won) log = pushLog(log, t("battle.log.monsterDefeated", { monster: tm(monster) }));
    setBattle({ ...battle, monsterHp: f.monsterHp, log, finished: won || lost, buffs: f.buffs, dot: f.dot, skillCooldowns: f.skillCooldowns, potionCooldowns: f.potionCooldowns });

    if (won) {
      const wonMonster = monster;
      const settleRequest = requestSettle(wonMonster);
      // lock stays engaged through this window so extra clicks can't trigger a second loot/level-up off the same kill
      setTimeout(async () => {
        const rewarded = await applyLoot(wonMonster, settleRequest);
        attackLockRef.current = false;
        if (!rewarded && dungeonRun) { setDungeonRun(null); setMonster(null); setBattle(null); return; }

        // Solo Zindan koşusu sürüyorsa "Tekrar Savaş?" akışına hiç girmez — bir sonraki aşamaya (ya da
        // boss'sa tamamlama ödülüne) otomatik geçer.
        if (dungeonRun) {
          if (wonMonster.isBoss) {
            setDungeonRun(null);
            setMonster(null);
            setBattle(null);
          } else {
            const nextIndex = dungeonRun.index + 1;
            const nextStage = dungeonRun.stages[nextIndex];
            setMonster(null);
            setBattle(null);
            if (nextStage.isBoss) {
              setDungeonRun({ ...dungeonRun, index: nextIndex });
              pushToast(t("battle.dungeonBossWaiting"), "default");
              startBattle(nextStage, { preserveAutoBattle: true });
            } else {
              setDungeonChoice({ nextIndex, choices: buildDungeonStageChoices(map, nextIndex) });
            }
          }
          return;
        }

        setMonster(null);
        setBattle(null);
        // Ana ekrana otomatik dönmek yerine "Tekrar Savaş?" onayı çıkıyor (kullanıcı isteği).
        if (!wonMonster.mapBoss) setVictoryMonster(wonMonster);
      }, 700);
    } else if (lost) {
      const settleRequest = requestSettle(monster);
      setTimeout(async () => {
        const result = await settleRequest;
        setPlayer((p) => ({ ...p, hp: playerMaxHp(p), mp: playerMaxMp(p) }));
        setDeathInfo({ xpLost: result.xpLost || 0 });
        endBattle();
        // Zindanda ölmek koşuyu bitirir — kalan aşamalar/boss ödülü kaybedilir,
        // giriş hakkı zaten enterSoloDungeon'da harcanmıştı (geri gelmiyor).
        if (dungeonRun) setDungeonRun(null);
      }, 500);
    } else {
      // normal exchange resolved — release the lock after a short cooldown so combat still feels turn-paced
      setTimeout(() => { attackLockRef.current = false; }, 320);
    }
  };

  const attack = () => doAction({ type: "attack" });
  const useSkill = (skillId) => doAction({ type: "skill", id: skillId });
  const handlePotion = (kind) => doAction({ type: "potion", kind });

  const maxHp = playerMaxHp(player);
  const maxMp = playerMaxMp(player);
  const playerDead = player.hp <= 0;
  const hpPotionTier = bestAvailablePotionTier(player, "hp");
  const mpPotionTier = bestAvailablePotionTier(player, "mp");
  const hpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "hp" && i.tier === hpPotionTier);
  const mpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "mp" && i.tier === mpPotionTier);

  // Otomatik Saldırı Apex/Mythic Premium'a özel bir perk (bkz. data/premium.js
  // perks) — Premium süresi dolarsa `enabled` bayrağı localStorage'da kalsa
  // bile `autoBattleOn` false'a düşer ve döngü otomatik durur.
  const autoBattleAccess = hasAutoBattleAccess(player);
  const autoBattleOn = !!player.autoBattle?.enabled && autoBattleAccess;
  const AUTO_BATTLE_DEFAULTS = { enabled: false, hpThreshold: 35, mpThreshold: 35, autoSkill: false };
  const toggleAutoBattle = () => {
    if (!autoBattleAccess) { pushToast(t("battle.autoBattlePremiumOnly"), "warn"); return; }
    setPlayer((p) => ({ ...p, autoBattle: { ...AUTO_BATTLE_DEFAULTS, ...p.autoBattle, enabled: !p.autoBattle?.enabled } }));
  };
  const setHpThreshold = (v) => setPlayer((p) => ({ ...p, autoBattle: { ...AUTO_BATTLE_DEFAULTS, ...p.autoBattle, hpThreshold: v } }));
  const setMpThreshold = (v) => setPlayer((p) => ({ ...p, autoBattle: { ...AUTO_BATTLE_DEFAULTS, ...p.autoBattle, mpThreshold: v } }));
  const toggleAutoSkill = () => setPlayer((p) => ({ ...p, autoBattle: { ...AUTO_BATTLE_DEFAULTS, ...p.autoBattle, autoSkill: !p.autoBattle?.autoSkill } }));

  // Otomatik Saldırı: her aksiyondan sonra `battle`/`player.hp`/`player.mp`
  // değiştiği için bu effect yeniden tetiklenir ve bir sonraki aksiyonu
  // planlar — kendi kendini besleyen bir döngü (bkz. WarzoneTab.jsx'teki
  // gerçek-zamanlı tick effect'i, aynı desen). Kullanıcı isteği: bu ASLA
  // yeni bir savaş BAŞLATMAZ (victoryMonster/deathInfo açıkken duruyor) —
  // sadece mevcut savaşın içinde saldırır/pot içer.
  useEffect(() => {
    if (!autoBattleOn || !battle || battle.finished || player.hp <= 0 || victoryMonster || deathInfo) return;
    const timer = setTimeout(() => {
      if (attackLockRef.current) return;
      const hpPct = (player.hp / maxHp) * 100;
      const mpPct = (player.mp / maxMp) * 100;
      const hpThreshold = player.autoBattle?.hpThreshold ?? 35;
      const mpThreshold = player.autoBattle?.mpThreshold ?? 35;
      const hpCd = battle.potionCooldowns.hp || 0;
      const mpCd = battle.potionCooldowns.mp || 0;
      if (hpPct < hpThreshold && hpCd === 0 && hpPotionTier) {
        handlePotion("hp");
        return;
      }
      if (mpPct < mpThreshold && mpCd === 0 && mpPotionTier) {
        handlePotion("mp");
        return;
      }
      if (player.autoBattle?.autoSkill) {
        const skillId = pickAutoSkill({
          loadout: player.skills.loadout,
          playerClass: player.class,
          skillCooldowns: battle.skillCooldowns,
          mp: player.mp,
          monsterHpPct: battle.monsterHp / battle.monsterMaxHp,
          buffs: battle.buffs,
        });
        if (skillId) { useSkill(skillId); return; }
      }
      attack();
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBattleOn, battle, player.hp, player.mp, victoryMonster, deathInfo]);

  return (
    <div style={styles.panelScroll}>
      {pendingMap && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setPendingMap(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <DoorOpen size={28} color={pendingMap.color} strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
              {t("battle.teleportConfirm", { map: pendingMap.name, cost: GATE_TELEPORT_COST })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setPendingMap(null)}>{t("battle.no")}</button>
              <button style={{ ...styles.tinyBtn, background: pendingMap.color }} onClick={confirmTeleport}>{t("battle.yes")}</button>
            </div>
          </div>
        </div>
      )}

      {!monster && (
        <>
          <SectionLabel>{t("battle.dailyDungeon")}</SectionLabel>
          <div className="rpg-card rpg-dungeon-card" style={{ ...styles.itemDetailCard, borderColor: "#A34FD966", background: "#A34FD90d", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MenuEmblem name="dungeon" size={44}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{t("battle.dungeonName", { map: map.name })}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                  {t("battle.dungeonDesc", { limit: SOLO_DUNGEON_DAILY_LIMIT })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {t("battle.dungeonEntriesLeft", { left: dungeonEntriesLeft(player), limit: SOLO_DUNGEON_DAILY_LIMIT })}
              </span>
              <button
                style={{
                  ...styles.tinyBtn,
                  ...(dungeonEntriesLeft(player) > 0 && !locked
                    ? { background: "#A34FD9" }
                    : { background: "var(--bg-panel-alt)", color: "var(--text-faint)" }),
                }}
                disabled={dungeonEntriesLeft(player) <= 0 || locked}
                onClick={async () => {
                  const ok = await askConfirm({ title: t("battle.confirmDungeonTitle", { map: map.name }), text: t("battle.confirmDungeonText", { left: dungeonEntriesLeft(player), limit: SOLO_DUNGEON_DAILY_LIMIT }), confirmLabel: t("battle.confirmDungeonYes") });
                  if (ok) enterSoloDungeon();
                }}
              >
                {t("battle.enterDungeon")}
              </button>
            </div>
            {dungeonEntriesLeft(player) <= 0 && !locked && (
              hasBoughtExtraDungeonEntryToday(player) ? (
                <div style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "center", marginTop: 8 }}>
                  {t("battle.dungeonEntriesAlreadyBoughtToday")}
                </div>
              ) : (
                <button
                  style={{ ...styles.tinyBtn, width: "100%", marginTop: 8, background: "var(--bg-panel-alt)", color: "#8B6FC9", border: "1px solid #8B6FC966", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  onClick={handleBuyDungeonEntries}
                >
                  <Gem size={12} /> {t("battle.buyDungeonEntries", { n: EXTRA_DUNGEON_ENTRY_COST_DIAMONDS })}
                </button>
              )
            )}
          </div>

          <SectionLabel>{t("battle.mapBoss")}</SectionLabel>
          <div className="rpg-card" style={{ ...styles.itemDetailCard, borderColor: `${map.color}77`, background: `${map.color}12`, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="monster-mini-portrait"><MonsterPortrait monster={mapBoss} label={tm(mapBoss)}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{tm(mapBoss)}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{mapBossCheck.reason === "mapIncomplete" ? t("battle.bossNeedsMapDesc", { need: KILLS_TO_UNLOCK_NEXT, done: mapBossCheck.done, total: mapBossCheck.total }) : t("battle.mapBossDesc")}</div>
              </div>
              <button
                style={{ ...styles.tinyBtn, ...(mapBossCheck.ok && !locked ? { background: "#D4AF6A", color: "#0B0C10" } : { background: "var(--bg-panel-alt)", color: "var(--text-faint)" }) }}
                disabled={!mapBossCheck.ok || locked}
                onClick={async () => {
                  const ok = await askConfirm({ title: t("battle.confirmMapBossTitle", { boss: tm(mapBoss) }), text: t("battle.confirmMapBossText"), confirmLabel: t("battle.confirmMapBossYes"), tone: "danger" });
                  if (ok) startBattle(mapBoss);
                }}
              >
                {mapBossCheck.ok ? t("battle.goToBoss") : t(mapBossCheck.reason === "mapIncomplete" ? "battle.bossNeedsMap" : "battle.defeatedToday")}
              </button>
            </div>
          </div>

          <SectionLabel>{t("battle.gateTitle")}</SectionLabel>
          <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: -6, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <DoorOpen size={12} /> {t("battle.gateDesc", { cost: GATE_TELEPORT_COST })}
          </p>
          <div style={styles.tierScroller}>
            {MAPS.map((m2, idx) => {
              const levelLocked = player.level < m2.levelMin;
              const progressLocked = !levelLocked && !isMapProgressUnlocked(player, idx, MAPS);
              const mlocked = levelLocked || progressLocked;
              const isSel = m2.id === map.id;
              return (
                <button
                  key={m2.id}
                  onClick={() => requestTeleport(m2)}
                  title={progressLocked ? t("battle.mapProgressLockedDesc", { prevMap: MAPS[idx - 1].name, need: KILLS_TO_UNLOCK_NEXT }) : undefined}
                  style={{
                    ...styles.tierChip,
                    borderColor: isSel ? m2.color : "var(--border)",
                    opacity: mlocked ? 0.45 : 1,
                    background: isSel ? `${m2.color}1A` : "var(--bg-panel)",
                    cursor: mlocked ? "default" : "pointer",
                  }}
                >
                  {mlocked && <Lock size={11} style={{ marginRight: 4 }} />}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m2.color }}>Lv.{m2.levelMin}-{m2.levelMax}</span>
                  <span style={{ fontSize: 11, marginLeft: 6 }}>{m2.name}</span>
                </button>
              );
            })}
          </div>

          {locked ? (
            <EmptyState
              icon={Lock}
              title={t("battle.mapLocked", { map: map.name })}
              subtitle={t("battle.mapLockedDesc", { level: map.levelMin })}
            />
          ) : (
            <>
              <SectionLabel>{t("battle.monstersHeader", { map: map.name })}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {map.monsters.map((m, i) => {
                  const unlocked = isMonsterUnlocked(player, map, i);
                  const prev = i > 0 ? map.monsters[i - 1] : null;
                  return (
                    <div key={m.id} className="monster-hunt-card" style={{'--monster-accent':map.color, opacity: unlocked ? 1 : 0.55}}>
                        <div className="monster-face-frame">
                          <MonsterPortrait monster={m} label={tm(m)}/>
                        </div>
                        <div className="monster-card-body">
                          <div className="monster-card-name">{tm(m)}</div>
                          {unlocked ? (
                            <div className="monster-card-stats">
                              <span>HP <b>{m.hp}</b></span><span>ATK <b>{m.atk}</b></span><span>DEF <b>{m.def}</b></span>
                            </div>
                          ) : (
                            <div className="monster-card-stats" style={{ color: "var(--text-faint)" }}>
                              {t("battle.monsterLockedDesc", { prev: tm(prev), current: monsterKillCount(player, prev.id), need: KILLS_TO_UNLOCK_NEXT })}
                            </div>
                          )}
                      {unlocked ? (
                        <button className="monster-attack" onClick={() => startBattle(m)}>
                          <Sword size={13}/>
                          {t("battle.startBattle")}
                        </button>
                      ) : (
                        <button className="monster-attack" disabled style={{ opacity: 0.6, cursor: "default" }}>
                          <Lock size={13}/>
                          {t("battle.monsterLocked")}
                        </button>
                      )}
                        </div>
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {monster && battle && (
        <div className={hasBattleScene(monster) ? "battle-mobile" : ""} style={styles.battleArena}>
          <BattleScene player={player} monster={monster} battle={battle} map={map} visual={visual} />
          {dungeonRun && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#A34FD914", border: "1px solid #A34FD944" }}>
              <span style={{ fontSize: 11, color: "#A34FD9", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5 }}>
                <Castle size={12} /> {t("battle.dungeonStage", { current: dungeonRun.index + 1, total: dungeonRun.stages.length })}
              </span>
              {monster.isBoss && <span style={{ fontSize: 10, color: "var(--gold-text)", fontFamily: "var(--font-mono)" }}>{t("battle.boss")}</span>}
            </div>
          )}
          {monster.mapBoss && (
            <div style={{ marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#D4AF6A14", border: "1px solid #D4AF6A44", fontSize: 11, color: "var(--gold-text)", fontFamily: "var(--font-mono)" }}>
              <Trophy size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} /> {t("battle.mapBossBanner")}
            </div>
          )}
          {!hasBattleScene(monster) && <>
          <div className={shake === "monster" ? "shake" : ""} style={{ ...styles.combatant, borderColor: `${map.color}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{tm(monster)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{battle.monsterHp}/{battle.monsterMaxHp}</span>
            </div>
            <BarTrack pct={(battle.monsterHp / battle.monsterMaxHp) * 100} color={map.color} />
          </div>

          <div style={styles.vsRow}>
            <Flame size={14} color="var(--text-faint)" />
          </div>

          <div className={shake === "player" ? "shake" : ""} style={{ ...styles.combatant, borderColor: `${cls.color}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{displayClassName(player)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{player.hp}/{maxHp}</span>
            </div>
            <BarTrack pct={(player.hp / maxHp) * 100} color="#C9425A" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>MP</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>{player.mp}/{maxMp}</span>
            </div>
            <BarTrack pct={(player.mp / maxMp) * 100} color="#4FC3D9" thin />
          </div>

          </>}
          <details className="battle-history"><summary>{t("battle.combatLog")} · {battle.log.at(-1)}</summary><div ref={logRef} style={styles.combatLog}>
            {battle.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div></details>

          <div className="battle-skill-dock" aria-label={t("battle.skillsAriaLabel")} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
            {player.skills.loadout.map((skillId, i) => {
              if (!skillId) {
                return (
                  <div key={i} className="rpg-slot" style={{ ...styles.equipSlotCard, opacity: 0.4 }}>
                    <Plus size={12} color="var(--text-faint)" /><span className="battle-slot-label">{t("battle.empty")}</span>
                  </div>
                );
              }
              const skill = classSkills(player.class).find((s) => s.id === skillId);
              const cdLeft = battle.skillCooldowns[skillId] || 0;
              const noMp = player.mp < skill.mpCost;
              const disabled = cdLeft > 0 || noMp || playerDead || battle.finished;
              return (
                <button
                  key={i}
                  className="rpg-slot" style={{ ...styles.equipSlotCard, borderColor: `${cls.color}66`, background: `${cls.color}12`, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}
                  onClick={() => useSkill(skillId)}
                  disabled={disabled}
                  title={`${skillName(skill)} — MP ${skill.mpCost}`}
                >
                  <SkillIcon skill={skill} effectType={skill.effect.type} size={22} color={cls.color} /><span className="battle-slot-label">{skillName(skill)}</span>
                  <div style={{ fontSize: 7, marginTop: 2, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    {cdLeft > 0 ? cdLeft : `${skill.mpCost}mp`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="battle-action-dock" style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: (playerDead || battle.finished) ? 0.5 : 1 }} onClick={attack} disabled={playerDead || battle.finished}>
              <Sword size={15} /> {t("battle.attack")}
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (battle.potionCooldowns.hp > 0 || playerDead || battle.finished) ? 0.5 : 1 }}
              onClick={() => handlePotion("hp")}
              disabled={battle.potionCooldowns.hp > 0 || playerDead || battle.finished}
            >
              <Heart size={14} color="#C9425A" /> {battle.potionCooldowns.hp > 0 ? battle.potionCooldowns.hp : (hpPotion?.count || 0)}
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (battle.potionCooldowns.mp > 0 || playerDead || battle.finished) ? 0.5 : 1 }}
              onClick={() => handlePotion("mp")}
              disabled={battle.potionCooldowns.mp > 0 || playerDead || battle.finished}
            >
              <Zap size={14} color="#4FC3D9" /> {battle.potionCooldowns.mp > 0 ? battle.potionCooldowns.mp : (mpPotion?.count || 0)}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <button
              style={{ ...styles.ghostBtn, flex: 1 }}
              onClick={async () => {
                if (!(await confirmRetreat(lang))) return;
                if (monster && fightRef.current && !fightRef.current.ended) requestSettle(monster);
                endBattle();
                // Zindan koşusu sürerken elle geri çekilmek koşuyu yarıda
                // bırakır — kalan aşamalar/boss ödülü kaybedilir, giriş hakkı
                // (zaten enterSoloDungeon'da harcandı) geri gelmiyor.
                if (dungeonRun) { setDungeonRun(null); pushToast(t("battle.dungeonAbandoned"), "warn"); }
              }}
            >
              <ArrowLeft size={13} /> {t("battle.retreat")}
            </button>
            {/* Savaş ekranının ALTINDA, küçük bir ikon (kullanıcı isteği —
                önceden ekranın en üstünde, tam genişlikte bir anahtardı).
                Apex/Mythic Premium olmayanlar için kilitli görünür — tıklayınca
                döngüyü açmaz, sadece uyarı toast'ı gösterir. */}
            <button
              onClick={toggleAutoBattle}
              title={autoBattleAccess ? `${t("battle.autoBattleTitle")} — ${autoBattleOn ? t("battle.autoBattleOn") : t("battle.autoBattleOff")}` : t("battle.autoBattlePremiumOnly")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                width: 40, borderRadius: 10, border: "1px solid",
                background: autoBattleOn ? "#5FA8A0" : "var(--bg-panel-alt)",
                borderColor: autoBattleOn ? "#5FA8A0" : "var(--border)",
                opacity: autoBattleAccess ? 1 : 0.6, cursor: "pointer",
              }}
            >
              {autoBattleAccess ? (
                <Bot size={17} color={autoBattleOn ? "#0B0C10" : "var(--text-muted)"} strokeWidth={1.8} />
              ) : (
                <Lock size={15} color="var(--text-faint)" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {autoBattleAccess && (
            <div style={styles.autoBattleCard}>
              <div style={styles.sliderRow}>
                <div style={styles.sliderLabelRow}>
                  <span>{t("battle.hpPotThreshold")}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#C9425A" }}>%{player.autoBattle?.hpThreshold ?? 35}</span>
                </div>
                <input
                  type="range" min={0} max={90} step={5}
                  value={player.autoBattle?.hpThreshold ?? 35}
                  onChange={(e) => setHpThreshold(parseInt(e.target.value, 10))}
                  style={styles.sliderInput}
                />
              </div>
              <div style={styles.sliderRow}>
                <div style={styles.sliderLabelRow}>
                  <span>{t("battle.mpPotThreshold")}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#4FC3D9" }}>%{player.autoBattle?.mpThreshold ?? 35}</span>
                </div>
                <input
                  type="range" min={0} max={90} step={5}
                  value={player.autoBattle?.mpThreshold ?? 35}
                  onChange={(e) => setMpThreshold(parseInt(e.target.value, 10))}
                  style={styles.sliderInput}
                />
              </div>
              <button
                onClick={toggleAutoSkill}
                style={{
                  ...styles.toggleRow, width: "100%", marginTop: 8, background: player.autoBattle?.autoSkill ? "#8B6FC914" : "var(--bg-panel-alt)",
                  border: "1px solid", borderColor: player.autoBattle?.autoSkill ? "#8B6FC966" : "var(--border)",
                  borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 11, color: player.autoBattle?.autoSkill ? "#8B6FC9" : "var(--text-muted)" }}>
                  {t("battle.autoSkill")} — {player.autoBattle?.autoSkill ? t("battle.autoBattleOn") : t("battle.autoBattleOff")}
                </span>
                <span style={{ ...styles.toggleSwitch, background: player.autoBattle?.autoSkill ? "#8B6FC9" : "var(--bg-panel-alt)", justifyContent: player.autoBattle?.autoSkill ? "flex-end" : "flex-start" }}>
                  <span style={styles.toggleKnob} />
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {deathInfo && <DeathModal xpLost={deathInfo.xpLost} onClose={() => setDeathInfo(null)} />}

      {/* Seviye atlama kutlaması, "Tekrar Savaş?"/zindan tamamlama
          modallarından ÖNCE gösteriliyor — ikisi de aynı öldürme anında
          birden set edilebiliyor (bkz. applyLoot + resolveMonsterTurn'ün
          aynı setTimeout'u), o yüzden bu modal kapanana kadar diğerleri
          bekletiliyor (aşağıdaki `!levelUpInfo` şartları). */}
      {levelUpInfo && <LevelUpModal levelUp={levelUpInfo} onClose={() => setLevelUpInfo(null)} />}

      {!levelUpInfo && victoryMonster && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setVictoryMonster(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Trophy size={32} color="var(--gold-text)" strokeWidth={1.3} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>{t("battle.rematchTitle")}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center", maxWidth: 220 }}>
              {t("battle.rematchDesc", { monster: lang === "tr" ? accusativeName(tm(victoryMonster)) : tm(victoryMonster) })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}
                onClick={() => {
                  setVictoryMonster(null);
                  setPlayer((p) => (p.autoBattle?.enabled ? { ...p, autoBattle: { ...p.autoBattle, enabled: false } } : p));
                }}
              >
                {t("battle.no")}
              </button>
              <button
                style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#0B0C10" }}
                onClick={() => { const m = victoryMonster; setVictoryMonster(null); startBattle(m, { preserveAutoBattle: true }); }}
              >
                {t("battle.yes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!levelUpInfo && dungeonComplete && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setDungeonComplete(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <MenuEmblem name="dungeon" size={44}/>
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>{t("battle.dungeonCompleteTitle")}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center", maxWidth: 240 }}>
              {t("battle.dungeonCompleteDesc", { map: dungeonComplete.mapName, gold: formatGold(dungeonComplete.bonusGold), tier: tierName(lang, dungeonComplete.chestTier) })}
            </div>
            <button style={{ ...styles.tinyBtn, background: "#A34FD9", marginTop: 20 }} onClick={() => setDungeonComplete(null)}>
              {t("battle.great")}
            </button>
          </div>
        </div>
      )}

      {dungeonChoice && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }}>
          <div style={styles.modalCard}>
            <MenuEmblem name="dungeon" size={44}/>
            <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("battle.choosePath")}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>{t("battle.choosePathDesc")}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 18, width: "100%" }}>
              {dungeonChoice.choices.map((choice) => (
                <button key={choice.id} style={{ ...styles.tinyBtn, flex: 1, minHeight: 58, background: choice.risk ? "#C9425A" : "#5FA8A0" }} onClick={() => chooseDungeonPath(choice)}>
                  <span>{choice.risk ? t("battle.riskyPath") : t("battle.safePath")}</span>
                  <small style={{ display: "block", opacity: 0.82, marginTop: 3 }}>{choice.risk ? t("battle.riskyPathDesc") : t("battle.safePathDesc")}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
