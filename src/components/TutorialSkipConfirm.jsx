import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Tutorial sağ üstteki çarpıya basılınca çıkan onay. Rehberin karartma katmanının
// (z-index 46) ve kartının (47) üstünde durur. onSkipSection verilmezse yalnızca
// "devam et / tümünü atla" sunulur.
export default function TutorialSkipConfirm({ onKeepGoing, onSkipSection, onSkipAll }) {
  const { t } = useTranslation();
  return (
    <div style={{ ...styles.modalOverlay, zIndex: 80 }}>
      <div role="alertdialog" aria-modal="true" aria-label={t("tutorialCoach.skipConfirm.title")} style={{ ...styles.modalCard, maxWidth: 300, padding: "26px 22px 20px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, textAlign: "center" }}>{t("tutorialCoach.skipConfirm.title")}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
          {t(onSkipSection ? "tutorialCoach.skipConfirm.textSection" : "tutorialCoach.skipConfirm.text")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18, width: "100%" }}>
          <button style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#0B0C10" }} onClick={onKeepGoing}>{t("tutorialCoach.skipConfirm.keepGoing")}</button>
          {onSkipSection && <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-primary)" }} onClick={onSkipSection}>{t("tutorialCoach.skipSection")}</button>}
          <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={onSkipAll}>{t("tutorialCoach.skipConfirm.skipAll")}</button>
        </div>
      </div>
    </div>
  );
}
