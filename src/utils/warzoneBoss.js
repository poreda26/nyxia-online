// Faz 4 — dosya uzantısı bilerek açık yazılıyor: bu modül artık sadece
// Vite/tarayıcı tarafından değil, Node'un kendi ESM yükleyicisi tarafından
// da (server/app.mjs'in doğrudan importuyla, bkz. o dosyadaki not) okunuyor
// — Node, Vite'ın aksine uzantısız import'u çözemiyor.
import { seededRng } from "./seededRng.js";
import {
  WARZONE_BOSSES, WARZONE_BOSS_SLOT_HOURS, WARZONE_BOSS_FIGHT_WINDOW_MIN,
  WARZONE_BOSS_GATHER_SECONDS, WARZONE_BOSS_COUNTDOWN_SECONDS,
} from "../data/warzone.js";

const SLOT_MS = WARZONE_BOSS_SLOT_HOURS * 3600000;
const WINDOW_MS = WARZONE_BOSS_FIGHT_WINDOW_MIN * 60000;
const GATHER_MS = WARZONE_BOSS_GATHER_SECONDS * 1000;
const COUNTDOWN_MS = WARZONE_BOSS_COUNTDOWN_SECONDS * 1000;
// Her boss'un ardışık iki çıkışı arasındaki gerçek boşluğun "3-4 saat
// aralığında" kalması için — spawn, slot'un TAM ortasına yakın DAR bir
// bantta (slot genişliğinin %40-%60'ı) düşüyor. Bunun matematiği: gap =
// SLOT_MS + (offset_sıradaki - offset_şimdiki), offset [0.4*SLOT, 0.6*SLOT]
// bandında olduğu için fark en fazla ±0.2*SLOT olabiliyor — SLOT_MS=3.5s
// için bu gap'i yaklaşık [2.8s, 4.2s] aralığına sıkıştırıyor (canlı
// simülasyonla doğrulandı: gerçek gap'ler 2.99-4.12 saat arasında çıktı).
// Bandı SIFIRA indirmek (jitter'ı tamamen kaldırmak) gap'i tam [3,4]'e
// kilitlerdi ama çıkışı TAMAMEN öngörülebilir yapardı (kullanıcı isteği:
// "kimse bilmeyecek") — bu yüzden bilinçli bir yakınsama, birebir değil.
const OFFSET_BAND_MS = SLOT_MS * 0.2;

// Saf bir duvar-saati fonksiyonu — hiçbir yerde saklanmıyor, her çağrıda
// `now`'dan yeniden hesaplanıyor (ve SABİT genişlikte dilimler kullandığı
// için O(1) — epoch'tan zincir halinde "yürümüyor", bu yüzden uygulama ne
// kadar eski olursa olsun performansı bozulmuyor). Her boss kendi id'siyle
// tohumlanmış bağımsız bir "slot" takvimi izliyor: zaman SLOT_MS'lik
// dilimlere bölünüyor, o dilimin İÇİNDE boss'un tam ne zaman çıkacağı
// (ve WINDOW_MS sonra kaybolacağı) o dilime özel bir tohumla (seededRng)
// belirleniyor — bu yüzden "ne zaman çıkacağı" gerçekten önceden bilinemez
// ama sayfa yenilense/sekme değişse bile HERKES (bu build'de tek oyuncu ama
// ilke aynı) aynı takvimi görür.
//
// Kullanıcı isteği: "Bosslar çıkmadan önce herkes boss odasına katılacak.
// Boss Saldırıları 3-2-1 diye geri sayımla açılacak." — spawnAt'ten
// GATHER_MS öncesine kadar "dormant" (kimse bilmiyor), sonra "gathering"
// (oda açık, savaşçılar toplanıyor), son COUNTDOWN_MS'de "countdown"
// (büyük 3-2-1 sayacı), spawnAt'te "active", despawnAt'ten sonra "gone".
export function bossSchedule(boss, now = Date.now()) {
  const slotIndex = Math.floor(now / SLOT_MS);
  const rng = seededRng(`${boss.id}:${slotIndex}`);
  const offset = SLOT_MS * 0.4 + rng() * OFFSET_BAND_MS;
  const spawnAt = slotIndex * SLOT_MS + offset;
  const despawnAt = spawnAt + WINDOW_MS;
  const gatherAt = spawnAt - GATHER_MS;
  let phase;
  if (now < gatherAt) phase = "dormant";
  else if (now < spawnAt - COUNTDOWN_MS) phase = "gathering";
  else if (now < spawnAt) phase = "countdown";
  else if (now < despawnAt) phase = "active";
  else phase = "gone";
  return {
    phase, spawnAt, despawnAt, gatherAt,
    msUntilDespawn: Math.max(0, despawnAt - now),
    msUntilSpawn: Math.max(0, spawnAt - now),
    countdownSeconds: Math.max(1, Math.min(WARZONE_BOSS_COUNTDOWN_SECONDS, Math.ceil((spawnAt - now) / 1000))),
  };
}

// Hub.jsx#WarzoneBossBanner için — oyunda "notice" olarak duyurulması
// gereken (yani "gathering"/"countdown"/"active" fazındaki, "dormant"/
// "gone" DIŞINDAKİ) bossları döner, fazı da birlikte verir ki banner
// "toplanıyor" ile "ortaya çıktı" arasında farklı metin gösterebilsin.
export function noticeBossEntries(now = Date.now()) {
  return WARZONE_BOSSES
    .map((boss) => ({ boss, ...bossSchedule(boss, now) }))
    .filter((e) => e.phase === "gathering" || e.phase === "countdown" || e.phase === "active");
}
