# Al-Sat & RPG Ticaret Oyunu — Proje Dokümanı

2D, UI/arayüz odaklı, yürütme mekaniği olmayan, metin ve panel tabanlı mobil RPG & Pazar
Ticaret Simülasyonu. Prototip tek dosyalık bir React bileşeni (`RPGMarketGame.jsx`) olarak
yazıldı; tüm state React içinde tutulur (oturum boyunca kalıcı, sayfa yenilenince sıfırlanır).

## Ana Oyun Döngüsü

Canavar keserek (Grind) XP, Gold ve Item/Chest düşürme → Ekipmanları giyme veya pazarda
satma → Kutuları kırarak şans deneme veya satarak kâr etme → Seviye atlayıp üst Tier
slotlara geçiş yapma.

---

## 1. Sınıflar

| Sınıf | ATK | DEF | HP | MP | Kritik | Karakter |
|---|---|---|---|---|---|---|
| Warrior | 13 | 9 | 130 | 20 | %5 | Ön safta, dayanıklı |
| Rogue | 15 | 5 | 95 | 30 | %28 | Kırılgan, ölümcül kritik |
| Mage | 19 | 3 | 75 | 65 | %10 | Yüksek hasar, düşük can |
| Priest | 10 | 4 | 90 | 70 | %6 | Dengeli, dayanıklı |

## 2. Tier / Seviye Sistemi (1–60)

| Tier | Bölge | Açılış Lv. | Canavarlar |
|---|---|---|---|
| 1 | Sisli Vadi | 1 | Sis Kurdu, Kabuklu Golem |
| 2 | Kül Kanyonu | 15 | Kül Yaratığı, Volkan Sürüngeni |
| 3 | Gölge Ormanı | 30 | Gölge Savaşçısı, Siyah Sarmaşık |
| 4 | Kristal Zindan | 45 | Kristal Muhafız, Arkane Avcı |
| 5 | Kaos Tapınağı | 60 | Kaos İblisi, Kıyamet Ejderhası |

Her tier'ın kendi biyom rengi vardır (bölge/canavar UI'sında kullanılır — eşya nadirlik
renginden **ayrı** bir sistemdir, bkz. §5).

## 3. Ekipman Sistemi — Paperdoll (13 slot)

Kuşanma paneli, klasik MMO paperdoll düzeninde 3 sütunlu bir grid:

```
Küpe 1   Kask      Küpe 2
Ana El   Göğüslük  Yrd. El
Yüzük 1  Kolye     Yüzük 2
Eldiven  Bacaklık  Kemer
  —      Bot         —
```

- **Zırh (5):** Kask, Göğüslük, Bacaklık, Eldiven, Bot
- **Silah (2):** Ana El, Yardımcı El (çift el silahlar her ikisini de doldurur)
- **Aksesuar (6):** 2× Küpe, 2× Yüzük, 1× Kolye, 1× Kemer (sınıf kilidi yok, herkes takabilir)

### Silah Sistemi (sınıfa özel, zırhtan çok daha fazla çeşit)

| Sınıf | Çift El | Ana El (1H) | Yrd. El (silah) | Yrd. El (kalkan) |
|---|---|---|---|---|
| Warrior | Geniş Kılıç, Savaş Baltası, Savaş Çekici, İki Elli Mızrak | Tek Elli Kılıç, Mızrak, Savaş Baltası | Tek Elli Kılıç, El Baltası, Hançer | Kalkan, Kule Kalkanı, Tokmak Kalkan |
| Rogue | Uzun Yay, Avcı Yayı, Savaş Yayı | Hançer, Kısa Kılıç | Hançer, Kısa Kılıç (dual-wield) | — |
| Mage | Büyü Asası, Arkane Asa, Kristal Asa | Değnek | Büyü Kitabı, Grimoire, Kristal Küre | — |
| Priest | — | Kutsal Çekiç, Topuz, Savaş Topuzu, Asa Değnek | Kutsal Tılsım | Kalkan, Kutsal Kalkan |

Çift el silah kuşanınca yardımcı el otomatik boşalır; yardımcı ele bir şey takınca çift el
silahı çantaya geri döner.

## 4. Sınıf Kilitli Zırh (Trade motivasyonu)

Zırh parçaları düşerken **rastgele bir sınıfa** atanır (kendi sınıfın olması şart değil).
Her sınıfın kendi zırh teması vardır:

- **Warrior:** Plaka (Miğfer, Plaka Göğüslük, Plaka Bacaklık…)
- **Rogue:** Deri / Gölge (Deri Kukuleta, Gölge Cübbesi…)
- **Mage:** Cübbe / Arkane (Sivri Şapka, Cübbe, Arkane Elbise…)
- **Priest:** Kutsal / Nur (Kutsal Başlık, Kutsal Cübbe…)

Kendi sınıfına ait olmayan bir zırhı kuşanmaya çalışırsan **engellenir** (toast uyarısı +
envanterde kilit ikonu + kırmızı açıklama metni). Bu eşyalar Pazar → Takas Postası'na
yönlendirilir.

## 5. Eşya Nadirlik Renk Kodlaması

Tier'a göre klasik MMO renk skalası (sadece zırh/silah/aksesuar/sandık için — bölge
renginden ayrı):

