# Tüm haritalar — savaş görselleri

Onaylanan dikey düzen altı haritada etkin: Fallow Valley, Ashen Canyon, Frostburn Summit, Ruined Sanctuary, Abyssal Pit, Crimson Battlefront.

27 normal canavar ve 36 solo zindan aşaması görsele bağlandı. Zindan normal aşamaları bölgenin son canavarını, bosslar bölge boss görselini kullanır; Fallow boss mevcut Nadas Devi görünümünü paylaşır. Yeni oyun sınıfı veya canavar istatistiği eklenmedi. Harita, savaş, kayıt, ödül ve eşya hesapları değiştirilmedi.

Yeni dosyalar src/assets/battle altında: regions-v1.png, ashen-v1.png, frost-v1.png, sanctuary-v1.png, abyss-v1.png, crimson-v1.png. Yerleşik image_gen ile üretildi; atlaslar gerçek RGBA olarak doğrulandı. İlk kanyon atlası kullanılır; sonradan yapılan RGB düzeltme taslağı kullanılmadı. Görseller değiştirilmeden alfa sınırları ölçülüp battleAtlasBounds.js dosyasına kaydedildi. Oyunda yalnız seçili bölgenin görselleri DOM tarafından istenir.

Kontrol sayfasındaki harita seçicisi yalnızca kayıt yazmayan test karakterinin bölge/seviyesini değiştirir. Gerçek oyunun seviye kilitlerini veya ışınlanma ücretini kaldırmaz.

Doğrulama: beş yeni bölge tarayıcıda açıldı, eski Fallow görünümü korundu, konsol hatası yok. 3 eşleme testi 27 normal düşmanı ve 36 zindan aşamasını kapsar; derleme geçti. Paket boyutu uyarısı sürüyor. Mevcut dünya hareket koduna dokunulmadı.

## allMapBackgroundPrompt

Environment texture atlas for a hand-painted dark fantasy mobile RPG. EXACT 3 columns by 2 rows of SIX equal SQUARE background panels, crisp straight boundaries, no borders or labels. Each scene same camera: side-on slightly elevated battle arena with flat open foreground floor for two fighters, vertical environmental depth. Row1 left mossy forest temple, middle volcanic canyon with basalt floor and distant lava, right snowy icy mountain ruins with distant orange volcanic glow. Row2 left ruined gothic sanctuary with violet candles and broken statues, middle abyssal cavern with purple crystals and deep chasm behind stone platform, right crimson warfront with ruined fortress burning banners and ash under a red sky. Painterly detailed nostalgic fantasy RPG, atmospheric restrained colors, dark upper edges for HUD, readable center, NO creatures, NO people, NO text or UI. All six panels have floor in bottom half. Landscape 3:2 full image.

## ashenPrompt

Transparent RGBA PNG enemy sprite atlas for Ashen Canyon in Nyxia Online. EXACT 3 columns x 2 rows, SIX independent full-body monsters, each centered inside equal square cell with 15% transparent margin on ALL sides. Side three-quarter view facing LEFT, static ready pose, feet at 85% cell height. Hand-painted detailed dark fantasy RPG, cohesive low-poly painterly textures. Row1: ash creature made of charcoal with ember cracks; volcanic armored lizard glowing orange; giant black canyon scorpion with raised tail. Row2: lava spirit humanoid made of molten rock and fire; crowned ancient lava lord boss with basalt shoulders; small burning rock elemental. No floor, no shadows, no background, no text, no grid lines, NO checkerboard. True alpha-zero transparency. No body or weapon crosses cell boundaries. Landscape 3:2 atlas. Integrate all limbs and weapons as one figure.

## frostPrompt

Transparent RGBA PNG sprite atlas, six isolated enemy figures for Frostburn Summit dark fantasy RPG. EXACT 3 columns x 2 rows; uniform square cells, 15% EMPTY transparent gutter, whole figures contained in cells, feet baseline 85%. Facing LEFT in side three-quarter combat-ready pose. Painterly detailed classic fantasy mobile RPG style, crisp silhouettes. Row1 left white glacier wolf with ice fur, middle fiery orange giant spider, right muscular blue frost giant holding ice club. Row2 left ember red salamander, middle armored mountain sentinel with icy spear, right crowned frost king boss with massive ice axe. NO floor, NO shadows, NO background, NO grid or text. True PNG alpha zero outside silhouettes, not an image of checkerboard. All weapons grasped correctly and integrated in figures. Landscape 3:2.

## sanctuaryPrompt

Transparent RGBA PNG enemy atlas for Ruined Sanctuary dark fantasy RPG. EXACT 3 columns x 2 rows of six isolated full-body figures, equal square cells, 18% clear gutter all sides. Side three-quarter view facing LEFT. Row1: ancient skeleton soldier with rusted sword and shield; cursed undead priest in tattered violet vestments holding crooked staff; heavy stone temple guardian with ancient engraved armor. Row2: shadow preacher in black robes holding purple spellbook; crowned spectral high priest boss carrying long ceremonial staff; floating chained ghost. Hand-painted detailed classic fantasy game style, coherent silhouettes, muted purple and tarnished gold, equipment firmly attached, ready poses. No floor, no shadows, no text, no labels, NO checkerboard. Alpha zero outside each silhouette, transparent PNG for direct game compositing. All objects contained in cells. Landscape 3:2.

## abyssPrompt

Create transparent PNG sprite atlas for Abyssal Pit game enemies. EXACT six full-body isolated creatures in 3 columns x 2 rows; uniform square cells, large clear gutters, nothing crosses cells. Side three-quarter facing LEFT. Row1: huge purple abyss worm rearing with circular toothed maw; hooded dark summoner holding violet staff; muscular horned abyss demon with purple crystal claws. Row2: nightmare shadow beast with long limbs and glowing violet eyes; crowned abyss overlord wearing obsidian plate with greatsword; enormous winged abyss sovereign boss. Polished hand-painted dark fantasy mobile RPG, readable clean silhouettes, purple black and muted silver textures. No scene, no floor, no shadows, no labels or UI. TRUE RGBA transparency outside figures, no painted checkerboard. Keep each subject 75% cell height and all wings and weapons fully inside its cell. Landscape 3:2.

## crimsonPrompt

True transparent RGBA PNG sprite atlas of six Crimson Battlefront enemy figures for a hand-painted dark fantasy mobile RPG. Exactly 3 columns x 2 rows, equal square cells with generous empty gutters, each full figure entirely within cell. Side three-quarter facing LEFT in combat-ready pose. Row1: crimson armored guard with sword and shield; hooded flame executioner with huge axe; red horned chaos demon. Row2: apocalyptic red-black dragon with folded wings and long tail carefully contained in its cell; crowned infernal dragon emperor boss with gold horns and folded wings; armored red war hound. Rich hand painted charcoal iron textures, red cloth, ember orange accents. All weapons integrated in figure and firmly held. No floor, no shadows, no text or lines, no checkerboard. Alpha ZERO outside silhouettes. No detached particles. Landscape 3:2.
