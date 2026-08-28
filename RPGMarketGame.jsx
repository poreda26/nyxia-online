import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sword, Shield, Heart, Zap, Package, Store, User, Lock,
  Sparkles, Coins, ChevronRight, X, Flame, Skull, ArrowLeft,
  CheckCircle2, TrendingUp, Gift, Wand2, ShieldHalf,
  Gem, Link2, CircleDot, ScrollText, ArrowUpCircle, Repeat, Ban
} from "lucide-react";

/* ============================================================
   DESIGN TOKENS
   Void-black hub with a 5-color tier spectrum (mist teal ->
   chaos crimson) that reads as a literal power gradient. The
   signature element is the vertical Tier Ladder in the
   Character tab, and the chest-crack reveal ritual in Envanter.
   ============================================================ */

const TIERS = [
  {
    id: 1, name: "Sisli Vadi", short: "T1", unlockLevel: 1,
    color: "#5FA8A0", glow: "rgba(95,168,160,0.45)",
    monsters: [
      { id: "sis_kurdu", name: "Sis Kurdu", hp: 42, atk: 7, def: 2, xp: 18, goldMin: 4, goldMax: 9 },
      { id: "kabuklu_golem", name: "Kabuklu Golem", hp: 60, atk: 6, def: 5, xp: 24, goldMin: 6, goldMax: 12 },
    ],
  },
  {
    id: 2, name: "Kül Kanyonu", short: "T2", unlockLevel: 15,
    color: "#C97A3D", glow: "rgba(201,122,61,0.45)",
    monsters: [
      { id: "kul_yaratigi", name: "Kül Yaratığı", hp: 130, atk: 16, def: 8, xp: 55, goldMin: 14, goldMax: 26 },
      { id: "volkan_suru", name: "Volkan Sürüngeni", hp: 165, atk: 14, def: 11, xp: 68, goldMin: 18, goldMax: 32 },
    ],
  },
  {
    id: 3, name: "Gölge Ormanı", short: "T3", unlockLevel: 30,
    color: "#8B6FC9", glow: "rgba(139,111,201,0.45)",
    monsters: [
      { id: "golge_savasci", name: "Gölge Savaşçısı", hp: 280, atk: 28, def: 16, xp: 130, goldMin: 32, goldMax: 54 },
      { id: "siyah_sarmasik", name: "Siyah Sarmaşık", hp: 340, atk: 24, def: 20, xp: 150, goldMin: 38, goldMax: 62 },
    ],
  },
  {
    id: 4, name: "Kristal Zindan", short: "T4", unlockLevel: 45,
    color: "#4FC3D9", glow: "rgba(79,195,217,0.45)",
    monsters: [
      { id: "kristal_muhafiz", name: "Kristal Muhafız", hp: 520, atk: 42, def: 30, xp: 260, goldMin: 60, goldMax: 96 },
      { id: "arkane_avci", name: "Arkane Avcı", hp: 470, atk: 48, def: 24, xp: 275, goldMin: 66, goldMax: 104 },
    ],
  },
  {
    id: 5, name: "Kaos Tapınağı", short: "T5", unlockLevel: 60,
    color: "#C9425A", glow: "rgba(201,66,90,0.5)",
    monsters: [
      { id: "kaos_iblisi", name: "Kaos İblisi", hp: 900, atk: 68, def: 40, xp: 480, goldMin: 110, goldMax: 170 },
      { id: "kiyamet_ejderha", name: "Kıyamet Ejderhası", hp: 1150, atk: 74, def: 46, xp: 560, goldMin: 140, goldMax: 210 },
    ],
  },
];

const SLOTS = [
  { key: "head", label: "Kask", icon: Shield },
  { key: "chest", label: "Göğüslük", icon: ShieldHalf },
  { key: "legs", label: "Don/Bacaklık", icon: Shield },
  { key: "gauntlets", label: "Eldiven", icon: Shield },
  { key: "boots", label: "Bot", icon: Shield },
];

// Paperdoll grid, 3 columns — mirrors the reference inventory screenshot's
// dense icon-grid feel but arranged anatomically (earrings flank the head,
// rings flank the necklace, weapons flank the chest). `null` = spacer cell.
const PAPERDOLL_LAYOUT = [
  { key: "earring1", label: "Küpe 1", icon: CircleDot },
  { key: "head", label: "Kask", icon: Shield },
  { key: "earring2", label: "Küpe 2", icon: CircleDot },

  { key: "mainHand", label: "Ana El", icon: Sword },
  { key: "chest", label: "Göğüslük", icon: ShieldHalf },
  { key: "offHand", label: "Yrd. El", icon: ShieldHalf },

  { key: "ring1", label: "Yüzük 1", icon: Gem },
  { key: "necklace", label: "Kolye", icon: Link2 },
  { key: "ring2", label: "Yüzük 2", icon: Gem },

  { key: "gauntlets", label: "Eldiven", icon: Shield },
  { key: "legs", label: "Bacaklık", icon: Shield },
  { key: "belt", label: "Kemer", icon: Link2 },

  null,
  { key: "boots", label: "Bot", icon: Shield },
  null,
];

// Item rarity color scale, keyed by tier. This is what codes ARMOR and
// WEAPON items — separate from the biome color used for regions/monsters.
const ITEM_TIER_COLORS = {
  1: "#E7E7E4", // white — common
  2: "#3FCB6B", // green — uncommon
  3: "#4A90E2", // blue — rare
  4: "#B368F7", // purple — epic
  5: "#F5A623", // orange — legendary
};
function itemTierColor(tierId) { return ITEM_TIER_COLORS[tierId] || "#9CA1B0"; }
const ITEM_TIER_LABEL = { 1: "Sıradan", 2: "Nadide", 3: "Nadir", 4: "Efsanevi Öncesi", 5: "Efsanevi" };

// Per-class weapon catalog. Warriors get the richest set (two-handers,
// dual-wield combos, and a spear+shield tank line); every class has more
// distinct weapon names than there are armor slots (5).
const WEAPON_CATALOG = {
  warrior: {
    twoHand: ["Geniş Kılıç", "Savaş Baltası", "Savaş Çekici", "İki Elli Mızrak"],
    mainHand: ["Tek Elli Kılıç", "Mızrak", "Savaş Baltası"],
    offHandWeapon: ["Tek Elli Kılıç", "El Baltası", "Hançer"],
    offHandShield: ["Kalkan", "Kule Kalkanı", "Tokmak Kalkan"],
  },
  rogue: {
    twoHand: ["Uzun Yay", "Avcı Yayı", "Savaş Yayı"],
    mainHand: ["Hançer", "Kısa Kılıç"],
    offHandWeapon: ["Hançer", "Kısa Kılıç"],
    offHandShield: [],
  },
  mage: {
    twoHand: ["Büyü Asası", "Arkane Asa", "Kristal Asa"],
    mainHand: ["Değnek"],
    offHandWeapon: ["Büyü Kitabı", "Grimoire", "Kristal Küre"],
    offHandShield: [],
  },
  priest: {
    twoHand: [],
    mainHand: ["Kutsal Çekiç", "Topuz", "Savaş Topuzu", "Asa Değnek"],
    offHandWeapon: ["Kutsal Tılsım"],
    offHandShield: ["Kalkan", "Kutsal Kalkan"],
  },
};

const CLASSES = {
  warrior: { name: "Warrior", icon: Sword, color: "#C97A3D", atk: 13, def: 9, maxHp: 130, maxMp: 20, crit: 0.05, desc: "Kalın zırh, sağlam yumruk. Ön safta durur." },
  rogue: { name: "Rogue", icon: Wand2, color: "#8B6FC9", atk: 15, def: 5, maxHp: 95, maxMp: 30, crit: 0.28, desc: "Hızlı, ölümcül kritikler. Kırılgan ama acımasız." },
  mage: { name: "Mage", icon: Sparkles, color: "#4FC3D9", atk: 19, def: 3, maxHp: 75, maxMp: 65, crit: 0.10, desc: "Yüksek hasar, düşük can. Mana yönetimi şart." },
  priest: { name: "Priest", icon: Heart, color: "#5FA8A0", atk: 10, def: 4, maxHp: 90, maxMp: 70, crit: 0.06, desc: "Dengeli, dayanıklı, kendini iyileştirir." },
};

