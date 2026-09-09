// Karakter oluşturulunca otomatik kuşanılan, sınıfa özel T1 başlangıç
// silahı — genel loot tablosundan rastgele ÇEKİLMİYOR, elle seçilmiş sabit
// bir şablon (bkz. utils/player.js#initialPlayer), her sınıfın kendi T1
// tablosunun (data/warriorWeapons.js, rogueWeapons.js, casterWeapons.js)
// ilk girdisiyle birebir aynı — gereksinimleri o sınıfın baseStats'ıyla
// karşılanıyor.
export const STARTING_WEAPONS = {
  warrior: { name: "Short Blade", weaponType: "sword", weaponSlot: "mainHand", atk: 16, reqStats: [{ key: "str", value: 62 }] },
  rogue: { name: "Bow", weaponType: "bow", weaponSlot: "mainHand", atk: 16, reqStats: [{ key: "dex", value: 66 }] },
  mage: { name: "Wood Staff", weaponType: "staff", weaponSlot: "mainHand", atk: 18, reqStats: [{ key: "int", value: 46 }] },
};
