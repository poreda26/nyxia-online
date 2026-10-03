// Faz 6 — arkadaş listesi + özel mesaj. Hesap adıyla (accounts.name)
// hedefleniyor, bkz. server/app.mjs'in /api/social/* üstündeki notu.
import { call } from "../utils/api";

export const fetchFriends = () => call("social/friends", "GET");
export const fetchSuggestions = () => call("social/suggestions", "GET");
export const sendFriendRequest = (name) => call("social/friends/request", "POST", { name });
export const acceptFriendRequest = (id) => call(`social/friends/${id}/accept`, "POST");
export const declineFriendRequest = (id) => call(`social/friends/${id}/decline`, "POST");
export const removeFriend = (accountId) => call(`social/friends/${accountId}`, "DELETE");

// Engelleme ve şikayet (Apple 1.2 / Google UGC). `target`: { messageId } genel
// sohbet mesajı, { dmId } aldığım özel mesaj, { accountId } doğrudan hesap,
// { clanId } klan. Genel sohbette hesap kimliği istemciye verilmez; sunucu çözer.
export const fetchBlocks = () => call("social/blocks", "GET");
export const blockUser = (target) => call("social/block", "POST", target);
export const unblockUser = (accountId) => call(`social/blocks/${accountId}`, "DELETE");
export const reportUser = (target, reason, details = "") => call("social/report", "POST", { ...target, reason, details });

// Arkadaşa VS (dostane düello): arkadaşın kayıtlı karakteri + adil seed.
export const fetchFriendDuel = (accountId) => call(`social/friends/${accountId}/duel`, "GET");

export const fetchDirectMessages = (accountId) => call(`social/messages/${accountId}`, "GET");
export const sendDirectMessage = (accountId, text, avatarId, frameId) => call(`social/messages/${accountId}`, "POST", { text, avatarId, frameId:frameId||null });
