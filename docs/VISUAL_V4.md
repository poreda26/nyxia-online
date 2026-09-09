# Nyxia — Savaşçı görselleri V4

9 Eylül 2026. Kullanıcının isteğiyle Higgsfield bırakıldı; yerleşik image_gen kullanıldı.

## Oyuna uygulananlar

- `src/assets/world/warrior-human-v4.png`: İnsan savaşçı, gerçek RGBA, 1254×1254, 4×4 atlas.
- `src/assets/world/warrior-orc-v4.png`: Ork savaşçı, gerçek RGBA, 1254×1254, 4×4 atlas.
- Her atlas: ön yürüyüş, arka yürüyüş, ön saldırı, arka saldırı; her sırada dört kare. Sağ/sol yansıtma kullanılır. Sekiz ayrı açı veya 3D iskelet animasyonu değildir.
- Mevcut 0,56 saniyelik saldırı süresi, 0,28 saniyedeki yakın dövüş teması, mesafeye bağlı yürüyüş ve duraklatma korunur.
- Karelerin gerçek alfa tabanları yükleme sırasında ölçülür; hesap her karede tekrar yapılmaz. Ayaklar dünya koordinatına oturur.
- `src/world/warriorVisuals.js` gövdeyi ve eldeki silahı ayrı çizer. Silah görselleri mevcut `src/assets/items` dosyalarından gelir. Envanter ikonları değiştirilmedi.
- Kılıç, balta, Raptor/Glave ve diğer silah aileleri için kabza konumu/açı bilgisi ayrıdır. Kendine ait görseli olmayan başlangıç kılıcı mevcut kılıç ailesi görselini kullanır. Bilinmeyen görselde eski rozet davranışı korunur.
- +7/+8 eşyalarda elde temiz taban silahı çizilir; element rengine göre parıltı ve saldırı yayı ayrı canvas katmanıdır. Envanterdeki orijinal +7/+8 efektli kartlar aynen kalır. Bu dünya efektleri envanter kartlarının piksel piksel kopyası değildir.
- Yalnızca aktif savaşçı ırkının yeni atlası yüklenir. Yeni görsel yüklenemezse mevcut karakter atlası kullanılır. Rogue yalnızca okçu olarak kalır, Mage ve diğer dünya aktörlerinin görselleri korunur.

## Zırh katmanları ve kapsam

`src/assets/world/warrior-armor-v4.png`: gerçek RGBA, 1774×887, 4×2 atlas. Mevcut T4/T5 eşya tasarımlarına uygun miğfer ve göğüslük, kuşanılan eşyaya göre bağımsız çizilir; ön/arka görünüş ve çıkarma desteklenir. Eldiven, pantolon ve botlar bu sürümde gövde görünümünü değiştirmez. Diğer sınıfların mevcut animasyonları korunur.

## Doğrulama

- `npm run test:world`: 20 test; hareket/çarpışma, savaş/ödül, ekipman, kayıt round-trip, Rogue kısıtı, yeni atlasın zamanlama/duraklatması, silah ışığı ve görsel geri dönüşü.
- `python scripts/check-warrior-assets.py`: üç atlasın alfa kanalı, toplam 40 hücresinin doluluğu, şeffaf hücre kenarı; motor/player/storage/ödül dosyalarının V3 yedeğiyle aynı hash olması.
- `npm run build`: üretim derlemesi.
- Tarayıcıda gerçek `WorldTab` bileşeniyle İnsan/Ork, hareket, ön/arka görünüş, saldırı, mevcut kılıç ve Raptor değişimi, yükseltme efekti, T4/T5 miğfer ve göğüslük katmanları, Okçu ve Mage geri dönüşü kontrol edildi. Fiziksel mobil cihaz testi yapılmadı.

Geliştirme sunucusunda `/nyxia-online/visual-check.html` kayıt yazmayan kontrol sayfasıdır. Üretim girişine veya menülere eklenmedi. Kullanıcının açık oyun oturumuna karakter/eşya eklemek için kullanılmadı.

Önceki çizim kodlarının kopyaları `docs/visual-backup-v3` içinde. Mevcut oyun sıfırdan kurulmadı; kaynaklar aynı Desktop/Nyxia World/source klasöründe geliştirildi.

