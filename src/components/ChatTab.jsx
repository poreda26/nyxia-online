import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, HelpCircle, Wand2 } from "lucide-react";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import * as chatService from "../services/chatService";
import { parseGmCommand, executeGmCommand, tryGmUnlock } from "../utils/gmCommands";
import { displayClassName } from "../utils/player";
import GmItemPanel from "./GmItemPanel";
import { useTranslation } from "../i18n/LanguageContext";

export default function ChatTab({ player, setPlayer, bank, setBank, pushToast }) {
  const { t } = useTranslation();
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

  useEffect(() => { refresh(); }, [refresh]);
  // Diğer oyuncuların mesajlarını görmek için periyodik yenileme.
  useEffect(() => {
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length]);

  const displayName = `${displayClassName(player)} · Lv.${player.level}`;

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
      await chatService.sendMessage(displayName, text, true);
      const { player: nextPlayer, bank: nextBank, resultText } = executeGmCommand(player, parsed.cmd, parsed.args, bank);
      setPlayer(nextPlayer);
      if (nextBank) setBank(nextBank);
      await chatService.sendMessage(t("chat.gmSystemAuthor"), resultText, true);
      pushToast(resultText, "loot");
      refresh();
      return;
    }

    await chatService.sendMessage(displayName, text, player.isGM);
    refresh();
  };

  return (
    <div style={styles.panelScroll}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          {player.isGM && (
            <button onClick={() => setShowGmPanel((v) => !v)} style={{ background: "none", border: "none", color: showGmPanel ? "var(--gold-text)" : "var(--text-faint)", cursor: "pointer" }} title={t("chat.gmItemPanelTitle")}>
              <Wand2 size={16} />
            </button>
          )}
          <button onClick={() => setShowHelp((v) => !v)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}>
            <HelpCircle size={16} />
          </button>
        </div>
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
          <div key={m.id} className="rpg-chat-msg" style={styles.chatMsg}>
            <div style={styles.chatMsgHeader}>
              {m.isGM && <ShieldCheck size={11} color="var(--gold-text)" />}
              <span style={{ color: m.isSystem ? "var(--text-faint)" : m.isGM ? "var(--gold-text)" : "var(--text-muted)" }}>
                {m.isSystem ? t("chat.systemAuthor") : m.author}
              </span>
              <span>{new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="rpg-chat-bubble" style={{ ...styles.chatMsgBubble, ...(m.isSystem ? { background: "transparent", color: "var(--text-faint)", fontStyle: "italic" } : {}) }}>
              {m.isSystem ? t(m.textKey) : m.text}
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
        <button className="rpg-action" style={styles.tinyBtn} onClick={send}>
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
