import { useState } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import { COMMUNITY_LINKS } from "../data/legalLinks";
import { COMMUNITY_PLATFORMS } from "../data/communityReward";
import { DiscordIcon, InstagramIcon } from "./icons/BrandIcons";

// "Tıkla ve Al": düğme bağlantıyı açar ve ödülü verir (hesap başına her platform için bir kez; sunucu denetler).
export default function CommunityRewards({ act, pushToast, enabled, claimed = [] }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(null);
  const [localClaimed, setLocalClaimed] = useState([]);
  const isClaimed = (platform) => claimed.includes(platform) || localClaimed.includes(platform);

  const claim = async (platform) => {
    if (busy || !enabled || isClaimed(platform)) return;
    const link = COMMUNITY_LINKS.find((entry) => entry.id === platform);
    if (link) window.open(link.href, "_blank", "noopener,noreferrer");
    setBusy(platform);
    try {
      const result = await act("social/claim", { platform });
      if (result.ok) { setLocalClaimed((list) => [...list, platform]); pushToast(t("community.claimedToast"), "loot"); }
      else if (result.reason === "alreadyClaimed") { setLocalClaimed((list) => [...list, platform]); pushToast(t("community.alreadyClaimed"), "warn"); }
      else pushToast(t(result.reason === "bagFull" ? "community.bagFull" : "community.failed"), "warn");
    } catch { pushToast(t("community.failed"), "warn"); }
    finally { setBusy(null); }
  };

  return (
    <div className="settings-reward">
      <h4 style={{ margin: "10px 0 4px" }}>{t("community.rewardTitle")}</h4>
      <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)" }}>{t("community.rewardText")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {COMMUNITY_PLATFORMS.map((platform) => {
          const link = COMMUNITY_LINKS.find((entry) => entry.id === platform);
          const done = isClaimed(platform);
          return (
            <button
              key={platform}
              className={`settings-community-link ${platform}`}
              style={{ opacity: done || !enabled ? 0.55 : 1, cursor: done || !enabled ? "default" : "pointer", textAlign: "left" }}
              disabled={done || !enabled || busy !== null}
              onClick={() => claim(platform)}
            >
              {platform === "discord" ? <DiscordIcon /> : <InstagramIcon />}
              <span>{link?.tr && (done ? t("community.claimed") : `${link.tr} · ${t("community.claim")}`)}</span>
            </button>
          );
        })}
      </div>
      {!enabled && <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-faint)" }}>{t("community.needCharacter")}</p>}
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--gold-text)" }}>{t("community.giveaway")}</p>
    </div>
  );
}
