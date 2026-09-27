// Kullanıcı isteği: "Maksimum 50 arkadaşımız olabilir" + sohbetin sistemi
// yormaması için belirli bir sürede kaybolan bir mesaj sistemi. İstemci ve
// sunucu aynı sabitleri paylaşır (bkz. server/app.mjs, FriendsPanel.jsx,
// ChatTab.jsx) — aynı Faz 4/6 ilkesi (bkz. data/clan.js, data/avatars.js).
export const FRIEND_MAX_COUNT = 50;

// Genel Sohbet ve özel mesajlar bu süreden eskiyse otomatik siliniyor —
// sohbet artık kalıcı bir arşiv değil, kısa ömürlü bir konuşma alanı.
export const CHAT_MESSAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün
export const DM_MESSAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün
