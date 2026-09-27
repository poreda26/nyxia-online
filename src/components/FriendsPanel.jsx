import { useState, useEffect, useCallback, useRef } from "react";
import { UserPlus, Check, X, MessageCircle, ArrowLeft, Send, Users, Sparkles } from "lucide-react";
import * as socialService from "../services/socialService";
import { useTranslation, formatServerError } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import Avatar from './Avatar';
import {playerAvatarId} from '../data/avatars';
import { FRIEND_MAX_COUNT } from '../data/social';

// Kullanıcı isteği: "arkadaş ekleme - özel sohbet - vs - klan daveti vb.
// özellikleri ekle" (bkz. de "Arkadaşlar için bir sekme yap... arkadaş
// önerilerinin gözüktüğü bir sistem olsun... Maksimum 50 arkadaşımız
// olabilir") — arkadaş listesi + öneriler + iki hesap arasındaki özel
// mesajlaşma. Artık kendi bottom-nav sekmesi (bkz. Hub.jsx, BottomNav.jsx).
export default function FriendsPanel({ pushToast, player }) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [addName, setAddName] = useState("");
  const [activeThread, setActiveThread] = useState(null); // { accountId, name } | null
  const [messages, setMessages] = useState([]);
  const [threadInput, setThreadInput] = useState("");
  const logRef = useRef(null);
  const atLimit = friends.length >= FRIEND_MAX_COUNT;

  const refreshFriends = useCallback(async () => {
    try {
      const data = await socialService.fetchFriends();
      setFriends(data.friends);
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch { /* geçici ağ hatası */ }
    try { setSuggestions(await socialService.fetchSuggestions()); }
    catch { /* geçici ağ hatası */ }
  }, []);

  useEffect(() => { refreshFriends(); }, [refreshFriends]);
  useEffect(() => {
    const id = setInterval(refreshFriends, 10000);
    return () => clearInterval(id);
  }, [refreshFriends]);

  const refreshThread = useCallback(async () => {
    if (!activeThread) return;
    try { setMessages(await socialService.fetchDirectMessages(activeThread.accountId)); }
    catch { /* geçici ağ hatası */ }
  }, [activeThread]);

  useEffect(() => { refreshThread(); }, [refreshThread]);
  useEffect(() => {
    if (!activeThread) return;
    const id = setInterval(refreshThread, 4000);
    return () => clearInterval(id);
  }, [activeThread, refreshThread]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length]);

  const sendRequestTo = async (name) => {
    if (atLimit) { pushToast(t("chat.friends.limitReached", { max: FRIEND_MAX_COUNT }), "warn"); return; }
    try {
      const result = await socialService.sendFriendRequest(name);
      pushToast(t(result.status === "accepted" ? "chat.friends.toastNowFriends" : "chat.friends.toastRequestSent", { name }), "loot");
      setSuggestions((list) => list.filter((s) => s.accountName !== name));
      refreshFriends();
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };
  const handleAddFriend = async () => {
    const name = addName.trim().toLowerCase();
    if (!name) return;
    await sendRequestTo(name);
    setAddName("");
  };

  const handleAccept = async (id) => {
    try { await socialService.acceptFriendRequest(id); refreshFriends(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };
  const handleDecline = async (id) => {
    try { await socialService.declineFriendRequest(id); refreshFriends(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };
  const handleRemove = async (accountId) => {
    try {
      await socialService.removeFriend(accountId);
      if (activeThread?.accountId === accountId) setActiveThread(null);
      refreshFriends();
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const sendThreadMessage = async () => {
    const text = threadInput.trim();
    if (!text || !activeThread) return;
    setThreadInput("");
    try { await socialService.sendDirectMessage(activeThread.accountId, text, playerAvatarId(player), player.avatarFrameId); refreshThread(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  if (activeThread) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 8 }}>
          <button onClick={() => setActiveThread(null)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ fontSize: 13, fontFamily: "var(--font-display)" }}>{activeThread.name}</div>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-faint)" }}>{t("chat.messageTtlHint")}</span>
        </div>
        <div ref={logRef} className="rpg-chat-log" style={styles.chatLog}>
          {messages.map((m) => (
            <div key={m.id} className={`rpg-chat-msg social-message ${m.mine ? "social-message-mine" : ""}`}>
              <Avatar id={m.avatarId} frameId={m.frameId} size={40}/>
              <div className="rpg-chat-bubble" style={{ ...styles.chatMsgBubble, ...(m.mine ? { background: "var(--gold-text)", color: "#15171E" } : {}) }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="rpg-chat-compose" style={styles.chatInputRow}>
          <input
            type="text" value={threadInput} onChange={(e) => setThreadInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendThreadMessage(); }}
            placeholder={t("chat.inputPlaceholderDefault")} style={styles.chatInput}
          />
          <button className="rpg-action" style={styles.tinyBtn} onClick={sendThreadMessage}><Send size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panelScroll}>
      <div className="rpg-card" style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={16} color="var(--gold-text)" strokeWidth={1.6} />
          <div style={{ flex: 1, fontSize: 13 }}>{t("chat.friends.addHeading")}</div>
          <div style={{ fontSize: 10, color: atLimit ? "#E8A5AF" : "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            {friends.length}/{FRIEND_MAX_COUNT}
          </div>
        </div>
        {atLimit ? (
          <div style={{ fontSize: 10, color: "#E8A5AF", marginTop: 8 }}>{t("chat.friends.limitReached", { max: FRIEND_MAX_COUNT })}</div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddFriend(); }}
              placeholder={t("chat.friends.addPlaceholder")} style={{ ...styles.selectInput, flex: 1 }} maxLength={24}
            />
            <button className="rpg-action" style={styles.tinyBtn} onClick={handleAddFriend}>{t("chat.friends.addBtn")}</button>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !atLimit && (
        <>
          <SectionLabel><Sparkles size={13}/>{t("chat.friends.suggestionsTitle")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {suggestions.map((s) => (
              <div key={s.accountId} className="rpg-row" style={styles.itemRow}>
                <Avatar id={s.avatarId} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12 }}>{s.name}{s.level > 0 ? ` · Lv.${s.level}` : ""}</div>
                  {s.mutualFriends > 0 && (
                    <div style={{ fontSize: 9, color: "var(--text-faint)" }}>{t("chat.friends.mutualFriends", { count: s.mutualFriends })}</div>
                  )}
                </div>
                <button className="rpg-action" style={styles.tinyBtn} onClick={() => sendRequestTo(s.accountName)}>{t("chat.friends.addBtn")}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {incoming.length > 0 && (
        <>
          <SectionLabel>{t("chat.friends.incomingTitle")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {incoming.map((r) => (
              <div key={r.id} className="rpg-row" style={styles.itemRow}>
                <div style={{ flex: 1, fontSize: 12 }}>{r.fromName}</div>
                <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#5FA8A0" }} onClick={() => handleAccept(r.id)}><Check size={12} /></button>
                <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => handleDecline(r.id)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {outgoing.length > 0 && (
        <>
          <SectionLabel>{t("chat.friends.outgoingTitle")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {outgoing.map((r) => (
              <div key={r.id} className="rpg-row" style={styles.itemRow}>
                <div style={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>{r.toName}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)" }}>{t("chat.friends.pending")}</div>
                <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => handleDecline(r.id)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel><Users size={13}/>{t("chat.friends.listTitle")}</SectionLabel>
      {friends.length === 0 ? (
        <EmptyState icon={Users} title={t("chat.friends.emptyTitle")} subtitle={t("chat.friends.emptySubtitle")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {friends.map((f) => (
            <div key={f.accountId} className="rpg-row" style={styles.itemRow}>
              <div style={{ flex: 1, fontSize: 12 }}>{f.name}</div>
              <button className="rpg-action" style={styles.tinyBtn} onClick={() => setActiveThread({ accountId: f.accountId, name: f.name })}><MessageCircle size={12} /></button>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "#E8A5AF" }} onClick={() => handleRemove(f.accountId)}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
