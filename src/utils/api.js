// Gerçek backend'e (server/app.mjs) konuşan tek yer. VITE_API_BASE boşsa
// istekler aynı origin'e (relative /api/...) gider — üretimde frontend ve
// API aynı domain'den servis edileceği için bu varsayılan doğru olacak;
// yerel geliştirmede (Vite 5173, backend ayrı port 8787) .env.local'de
// VITE_API_BASE=http://localhost:8787 ile ezilir.
const API_BASE = import.meta.env.VITE_API_BASE || "";

// Diğer servislerin (ör. chatService.js) aynı fetch/CORS/çerez mantığını
// tekrarlamadan gerçek backend'e konuşabilmesi için dışa açık.
export async function call(path, method, body) {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
  });
  let data = {};
  try { data = await res.json(); } catch { /* boş gövde (ör. 204) */ }
  if (!res.ok) throw Object.assign(new Error(data.error || "REQUEST_FAILED"), { code: data.error });
  return data;
}

export const registerAccount = (name, password) => call("register", "POST", { name, password });
export const loginAccount = (name, password) => call("login", "POST", { name, password });
export const logoutAccount = () => call("logout", "POST");
export const fetchMe = () => call("me", "GET");

// Faz 2 — hesap yedeği (server/app.mjs#/api/backup). `revision` iyimser
// eşzamanlılık kontrolü: sunucudaki güncel sürümle uyuşmayan bir PUT 409
// (code: "BACKUP_CONFLICT") döner — çağıran taraf en güncel sürümü
// fetchBackup ile tekrar okuyup üstüne yazmalı, sessizce yok saymamalı.
export const fetchBackup = () => call("backup", "GET");
export const pushBackup = (revision, data) => call("backup", "PUT", { revision, data });
