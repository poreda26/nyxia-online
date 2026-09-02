import { useState, useEffect, useRef } from "react";
import { Skull, Swords, CircleSlash, Wind, Droplets, Heart, Zap, Lock, Gift, LogOut, DoorOpen } from "lucide-react";
import {
  WARZONE_UNLOCK_LEVEL, WARZONE_TELEPORT_COST, WORLD_BOSS, PVP_SKILLS, WARZONE_TICK_MS,
  GHOST_POPULATION, WORLD_BOSS_RESPAWN_SECONDS, GHOST_REPLACE_SECONDS, AMBUSH_CHANCE_PER_TICK,
} from "../data/warzone";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { spawnGhost, ghostDamageFromPlayer, playerDamageFromGhost, ghostSelfHeal, tickWorldBoss } from "../utils/warzoneCombat";
import { awardNationalPoint, penalizeNationalPoint } from "../utils/nationalPoint";
import { NP_LOSS_PENALTY, NP_RECOVERY_NP_AMOUNT } from "../utils/nationalPointConstants";
import { leaderboardFor } from "../utils/leaderboard";
import { rollLoot } from "../utils/loot";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { totalStats, playerDef, playerMaxHp, playerMaxMp, displayClassName, applyDeathPenalty, armorSetDamageReduction } from "../utils/player";
import { premiumNpLossReduction } from "../utils/premium";
import { mitigate, MONSTER_DEF_K, rollHit } from "../utils/combat";
import { usePotion, bestAvailablePotionTier } from "../utils/potions";
import { rand, uid } from "../utils/random";
import { newlyUnlocked } from "../utils/achievements";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import BarTrack from "./shared/BarTrack";
import DeathModal from "./DeathModal";

const RESPAWN_TICKS = Math.max(1, Math.round((WORLD_BOSS_RESPAWN_SECONDS * 1000) / WARZONE_TICK_MS));
const GHOST_REPLACE_TICKS = Math.max(1, Math.round((GHOST_REPLACE_SECONDS * 1000) / WARZONE_TICK_MS));

const PVP_SKILL_ICON = { pvp_stun: CircleSlash, pvp_flee: Wind, pvp_manaburn: Droplets };
const POTION_COOLDOWN_TURNS = 2;

function freshWz(player) {
  return {
    boss: { hp: WORLD_BOSS.hp, maxHp: WORLD_BOSS.hp, alive: true, respawnTicks: 0 },
    bossDamage: { player: 0, ghosts: {} },
    ghosts: Array.from({ length: GHOST_POPULATION }, () => spawnGhost(player)),
    log: [],
    duel: null,
  };
}

// Boss ölünce en çok hasarı veren tarafı belirler ("player" ya da hayalet
// adı) — hem gerçek-zamanlı tick'ten hem oyuncunun kendi vuruşundan çağrılır.
function resolveBossDeath(bossDamage, ghosts) {
  const topGhostEntry = Object.entries(bossDamage.ghosts).sort((a, b) => b[1] - a[1])[0];
  const topGhostDmg = topGhostEntry ? topGhostEntry[1] : 0;
  if (bossDamage.player > 0 && bossDamage.player >= topGhostDmg) return { winner: "player", label: "sen" };
  if (topGhostEntry) {
    const g = ghosts.find((gh) => gh.id === topGhostEntry[0]);
    return { winner: "ghost", label: g?.name || "bir hayalet" };
  }
  return { winner: null, label: "kimse" };
}

