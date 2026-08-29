import { MAPS } from "./maps";

// Kaptan'ın görev panosu — artık her HARİTADAKİ her canavar için sabit bir
// "avcılık" görevi var (bkz. data/maps.js), artı seviye 60'ta açılan özel
// Uyanış Sınavı. target/reward, canavarın haritasının tier'ına göre sabit
// bir tabloya (TIER_QUEST_TABLE) göre belirlenir — o tier'ın doğal grind
// hacminin küçük ama fark edilir bir dilimi, tamamen kendiliğinden dolmasın
// diye. See utils/quests.js.
// Altın ödülleri sabit tutuldu, XP ödülleri ×2'ye çıkarıldı (kullanıcı
// isteği) — görev panosu artık ekonomiyi şişirmeden seviye ilerlemesinde
// daha büyük bir katkı sağlıyor.
const TIER_QUEST_TABLE = {
  1: { target: 50, goldReward: 150, xpReward: 500 },
  2: { target: 70, goldReward: 400, xpReward: 1300 },
  3: { target: 90, goldReward: 800, xpReward: 2600 },
  4: { target: 110, goldReward: 1300, xpReward: 4400 },
  5: { target: 60, goldReward: 2000, xpReward: 8000 },
};

const QUEST_NAMES = {
  sis_kurdu: "Sisli Vadi'nin Belası", kabuklu_golem: "Kabuk Avcısı", otlak_yabanisi: "Otlak Temizliği",
  bataklik_surungeni: "Bataklık Kırımı", nadas_devi: "Nadas Devi Avı",
  kul_yaratigi: "Kül Kanyonu Nöbetçisi", volkan_suru: "Sürüngen Kırımı", kanyon_akrebi: "Akrep Kovuşturması",
  lav_ruhu: "Lav Ruhu Bastırması",
  buzul_kurdu: "Buzul Sürüsü", alev_orumcegi: "Alev Örümceği Avı", don_devi: "Don Devi Seferi",
  kor_salamanderi: "Kor Salamanderi Kırımı", zirve_muhafizi: "Zirve Muhafızları",
  harabe_iskeleti: "Harabe Temizliği", lanetli_rahip: "Lanetli Rahip Avı", tapinak_bekcisi: "Tapınak Bekçileri",
  golge_vaizi: "Gölge Vaizi Sefası",
  ucurum_solucani: "Uçurum Solucanı Avı", karanlik_cagirici: "Karanlık Çağırıcı Kırımı", dip_iblisi: "Dip İblisi Seferi",
  kabus_golgesi: "Kabus Gölgesi Avı", ucurum_efendisi: "Uçurum Efendisi Kovuşturması",
  kizil_muhafiz: "Kızıl Muhafız Seferi", alev_cellati: "Alev Celladı Avı",
  kaos_iblisi: "Kaos Tapınağı Seferi", kiyamet_ejderha: "Kıyamet Avı",
};

// requiredLevel = haritanın levelMin'i — o haritaya erişebilecek kadar
// güçlenmemiş bir oyuncuya henüz avlayamayacağı canavarların görevini
// göstermenin bir anlamı yok (bkz. components/CaptainTab.jsx'in bu alana
// göre filtrelemesi, kullanıcı isteği: "Oyunun başından sonuna kadar tüm
// görevler gözükmesin").
export const MONSTER_QUESTS = MAPS.flatMap((map) =>
  map.monsters.map((m) => ({
    id: m.id,
    monsterId: m.id,
    tier: map.tier,
    requiredLevel: map.levelMin,
    name: QUEST_NAMES[m.id] || m.name,
    ...TIER_QUEST_TABLE[map.tier],
  }))
);

// Uyanış Sınavı — Lv.60'ta açılır, tamamlanınca player.awakened = true olur
// ve karakter "Master X" unvanını alır (bkz. utils/quests.js#claimQuest,
// components/CaptainTab.jsx). Crimson Battlefront'un iki en güçlü canavarını
// hedefler — MONSTER_QUESTS'teki görevlerini zaten bitirmiş biri için bile
// gerçek bir ek çaba ister.
export const AWAKENING_QUEST = {
  id: "awakening",
  name: "2. Uyanış Sınavı",
  requiredLevel: 60,
  targets: { kaos_iblisi: 40, kiyamet_ejderha: 40 },
};
