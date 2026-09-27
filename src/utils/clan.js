import { todayKey } from "./day";
import { CLAN_EXP_TIERS } from "../data/clan";

// Faz 6 — klan üyeliği/davet/paylaşımlı hazine artık gerçek bir backend'de
// (bkz. server/app.mjs'in /api/clan/* uçları, components/ClanTab.jsx). Klan
// Dungeon (20 aşamalı, bkz. ClanDungeonPanel.jsx) da tamamen sunucuda yaşıyor.
// Bu dosyada sadece SUNUCUYA hiç ihtiyacı olmayan, saf/yerel bir hesap kaldı:
// EXP bonusu (üye sayısına bağlı basit bir formül). Klan Boss (bkz.
// utils/clanBoss.js) da aynı sebepten yerel kalmaya devam ediyor — ikisi de
// player.clan'ın ClanTab tarafından sunucudan doldurulan alanlarını
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
