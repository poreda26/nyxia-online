import { useState, useEffect, useRef } from "react";
import { Lock, Skull, Flame, Sword, Heart, Zap, ArrowLeft, Plus, DoorOpen, Bot, Trophy, Castle } from "lucide-react";
import { MAPS, findMap, highestUnlockedMap, GATE_TELEPORT_COST } from "../data/maps";
import { buildSoloDungeonStages, SOLO_DUNGEON_DAILY_LIMIT } from "../data/soloDungeon";
import { rand, uid } from "../utils/random";
import { rollLoot } from "../utils/loot";
import { xpToNext, xpLevelPenaltyMultiplier, MAX_LEVEL, playerMaxHp, playerMaxMp, displayClassName, damageEquippedDurability, applyDeathPenalty, armorSetDamageReduction, WEAPON_SLOTS, ARMOR_SLOTS } from "../utils/player";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, rollHit } from "../utils/combat";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { usePotion, bestAvailablePotionTier } from "../utils/potions";
import { premiumExpMultiplier, premiumDropMultiplier, hasAutoBattleAccess } from "../utils/premium";
import { clanExpMultiplier } from "../utils/clan";
import { eventExpMultiplier } from "../utils/events";
import { classSkills, learnFreeSkills, computeSkillDamage, computeSkillHeal } from "../utils/skills";
import { MONSTER_QUESTS } from "../data/quests";
import { registerDailyKill, ensureDailyQuestsFresh } from "../utils/dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
import { dungeonEntriesLeft, canEnterSoloDungeon, consumeDungeonEntry } from "../utils/soloDungeon";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import BarTrack from "./shared/BarTrack";
import SkillIcon from "./SkillIcon";
import DeathModal from "./DeathModal";

// potionCooldowns: her tur bir azalır (bkz. tickBattleEffects) — Can/Mana
// potları 2 turda bir kullanılabilir, ikisi birlikte de basılamaz (bir pot
// kullanmak zaten bir tur harcar, bkz. handlePotion).
const EMPTY_BATTLE_EFFECTS = { skillCooldowns: {}, buffs: [], dot: null, potionCooldowns: { hp: 0, mp: 0 } };
const POTION_COOLDOWN_TURNS = 2;

function buffMultiplier(buffs, stat) {
  return buffs.filter((b) => b.stat === stat).reduce((mult, b) => mult * b.mult, 1);
}

