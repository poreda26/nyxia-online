import { useState, useMemo } from "react";
import { Wand2 } from "lucide-react";
import { CLASSES } from "../data/classes";
import { SLOTS } from "../data/armor";
import { ACCESSORY_SLOT_LABEL } from "../utils/itemDisplay";
import { gmWeaponTemplates, gmBuildWeaponById, gmArmorTemplates, gmBuildArmor, gmAccessoryTemplates, gmBuildAccessory } from "../utils/loot";
import { MAX_UPGRADE_LEVEL } from "../utils/upgrade";
import { addItemToInventory } from "../utils/inventory";
import { styles } from "../styles";

const ACCESSORY_SLOTS = ["necklace", "belt", "ring", "earring"];

// GM'in "istediği eşyayı istediği + seviyesinde" almasını sağlayan basit
// panel — /silah, /zırh, /aksesuar komutlarının aksine RASTGELE değil, tam
// seçim yapılıyor (bkz. utils/loot.js#gmBuildWeaponById vb.). Sadece
// ChatTab'ta player.isGM iken render edilir.
export default function GmItemPanel({ player, setPlayer, pushToast }) {
  const [kind, setKind] = useState("weapon");
  const [cls, setCls] = useState(player.class);
  const [slot, setSlot] = useState(SLOTS[0].key);
  const [accSlot, setAccSlot] = useState(ACCESSORY_SLOTS[0]);
  const [weaponId, setWeaponId] = useState("");
  const [armorTier, setArmorTier] = useState(1);
  const [accTier, setAccTier] = useState(1);
  const [level, setLevel] = useState(1);

  const weaponOptions = useMemo(() => (kind === "weapon" ? gmWeaponTemplates(cls) : []), [kind, cls]);
  const armorOptions = useMemo(() => (kind === "armor" ? gmArmorTemplates(cls, slot) : []), [kind, cls, slot]);
  const accOptions = useMemo(() => (kind === "accessory" ? gmAccessoryTemplates(accSlot) : []), [kind, accSlot]);

  const effectiveWeaponId = weaponId || weaponOptions[0]?.id || "";

  // Gerçek KO ekran görüntüsünden birebir +1..+10 girilmiş eşyalar (bkz.
  // utils/loot.js#gmWeaponTemplates'in maxLevel alanı) MAX_UPGRADE_LEVEL'ı
  // (oyunun asıl forge tavanı, +8) aşabilir — GM önden test edebilsin diye.
  // Diğer her şey her zamanki gibi +8'de kalıyor.
  const selectedMaxLevel = kind === "weapon"
    ? (weaponOptions.find((w) => w.id === effectiveWeaponId)?.maxLevel ?? MAX_UPGRADE_LEVEL)
    : kind === "armor"
    ? (armorOptions.find((a) => a.tier === armorTier)?.levels?.length ?? MAX_UPGRADE_LEVEL)
    : (accOptions.find((a) => a.tier === accTier)?.levels?.length ?? MAX_UPGRADE_LEVEL);
  const upgradeLevels = useMemo(() => Array.from({ length: selectedMaxLevel + 1 }, (_, i) => i), [selectedMaxLevel]);
  const effectiveLevel = Math.min(level, selectedMaxLevel);

  const give = () => {
    let item = null;
    if (kind === "weapon") {
      if (!effectiveWeaponId) return;
      item = gmBuildWeaponById(cls, effectiveWeaponId, effectiveLevel);
    } else if (kind === "armor") {
      item = gmBuildArmor(cls, slot, armorTier, effectiveLevel);
    } else {
      item = gmBuildAccessory(accSlot, accTier, effectiveLevel);
    }
    if (!item) { pushToast("Bu kombinasyon için eşya bulunamadı.", "warn"); return; }
    const result = addItemToInventory(player, item);
    setPlayer(result.player);
    pushToast(result.added ? `${item.name} +${effectiveLevel} verildi.` : `${item.name} verilemedi — ${result.reason}`, result.added ? "loot" : "warn");
  };

  // Test sırasında ağırlık kapasitesini hızlıca boşaltmak için — sadece
  // çantayı (player.inventory) temizler, kuşanılmış eşyalara ve depoya
  // dokunmaz.
  const clearInventory = () => {
    setPlayer({ ...player, inventory: [] });
    pushToast("Çanta temizlendi.", "loot");
  };

  return (
    <div style={styles.pickerCard}>
      <div style={{ fontSize: 10, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 6 }}>
        <Wand2 size={12} /> GM Eşya Üretici
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {[["weapon", "Silah"], ["armor", "Zırh"], ["accessory", "Aksesuar"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            style={{ ...styles.tinyBtn, flex: 1, background: kind === k ? undefined : "var(--bg-panel-alt)", color: kind === k ? undefined : "var(--text-muted)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {(kind === "weapon" || kind === "armor") && (
        <select value={cls} onChange={(e) => setCls(e.target.value)} style={styles.selectInput}>
          {Object.keys(CLASSES).map((c) => <option key={c} value={c}>{CLASSES[c].name}</option>)}
        </select>
      )}

      {kind === "armor" && (
        <select value={slot} onChange={(e) => setSlot(e.target.value)} style={styles.selectInput}>
          {SLOTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      )}

      {kind === "accessory" && (
        <select value={accSlot} onChange={(e) => setAccSlot(e.target.value)} style={styles.selectInput}>
          {ACCESSORY_SLOTS.map((s) => <option key={s} value={s}>{ACCESSORY_SLOT_LABEL[s]}</option>)}
        </select>
      )}

      {kind === "weapon" && (
        <select value={effectiveWeaponId} onChange={(e) => setWeaponId(e.target.value)} style={styles.selectInput}>
          {weaponOptions.map((w) => (
            <option key={w.id} value={w.id}>
              T{w.tier} · {w.name} {w.atk ? `(ATK ${w.atk})` : `(DEF ${w.def})`}
            </option>
          ))}
        </select>
      )}

      {kind === "armor" && (
        <select value={armorTier} onChange={(e) => setArmorTier(parseInt(e.target.value, 10))} style={styles.selectInput}>
          {armorOptions.map((a) => (
            <option key={a.tier} value={a.tier}>T{a.tier} · {a.name} (DEF {a.def})</option>
          ))}
        </select>
      )}

      {kind === "accessory" && (
        <select value={accTier} onChange={(e) => setAccTier(parseInt(e.target.value, 10))} style={styles.selectInput}>
          {accOptions.map((a) => (
            <option key={a.tier} value={a.tier}>
              T{a.tier} · {a.name} ({Object.entries(a.statBonus).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(" · ")})
            </option>
          ))}
        </select>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Yükseltme:</span>
        <select value={effectiveLevel} onChange={(e) => setLevel(parseInt(e.target.value, 10))} style={{ ...styles.selectInput, width: 80 }}>
          {upgradeLevels.map((lv) => <option key={lv} value={lv}>+{lv}</option>)}
        </select>
        {selectedMaxLevel > MAX_UPGRADE_LEVEL && (
          <span style={{ fontSize: 9, color: "#D4AF6A" }}>+{MAX_UPGRADE_LEVEL}'den sonrası henüz oyunda yok, test için</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button style={{ ...styles.tinyBtn, flex: 1 }} onClick={give}>Ver</button>
        <button
          style={{ ...styles.tinyBtn, flex: 1, background: "#E8425A", color: "#fff" }}
          onClick={clearInventory}
        >
          Envanteri Temizle
        </button>
      </div>
    </div>
  );
}
