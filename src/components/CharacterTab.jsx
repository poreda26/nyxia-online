import { useState, useRef, useEffect } from "react";
import { Plus, Repeat, Crown, Lock, Check, X, BookOpen } from "lucide-react";
import { STAT_KEYS, STAT_FULL_LABELS, STAT_COLORS, STAT_CAP } from "../data/stats";
import { RACES } from "../data/races";
import { allocateStat, displayClassName } from "../utils/player";
import { activePremiumTier, premiumDaysLeft } from "../utils/premium";
import { classSkills, isKnown, canUnlockSkill, unlockSkill, setLoadoutSlot, describeEffect } from "../utils/skills";
import { MAX_LOADOUT_SLOTS } from "../data/skills";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import StatBlock from "./shared/StatBlock";
import SkillIcon from "./SkillIcon";

export default function CharacterTab({ player, setPlayer, cls, maxHp, def, atk, pushToast, onChangeCharacter, onReplayTutorial }) {
  const [subtab, setSubtab] = useState("stats");
  const addStat = (key) => setPlayer((p) => allocateStat(p, key));
  const race = RACES[player.race];
  const premiumTier = activePremiumTier(player);

  // "+" tuşuna basılı tutunca hızlı dağıtım — kısa bir gecikmenin ardından
  // tekrar tekrar addStat çağırır. allocateStat zaten statPoints/STAT_CAP
  // sınırlarında kendiliğinden no-op döndüğü için tekrarlar güvenle boşa
  // çıkar, burada ayrıca sınır kontrolü gerekmiyor.
  const holdDelayRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const stopHold = () => {
    clearTimeout(holdDelayRef.current);
    clearInterval(holdIntervalRef.current);
  };
  const startHold = (key) => {
    addStat(key);
    stopHold();
    holdDelayRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => addStat(key), 60);
    }, 350);
  };
  useEffect(() => stopHold, []);

  const learn = (skillId) => {
    const result = unlockSkill(player, skillId);
    if (!result.unlocked) { pushToast(result.reason || "Öğrenilemedi.", "warn"); return; }
    setPlayer(result.player);
    pushToast("Beceri öğrenildi.", "loot");
  };

  const toggleLoadout = (skillId) => {
    const loadout = player.skills.loadout;
    const currentSlot = loadout.indexOf(skillId);
    if (currentSlot >= 0) { setPlayer((p) => setLoadoutSlot(p, currentSlot, null)); return; }
    const emptySlot = loadout.indexOf(null);
    if (emptySlot === -1) { pushToast("5 beceri kutucuğu dolu — önce birini kaldır.", "warn"); return; }
    setPlayer((p) => setLoadoutSlot(p, emptySlot, skillId));
  };

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Karakter</SectionLabel>
      <div style={styles.charSummary}>
        <div style={{ ...styles.charAvatar, borderColor: cls.color }}>
          <cls.icon size={28} color={cls.color} strokeWidth={1.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayClassName(player)}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Seviye {player.level}{race && <span style={{ color: race.color }}> · {race.name}</span>}
          </div>
        </div>
        {onChangeCharacter && (
          <button
            style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
            onClick={onChangeCharacter}
          >
            <Repeat size={11} /> Karakter Değiştir
          </button>
        )}
      </div>

      {onReplayTutorial && (
        <button
          style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", marginBottom: 12 }}
          onClick={onReplayTutorial}
        >
          <BookOpen size={12} /> Tutorial'ı Tekrar Göster
        </button>
      )}

      {premiumTier && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginBottom: 12, borderRadius: 8, borderWidth: 1, borderStyle: "solid", borderColor: `${premiumTier.color}66`, background: `${premiumTier.color}14` }}>
          <Crown size={15} color={premiumTier.color} strokeWidth={1.6} />
          <span style={{ fontSize: 12, color: premiumTier.color, fontFamily: "var(--font-mono)" }}>
            {premiumTier.name} · {premiumDaysLeft(player)} gün kaldı
          </span>
        </div>
      )}

      <div style={styles.statsGrid}>
        <StatBlock label="Silah Gücü (ATK)" value={atk} color="#C9425A" />
        <StatBlock label="Defans (DEF)" value={def} color="#4FC3D9" />
        <StatBlock label="Can (HP)" value={maxHp} color="#5FA8A0" />
        <StatBlock label="Kritik" value={`${Math.round(cls.crit * 100)}%`} color="#8B6FC9" />
        <StatBlock label="Altın" value={player.gold} color="#D4AF6A" />
        <StatBlock label="Elmas" value={player.diamonds} color="#8B6FC9" />
      </div>

      <div style={styles.subtabRow}>
        <button onClick={() => setSubtab("stats")} style={{ ...styles.subtabBtn, ...(subtab === "stats" ? styles.subtabBtnActive : {}) }}>
          Statüler
        </button>
        <button onClick={() => setSubtab("skills")} style={{ ...styles.subtabBtn, ...(subtab === "skills" ? styles.subtabBtnActive : {}) }}>
          Beceriler ({player.skills.known.length})
        </button>
      </div>

      {subtab === "stats" && (
        <>
          <span style={styles.statPointsBadge}>
            {player.statPoints > 0 ? `Dağıtılacak ${player.statPoints} puanın var.` : "Dağıtılacak puanın yok — seviye atladıkça 3'er puan kazanırsın."}
          </span>
          <div style={styles.statAllocList}>
            {STAT_KEYS.map((key) => {
              const isMain = cls.mainStat === key;
              const atCap = player.stats[key] >= STAT_CAP;
              const disabled = player.statPoints <= 0 || atCap;
              return (
                <div key={key} style={styles.statAllocRow}>
                  <div style={{ flex: 1, fontSize: 12, color: STAT_COLORS[key], fontWeight: isMain ? 800 : 400, display: "flex", alignItems: "center" }}>
                    {STAT_FULL_LABELS[key]}
                    {isMain && <span style={styles.mainStatTag}>Ana Statü</span>}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, minWidth: 26, textAlign: "right" }}>
                    {player.stats[key]}
                  </div>
                  <button
                    style={{ ...styles.statAllocBtn, ...(disabled ? styles.statAllocBtnDisabled : {}) }}
                    disabled={disabled}
                    onMouseDown={() => startHold(key)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={(e) => { e.preventDefault(); startHold(key); }}
                    onTouchEnd={stopHold}
                    onTouchCancel={stopHold}
                    title={atCap ? `Tavan: ${STAT_CAP}` : undefined}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {subtab === "skills" && (
        <>
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
            Savaş kutucukları ({player.skills.loadout.filter(Boolean).length}/{MAX_LOADOUT_SLOTS})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${MAX_LOADOUT_SLOTS}, 1fr)`, gap: 6, marginBottom: 16 }}>
            {player.skills.loadout.map((skillId, i) => {
              const skill = skillId ? classSkills(player.class).find((s) => s.id === skillId) : null;
              return (
                <div key={i} style={{ ...styles.equipSlotCard, ...(skill ? { borderColor: `${cls.color}66`, background: `${cls.color}1c` } : {}) }}>
                  {skill ? <SkillIcon effectType={skill.effect.type} size={18} color={cls.color} /> : <Plus size={14} color="var(--text-faint)" />}
                  <div style={{ fontSize: 7, color: "var(--text-faint)", marginTop: 2, textAlign: "center" }}>{skill ? skill.name : "Boş"}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {classSkills(player.class).map((skill) => {
              const known = isKnown(player, skill.id);
              const check = canUnlockSkill(player, skill);
              const inLoadout = player.skills.loadout.includes(skill.id);
              return (
                <div key={skill.id} style={{ ...styles.itemDetailCard, ...(known ? { borderColor: `${cls.color}55` } : {}) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <SkillIcon effectType={skill.effect.type} size={17} color={known ? cls.color : "var(--text-faint)"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                        {skill.name}
                        <span style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>Lv.{skill.unlockLevel}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{describeEffect(skill.effect)}</div>
                      <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        MP {skill.mpCost} · Bekleme {skill.cooldown} vuruş
                        {skill.tier === "advanced" && ` · ${skill.goldCost}g · T${skill.questTier} görevi gerekli`}
                      </div>
                    </div>
                    {known ? (
                      <button
                        style={{ ...styles.tinyBtn, background: inLoadout ? cls.color : "var(--bg-panel-alt)", color: inLoadout ? "#0B0C10" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
                        onClick={() => toggleLoadout(skill.id)}
                      >
                        {inLoadout ? <><X size={11} /> Kaldır</> : <><Check size={11} /> Kutucuğa Ekle</>}
                      </button>
                    ) : check.ok ? (
                      <button style={{ ...styles.tinyBtn, flexShrink: 0 }} onClick={() => learn(skill.id)}>Öğren</button>
                    ) : (
                      <div style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, cursor: "default" }}>
                        <Lock size={11} /> {check.reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
