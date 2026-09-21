import { Gift, Flame } from "lucide-react";
import { pick } from "../utils/random";
import { FIRST_PURCHASE_BONUS_PRICE_LABEL } from "../utils/firstPurchaseBonus";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import FirstPurchaseBonusPreview from "./FirstPurchaseBonusPreview";

// Kullanıcı isteği: "İlk ödeme ödülü almayan kişilere oyuna ilk girişte
// güzel bir widget açılsın... Fırsat Kaçmaz tarzında kampanyalı şatafatlı
// bir şekilde" — LevelUpModal'ın konfeti/reveal deseni (bkz. chest-reveal,
// confetti-wrap CSS sınıfları) burada da kullanılıyor ki oyunun geri
// kalanıyla görsel dili tutarlı olsun. Gerçek ödeme henüz yok (bkz.
// DiamondShopModal#handleBuyPack) — "Hemen Yakala" da aynı "yakında"
// toast'ını gösteriyor, sahte bir geri sayım/aciliyet eklenmedi (dürüst
// pazarlama: "hesap başına 1 kez" gerçek bir kısıt, uydurma bir süre değil).
export default function FirstPurchaseOfferModal({ player, onBuy, onClose }) {
  const { t } = useTranslation();
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 320, borderColor: "var(--gold-text)", boxShadow: "0 0 40px -10px #D4AF6A88" }} onClick={(e) => e.stopPropagation()}>
        <div className="chest-reveal">
          <div className="confetti-wrap">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="confetti-bit"
                style={{ background: pick(["#D4AF6A", "#EDE8DC", "#C9425A", "#8B6FC9"]), left: `${(i * 5.6) % 100}%`, animationDelay: `${(i % 6) * 0.06}s` }}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, letterSpacing: 1.5, color: "#C9425A", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            <Flame size={11} /> {t("diamondShop.firstPurchaseOfferKicker")}
          </div>

          <div className="forge-glow" style={{ marginTop: 10, borderRadius: "50%", padding: 14, color: "var(--gold-text)" }}>
            <Gift size={48} strokeWidth={1.3} />
          </div>

          <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 19, textAlign: "center", lineHeight: 1.3 }}>
            {t("diamondShop.firstPurchaseOfferTitle")}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            {t("diamondShop.firstPurchaseOfferSubtitle")}
          </div>

          <div style={{ ...styles.itemDetailCard, width: "100%", marginTop: 16, display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-panel-alt)" }}>
            <FirstPurchaseBonusPreview player={player} />
            <div style={{ fontSize: 9, color: "var(--text-faint)" }}>
              {t("diamondShop.firstPurchaseGearNote")}
            </div>
          </div>

          <button
            style={{ ...styles.primaryBtn, marginTop: 20, width: "100%", background: "var(--gold-text)", color: "#15171E", fontSize: 15 }}
            onClick={onBuy}
          >
            {t("diamondShop.firstPurchaseOfferCta")} — {FIRST_PURCHASE_BONUS_PRICE_LABEL}
          </button>
          <button
            style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: 11, marginTop: 12, cursor: "pointer", padding: 4 }}
            onClick={onClose}
          >
            {t("diamondShop.firstPurchaseOfferDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
