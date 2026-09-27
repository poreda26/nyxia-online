// Nyxia Online — push bildirim service worker'ı. Vite tarafından derlenmiyor
// (bkz. public/ klasörü, Vite bunu olduğu gibi site köküne kopyalar) —
// çünkü bir service worker kendi scope'unun (burada tüm site) DIŞINDAN,
// sayfa kapalıyken bile push event'i alabilmeli; bundle'a gömülü bir modül
// olamaz. Kullanıcı isteği: "telefona bildirim gönderme sistemini
// kurmanı istiyorum... Ayarlar kısmında bu bildirimleri istediği gibi açıp
// kapatabilir" — bkz. src/utils/pushNotifications.js (abone olma/izin akışı)
// ve server/app.mjs'in push bölümü (gönderim + 3 tetikleyici: inaktiflik,
// etkinlik hatırlatma, arkadaş/mesaj).
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* boş/bozuk payload — sessizce yok say */ }
  const title = data.title || "Nyxia Online";
  // icon/badge kasıtlı olarak boş bırakıldı — henüz bir marka görseli yok
  // (kullanıcı görselleri ayrıca hazırlayacak); tarayıcı kendi varsayılanına
  // düşüyor, kırık bir resim isteği yapmıyoruz.
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag || "nyxia",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
