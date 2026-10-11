import { CLASSES } from "../data/classes";
import { totalStats } from "./player";
import { mitigate, MONSTER_DEF_K } from "./combat";
import { seededRng } from "./seededRng";
import { todayKey } from "./clan";
import { CLAN_BOSS_STAGES, CLAN_BOSS_WINDOW_MS, findBossStage } from "../data/clanBoss";

// Hangi aşamalar şu an açılabilir — hem hazinedeki toplam NP hem Klan Binası
// seviyesi şartını sağlayanlar (bkz. data/clanBoss.js'teki tablo).
export function unlockedBossStages(clan) {
  if (!clan) return [];
  return CLAN_BOSS_STAGES.filter((s) => clan.treasury.np >= s.npRequired && clan.buildingLevel >= s.buildingLevelRequired);
}

export function canOpenClanBoss(player, stageId) {
  if (!player.clan) return { ok: false, reason: "Bir klana üye değilsin." };
  if (player.clan.role !== "leader" && player.clan.role !== "officer") return { ok: false, reason: "Sadece lider/yardımcı boss açabilir." };
  if (player.clan.boss && player.clan.boss.lastOpenedDay === todayKey()) return { ok: false, reason: "Boss bugün zaten açıldı." };
  const stage = findBossStage(stageId);
  if (!stage) return { ok: false, reason: "Geçersiz aşama." };
  if (!unlockedBossStages(player.clan).some((s) => s.id === stageId)) return { ok: false, reason: "Bu aşama henüz açılamıyor." };
  return { ok: true, stage };
}

// Açılışta boss'un tam durumu kaydediliyor — hp'yi ayrıca canlı tutmuyoruz
// (bkz. bossCurrentHp), sadece oyuncunun kendi tek saldırısının hasarını
// (playerDamage) kalıcı olarak tutuyoruz, gerisi openedAt'ten türetiliyor.
export function openClanBoss(player, stageId) {
  const check = canOpenClanBoss(player, stageId);
  if (!check.ok) return { player, opened: false, reason: check.reason };
  const boss = {
    stageId, openedAt: Date.now(), lastOpenedDay: todayKey(),
    playerDamage: 0, playerAttacked: false, openedBy: player.nickname || "Sen",
  };
  return { player: { ...player, clan: { ...player.clan, boss } }, opened: true, stage: check.stage };
}

export function bossElapsedMs(clan) {
  if (!clan?.boss) return 0;
  return Math.max(0, Date.now() - clan.boss.openedAt);
}

export function bossTimeLeftMs(clan) {
  if (!clan?.boss) return 0;
  return Math.max(0, CLAN_BOSS_WINDOW_MS - bossElapsedMs(clan));
}

// Klanın hayalet üyeleri de pencere boyunca birer kez vuruyor — gerçek bir
// tick döngüsü kurup state'i sürekli mutasyona uğratmak yerine (bkz.
// utils/clan.js#isMemberOnline'daki aynı disiplin), her üyenin "ne zaman
// vuracağı" ve "ne kadar hasar vereceği" boss açıldığı anda (openedAt) ve
// üye id'sinden deterministik olarak türetiliyor — kaç kere hesaplanırsa
// hesaplansın aynı sonucu verir, sekmeyi ne zaman açarsan aç tutarlı kalır.
function memberContribution(member, clan, stage) {
  const rng = seededRng(`clanboss:${clan.boss.openedAt}:${member.id}`);
  const attackAtMs = rng() * CLAN_BOSS_WINDOW_MS;
  const dmg = Math.round(stage.memberDmgMin + rng() * (stage.memberDmgMax - stage.memberDmgMin));
  return { attackAtMs, dmg };
}

export function simulatedMemberDamage(clan) {
  if (!clan?.boss) return 0;
  const stage = findBossStage(clan.boss.stageId);
  if (!stage) return 0;
  const elapsed = bossElapsedMs(clan);
  let total = 0;
  for (const m of clan.members) {
    const { attackAtMs, dmg } = memberContribution(m, clan, stage);
    if (elapsed >= attackAtMs) total += dmg;
  }
  return total;
}

export function simulatedAttackerCount(clan) {
  if (!clan?.boss) return 0;
  const stage = findBossStage(clan.boss.stageId);
  if (!stage) return 0;
  const elapsed = bossElapsedMs(clan);
  let count = 0;
  for (const m of clan.members) {
    const { attackAtMs } = memberContribution(m, clan, stage);
    if (elapsed >= attackAtMs) count += 1;
  }
  return count;
}

export function bossMaxHp(clan) {
  const stage = clan?.boss ? findBossStage(clan.boss.stageId) : null;
  return stage ? stage.hp : 0;
}

export function bossCurrentHp(clan) {
  if (!clan?.boss) return 0;
  const maxHp = bossMaxHp(clan);
  return Math.max(0, maxHp - simulatedMemberDamage(clan) - (clan.boss.playerDamage || 0));
}

// Boss "açık" sayılır: hâlâ süresi dolmamış VE hâlâ canı var. İkisinden biri
// olmazsa (öldü ya da pencere kapandı) artık saldırılamaz, sadece o günün
// sonucu görüntülenir.
export function isClanBossActive(clan) {
  return !!clan?.boss && bossTimeLeftMs(clan) > 0 && bossCurrentHp(clan) > 0;
}

export function canPlayerAttackBoss(player) {
  return isClanBossActive(player.clan) && !player.clan.boss.playerAttacked;
}

// Oyuncunun tek saldırısı — BattleTab.jsx#attack'taki formülle aynı mantık
// (cls.atk + gearAtk*0.9, monster.def'e karşı mitigate). Kritik şansı da
// aynı şekilde sınıfının kendi crit'i.
export function attackClanBoss(player) {
  if (!canPlayerAttackBoss(player)) return { player, attacked: false, reason: "Şu an saldıramazsın." };
  const stage = findBossStage(player.clan.boss.stageId);
  const cls = CLASSES[player.class];
  const { atk } = totalStats(player);
  const isCrit = Math.random() < cls.crit;
  const dmg = Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), stage.def, MONSTER_DEF_K)));
  return {
    player: {
      ...player,
      clan: { ...player.clan, boss: { ...player.clan.boss, playerDamage: player.clan.boss.playerDamage + dmg, playerAttacked: true } },
    },
    attacked: true,
    dmg,
    isCrit,
  };
}
