import { useState, useEffect } from "react";
import { Skull } from "lucide-react";
import { activeBossEntries } from "../utils/warzoneBoss";
import { useTranslation } from "../i18n/LanguageContext";

function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Kullanıcı isteği: "Bu bosslar için oyunda 'notice' geçecek. Örnek: Meydan
// Celladı Bossu ortaya çıktı! Saldırmak için son 3 dakika." — Hub, TopBar'ın
// hemen altında (ScheduledEventBanner ile aynı satırda) her zaman bu
// bileşeni render ediyor; görünür bir aktif boss yoksa null döner ama
// kendisi hep mount'lu kalır (geri sayımın canlı akması için saniyede bir
// kendini yeniliyor — bkz. ScheduledEventBanner.jsx'teki aynı desen).
// Tıklanınca Savaş Alanı'na geçiliyor (onOpenWarzone varsa).
export default function WarzoneBossBanner({ onOpenWarzone }) {
  const { t, tm } = useTranslation();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const entries = activeBossEntries(now);
  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 14px 0" }}>
      {entries.map(({ boss, msUntilDespawn }) => (
        <button
          key={boss.id}
          onClick={onOpenWarzone}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10,
            border: "1px solid", borderColor: `${boss.color}66`, background: `${boss.color}14`,
            cursor: onOpenWarzone ? "pointer" : "default", textAlign: "left", overflow: "hidden",
          }}
        >
          <Skull size={16} color={boss.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: boss.color, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t("warzone.log.bossSpawned", { boss: tm(boss) })}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
            {fmtCountdown(msUntilDespawn)}
          </span>
        </button>
      ))}
    </div>
  );
}
