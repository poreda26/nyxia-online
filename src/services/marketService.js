// Player-to-player market, built async-first so this module is the only
// thing that needs to change when a real backend exists — every export
// here already has the shape a future fetch()/API call would have
// (Promise-returning, plain-serializable payloads in and out).
//
// Kullanıcı isteği: "Pazarımız bir depo gibi açılacak. Maksimum 10 adet
// eşya konulabilen bir satış yeri." — artık tek tek eşya ilanları yok, hesap
// başına TEK bir "tezgah" (stall) var: bir kez süre seçip ücretini ödeyerek
// açılıyor ("POREDA'nın Pazarı" gibi kendi ismiyle), içine en çok 10 eşya
// eklenebiliyor, her eşyanın kendi fiyatı var. Diğer oyuncular (burada:
// NPC'ler, gerçek bir sunucu olmadığı için) tezgahın TAMAMINI görüyor,
// istediği eşyayı seçip alıyor — kullanıcı isteği: "İtemler tek tek
// listelenmeyecek", yani üst seviye liste tezgah/satıcı bazlı, eşya bazlı
// değil.
//
// İki ayrı havuz var:
// - NPC'lerin sahte tezgahları: hâlâ bellek içi, sayfa yenilenince
//   sıfırlanır (sadece pazarı canlı/dolu göstermek için).
// - Oyuncunun KENDİ tezgahı: gerçek, kalıcı (hesaba kaydediliyor, bkz.
//   utils/storage.js#loadMarketStall/saveMarketStall), gerçek süreli
//   (1-3-6-12-24 saat) ve süresi dolunca deaktif oluyor — deaktif tezgahın
//   içindekileri sadece satıcı (hesabın kendisi) geri alabiliyor, otomatik
//   iade YOK (bkz. reclaimStall) — çanta/depo dolu olsa bile hiçbir eşya
//   sessizce kaybolmaz veya çökmeye sebep olmaz, sadece "alınmayı bekliyor"
//   olarak kalır. Tezgahı vaktinden önce kapatmak (bkz. closeStall) ödenen
//   ücreti iade ETMEZ — kullanıcı isteği: "pazarı bozarsa kullanıcı uyarı
//   çıkacak goldunun iade edilmediğini bilecek."
import { rollLoot } from "../utils/loot";
import { pick, rand, uid } from "../utils/random";
import { FAKE_SELLER_NAMES } from "../data/marketNames";
import { loadMarketStall, saveMarketStall } from "../utils/storage";

let npcListings = [];
let npcSeeded = false;

let currentUsername = null;
let myStall = null;

// Kullanıcı isteği: "1 Saatlik 25 gold dan başlayacak şekilde... 24 saatlik
// 250 gold olacak şekilde aşamalı fiyatı yükselecek." — saat başına ücret
// süre arttıkça düşüyor (25g/s @1s → ~10.4g/s @24s), gerçek bir "toptan
// indirim" hissi versin diye.
export const MARKET_DURATIONS_HOURS = [1, 3, 6, 12, 24];
export const MARKET_DURATION_FEE = { 1: 25, 3: 60, 6: 100, 12: 170, 24: 250 };
export const MARKET_STALL_MAX_ITEMS = 10;
const HOUR_MS = 3600 * 1000;

function isExpired(stall) {
  return !!stall && Date.now() >= stall.listedAt + stall.durationHours * HOUR_MS;
}

function ensureLoaded(username) {
  if (currentUsername === username) return;
  currentUsername = username;
  myStall = loadMarketStall(username);
}

function persist() {
  if (currentUsername) saveMarketStall(currentUsername, myStall);
}

function priceFor(item) {
  const base = Math.round((item.atk || 0) * 1.3 + (item.def || 0) * 1.2 + (item.hp || 0) * 0.8);
  return Math.max(6, base + rand(4, 18));
}

// NPC tezgahları — kullanıcı isteği "tek tek listelenmeyecek" gerçek
// oyuncu tezgahı için net ama görünümün tutarlı olması için NPC eşyaları
// da aynı şekilde isim bazlı gruplanıyor (bkz. MarketTab'ın groupBy'ı).
// Var olan bir NPC'nin tezgahına eklemeyi tercih ediyor (yoksa hep tek
// eşyalı yeni bir "tezgah" doğardı, gerçekçi görünmezdi).
function spawnFakeListing() {
  const tierId = rand(1, 3); // simulated sellers mostly deal in lower-tier gear
  const item = rollLoot(tierId); // hangi sınıfa ait olacağı zaten rollLoot içinde şansa bağlı
  if (!item) return;
  const openSellers = [...new Set(npcListings.filter((l) => l.count < 4).map((l) => l.sellerName))];
  const sellerName = openSellers.length && Math.random() < 0.7 ? pick(openSellers) : pick(FAKE_SELLER_NAMES);
  npcListings.push({ id: uid(), sellerId: "npc", sellerName, item, price: priceFor(item), listedAt: Date.now() });
}

function seedIfNeeded() {
  if (npcSeeded) return;
  npcSeeded = true;
  for (let i = 0; i < 10; i++) spawnFakeListing();
}

function withCounts(list) {
  const perSeller = new Map();
  list.forEach((l) => perSeller.set(l.sellerName, (perSeller.get(l.sellerName) || 0) + 1));
  return list.map((l) => ({ ...l, count: perSeller.get(l.sellerName) }));
}

