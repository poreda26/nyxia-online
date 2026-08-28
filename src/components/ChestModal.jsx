import { Gift, Sparkles, CheckCircle2 } from "lucide-react";
import { CLASSES } from "../data/classes";
import { itemTierColor, ITEM_TIER_LABEL } from "../data/itemRarity";
import { pick } from "../utils/random";
import { itemStatLabel } from "../utils/itemDisplay";
import { styles } from "../styles";

export default function ChestModal({ state, onClose, playerClass }) {
  const { chest, phase, result } = state;
  const color = itemTierColor(chest.tier);
  const isLocked = result && result.kind === "armor" && result.class !== playerClass;
  return (
    <div style={styles.modalOverlay} onClick={phase === "reveal" ? onClose : undefined}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {phase === "shaking" && (
          <>
            <div className="chest-shake" style={{ color }}>
              <Gift size={64} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)" }}>
              Sandık açılıyor...
            </div>
          </>
        )}
        {phase === "reveal" && result && (
          <div className="chest-reveal">
            <div className="confetti-wrap">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="confetti-bit" style={{ background: pick([color, "#D4AF6A", "#EDE8DC"]), left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.06}s` }} />
              ))}
            </div>
            <div style={{ color, filter: `drop-shadow(0 0 18px ${color}aa)` }}>
              <Sparkles size={56} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>{result.name}</div>
            {result.kind === "armor" && (
              <span style={{ ...styles.classTag, color: CLASSES[result.class].color, borderColor: `${CLASSES[result.class].color}55`, marginTop: 6 }}>
                {CLASSES[result.class].name} eşyası
              </span>
            )}
            <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              {ITEM_TIER_LABEL[result.tier]}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
              T{result.tier} · {itemStatLabel(result)}
            </div>
            {isLocked && (
              <div style={{ fontSize: 10, color: "#E8A5AF", marginTop: 8, maxWidth: 200, textAlign: "center" }}>
                Bu sende kullanılamaz — Pazar &gt; Takas'tan değerlendirebilirsin.
              </div>
            )}
            <button style={{ ...styles.primaryBtn, marginTop: 22, background: color }} onClick={onClose}>
              Çantaya Ekle <CheckCircle2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
