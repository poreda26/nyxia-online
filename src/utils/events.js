// GM-tetikli geçici olaylar — utils/premium.js'teki expiresAt desenini
// kullanıyor ama hesap/ödeme değil, saf bir GM yetkisi (bkz.
// utils/gmCommands.js#expevent, kullanıcı isteği: "1 saatliğine %100 exp
// bonus açma yetkisi olsun"). Şu an tek bir olay tipi var: geçici bir EXP
// çarpanı, süresi/yüzdesi GM tarafından ayarlanabilir.
export function activeExpEvent(player) {
  if (!player.eventExpBonus?.expiresAt) return null;
  if (player.eventExpBonus.expiresAt <= Date.now()) return null;
  return player.eventExpBonus;
}

export function eventExpMultiplier(player) {
  return activeExpEvent(player)?.mult ?? 1;
}

export function eventExpMinutesLeft(player) {
  const ev = activeExpEvent(player);
  return ev ? Math.max(0, Math.ceil((ev.expiresAt - Date.now()) / 60000)) : 0;
}
