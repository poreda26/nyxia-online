// Karakter oluşturulunca otomatik kuşanılan, sınıfa özel T1 başlangıç
// silahı — genel loot tablosundan rastgele ÇEKİLMİYOR, elle seçilmiş sabit
// bir şablon (bkz. utils/player.js#initialPlayer), her sınıfın kendi T1
// tablosunun (data/warriorWeapons.js, rogueWeapons.js, casterWeapons.js,
// priestWeapons.js) ilk girdisiyle birebir aynı — gereksinimleri o sınıfın
// baseStats'ıyla karşılanıyor. Priest artık kendi Sword/Mace tablosundan
// (PRIEST_WEAPONS) Wood Mace ile başlıyor, eskiden burada tek seferlik
// elle yazılmış bir "Başlangıç Balyozu" vardı (o zaman Priest'in gerçek bir
// silah tablosu yoktu) — artık gereksiz, gerçek tablo değerleriyle
// değiştirildi.
export const STARTING_WEAPONS = {
  warrior: { name: "Short Blade", weaponType: "sword", weaponSlot: "mainHand", atk: 5, reqStats: [{ key: "str", value: 62 }] },
  rogue: { name: "Dagger", weaponType: "dagger", weaponSlot: "mainHand", atk: 6, reqStats: [{ key: "dex", value: 66 }] },
  mage: { name: "Wood Staff", weaponType: "staff", weaponSlot: "mainHand", atk: 14, reqStats: [{ key: "int", value: 46 }] },
  priest: { name: "Wood Mace", weaponType: "mace", weaponSlot: "mainHand", atk: 7, reqStats: [{ key: "str", value: 46 }] },
};
