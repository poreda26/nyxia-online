// Cosmetic aliases are deliberately limited to the three bound purchase rewards.
export const FIRST_PURCHASE_WEAPONS = {
 warrior:{name:'Kurucu Topuzu',appearance:'Totem Topuzu',reference:'Kırıcı Gürz'},
 rogue:{name:'Şafak Kanadı',appearance:'Yelkanat',reference:'Boynuz Arbalet'},
 mage:{name:'Yıldız Yemini',appearance:'Cennetbahçe',reference:'Demir Uçlu Asa'},
};
export function weaponVisualItem(item) {
 const reward=Object.values(FIRST_PURCHASE_WEAPONS).find(w=>w.name===item?.name);
 return reward?{...item,name:reward.appearance,upgradeLevel:7,element:'lightning',elements:null}:item;
}
