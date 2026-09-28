// Türkçe iyelik eki ("-ın/-in/-un/-ün", sesli harfle bitince araya "n"
// tamponu girer) — Pazar'daki "X'in Pazarı" isimlendirmesi için (bkz.
// MarketTab.jsx). Kullanıcı ve NPC isimleri keyfi olabildiği için tam
// Türkçe dilbilgisi garantisi vermiyor, ama önceki sabit "'nın" eki
// (ünsüzle biten çoğu isimde yanlıştı, ör. "Simsar'nın" yerine
// "Simsar'ın") yerine büyük ölçüde doğru sonuç üretiyor.
const VOWELS = "aeıioöuü";
const BACK_UNROUNDED = "aı"; // → ın
const FRONT_UNROUNDED = "ei"; // → in
const BACK_ROUNDED = "ou"; // → un
const FRONT_ROUNDED = "öü"; // → ün

function normalize(ch) {
  // Türkçe büyük İ/I ayrımı: İ→i, I→ı — toLowerCase tek başına bunu doğru yapmaz.
  if (ch === "İ") return "i";
  if (ch === "I") return "ı";
  return ch.toLowerCase();
}

function lastVowel(name) {
  for (let i = name.length - 1; i >= 0; i--) {
    const ch = normalize(name[i]);
    if (VOWELS.includes(ch)) return ch;
  }
  return "e";
}

function suffixFor(vowel) {
  if (BACK_UNROUNDED.includes(vowel)) return "ın";
  if (FRONT_ROUNDED.includes(vowel)) return "ün";
  if (BACK_ROUNDED.includes(vowel)) return "un";
  return "in"; // FRONT_UNROUNDED / fallback
}

export function possessiveName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return trimmed;
  const lastChar = normalize(trimmed[trimmed.length - 1]);
  const endsInVowel = VOWELS.includes(lastChar);
  const suffix = suffixFor(lastVowel(trimmed));
  return `${trimmed}'${endsInVowel ? "n" : ""}${suffix}`;
}

// Türkçe belirtme (accusative) eki — "yendin" gibi nesne alan fiillerde
// "{ad}'ı/i/u/ü yendin" için (bkz. warzone.js, translations.js). Önceden
// bu şablonlarda ada bakılmaksızın sabit "'i" veya "'ı" eki vardı, çoğu
// isimde yanlıştı. Oyundaki canavar/hayalet isimlerinin neredeyse tamamı
// "Sis Kurdu", "Nadas Devi", "Kor Salamanderi" gibi zaten 3. tekil iyelik
// ekiyle biten tamlama — bu yüzden sesli harfle bitenlerde de (plain
// "kapı"+"yı" gibi değil) "kapısı"+"nı" örneğindeki gibi "n" tamponu
// doğru sonucu verir: "Sis Kurdu'nu", "Nadas Devi'ni".
export function accusativeName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return trimmed;
  const lastChar = normalize(trimmed[trimmed.length - 1]);
  const endsInVowel = VOWELS.includes(lastChar);
  const suffix = suffixFor(lastVowel(trimmed)).slice(0, -1);
  return `${trimmed}'${endsInVowel ? "n" : ""}${suffix}`;
}
