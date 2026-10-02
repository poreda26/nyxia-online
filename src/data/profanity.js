// Küfür/hakaret süzgeci. Apple 1.2 ve Google Play kullanıcı içeriği için süzme
// ister: sohbet ve özel mesajlar maskelenir, hesap/klan/karakter adları reddedilir.
// Sunucu ve istemci aynı dosyayı kullanır, bağımlılığı yoktur.
//
// Eşleşme "jeton" bazlıdır (kelime tamamı ya da öneki), alt dize aranmaz;
// böylece masum kelimeler yanlışlıkla kapanmaz. Türkçe "ı" bilerek "i"ye
// katlanmaz: "sıkışık" masum, "sikis" değil. Büyük harfli "I" iki yoruma da
// (ı ve i) bakılarak denenir, çünkü "SIKTIR" yazan kişi Türkçe klavyede değilse
// "I" aslında "i"dir.
// "Amina" gibi gerçek isimleri korumak için "amina" kökü bilerek yok; Türkçe
// harfli "amına" ve belirgin türevleri var.
const EXACT = [
  'amk', 'aq', 'bok', 'boku', 'boklar', 'boktan', 'picler', 'piclik',
  'fag', 'fags', 'dick', 'dicks', 'kys', 'retard', 'retarded', 'retards',
];
const PREFIX = [
  'siktir', 'sikik', 'sikis', 'sikeyim', 'sikerim', 'siktim', 'amına', 'aminakoy',
  'aminakod', 'amcik', 'amcık', 'yarrak', 'yarak', 'orospu', 'orspu', 'pezevenk', 'kahpe',
  'kahbe', 'ibne', 'gavat', 'yavsak', 'pust', 'dassak', 'tasak', 'gotveren',
  'fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'whore', 'slut',
  'asshole', 'bastard', 'motherfuck', 'cocksuck', 'dickhead',
];
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };
// Yalnızca 3+ tekrar tek harfe iner ("siiiiktir"); çift harfler korunur ki
// "shiitake" gibi masum kelimeler yanlışlıkla eşleşmesin.
const collapse = (s) => s.replace(/(.)\1{2,}/gu, '$1');

function normalize(token, locale) {
  const lower = token.toLocaleLowerCase(locale).normalize('NFD').replace(/[̀-ͯ]/gu, '');
  return collapse([...lower].map((ch) => LEET[ch] ?? ch).join(''));
}

const EXACT_SET = new Set(EXACT.map(collapse));
const PREFIXES = PREFIX.map(collapse);
const LOOSE_ROOTS = PREFIXES.filter((p) => p.length >= 6);

function isBadToken(token) {
  for (const locale of ['tr', 'en']) {
    const n = normalize(token, locale);
    if (EXACT_SET.has(n) || PREFIXES.some((p) => n.startsWith(p))) return true;
  }
  return false;
}

function badRanges(text) {
  const ranges = [];
  for (const m of text.matchAll(/[\p{L}\p{N}@$]+/gu)) {
    if (isBadToken(m[0])) ranges.push([m.index, m.index + m[0].length]);
  }
  // "s i k t i r", "s.i.k.t.i.r" gibi harfleri ayırarak yazılanlar.
  for (const m of text.matchAll(/(?<![\p{L}\p{N}])\p{L}(?:[\s.\-_*,]+\p{L}){3,}(?![\p{L}\p{N}])/gu)) {
    if (isBadToken(m[0].replace(/[\s.\-_*,]+/gu, ''))) ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

export function containsProfanity(text) {
  return typeof text === 'string' && badRanges(text).length > 0;
}

// Kullanıcı/klan/karakter adları için daha katı: uzun kökler kelimenin içinde
// geçse bile (ör. "xxsiktirxx") reddedilir.
export function containsProfanityLoose(name) {
  if (typeof name !== 'string') return false;
  if (containsProfanity(name)) return true;
  for (const locale of ['tr', 'en']) {
    const squashed = normalize(name.replace(/[^\p{L}\p{N}@$]+/gu, ''), locale);
    if (LOOSE_ROOTS.some((root) => squashed.includes(root))) return true;
  }
  return false;
}

export function maskProfanity(text) {
  if (typeof text !== 'string') return text;
  const ranges = badRanges(text);
  if (!ranges.length) return text;
  const hidden = new Array(text.length).fill(false);
  for (const [start, end] of ranges) for (let i = start; i < end; i++) hidden[i] = true;
  let out = '';
  for (let i = 0; i < text.length; i++) out += hidden[i] ? '*' : text[i];
  return out;
}
