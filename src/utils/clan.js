import { rand, pick, uid } from "./random";
import { CLASSES } from "../data/classes";
import { ghostNamesForRace } from "../data/warzoneNames";
import { seededRng, seededShuffle } from "./seededRng";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS, CLAN_EXP_TIERS, CLAN_NAMES, CLAN_COLORS, CLAN_NP_DONATION_REFUND_RATE } from "../data/clan";
import { CLAN_BUILDING_MAX_LEVEL, CLAN_BUILDING_UPGRADE_COST } from "../data/clanBoss";

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

// Klan Binası + Boss hazinesi — bkz. data/clanBoss.js. treasury.np sadece
// OYUNCUNUN KENDİ bağışlarıyla büyür (gerçek çok-oyunculu backend yok, bkz.
// dosyanın üstündeki genel not); myNpDonated aynı toplamı ayrı tutar çünkü
// klandan ayrılınca sadece kendi payının bir kısmı geri veriliyor (bkz.
// leaveClan), treasury.np'nin kendisi (varsayımsal diğer üyelerin payı da
// içerdiğinden) o hesaplamada kullanılmıyor.
function freshTreasury() {
  return { np: 0, gold: 0, diamonds: 0 };
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
    treasury: freshTreasury(),
    buildingLevel: 1,
    myNpDonated: 0,
    boss: null,
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
    treasury: freshTreasury(),
    buildingLevel: 1,
    myNpDonated: 0,
    boss: null,
  };
  return { player: { ...player, clan }, joined: true };
}

// Klandan ayrılınca kendi bağışladığın toplam NP'nin
// CLAN_NP_DONATION_REFUND_RATE'i geri veriliyor (kullanıcı isteği) —
// klanın kendisi (diğer üyelerin bağışları, hazine, bina, boss durumu)
// hiç etkilenmiyor, çünkü ayrılan tek kişi sen olduğun için o veri artık
// senin player nesnende yaşamıyor olacak.
export function leaveClan(player) {
  const refund = Math.round((player.clan?.myNpDonated || 0) * CLAN_NP_DONATION_REFUND_RATE);
  return { player: { ...player, clan: null, nationalPoint: player.nationalPoint + refund }, refund };
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

export function todayKey() {
  return new Date().toDateString();
}

// NP/gold/elmas bağışı — üçü de klan hazinesini besler (bkz. data/clanBoss.js
// için boss açma şartları ve bina yükseltme maliyeti). NP ayrıca kendi payını
// (myNpDonated) ayrı tutar çünkü ayrılınca sadece o geri veriliyor (bkz.
// leaveClan) — gold/elmas bağışının hiçbir geri ödemesi yok (kullanıcı
// isteği: sadece NP için %35 iade var).
export function donateNP(player, amount) {
  if (!player.clan) return { player, donated: false, reason: "Bir klana üye değilsin." };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "Geçerli bir miktar gir." };
  if (player.nationalPoint < amount) return { player, donated: false, reason: "Yeterli NP'in yok." };
  return {
    player: {
      ...player,
      nationalPoint: player.nationalPoint - amount,
      clan: { ...player.clan, treasury: { ...player.clan.treasury, np: player.clan.treasury.np + amount }, myNpDonated: player.clan.myNpDonated + amount },
    },
    donated: true,
  };
}

export function donateGold(player, amount) {
  if (!player.clan) return { player, donated: false, reason: "Bir klana üye değilsin." };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "Geçerli bir miktar gir." };
  if (player.gold < amount) return { player, donated: false, reason: "Yeterli altının yok." };
  return {
    player: { ...player, gold: player.gold - amount, clan: { ...player.clan, treasury: { ...player.clan.treasury, gold: player.clan.treasury.gold + amount } } },
    donated: true,
  };
}

export function donateDiamonds(player, amount) {
  if (!player.clan) return { player, donated: false, reason: "Bir klana üye değilsin." };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "Geçerli bir miktar gir." };
  if (player.diamonds < amount) return { player, donated: false, reason: "Yeterli elmasın yok." };
  return {
    player: { ...player, diamonds: player.diamonds - amount, clan: { ...player.clan, treasury: { ...player.clan.treasury, diamonds: player.clan.treasury.diamonds + amount } } },
    donated: true,
  };
}

// Klan Binası — tek genel seviye (1-5), bkz. data/clanBoss.js'teki notlar
// (gerçek bina türleri kullanıcı tarafından sonra tanımlanacak). Sadece
// lider/yardımcı yükseltebilir — Klan Zindanı'nı başlatma yetkisiyle aynı
// kural (bkz. canStartDungeon).
export function canUpgradeClanBuilding(player) {
  if (!player.clan) return { ok: false, reason: "Bir klana üye değilsin." };
  if (player.clan.role !== "leader" && player.clan.role !== "officer") return { ok: false, reason: "Sadece lider/yardımcı yükseltebilir." };
  if (player.clan.buildingLevel >= CLAN_BUILDING_MAX_LEVEL) return { ok: false, reason: "Klan Binası zaten en üst seviyede." };
  const cost = CLAN_BUILDING_UPGRADE_COST[player.clan.buildingLevel + 1];
  if (player.clan.treasury.gold < cost.gold || player.clan.treasury.diamonds < cost.diamonds) {
    return { ok: false, reason: `Hazinede ${cost.gold}g ve ${cost.diamonds} elmas gerekiyor.` };
  }
  return { ok: true, cost };
}

export function upgradeClanBuilding(player) {
  const check = canUpgradeClanBuilding(player);
  if (!check.ok) return { player, upgraded: false, reason: check.reason };
  return {
    player: {
      ...player,
      clan: {
        ...player.clan,
        buildingLevel: player.clan.buildingLevel + 1,
        treasury: {
          ...player.clan.treasury,
          gold: player.clan.treasury.gold - check.cost.gold,
          diamonds: player.clan.treasury.diamonds - check.cost.diamonds,
        },
      },
    },
    upgraded: true,
  };
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
