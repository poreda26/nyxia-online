import { CLASSES } from "../data/classes";
import { itemTierColor, ITEM_TIER_LABEL, tierName } from "../data/itemRarity";
import { STAT_LABELS } from "../data/stats";
import { ELEMENT_LABELS, ELEMENT_COLORS } from "../data/elements";
import { WEAPON_TYPE_LABEL } from "../data/warriorWeapons";
import { WEAPON_LORE_EN } from "../data/itemNameTranslations";
import { itemSubLabel, isConsumable } from "../utils/itemDisplay";
import { displayItemName, armorLevelBonus, ARMOR_CLASS_BONUS_STAT } from "../utils/player";
import { useTranslation } from "../i18n/LanguageContext";
import { styles } from "../styles";
import BarTrack from "./shared/BarTrack";
import ItemIcon from "./ItemIcon";

// Modeled on Knight Online's own item tooltip (durability bar, Attack
// Power/Speed/Range, colored elemental damage, class restriction, required
// stat, item grade, lore text, trade-lock warning) — see the reference
// screenshot for "Clarence's Training Bow". Consumables (potions/scrolls)
// skip straight to the simple weight line since none of these fields apply.
export default function ItemTooltip({ item, player, unmetReqs = [] }) {
  const { t, lang } = useTranslation();
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
            <div style={{ fontSize: 13 }}>{displayItemName(item, lang)}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              {item.tier ? t("itemTooltip.weightWithTier", { tier: tierName(lang, item.tier), weight: item.weight }) : t("itemTooltip.weightOnly", { weight: item.weight })}
            </div>
          </div>
        </div>
        {item.kind === "boostScroll" ? (
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 8 }}>{t(`boosts.${item.boostId}.desc`)}</div>
        ) : item.desc && (
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
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: tierColor }}>{displayItemName(item, lang)}</div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{itemSubLabel(item, lang)}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tierColor }}>{ITEM_TIER_LABEL[lang][item.tier] || ""}</div>
        </div>
      </div>

      {item.durability > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            <span>{t("itemTooltip.durability")}</span>
            <span>{t("itemTooltip.durabilityValue", { cur: item.currentDurability, max: item.durability, pct: Math.round(durabilityPct) })}</span>
          </div>
          <BarTrack pct={durabilityPct} color="var(--gold-text)" thin />
        </div>
      )}

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
        {item.atk > 0 && (
          <StatLine label={t("itemTooltip.attackPower")} value={item.atk} />
        )}
        {item.def > 0 && (
          <StatLine label={t("itemTooltip.armor")} value={item.def} />
        )}
        {isWeapon && item.attackSpeed && (
          <StatLine label={t("itemTooltip.attackSpeed")} value={t(`itemTooltip.speed.${item.attackSpeed}`)} />
        )}
        {isWeapon && item.range != null && (
          <StatLine label={t("itemTooltip.range")} value={item.range.toFixed(2)} />
        )}
        {item.element && (
          <StatLine
            label={t("itemTooltip.elementDamage", { element: ELEMENT_LABELS[lang][item.element] })}
            value={item.elementBonus ? `+${item.elementBonus}` : "—"}
            color={ELEMENT_COLORS[item.element]}
          />
        )}
        {item.elements && item.elements.map((e) => (
          <StatLine
            key={e.key}
            label={t("itemTooltip.elementDamage", { element: ELEMENT_LABELS[lang][e.key] })}
            value={e.bonus ? `+${e.bonus}` : "—"}
            color={ELEMENT_COLORS[e.key]}
          />
        ))}
        {item.hp > 0 && <StatLine label={t("itemTooltip.hpBonus")} value={`+${item.hp}`} />}
        {item.mp > 0 && <StatLine label={t("itemTooltip.mpBonus")} value={`+${item.mp}`} />}
        {item.statBonus && Object.entries(item.statBonus).filter(([, v]) => v).map(([key, value]) => (
          <StatLine key={key} label={STAT_LABELS[key]} value={`+${value}`} />
        ))}
        {/* Zırhın kendi +seviyesine göre sabit sınıf bonusu (Warrior→STR,
            Rogue→DEX, Mage→MP) — item.statBonus gibi eşyanın
            üzerinde SAKLANMIYOR, item.upgradeLevel'den her zaman TAZE
            hesaplanıyor (bkz. utils/player.js#armorLevelBonus), forge'un
            ×1.18 katlanmalı büyümesiyle karışmasın diye. Kullanıcı isteği:
            eşyanın üstünde görünsün ki bonusun gerçekten işlediği belli olsun. */}
        {item.kind === "armor" && armorLevelBonus(item.upgradeLevel) > 0 && (
          <StatLine
            label={STAT_LABELS[ARMOR_CLASS_BONUS_STAT[item.class]]}
            value={`+${armorLevelBonus(item.upgradeLevel)}`}
            color="var(--gold-text)"
          />
        )}
        {/* String of Skulls gibi takıların dormant alanları — henüz hiçbir
            savaş formülü bunları OKUMUYOR (Defense Ability = elinde
            Dagger/Club/Spear olana karşı azaltılmış hasar, Attack Power =
            yüzdesel saldırı bonusu, ikisi de "bunun ayarlarını yapacağız"
            diye kullanıcı isteğiyle şimdilik sadece VERİ olarak duruyor) —
            ama oyuncu eşyanın üstünde görebilsin diye tooltip'te gösteriliyor. */}
        {item.attackPowerPct > 0 && (
          <StatLine label={t("itemTooltip.attackPowerBonus")} value={`+%${Math.round(item.attackPowerPct * 100)}`} color="var(--gold-text)" />
        )}
        {item.resistances && Object.entries(item.resistances).filter(([, v]) => v).map(([key, value]) => (
          <StatLine key={key} label={t("itemTooltip.elementResistance", { element: ELEMENT_LABELS[lang][key] || key })} value={`+${value}`} color={ELEMENT_COLORS[key]} />
        ))}
        {item.defenseAbility && (
          <StatLine
            label={t("itemTooltip.defenseAbility", { weaponType: WEAPON_TYPE_LABEL[lang][item.defenseAbility.vs] || item.defenseAbility.vs })}
            value={`+${item.defenseAbility.value}`}
          />
        )}
        {item.kind === "accessory" && item.upgradeLocked && (
          <StatLine label={t("itemTooltip.upgradeLabel")} value={t("settings.off")} color="#E8A5AF" />
        )}
      </div>

      {classLock && (
        <div style={{ fontSize: 10, color: CLASSES[classLock].color, marginTop: 6 }}>
          -{CLASSES[classLock].name}
          {item.kind === "armor" && player && item.class !== player.class && (
            <span style={{ color: "#E8A5AF" }}> · {t("itemTooltip.notUsableByYou")}</span>
          )}
        </div>
      )}

      <div style={{ marginTop: 6 }}>
        <StatLine label={t("itemTooltip.weight")} value={item.weight} />
      </div>

      {item.reqStats?.length > 0 && (
        <div style={{ marginTop: 3 }}>
          {item.reqStats.map((r) => {
            const met = player ? player.stats[r.key] >= r.value : true;
            return (
              <StatLine
                key={r.key}
                label={t("itemTooltip.requiredStat", { stat: STAT_LABELS[r.key] })}
                value={r.value}
                color={met ? "var(--gold-text)" : "#E8425A"}
              />
            );
          })}
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
      <div style={{ textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: tierColor }}>
        {t("itemTooltip.itemGradeLine", { grade: ITEM_TIER_LABEL[lang][item.tier] || t("itemTooltip.commonGrade") })}
      </div>

      {item.lore && (
        <div style={{ textAlign: "center", fontSize: 10, fontStyle: "italic", color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }}>
          {lang === "en" ? (WEAPON_LORE_EN[item.name] || item.lore) : item.lore}
        </div>
      )}

      {item.noTrade && (
        <div style={{ textAlign: "center", fontSize: 9, color: "#E8425A", marginTop: 8 }}>
          {t("itemTooltip.noTrade")}
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
