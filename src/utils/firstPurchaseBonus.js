import { FIRST_PURCHASE_WEAPONS } from '../data/firstPurchaseWeapons';
// İlk Ödeme Bonusu — kullanıcı isteği: gerçek parayla (₺49,99, bkz.
// data/diamondPacks.js'teki aynı "priceLabel = referans, henüz IAP yok"
// deseni) satın alınan, hesap başına TEK SEFERLİK bir başlangıç paketi.
// İçerik: Elmasla satılan 6 takviye parşömeninin (data/boostScrolls.js)
// her birinden 3'er tane + satın alınan karakterin sınıfına göre TAM bir
// Tier 1 +6 zırh seti (5 parça) ve özel görünümlü +3 silah — hepsi kullanıcı
// isteğiyle takas edilemez/satılamaz/yükseltilemez (noTrade:true; bkz.
// components/MarketTab.jsx#sellableItems, UpgradeTab.jsx#handleBagTap,
// InventoryTab.jsx'in zaten var olan sell/bulk-sell noTrade kontrolleri).
// Gerçek ödeme altyapısı (RevenueCat/App Store/Play Console) henüz
// bağlanmadı — bu fonksiyon, DIAMOND_PACKS'in "yakında" toast'ı gibi,
// sadece o entegrasyon tamamlanınca onaylanmış bir satın alma sonrası
// çağrılmaya hazır.
import { BOOST_SCROLLS } from "../data/boostScrolls";
import { makeBoostScrollStack } from "./boosts";
import { ARMOR_SLOTS } from "../data/armorRig";
import { gmBuildArmor, gmBuildWeaponById, gmWeaponTemplates } from "./loot";
import { addItemToInventory } from "./inventory";

export const FIRST_PURCHASE_BONUS_PRICE_LABEL = "₺49,99";
export const FIRST_PURCHASE_BONUS_SCROLL_COUNT = 3;
export const FIRST_PURCHASE_BONUS_ITEM_TIER = 1;
export const FIRST_PURCHASE_BONUS_UPGRADE_LEVEL = 6;
// Weapon stats remain +3; the separate appearance registry renders +7.

export function hasClaimedFirstPurchaseBonus(player) {
  return !!player.firstPurchaseBonusClaimed;
}

// Sınıfa göre T1 +6 zırh ve bağlı +3 özellikli özel silah.
// Ayrıca export ediliyor — kullanıcı isteği: "itemlerin görsellerini
// gösterelim... üzerine tıklandığında itemleri görebilelim" — mağaza
// kartları/promo widget'ı bunu SADECE ÖNİZLEME için (grant etmeden, gerçek
// bir uid ile ama envantere hiç eklenmeden) çağırıyor.
export function buildBonusGear(cls) {
  const items = [];
  for (const slot of ARMOR_SLOTS) {
    const piece = gmBuildArmor(cls, slot, FIRST_PURCHASE_BONUS_ITEM_TIER, FIRST_PURCHASE_BONUS_UPGRADE_LEVEL);
    if (piece) items.push({ ...piece, noTrade: true });
  }
  const reward = FIRST_PURCHASE_WEAPONS[cls];
  const template = gmWeaponTemplates(cls).find(w => w.name === reward?.reference);
  const weapon = template && gmBuildWeaponById(cls, template.id, 3);
  if (weapon) items.push({ ...weapon, name: reward.name, noTrade: true, upgradeLocked: true,
    lore: `${reward.appearance} +7 görünümü; ${reward.reference} +3 özellikleri. Satılamaz, takaslanamaz, yükseltilemez.` });
  return items;
}

// Aynı önizleme amacıyla — 6 takviye parşömeninin her biri 3'lük bir yığın.
export function buildBonusScrolls() {
  return BOOST_SCROLLS.map((s) => makeBoostScrollStack(s.id, FIRST_PURCHASE_BONUS_SCROLL_COUNT));
}

// Onaylanmış bir satın alma sonrası çağrılır. Hesap başına bir kez çalışır
// (firstPurchaseBonusClaimed bayrağı), çanta doluysa/ağırlık yetmezse o
// tek parça atlanır ama bayrak yine de set edilir — ödeme onaylandıktan
// sonra bonusun "hiç verilmemiş" gibi görünmesini istemiyoruz; `skipped`
// listesi çağıran tarafın (ör. bir GM komutu ya da destek akışı) eksik
// kalanı elle tamamlamasına izin verir.
export function grantFirstPurchaseBonus(player) {
  if (hasClaimedFirstPurchaseBonus(player)) return { player, granted: false, reason: "alreadyClaimed" };

  let p = { ...player, firstPurchaseBonusClaimed: true };
  const skipped = [];

  for (const scroll of buildBonusScrolls()) {
    const result = addItemToInventory(p, scroll);
    if (result.added) p = result.player;
    else skipped.push(scroll.boostId);
  }

  for (const item of buildBonusGear(p.class)) {
    const result = addItemToInventory(p, item);
    if (result.added) p = result.player;
    else skipped.push(item.name);
  }

  return { player: p, granted: true, skipped };
}
