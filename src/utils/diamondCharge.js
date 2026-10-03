import { spendDiamonds } from "../services/walletService";

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
    const result = await spendDiamonds(kind, key, ref);
    return { ok: true, diamonds: result.diamonds, price: result.price };
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

export function reportChargeFailure(t, pushToast, charge) {
  const message = chargeFailureMessage(t, charge);
  if (message) pushToast(message, "warn");
}

// Başarısız tahsilat için kullanıcıya gösterilecek metin ("" = sessiz geç).
export function chargeFailureMessage(t, charge) {
  if (charge.code === "BUSY") return "";
  if (charge.code === "NOT_ENOUGH_DIAMONDS") return t("shop.notEnoughDiamonds");
  return t("wallet.unavailable");
}
