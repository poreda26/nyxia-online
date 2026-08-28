import { CLASSES } from "../data/classes";
import { STAT_LABELS, STAT_KEYS, STAT_CAP } from "../data/stats";
import { makePotionStack } from "./inventory";
import { MAPS } from "../data/maps";
import { currentWeekId } from "./week";
import { STARTING_NATIONAL_POINT } from "./nationalPointConstants";
import { buildStartingWeapon } from "./loot";

// Deliberately backloaded: the exponent (not just the base) is what makes
// early levels feel close to before while late levels get dramatically
// harder — level 1 costs ~13% more XP than the old curve, level 64 costs
// ~3.5x more. Tuned by simulation against real weapon/armor/monster data
// (see conversation) to land a regularly-playing character around 40-60
// realistic hours to hit MAX_LEVEL, versus ~15-25 before.
export function xpToNext(level) { return Math.round(90 * Math.pow(level, 1.62)); }

// KO'nun AIServer/User.cpp:347-397'deki seviye-farkı XP kademeleri —
// yüksek seviyeli bir karakterin çok düşük seviyeli haritada avlanıp
// tam XP almasını engeller. Referans "canavar seviyesi" olarak haritanın
// levelMax'ı kullanılıyor (canavar başına ayrı seviye alanı yok).
export function xpLevelPenaltyMultiplier(playerLevel, mapLevelMax) {
  const diff = playerLevel - mapLevelMax;
  if (diff <= 1) return 1;
  if (diff <= 7) return 0.8;
  if (diff <= 13) return 0.5;
  return 0.2;
}

// Hard level cap — T5 (Kaos Tapınağı) unlocks at 60, so this leaves a real
// endgame band (60-65) rather than capping right at the last tier unlock.
export const MAX_LEVEL = 65;

// Every class starts from its own baseStats (see data/classes.js) plus 10
// free points the player distributes themselves — the "Ana Statü" hint in
// CharacterTab nudges them toward what that class scales best with.
const STARTING_STAT_POINTS = 10;

// Depo is account-wide (see utils/storage.js#loadAccount / App.jsx's
// account.bank), shared across all 3 character slots on the account —
// not part of the per-character player object at all.
export const BANK_PAGES = 3;

export function initialPlayer(cls, race, nickname) {
  const base = CLASSES[cls];
  const player = {
    class: cls,
    race,
    nickname,
    level: 1,
    xp: 0,
    gold: 60,
    // Special Market's own currency — separate from gold on purpose so
    // gold stays a pure gameplay sink (see repairCost) instead of also
    // being how you buy race-change scrolls. No in-game earn source is
    // wired up yet; for now it's GM-grantable only (see gmCommands.js
    // /elmas), same caveat as isGM below.
    diamonds: 0,
    // Elmas-bought VIP subscription — see data/premium.js and
    // utils/premium.js#activePremiumTier for how expiresAt is checked.
    premium: { tier: null, expiresAt: null },
    hp: base.maxHp,
    mp: base.maxMp,
    equipped: {
      head: null, chest: null, legs: null, gauntlets: null, boots: null,
      mainHand: null,
      necklace: null, belt: null, ring1: null, ring2: null, earring1: null, earring2: null,
    },
    inventory: [makePotionStack("hp", 1, 3), makePotionStack("mp", 1, 2)],
    chests: [],
    stats: { ...base.baseStats },
    statPoints: STARTING_STAT_POINTS,
    // Beceri (skill) system — known: every skill ever unlocked; loadout: up
    // to 5 of those slotted for actual battle use (see utils/skills.js,
    // data/skills.js#MAX_LOADOUT_SLOTS).
    skills: { known: [], loadout: [null, null, null, null, null] },
    // Cumulative per-monster kill counter, keyed by monster id — feeds both
    // Kaptan's quest progress (utils/quests.js) and nothing else, so it's
    // safe to just keep growing forever.
    monsterKills: {},
    claimedQuests: [],
    // Oyuncunun Kapı üzerinden en son ışınlandığı harita (bkz. data/maps.js,
    // components/BattleTab.jsx) — her yeni karakter en baştaki haritada başlar.
    currentMapId: MAPS[0].id,
    // National Point (kalıcı, hiç sıfırlanmaz) ve Weekly Point (her hafta
    // sıfırlanır) — Savaş Alanı'ndaki karşı ırk PK'lerinden kazanılır (bkz.
    // utils/nationalPoint.js, components/WarzoneTab.jsx). weekId, weeklyPoint
    // hangi haftaya ait diye takip eder; hafta değişince App.jsx#handlePlay
    // içindeki applyWeeklyRollover çağrısı sıfırlar.
    nationalPoint: STARTING_NATIONAL_POINT,
    weeklyPoint: 0,
    weekId: currentWeekId(),
    // Klan üyeliği (bkz. utils/clan.js, components/ClanTab.jsx) — hesap
    // değil karakter bazlı, null ise klansız demek.
    clan: null,
    // 2. Uyanış (Master rank) — see utils/quests.js#claimAwakening. Gates
    // Tier 5 armor (see equipItem below) and prefixes the class name with
    // "Master" everywhere it's displayed (see displayClassName below).
    awakened: false,
    // NOTE: this build has no real backend, so GM status can only be
    // enforced client-side — it defaults to true because this is a
    // single-player local build (you're the only one who can run it). Once
    // there's a real server, GM must be verified there; a client-side flag
    // alone is trivially spoofable from devtools and must never be trusted
    // for a real multiplayer deployment.
    isGM: true,
    // Otomatik Saldırı ayarları — bkz. components/BattleTab.jsx (savaş
    // ekranındaki ikon aynı `enabled` alanını değiştirir) ve
    // components/CharacterTab.jsx'in "Otomatik Saldırı" alt sekmesi. Eşikler
    // yüzde (0-100), can/mana o yüzdenin ALTINA düşünce ilgili pot içiliyor.
    autoBattle: { enabled: false, hpThreshold: 35, mpThreshold: 35 },
  };
  // Her karakter sınıfına özel +1 bir silahla kuşanılmış doğar (bkz.
  // data/startingWeapons.js) — eli boş başlamıyor.
  const startingWeapon = buildStartingWeapon(cls);
  if (startingWeapon) {
    const result = equipItem(player, startingWeapon);
    if (!result.blocked) {
      // hp/mp yukarıda sınıfın ÇIPLAK base.maxHp/maxMp'sine ayarlanmıştı —
      // silah kuşandıktan sonra gerçek tavan (base + seviye + eşya bonusu,
      // bkz. playerMaxHp/playerMaxMp) daha yüksek olabiliyor, o yüzden burada
      // tekrar tam dolduruyoruz ki karakter gerçekten %100 canla başlasın.
      return { ...result.player, hp: playerMaxHp(result.player), mp: playerMaxMp(result.player) };
    }
  }
  return player;
}

