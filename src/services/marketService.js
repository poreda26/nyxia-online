// Player-to-player market, built async-first so this module is the only
// thing that needs to change when a real backend exists — every export
// here already has the shape a future fetch()/API call would have
// (Promise-returning, plain-serializable payloads in and out).
//
// Kullanıcı isteği ile iki ayrı havuz var:
// - NPC'lerin sahte ilanları: hâlâ bellek içi, sayfa yenilenince sıfırlanır
//   (sadece pazarı canlı/dolu göstermek için, gerçek bir "market" değiller).
// - Oyuncunun KENDİ ilanları: artık gerçek, kalıcı (hesaba kaydediliyor,
//   bkz. utils/storage.js#loadMarketListings/saveMarketListings), gerçek
//   süreli (1-3-6-12-24 saat) ve süresi dolunca deaktif oluyor — deaktif
//   ilanın eşyasını sadece satıcı (yani hesabın kendisi) geri alabiliyor,
//   otomatik iade YOK (bkz. reclaimListing) — bu yüzden çanta/depo dolu
//   olsa bile hiçbir eşya sessizce kaybolmaz veya çökmeye sebep olmaz,
//   sadece "alınmayı bekliyor" olarak kalır.
import { rollLoot } from "../utils/loot";
import { pick, rand, uid } from "../utils/random";
import { FAKE_SELLER_NAMES } from "../data/marketNames";
import { loadMarketListings, saveMarketListings } from "../utils/storage";

let npcListings = [];
let npcSeeded = false;

let currentUsername = null;
let myListings = [];

function priceFor(item) {
  const base = Math.round((item.atk || 0) * 1.3 + (item.def || 0) * 1.2 + (item.hp || 0) * 0.8);
  return Math.max(6, base + rand(4, 18));
}

// KO'nun BBS ilan ücretleri (Define.h: 500g alım / 1000g satım) düz sabit
// — bizim 65 seviyelik altın enflasyonumuzda anlamsız kalır (Lv.1'de
// ~20g/öldürme). Onun yerine ilan fiyatının yüzdesi: küçük eşyada birkaç
// altın, pahalı eşyada anlamlı bir sink — kendiliğinden ölçekleniyor.
export const LISTING_FEE_RATE = 0.05;
export function listingFeeFor(price) {
  return Math.max(1, Math.round(price * LISTING_FEE_RATE));
}

// Kullanıcı isteği: "1-3-6-12-24 saatlik pazarlar kurulsun."
export const MARKET_DURATIONS_HOURS = [1, 3, 6, 12, 24];
const HOUR_MS = 3600 * 1000;

function isExpired(listing) {
  return Date.now() >= listing.listedAt + listing.durationHours * HOUR_MS;
}

function ensureLoaded(username) {
  if (currentUsername === username) return;
  currentUsername = username;
  myListings = loadMarketListings(username);
}

function persist() {
  if (currentUsername) saveMarketListings(currentUsername, myListings);
}

function spawnFakeListing() {
  const tierId = rand(1, 3); // simulated sellers mostly deal in lower-tier gear
  const item = rollLoot(tierId); // hangi sınıfa ait olacağı zaten rollLoot içinde şansa bağlı
  if (!item) return;
  npcListings.push({
    id: uid(),
    sellerId: "npc",
    sellerName: pick(FAKE_SELLER_NAMES),
    item,
    price: priceFor(item),
    listedAt: Date.now(),
    active: true,
  });
}

function seedIfNeeded() {
  if (npcSeeded) return;
  npcSeeded = true;
  for (let i = 0; i < 6; i++) spawnFakeListing();
}

// GET /market/listings — username, MarketTab her mount'ta/refreshte
// gönderiyor ki hangi hesabın kalıcı ilanlarının okunacağı belli olsun
// (bu modül birden fazla sekme/karakter arasında paylaşılan tek bir
// modül-seviyesi state, bkz. ensureLoaded).
export async function fetchListings(username) {
  ensureLoaded(username);
  seedIfNeeded();
  const npcCount = npcListings.filter((l) => l.sellerId === "npc").length;
  if (npcCount < 10 && Math.random() < 0.3) spawnFakeListing();
  const mine = myListings.map((l) => ({ ...l, active: !isExpired(l) }));
  return [...mine, ...npcListings.map((l) => ({ ...l }))];
}

