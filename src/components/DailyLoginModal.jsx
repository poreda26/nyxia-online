import { useState } from "react";
import { Coins, Gem, ScrollText, Gift, X, CheckCircle2 } from "lucide-react";
import RewardChest from './icons/RewardChest';
import './RewardPanels.css';
import { DAILY_LOGIN_REWARDS } from "../data/dailySystems";
import { previewDailyLoginReward, claimDailyLogin, canClaimDailyLogin } from "../utils/dailyLogin";
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
  const [claimedReward, setClaimedReward] = useState(() => canClaimDailyLogin(player) ? null : previewDailyLoginReward(player).reward);
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
      <div className="reward-panel daily-panel" role="dialog" aria-modal="true" aria-label={t('dailyLogin.title')} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose} aria-label={t('dailyLogin.ok')}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <div className="reward-hero"><RewardChest size={88}/></div>
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("dailyLogin.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{t("dailyLogin.streakDay", { n: streak })}</div>

        <div className="daily-track">
          {DAILY_LOGIN_REWARDS.map((r) => {
            const isToday = r.day === cyclePos;
            const isPast = r.day < cyclePos || (!!claimedReward && isToday);
            return (
              <div
                key={r.day}
                className={`daily-day ${isToday?'is-today':''} ${isPast?'is-claimed':''} ${r.day===7?'is-final':''}`}
              >
                <span>{t("dailyLogin.day", { n: r.day })}</span>
                {isPast ? <CheckCircle2 size={22}/> : r.chestTier ? <Gift size={22}/> : r.diamonds ? <Gem size={22}/> : r.scrollCount ? <ScrollText size={22}/> : <Coins size={22}/>}
                <small>{r.diamonds?`${r.diamonds} ♦`:r.scrollCount?`×${r.scrollCount}`:r.chestTier?'★':r.gold}</small>
              </div>
            );
          })}
        </div>

        <div className="daily-prize" aria-live="polite">
          {claimedReward ? t("dailyLogin.won") : t("dailyLogin.todayReward")}
          <RewardLine reward={claimedReward || reward} t={t} />
        </div>

        <button
          className="reward-cta"
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
