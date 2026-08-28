import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { RACES } from "../data/races";
import { styles } from "../styles";

export default function RaceSelect({ onChoose }) {
  const [hovered, setHovered] = useState("karus");
  const active = RACES[hovered];

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>YENİ KARAKTER</div>
        <h1 style={styles.h1}>Bir ırk seç.</h1>
        <p style={styles.subtext}>Karus mu, ElMorad mı — hangi milletin bayrağı altında savaşacaksın?</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(RACES).map(([key, r]) => {
          const Icon = r.icon;
          const isActive = hovered === key;
          return (
            <button
              key={key}
              onMouseEnter={() => setHovered(key)}
              onClick={() => onChoose(key)}
              style={{
                ...styles.classCard,
                flexDirection: "row", alignItems: "center", gap: 14,
                borderColor: isActive ? r.color : "var(--border)",
                boxShadow: isActive ? `0 0 0 1px ${r.color}, 0 12px 32px -12px ${r.color}66` : "none",
                transform: isActive ? "translateY(-2px)" : "none",
              }}
            >
              <Icon size={28} color={r.color} strokeWidth={1.6} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 0.3 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        style={{ ...styles.primaryBtn, marginTop: 28, alignSelf: "center", background: active.color }}
        onClick={() => onChoose(hovered)}
      >
        {active.name} olarak devam et <ChevronRight size={16} />
      </button>
    </div>
  );
}
