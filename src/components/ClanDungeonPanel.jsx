import { useState, useEffect, useRef, useCallback } from "react";
import { Swords, LogOut, Lock, Users, ScrollText } from "lucide-react";
import { styles } from "../styles";
import BarTrack from "./shared/BarTrack";
import MenuEmblem from "./icons/MenuEmblem";
import DungeonEncounter from './DungeonEncounter';
import { useTranslation, formatServerError } from "../i18n/LanguageContext";
import { fetchClanDungeon, enterClanDungeon, attackClanDungeon, leaveClanDungeon, fetchClanDungeonLog } from "../services/clanService";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, rollHit, varyDamage } from "../utils/combat";
import { wingDexBonus } from "../data/wings";
import { applyDeathPenalty } from "../utils/player";
import { addItemToInventory, makeClanMaterialStack } from "../utils/inventory";
import { CLAN_DUNGEON_MATERIALS, MID_BOSS_INDEX, FINAL_BOSS_INDEX } from "../data/clanDungeon";

const fmtClock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const fmtNum = (n) => Math.round(n).toLocaleString("tr-TR");

// Klan Dungeon (Clan Raid) — kullanıcının pasted spec'i. Hasar bu oyunun geri
// kalanıyla AYNI güven sınırında: istemci BattleTab'daki gerçek iki taraflı
// çarpışma formülüyle hasarı hesaplıyor, sunucu sadece akla yatkın bir üst
// sınırla (aşama HP'sinin yarısı) kabul ediyor ve paylaşımlı HP/aşama/kilit
// kaydını otoriter tutuyor. Bir "giriş" tek canavarla sınırlı değil — oyuncu
// ayrılana/ölene/zaman aşımına uğrayana kadar aynı kilitle ardışık aşamalara
// devam eder (bkz. server/app.mjs'teki aynı not).
export default function ClanDungeonPanel({ player, setPlayer, cls, atk, def, pushToast }) {
  const { t, lang } = useTranslation();
  const [state, setState] = useState(null);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const attackingRef = useRef(false);
  const stateRef = useRef(null);
  stateRef.current = state;

  const refresh = useCallback(async () => {
    try {
      const [nextState, nextLog] = await Promise.all([fetchClanDungeon(), fetchClanDungeonLog()]);
      setState(nextState);
      setLog(nextLog);
    } catch { /* geçici ağ hatası — bir sonraki periyotta tekrar dener */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  // Kullanıcı isteği: "Klan panelinde canavarın can barı canlı dolsun/
  // boşalsın" — websocket yok, bu yüzden sık polling ile "canlı" hissi
  // taklit ediliyor (eskiden 6sn'deydi, çok daha çabuk hissettirsin diye 3sn'ye indirildi).
  useEffect(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  // Kilit sayacı (bkz. dungeonLockCountdown) saniyede bir tazeleniyor —
  // sunucudan tekrar veri çekmiyor, sadece Date.now()'a göre yeniden çiziyor
  // (aynı desen ClanTab.jsx'teki Klan Boss geri sayımında da var).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!state?.lockedUntil) return;
    const id = setInterval(() => forceTick((tk) => tk + 1), 1000);
    return () => clearInterval(id);
  }, [state?.lockedUntil]);

  // Sekmeden çıkarken (ScreenPanel'in key={tab} ile yeniden mount etmesi
  // yüzünden) kilidi elde tutuyorsak sunucuya bırakıyoruz — yoksa klanın
  // geri kalanı 5 dakikalık zaman aşımı dolana kadar bekler.
  useEffect(() => () => {
    if (stateRef.current?.lockedByMe) leaveClanDungeon().catch(() => {});
  }, []);

  const handleEnter = async () => {
    if (busy) return;
    setBusy(true);
    try { await enterClanDungeon(); await refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); await refresh(); }
    finally { setBusy(false); }
  };

  const handleLeave = async () => {
    if (busy) return;
    setBusy(true);
    try { await leaveClanDungeon(); await refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
    finally { setBusy(false); }
  };

  const handleAttack = async () => {
    if (attackingRef.current || !state?.lockedByMe || player.hp <= 0) return;
    attackingRef.current = true;
    setBusy(true);
    try {
      const stageMon = state.stage;
      const isCrit = Math.random() < cls.crit;
      const playerDex = player.stats.dex + wingDexBonus(player);
      const playerHits = rollHit(playerDex, stageMon.atk, player.level);
      const rawDmg = playerHits ? varyDamage(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), stageMon.def, MONSTER_DEF_K)) : 0;

      if (rawDmg > 0) {
        const capped = Math.min(rawDmg, Math.floor(stageMon.hp * 0.5));
        try {
          const res = await attackClanDungeon(capped);
          if (res.droppedMaterial) {
            const matDef = CLAN_DUNGEON_MATERIALS[res.droppedMaterial];
            setPlayer((p) => addItemToInventory(p, makeClanMaterialStack(res.droppedMaterial, 1)).player);
            pushToast(t("clan.toastMaterialDropped", { material: matDef.name }), "loot");
          }
          if (res.stageCleared) {
            pushToast(res.completed ? t("clan.toastDungeonCompleted") : t("clan.toastStageCleared", { index: state.stageIndex }), "loot");
          }
        } catch (error) {
          pushToast(formatServerError(t, error), "warn");
          await refresh();
          return;
        }
      }

      // Canavarın karşılık vuruşu — BattleTab'daki aynı iki taraflı çarpışma
      // ilkesi, oyuncunun kendi HP'si zaten istemcide otoriter (bkz. dosyanın
      // en üstündeki genel güven notu).
      const monsterHits = rollHit(stageMon.atk, playerDex, player.level);
      const mdmg = monsterHits ? Math.max(1, Math.round(mitigate(stageMon.atk, def, PLAYER_DEF_K))) : 0;
      if (mdmg > 0) {
        const nextHp = Math.max(0, player.hp - mdmg);
        if (nextHp <= 0) {
          setPlayer((p) => applyDeathPenalty(p).player);
          pushToast(t("clan.toastDefeated"), "warn");
          try { await leaveClanDungeon(); } catch { /* zaten kilidimiz yoksa önemsiz */ }
        } else {
          setPlayer((p) => ({ ...p, hp: nextHp }));
        }
      }
      await refresh();
    } finally {
      attackingRef.current = false;
      setBusy(false);
    }
  };

  if (!state) return <div className="clan-status" role="status">{lang === "en" ? "Loading dungeon…" : "Zindan yükleniyor…"}</div>;

  const { stage, monsterHp, completed, locked, lockedByMe, lockedByName, lockedUntil, attempts, stageIndex, totalStages } = state;
  const lockRemainingMs = lockedUntil ? Math.max(0, lockedUntil - Date.now()) : 0;

  const logLine = (entry) => {
    if (!entry.killed) return t("clan.dungeonLogHit", { name: entry.name, stage: entry.stageIndex, damage: fmtNum(entry.damage) });
    const isBoss = entry.stageIndex === MID_BOSS_INDEX || entry.stageIndex === FINAL_BOSS_INDEX;
    return t(isBoss ? "clan.dungeonLogKillBoss" : "clan.dungeonLogKill", { name: entry.name, stage: entry.stageIndex });
  };

  return (
    <div className="rpg-card" style={styles.itemDetailCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Swords size={18} color="#C9425A" strokeWidth={1.6} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 }}>{t("clan.dungeonTitle")}</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.dungeonDesc")}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        <span>{t("clan.dungeonStageLabel", { index: Math.min(stageIndex, totalStages), total: totalStages })}</span>
        <span>{t("clan.dungeonEntriesLeft", { count: attempts.entriesLeft })}</span>
      </div>

      {stage&&<DungeonEncounter stage={stage} hp={monsterHp} index={stageIndex} total={totalStages} completed={completed}/>}
      {completed ? (
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>{t("clan.dungeonCompletedToday")}</div>
      ) : locked && !lockedByMe ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <Lock size={13} /> {t("clan.dungeonLockedBy", { name: lockedByName })}
          </div>
          {lockRemainingMs > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              {t("clan.dungeonLockCountdown", { time: fmtClock(lockRemainingMs) })}
            </div>
          )}
        </div>
      ) : lockedByMe ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MenuEmblem name="dungeon" size={32} />
            <div style={{ flex: 1, fontSize: 13, color: stage.isBoss ? "#D4AF6A" : "var(--text-primary)" }}>{stage.name}</div>
            {lockRemainingMs > 0 && (
              <span style={{ fontSize: 10, color: lockRemainingMs < 20000 ? "#E8A5AF" : "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                {fmtClock(lockRemainingMs)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            {t("clan.dungeonMonsterHp")}: {Math.round(monsterHp)}/{stage.hp}
          </div>
          <BarTrack pct={(monsterHp / stage.hp) * 100} color="#C9425A" />
          <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
            {t("clan.dungeonYourHp")}: {Math.round(player.hp)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="rpg-action" style={{ ...styles.tinyBtn, flex: 1, ...(busy || player.hp <= 0 ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }} disabled={busy || player.hp <= 0} onClick={handleAttack}>
              {t("clan.dungeonAttackBtn")}
            </button>
            <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} disabled={busy} onClick={handleLeave}>
              <LogOut size={12} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {attempts.entriesLeft === 0 ? (
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>
              {attempts.cooldownRemainingMs > 0 ? t("clan.dungeonCooldownLabel", { time: fmtClock(attempts.cooldownRemainingMs) }) : t("clan.dungeonNoEntriesLeft")}
            </div>
          ) : (
            <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(busy ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }} disabled={busy} onClick={handleEnter}>
              <Users size={12} /> {t("clan.dungeonEnterBtn")}
            </button>
          )}
        </>
      )}

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-faint)", marginBottom: 6 }}>
          <ScrollText size={12} /> {t("clan.dungeonLogTitle")}
        </div>
        {log.length === 0 ? (
          <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("clan.dungeonLogEmpty")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
            {log.map((entry) => (
              <div key={entry.id} style={{ fontSize: 10, color: entry.killed ? "var(--gold-text)" : "var(--text-muted)", lineHeight: 1.5 }}>
                {logLine(entry)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
