import { useState, useEffect, useCallback } from "react";
import { UserPlus, Check, X, MessageCircle, Users, Sparkles } from "lucide-react";
import * as socialService from "../services/socialService";
import { useTranslation, formatServerError } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import Avatar from './Avatar';
import ModerationMenu from './ModerationMenu';
import { FRIEND_MAX_COUNT } from '../data/social';

// Kullanıcı isteği: "arkadaş ekleme - özel sohbet - vs - klan daveti vb.
// özellikleri ekle" (bkz. de "Arkadaşlar için bir sekme yap... arkadaş
// önerilerinin gözüktüğü bir sistem olsun... Maksimum 50 arkadaşımız
// olabilir... arkadaşlarımızla olan konuşmalarımız sohbette ek sekme
// olarak gözükebilir") — arkadaş listesi + öneriler. Özel mesajlaşmanın
// kendisi artık burada değil, Sohbet'te bir sekme (bkz. ChatTab.jsx,
// Hub.jsx#openDm) — "Mesaj" butonu oraya yönlendiriyor.
export default function FriendsPanel({ pushToast, dmUnreadIds, onOpenDm }) {
  const { t, lang } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [addName, setAddName] = useState("");
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
    try { setBlocks(await socialService.fetchBlocks()); }
    catch { /* geçici ağ hatası */ }
  }, []);

  useEffect(() => { refreshFriends(); }, [refreshFriends]);
  useEffect(() => {
    const id = setInterval(refreshFriends, 10000);
    return () => clearInterval(id);
  }, [refreshFriends]);

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
      refreshFriends();
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };
  const handleUnblock = async (accountId) => {
    try {
      await socialService.unblockUser(accountId);
      refreshFriends();
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  return (
    <div className="friends-panel" style={styles.panelScroll}>
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
                <Avatar id={s.avatarId} size={40} />
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
                <ModerationMenu target={{ accountId: r.fromAccountId }} name={r.fromName} pushToast={pushToast} onBlocked={refreshFriends} />
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
              <div style={{ flex: 1, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                {f.name}
                {dmUnreadIds?.has(f.accountId) && <span style={{ width: 6, height: 6, borderRadius: 3, background: "#C9425A", flexShrink: 0 }} />}
              </div>
              <ModerationMenu target={{ accountId: f.accountId }} name={f.name} pushToast={pushToast} onBlocked={refreshFriends} />
              <button className="rpg-action" style={styles.tinyBtn} aria-label={`${f.name} — ${lang==='en'?'Send message':'Mesaj gönder'}`} onClick={() => onOpenDm(f)}><MessageCircle size={12} /></button>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "#E8A5AF" }} aria-label={`${f.name} — ${lang==='en'?'Remove friend':'Arkadaşlıktan çıkar'}`} onClick={() => handleRemove(f.accountId)}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {blocks.length > 0 && (
        <>
          <SectionLabel>{lang === "en" ? "Blocked players" : "Engellenen oyuncular"}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {blocks.map((b) => (
              <div key={b.accountId} className="rpg-row" style={styles.itemRow}>
                <div style={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>{b.name}</div>
                <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-primary)" }} onClick={() => handleUnblock(b.accountId)}>{lang === "en" ? "Unblock" : "Engeli kaldır"}</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
