// 5 dağıtılabilir statü — STR/STA/DEX/INT/Magic Power. Gerçek Knight
// Online'da CHA diye bir statü yok, önceki bir turda yanlışlıkla eklenmişti;
// kullanıcı isteğiyle kaldırıldı ve yerine Magic Power (mag) geldi — Mage'in
// asıl hasar kaynağı (bkz. utils/player.js#totalStats'taki mage-özel ağırlık,
// data/classes.js#mage.mainStat). HP ve MP (Mana) burada birer statü
// DEĞİL, türeme kaynak havuzları (bkz. player.js#playerMaxHp/playerMaxMp),
// sırasıyla STA ve INT'ten besleniyor — Magic Power manaya değil doğrudan
// büyü hasarına giriyor, bu yüzden kısaltması bilinçli olarak "MP" değil
// "MPW" (Mana'nın "MP" etiketiyle karışmasın diye).
export const STAT_KEYS = ["str", "sta", "dex", "int", "mag"];

// `hp` burada bir dağıtılabilir statü DEĞİL — sadece bazı eşyaların
// (bkz. data/warriorWeapons.js#Avedon, "Required Health") reqStats
// etiketinde gösterilsin diye. equipItem bu anahtarı gördüğünde
// player.stats.hp'ye değil playerMaxHp(player)'a bakıyor (bkz.
// utils/player.js#equipItem).
// `level` de `hp` gibi dağıtılabilir bir statü DEĞİL — sadece bazı eşyaların
// (bkz. data/casterWeapons.js#"Staff of <selfname>", "Required Level: 70")
// reqStats etiketinde gösterilsin diye. equipItem bu anahtarı gördüğünde
// player.stats.level'a değil doğrudan player.level'a bakıyor.
export const STAT_LABELS = { str: "STR", sta: "STA", dex: "DEX", int: "INT", mag: "MPW", hp: "HP", level: "Seviye" };

export const STAT_FULL_LABELS = {
  str: "Güç (STR)",
  sta: "Dayanıklılık (STA)",
  dex: "Çeviklik (DEX)",
  int: "Zeka (INT)",
  mag: "Büyü Gücü (Magic Power)",
};

export const STAT_COLORS = { str: "#C97A3D", sta: "#5FA8A0", dex: "#8B6FC9", int: "#D4AF6A", mag: "#B565D8" };

export const POINTS_PER_LEVEL = 3;

// Her statü için tavan — bu değere ulaşınca o statüye daha fazla puan
// dağıtılamaz (bkz. utils/player.js#allocateStat).
export const STAT_CAP = 255;