// Bir tick'te: boss respawn sayacı / hayaletlerin boss'a vurması / gitmiş
// hayaletlerin yenisiyle değişmesi / pusu (ambush) ihtimali. Saf fonksiyon —
// tüm Math.random() çağrıları burada, side effect (toast/log) yok.
function warzoneTick(wz, player) {
  let { boss, bossDamage, ghosts } = wz;
  const lines = [];
  let bossDied = null;

  if (!boss.alive) {
    const respawnTicks = boss.respawnTicks - 1;
    if (respawnTicks <= 0) {
      boss = { hp: WORLD_BOSS.hp, maxHp: WORLD_BOSS.hp, alive: true, respawnTicks: 0 };
      bossDamage = { player: 0, ghosts: {} };
      lines.push(`${WORLD_BOSS.name} yeniden belirdi!`);
    } else {
      boss = { ...boss, respawnTicks };
    }
  } else {
    const activeGhosts = ghosts.filter((g) => !g.gone && !g.dueling);
    if (activeGhosts.length > 0) {
      const result = tickWorldBoss(WORLD_BOSS, boss.hp, activeGhosts, bossDamage.ghosts);
      boss = { ...boss, hp: result.hp };
      bossDamage = { ...bossDamage, ghosts: result.damageByGhost };
      lines.push(...result.lines);
      if (result.hp <= 0) {
        const resolved = resolveBossDeath(bossDamage, ghosts);
        bossDied = resolved;
        lines.push(resolved.winner === "player" ? `${WORLD_BOSS.name} düştü — drop'u sen aldın!` : `${WORLD_BOSS.name} düştü — drop'u ${resolved.label} aldı.`);
        boss = { hp: 0, maxHp: WORLD_BOSS.hp, alive: false, respawnTicks: RESPAWN_TICKS };
      }
    }
  }

  ghosts = ghosts.map((g) => {
    if (!g.gone) return g;
    const respawnTicks = g.respawnTicks - 1;
    return respawnTicks <= 0 ? spawnGhost(player) : { ...g, respawnTicks };
  });

  let ambushGhost = null;
  const idle = ghosts.filter((g) => !g.gone && !g.dueling);
  if (idle.length > 0 && Math.random() < AMBUSH_CHANCE_PER_TICK) {
    ambushGhost = idle[Math.floor(Math.random() * idle.length)];
  }

  return { boss, bossDamage, ghosts, lines, bossDied, ambushGhost };
}

// Düello başlar başlamaz yazı-tura atılır — %50 ihtimalle rakip önce
// vuruyor (kullanıcı isteği: "sıra tabanlı ... yazı tura sistemi gibi").
// Saf fonksiyon: ghostFirstDmg'i player.hp'ye uygulamak (ve gerekiyorsa
// ölüm kontrolü yapmak) çağıranın işi — bkz. startDuel ve tick effect'teki
// ambush dalı, ikisi de aynı setPlayer+ölüm-kontrolü desenini kullanıyor.
function initiateDuel(ghost, def, player) {
  const ghostFirst = Math.random() < 0.5;
  const log = [`${ghost.name} karşına çıktı.`, ghostFirst ? "Yazı tura: rakip önce saldırıyor!" : "Yazı tura: önce sen saldırıyorsun!"];
  let ghostFirstDmg = 0;
  if (ghostFirst) {
    const dmg = playerDamageFromGhost(ghost, def, player);
    ghostFirstDmg = dmg ?? 0;
    log.push(dmg == null ? `${ghost.name} saldırdı ama ıskaladı.` : `${ghost.name} sana ${dmg} hasar verdi.`);
  }
  const duel = {
    ghost, ghostHp: ghost.hp, log, finished: false,
    ghostStunned: false, healBlocked: false, cooldowns: {}, potionCooldowns: { hp: 0, mp: 0 },
  };
  return { duel, ghostFirstDmg };
}

