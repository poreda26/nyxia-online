import { Sparkles, Zap, MapPinned, CheckCircle2 } from "lucide-react";
import { pick } from "../utils/random";
import { styles } from "../styles";

// Kullanıcı isteği: "Seviye atladığımız zaman 5 Lvl oldun ! tarzında bir
// widget açılsın... kazandığı 3 statü'yü de hatırlatmayı unutma. Yeni
// haritaya geçebiliyorsa o haritayı da yazsın." — bkz. utils/monsterRewards.js
// #grantMonsterReward'ın döndürdüğü `levelUp` nesnesi, BattleTab.jsx'te
// tetikleniyor. ForgePressModal'ın başarı ekranıyla aynı konfeti deseni
// kullanılıyor ki oyunun geri kalanıyla görsel dili tutarlı olsun.
export default function LevelUpModal({ levelUp, onClose }) {
  const { toLevel, statPointsGained, unlockedMap } = levelUp;
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className="chest-reveal">
          <div className="confetti-wrap">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="confetti-bit"
                style={{ background: pick(["#D4AF6A", "#EDE8DC", "#8B6FC9"]), left: `${(i * 6.25) % 100}%`, animationDelay: `${(i % 5) * 0.06}s` }}
              />
            ))}
          </div>
          <div style={{ color: "#D4AF6A", filter: "drop-shadow(0 0 18px #D4AF6Aaa)" }}>
            <Sparkles size={56} strokeWidth={1.3} />
          </div>
          <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 22 }}>
            Seviye {toLevel} oldun!
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "#8B6FC9", fontFamily: "var(--font-mono)" }}>
            <Zap size={13} /> +{statPointsGained} statü puanı kazandın
          </div>
          {unlockedMap && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: unlockedMap.color, fontFamily: "var(--font-mono)" }}>
              <MapPinned size={13} /> Yeni bölge açıldı: {unlockedMap.name}
            </div>
          )}
          <button style={{ ...styles.primaryBtn, marginTop: 22, background: "#D4AF6A", color: "#0B0C10" }} onClick={onClose}>
            Harika! <CheckCircle2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
