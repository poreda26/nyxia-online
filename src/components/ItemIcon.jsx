import { FlaskConical, ScrollText, Star, Gift, Sparkles } from "lucide-react";
import WeaponIcon from "./icons/WeaponIcon";
import ArmorIcon from "./icons/ArmorIcon";
import AccessoryIcon from "./icons/AccessoryIcon";
import { itemImageFor, potionImageFor } from "../data/itemImages";

export default function ItemIcon({ item, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const customImage = item.kind === "potion" ? potionImageFor(item.potionType, item.tier) : itemImageFor(item.name, item.upgradeLevel);
  if (customImage) {
    // Elle çizilmiş 16x16 SVG'lerin aksine (bkz. src/assets/items/*.svg),
    // Gemini ile üretilen yüksek çözünürlüklü sanat (bkz. Raptor) küçük
    // ikon boyutuna PÜRÜZSÜZ ölçeklenmeli — "pixelated" burada bloklu/
    // çirkin bir sonuç verir, sadece gerçekten kaba pixel-art dosyalar
    // (.svg) için anlamlı.
    const isRasterArt = typeof customImage === "string" && !customImage.endsWith(".svg");
    return (
      <img
        src={customImage}
        alt={item.name}
        style={{ width: size, height: size, objectFit: "contain", imageRendering: isRasterArt ? "auto" : "pixelated" }}
      />
    );
  }
  if (item.kind === "weapon") {
    return <WeaponIcon iconKey={item.icon} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "armor") {
    return <ArmorIcon slot={item.slot} cls={item.class} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "accessory") {
    return <AccessoryIcon slot={item.slot} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "potion") {
    return <FlaskConical size={size} color={item.potionType === "hp" ? "#C9425A" : "#4FC3D9"} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "scroll") {
    return <ScrollText size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "bonusScroll") {
    return <Star size={size} color="#D4AF6A" strokeWidth={strokeWidth} />;
  }
  if (item.kind === "chest") {
    const ChestIcon = item.special ? Sparkles : Gift;
    return <ChestIcon size={size} color={color} strokeWidth={strokeWidth} />;
  }
  return null;
}