// Backfills fields added to the player shape after a character was already
// saved (skills/monsterKills/claimedQuests/awakened this session, premium/
// diamonds/nickname from earlier ones) — called wherever a character is
// loaded from storage (see App.jsx#handlePlay), never needed for a freshly
// created one since initialPlayer already sets everything.
export function migratePlayer(player) {
  // "Yrd. El" slotu kaldırıldı (kullanıcı isteğiyle tek silah slotu) — o
  // slotta bir şey kuşanılı kalmış eski kayıtlarda, kaybolmasın diye
  // çantaya geri koyuyoruz.
  const equipped = { ...player.equipped };
  const inventory = [...player.inventory];
  if (equipped.offHand) {
    inventory.push(equipped.offHand);
    delete equipped.offHand;
  }
  // CHA kaldırıldı, yerine Magic Power (mag) geldi (bkz. data/stats.js) —
  // eski kayıtlarda hâlâ `stats.cha` duruyor olabilir, oraya yatırılmış
  // puanlar kaybolmasın diye mag'a taşınıyor (henüz mag hiç yoksa).
  const stats = { ...player.stats };
  if ("cha" in stats) {
    if (stats.mag == null) stats.mag = stats.cha;
    delete stats.cha;
  }
  return {
    ...player,
    equipped,
    inventory,
    stats,
    diamonds: player.diamonds ?? 0,
    premium: player.premium || { tier: null, expiresAt: null },
    nickname: player.nickname ?? null,
    skills: player.skills || { known: [], loadout: [null, null, null, null, null] },
    monsterKills: player.monsterKills || {},
    claimedQuests: player.claimedQuests || [],
    awakened: player.awakened ?? false,
    currentMapId: player.currentMapId || MAPS[0].id,
    nationalPoint: player.nationalPoint ?? STARTING_NATIONAL_POINT,
    weeklyPoint: player.weeklyPoint ?? 0,
    weekId: player.weekId || currentWeekId(),
    clan: player.clan ?? null,
    autoBattle: player.autoBattle || { enabled: false, hpThreshold: 35, mpThreshold: 35 },
  };
}

export const ALL_EQUIP_KEYS = [
  "head", "chest", "legs", "gauntlets", "boots", "mainHand",
  "necklace", "belt", "ring1", "ring2", "earring1", "earring2",
];

