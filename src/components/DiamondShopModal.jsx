import { Gem, X, Star, Sparkles } from "lucide-react";
import { DIAMOND_PACKS } from "../data/diamondPacks";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Kullanıcı isteği: Apple/Google IAP entegrasyonundan önce satın alma
// menüsünü hazırlayalım. Paketler data/diamondPacks.js'te — buradaki "Satın
// Al" butonu şimdilik gerçek ödeme almıyor (RevenueCat bağlanana kadar), her
// tıklama sadece bilgilendirici bir toast gösteriyor. Bkz. memory:
// project_diamond_iap_plan — gerçek satın alma akışı buraya geldiğinde bu
// buton store'dan dönen paket + purchase() çağrısına bağlanacak.
export default function DiamondShopModal({ onClose, pushToast }) {
  const { t } = useTranslation();

  const handleBuy = () => {
    pushToast(t("diamondShop.comingSoonToast"), "default");
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Gem size={32} color="#8B6FC9" strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("diamondShop.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>
          {t("diamondShop.subtitle")}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, width: "100%" }}>
          {DIAMOND_PACKS.map((pack) => (
            <div
              key={pack.id}
              style={{
                ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10,
                borderColor: pack.bestValue ? "#D4AF6A" : pack.popular ? "#8B6FC9" : "var(--border)",
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Gem size={18} color="#8B6FC9" strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  {pack.diamonds.toLocaleString()}
                  {pack.bonusPct > 0 && (
                    <span style={{ fontSize: 9, color: "#8B6FC9", border: "1px solid #8B6FC966", borderRadius: 4, padding: "1px 4px" }}>
                      {t("diamondShop.bonusBadge", { pct: pack.bonusPct })}
                    </span>
                  )}
                </div>
                {(pack.popular || pack.bestValue) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: pack.bestValue ? "#D4AF6A" : "#8B6FC9", marginTop: 2 }}>
                    {pack.bestValue ? <Star size={10} /> : <Sparkles size={10} />}
                    {pack.bestValue ? t("diamondShop.bestValueBadge") : t("diamondShop.popularBadge")}
                  </div>
                )}
              </div>
              <button
                style={{ ...styles.tinyBtn, flexShrink: 0, background: "#8B6FC9", color: "#fff" }}
                onClick={handleBuy}
              >
                {pack.priceLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
