import { Flame } from "lucide-react";
import RewardChest from './icons/RewardChest';
import './RewardPanels.css';
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
      <div className="reward-panel offer-panel" role="dialog" aria-modal="true" aria-label={t('diamondShop.firstPurchaseOfferTitle')} onClick={(e) => e.stopPropagation()}>
        <div className="chest-reveal">
          <div className="confetti-wrap">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="confetti-bit"
                style={{ background: ["#D4AF6A", "#EDE8DC", "#C9425A", "#8B6FC9"][i%4], left: `${(i * 5.6) % 100}%`, animationDelay: `${(i % 6) * 0.06}s` }}
              />
            ))}
          </div>

          <div className="offer-kicker">
            <Flame size={11} /> {t("diamondShop.firstPurchaseOfferKicker")}
          </div>

          <div className="reward-hero">
            <RewardChest size={100}/>
          </div>

          <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 19, textAlign: "center", lineHeight: 1.3 }}>
            {t("diamondShop.firstPurchaseOfferTitle")}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            {t("diamondShop.firstPurchaseOfferSubtitle")}
          </div>

          <div className="offer-loot">
            <FirstPurchaseBonusPreview player={player} />
            <div style={{ fontSize: 9, color: "var(--text-faint)" }}>
              {t("diamondShop.firstPurchaseGearNote")}
            </div>
          </div>

          <button
            className="reward-cta"
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
