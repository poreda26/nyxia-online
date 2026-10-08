import { useState } from "react";
import { ChevronRight, User, Lock } from "./icons/GameIcons";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { isReservedUsername } from "../utils/storage";
import { registerAccount, loginAccount } from "../utils/api";
import nyxiaLogo from "../assets/brand/nyxia-logo.png";
import { LEGAL_LINKS } from "../data/legalLinks";

const NAME_PATTERN = /^[a-z0-9_]{3,24}$/;

function errorKey(code) {
  if (code === "ACCOUNT_UNAVAILABLE") return "login.accountTakenError";
  if (code === "INVALID_CREDENTIALS") return "login.wrongCredentialsError";
  if (code === "TOO_MANY_ATTEMPTS") return "login.rateLimitedError";
  if (code === "INVALID_CREDENTIAL_FORMAT") return "login.invalidFormatError";
  if (code === "NAME_NOT_ALLOWED") return "login.nameNotAllowedError";
  return "login.networkError";
}

// Artık gerçek backend'e (server/app.mjs) bağlı: kullanıcı adı + şifre
// sunucuda scrypt ile hash'lenip doğrulanıyor, oturum HttpOnly çerezle
// tutuluyor (bkz. utils/api.js). Kullanıcı adı sunucunun kabul ettiği
// kalıpla (küçük harf/rakam/alt çizgi, 3-24) birebir aynı olmalı çünkü
// App.jsx#handleLogin bu ismi doğrudan yerel karakter kaydını açmak için
// kullanıyor (bkz. utils/storage.js#loadAccount) — sunucu ve yerel kayıt
// aynı anahtar üzerinden eşleşiyor.
export default function LoginScreen({ initialUsername, onLogin, notice }) {
  const { t, lang } = useTranslation();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(initialUsername || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inUse, setInUse] = useState(false);

  const submit = async (force = false) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password || busy) return;
    if (isReservedUsername(trimmed)) { setError(t("login.reservedNameError")); return; }
    if (!NAME_PATTERN.test(trimmed)) { setError(t("login.invalidFormatError")); return; }
    if (password.length < 12) { setError(t("login.passwordTooShortError")); return; }
    setError(""); setBusy(true); setInUse(false);
    try {
      const { name } = mode === "register" ? await registerAccount(trimmed, password) : await loginAccount(trimmed, password, force === true);
      onLogin(name);
    } catch (err) {
      if (err.code === "ACCOUNT_IN_USE") setInUse(true);
      else setError(t(errorKey(err.code)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <img src={nyxiaLogo} alt="Nyxia" style={{ width: "100%", maxWidth: 240, margin: "0 auto 10px", display: "block" }} />
        <div style={styles.eyebrow}>{t("login.welcome")}</div>
        <h1 style={styles.h1}>{t(mode === "register" ? "login.registerTitle" : "login.title")}</h1>
        <p style={styles.subtext}>{t("login.subtitle")}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
          <User size={18} color="var(--text-muted)" strokeWidth={1.6} />
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder={t("login.placeholder")}
          maxLength={24}
          style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
          <Lock size={18} color="var(--text-muted)" strokeWidth={1.6} />
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder={t("login.passwordPlaceholder")}
          maxLength={128}
          style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
        />
      </div>

      {notice && !error && !inUse && (
        <p style={{ ...styles.loginCaveat, color: "var(--gold-text)", marginTop: -10 }}>{t("login.signedOutElsewhere")}</p>
      )}
      {inUse && (
        <div style={{ ...styles.itemDetailCard, borderColor: "var(--gold-text)", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>{t("login.inUsePrompt")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.tinyBtn, flex: 1, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setInUse(false)}>{t("login.inUseCancel")}</button>
            <button style={{ ...styles.tinyBtn, flex: 1, background: "#D4AF6A", color: "#15171E" }} disabled={busy} onClick={() => submit(true)}>{t("login.inUseConfirm")}</button>
          </div>
        </div>
      )}
      {error && (
        <p style={{ ...styles.loginCaveat, color: "#E8425A", marginTop: -10 }}>
          {error}
        </p>
      )}

      <button
        style={{ ...styles.primaryBtn, background: "#D4AF6A", alignSelf: "center", opacity: busy ? 0.6 : 1 }}
        disabled={!username.trim() || !password || busy}
        onClick={() => submit()}
      >
        {t(busy ? "login.submitting" : mode === "register" ? "login.registerSubmit" : "login.submit")} <ChevronRight size={16} />
      </button>

      <button
        onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}
      >
        {t(mode === "register" ? "login.switchToLogin" : "login.switchToRegister")}
      </button>

      <p style={styles.loginCaveat}>
        {t("login.caveat")}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 14px", marginTop: 14 }}>
        {LEGAL_LINKS.map((link) => (
          <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-muted)" }}>{lang === "en" ? link.en : link.tr}</a>
        ))}
      </div>
    </div>
  );
}
