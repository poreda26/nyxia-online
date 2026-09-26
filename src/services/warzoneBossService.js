// Faz 4 — paylaşımlı Dünya Canavarı (server/app.mjs'teki /api/warzone/*
// uçları). Boss'un faz zamanlaması (dormant/gathering/countdown/active/gone)
// hâlâ istemcide hesaplanıyor (bkz. utils/warzoneBoss.js#bossSchedule) —
// sunucu da AYNI saf fonksiyonu kullanıyor, iki takvim asla sapmaz. Sunucu
// sadece "active" fazdaki bosslarda PAYLAŞILAN can/katkı miktarlarını tutar.
// Hasar hâlâ istemcide hesaplanıyor (mevcut formül), sunucu sadece akla
// yatkın bir üst sınırla kabul ediyor — tam sunucu-taraflı hasar hesabı
// (gerçek anti-hile) oyuncunun ekipman/istatistiklerinin sunucuda da
// bilinmesini gerektirir, bkz. docs/ONLINE_ROADMAP.md'nin Faz 5'i.
import { call } from "../utils/api";

export const fetchActiveBosses = () => call("warzone/bosses", "GET");
export const attackBoss = (bossId, damage) => call(`warzone/boss/${bossId}/attack`, "POST", { damage });
export const fetchLootClaims = () => call("warzone/loot-claims", "GET");
export const claimLoot = (claimId) => call(`warzone/loot-claims/${claimId}/claim`, "POST");
