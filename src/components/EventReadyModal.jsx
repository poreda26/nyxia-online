import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Kullanıcı isteği: "Bir etkinlik açıldığı zaman oyuncu bu etkinliğe
// katılma şartlarını sağlıyorsa ekrana bir bildirim gibi widget açılıp
// katılmak isteyip istemediği sorulmalı" — Hub'daki mevcut tek-seferlik
// modal deseninin (TutorialModal/DailyLoginModal/FirstPurchaseOfferModal,
// hepsi Hub.jsx'te aynı sırayla, birbirini bastıran ayrı state bayraklarıyla
// tetikleniyor) GENEL, olaydan bağımsız bir versiyonu. İlk kullanım Harita
// Sonu Boss (bkz. Hub.jsx) — ama portrait/title/description/confirmLabel
// dışarıdan geldiği için World Boss açıldığında, Klan Dungeon boşaldığında
// vb. başka "hazır/açık, katılmak ister misin?" anları da aynı bileşeni
// çağırabilir, her biri kendi Hub.jsx state bayrağıyla.
export default function EventReadyModal({ portrait, title, description, confirmLabel, onConfirm, onDismiss }) {
  const { t } = useTranslation();
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={onDismiss}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {portrait}
        <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 16, textAlign: "center" }}>{title}</div>
        {description && (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)", textAlign: "center", maxWidth: 260, lineHeight: 1.5 }}>{description}</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
          <button style={{ ...styles.tinyBtn, flex: 1, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={onDismiss}>{t("common.notNow")}</button>
          <button style={{ ...styles.tinyBtn, flex: 1, background: "#D4AF6A", color: "#0B0C10" }} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
