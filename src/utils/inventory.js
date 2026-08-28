import { potionName } from "../data/potions";
import { uid } from "./random";

export const BAG_COLUMNS = 8;
export const BAG_ROWS = 4;
export const BAG_SLOTS = BAG_COLUMNS * BAG_ROWS;

// player.inventory itself stays a plain compact list (every other util in
// this file, plus equip/sell/consume flows across the app, read and write
// it that way) — bagLayout is a purely presentational overlay mapping each
// of the BAG_SLOTS grid boxes to an item id, so a player can drop an item
// into any specific empty box and have it stay there instead of the grid
// auto-compacting gaps away. This reconciles that overlay against whatever
// the current inventory actually holds: stale ids (item sold/equipped/used)
// are dropped, and any item missing from the layout (freshly picked up)
// gets slotted into the first empty box.
export function reconcileBagLayout(player) {
  const layout = Array.from({ length: BAG_SLOTS }, (_, i) => player.bagLayout?.[i] ?? null);
  const idsInInventory = new Set(player.inventory.map((it) => it.id));
  const seen = new Set();
  for (let i = 0; i < BAG_SLOTS; i++) {
    const id = layout[i];
    if (id && (!idsInInventory.has(id) || seen.has(id))) layout[i] = null;
    else if (id) seen.add(id);
  }
  player.inventory.forEach((it) => {
    if (seen.has(it.id)) return;
    const emptyIndex = layout.findIndex((v) => v === null);
    if (emptyIndex >= 0) { layout[emptyIndex] = it.id; seen.add(it.id); }
  });
  return layout;
}

// Taşıma kapasitesi artık sınıf (temel), seviye ve STR'ye (temel statü +
// ekipmandan gelen statBonus.str) bağlı — her STR puanı gerçek bir kapasite
// artışı sağlıyor, sadece savaş gücüne katkısı olan diğer statülerden farklı
// olarak. ALL_EQUIP_KEYS için player.js'e bağımlı — döngüsel import riski
// yok, player.js zaten bu dosyadan (inventory.js) bağımsız bir yönde import
// yapıyor (makePotionStack vb. için), tersi yön burada ilk kez kuruluyor
// ama player.js bu dosyayı zaten import ediyor, o yüzden inventory.js'in
// player.js'i import etmesi bir döngü yaratır — bu yüzden ALL_EQUIP_KEYS
// burada yerel olarak tekrar tanımlanmıyor, doğrudan player.equipped'ın
// kendi key'leri üzerinden dönülüyor.
const CLASS_BASE_WEIGHT = { warrior: 90, rogue: 70, mage: 50, priest: 60 };
const STR_WEIGHT_FACTOR = 0.8; // her STR puanı +0.8 kapasite
const LEVEL_WEIGHT_PER_LEVEL = 1.5;

export function bagWeightCapacity(player) {
  const equippedStr = Object.values(player.equipped).reduce((s, it) => s + (it?.statBonus?.str || 0), 0);
  const totalStr = (player.stats?.str || 0) + equippedStr;
  const base = CLASS_BASE_WEIGHT[player.class] ?? 60;
  return Math.round(base + player.level * LEVEL_WEIGHT_PER_LEVEL + totalStr * STR_WEIGHT_FACTOR);
}

export function bagWeightUsed(player) {
  return player.inventory.reduce((sum, it) => sum + (it.weight || 0) * (it.count || 1), 0);
}

// tier: kademe (1 = en zayıf) — bkz. data/potions.js. Her kademe ayrı bir
// yığın/slot, birbirine karışmıyor.
export function potionStackKey(potionType, tier) {
  return `potion:${potionType}:${tier}`;
}

export function makePotionStack(potionType, tier, count) {
  return {
    id: potionStackKey(potionType, tier),
    kind: "potion",
    potionType,
    tier,
    name: potionName(potionType, tier),
    count,
    weight: 1,
    stackable: true,
    stackKey: potionStackKey(potionType, tier),
  };
}

export function scrollStackKey(tier) {
  return `scroll:${tier}`;
}

export function makeScrollStack(tier, count) {
  return {
    id: scrollStackKey(tier),
    kind: "scroll",
    tier,
    name: `T${tier} Yükseltme Parşömeni`,
    count,
    weight: 0.5,
    stackable: true,
    stackKey: scrollStackKey(tier),
  };
}

export const RACE_SCROLL_ID = "race-change-scroll";

export function makeRaceScroll(count = 1) {
  return {
    id: RACE_SCROLL_ID,
    kind: "raceScroll",
    name: "Irk Değiştirme Parşömeni",
    count,
    weight: 0.5,
    stackable: true,
    stackKey: RACE_SCROLL_ID,
  };
}

