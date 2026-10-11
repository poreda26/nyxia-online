import { Skull } from "lucide-react";
import { styles } from "../styles";

// Ölünce (canavar ya da Dünya Canavarı tarafından) çıkan uyarı — kullanıcı
// isteği: "Öldün!" başlığı + "bir miktar tecrübe kaybedildi" satırı, eskisi
// gibi belli belirsiz bir toast değil, önümüze çıkan net bir pencere.
export default function DeathModal({ xpLost, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ color: "#C9425A", filter: "drop-shadow(0 0 18px #C9425A88)" }}>
          <Skull size={52} strokeWidth={1.3} />
        </div>
        <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 20, color: "#E8A5AF" }}>Öldün!</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
          {xpLost > 0 ? `Bir miktar tecrübe kaybedildi... (-${xpLost} XP)` : "Bir miktar tecrübe kaybedildi..."}
        </div>
        <button style={{ ...styles.primaryBtn, marginTop: 22, background: "#C9425A" }} onClick={onClose}>
          Tamam
        </button>
      </div>
    </div>
  );
}
