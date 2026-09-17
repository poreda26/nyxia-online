import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CLASSES } from "../data/classes";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

function StatPill({ label, value }) {
  return (
    <div style={styles.statPill}>
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

export default function ClassSelect({ onChoose }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState("warrior");
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState(false);
  // Kullanıcı isteği: "Sınıf seçiyorken doğrulama yap. Emin misin diye sor."
  // Seçim kalıcı (sonradan değişmek için ayrı bir Job Değiştirme Kağıdı
  // gerekiyor, bkz. MarketTab), o yüzden gerçek onChoose'a geçmeden önce
  // hangi sınıfın onaylanmak üzere olduğunu tutan bu ekstra adım var.
  const [confirming, setConfirming] = useState(null);
  const active = CLASSES[hovered];
  // Her yeni karakter için bir nickname artık zorunlu (kullanıcı isteği) —
  // eskiden "(opsiyonel)" olup boş bırakılabiliyordu, sınıf adına düşüyordu.
  const choose = (cls) => {
    const trimmed = nickname.trim();
    if (!trimmed) { setNicknameError(true); return; }
    setConfirming(cls);
  };
  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>{t("classSelect.eyebrow")}</div>
        <h1 style={styles.h1}>{t("classSelect.title")}</h1>
        <p style={styles.subtext}>{t("classSelect.subtitle")}</p>
      </div>

      <input
        type="text"
        value={nickname}
        onChange={(e) => { setNickname(e.target.value); if (nicknameError) setNicknameError(false); }}
        placeholder={t("classSelect.namePlaceholder")}
        maxLength={20}
        style={{ ...styles.numInput, width: "100%", maxWidth: 320, alignSelf: "center", textAlign: "center", marginBottom: nicknameError ? 6 : 20, ...(nicknameError ? { borderColor: "#C9425A" } : {}) }}
      />
      {nicknameError && (
        <div style={{ fontSize: 11, color: "#E8A5AF", textAlign: "center", marginBottom: 14 }}>{t("classSelect.nameRequired")}</div>
      )}

      <div style={styles.classGrid}>
        {Object.entries(CLASSES).map(([key, c]) => {
          const Icon = c.icon;
          const isActive = hovered === key;
          return (
            <button
              key={key}
              onMouseEnter={() => setHovered(key)}
              onClick={() => choose(key)}
              style={{
                ...styles.classCard,
                borderColor: isActive ? c.color : "var(--border)",
                boxShadow: isActive ? `0 0 0 1px ${c.color}, 0 12px 32px -12px ${c.color}66` : "none",
                transform: isActive ? "translateY(-3px)" : "none",
              }}
            >
              <Icon size={26} color={c.color} strokeWidth={1.75} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 0.3, marginTop: 10 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{t(`classes.${key}`)}</div>
              <div style={styles.classStatRow}>
                <StatPill label="ATK" value={c.atk} />
                <StatPill label="DEF" value={c.def} />
                <StatPill label="HP" value={c.maxHp} />
                <StatPill label="MP" value={c.maxMp} />
              </div>
            </button>
          );
        })}
      </div>

      <button
        style={{ ...styles.primaryBtn, marginTop: 28, alignSelf: "center", background: active.color }}
        onClick={() => choose(hovered)}
      >
        {t("classSelect.startAs", { cls: active.name })} <ChevronRight size={16} />
      </button>

      {confirming && (() => {
        const c = CLASSES[confirming];
        const Icon = c.icon;
        return (
          <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setConfirming(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <Icon size={32} color={c.color} strokeWidth={1.4} />
              <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
                {t("classSelect.confirmTitle", { cls: c.name })}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", textAlign: "center", maxWidth: 240 }}>
                {t("classSelect.confirmSubtitle", { nick: nickname.trim() })}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirming(null)}>
                  {t("classSelect.cancel")}
                </button>
                <button style={{ ...styles.tinyBtn, background: c.color, color: "#0B0C10" }} onClick={() => onChoose(confirming, nickname.trim())}>
                  {t("classSelect.confirmYes")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
