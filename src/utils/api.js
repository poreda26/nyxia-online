// Gerçek backend'e (server/app.mjs) konuşan tek yer. VITE_API_BASE boşsa
// istekler aynı origin'e (relative /api/...) gider — üretimde frontend ve
// API aynı domain'den servis edileceği için bu varsayılan doğru olacak;
// yerel geliştirmede (Vite 5173, backend ayrı port 8787) .env.local'de
// VITE_API_BASE=http://localhost:8787 ile ezilir.
import { Capacitor } from "@capacitor/core";
import { CLIENT_BUILD } from "../version";

// Mağaza uygulamasında (Capacitor) sayfa https://localhost / capacitor://localhost
// origin'inden çalışır: göreli /api yolu uygulamanın kendi yerel sunucusuna
// gider, SameSite=Strict çerez de gönderilmez. Bu yüzden yerel uygulama canlı
// API adresini kullanır ve oturumu Bearer token ile taşır.
const NATIVE = Capacitor.isNativePlatform();
const API_BASE = import.meta.env.VITE_API_BASE || (NATIVE ? "https://nyxia.sametcantas.com" : "");
const TOKEN_KEY = "nyxia_native_session";
const readToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
const writeToken = (value) => { try { value ? localStorage.setItem(TOKEN_KEY, value) : localStorage.removeItem(TOKEN_KEY); } catch { /* depolama kapalı */ } };

// Diğer servislerin (ör. chatService.js) aynı fetch/CORS/çerez mantığını
// tekrarlamadan gerçek backend'e konuşabilmesi için dışa açık.
let activeCharacterKey=null;
export function getActiveCharacterKey(){return activeCharacterKey;}
export function setActiveCharacterKey(key){activeCharacterKey=key;}
export async function call(path, method, body, characterKey=activeCharacterKey) {
  const token = NATIVE ? readToken() : null;
  const res = await fetch(`${API_BASE}/api/${path}`, {
    method,
    credentials: NATIVE ? "omit" : "include",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Build": String(CLIENT_BUILD),
      ...(path.startsWith("clan")&&characterKey?{"X-Character-Key":characterKey}:{}),
      ...(NATIVE ? { "X-Native-Client": "1", ...(token ? { Authorization: `Bearer ${token}` } : {}) } : {}),
    },
    ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
  });
  let data = {};
  try { data = await res.json(); } catch { /* boş gövde (ör. 204) */ }
  if (NATIVE) {
    if (res.ok && data.token && (path === "login" || path === "register")) writeToken(data.token);
    else if (path === "logout" || (res.ok && path === "account/delete") || (res.status === 401 && data.error === "LOGIN_REQUIRED")) writeToken(null);
  }
  // Sunucu bu sürümü artık kabul etmiyor: uygulama güncelleme ekranını açar (bkz. App.jsx).
  if (res.status === 426 && data.error === "CLIENT_OUTDATED" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nyxia:outdated", { detail: data }));
  if (!res.ok) throw Object.assign(new Error(data.error || "REQUEST_FAILED"), { code: data.error });
  return data;
}

export const registerAccount = (name, password) => call("register", "POST", { name, password });
export const loginAccount = (name, password) => call("login", "POST", { name, password });
export const logoutAccount = () => call("logout", "POST");
export const fetchMe = () => call("me", "GET");
export const deleteAccountApi = (password) => call("account/delete", "POST", { password });

// Faz 2 — hesap yedeği (server/app.mjs#/api/backup). `revision` iyimser
// eşzamanlılık kontrolü: sunucudaki güncel sürümle uyuşmayan bir PUT 409
// (code: "BACKUP_CONFLICT") döner — çağıran taraf en güncel sürümü
// fetchBackup ile tekrar okuyup üstüne yazmalı, sessizce yok saymamalı.
export const fetchBackup = () => call("backup", "GET");
export const pushBackup = (revision, data) => call("backup", "PUT", { revision, data });
