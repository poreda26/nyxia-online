// Player-to-player market, built async-first so this module is the only
// thing that needs to change when a real backend exists — every export
// here already has the shape a future fetch()/API call would have
// (Promise-returning, plain-serializable payloads in and out). For now the
// "server" is just an in-memory array that lives for the browser session;
// nothing in the UI layer talks to that array directly.
import { rollLoot } from "../utils/loot";
import { pick, rand, uid } from "../utils/random";
import { FAKE_SELLER_NAMES } from "../data/marketNames";

let listings = [];
let seeded = false;

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

function spawnFakeListing() {
  const tierId = rand(1, 3); // simulated sellers mostly deal in lower-tier gear
  const item = rollLoot(tierId, pick(["warrior", "rogue", "mage", "priest"]));
  // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
  // hiçbir eşya yoksa rollLoot null döner, sahte ilanı hiç oluşturma.
  if (!item) return;
  listings.push({
    id: uid(),
    sellerId: "npc",
    sellerName: pick(FAKE_SELLER_NAMES),
    item,
    price: priceFor(item),
    listedAt: Date.now(),
  });
}

function seedIfNeeded() {
  if (seeded) return;
  seeded = true;
  for (let i = 0; i < 6; i++) spawnFakeListing();
}

// GET /market/listings
export async function fetchListings() {
  seedIfNeeded();
  const npcCount = listings.filter((l) => l.sellerId === "npc").length;
  if (npcCount < 10 && Math.random() < 0.3) spawnFakeListing();
  return listings.map((l) => ({ ...l }));
}

// POST /market/listings
export async function createListing(item, price) {
  const listing = { id: uid(), sellerId: "me", sellerName: "Sen", item, price, listedAt: Date.now() };
  listings.push(listing);
  return { ...listing };
}

// DELETE /market/listings/:id
export async function cancelListing(listingId) {
  const idx = listings.findIndex((l) => l.id === listingId && l.sellerId === "me");
  if (idx === -1) return null;
  const [listing] = listings.splice(idx, 1);
  return { ...listing };
}

// POST /market/listings/:id/buy
export async function buyListing(listingId) {
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) return { ok: false, reason: "İlan artık mevcut değil." };
  const [listing] = listings.splice(idx, 1);
  return { ok: true, listing: { ...listing } };
}

// Stands in for real buyers discovering the player's listings over time.
// Called opportunistically when the player visits the market; once this is
// backed by a real server this becomes a webhook/notification instead of a
// poll, but the call site in MarketTab doesn't need to know that.
export async function resolveMyListings() {
  const sold = [];
  listings = listings.filter((l) => {
    if (l.sellerId !== "me") return true;
    if (Math.random() < 0.35) { sold.push({ ...l }); return false; }
    return true;
  });
  return sold;
}
