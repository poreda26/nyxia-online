// A single back slot: colours change the appearance, never the power.
export const WINGS = [
  { id: 'dawn', name: 'Şafak Muhafızı', nameEn: 'Dawn Guardian', color: '#f5d69a', light: '#fff8e4', dark: '#725132', shape: 'feather', price: 2000 },
  { id: 'frost', name: 'Buz Ankası', nameEn: 'Frost Phoenix', color: '#58c9ee', light: '#e0fcff', dark: '#183e76', shape: 'crystal', price: 2000 },
  { id: 'ember', name: 'Kızıl Küller', nameEn: 'Crimson Ashes', color: '#ed7148', light: '#ffd793', dark: '#641b35', shape: 'flame', price: 2000 },
  { id: 'twilight', name: 'Alacakaranlık', nameEn: 'Twilight', color: '#b38aef', light: '#f0d8ff', dark: '#352652', shape: 'shadow', price: 2000 },
  { id: 'grove', name: 'Zümrüt Yemin', nameEn: 'Emerald Oath', color: '#64d2a3', light: '#d5ffe3', dark: '#1a504d', shape: 'leaf', price: 2000 },
];
export const wingDefinition = id => WINGS.find(w => w.id === id);
export const equippedWing = player => player?.equipped?.wings?.kind === 'wings' ? wingDefinition(player.equipped.wings.wingId) : null;
export const wingMultiplier = (player, bonus) => equippedWing(player) ? ({exp:1.05,drop:1.05,atk:1.03}[bonus] || 1) : 1;

export const wingDexBonus = player => equippedWing(player) ? 3 : 0;
export const wingStaminaBonus = player => equippedWing(player) ? 3 : 0;
