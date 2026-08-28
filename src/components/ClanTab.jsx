import { useState } from "react";
import { Shield, LogOut, Plus, ChevronUp, ChevronDown, Swords } from "lucide-react";
import { CLASSES } from "../data/classes";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS } from "../data/clan";
import {
  foundClan, generateDecoyClans, joinClan, leaveClan, promoteMember, demoteMember,
  onlineCountFor, clanExpBonus, canStartDungeon, startDungeon,
} from "../utils/clan";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";

const ROLE_LABEL = { leader: "Lider", officer: "Yardımcı", member: "Üye" };

// Klan tamamen simüle (bkz. utils/clan.js) — gerçek sunucu gelene kadar hem
// kurulan hem katılınan klanlar hayalet üyelerle dolduruluyor. Bu bileşen
// sadece görüntüleme/yönetim katmanı; gerçek "sunucu" geldiğinde
// foundClan/joinClan/generateDecoyClans'ın içi değişecek, arayüz aynı kalır.
export default function ClanTab({ player, setPlayer, pushToast }) {
  const [founding, setFounding] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleFound = () => {
    const result = foundClan(player, nameInput);
    if (!result.founded) { pushToast(result.reason, "warn"); return; }
    setPlayer(result.player);
    pushToast(`${result.player.clan.name} kuruldu!`, "loot");
    setFounding(false);
    setNameInput("");
  };

  const handleJoin = (decoyClan) => {
    const result = joinClan(player, decoyClan);
    if (!result.joined) { pushToast(result.reason, "warn"); return; }
    setPlayer(result.player);
    pushToast(`${decoyClan.name} klanına katıldın.`, "loot");
  };

  const handleLeave = () => {
    setPlayer((p) => leaveClan(p));
    pushToast("Klandan ayrıldın.", "default");
  };

  const handlePromote = (memberId) => setPlayer((p) => promoteMember(p, memberId));
  const handleDemote = (memberId) => setPlayer((p) => demoteMember(p, memberId));

  const handleStartDungeon = () => {
    const result = startDungeon(player);
    if (!result.started) { pushToast(result.reason, "warn"); return; }
    setPlayer(result.player);
    pushToast("Klan Zindanı başlatıldı!", "loot");
  };

  if (!player.clan) {
    const decoyClans = generateDecoyClans(player);
    return (
      <div style={styles.panelScroll}>
        <SectionLabel>Klan</SectionLabel>
        <div style={styles.itemDetailCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={18} color="#D4AF6A" strokeWidth={1.6} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>Klan Kur</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{CLAN_FOUND_COST_DIAMONDS} Elmas — lideri sen olursun.</div>
            </div>
          </div>
          {founding ? (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input
                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                placeholder="Klan adı" style={styles.selectInput} maxLength={24}
              />
              <button style={styles.tinyBtn} onClick={handleFound}>Kur</button>
            </div>
          ) : (
            <button style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => setFounding(true)}>
              <Plus size={12} /> Klan Kur
            </button>
          )}
        </div>

        <SectionLabel>Mevcut Klanlar</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {decoyClans.map((c) => (
            <div key={c.id} style={{ ...styles.itemRow, borderColor: `${c.color}44` }}>
              <div style={{ ...styles.monsterIcon, width: 32, height: 32, background: `${c.color}22`, color: c.color }}>
                <Shield size={16} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{c.members.length + 1}/{CLAN_MAX_MEMBERS} üye</div>
              </div>
              <button style={{ ...styles.tinyBtn, background: c.color }} onClick={() => handleJoin(c)}>Katıl</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const clan = player.clan;
  const online = onlineCountFor(clan);
  const bonus = clanExpBonus(online);
  const isLeader = clan.role === "leader";
  const officerCount = clan.members.filter((m) => m.role === "officer").length;
  const dungeonReady = canStartDungeon(player);
  const canManageDungeon = clan.role === "leader" || clan.role === "officer";

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Klan</SectionLabel>
      <div style={{ ...styles.itemDetailCard, borderColor: `${clan.color}66`, background: `${clan.color}0d` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={22} color={clan.color} strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: clan.color }}>{clan.name}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{ROLE_LABEL[clan.role]} · {clan.members.length + 1}/{CLAN_MAX_MEMBERS} üye</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
          <span>Online: {online}</span>
          <span>EXP Bonusu: {bonus > 0 ? `+%${Math.round(bonus * 100)}` : "yok"}</span>
        </div>
      </div>

      <div style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Swords size={18} color="#C9425A" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>Klan Zindanı</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
              {clan.dungeon.lastStartedDay ? `Bugün ${clan.dungeon.startedBy} tarafından başlatıldı.` : "Bugün henüz başlatılmadı."}
            </div>
          </div>
        </div>
        {canManageDungeon ? (
          <button
            style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(!dungeonReady ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }}
            disabled={!dungeonReady}
            onClick={handleStartDungeon}
          >
            {dungeonReady ? "Zindanı Başlat" : "Bugün Zaten Başlatıldı"}
          </button>
        ) : (
          <button style={{ ...styles.tinyBtn, width: "100%", marginTop: 10 }} onClick={() => pushToast("Zindan içeriği yakında ekleniyor.", "default")}>
            Zindana Katıl
          </button>
        )}
      </div>

      <SectionLabel>Üyeler</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {clan.members.map((m) => {
          const MIcon = CLASSES[m.cls].icon;
          return (
            <div key={m.id} style={styles.itemRow}>
              <div style={{ ...styles.monsterIcon, width: 28, height: 28, background: `${CLASSES[m.cls].color}22`, color: CLASSES[m.cls].color }}>
                <MIcon size={13} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12 }}>{m.name}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{ROLE_LABEL[m.role]}</div>
              </div>
              {isLeader && m.role !== "leader" && (
                m.role === "officer" ? (
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => handleDemote(m.id)} title="Rütbeyi indir">
                    <ChevronDown size={11} />
                  </button>
                ) : (
                  <button
                    style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", opacity: officerCount >= CLAN_MAX_OFFICERS ? 0.4 : 1 }}
                    disabled={officerCount >= CLAN_MAX_OFFICERS}
                    onClick={() => handlePromote(m.id)}
                    title="Yardımcı yap"
                  >
                    <ChevronUp size={11} />
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      <button style={{ ...styles.ghostBtn, marginTop: 14 }} onClick={handleLeave}>
        <LogOut size={13} /> Klanı Terk Et
      </button>
    </div>
  );
}