// Kullanıcı isteği: "haritalar kendi dropunu ve bir önceki haritasını
// atsın" — bir haritanın tier-bağlı dropu (eşya/sandık/parşömen) artık
// %50 kendi tier'ında, %50 bir önceki tier'da (varsa) düşüyor. Toplam düşme
// ŞANSI değişmiyor (kullanıcı: "item düşme şansı %10 ise budur") — sadece
// düşen şeyin hangi tier'dan geldiği artık iki bant arasında dağılıyor.
// Tier1'de "önceki" yok, o zaman hep kendi tier'ında kalır.
function pickDropTier(mapTier) {
  const prevTier = Math.max(1, mapTier - 1);
  return Math.random() < 0.5 ? mapTier : prevTier;
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

export default function BattleTab({ player, setPlayer, cls, def, atk, pushToast }) {
  const [monster, setMonster] = useState(null); // active monster template
  const [battle, setBattle] = useState(null); // {monsterHp, monsterMaxHp, log, playerHp}
  const [shake, setShake] = useState(null); // 'player' | 'monster' | null
  const [pendingMap, setPendingMap] = useState(null); // map awaiting teleport confirmation
  const [deathInfo, setDeathInfo] = useState(null); // { xpLost } | null — drives DeathModal
  const [victoryMonster, setVictoryMonster] = useState(null); // just-defeated monster template — drives the "Tekrar Savaş?" prompt
  // Günlük Solo Zindan — bkz. data/soloDungeon.js, utils/soloDungeon.js.
  // dungeonRun: { stages, index } | null — aktif bir zindan koşusu sürerken
  // aşama aşama ilerliyor (bkz. resolveMonsterTurn'daki dallanma), null ise
  // normal (haritadaki tekli canavar) savaş akışı işliyor.
  const [dungeonRun, setDungeonRun] = useState(null);
  const [dungeonComplete, setDungeonComplete] = useState(null); // { mapName, bonusGold, chestTier } | null
  const logRef = useRef(null);

  // Oyuncunun en son ışınlandığı harita kalıcı — güvenlik amaçlı, artık
  // seviyesinin yetmediği bir haritaya işaret ediyorsa en yüksek açık
  // haritaya düş (normalde hiç olmamalı, bkz. utils/player.js#migratePlayer).
  const map = player.level >= findMap(player.currentMapId).levelMin
    ? findMap(player.currentMapId)
    : highestUnlockedMap(player.level);
  const locked = player.level < map.levelMin;

  // Kapı: farklı bir haritaya geçmek GATE_TELEPORT_COST altın karşılığında —
  // aynı haritaya tekrar tıklamak ya da kilitli bir haritaya tıklamak
  // ücretsiz/etkisiz. Tıklama artık doğrudan ışınlamıyor, önce ücreti
  // gösteren bir onay modalı açıyor (bkz. render'daki pendingMap modalı) —
  // kullanıcının "ücreti belirt ve onay iste" isteği.
  const requestTeleport = (targetMap) => {
    if (player.level < targetMap.levelMin) return;
    if (targetMap.id === player.currentMapId) return;
    setPendingMap(targetMap);
  };

  const confirmTeleport = () => {
    const targetMap = pendingMap;
    if (!targetMap) return;
    if (player.gold < GATE_TELEPORT_COST) { pushToast(`Işınlanmak için ${GATE_TELEPORT_COST} altın gerekiyor.`, "warn"); setPendingMap(null); return; }
    setPlayer((p) => ({ ...p, gold: p.gold - GATE_TELEPORT_COST, currentMapId: targetMap.id }));
    pushToast(`Kapı'dan ${targetMap.name}'e ışınlandın. (-${GATE_TELEPORT_COST} altın)`, "default");
    setPendingMap(null);
  };

  // Günlük Solo Zindan'a giriş — mevcut haritaya göre ölçeklenen 5 aşama +
  // boss üretir (bkz. data/soloDungeon.js#buildSoloDungeonStages), günlük
  // giriş hakkını hemen düşer (koşu yarıda bırakılsa/kaybedilse bile hak
  // geri gelmez, "günde 3 kez girilebilir" kullanıcı isteğinin doğal
  // sonucu) ve ilk aşamayla normal startBattle akışını başlatır.
  const enterSoloDungeon = () => {
    if (locked) return;
    const check = canEnterSoloDungeon(player);
    if (!check.ok) { pushToast(check.reason, "warn"); return; }
    const stages = buildSoloDungeonStages(map);
    setPlayer((p) => consumeDungeonEntry(p));
    setDungeonRun({ stages, index: 0 });
    startBattle(stages[0]);
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
    attackLockRef.current = false;
    setMonster(m);
    setBattle({
      monsterHp: m.hp,
      monsterMaxHp: m.hp,
      finished: false,
      log: [`${m.name} karşına çıktı.`],
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
    setMonster(null);
    setBattle(null);
    setPlayer((p) => (p.autoBattle?.enabled ? { ...p, autoBattle: { ...p.autoBattle, enabled: false } } : p));
  };

  const pushLog = (log, line) => [...log.slice(-24), line];

  // Resolves one "tick" of battle-scoped effects at the top of every player
  // action (attack or skill) — süregelen (dot) damage lands, buff/dot/
  // cooldown counters all shrink by one action. Doesn't touch React state
  // itself; callers fold the result into their own setBattle call.
  const tickBattleEffects = (b) => {
    let monsterHp = b.monsterHp;
    let log = b.log;
    if (b.dot && b.dot.turnsLeft > 0) {
      monsterHp = Math.max(0, monsterHp - b.dot.dmgPerTurn);
      log = pushLog(log, `Süregelen etki ${b.dot.dmgPerTurn} hasar verdi.`);
    }
    const dot = b.dot && b.dot.turnsLeft > 1 ? { ...b.dot, turnsLeft: b.dot.turnsLeft - 1 } : null;
    const buffs = b.buffs.map((buf) => ({ ...buf, turnsLeft: buf.turnsLeft - 1 })).filter((buf) => buf.turnsLeft > 0);
    const skillCooldowns = Object.fromEntries(Object.entries(b.skillCooldowns).map(([id, t]) => [id, Math.max(0, t - 1)]));
    const potionCooldowns = Object.fromEntries(Object.entries(b.potionCooldowns).map(([k, t]) => [k, Math.max(0, t - 1)]));
    return { monsterHp, log, dot, buffs, skillCooldowns, potionCooldowns };
  };

  // IMPORTANT: setState updater functions must be pure. React 18 StrictMode
  // (dev only) invokes them twice on purpose to catch side effects hiding
  // inside — a setTimeout/pushToast/nested setPlayer call inside an updater
  // fires twice as a result, which was silently doubling gold/XP/loot on
  // kills. Every setPlayer call below is now either a pure updater or the
  // side effects (pushToast) are read from a plain local variable *after*
  // setPlayer returns, never from inside the updater itself.
  const applyLoot = (m) => {
    // Read once from the live player prop before the updater — see the
    // StrictMode note above about keeping setState updaters pure; a
    // Date.now()-backed lookup has no business running inside one.
    const expMult = premiumExpMultiplier(player) * clanExpMultiplier(player) * eventExpMultiplier(player);
    const dropMult = premiumDropMultiplier(player);
    let toastInfo = null;
    setPlayer((p) => {
      let np = { ...p, inventory: [...p.inventory], chests: [...p.chests], monsterKills: { ...p.monsterKills } };
      const killsBefore = np.monsterKills[m.id] || 0;
      np.monsterKills[m.id] = killsBefore + 1;
      const goldGain = rand(m.goldMin, m.goldMax);
      // No XP past the level cap — nothing left to spend it on. Seviye
      // farkı çok açıldıysa (çok düşük seviyeli haritada avlanmak) XP
      // kademeli olarak azalır — bkz. utils/player.js#xpLevelPenaltyMultiplier.
      const levelPenalty = xpLevelPenaltyMultiplier(p.level, map.levelMax);
      const xpGain = p.level >= MAX_LEVEL ? 0 : Math.round(m.xp * expMult * levelPenalty);
      np.gold += goldGain;
      np.xp += xpGain;

      let drops = [`+${goldGain} altın`];
      if (xpGain > 0) drops.push(`+${xpGain} XP`);

      // Kullanıcı: "canavarı kestiğim zaman görev ilerlemesini göremiyorum"
      // — önceden sadece hedefi TAM O ÖLDÜRMEDE tamamlayınca bir satır
      // ekleniyordu, aradaki her öldürmede hiçbir ilerleme görünmüyordu.
      // Artık ilgili görev bitene kadar HER öldürmede "Görev: X/Y" satırı
      // ekleniyor; tamamlandığı öldürmede onun yerine yönlendirme satırı
      // geliyor (tekrar tekrar "tamamlandı" spamlanmasın diye sadece o TEK
      // öldürmede, sonrasında zaten Kaptan'a gidip alması gerekiyor).
      const relatedQuest = MONSTER_QUESTS.find((q) => q.monsterId === m.id);
      if (relatedQuest && !(p.claimedQuests || []).includes(relatedQuest.id)) {
        const current = np.monsterKills[m.id];
        if (current >= relatedQuest.target) {
          if (killsBefore < relatedQuest.target) {
            drops.push("Görev tamamlandı! Kaptan'ın yanına uğra.");
          }
        } else {
          drops.push(`Görev: ${current}/${relatedQuest.target}`);
        }
      }

      // Günlük görevler — Kaptan'ın kalıcı görevlerinden ayrı, her gün
      // sıfırlanan "bugün X canavar öldür" merdiveni (bkz. utils/dailyQuests.js).
      // Hangi canavar/harita olduğu önemli değil, sadece bugünkü toplam sayılıyor.
      // ensureDailyQuestsFresh önce çağrılıyor ki gün değiştiyse "önceki"
      // sayı da doğru (sıfırlanmış) taban üzerinden okunsun.
      const freshNp = ensureDailyQuestsFresh(np);
      const dailyKillsBefore = freshNp.dailyQuests.killsToday;
      np = registerDailyKill(freshNp);
      DAILY_QUEST_SLOTS.forEach((slot) => {
        const wasDone = dailyKillsBefore >= slot.target;
        const isDone = np.dailyQuests.killsToday >= slot.target;
        if (isDone && !wasDone) {
          drops.push(`Günlük görev tamamlandı! (${slot.target} öldürme)`);
        }
      });

      if (Math.random() < 0.10 * dropMult) {
        const dropTier = pickDropTier(map.tier);
        const item = rollLoot(dropTier, np.class);
        // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
        // hiçbir eşya yoksa rollLoot null döner, o an hiç düşmemiş say.
        if (item) {
          const addResult = addItemToInventory(np, item);
          np = addResult.player;
          if (addResult.added) np.hasNewItemNotice = true;
          const kindLabel = item.kind === "weapon" ? "Silah" : item.kind === "accessory" ? "Aksesuar" : "Zırh";
          drops.push(addResult.added ? `${kindLabel} düştü: ${item.name}` : `${item.name} düştü ama ${addResult.reason}`);
        }
      }
      if (Math.random() < 0.05 * dropMult) {
        const chestTier = pickDropTier(map.tier);
        const chest = { id: uid(), tier: chestTier };
        np.chests.push(chest);
        drops.push(`Sandık düştü! (T${chestTier})`);
      }
      if (Math.random() < 0.06 * dropMult) {
        const scrollTier = pickDropTier(map.tier);
        const scroll = makeScrollStack(scrollTier, 1);
        const scrollResult = addItemToInventory(np, scroll);
        np = scrollResult.player;
        drops.push(scrollResult.added ? `T${scrollTier} Yükseltme Parşömeni düştü!` : `T${scrollTier} Parşömeni düştü ama ${scrollResult.reason}`);
      }
      // Tier 6 "Eşsiz" (Unique) gear never drops from monsters — only from
      // Özel Etkinlik Sandığı (special event chests, see
      // utils/loot.js#rollSpecialChestLoot), granted through events (not
      // built yet) or GM commands.

      // level up loop
      let leveled = false;
      let levelsGained = 0;
      while (np.level < MAX_LEVEL && np.xp >= xpToNext(np.level)) {
        np.xp -= xpToNext(np.level);
        np.level += 1;
        np.statPoints += 3;
        levelsGained += 1;
        leveled = true;
      }
      if (np.level >= MAX_LEVEL) np.xp = 0; // nothing left to carry toward
      // Bir canavarı öldürünce bir sonraki savaşa tam can/mana ile
      // başlanır — sadece seviye atlayınca değil, HER öldürmede.
      np.hp = playerMaxHp(np);
      np.mp = playerMaxMp(np);
      if (leveled) {
        drops.push(`Seviye atladın! Lv.${np.level} (+${levelsGained * 3} statü puanı)`);
      }
      // Idempotent — safe to call on every kill, not just level-ups (basic
      // skills only need the level threshold, already met or not).
      np = learnFreeSkills(np);

      toastInfo = { msg: drops.join("  ·  "), tone: leveled ? "level" : "loot" };
      return np;
    });
    if (toastInfo) pushToast(toastInfo.msg, toastInfo.tone);
  };

  // Solo Zindan'ın boss aşaması yenildiğinde applyLoot'un normal
  // altın/XP/drop'una EK olarak verilen tamamlama ödülü — bonus altın boss'un
  // kendi (zaten tier'a göre ölçeklenmiş) altın aralığına göre, garanti bir
  // sandık da haritanın loot tier'ında. Kesin zindan-özel loot tablosu henüz
  // tasarlanmadı (bkz. data/soloDungeon.js'in üstündeki not) — bu, o
  // tasarım gelene kadar makul bir varsayılan.
  const grantDungeonCompletionReward = (boss) => {
    const bonusGold = rand(boss.goldMin, boss.goldMax) * 2;
    let toastMsg = "";
    setPlayer((p) => {
      const chest = { id: uid(), tier: map.tier };
      toastMsg = `Zindan tamamlandı! ${boss.name} yenildi. +${bonusGold} altın, T${map.tier} Sandık kazandın.`;
      return { ...p, gold: p.gold + bonusGold, chests: [...p.chests, chest] };
    });
    pushToast(toastMsg, "level");
    setDungeonComplete({ mapName: map.name, bonusGold, chestTier: map.tier });
  };

  // Shared tail-end for both attack() and useSkill(): the monster's counter
  // swing (if it's still alive) plus win/loss resolution. `extra` folds in
  // whatever the caller's own action already changed (buffs/dot/cooldowns/
  // monsterHp/log) on top of the tick() result. `currentHp` defaults to the
  // player prop's hp (fine for attack(), which never heals mid-action) but
  // MUST be passed explicitly by any caller that just healed the player in
  // this same action (useSkill's heal branch, handlePotion) — otherwise the
  // death check below reads the stale pre-heal hp and can wrongly end the
  // battle (or even show "Bayıldın") on a hit the player actually survived.
  const resolveMonsterTurn = (monsterHp, log, extra, currentHp = player.hp) => {
    if (monsterHp <= 0) {
      log = pushLog(log, `${monster.name} yenildi.`);
      const wonMonster = monster;
      setBattle({ ...battle, ...extra, monsterHp, log, finished: true });
      // lock stays engaged through this window so extra clicks can't
      // trigger a second loot/level-up off the same kill
      setTimeout(() => {
        applyLoot(wonMonster);
        attackLockRef.current = false;

        // Solo Zindan koşusu sürüyorsa "Tekrar Savaş?" akışına hiç girmez —
        // bir sonraki aşamaya (ya da boss'sa tamamlama ödülüne) otomatik
        // geçer (kullanıcı isteği: "aşamalı olarak gitgide güçleşen ...
        // etkinlik"). dungeonRun burada render zamanındaki değeriyle
        // kapanıyor — attackLockRef zaten bu pencere boyunca yeni bir
        // aksiyonu engellediği için state ile senkron kalır.
        if (dungeonRun) {
          if (wonMonster.isBoss) {
            grantDungeonCompletionReward(wonMonster);
            setDungeonRun(null);
            setMonster(null);
            setBattle(null);
          } else {
            const nextStage = dungeonRun.stages[dungeonRun.index + 1];
            setDungeonRun({ ...dungeonRun, index: dungeonRun.index + 1 });
            pushToast(`Aşama ${dungeonRun.index + 2}/${dungeonRun.stages.length} başlıyor!`, "default");
            startBattle(nextStage, { preserveAutoBattle: true });
          }
          return;
        }

        setMonster(null);
        setBattle(null);
        // Ana ekrana otomatik dönmek yerine "Tekrar Savaş?" onayı çıkıyor
        // (kullanıcı isteği) — sonraki savaş hâlâ buradan "Evet"/"Hayır" ile
        // elle karara bağlanıyor, sadece Otomatik Saldırı'nın açık durumu
        // Evet dendiğinde korunuyor (bkz. render'daki victoryMonster modalı,
        // startBattle'ın preserveAutoBattle parametresi).
        setVictoryMonster(wonMonster);
      }, 700);
      return;
    }
    const defMult = buffMultiplier(extra.buffs, "def");
    const setReduction = armorSetDamageReduction(player, "monster");
    // Gerçek KO'nun DEX→Hit Rate/Evasion Rate mantığı (bkz. utils/combat.js#
    // hitChance) — canavarın gerçek bir DEX'i yok, kendi ATK'sini bir
    // "çeviklik" vekili olarak kullanıyoruz. Iskalarsa hasar 0, zırh
    // yıpranmıyor, ama canavarın vuruşu yine de bir tur harcıyor.
    const monsterHits = rollHit(monster.atk, player.stats.dex, map.levelMax);
    const mdmg = monsterHits
      ? Math.max(1, Math.round(mitigate(monster.atk, def * defMult, PLAYER_DEF_K) * (1 - setReduction) + rand(-2, 3)))
      : 0;
    const playerDied = currentHp - mdmg <= 0;
    log = pushLog(log, monsterHits ? `${monster.name} sana ${mdmg} hasar verdi.` : `${monster.name} saldırdı ama ıskaladı.`);

    // Getting hit wears the armor down — same durability/repair loop as
    // the weapon uses on a landed hit (see utils/player.js's repair
    // system, the intended gold sink for this).
    setPlayer((p) => {
      const worn = monsterHits ? damageEquippedDurability(p, ARMOR_SLOTS, 1) : p;
      return { ...worn, hp: Math.max(0, worn.hp - mdmg) };
    });
    setBattle({ ...battle, ...extra, monsterHp, log, finished: playerDied });
    setShake("player");
    setTimeout(() => setShake(null), 260);

    if (playerDied) {
      setTimeout(() => {
        // Önceden burada sadece "canın kısmen yenilendi" diyen bir toast
        // vardı ama hiçbir kod gerçekten can/mana geri yüklemiyordu — hp 0'da
        // kalıp bir sonraki savaşa öyle giriliyordu (kullanıcının bildirdiği
        // "düşük canla başlıyoruz" bug'ı). Artık applyDeathPenalty hem
        // hp/mp'yi gerçekten tam dolduruyor hem de küçük bir XP cezası
        // uyguluyor, DeathModal da bunu net bir "Öldün!" uyarısıyla gösteriyor.
        let xpLost = 0;
        setPlayer((p) => {
          const result = applyDeathPenalty(p);
          xpLost = result.xpLost;
          return result.player;
        });
        setDeathInfo({ xpLost });
        endBattle();
        // Zindanda ölmek koşuyu bitirir — kalan aşamalar/boss ödülü kaybedilir,
        // giriş hakkı zaten enterSoloDungeon'da harcanmıştı (geri gelmiyor).
        if (dungeonRun) setDungeonRun(null);
      }, 500);
    } else {
      // normal exchange resolved — release the lock after a short cooldown
      // so combat still feels turn-paced instead of instant multi-hits
      setTimeout(() => { attackLockRef.current = false; }, 320);
    }
  };

  const attack = () => {
    if (attackLockRef.current) return;
    if (!battle || battle.finished || player.hp <= 0) return;
    attackLockRef.current = true;

    const ticked = tickBattleEffects(battle);
    if (ticked.monsterHp <= 0) { resolveMonsterTurn(ticked.monsterHp, ticked.log, ticked); return; }

    const atkMult = buffMultiplier(ticked.buffs, "atk");
    const isCrit = Math.random() < cls.crit;
    // Aynı DEX→Hit Rate/Evasion Rate mekaniği (bkz. resolveMonsterTurn'daki
    // aynı not) — oyuncu da ıskalayabiliyor artık, canavarın ATK'si yine
    // onun "çeviklik" vekili.
    const playerHits = rollHit(player.stats.dex, monster.atk, player.level);
    const dmg = playerHits
      ? Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * atkMult * (isCrit ? 1.8 : 1), monster.def, MONSTER_DEF_K) + rand(-2, 3)))
      : 0;
    const monsterHp = Math.max(0, ticked.monsterHp - dmg);
    const log = pushLog(ticked.log, !playerHits ? "Vuruşunu ıskaladın." : isCrit ? `Kritik vuruş! ${dmg} hasar verdin.` : `${dmg} hasar verdin.`);

    // Every swing wears the weapon down a little — see utils/player.js's
    // repair system, the intended gold sink for this (misses don't wear it).
    if (playerHits) setPlayer((p) => damageEquippedDurability(p, WEAPON_SLOTS, 1));

    setShake("monster");
    setTimeout(() => setShake(null), 260);

    resolveMonsterTurn(monsterHp, log, ticked);
  };

  // Beceri kutucuklarından biri — aynı tur ritmine oturur (bkz. attack
  // yukarıda): önce süregelen etkiler işler, sonra becerinin kendi etkisi,
  // sonra canavarın karşılığı. effect.type ayrımı burada, hesap kısmı
  // utils/skills.js#computeSkillDamage/computeSkillHeal'da.
  const useSkill = (skillId) => {
    if (attackLockRef.current) return;
    if (!battle || battle.finished || player.hp <= 0) return;
    const skill = classSkills(player.class).find((s) => s.id === skillId);
    if (!skill) return;
    if ((battle.skillCooldowns[skillId] || 0) > 0) { pushToast("Bu beceri hâlâ bekleme süresinde.", "warn"); return; }
    if (player.mp < skill.mpCost) { pushToast("Yeterli manan yok.", "warn"); return; }
    attackLockRef.current = true;

    const ticked = tickBattleEffects(battle);
    const skillCooldowns = { ...ticked.skillCooldowns, [skillId]: skill.cooldown };
    const maxHp = playerMaxHp(player);
    const e = skill.effect;

    if (ticked.monsterHp <= 0) {
      setPlayer((p) => ({ ...p, mp: p.mp - skill.mpCost }));
      resolveMonsterTurn(ticked.monsterHp, ticked.log, { ...ticked, skillCooldowns });
      return;
    }

    let monsterHp = ticked.monsterHp;
    let log = ticked.log;
    let buffs = ticked.buffs;
    let dot = ticked.dot;
    let healAmt = 0;

    if (e.type === "damage" || e.type === "execute") {
      const monsterHpPct = ticked.monsterHp / battle.monsterMaxHp;
      const atkMult = buffMultiplier(ticked.buffs, "atk");
      const dmg = Math.max(1, Math.round(computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct, rand }) * atkMult));
      monsterHp = Math.max(0, ticked.monsterHp - dmg);
      log = pushLog(log, `${skill.name}! ${dmg} hasar verdin.`);
      setShake("monster");
      setTimeout(() => setShake(null), 260);
    } else if (e.type === "heal") {
      healAmt = computeSkillHeal(skill, maxHp);
      log = pushLog(log, `${skill.name}! +${healAmt} can.`);
    } else if (e.type === "buffAtk" || e.type === "buffDef") {
      buffs = [...buffs, { stat: e.type === "buffAtk" ? "atk" : "def", mult: e.mult, turnsLeft: e.turns }];
      log = pushLog(log, `${skill.name}! Güçlendin.`);
    } else if (e.type === "dot") {
      const perTick = computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct: 1, rand: () => 0 });
      dot = { dmgPerTurn: perTick, turnsLeft: e.turns };
      log = pushLog(log, `${skill.name}! Hedef sürekli hasar almaya başladı.`);
      setShake("monster");
      setTimeout(() => setShake(null), 260);
    }

    const nextHp = healAmt ? Math.min(playerMaxHp(player), player.hp + healAmt) : player.hp;
    setPlayer((p) => ({ ...p, mp: p.mp - skill.mpCost, hp: healAmt ? Math.min(playerMaxHp(p), p.hp + healAmt) : p.hp }));
    resolveMonsterTurn(monsterHp, log, { buffs, dot, skillCooldowns, potionCooldowns: ticked.potionCooldowns }, nextHp);
  };

  // Pot içmek de bir savaş aksiyonu — canavarın karşılığını tetikler, aynı
  // 2 turluk bekleme her iki pot için de ayrı ayrı işler (bkz.
  // EMPTY_BATTLE_EFFECTS). Bu yüzden aynı anda hem can hem mana potu
  // basılamaz — her ikisi de kendi turunu harcar.
  const handlePotion = (kind) => {
    if (attackLockRef.current) return;
    if (!battle || battle.finished || player.hp <= 0) return;
    if ((battle.potionCooldowns[kind] || 0) > 0) { pushToast("Bu pot hâlâ bekleme süresinde.", "warn"); return; }
    const tier = bestAvailablePotionTier(player, kind);
    if (!tier) { pushToast("Pot kalmadı.", "warn"); return; }
    const result = usePotion(player, kind, tier);
    if (result.reason) { pushToast(result.reason, "warn"); return; }
    attackLockRef.current = true;

    const ticked = tickBattleEffects(battle);
    const potionCooldowns = { ...ticked.potionCooldowns, [kind]: POTION_COOLDOWN_TURNS };

    if (ticked.monsterHp <= 0) {
      setPlayer(() => result.player);
      resolveMonsterTurn(ticked.monsterHp, ticked.log, { ...ticked, potionCooldowns });
      return;
    }

    setPlayer(() => result.player);
    const log = pushLog(ticked.log, kind === "hp" ? `+${result.healed} can kullandın.` : `+${result.healed} mana kullandın.`);
    resolveMonsterTurn(ticked.monsterHp, log, { ...ticked, potionCooldowns }, result.player.hp);
  };

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
    if (!autoBattleAccess) { pushToast("Otomatik Saldırı bir Apex/Mythic Premium özelliğidir.", "warn"); return; }
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
              {pendingMap.name}'e ışınlanmak {GATE_TELEPORT_COST} altın tutar. Onaylıyor musun?
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setPendingMap(null)}>Hayır</button>
              <button style={{ ...styles.tinyBtn, background: pendingMap.color }} onClick={confirmTeleport}>Evet</button>
            </div>
          </div>
        </div>
      )}

      {!monster && (
        <>
          <SectionLabel>Günlük Solo Zindan</SectionLabel>
          <div style={{ ...styles.itemDetailCard, borderColor: "#A34FD966", background: "#A34FD90d", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Castle size={20} color="#A34FD9" strokeWidth={1.6} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{map.name} Zindanı</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                  5 gitgide güçleşen aşama + boss. Günde {SOLO_DUNGEON_DAILY_LIMIT} kez girilebilir.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Bugün {dungeonEntriesLeft(player)}/{SOLO_DUNGEON_DAILY_LIMIT} giriş hakkın var.
              </span>
              <button
                style={{
                  ...styles.tinyBtn,
                  ...(dungeonEntriesLeft(player) > 0 && !locked
                    ? { background: "#A34FD9" }
                    : { background: "var(--bg-panel-alt)", color: "var(--text-faint)" }),
                }}
                disabled={dungeonEntriesLeft(player) <= 0 || locked}
                onClick={enterSoloDungeon}
              >
                Zindana Gir
              </button>
            </div>
          </div>

          <SectionLabel>Kapı · Bölge seç</SectionLabel>
          <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: -6, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <DoorOpen size={12} /> Başka bir haritaya ışınlanmak {GATE_TELEPORT_COST} altın tutar.
          </p>
          <div style={styles.tierScroller}>
            {MAPS.map((m2) => {
              const mlocked = player.level < m2.levelMin;
              const isSel = m2.id === map.id;
              return (
                <button
                  key={m2.id}
                  onClick={() => requestTeleport(m2)}
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
              title={`${map.name} kilitli`}
              subtitle={`Bu bölgeye girmek için Lv.${map.levelMin} olman gerekiyor.`}
            />
          ) : (
            <>
              <SectionLabel>{map.name} · canavarlar</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {map.monsters.map((m) => (
                  <div key={m.id} style={{ ...styles.monsterCard, borderColor: `${map.color}44` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...styles.monsterIcon, background: `${map.color}22`, color: map.color }}>
                        <Skull size={18} strokeWidth={1.6} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 10, marginTop: 3 }}>
                          <span>HP {m.hp}</span><span>ATK {m.atk}</span><span>DEF {m.def}</span>
                        </div>
                      </div>
                    </div>
                    <button style={{ ...styles.smallBtn, background: map.color }} onClick={() => startBattle(m)}>
                      Savaşı Başlat
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.dropInfoRow}>
                <span>Drop şansı: Ekipman (Zırh/Silah) %10 · Sandık %5</span>
              </div>
            </>
          )}
        </>
      )}

      {monster && battle && (
        <div style={styles.battleArena}>
          {dungeonRun && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#A34FD914", border: "1px solid #A34FD944" }}>
              <span style={{ fontSize: 11, color: "#A34FD9", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5 }}>
                <Castle size={12} /> Zindan · Aşama {dungeonRun.index + 1}/{dungeonRun.stages.length}
              </span>
              {monster.isBoss && <span style={{ fontSize: 10, color: "#D4AF6A", fontFamily: "var(--font-mono)" }}>BOSS</span>}
            </div>
          )}
          <div className={shake === "monster" ? "shake" : ""} style={{ ...styles.combatant, borderColor: `${map.color}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{monster.name}</span>
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

          <div ref={logRef} style={styles.combatLog}>
            {battle.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
            {player.skills.loadout.map((skillId, i) => {
              if (!skillId) {
                return (
                  <div key={i} style={{ ...styles.equipSlotCard, opacity: 0.4 }}>
                    <Plus size={12} color="var(--text-faint)" />
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
                  style={{ ...styles.equipSlotCard, borderColor: `${cls.color}66`, background: `${cls.color}12`, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}
                  onClick={() => useSkill(skillId)}
                  disabled={disabled}
                  title={`${skill.name} — MP ${skill.mpCost}`}
                >
                  <SkillIcon effectType={skill.effect.type} size={15} color={cls.color} />
                  <div style={{ fontSize: 7, marginTop: 2, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    {cdLeft > 0 ? cdLeft : `${skill.mpCost}mp`}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: (playerDead || battle.finished) ? 0.5 : 1 }} onClick={attack} disabled={playerDead || battle.finished}>
              <Sword size={15} /> Saldır
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
              onClick={() => {
                endBattle();
                // Zindan koşusu sürerken elle geri çekilmek koşuyu yarıda
                // bırakır — kalan aşamalar/boss ödülü kaybedilir, giriş hakkı
                // (zaten enterSoloDungeon'da harcandı) geri gelmiyor.
                if (dungeonRun) { setDungeonRun(null); pushToast("Zindan koşusu yarıda bırakıldı.", "warn"); }
              }}
            >
              <ArrowLeft size={13} /> Geri Çekil
            </button>
            {/* Savaş ekranının ALTINDA, küçük bir ikon (kullanıcı isteği —
                önceden ekranın en üstünde, tam genişlikte bir anahtardı).
                Apex/Mythic Premium olmayanlar için kilitli görünür — tıklayınca
                döngüyü açmaz, sadece uyarı toast'ı gösterir. */}
            <button
              onClick={toggleAutoBattle}
              title={autoBattleAccess ? `Otomatik Saldırı — ${autoBattleOn ? "Açık" : "Kapalı"}` : "Otomatik Saldırı bir Apex/Mythic Premium özelliğidir"}
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
                  <span>HP Pot Eşiği</span>
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
                  <span>MP Pot Eşiği</span>
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
                  Otomatik Beceri Kullan — {player.autoBattle?.autoSkill ? "Açık" : "Kapalı"}
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

      {victoryMonster && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setVictoryMonster(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Trophy size={32} color="#D4AF6A" strokeWidth={1.3} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>Tekrar Savaş?</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center", maxWidth: 220 }}>
              {victoryMonster.name}'i yendin. Tekrar savaşmak ister misin?
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}
                onClick={() => {
                  setVictoryMonster(null);
                  setPlayer((p) => (p.autoBattle?.enabled ? { ...p, autoBattle: { ...p.autoBattle, enabled: false } } : p));
                }}
              >
                Hayır
              </button>
              <button
                style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#0B0C10" }}
                onClick={() => { const m = victoryMonster; setVictoryMonster(null); startBattle(m, { preserveAutoBattle: true }); }}
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {dungeonComplete && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setDungeonComplete(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Castle size={32} color="#A34FD9" strokeWidth={1.3} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>Zindan Tamamlandı!</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center", maxWidth: 240 }}>
              {dungeonComplete.mapName} Zindan Efendisi'ni yendin — +{dungeonComplete.bonusGold} altın ve T{dungeonComplete.chestTier} Sandık kazandın.
            </div>
            <button style={{ ...styles.tinyBtn, background: "#A34FD9", marginTop: 20 }} onClick={() => setDungeonComplete(null)}>
              Harika!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
