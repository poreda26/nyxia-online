// Faz 6 — arkadaş listesi + özel mesaj. Hesap adıyla (accounts.name)
// hedefleniyor, bkz. server/app.mjs'in /api/social/* üstündeki notu.
import { call } from "../utils/api";

export const fetchFriends = () => call("social/friends", "GET");
export const fetchSuggestions = () => call("social/suggestions", "GET");
export const sendFriendRequest = (name) => call("social/friends/request", "POST", { name });
export const acceptFriendRequest = (id) => call(`social/friends/${id}/accept`, "POST");
export const declineFriendRequest = (id) => call(`social/friends/${id}/decline`, "POST");
export const removeFriend = (accountId) => call(`social/friends/${accountId}`, "DELETE");

export const fetchDirectMessages = (accountId) => call(`social/messages/${accountId}`, "GET");
export const sendDirectMessage = (accountId, text, avatarId, frameId) => call(`social/messages/${accountId}`, "POST", { text, avatarId, frameId:frameId||null });
