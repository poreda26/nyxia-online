import { Flame, Moon } from "lucide-react";

// Real Knight Online's two warring nations — purely an identity/flavor
// choice for now (shown at character creation and on the Karakter tab).
// Not wired into separate armor sets, PvP, or race-locked content yet;
// that's a natural next step once there's a reason to differentiate them
// mechanically.
export const RACES = {
  karus: {
    name: "Karus", icon: Flame, color: "#C9425A",
    desc: "Savaşçı ruhlu, disiplinli bir ordu milleti. Kızıl bayrak altında birleşir.",
  },
  elmorad: {
    name: "ElMorad", icon: Moon, color: "#4FC3D9",
    desc: "Zarif, stratejik düşünen bir bilgelik milleti. Gümüş ay altında yürür.",
  },
};
