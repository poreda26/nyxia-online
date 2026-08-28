import { useState } from "react";
import { Sword, Package, Store, ArrowUpCircle, MessageCircle, User, ShieldCheck, Flag, Shield, MoreHorizontal, X } from "lucide-react";
import { styles } from "../styles";

// En sık kullanılan 4 sekme doğrudan çubukta, geri kalanı (Yükselt/Kaptan/
// Klan/Savaş Alanı/Sohbet) "Daha Fazla" sayfasında — 9 sekme tek çubukta
// çok kalabalıklaşmıştı (kullanıcı isteği). Aktif sekme her zaman
// vurgulanıyor, overflow'daki bir sekme aktifse "Daha Fazla" da noktayla
// işaretlenir ki nerede olduğun kaybolmasın.
const PRIMARY = [
  { key: "battle", label: "Savaş", icon: Sword },
  { key: "inventory", label: "Envanter", icon: Package },
  { key: "market", label: "Pazar", icon: Store },
  { key: "character", label: "Karakter", icon: User },
];

const OVERFLOW = [
  { key: "upgrade", label: "Yükselt", icon: ArrowUpCircle },
  { key: "captain", label: "Kaptan", icon: ShieldCheck },
  { key: "clan", label: "Klan", icon: Shield },
  { key: "warzone", label: "Savaş Alanı", icon: Flag },
  { key: "chat", label: "Sohbet", icon: MessageCircle },
];

export default function BottomNav({ tab, setTab }) {
  const [showMore, setShowMore] = useState(false);
  const overflowActive = OVERFLOW.some((it) => it.key === tab);

  const pick = (key) => {
    setTab(key);
    setShowMore(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {showMore && (
        <div style={styles.moreSheetOverlay} onClick={() => setShowMore(false)}>
          <div style={styles.moreSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.moreSheetHeader}>
              <span style={{ fontSize: 12, color: "var(--text-faint)", letterSpacing: 1, textTransform: "uppercase" }}>Daha Fazla</span>
              <button style={styles.moreSheetClose} onClick={() => setShowMore(false)}><X size={16} /></button>
            </div>
            <div style={styles.moreSheetGrid}>
              {OVERFLOW.map((it) => {
                const Icon = it.icon;
                const active = tab === it.key;
                return (
                  <button key={it.key} onClick={() => pick(it.key)} style={{ ...styles.moreSheetItem, ...(active ? styles.moreSheetItemActive : {}) }}>
                    <Icon size={20} strokeWidth={active ? 2.25 : 1.6} color={active ? "var(--text-primary)" : "var(--text-muted)"} />
                    <span style={{ fontSize: 10, marginTop: 6, color: active ? "var(--text-primary)" : "var(--text-muted)" }}>{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={styles.bottomNav}>
        {PRIMARY.map((it) => {
          const Icon = it.icon;
          const active = tab === it.key;
          return (
            <button key={it.key} onClick={() => pick(it.key)} style={styles.navBtn}>
              <Icon size={17} strokeWidth={active ? 2.25 : 1.6} color={active ? "var(--text-primary)" : "var(--text-faint)"} />
              <span style={{ fontSize: 9, marginTop: 3, color: active ? "var(--text-primary)" : "var(--text-faint)", letterSpacing: 0 }}>
                {it.label}
              </span>
              {active && <div style={styles.navActiveDot} />}
            </button>
          );
        })}
        <button onClick={() => setShowMore(true)} style={styles.navBtn}>
          <MoreHorizontal size={17} strokeWidth={overflowActive ? 2.25 : 1.6} color={overflowActive ? "var(--text-primary)" : "var(--text-faint)"} />
          <span style={{ fontSize: 9, marginTop: 3, color: overflowActive ? "var(--text-primary)" : "var(--text-faint)", letterSpacing: 0 }}>
            Daha Fazla
          </span>
          {overflowActive && <div style={styles.navActiveDot} />}
        </button>
      </div>
    </div>
  );
}
