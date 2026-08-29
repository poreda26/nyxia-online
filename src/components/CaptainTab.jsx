import { ShieldCheck, Gift, Crown, Skull, Flag } from "lucide-react";
import { MONSTER_QUESTS, AWAKENING_QUEST } from "../data/quests";
import { questProgress, isQuestClaimed, claimQuest, awakeningProgress, claimAwakening } from "../utils/quests";
import { displayClassName } from "../utils/player";
import { findMonster } from "../data/maps";
import { itemTierColor } from "../data/itemRarity";
import { buyNationalPoint, canBuyNationalPoint } from "../utils/nationalPoint";
import { NP_RECOVERY_GOLD_COST, NP_RECOVERY_NP_AMOUNT } from "../utils/nationalPointConstants";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import BarTrack from "./shared/BarTrack";

// Kaptan's board is deliberately a single static screen, not a branching
// dialogue — every quest is always visible and just tracks itself off
// player.monsterKills (see utils/quests.js). No accept/turn-in ceremony,
// just "kill enough, then claim."
export default function CaptainTab({ player, setPlayer, pushToast }) {
  const claim = (questId) => {
    const result = claimQuest(player, questId);
    if (!result.claimed) { pushToast(result.reason || "Alınamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`Ödül alındı: +${result.quest.goldReward} altın, +${result.quest.xpReward} XP, T${result.quest.tier} Sandık`, "loot");
  };

  const awaken = () => {
    const result = claimAwakening(player);
    if (!result.claimed) { pushToast(result.reason || "Uyanamadın.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`2. Uyanış tamamlandı! Artık ${displayClassName(result.player)}sın.`, "loot");
  };

  const buyNp = () => {
    const result = buyNationalPoint(player);
    if (!result.bought) { pushToast(result.reason || "Alınamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`+${NP_RECOVERY_NP_AMOUNT} National Point satın alındı.`, "loot");
  };

  const awakening = awakeningProgress(player);
  const showAwakening = player.level >= AWAKENING_QUEST.requiredLevel && !player.awakened;

  // Seviyeye göre kademeli açılış — henüz erişemeyeceği haritaların
  // görevleri hiç listelenmiyor, sadece bir sonraki eşiği gösteren tek
  // satırlık bir ipucu var (bkz. data/quests.js#MONSTER_QUESTS'in
  // requiredLevel alanı).
  const unlockedQuests = MONSTER_QUESTS.filter((q) => player.level >= q.requiredLevel);
  const lockedQuests = MONSTER_QUESTS.filter((q) => player.level < q.requiredLevel);
  const nextUnlockLevel = lockedQuests.length > 0 ? Math.min(...lockedQuests.map((q) => q.requiredLevel)) : null;

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Kaptan</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldCheck size={20} color="#D4AF6A" strokeWidth={1.5} />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          "Bu topraklarda hayatta kalmak beceri ister, evlat. Canavarları temizle, sana onları öğreteyim."
        </p>
      </div>

      <div style={{ ...styles.itemDetailCard, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Flag size={16} color="#D4AF6A" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>National Point Takviyesi</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
              Şu an: {player.nationalPoint} NP{player.nationalPoint > 0 && " — sadece 0 NP'ye düşünce açılır"}
            </div>
          </div>
          <button
            style={{ ...styles.tinyBtn, background: canBuyNationalPoint(player) ? "#D4AF6A" : "var(--bg-panel-alt)", color: canBuyNationalPoint(player) ? "#0B0C10" : "var(--text-faint)" }}
            disabled={!canBuyNationalPoint(player)}
            onClick={buyNp}
          >
            +{NP_RECOVERY_NP_AMOUNT} NP · {NP_RECOVERY_GOLD_COST}g
          </button>
        </div>
      </div>

      {showAwakening && (
        <div style={{ ...styles.itemDetailCard, borderColor: "#FF8C4266", background: "#FF8C4212", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={18} color="#FF8C42" strokeWidth={1.6} />
            <div style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 14, color: "#FF8C42" }}>{AWAKENING_QUEST.name}</div>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {awakening.entries.map((e) => (
              <div key={e.monsterId}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                  <span>{findMonster(e.monsterId)?.name || e.monsterId}</span>
                  <span>{e.current}/{e.target}</span>
                </div>
                <BarTrack pct={(e.current / e.target) * 100} color="#FF8C42" thin />
              </div>
            ))}
          </div>
          <button
            style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: awakening.done ? "#FF8C42" : "var(--bg-panel-alt)", color: awakening.done ? "#0B0C10" : "var(--text-faint)" }}
            disabled={!awakening.done}
            onClick={awaken}
          >
            {awakening.done ? "2. Uyanışı Gerçekleştir" : "Sınav tamamlanmadı"}
          </button>
        </div>
      )}

      <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Görevler</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {unlockedQuests.map((q) => {
          const { current, target, done } = questProgress(player, q);
          const claimed = isQuestClaimed(player, q.id);
          const color = itemTierColor(q.tier);
          return (
            <div key={q.id} style={{ ...styles.itemDetailCard, ...(claimed ? { opacity: 0.55 } : {}) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Skull size={16} color={color} strokeWidth={1.6} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{q.name}</div>
                  <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>T{q.tier} · {findMonster(q.monsterId)?.name || q.monsterId}</div>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{current}/{target}</div>
              </div>
              <BarTrack pct={(current / target) * 100} color={color} thin />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Gift size={11} /> {q.goldReward}g · {q.xpReward} XP · T{q.tier} Sandık
                </div>
                <button
                  style={{ ...styles.tinyBtn, background: done && !claimed ? color : "var(--bg-panel-alt)", color: done && !claimed ? "#0B0C10" : "var(--text-faint)" }}
                  disabled={!done || claimed}
                  onClick={() => claim(q.id)}
                >
                  {claimed ? "Alındı" : done ? "Ödülü Al" : "Devam Ediyor"}
                </button>
              </div>
            </div>
          );
        })}
        {nextUnlockLevel != null && (
          <div style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "center", padding: "6px 0" }}>
            {lockedQuests.length} görev daha kilitli — Lv.{nextUnlockLevel}'de açılır.
          </div>
        )}
      </div>
    </div>
  );
}
