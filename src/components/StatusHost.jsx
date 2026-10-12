import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import { fetchStatus } from "../services/mailService";
import { startPolling } from "../utils/polling";

// Sunucudan gelen duyuru çubuğu ve bakım ekranı. Giriş ekranında da çalışır (oturum gerekmez).
export default function StatusHost() {
  const { lang } = useTranslation();
  const [status, setStatus] = useState(null);
  const [hidden, setHidden] = useState("");

  useEffect(() => {
    const refresh = () => fetchStatus().then((s) => { setStatus(s); return true; }).catch(() => false);
    const stop = startPolling(refresh, 90 * 1000);
    window.addEventListener("nyxia:maintenance", refresh);
    return () => { stop(); window.removeEventListener("nyxia:maintenance", refresh); };
  }, []);

  const text = (entry) => (lang === "en" ? entry.en || entry.tr : entry.tr || entry.en);
  const announcement = status?.announcement;
  const maintenance = status?.maintenance;
  return (
    <>
      {announcement && hidden !== text(announcement) && (
        <div role="status" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", fontSize: 12, lineHeight: 1.4, background: announcement.level === "warn" ? "#7a3b1f" : "#2b2a45", color: "#fff", borderBottom: "1px solid rgba(255,255,255,.2)" }}>
          <span style={{ flex: 1 }}>{text(announcement)}</span>
          <button aria-label="Close" onClick={() => setHidden(text(announcement))} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
      )}
      {maintenance && (
        <div role="alertdialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 100001, background: "var(--bg-base, #0B0C10)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center", gap: 14 }}>
          <div style={{ fontSize: 40 }} aria-hidden="true">🛠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{lang === "en" ? "Under maintenance" : "Bakımdayız"}</div>
          <p style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>{text(maintenance)}</p>
        </div>
      )}
    </>
  );
}
