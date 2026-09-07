// Klan Boss — kullanıcının verdiği kesin kurallar: günde 1 kere açılabilir,
// açık kaldığı süre 1 saat, her savaşçı bu pencerede sadece 1 kez saldırabilir,
// 5 aşamalı (her biri bir öncekinden güçlü), her aşamanın kendi NP + Klan
// Binası seviyesi şartı var (bkz. utils/clanBoss.js). Ödüller ve Klan
// Binası'nın gerçek türleri henüz netleşmedi (kullanıcı sonra anlatacak) —
// buradaki hp/def/hasar sayıları bu yüzden İLK KALİBRASYON: mekanik tam
// çalışır durumda, sayılar ödül/bina detayları netleşince yeniden dengelenecek.
export const CLAN_BOSS_WINDOW_MS = 60 * 60 * 1000; // 1 saat

export const CLAN_BOSS_STAGES = [
  {
    id: 1, name: "Kök Muhafızı", color: "#8FA35E",
    npRequired: 50000, buildingLevelRequired: 1,
    hp: 1800, def: 150, memberDmgMin: 80, memberDmgMax: 150,
  },
  {
    id: 2, name: "Demir Leviathan", color: "#C97A3D",
    npRequired: 150000, buildingLevelRequired: 2,
    hp: 3800, def: 220, memberDmgMin: 150, memberDmgMax: 280,
  },
  {
    id: 3, name: "Gölge Hükümdarı", color: "#6FD1E0",
    npRequired: 300000, buildingLevelRequired: 3,
    hp: 7200, def: 300, memberDmgMin: 280, memberDmgMax: 500,
  },
  {
    id: 4, name: "Kadim Alev Efendisi", color: "#8B6FC9",
    npRequired: 500000, buildingLevelRequired: 4,
    hp: 13000, def: 400, memberDmgMin: 500, memberDmgMax: 900,
  },
  {
    id: 5, name: "Nyxia'nın Kâbusu", color: "#A34FD9",
    npRequired: 1000000, buildingLevelRequired: 5,
    hp: 23000, def: 520, memberDmgMin: 900, memberDmgMax: 1600,
  },
];

export function findBossStage(stageId) {
  return CLAN_BOSS_STAGES.find((s) => s.id === stageId) || null;
}

// Klan Binası — kullanıcı bina türlerini/isimlerini sonra anlatacak; şimdilik
// TEK bir genel seviye (1-5). Boss aşamalarını açan iki şarttan biri budur
// (diğeri klana bağışlanmış toplam NP). Maliyet tablosu da placeholder.
export const CLAN_BUILDING_MAX_LEVEL = 5;
export const CLAN_BUILDING_UPGRADE_COST = {
  2: { gold: 50000, diamonds: 200 },
  3: { gold: 150000, diamonds: 500 },
  4: { gold: 400000, diamonds: 1200 },
  5: { gold: 1000000, diamonds: 3000 },
};
