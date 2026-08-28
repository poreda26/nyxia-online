import { useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { styles } from "../styles";

// No password field on purpose — there's no backend to check one against,
// and storing something LABELED a password in localStorage (in plaintext,
// unauthenticated) would be worse than not having the concept at all. This
// is a local profile name only: it separates characters on this browser,
// nothing more. See utils/storage.js for the full caveat.
export default function LoginScreen({ initialUsername, onLogin }) {
  const [username, setUsername] = useState(initialUsername || "");

  const submit = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  };

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>HOŞ GELDİN</div>
        <h1 style={styles.h1}>Kullanıcı adını gir.</h1>
        <p style={styles.subtext}>Bu isim karakterlerini bu tarayıcıda ayırt eder.</p>
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
          placeholder="kullanıcı adı"
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
        Giriş Yap <ChevronRight size={16} />
      </button>

      <p style={styles.loginCaveat}>
        Bu yerel bir profildir — şifre yok, sunucu yok. Sadece bu tarayıcıda
        karakterlerini saklamak için kullanılır.
      </p>
    </div>
  );
}
