import { ScrollText } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { upgradeAccessory, canUpgradeAccessory, ACCESSORY_UPGRADE_MAX_LEVEL } from "../utils/accessoryUpgrade";
import { displayItemName } from "../utils/player";
import { styles } from "../styles";
import EmptyState from "./shared/EmptyState";
import ItemIcon from "./ItemIcon";

// Takı yükseltme silah/zırhın forge+parşömeninden tamamen ayrı bir ekran —
// kullanıcı isteği: "Yükselt kısmında Takı Yükseltme sekmesi eklenecek."
// Aynı isim+seviyeden HER takı grubunu listeler (3'ten az olsa bile, ki
// oyuncu ilerlemesini görsün), ama sadece 3+ olanlarda buton aktif olur.
export default function AccessoryUpgradeTab({ player, setPlayer, pushToast }) {
  const groups = new Map();
  for (const it of player.inventory) {
    if (it.kind !== "accessory") continue;
    const key = `${it.name}:::${it.upgradeLevel || 0}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  }
  const rows = [...groups.values()].sort((a, b) => b.length - a.length);
  const scrollCount = player.inventory.find((it) => it.kind === "accessoryScroll")?.count || 0;

  const handleUpgrade = (sample) => {
    const result = upgradeAccessory(player, sample.id);
    if (!result.upgraded) { pushToast(result.reason || "Yükseltilemedi.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`${displayItemName(sample)} → +${(sample.upgradeLevel || 0) + 1} oldu!`, "loot");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
        Aynı takıdan ve aynı +'dan <b>3 tane</b> + <b>1 Aksesuar Yükseltme Kağıdı</b> %100 oranda
        bir sonraki seviyeye birleşir. +{ACCESSORY_UPGRADE_MAX_LEVEL}'ten sonrası henüz açılmadı.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5FA8A0" }}>
        <ScrollText size={13} /> Aksesuar Yükseltme Kağıdı: {scrollCount}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ScrollText} title="Yükseltilecek takı yok" subtitle="Aynı takıdan en az 3 tane topla." />
      ) : (
        rows.map((items) => {
          const sample = items[0];
          const level = sample.upgradeLevel || 0;
          const check = canUpgradeAccessory(player, sample);
          return (
            <div key={`${sample.name}:${level}`} style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ItemIcon item={sample} size={30} color={itemTierColor(sample.tier)} strokeWidth={1.4} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13 }}>{sample.name} +{level}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
                  {items.length}/3 {items.length >= 3 ? "— hazır" : "toplandı"}
                </div>
              </div>
              <button
                style={{
                  ...styles.tinyBtn, flexShrink: 0,
                  background: check.ok ? "#5FA8A0" : "var(--bg-panel-alt)",
                  color: check.ok ? "#0B0C10" : "var(--text-faint)",
                }}
                disabled={!check.ok}
                title={check.ok ? undefined : check.reason}
                onClick={() => handleUpgrade(sample)}
              >
                Yükselt (%100)
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