// Job (sınıf) ve ırk değiştirme parşömenleri için ortak "bug'sız kullanım"
// şartı — üstünde hiçbir eşya kuşanılı olmayacak ve bir klana üye
// olunmayacak (bkz. data/clan.js, components/InventoryTab.jsx).
export function canChangeJob(player) {
  if (Object.values(player.equipped).some((it) => it != null)) {
    return { ok: false, reason: "Önce tüm eşyalarını çıkarmalısın." };
  }
  if (player.clan) {
    return { ok: false, reason: "Bir klana üyeyken sınıf değiştiremezsin." };
  }
  return { ok: true };
}

// Sınıf değişince eski sınıfın beceri id'leri yeni sınıfın tablosunda
// bulunmuyor — sıfırlanmazsa CharacterTab/BattleTab'in loadout render'ı
// classSkills(player.class).find(...) undefined döndüğü an çöker. Stat
// puanları (STR/STA/DEX/INT/CHA) kasıtlı olarak DEĞİŞTİRİLMİYOR.
export function changeJob(player, newClass) {
  const next = {
    ...player,
    class: newClass,
    skills: { known: [], loadout: [null, null, null, null, null] },
  };
  next.hp = Math.min(next.hp, playerMaxHp(next));
  next.mp = Math.min(next.mp, playerMaxMp(next));
  return next;
}

// A repairable item at 0 durability is broken — it stays equipped (no
// forced unequip) but contributes nothing until repaired, same as real KO.
export function isBroken(item) {
  return item && item.durability > 0 && item.currentDurability <= 0;
}

// Some weapons (see data/warriorWeapons.js) grant a flat stat bonus while
// equipped, on top of the player's own allocated points — kept separate
// from player.stats itself so equip requirements (which check player.stats
// directly) can't be bootstrapped by the gear that needs them.
function equippedStatBonus(player) {
  const bonus = { str: 0, sta: 0, dex: 0, int: 0, mag: 0 };
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (it && !isBroken(it) && it.statBonus) STAT_KEYS.forEach((key) => { bonus[key] += it.statBonus[key] || 0; });
  });
  return bonus;
}

// Allocated stat points feed combat power on top of gear: STR/DEX/INT/Magic
// Power each add a small flat ATK, STA feeds max HP and INT feeds max MP
// (see playerMaxMp below) — this is what makes /karakter's point allocation
// actually matter in battle, not just gate equips. The coefficients are
// deliberately small: baseStats alone put these numbers in the 50-70 range
// from character creation, so a 1:1 translation into ATK/HP would dwarf
// class and gear power.
// Magic Power gets a Mage-only elevated weight (0.5 vs the usual 0.1) —
// kullanıcı isteğiyle: "Magemizin asıl damage'ini yükselten şey Magic Power
// olacak." Diğer 3 sınıf için mag hâlâ eski CHA'nın aldığı düz 0.1 ağırlığı
// alıyor (baseStats değerleri de birebir eskisiyle aynı), bu yüzden bu
// değişiklik Warrior/Rogue/Priest'in ATK'sını hiç etkilemiyor — sadece
// Mage'e mag'ı gerçek bir "asıl statü" yapıyor.
export function totalStats(player) {
  let hp = 0, def = 0, atk = 0, mp = 0;
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (it && !isBroken(it)) { hp += it.hp || 0; def += it.def || 0; atk += it.atk || 0; mp += it.mp || 0; }
  });
  const s = player.stats;
  const bonus = equippedStatBonus(player);
  const magWeight = player.class === "mage" ? 0.5 : 0.1;
  atk += Math.round((s.str + bonus.str + s.dex + bonus.dex + s.int + bonus.int) * 0.1 + (s.mag + bonus.mag) * magWeight);
  hp += s.sta + bonus.sta;
  return { hp, def, atk, mp };
}

export function allocateStat(player, statKey) {
  if (player.statPoints <= 0) return player;
  if (player.stats[statKey] >= STAT_CAP) return player;
  return {
    ...player,
    statPoints: player.statPoints - 1,
    stats: { ...player.stats, [statKey]: player.stats[statKey] + 1 },
  };
}

// Gear HP bonus raises the ceiling but never auto-heals — equipping/
// unequipping only clamps current HP down if it would otherwise exceed
// the new cap (see clampPlayerHp / equipItem below).
export function playerMaxHp(player) {
  const base = CLASSES[player.class];
  const { hp } = totalStats(player);
  return base.maxHp + Math.round(player.level * 1.2) + hp;
}

