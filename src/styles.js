import { BAG_COLUMNS } from "./utils/inventory";

export const styles = {
  appRoot: {
    width: "100%", maxWidth: 420, margin: "0 auto", height: "100%", minHeight: 480,
    background: "var(--bg-void)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
    position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid var(--border)",
  },

  classSelectRoot: {
    display: "flex", flexDirection: "column", padding: "36px 22px", height: "100%",
    overflowY: "auto", boxSizing: "border-box",
    background: "radial-gradient(ellipse at top, #171A22 0%, #0B0C10 60%)",
  },
  classSelectHeader: { textAlign: "center", marginBottom: 26 },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: "var(--text-faint)", fontFamily: "var(--font-mono)" },
  h1: { fontFamily: "var(--font-display)", fontSize: 26, margin: "10px 0 6px", letterSpacing: 0.3 },
  subtext: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 },
  classGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  classCard: {
    background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 14,
    padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start",
    transition: "all 0.18s ease", textAlign: "left", color: "var(--text-primary)", font: "inherit",
  },
  classStatRow: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 },
  statPill: {
    fontSize: 9, background: "var(--bg-panel-alt)", borderRadius: 6, padding: "3px 6px",
    display: "flex", gap: 4, color: "var(--text-muted)",
  },
  primaryBtn: {
    border: "none", borderRadius: 10, padding: "12px 20px", color: "#0B0C10", fontWeight: 700,
    fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },

  loginInput: {
    width: "100%", background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)",
    borderRadius: 10, padding: "13px 14px", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box",
    textAlign: "center", fontFamily: "var(--font-body)",
  },
  loginCaveat: { fontSize: 10, color: "var(--text-faint)", lineHeight: 1.6, textAlign: "center", marginTop: 14 },

  slotList: { display: "flex", flexDirection: "column", gap: 10 },
  slotCard: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 14, padding: 14,
  },
  slotAvatar: {
    width: 44, height: 44, borderRadius: 12, background: "var(--bg-panel-alt)", borderWidth: 1,
    borderStyle: "solid", borderColor: "var(--border)", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },

  hubRoot: { display: "flex", flexDirection: "column", height: "100%" },
  topBar: { padding: "16px 16px 10px", borderBottom: "1px solid var(--border)" },
  topBarRow: { display: "flex", alignItems: "center", gap: 10 },
  classBadge: {
    width: 30, height: 30, borderRadius: 8, background: "var(--bg-panel)",
    border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
  },
  xpTrack: { height: 5, background: "var(--bg-panel)", borderRadius: 4, marginTop: 5, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },
  goldChip: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--bg-panel)",
    border: "1px solid var(--border)", borderRadius: 8, padding: "5px 9px", fontSize: 12,
  },
  topBarSub: { display: "flex", gap: 8, fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 8, paddingLeft: 40 },

  tabContent: { flex: 1, overflowY: "auto", position: "relative" },
  panelScroll: { padding: "16px 16px 24px" },

  sectionLabel: {
    fontSize: 10, letterSpacing: 2, color: "var(--text-faint)", fontFamily: "var(--font-mono)",
    marginBottom: 10, marginTop: 18, textTransform: "uppercase",
  },

  tierScroller: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
  tierChip: {
    display: "flex", alignItems: "center", whiteSpace: "nowrap", border: "1px solid var(--border)",
    borderRadius: 20, padding: "7px 12px", flexShrink: 0,
  },

  monsterCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: 12, display: "flex", flexDirection: "column", gap: 10,
  },
  monsterIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  smallBtn: {
    border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 700, color: "#0B0C10",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },
  dropInfoRow: { marginTop: 14, fontSize: 10, color: "var(--text-faint)", textAlign: "center" },

  battleArena: { display: "flex", flexDirection: "column", gap: 10 },
  combatant: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 },
  vsRow: { display: "flex", justifyContent: "center", padding: 2 },
  barTrack: { background: "var(--bg-panel-alt)", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", transition: "width 0.35s ease" },
  combatLog: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12,
    padding: 10, height: 110, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4,
  },
  combatLogLine: { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" },
  battleControls: { display: "flex", gap: 8 },
  potionBtn: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10,
    padding: "10px 12px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-primary)",
  },
  ghostBtn: {
    background: "transparent", border: "none", color: "var(--text-faint)", fontSize: 11,
    display: "flex", alignItems: "center", gap: 5, justifyContent: "center", padding: 8,
  },

  equipSlotCard: {
    background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 10,
    padding: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    textAlign: "center", aspectRatio: "1 / 1",
  },

  // Knight Online'ın kendi kuşanma ekranıyla aynı iki-bölgeli düzen: portre
  // solda (sabit ~%36 genişlik), 3x4 sabit ızgara sağda — `alignItems:
  // "stretch"` (varsayılan) sayesinde portre ızgaranın toplam yüksekliğine
  // otomatik eşitleniyor, aradaki hizasızlık/boşluk sorunu böylece
  // kökünden ortadan kalkıyor (iki blok da aynı flex satırının parçası).
  paperdollRoot: { display: "flex", gap: 8 },
  paperdollPortrait: {
    flex: "0 0 36%", borderRadius: 14, borderWidth: 1, borderStyle: "solid",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  paperdollGrid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, alignContent: "space-between" },

  bagMetaRow: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 14, marginBottom: 4 },
  bagGrid: { display: "grid", gridTemplateColumns: `repeat(${BAG_COLUMNS}, 1fr)`, gap: 5, marginTop: 10 },
  bagSlot: {
    position: "relative", aspectRatio: "1 / 1", background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 8, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 0,
  },
  bagSlotEmpty: { borderStyle: "dashed", opacity: 0.5 },
  bagSlotSelected: { boxShadow: "0 0 0 2px var(--text-primary)" },
  bagSlotDragOver: { borderStyle: "solid", borderColor: "#D4AF6A", background: "var(--bg-panel-alt)" },

  forgeRow: { display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10 },
  forgeColLabel: { fontSize: 8, color: "var(--text-faint)", marginBottom: 5, textAlign: "center", letterSpacing: 0.5, textTransform: "uppercase" },
  forgeItemSlot: {
    position: "relative", width: 58, height: 58, borderRadius: 10, background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  forgeSmallSlot: {
    position: "relative", width: 50, height: 50, borderRadius: 10, background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  forgeScrollGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, width: 142 },
  forgeScrollSlot: {
    position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 8, background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: 0,
  },
  pickerCard: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 10, marginTop: 12, display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" },
  pickerRow: {
    display: "flex", alignItems: "center", gap: 8, background: "var(--bg-panel-alt)", border: "none",
    borderRadius: 8, padding: "8px 10px", width: "100%", textAlign: "left", color: "var(--text-primary)",
  },
  bagSlotBadge: {
    position: "absolute", bottom: 2, right: 3, fontSize: 8, fontFamily: "var(--font-mono)",
    color: "var(--text-primary)", background: "rgba(11,12,16,0.75)", borderRadius: 4, padding: "0 3px", lineHeight: 1.5,
  },
  itemDetailCard: {
    background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)",
    borderRadius: 12, padding: 12, marginTop: 12,
  },

  classTag: {
    fontSize: 8, fontFamily: "var(--font-mono)", border: "1px solid", borderRadius: 5,
    padding: "1px 5px", letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap",
  },

  chatLog: {
    background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 12,
    padding: 10, height: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10,
  },
  chatMsg: { display: "flex", flexDirection: "column", gap: 2, maxWidth: "92%" },
  chatMsgHeader: { display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" },
  chatMsgBubble: {
    background: "var(--bg-panel-alt)", borderRadius: 10, padding: "7px 10px",
    fontSize: 12, color: "var(--text-primary)", lineHeight: 1.45, wordBreak: "break-word",
  },
  chatInputRow: { display: "flex", gap: 8, marginTop: 10 },
  chatInput: {
    flex: 1, background: "var(--bg-panel-alt)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)",
    borderRadius: 8, padding: "9px 10px", color: "var(--text-primary)", fontSize: 12,
  },

  scrollShopGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 },
  scrollBuyCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10,
    padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center",
  },
  scrollBuyBtn: { marginTop: 6, padding: "5px 2px", fontSize: 9, width: "100%" },

  subtabRow: { display: "flex", gap: 8, marginTop: 18, marginBottom: 4 },
  subtabBtn: {
    flex: 1, background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 9,
    padding: "9px 0", fontSize: 12, color: "var(--text-muted)",
  },
  subtabBtnActive: { background: "var(--bg-panel-alt)", color: "var(--text-primary)", borderColor: "var(--text-faint)" },

  itemRow: {
    display: "flex", alignItems: "center", gap: 10, background: "var(--bg-panel)",
    border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px",
  },
  tierDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  tinyBtn: {
    border: "none", borderRadius: 7, padding: "7px 10px", fontSize: 11, fontWeight: 700,
    background: "#5FA8A0", color: "#0B0C10", whiteSpace: "nowrap",
  },

  chestGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  chestCard: {
    background: "var(--bg-panel)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 12,
    padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center",
  },

  modalOverlay: {
    position: "absolute", inset: 0, background: "rgba(11,12,16,0.86)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)",
  },
  modalCard: {
    background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 18,
    padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center",
    minWidth: 240, position: "relative",
  },

  listingForm: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, marginTop: 10 },
  selectInput: {
    width: "100%", background: "var(--bg-panel-alt)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "8px 10px", color: "var(--text-primary)", fontSize: 12,
  },
  numInput: {
    width: 90, background: "var(--bg-panel-alt)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "8px 10px", color: "var(--text-primary)", fontSize: 12,
  },

  charSummary: { display: "flex", alignItems: "center", gap: 12, marginBottom: 4 },
  charAvatar: {
    width: 52, height: 52, borderRadius: 14, border: "1px solid", background: "var(--bg-panel)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 },
  statBlock: { background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 },

  statPointsBadge: {
    fontSize: 10, fontFamily: "var(--font-mono)", color: "#D4AF6A", marginTop: -6, marginBottom: 10, display: "block",
  },
  statAllocList: { display: "flex", flexDirection: "column", gap: 6 },
  statAllocRow: {
    display: "flex", alignItems: "center", gap: 10, background: "var(--bg-panel)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 10, padding: "8px 10px",
  },
  statAllocBtn: {
    width: 26, height: 26, borderRadius: 8, border: "none", background: "#5FA8A0", color: "#0B0C10",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  },
  statAllocBtnDisabled: { background: "var(--bg-panel-alt)", color: "var(--text-faint)", cursor: "default" },
  mainStatTag: {
    fontSize: 8, fontFamily: "var(--font-mono)", color: "var(--text-faint)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", borderRadius: 6, padding: "1px 5px", marginLeft: 6,
  },

  // 9 sekme artık tek satırda sağa-sola kaydırılarak geziliyor (kullanıcı
  // isteği) — her buton sabit bir genişlik taşıdığı için (navBtn) satırın
  // toplam genişliği konteynerı gerçekten aşıyor ve overflowX:auto devreye
  // giriyor; flex:1 olsaydı (eski hâl) hepsi sıkışıp asla kaydırılamazdı.
  bottomNav: {
    display: "flex", borderTop: "1px solid var(--border)", background: "var(--bg-void)",
    padding: "8px 6px 12px", overflowX: "auto", WebkitOverflowScrolling: "touch",
  },
  navBtn: {
    flex: "0 0 auto", width: 68, background: "none", border: "none", display: "flex", flexDirection: "column",
    alignItems: "center", padding: "6px 0", position: "relative",
  },
  navActiveDot: { width: 3, height: 3, borderRadius: 2, background: "var(--text-primary)", marginTop: 3 },

  // Bag/depo'da bir eşyaya dokununca çıkan detay widget'ı — önceden eşya
  // detayı ızgaranın altına, sayfa akışının içine ekleniyordu (kullanıcı
  // kaydırmadan göremiyordu); artık "Daha Fazla" sheet'iyle aynı mantıkta
  // alttan kayarak açılan, tüm ekranı (alt menü dahil) kaplayan bir widget.
  itemSheetOverlay: {
    position: "fixed", inset: 0, background: "rgba(11,12,16,0.7)", zIndex: 60,
    display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(2px)",
  },
  itemSheet: {
    width: "100%", maxWidth: 420, maxHeight: "82vh", overflowY: "auto",
    background: "var(--bg-panel)", borderTop: "1px solid var(--border)",
    borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: "14px 16px 22px",
  },
  itemSheetHandle: { width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 12px" },
};
