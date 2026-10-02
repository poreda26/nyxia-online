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

// Yükseltme bölümü için ipucu anahtarı — yalnızca oyuncu durumu ve açık sekmeden
// türetilir, bu yüzden uygulama yeniden açılsa bile doğru adımı gösterir.
// Dönen { key, nav, done }: nav = alt menüde vurgulanacak sekme.
export function upgradeHint(player, tab, weaponId) {
  const { weapon, where } = findTutorialWeapon(player, weaponId);
  if (where === "none") return { key: "noWeapon", done: true };
  const level = weapon?.upgradeLevel || 0;
  if (weapon && level >= TUTORIAL_TARGET_UPGRADE) {
    if (where === "equipped") return { key: "finished", done: true };
    return tab === "inventory" ? { key: "equipBack" } : { key: "goInventoryEquip", nav: "inventory" };
  }
  if (where === "equipped") return tab === "inventory" ? { key: "unequip" } : { key: "goInventory", nav: "inventory" };
  if (where === "bag") {
    if (tab !== "upgrade") return { key: "goUpgrade", nav: "upgrade" };
    return level > 1 ? { key: "stageAgain" } : { key: "stage" };
  }
  // Forge'da bekliyor.
  if (tab !== "upgrade") return { key: "goUpgrade", nav: "upgrade" };
  return bagScrollCount(player, 1) > 0 ? { key: "scrollPress" } : { key: "buyScroll" };
}
