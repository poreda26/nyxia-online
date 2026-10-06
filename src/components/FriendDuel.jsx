import {confirmRetreat} from '../utils/confirmRetreat';
import { useState, useEffect, useCallback } from "react";
import { X, Swords } from "./icons/GameIcons";
import { createDuel, stepDuel } from "../utils/duelEngine";
import { fetchFriendDuel } from "../services/socialService";
import DuelScene from "./DuelScene";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { formatServerError } from "../i18n/LanguageContext";

const TURN_MS = 900;

// Arkadaşa VS: arkadaşın en son kaydedilmiş karakterine karşı otomatik, dostane
// düello. Arkadaşın çevrimiçi olması gerekmez; ödül, ceza, NP, can/mana ya da
// eşya değişmez. Savaş hesabı, Savaş Alanı düellosuyla aynı motordur
// (utils/duelEngine.js); sunucu yalnızca rakibi ve adil bir seed'i verir.
export default function FriendDuel({ player, friend, onClose }) {
  const { t, lang } = useTranslation();
  const [match, setMatch] = useState(null); // { state, enemy, name }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const start = useCallback(async () => {
    setLoading(true); setError(null); setMatch(null);
    try {
      const result = await fetchFriendDuel(friend.accountId);
      setMatch({ state: createDuel(player, result.opponent, { seed: result.seed, fullHealth: true }), enemy: result.opponent, name: result.friendName || friend.name });
    } catch (e) {
      setError(formatServerError(t, e, "friendDuel.failed"));
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend.accountId]);

  useEffect(() => { start(); }, [start]);

  useEffect(() => {
    if (!match || match.state.finished) return undefined;
    const timer = setTimeout(() => setMatch((m) => (m ? { ...m, state: stepDuel(m.state) } : m)), TURN_MS);
    return () => clearTimeout(timer);
  }, [match]);

  const a = match?.state.fighters[0];
  const b = match?.state.fighters[1];
  const events = match?.state.events || [];
  const out = events.find((e) => e.side === 0 && e.type !== "dotTick");
  const inc = events.find((e) => e.side === 1 && e.type !== "dotTick");
  const finished = !!match?.state.finished;
  const winner = match?.state.winner;

  const requestClose = () => { if (!match || finished || confirmRetreat(lang)) onClose(); };
  return (
    <div style={styles.modalOverlay} onClick={requestClose}>
      <div role="dialog" aria-modal="true" aria-label={t("friendDuel.title", { name: friend.name })} style={{ ...styles.modalCard, maxWidth: 420, padding: "20px 14px 16px" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={requestClose} aria-label={t("friendDuel.close")} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4, zIndex: 2 }}><X size={16} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontSize: 16 }}>
          <Swords size={16} /> {t("friendDuel.title", { name: friend.name })}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: "center" }}>{t("friendDuel.subtitle")}</div>

        {loading && <p style={{ fontSize: 12, marginTop: 16 }}>{t("friendDuel.loading")}</p>}
        {error && <p role="alert" style={{ fontSize: 12, marginTop: 16, color: "#E8A5AF", textAlign: "center" }}>{error}</p>}

        {match && (
          <div style={{ width: "100%", marginTop: 10 }}>
            <DuelScene
              title={t("friendDuel.sceneTitle")} subtitle={t("friendDuel.sceneSubtitle")}
              player={{ ...player, hp: a.hp, mp: a.mp }}
              ghost={{ name: match.name, cls: match.enemy.class, avatar: match.enemy, maxHp: b.maxHp }}
              duel={{ engine: match.state, ghostHp: b.hp, finished }}
              visual={{ id: match.state.round, type: out?.type, skillId: out?.skillId, enemySkillId: inc?.skillId, enemyType: inc?.type, outgoing: out ? { ...out, damage: out.heal || out.damage } : null, incoming: inc ? { ...inc, damage: inc.heal || inc.damage } : null }}
            />
            <p style={{ fontSize: 13, textAlign: "center", margin: "10px 0 0", fontWeight: 700, color: finished ? "var(--gold-text)" : "var(--text-muted)" }}>
              {finished
                ? (winner === null ? t("friendDuel.draw") : winner === 0 ? t("friendDuel.won", { name: match.name }) : t("friendDuel.lost", { name: match.name }))
                : t("friendDuel.round", { n: match.state.round })}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14, width: "100%" }}>
          {(finished || error) && <button style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#0B0C10", flex: 1 }} onClick={start}>{t("friendDuel.rematch")}</button>}
          <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", flex: 1 }} onClick={requestClose}>{t("friendDuel.close")}</button>
        </div>
      </div>
    </div>
  );
}
