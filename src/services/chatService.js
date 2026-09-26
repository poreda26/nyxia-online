// Global chat — artık gerçek backend'e (server/app.mjs, /api/chat/messages)
// bağlı: mesajlar sunucudaki SQLite'ta tutuluyor, tüm oyuncular aynı listeyi
// görüyor. Giriş yapmamış (session'ı olmayan) biri ne okuyabilir ne yazabilir
// (bkz. app.mjs — /api/chat/messages LOGIN_REQUIRED'dan sonra geliyor).
import { call } from "../utils/api";

// GET /api/chat/messages
export async function fetchMessages() {
  return call("chat/messages", "GET");
}

// POST /api/chat/messages
export async function sendMessage(author, text, isGM) {
  return call("chat/messages", "POST", { author, text, isGM: !!isGM });
}
