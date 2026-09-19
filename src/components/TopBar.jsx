import { useState, useEffect } from "react";
import { Coins, Crown, Gem, Gift, Plus, ScrollText, Settings } from "lucide-react";
import { xpToNext, MAX_LEVEL, formatGold } from "../utils/player";
import { activePremiumTier } from "../utils/premium";
import { activeTitleInfo } from "../utils/achievements";
import { activeBoostsList } from "../utils/boosts";
import { boostScrollName } from "../data/boostScrolls";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

function formatMmSs(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TopBar({ player, cls, maxHp, def, atk, dailyLoginAvailable, onOpenDailyLogin, onOpenSettings, onOpenDiamondShop }) {
  const { t, lang } = useTranslation();
  // Aktif takviyelerin geri sayımı gerçek zamana (Date.now()) bağlı — bkz.
  // utils/boosts.js, premium ile aynı "duvar saati" deseni. Bu, o değeri
  // saniyede bir yeniden okutmak için sadece bir "tick" state'i, başka
  // hiçbir şeyi tetiklemiyor.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const activeBoosts = activeBoostsList(player);
  const atCap = player.level >= MAX_LEVEL;
  const need = xpToNext(player.level);
  const pct = atCap ? 100 : Math.min(100, (player.xp / need) * 100);
  const Icon = cls.icon;
  const premiumTier = activePremiumTier(player);
  const title = activeTitleInfo(player);
  return (
    <div style={styles.topBar}>
      <div style={styles.topBarRow}>
        <div style={styles.classBadge}>
          <Icon size={16} color={cls.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 130, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {premiumTier && <Crown size={13} color={premiumTier.color} strokeWidth={2} fill={premiumTier.color} style={{ flexShrink: 0 }} />}
              {/* Kullanıcı isteği: sınıf ikonu (solda) zaten sınıfı belli
                  ediyor, sınıf adını burada tekrar yazmak kalabalık
                  yapıyordu — kaldırıldı. */}
              {title && (
                <span style={{ fontSize: 9, color: title.color, border: `1px solid ${title.color}66`, borderRadius: 4, padding: "1px 4px", flexShrink: 0 }}>
                  {t(`character.achievements.${title.achId}.title`)}
                </span>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {player.nickname ? `${player.nickname} · ` : ""}Lv.{player.level}
              </span>
            </span>
            <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", flexShrink: 0, whiteSpace: "nowrap" }}>
              {atCap ? t("topBar.maxLevel") : `${player.xp}/${need} XP`}
            </span>
          </div>
          <div style={styles.xpTrack}>
            <div style={{ ...styles.xpFill, width: `${pct}%`, background: atCap ? "#D4AF6A" : cls.color }} />
          </div>
        </div>
        <div style={styles.goldChip}>
          <Coins size={13} color="var(--gold-text)" />
          <span style={{ fontFamily: "var(--font-mono)" }}>{formatGold(player.gold)}</span>
        </div>
        {onOpenDiamondShop && (
          <button onClick={onOpenDiamondShop} title={t("diamondShop.title")} style={{ ...styles.diamondChip, color: "var(--text-primary)" }}>
            <Gem size={13} color="#8B6FC9" />
            <span style={{ fontFamily: "var(--font-mono)" }}>{player.diamonds}</span>
            <Plus size={12} color="#8B6FC9" />
          </button>
        )}
        {onOpenDailyLogin && (
          <button
            onClick={onOpenDailyLogin}
            title={t("topBar.dailyLogin")}
            style={{ position: "relative", background: "none", border: "none", color: dailyLoginAvailable ? "var(--gold-text)" : "var(--text-faint)", cursor: "pointer", padding: 4, flexShrink: 0 }}
          >
            <Gift size={16} strokeWidth={1.8} />
            {dailyLoginAvailable && <span style={{ ...styles.navNotifDot, top: 0, left: "auto", right: -1, marginLeft: 0 }} />}
          </button>
        )}
        {/* Ayarlar artık burada, satır içinde (kullanıcının bildirdiği bug:
            App.jsx'teki eski mutlak konumlu dişli ikonu tam bu Hediye
            ikonunun üstüne biniyordu, ikisi de sağ üst köşeye sabitti).
            App.jsx bu ekrandayken kendi yüzen butonunu render etmiyor. */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title={t("settings.title")}
            style={{ background: "none", border: "none", color: "var(--gold-text)", cursor: "pointer", padding: 4, flexShrink: 0 }}
          >
            <Settings size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
      <div style={styles.topBarSub}>
        <span>ATK {atk}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>DEF {def}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>HP {maxHp}</span>
      </div>
      {activeBoosts.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {activeBoosts.map(({ def: s, msLeft }) => (
            <span key={s.id} title={boostScrollName(s.id, lang)} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontFamily: "var(--font-mono)", color: s.color }}>
              <ScrollText size={10} /> {formatMmSs(msLeft)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
