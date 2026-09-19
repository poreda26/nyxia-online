import { useState } from "react";
import { Gift, X, CheckCircle2 } from "lucide-react";
import { DAILY_LOGIN_REWARDS } from "../data/dailySystems";
import { previewDailyLoginReward, claimDailyLogin } from "../utils/dailyLogin";
import { formatGold } from "../utils/player";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

function RewardLine({ reward, t }) {
  const parts = [];
  if (reward.gold) parts.push(t("dailyLogin.gold", { n: formatGold(reward.gold) }));
  if (reward.diamonds) parts.push(t("dailyLogin.diamonds", { n: reward.diamonds }));
  if (reward.scrollCount) parts.push(t("dailyLogin.scrolls", { n: reward.scrollCount }));
  if (reward.chestTier) parts.push(t("dailyLogin.chest"));
  if (reward.bonusScroll) parts.push(t("dailyLogin.bonusScroll"));
  return <span>{parts.join(" · ")}</span>;
}

// Kullanıcı isteği: her gün geri gelmek için somut bir sebep. Hub açılınca
// (ya da TopBar'daki hediye ikonundan istenildiğinde) açılır — bkz.
// utils/dailyLogin.js. 7 günlük döngü, gün atlanırsa streak 1'e döner.
export default function DailyLoginModal({ player, setPlayer, onClose, pushToast }) {
  const { t } = useTranslation();
  const [claimedReward, setClaimedReward] = useState(null);
  const { streak, reward } = previewDailyLoginReward(player);
  const cyclePos = ((streak - 1) % DAILY_LOGIN_REWARDS.length) + 1;

  const handleClaim = () => {
    const result = claimDailyLogin(player);
    if (!result.claimed) { pushToast(t("dailyLogin.alreadyClaimed"), "warn"); onClose(); return; }
    setPlayer(result.player);
    setClaimedReward(result.reward);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Gift size={32} color="var(--gold-text)" strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("dailyLogin.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{t("dailyLogin.streakDay", { n: streak })}</div>

        <div style={{ display: "flex", gap: 5, marginTop: 16 }}>
          {DAILY_LOGIN_REWARDS.map((r) => {
            const isToday = r.day === cyclePos;
            const isPast = r.day < cyclePos || (!!claimedReward && isToday);
            return (
              <div
                key={r.day}
                style={{
                  width: 34, height: 40, borderRadius: 8, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", fontSize: 8, fontFamily: "var(--font-mono)",
                  border: "1px solid", borderColor: isToday ? "#D4AF6A" : "var(--border)",
                  background: isPast ? "#D4AF6A22" : isToday ? "#D4AF6A11" : "var(--bg-panel-alt)",
                  color: isPast || isToday ? "var(--gold-text)" : "var(--text-faint)",
                }}
              >
                <span>{t("dailyLogin.day", { n: r.day })}</span>
                {isPast && <CheckCircle2 size={11} style={{ marginTop: 2 }} />}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          {claimedReward ? t("dailyLogin.won") : t("dailyLogin.todayReward")}
          <RewardLine reward={claimedReward || reward} t={t} />
        </div>

        <button
          style={{
            ...styles.primaryBtn, marginTop: 18, width: "100%",
            background: claimedReward ? "var(--bg-panel-alt)" : "#D4AF6A",
            color: claimedReward ? "var(--text-primary)" : "#0B0C10",
          }}
          onClick={claimedReward ? onClose : handleClaim}
        >
          {claimedReward ? t("dailyLogin.ok") : t("dailyLogin.claim")}
        </button>
      </div>
    </div>
  );
}
