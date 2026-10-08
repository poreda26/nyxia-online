import { useEffect, useState } from "react";
import { AlertTriangle } from "./icons/GameIcons";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Oyun içi onay penceresi: askConfirm() (utils/gameConfirm.js) çağrılarını sırayla gösterir.
export default function ConfirmHost() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    const onAsk = (event) => setQueue((q) => [...q, event.detail]);
    window.addEventListener("nyxia:confirm", onAsk);
    return () => window.removeEventListener("nyxia:confirm", onAsk);
  }, []);
  const current = queue[0];
  if (!current) return null;
  const answer = (value) => { current.resolve(value); setQueue((q) => q.slice(1)); };
  const danger = current.tone === "danger";
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed", zIndex: 95 }} onClick={() => answer(false)}>
      <div role="alertdialog" aria-modal="true" aria-label={current.title} style={{ ...styles.modalCard, maxWidth: 320, padding: "26px 22px 20px" }} onClick={(e) => e.stopPropagation()}>
        <AlertTriangle size={30} color={danger ? "#E8425A" : "var(--gold-text)"} strokeWidth={1.5} />
        <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 16, textAlign: "center" }}>{current.title}</div>
        {current.text && <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>{current.text}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
          <button style={{ ...styles.tinyBtn, flex: 1, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => answer(false)}>{current.cancelLabel || t("confirm.cancel")}</button>
          <button style={{ ...styles.tinyBtn, flex: 1, background: danger ? "#E8425A" : "#D4AF6A", color: danger ? "#fff" : "#0B0C10" }} onClick={() => answer(true)}>{current.confirmLabel || t("confirm.yes")}</button>
        </div>
      </div>
    </div>
  );
}