## Kullanılan üretim promptları

### İnsan — referanslar: warrior-t4-chest.png, warrior-t4-head.png

Use case: stylized-concept. Create a production sprite sheet for Nyxia Online, isometric 2D mobile dark fantasy MMORPG, classical 2000s Knight Online aesthetic remastered, hand-painted textured low-poly volumes, blue steel and aged gold matching these two existing item references. References are material/style guidance only, not backgrounds. Exact regular 4 columns x 4 rows sprite atlas, square image, transparent RGBA background with NO floor, NO shadow, NO text or grid. 16 full-body poses, equal scale and generous blank gutters. Every cell has head at 15% height and boot sole baseline at 85%, all parts fully inside cell. Human male warrior, visible head, short dark hair, simple dark leather/chainmail underarmor, small blue steel shoulder guards, gloves, boots. EMPTY HANDS with visible closed gripping right fist: weapon is supplied separately by the game. No helmet, cape, shield, sword, particles, or loose objects. Row 1 four walk cycle phases FRONT three-quarter facing southeast (left foot forward, passing combat-ready idle, right foot forward, passing). Row 2 same four phases BACK three-quarter facing northeast. Row 3 four ATTACK poses FRONT same warrior facing southeast: wind-up raised right fist, ready-to-swing, extended right fist striking forward, recovery to combat-ready stance. Row 4 those four ATTACK poses BACK facing northeast. Maintain identical body proportions, clothing and head in every cell. Feet planted during all attack poses, only torso/arms rotate. Strong readable silhouette, detailed texture, slightly elevated 45-degree isometric camera consistently. Separate equipment layers will be rendered programmatically; keep base costume simple and uncluttered. Actual transparent background, not checkerboard.

### Ork — seçilen son üretim

Generate a transparent PNG sprite sheet asset, RGBA with alpha zero outside the subject. Square 4x4 atlas, 16 full-body ORC warrior sprites at uniform scale; no text, no grid, no shadows, no ground. Isometric 45-degree southeast front / northeast back dark fantasy game character, nostalgic Knight Online PC MMORPG style, hand-painted detailed blue steel armor, small gold gryphon emblem, chainmail skirt, dark leather trousers, boots, short black hair, olive green skin, pointed ears. No sword/shield/weapons, fists empty for separately layered equipment. Layout exactly: row1 front walking 4 phases; row2 back walking 4 phases; row3 front attack 4 phases: raised fist, windup fist, extended fist at right, recovery; row4 back attack same phases. Every cell spacious blank margin, figure 80% cell height, all boots and hands fit inside their cells. Consistent athletic muscular orc identity and costume, both feet planted for attack. True alpha transparent background as a PNG cutout, never depict a transparency checkerboard or flat opaque black. No surrounding scene. This is directly used by a canvas game renderer.

### T4/T5 şeffaf zırh katmanları — seçilen son üretim

Transparent RGBA PNG game equipment sprite atlas, alpha zero outside objects. Landscape 4 columns x 2 rows, eight isolated wearable armor components with uniform generous transparent gutters. Hand painted isometric elevated 45-degree dark fantasy Knight Online style mobile sprites. No people, no mannequin, no floor, NO SHADOW, NO CHECKERBOARD, no labels. Top row: 1 dark BLUE STEEL narrow chestplate with GOLD GRIFFIN front three-quarter facing southeast; 2 same chestplate BACK northeast with crossed brown leather straps; 3 IVORY WHITE narrow chestplate with GOLD LION and BLUE X heraldry front southeast; 4 same white chestplate BACK northeast with buckles and plain gold filigree. Bottom row: 1 dark BLUE STEEL closed helmet with gold gryphon crest and dark T visor front southeast; 2 same helmet BACK northeast; 3 IVORY WHITE closed helmet with gold lion crest and blue X on brow and black eye slit front southeast; 4 same helmet BACK northeast. Chestplates have open neck and arm holes and end at waist, no arms or shoulder pauldrons or heads. Helmets end at chin, no neck mail. Plain upper-left lighting, ornate but legible details. Each piece 70% cell height, completely contained in its cell. No pedestal, emblem background, loose props or decorations around pieces. Real alpha transparent PNG cutouts for directly drawing on animated game character. This is an asset sheet, not a presentation.
