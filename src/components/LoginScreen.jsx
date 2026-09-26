import { useState } from "react";
import { ChevronRight, User, Lock } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { isReservedUsername } from "../utils/storage";
import { registerAccount, loginAccount } from "../utils/api";

const NAME_PATTERN = /^[a-z0-9_]{3,24}$/;

function errorKey(code) {
  if (code === "ACCOUNT_UNAVAILABLE") return "login.accountTakenError";
  if (code === "INVALID_CREDENTIALS") return "login.wrongCredentialsError";
  if (code === "TOO_MANY_ATTEMPTS") return "login.rateLimitedError";
  if (code === "INVALID_CREDENTIAL_FORMAT") return "login.invalidFormatError";
  return "login.networkError";
}

// Artık gerçek backend'e (server/app.mjs) bağlı: kullanıcı adı + şifre
// sunucuda scrypt ile hash'lenip doğrulanıyor, oturum HttpOnly çerezle
// tutuluyor (bkz. utils/api.js). Kullanıcı adı sunucunun kabul ettiği
// kalıpla (küçük harf/rakam/alt çizgi, 3-24) birebir aynı olmalı çünkü
// App.jsx#handleLogin bu ismi doğrudan yerel karakter kaydını açmak için
// kullanıyor (bkz. utils/storage.js#loadAccount) — sunucu ve yerel kayıt
// aynı anahtar üzerinden eşleşiyor.
export default function LoginScreen({ initialUsername, onLogin }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(initialUsername || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password || busy) return;
    if (isReservedUsername(trimmed)) { setError(t("login.reservedNameError")); return; }
    if (!NAME_PATTERN.test(trimmed)) { setError(t("login.invalidFormatError")); return; }
    if (password.length < 12) { setError(t("login.passwordTooShortError")); return; }
    setError(""); setBusy(true);
    try {
      const call = mode === "register" ? registerAccount : loginAccount;
      const { name } = await call(trimmed, password);
      onLogin(name);
    } catch (err) {
      setError(t(errorKey(err.code)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
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

      {error && (
        <p style={{ ...styles.loginCaveat, color: "#E8425A", marginTop: -10 }}>
          {error}
        </p>
      )}

      <button
        style={{ ...styles.primaryBtn, background: "#D4AF6A", alignSelf: "center", opacity: busy ? 0.6 : 1 }}
        disabled={!username.trim() || !password || busy}
        onClick={submit}
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
    </div>
  );
}
