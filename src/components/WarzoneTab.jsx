import './WarzoneTab.css';
import { varyDamage } from '../utils/combat';
import PracticeDuel from './PracticeDuel';
import {createDuel,stepDuel} from '../utils/duelEngine';
import {wingMultiplier} from '../data/wings';
import RankBadge from './shared/RankBadge';
import MenuEmblem from './icons/MenuEmblem';
import { useState, useEffect, useRef } from "react";
import MonsterPortrait from './MonsterPortrait';
import { Skull, Swords, Heart, Zap, Lock, Gift, LogOut, DoorOpen, Loader2, X, Users } from "lucide-react";
import {
  WARZONE_UNLOCK_LEVEL, WARZONE_TELEPORT_COST, WARZONE_BOSSES, WARZONE_TICK_MS,
} from "../data/warzone";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { MAPS } from "../data/maps";
import { bossSchedule } from "../utils/warzoneBoss";
import * as warzoneBossService from "../services/warzoneBossService";
import * as warzoneDuelService from "../services/warzoneDuelService";
import { awardNationalPoint, penalizeNationalPoint } from "../utils/nationalPoint";
import { NP_LOSS_PENALTY, NP_RECOVERY_NP_AMOUNT } from "../utils/nationalPointConstants";
import { premiumNpLossReduction } from "../utils/premium";
import { leaderboardFor } from "../utils/leaderboard";
import { rollLoot } from "../utils/loot";
import { grantMonsterReward } from "../utils/monsterRewards";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { totalStats, playerDef, playerMaxHp, playerMaxMp, displayClassName, applyDeathPenalty, armorSetDamageReduction, clampGold, formatGold } from "../utils/player";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, rollHit } from "../utils/combat";
import { usePotion, bestAvailablePotionTier } from "../utils/potions";
import { rand, uid, pick } from "../utils/random";
import { playLevelUp, playHit, playMiss, playHurt, playPotion, playSkill } from "../audio/sfx";
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
// biniyor, yoksa boss aynen kalıyor. Sadece görsel/loot alanları için
// (isim, renk, drop şansları) — paylaşımlı can/maxHp artık SUNUCUDAN geliyor
// (bkz. sharedBosses), admin override'ı bu yerel-tarayıcı ayarı hiç
// etkilemiyor, aksi halde overrid'i açık biri paylaşımlı gerçeklikle
// uyuşmayan bir maxHp görürdü.
function effectiveBoss(boss) {
  const override = getWarzoneBossConfig(boss.id);
  return override ? { ...boss, ...override } : boss;
}

function fmtMmSs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const POTION_COOLDOWN_TURNS = 2;

// Kullanıcı isteği: "Boss oldukları için diğerlerinden en az 2-3 kat daha
// büyük olsun" — BattleScene.jsx'in enemyScale prop'una geçiliyor.
const BOSS_VISUAL_SCALE = 2.4;

function freshWz() {
  return {
    log: [],
    hunt: null,
    searching: null,
  };
}

