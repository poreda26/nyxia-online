import { addItemToInventory, makeScrollStack } from "./inventory";

// Rehberli tutorial bölümleri. Oyuncu ilerlemesi player.tutorialSection'da
// saklanır (uygulama kapansa da kaldığı bölümden devam eder); player.tutorialSeen
// bitti/atlandı demektir.
export const TUTORIAL_SECTIONS = ["welcome", "skills", "battle", "upgrade", "wrap"];

export const TUTORIAL_GIFT_GOLD = 200;
export const TUTORIAL_TARGET_UPGRADE = 3;

// Başlangıç hediyesi: bir kez verilir (tekrar izlemede ikinci kez verilmez).
// +1'den +3'e basmak 2 parşömen ister; 1 parşömen hediye, ikincisini
// Mağaza'dan almayı da öğretsin diye 200 altın ekleniyor.
export function grantTutorialGift(player) {
  if (player.tutorialGift) return { player, granted: false };
  const withGold = { ...player, gold: player.gold + TUTORIAL_GIFT_GOLD, tutorialGift: true };
  const result = addItemToInventory(withGold, makeScrollStack(1, 1));
  return { player: result.added ? result.player : withGold, granted: true, scrollAdded: result.added };
}

export const totalKills = (player) => Object.values(player.monsterKills || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);

// Öğretilen silah: kuşanılmış ana el, yoksa çantadaki ilk silah. Aynı kimlik
// yükseltmeden sonra da korunur (bkz. UpgradeTab#press), bu yüzden ilk bulunan
// kimlik takip edilir. Forge'da bekleyen silah ne çantada ne üstünde görünür.
export function findTutorialWeapon(player, weaponId) {
  const equipped = player.equipped?.mainHand;
  if (weaponId) {
    if (equipped?.id === weaponId) return { weapon: equipped, where: "equipped" };
    const bagged = player.inventory.find((it) => it.id === weaponId);
    return bagged ? { weapon: bagged, where: "bag" } : { weapon: null, where: "staged" };
  }
  if (equipped?.kind === "weapon") return { weapon: equipped, where: "equipped" };
  const bagged = player.inventory.find((it) => it.kind === "weapon" && !it.noTrade);
  return bagged ? { weapon: bagged, where: "bag" } : { weapon: null, where: "none" };
}

// Çantadaki + forge'a yerleştirilmemiş T1 parşömen sayısı.
export const bagScrollCount = (player, tier = 1) => player.inventory
  .filter((it) => it.kind === "scroll" && it.tier === tier)
  .reduce((sum, it) => sum + (it.count || 1), 0);

export const TUTORIAL_SCROLL_PRICE = 100;

// Yükseltme bölümü için adım — yalnızca oyuncu durumundan, açık sekmeden ve
// ekrandaki öğelerden (probe) türetilir, bu yüzden uygulama yeniden açılsa da
// doğru adımı gösterir. Dönen { key, nav, target, done }:
// nav = alt menüde dokunulacak sekme, target = dokunulacak öğenin seçicisi
// (rehber o öğe dışındaki her yeri karartıp kilitler).
export function upgradeHint(player, tab, weaponId, probe = {}) {
  const { weapon, where } = findTutorialWeapon(player, weaponId);
  if (where === "none") return { key: "noWeapon", done: true };
  const level = weapon?.upgradeLevel || 0;
  const weaponSel = weapon ? `[data-item-kind="weapon"][data-item-id="${weapon.id}"]` : null;
  const shopSteps = () => (probe.shopOpen
    ? { key: "buyScroll", target: '[data-tut="scroll-card-1"]' }
    : { key: "openShop", target: '[data-tut="forge-shop"]' });

  if (weapon && level >= TUTORIAL_TARGET_UPGRADE) {
    if (where === "equipped") return { key: "finished", done: true };
    if (tab !== "inventory") return { key: "goInventoryEquip", nav: "inventory" };
    return probe.equipBtn ? { key: "equipBack", target: '[data-tut="equip-btn"]' } : { key: "selectToEquip", target: weaponSel };
  }
  if (where === "equipped") {
    if (tab !== "inventory") return { key: "goInventory", nav: "inventory" };
    return probe.unequipBtn ? { key: "unequip", target: '[data-tut="unequip-btn"]' } : { key: "selectEquipped", target: '.equipment-layout [data-slot="mainHand"]' };
  }
  if (tab !== "upgrade") return { key: "goUpgrade", nav: "upgrade" };
  const noScroll = bagScrollCount(player, 1) === 0 && !probe.boxFilled;
  if (where === "bag") {
    if (noScroll) return { ...shopSteps(), key: probe.shopOpen ? "buyScroll" : "openShop" };
    return { key: level > 1 ? "stageAgain" : "stage", target: weaponSel };
  }
  // Silah forge'da bekliyor.
  if (probe.boxFilled) return { key: "press", target: '[data-tut="forge-press"]' };
  if (noScroll) return shopSteps();
  return { key: "putScroll", target: '[data-item-kind="scroll"]' };
}
