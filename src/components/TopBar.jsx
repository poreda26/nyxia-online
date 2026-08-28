import { Coins, Crown } from "lucide-react";
import { xpToNext, MAX_LEVEL, displayClassName } from "../utils/player";
import { activePremiumTier } from "../utils/premium";
import { styles } from "../styles";

export default function TopBar({ player, cls, gearHp, def, atk }) {
  const atCap = player.level >= MAX_LEVEL;
  const need = xpToNext(player.level);
  const pct = atCap ? 100 : Math.min(100, (player.xp / need) * 100);
  const Icon = cls.icon;
  const premiumTier = activePremiumTier(player);
  return (
    <div style={styles.topBar}>
      <div style={styles.topBarRow}>
        <div style={styles.classBadge}>
          <Icon size={16} color={cls.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 5 }}>
              {premiumTier && <Crown size={13} color={premiumTier.color} strokeWidth={2} fill={premiumTier.color} />}
              {player.nickname ? `${player.nickname} · ` : ""}{displayClassName(player)} · Lv.{player.level}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              {atCap ? "MAKS SEVİYE" : `${player.xp}/${need} XP`}
            </span>
          </div>
          <div style={styles.xpTrack}>
            <div style={{ ...styles.xpFill, width: `${pct}%`, background: atCap ? "#D4AF6A" : cls.color }} />
          </div>
        </div>
        <div style={styles.goldChip}>
          <Coins size={13} color="#D4AF6A" />
          <span style={{ fontFamily: "var(--font-mono)" }}>{player.gold}</span>
        </div>
      </div>
      <div style={styles.topBarSub}>
        <span>ATK {atk}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>DEF {def}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>HP {gearHp}</span>
      </div>
    </div>
  );
}