export function playerMaxMp(player) {
  const base = CLASSES[player.class];
  const { mp: gearMp } = totalStats(player);
  const bonus = equippedStatBonus(player);
  return base.maxMp + Math.round(player.level * 0.6) + Math.round((player.stats.int + bonus.int) * 0.5) + gearMp;
}

// DEF artık HP/MP ile aynı desende: sınıf tabanı + seviye + zırh —
// KO'nun `sınıf_katsayısı*(Seviye+eşya_AC)` formülünün ruhu, bizim
// ölçeğimize (kısa seviye aralığı, küçük sınıf DEF'leri) uyarlanmış hali.
// Önceden sınıf DEF'i (data/classes.js) hiç savaşa girmiyordu — sadece
// karakter oluşturma önizlemesinde ve Savaş Alanı hayalet gücünde
// kullanılıyordu, bu onu gerçek bir stat yapıyor.
export function playerDef(player) {
  const base = CLASSES[player.class];
  const { def: gearDef } = totalStats(player);
  return base.def + Math.round(player.level * 0.5) + gearDef;
}

export function clampPlayerHp(player) {
  return { ...player, hp: Math.min(player.hp, playerMaxHp(player)) };
}

// Ölünce (canavar/Dünya Canavarı tarafından) uygulanan ceza — mevcut
// seviyenin toplam XP ihtiyacının küçük bir yüzdesi kaybediliyor (gerçek
// KO'daki ölüm cezasının ruhu), asla seviye düşürmüyor (xp 0'da tabanlanıyor)
// ve asla dengeye/ilerlemeye bağlı istismar edilemiyor (seviye içindeki
// mevcut xp'ye değil xpToNext'e göre sabit bir yüzde). HP/MP HER ZAMAN tam
// yenileniyor — önceden buradaki "canın kısmen yenilendi" toast'ı YALANDI,
// hiçbir yerde gerçekten can/mana geri yüklenmiyordu (kullanıcının bildirdiği
// "düşük canla başlıyoruz" bug'ının kök nedeni: ölümden sonra hp 0'da
// kalıp bir daha hiç dolmuyordu).
export const DEATH_XP_LOSS_PCT = 0.05;

export function applyDeathPenalty(player) {
  const xpLost = Math.min(player.xp, Math.round(xpToNext(player.level) * DEATH_XP_LOSS_PCT));
  const next = { ...player, xp: player.xp - xpLost, hp: playerMaxHp(player), mp: playerMaxMp(player) };
  return { player: next, xpLost };
}

export const WEAPON_SLOTS = ["mainHand"];
export const ARMOR_SLOTS = ["head", "chest", "legs", "gauntlets", "boots"];

// Durability decay: weapons wear down when the player lands a hit, armor
// wears down when the player takes one — gear damage is tied to actually
// fighting, not to time passing. See BattleTab#attack.
export function damageEquippedDurability(player, slotKeys, amount = 1) {
  const equipped = { ...player.equipped };
  slotKeys.forEach((k) => {
    const it = equipped[k];
    if (it && it.durability > 0) {
      equipped[k] = { ...it, currentDurability: Math.max(0, it.currentDurability - amount) };
    }
  });
  return { ...player, equipped };
}

// Repair cost is a deliberate gold sink — the point is to give gold
// somewhere to go besides piling up, so it stays scarce and worth earning.
export function repairCost(item) {
  if (!item || !item.durability) return 0;
  const missing = item.durability - item.currentDurability;
  if (missing <= 0) return 0;
  return Math.max(1, Math.round(missing * 0.12 * item.tier));
}

// Premium's repair discount is applied here rather than baked into
// repairCost itself, so this file stays free of any dependency on
// utils/premium.js (which already imports from here for BANK_PAGES) —
// callers pass the discount fraction (0-1) they already looked up.
export function discountedRepairCost(item, discount = 0) {
  const full = repairCost(item);
  if (full <= 0) return 0;
  return Math.max(1, Math.round(full * (1 - discount)));
}

// Repairs one item wherever it currently lives (equipped, bag, or the
// account's shared bank) — the tooltip that offers this button doesn't know
// which, so this just patches every slot that could hold it by id. Bank is
// account-wide now (see BANK_PAGES above), so it's passed and returned
// separately from player rather than living at player.bank.
export function repairItem(player, item, discount = 0, bank = null) {
  const cost = discountedRepairCost(item, discount);
  if (cost <= 0) return { player, bank, repaired: false, cost: 0 };
  if (player.gold < cost) return { player, bank, repaired: false, cost, reason: "Yeterli altının yok." };

  const patch = (it) => (it && it.id === item.id ? { ...it, currentDurability: it.durability } : it);
  const equipped = {};
  ALL_EQUIP_KEYS.forEach((k) => { equipped[k] = patch(player.equipped[k]); });
  const inventory = player.inventory.map(patch);
  const nextBank = bank ? bank.map((page) => page.map(patch)) : bank;

  return { player: { ...player, gold: player.gold - cost, equipped, inventory }, bank: nextBank, repaired: true, cost };
}

