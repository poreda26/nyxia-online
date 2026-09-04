import { todayKey } from "./day";
import { xpToNext, MAX_LEVEL, gainXp } from "./player";

// Bir olayın BUGÜNKÜ oluşumunun başlama zamanı (epoch ms) — cihazın yerel
// saatine göre. Sunucu olmadığı için bu senkron değil (bkz. data/
// scheduledEvents.js'in üstündeki not) ama tek cihazlı/tek oyunculu bir
// oturum için yeterli: her cihaz kendi saatine göre aynı olayı açar.
function scheduledStart(event, now = Date.now()) {
  const d = new Date(now);
  d.setHours(event.hour, event.minute, 0, 0);
  return d.getTime();
}

export function eventTotalTicks(event) {
  return Math.round(event.durationMinutes / event.tickIntervalMinutes);
}

// "upcoming": henüz preopen penceresine girmedi — hiçbir yerde görünmez.
// "preopen": etkinlik alanı açık, geri sayım sürüyor, katılınabilir ama
// henüz tick işlemiyor. "active": tick'ler işliyor. "ended": bugünkü
// oluşum bitti, yarına kadar bir şey yok.
export function eventPhase(event, now = Date.now()) {
  const start = scheduledStart(event, now);
  const preOpenAt = start - event.preOpenMinutes * 60000;
  const end = start + event.durationMinutes * 60000;
  let phase;
  if (now < preOpenAt) phase = "upcoming";
  else if (now < start) phase = "preopen";
  else if (now < end) phase = "active";
  else phase = "ended";
  return { phase, start, end, preOpenAt };
}

// Başlangıçtan bu yana kaç tick GERÇEKTEN geçmiş olması gerektiğini saat
// farkından hesaplar — bir setInterval sayacı değil. Bu yüzden uygulama
// arka plandayken/kapalıyken zamanlayıcı hiç çalışmasa bile (mobil
// tarayıcılar arka plan sekmelerini kısıtlıyor), tekrar açılınca doğru
// sayıya "atlanır" — bkz. creditScheduledEventTicks'in telafi mantığı.
export function ticksElapsed(event, now = Date.now()) {
  const { phase, start } = eventPhase(event, now);
  const total = eventTotalTicks(event);
  if (phase === "upcoming" || phase === "preopen") return 0;
  if (phase === "ended") return total;
  return Math.min(total, Math.floor((now - start) / (event.tickIntervalMinutes * 60000)));
}

function freshState() {
  return { day: todayKey(), joined: false, ticksCredited: 0 };
}

// player.scheduledEvents[event.id] gün değiştiyse (ya da hiç yoksa) taze
// sayılır — utils/dailyQuests.js'teki "day değişince sıfırla" deseniyle aynı.
function stateFor(player, event) {
  const s = player.scheduledEvents?.[event.id];
  return s && s.day === todayKey() ? s : freshState();
}

export function scheduledEventProgress(player, event) {
  const s = stateFor(player, event);
  return { joined: s.joined, ticksCredited: s.ticksCredited, totalTicks: eventTotalTicks(event) };
}

export function canJoinScheduledEvent(player, event, now = Date.now()) {
  const { phase } = eventPhase(event, now);
  if (phase !== "preopen" && phase !== "active") return { ok: false, reason: "Etkinlik şu an açık değil." };
  if (stateFor(player, event).joined) return { ok: false, reason: "Zaten katıldın." };
  return { ok: true };
}

// preopen'da katılan (elapsed=0) tüm tick'leri kaçırmaz. active fazında geç
// katılan sadece kalan tick'leri alır — o ana kadar geçenler zaten kaçmış
// sayılır (kullanıcı isteği: "katılan oyuncular" — katılım anından itibaren).
export function joinScheduledEvent(player, event, now = Date.now()) {
  const check = canJoinScheduledEvent(player, event, now);
  if (!check.ok) return { player, joined: false, reason: check.reason };
  const next = { day: todayKey(), joined: true, ticksCredited: ticksElapsed(event, now) };
  return { player: { ...player, scheduledEvents: { ...player.scheduledEvents, [event.id]: next } }, joined: true };
}

// Hub.jsx'teki periyodik kontrol tarafından çağrılır — katılınmış VE aktif
// bir olay için son kontrolden bu yana geçen yeni tick'leri XP'ye çevirir.
// Yeni tick yoksa null döner (çağıran gereksiz bir setPlayer/toast atmasın).
export function creditScheduledEventTicks(player, event, now = Date.now()) {
  const s = stateFor(player, event);
  if (!s.joined) return null;
  // "active" VE "ended" ikisinde de kredilendirir — son tick tam olay
  // bitiş anında düşüyor (10dk süre = son tick zamanı), o an gelene kadar
  // uygulama arka planda kalmışsa faz zaten "ended"e geçmiş olabilir. Bu
  // dal olmasaydı o son tick hiç ödenmezdi (bkz. ticksElapsed'in "ended"
  // dalı zaten toplamı sınırlıyor, burada sadece o değeri okumasına izin
  // veriliyor). "upcoming"/"preopen"de zaten ticksElapsed 0 döner, ek bir
  // kontrol gerekmiyor ama netlik için burada da hariç tutuluyor.
  const { phase } = eventPhase(event, now);
  if (phase !== "active" && phase !== "ended") return null;
  const elapsed = ticksElapsed(event, now);
  if (elapsed <= s.ticksCredited) return null;

  const newTicks = elapsed - s.ticksCredited;
  const pct = (event.tickPercent * newTicks) / 100;
  const xpAmount = player.level < MAX_LEVEL ? Math.round(xpToNext(player.level) * pct) : 0;
  const { player: gained, levelsGained } = gainXp(player, xpAmount);
  const next = { ...gained, scheduledEvents: { ...gained.scheduledEvents, [event.id]: { day: todayKey(), joined: true, ticksCredited: elapsed } } };
  return { player: next, xpGain: xpAmount, newTicks, levelsGained };
}
