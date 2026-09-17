import { useEffect, useRef, useState } from "react";
import { Hammer, Skull, CheckCircle2, ChevronsRight } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { pick } from "../utils/random";
import { displayItemName } from "../utils/player";
import { playUpgradeSuccess, playUpgradeFail } from "../audio/sfx";
import { styles } from "../styles";
import ItemIcon from './ItemIcon';
import RewardReveal from './RewardReveal';

const PRESS_DURATION = 2600; // ms — suspense window before the reveal

// Plays a 2.5s "forging" animation after Bas is pressed, then reveals
// success or failure. The actual player-state change already happened the
// moment press() was called (see UpgradeTab) — this modal is purely the
// presentational suspense/reveal layer sitting on top of it. Bildirim sesi
// (kullanıcı isteği) tam bu reveal anında çalıyor, "Bas"a basıldığı anda
// değil — görselle senkron olsun diye.
export default function ForgePressModal({ item, success, bumpedItem, onClose }) {
  const [phase, setPhase] = useState("pressing");
  const timerRef = useRef(null);

  const reveal = () => {
    setPhase(success ? "success" : "failed");
    if (success) playUpgradeSuccess(); else playUpgradeFail();
  };

  useEffect(() => {
    timerRef.current = setTimeout(reveal, PRESS_DURATION);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const skip = () => {
    clearTimeout(timerRef.current);
    reveal();
  };

  const color = itemTierColor(item.tier);

  return (
    <div style={styles.modalOverlay} onClick={phase !== "pressing" ? onClose : undefined}>
      <div
        className={`reward-modal ${phase === "pressing" ? "forge-glow" : phase === "failed" ? "forge-fail-shake" : ""}`}
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "pressing" && (
          <>
            <div className="forge-item-stage" style={{ color }}>
              <ItemIcon item={item} size={104} color={color}/>
              <div className="forge-hit"><Hammer size={42} strokeWidth={1.3} /></div>
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
            <RewardReveal item={bumpedItem}/>
            <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              +{bumpedItem.upgradeLevel} seviyesine yükseldi
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
