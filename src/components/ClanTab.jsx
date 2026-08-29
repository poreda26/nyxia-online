import { useState, useEffect } from "react";
import { Shield, LogOut, Plus, ChevronUp, ChevronDown, Swords, Coins, Gem, Flag, Landmark, Skull, Lock, Clock } from "lucide-react";
import { CLASSES } from "../data/classes";
import { RACES } from "../data/races";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS } from "../data/clan";
import { CLAN_BOSS_STAGES, CLAN_BUILDING_MAX_LEVEL, CLAN_BUILDING_UPGRADE_COST } from "../data/clanBoss";
import {
  foundClan, generateDecoyClans, joinClan, leaveClan, promoteMember, demoteMember,
  onlineCountFor, clanExpBonus, canStartDungeon, startDungeon,
  donateNP, donateGold, donateDiamonds, canUpgradeClanBuilding, upgradeClanBuilding,
  clanLeaderboardFor,
} from "../utils/clan";
import {
  unlockedBossStages, openClanBoss, bossTimeLeftMs, bossCurrentHp, bossMaxHp,
  simulatedAttackerCount, canPlayerAttackBoss, attackClanBoss, isClanBossActive,
} from "../utils/clanBoss";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import BarTrack from "./shared/BarTrack";

const ROLE_LABEL = { leader: "Lider", officer: "Yardımcı", member: "Üye" };
const fmt = (n) => Math.round(n).toLocaleString("tr-TR");
const fmtClock = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// Klan tamamen simüle (bkz. utils/clan.js) — gerçek sunucu gelene kadar hem
// kurulan hem katılınan klanlar hayalet üyelerle dolduruluyor. Bu bileşen
// sadece görüntüleme/yönetim katmanı; gerçek "sunucu" geldiğinde
// foundClan/joinClan/generateDecoyClans'ın içi değişecek, arayüz aynı kalır.
export default function ClanTab({ player, setPlayer, pushToast }) {
  const [founding, setFounding] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [donateNpInput, setDonateNpInput] = useState("");
  const [donateGoldInput, setDonateGoldInput] = useState("");
  const [donateDiamondInput, setDonateDiamondInput] = useState("");
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [lbRace, setLbRace] = useState(player.race);

  // Boss açıkken geri sayım/HP saniyeler içinde eskir — bu tick sadece
  // yeniden render tetikler (bkz. utils/clanBoss.js'in "Date.now()'dan
  // türet" notu), player state'ine hiç dokunmuyor.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!player.clan?.boss) return;
    const id = setInterval(() => forceTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, [player.clan?.boss]);

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
    const result = leaveClan(player);
    setPlayer(result.player);
    pushToast(result.refund > 0 ? `Klandan ayrıldın. +${fmt(result.refund)} NP iade edildi.` : "Klandan ayrıldın.", "default");
    setConfirmingLeave(false);
  };

  const handlePromote = (memberId) => setPlayer((p) => promoteMember(p, memberId));
  const handleDemote = (memberId) => setPlayer((p) => demoteMember(p, memberId));

  const handleStartDungeon = () => {
    const result = startDungeon(player);
    if (!result.started) { pushToast(result.reason, "warn"); return; }
    setPlayer(result.player);
    pushToast("Klan Zindanı başlatıldı!", "loot");
  };

  const handleDonateNP = () => {
    const amount = parseInt(donateNpInput, 10);
    const result = donateNP(player, amount);
    if (!result.donated) { pushToast(result.reason || "Bağışlanamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`${fmt(amount)} NP klana bağışlandı.`, "loot");
    setDonateNpInput("");
  };

  const handleDonateGold = () => {
    const amount = parseInt(donateGoldInput, 10);
    const result = donateGold(player, amount);
    if (!result.donated) { pushToast(result.reason || "Bağışlanamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`${fmt(amount)} altın klana bağışlandı.`, "loot");
    setDonateGoldInput("");
  };

  const handleDonateDiamonds = () => {
    const amount = parseInt(donateDiamondInput, 10);
    const result = donateDiamonds(player, amount);
    if (!result.donated) { pushToast(result.reason || "Bağışlanamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`${fmt(amount)} elmas klana bağışlandı.`, "loot");
    setDonateDiamondInput("");
  };

  const handleUpgradeBuilding = () => {
    const result = upgradeClanBuilding(player);
    if (!result.upgraded) { pushToast(result.reason || "Yükseltilemedi.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`Klan Binası Lv.${result.player.clan.buildingLevel} oldu!`, "loot");
  };

  const handleOpenBoss = (stageId) => {
    const result = openClanBoss(player, stageId);
    if (!result.opened) { pushToast(result.reason || "Açılamadı.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`${result.stage.name} çıktı! 1 saatin var.`, "loot");
  };

  const handleAttackBoss = () => {
    const result = attackClanBoss(player);
    if (!result.attacked) { pushToast(result.reason || "Saldıramazsın.", "warn"); return; }
    setPlayer(result.player);
    pushToast(result.isCrit ? `Kritik vuruş! ${result.dmg} hasar verdin.` : `${result.dmg} hasar verdin.`, "loot");
  };

  const lbEntries = clanLeaderboardFor(lbRace, player);
  const leaderboardSection = (
    <>
      <SectionLabel>Klan Sıralaması</SectionLabel>
      <div style={styles.tierScroller}>
        {Object.entries(RACES).map(([key, r]) => (
          <button
            key={key}
            onClick={() => setLbRace(key)}
            style={{ ...styles.tierChip, borderColor: lbRace === key ? r.color : "var(--border)", background: lbRace === key ? `${r.color}1A` : "var(--bg-panel)" }}
          >
            <span style={{ fontSize: 11, color: r.color }}>{r.name}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
        {lbEntries.map((e) => (
          <div key={e.rank} style={{ ...styles.itemRow, ...(e.isPlayerClan ? { borderColor: "#D4AF6A" } : {}) }}>
            <div style={{ width: 20, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: e.rank <= 3 ? "#D4AF6A" : "var(--text-faint)" }}>{e.rank}</div>
            <div style={{ flex: 1, fontSize: 12, color: e.isPlayerClan ? "var(--text-primary)" : "var(--text-muted)" }}>{e.name}{e.isPlayerClan ? " (Senin Klanın)" : ""}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
              <Flag size={10} color="#8B6FC9" /> {fmt(e.nationalPoint)}
            </div>
          </div>
        ))}
      </div>
    </>
  );

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

        {leaderboardSection}
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
  const buildingCheck = canUpgradeClanBuilding(player);
  const nextBuildingCost = CLAN_BUILDING_UPGRADE_COST[clan.buildingLevel + 1];
  const unlocked = unlockedBossStages(clan);
  const bossActive = isClanBossActive(clan);
  const activeStage = clan.boss ? CLAN_BOSS_STAGES.find((s) => s.id === clan.boss.stageId) : null;
  const bossOpenedToday = clan.boss?.lastOpenedDay === new Date().toDateString();

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
          <Landmark size={18} color="#D4AF6A" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>Klan Hazinesi & Klan Binası</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Klan Binası Lv.{clan.buildingLevel}/{CLAN_BUILDING_MAX_LEVEL}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flag size={11} color="#8B6FC9" /> {fmt(clan.treasury.np)} NP</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Coins size={11} color="#D4AF6A" /> {fmt(clan.treasury.gold)}g</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Gem size={11} color="#8B6FC9" /> {fmt(clan.treasury.diamonds)}</span>
        </div>

        {canManageDungeon && (
          nextBuildingCost ? (
            <button
              style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(!buildingCheck.ok ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }}
              disabled={!buildingCheck.ok}
              onClick={handleUpgradeBuilding}
              title={!buildingCheck.ok ? buildingCheck.reason : undefined}
            >
              Binayı Lv.{clan.buildingLevel + 1}'e Yükselt ({fmt(nextBuildingCost.gold)}g + {fmt(nextBuildingCost.diamonds)} elmas)
            </button>
          ) : (
            <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>Klan Binası en üst seviyede.</div>
          )
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder="NP bağışla" value={donateNpInput} onChange={(e) => setDonateNpInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button style={styles.tinyBtn} onClick={handleDonateNP}>Bağışla</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder="Altın bağışla" value={donateGoldInput} onChange={(e) => setDonateGoldInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button style={styles.tinyBtn} onClick={handleDonateGold}>Bağışla</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder="Elmas bağışla" value={donateDiamondInput} onChange={(e) => setDonateDiamondInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button style={styles.tinyBtn} onClick={handleDonateDiamonds}>Bağışla</button>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 8, lineHeight: 1.5 }}>
          Klandan ayrılınca sadece kendi bağışladığın NP'nin %35'i sana geri döner — altın/elmas bağışının iadesi yok.
        </div>
      </div>

      <div style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Skull size={18} color="#A34FD9" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>Klan Boss</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Günde 1 kez açılır, 1 saat sürer, her savaşçı 1 kez saldırabilir.</div>
          </div>
        </div>

        {clan.boss && (bossActive || bossOpenedToday) ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: activeStage?.color }}>{activeStage?.name}</span>
              {bossActive && (
                <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} /> {fmtClock(bossTimeLeftMs(clan))}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              {fmt(bossCurrentHp(clan))}/{fmt(bossMaxHp(clan))} HP
            </div>
            <BarTrack pct={(bossCurrentHp(clan) / bossMaxHp(clan)) * 100} color={activeStage?.color} />
            <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 6 }}>
              {bossActive
                ? `${simulatedAttackerCount(clan)} klan üyesi saldırdı.`
                : bossCurrentHp(clan) <= 0
                  ? "Boss yenildi! Ödül sistemi yakında ekleniyor."
                  : "Süre doldu, boss kaçtı."}
            </div>
            {bossActive && (
              <button
                style={{ ...styles.tinyBtn, width: "100%", marginTop: 8, ...(!canPlayerAttackBoss(player) ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : { background: activeStage?.color }) }}
                disabled={!canPlayerAttackBoss(player)}
                onClick={handleAttackBoss}
              >
                {player.clan.boss.playerAttacked ? "Bu boss'a zaten saldırdın" : "Saldır (tek hakkın var)"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {CLAN_BOSS_STAGES.map((stage) => {
              const isUnlocked = unlocked.some((s) => s.id === stage.id);
              return (
                <div key={stage.id} style={{ ...styles.itemRow, opacity: isUnlocked ? 1 : 0.5, borderColor: `${stage.color}44` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: stage.color }}>{stage.name}</div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                      {fmt(stage.npRequired)} NP · Bina Lv.{stage.buildingLevelRequired}
                    </div>
                  </div>
                  {canManageDungeon ? (
                    <button
                      style={{ ...styles.tinyBtn, background: isUnlocked ? stage.color : "var(--bg-panel-alt)", color: isUnlocked ? "#0B0C10" : "var(--text-faint)" }}
                      disabled={!isUnlocked}
                      onClick={() => handleOpenBoss(stage.id)}
                    >
                      {isUnlocked ? "Aç" : <Lock size={11} />}
                    </button>
                  ) : (
                    !isUnlocked && <Lock size={12} color="var(--text-faint)" />
                  )}
                </div>
              );
            })}
          </div>
        )}
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

      {leaderboardSection}

      <button style={{ ...styles.ghostBtn, marginTop: 14 }} onClick={() => setConfirmingLeave(true)}>
        <LogOut size={13} /> Klanı Terk Et
      </button>

      {confirmingLeave && (
        <div style={styles.modalOverlay} onClick={() => setConfirmingLeave(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <LogOut size={28} color="#C9425A" strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 260 }}>
              {clan.name} klanından ayrılmak üzeresin. Rütbeni ve klan hazinesindeki payını kaybedersin — sadece kendi bağışladığın NP'nin %35'i geri döner. Emin misin?
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingLeave(false)}>Vazgeç</button>
              <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={handleLeave}>Evet, Ayrıl</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
