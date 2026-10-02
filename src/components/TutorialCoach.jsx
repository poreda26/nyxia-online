import { useEffect, useRef, useState } from "react";
import "./TutorialCoach.css";
import CaptainPortrait from "./CaptainPortrait";
import TutorialModal from "./TutorialModal";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { TUTORIAL_SECTIONS, TUTORIAL_GIFT_GOLD, grantTutorialGift, totalKills, findTutorialWeapon, upgradeHint } from "../utils/tutorial";

const SECTION = { welcome: 0, skills: 1, battle: 2, upgrade: 3, wrap: 4 };
const COACH_SECTIONS = ["skills", "battle", "upgrade"];
const WRAP_STEPS = [2, 3, 4, 6]; // Envanter, Pazar, Kaptan, Klan & Savaş Alanı (Yükselt ve Savaş artık uygulamalı öğretiliyor)

const navButton = (index) => `.dock-rail .dock-button:nth-child(${index})`;
const NAV = { battle: navButton(1), inventory: navButton(2), upgrade: navButton(4), character: navButton(10) };

// Sayfadaki öğeleri periyodik olarak okur: rehber, bileşenlerin içine girmeden
// hangi ekranda olduğumuzu anlasın (örn. savaş başladı mı, Beceriler açık mı).
function useScreenProbe(active) {
  const [probe, setProbe] = useState({ skillCards: false, inFight: false });
  useEffect(() => {
    if (!active) return undefined;
    const read = () => {
      const next = { skillCards: !!document.querySelector(".skill-card"), inFight: !!document.querySelector(".battle-skill-dock") };
      setProbe((prev) => (prev.skillCards === next.skillCards && prev.inFight === next.inFight ? prev : next));
    };
    read();
    const id = setInterval(read, 400);
    return () => clearInterval(id);
  }, [active]);
  return probe;
}

// Vurgulanacak öğeye .tut-pulse sınıfı ekler (bileşenlere dokunmadan).
function useHighlight(selector) {
  useEffect(() => {
    if (!selector) return undefined;
    let current = null;
    const apply = () => {
      const target = document.querySelector(selector);
      if (target === current) return;
      current?.classList.remove("tut-pulse");
      current = target;
      current?.classList.add("tut-pulse");
      // Alt menü yatay kayar; hedef görünür alanda değilse ortalansın.
      current?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "auto" });
    };
    apply();
    const id = setInterval(apply, 400);
    return () => { clearInterval(id); current?.classList.remove("tut-pulse"); };
  }, [selector]);
}

// Bölüm bölüm, uygulamalı tutorial. Hub'da alt menünün hemen üstünde küçük bir
// Kaptan kartı olarak durur (içeriği kapatmaz); her bölüm tek tek atlanabilir.
export default function TutorialCoach({ player, setPlayer, tab, onFinish }) {
  const { t } = useTranslation();
  const section = Math.min(player.tutorialSection ?? 0, TUTORIAL_SECTIONS.length - 1);
  const goTo = (n) => setPlayer((p) => ({ ...p, tutorialSection: n }));
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

  let hint = null; // { key, nav, highlight, done }
  if (section === SECTION.skills) {
    if (player.skills.loadout.some(Boolean)) hint = { key: "done", done: true };
    else if (tab !== "character") hint = { key: "goCharacter", highlight: NAV.character };
    else if (!probe.skillCards) hint = { key: "openSkillsTab", highlight: ".rpg-tabs button:nth-child(2)" };
    else hint = { key: "addSkill", highlight: ".skill-card.is-known:not(.is-equipped) .rpg-action" };
  } else if (section === SECTION.battle) {
    if (killBaseline.current != null && totalKills(player) > killBaseline.current) hint = { key: "done", done: true };
    else if (tab !== "battle") hint = { key: "goBattle", highlight: NAV.battle };
    else if (probe.inFight) hint = { key: "fight", highlight: ".battle-skill-dock button:not([disabled])" };
    else hint = { key: "pickMonster", highlight: ".monster-attack:not([disabled])" };
  } else if (section === SECTION.upgrade) {
    const h = upgradeHint(player, tab, weaponId.current);
    hint = { key: h.key, done: h.done, highlight: h.nav ? NAV[h.nav] : null };
  }
  useHighlight(hint?.highlight || null);

  if (section === SECTION.wrap) return <TutorialModal onFinish={onFinish} stepIndexes={WRAP_STEPS} />;

  if (section === SECTION.welcome) {
    const giftGiven = !!player.tutorialGift;
    const start = () => { setPlayer((p) => ({ ...grantTutorialGift(p).player, tutorialSection: SECTION.skills })); };
    return (
      <div style={styles.modalOverlay}>
        <div style={{ ...styles.modalCard, maxWidth: 320 }}>
          <div className="tutorial-coach-portrait"><CaptainPortrait size={64} /></div>
          <div style={{ marginTop: 10, fontSize: 10, color: "var(--gold-text)", fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>{t("tutorial.badge")}</div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 17, textAlign: "center" }}>{t("tutorialCoach.welcome.title")}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>"{t("tutorialCoach.welcome.text")}"</div>
          {!giftGiven && <div style={{ fontSize: 12, color: "var(--gold-text)", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>{t("tutorialCoach.welcome.gift", { gold: TUTORIAL_GIFT_GOLD })}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
            <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", flex: 1 }} onClick={onFinish}>{t("tutorialCoach.skipAll")}</button>
            <button style={{ ...styles.tinyBtn, background: "#D4AF6A", flex: 1.4 }} onClick={start}>{t("tutorialCoach.welcome.start")}</button>
          </div>
        </div>
      </div>
    );
  }

  const index = COACH_SECTIONS.indexOf(TUTORIAL_SECTIONS[section]);
  const name = TUTORIAL_SECTIONS[section];
  const doneKey = name === "upgrade" ? hint.key : "done";
  const text = hint.done ? t(`tutorialCoach.${name}.${doneKey}`) : t(`tutorialCoach.${name}.${hint.key}`);
  return (
    <div className="tutorial-coach" role="status" aria-live="polite">
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
        {!hint.done && <button onClick={() => goTo(section + 1)}>{t("tutorialCoach.skipSection")}</button>}
        <button onClick={onFinish}>{t("tutorialCoach.skipAll")}</button>
        {hint.done && <button className="is-primary" onClick={() => goTo(section + 1)}>{t("tutorialCoach.continue")}</button>}
      </div>
    </div>
  );
}
