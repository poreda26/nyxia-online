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
export const CHARACTER_SLOTS = 3;

function emptyAccount() {
  return { race: null, characters: Array(CHARACTER_SLOTS).fill(null), bank: Array.from({ length: BANK_PAGES }, () => []) };
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

// Backfills .bank onto accounts saved before Depo became account-wide, so
// an existing save doesn't crash on a missing field.
export function loadAccount(username) {
  const accounts = readAccounts();
  const account = accounts[username] || emptyAccount();
  return account.bank ? account : { ...account, bank: Array.from({ length: BANK_PAGES }, () => []) };
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

export function saveLastUsername(username) {
  try { localStorage.setItem(LAST_USERNAME_KEY, username); } catch { /* ignore */ }
}

export function loadLastUsername() {
  try { return localStorage.getItem(LAST_USERNAME_KEY) || ""; } catch { return ""; }
}
