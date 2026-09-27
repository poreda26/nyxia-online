import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, HelpCircle, Wand2, X } from "lucide-react";
import { styles } from "../styles";
import * as chatService from "../services/chatService";
import * as socialService from "../services/socialService";
import { parseGmCommand, executeGmCommand, tryGmUnlock } from "../utils/gmCommands";
import { displayClassName } from "../utils/player";
import GmItemPanel from "./GmItemPanel";
import Avatar from './Avatar';
import {playerAvatarId} from '../data/avatars';
import { useTranslation, formatServerError } from "../i18n/LanguageContext";

// Kullanıcı isteği: "arkadaşlarımızla olan konuşmalarımız sohbette ek
// sekme olarak gözükebilir... sekme gibi sonra kapatabiliriz" — Genel
// Sohbet hep açık (kapatılamaz) ilk sekme, her açık DM (bkz. Hub.jsx#openDm)
// yanına eklenen kapatılabilir bir sekme. Sekme listesi/görüldü durumu
// Hub'da yaşıyor ki bu bileşen (Sohbet'ten çıkılınca ScreenPanel'in
// key={tab} ile yeniden mount etmesi yüzünden) kaybolmasın.
export default function ChatTab({
  player, setPlayer, bank, setBank, pushToast,
  openDmTabs = [], dmUnreadIds, pendingActiveDm = null, onConsumePendingActiveDm, onCloseDm, onSeenDm,
}) {
  const { t, lang } = useTranslation();
  const [activeDmId, setActiveDmId] = useState(pendingActiveDm);
  useEffect(() => {
    if (pendingActiveDm != null) onConsumePendingActiveDm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showGmPanel, setShowGmPanel] = useState(false);
  const logRef = useRef(null);

  // Karşılama mesajı sunucuda saklanmıyor (her oyuncuya kendi dilinde,
  // sadece yerelde gösterilir) — gerçek mesajların en başına ekleniyor.
  const WELCOME = { id: "welcome", author: "system", textKey: "chat.welcomeMessage", isSystem: true, isGM: false, createdAt: 0 };

  const refresh = useCallback(async () => {
    try {
      const msgs = await chatService.fetchMessages();
      setMessages([WELCOME, ...msgs]);
    } catch { /* geçici ağ hatası — bir sonraki periyotta tekrar dener */ }
  }, []);

  useEffect(() => { if (activeDmId === null) refresh(); }, [activeDmId, refresh]);
  // Diğer oyuncuların mesajlarını görmek için periyodik yenileme.
  useEffect(() => {
    if (activeDmId !== null) return;
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [activeDmId, refresh]);
  useEffect(() => {
    if (activeDmId === null && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [activeDmId, messages.length]);

  // Kullanıcı isteği: sohbette sınıf adı değil, karakterin kendi ismi görünsün.
  // Eski kayıtlarda nickname olmayabilir (bkz. utils/player.js normalize) —
  // o durumda sınıf adına düşer.
  const displayName = `${player.nickname || displayClassName(player)} · Lv.${player.level}`;

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const parsed = parseGmCommand(text);

    if (parsed && !player.isGM && tryGmUnlock(parsed)) {
      // Parola sohbet geçmişine hiç yazılmıyor (bkz. gmCommands.js'teki not)
      // — sadece bu karaktere isGM veriliyor, mesaj gönderilmiyor.
      setPlayer({ ...player, isGM: true });
      pushToast(t("chat.gmUnlocked"), "loot");
      return;
    }

    if (parsed && player.isGM) {
      await chatService.sendMessage(displayName, text, true, playerAvatarId(player), player.avatarFrameId);
      const { player: nextPlayer, bank: nextBank, resultText } = executeGmCommand(player, parsed.cmd, parsed.args, bank);
      setPlayer(nextPlayer);
      if (nextBank) setBank(nextBank);
      await chatService.sendMessage(t("chat.gmSystemAuthor"), resultText, true, playerAvatarId(player), player.avatarFrameId);
      pushToast(resultText, "loot");
      refresh();
      return;
    }

    await chatService.sendMessage(displayName, text, player.isGM, playerAvatarId(player), player.avatarFrameId);
    refresh();
  };

  // ---- DM sekmesi ----
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const dmLogRef = useRef(null);
  const activeDm = openDmTabs.find((x) => x.accountId === activeDmId) || null;

  const refreshDm = useCallback(async () => {
    if (!activeDm) return;
    try {
      const msgs = await socialService.fetchDirectMessages(activeDm.accountId);
      setDmMessages(msgs);
      const lastFromThem = msgs.filter((m) => !m.mine).slice(-1)[0];
      if (lastFromThem) onSeenDm(activeDm.accountId, lastFromThem.createdAt);
    } catch { /* geçici ağ hatası — bir sonraki periyotta tekrar dener */ }
  }, [activeDm, onSeenDm]);

  useEffect(() => { refreshDm(); }, [refreshDm]);
  useEffect(() => {
    if (!activeDm) return;
    const id = setInterval(refreshDm, 4000);
    return () => clearInterval(id);
  }, [activeDm, refreshDm]);
  useEffect(() => {
    if (activeDm && dmLogRef.current) dmLogRef.current.scrollTop = dmLogRef.current.scrollHeight;
  }, [activeDm, dmMessages.length]);

  const sendDm = async () => {
    const text = dmInput.trim();
    if (!text || !activeDm) return;
    setDmInput("");
    try { await socialService.sendDirectMessage(activeDm.accountId, text, playerAvatarId(player), player.avatarFrameId); refreshDm(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const closeTab = (e, accountId) => {
    e.stopPropagation();
    if (activeDmId === accountId) setActiveDmId(null);
    onCloseDm(accountId);
  };

  return (
    <div className="social-chat-panel" style={styles.panelScroll}>
      {openDmTabs.length > 0 && (
        <div className="rpg-tabs" style={{ ...styles.subtabRow, marginTop: 12 }}>
          <button aria-pressed={activeDmId === null} onClick={() => setActiveDmId(null)} style={{ ...styles.subtabBtn, ...(activeDmId === null ? styles.subtabBtnActive : {}) }}>
            {t("chat.subtabPublic")}
          </button>
          {openDmTabs.map((tabItem) => (
            <button
              key={tabItem.accountId} aria-pressed={activeDmId === tabItem.accountId} onClick={() => setActiveDmId(tabItem.accountId)}
              style={{ ...styles.subtabBtn, ...(activeDmId === tabItem.accountId ? styles.subtabBtnActive : {}), display: "flex", alignItems: "center", gap: 5 }}
            >
              {tabItem.name}
              {dmUnreadIds?.has(tabItem.accountId) && <span style={{ width: 6, height: 6, borderRadius: 3, background: "#C9425A", flexShrink: 0 }} />}
              <X size={11} onClick={(e) => closeTab(e, tabItem.accountId)} />
            </button>
          ))}
        </div>
      )}

      {activeDm ? (
        <>
          <div ref={dmLogRef} className="rpg-chat-log" style={{ ...styles.chatLog, marginTop: 12 }}>
            {dmMessages.map((m) => (
              <div key={m.id} className={`rpg-chat-msg social-message ${m.mine ? "social-message-mine" : ""}`}>
                <Avatar id={m.avatarId} frameId={m.frameId} size={40} />
                <div className="rpg-chat-bubble" style={{ ...styles.chatMsgBubble, ...(m.mine ? { background: "var(--gold-text)", color: "#15171E" } : {}) }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="rpg-chat-compose" style={styles.chatInputRow}>
            <input
              type="text" value={dmInput} onChange={(e) => setDmInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendDm(); }}
              placeholder={t("chat.inputPlaceholderDefault")} style={styles.chatInput}
            />
            <button aria-label={lang === "en" ? "Send message" : "Mesaj gönder"} className="rpg-action" style={styles.tinyBtn} disabled={!dmInput.trim()} onClick={sendDm}>
              <Send size={13} />
            </button>
          </div>
        </>
      ) : (
      <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: openDmTabs.length > 0 ? 8 : 12 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {player.isGM && (
            <button onClick={() => setShowGmPanel((v) => !v)} style={{ background: "none", border: "none", color: showGmPanel ? "var(--gold-text)" : "var(--text-faint)", cursor: "pointer" }} title={t("chat.gmItemPanelTitle")}>
              <Wand2 size={16} />
            </button>
          )}
          <button onClick={() => setShowHelp((v) => !v)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}>
            <HelpCircle size={16} />
          </button>
        </div>
        <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{t("chat.messageTtlHint")}</span>
      </div>

      {showGmPanel && player.isGM && (
        <GmItemPanel player={player} setPlayer={setPlayer} pushToast={pushToast} />
      )}

      {showHelp && (
        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {player.isGM ? (
              <>
                <b>{t("chat.helpGmBadge")}</b> {t("chat.helpGmIntro")}<br />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  {t("chat.helpGmCommands")}
                </span>
              </>
            ) : (
              t("chat.helpNonGm")
            )}
          </div>
        </div>
      )}

      <div ref={logRef} className="rpg-chat-log" style={styles.chatLog}>
        {messages.map((m) => (
          <div key={m.id} className={`rpg-chat-msg social-message ${m.isSystem?'social-system':''}`}>
            {!m.isSystem&&<Avatar id={m.avatarId} frameId={m.frameId} size={40} label={m.author}/>}
            <div className="social-message-content">
            <div className="social-message-meta">
              {m.isGM && <ShieldCheck size={11} color="var(--gold-text)" />}
              <span style={{ color: m.isSystem ? "var(--text-faint)" : m.isGM ? "var(--gold-text)" : "var(--text-muted)" }}>
                {m.isSystem ? t("chat.systemAuthor") : m.author}
              </span>
              <time>{new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</time>
            </div>
            <div className="rpg-chat-bubble" style={{ ...styles.chatMsgBubble, ...(m.isSystem ? { background: "transparent", color: "var(--text-faint)", fontStyle: "italic" } : {}) }}>
              {m.isSystem ? t(m.textKey) : m.text}
            </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rpg-chat-compose" style={styles.chatInputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder={player.isGM ? t("chat.inputPlaceholderGm") : t("chat.inputPlaceholderDefault")}
          style={styles.chatInput}
        />
        <button aria-label={lang === "en" ? "Send message" : "Mesaj gönder"} className="rpg-action" style={styles.tinyBtn} disabled={!input.trim()} onClick={send}>
          <Send size={13} />
        </button>
      </div>
      </>
      )}
    </div>
  );
}
