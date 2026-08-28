import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, HelpCircle, Wand2 } from "lucide-react";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import * as chatService from "../services/chatService";
import { parseGmCommand, executeGmCommand } from "../utils/gmCommands";
import { displayClassName } from "../utils/player";
import GmItemPanel from "./GmItemPanel";

export default function ChatTab({ player, setPlayer, bank, setBank, pushToast }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showGmPanel, setShowGmPanel] = useState(false);
  const logRef = useRef(null);

  const refresh = useCallback(async () => {
    const msgs = await chatService.fetchMessages();
    setMessages(msgs);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length]);

  const displayName = `${displayClassName(player)} · Lv.${player.level}`;

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const parsed = parseGmCommand(text);
    if (parsed && player.isGM) {
      await chatService.sendMessage(displayName, text, true);
      const { player: nextPlayer, bank: nextBank, resultText } = executeGmCommand(player, parsed.cmd, parsed.args, bank);
      setPlayer(nextPlayer);
      if (nextBank) setBank(nextBank);
      await chatService.sendMessage("GM Sistemi", resultText, true);
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
        <SectionLabel>Sohbet</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          {player.isGM && (
            <button onClick={() => setShowGmPanel((v) => !v)} style={{ background: "none", border: "none", color: showGmPanel ? "#D4AF6A" : "var(--text-faint)", cursor: "pointer" }} title="GM Eşya Üretici">
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
        <div style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {player.isGM ? (
              <>
                <b>GM yetkin var.</b> "/" ile başlayan mesajlar komut olarak çalışır:<br />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  /altın [miktar] · /zırh [tier] [sınıf] · /silah [tier] · /aksesuar [tier] · /parşömen [tier] · /iksir [hp|mp] [adet] · /sandık [tier] · /skill [id] · /uyan · /yardım
                </span>
              </>
            ) : (
              "Burada diğer oyuncularla sohbet edebilirsin. Özel komutlar sadece Game Moderatör yetkisi olanlar için."
            )}
          </div>
        </div>
      )}

      <div ref={logRef} style={styles.chatLog}>
        {messages.map((m) => (
          <div key={m.id} style={styles.chatMsg}>
            <div style={styles.chatMsgHeader}>
              {m.isGM && <ShieldCheck size={11} color="#D4AF6A" />}
              <span style={{ color: m.isSystem ? "var(--text-faint)" : m.isGM ? "#D4AF6A" : "var(--text-muted)" }}>
                {m.author}
              </span>
              <span>{new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div style={{ ...styles.chatMsgBubble, ...(m.isSystem ? { background: "transparent", color: "var(--text-faint)", fontStyle: "italic" } : {}) }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chatInputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder={player.isGM ? "Mesaj yaz ya da /yardım..." : "Mesaj yaz..."}
          style={styles.chatInput}
        />
        <button style={styles.tinyBtn} onClick={send}>
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