export default function WarzoneTab({ player, setPlayer, pushToast, onEnteredChange }) {
  const { t, tm, lang } = useTranslation();
  const cls = CLASSES[player.class];
  const atk = totalStats(player).atk;
  const def = playerDef(player);
  const maxHp = playerMaxHp(player);
  const maxMp = playerMaxMp(player);

  const [subtab, setSubtab] = useState("alan");
  const [wz, setWz] = useState(() => freshWz());
  const [entered, setEntered] = useState(false);
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  // Kullanıcı isteği: "Savaş alanında neden karakterimiz ve düşmanımız
  // karşılıklı gözükmüyor?" — BattleTab.jsx#showAction/setVisual ile aynı
  // desen, sadece burada iki ayrı savaş türü (boss/av) olduğu için her biri
  // kendi visual state'ini taşıyor. bossVisuals boss id'ye göre ayrı
  // tutuluyor çünkü aynı anda birden fazla boss aktif olabiliyor.
  const [huntVisual, setHuntVisual] = useState({ id: 0, type: "", label: "" });
  const [bossVisuals, setBossVisuals] = useState({});
  // Faz 4 — { [bossId]: { hp, maxHp, resolved, myDamage, totalDamage } },
  // SUNUCUDAN geliyor (bkz. services/warzoneBossService.js). Sadece "active"
  // fazdaki bosslar için bir kayıt var; server periyodik olarak yenileniyor
  // ki başka gerçek oyuncuların vuruşları da görünsün.
  const [sharedBosses, setSharedBosses] = useState({});
  const knownActiveRef = useRef(new Set());
  // Faz 5 — düellodaki rakip GERÇEK bir hesabın anlık görüntüsü (bkz.
  // services/warzoneDuelService.js). opponentAccountRef sonucu sunucuya
  // bildirirken (reportDuelResult) hangi hesap olduğunu hatırlamak için.
  const [confirmingRetreat, setConfirmingRetreat] = useState(false);
  const [findingOpponent, setFindingOpponent] = useState(false);
  const [duelVisual, setDuelVisual] = useState({ id: 0, type: "", label: "" });
  const opponentAccountRef = useRef(null);
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
  }, [wz.hunt?.log?.length]);

  // "X boss'u ortaya çıktı" log satırı — SADECE yerel bir fark tespiti
  // (bkz. utils/warzoneBoss.js#bossSchedule, sunucuya hiç sormuyor), bir
  // boss `now` ilerledikçe "active" faza yeni girdiğinde bir kere yazılıyor.
  useEffect(() => {
    if (locked || npLocked || !entered) return;
    const activeNow = new Set();
    const lines = [];
    for (const rawBoss of WARZONE_BOSSES) {
      const boss = effectiveBoss(rawBoss);
      const sched = bossSchedule(boss, now);
      if (sched.phase !== "active") continue;
      const key = `${boss.id}:${sched.spawnAt}`;
      activeNow.add(key);
      if (!knownActiveRef.current.has(key)) lines.push(t("warzone.log.bossSpawned", { boss: tm(boss) }));
    }
    knownActiveRef.current = activeNow;
    if (lines.length > 0) setWz((prev) => ({ ...prev, log: [...prev.log, ...lines].slice(-24) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, locked, npLocked, entered]);

  // Faz 4 — paylaşımlı boss canını/katkılarını periyodik olarak sunucudan
  // çeker, böylece başka gerçek oyuncuların vuruşları da (birkaç saniye
  // içinde) görünür olur. WARZONE_TICK_MS aynı ritmi (3s) kullanıyor.
  useEffect(() => {
    if (locked || npLocked || !entered) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const result = await warzoneBossService.fetchActiveBosses();
        if (!cancelled) setSharedBosses(result.bosses);
      } catch { /* ağ/oturum sorunu — bir sonraki periyotta tekrar dener */ }
    };
    poll();
    const id = setInterval(poll, WARZONE_TICK_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [locked, npLocked, entered]);

  // Boss ödülü artık HER ZAMAN benim olmuyor (bkz. server/app.mjs'in
  // /api/warzone/boss/:id/attack notundaki ağırlıklı çekiliş) — bu yüzden
  // "ben mi öldürdüm" varsayımı yerine, kazandığım bekleyen ödülleri
  // (loot-claims) periyodik olarak yoklayıp varsa YEREL olarak üretiyorum
  // (bkz. grantBossLoot — eşya/sandık/parşömen üretimi hâlâ istemcide,
  // sunucuya taşınmadı) ve sunucuya "aldım" diye bildiriyorum.
  useEffect(() => {
    if (locked || npLocked || !entered) return;
    let cancelled = false;
    const poll = async () => {
      let claims;
      try { claims = (await warzoneBossService.fetchLootClaims()).claims; } catch { return; }
      if (cancelled) return;
      for (const claim of claims) {
        const boss = WARZONE_BOSSES.find((b) => b.id === claim.bossId);
        if (boss) grantBossLoot(effectiveBoss(boss));
        try { await warzoneBossService.claimLoot(claim.id); } catch { /* bir sonraki yoklamada tekrar dener */ }
      }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, npLocked, entered]);

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
      if (duel && !duel.finished) setPlayer((p) => penalizeNationalPoint(p));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kullanıcı isteği: "1v1'ler otomatik savaş olacak. Karşılıklı olarak
  // otomatik savaşacaklar. Kazanan bu şekilde adil ortaya çıkacak." —
  // düello başladıktan sonra hiçbir manuel tıklama gerekmiyor, bu effect
  // bitene kadar turları kendiliğinden oynatıyor. runDuelTurn aşağıda
  // (erken return'lerden SONRA) tanımlı olsa da, bu effect'in callback'i
  // React'in commit fazından SONRA çalıştığı için (senkron render sırasında
  // değil) o zamana kadar runDuelTurn zaten atanmış oluyor — aynı desen
  // yukarıdaki loot-claims/boss polling effect'lerinde de var.
  useEffect(() => {
    if (!wz.duel || wz.duel.finished) return;
    const timer = setTimeout(() => { runDuelTurn(); }, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wz.duel]);

  if (locked || npLocked) {
    return (
      <div className="warzone-panel" style={styles.panelScroll}>

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
      <div className="warzone-panel" style={styles.panelScroll}>

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
  // Faz 4 — hasar hâlâ istemcide hesaplanıyor (mevcut formül, değişmedi),
  // ama artık sunucuya bildiriliyor: paylaşımlı can sunucuda azalıyor,
  // başka gerçek oyuncular da aynı düşüşü görüyor. Boss ölürse ödül HER
  // ZAMAN bana gitmez (ağırlıklı çekiliş sunucuda, bkz. server/app.mjs) —
  // kazanırsam loot-claims yoklamasıyla (yukarıdaki effect) ayrıca gelir.
  const attackBoss = async (bossId) => {
    const rawBoss = WARZONE_BOSSES.find((b) => b.id === bossId);
    const boss = rawBoss && effectiveBoss(rawBoss);
    const activeState = sharedBosses[bossId];
    if (lockRef.current || !boss || !activeState || activeState.resolved || player.hp <= 0) return;
    lockRef.current = true;
    setBossVisuals((bv) => ({ ...bv, [bossId]: { id: (bv[bossId]?.id || 0) + 1, type: "attack", label: t("battle.actionAttack") } }));
    const isCrit = Math.random() < cls.crit;
    // Gerçek KO'nun DEX→Hit/Evasion Rate mantığı (bkz. utils/combat.js#
    // hitChance, BattleTab.jsx#attack'taki aynı desen) — boss'un gerçek bir
    // DEX'i yok, kendi ATK'si vekil.
    const playerHitsBoss = rollHit(player.stats.dex, boss.atk, player.level);
    const dmg = playerHitsBoss
      ? varyDamage(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), boss.def, MONSTER_DEF_K))
      : 0;
    setBossVisuals((bv) => ({ ...bv, [bossId]: { ...bv[bossId], outgoing: { hit: playerHitsBoss, damage: dmg, crit: isCrit } } }));
    if(playerHitsBoss)playHit({crit:isCrit,cls:player.class});else playMiss();

    let bossSurvived = true;
    if (playerHitsBoss && dmg > 0) {
      try {
        const result = await warzoneBossService.attackBoss(bossId, dmg);
        setSharedBosses((prev) => ({
          ...prev,
          [bossId]: {
            ...prev[bossId], hp: result.hp, resolved: result.resolved,
            myDamage: (prev[bossId]?.myDamage || 0) + dmg, totalDamage: (prev[bossId]?.totalDamage || 0) + dmg,
          },
        }));
        setWz((prev) => ({ ...prev, log: [...prev.log, isCrit ? t("warzone.log.youCritBoss", { boss: tm(boss), dmg }) : t("warzone.log.youHitBoss", { boss: tm(boss), dmg })].slice(-24) }));
        bossSurvived = !result.resolved;
      } catch {
        // Boss az önce başkası tarafından bitirilmiş ya da pencere kapanmış
        // olabilir (bkz. server/app.mjs — BOSS_ALREADY_DEFEATED/
        // BOSS_NOT_ACTIVE) — sessizce vazgeç, bir sonraki yoklama (yukarıdaki
        // effect) gerçek durumu zaten getirecek.
        lockRef.current = false;
        return;
      }
    } else {
      setWz((prev) => ({ ...prev, log: [...prev.log, t("warzone.log.youMissedBoss", { boss: tm(boss) })].slice(-24) }));
    }

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

  // ---- Düello: Faz 5 — sunucudan GERÇEK bir başka hesabın anlık
  // görüntüsünü iste, ona karşı (deterministik motorla, istemcide) otomatik
  // savaş. Rakip o an çevrimdışı olabilir, hiçbir şey kaybetmez/kazanmaz.
  const findOpponent = async () => {
    if (lockRef.current || wz.duel || player.hp <= 0 || findingOpponent) return;
    setFindingOpponent(true);
    try {
      const result = await warzoneDuelService.fetchOpponent(player.level);
      if (!result.opponent) { pushToast(t("warzone.toast.noOpponentFound"), "warn"); return; }
      opponentAccountRef.current = result.opponentAccountId;
      const engine = createDuel(player, result.opponent, { seed: result.seed, fullHealth: true });
      const ghost = { name: result.opponentName, cls: result.opponent.class, avatar: result.opponent, maxHp: engine.fighters[1].maxHp };
      const log = [t("warzone.log.duelAppeared", { ghost: ghost.name }), t(engine.first ? "warzone.log.coinFlipGhostFirst" : "warzone.log.coinFlipPlayerFirst")];
      setWz((prev) => ({ ...prev, duel: { ghost, ghostHp: engine.fighters[1].hp, log, finished: false, engine } }));
    } catch {
      pushToast(t("warzone.toast.noOpponentFound"), "warn");
    } finally {
      setFindingOpponent(false);
    }
  };

  const endDuel = () => {
    opponentAccountRef.current = null;
    setWz((prev) => ({ ...prev, duel: null }));
  };

  // Premium National Point kaybını azalttığı için (Mythic %10, Apex %5 —
  // bkz. utils/premium.js#premiumNpLossReduction) toast'ta gösterilecek
  // gerçek kayıp miktarını burada, sadece görüntü amaçlı, ayrıca hesaplıyoruz.
  const actualNpLoss = () => Math.round(NP_LOSS_PENALTY * (1 - premiumNpLossReduction(player)));

  // Bir düelloyu kaybetmenin tek yolu — hem sıradan bir turda hem de
  // yazı-tura ile rakibin ilk vuruşunda öldürülürse aynı sonuç: National
  // Point kaybı (bkz. utils/nationalPoint.js#penalizeNationalPoint),
  // "Bayıldın" bildirimi.
  const finishDuelAsLoss = () => {
    const loss = actualNpLoss();
    const opponentAccountId = opponentAccountRef.current;
    setPlayer((p) => ({ ...penalizeNationalPoint(p), hp: playerMaxHp(p), mp: playerMaxMp(p) }));
    pushToast(t("warzone.toast.fainted", { loss }), "warn");
    if (opponentAccountId) warzoneDuelService.reportDuelResult(opponentAccountId, "opponent").catch(() => {});
    endDuel();
    lockRef.current = false;
  };

  // Onaylı, garanti çekilme — kaçış şansa bağlı değil ama düello kayıp
  // sayılır, rakip hükmen galip ilan edilir.
  const concedeDuel = () => {
    if (!wz.duel) return;
    const ghostName = wz.duel.ghost.name;
    const loss = actualNpLoss();
    const opponentAccountId = opponentAccountRef.current;
    setPlayer((p) => penalizeNationalPoint(p));
    pushToast(t("warzone.toast.conceded", { ghost: ghostName, loss }), "warn");
    if (opponentAccountId) warzoneDuelService.reportDuelResult(opponentAccountId, "opponent").catch(() => {});
    endDuel();
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
    const duel = wz.duel;
    const engine = stepDuel(duel.engine);
    const [self, enemy] = engine.fighters;
    let log = [...duel.log];
    for (const event of engine.events) { const name = event.side ? duel.ghost.name : (player.nickname || "Sen"); log.push(`${name} · ${event.label || event.type}: ${event.heal ? `+${event.heal} HP` : event.damage || "—"}`); }
    const outgoing = engine.events.find((e) => e.side === 0 && e.type !== "dotTick");
    const incoming = engine.events.find((e) => e.side === 1 && e.type !== "dotTick");
    setDuelVisual((v) => ({ id: v.id + 1, type: outgoing?.type || "attack", skillId: outgoing?.skillId, enemySkillId: incoming?.skillId, enemyType: incoming?.type, outgoing: outgoing ? { ...outgoing, damage: outgoing.heal || outgoing.damage } : null, incoming: incoming ? { ...incoming, damage: incoming.heal || incoming.damage } : null }));
    if (outgoing?.skillId) playSkill(self.skills.find((s) => s.id === outgoing.skillId), player.class); else if (outgoing?.hit) playHit({ crit: outgoing.crit, cls: player.class }); else playMiss();
    if (incoming?.damage && !incoming.heal) playHurt();
    const updated = { ...player, hp: Math.round(self.hp), mp: Math.round(self.mp) };
    setPlayer(() => updated);
    setWz((prev) => ({ ...prev, duel: { ...prev.duel, engine, ghostHp: Math.round(enemy.hp), log: log.slice(-24), finished: engine.finished } }));
    if (engine.finished) {
      if (engine.winner === 0) {
        const result = awardNationalPoint(updated);
        const nextPlayer = { ...result.player, milestones: { ...result.player.milestones, duelsWon: (result.player.milestones?.duelsWon || 0) + 1 } };
        setPlayer(() => nextPlayer);
        pushToast(t("warzone.toast.duelWon", { ghost: duel.ghost.name, gain: result.gain }), "loot");
        const opponentAccountId = opponentAccountRef.current;
        if (opponentAccountId) warzoneDuelService.reportDuelResult(opponentAccountId, "me").catch(() => {});
        setTimeout(() => { endDuel(); lockRef.current = false; }, 700);
      } else if (engine.winner === 1) {
        setTimeout(() => finishDuelAsLoss(), 500);
      } else {
        pushToast(lang === "tr" ? "VS berabere bitti." : "Duel ended in a draw.");
        const opponentAccountId = opponentAccountRef.current;
        if (opponentAccountId) warzoneDuelService.reportDuelResult(opponentAccountId, "draw").catch(() => {});
        setTimeout(() => { endDuel(); lockRef.current = false; }, 700);
      }
    } else setTimeout(() => { lockRef.current = false; }, 320);
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
    if (lockRef.current || wz.hunt || wz.searching || player.hp <= 0) return;
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
        ? varyDamage(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), monster.def, MONSTER_DEF_K))
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

  const playerDead = player.hp <= 0;
  const hpPotionTier = bestAvailablePotionTier(player, "hp");
  const mpPotionTier = bestAvailablePotionTier(player, "mp");
  const hpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "hp" && i.tier === hpPotionTier);
  const mpPotion = player.inventory.find((i) => i.kind === "potion" && i.potionType === "mp" && i.tier === mpPotionTier);

  const lbEntries = leaderboardFor(lbRace, lbCls, player.weekId, player, lbSort);

  return (
    <div className="warzone-panel" style={styles.panelScroll}>

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
              const state = sharedBosses[boss.id];
              const active = sched.phase === "active" && state && !state.resolved;
              const subtitleKey = sched.phase === "dormant" ? "warzone.bossDormant"
                : sched.phase === "gone" ? "warzone.bossMissed"
                : sched.phase === "gathering" ? "warzone.bossGatheringLabel"
                : sched.phase === "countdown" ? "warzone.bossCountdownLabel"
                : "warzone.bossDesc";
              return (
                <div className="warzone-boss-card" key={boss.id} style={{ ...styles.combatant, borderColor: `${boss.color}55`, opacity: sched.phase === "dormant" ? 0.6 : 1 }}>
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
                    </div>
                  )}

                  {sched.phase === "countdown" && (
                    <div key={sched.countdownSeconds} className="wz-countdown-pop" style={{ marginTop: 8, textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 34, color: boss.color, lineHeight: 1.1 }}>{sched.countdownSeconds}</div>
                    </div>
                  )}

                  {active && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                        <span>{t("warzone.totalDamage", { dmg: state.totalDamage })}</span>
                        <span>{t("warzone.yourDamage", { dmg: state.myDamage })}</span>
                      </div>
                      {hasBattleScene(boss) ? (
                        <div className="battle-mobile">
                          <BattleScene
                            player={player}
                            monster={{ ...boss, hp: state.hp, maxHp: state.maxHp, isBoss: true }}
                            battle={{ monsterHp: state.hp, monsterMaxHp: state.maxHp, log: [], finished: false }}
                            map={{ name: t("warzone.title") }}
                            visual={bossVisuals[boss.id] || { id: 0, type: "", label: "" }}
                            enemyScale={BOSS_VISUAL_SCALE}
                          />
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                            <span>{state.hp}/{state.maxHp}</span>
                          </div>
                          <BarTrack pct={(state.hp / state.maxHp) * 100} color={boss.color} />
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
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <SectionLabel>{t("warzone.opponentsHeader")}</SectionLabel>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 8px" }}>{t("warzone.opponentsIntro")}</p>
          <button
            style={{ ...styles.primaryBtn, width: "100%", background: "#C9425A", opacity: playerDead || findingOpponent ? 0.5 : 1 }}
            disabled={playerDead || findingOpponent}
            onClick={findOpponent}
          >
            <Users size={14} /> {findingOpponent ? t("warzone.findingOpponent") : t("warzone.findOpponentBtn")}
          </button>
        </>
      )}

      {subtab === "alan" && wz.duel && (
        <div className="battle-mobile" style={{ ...styles.battleArena, marginTop: 12 }}>
          <DuelScene player={player} ghost={wz.duel.ghost} duel={wz.duel} visual={duelVisual} shake={null} />

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