export const JOB_SCROLL_ID = "job-change-scroll";

export function makeJobScroll(count = 1) {
  return {
    id: JOB_SCROLL_ID,
    kind: "jobScroll",
    name: "Job Değiştirme Kağıdı",
    count,
    weight: 0.5,
    stackable: true,
    stackKey: JOB_SCROLL_ID,
  };
}

// Premium's gift item — placed into the forge alongside a normal tier
// scroll to add a flat success-chance boost for that one press (see
// utils/upgrade.js#BONUS_SCROLL_BOOST). Not tied to any tier itself, so it
// works on any item. Deliberately NOT stackable — each one is its own bag
// slot (kullanıcı isteği) — so every call makes a fresh unique id instead of
// sharing one merged stack.
export function makeBonusScrollStack() {
  return {
    id: uid(),
    kind: "bonusScroll",
    name: "Bonus Parşömen",
    desc: "Silah ve zırh yükseltmesinde kullanılan bir eşya. Bu, eşyanın yok olmayacağının garantisi değildir. Sadece yükseltme şansını artırır.",
    weight: 0.5,
    stackable: false,
  };
}

function stackKeyOf(item) {
  return item.stackable ? (item.stackKey || `${item.kind}:${item.name}`) : null;
}

// Adds an item to the bag, respecting the fixed 32-slot grid and the
// player's weight capacity. Stackable items (potions) merge into an
// existing stack instead of consuming a new slot. Returns { player, added,
// reason } — reason is a toast-ready string when the pickup was refused.
export function addItemToInventory(player, item) {
  const weightCap = bagWeightCapacity(player);
  const usedWeight = bagWeightUsed(player);
  const incomingWeight = (item.weight || 0) * (item.count || 1);

  if (item.stackable) {
    const key = stackKeyOf(item);
    const existingIdx = player.inventory.findIndex((i) => i.stackable && stackKeyOf(i) === key);
    if (existingIdx >= 0) {
      if (usedWeight + incomingWeight > weightCap) {
        return { player, added: false, reason: "ağırlık kapasitesi dolu." };
      }
      const inventory = player.inventory.map((i, idx) =>
        idx === existingIdx ? { ...i, count: (i.count || 1) + (item.count || 1) } : i
      );
      return { player: { ...player, inventory }, added: true };
    }
  }

  if (player.inventory.length >= BAG_SLOTS) {
    return { player, added: false, reason: "çanta dolu." };
  }
  if (usedWeight + incomingWeight > weightCap) {
    return { player, added: false, reason: "ağırlık kapasitesi dolu." };
  }
  return { player: { ...player, inventory: [...player.inventory, item] }, added: true };
}

// Bank is account-wide (see App.jsx's account.bank / utils/storage.js), not
// part of the per-character player object, so these two take and return it
// as its own argument instead of reading/writing player.bank. No weight
// limit since nothing stored there is being carried — just a per-page slot
// cap matching the bag grid's 32 for a consistent look.
export const BANK_PAGE_SLOTS = BAG_SLOTS;

export function depositToBank(player, item, bank, pageIndex) {
  const page = bank[pageIndex];
  if (item.stackable) {
    const key = stackKeyOf(item);
    const existingIdx = page.findIndex((i) => i.stackable && stackKeyOf(i) === key);
    if (existingIdx >= 0) {
      const nextBank = bank.map((p, idx) => (idx !== pageIndex ? p : p.map((i, j) => (j === existingIdx ? { ...i, count: (i.count || 1) + (item.count || 1) } : i))));
      const inventory = player.inventory.filter((i) => i.id !== item.id);
      return { player: { ...player, inventory }, bank: nextBank, moved: true };
    }
  }
  if (page.length >= BANK_PAGE_SLOTS) return { player, bank, moved: false, reason: "depo sayfası dolu." };
  const inventory = player.inventory.filter((i) => i.id !== item.id);
  const nextBank = bank.map((p, idx) => (idx !== pageIndex ? p : [...p, item]));
  return { player: { ...player, inventory }, bank: nextBank, moved: true };
}

export function withdrawFromBank(player, item, bank, pageIndex) {
  const result = addItemToInventory(player, item);
  if (!result.added) return { player, bank, moved: false, reason: result.reason };
  const nextBank = bank.map((p, idx) => (idx !== pageIndex ? p : p.filter((i) => i.id !== item.id)));
  return { player: result.player, bank: nextBank, moved: true };
}
