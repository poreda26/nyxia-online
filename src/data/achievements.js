import { Skull, Compass, Mountain, Crown, Sparkles, Hammer, Shield, Swords, Gift } from "lucide-react";

// Başarım + unvan sistemi — kullanıcı isteği: "insanlar nasıl daha çok
// eğlenebilir" sorusuna verdiğimiz ikinci öneri (ilki günlük giriş/görev,
// zaten var). Her başarım kalıcı bir unvan açıyor — Karakter sekmesinden
// birini "aktif unvan" seçip TopBar'da isminin yanında taşıyabiliyorsun.
// Kilit açma mantığı (bkz. utils/achievements.js#isAchievementUnlocked)
// `type` alanına göre dallanıyor:
//  - "kills": toplam canavar öldürme sayısı (player.monsterKills toplamı) >= target
//  - "level": player.level >= target
//  - "awakened": player.awakened
//  - "flag": player.milestones içinde bir boolean bayrak (bkz. `flag` alanı)
//  - "counter": player.milestones içinde bir sayaç (bkz. `counter` alanı) >= target
// Hepsi KALICI/monoton alanlara dayanıyor (kills/level hiç azalmaz, flag'ler
// hiç false'a dönmez, sayaçlar hiç azalmaz) — bir kez açılan başarım hiçbir
// zaman tekrar kilitlenmiyor.
export const ACHIEVEMENTS = [
  { id: "first_blood", name: "İlk Kan", title: "Çırak", desc: "İlk canavarını öldür.", icon: Skull, color: "#9CA1B0", type: "kills", target: 1 },
  { id: "monster_nightmare", name: "Canavar Kâbusu", title: "Canavar Avcısı", desc: "Toplam 200 canavar öldür.", icon: Skull, color: "#C9425A", type: "kills", target: 200 },
  { id: "dungeon_wanderer", name: "Zindan Gezgini", title: "Zindan Gezgini", desc: "Frostburn Summit'e ulaş (Lv.25).", icon: Compass, color: "#6FD1E0", type: "level", target: 25 },
  { id: "abyss_lord", name: "Uçurumun Efendisi", title: "Uçurum Fatihi", desc: "Abyssal Pit'e ulaş (Lv.50).", icon: Mountain, color: "#A34FD9", type: "level", target: 50 },
  { id: "max_level", name: "Zirve", title: "Efsane", desc: "Maksimum seviyeye ulaş (Lv.65).", icon: Crown, color: "#D4AF6A", type: "level", target: 65 },
  { id: "awakened", name: "Uyanış", title: "Uyanmış", desc: "2. Uyanışı tamamla.", icon: Sparkles, color: "#FF8C42", type: "awakened" },
  { id: "master_smith", name: "Usta Zanaatkar", title: "Usta Zanaatkar", desc: "Bir eşyayı +8'e yükselt.", icon: Hammer, color: "#8B6FC9", type: "flag", flag: "maxUpgradeReached" },
  { id: "clan_founder", name: "Klan Kurucusu", title: "Klan Kurucusu", desc: "Kendi klanını kur.", icon: Shield, color: "#5FA8A0", type: "flag", flag: "hasFoundedClan" },
  { id: "warzone_hero", name: "Savaş Alanı Kahramanı", title: "Savaş Alanı Kahramanı", desc: "Savaş Alanı'nda 10 düello kazan.", icon: Swords, color: "#C9425A", type: "counter", counter: "duelsWon", target: 10 },
  { id: "treasure_hunter", name: "Hazine Avcısı", title: "Hazine Avcısı", desc: "25 sandık aç.", icon: Gift, color: "#D4AF6A", type: "counter", counter: "chestsOpened", target: 25 },
];
