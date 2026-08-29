// Haritalar — eski "Tier" (Sisli Vadi/Kül Kanyonu/...) sistem yerine geçti.
// Her harita bir seviye aralığı kapsar ve kendi canavarlarını taşır; oyuncu
// haritalar arasında tek bir Kapı üzerinden (bkz. components/BattleTab.jsx)
// GATE_TELEPORT_COST karşılığında ışınlanır. `tier` alanı hâlâ var ama artık
// sadece loot/parşömen/sandık tier'ını ve Kaptan görevlerinin beceri-açma
// eşiğini (bkz. utils/quests.js#isTierQuestClaimed) belirlemek için
// kullanılıyor — ekipman tier'ı hâlâ 1-5 aralığında olduğundan iki harita
// (Abyssal Pit, Crimson Battlefront) aynı tier'ı (5) paylaşıyor.
export const GATE_TELEPORT_COST = 10;

// HP/DEF tier'a göre değişen bir eğri — oyuncunun ATK formülü KO'nun
// çarpma modeline geçtikten sonra (bkz. utils/player.js'teki aynı not) T6'da
// canavarları saniyeler içinde eritir, T1'de ise neredeyse hiç fark
// etmezdi hale gelmişti. HP tier arttıkça DÜŞÜYOR (oyuncunun gücü artık
// katlanarak büyüdüğü için aynı mutlak HP'yi korumak gerekmiyor), DEF tier
// arttıkça YÜKSELİYOR (üst tier canavarlar nispeten daha "zırhlı").
const TIER_HP_MULT = { 1: 0.9, 2: 0.8, 3: 0.65, 4: 0.5, 5: 0.35, 6: 0.25 };
const TIER_DEF_MULT = { 1: 2.0, 2: 2.3, 3: 2.6, 4: 3.0, 5: 3.4, 6: 3.8 };
// ATK da artık tier'a göre değişiyor — oyuncunun HP/DEF'i de KO'nun gerçek
// Seviye²*STA (HP) ve sınıfKatsayısı*(Seviye+eşyaAC) (DEF) formüllerine
// geçtikten sonra (bkz. utils/player.js#playerMaxHp/playerDef) HP endgame'de
// katlanarak büyüyor — canavar ATK'si de buna ayak uydurmazsa üst tier
// canavarlar tehdit olmaktan çıkardı. Simülasyonla kalibre edildi: hedef,
// "tipik bir oyuncunun" bir tier'ın en güçlü canavarından ~9 vuruşta ölmesi
// (bkz. sohbetteki kalibrasyon notları).
const TIER_ATK_MULT = { 1: 0.85, 2: 1.0, 3: 1.2, 4: 1.8, 5: 2.4, 6: 3.0 };
function scaleMonster(m, tier) {
  return {
    ...m,
    hp: Math.round(m.hp * TIER_HP_MULT[tier]),
    atk: Math.round(m.atk * TIER_ATK_MULT[tier]),
    def: Math.round(m.def * TIER_DEF_MULT[tier]),
  };
}

