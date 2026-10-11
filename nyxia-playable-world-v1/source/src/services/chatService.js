// Global chat, built the same async-first way as marketService.js — every
// export already has the shape a future fetch()/WebSocket-backed call
// would have, so swapping the in-memory array below for a real server is a
// contained change. Nothing in the UI layer talks to `messages` directly.
import { uid } from "../utils/random";

let messages = [];
let seeded = false;

function seedIfNeeded() {
  if (seeded) return;
  seeded = true;
  messages.push({
    id: uid(),
    author: "Sistem",
    text: "Sohbete hoş geldin! Buradan diğer maceracılarla konuşabilirsin.",
    isSystem: true,
    isGM: false,
    createdAt: Date.now(),
  });
}

// GET /chat/messages
export async function fetchMessages() {
  seedIfNeeded();
  return messages.map((m) => ({ ...m }));
}

// POST /chat/messages
export async function sendMessage(author, text, isGM) {
  const msg = { id: uid(), author, text, isGM: !!isGM, isSystem: false, createdAt: Date.now() };
  messages.push(msg);
  return { ...msg };
}
