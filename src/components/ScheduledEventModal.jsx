import { CheckCircle2, X } from "lucide-react";
import { eventPhase, eventTotalTicks, scheduledEventProgress, canJoinScheduledEvent, joinScheduledEvent } from "../utils/scheduledEvents";
import { styles } from "../styles";
import BarTrack from "./shared/BarTrack";
import { useTranslation } from "../i18n/LanguageContext";

function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// "Etkinlik alanı" — ScheduledEventBanner'daki karta dokununca açılır.
// preopen fazında başlamaya kalan geri sayımı, active fazında bitmeye kalan
// süreyi + katılınmışsa alınan bonus ilerlemesini gösterir. Tick'lerin
// KENDİSİ burada değil ScheduledEventBanner'ın periyodik kontrolünde
// işleniyor — bu modal sadece o state'i okuyup gösteriyor, kapatılsa da
// katılım/ilerleme kaybolmuyor.
export default function ScheduledEventModal({ event, player, setPlayer, pushToast, now, onClose }) {
  const { t } = useTranslation();
  const eventName = t(`scheduledEvent.eventName.${event.id}`);
  const Icon = event.icon;
  const { phase, start, end } = eventPhase(event, now);
  const progress = scheduledEventProgress(player, event);
  const joinCheck = canJoinScheduledEvent(player, event, now);

  const JOIN_FAIL_KEY = { notOpen: "scheduledEvent.notOpen", alreadyJoined: "scheduledEvent.alreadyJoined" };

  const handleJoin = () => {
    const result = joinScheduledEvent(player, event, now);
    if (!result.joined) { pushToast(t(JOIN_FAIL_KEY[result.reason] || "scheduledEvent.couldNotJoin"), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("scheduledEvent.joined", { event: eventName }), "loot");
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Icon size={32} color={event.color} strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17, textAlign: "center" }}>{eventName}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6, textAlign: "center", maxWidth: 240 }}>
          {t("scheduledEvent.description", { interval: event.tickIntervalMinutes, tickPercent: event.tickPercent, totalPercent: event.tickPercent * eventTotalTicks(event) })}
        </div>

        <div style={{ marginTop: 16, fontSize: 22, fontFamily: "var(--font-mono)", color: event.color }}>
          {phase === "preopen" ? fmtCountdown(start - now) : fmtCountdown(end - now)}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
          {phase === "preopen" ? t("scheduledEvent.timeUntilStart") : t("scheduledEvent.timeUntilEnd")}
        </div>

        {phase === "active" && progress.joined && (
          <div style={{ width: "100%", marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", marginBottom: 4 }}>
              <span>{t("scheduledEvent.bonusEarned")}</span>
              <span>{progress.ticksCredited}/{progress.totalTicks}</span>
            </div>
            <BarTrack pct={(progress.ticksCredited / progress.totalTicks) * 100} color={event.color} />
          </div>
        )}

        {progress.joined ? (
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5FA8A0" }}>
            <CheckCircle2 size={14} /> {t("scheduledEvent.joinedTag")}
          </div>
        ) : (
          <button
            style={{ ...styles.primaryBtn, marginTop: 18, width: "100%", background: event.color, color: "#0B0C10", opacity: joinCheck.ok ? 1 : 0.5 }}
            disabled={!joinCheck.ok}
            onClick={handleJoin}
          >
            {t("scheduledEvent.join")}
          </button>
        )}
      </div>
    </div>
  );
}