| Tier | Renk | Kod | Nadirlik |
|---|---|---|---|
| 1 | Beyaz | `#E7E7E4` | Sıradan |
| 2 | Yeşil | `#3FCB6B` | Nadide |
| 3 | Mavi | `#4A90E2` | Nadir |
| 4 | Mor | `#B368F7` | Efsanevi Öncesi |
| 5 | Turuncu | `#F5A623` | Efsanevi |

## 6. Savaş & Drop Mekaniği

- UI üzerinden "Savaşı Başlat" → HP/MP bar'ları (Slider), Saldır butonu, Pot butonları.
- Saldır sonrası canavar ölmediyse karşı saldırı yapar.
- **Drop tablosu (öldürmede):**
  - Gold + XP: her zaman
  - Ekipman: %15 (rollLoot → ~%38 silah / ~%34 zırh / ~%28 aksesuar)
  - Sandık: %5 (kendi tier'ından)
  - Yükseltme Parşömeni: %6 (kendi tier'ından)
- **Bilinen bug fix:** Saldır butonuna hızlı art arda tıklamak eskiden aynı ölüm üzerinden
  birden fazla loot/level-up tetikliyordu. `attackLockRef` (senkron kilit) + `battle.finished`
  bayrağı ile düzeltildi; düğme, mevcut vuruş sonuçlanana kadar devre dışı kalır.

## 7. Kutu (Chest) Sistemi

- 5 Tier kutu, kırıldığında `rollLoot(tier, playerClass)` ile silah/zırh/aksesuar verir.
- Kırma paneli: sallanma animasyonu → konfeti + ışık efektiyle ödül reveal'ı.
- Sınıf-kilitli bir zırh çıkarsa modal'da uyarı gösterilir.

## 8. Pazar (Market)

İki alt sekme:

1. **Satın Al:** NPC tüccarlardan **sadece Tier 1** sandık satın alınabilir. Oyuncular
   arası kutu satışı **yok**.
2. **Takas Postası:** Sınıfına uymayan zırhlar için tek-oyunculu simsar/broker simülasyonu
   (gerçek P2P pazar backend/çoklu oyuncu altyapısı gerektirdiği için bu şekilde
   simüle edildi — ekonomik mantık aynı, ileride gerçek pazara genişletilebilir):
   - **Altına Çevir:** normal satıştan %15 daha yüksek fiyat
   - **Sınıfıma Takas Et:** aynı tier'dan kendi sınıfına uygun rastgele bir eşya

## 9. Upgrade Sistemi

Yeni "Yükselt" sekmesi (Yükseltme Ustası NPC'si):

- Her tier için ayrı **Upgrade Scroll** (T1–T5), NPC'den satın alınabilir
  (fiyat: `tier × 20` altın) veya canavarlardan %6 ihtimalle düşer.
- Herhangi bir zırh/silah/aksesuar — kuşanılı ya da çantada fark etmez — kendi
  tier'ındaki 1 parşömen + `tier × 15` altın karşılığında yükseltilir.
- Her yükseltme: ip/atk/def ×1.18, isimde `+1`, `+2`… etiketi, **maksimum +5**.

---

## Dosya Yapısı (önerilen — Claude Code'da bölünecek)

```
src/
  App.jsx                     # Root, ekran/tab yönlendirme
  data/
    tiers.js                  # TIERS (bölgeler, canavarlar)
    classes.js                # CLASSES
    weapons.js                # WEAPON_CATALOG
    armor.js                  # ARMOR_NAMES_BY_CLASS
    accessories.js             # ACCESSORY_NAMES
    itemRarity.js              # ITEM_TIER_COLORS, ITEM_TIER_LABEL
    paperdoll.js                # PAPERDOLL_LAYOUT
  utils/
    loot.js                   # rollArmor, rollWeapon, rollAccessory, rollLoot
    player.js                 # initialPlayer, totalStats, sellPrice, equipItem
    upgrade.js                 # upgradeItemInPlayer, scrollPrice
  components/
    ClassSelect.jsx
    Hub.jsx / TopBar.jsx / BottomNav.jsx
    BattleTab.jsx
    InventoryTab.jsx / ChestModal.jsx
    MarketTab.jsx
    UpgradeTab.jsx
    CharacterTab.jsx
    shared/ (SectionLabel, EmptyState, StatBlock, BarTrack)
```

## Çalıştırma

```bash
npm create vite@latest . -- --template react
npm install lucide-react@0.383.0
npm run dev
```

## Bağımlılıklar

- `react`, `react-dom`
- `lucide-react@0.383.0` (ikonlar — Sword, Shield, Gem, Link2, CircleDot, ScrollText,
  ArrowUpCircle, Repeat, Ban, vb.)
- Font: Google Fonts üzerinden `@import` (Cinzel — başlık, Manrope — gövde,
  JetBrains Mono — sayısal değerler)

## Yapılacaklar / Genişletme Fikirleri

- [ ] Gerçek çok oyunculu Takas Postası (backend + eşleştirme)
- [ ] Oyun durumunu `window.storage` ile kalıcı hale getirme (oturumlar arası)
- [ ] Silahlar için de sınıf-random drop + takas (şu an sadece zırh için var)
- [ ] Upgrade başarısızlık şansı / eşya kırılma riski (opsiyonel zorluk katmanı)
- [ ] Daha fazla canavar çeşidi / tier başına 2'den fazla canavar
- [ ] Ses efektleri (saldırı, sandık açma, level-up)
