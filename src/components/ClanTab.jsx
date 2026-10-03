import { startPolling } from "../utils/polling";
import {getActiveCharacterKey} from '../utils/api';
import {mergeClanResponse} from '../utils/clanResponse';
import RankBadge from './shared/RankBadge';
import MenuEmblem from './icons/MenuEmblem';
import Avatar,{AvatarPicker} from './Avatar';
import {updateClanAvatar} from '../services/clanService';
import { useState, useEffect, useCallback } from "react";
import { Shield, LogOut, Plus, ChevronUp, ChevronDown, UserX, Coins, Gem, Flag, Landmark, Skull, Lock, Clock, Mail } from "lucide-react";
import { CLASSES } from "../data/classes";
import { RACES } from "../data/races";
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_FOUND_COST_DIAMONDS, CLAN_COLORS } from "../data/clan";
import { CLAN_BOSS_STAGES, CLAN_BUILDING_MAX_LEVEL, CLAN_BUILDING_UPGRADE_COST } from "../data/clanBoss";
import { CLAN_BUILDING_MATERIAL_COST, CLAN_DUNGEON_MATERIALS } from "../data/clanDungeon";
import { onlineCountFor, clanExpBonus, clanLeaderboardFor } from "../utils/clan";
import {
  unlockedBossStages, openClanBoss, bossTimeLeftMs, bossCurrentHp, bossMaxHp,
  canPlayerAttackBoss, attackClanBoss, isClanBossActive,
} from "../utils/clanBoss";
import {
  fetchMyClan, foundClanApi, inviteToClan, fetchClanInvites, acceptClanInvite, declineClanInvite,
  leaveClanApi, kickClanMember, promoteClanMember, demoteClanMember, donateToClan, upgradeClanBuildingApi,
} from "../services/clanService";
import { pick } from "../utils/random";
import { newlyUnlocked } from "../utils/achievements";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import BarTrack from "./shared/BarTrack";
import EmptyState from "./shared/EmptyState";
import ClanDungeonPanel from "./ClanDungeonPanel";
import { useTranslation, formatReason, formatServerError } from "../i18n/LanguageContext";