// Kullanıcı isteği: "Deaktif olan pazarda ki eşyalar alınmadan yeni pazar
// kurulamaz." — herhangi bir süresi dolmuş, henüz geri alınmamış ilanım
// varsa yeni ilan açmayı engeller.
export function hasUnclaimedExpired(username) {
  ensureLoaded(username);
  return myListings.some(isExpired);
}

// POST /market/listings — sellerName KARAKTERİN takma adı (kullanıcı
// isteği: "Oyuncuların Pazarları kendi isimleri ile kurulsun"), username
// ise sadece hangi HESABIN kalıcı deposuna yazılacağını belirleyen anahtar
// — ikisi farklı şeyler, bir hesapta birden fazla karakter/isim olabilir.
export async function createListing(username, item, price, durationHours, sellerName) {
  ensureLoaded(username);
  if (myListings.some(isExpired)) {
    return { ok: false, reason: "Süresi dolmuş bir ilanının eşyasını almadan yeni ilan açamazsın." };
  }
  const listing = { id: uid(), sellerId: "me", sellerName, item, price, listedAt: Date.now(), durationHours, active: true };
  myListings.push(listing);
  persist();
  return { ok: true, listing: { ...listing } };
}

// DELETE /market/listings/:id — sadece hâlâ AKTİF (süresi dolmamış) bir
// ilan iptal edilebilir; süresi dolmuş olanlar reclaimListing'den geçmeli
// (aynı eylem ama "iptal" değil "al" olarak adlandırılıyor, kullanıcı
// isteği: "deaktif olan pazardaki eşyaları satıcı kendisi alacak").
export async function cancelListing(username, listingId) {
  ensureLoaded(username);
  const idx = myListings.findIndex((l) => l.id === listingId);
  if (idx === -1 || isExpired(myListings[idx])) return null;
  const [listing] = myListings.splice(idx, 1);
  persist();
  return { ...listing };
}

// Deaktif (süresi dolmuş) bir ilanın eşyasını geri almak — kullanıcı
// isteği: "Deaktif olan pazardaki eşyaları satıcı kendisi alacak." Otomatik
// iade yok; çağıran (MarketTab) eşyayı depoya koymayı DENER, başarısız
// olursa (depo doluysa) bu fonksiyon hiç çağrılmaz, ilan claim edilmeden
// kalır — hiçbir eşya sessizce kaybolmaz.
export async function reclaimListing(username, listingId) {
  ensureLoaded(username);
  const idx = myListings.findIndex((l) => l.id === listingId);
  if (idx === -1 || !isExpired(myListings[idx])) return null;
  const [listing] = myListings.splice(idx, 1);
  persist();
  return { ...listing };
}

// POST /market/listings/:id/buy — sadece NPC ilanları satın alınabilir;
// oyuncunun kendi ilanları (myListings) buradan hiç geçmiyor, onlar iptal
// veya (süresi dolmuşsa) geri alma ile yönetiliyor.
export async function buyListing(listingId) {
  const idx = npcListings.findIndex((l) => l.id === listingId);
  if (idx === -1) return { ok: false, reason: "İlan artık mevcut değil." };
  const [listing] = npcListings.splice(idx, 1);
  return { ok: true, listing: { ...listing } };
}

// Stands in for real buyers discovering the player's listings over time.
// Called opportunistically when the player visits the market. Süresi
// dolmuş ilanlar artık satılamaz — sadece hâlâ aktif olanlar bu rulete
// giriyor, süresi dolan bir ilan deaktif kalıp geri alınmayı bekliyor.
export async function resolveMyListings(username) {
  ensureLoaded(username);
  const sold = [];
  myListings = myListings.filter((l) => {
    if (isExpired(l)) return true;
    if (Math.random() < 0.35) { sold.push({ ...l }); return false; }
    return true;
  });
  persist();
  return sold;
}
