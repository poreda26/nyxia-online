import { useEffect, useRef, useState } from "react";
import { Hammer, Sparkles, Skull, CheckCircle2, ChevronsRight } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { pick } from "../utils/random";
import { displayItemName } from "../utils/player";
import { itemStatLabel } from "../utils/itemDisplay";
import { styles } from "../styles";

const PRESS_DURATION = 2600; // ms — suspense window before the reveal

// Plays a 2.5s "forging" animation after Bas is pressed, then reveals
// success or failure. The actual player-state change already happened the
// moment press() was called (see UpgradeTab) — this modal is purely the
// presentational suspense/reveal layer sitting on top of it.
export default function ForgePressModal({ item, success, bumpedItem, onClose }) {
  const [phase, setPhase] = useState("pressing");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase(success ? "success" : "failed"), PRESS_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [success]);

  const skip = () => {
    clearTimeout(timerRef.current);
    setPhase(success ? "success" : "failed");
  };

  const color = itemTierColor(item.tier);

  return (
    <div style={styles.modalOverlay} onClick={phase !== "pressing" ? onClose : undefined}>
      <div
        className={phase === "pressing" ? "forge-glow" : phase === "failed" ? "forge-fail-shake" : ""}
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "pressing" && (
          <>
            <div className="forge-hit" style={{ color }}>
              <Hammer size={60} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>
              Basılıyor...
            </div>
            <button style={{ ...styles.ghostBtn, marginTop: 16 }} onClick={skip}>
              Geç <ChevronsRight size={13} />
            </button>
          </>
        )}

        {phase === "success" && bumpedItem && (
          <div className="chest-reveal">
            <div className="confetti-wrap">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="confetti-bit" style={{ background: pick([color, "#D4AF6A", "#EDE8DC"]), left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.06}s` }} />
              ))}
            </div>
            <div style={{ color, filter: `drop-shadow(0 0 18px ${color}aa)` }}>
              <Sparkles size={56} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>{displayItemName(bumpedItem)}</div>
            <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              +{bumpedItem.upgradeLevel} seviyesine yükseldi
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
              {itemStatLabel(bumpedItem)}
            </div>
            <button style={{ ...styles.primaryBtn, marginTop: 22, background: color }} onClick={onClose}>
              Harika! <CheckCircle2 size={15} />
            </button>
          </div>
        )}

        {phase === "failed" && (
          <div className="chest-reveal">
            <div style={{ color: "#C9425A", filter: "drop-shadow(0 0 18px #C9425A88)" }}>
              <Skull size={52} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18, color: "#E8A5AF" }}>Başarısız oldu</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, maxWidth: 220, textAlign: "center", lineHeight: 1.5 }}>
              {displayItemName(item)} ve parşömen kayboldu.
            </div>
            <button style={{ ...styles.primaryBtn, marginTop: 22, background: "#C9425A" }} onClick={onClose}>
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
