import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CLASSES } from "../data/classes";
import { styles } from "../styles";

function StatPill({ label, value }) {
  return (
    <div style={styles.statPill}>
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

export default function ClassSelect({ onChoose }) {
  const [hovered, setHovered] = useState("warrior");
  const [nickname, setNickname] = useState("");
  const active = CLASSES[hovered];
  const choose = (cls) => onChoose(cls, nickname.trim() || undefined);
  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>YENİ MACERA</div>
        <h1 style={styles.h1}>Bir sınıf seç.</h1>
        <p style={styles.subtext}>Zindanlara ineceksin, zırh toplayacaksın, pazarda satacaksın.</p>
      </div>

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Karakter adı (opsiyonel)"
        maxLength={20}
        style={{ ...styles.numInput, width: "100%", maxWidth: 320, alignSelf: "center", textAlign: "center", marginBottom: 20 }}
      />

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
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{c.desc}</div>
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
        {active.name} olarak başla <ChevronRight size={16} />
      </button>
    </div>
  );
}
