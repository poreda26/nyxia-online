import { rand, pick, uid } from "./random";
import { CLASSES } from "../data/classes";
import { ghostNamesForRace } from "../data/warzoneNames";
import { seededRng, seededShuffle } from "./seededRng";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS, CLAN_EXP_TIERS, CLAN_NAMES, CLAN_COLORS } from "../data/clan";

// Gerçek sunucu gelene kadar hem kurulan hem katılınan klanlar tamamen
// simüle — data/warzoneNames.js'teki (Savaş Alanı hayaletleri için zaten
// var olan) isim havuzu klan üyeleri için de kullanılıyor. Test
// edilebilirlik için (kullanıcı: "hazır olsun, ben test edeceğim") hem
// kurulan hem katılınan klanlar gerçekçi organik büyüme beklemeden
// doğrudan online-sayısı eşiklerinin hepsini test edebilecek büyüklükte
// (15-38 simüle üye) doğuyor.
function spawnClanMemberRandom(race, role) {
  const names = ghostNamesForRace(race);
  return { id: uid(), name: pick(names), race, cls: pick(Object.keys(CLASSES)), role };
}

// Sahte klanları listelerken her şeyin (isim, üye sayısı, her üyenin adı/
// sınıfı) `rng`'den türemesi gerekiyor — aksi hâlde her render'da farklı
// üye isimleriyle "titreme" olur (bkz. utils/leaderboard.js'teki aynı
// disiplin).
function spawnClanMemberSeeded(race, role, rng) {
  const names = ghostNamesForRace(race);
  const classKeys = Object.keys(CLASSES);
  return {
    id: `m-${Math.floor(rng() * 1e9)}`,
    name: names[Math.floor(rng() * names.length)],
    race,
    cls: classKeys[Math.floor(rng() * classKeys.length)],
    role,
  };
}

function generateMembersSeeded(race, count, rng, withLeaderRoles) {
  const members = [];
  for (let i = 0; i < count; i++) {
    let role = "member";
    if (withLeaderRoles) {
      if (i === 0) role = "leader";
      else if (i <= CLAN_MAX_OFFICERS) role = "officer";
    }
    members.push(spawnClanMemberSeeded(race, role, rng));
  }
  return members;
}

// Bir saatlik dilime göre değişen (ama o dilim içinde sabit) online/offline
// durumu — gerçek bir tick döngüsü kurmadan "zamanla değişiyor" hissi verir.
function hourBucket() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
}

function isMemberOnline(memberId) {
  const rng = seededRng(`online:${memberId}:${hourBucket()}`);
  return rng() < 0.55;
}

// +1: oyuncunun kendisi her zaman online sayılır (sekmeyi açtığı an zaten öyle).
export function onlineCountFor(clan) {
  if (!clan) return 0;
  return clan.members.filter((m) => isMemberOnline(m.id)).length + 1;
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

function freshDungeon() {
  return { lastStartedDay: null, startedBy: null };
}

export function foundClan(player, name) {
  if (player.clan) return { player, founded: false, reason: "Zaten bir klana üyesin." };
  const trimmed = (name || "").trim();
  if (!trimmed) return { player, founded: false, reason: "Bir klan adı gir." };
  if (player.diamonds < CLAN_FOUND_COST_DIAMONDS) return { player, founded: false, reason: "Yeterli elmasın yok." };

  const memberCount = rand(15, 38);
  const clan = {
    id: uid(),
    name: trimmed,
    color: pick(CLAN_COLORS),
    role: "leader",
    founded: true,
    createdAt: Date.now(),
    members: Array.from({ length: memberCount }, () => spawnClanMemberRandom(player.race, "member")),
    dungeon: freshDungeon(),
  };
  return { player: { ...player, diamonds: player.diamonds - CLAN_FOUND_COST_DIAMONDS, clan }, founded: true };
}

// Katılınabilecek sahte klanlar — oyuncunun ırkına göre seed'lenir, bu
// yüzden aynı ırktaki her karakter için aynı 5 klan görünür (gerçek sunucu
// gelince bu fonksiyonun yerini gerçek bir "klanları listele" API'si alacak).
export function generateDecoyClans(player) {
  const rng = seededRng(`clans:${player.race}`);
  const names = seededShuffle(CLAN_NAMES, rng).slice(0, 5);
  return names.map((name) => {
    const memberCount = 14 + Math.floor(rng() * 24); // 14-37
    return {
      id: `decoy:${name}`,
      name,
      color: CLAN_COLORS[Math.floor(rng() * CLAN_COLORS.length)],
      members: generateMembersSeeded(player.race, memberCount, rng, true),
    };
  });
}

export function joinClan(player, decoyClan) {
  if (player.clan) return { player, joined: false, reason: "Zaten bir klana üyesin." };
  if (decoyClan.members.length + 1 >= CLAN_MAX_MEMBERS) return { player, joined: false, reason: "Klan dolu." };
  const clan = {
    id: decoyClan.id, name: decoyClan.name, color: decoyClan.color,
    role: "member", founded: false, createdAt: Date.now(),
    members: decoyClan.members, dungeon: freshDungeon(),
  };
  return { player: { ...player, clan }, joined: true };
}

export function leaveClan(player) {
  return { ...player, clan: null };
}

export function promoteMember(player, memberId) {
  if (!player.clan || player.clan.role !== "leader") return player;
  const officerCount = player.clan.members.filter((m) => m.role === "officer").length;
  if (officerCount >= CLAN_MAX_OFFICERS) return player;
  const members = player.clan.members.map((m) => (m.id === memberId && m.role === "member" ? { ...m, role: "officer" } : m));
  return { ...player, clan: { ...player.clan, members } };
}

export function demoteMember(player, memberId) {
  if (!player.clan || player.clan.role !== "leader") return player;
  const members = player.clan.members.map((m) => (m.id === memberId && m.role === "officer" ? { ...m, role: "member" } : m));
  return { ...player, clan: { ...player.clan, members } };
}

function todayKey() {
  return new Date().toDateString();
}

export function canStartDungeon(player) {
  if (!player.clan) return false;
  if (player.clan.role !== "leader" && player.clan.role !== "officer") return false;
  return player.clan.dungeon.lastStartedDay !== todayKey();
}

// İçerik henüz yok (kullanıcı ek bilgi verecek) — bu sadece günlük
// başlatma/durum iskeleti (bkz. components/ClanTab.jsx).
export function startDungeon(player) {
  if (!canStartDungeon(player)) return { player, started: false, reason: "Zindan bugün zaten başlatıldı ya da yetkin yok." };
  return {
    player: { ...player, clan: { ...player.clan, dungeon: { lastStartedDay: todayKey(), startedBy: player.nickname || "Sen" } } },
    started: true,
  };
}
