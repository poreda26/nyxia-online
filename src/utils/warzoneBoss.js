import { seededRng } from "./seededRng";
import { WARZONE_BOSSES, WARZONE_BOSS_SLOT_HOURS, WARZONE_BOSS_FIGHT_WINDOW_MIN } from "../data/warzone";

const SLOT_MS = WARZONE_BOSS_SLOT_HOURS * 3600000;
const WINDOW_MS = WARZONE_BOSS_FIGHT_WINDOW_MIN * 60000;
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
export function bossSchedule(boss, now = Date.now()) {
  const slotIndex = Math.floor(now / SLOT_MS);
  const rng = seededRng(`${boss.id}:${slotIndex}`);
  const offset = SLOT_MS * 0.4 + rng() * OFFSET_BAND_MS;
  const spawnAt = slotIndex * SLOT_MS + offset;
  const despawnAt = spawnAt + WINDOW_MS;
  let phase;
  if (now < spawnAt) phase = "dormant";
  else if (now < despawnAt) phase = "active";
  else phase = "gone";
  return { phase, spawnAt, despawnAt, msUntilDespawn: Math.max(0, despawnAt - now) };
}

// Hub.jsx#WarzoneBossBanner için — şu an "active" fazda olan (dolayısıyla
// oyunda "notice" olarak duyurulması gereken) bossları döner.
export function activeBossEntries(now = Date.now()) {
  return WARZONE_BOSSES.map((boss) => ({ boss, ...bossSchedule(boss, now) })).filter((e) => e.phase === "active");
}

// Kullanıcı isteği: "Düşen drop random olacak. Damage atan kişiler arasında
// en yüksek damage'i atan kişi biraz daha şanslı olacak." — hasarla
// ORANTILI ağırlıklı bir çekiliş: kesin kazanan değil, sadece daha yüksek
// ihtimal. damageMap: { [katılımcıAnahtarı]: toplamHasar }.
export function pickWeightedWinner(damageMap) {
  const entries = Object.entries(damageMap).filter(([, dmg]) => dmg > 0);
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, [, dmg]) => sum + dmg, 0);
  let roll = Math.random() * total;
  for (const [key, dmg] of entries) {
    roll -= dmg;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
