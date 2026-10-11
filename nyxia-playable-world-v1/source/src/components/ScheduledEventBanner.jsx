import { useState, useEffect } from "react";
import { SCHEDULED_EVENTS } from "../data/scheduledEvents";
import { eventPhase, scheduledEventProgress, creditScheduledEventTicks } from "../utils/scheduledEvents";
import ScheduledEventModal from "./ScheduledEventModal";

function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Belirli saatlerde açılan dünya etkinlikleri (bkz. data/scheduledEvents.js)
// — kullanıcı isteği: "event başlamadan oyunda duyuru yazısı geçecek,
// etkinlik alanı 5dk erken açılacak, vakti geldiğinde geri sayımla açılacak."
// Hub, TopBar'ın hemen altında her zaman bu bileşeni render ediyor (görünür
// bir olay yoksa null döner ama kendisi hep mount'lu kalır) — hem geri
// sayımın canlı akması hem de katılan oyunculara tick'lerin uygulama
// açıkken otomatik işlenmesi için saniyede bir kendini yeniliyor (bkz.
// ClanTab.jsx'teki aynı "forceTick" deseni, boss geri sayımı için).
export default function ScheduledEventBanner({ player, setPlayer, pushToast }) {
  const [now, setNow] = useState(Date.now());
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Katılınmış + aktif her olay için yeni tick'leri XP'ye çevirir. "Yeni
  // tick" saat farkından hesaplandığı için (bkz. utils/scheduledEvents.js#
  // ticksElapsed) uygulama bir süre kapalı/arka planda kalıp tekrar
  // açılsa bile kaçırılan tick'ler burada tek seferde telafi edilir.
  useEffect(() => {
    for (const event of SCHEDULED_EVENTS) {
      const result = creditScheduledEventTicks(player, event, now);
      if (!result) continue;
      setPlayer(result.player);
      pushToast(
        `${event.name}: +${result.xpGain} XP${result.levelsGained > 0 ? ` (Seviye atladın! Lv.${result.player.level})` : ""}`,
        result.levelsGained > 0 ? "level" : "loot"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const visibleEvents = SCHEDULED_EVENTS
    .map((event) => ({ event, ...eventPhase(event, now) }))
    .filter((e) => e.phase === "preopen" || e.phase === "active");

  const openEvent = openId ? SCHEDULED_EVENTS.find((e) => e.id === openId) : null;

  return (
    <>
      {visibleEvents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 14px 0" }}>
          {visibleEvents.map(({ event, phase, start, end }) => {
            const Icon = event.icon;
            const progress = scheduledEventProgress(player, event);
            const label = phase === "preopen"
              ? `📢 ${event.name} ${fmtCountdown(start - now)} içinde başlıyor!`
              : progress.joined
                ? `🔥 ${event.name} aktif — ${progress.ticksCredited}/${progress.totalTicks} bonus alındı`
                : `🔥 ${event.name} aktif — katılmak için dokun!`;
            return (
              <button
                key={event.id}
                onClick={() => setOpenId(event.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10,
                  border: "1px solid", borderColor: `${event.color}66`, background: `${event.color}14`,
                  cursor: "pointer", textAlign: "left", overflow: "hidden",
                }}
              >
                <Icon size={16} color={event.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: event.color, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {label}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  {phase === "preopen" ? fmtCountdown(start - now) : fmtCountdown(end - now)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {openEvent && (
        <ScheduledEventModal
          event={openEvent}
          player={player}
          setPlayer={setPlayer}
          pushToast={pushToast}
          now={now}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