// GET /market — username, MarketTab her mount'ta/refreshte gönderiyor ki
// hangi hesabın kalıcı tezgahının okunacağı belli olsun (bu modül birden
// fazla sekme/karakter arasında paylaşılan tek bir modül-seviyesi state,
// bkz. ensureLoaded).
export async function fetchMarket(username) {
  ensureLoaded(username);
  seedIfNeeded();
  if (npcListings.length < 24 && Math.random() < 0.3) spawnFakeListing();
  const stall = myStall ? { ...myStall, active: !isExpired(myStall) } : null;
  return { myStall: stall, npcListings: withCounts(npcListings) };
}

// POST /market/open — tezgahı açar (ücret App/MarketTab tarafında zaten
// düşülmüş olmalı, burası sadece kaydı oluşturur). Açık ya da süresi dolmuş
// ama henüz alınmamış bir tezgah varsa reddeder.
export async function openStall(username, sellerName, durationHours) {
  ensureLoaded(username);
  if (myStall) {
    return { ok: false, reason: isExpired(myStall) ? "Süresi dolmuş pazarını kapatıp eşyalarını almadan yenisini açamazsın." : "Zaten açık bir pazarın var." };
  }
  myStall = { id: uid(), sellerName, items: [], listedAt: Date.now(), durationHours };
  persist();
  return { ok: true, stall: { ...myStall, active: true } };
}

// POST /market/items — tezgaha tek bir eşya ekler (en çok 10).
export async function addItemToStall(username, item, price) {
  ensureLoaded(username);
  if (!myStall || isExpired(myStall)) return { ok: false, reason: "Açık bir pazarın yok." };
  if (myStall.items.length >= MARKET_STALL_MAX_ITEMS) return { ok: false, reason: `Pazar dolu (${MARKET_STALL_MAX_ITEMS}/${MARKET_STALL_MAX_ITEMS}).` };
  myStall.items.push({ id: uid(), item, price });
  persist();
  return { ok: true, stall: { ...myStall, active: true } };
}

// DELETE /market — kullanıcı isteği: "Pazarı kurduktan sonra pazarı
// bozarsa kullanıcı uyarı çıkacak goldunun iade edilmediğini bilecek." —
// bu fonksiyon sadece kaydı temizler ve İÇİNDEKİ TÜM eşyaları döner (çağıran
// bunları depoya/sandığa koyar), açılış ücretini iade ETMEZ — o uyarı
// MarketTab'ın onay penceresinde, bu çağrılmadan önce gösteriliyor.
export async function closeStall(username) {
  ensureLoaded(username);
  if (!myStall) return null;
  const items = myStall.items;
  myStall = null;
  persist();
  return { items };
}

// Deaktif (süresi dolmuş) bir tezgahın İÇİNDEKİ HER ŞEYİ geri almak —
// kullanıcı isteği: "Deaktif olan pazardaki eşyaları satıcı kendisi alacak"
// (bir önceki turdan, aynı ilke burada da geçerli) — otomatik iade yok,
// çağıran (MarketTab) her eşyayı depoya koymayı DENER; biri sığmazsa bile
// diğerleri devam eder, sığmayanlar tezgahta kalır (hiçbir eşya kaybolmaz).
export async function reclaimStall(username) {
  ensureLoaded(username);
  if (!myStall || !isExpired(myStall)) return null;
  return { items: myStall.items, stallId: myStall.id };
}

// Reclaim sırasında depoya SIĞMAYAN eşyalar tezgahta kalsın diye —
// MarketTab başarıyla yerleştirdiği eşyaların id'lerini burada bildiriyor,
// geri kalanlar bir dahaki reclaim denemesine kadar tezgahta duruyor.
// Hepsi yerleşince tezgah tamamen kapanıyor.
export async function removeReclaimedItems(username, placedItemIds) {
  ensureLoaded(username);
  if (!myStall) return;
  const placed = new Set(placedItemIds);
  myStall.items = myStall.items.filter((entry) => !placed.has(entry.id));
  if (myStall.items.length === 0) myStall = null;
  persist();
}

// POST /market/npc/:id/buy — sadece NPC eşyaları satın alınabilir; oyuncunun
// kendi tezgahı buradan hiç geçmiyor (kendi kendine alışveriş yok).
export async function buyListing(listingId) {
  const idx = npcListings.findIndex((l) => l.id === listingId);
  if (idx === -1) return { ok: false, reason: "Eşya artık mevcut değil." };
  const [listing] = npcListings.splice(idx, 1);
  return { ok: true, listing: { ...listing } };
}

// Stands in for real buyers discovering the player's stall over time.
// Called opportunistically when the player visits the market. Süresi
// dolmuş bir tezgah artık satılamaz — sadece hâlâ aktifken içindeki
// eşyalar bu rulete giriyor.
export async function resolveMyStall(username) {
  ensureLoaded(username);
  if (!myStall || isExpired(myStall)) return [];
  const sold = [];
  myStall.items = myStall.items.filter((entry) => {
    if (Math.random() < 0.2) { sold.push({ ...entry }); return false; }
    return true;
  });
  persist();
  return sold;
}
