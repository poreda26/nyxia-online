import { useState } from "react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { call } from "../utils/api";
import { birthProblem } from "../utils/birth";
import BirthDateInput from "./BirthDateInput";

// Doğum tarihi kaydı olmayan eski hesaplar oyuna girmeden önce bir kez doğum tarihini girer. Sonradan değiştirilemez.
export default function BirthDateGate({ onDone, onLocked }) {
  const { t } = useTranslation();
  const [birth, setBirth] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    const problem = birthProblem(birth);
    if (problem === "login.birthRequiredError") { setError(t(problem)); return; }
    setBusy(true); setError("");
    try { await call("account/birthdate", "POST", { birthDate: birth }); onDone(); }
    catch (err) {
      if (err.code === "UNDER_AGE" || problem) onLocked();
      else setError(t(err.code === "INVALID_BIRTHDATE" ? "login.birthRequiredError" : "login.networkError"));
    } finally { setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 100000, background: "var(--bg-base, #0B0C10)", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ maxWidth: 360, width: "100%", margin: "0 auto" }}>
        <h1 style={styles.h1}>{t("login.gateTitle")}</h1>
        <p style={{ ...styles.subtext, marginBottom: 18 }}>{t("login.gateText")}</p>
        <BirthDateInput value={birth} onChange={(v) => { setBirth(v); setError(""); }} onEnter={submit} />
        {error && <p style={{ ...styles.loginCaveat, color: "#E8425A" }}>{error}</p>}
        <button style={{ ...styles.primaryBtn, background: "#D4AF6A", opacity: busy ? 0.6 : 1 }} disabled={!birth || busy} onClick={submit}>{t("login.gateSubmit")}</button>
      </div>
    </div>
  );
}
