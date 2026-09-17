import { useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// No password field on purpose — there's no backend to check one against,
// and storing something LABELED a password in localStorage (in plaintext,
// unauthenticated) would be worse than not having the concept at all. This
// is a local profile name only: it separates characters on this browser,
// nothing more. See utils/storage.js for the full caveat.
export default function LoginScreen({ initialUsername, onLogin }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(initialUsername || "");

  const submit = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  };

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>{t("login.welcome")}</div>
        <h1 style={styles.h1}>{t("login.title")}</h1>
        <p style={styles.subtext}>{t("login.subtitle")}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
          <User size={18} color="var(--text-muted)" strokeWidth={1.6} />
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder={t("login.placeholder")}
          maxLength={20}
          style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
          autoFocus
        />
      </div>

      <button
        style={{ ...styles.primaryBtn, background: "#D4AF6A", alignSelf: "center" }}
        disabled={!username.trim()}
        onClick={submit}
      >
        {t("login.submit")} <ChevronRight size={16} />
      </button>

      <p style={styles.loginCaveat}>
        {t("login.caveat")}
      </p>
    </div>
  );
}
