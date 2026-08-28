import { CLASSES } from "../data/classes";
import { itemTierColor, ITEM_TIER_LABEL } from "../data/itemRarity";
import { STAT_LABELS } from "../data/stats";
import { ELEMENT_LABELS, ELEMENT_COLORS } from "../data/elements";
import { itemSubLabel, isConsumable } from "../utils/itemDisplay";
import { displayItemName } from "../utils/player";
import { styles } from "../styles";
import BarTrack from "./shared/BarTrack";
import ItemIcon from "./ItemIcon";

// Modeled on Knight Online's own item tooltip (durability bar, Attack
// Power/Speed/Range, colored elemental damage, class restriction, required
// stat, item grade, lore text, trade-lock warning) — see the reference
// screenshot for "Clarence's Training Bow". Consumables (potions/scrolls)
// skip straight to the simple weight line since none of these fields apply.
export default function ItemTooltip({ item, player, unmetReqs = [] }) {
  const tierColor = itemTierColor(item.tier);
  const statReqMet = unmetReqs.length === 0;
  const durabilityPct = item.durability ? (item.currentDurability / item.durability) * 100 : 100;
  const isWeapon = item.kind === "weapon";
  const classLock = item.kind === "armor" ? item.class : (item.kind === "weapon" ? item.cls : null);

  if (isConsumable(item)) {
    return (
      <div style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ItemIcon item={item} size={34} color={tierColor} strokeWidth={1.5} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>{displayItemName(item)}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              {item.tier ? `T${item.tier} · Ağırlık ${item.weight}` : `Ağırlık ${item.weight}`}
            </div>
          </div>
        </div>
        {item.desc && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 8 }}>{item.desc}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.itemDetailCard, borderColor: `${tierColor}55` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#0B0C10", borderWidth: 1, borderStyle: "solid", borderColor: `${tierColor}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ItemIcon item={item} size={48} color={tierColor} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: tierColor }}>{displayItemName(item)}</div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{itemSubLabel(item)}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tierColor }}>{ITEM_TIER_LABEL[item.tier] || ""}</div>
        </div>
      </div>

      {item.durability > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            <span>Dayanıklılık</span>
            <span>{item.currentDurability} / {item.durability} (%{Math.round(durabilityPct)})</span>
          </div>
          <BarTrack pct={durabilityPct} color="#D4AF6A" thin />
        </div>
      )}

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
        {item.atk > 0 && (
          <StatLine label="Saldırı Gücü" value={item.atk} />
        )}
        {item.def > 0 && (
          <StatLine label="Zırh" value={item.def} />
        )}
        {isWeapon && item.attackSpeed && (
          <StatLine label="Saldırı Hızı" value={item.attackSpeed} />
        )}
        {isWeapon && item.range != null && (
          <StatLine label="Menzil" value={item.range.toFixed(2)} />
        )}
        {item.element && (
          <StatLine
            label={`${ELEMENT_LABELS[item.element]} Hasarı`}
            value={item.elementBonus ? `+${item.elementBonus}` : "—"}
            color={ELEMENT_COLORS[item.element]}
          />
        )}
        {item.elements && item.elements.map((e) => (
          <StatLine
            key={e.key}
            label={`${ELEMENT_LABELS[e.key]} Hasarı`}
            value={e.bonus ? `+${e.bonus}` : "—"}
            color={ELEMENT_COLORS[e.key]}
          />
        ))}
        {item.hp > 0 && <StatLine label="Can Bonusu" value={`+${item.hp}`} />}
        {item.mp > 0 && <StatLine label="Mana Bonusu" value={`+${item.mp}`} />}
        {item.statBonus && Object.entries(item.statBonus).filter(([, v]) => v).map(([key, value]) => (
          <StatLine key={key} label={STAT_LABELS[key]} value={`+${value}`} />
        ))}
      </div>

      {classLock && (
        <div style={{ fontSize: 10, color: CLASSES[classLock].color, marginTop: 6 }}>
          -{CLASSES[classLock].name}
          {item.kind === "armor" && player && item.class !== player.class && (
            <span style={{ color: "#E8A5AF" }}> · sende kullanılamaz</span>
          )}
        </div>
      )}

      <div style={{ marginTop: 6 }}>
        <StatLine label="Ağırlık" value={item.weight} />
      </div>

      {item.reqStats?.length > 0 && (
        <div style={{ marginTop: 3 }}>
          {item.reqStats.map((r) => {
            const met = player ? player.stats[r.key] >= r.value : true;
            return (
              <StatLine
                key={r.key}
                label={`Gerekli ${STAT_LABELS[r.key]}`}
                value={r.value}
                color={met ? "#D4AF6A" : "#E8425A"}
              />
            );
          })}
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
      <div style={{ textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: tierColor }}>
        Eşya Derecesi: {ITEM_TIER_LABEL[item.tier] || "Sıradan"}
      </div>

      {item.lore && (
        <div style={{ textAlign: "center", fontSize: 10, fontStyle: "italic", color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }}>
          {item.lore}
        </div>
      )}

      {item.noTrade && (
        <div style={{ textAlign: "center", fontSize: 9, color: "#E8425A", marginTop: 8 }}>
          Takas edilemez, satılamaz ve saklanamaz
        </div>
      )}
    </div>
  );
}

function StatLine({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)" }}>
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ color: color || "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
