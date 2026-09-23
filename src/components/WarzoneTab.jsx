import PracticeDuel from './PracticeDuel';
import {createDuel,stepDuel} from '../utils/duelEngine';
import {comparablePlayer} from '../utils/pvpBalance';
import {playSkill} from '../audio/sfx';
import {wingMultiplier} from '../data/wings';
import RankBadge from './shared/RankBadge';
import MenuEmblem from './icons/MenuEmblem';
import { useState, useEffect, useRef } from "react";
import MonsterPortrait from './MonsterPortrait';
import { Skull, Swords, Heart, Zap, Lock, Gift, LogOut, DoorOpen, Users, Percent, Loader2, X } from "lucide-react";
import {
  WARZONE_UNLOCK_LEVEL, WARZONE_TELEPORT_COST, WARZONE_BOSSES, WARZONE_TICK_MS,
  GHOST_POPULATION, GHOST_REPLACE_SECONDS, AMBUSH_CHANCE_PER_TICK,
  WARZONE_HUNT_AMBUSH_GOLD_LOSS_PCT, WARZONE_HUNT_AMBUSH_GOLD_LOSS_CAP,
} from "../data/warzone";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { MAPS } from "../data/maps";
import { spawnGhost, tickWorldBoss } from "../utils/warzoneCombat";
import { bossSchedule, pickWeightedWinner } from "../utils/warzoneBoss";
import { awardNationalPoint, penalizeNationalPoint } from "../utils/nationalPoint";
import { NP_LOSS_PENALTY, NP_RECOVERY_NP_AMOUNT } from "../utils/nationalPointConstants";
import { leaderboardFor } from "../utils/leaderboard";
import { rollLoot } from "../utils/loot";
import { grantMonsterReward } from "../utils/monsterRewards";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { totalStats, playerDef, playerMaxHp, playerMaxMp, displayClassName, applyDeathPenalty, armorSetDamageReduction, clampGold, formatGold } from "../utils/player";
import { premiumNpLossReduction } from "../utils/premium";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, rollHit } from "../utils/combat";
import { usePotion, bestAvailablePotionTier } from "../utils/potions";
import { rand, uid, pick } from "../utils/random";
import { newlyUnlocked } from "../utils/achievements";
import { playLevelUp, playHit, playMiss, playHurt, playPotion } from "../audio/sfx";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import BarTrack from "./shared/BarTrack";
import DeathModal from "./DeathModal";
import LevelUpModal from "./LevelUpModal";
import BattleScene, { hasBattleScene } from "./BattleScene";
import DuelScene from "./DuelScene";
import { getWarzoneBossConfig, getWarzoneHuntConfig } from "../utils/dropConfig";
import { tierName } from "../data/itemRarity";
import { useTranslation } from "../i18n/LanguageContext";

// Canavar Ara'nın canavar havuzu — Crimson Battlefront'un mevcut roster'ı
// (bkz. data/maps.js), yeni içerik üretmeden Savaş Alanı'na "en zorlu
// canavarlarla karşılaşma" hissi katıyor.
const CRIMSON_MAP = MAPS.find((m) => m.id === "crimson_battlefront");

// Kullanıcı isteği: "Tüm dropları düzenleyebileceğim bir sistem" — bir
// boss'un ham WARZONE_BOSSES girdisine admin.html'de kaydedilmiş bir
// override varsa (bkz. utils/dropConfig.js#getWarzoneBossConfig) üstüne
// biniyor, yoksa boss aynen kalıyor. Tüm boss okuma noktaları (roster
// JSX'i, attackBoss, warzoneTick) bu tek fonksiyondan geçiyor ki hiçbiri
// ham (override'sız) değerleri unutup kullanmasın.
function effectiveBoss(boss) {
  const override = getWarzoneBossConfig(boss.id);
  return override ? { ...boss, ...override } : boss;
}

const GHOST_REPLACE_TICKS = Math.max(1, Math.round((GHOST_REPLACE_SECONDS * 1000) / WARZONE_TICK_MS));

function fmtMmSs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const POTION_COOLDOWN_TURNS = 2;

// Kullanıcı isteği: "Boss oldukları için diğerlerinden en az 2-3 kat daha
// büyük olsun" — BattleScene.jsx'in enemyScale prop'una geçiliyor.
const BOSS_VISUAL_SCALE = 2.4;

function freshWz(player) {
  return {
    bosses: {}, // { [bossId]: { spawnAt, hp, damageByPlayer, damageByGhost, resolved } } — bkz. warzoneTick
    ghosts: Array.from({ length: GHOST_POPULATION }, () => spawnGhost(player)),
    log: [],
    duel: null,
    hunt: null,
    searching: null,
  };
}

// Bir tick'te: her boss için zamanlamaya bakılıyor (bkz. utils/warzoneBoss.js#
// bossSchedule) — "active" faza YENİ girmişse taze bir savaş durumu
// başlatılıyor, hâlâ "active"se hayaletlerin vuruşu işleniyor, "gone"a
// düşmüşse (öldürülmeden pencere kapanmışsa) hiçbir ödül vermeden
// sessizce çözülüyor. Öldürülen bosslar `bossResolutions`'a ekleniyor —
// asıl loot dağıtımı (Math.random tabanlı ağırlıklı çekiliş +
// setPlayer/pushToast) çağıran tarafta (tick effect'i) yapılıyor, bu
// fonksiyon PvE hasarı dışında side-effect üretmiyor.
function warzoneTick(wz, player, t, tm, huntActive, now) {
  const bosses = { ...wz.bosses };
  let ghosts = wz.ghosts;
  const lines = [];
  const bossResolutions = [];

  for (const rawBoss of WARZONE_BOSSES) {
    const boss = effectiveBoss(rawBoss);
    const sched = bossSchedule(boss, now);
    let state = bosses[boss.id];
    if (sched.phase === "active") {
      if (!state || state.spawnAt !== sched.spawnAt) {
        state = { spawnAt: sched.spawnAt, hp: boss.hp, damageByPlayer: 0, damageByGhost: {}, resolved: false };
        lines.push(t("warzone.log.bossSpawned", { boss: tm(boss) }));
      }
      if (!state.resolved) {
        const activeGhosts = ghosts.filter((g) => !g.gone && !g.dueling);
        if (activeGhosts.length > 0) {
          const result = tickWorldBoss(boss, state.hp, activeGhosts, state.damageByGhost);
          state = { ...state, hp: result.hp, damageByGhost: result.damageByGhost };
          lines.push(...result.hits.map((h) => t("warzone.log.ghostHitBoss", { ghost: h.ghostName, boss: tm(boss), dmg: h.dmg })));
        }
        if (state.hp <= 0) {
          state = { ...state, resolved: true };
          bossResolutions.push({ boss, damageByPlayer: state.damageByPlayer, damageByGhost: state.damageByGhost, ghosts });
        }
      }
      bosses[boss.id] = state;
    } else if (sched.phase === "gone" && state && !state.resolved) {
      bosses[boss.id] = { ...state, resolved: true };
    }
  }

  ghosts = ghosts.map((g) => {
    if (!g.gone) return g;
    const respawnTicks = g.respawnTicks - 1;
    return respawnTicks <= 0 ? spawnGhost(player) : { ...g, respawnTicks };
  });

  let ambushGhost = null;
  const idle = ghosts.filter((g) => !g.gone && !g.dueling);
  if (huntActive && idle.length > 0 && Math.random() < AMBUSH_CHANCE_PER_TICK) {
    ambushGhost = idle[Math.floor(Math.random() * idle.length)];
  }

  return { bosses, ghosts, lines, bossResolutions, ambushGhost };
}

