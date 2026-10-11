import slotEarring from "../assets/items/slot-earring.png";
import slotNecklace from "../assets/items/slot-necklace.png";
import slotRing from "../assets/items/slot-ring.png";
import slotBelt from "../assets/items/slot-belt.png";
import slotWeapon from "../assets/items/slot-weapon.png";
import slotHead from "../assets/items/slot-head.png";
import slotChest from "../assets/items/slot-chest.png";
import slotLegs from "../assets/items/slot-legs.png";
import slotGauntlets from "../assets/items/slot-gauntlets.png";
import slotBoots from "../assets/items/slot-boots.png";

// Knight Online'ın kendi kuşanma ekranıyla aynı ruh (kullanıcının referans
// gönderdiği ekran görüntüsü): portre bir yanda, eşya sabit bir ızgarada
// öbür yanda — 12 slot tam 3x4'e oturuyor. `icon` artık kullanıcının
// hazırladığı gerçek sanat (boş slotta soluk görünen yer tutucu resim,
// bkz. Paperdoll.jsx) — eski lucide-react şekillerinin yerine geçti.
// Sıralama kullanıcının son isteğiyle üç kez güncellendi: Kemer↔Kolye,
// Kask↔Göğüslük, ve en alt üçlü Donluk-Kolluk-Ayaklık (eski Bacaklık/
// Eldiven/Bot isimleri de bu yeni terimlerle değişti).
export const PAPERDOLL_LAYOUT = [
  { key: "earring1", label: "Küpe 1", icon: slotEarring },
  { key: "necklace", label: "Kolye", icon: slotNecklace },
  { key: "earring2", label: "Küpe 2", icon: slotEarring },

  { key: "ring1", label: "Yüzük 1", icon: slotRing },
  { key: "belt", label: "Kemer", icon: slotBelt },
  { key: "ring2", label: "Yüzük 2", icon: slotRing },

  { key: "mainHand", label: "Ana El", icon: slotWeapon },
  { key: "head", label: "Kask", icon: slotHead },
  { key: "chest", label: "Göğüslük", icon: slotChest },

  { key: "legs", label: "Donluk", icon: slotLegs },
  { key: "gauntlets", label: "Kolluk", icon: slotGauntlets },
  { key: "boots", label: "Ayaklık", icon: slotBoots },
];
