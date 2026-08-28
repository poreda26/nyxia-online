// Kademeli iksirler — her kademe bir öncekinin iki katı sabit miktar
// iyileştirir (yüzdesel değil), bkz. utils/potions.js#usePotion. "Küçük
// Mana İksiri" kaldırıldı (kullanıcı isteği) — kullanıcının hazırladığı
// yeni pot görselleri sadece 4 mana kademesini kapsıyor (HP'yle simetrik),
// bu yüzden eski 2. kademeden itibaren her şey bir basamak yukarı kaydı.
export const HP_POTION_TIERS = [90, 180, 360, 720];
export const MP_POTION_TIERS = [240, 480, 960, 1920];

export const POTION_TIER_NAMES = {
  hp: ["Küçük Can İksiri", "Can İksiri", "Büyük Can İksiri", "Muazzam Can İksiri"],
  mp: ["Mana İksiri", "Büyük Mana İksiri", "Muazzam Mana İksiri", "Efsanevi Mana İksiri"],
};

// Şifa/gold oranı her kademede sabit kalacak şekilde fiyat da ikiye katlanıyor.
export const POTION_TIER_PRICES = {
  hp: [12, 24, 48, 96],
  mp: [32, 64, 128, 256],
};

export function potionTiersFor(potionType) {
  return potionType === "hp" ? HP_POTION_TIERS : MP_POTION_TIERS;
}

export function potionAmount(potionType, tier) {
  return potionTiersFor(potionType)[tier - 1] || 0;
}

export function potionName(potionType, tier) {
  return POTION_TIER_NAMES[potionType]?.[tier - 1] || (potionType === "hp" ? "Can İksiri" : "Mana İksiri");
}

export function potionPrice(potionType, tier) {
  return POTION_TIER_PRICES[potionType]?.[tier - 1] || 0;
}
