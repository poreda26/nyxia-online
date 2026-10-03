import { useEffect, useRef, useState } from "react";
import "./TutorialCoach.css";
import CaptainPortrait from "./CaptainPortrait";
import TutorialModal from "./TutorialModal";
import TutorialSkipConfirm from "./TutorialSkipConfirm";
import { X } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { TUTORIAL_SECTIONS, TUTORIAL_GIFT_GOLD, TUTORIAL_SCROLL_PRICE, grantTutorialGift, totalKills, findTutorialWeapon, upgradeHint } from "../utils/tutorial";

const SECTION = { welcome: 0, skills: 1, battle: 2, upgrade: 3, wrap: 4 };
const COACH_SECTIONS = ["skills", "battle", "upgrade"];
const WRAP_STEPS = [2, 3, 4, 6]; // Envanter, Pazar, Kaptan, Klan & Savaş Alanı (Yükselt ve Savaş artık uygulamalı öğretiliyor)

const navButton = (index) => `.dock-rail .dock-button:nth-child(${index})`;
const NAV = { battle: navButton(1), inventory: navButton(2), upgrade: navButton(4), character: navButton(10) };

const PROBES = {
  skillCards: ".skill-card",
  inFight: ".battle-skill-dock",
  unequipBtn: '[data-tut="unequip-btn"]',
  equipBtn: '[data-tut="equip-btn"]',
  shopOpen: '[data-tut="buy-scroll-1"]',
  lockedCard: ".skill-card.is-locked",
  boxFilled: '[data-tut="scroll-box"][data-filled="1"]',
};

// Sayfadaki öğeleri periyodik olarak okur: rehber, bileşenlerin içine girmeden
// hangi ekranda olduğumuzu anlasın (örn. savaş başladı mı, mağaza açık mı).
function useScreenProbe(active) {
  const [probe, setProbe] = useState({});
  useEffect(() => {
    if (!active) return undefined;
    const read = () => {
      const next = Object.fromEntries(Object.entries(PROBES).map(([key, sel]) => [key, !!document.querySelector(sel)]));
      setProbe((prev) => (Object.keys(next).every((k) => prev[k] === next[k]) ? prev : next));
    };
    read();
    const id = setInterval(read, 300);
    return () => clearInterval(id);
  }, [active]);
  return probe;
}

// Hedef öğe(ler)in dışındaki her yeri karartır ve dokunmaya kapatır: oyuncu
// yalnızca gösterilen yeri kullanabilir. Hedef yoksa hiçbir şey engellenmez
// (örn. savaş sürerken ya da bölüm bitince).
function TutorialSpotlight({ targets, soft }) {
  const key = targets.join("|");
  const [rect, setRect] = useState(null);
  useEffect(() => {
    let scrolledFor = null;
    const measure = () => {
      const found = targets.map((sel) => document.querySelector(sel)).filter(Boolean);
      if (!found.length) { setRect((r) => (r ? null : r)); return; }
      let boxes = found.map((el) => el.getBoundingClientRect());
      // Hedef ekran dışındaysa (yatay kayan alt menü, uzun liste) görünene kadar kaydır.
      const hidden = boxes[0].left < 0 || boxes[0].right > window.innerWidth || boxes[0].top < 0 || boxes[0].bottom > window.innerHeight;
      if (scrolledFor !== key || hidden) {
        scrolledFor = key;
        found[0].scrollIntoView?.({ block: "nearest", inline: "center", behavior: "auto" });
        boxes = found.map((el) => el.getBoundingClientRect());
      }
      const pad = 6;
      // soft: karartma ve kilit yok, yalnızca her hedefin etrafında parlak çerçeve
      // (örn. savaşı izleyebilsin diye).
      if (soft) {
        const rects = boxes.map((b) => ({ top: b.top - pad, left: b.left - pad, width: b.width + 2 * pad, height: b.height + 2 * pad }));
        setRect((r) => (r?.soft && JSON.stringify(r.rects) === JSON.stringify(rects) ? r : { soft: true, rects }));
        return;
      }
      const next = {
        top: Math.max(0, Math.min(...boxes.map((b) => b.top)) - pad), left: Math.max(0, Math.min(...boxes.map((b) => b.left)) - pad),
        right: Math.min(window.innerWidth, Math.max(...boxes.map((b) => b.right)) + pad), bottom: Math.min(window.innerHeight, Math.max(...boxes.map((b) => b.bottom)) + pad),
      };
      setRect((r) => (r && r.top === next.top && r.left === next.left && r.right === next.right && r.bottom === next.bottom ? r : next));
    };
    measure();
    const id = setInterval(measure, 120);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, soft]);
  if (!rect) return null;
  if (rect.soft) return <>{rect.rects.map((r, i) => <div key={i} className="tut-ring" style={r} />)}</>;
  const block = (style) => <div className="tut-block" style={style} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} />;
  return (
    <>
      {block({ top: 0, left: 0, right: 0, height: rect.top })}
      {block({ top: rect.bottom, left: 0, right: 0, bottom: 0 })}
      {block({ top: rect.top, left: 0, width: rect.left, height: rect.bottom - rect.top })}
      {block({ top: rect.top, left: rect.right, right: 0, height: rect.bottom - rect.top })}
      <div className="tut-ring" style={{ top: rect.top, left: rect.left, width: rect.right - rect.left, height: rect.bottom - rect.top }} />
    </>
  );
}

