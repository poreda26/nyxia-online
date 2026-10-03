import { useState, useEffect } from "react";
import { Skull, Users, ChevronDown, X } from "lucide-react";
import { SCHEDULED_EVENTS } from "../data/scheduledEvents";
import { SCHEDULED_EVENT_ICONS } from "../data/scheduledEventIcons";
import { WARZONE_UNLOCK_LEVEL } from "../data/warzone";
import { eventPhase, scheduledEventProgress, creditScheduledEventTicks } from "../utils/scheduledEvents";
import { noticeBossEntries } from "../utils/warzoneBoss";
import ScheduledEventModal from "./ScheduledEventModal";
import NoticeTicker from "./NoticeTicker";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

const ROTATE_MS = 5000;

function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Zamanlı etkinlikler (EXP Rush gibi) ile dünya bossu duyuruları tek bir ince
// satırda: aynı anda birden çok duyuru varsa sırayla döner, satıra dokununca
// hepsi bir listede açılır. Eskiden her duyuru ayrı bir şerit olarak üst üste
// diziliyor, telefonda ~150px yer kaplıyordu. Dünya bossu duyuruları Savaş Alanı
// açılmadan (Lv.50) anlamsız olduğu için daha düşük seviyede hiç gösterilmiyor.
// Etkinlik tick'lerini XP'ye çevirme işi de (uygulama arka plandan dönse bile
// kaçan tick'leri telafi eder) buradan yürütülüyor.
export default function EventStrip({ player, setPlayer, pushToast, onOpenWarzone }) {
  const { t, tm } = useTranslation();
  const [now, setNow] = useState(Date.now());
  const [openId, setOpenId] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const eventName = (event) => t(`scheduledEvent.eventName.${event.id}`);

  useEffect(() => {
    for (const event of SCHEDULED_EVENTS) {
      const result = creditScheduledEventTicks(player, event, now);
      if (!result) continue;
      setPlayer(result.player);
      pushToast(
        result.levelsGained > 0
          ? t("scheduledEvent.tickXpLeveledUp", { event: eventName(event), xp: result.xpGain, level: result.player.level })
          : t("scheduledEvent.tickXp", { event: eventName(event), xp: result.xpGain }),
        result.levelsGained > 0 ? "level" : "loot"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const scheduled = SCHEDULED_EVENTS
    .map((event) => ({ event, ...eventPhase(event, now) }))
    .filter((e) => e.phase === "preopen" || e.phase === "active")
    .map(({ event, phase, start, end }) => {
      const progress = scheduledEventProgress(player, event);
      const text = phase === "preopen"
        ? t("scheduledEvent.bannerPreopen", { event: eventName(event), countdown: fmtCountdown(start - now) })
        : progress.joined
          ? t("scheduledEvent.bannerActiveJoined", { event: eventName(event), credited: progress.ticksCredited, total: progress.totalTicks })
          : t("scheduledEvent.bannerActiveUnjoined", { event: eventName(event) });
      return {
        key: `event:${event.id}`, color: event.color, Icon: SCHEDULED_EVENT_ICONS[event.id], text,
        countdown: fmtCountdown(phase === "preopen" ? start - now : end - now), live: phase === "active",
        activate: () => setOpenId(event.id),
      };
    });

  const bosses = player.level < WARZONE_UNLOCK_LEVEL ? [] : noticeBossEntries(now).map(({ boss, phase, msUntilDespawn, msUntilSpawn }) => {
    const live = phase === "active";
    return {
      key: `boss:${boss.id}`, color: boss.color, Icon: live ? Skull : Users,
      text: live ? t("warzone.log.bossSpawned", { boss: tm(boss) }) : t("warzone.log.bossGatheringNotice", { boss: tm(boss) }),
      countdown: fmtCountdown(live ? msUntilDespawn : msUntilSpawn), live,
      activate: () => onOpenWarzone?.(),
    };
  });

  // Aktif olanlar önce.
  const entries = [...scheduled, ...bosses].sort((a, b) => Number(b.live) - Number(a.live));
  const many = entries.length > 1;

  useEffect(() => {
    if (!many || listOpen) return undefined;
    const id = setInterval(() => setRotation((n) => n + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, [many, listOpen]);

  const openEvent = openId ? SCHEDULED_EVENTS.find((e) => e.id === openId) : null;
  const current = entries.length ? entries[rotation % entries.length] : null;

  return (
    <>
      {current && (
        <div style={{ padding: "8px 14px 0" }}>
          <button
            className="game-notice" key={current.key}
            onClick={() => (many ? setListOpen(true) : current.activate())}
            aria-label={many ? t("eventStrip.openList", { n: entries.length }) : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, width: "100%", boxSizing: "border-box",
              border: "1px solid", borderColor: `${current.color}66`, background: `${current.color}14`,
              cursor: "pointer", textAlign: "left", overflow: "hidden",
            }}
          >
            <current.Icon size={16} color={current.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <NoticeTicker>{current.text}</NoticeTicker>
            <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{current.countdown}</span>
            {many && (
              <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, fontSize: 10, fontWeight: 700, color: "var(--gold-text)" }}>
                {(rotation % entries.length) + 1}/{entries.length}<ChevronDown size={12} />
              </span>
            )}
          </button>
        </div>
      )}

      {listOpen && (
        <div style={styles.modalOverlay} onClick={() => setListOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={t("eventStrip.title")} style={{ ...styles.modalCard, maxWidth: 340, padding: "22px 16px 16px" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setListOpen(false)} aria-label={t("eventStrip.close")} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}><X size={16} /></button>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{t("eventStrip.title")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 14 }}>
              {entries.map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => { setListOpen(false); entry.activate(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                    border: "1px solid", borderColor: `${entry.color}66`, background: `${entry.color}14`, color: "var(--text-primary)",
                  }}
                >
                  <entry.Icon size={18} color={entry.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4 }}>{entry.text}</span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{entry.countdown}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openEvent && (
        <ScheduledEventModal event={openEvent} player={player} setPlayer={setPlayer} pushToast={pushToast} now={now} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
