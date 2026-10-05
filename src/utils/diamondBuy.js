import { getActiveCharacterKey } from "./api";

// Sunucu ekonomisinde elmasla alınan eşya/paketler tek eylemle alınır (tahsilat + teslim aynı işlemde).
// Dönen sonuç `act` sonucudur; başarısızlıkta kullanıcıya gösterilecek metni `purchaseFailureText` verir.
export async function buyWithDiamonds(act, kind, key = null) {
  return act("diamond/buy", { kind, key, characterKey: getActiveCharacterKey() });
}

export function purchaseFailureText(t, result) {
  if (result.code === "NOT_ENOUGH_DIAMONDS" || result.reason === "notEnoughDiamonds") return t("shop.notEnoughDiamonds");
  if (result.code === "ALREADY_PREMIUM") return t("shop.alreadyHavePremium");
  if (result.reason === "alreadyBoughtToday") return t("battle.dungeonEntriesAlreadyBoughtToday");
  if (result.reason === "maxBankPages") return t("inventory.maxBankPagesReached");
  if (result.reason === "purchaseFailed") return t("shop.purchaseFailed", { reason: result.detail || "" });
  if (result.reason === "network") return t("wallet.unavailable");
  return t("shop.purchaseFailed", { reason: result.reason || "" });
}