export default function WarzoneTab({ player, setPlayer, pushToast }) {
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
  const [deathInfo, setDeathInfo] = useState(null); // { xpLost } | null — drives DeathModal (Dünya Canavarı elinde ölüm)
  const [lbRace, setLbRace] = useState(player.race);
  const [lbCls, setLbCls] = useState(player.class);
  const [lbSort, setLbSort] = useState("weeklyPoint");
  const logRef = useRef(null);
  const lockRef = useRef(false);

  const locked = player.level < WARZONE_UNLOCK_LEVEL;
  const npLocked = !locked && player.nationalPoint <= 0;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [wz.duel?.log?.length]);

  // Sekmeden ayrılmak (başka bir BottomNav sekmesine geçmek) bu bileşeni
  // tamamen unmount eder — wz ephemeral olduğu için düello dahil her şey
  // sıfırlanır. Bunu düello kaybını National Point cezasından kaçmak için
  // kullanmayı engellemek üzere: yarım kalmış bir düello varken sekmeden
  // ayrılmak, düelloyu terk etmiş (kaybetmiş) saymak anlamına gelir.
  const wzRef = useRef(wz);
  useEffect(() => { wzRef.current = wz; }, [wz]);
  useEffect(() => {
    return () => {
      if (wzRef.current?.duel && !wzRef.current.duel.finished) {
        setPlayer((p) => penalizeNationalPoint(p));
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
      const result = warzoneTick(wz, player);
      let next = { ...wz, boss: result.boss, bossDamage: result.bossDamage, ghosts: result.ghosts, log: [...wz.log, ...result.lines].slice(-24) };
      let ambushFirstDmg = 0;
      if (result.ambushGhost) {
        const initiated = initiateDuel(result.ambushGhost, def, player);
        ambushFirstDmg = initiated.ghostFirstDmg;
        next = {
          ...next,
          ghosts: next.ghosts.map((g) => (g.id === result.ambushGhost.id ? { ...g, dueling: true } : g)),
          duel: initiated.duel,
        };
      }
      setWz(next);
      if (result.bossDied) {
        pushToast(result.lines[result.lines.length - 1], result.bossDied.winner === "player" ? "loot" : "default");
      }
      if (result.ambushGhost) {
        pushToast(`${result.ambushGhost.name} sana pusu kurdu!`, "warn");
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

  if (locked || npLocked) {
    return (
      <div style={styles.panelScroll}>
        <SectionLabel>Savaş Alanı</SectionLabel>
        {locked ? (
          <EmptyState icon={Lock} title="Savaş Alanı kilitli" subtitle={`Buraya girmek için Lv.${WARZONE_UNLOCK_LEVEL} olman gerekiyor.`} />
        ) : (
          <EmptyState icon={Lock} title="National Point tükendi" subtitle={`Savaş Alanı'na girmek için en az 1 National Point gerekiyor. Kaptan'dan ${NP_RECOVERY_NP_AMOUNT} National Point satın alabilirsin.`} />
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
        <SectionLabel>Savaş Alanı</SectionLabel>
        <EmptyState
          icon={DoorOpen}
          title="Savaş Alanı'na ışınlan"
          subtitle={`Işınlanma ücreti: ${WARZONE_TELEPORT_COST} altın. Şu an ${player.gold} altının var.`}
        />
        <button
          style={{ ...styles.primaryBtn, width: "100%", marginTop: 4, background: "#C9425A", opacity: canAfford ? 1 : 0.5 }}
          disabled={!canAfford}
          onClick={() => setConfirmingEntry(true)}
        >
          <DoorOpen size={14} /> Işınlan ({WARZONE_TELEPORT_COST}g)
        </button>

        {confirmingEntry && (
          <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setConfirmingEntry(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <DoorOpen size={28} color="#C9425A" strokeWidth={1.4} />
              <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
                Savaş Alanı'na ışınlanmak {WARZONE_TELEPORT_COST} altın tutar. Onaylıyor musun?
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingEntry(false)}>Hayır</button>
                <button
                  style={{ ...styles.tinyBtn, background: "#C9425A" }}
                  onClick={() => {
                    setPlayer((p) => ({ ...p, gold: p.gold - WARZONE_TELEPORT_COST }));
                    pushToast(`Savaş Alanı'na ışınlandın. (-${WARZONE_TELEPORT_COST} altın)`, "default");
                    setEntered(true);
                    setConfirmingEntry(false);
                  }}
                >
                  Evet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Dünya Canavarı: oyuncunun kendi vuruşu ----
  const attackBoss = () => {
    if (lockRef.current || wz.duel || !wz.boss.alive || player.hp <= 0) return;
    lockRef.current = true;
    const isCrit = Math.random() < cls.crit;
    // Gerçek KO'nun DEX→Hit/Evasion Rate mantığı (bkz. utils/combat.js#
    // hitChance, BattleTab.jsx#attack'taki aynı desen) — boss'un gerçek bir
    // DEX'i yok, kendi ATK'si vekil.
    const playerHitsBoss = rollHit(player.stats.dex, WORLD_BOSS.atk, player.level);
    const dmg = playerHitsBoss
      ? Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), WORLD_BOSS.def, MONSTER_DEF_K) + rand(-2, 3)))
      : 0;

    let toastMsg = null;
    let bossSurvived = false;
    setWz((prev) => {
      // Bir tick'in (hayaletlerin) bu tıklamayla aynı anda boss'u zaten
      // öldürmüş olma ihtimaline karşı — `prev` her zaman güncel, `wz`
      // (dışarıdaki closure) bayat olabilir. Boss zaten ölüyse bu tık no-op:
      // ikinci kez drop verilmesini / respawn sayacının sıfırlanmasını önler.
      if (!prev.boss.alive) return prev;
      const hp = Math.max(0, prev.boss.hp - dmg);
      const bossDamage = { ...prev.bossDamage, player: prev.bossDamage.player + dmg };
      const log = [...prev.log, !playerHitsBoss ? `${WORLD_BOSS.name}'ı ıskaladın.` : isCrit ? `Kritik! ${WORLD_BOSS.name}'a ${dmg} hasar verdin.` : `${WORLD_BOSS.name}'a ${dmg} hasar verdin.`];
      if (hp <= 0) {
        const resolved = resolveBossDeath(bossDamage, prev.ghosts);
        log.push(resolved.winner === "player" ? `${WORLD_BOSS.name} düştü — drop'u sen aldın!` : `${WORLD_BOSS.name} düştü — drop'u ${resolved.label} aldı.`);
        toastMsg = resolved.winner === "player" ? { grant: true } : { grant: false, text: log[log.length - 1] };
        return { ...prev, boss: { hp: 0, maxHp: WORLD_BOSS.hp, alive: false, respawnTicks: RESPAWN_TICKS }, bossDamage, log: log.slice(-24) };
      }
      bossSurvived = true;
      return { ...prev, boss: { ...prev.boss, hp }, bossDamage, log: log.slice(-24) };
    });

    if (toastMsg?.grant) {
      grantBossLoot();
    } else if (toastMsg) {
      pushToast(toastMsg.text, "default");
    }

    if (bossSurvived) {
      // Boss hâlâ ayaktaysa oyuncuya karşılık verir.
      const bossSetReduction = armorSetDamageReduction(player, "monster");
      const bossHitsPlayer = rollHit(WORLD_BOSS.atk, player.stats.dex, player.level);
      const counter = bossHitsPlayer
        ? Math.max(1, Math.round((WORLD_BOSS.atk - def * 0.45) * (1 - bossSetReduction) + rand(-2, 3)))
        : 0;
      const wouldDie = player.hp - counter <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - counter) }));
      setWz((prev) => ({ ...prev, log: [...prev.log, bossHitsPlayer ? `${WORLD_BOSS.name} sana ${counter} hasar verdi.` : `${WORLD_BOSS.name} saldırdı ama ıskaladı.`].slice(-24) }));
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

  const grantBossLoot = () => {
    let drops = [];
    setPlayer((p) => {
      let np = { ...p, inventory: [...p.inventory], chests: [...p.chests] };
      const goldGain = rand(WORLD_BOSS.bonusGoldMin, WORLD_BOSS.bonusGoldMax);
      np.gold += goldGain;
      drops = [`+${goldGain} altın`];
      if (Math.random() < WORLD_BOSS.equipDropChance) {
        const item = rollLoot(WORLD_BOSS.lootTier, np.class);
        // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
        // hiçbir eşya yoksa rollLoot null döner, o an hiç düşmemiş say.
        if (item) {
          const res = addItemToInventory(np, item);
          np = res.player;
          drops.push(res.added ? `Eşya düştü: ${item.name}` : `${item.name} düştü ama ${res.reason}`);
        }
      }
      if (Math.random() < WORLD_BOSS.chestDropChance) {
        np.chests.push({ id: uid(), tier: WORLD_BOSS.lootTier });
        drops.push(`Sandık düştü! (T${WORLD_BOSS.lootTier})`);
      }
      if (Math.random() < WORLD_BOSS.scrollDropChance) {
        const scroll = makeScrollStack(WORLD_BOSS.lootTier, 1);
        const res = addItemToInventory(np, scroll);
        np = res.player;
        drops.push(res.added ? `T${WORLD_BOSS.lootTier} Parşömeni düştü!` : `Parşömen düştü ama ${res.reason}`);
      }
      // Bir canavarı (Dünya Canavarı da bir canavar) öldürünce can/mana
      // tam yenilenir.
      np.hp = playerMaxHp(np);
      np.mp = playerMaxMp(np);
      return np;
    });
    pushToast(drops.join("  ·  "), "loot");
  };

  // ---- Düello: oyuncu bir hayaleti seçip meydan okuyor ----
  const startDuel = (ghost) => {
    if (lockRef.current || wz.duel || player.hp <= 0) return;
    lockRef.current = true;
    const { duel, ghostFirstDmg } = initiateDuel(ghost, def, player);
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
    // National Point kaybı bu PvP kaybının kendi cezası zaten — burada ayrıca
    // XP kaybettirmiyoruz (BattleTab/Dünya Canavarı ölümlerinden farklı),
    // ama hp/mp'yi HER ZAMAN tam dolduruyoruz — eskiden burası da hiç
    // yapmıyordu, "Bayıldın" sonrası can 0'da kalıp kalıyordu.
    setPlayer((p) => ({ ...penalizeNationalPoint(p), hp: playerMaxHp(p), mp: playerMaxMp(p) }));
    pushToast(`Bayıldın... Kasabaya taşındın. -${loss} National Point kaybettin.`, "warn");
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
    setPlayer((p) => penalizeNationalPoint(p));
    pushToast(`Savaştan çekildin — ${ghostName} hükmen galip sayıldı. -${loss} National Point kaybettin.`, "warn");
    endDuel(ghostId, false);
    lockRef.current = false;
    setConfirmingRetreat(false);
  };

  // actionType: null (temel saldırı), bir PVP_SKILLS id'si, ya da
  // "potion_hp"/"potion_mp" — pot içmek de artık bir tur harcıyor (bkz.
  // kullanıcı isteği: "Oyunumuzda Tur sistemi olmak zorunda"), bu yüzden
  // aynı sıra-tabanlı akışın (tick + rakibin turu) içinden geçiyor.
  const duelAction = (actionType) => {
    if (lockRef.current || !wz.duel || wz.duel.finished || player.hp <= 0) return;
    const duel = wz.duel;
    const isPotion = actionType === "potion_hp" || actionType === "potion_mp";
    const potionKind = actionType === "potion_hp" ? "hp" : actionType === "potion_mp" ? "mp" : null;
    const skill = (!isPotion && actionType) ? PVP_SKILLS.find((s) => s.id === actionType) : null;

    if (skill) {
      if ((duel.cooldowns[skill.id] || 0) > 0) { pushToast("Bu beceri hâlâ bekleme süresinde.", "warn"); return; }
      if (player.mp < skill.mpCost) { pushToast("Yeterli manan yok.", "warn"); return; }
    }
    let potionResult = null;
    let potionTier = null;
    if (isPotion) {
      if ((duel.potionCooldowns[potionKind] || 0) > 0) { pushToast("Bu pot hâlâ bekleme süresinde.", "warn"); return; }
      potionTier = bestAvailablePotionTier(player, potionKind);
      if (!potionTier) { pushToast("Pot kalmadı.", "warn"); return; }
      potionResult = usePotion(player, potionKind, potionTier);
      if (potionResult.reason) { pushToast(potionResult.reason, "warn"); return; }
    }
    lockRef.current = true;

    const cooldowns = Object.fromEntries(Object.entries(duel.cooldowns).map(([id, t]) => [id, Math.max(0, t - 1)]));
    const potionCooldowns = Object.fromEntries(Object.entries(duel.potionCooldowns).map(([k, t]) => [k, Math.max(0, t - 1)]));
    let log = [...duel.log];
    let ghostHp = duel.ghostHp;
    let ghostStunned = duel.ghostStunned;
    let healBlocked = duel.healBlocked;
    let mpCost = 0;
    let fledSuccessfully = false;
    let wonDuel = false;
    // Bir pot bu turda oyuncuyu iyileştirmiş olabilir — rakibin karşılığını
    // hesaplarken player.hp'nin bayat (henüz commit edilmemiş) değerini
    // değil, bu turun gerçek güncel canını kullanmalıyız.
    let currentHp = player.hp;

    if (isPotion) {
      potionCooldowns[potionKind] = POTION_COOLDOWN_TURNS;
      setPlayer(() => potionResult.player);
      currentHp = potionResult.player.hp;
      log.push(potionKind === "hp" ? `+${potionResult.healed} can kullandın.` : `+${potionResult.healed} mana kullandın.`);
    } else if (!skill) {
      const isCrit = Math.random() < cls.crit;
      const dmg = ghostDamageFromPlayer(cls, atk, duel.ghost, isCrit, player);
      if (dmg == null) {
        log.push(`${duel.ghost.name}'i ıskaladın.`);
      } else {
        ghostHp = Math.max(0, ghostHp - dmg);
        log.push(isCrit ? `Kritik! ${duel.ghost.name}'e ${dmg} hasar verdin.` : `${duel.ghost.name}'e ${dmg} hasar verdin.`);
      }
    } else if (skill.id === "pvp_stun") {
      mpCost = skill.mpCost;
      ghostStunned = true;
      cooldowns[skill.id] = skill.cooldown;
      log.push(`${skill.name}! Rakibi sersemlettin.`);
    } else if (skill.id === "pvp_manaburn") {
      mpCost = skill.mpCost;
      healBlocked = true;
      cooldowns[skill.id] = skill.cooldown;
      log.push(`${skill.name}! Rakibin bir sonraki iyileşmesi engellendi.`);
    } else if (skill.id === "pvp_flee") {
      cooldowns[skill.id] = skill.cooldown;
      if (Math.random() < skill.effect.chance) {
        fledSuccessfully = true;
        log.push("Kaçmayı başardın!");
      } else {
        log.push("Kaçış başarısız oldu!");
      }
    }

    if (mpCost) setPlayer((p) => ({ ...p, mp: p.mp - mpCost }));

    if (ghostHp <= 0) {
      wonDuel = true;
      log.push(`${duel.ghost.name}'i yendin!`);
    }

    if (fledSuccessfully) {
      setWz((prev) => ({ ...prev, duel: { ...prev.duel, log: log.slice(-24) } }));
      setTimeout(() => { endDuel(duel.ghost.id, false); lockRef.current = false; }, 500);
      return;
    }

    if (wonDuel) {
      const result = awardNationalPoint(player);
      const nextPlayer = { ...result.player, milestones: { ...result.player.milestones, duelsWon: (result.player.milestones?.duelsWon || 0) + 1 } };
      setPlayer(() => nextPlayer);
      setWz((prev) => ({ ...prev, duel: { ...prev.duel, ghostHp: 0, log: log.slice(-24), finished: true } }));
      pushToast(`${duel.ghost.name}'i yendin! +${result.gain} National Point`, "loot");
      newlyUnlocked(player, nextPlayer).forEach((a) => pushToast(`Başarım açıldı: ${a.name} — "${a.title}" unvanı kazanıldı!`, "level"));
      setTimeout(() => { endDuel(duel.ghost.id, true); lockRef.current = false; }, 700);
      return;
    }

    // Rakibin turu: sersemlemişse pas, değilse önce iyileşme şansı, yoksa saldırı.
    let playerDied = false;
    if (ghostStunned) {
      log.push(`${duel.ghost.name} sersemlemiş durumda, hamle yapamadı.`);
      ghostStunned = false;
    } else {
      const healedTo = ghostSelfHeal({ ...duel.ghost, hp: ghostHp }, healBlocked);
      if (healedTo != null) {
        ghostHp = healedTo;
        log.push(`${duel.ghost.name} kendini iyileştirdi.`);
        healBlocked = false;
      } else {
        const gdmg = playerDamageFromGhost(duel.ghost, def, player);
        if (gdmg == null) {
          log.push(`${duel.ghost.name} saldırdı ama ıskaladı.`);
        } else {
          log.push(`${duel.ghost.name} sana ${gdmg} hasar verdi.`);
          setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - gdmg) }));
          playerDied = currentHp - gdmg <= 0;
        }
      }
    }

    setWz((prev) => ({ ...prev, duel: { ...prev.duel, ghostHp, ghostStunned, healBlocked, cooldowns, potionCooldowns, log: log.slice(-24), finished: playerDied } }));

    if (playerDied) {
      setTimeout(() => finishDuelAsLoss(duel.ghost.id), 500);
    } else {
      setTimeout(() => { lockRef.current = false; }, 320);
    }
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
      <SectionLabel>Savaş Alanı</SectionLabel>
      <div style={styles.subtabRow}>
        <button style={{ ...styles.subtabBtn, ...(subtab === "alan" ? styles.subtabBtnActive : {}) }} onClick={() => setSubtab("alan")}>Alan</button>
        <button style={{ ...styles.subtabBtn, ...(subtab === "siralama" ? styles.subtabBtnActive : {}) }} onClick={() => setSubtab("siralama")}>Sıralama</button>
      </div>

      {subtab === "alan" && !wz.duel && (
        <>
          <div style={{ ...styles.combatant, marginTop: 12, borderColor: "#C9425A55" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ...styles.monsterIcon, background: "#C9425A22", color: "#C9425A" }}>
                <Skull size={20} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{WORLD_BOSS.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Güçlü · yüksek drop şansı — en çok hasar veren drop'u alır</div>
              </div>
            </div>
            {wz.boss.alive ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                  <span>{wz.boss.hp}/{wz.boss.maxHp}</span>
                  <span>Senin hasarın: {wz.bossDamage.player}</span>
                </div>
                <BarTrack pct={(wz.boss.hp / wz.boss.maxHp) * 100} color="#C9425A" />
                <button style={{ ...styles.primaryBtn, width: "100%", marginTop: 10, background: "#C9425A", opacity: playerDead ? 0.5 : 1 }} onClick={attackBoss} disabled={playerDead}>
                  <Swords size={14} /> Saldır
                </button>
              </>
            ) : (
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
                Yeniden doğuyor... (~{wz.boss.respawnTicks * (WARZONE_TICK_MS / 1000)}s)
              </div>
            )}
          </div>

          <SectionLabel>Bölgedeki Rakip Oyuncular</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {idleGhosts.map((g) => {
              const GIcon = CLASSES[g.cls].icon;
              return (
                <div key={g.id} style={styles.itemRow}>
                  <div style={{ ...styles.monsterIcon, width: 30, height: 30, background: `${RACES[g.race].color}22`, color: RACES[g.race].color }}>
                    <GIcon size={14} strokeWidth={1.6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12 }}>{g.name}</div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{RACES[g.race].name} · {CLASSES[g.cls].name}</div>
                  </div>
                  <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={() => startDuel(g)} disabled={playerDead}>
                    Meydan Oku
                  </button>
                </div>
              );
            })}
            {idleGhosts.length === 0 && <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", padding: 10 }}>Şu an kimse yok, birazdan biri belirecek.</div>}
          </div>
        </>
      )}

      {subtab === "alan" && wz.duel && (
        <div style={{ ...styles.battleArena, marginTop: 12 }}>
          <div style={{ ...styles.combatant, borderColor: "#C9425A55" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>
                <Swords size={12} color="#C9425A" /> {wz.duel.ghost.name} <span style={{ fontSize: 9, color: "var(--text-faint)" }}>({CLASSES[wz.duel.ghost.cls].name})</span>
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{wz.duel.ghostHp}/{wz.duel.ghost.maxHp}</span>
            </div>
            <BarTrack pct={(wz.duel.ghostHp / wz.duel.ghost.maxHp) * 100} color="#C9425A" />
          </div>

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

          <div ref={logRef} style={styles.combatLog}>
            {wz.duel.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
            {PVP_SKILLS.map((skill) => {
              const Icon = PVP_SKILL_ICON[skill.id];
              const cdLeft = wz.duel.cooldowns[skill.id] || 0;
              const noMp = player.mp < skill.mpCost;
              const disabled = cdLeft > 0 || noMp || playerDead || wz.duel.finished;
              return (
                <button
                  key={skill.id}
                  style={{ ...styles.equipSlotCard, borderColor: "#C9425A66", background: "#C9425A12", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}
                  onClick={() => duelAction(skill.id)}
                  disabled={disabled}
                  title={skill.name}
                >
                  <Icon size={15} color="#C9425A" />
                  <div style={{ fontSize: 8, marginTop: 2, color: "var(--text-faint)" }}>{skill.name}</div>
                  <div style={{ fontSize: 7, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{cdLeft > 0 ? cdLeft : (skill.mpCost ? `${skill.mpCost}mp` : "ücretsiz")}</div>
                </button>
              );
            })}
          </div>

          <div style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: (playerDead || wz.duel.finished) ? 0.5 : 1 }} onClick={() => duelAction(null)} disabled={playerDead || wz.duel.finished}>
              <Swords size={15} /> Saldır
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (wz.duel.potionCooldowns.hp > 0 || playerDead || wz.duel.finished) ? 0.5 : 1 }}
              onClick={() => duelAction("potion_hp")}
              disabled={wz.duel.potionCooldowns.hp > 0 || playerDead || wz.duel.finished}
            >
              <Heart size={14} color="#C9425A" /> {wz.duel.potionCooldowns.hp > 0 ? wz.duel.potionCooldowns.hp : (hpPotion?.count || 0)}
            </button>
            <button
              style={{ ...styles.potionBtn, opacity: (wz.duel.potionCooldowns.mp > 0 || playerDead || wz.duel.finished) ? 0.5 : 1 }}
              onClick={() => duelAction("potion_mp")}
              disabled={wz.duel.potionCooldowns.mp > 0 || playerDead || wz.duel.finished}
            >
              <Zap size={14} color="#4FC3D9" /> {wz.duel.potionCooldowns.mp > 0 ? wz.duel.potionCooldowns.mp : (mpPotion?.count || 0)}
            </button>
          </div>
          <button style={styles.ghostBtn} onClick={() => setConfirmingRetreat(true)} disabled={wz.duel.finished}>
            <LogOut size={13} /> Geri Çekil
          </button>

          {confirmingRetreat && (
            <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setConfirmingRetreat(false)}>
              <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <LogOut size={28} color="#C9425A" strokeWidth={1.4} />
                <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
                  Kaçarsan National Point kaybedersin ve rakip hükmen galip sayılır. Emin misin?
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingRetreat(false)}>Hayır</button>
                  <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={concedeDuel}>Evet</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subtab === "siralama" && (
        <>
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

          <div style={styles.subtabRow}>
            <button style={{ ...styles.subtabBtn, ...(lbSort === "weeklyPoint" ? styles.subtabBtnActive : {}) }} onClick={() => setLbSort("weeklyPoint")}>Haftalık</button>
            <button style={{ ...styles.subtabBtn, ...(lbSort === "nationalPoint" ? styles.subtabBtnActive : {}) }} onClick={() => setLbSort("nationalPoint")}>Kalıcı</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {lbEntries.map((e) => (
              <div key={e.rank} style={{ ...styles.itemRow, ...(e.isPlayer ? { borderColor: "#D4AF6A" } : {}) }}>
                <div style={{ width: 20, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: e.rank <= 3 ? "#D4AF6A" : "var(--text-faint)" }}>{e.rank}</div>
                <div style={{ flex: 1, fontSize: 12, color: e.isPlayer ? "var(--text-primary)" : "var(--text-muted)" }}>{e.name}{e.isPlayer ? " (Sen)" : ""}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{lbSort === "weeklyPoint" ? e.weeklyPoint : e.nationalPoint}</div>
              </div>
            ))}
          </div>
          <div style={styles.dropInfoRow}>
            <span><Gift size={10} style={{ verticalAlign: "middle" }} /> Haftalık ilk 3: 7000 / 4000 / 2000 Elmas</span>
          </div>
        </>
      )}

      {deathInfo && <DeathModal xpLost={deathInfo.xpLost} onClose={() => setDeathInfo(null)} />}
    </div>
  );
}