const RAW_MAPS = [
  {
    id: "fallow_valley", name: "Fallow Valley", levelMin: 1, levelMax: 15, tier: 1,
    color: "#8FA35E", glow: "rgba(143,163,94,0.45)",
    monsters: [
      { id: "sis_kurdu", name: "Sis Kurdu", hp: 113, atk: 9, def: 6, xp: 21, goldMin: 6, goldMax: 11 },
      { id: "kabuklu_golem", name: "Kabuklu Golem", hp: 143, atk: 10, def: 8, xp: 27, goldMin: 7, goldMax: 14 },
      { id: "otlak_yabanisi", name: "Otlak Yabanisi", hp: 184, atk: 12, def: 10, xp: 34, goldMin: 9, goldMax: 17 },
      { id: "bataklik_surungeni", name: "Bataklık Sürüngeni", hp: 235, atk: 14, def: 13, xp: 43, goldMin: 12, goldMax: 22 },
      { id: "nadas_devi", name: "Nadas Devi", hp: 299, atk: 18, def: 15, xp: 55, goldMin: 15, goldMax: 28 },
    ],
  },
  {
    id: "ashen_canyon", name: "Ashen Canyon", levelMin: 15, levelMax: 25, tier: 2,
    color: "#C97A3D", glow: "rgba(201,122,61,0.45)",
    monsters: [
      { id: "kul_yaratigi", name: "Kül Yaratığı", hp: 361, atk: 21, def: 19, xp: 66, goldMin: 18, goldMax: 33 },
      { id: "volkan_suru", name: "Volkan Sürüngeni", hp: 409, atk: 22, def: 21, xp: 76, goldMin: 20, goldMax: 37 },
      { id: "kanyon_akrebi", name: "Kanyon Akrebi", hp: 462, atk: 25, def: 23, xp: 87, goldMin: 22, goldMax: 42 },
      { id: "lav_ruhu", name: "Lav Ruhu", hp: 522, atk: 27, def: 27, xp: 99, goldMin: 25, goldMax: 47 },
    ],
  },
  {
    id: "frostburn_summit", name: "Frostburn Summit", levelMin: 25, levelMax: 40, tier: 3,
    color: "#6FD1E0", glow: "rgba(111,209,224,0.45)",
    monsters: [
      { id: "buzul_kurdu", name: "Buzul Kurdu", hp: 600, atk: 30, def: 30, xp: 116, goldMin: 29, goldMax: 54 },
      { id: "alev_orumcegi", name: "Alev Örümceği", hp: 695, atk: 34, def: 34, xp: 136, goldMin: 33, goldMax: 62 },
      { id: "don_devi", name: "Don Devi", hp: 770, atk: 36, def: 36, xp: 156, goldMin: 37, goldMax: 70 },
      { id: "kor_salamanderi", name: "Kor Salamanderi", hp: 846, atk: 42, def: 40, xp: 178, goldMin: 42, goldMax: 78 },
      { id: "zirve_muhafizi", name: "Zirve Muhafızı", hp: 929, atk: 46, def: 44, xp: 202, goldMin: 46, goldMax: 87 },
    ],
  },
  {
    id: "ruined_sanctuary", name: "Ruined Sanctuary", levelMin: 40, levelMax: 50, tier: 4,
    color: "#8B6FC9", glow: "rgba(139,111,201,0.45)",
    monsters: [
      { id: "harabe_iskeleti", name: "Harabe İskeleti", hp: 1012, atk: 51, def: 46, xp: 228, goldMin: 51, goldMax: 96 },
      { id: "lanetli_rahip", name: "Lanetli Rahip", hp: 1095, atk: 56, def: 49, xp: 253, goldMin: 56, goldMax: 106 },
      { id: "tapinak_bekcisi", name: "Tapınak Bekçisi", hp: 1210, atk: 61, def: 53, xp: 283, goldMin: 62, goldMax: 117 },
      { id: "golge_vaizi", name: "Gölge Vaizi", hp: 1366, atk: 65, def: 57, xp: 316, goldMin: 70, goldMax: 131 },
    ],
  },
  {
    id: "abyssal_pit", name: "Abyssal Pit", levelMin: 50, levelMax: 60, tier: 5,
    color: "#A34FD9", glow: "rgba(163,79,217,0.45)",
    monsters: [
      { id: "ucurum_solucani", name: "Uçurum Solucanı", hp: 1523, atk: 70, def: 63, xp: 349, goldMin: 77, goldMax: 145 },
      { id: "karanlik_cagirici", name: "Karanlık Çağırıcı", hp: 1679, atk: 74, def: 67, xp: 381, goldMin: 84, goldMax: 158 },
      { id: "dip_iblisi", name: "Dip İblisi", hp: 1849, atk: 79, def: 70, xp: 417, goldMin: 92, goldMax: 173 },
      { id: "kabus_golgesi", name: "Kabus Gölgesi", hp: 2038, atk: 85, def: 74, xp: 455, goldMin: 101, goldMax: 189 },
      { id: "ucurum_efendisi", name: "Uçurum Efendisi", hp: 2245, atk: 90, def: 80, xp: 497, goldMin: 110, goldMax: 207 },
    ],
  },
  {
    id: "crimson_battlefront", name: "Crimson Battlefront", levelMin: 60, levelMax: 65, tier: 5,
    color: "#C9425A", glow: "rgba(201,66,90,0.5)",
    monsters: [
      { id: "kizil_muhafiz", name: "Kızıl Muhafız", hp: 2431, atk: 94, def: 84, xp: 535, goldMin: 118, goldMax: 222 },
      { id: "alev_cellati", name: "Alev Celladı", hp: 2583, atk: 98, def: 87, xp: 565, goldMin: 125, goldMax: 235 },
      { id: "kaos_iblisi", name: "Kaos İblisi", hp: 2744, atk: 101, def: 89, xp: 597, goldMin: 132, goldMax: 248 },
      { id: "kiyamet_ejderha", name: "Kıyamet Ejderhası", hp: 2914, atk: 105, def: 93, xp: 631, goldMin: 140, goldMax: 262 },
    ],
  },
];

// NOT: buradaki "combat tier" (index+1, 1-6) map.tier'dan (eşya/loot tier'ı,
// hâlâ 1-5'te tavanlı — Abyssal Pit VE Crimson Battlefront ikisi de tier 5
// paylaşıyor, bkz. RAW_MAPS'in üstündeki not) KASITLI olarak AYRI: Crimson
// Battlefront loot açısından hâlâ T5 ama savaş gücü açısından kendi 6.
// basamağını (en düşük HP çarpanı, en yüksek DEF çarpanı) alıyor — 6 harita,
// 6 farklı zorluk basamağı, ama sadece 5 eşya tier'ı.
export const MAPS = RAW_MAPS.map((map, i) => ({ ...map, monsters: map.monsters.map((m) => scaleMonster(m, i + 1)) }));

export function findMap(mapId) {
  return MAPS.find((m) => m.id === mapId) || MAPS[0];
}

export function findMonster(monsterId) {
  for (const map of MAPS) {
    const m = map.monsters.find((mon) => mon.id === monsterId);
    if (m) return m;
  }
  return null;
}

// Highest map a character's level actually qualifies for — used as the
// fallback when a saved currentMapId points somewhere no-longer-valid
// (should not normally happen, but keeps BattleTab safe either way).
export function highestUnlockedMap(level) {
  let best = MAPS[0];
  for (const m of MAPS) if (level >= m.levelMin) best = m;
  return best;
}
