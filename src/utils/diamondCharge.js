import { spendDiamonds } from "../services/walletService";
import { getActiveCharacterKey } from "./api";

// Elmas harcaması SUNUCUDA yapılır (bkz. server/wallet.mjs): fiyatı sunucu belirler,
// bakiye sunucuda tutulur. Satın alma akışı: (1) yerelde "alınabilir mi" denemesi
// (çanta dolu mu vb.), (2) chargeDiamonds ile sunucuda tahsilat, (3) eşyayı
// settle() ile sunucunun bakiyesine oturtup uygula. Aynı anda tek tahsilat
// yapılır, çift dokunuş iki kez ödetmez.
let inFlight = false;

export async function chargeDiamonds(kind, key = null, ref = null) {
  if (inFlight) return { ok: false, code: "BUSY" };
  inFlight = true;
  try {
    const result = await spendDiamonds(kind, key, ref, getActiveCharacterKey());
    return { ok: true, diamonds: result.diamonds, price: result.price, entitlement: result.entitlement || null };
  } catch (error) {
    return { ok: false, code: error?.code || "REQUEST_FAILED" };
  } finally {
    inFlight = false;
  }
}

// Yerel saf fonksiyonlar (buyPremium, buyWings...) bedeli kendileri düşer; sunucu
// zaten tahsil ettiği için oyuncuyu "tahsilattan önceki" bakiyeye çekip onlara
// veriyoruz — sonuçta oyuncunun bakiyesi tam olarak sunucudaki bakiye olur.
export const settle = (player, charge) => ({ ...player, diamonds: charge.diamonds + charge.price });

// Sunucunun verdiği hak özetini (premium, boya, avatar, çerçeve) oyuncuya yazar:
// yerelde hesaplanan değil, sunucudakini esas alır.
export function applyEntitlement(player, entitlement) {
  if (!entitlement) return player;
  const next = { ...player };
  for (const field of ["premium", "ownedDyes", "ownedAvatars", "ownedAvatarFrames"]) if (entitlement[field] !== undefined) next[field] = entitlement[field];
  if (entitlement.premiumBoost !== undefined) { if (entitlement.premiumBoost) next.premiumBoost = entitlement.premiumBoost; else delete next.premiumBoost; }
  return next;
}

export function reportChargeFailure(t, pushToast, charge) {
  const message = chargeFailureMessage(t, charge);
  if (message) pushToast(message, "warn");
}

// Başarısız tahsilat için kullanıcıya gösterilecek metin ("" = sessiz geç).
export function chargeFailureMessage(t, charge) {
  if (charge.code === "BUSY") return "";
  if (charge.code === "NOT_ENOUGH_DIAMONDS") return t("shop.notEnoughDiamonds");
  if (charge.code === "ALREADY_PREMIUM") return t("shop.alreadyHavePremium");
  if (charge.code === "ALREADY_OWNED") return t("wallet.alreadyOwned");
  return t("wallet.unavailable");
}
