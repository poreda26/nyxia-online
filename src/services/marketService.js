// Player-to-player market — Faz 3: artık gerçek backend'e bağlı
// (server/app.mjs'teki /api/market/* uçları). Hesap başına TEK bir "tezgah"
// (stall) var: bir kez süre seçip ücretini ödeyerek açılıyor, içine en çok
// 10 eşya eklenebiliyor. Diğer oyuncuların tezgahları artık GERÇEK —
// sunucudaki market_stalls tablosundan geliyor, satın alma sunucuda atomik
// (bkz. app.mjs'in üstündeki not: eşya transferi atomik, ödeme satıcıya
// doğrudan sunucuda ekleniyor; alıcının altın düşüşü hâlâ istemci tarafında,
// oyundaki diğer her ekonomi hareketiyle aynı güven seviyesinde).
import { call } from "../utils/api";

export const MARKET_DURATIONS_HOURS = [1, 3, 6, 12, 24];
export const MARKET_DURATION_FEE = { 1: 25, 3: 60, 6: 100, 12: 170, 24: 250 };
export const MARKET_STALL_MAX_ITEMS = 10;

// GET /market — kendi tezgahım + diğer oyuncuların aktif tezgahları.
export async function fetchMarket() {
  const [mine, others] = await Promise.all([call("market/stall", "GET"), call("market/stalls", "GET")]);
  return { myStall: mine.stall, otherStalls: others.stalls };
}

export async function openStall(sellerName, durationHours) {
  try {
    const result = await call("market/stall", "POST", { sellerName, durationHours });
    return { ok: true, stall: result.stall };
  } catch (err) {
    const reason = err.code === "STALL_ALREADY_OPEN" ? "stallAlreadyOpen" : err.code === "STALL_EXPIRED_MUST_CLOSE" ? "stallExpiredMustClose" : "stallOpenFailed";
    return { ok: false, reason };
  }
}

export async function addItemToStall(item, price) {
  try {
    const result = await call("market/stall/items", "POST", { item, price });
    return { ok: true, stall: result.stall };
  } catch (err) {
    const reason = err.code === "STALL_FULL" ? "stallFull" : err.code === "NO_OPEN_STALL" ? "noOpenStall" : "addFailed";
    return { ok: false, reason, reasonVars: { max: MARKET_STALL_MAX_ITEMS } };
  }
}

// Belirtilen id'lerdeki eşyaları tezgahtan çıkarır, çıkarılanları döner —
// hem "erken kapat" (tüm id'ler) hem "süresi dolmuş tezgahtan geri al"
// (sadece depoya sığanlar) burayı kullanır.
export async function removeStallItems(itemIds) {
  const result = await call("market/stall/items", "DELETE", { itemIds });
  return result.removed;
}

export async function buyListing(sellerId, itemId) {
  try {
    const result = await call("market/buy", "POST", { sellerId, itemId });
    return { ok: true, item: result.item, price: result.price };
  } catch {
    return { ok: false, reason: "marketItemGone" };
  }
}
