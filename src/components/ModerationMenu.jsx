import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Flag } from "lucide-react";
import * as socialService from "../services/socialService";
import { useTranslation, formatServerError } from "../i18n/LanguageContext";

// Apple 1.2 / Google UGC: kullanıcı içeriğinde şikayet etme ve oyuncu engelleme.
// Küçük bir bayrak düğmesi; tıklanınca (kaydırılan listelerde kesilmesin diye
// body'ye portal edilen) bir kart açılır: Şikayet et / Engelle.
const REASONS = [
  ["abuse", "Hakaret veya taciz", "Harassment or abuse"],
  ["inappropriate", "Uygunsuz içerik", "Inappropriate content"],
  ["spam", "Spam veya reklam", "Spam or advertising"],
  ["cheating", "Hile", "Cheating"],
  ["other", "Diğer", "Other"],
];
const PANEL_WIDTH = 230;
const itemButton = { display: "block", width: "100%", textAlign: "left", padding: "10px 12px", minHeight: 40, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", borderRadius: 7 };

export default function ModerationMenu({ target, name, pushToast, onBlocked, size = 13 }) {
  const { t, lang } = useTranslation();
  const tr = lang !== "en";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("menu");
  const [busy, setBusy] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const trigger = useRef(null);
  const panel = useRef(null);

  const close = () => { setOpen(false); setStep("menu"); };
  const toggle = () => {
    if (open) { close(); return; }
    const rect = trigger.current.getBoundingClientRect();
    setPosition({
      top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 270)),
      left: Math.max(8, Math.min(rect.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 8)),
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => { if (!panel.current?.contains(e.target) && !trigger.current?.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const run = async (action, successText) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      pushToast?.(successText, "loot");
      close();
    } catch (error) {
      const known = formatServerError(t, error);
      pushToast?.(known && !known.startsWith("common.serverError.") ? known : (tr ? "İşlem yapılamadı. Tekrar dene." : "Action failed. Please try again."), "warn");
    } finally { setBusy(false); }
  };

  const label = tr ? "Şikayet et veya engelle" : "Report or block";
  return (
    <>
      <button ref={trigger} type="button" aria-label={`${name} — ${label}`} aria-expanded={open} title={label} onClick={toggle}
        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--text-faint)", display: "inline-flex", alignItems: "center", minWidth: 24, minHeight: 24, justifyContent: "center" }}>
        <Flag size={size} />
      </button>
      {open && createPortal(
        <div ref={panel} role="dialog" aria-label={label} style={{ position: "fixed", top: position.top, left: position.left, width: PANEL_WIDTH, zIndex: 3000, background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 8, boxShadow: "0 12px 40px rgba(0,0,0,0.45)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 12px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          {step === "menu" && (
            <>
              <button type="button" style={itemButton} onClick={() => setStep("report")}>{tr ? "Şikayet et" : "Report"}</button>
              <button type="button" style={{ ...itemButton, color: "#E8A5AF" }} onClick={() => setStep("block")}>{tr ? "Engelle" : "Block"}</button>
            </>
          )}
          {step === "report" && (
            <>
              <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 12px 4px" }}>{tr ? "Sebep seç:" : "Choose a reason:"}</div>
              {REASONS.map(([id, trLabel, enLabel]) => (
                <button key={id} type="button" disabled={busy} style={itemButton}
                  onClick={() => run(() => socialService.reportUser(target, id), tr ? "Şikayetin alındı. İnceleyeceğiz." : "Report received. We'll review it.")}>
                  {tr ? trLabel : enLabel}
                </button>
              ))}
              <button type="button" style={{ ...itemButton, color: "var(--text-faint)" }} onClick={() => setStep("menu")}>{tr ? "Geri" : "Back"}</button>
            </>
          )}
          {step === "block" && (
            <>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-muted)", margin: "0 12px 8px" }}>
                {tr ? "Bu oyuncunun mesajlarını görmeyeceksin ve arkadaşlığınız sona erecek. Engeli Arkadaşlar sekmesinden kaldırabilirsin." : "You won't see this player's messages and any friendship ends. You can unblock from the Friends tab."}
              </p>
              <div style={{ display: "flex", gap: 6, padding: "0 4px 4px" }}>
                <button type="button" disabled={busy} style={{ ...itemButton, textAlign: "center", background: "rgba(232,66,90,0.14)", color: "#E8A5AF", width: "auto", flex: 1 }}
                  onClick={() => run(async () => { await socialService.blockUser(target); onBlocked?.(); }, tr ? "Oyuncu engellendi." : "Player blocked.")}>
                  {tr ? "Engelle" : "Block"}
                </button>
                <button type="button" disabled={busy} style={{ ...itemButton, textAlign: "center", width: "auto", flex: 1 }} onClick={() => setStep("menu")}>{tr ? "Vazgeç" : "Cancel"}</button>
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