const fmt = (n) => Math.round(n).toLocaleString("tr-TR");
const fmtClock = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// Sunucudan gelen /api/clan/mine yanıtını, player.clan'ın eski (bkz. git
// geçmişi) yerel biçimine eşler — utils/clanBoss.js ve utils/clan.js'in
// klanla ilgili geri kalan yerel hesapları (EXP bonusu, Klan Boss — kasıtlı
// olarak kapsam dışı bırakıldı, bkz. bu dosyanın altındaki not) hiç
// değişmeden aynı alanları okumaya devam edebilsin diye. boss SUNUCUDA yok
// (yerel kalmaya devam ediyor) — önceki değeri koru. Klan Dungeon (yeni,
// 20 aşamalı) tamamen sunucuda yaşıyor (bkz. ClanDungeonPanel.jsx), burada
// hiç taşınmıyor — eski yerel "Klan Zindanı" placeholder'ı bu yüzden
// tamamen kaldırıldı (utils/clan.js#canStartDungeon/startDungeon).
// Kullanıcı isteği: "arkadaş ekleme - özel sohbet - klan daveti vb.
// özellikleri ekle" + "klanı da tam çok-oyunculu yap" — klan üyeliği/davet/
// paylaşımlı hazine artık server/app.mjs'in /api/clan/* uçlarında gerçek
// diğer hesaplarla payaşılıyor (bkz. services/clanService.js). Klan Zindanı
// ve Klan Boss (utils/clanBoss.js) kasıtlı olarak bu kapsamın DIŞINDA
// bırakıldı — ikisi de kendi paylaşımlı simülasyonunu (Dünya Canavarı'nınki
// gibi) gerektirir, ayrı bir kapsam kararı; şimdilik eskisi gibi yerel kalıyor.
export default function ClanTab({ player, setPlayer, cls, atk, def, pushToast }) {
  const { t,lang } = useTranslation();
  const roleLabel = (role) => t(`clan.role.${role}`);
  const stageName = (stage) => (stage ? t(`clan.bossStage.${stage.id}.name`) : "");
  const [founding, setFounding] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [donateNpInput, setDonateNpInput] = useState("");
  const [donateGoldInput, setDonateGoldInput] = useState("");
  const [donateDiamondInput, setDonateDiamondInput] = useState("");
  const [donateMaterialInputs, setDonateMaterialInputs] = useState({});
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [lbRace, setLbRace] = useState(player.race);
  const [invites, setInvites] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [avatarId,setAvatarId]=useState('wolf');
  const [busy,setBusy]=useState(false);
  const [loadError,setLoadError]=useState(false);

  const refresh = useCallback(async () => {
    try {
      const characterKey=getActiveCharacterKey();
      const { clan } = await fetchMyClan();
      if(characterKey!==getActiveCharacterKey())return;
      setPlayer((p) => mergeClanResponse(p, clan));
      setInvites(clan ? [] : await fetchClanInvites());
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoaded(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => startPolling(refresh, 8000, { runNow: false }), [refresh]);

  // Boss açıkken geri sayım/HP saniyeler içinde eskir — bu tick sadece
  // yeniden render tetikler (bkz. utils/clanBoss.js'in "Date.now()'dan
  // türet" notu), player state'ine hiç dokunmuyor.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!player.clan?.boss) return;
    const id = setInterval(() => forceTick((tk) => tk + 1), 2000);
    return () => clearInterval(id);
  }, [player.clan?.boss]);

  const handleFound = async () => {
    if(busy)return;
    const trimmed = nameInput.trim();
    if (!trimmed) { pushToast(t("common.reason.enterClanName"), "warn"); return; }
    if (player.diamonds < CLAN_FOUND_COST_DIAMONDS) { pushToast(t("common.reason.notEnoughDiamonds"), "warn"); return; }
    let founded;
    try {
      setBusy(true);
      founded = await foundClanApi(trimmed, pick(CLAN_COLORS),avatarId);
    } catch (error) { pushToast(error?.code === "NOT_ENOUGH_DIAMONDS" ? t("common.reason.notEnoughDiamonds") : formatServerError(t, error), "warn"); return; }
    finally {setBusy(false);}
    const before = player;
    setPlayer((p) => {
      const after = { ...p, diamonds: Number.isSafeInteger(founded?.diamonds) ? founded.diamonds : p.diamonds - CLAN_FOUND_COST_DIAMONDS, milestones: { ...p.milestones, hasFoundedClan: true } };
      newlyUnlocked(before, after).forEach((a) => pushToast(t("clan.toastAchievement", { name: t(`character.achievements.${a.id}.name`), title: t(`character.achievements.${a.id}.title`) }), "level"));
      return after;
    });
    pushToast(t("clan.toastFounded", { name: trimmed }), "loot");
    setFounding(false);
    setNameInput("");
    refresh();
  };
  const changeAvatar=async next=>{
    if(busy)return;setBusy(true);
    try{await updateClanAvatar(next);setPlayer(p=>({...p,clan:p.clan?{...p.clan,avatarId:next}:null}));}
    catch(error){pushToast(formatServerError(t,error),'warn');}
    finally{setBusy(false);}
  };
  const connectionStatus=loadError?<div className="clan-status" role="status">{lang==='en'?'Clan server could not be reached.':'Klan sunucusuna ulaşılamadı.'}<button onClick={refresh}>{lang==='en'?'Retry':'Tekrar dene'}</button></div>:!loaded?<div className="clan-status" role="status">{lang==='en'?'Loading clan…':'Klan bilgileri yükleniyor…'}</div>:null;

  const handleInvite = async () => {
    const name = inviteInput.trim();
    if (!name) return;
    try {
      await inviteToClan(name);
      pushToast(t("clan.toastInviteSent", { name }), "loot");
      setInviteInput("");
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handleAcceptInvite = async (id, clanName) => {
    try {
      await acceptClanInvite(id);
      pushToast(t("clan.toastJoined", { name: clanName }), "loot");
      refresh();
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handleDeclineInvite = async (id) => {
    try { await declineClanInvite(id); setInvites((list) => list.filter((i) => i.id !== id)); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handleLeave = async () => {
    try {
      const { donatedNp } = await leaveClanApi();
      const refund = Math.round((donatedNp || 0) * 0.35);
      setPlayer((p) => ({ ...p, clan: null, nationalPoint: p.nationalPoint + refund }));
      pushToast(refund > 0 ? t("clan.toastLeftRefund", { refund: fmt(refund) }) : t("clan.toastLeft"), "default");
    } catch (error) { pushToast(formatServerError(t, error), "warn"); }
    setConfirmingLeave(false);
    refresh();
  };

  const handleKick = async (accountId,characterKey) => {
    try { await kickClanMember(accountId,characterKey); refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handlePromote = async (accountId,characterKey) => {
    try { await promoteClanMember(accountId,characterKey); refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handleDemote = async (accountId,characterKey) => {
    try { await demoteClanMember(accountId,characterKey); refresh(); }
    catch (error) { pushToast(formatServerError(t, error), "warn"); }
  };

  const handleDonate = async (currency, rawAmount, clearInput) => {
    const amount = parseInt(rawAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(formatReason(t, { reason: "enterValidAmount" }, "clan.toastDonateFailed"), "warn"); return; }
    const balance = currency === "np" ? player.nationalPoint : currency === "gold" ? player.gold : player.diamonds;
    if (balance < amount) { pushToast(formatReason(t, { reason: currency === "np" ? "notEnoughNP" : currency === "gold" ? "notEnoughGold" : "notEnoughDiamonds" }, "clan.toastDonateFailed"), "warn"); return; }
    let donated;
    try {
      donated = await donateToClan(currency, amount);
    } catch (error) { pushToast(error?.code === "NOT_ENOUGH_DIAMONDS" ? t("common.reason.notEnoughDiamonds") : formatServerError(t, error, "clan.toastDonateFailed"), "warn"); return; }
    setPlayer((p) => ({
      ...p,
      nationalPoint: currency === "np" ? p.nationalPoint - amount : p.nationalPoint,
      gold: currency === "gold" ? p.gold - amount : p.gold,
      // Elmas bağışı sunucuda kasadan düşer; bakiyeyi sunucunun söylediği değere oturt.
      diamonds: currency === "diamonds" ? (Number.isSafeInteger(donated?.diamonds) ? donated.diamonds : p.diamonds - amount) : p.diamonds,
    }));
    const toastKey = currency === "np" ? "clan.toastDonatedNp" : currency === "gold" ? "clan.toastDonatedGold" : "clan.toastDonatedDiamonds";
    pushToast(t(toastKey, { amount: fmt(amount) }), "loot");
    clearInput();
    refresh();
  };

  // Klan Dungeon malzemeleri — çantadaki yığından tamamı ya da bir kısmı
  // klan hazinesine bağışlanabiliyor, altın/elmas/NP ile AYNI akış (kendi
  // düşüşü istemcide, bkz. yukarıdaki handleDonate).
  const handleDonateMaterial = async (materialKey, rawAmount) => {
    const amount = parseInt(rawAmount, 10);
    const stack = player.inventory.find((it) => it.kind === "clanMaterial" && it.materialKey === materialKey);
    const owned = stack?.count || 0;
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(formatReason(t, { reason: "enterValidAmount" }, "clan.toastDonateFailed"), "warn"); return; }
    if (owned < amount) { pushToast(t("clan.toastDonateFailed"), "warn"); return; }
    try {
      await donateToClan(materialKey, amount);
    } catch (error) { pushToast(formatServerError(t, error, "clan.toastDonateFailed"), "warn"); return; }
    setPlayer((p) => ({
      ...p,
      inventory: p.inventory
        .map((it) => (it.id === stack.id ? { ...it, count: it.count - amount } : it))
        .filter((it) => it.id !== stack.id || it.count > 0),
    }));
    pushToast(t("clan.toastDonatedMaterial", { amount: fmt(amount), material: CLAN_DUNGEON_MATERIALS[materialKey].name }), "loot");
    refresh();
  };

  const handleUpgradeBuilding = async () => {
    try {
      await upgradeClanBuildingApi();
      pushToast(t("clan.toastBuildingLevelUp", { level: (player.clan.buildingLevel || 1) + 1 }), "loot");
      refresh();
    } catch (error) { pushToast(formatServerError(t, error, "clan.toastUpgradeFailed"), "warn"); }
  };

  const handleOpenBoss = (stageId) => {
    const result = openClanBoss(player, stageId);
    if (!result.opened) { pushToast(formatReason(t, result, "clan.toastBossOpenFailed"), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("clan.toastBossAppeared", { name: stageName(result.stage) }), "loot");
  };

  const handleAttackBoss = () => {
    const result = attackClanBoss(player);
    if (!result.attacked) { pushToast(formatReason(t, result, "clan.toastCannotAttack"), "warn"); return; }
    setPlayer(result.player);
    pushToast(result.isCrit ? t("clan.toastCritHit", { dmg: result.dmg }) : t("clan.toastHit", { dmg: result.dmg }), "loot");
  };

  const lbEntries = clanLeaderboardFor(lbRace, player);
  const leaderboardSection = (
    <>
      <SectionLabel><MenuEmblem name="ranking" size={26}/>{t("clan.leaderboardTitle")}</SectionLabel>
      <div style={styles.tierScroller}>
        {Object.entries(RACES).map(([key, r]) => (
          <button
            key={key}
            onClick={() => setLbRace(key)}
            style={{ ...styles.tierChip, borderColor: lbRace === key ? r.color : "var(--border)", background: lbRace === key ? `${r.color}1A` : "var(--bg-panel)" }}
          >
            <span style={{ fontSize: 12, color: r.color }}>{t(`races.${key}.name`)}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
        {lbEntries.map((e) => (
          <div key={e.rank} className="rpg-row rpg-ranking-row" style={{ ...styles.itemRow, ...(e.isPlayerClan ? { borderColor: "#D4AF6A" } : {}) }}>
            <RankBadge rank={e.rank}/>
            <div style={{ flex: 1, fontSize: 12, color: e.isPlayerClan ? "var(--text-primary)" : "var(--text-muted)" }}>{e.name}{e.isPlayerClan ? t("clan.yourClanSuffix") : ""}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
              <Flag size={10} color="#8B6FC9" /> {fmt(e.nationalPoint)}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (!player.clan) {
    return (
      <div className="clan-panel" style={styles.panelScroll}>
        {connectionStatus}
        <div className="rpg-card clan-hero" style={{display:'flex',gap:16,alignItems:'center'}}><Avatar id={avatarId} clan size={80}/><div><h3>{lang==='en'?'Under one banner':'Aynı sancak altında'}</h3><p>{lang==='en'?'Build your clan, choose its crest and gather your allies.':'Klanını kur, armanı seç ve yol arkadaşlarını bir araya getir.'}</p></div></div>

        {loaded && invites.length > 0 && (
          <>
            <SectionLabel><Mail size={14}/>{t("clan.invitesTitle")}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {invites.map((inv) => (
                <div key={inv.id} className="rpg-row" style={{ ...styles.itemRow, borderColor: `${inv.clanColor}66` }}>
                  <Avatar id={inv.avatarId} clan size={42}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: inv.clanColor }}>{inv.clanName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.invitedBy", { name: inv.fromName })}</div>
                  </div>
                  <button className="rpg-action" style={styles.tinyBtn} onClick={() => handleAcceptInvite(inv.id, inv.clanName)}>{t("clan.acceptInviteBtn")}</button>
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => handleDeclineInvite(inv.id)}>{t("clan.declineInviteBtn")}</button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar id={avatarId} clan size={52}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>{t("clan.foundHeading")}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.foundDesc", { cost: CLAN_FOUND_COST_DIAMONDS })}</div>
            </div>
          </div>
          {founding ? (
            <div className="clan-found-form">
              <input
                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                placeholder={t("clan.foundNamePlaceholder")} style={styles.selectInput} maxLength={24}
              />
              <AvatarPicker clan value={avatarId} onChange={setAvatarId} disabled={busy}/>
              <button disabled={busy||!nameInput.trim()||!loaded||loadError} className="rpg-action" style={styles.tinyBtn} onClick={handleFound}>{busy?(lang==='en'?'Creating…':'Kuruluyor…'):t("clan.foundBtn")}</button>
            </div>
          ) : (
            <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => setFounding(true)}>
              <Plus size={12} /> {t("clan.foundCta")}
            </button>
          )}
        </div>

        <SectionLabel>{t("clan.existingClans")}</SectionLabel>
        <EmptyState icon={Shield} title={t("clan.noOtherClansTitle")} subtitle={t("clan.noOtherClansSubtitle")} />

        {leaderboardSection}
      </div>
    );
  }

  const clan = player.clan;
  const online = onlineCountFor(clan);
  const bonus = clanExpBonus(online);
  const isLeader = clan.role === "leader";
  const isOfficerOrLeader = clan.role === "leader" || clan.role === "officer";
  const officerCount = clan.members.filter((m) => m.role === "officer").length;
  const canManageDungeon = isOfficerOrLeader;
  const nextBuildingCost = CLAN_BUILDING_UPGRADE_COST[clan.buildingLevel + 1];
  const nextMaterialCost = CLAN_BUILDING_MATERIAL_COST[clan.buildingLevel + 1];
  const materialsShort = nextMaterialCost
    ? Object.entries(nextMaterialCost).filter(([key, need]) => (clan.treasury[key] || 0) < need)
    : [];
  const buildingCheck = !nextBuildingCost
    ? { ok: false }
    : clan.treasury.gold < nextBuildingCost.gold || clan.treasury.diamonds < nextBuildingCost.diamonds
      ? { ok: false, reason: "treasuryNeedsCost", reasonVars: { gold: nextBuildingCost.gold, diamonds: nextBuildingCost.diamonds } }
      : materialsShort.length > 0
        ? { ok: false, reason: "treasuryNeedsMaterials" }
        : { ok: true };
  const unlocked = unlockedBossStages(clan);
  const bossActive = isClanBossActive(clan);
  const activeStage = clan.boss ? CLAN_BOSS_STAGES.find((s) => s.id === clan.boss.stageId) : null;
  const bossOpenedToday = clan.boss?.lastOpenedDay === new Date().toDateString();

  return (
    <div className="clan-panel" style={styles.panelScroll}>
      {connectionStatus}

      <div className="rpg-card clan-hero" style={{ ...styles.itemDetailCard, borderColor: `${clan.color}66`, background: `${clan.color}0d` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar id={clan.avatarId} clan size={78}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: clan.color }}>{clan.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{roleLabel(clan.role)} · {t("clan.memberCountShort", { count: clan.members.length, max: CLAN_MAX_MEMBERS })}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
          <span>{t("clan.onlineLabel")}: {online}</span>
          <span>{t("clan.expBonusLabel")}: {bonus > 0 ? `+%${Math.round(bonus * 100)}` : t("clan.none")}</span>
        </div>
      </div>

      {isLeader&&<details className="avatar-customize"><summary>{lang==='en'?'Change clan crest':'Klan armasını değiştir'}</summary><AvatarPicker clan value={clan.avatarId||'wolf'} onChange={changeAvatar} disabled={busy}/></details>}

      {isOfficerOrLeader && (
        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={16} color="var(--gold-text)" strokeWidth={1.6} />
            <div style={{ fontSize: 14 }}>{t("clan.inviteHeading")}</div>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              type="text" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)}
              placeholder={t("clan.invitePlaceholder")} style={{ ...styles.selectInput, flex: 1 }} maxLength={24}
            />
            <button className="rpg-action" style={styles.tinyBtn} onClick={handleInvite}>{t("clan.inviteSendBtn")}</button>
          </div>
        </div>
      )}

      <div className="rpg-card" style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Landmark size={18} color="var(--gold-text)" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{t("clan.treasuryTitle")}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.buildingLevelLabel", { level: clan.buildingLevel, max: CLAN_BUILDING_MAX_LEVEL })}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flag size={11} color="#8B6FC9" /> {fmt(clan.treasury.np)} NP</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Coins size={11} color="var(--gold-text)" /> {fmt(clan.treasury.gold)}g</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Gem size={11} color="#8B6FC9" /> {fmt(clan.treasury.diamonds)}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          {Object.entries(CLAN_DUNGEON_MATERIALS).map(([key, def]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: def.color, flexShrink: 0 }} /> {fmt(clan.treasury[key] || 0)}
            </span>
          ))}
        </div>

        {canManageDungeon && (
          nextBuildingCost ? (
            <>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, ...(!buildingCheck.ok ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : {}) }}
                disabled={!buildingCheck.ok}
                onClick={handleUpgradeBuilding}
                title={!buildingCheck.ok ? formatReason(t, buildingCheck) : undefined}
              >
                {t("clan.upgradeBuildingBtn", { level: clan.buildingLevel + 1, gold: fmt(nextBuildingCost.gold), diamonds: fmt(nextBuildingCost.diamonds) })}
              </button>
              {nextMaterialCost && (
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 6 }}>
                  {t("clan.materialsRequiredLabel")}{" "}
                  {Object.entries(nextMaterialCost).map(([key, need], i) => (
                    <span key={key} style={{ color: (clan.treasury[key] || 0) < need ? "#E8A5AF" : "var(--text-muted)" }}>
                      {i > 0 ? " · " : ""}{fmt(clan.treasury[key] || 0)}/{fmt(need)} {CLAN_DUNGEON_MATERIALS[key].name}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>{t("clan.buildingMaxed")}</div>
          )
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder={t("clan.donateNpPlaceholder")} value={donateNpInput} onChange={(e) => setDonateNpInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button className="rpg-action" style={styles.tinyBtn} onClick={() => handleDonate("np", donateNpInput, () => setDonateNpInput(""))}>{t("clan.donateBtn")}</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder={t("clan.donateGoldPlaceholder")} value={donateGoldInput} onChange={(e) => setDonateGoldInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button className="rpg-action" style={styles.tinyBtn} onClick={() => handleDonate("gold", donateGoldInput, () => setDonateGoldInput(""))}>{t("clan.donateBtn")}</button>
          </div>
          {Object.entries(CLAN_DUNGEON_MATERIALS).map(([key, def]) => {
            const owned = player.inventory.find((it) => it.kind === "clanMaterial" && it.materialKey === key)?.count || 0;
            if (owned <= 0) return null;
            return (
              <div key={key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: def.color, flexShrink: 0 }} />
                <input
                  type="number" min="1" max={owned} placeholder={`${def.name} (${owned})`}
                  value={donateMaterialInputs[key] || ""}
                  onChange={(e) => setDonateMaterialInputs((s) => ({ ...s, [key]: e.target.value }))}
                  style={{ ...styles.numInput, width: "auto", flex: 1 }}
                />
                <button
                  className="rpg-action" style={styles.tinyBtn}
                  onClick={() => { handleDonateMaterial(key, donateMaterialInputs[key]); setDonateMaterialInputs((s) => ({ ...s, [key]: "" })); }}
                >
                  {t("clan.donateBtn")}
                </button>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="1" placeholder={t("clan.donateDiamondPlaceholder")} value={donateDiamondInput} onChange={(e) => setDonateDiamondInput(e.target.value)} style={{ ...styles.numInput, width: "auto", flex: 1 }} />
            <button className="rpg-action" style={styles.tinyBtn} onClick={() => handleDonate("diamonds", donateDiamondInput, () => setDonateDiamondInput(""))}>{t("clan.donateBtn")}</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, lineHeight: 1.5 }}>
          {t("clan.donateFootnote")}
        </div>
      </div>

      <div className="rpg-card" style={styles.itemDetailCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MenuEmblem name="dungeon" size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{t("clan.bossTitle")}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t("clan.bossDesc")}</div>
          </div>
        </div>

        {clan.boss && (bossActive || bossOpenedToday) ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: activeStage?.color }}>{stageName(activeStage)}</span>
              {bossActive && (
                <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} /> {fmtClock(bossTimeLeftMs(clan))}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              {fmt(bossCurrentHp(clan))}/{fmt(bossMaxHp(clan))} HP
            </div>
            <BarTrack pct={(bossCurrentHp(clan) / bossMaxHp(clan)) * 100} color={activeStage?.color} />
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
              {bossActive
                ? (player.clan.boss.playerAttacked ? t("clan.bossYouAttacked") : t("clan.bossAwaitingAttack"))
                : bossCurrentHp(clan) <= 0
                  ? t("clan.bossDefeatedComingSoon")
                  : t("clan.bossTimeUp")}
            </div>
            {bossActive && (
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 8, ...(!canPlayerAttackBoss(player) ? { background: "var(--bg-panel-alt)", color: "var(--text-faint)" } : { background: activeStage?.color }) }}
                disabled={!canPlayerAttackBoss(player)}
                onClick={handleAttackBoss}
              >
                {player.clan.boss.playerAttacked ? t("clan.bossAlreadyAttacked") : t("clan.bossAttackBtn")}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {CLAN_BOSS_STAGES.map((stage) => {
              const isUnlocked = unlocked.some((s) => s.id === stage.id);
              return (
                <div key={stage.id} className="rpg-row rpg-dungeon-card" style={{ ...styles.itemRow, opacity: isUnlocked ? 1 : 0.5, borderColor: `${stage.color}44` }}>
                  <MenuEmblem name="dungeon" size={32}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: stage.color }}>{stageName(stage)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                      {t("clan.bossStageRequirement", { np: fmt(stage.npRequired), level: stage.buildingLevelRequired })}
                    </div>
                  </div>
                  {canManageDungeon ? (
                    <button
                      className="rpg-action" style={{ ...styles.tinyBtn, background: isUnlocked ? stage.color : "var(--bg-panel-alt)", color: isUnlocked ? "#0B0C10" : "var(--text-faint)" }}
                      disabled={!isUnlocked}
                      onClick={() => handleOpenBoss(stage.id)}
                    >
                      {isUnlocked ? t("clan.openBtn") : <Lock size={11} />}
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

      <ClanDungeonPanel player={player} setPlayer={setPlayer} cls={cls} atk={atk} def={def} pushToast={pushToast} />

      <SectionLabel>{t("clan.membersTitle")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {clan.members.map((m) => {
          const clsDef = m.cls ? CLASSES[m.cls] : null;
          const MIcon = clsDef?.icon || Shield;
          return (
            <div key={m.accountId+":"+m.characterKey} className="rpg-row" style={styles.itemRow}>
              <Avatar id={m.avatarId} frameId={m.frameId} size={40}/>
              <div className="clan-member-name">
                <div style={{ fontSize: 12 }}>{m.name}{m.level > 0 ? ` · Lv.${m.level}` : ""}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{roleLabel(m.role)}</div>
              </div>
              {isLeader && m.role !== "leader" && (
                <>
                  {m.role === "officer" ? (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => handleDemote(m.accountId,m.characterKey)} title={t("clan.demoteTitle")}>
                      <ChevronDown size={11} />
                    </button>
                  ) : (
                    <button
                      className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", opacity: officerCount >= CLAN_MAX_OFFICERS ? 0.4 : 1 }}
                      disabled={officerCount >= CLAN_MAX_OFFICERS}
                      onClick={() => handlePromote(m.accountId,m.characterKey)}
                      title={t("clan.promoteTitle")}
                    >
                      <ChevronUp size={11} />
                    </button>
                  )}
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "#E8A5AF" }} onClick={() => handleKick(m.accountId,m.characterKey)} title={t("clan.kickTitle")}>
                    <UserX size={11} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {leaderboardSection}

      <button style={{ ...styles.ghostBtn, marginTop: 14 }} onClick={() => setConfirmingLeave(true)}>
        <LogOut size={13} /> {t("clan.leaveBtn")}
      </button>

      {confirmingLeave && (
        <div style={styles.modalOverlay} onClick={() => setConfirmingLeave(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <LogOut size={28} color="#C9425A" strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 260 }}>
              {t("clan.leaveConfirmText", { name: clan.name })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setConfirmingLeave(false)}>{t("clan.cancel")}</button>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={handleLeave}>{t("clan.confirmLeaveBtn")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
