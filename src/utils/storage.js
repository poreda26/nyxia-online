// Local-only account/character persistence via localStorage. This is NOT
// real authentication — there is no password, no server, no way to verify
// "you are who you say you are." It exists purely so a browser can hold up
// to 3 characters per username and not lose progress on refresh, which the
// game had zero persistence for before this. A real multi-device account
// system needs an actual backend (see the isGM caveat in player.js for the
// same class of limitation) — this is a placeholder for that, not a
// substitute.
import { BANK_PAGES } from "./player";

const ACCOUNTS_KEY = "rpgmarket:accounts";
const LAST_USERNAME_KEY = "rpgmarket:lastUsername";
// Hesap en fazla 3 karakter slotu tutabilir ama kullanıcı isteğiyle
// başlangıçta sadece 2'si açık — 3.'sü mevcut karakterlerden birinin
// elmasıyla açılabiliyor (bkz. THIRD_SLOT_COST_DIAMONDS, App.jsx
// #handleUnlockSlot, components/CharacterSelectScreen.jsx).
export const CHARACTER_SLOTS = 3;
export const DEFAULT_UNLOCKED_SLOTS = 2;
export const THIRD_SLOT_COST_DIAMONDS = 500;
// Bir karakteri silmenin bedeli — üzerinde en az bu kadar elmas olması
// gerekiyor (kullanıcı isteği: "artık karakter silmek 500 elmas"). Klan
// kurmanın kendi karakterinden elmas kesmesiyle aynı desen (bkz.
// data/clan.js#CLAN_FOUND_COST_DIAMONDS) — hesap genelinde ayrı bir elmas
// havuzu olmadığı için bedel silinen karakterin KENDİ elmasından aranıyor.
export const CHARACTER_DELETE_COST_DIAMONDS = 500;

function emptyAccount() {
  return { race: null, characters: Array(CHARACTER_SLOTS).fill(null), bank: Array.from({ length: BANK_PAGES }, () => []), unlockedSlots: DEFAULT_UNLOCKED_SLOTS };
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch { /* storage unavailable — progress just won't persist */ }
}

// Backfills .bank onto accounts saved before Depo became account-wide, and
// .unlockedSlots onto accounts saved before the 2-slot-default/3.-slot-satın-
// alma sistemi vardı — böyle bir hesabın zaten 3. slotta (index 2) bir
// karakteri varsa (3 slot herkese açıkken oluşturulmuş) geriye dönük hakkı
// elinden alınmaz, direkt 3 açık sayılır; yoksa yeni varsayılan olan 2'ye düşer.
export function loadAccount(username) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  const bank = account.bank || Array.from({ length: BANK_PAGES }, () => []);
  const unlockedSlots = account.unlockedSlots ?? (account.characters?.[2] ? CHARACTER_SLOTS : DEFAULT_UNLOCKED_SLOTS);
  return { ...account, bank, unlockedSlots };
}

// Race is chosen once per ACCOUNT, not per character — every character on
// this login shares it (see the Special Market's race-change scroll for
// the only way to change it after the fact).
export function saveAccountRace(username, race) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  accounts[username] = { ...account, race };
  writeAccounts(accounts);
}

export function saveCharacterSlot(username, slotIndex, player) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  const characters = [...account.characters];
  characters[slotIndex] = player;
  accounts[username] = { ...account, characters };
  writeAccounts(accounts);
}

export function deleteCharacterSlot(username, slotIndex) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  const characters = [...account.characters];
  characters[slotIndex] = null;
  accounts[username] = { ...account, characters };
  writeAccounts(accounts);
}

// Used by the Special Market's race-change scroll — race is account-wide,
// so changing it has to patch every existing character slot too, not just
// the one currently being played.
export function changeAccountRace(username, newRace) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  const characters = account.characters.map((c) => (c ? { ...c, race: newRace } : c));
  const next = { ...account, race: newRace, characters };
  accounts[username] = next;
  writeAccounts(accounts);
  return next;
}

// Depo (bank) is shared across all 3 character slots on the account — see
// App.jsx's account.bank state, threaded down to InventoryTab/MarketTab/
// ChatTab instead of living on the per-character player object.
export function saveAccountBank(username, bank) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  accounts[username] = { ...account, bank };
  writeAccounts(accounts);
}

// 3. karakter slotu bir seferlik elmasla açıldığında hesaba kalıcı olarak
// kaydedilir — bkz. App.jsx#handleUnlockSlot.
export function saveAccountUnlockedSlots(username, unlockedSlots) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  accounts[username] = { ...account, unlockedSlots };
  writeAccounts(accounts);
}

export function saveLastUsername(username) {
  try { localStorage.setItem(LAST_USERNAME_KEY, username); } catch { /* ignore */ }
}

export function loadLastUsername() {
  try { return localStorage.getItem(LAST_USERNAME_KEY) || ""; } catch { return ""; }
}