// Düello başlar başlamaz yazı-tura atılır — %50 ihtimalle rakip önce
// vuruyor (kullanıcı isteği: "sıra tabanlı ... yazı tura sistemi gibi").
// Saf fonksiyon: ghostFirstDmg'i player.hp'ye uygulamak (ve gerekiyorsa
// ölüm kontrolü yapmak) çağıranın işi — bkz. startDuel ve tick effect'teki
// ambush dalı, ikisi de aynı setPlayer+ölüm-kontrolü desenini kullanıyor.
function initiateDuel(ghost, def, player, t) {
  const avatar=ghost.avatar||comparablePlayer(player,ghost.cls);
  const engine=createDuel(player,avatar,{seed:Math.floor(Math.random()*4294967295)});
  const log=[t('warzone.log.duelAppeared',{ghost:ghost.name}),t(engine.first?'warzone.log.coinFlipGhostFirst':'warzone.log.coinFlipPlayerFirst')];
  return {duel:{ghost,ghostHp:engine.fighters[1].hp,log,finished:false,engine},ghostFirstDmg:0};
}

export default function WarzoneTab({ player, setPlayer, pushToast, onEnteredChange }) {
  const { t, tm, lang } = useTranslation();
  const cls = CLASSES[player.class];
  const atk = totalStats(player).atk;
  const def = playerDef(player);
  const maxHp = playerMaxHp(player);
  const maxMp = playerMaxMp(player);

  const [subtab, setSubtab] = useState("alan");
  const [wz, setWz] = useState(() => freshWz(player));
  const [confirmingRetreat, setConfirmingRetreat] = useState(false);
  const [entered, setEntered] = useState(false);
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [expandedBossId, setExpandedBossId] = useState(null);
  // Kullanıcı isteği: "Savaş alanında neden karakterimiz ve düşmanımız
  // karşılıklı gözükmüyor?" — BattleTab.jsx#showAction/setVisual ile aynı
  // desen, sadece burada üç ayrı savaş türü (boss/av/düello) olduğu için
  // her biri kendi visual state'ini taşıyor. bossVisuals boss id'ye göre
  // ayrı tutuluyor çünkü aynı anda birden fazla boss aktif olabiliyor.
  const [huntVisual, setHuntVisual] = useState({ id: 0, type: "", label: "" });
  const [bossVisuals, setBossVisuals] = useState({});
  const [duelVisual, setDuelVisual] = useState({ id: 0, type: "", label: "" });
  const [duelShake, setDuelShake] = useState(null); // 'player' | 'ghost' | null
  const [deathInfo, setDeathInfo] = useState(null); // { xpLost } | null — drives DeathModal (Dünya Canavarı/Canavar Ara elinde ölüm)
  const [levelUpInfo, setLevelUpInfo] = useState(null); // Canavar Ara XP verdiği için (düellolar vermiyor) burada da seviye atlanabilir
  const [lbRace, setLbRace] = useState(player.race);
  const [lbCls, setLbCls] = useState(player.class);
  const [lbSort, setLbSort] = useState("weeklyPoint");
  const logRef = useRef(null);
  const lockRef = useRef(false);
  // Boss geri sayımlarının (aktif pencere kalan süresi, bkz. #bossSchedule)
  // canlı akması için — Hub.jsx#ScheduledEventBanner ile aynı desen.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Hub.jsx'in "sekmeden ayrılırken emin misin?" onayını gösterebilmesi
  // için (bkz. Hub.jsx#requestTabChange) bu bileşen alanda "entered" olup
  // olmadığını yukarı bildiriyor — kullanıcı isteği: "Savaş Alanından
  // çıkmak istediğinde emin misin diye sor." Unmount'ta da false'a geri
  // çekiyoruz ki Hub'ın bayrağı bir sonraki girişte asılı kalmasın.
  useEffect(() => {
    onEnteredChange?.(entered);
  }, [entered, onEnteredChange]);
  useEffect(() => {
    return () => onEnteredChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locked = player.level < WARZONE_UNLOCK_LEVEL;
  const npLocked = !locked && player.nationalPoint <= 0;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [wz.duel?.log?.length, wz.hunt?.log?.length]);

  // Sekmeden ayrılmak (başka bir BottomNav sekmesine geçmek) bu bileşeni
  // tamamen unmount eder — wz ephemeral olduğu için düello dahil her şey
  // sıfırlanır. Bunu düello kaybını National Point cezasından kaçmak için
  // kullanmayı engellemek üzere: yarım kalmış bir düello varken sekmeden
  // ayrılmak, düelloyu terk etmiş (kaybetmiş) saymak anlamına gelir.
  const wzRef = useRef(wz);
  useEffect(() => { wzRef.current = wz; }, [wz]);
  useEffect(() => {
    return () => {
      const duel = wzRef.current?.duel;
      if (duel && !duel.finished) {
        setPlayer((p) => {
          const goldLoss = duel.fromAmbush ? Math.min(WARZONE_HUNT_AMBUSH_GOLD_LOSS_CAP, Math.round(p.gold * WARZONE_HUNT_AMBUSH_GOLD_LOSS_PCT)) : 0;
          return { ...penalizeNationalPoint(p), gold: Math.max(0, p.gold - goldLoss) };
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gerçek-zamanlı alan simülasyonu — düello sırasında duraklar (bkz.
  // aşağıdaki erken return). Recursive setTimeout kullanıyoruz (setInterval
  // değil) ki her tur en güncel `wz`/`player`'ı görsün, eski closure sorunu
  // yaşanmasın; StrictMode'un dev'de effect'i iki kez çalıştırması da
  // cleanup ile (clearTimeout) güvenli.
  useEffect(() => {
    if (locked || npLocked || !entered || wz.duel) return;
    const timer = setTimeout(() => {
      // `wz`/`player` burada garanti güncel: bu effect [wz, player, ...]'a
      // bağımlı olduğu için herhangi bir değişiklik bu timer'ı zaten iptal
      // edip yenisini kurar — yani setWz'e bir updater fonksiyonu yerine
      // doğrudan hesaplanmış bir nesne veriyoruz (StrictMode'un updater
      // fonksiyonlarını iki kez çağırdığı senaryoyu, ve iki farklı
      // Math.random() sonucunun dışarıdaki closure değişkenleriyle
      // commit edilen state'ten sapma ihtimalini baştan ortadan kaldırır).
      const huntActive = !!wz.hunt;
      const result = warzoneTick(wz, player, t, tm, huntActive, Date.now());
      let next = { ...wz, bosses: result.bosses, ghosts: result.ghosts, log: [...wz.log, ...result.lines].slice(-24) };
      let ambushFirstDmg = 0;
      if (result.ambushGhost) {
        const initiated = initiateDuel(result.ambushGhost, def, player, t);
        ambushFirstDmg = initiated.ghostFirstDmg;
        next = {
          ...next,
          ghosts: next.ghosts.map((g) => (g.id === result.ambushGhost.id ? { ...g, dueling: true } : g)),
          duel: { ...initiated.duel, fromAmbush: true },
          // Kullanıcı isteği: pusu sadece Canavar Ara'yı yarıda kesiyor —
          // yarım kalan av için hiçbir ödül verilmiyor.
          hunt: null,
        };
      }
      setWz(next);
      // Hayaletlerin öldürdüğü bosslar için loot dağıtımı (ağırlıklı
      // çekiliş) — oyuncunun kendi vuruşuyla öldürdüğü boss #attackBoss'un
      // kendi içinde, aynı resolveBossLoot ile ayrıca çözülüyor.
      result.bossResolutions.forEach(resolveBossLoot);
      if (result.ambushGhost) {
        pushToast(t("warzone.toast.huntAmbush", { ghost: result.ambushGhost.name }), "warn");
        if (ambushFirstDmg > 0) {
          const wouldDie = player.hp - ambushFirstDmg <= 0;
          setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - ambushFirstDmg) }));
          if (wouldDie) setTimeout(() => finishDuelAsLoss(result.ambushGhost.id), 500);
        }
      }
    }, WARZONE_TICK_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wz, player, locked, npLocked, entered]);

  // Kullanıcı isteği: "Canavar Ara" dediğimizde 5-15 saniye arası rastgele
  // bir "aranıyor" süresi olsun, canavar anında çıkmasın (bkz. aşağıdaki
  // startHunt). Tüm hook'lar (bu dahil) erken return'lerden ÖNCE olmak
  // ZORUNDA — Rules of Hooks, aksi halde `entered` false/true'ya göre
  // farklı sayıda hook çağrılır ve React "Rendered more hooks" hatası atar.
  useEffect(() => {
    if (!wz.searching) return;
    const timer = setTimeout(() => {
      const template = pick(CRIMSON_MAP.monsters);
      // Güç çarpanı sadece savaş istatistiklerine (hp/atk/def) uygulanıyor —
      // xp/goldMin/goldMax bilerek taban (Crimson Battlefront'un kendi)
      // değerinde kalıyor, ödül ayrı bir çarpanla (bkz. huntAction#grantMonsterReward
      // çağrısındaki opts) yönetiliyor. Çarpanın kendisi artık admin.html'de
      // bir override varsa onu kullanıyor (bkz. utils/dropConfig.js#getWarzoneHuntConfig).
      const huntPowerMult = getWarzoneHuntConfig().powerMult;
      const hp = Math.round(template.hp * huntPowerMult);
      const monster = {
        ...template,
        hp,
        maxHp: hp,
        atk: Math.round(template.atk * huntPowerMult),
        def: Math.round(template.def * huntPowerMult),
      };
      setWz((prev) => (prev.searching ? { ...prev, searching: null, hunt: { monster, potionCooldowns: { hp: 0, mp: 0 }, log: [t("warzone.log.huntAppeared", { monster: monster.name })] } } : prev));
    }, wz.searching.durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wz.searching]);

  // Kullanıcı isteği: "1v1'ler otomatik savaş olacak. Karşılıklı olarak
  // otomatik savaşacaklar. Kazanan bu şekilde adil ortaya çıkacak." —
  // düello başladıktan sonra hiçbir manuel tıklama gerekmiyor, bu effect
  // bitene kadar turları kendiliğinden oynatıyor. runDuelTurn aşağıda
  // (erken return'lerden SONRA) tanımlı olsa da, senkron render sırasında
  // bu satıra ulaşıldığında const'u zaten atanmış oluyor — tıpkı aşağıdaki
  // tick effect'in de erken return'lerden önce, ama resolveBossLoot'u
  // (yine sonradan tanımlı) çağırdığı gibi (bkz. o effect'in yorum notu).
  useEffect(() => {
    if (!wz.duel || wz.duel.finished) return;
    const timer = setTimeout(() => { runDuelTurn(); }, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wz.duel]);

  if (locked || npLocked) {
    return (
      <div style={styles.panelScroll}>

        <PracticeDuel player={player}/>
        {locked ? (
          <EmptyState icon={Lock} title={t("warzone.lockedTitle")} subtitle={t("warzone.lockedSubtitle", { level: WARZONE_UNLOCK_LEVEL })} />
        ) : (
          <EmptyState icon={Lock} title={t("warzone.npLockedTitle")} subtitle={t("warzone.npLockedSubtitle", { amount: NP_RECOVERY_NP_AMOUNT })} />
        )}
      </div>
    );
  }

  // Sekmeye her dönüşte bileşen sıfırdan mount olduğu için (bkz. yukarıdaki
  // unmount-cezası effect'i) bu onay ekranı de facto "her girişte bir kez"
  // gösteriliyor — Kapı ışınlanmasıyla aynı ruh (bkz. BattleTab#teleportTo).
  if (!entered) {
    const canAfford = player.gold >= WARZONE_TELEPORT_COST;
    return (
      <div style={styles.panelScroll}>

        <EmptyState
          icon={DoorOpen}
          title={t("warzone.enterTitle")}
          subtitle={t("warzone.enterSubtitle", { cost: formatGold(WARZONE_TELEPORT_COST), have: formatGold(player.gold) })}
        />
        <button
          style={{ ...styles.primaryBtn, width: "100%", marginTop: 4, background: "#C9425A", opacity: canAfford ? 1 : 0.5 }}
          disabled={!canAfford}
          onClick={() => setConfirmingEntry(true)}
        >
          <DoorOpen size={14} /> {t("warzone.teleportBtn", { cost: WARZONE_TELEPORT_COST })}
        </button>

        <PracticeDuel player={player}/>
        {confirmingEntry && (
          <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setConfirmingEntry(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <DoorOpen size={28} color="#C9425A" strokeWidth={1.4} />
              <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
                {t("warzone.teleportConfirm", { cost: formatGold(WARZONE_TELEPORT_COST) })}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingEntry(false)}>{t("warzone.no")}</button>
                <button
                  style={{ ...styles.tinyBtn, background: "#C9425A" }}
                  onClick={() => {
                    setPlayer((p) => ({ ...p, gold: p.gold - WARZONE_TELEPORT_COST }));
                    pushToast(t("warzone.toast.teleported", { cost: formatGold(WARZONE_TELEPORT_COST) }), "default");
                    setEntered(true);
                    setConfirmingEntry(false);
                  }}
                >
                  {t("warzone.yes")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const REASON_KEY = { "ağırlık kapasitesi dolu.": "battle.reason.weightFull", "çanta dolu.": "battle.reason.bagFull" };

  // ---- Boss: oyuncunun kendi vuruşu (bkz. utils/warzoneBoss.js'in üstündeki
  // not — sadece bossSchedule'ın "active" dediği bosslara saldırılabilir) ----
  const attackBoss = (bossId) => {
    const rawBoss = WARZONE_BOSSES.find((b) => b.id === bossId);
    const boss = rawBoss && effectiveBoss(rawBoss);
    const activeState = wz.bosses[bossId];
    if (lockRef.current || wz.duel || !boss || !activeState || activeState.resolved || player.hp <= 0) return;
    lockRef.current = true;
    setBossVisuals((bv) => ({ ...bv, [bossId]: { id: (bv[bossId]?.id || 0) + 1, type: "attack", label: t("battle.actionAttack") } }));
    const isCrit = Math.random() < cls.crit;
    // Gerçek KO'nun DEX→Hit/Evasion Rate mantığı (bkz. utils/combat.js#
    // hitChance, BattleTab.jsx#attack'taki aynı desen) — boss'un gerçek bir
    // DEX'i yok, kendi ATK'si vekil.
    const playerHitsBoss = rollHit(player.stats.dex, boss.atk, player.level);
    const dmg = playerHitsBoss
      ? Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), boss.def, MONSTER_DEF_K) + rand(-2, 3)))
      : 0;
    setBossVisuals((bv) => ({ ...bv, [bossId]: { ...bv[bossId], outgoing: { hit: playerHitsBoss, damage: dmg, crit: isCrit } } }));
    if(playerHitsBoss)playHit({crit:isCrit,cls:player.class});else playMiss();

    let resolution = null;
    let bossSurvived = false;
    setWz((prev) => {
      // Bir tick'in (hayaletlerin) bu tıklamayla aynı anda boss'u zaten
      // öldürmüş/pencereyi kapatmış olma ihtimaline karşı — `prev` her zaman
      // güncel, `wz` (dışarıdaki closure) bayat olabilir.
      const prevState = prev.bosses[bossId];
      if (!prevState || prevState.resolved) return prev;
      const hp = Math.max(0, prevState.hp - dmg);
      const damageByPlayer = prevState.damageByPlayer + dmg;
      const log = [...prev.log, !playerHitsBoss ? t("warzone.log.youMissedBoss", { boss: tm(boss) }) : isCrit ? t("warzone.log.youCritBoss", { boss: tm(boss), dmg }) : t("warzone.log.youHitBoss", { boss: tm(boss), dmg })];
      if (hp <= 0) {
        resolution = { boss, damageByPlayer, damageByGhost: prevState.damageByGhost, ghosts: prev.ghosts };
        return { ...prev, bosses: { ...prev.bosses, [bossId]: { ...prevState, hp: 0, damageByPlayer, resolved: true } }, log: log.slice(-24) };
      }
      bossSurvived = true;
      return { ...prev, bosses: { ...prev.bosses, [bossId]: { ...prevState, hp, damageByPlayer } }, log: log.slice(-24) };
    });

    if (resolution) resolveBossLoot(resolution);

    if (bossSurvived) {
      // Boss hâlâ ayaktaysa oyuncuya karşılık verir.
      const bossSetReduction = armorSetDamageReduction(player, "monster");
      const bossHitsPlayer = rollHit(boss.atk, player.stats.dex, player.level);
      const counter = bossHitsPlayer
        ? Math.max(1, Math.round(mitigate(boss.atk, def, PLAYER_DEF_K) * (1 - bossSetReduction) + rand(-2, 3)))
        : 0;
      setBossVisuals((bv) => ({ ...bv, [bossId]: { ...bv[bossId], incoming: { hit: bossHitsPlayer, damage: counter } } }));
      if(bossHitsPlayer)playHurt();else playMiss();
      const wouldDie = player.hp - counter <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - counter) }));
      setWz((prev) => ({ ...prev, log: [...prev.log, bossHitsPlayer ? t("warzone.log.bossHitYou", { boss: tm(boss), dmg: counter }) : t("warzone.log.bossMissedYou", { boss: tm(boss) })].slice(-24) }));
      if (wouldDie) {
        // Aynı düzeltme burada da geçerli — bkz. BattleTab.jsx#resolveMonsterTurn:
        // eskiden "canın kısmen yenilendi" diyen toast hiçbir şeyi geri
        // yüklemiyordu.
        setTimeout(() => {
          let xpLost = 0;
          setPlayer((p) => {
            const result = applyDeathPenalty(p);
            xpLost = result.xpLost;
            return result.player;
          });
          setDeathInfo({ xpLost });
        }, 400);
      }
    }
    setTimeout(() => { lockRef.current = false; }, 320);
  };

  // Kullanıcı isteği: "Düşen drop random olacak. Damage atan kişiler
  // arasında en yüksek damage'i atan kişi biraz daha şanslı olacak." —
  // hem oyuncunun kendi vuruşuyla öldürdüğü hem hayaletlerin öldürdüğü
  // bosslar için TEK ortak çözüm yolu (bkz. utils/warzoneBoss.js#
  // pickWeightedWinner).
  const resolveBossLoot = ({ boss, damageByPlayer, damageByGhost, ghosts }) => {
    const winnerKey = pickWeightedWinner({ ...damageByGhost, player: damageByPlayer });
    if (winnerKey === "player") {
      grantBossLoot(boss);
    } else {
      const winnerGhost = ghosts.find((g) => g.id === winnerKey);
      pushToast(t("warzone.log.bossDefeatedByOther", { boss: tm(boss), label: winnerGhost?.name || t("warzone.bossDeathLabelGhost") }), "default");
    }
  };

  const grantBossLoot = (boss) => {
    let drops = [];
    setPlayer((p) => {
      let np = { ...p, inventory: [...p.inventory], chests: [...p.chests] };
      const goldGain = rand(boss.bonusGoldMin, boss.bonusGoldMax);
      const goldBefore = np.gold;
      np.gold = clampGold(np.gold + goldGain);
      drops = [t("warzone.drop.gold", { amount: formatGold(np.gold - goldBefore) })];
      if (Math.random() < boss.equipDropChance * wingMultiplier(p, "drop")) {
        const item = rollLoot(boss.lootTier);
        // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
        // hiçbir eşya yoksa rollLoot null döner, o an hiç düşmemiş say.
        if (item) {
          const res = addItemToInventory(np, item);
          np = res.player;
          drops.push(res.added ? t("warzone.drop.itemDropped", { name: item.name }) : t("warzone.drop.itemDropFailed", { name: item.name, reason: t(REASON_KEY[res.reason] || res.reason) }));
        }
      }
      if (Math.random() < boss.chestDropChance * wingMultiplier(p, "drop")) {
        np.chests.push({ id: uid(), tier: boss.lootTier });
        drops.push(t("warzone.drop.chestDropped", { tier: tierName(lang, boss.lootTier) }));
      }
      if (Math.random() < boss.scrollDropChance * wingMultiplier(p, "drop")) {
        const scroll = makeScrollStack(boss.lootTier, 1);
        const res = addItemToInventory(np, scroll);
        np = res.player;
        drops.push(res.added ? t("warzone.drop.scrollDropped", { tier: tierName(lang, boss.lootTier) }) : t("warzone.drop.scrollDropFailed", { reason: t(REASON_KEY[res.reason] || res.reason) }));
      }
      // Bir canavarı (boss da bir canavar) öldürünce can/mana tam yenilenir.
      np.hp = playerMaxHp(np);
      np.mp = playerMaxMp(np);
      return np;
    });
    pushToast(drops.join("  ·  "), "loot");
  };

  // ---- Canavar Ara: riskli farm yolu (bkz. data/warzone.js'in üstündeki
  // not) — Crimson Battlefront'un canavarlarını avlıyor, normal avlanmadan
  // yüksek altın/drop oranıyla (bkz. utils/monsterRewards.js'in opts
  // parametresi). BattleTab.jsx#formatDrop ile aynı tipte drops dizisi
  // döndüğü için burada da aynı çeviri anahtarları (battle.drop.*) yeniden
  // kullanılıyor.
  const formatHuntDrop = (d) => {
    switch (d.type) {
      case "gold": return t("battle.drop.gold", { amount: formatGold(d.amount) });
      case "xp": return t("battle.drop.xp", { amount: d.amount });
      case "questComplete": return t("battle.drop.questComplete");
      case "questProgress": return t("battle.drop.questProgress", { current: d.current, target: d.target });
      case "dailyQuestComplete": return t("battle.drop.dailyQuestComplete", { target: d.target });
      case "itemDropped": return t("battle.drop.itemDropped", { kind: t(`battle.kind.${d.kind}`), name: d.itemName });
      case "itemDropFailed": return t("battle.drop.itemDropFailed", { name: d.itemName, reason: t(REASON_KEY[d.reason] || d.reason) });
      case "chestDropped": return t("battle.drop.chestDropped", { tier: tierName(lang, d.tier) });
      case "levelUpToast": return t("battle.drop.levelUpToast", { level: d.level, statPoints: d.statPoints });
      default: return "";
    }
  };

  // Kullanıcı isteği: "Canavar Ara" dediğimizde 5-15 saniye arası rastgele
  // bir "aranıyor" süresi olsun, canavar anında çıkmasın. Gerçek av
  // (monster üretimi) bu süre dolunca yukarıdaki useEffect'te (hook sırası
  // bozulmasın diye tüm hook'lar erken return'lerden ÖNCE olmalı) başlıyor.
  const startHunt = () => {
    if (lockRef.current || wz.duel || wz.hunt || wz.searching || player.hp <= 0) return;
    setWz((prev) => ({ ...prev, searching: { durationMs: rand(5, 15) * 1000 } }));
  };

  const abandonHunt = () => setWz((prev) => ({ ...prev, hunt: null }));

  // Kullanıcı isteği: "Canavar Ara kısmında ara dediğimiz zaman ekrana
  // Widget açılsın Aranıyor... Bekleme ekranı yükleniyor gibi. Aramayı
  // iptal etme şansımız olsun." — searching'i doğrudan null'a çekmek
  // yeterli: yukarıdaki arama-gecikmesi effect'i [wz.searching]'e bağımlı
  // olduğu için bu değişiklik zaten bekleyen setTimeout'u (cleanup ile)
  // iptal ediyor, hiçbir canavar üretilmiyor.
  const cancelSearch = () => setWz((prev) => (prev.searching ? { ...prev, searching: null } : prev));

  // actionType: null (düz saldırı) ya da "potion_hp"/"potion_mp" — BattleTab
  // #attack ile aynı PvE hasar formülü (mitigate + MONSTER_DEF_K/PLAYER_DEF_K),
  // sadece burada tek tıkla hem oyuncunun hem canavarın vuruşu birlikte
  // çözülüyor (Dünya Canavarı'nın #attackBoss'uyla aynı ritim).
  const huntAction = (actionType) => {
    if (lockRef.current || !wz.hunt || player.hp <= 0) return;
    const isPotion = actionType === "potion_hp" || actionType === "potion_mp";
    const potionKind = actionType === "potion_hp" ? "hp" : actionType === "potion_mp" ? "mp" : null;
    let potionResult = null;
    let potionTier = null;
    if (isPotion) {
      if ((wz.hunt.potionCooldowns[potionKind] || 0) > 0) { pushToast(t("battle.potionOnCooldown"), "warn"); return; }
      potionTier = bestAvailablePotionTier(player, potionKind);
      if (!potionTier) { pushToast(t("battle.noPotionsLeft"), "warn"); return; }
      potionResult = usePotion(player, potionKind, potionTier);
      if (potionResult.reason) { pushToast(t("battle.noPotionsLeft"), "warn"); return; }
    }
    lockRef.current = true;
    setHuntVisual((v) => ({ id: v.id + 1, type: isPotion ? "potion" : "attack", label: isPotion ? (potionKind === "hp" ? t("battle.actionHpPotion") : t("battle.actionMpPotion")) : t("battle.actionAttack") }));
    if(isPotion)playPotion();

    const monster = wz.hunt.monster;
    const potionCooldowns = Object.fromEntries(Object.entries(wz.hunt.potionCooldowns).map(([k, v]) => [k, Math.max(0, v - 1)]));
    let log = [...wz.hunt.log];
    let monsterHp = monster.hp;
    let currentHp = player.hp;

    if (isPotion) {
      potionCooldowns[potionKind] = POTION_COOLDOWN_TURNS;
      setPlayer(() => potionResult.player);
      currentHp = potionResult.player.hp;
      log.push(potionKind === "hp" ? t("warzone.log.potionUsedHp", { healed: potionResult.healed }) : t("warzone.log.potionUsedMp", { healed: potionResult.healed }));
      if (potionKind === "hp" && potionResult.healed > 0) setHuntVisual((v) => ({ ...v, outgoing: { hit: true, heal: true, damage: potionResult.healed } }));
    } else {
      const isCrit = Math.random() < cls.crit;
      const playerHits = rollHit(player.stats.dex, monster.atk, player.level);
      const dmg = playerHits
        ? Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), monster.def, MONSTER_DEF_K) + rand(-2, 3)))
        : 0;
      monsterHp = Math.max(0, monsterHp - dmg);
      log.push(!playerHits ? t("warzone.log.huntMissed", { monster: monster.name }) : isCrit ? t("warzone.log.huntCrit", { monster: monster.name, dmg }) : t("warzone.log.huntHit", { monster: monster.name, dmg }));
      setHuntVisual((v) => ({ ...v, outgoing: { hit: playerHits, damage: dmg, crit: isCrit } }));
      if(playerHits)playHit({crit:isCrit,cls:player.class});else playMiss();
    }

    if (monsterHp <= 0) {
      setWz((prev) => ({ ...prev, hunt: null, log: [...prev.log, t("warzone.log.huntDefeated", { monster: monster.name })].slice(-24) }));
      const huntCfg = getWarzoneHuntConfig();
      const result = grantMonsterReward(player, monster, CRIMSON_MAP, { goldMult: huntCfg.goldMult, dropMult: huntCfg.dropMult });
      setPlayer(result.player);
      pushToast(result.drops.map(formatHuntDrop).join("  ·  "), result.tone);
      if (result.levelUp) { setLevelUpInfo(result.levelUp); playLevelUp(); }
      setTimeout(() => { lockRef.current = false; }, 320);
      return;
    }

    const setReduction = armorSetDamageReduction(player, "monster");
    const monsterHits = rollHit(monster.atk, player.stats.dex, player.level);
    const mdmg = monsterHits
      ? Math.max(1, Math.round(mitigate(monster.atk, def, PLAYER_DEF_K) * (1 - setReduction) + rand(-2, 3)))
      : 0;
    setHuntVisual((v) => ({ ...v, incoming: { hit: monsterHits, damage: mdmg } }));
    if(monsterHits)playHurt();else playMiss();
    const wouldDie = currentHp - mdmg <= 0;
    log.push(monsterHits ? t("warzone.log.huntHitYou", { monster: monster.name, dmg: mdmg }) : t("warzone.log.huntMissedYou", { monster: monster.name }));

    setPlayer((p) => ({ ...p, hp: Math.max(0, currentHp - mdmg) }));
    setWz((prev) => ({ ...prev, hunt: { ...prev.hunt, monster: { ...monster, hp: monsterHp }, potionCooldowns, log: log.slice(-24) } }));

    if (wouldDie) {
      setTimeout(() => {
        let xpLost = 0;
        setPlayer((p) => {
          const result = applyDeathPenalty(p);
          xpLost = result.xpLost;
          return result.player;
        });
        setWz((prev) => ({ ...prev, hunt: null }));
        setDeathInfo({ xpLost });
      }, 400);
    }
    setTimeout(() => { lockRef.current = false; }, 320);
  };

  // ---- Düello: oyuncu bir hayaleti seçip meydan okuyor ----
  const startDuel = (ghost) => {
    if (lockRef.current || wz.duel || player.hp <= 0) return;
    lockRef.current = true;
    const { duel, ghostFirstDmg } = initiateDuel(ghost, def, player, t);
    setWz((prev) => ({
      ...prev,
      ghosts: prev.ghosts.map((g) => (g.id === ghost.id ? { ...g, dueling: true } : g)),
      duel,
    }));
    if (ghostFirstDmg > 0) {
      const wouldDie = player.hp - ghostFirstDmg <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - ghostFirstDmg) }));
      if (wouldDie) { setTimeout(() => finishDuelAsLoss(ghost.id), 500); return; }
    }
    setTimeout(() => { lockRef.current = false; }, 320);
  };

  // ghostDefeated: true  -> hayalet öldü, "gone" işaretlenir ve tick döngüsü
  // GHOST_REPLACE_TICKS sonra yenisiyle değiştirir. false -> hayalet hayatta
  // kaldı (kaçış ya da oyuncunun kaybı), hemen idle listeye geri döner.
  const endDuel = (ghostId, ghostDefeated) => {
    setWz((prev) => ({
      ...prev,
      duel: null,
      ghosts: prev.ghosts.map((g) => {
        if (g.id !== ghostId) return g;
        return ghostDefeated ? { ...g, dueling: false, gone: true, respawnTicks: GHOST_REPLACE_TICKS } : { ...g, dueling: false };
      }),
    }));
  };

  // Premium National Point kaybını azalttığı için (Mythic %10, Apex %5 —
  // bkz. utils/premium.js#premiumNpLossReduction) toast'ta gösterilecek
  // gerçek kayıp miktarını burada, sadece görüntü amaçlı, ayrıca hesaplıyoruz.
  const actualNpLoss = () => Math.round(NP_LOSS_PENALTY * (1 - premiumNpLossReduction(player)));

  // Bir düelloyu kaybetmenin tek yolu — hem sıradan bir turda hem de
  // yazı-tura ile rakibin ilk vuruşunda öldürülürse aynı sonuç: National
  // Point kaybı (bkz. utils/nationalPoint.js#penalizeNationalPoint),
  // "Bayıldın" bildirimi, hayalet hayatta kaldığı için hemen idle listeye
  // döner (bkz. endDuel'in ghostDefeated:false dalı).
  const finishDuelAsLoss = (ghostId) => {
    const loss = actualNpLoss();
    const fromAmbush = !!wz.duel?.fromAmbush;
    let goldLoss = 0;
    // National Point kaybı bu PvP kaybının kendi cezası zaten — burada ayrıca
    // XP kaybettirmiyoruz (BattleTab/Dünya Canavarı ölümlerinden farklı),
    // ama hp/mp'yi HER ZAMAN tam dolduruyoruz — eskiden burası da hiç
    // yapmıyordu, "Bayıldın" sonrası can 0'da kalıp kalıyordu. Kullanıcı
    // isteği: sadece PUSUDAN (Canavar Ara'yı kesen) kaybedersen altın da
    // gider — Depo'daki DEĞİL, üstünde taşıdığın player.gold'dan, tavanlı.
    setPlayer((p) => {
      goldLoss = fromAmbush ? Math.min(WARZONE_HUNT_AMBUSH_GOLD_LOSS_CAP, Math.round(p.gold * WARZONE_HUNT_AMBUSH_GOLD_LOSS_PCT)) : 0;
      return { ...penalizeNationalPoint(p), gold: Math.max(0, p.gold - goldLoss), hp: playerMaxHp(p), mp: playerMaxMp(p) };
    });
    pushToast(goldLoss > 0 ? t("warzone.toast.huntAmbushLost", { loss, gold: formatGold(goldLoss) }) : t("warzone.toast.fainted", { loss }), "warn");
    endDuel(ghostId, false);
    lockRef.current = false;
  };

  // Onaylı, garanti çekilme — riskli "Kaç" becerisinden farklı: kaçış şansa
  // bağlı değil ama düello kayıp sayılır, rakip hükmen galip ilan edilir.
  const concedeDuel = () => {
    if (!wz.duel) return;
    const ghostId = wz.duel.ghost.id;
    const ghostName = wz.duel.ghost.name;
    const loss = actualNpLoss();
    const fromAmbush = !!wz.duel.fromAmbush;
    let goldLoss = 0;
    setPlayer((p) => {
      goldLoss = fromAmbush ? Math.min(WARZONE_HUNT_AMBUSH_GOLD_LOSS_CAP, Math.round(p.gold * WARZONE_HUNT_AMBUSH_GOLD_LOSS_PCT)) : 0;
      return { ...penalizeNationalPoint(p), gold: Math.max(0, p.gold - goldLoss) };
    });
    pushToast(goldLoss > 0 ? t("warzone.toast.huntAmbushConceded", { ghost: ghostName, loss, gold: formatGold(goldLoss) }) : t("warzone.toast.conceded", { ghost: ghostName, loss }), "warn");
    endDuel(ghostId, false);
    lockRef.current = false;
    setConfirmingRetreat(false);
  };

  // Kullanıcı isteği: "1v1'ler otomatik savaş olacak. Karşılıklı olarak
  // otomatik savaşacaklar. Kazanan bu şekilde adil ortaya çıkacak." — artık
  // düellolarda hiçbir manuel karar (saldırı/beceri/pot seçimi) yok, tek
  // tur her zaman aynı: önce oyuncu düz vuruyor, hayalet ölmediyse ya
  // kendini iyileştiriyor ya da karşılık veriyor. Kazananı SADECE
  // istatistikler + ilk vuruş yazı-turası + crit/ıskalama RNG'si belirliyor
  // — yukarıdaki auto-battle effect'i bu fonksiyonu periyodik çağırıyor.
  const runDuelTurn = () => {
    if (lockRef.current || !wz.duel || wz.duel.finished || player.hp <= 0) return;
    lockRef.current = true;
    const duel=wz.duel;
    const engine=stepDuel(duel.engine||createDuel(player,duel.ghost.avatar||comparablePlayer(player,duel.ghost.cls)));
    const [self,enemy]=engine.fighters;
    let log=[...duel.log];
    for(const event of engine.events){const name=event.side?duel.ghost.name:(player.nickname||'Sen');log.push(`${name} · ${event.label||event.type}: ${event.heal?`+${event.heal} HP`:event.damage||'—'}`);}
    const outgoing=engine.events.find(e=>e.side===0&&e.type!=='dotTick');
    const incoming=engine.events.find(e=>e.side===1&&e.type!=='dotTick');
    setDuelVisual(v=>({id:v.id+1,type:outgoing?.type||'attack',skillId:outgoing?.skillId,enemySkillId:incoming?.skillId,enemyType:incoming?.type,outgoing:outgoing?{...outgoing,damage:outgoing.heal||outgoing.damage}:null,incoming:incoming?{...incoming,damage:incoming.heal||incoming.damage}:null}));
    if(outgoing?.skillId)playSkill(self.skills.find(s=>s.id===outgoing.skillId),player.class);else if(outgoing?.hit)playHit({crit:outgoing.crit,cls:player.class});else playMiss();
    if(incoming?.damage&&!incoming.heal)playHurt();
    const updated={...player,hp:Math.round(self.hp),mp:Math.round(self.mp)};
    setPlayer(()=>updated);
    setWz(prev=>({...prev,duel:{...prev.duel,engine,ghostHp:Math.round(enemy.hp),log:log.slice(-24),finished:engine.finished}}));
    if(engine.finished){
      if(engine.winner===0){const result=awardNationalPoint(updated);const nextPlayer={...result.player,milestones:{...result.player.milestones,duelsWon:(result.player.milestones?.duelsWon||0)+1}};setPlayer(()=>nextPlayer);pushToast(t('warzone.toast.duelWon',{ghost:duel.ghost.name,gain:result.gain}),'loot');setTimeout(()=>{endDuel(duel.ghost.id,true);lockRef.current=false;},700);}
      else if(engine.winner===1)setTimeout(()=>finishDuelAsLoss(duel.ghost.id),500);
      else {pushToast(lang==='tr'?'VS berabere bitti.':'Duel ended in a draw.');setTimeout(()=>{endDuel(duel.ghost.id,false);lockRef.current=false;},700);}
    }else setTimeout(()=>{lockRef.current=false;},320);
  };

  const playerDead = player.hp <= 0;
  const hpPotionTier = bestAvailablePotionTier(player, "hp");
  const mpPotionTier = bestAvailablePotionTier(player, "mp");
  const hpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "hp" && i.tier === hpPotionTier);
  const mpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "mp" && i.tier === mpPotionTier);
  const idleGhosts = wz.ghosts.filter((g) => !g.gone && !g.dueling);

  const lbEntries = leaderboardFor(lbRace, lbCls, player.weekId, player, lbSort);

  return (
    <div style={styles.panelScroll}>

      <div className="rpg-tabs" style={{...styles.subtabRow,flexWrap:"wrap"}}>
        <button aria-selected={subtab === "alan"} style={{ ...styles.subtabBtn, ...(subtab === "alan" ? styles.subtabBtnActive : {}) }} onClick={() => setSubtab("alan")}>{t("warzone.tabArea")}</button>
        <button aria-selected={subtab === "av"} style={{ ...styles.subtabBtn, ...(subtab === "av" ? styles.subtabBtnActive : {}) }} onClick={() => setSubtab("av")}>{t("warzone.tabHunt")}</button>
        <button aria-selected={subtab === "siralama"} style={{ ...styles.subtabBtn, ...(subtab === "siralama" ? styles.subtabBtnActive : {}) }} onClick={() => setSubtab("siralama")}>{t("warzone.tabRanking")}</button>
      </div>

      {subtab === "alan" && !wz.duel && (
        <>
          <SectionLabel>{t("warzone.bossesHeader")}</SectionLabel>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 8px" }}>{t("warzone.bossesIntro")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WARZONE_BOSSES.map((rawBoss) => {
              const boss = effectiveBoss(rawBoss);
              const sched = bossSchedule(boss, now);
              const state = wz.bosses[boss.id];
              const active = sched.phase === "active" && state && !state.resolved;
              const subtitleKey = sched.phase === "dormant" ? "warzone.bossDormant"
                : sched.phase === "gone" ? "warzone.bossMissed"
                : sched.phase === "gathering" ? "warzone.bossGatheringLabel"
                : sched.phase === "countdown" ? "warzone.bossCountdownLabel"
                : "warzone.bossDesc";
              // Kullanıcı isteği: "Kimin ne kadar Damage vurduğu %'lik
              // olarak isteyen oyuncular tarafından aktif olarak
              // görülebilecek." — bir toggle'ın arkasında, hasarla orantılı
              // yüzdelere ayrılmış bir liste (bkz. pickWeightedWinner'ın
              // aynı toplamı).
              const totalDmg = active ? state.damageByPlayer + Object.values(state.damageByGhost).reduce((a, b) => a + b, 0) : 0;
              const dmgRows = active
                ? [{ key: "player", name: t("warzone.youLabel"), dmg: state.damageByPlayer }, ...Object.entries(state.damageByGhost).map(([gid, dmg]) => ({ key: gid, name: wz.ghosts.find((g) => g.id === gid)?.name || t("warzone.bossDeathLabelGhost"), dmg }))]
                    .filter((r) => r.dmg > 0).sort((a, b) => b.dmg - a.dmg)
                : [];
              return (
                <div key={boss.id} style={{ ...styles.combatant, borderColor: `${boss.color}55`, opacity: sched.phase === "dormant" ? 0.6 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="monster-mini-portrait" style={{borderColor:boss.color}}>
                      {sched.phase==='dormant'?<Skull size={20} style={{margin:13}}/>:<MonsterPortrait monster={boss} label={tm(boss)}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{sched.phase === "dormant" ? "???" : tm(boss)}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t(subtitleKey)}</div>
                    </div>
                  </div>

                  {sched.phase === "gathering" && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 9, color: boss.color, textAlign: "center", fontFamily: "var(--font-mono)" }}>
                        {t("warzone.bossStartsIn", { time: fmtMmSs(sched.msUntilSpawn) })}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <Users size={11} /> {t("warzone.bossRoomJoined")}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {idleGhosts.map((g) => (
                          <span key={g.id} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}>{g.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sched.phase === "countdown" && (
                    <div key={sched.countdownSeconds} className="wz-countdown-pop" style={{ marginTop: 8, textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: boss.color, lineHeight: 1.1 }}>{sched.countdownSeconds}</div>
                    </div>
                  )}

                  {active && (
                    <>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                        <span>{t("warzone.yourDamage", { dmg: state.damageByPlayer })}</span>
                      </div>
                      {hasBattleScene(boss) ? (
                        <div className="battle-mobile">
                          <BattleScene
                            player={player}
                            monster={{ ...boss, hp: state.hp, maxHp: boss.hp, isBoss: true }}
                            battle={{ monsterHp: state.hp, monsterMaxHp: boss.hp, log: [], finished: false }}
                            map={{ name: t("warzone.title") }}
                            visual={bossVisuals[boss.id] || { id: 0, type: "", label: "" }}
                            enemyScale={BOSS_VISUAL_SCALE}
                          />
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                            <span>{state.hp}/{boss.hp}</span>
                          </div>
                          <BarTrack pct={(state.hp / boss.hp) * 100} color={boss.color} />
                          <div style={styles.vsRow}><Swords size={14} color="var(--text-faint)" /></div>
                          <div style={{ ...styles.combatant, borderColor: `${cls.color}55` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{displayClassName(player)}</span>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{player.hp}/{maxHp}</span>
                            </div>
                            <BarTrack pct={(player.hp / maxHp) * 100} color="#C9425A" />
                          </div>
                        </>
                      )}
                      <div style={{ fontSize: 9, color: boss.color, textAlign: "center", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                        {t("warzone.bossWindowLeft", { time: fmtMmSs(sched.msUntilDespawn) })}
                      </div>

                      <button style={{ ...styles.primaryBtn, width: "100%", marginTop: 6, background: boss.color, opacity: playerDead ? 0.5 : 1 }} onClick={() => attackBoss(boss.id)} disabled={playerDead}>
                        <Swords size={14} /> {t("warzone.attack")}
                      </button>

                      <button
                        style={{ ...styles.ghostBtn, marginTop: 2 }}
                        onClick={() => setExpandedBossId((id) => (id === boss.id ? null : boss.id))}
                      >
                        <Percent size={11} /> {t("warzone.damageToggle")}
                      </button>
                      {expandedBossId === boss.id && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                          {dmgRows.map((r) => (
                            <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 9, color: "var(--text-muted)", width: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                              <div style={{ flex: 1 }}><BarTrack pct={totalDmg > 0 ? (r.dmg / totalDmg) * 100 : 0} color={boss.color} thin /></div>
                              <span style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)", width: 30, textAlign: "right" }}>{totalDmg > 0 ? Math.round((r.dmg / totalDmg) * 100) : 0}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <SectionLabel>{t("warzone.opponentsHeader")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {idleGhosts.map((g) => {
              const GIcon = CLASSES[g.cls].icon;
              return (
                <div key={g.id} className="rpg-row" style={styles.itemRow}>
                  <div style={{ ...styles.monsterIcon, width: 30, height: 30, background: `${RACES[g.race].color}22`, color: RACES[g.race].color }}>
                    <GIcon size={14} strokeWidth={1.6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12 }}>{g.name}</div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{t(`races.${g.race}.name`)} · {CLASSES[g.cls].name}</div>
                  </div>
                  <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={() => startDuel(g)} disabled={playerDead}>
                    {t("warzone.challenge")}
                  </button>
                </div>
              );
            })}
            {idleGhosts.length === 0 && <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", padding: 10 }}>{t("warzone.noOpponents")}</div>}
          </div>
        </>
      )}

      {subtab === "alan" && wz.duel && (
        <div className="battle-mobile" style={{ ...styles.battleArena, marginTop: 12 }}>
          <DuelScene player={player} ghost={wz.duel.ghost} duel={wz.duel} visual={duelVisual} shake={duelShake} />

          <div ref={logRef} style={styles.combatLog}>
            {wz.duel.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div>

          {/* Kullanıcı isteği: "1v1'ler otomatik savaş olacak." — artık
              burada tıklanacak bir saldırı/beceri/pot butonu yok, sadece
              turların kendiliğinden aktığını gösteren bir gösterge. */}
          {!wz.duel.finished && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", color: "var(--text-faint)", fontSize: 12 }}>
              <Loader2 className="wz-spin" size={15} />
              {t("warzone.autoBattling")}
            </div>
          )}

          <button style={styles.ghostBtn} onClick={() => setConfirmingRetreat(true)} disabled={wz.duel.finished}>
            <LogOut size={13} /> {t("warzone.retreat")}
          </button>

          {confirmingRetreat && (
            <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setConfirmingRetreat(false)}>
              <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <LogOut size={28} color="#C9425A" strokeWidth={1.4} />
                <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
                  {t("warzone.retreatConfirm")}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingRetreat(false)}>{t("warzone.no")}</button>
                  <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={concedeDuel}>{t("warzone.yes")}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subtab === "av" && !wz.hunt && !wz.searching && (
        <>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12 }}>
            {t("warzone.huntIntro")}
          </p>
          <EmptyState icon={Swords} title={t("warzone.huntEmptyTitle")} subtitle={t("warzone.huntEmptySubtitle")} />
          <button
            style={{ ...styles.primaryBtn, width: "100%", marginTop: 4, background: "#C9425A", opacity: playerDead ? 0.5 : 1 }}
            disabled={playerDead}
            onClick={startHunt}
          >
            <Swords size={14} /> {t("warzone.huntBtn")}
          </button>
        </>
      )}

      {subtab === "av" && wz.searching && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={cancelSearch}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Loader2 className="wz-spin" size={30} color="#C9425A" strokeWidth={1.6} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
              {t("warzone.huntSearchingTitle")}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", textAlign: "center", maxWidth: 220 }}>
              {t("warzone.huntSearchingSubtitle")}
            </div>
            <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", marginTop: 18 }} onClick={cancelSearch}>
              <X size={13} /> {t("warzone.huntSearchingCancel")}
            </button>
          </div>
        </div>
      )}

      {subtab === "av" && wz.hunt && (
        <div className={hasBattleScene(wz.hunt.monster) ? "battle-mobile" : ""} style={{ ...styles.battleArena, marginTop: 12 }}>
          {hasBattleScene(wz.hunt.monster) ? (
            <BattleScene
              player={player}
              monster={wz.hunt.monster}
              battle={{ monsterHp: wz.hunt.monster.hp, monsterMaxHp: wz.hunt.monster.maxHp, log: wz.hunt.log, finished: false }}
              map={CRIMSON_MAP}
              visual={huntVisual}
            />
          ) : (
            <>
              <div style={{ ...styles.combatant, borderColor: "#C9425A55" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>
                    <Swords size={12} color="#C9425A" /> {wz.hunt.monster.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{wz.hunt.monster.hp}/{wz.hunt.monster.maxHp}</span>
                </div>
                <BarTrack pct={(wz.hunt.monster.hp / wz.hunt.monster.maxHp) * 100} color="#C9425A" />
              </div>

              <div style={styles.vsRow}><Swords size={14} color="var(--text-faint)" /></div>

              <div style={{ ...styles.combatant, borderColor: `${cls.color}55` }}>
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
            </>
          )}

          <div ref={logRef} style={styles.combatLog}>
            {wz.hunt.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div>

          <div style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: playerDead ? 0.5 : 1 }} onClick={() => huntAction(null)} disabled={playerDead}>
              <Swords size={15} /> {t("warzone.attack")}
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (wz.hunt.potionCooldowns.hp > 0 || playerDead) ? 0.5 : 1 }}
              onClick={() => huntAction("potion_hp")}
              disabled={wz.hunt.potionCooldowns.hp > 0 || playerDead}
            >
              <Heart size={14} color="#C9425A" /> {wz.hunt.potionCooldowns.hp > 0 ? wz.hunt.potionCooldowns.hp : (hpPotion?.count || 0)}
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (wz.hunt.potionCooldowns.mp > 0 || playerDead) ? 0.5 : 1 }}
              onClick={() => huntAction("potion_mp")}
              disabled={wz.hunt.potionCooldowns.mp > 0 || playerDead}
            >
              <Zap size={14} color="#4FC3D9" /> {wz.hunt.potionCooldowns.mp > 0 ? wz.hunt.potionCooldowns.mp : (mpPotion?.count || 0)}
            </button>
          </div>
          <button style={styles.ghostBtn} onClick={abandonHunt}>
            <LogOut size={13} /> {t("warzone.huntAbandon")}
          </button>
        </div>
      )}

      {subtab === "siralama" && (
        <>
          <SectionLabel><MenuEmblem name="ranking" size={28}/>{t("warzone.tabRanking")}</SectionLabel>
          <div style={styles.tierScroller}>
            {Object.entries(RACES).map(([key, r]) => (
              <button key={key} onClick={() => setLbRace(key)} style={{ ...styles.tierChip, borderColor: lbRace === key ? r.color : "var(--border)", background: lbRace === key ? `${r.color}1A` : "var(--bg-panel)" }}>
                <span style={{ fontSize: 11, color: r.color }}>{r.name}</span>
              </button>
            ))}
            {Object.entries(CLASSES).map(([key, c]) => (
              <button key={key} onClick={() => setLbCls(key)} style={{ ...styles.tierChip, borderColor: lbCls === key ? c.color : "var(--border)", background: lbCls === key ? `${c.color}1A` : "var(--bg-panel)" }}>
                <span style={{ fontSize: 11, color: c.color }}>{c.name}</span>
              </button>
            ))}
          </div>

          <div className="rpg-tabs" style={{...styles.subtabRow,flexWrap:"wrap"}}>
            <button style={{ ...styles.subtabBtn, ...(lbSort === "weeklyPoint" ? styles.subtabBtnActive : {}) }} onClick={() => setLbSort("weeklyPoint")}>{t("warzone.weekly")}</button>
            <button style={{ ...styles.subtabBtn, ...(lbSort === "nationalPoint" ? styles.subtabBtnActive : {}) }} onClick={() => setLbSort("nationalPoint")}>{t("warzone.permanent")}</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {lbEntries.map((e) => (
              <div key={e.rank} className="rpg-row rpg-ranking-row" style={{ ...styles.itemRow, ...(e.isPlayer ? { borderColor: "#D4AF6A" } : {}) }}>
                <RankBadge rank={e.rank}/>
                <div style={{ flex: 1, fontSize: 12, color: e.isPlayer ? "var(--text-primary)" : "var(--text-muted)" }}>{e.name}{e.isPlayer ? t("warzone.youSuffix") : ""}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{lbSort === "weeklyPoint" ? e.weeklyPoint : e.nationalPoint}</div>
              </div>
            ))}
          </div>
          <div style={styles.dropInfoRow}>
            <span><Gift size={10} style={{ verticalAlign: "middle" }} /> {t("warzone.weeklyTopReward")}</span>
          </div>
        </>
      )}

      {deathInfo && <DeathModal xpLost={deathInfo.xpLost} onClose={() => setDeathInfo(null)} />}
      {levelUpInfo && <LevelUpModal levelUp={levelUpInfo} onClose={() => setLevelUpInfo(null)} />}
    </div>
  );
}
