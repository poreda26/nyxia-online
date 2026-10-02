// Sohbet / özel mesaj "okundu" bilgisi. Cihazda ve hesap bazında saklanır:
// bir kez okunan mesajın bildirimi oyun yeniden açılsa da geri gelmez, yalnızca
// daha yeni bir mesaj gelince yanar. Kritik veri değil, sunucuya yazılmaz.
// `null` = bu hesap için hiç kayıt yok (ilk açılış); çağıran mevcut geçmişi
// "görülmüş" sayıp tohumlar, böylece eski mesajlar için sahte bildirim çıkmaz.
const chatKey = (username) => `nyxia:read:${username}:chat`;
const dmKey = (username) => `nyxia:read:${username}:dm`;

export function loadChatSeenId(username) {
  try {
    const raw = localStorage.getItem(chatKey(username));
    const value = raw === null ? null : Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch { return null; }
}

export function saveChatSeenId(username, id) {
  try { localStorage.setItem(chatKey(username), String(id)); } catch { /* depolama kapalı */ }
}

export function loadDmSeen(username) {
  try {
    const parsed = JSON.parse(localStorage.getItem(dmKey(username)) || "null");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

export function saveDmSeen(username, seen) {
  try { localStorage.setItem(dmKey(username), JSON.stringify(seen)); } catch { /* depolama kapalı */ }
}

// Genel sohbet: kendi yazdıklarım bildirim sayılmaz; görülenden yeni bir
// başkası mesajı varsa okunmamış.
export function hasUnreadChat(messages, seenId) {
  return messages.some((m) => !m.mine && m.id > seenId);
}

export function latestChatId(messages) {
  return messages.reduce((max, m) => (m.id > max ? m.id : max), 0);
}

// Özel mesaj: arkadaşın bana son mesajı görülen zamandan yeniyse okunmamış.
export function unreadFriendIds(friends, seenAt) {
  return friends.filter((f) => f.lastMessageAt && f.lastMessageAt > (seenAt[f.accountId] || 0)).map((f) => f.accountId);
}