// Bölüm bölüm, uygulamalı tutorial. Hub'da alt menünün hemen üstünde küçük bir
// Kaptan kartı olarak durur (içeriği kapatmaz); her bölüm tek tek atlanabilir.
export default function TutorialCoach({ player, setPlayer, tab, onFinish }) {
  const { t } = useTranslation();
  const section = Math.min(player.tutorialSection ?? 0, TUTORIAL_SECTIONS.length - 1);
  const goTo = (n) => setPlayer((p) => ({ ...p, tutorialSection: n }));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const probe = useScreenProbe(section >= SECTION.skills && section <= SECTION.upgrade);

  const killBaseline = useRef(null);
  const weaponId = useRef(null);
  useEffect(() => {
    killBaseline.current = section === SECTION.battle ? totalKills(player) : null;
    if (section === SECTION.upgrade) {
      weaponId.current = findTutorialWeapon(player, null).weapon?.id ?? null;
      setPlayer((p) => grantTutorialGift(p).player);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Beceri bölümünde "öğren" açıklaması bir kez gösterilir (Anladım ile geçilir).
  const [learnSeen, setLearnSeen] = useState(false);
  useEffect(() => { setLearnSeen(false); }, [section]);

  let hint = null; // { key, targets[], done, soft, info }
  if (section === SECTION.skills) {
    if (learnSeen && player.skills.loadout.some(Boolean)) hint = { key: "done", done: true, targets: ['[data-tut="loadout"]'] };
    else if (tab !== "character") hint = { key: "goCharacter", targets: [NAV.character] };
    else if (!probe.skillCards) hint = { key: "openSkillsTab", targets: [".rpg-tabs button:nth-child(2)"] };
    else if (!learnSeen) hint = { key: "learnInfo", info: true, targets: [probe.lockedCard ? ".skill-card.is-locked" : ".skill-card"] };
    else hint = { key: "addSkill", targets: [".skill-card.is-known:not(.is-equipped) .rpg-action"] };
  } else if (section === SECTION.battle) {
    if (killBaseline.current != null && totalKills(player) > killBaseline.current) hint = { key: "done", done: true };
    else if (tab !== "battle") hint = { key: "goBattle", targets: [NAV.battle] };
    else if (probe.inFight) hint = { key: "fight", soft: true, targets: [".battle-skill-dock", ".battle-action-dock button:first-child"] };
    else hint = { key: "pickMonster", targets: [".monster-attack:not([disabled])"] };
  } else if (section === SECTION.upgrade) {
    const h = upgradeHint(player, tab, weaponId.current, probe);
    hint = { key: h.key, done: h.done, targets: h.nav ? [NAV[h.nav]] : h.target ? [h.target] : [] };
  }

  // Parşömen kutuya girince çantadaki sayısı düşer ama kutunun dolduğunu ekrandan
  // okumak biraz geç kalır; o kısa aralıkta "Mağaza" ışığı yanıp sönmesin diye
  // Mağaza adımı ancak yarım saniye boyunca değişmeden kalırsa gösterilir.
  const isShopStep = hint?.key === "openShop" || hint?.key === "buyScroll";
  const [shopSettled, setShopSettled] = useState(false);
  const lastStable = useRef(null);
  useEffect(() => {
    if (!isShopStep) { setShopSettled(false); return undefined; }
    const id = setTimeout(() => setShopSettled(true), 600);
    return () => clearTimeout(id);
  }, [isShopStep, hint?.key]);
  if (isShopStep && !shopSettled && lastStable.current) hint = lastStable.current;
  else if (hint) lastStable.current = hint;

  // Mağaza adımında altın yetmezse (başka yere harcandıysa) rehber takılmasın.
  const needsGold = hint?.key === "buyScroll" && player.gold < TUTORIAL_SCROLL_PRICE;
  useEffect(() => {
    if (needsGold) setPlayer((p) => (p.gold < TUTORIAL_SCROLL_PRICE ? { ...p, gold: TUTORIAL_SCROLL_PRICE } : p));
  }, [needsGold, setPlayer]);
  const targets = hint?.targets || [];

  if (section === SECTION.wrap) return <TutorialModal onFinish={onFinish} stepIndexes={WRAP_STEPS} />;

  if (section === SECTION.welcome) {
    const giftGiven = !!player.tutorialGift;
    const start = () => { setPlayer((p) => ({ ...grantTutorialGift(p).player, tutorialSection: SECTION.skills })); };
    return (
      <div style={styles.modalOverlay}>
        <div style={{ ...styles.modalCard, maxWidth: 320 }}>
          <button className="tutorial-close" onClick={() => setConfirmOpen(true)} aria-label={t("tutorial.skip")} title={t("tutorial.skip")}><X size={16} /></button>
          <div className="tutorial-coach-portrait"><CaptainPortrait size={64} /></div>
          <div style={{ marginTop: 10, fontSize: 10, color: "var(--gold-text)", fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>{t("tutorial.badge")}</div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 17, textAlign: "center" }}>{t("tutorialCoach.welcome.title")}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>"{t("tutorialCoach.welcome.text")}"</div>
          {!giftGiven && <div style={{ fontSize: 12, color: "var(--gold-text)", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>{t("tutorialCoach.welcome.gift", { gold: TUTORIAL_GIFT_GOLD })}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
            <button style={{ ...styles.tinyBtn, background: "#D4AF6A", flex: 1 }} onClick={start}>{t("tutorialCoach.welcome.start")}</button>
          </div>
        </div>
        {confirmOpen && <TutorialSkipConfirm onKeepGoing={() => setConfirmOpen(false)} onSkipAll={onFinish} />}
      </div>
    );
  }

  const index = COACH_SECTIONS.indexOf(TUTORIAL_SECTIONS[section]);
  const name = TUTORIAL_SECTIONS[section];
  const doneKey = name === "upgrade" ? hint.key : "done";
  const text = hint.done ? t(`tutorialCoach.${name}.${doneKey}`) : t(`tutorialCoach.${name}.${hint.key}`);
  return (
    <>
    {targets.length > 0 && <TutorialSpotlight targets={targets} soft={!!hint.soft} />}
    <div className="tutorial-coach" role="status" aria-live="polite">
      <button className="tutorial-close" onClick={() => setConfirmOpen(true)} aria-label={t("tutorial.skip")} title={t("tutorial.skip")}><X size={16} /></button>
      <div className="tutorial-coach-head">
        <div className="tutorial-coach-portrait"><CaptainPortrait size={34} /></div>
        <div className="tutorial-coach-title">
          <small>{t("tutorialCoach.sectionOf", { n: index + 1, total: COACH_SECTIONS.length })}</small>
          {t(`tutorialCoach.sections.${name}`)}
        </div>
      </div>
      <p className="tutorial-coach-text">{text}</p>
      <div className="tutorial-coach-dots" aria-hidden="true">
        {COACH_SECTIONS.map((s, i) => <i key={s} className={i < index ? "is-done" : i === index ? "is-current" : ""} />)}
      </div>
      <div className="tutorial-coach-actions">
        {hint.info && <button className="is-primary" onClick={() => setLearnSeen(true)}>{t("tutorialCoach.gotIt")}</button>}
        {hint.done && <button className="is-primary" onClick={() => goTo(section + 1)}>{t("tutorialCoach.continue")}</button>}
      </div>
    </div>
    {confirmOpen && <TutorialSkipConfirm onKeepGoing={() => setConfirmOpen(false)} onSkipSection={() => { setConfirmOpen(false); goTo(section + 1); }} onSkipAll={onFinish} />}
    </>
  );
}
