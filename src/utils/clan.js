import { todayKey } from "./day";
import { CLAN_EXP_TIERS } from "../data/clan";

// Faz 6 — klan üyeliği/davet/paylaşımlı hazine artık gerçek bir backend'de
// (bkz. server/app.mjs'in /api/clan/* uçları, components/ClanTab.jsx).
// Bu dosyada sadece SUNUCUYA hiç ihtiyacı olmayan, saf/yerel hesaplar kaldı:
// EXP bonusu (üye sayısına bağlı basit bir formül) ve Klan Zindanı (kullanıcı
// isteği kapsamı dışında kaldı, kendi günlük yerel durumunu koruyor). Klan
// Boss (bkz. utils/clanBoss.js) de aynı sebepten yerel kalmaya devam ediyor —
// ikisi de player.clan'ın ClanTab tarafından sunucudan doldurulan alanlarını
// (treasury, buildingLevel, role, members) okumaya devam ediyor, format
// değişmedi.

// Artık gerçek üye listesi kendini de içeriyor (bkz. ClanTab.jsx'in
// /api/clan/mine yanıtını player.clan'a eşlediği yer) — eskiden "+1" ile
// telafi edilen "oyuncunun kendisi" burada zaten members içinde.
export function onlineCountFor(clan) {
  if (!clan) return 0;
  return clan.members.length;
}

// En yüksek eşiğe göre TEK bir bonus — üst üste binmez (bkz. data/clan.js).
export function clanExpBonus(onlineCount) {
  for (const tier of CLAN_EXP_TIERS) {
    if (onlineCount >= tier.min) return tier.bonus;
  }
  return 0;
}

export function clanExpMultiplier(player) {
  if (!player.clan) return 1;
  return 1 + clanExpBonus(onlineCountFor(player.clan));
}

// Klan Sıralaması — gerçek başka klanları sıralamak ayrı bir endpoint
// gerektirir (kapsam dışı bırakıldı, bkz. ClanTab.jsx'teki not); şimdilik
// sadece (varsa) oyuncunun KENDİ klanını tek satır gösteriyor.
export function clanLeaderboardFor(race, player) {
  if (player?.clan && player.race === race) {
    return [{ name: player.clan.name, nationalPoint: player.clan.treasury.np, isPlayerClan: true, rank: 1 }];
  }
  return [];
}

export { todayKey };

export function canStartDungeon(player) {
  if (!player.clan) return false;
  if (player.clan.role !== "leader" && player.clan.role !== "officer") return false;
  return player.clan.dungeon.lastStartedDay !== todayKey();
}

// İçerik henüz yok (kullanıcı ek bilgi verecek) — bu sadece günlük
// başlatma/durum iskeleti (bkz. components/ClanTab.jsx). Kasıtlı olarak hâlâ
// yerel: gerçek ortak bir zindan simülasyonu ayrı bir kapsam.
export function startDungeon(player) {
  if (!canStartDungeon(player)) return { player, started: false, reason: "clanDungeonUnavailable" };
  return {
    player: { ...player, clan: { ...player.clan, dungeon: { lastStartedDay: todayKey(), startedBy: player.nickname || "Sen" } } },
    started: true,
  };
}