export function sellPrice(item) {
  const statBonusSum = item.statBonus ? Object.values(item.statBonus).reduce((s, v) => s + (v || 0), 0) : 0;
  return Math.round((item.hp || 0) * 0.9 + (item.atk || 0) * 1.4 + (item.def || 0) * 1.3 + statBonusSum * 3);
}

// 2. Uyanış sonrası her yerde "Master X" görünsün diye tek bir yerden.
export function displayClassName(player) {
  const base = CLASSES[player.class].name;
  return player.awakened ? `Master ${base}` : base;
}

export function displayItemName(item) {
  return item.upgradeLevel ? `${item.name} +${item.upgradeLevel}` : item.name;
}

// Equip an item into the correct slot(s), handling two-handed weapons
// (which occupy both hands), paired ring/earring slots, and class-locked
// armor. Returns { player, blocked } — blocked carries a reason string
// when the equip was refused so the caller can toast it.
export function equipItem(player, item) {
  if (item.kind === "armor" && item.class !== player.class) {
    return { player, blocked: `Bu eşya ${CLASSES[item.class].name} sınıfına özel — kuşanamazsın.` };
  }
  // Silahlar da artık zırh gibi sınıfa özel — her sınıfın kendi silah
  // tablosu var (bkz. data/warriorWeapons.js vb.), gerçek KO'da olduğu
  // gibi kuşanma sırasında da gerçekten kilitli (önceden sadece görsel bir
  // ayrımdı, kullanıcının "sadece Warrior kullanabilecek" isteğiyle
  // gerçek bir kısıtlamaya dönüştürüldü).
  if (item.kind === "weapon" && item.cls && item.cls !== player.class) {
    return { player, blocked: `Bu silah ${CLASSES[item.cls].name} sınıfına özel — kuşanamazsın.` };
  }
  if (item.kind === "armor" && item.tier === 5 && !player.awakened) {
    return { player, blocked: "Bu zırhı kuşanmak için 2. Uyanış (Master) gerekiyor." };
  }
  // reqStats normalde 5 dağıtılabilir statüden birini gösterir, ama bazı
  // eşyalar (bkz. Avedon, "Required Health") HP isteyebiliyor — HP bir
  // statü değil, seviye+STA+eşyadan türeyen bir havuz, bu yüzden `hp`
  // anahtarı özel olarak playerMaxHp'ye bakıyor. Aynı desende `level`
  // (bkz. "Staff of <selfname>", Required Level: 70) player.stats'ta değil
  // doğrudan player.level'da yaşıyor.
  const currentReqValue = (key) => (key === "hp" ? playerMaxHp(player) : key === "level" ? player.level : player.stats[key]);
  const unmet = (item.reqStats || []).filter((r) => currentReqValue(r.key) < r.value);
  if (unmet.length > 0) {
    const need = unmet.map((r) => `${r.value} ${STAT_LABELS[r.key]} (şu an: ${currentReqValue(r.key)})`).join(" ve ");
    return { player, blocked: `Bu eşyayı kuşanmak için en az ${need} gerekiyor.` };
  }

  let inv = player.inventory.filter((i) => i.id !== item.id);
  let equipped = { ...player.equipped };

  if (item.kind === "weapon") {
    // Tek silah slotu — kullanıcı isteğiyle "yan el" kaldırıldı, mainHand/
    // offHand/twoHand ayrımı artık sadece görsel/flavor bir alan
    // (ağırlık formülü ve tooltip için), kuşanma her zaman tek slotu
    // (mainHand) hedefliyor.
    if (equipped.mainHand) inv.push(equipped.mainHand);
    equipped.mainHand = item;
  } else if (item.kind === "accessory" && item.slot === "ring") {
    const target = !equipped.ring1 ? "ring1" : (!equipped.ring2 ? "ring2" : "ring1");
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else if (item.kind === "accessory" && item.slot === "earring") {
    const target = !equipped.earring1 ? "earring1" : (!equipped.earring2 ? "earring2" : "earring1");
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else {
    const slotKey = item.slot; // armor slot, or 'necklace' / 'belt'
    if (equipped[slotKey]) inv.push(equipped[slotKey]);
    equipped[slotKey] = item;
  }

  const nextPlayer = clampPlayerHp({ ...player, inventory: inv, equipped });
  return { player: nextPlayer, blocked: null };
}
