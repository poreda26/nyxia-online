import { useEffect, useState } from "react";
import { Gem, Play } from "./icons/GameIcons";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { fetchAds, startAd, claimAd } from "../services/adsService";
import { playRewardedAd } from "../utils/rewardedAd";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Reklam izle, elmas kazan": 6 saatte bir bir reklam, ödül 5/10/15 elmas. Her şeyi (süre, miktar, ödeme) sunucu belirler.
// Sunucuda kapalıysa (ads.enabled=false) kart hiç görünmez.
export default function FreeDiamondsCard({ setPlayer, pushToast, onStatus }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [now, setNow] = useState(Date.now());

  const apply = (next) => { setStatus(next); onStatus?.(next); };
  useEffect(() => { fetchAds().then(apply).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!status || status.canWatch) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (status && !status.canWatch && status.nextAt <= now) fetchAds().then(apply).catch(() => {});
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!status?.enabled) return null;

  const watch = async () => {
    if (phase !== "idle") return;
    setPhase("loading");
    try {
      const ticket = await startAd();
      setPhase("playing");
      const played = await playRewardedAd({ mode: status.mode, userId: ticket.userId, customData: ticket.customData });
      if (!played.completed) { pushToast(t("diamondShop.freeNotWatched"), "warn"); return; }
      setPhase("waiting");
      // Gerçek reklamda ödül bildirimi reklam ağından sunucuya birkaç saniye içinde gelir.
      for (let attempt = 0; attempt < 6; attempt++) {
        const result = await claimAd(ticket.ticket);
        if (result.rewarded) {
          setPlayer((p) => ({ ...p, diamonds: result.diamonds }));
          apply(result);
          pushToast(t("diamondShop.freeWon", { amount: result.amount }), "loot");
          return;
        }
        await wait(2000);
      }
      pushToast(t("diamondShop.freePending"), "warn");
    } catch (error) {
      const code = error?.code || error?.message;
      pushToast(t(code === "ADS_UNSUPPORTED" ? "diamondShop.freeUnsupported" : code === "AD_COOLDOWN" ? "diamondShop.freeCooldown" : "diamondShop.freeUnavailable"), "warn");
      fetchAds().then(apply).catch(() => {});
    } finally { setPhase("idle"); }
  };

  const busy = phase !== "idle";
  const ready = status.canWatch;
  return (
    <div style={{ ...styles.itemDetailCard, width: "100%", marginTop: 16, borderColor: "#8B6FC9", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Gem size={18} color="#8B6FC9" strokeWidth={1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontFamily: "var(--font-display)" }}>{t("diamondShop.freeTitle")}</div>
        <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.4 }}>
          {phase === "loading" ? t("diamondShop.freeLoading") : phase === "playing" ? t("diamondShop.freePlaying") : phase === "waiting" ? t("diamondShop.freeWaiting")
            : ready ? t("diamondShop.freeDesc") : t("diamondShop.freeNext", { time: clock(status.nextAt - now) })}
        </div>
      </div>
      <button
        disabled={!ready || busy} onClick={watch}
        style={{ ...styles.tinyBtn, flexShrink: 0, background: ready && !busy ? "#8B6FC9" : "var(--bg-panel-alt)", color: ready && !busy ? "#fff" : "var(--text-faint)", display: "flex", alignItems: "center", gap: 4, opacity: ready && !busy ? 1 : 0.7 }}
      >
        <Play size={11} /> {t("diamondShop.freeWatch")}
      </button>
    </div>
  );
}
