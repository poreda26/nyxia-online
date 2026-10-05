import { gmGrantDiamonds, gmGrantPremium } from "../services/walletService";
import { getActiveCharacterKey } from "../utils/api";
import { applyEntitlement } from "../utils/diamondCharge";
import { startPolling } from "../utils/polling";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, HelpCircle, Wand2, X, Globe2, MessageCircle } from "./icons/GameIcons";
import { styles } from "../styles";
import * as chatService from "../services/chatService";
import * as socialService from "../services/socialService";
import { parseGmCommand, executeGmCommand } from "../utils/gmCommands";
import { displayClassName } from "../utils/player";
import GmItemPanel from "./GmItemPanel";
import ModerationMenu from "./ModerationMenu";
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
  act, isGM = false, player, setPlayer, bank, setBank, pushToast,
  openDmTabs = [], dmUnreadIds, pendingActiveDm = null, onConsumePendingActiveDm, onCloseDm, onSeenDm,
}) {
  const { t, lang } = useTranslation();
  const [activeDmId, setActiveDmId] = useState(pendingActiveDm);
  useEffect(() => {
    if (pendingActiveDm != null) onConsumePendingActiveDm?.();
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
    } catch { /* geçici ağ hatası — aralık uzar, sonra tekrar dener */ return false; }
  }, []);

  useEffect(() => { if (activeDmId === null) refresh(); }, [activeDmId, refresh]);
  // Diğer oyuncuların mesajlarını görmek için periyodik yenileme.
  useEffect(() => {
    if (activeDmId !== null) return;
    return startPolling(refresh, 4000, { runNow: false });
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

    try {
    const parsed = parseGmCommand(text);

    if (parsed && isGM) {
      await chatService.sendMessage(displayName, text, playerAvatarId(player), player.avatarFrameId);
      let { player: nextPlayer, bank: nextBank, resultText } = executeGmCommand(player, parsed.cmd, parsed.args, bank);
      if (parsed.cmd === "elmas") {
        const amount = Math.max(1, parseInt(parsed.args[0], 10) || 100);
        const granted = await gmGrantDiamonds(amount);
        setPlayer((p) => ({ ...p, diamonds: granted.diamonds }));
      } else if (parsed.cmd === "premium" && ["mythic", "apex"].includes((parsed.args[0] || "").toLowerCase())) {
        const granted = await gmGrantPremium(getActiveCharacterKey(), parsed.args[0].toLowerCase());
        setPlayer((p) => applyEntitlement({ ...nextPlayer, diamonds: p.diamonds }, granted.entitlement));
        if (nextBank) setBank(nextBank);
      } else if (act.isServer()) {
        // Sunucu ekonomisinde komut sunucuda çalışır (yetki orada denetlenir); sonuç metni de oradan gelir.
        const ran = await act("gm/exec", { cmd: parsed.cmd, args: parsed.args });
        resultText = ran.ok ? ran.resultText : (ran.reason === "notGm" ? "GM yetkin yok." : "Komut çalıştırılamadı.");
      } else {
        setPlayer(nextPlayer);
        if (nextBank) setBank(nextBank);
      }
      await chatService.sendMessage(t("chat.gmSystemAuthor"), resultText, playerAvatarId(player), player.avatarFrameId);
      pushToast(resultText, "loot");
      refresh();
      return;
    }

    await chatService.sendMessage(displayName, text, playerAvatarId(player), player.avatarFrameId);
    refresh();
    } catch(e) { setInput(text);pushToast(e.code==='ACCOUNT_MUTED'?'Sohbet yetkin geçici olarak kapatıldı.':'Mesaj gönderilemedi.','warn'); }
  };

  // ---- DM sekmesi ----
  const [dmMessages, setDmMessages] = useState([]);
  const [dmDrafts,setDmDrafts]=useState({});
  const dmInput=dmDrafts[activeDmId]||"";
  const setDmInput=value=>setDmDrafts(d=>({...d,[activeDmId]:value}));
  const dmLogRef = useRef(null);
  const activeDm = openDmTabs.find((x) => x.accountId === activeDmId) || null;

  const currentDm=useRef(activeDmId);currentDm.current=activeDmId;
  useEffect(()=>{setDmMessages([])},[activeDmId]);

  const refreshDm = useCallback(async () => {
    if (!activeDm) return;
    try {
      const msgs = await socialService.fetchDirectMessages(activeDm.accountId);
      if(currentDm.current!==activeDm.accountId)return;
      setDmMessages(msgs);
      const lastFromThem = msgs.filter((m) => !m.mine).slice(-1)[0];
      if (lastFromThem) onSeenDm?.(activeDm.accountId, lastFromThem.createdAt);
    } catch { /* geçici ağ hatası — aralık uzar, sonra tekrar dener */ return false; }
  }, [activeDm, onSeenDm]);

  useEffect(() => { refreshDm(); }, [refreshDm]);
  useEffect(() => {
    if (!activeDm) return;
    return startPolling(refreshDm, 4000, { runNow: false });
  }, [activeDm, refreshDm]);
  useEffect(() => {
    if (activeDm && dmLogRef.current) dmLogRef.current.scrollTop = dmLogRef.current.scrollHeight;
  }, [activeDm, dmMessages.length]);

  const sendDm = async () => {
    const text = dmInput.trim();
    if (!text || !activeDm) return;
    setDmInput("");
    try { await socialService.sendDirectMessage(activeDm.accountId, text, playerAvatarId(player), player.avatarFrameId); refreshDm(); }
    catch (error) { setDmDrafts(d=>({...d,[activeDm.accountId]:d[activeDm.accountId]||text}));pushToast(error.code==='ACCOUNT_MUTED'?'Sohbet yetkin geçici olarak kapatıldı.':formatServerError(t, error), "warn"); }
  };

  const closeTab = (e, accountId) => {
    e.stopPropagation();
    if (activeDmId === accountId) setActiveDmId(null);
    onCloseDm?.(accountId);
  };

  return (
    <div className="social-chat-panel" style={styles.panelScroll}>
      <div className="conversation-rail" aria-label={lang==='en'?'Conversations':'Konuşmalar'}>
        <button className={`conversation-public ${activeDmId===null?'is-active':''}`} aria-pressed={activeDmId===null} onClick={()=>setActiveDmId(null)}><Globe2 size={18}/><span>{t('chat.subtabPublic')}</span></button>
        {openDmTabs.map(thread=><div key={thread.accountId} className={`conversation-chip ${activeDmId===thread.accountId?'is-active':''}`}>
          <button className="conversation-select" aria-pressed={activeDmId===thread.accountId} onClick={()=>setActiveDmId(thread.accountId)} title={thread.name}><MessageCircle size={16}/><span>{thread.name}</span>{dmUnreadIds?.has(thread.accountId)&&<i aria-label={lang==='en'?'Unread message':'Okunmamış mesaj'}/>}</button>
          <button className="conversation-close" aria-label={`${thread.name} ${lang==='en'?'close conversation':'konuşmasını kapat'}`} onClick={e=>closeTab(e,thread.accountId)}><X size={15}/></button>
        </div>)}
      </div>
      {activeDm&&<div className="conversation-heading"><span><MessageCircle size={14}/><strong>{activeDm.name}</strong></span><small>{lang==='en'?'Private conversation':'Özel konuşma'}</small><ModerationMenu target={{accountId:activeDm.accountId}} name={activeDm.name} pushToast={pushToast} onBlocked={()=>{setActiveDmId(null);onCloseDm?.(activeDm.accountId);}}/></div>}

      {activeDm ? (
        <>
          <div role="log" aria-label={lang==='en'?'Private messages':'Özel mesajlar'} ref={dmLogRef} className="rpg-chat-log" style={{ ...styles.chatLog, marginTop: 12 }}>
            {!dmMessages.length&&<div className="conversation-empty"><MessageCircle size={28}/><span>{lang==='en'?'Start a conversation with your friend.':'Arkadaşınla sohbet etmeye başla.'}</span></div>}
            {dmMessages.map((m) => (
              <div key={m.id} className={`rpg-chat-msg social-message ${m.mine ? "social-message-mine" : ""}`}>
                <Avatar id={m.avatarId} frameId={m.frameId} size={40} />
                <div className="rpg-chat-bubble" style={{ ...styles.chatMsgBubble, ...(m.mine ? { background: "var(--gold-text)", color: "#15171E" } : {}) }}>
                  {m.text}
                  <time className="dm-time">{new Date(m.createdAt).toLocaleTimeString(lang==='en'?'en-GB':'tr-TR',{hour:'2-digit',minute:'2-digit'})}</time>
                </div>
                {!m.mine&&<ModerationMenu target={{dmId:m.id}} name={activeDm.name} pushToast={pushToast} size={12} onBlocked={()=>{setActiveDmId(null);onCloseDm?.(activeDm.accountId);}}/>}
              </div>
            ))}
          </div>
          <div className="rpg-chat-compose" style={styles.chatInputRow}>
            <input
              type="text" value={dmInput} onChange={(e) => setDmInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) sendDm(); }}
              placeholder={t("chat.inputPlaceholderDefault")} style={styles.chatInput}
            />
            <button aria-label={lang === "en" ? "Send message" : "Mesaj gönder"} className="rpg-action" style={styles.tinyBtn} disabled={!dmInput.trim()} onClick={sendDm}>
              <Send size={13} />
            </button>
          </div>
        </>
      ) : (
      <>
      <div className="conversation-tools" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isGM && (
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

      {showGmPanel && isGM && (
        <GmItemPanel player={player} setPlayer={setPlayer} act={act} pushToast={pushToast} />
      )}

      {showHelp && (
        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {isGM ? (
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
              {!m.isSystem&&!m.mine&&<ModerationMenu target={{messageId:m.id}} name={m.author} pushToast={pushToast} size={11} onBlocked={refresh}/>}
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
          onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) send(); }}
          placeholder={isGM ? t("chat.inputPlaceholderGm") : t("chat.inputPlaceholderDefault")}
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
