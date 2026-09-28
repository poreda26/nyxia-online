// Faz 6 — gerçek çok-oyunculu klan (üyelik/davet/paylaşımlı hazine sunucuda,
// bkz. server/app.mjs'in /api/clan/* üstündeki notu). Kuruluş/bağış
// maliyetleri oyundaki her ekonomi hareketi gibi İSTEMCİDE düşülüyor —
// buradaki çağrılar sadece paylaşımlı kaydı günceller.
import { call } from "../utils/api";

export const fetchMyClan = (characterKey) => call("clan/mine", "GET",undefined,characterKey);
export const foundClanApi = (name, color, avatarId) => call("clan", "POST", { name, color, avatarId });
export const updateClanAvatar = (avatarId) => call("clan/avatar", "PATCH", { avatarId });
export const inviteToClan = (name) => call("clan/invite", "POST", { name });
export const fetchClanInvites = () => call("clan/invites", "GET");
export const acceptClanInvite = (id) => call(`clan/invites/${id}/accept`, "POST");
export const declineClanInvite = (id) => call(`clan/invites/${id}/decline`, "POST");
export const leaveClanApi = () => call("clan/leave", "POST");
export const kickClanMember = (accountId,characterKey) => call("clan/kick", "POST", { accountId,characterKey });
export const promoteClanMember = (accountId,characterKey) => call("clan/promote", "POST", { accountId,characterKey });
export const demoteClanMember = (accountId,characterKey) => call("clan/demote", "POST", { accountId,characterKey });
export const donateToClan = (currency, amount) => call("clan/donate", "POST", { currency, amount });
export const upgradeClanBuildingApi = () => call("clan/building/upgrade", "POST");

// Klan Dungeon (Clan Raid) — kullanıcının pasted spec'i: paylaşılan aşama/HP
// klan başına tek satırda (bkz. server/app.mjs'in aynı başlıklı bölümü),
// kilit tek seferde 1 üyede. Hasar burada da (oyunun geri kalanıyla aynı
// güven sınırı) istemcide hesaplanıp sunucuya bildiriliyor, sunucu sadece
// akla yatkın bir üst sınırla kabul ediyor.
export const fetchClanDungeon = () => call("clan/dungeon", "GET");
export const enterClanDungeon = () => call("clan/dungeon/enter", "POST");
export const attackClanDungeon = (damage) => call("clan/dungeon/attack", "POST", { damage });
export const leaveClanDungeon = (characterKey) => call("clan/dungeon/leave", "POST",{},characterKey);
export const fetchClanDungeonLog = () => call("clan/dungeon/log", "GET");