// Each class has its own armor theme, so a dropped piece visibly belongs
// to a class (Warrior plate vs. Mage robe) — this is what makes armor
// class-locked and tradeable when it drops for the "wrong" class.
const ARMOR_NAMES_BY_CLASS = {
  warrior: {
    head: ["Miğfer", "Savaş Başlığı", "Demir Kask"],
    chest: ["Plaka Göğüslük", "Zırh Gövdesi", "Demir Zırh"],
    legs: ["Plaka Bacaklık", "Zırh Eteği", "Demir Dizlik"],
    gauntlets: ["Plaka Eldiven", "Zırh Kolluğu", "Demir Pençelik"],
    boots: ["Plaka Bot", "Çelik Çizme", "Ağır Bot"],
  },
  rogue: {
    head: ["Deri Kukuleta", "Gölge Başlığı", "Suikastçı Maskesi"],
    chest: ["Deri Yelek", "Gölge Cübbesi", "Suikastçı Zırhı"],
    legs: ["Deri Pantolon", "Gölge Tozluğu", "Suikastçı Bacaklığı"],
    gauntlets: ["Deri Eldiven", "Gölge Kolluğu", "İnce Pençelik"],
    boots: ["Sessiz Bot", "Deri Çizme", "Gölge Ayakkabısı"],
  },
  mage: {
    head: ["Sivri Şapka", "Büyücü Başlığı", "Arkane Taç"],
    chest: ["Cübbe", "Büyücü Cübbesi", "Arkane Elbise"],
    legs: ["Cübbe Eteği", "Büyücü Peştamalı", "Arkane Don"],
    gauntlets: ["Kumaş Eldiven", "Büyücü Kolluğu", "Arkane Bilezik"],
    boots: ["Kumaş Ayakkabı", "Büyücü Sandaleti", "Arkane Terlik"],
  },
  priest: {
    head: ["Kutsal Başlık", "Rahip Serpuşu", "Nur Tacı"],
    chest: ["Kutsal Cübbe", "Rahip Elbisesi", "Nur Zırhı"],
    legs: ["Kutsal Eteklik", "Rahip Peştamalı", "Nur Donu"],
    gauntlets: ["Kutsal Eldiven", "Rahip Kolluğu", "Nur Bilezik"],
    boots: ["Kutsal Sandalet", "Rahip Çarığı", "Nur Terliği"],
  },
};

const ACCESSORY_NAMES = {
  necklace: ["Kolye", "Gerdanlık", "Muska"],
  belt: ["Kemer", "Kuşak", "Bel Bağı"],
  ring: ["Yüzük", "Mühür Yüzüğü", "Halka"],
  earring: ["Küpe", "Kulak Halkası"],
};

const TIER_PREFIX = {
  1: ["Sisli", "Puslu", "Solgun"],
  2: ["Külden", "Kavrulmuş", "Volkanik"],
  3: ["Gölgeli", "Karanlık", "Sessiz"],
  4: ["Kristal", "Arkane", "Parıldayan"],
  5: ["Kaotik", "Kıyamet", "Şeytani"],
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 10); }

function rollArmor(tierId, forceClass) {
  // Armor drops for a RANDOM class, not necessarily the player's own —
  // this is what creates cross-class loot that needs to be traded away.
  // forceClass lets the Trade Post hand back a same-class replacement.
  const dropClass = forceClass || pick(Object.keys(CLASSES));
  const slot = pick(SLOTS).key;
  const baseIp = tierId * 10;
  const ip = baseIp + rand(-2, 4);
  const def = Math.round(ip * 0.6) + rand(-1, 2);
  const name = `${pick(TIER_PREFIX[tierId])} ${pick(ARMOR_NAMES_BY_CLASS[dropClass][slot])}`;
  return { id: uid(), kind: "armor", slot, tier: tierId, class: dropClass, name, ip, atk: 0, def, upgradeLevel: 0 };
}

function rollWeapon(tierId, cls) {
  const catalog = WEAPON_CATALOG[cls];
  const categories = Object.keys(catalog).filter((k) => catalog[k].length > 0);
  const cat = pick(categories);
  const baseName = pick(catalog[cat]);
  const baseIp = tierId * 10;
  const ip = baseIp + rand(-2, 4);
  let atk = 0, def = 0, weaponSlot = "mainHand", isShield = false;

  if (cat === "twoHand") { weaponSlot = "twoHand"; atk = Math.round(ip * 1.1) + rand(0, 4); }
  else if (cat === "mainHand") { weaponSlot = "mainHand"; atk = Math.round(ip * 0.8) + rand(0, 3); }
  else if (cat === "offHandWeapon") { weaponSlot = "offHand"; atk = Math.round(ip * 0.5) + rand(0, 2); }
  else if (cat === "offHandShield") { weaponSlot = "offHand"; isShield = true; def = Math.round(ip * 0.9) + rand(0, 3); }

  const name = `${pick(TIER_PREFIX[tierId])} ${baseName}`;
  return { id: uid(), kind: "weapon", weaponSlot, isShield, cls, tier: tierId, name, ip, atk, def, upgradeLevel: 0 };
}

// Accessories are universal — any class can wear a ring, earring, necklace
// or belt, so they never need a class lock or trade detour.
function rollAccessory(tierId) {
  const slotType = pick(["necklace", "belt", "ring", "earring"]);
  const baseIp = Math.round(tierId * 7);
  const ip = baseIp + rand(-1, 3);
  const isAtkFlavor = Math.random() < 0.5;
  const atk = isAtkFlavor ? Math.round(ip * 0.4) + rand(0, 2) : 0;
  const def = !isAtkFlavor ? Math.round(ip * 0.4) + rand(0, 2) : 0;
  const name = `${pick(TIER_PREFIX[tierId])} ${pick(ACCESSORY_NAMES[slotType])}`;
  return { id: uid(), kind: "accessory", slot: slotType, tier: tierId, name, ip, atk, def, upgradeLevel: 0 };
}

// Single entry point used by both monster drops and chest openings so the
// loot table only lives in one place: ~38% weapon (own class, always
// usable), ~34% armor (random class — the trade bait), ~28% accessory.
function rollLoot(tierId, playerClass) {
  const r = Math.random();
  if (r < 0.38) return rollWeapon(tierId, playerClass);
  if (r < 0.72) return rollArmor(tierId);
  return rollAccessory(tierId);
}

function xpToNext(level) { return Math.round(80 * Math.pow(level, 1.35)); }

function initialPlayer(cls) {
  const base = CLASSES[cls];
  return {
    class: cls,
    level: 1,
    xp: 0,
    gold: 60,
    hp: base.maxHp,
    mp: base.maxMp,
    equipped: {
      head: null, chest: null, legs: null, gauntlets: null, boots: null,
      mainHand: null, offHand: null,
      necklace: null, belt: null, ring1: null, ring2: null, earring1: null, earring2: null,
    },
    inventory: [],
    chests: [],
    potions: { hp: 3, mp: 2 },
    scrolls: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

const ALL_EQUIP_KEYS = [
  "head", "chest", "legs", "gauntlets", "boots", "mainHand", "offHand",
  "necklace", "belt", "ring1", "ring2", "earring1", "earring2",
];

function totalStats(player) {
  let ip = 0, def = 0, atk = 0;
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (it) { ip += it.ip || 0; def += it.def || 0; atk += it.atk || 0; }
  });
  return { ip, def, atk };
}

function sellPrice(item) {
  return Math.round((item.ip || 0) * 1.4 + (item.atk || 0) * 1.3 + (item.def || 0) * 1.1);
}

function displayItemName(item) {
  return item.upgradeLevel ? `${item.name} +${item.upgradeLevel}` : item.name;
}

// Equip an item into the correct slot(s), handling two-handed weapons
// (which occupy both hands), paired ring/earring slots, and class-locked
// armor. Returns { player, blocked } — blocked carries a reason string
// when the equip was refused so the caller can toast it.
function equipItem(player, item) {
  if (item.kind === "armor" && item.class !== player.class) {
    return { player, blocked: `Bu eşya ${CLASSES[item.class].name} sınıfına özel — kuşanamazsın.` };
  }

  let inv = player.inventory.filter((i) => i.id !== item.id);
  let equipped = { ...player.equipped };

  if (item.kind === "weapon" && item.weaponSlot === "twoHand") {
    if (equipped.mainHand) inv.push(equipped.mainHand);
    if (equipped.offHand) inv.push(equipped.offHand);
    equipped.mainHand = item;
    equipped.offHand = null;
  } else if (item.kind === "weapon" && item.weaponSlot === "mainHand") {
    if (equipped.mainHand) inv.push(equipped.mainHand);
    equipped.mainHand = item;
  } else if (item.kind === "weapon" && item.weaponSlot === "offHand") {
    if (equipped.mainHand && equipped.mainHand.weaponSlot === "twoHand") {
      inv.push(equipped.mainHand);
      equipped.mainHand = null;
    }
    if (equipped.offHand) inv.push(equipped.offHand);
    equipped.offHand = item;
  } else if (item.kind === "accessory" && item.slot === "ring") {
    const target = !equipped.ring1 ? "ring1" : (!equipped.ring2 ? "ring2" : "ring1");
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else if (item.kind === "accessory" && item.slot === "earring") {
    const target = !equipped.earring1 ? "earring1" : (!equipped.earring2 ? "earring2" : "earring1");
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else {
    const slotKey = item.slot; // armor slot, or 'necklace' / 'belt'
    if (equipped[slotKey]) inv.push(equipped[slotKey]);
    equipped[slotKey] = item;
  }
  return { player: { ...player, inventory: inv, equipped }, blocked: null };
}

// Consumes one matching-tier Upgrade Scroll + gold to boost an item's
// stats in place, wherever it lives (bag or already equipped).
function upgradeItemInPlayer(player, item, location) {
  const tier = item.tier;
  const scrollCost = 1;
  const goldCost = tier * 15;
  const bumped = {
    ...item,
    upgradeLevel: (item.upgradeLevel || 0) + 1,
    ip: Math.round(item.ip * 1.18),
    atk: item.atk ? Math.round(item.atk * 1.18) : 0,
    def: item.def ? Math.round(item.def * 1.18) : 0,
  };
  let np = { ...player, gold: player.gold - goldCost, scrolls: { ...player.scrolls, [tier]: player.scrolls[tier] - scrollCost } };
  if (location.where === "bag") {
    np.inventory = player.inventory.map((i) => (i.id === item.id ? bumped : i));
  } else {
    np.equipped = { ...player.equipped, [location.slotKey]: bumped };
  }
  return np;
}

/* ============================================================
   ROOT
   ============================================================ */

export default function RPGMarketGame() {
  const [screen, setScreen] = useState("classSelect");
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("battle");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const pushToast = useCallback((msg, tone = "default") => {
    setToast({ msg, tone, id: uid() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const chooseClass = (cls) => {
    setPlayer(initialPlayer(cls));
    setScreen("hub");
  };

  return (
    <div style={styles.appRoot}>
      <GlobalStyle />
      {screen === "classSelect" && <ClassSelect onChoose={chooseClass} />}
      {screen === "hub" && player && (
        <Hub
          player={player}
          setPlayer={setPlayer}
          tab={tab}
          setTab={setTab}
          pushToast={pushToast}
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CLASS SELECT
   ============================================================ */

function ClassSelect({ onChoose }) {
  const [hovered, setHovered] = useState("warrior");
  const active = CLASSES[hovered];
  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>YENİ MACERA</div>
        <h1 style={styles.h1}>Bir sınıf seç.</h1>
        <p style={styles.subtext}>Zindanlara ineceksin, zırh toplayacaksın, pazarda satacaksın.</p>
      </div>

      <div style={styles.classGrid}>
        {Object.entries(CLASSES).map(([key, c]) => {
          const Icon = c.icon;
          const isActive = hovered === key;
          return (
            <button
              key={key}
              onMouseEnter={() => setHovered(key)}
              onClick={() => onChoose(key)}
              style={{
                ...styles.classCard,
                borderColor: isActive ? c.color : "var(--border)",
                boxShadow: isActive ? `0 0 0 1px ${c.color}, 0 12px 32px -12px ${c.color}66` : "none",
                transform: isActive ? "translateY(-3px)" : "none",
              }}
            >
              <Icon size={26} color={c.color} strokeWidth={1.75} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 0.3, marginTop: 10 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{c.desc}</div>
              <div style={styles.classStatRow}>
                <StatPill label="ATK" value={c.atk} />
                <StatPill label="DEF" value={c.def} />
                <StatPill label="HP" value={c.maxHp} />
                <StatPill label="MP" value={c.maxMp} />
              </div>
            </button>
          );
        })}
      </div>

      <button
        style={{ ...styles.primaryBtn, marginTop: 28, alignSelf: "center", background: active.color }}
        onClick={() => onChoose(hovered)}
      >
        {active.name} olarak başla <ChevronRight size={16} />
      </button>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={styles.statPill}>
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

/* ============================================================
   HUB (tab shell)
   ============================================================ */

function Hub({ player, setPlayer, tab, setTab, pushToast }) {
  const cls = CLASSES[player.class];
  const { ip, def, atk } = totalStats(player);

  return (
    <div style={styles.hubRoot}>
      <TopBar player={player} cls={cls} ip={ip} def={def} atk={atk} />

      <div style={styles.tabContent}>
        {tab === "battle" && (
          <BattleTab player={player} setPlayer={setPlayer} cls={cls} ip={ip} def={def} atk={atk} pushToast={pushToast} />
        )}
        {tab === "inventory" && (
          <InventoryTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "market" && (
          <MarketTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "upgrade" && (
          <UpgradeTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "character" && (
          <CharacterTab player={player} cls={cls} ip={ip} def={def} atk={atk} />
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

function TopBar({ player, cls, ip, def, atk }) {
  const need = xpToNext(player.level);
  const pct = Math.min(100, (player.xp / need) * 100);
  const Icon = cls.icon;
  return (
    <div style={styles.topBar}>
      <div style={styles.topBarRow}>
        <div style={styles.classBadge}>
          <Icon size={16} color={cls.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: 0.3 }}>
              {cls.name} · Lv.{player.level}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              {player.xp}/{need} XP
            </span>
          </div>
          <div style={styles.xpTrack}>
            <div style={{ ...styles.xpFill, width: `${pct}%`, background: cls.color }} />
          </div>
        </div>
        <div style={styles.goldChip}>
          <Coins size={13} color="#D4AF6A" />
          <span style={{ fontFamily: "var(--font-mono)" }}>{player.gold}</span>
        </div>
      </div>
      <div style={styles.topBarSub}>
        <span>ATK {atk}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>IP {ip}</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>DEF {def}</span>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { key: "battle", label: "Savaş", icon: Sword },
    { key: "inventory", label: "Envanter", icon: Package },
    { key: "market", label: "Pazar", icon: Store },
    { key: "upgrade", label: "Yükselt", icon: ArrowUpCircle },
    { key: "character", label: "Karakter", icon: User },
  ];
  return (
    <div style={styles.bottomNav}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)} style={styles.navBtn}>
            <Icon size={19} strokeWidth={active ? 2.25 : 1.6} color={active ? "var(--text-primary)" : "var(--text-faint)"} />
            <span style={{ fontSize: 10, marginTop: 3, color: active ? "var(--text-primary)" : "var(--text-faint)", letterSpacing: 0.2 }}>
              {it.label}
            </span>
            {active && <div style={styles.navActiveDot} />}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   BATTLE TAB
   ============================================================ */

function BattleTab({ player, setPlayer, cls, ip, def, atk, pushToast }) {
  const [tierIdx, setTierIdx] = useState(() => {
    // default to highest unlocked tier
    let idx = 0;
    TIERS.forEach((t, i) => { if (player.level >= t.unlockLevel) idx = i; });
    return idx;
  });
  const [monster, setMonster] = useState(null); // active monster template
  const [battle, setBattle] = useState(null); // {monsterHp, monsterMaxHp, log, playerHp}
  const [shake, setShake] = useState(null); // 'player' | 'monster' | null
  const logRef = useRef(null);

  const tier = TIERS[tierIdx];
  const locked = player.level < tier.unlockLevel;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battle?.log?.length]);

  // Guards the "attack spam" bug: without this, rapid clicks fired several
  // attack() calls before React committed the monster's death, so a single
  // burst of clicks could trigger loot/level-up multiple times off one kill
  // (or land hits on a monster that was already dead). attackLockRef blocks
  // re-entrant calls synchronously; battle.finished blocks any call that
  // arrives after the kill/defeat is already resolved but before the arena
  // closes.
  const attackLockRef = useRef(false);

  const startBattle = (m) => {
    attackLockRef.current = false;
    setMonster(m);
    setBattle({
      monsterHp: m.hp,
      monsterMaxHp: m.hp,
      finished: false,
      log: [`${m.name} karşına çıktı.`],
    });
  };

  const endBattle = () => { attackLockRef.current = false; setMonster(null); setBattle(null); };

  const addLog = (b, line) => { b.log = [...b.log.slice(-24), line]; };

  const applyLoot = (m) => {
    setPlayer((p) => {
      let np = { ...p, inventory: [...p.inventory], chests: [...p.chests], scrolls: { ...p.scrolls } };
      const goldGain = rand(m.goldMin, m.goldMax);
      const xpGain = m.xp;
      np.gold += goldGain;
      np.xp += xpGain;

      let drops = [`+${goldGain} altın`, `+${xpGain} XP`];

      if (Math.random() < 0.15) {
        const item = rollLoot(tier.id, np.class);
        np.inventory.push(item);
        const kindLabel = item.kind === "weapon" ? "Silah" : item.kind === "accessory" ? "Aksesuar" : "Zırh";
        drops.push(`${kindLabel} düştü: ${item.name}`);
      }
      if (Math.random() < 0.05) {
        const chest = { id: uid(), tier: tier.id };
        np.chests.push(chest);
        drops.push(`Sandık düştü! (T${tier.id})`);
      }
      if (Math.random() < 0.06) {
        np.scrolls[tier.id] = (np.scrolls[tier.id] || 0) + 1;
        drops.push(`T${tier.id} Yükseltme Parşömeni düştü!`);
      }

      // level up loop
      let leveled = false;
      while (np.xp >= xpToNext(np.level)) {
        np.xp -= xpToNext(np.level);
        np.level += 1;
        leveled = true;
      }
      if (leveled) {
        const base = CLASSES[np.class];
        np.hp = base.maxHp + Math.round(np.level * 1.2);
        np.mp = base.maxMp + Math.round(np.level * 0.6);
        drops.push(`Seviye atladın! Lv.${np.level}`);
      }

      pushToast(drops.join("  ·  "), leveled ? "level" : "loot");
      return np;
    });
  };

  const attack = () => {
    if (attackLockRef.current) return;
    if (!battle || battle.finished || player.hp <= 0) return;
    attackLockRef.current = true;

    setBattle((b) => {
      if (!b || b.finished) { attackLockRef.current = false; return b; }
      const nb = { ...b };
      const isCrit = Math.random() < cls.crit;
      let dmg = Math.max(1, Math.round((cls.atk + atk * 0.9 + ip * 0.2) * (isCrit ? 1.8 : 1) - monster.def * 0.4 + rand(-2, 3)));
      nb.monsterHp = Math.max(0, nb.monsterHp - dmg);
      addLog(nb, isCrit ? `Kritik vuruş! ${dmg} hasar verdin.` : `${dmg} hasar verdin.`);
      setShake("monster");
      setTimeout(() => setShake(null), 260);

      if (nb.monsterHp <= 0) {
        nb.finished = true;
        addLog(nb, `${monster.name} yenildi.`);
        // lock stays engaged through this window so extra clicks can't
        // trigger a second loot/level-up off the same kill
        setTimeout(() => { applyLoot(monster); endBattle(); }, 700);
        return nb;
      }

      // monster counter
      const mdmg = Math.max(1, Math.round(monster.atk - def * 0.45 + rand(-2, 3)));
      let playerDied = false;
      setPlayer((p) => {
        const nhp = Math.max(0, p.hp - mdmg);
        if (nhp <= 0) playerDied = true;
        return { ...p, hp: nhp };
      });
      addLog(nb, `${monster.name} sana ${mdmg} hasar verdi.`);
      setShake("player");
      setTimeout(() => setShake(null), 260);

      if (playerDied) {
        nb.finished = true;
        setTimeout(() => {
          pushToast("Bayıldın... Kasabaya taşındın, canın kısmen yenilendi.", "warn");
          endBattle();
        }, 500);
      } else {
        // normal exchange resolved — release the lock after a short cooldown
        // so combat still feels turn-paced instead of instant multi-hits
        setTimeout(() => { attackLockRef.current = false; }, 320);
      }
      return nb;
    });
  };

  const usePotion = (kind) => {
    setPlayer((p) => {
      if (p.potions[kind] <= 0) { pushToast("Pot kalmadı.", "warn"); return p; }
      const base = CLASSES[p.class];
      const maxStat = kind === "hp" ? base.maxHp + Math.round(p.level * 1.2) : base.maxMp + Math.round(p.level * 0.6);
      const healAmt = Math.round(maxStat * 0.4);
      const cur = kind === "hp" ? p.hp : p.mp;
      const next = Math.min(maxStat, cur + healAmt);
      pushToast(kind === "hp" ? `+${next - cur} can` : `+${next - cur} mana`, "heal");
      return { ...p, [kind]: next, potions: { ...p.potions, [kind]: p.potions[kind] - 1 } };
    });
  };

  const base = CLASSES[player.class];
  const playerMaxHp = base.maxHp + Math.round(player.level * 1.2);
  const playerMaxMp = base.maxMp + Math.round(player.level * 0.6);
  const playerDead = player.hp <= 0;

  return (
    <div style={styles.panelScroll}>
      {!monster && (
        <>
          <SectionLabel>Bölge seç</SectionLabel>
          <div style={styles.tierScroller}>
            {TIERS.map((t, i) => {
              const tlocked = player.level < t.unlockLevel;
              const isSel = i === tierIdx;
              return (
                <button
                  key={t.id}
                  onClick={() => !tlocked && setTierIdx(i)}
                  style={{
                    ...styles.tierChip,
                    borderColor: isSel ? t.color : "var(--border)",
                    opacity: tlocked ? 0.45 : 1,
                    background: isSel ? `${t.color}1A` : "var(--bg-panel)",
                  }}
                >
                  {tlocked && <Lock size={11} style={{ marginRight: 4 }} />}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: t.color }}>{t.short}</span>
                  <span style={{ fontSize: 11, marginLeft: 6 }}>{t.name}</span>
                  {tlocked && <span style={{ fontSize: 9, color: "var(--text-faint)", marginLeft: 6 }}>Lv.{t.unlockLevel}</span>}
                </button>
              );
            })}
          </div>

          {locked ? (
            <EmptyState
              icon={Lock}
              title={`${tier.name} kilitli`}
              subtitle={`Bu bölgeye girmek için Lv.${tier.unlockLevel} olman gerekiyor.`}
            />
          ) : (
            <>
              <SectionLabel>{tier.name} · canavarlar</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.monsters.map((m) => (
                  <div key={m.id} style={{ ...styles.monsterCard, borderColor: `${tier.color}44` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...styles.monsterIcon, background: `${tier.color}22`, color: tier.color }}>
                        <Skull size={18} strokeWidth={1.6} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 10, marginTop: 3 }}>
                          <span>HP {m.hp}</span><span>ATK {m.atk}</span><span>DEF {m.def}</span>
                        </div>
                      </div>
                    </div>
                    <button style={{ ...styles.smallBtn, background: tier.color }} onClick={() => startBattle(m)}>
                      Savaşı Başlat
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.dropInfoRow}>
                <span>Drop şansı: Ekipman (Zırh/Silah) %15 · Sandık %5</span>
              </div>
            </>
          )}
        </>
      )}

      {monster && battle && (
        <div style={styles.battleArena}>
          <div className={shake === "monster" ? "shake" : ""} style={{ ...styles.combatant, borderColor: `${tier.color}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{monster.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{battle.monsterHp}/{battle.monsterMaxHp}</span>
            </div>
            <BarTrack pct={(battle.monsterHp / battle.monsterMaxHp) * 100} color={tier.color} />
          </div>

          <div style={styles.vsRow}>
            <Flame size={14} color="var(--text-faint)" />
          </div>

          <div className={shake === "player" ? "shake" : ""} style={{ ...styles.combatant, borderColor: `${cls.color}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{cls.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{player.hp}/{playerMaxHp}</span>
            </div>
            <BarTrack pct={(player.hp / playerMaxHp) * 100} color="#C9425A" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>MP</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>{player.mp}/{playerMaxMp}</span>
            </div>
            <BarTrack pct={(player.mp / playerMaxMp) * 100} color="#4FC3D9" thin />
          </div>

          <div ref={logRef} style={styles.combatLog}>
            {battle.log.map((l, i) => <div key={i} style={styles.combatLogLine}>{l}</div>)}
          </div>

          <div style={styles.battleControls}>
            <button style={{ ...styles.primaryBtn, flex: 1, background: cls.color, opacity: (playerDead || battle.finished) ? 0.5 : 1 }} onClick={attack} disabled={playerDead || battle.finished}>
              <Sword size={15} /> Saldır
            </button>
            <button style={styles.potionBtn} onClick={() => usePotion("hp")}>
              <Heart size={14} color="#C9425A" /> {player.potions.hp}
            </button>
            <button style={styles.potionBtn} onClick={() => usePotion("mp")}>
              <Zap size={14} color="#4FC3D9" /> {player.potions.mp}
            </button>
          </div>
          <button style={styles.ghostBtn} onClick={endBattle}>
            <ArrowLeft size={13} /> Geri Çekil
          </button>
        </div>
      )}
    </div>
  );
}

function BarTrack({ pct, color, thin }) {
  return (
    <div style={{ ...styles.barTrack, height: thin ? 5 : 9 }}>
      <div style={{ ...styles.barFill, width: `${Math.max(0, pct)}%`, background: color }} />
    </div>
  );
}

/* ============================================================
   INVENTORY TAB
   ============================================================ */

const ACCESSORY_SLOT_LABEL = { necklace: "Kolye", belt: "Kemer", ring: "Yüzük", earring: "Küpe" };

function itemSubLabel(item) {
  if (item.kind === "armor") return SLOTS.find((s) => s.key === item.slot)?.label;
  if (item.kind === "accessory") return ACCESSORY_SLOT_LABEL[item.slot];
  if (item.weaponSlot === "twoHand") return "Çift El";
  if (item.weaponSlot === "mainHand") return "Ana El";
  return item.isShield ? "Kalkan" : "Yardımcı El";
}

function itemStatLabel(item) {
  const bits = [];
  if (item.atk) bits.push(`ATK ${item.atk}`);
  if (item.def) bits.push(`DEF ${item.def}`);
  bits.push(`IP ${item.ip}`);
  return bits.join(" · ");
}

function InventoryTab({ player, setPlayer, pushToast }) {
  const [openingChest, setOpeningChest] = useState(null); // {chest, phase, result}
  const [subtab, setSubtab] = useState("armor");

  const equip = (item) => {
    const result = equipItem(player, item);
    if (result.blocked) { pushToast(result.blocked, "warn"); return; }
    setPlayer(result.player);
    pushToast(`${displayItemName(item)} kuşanıldı.`, "default");
  };

  const unequip = (slotKey) => {
    setPlayer((p) => {
      const item = p.equipped[slotKey];
      if (!item) return p;
      return { ...p, equipped: { ...p.equipped, [slotKey]: null }, inventory: [...p.inventory, item] };
    });
  };

  const sellItem = (item) => {
    const price = sellPrice(item);
    setPlayer((p) => ({ ...p, gold: p.gold + price, inventory: p.inventory.filter((i) => i.id !== item.id) }));
    pushToast(`Satıldı: +${price} altın`, "loot");
  };

  const openChest = (chest) => {
    setOpeningChest({ chest, phase: "shaking", result: null });
    setTimeout(() => {
      const item = rollLoot(chest.tier, player.class);
      setOpeningChest({ chest, phase: "reveal", result: item });
      setPlayer((p) => ({ ...p, chests: p.chests.filter((c) => c.id !== chest.id), inventory: [...p.inventory, item] }));
    }, 950);
  };

  const closeChestModal = () => setOpeningChest(null);

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Kuşanılmış</SectionLabel>
      <div style={styles.paperdoll}>
        {PAPERDOLL_LAYOUT.map((s, i) => {
          if (!s) return <div key={`spacer-${i}`} style={styles.paperdollSpacer} />;
          const item = player.equipped[s.key];
          const isLinkedTwoHand = s.key === "offHand" && player.equipped.mainHand?.weaponSlot === "twoHand";
          return (
            <div key={s.key} style={styles.equipSlotCard} onClick={() => item && unequip(s.key)} title={s.label}>
              <s.icon size={15} color={item ? itemTierColor(item.tier) : "var(--text-faint)"} strokeWidth={1.6} />
              <div style={{ fontSize: 8, color: "var(--text-faint)", marginTop: 3 }}>{s.label}</div>
              {item ? (
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: itemTierColor(item.tier), marginTop: 2, lineHeight: 1.3, textAlign: "center" }}>
                  {displayItemName(item)}
                </div>
              ) : isLinkedTwoHand ? (
                <div style={{ fontSize: 8, color: "var(--text-faint)", marginTop: 2 }}>Çift el</div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={styles.subtabRow}>
        <button onClick={() => setSubtab("armor")} style={{ ...styles.subtabBtn, ...(subtab === "armor" ? styles.subtabBtnActive : {}) }}>
          Çanta ({player.inventory.length})
        </button>
        <button onClick={() => setSubtab("chests")} style={{ ...styles.subtabBtn, ...(subtab === "chests" ? styles.subtabBtnActive : {}) }}>
          Sandıklar ({player.chests.length})
        </button>
      </div>

      {subtab === "armor" && (
        player.inventory.length === 0 ? (
          <EmptyState icon={Package} title="Çanta boş" subtitle="Canavar avlayarak zırh, silah ve aksesuar toplayabilirsin." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {player.inventory.map((item) => {
              const locked = item.kind === "armor" && item.class !== player.class;
              return (
                <div key={item.id} style={{ ...styles.itemRow, borderColor: `${itemTierColor(item.tier)}44`, opacity: locked ? 0.75 : 1 }}>
                  <div style={{ ...styles.tierDot, background: itemTierColor(item.tier) }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      {displayItemName(item)}
                      {item.kind === "armor" && (
                        <span style={{ ...styles.classTag, color: CLASSES[item.class].color, borderColor: `${CLASSES[item.class].color}55` }}>
                          {CLASSES[item.class].name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                      T{item.tier} · {itemStatLabel(item)} · {itemSubLabel(item)}
                    </div>
                    {locked && (
                      <div style={{ fontSize: 9, color: "#E8A5AF", marginTop: 3 }}>
                        Sende kullanılamaz — Pazar &gt; Takas'tan değerlendir.
                      </div>
                    )}
                  </div>
                  {locked ? (
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} />
                    </button>
                  ) : (
                    <button style={styles.tinyBtn} onClick={() => equip(item)}>Kuşan</button>
                  )}
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => sellItem(item)}>
                    Sat ({sellPrice(item)}g)
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {subtab === "chests" && (
        player.chests.length === 0 ? (
          <EmptyState icon={Gift} title="Sandık yok" subtitle="Canavarlardan %5 ihtimalle sandık düşer." />
        ) : (
          <div style={styles.chestGrid}>
            {player.chests.map((chest) => (
              <button key={chest.id} onClick={() => openChest(chest)} style={{ ...styles.chestCard, borderColor: `${itemTierColor(chest.tier)}55` }}>
                <Gift size={22} color={itemTierColor(chest.tier)} strokeWidth={1.6} />
                <div style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)", color: itemTierColor(chest.tier) }}>T{chest.tier} Sandık</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>Kırmak için dokun</div>
              </button>
            ))}
          </div>
        )
      )}

      {openingChest && (
        <ChestModal state={openingChest} onClose={closeChestModal} playerClass={player.class} />
      )}
    </div>
  );
}

function ChestModal({ state, onClose, playerClass }) {
  const { chest, phase, result } = state;
  const color = itemTierColor(chest.tier);
  const isLocked = result && result.kind === "armor" && result.class !== playerClass;
  return (
    <div style={styles.modalOverlay} onClick={phase === "reveal" ? onClose : undefined}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {phase === "shaking" && (
          <>
            <div className="chest-shake" style={{ color }}>
              <Gift size={64} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)" }}>
              Sandık açılıyor...
            </div>
          </>
        )}
        {phase === "reveal" && result && (
          <div className="chest-reveal">
            <div className="confetti-wrap">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="confetti-bit" style={{ background: pick([color, "#D4AF6A", "#EDE8DC"]), left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.06}s` }} />
              ))}
            </div>
            <div style={{ color, filter: `drop-shadow(0 0 18px ${color}aa)` }}>
              <Sparkles size={56} strokeWidth={1.3} />
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 18 }}>{result.name}</div>
            {result.kind === "armor" && (
              <span style={{ ...styles.classTag, color: CLASSES[result.class].color, borderColor: `${CLASSES[result.class].color}55`, marginTop: 6 }}>
                {CLASSES[result.class].name} eşyası
              </span>
            )}
            <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              {ITEM_TIER_LABEL[result.tier]}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
              T{result.tier} · {itemStatLabel(result)}
            </div>
            {isLocked && (
              <div style={{ fontSize: 10, color: "#E8A5AF", marginTop: 8, maxWidth: 200, textAlign: "center" }}>
                Bu sende kullanılamaz — Pazar &gt; Takas'tan değerlendirebilirsin.
              </div>
            )}
            <button style={{ ...styles.primaryBtn, marginTop: 22, background: color }} onClick={onClose}>
              Çantaya Ekle <CheckCircle2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MARKET TAB
   ============================================================ */

// NPC market only stocks Tier 1 chests — no chest reselling of any kind.
const NPC_LISTINGS_SEED = [
  { id: "npc1", tier: 1, price: 16, seller: "Gezgin Tüccar" },
  { id: "npc2", tier: 1, price: 19, seller: "Vadi Simsarı" },
  { id: "npc3", tier: 1, price: 22, seller: "Sisli Han Tüccarı" },
  { id: "npc4", tier: 1, price: 25, seller: "Kervan Başı" },
];

function MarketTab({ player, setPlayer, pushToast }) {
  const [npcListings, setNpcListings] = useState(NPC_LISTINGS_SEED);
  const [subtab, setSubtab] = useState("buy");

  const buy = (listing) => {
    if (player.gold < listing.price) { pushToast("Yeterli altının yok.", "warn"); return; }
    setPlayer((p) => ({ ...p, gold: p.gold - listing.price, chests: [...p.chests, { id: uid(), tier: listing.tier }] }));
    setNpcListings((ls) => ls.filter((l) => l.id !== listing.id));
    pushToast(`T${listing.tier} sandık satın alındı.`, "loot");
  };

  const tradeableItems = player.inventory.filter((i) => i.kind === "armor" && i.class !== player.class);

  const tradeForGold = (item) => {
    const price = Math.round(sellPrice(item) * 1.15); // small broker premium over a plain vendor sale
    setPlayer((p) => ({ ...p, gold: p.gold + price, inventory: p.inventory.filter((i) => i.id !== item.id) }));
    pushToast(`Takas simsarına satıldı: +${price} altın`, "loot");
  };

  const tradeForClassItem = (item) => {
    const replacement = rollArmor(item.tier, player.class);
    setPlayer((p) => ({ ...p, inventory: [...p.inventory.filter((i) => i.id !== item.id), replacement] }));
    pushToast(`Takas tamam: ${replacement.name} aldın.`, "loot");
  };

  return (
    <div style={styles.panelScroll}>
      <div style={styles.subtabRow}>
        <button onClick={() => setSubtab("buy")} style={{ ...styles.subtabBtn, ...(subtab === "buy" ? styles.subtabBtnActive : {}) }}>
          Satın Al
        </button>
        <button onClick={() => setSubtab("trade")} style={{ ...styles.subtabBtn, ...(subtab === "trade" ? styles.subtabBtnActive : {}) }}>
          Takas Postası {tradeableItems.length > 0 && `(${tradeableItems.length})`}
        </button>
      </div>

      {subtab === "buy" && (
        <>
          <SectionLabel>Tüccarlar · Tier 1 setler</SectionLabel>
          {npcListings.length === 0 ? (
            <EmptyState icon={Store} title="Pazar boş" subtitle="Şu anda satılık sandık yok. Sonra tekrar bak." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {npcListings.map((l) => (
                <div key={l.id} style={{ ...styles.itemRow, borderColor: `${itemTierColor(l.tier)}44` }}>
                  <Gift size={18} color={itemTierColor(l.tier)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>T{l.tier} Sandık</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{l.seller}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8 }}>{l.price}g</div>
                  <button style={styles.tinyBtn} onClick={() => buy(l)}>Al</button>
                </div>
              ))}
            </div>
          )}
          <div style={styles.dropInfoRow}>
            <span>Pazarda sandık satışı yok — sadece tüccarlardan satın alınır.</span>
          </div>
        </>
      )}

      {subtab === "trade" && (
        <>
          <SectionLabel>Takas Postası · yanlış sınıf eşyaları</SectionLabel>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
            Kendi sınıfına ait olmayan zırhlar burada değerlendirilir — simsar sana ya altın öder,
            ya da aynı tier'dan kendi sınıfına uygun bir eşyayla takas eder.
          </p>
          {tradeableItems.length === 0 ? (
            <EmptyState icon={Repeat} title="Takas edilecek eşya yok" subtitle="Başka bir sınıfa ait zırh düştüğünde burada listelenir." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tradeableItems.map((item) => (
                <div key={item.id} style={{ ...styles.itemRow, borderColor: `${itemTierColor(item.tier)}44`, flexWrap: "wrap" }}>
                  <div style={{ ...styles.tierDot, background: itemTierColor(item.tier) }} />
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      {displayItemName(item)}
                      <span style={{ ...styles.classTag, color: CLASSES[item.class].color, borderColor: `${CLASSES[item.class].color}55` }}>
                        {CLASSES[item.class].name}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                      T{item.tier} · {itemStatLabel(item)}
                    </div>
                  </div>
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => tradeForGold(item)}>
                    Altına Çevir ({Math.round(sellPrice(item) * 1.15)}g)
                  </button>
                  <button style={styles.tinyBtn} onClick={() => tradeForClassItem(item)}>
                    <Repeat size={11} /> Sınıfıma Takas Et
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   UPGRADE TAB — Upgrade NPC + Tier Scrolls
   ============================================================ */

function scrollPrice(tierId) { return tierId * 20; }

function UpgradeTab({ player, setPlayer, pushToast }) {
  const buyScroll = (tierId) => {
    const price = scrollPrice(tierId);
    if (player.gold < price) { pushToast("Yeterli altının yok.", "warn"); return; }
    setPlayer((p) => ({ ...p, gold: p.gold - price, scrolls: { ...p.scrolls, [tierId]: (p.scrolls[tierId] || 0) + 1 } }));
    pushToast(`T${tierId} Yükseltme Parşömeni satın alındı.`, "loot");
  };

  // Every upgradeable item, wherever it currently lives, so gear can be
  // boosted whether it's equipped or still sitting in the bag.
  const entries = [];
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (it) entries.push({ item: it, location: { where: "equipped", slotKey: k } });
  });
  player.inventory.forEach((it) => {
    if (it.kind === "armor" || it.kind === "weapon" || it.kind === "accessory") {
      entries.push({ item: it, location: { where: "bag" } });
    }
  });

  const doUpgrade = (entry) => {
    const { item, location } = entry;
    const tier = item.tier;
    if ((item.upgradeLevel || 0) >= 5) { pushToast("Bu eşya zaten maksimum seviyede.", "warn"); return; }
    if ((player.scrolls[tier] || 0) < 1) { pushToast(`T${tier} Yükseltme Parşömenin yok.`, "warn"); return; }
    if (player.gold < tier * 15) { pushToast("Yeterli altının yok.", "warn"); return; }
    setPlayer((p) => upgradeItemInPlayer(p, item, location));
    pushToast(`${displayItemName(item)} → +${(item.upgradeLevel || 0) + 1} seviyesine yükseltildi!`, "level");
  };

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Yükseltme Ustası · parşömen satın al</SectionLabel>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TIERS.filter((t) => player.level >= t.unlockLevel).map((t) => (
          <div key={t.id} style={{ ...styles.scrollBuyCard, borderColor: `${itemTierColor(t.id)}55` }}>
            <ScrollText size={16} color={itemTierColor(t.id)} strokeWidth={1.6} />
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: itemTierColor(t.id), marginTop: 4 }}>T{t.id} Parşömen</div>
            <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>Elinde: {player.scrolls[t.id] || 0}</div>
            <button style={{ ...styles.tinyBtn, marginTop: 8, background: "#D4AF6A", color: "#15171E" }} onClick={() => buyScroll(t.id)}>
              {scrollPrice(t.id)}g
            </button>
          </div>
        ))}
      </div>

      <SectionLabel>Eşyalarını yükselt</SectionLabel>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
        Bir eşyayı yükseltmek, o eşyanın tier'ına uygun parşömen ve biraz altın ister. Her yükseltme
        istatistikleri artırır; maksimum +5 seviye.
      </p>
      {entries.length === 0 ? (
        <EmptyState icon={ArrowUpCircle} title="Yükseltilecek eşya yok" subtitle="Zırh, silah veya aksesuar edindiğinde burada listelenir." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(({ item, location }) => {
            const maxed = (item.upgradeLevel || 0) >= 5;
            const hasScroll = (player.scrolls[item.tier] || 0) >= 1;
            const goldCost = item.tier * 15;
            const canAfford = player.gold >= goldCost;
            const disabled = maxed || !hasScroll || !canAfford;
            return (
              <div key={`${item.id}-${location.where}`} style={{ ...styles.itemRow, borderColor: `${itemTierColor(item.tier)}44` }}>
                <div style={{ ...styles.tierDot, background: itemTierColor(item.tier) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    {displayItemName(item)}
                    {location.where === "equipped" && <span style={{ fontSize: 9, color: "var(--text-faint)" }}>(kuşanılı)</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    T{item.tier} · {itemStatLabel(item)} · {maxed ? "MAKS" : `+${item.upgradeLevel || 0} → +${(item.upgradeLevel || 0) + 1}`}
                  </div>
                </div>
                <button
                  style={{ ...styles.tinyBtn, opacity: disabled ? 0.5 : 1, background: maxed ? "var(--bg-panel-alt)" : "#5FA8A0" }}
                  disabled={disabled}
                  onClick={() => doUpgrade({ item, location })}
                >
                  {maxed ? "MAKS" : `Yükselt (${goldCost}g)`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CHARACTER TAB — signature Tier Ladder
   ============================================================ */

function CharacterTab({ player, cls, ip, def, atk }) {
  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Karakter</SectionLabel>
      <div style={styles.charSummary}>
        <div style={{ ...styles.charAvatar, borderColor: cls.color }}>
          <cls.icon size={28} color={cls.color} strokeWidth={1.6} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{cls.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Seviye {player.level}</div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatBlock label="Silah Gücü (ATK)" value={atk} color="#C9425A" />
        <StatBlock label="Item Power" value={ip} color="#D4AF6A" />
        <StatBlock label="Defans" value={def} color="#4FC3D9" />
        <StatBlock label="Kritik" value={`${Math.round(cls.crit * 100)}%`} color="#8B6FC9" />
        <StatBlock label="Altın" value={player.gold} color="#D4AF6A" />
      </div>

      <SectionLabel>Tier ilerleyişi</SectionLabel>
      <div style={styles.ladder}>
        {[...TIERS].reverse().map((t) => {
          const unlocked = player.level >= t.unlockLevel;
          const isCurrent = TIERS.find(tt => player.level >= tt.unlockLevel && (TIERS.indexOf(tt) === TIERS.length - 1 || player.level < TIERS[TIERS.indexOf(tt) + 1]?.unlockLevel))?.id === t.id;
          return (
            <div key={t.id} style={styles.ladderRow}>
              <div style={styles.ladderLine}>
                <div style={{
                  ...styles.ladderNode,
                  borderColor: unlocked ? t.color : "var(--border)",
                  background: unlocked ? `${t.color}22` : "var(--bg-panel)",
                  boxShadow: isCurrent ? `0 0 0 4px ${t.color}22` : "none",
                }}>
                  {unlocked ? <span style={{ color: t.color, fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.id}</span> : <Lock size={12} color="var(--text-faint)" />}
                </div>
              </div>
              <div style={{ flex: 1, opacity: unlocked ? 1 : 0.5 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                  Lv.{t.unlockLevel} {isCurrent && unlocked ? "· ŞU AN BURADASIN" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div style={styles.statBlock}>
      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */

function SectionLabel({ children }) {
  return <div style={styles.sectionLabel}>{children}</div>;
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={styles.emptyState}>
      <Icon size={28} color="var(--text-faint)" strokeWidth={1.4} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 10, color: "var(--text-muted)" }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: "center", maxWidth: 220 }}>{subtitle}</div>
    </div>
  );
}

/* ============================================================
   GLOBAL CSS
   ============================================================ */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      :root {
        --bg-void: #0B0C10;
        --bg-panel: #15171E;
        --bg-panel-alt: #1B1E27;
        --border: #262A35;
        --text-primary: #EDE8DC;
        --text-muted: #9CA1B0;
        --text-faint: #5C6072;
        --font-display: 'Cinzel', serif;
        --font-body: 'Manrope', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }

      .shake { animation: shakeAnim 0.26s ease; }
      @keyframes shakeAnim {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }

      .chest-shake { animation: chestShake 0.5s ease-in-out infinite; display: inline-block; }
      @keyframes chestShake {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-8deg) scale(1.03); }
        75% { transform: rotate(8deg) scale(1.03); }
      }

      .chest-reveal { display: flex; flex-direction: column; align-items: center; position: relative; animation: revealPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes revealPop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      .confetti-wrap { position: absolute; top: -20px; left: 0; right: 0; height: 120px; pointer-events: none; }
      .confetti-bit { position: absolute; top: 0; width: 5px; height: 10px; border-radius: 1px; animation: confettiFall 1.1s ease-in forwards; }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110px) rotate(340deg); opacity: 0; }
      }

      .toast {
        position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%);
        background: var(--bg-panel-alt); border: 1px solid var(--border);
        color: var(--text-primary); font-family: var(--font-body); font-size: 12px;
        padding: 10px 16px; border-radius: 10px; z-index: 999; max-width: 90%;
        box-shadow: 0 8px 24px -8px rgba(0,0,0,0.6);
        animation: toastIn 0.25s ease;
        text-align: center;
      }
      @keyframes toastIn {
        0% { opacity: 0; transform: translate(-50%, 8px); }
        100% { opacity: 1; transform: translate(-50%, 0); }
      }
      .toast-loot { border-color: #D4AF6A55; }
      .toast-warn { border-color: #C9425A55; color: #E8A5AF; }
      .toast-heal { border-color: #5FA8A055; }
      .toast-level { border-color: #4FC3D955; box-shadow: 0 8px 24px -6px #4FC3D955; }

      button { font-family: var(--font-body); cursor: pointer; }
      input, select { font-family: var(--font-body); }

      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    `}</style>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = {
  appRoot: {
    width: "100%", maxWidth: 420, margin: "0 auto", height: "100%", minHeight: 640,
    background: "var(--bg-void)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
    position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid var(--border)",
  },

  classSelectRoot: {
    display: "flex", flexDirection: "column", padding: "36px 22px", minHeight: 640,
    background: "radial-gradient(ellipse at top, #171A22 0%, #0B0C10 60%)",
  },
  classSelectHeader: { textAlign: "center", marginBottom: 26 },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: "var(--text-faint)", fontFamily: "var(--font-mono)" },
  h1: { fontFamily: "var(--font-display)", fontSize: 26, margin: "10px 0 6px", letterSpacing: 0.3 },
  subtext: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 },
  classGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  classCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 14,
    padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start",
    transition: "all 0.18s ease", textAlign: "left",
  },
  classStatRow: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 },
  statPill: {
    fontSize: 9, background: "var(--bg-panel-alt)", borderRadius: 6, padding: "3px 6px",
    display: "flex", gap: 4, color: "var(--text-muted)",
  },
  primaryBtn: {
    border: "none", borderRadius: 10, padding: "12px 20px", color: "#0B0C10", fontWeight: 700,
    fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },

  hubRoot: { display: "flex", flexDirection: "column", height: "100%", minHeight: 640 },
  topBar: { padding: "16px 16px 10px", borderBottom: "1px solid var(--border)" },
  topBarRow: { display: "flex", alignItems: "center", gap: 10 },
  classBadge: {
    width: 30, height: 30, borderRadius: 8, background: "var(--bg-panel)",
    border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
  },
  xpTrack: { height: 5, background: "var(--bg-panel)", borderRadius: 4, marginTop: 5, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },
  goldChip: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--bg-panel)",
    border: "1px solid var(--border)", borderRadius: 8, padding: "5px 9px", fontSize: 12,
  },
  topBarSub: { display: "flex", gap: 8, fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 8, paddingLeft: 40 },

  tabContent: { flex: 1, overflowY: "auto", position: "relative" },
  panelScroll: { padding: "16px 16px 24px" },

  sectionLabel: {
    fontSize: 10, letterSpacing: 2, color: "var(--text-faint)", fontFamily: "var(--font-mono)",
    marginBottom: 10, marginTop: 18, textTransform: "uppercase",
  },

  tierScroller: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
  tierChip: {
    display: "flex", alignItems: "center", whiteSpace: "nowrap", border: "1px solid var(--border)",
    borderRadius: 20, padding: "7px 12px", flexShrink: 0,
  },

  monsterCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: 12, display: "flex", flexDirection: "column", gap: 10,
  },
  monsterIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  smallBtn: {
    border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 700, color: "#0B0C10",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },
  dropInfoRow: { marginTop: 14, fontSize: 10, color: "var(--text-faint)", textAlign: "center" },

  battleArena: { display: "flex", flexDirection: "column", gap: 10 },
  combatant: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 },
  vsRow: { display: "flex", justifyContent: "center", padding: 2 },
  barTrack: { background: "var(--bg-panel-alt)", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", transition: "width 0.35s ease" },
  combatLog: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: 10, height: 110, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4,
  },
  combatLogLine: { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" },
  battleControls: { display: "flex", gap: 8 },
  potionBtn: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10,
    padding: "10px 12px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-primary)",
  },
  ghostBtn: {
    background: "transparent", border: "none", color: "var(--text-faint)", fontSize: 11,
    display: "flex", alignItems: "center", gap: 5, justifyContent: "center", padding: 8,
  },

  paperdoll: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 },
  paperdollSpacer: { visibility: "hidden" },
  equipSlotCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", minHeight: 74,
  },

  classTag: {
    fontSize: 8, fontFamily: "var(--font-mono)", border: "1px solid", borderRadius: 5,
    padding: "1px 5px", letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap",
  },

  scrollBuyCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 80px",
  },

  subtabRow: { display: "flex", gap: 8, marginTop: 18, marginBottom: 4 },
  subtabBtn: {
    flex: 1, background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 9,
    padding: "9px 0", fontSize: 12, color: "var(--text-muted)",
  },
  subtabBtnActive: { background: "var(--bg-panel-alt)", color: "var(--text-primary)", borderColor: "var(--text-faint)" },

  itemRow: {
    display: "flex", alignItems: "center", gap: 10, background: "var(--bg-panel)",
    border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px",
  },
  tierDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  tinyBtn: {
    border: "none", borderRadius: 7, padding: "7px 10px", fontSize: 11, fontWeight: 700,
    background: "#5FA8A0", color: "#0B0C10", whiteSpace: "nowrap",
  },

  chestGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  chestCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center",
  },

  modalOverlay: {
    position: "absolute", inset: 0, background: "rgba(11,12,16,0.86)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)",
  },
  modalCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 18,
    padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center",
    minWidth: 240, position: "relative",
  },

  listingForm: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, marginTop: 10 },
  selectInput: {
    width: "100%", background: "var(--bg-panel-alt)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "8px 10px", color: "var(--text-primary)", fontSize: 12,
  },
  numInput: {
    width: 90, background: "var(--bg-panel-alt)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "8px 10px", color: "var(--text-primary)", fontSize: 12,
  },

  charSummary: { display: "flex", alignItems: "center", gap: 12, marginBottom: 4 },
  charAvatar: {
    width: 52, height: 52, borderRadius: 14, border: "1px solid", background: "var(--bg-panel)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 },
  statBlock: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 },

  ladder: { display: "flex", flexDirection: "column" },
  ladderRow: { display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 18 },
  ladderLine: { display: "flex", flexDirection: "column", alignItems: "center" },
  ladderNode: {
    width: 30, height: 30, borderRadius: "50%", border: "1.5px solid", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  bottomNav: {
    display: "flex", borderTop: "1px solid var(--border)", background: "var(--bg-void)",
    padding: "8px 6px 12px",
  },
  navBtn: {
    flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column",
    alignItems: "center", padding: "6px 0", position: "relative",
  },
  navActiveDot: { width: 3, height: 3, borderRadius: 2, background: "var(--text-primary)", marginTop: 3 },
};
