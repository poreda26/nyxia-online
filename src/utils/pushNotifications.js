// Push bildirimi — tarayıcı API'lerine dokunan gerçek abonelik akışı (bkz.
// public/sw.js service worker'ı, services/pushService.js sunucu uçları).
// Kullanıcı isteği: "telefona bildirim gönderme sistemini kurmanı
// istiyorum" — native (Capacitor/FCM) bir Firebase projesi gerektirdiği ve
// oyun zaten tarayıcıdan oynandığı için (bkz. server/app.mjs'in üstündeki
// aynı not) VAPID tabanlı Web Push kullanıyoruz: Android Chrome'da (kurulu
// olmasa bile) ve masaüstünde doğrudan çalışır. iOS Safari YALNIZCA site
// "Ana Ekrana Ekle" ile PWA olarak eklendiğinde push destekler (iOS 16.4+)
// — bu, Apple'ın kendi platform kısıtı, kodla aşılamıyor; SettingsModal
// bunu dürüstçe belirtiyor.
import { fetchVapidKey, subscribeToPush, unsubscribeFromPush } from "../services/pushService";

// vite.config.js'teki base yerel geliştirmede '/nyxia-online/' (bkz. dosyanın
// üstündeki not — birden fazla yerel proje aynı anda çalışsın diye), ama
// üretimde kök ('/'). Service worker dosyası public/sw.js'ten build'in HER
// iki tabanına da olduğu gibi kopyalanıyor, o yüzden '/sw.js' diye sabit
// yazmak yerel dev'de 404 verir (gerçek yol '/nyxia-online/sw.js' olur) —
// import.meta.env.BASE_URL Vite'ın kendi base'ini iki ortamda da doğru
// çözüyor. Aynı sebeple SW'nin scope'u da ('/' üretimde, '/nyxia-online/'
// yerelde) doğal olarak kendiliğinden doğru taban dizine iniyor.
const SW_URL = `${import.meta.env.BASE_URL}sw.js`;

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function notificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function getCurrentPushSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_URL);
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch { return null; }
}

// Kayıt (service worker) + izin isteği + gerçek abonelik + sunucuya kaydı
// tek adımda yapar — Ayarlar'daki "Bildirimleri Aç" butonu bunu çağırıyor.
// Dönüş: { ok: true } ya da { ok: false, reason: "unsupported"|"denied"|"error" }.
export async function enablePushNotifications() {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };
  try {
    const registration = await navigator.serviceWorker.register(SW_URL);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: "denied" };
    const { publicKey, enabled } = await fetchVapidKey();
    if (!enabled || !publicKey) return { ok: false, reason: "server-disabled" };
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    await subscribeToPush(subscription.toJSON());
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function disablePushNotifications() {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return { ok: true };
  const endpoint = subscription.endpoint;
  try { await subscription.unsubscribe(); } catch { /* tarayıcı tarafı zaten geçersizse önemsiz */ }
  try { await unsubscribeFromPush(endpoint); } catch { /* sunucuya ulaşılamazsa bile yerelde kapatıldı */ }
  return { ok: true };
}
