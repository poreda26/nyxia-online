import { pick, uid } from "./random";
import { todayKey } from "./day";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS, CLAN_EXP_TIERS, CLAN_COLORS, CLAN_NP_DONATION_REFUND_RATE } from "../data/clan";
import { CLAN_BUILDING_MAX_LEVEL, CLAN_BUILDING_UPGRADE_COST } from "../data/clanBoss";

// Kullanıcı isteği: "Artık bot oyuncular klanlar pazarlar yok" — sahte
// (simüle) klan üyeleri ve rakip klanlar tamamen kaldırıldı. Bir klan artık
// sadece GERÇEK oyunculardan oluşuyor; şu an klana gerçek başka bir oyuncu
// davet etme/katılma yolu yok (paylaşımlı bir backend gerekiyor), bu yüzden
// bir klan pratikte sadece kurucusundan ibaret kalıyor — `members` dizisi
// kurucu DIŞINDAKİ üyeleri tutar (bkz. onlineCountFor'daki +1).

// +1: oyuncunun kendisi her zaman online sayılır (sekmeyi açtığı an zaten öyle).
export function onlineCountFor(clan) {
  if (!clan) return 0;
  return clan.members.length + 1;
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
  if (player.clan) return { player, founded: false, reason: "alreadyInClan" };
  const trimmed = (name || "").trim();
  if (!trimmed) return { player, founded: false, reason: "enterClanName" };
  if (player.diamonds < CLAN_FOUND_COST_DIAMONDS) return { player, founded: false, reason: "notEnoughDiamonds" };

  const clan = {
    id: uid(),
    name: trimmed,
    color: pick(CLAN_COLORS),
    role: "leader",
    founded: true,
    createdAt: Date.now(),
    members: [],
    dungeon: freshDungeon(),
    treasury: freshTreasury(),
    buildingLevel: 1,
    myNpDonated: 0,
    boss: null,
  };
  return {
    player: { ...player, diamonds: player.diamonds - CLAN_FOUND_COST_DIAMONDS, clan, milestones: { ...player.milestones, hasFoundedClan: true } },
    founded: true,
  };
}

// Klan Sıralaması — gerçek başka klanlar için paylaşımlı bir backend
// gerekiyor, henüz yok; bu yüzden sıralama artık sadece (varsa) oyuncunun
// KENDİ klanını, tek satır olarak gösteriyor.
export function clanLeaderboardFor(race, player) {
  if (player?.clan && player.race === race) {
    return [{ name: player.clan.name, nationalPoint: player.clan.treasury.np, isPlayerClan: true, rank: 1 }];
  }
  return [];
}

// Var olan bir klana katılmak — gerçek başka klanları listeleyecek bir
// backend gelene kadar çağıracak bir yer yok (bkz. ClanTab.jsx'teki boş
// "Mevcut Klanlar" durumu), fonksiyonun kendisi genel bırakıldı ki o
// backend geldiğinde değişmeden kullanılabilsin.
export function joinClan(player, otherClan) {
  if (player.clan) return { player, joined: false, reason: "alreadyInClan" };
  if (otherClan.members.length + 1 >= CLAN_MAX_MEMBERS) return { player, joined: false, reason: "clanFull" };
  const clan = {
    id: otherClan.id, name: otherClan.name, color: otherClan.color,
    role: "member", founded: false, createdAt: Date.now(),
    members: otherClan.members, dungeon: freshDungeon(),
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

// Artık utils/day.js'te yaşıyor (günlük giriş ödülü/günlük görevler de aynı
// tanıma ihtiyaç duydu, bkz. üstteki import) — burada da yeniden export
// ediliyor ki clanBoss.js'in mevcut "./clan"'dan import'u bozulmasın.
// NOT: sadece "export ... from" yazıp import etmeyi atlamak bu dosyanın
// KENDİ İÇİNDEKİ todayKey() çağrılarını (aşağıda, canStartDungeon/
// startDungeon) tanımsız bırakıp Klan sekmesini ReferenceError ile
// çökertmişti (kullanıcının bildirdiği "Klana tıklayınca oyun gidiyor" bug'ı)
// — import + re-export ayrı ayrı yapılması gerekiyordu.
export { todayKey };

// NP/gold/elmas bağışı — üçü de klan hazinesini besler (bkz. data/clanBoss.js
// için boss açma şartları ve bina yükseltme maliyeti). NP ayrıca kendi payını
// (myNpDonated) ayrı tutar çünkü ayrılınca sadece o geri veriliyor (bkz.
// leaveClan) — gold/elmas bağışının hiçbir geri ödemesi yok (kullanıcı
// isteği: sadece NP için %35 iade var).
export function donateNP(player, amount) {
  if (!player.clan) return { player, donated: false, reason: "notInClan" };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "enterValidAmount" };
  if (player.nationalPoint < amount) return { player, donated: false, reason: "notEnoughNP" };
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
  if (!player.clan) return { player, donated: false, reason: "notInClan" };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "enterValidAmount" };
  if (player.gold < amount) return { player, donated: false, reason: "notEnoughGold" };
  return {
    player: { ...player, gold: player.gold - amount, clan: { ...player.clan, treasury: { ...player.clan.treasury, gold: player.clan.treasury.gold + amount } } },
    donated: true,
  };
}

export function donateDiamonds(player, amount) {
  if (!player.clan) return { player, donated: false, reason: "notInClan" };
  if (!Number.isFinite(amount) || amount <= 0) return { player, donated: false, reason: "enterValidAmount" };
  if (player.diamonds < amount) return { player, donated: false, reason: "notEnoughDiamonds" };
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
  if (!player.clan) return { ok: false, reason: "notInClan" };
  if (player.clan.role !== "leader" && player.clan.role !== "officer") return { ok: false, reason: "leaderOfficerOnlyUpgrade" };
  if (player.clan.buildingLevel >= CLAN_BUILDING_MAX_LEVEL) return { ok: false, reason: "clanBuildingMaxLevel" };
  const cost = CLAN_BUILDING_UPGRADE_COST[player.clan.buildingLevel + 1];
  if (player.clan.treasury.gold < cost.gold || player.clan.treasury.diamonds < cost.diamonds) {
    return { ok: false, reason: "treasuryNeedsCost", reasonVars: { gold: cost.gold, diamonds: cost.diamonds } };
  }
  return { ok: true, cost };
}

export function upgradeClanBuilding(player) {
  const check = canUpgradeClanBuilding(player);
  if (!check.ok) return { player, upgraded: false, reason: check.reason, reasonVars: check.reasonVars };
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
  if (!canStartDungeon(player)) return { player, started: false, reason: "clanDungeonUnavailable" };
  return {
    player: { ...player, clan: { ...player.clan, dungeon: { lastStartedDay: todayKey(), startedBy: player.nickname || "Sen" } } },
    started: true,
  };
}
