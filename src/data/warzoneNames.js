// Savaş Alanı'ndaki hayalet rakiplerin ve sıralama tablolarındaki sahte
// (decoy) kayıtların isim havuzu — gerçek sunucu gelene kadar
// data/marketNames.js#FAKE_SELLER_NAMES ile aynı amaca hizmet eder: ırka
// göre ayrılmış, kulağa gerçek bir oyuncu adı gibi gelen isimler.
export const KARUS_GHOST_NAMES = [
  "KızılPençe", "DemirYumruk", "KanlıKarga", "AlevRuhu", "KarusınOğlu",
  "SavaşUlusu", "KızılBayrak", "YıkımEli", "KurtKanı", "AteşSancağı",
];

export const ELMORAD_GHOST_NAMES = [
  "AyGölgesi", "GümüşKanat", "SessizOk", "BilgeRuh", "ElMoradın Kızı",
  "AyŞövalyesi", "SisYürüyen", "YıldızTacı", "SoğukNefes", "GümüşSancak",
];

export function ghostNamesForRace(race) {
  return race === "karus" ? KARUS_GHOST_NAMES : ELMORAD_GHOST_NAMES;
}
