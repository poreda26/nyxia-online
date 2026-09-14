# Raptor ve elemental efekt düzeltmesi

Raptor'un eldeki düz mızrak başı, envanterdeki `src/assets/items/raptor.png` referansından kıvrık orak olarak yeniden çizildi. `warrior-raptor-v2.png` yalnızca Raptor'un Human/Karus kareleri için kullanılır; aynı üretimdeki diğer dört kare kullanılmaz. Avedon ve Blade Axe'ın eski karakter çizimleri korunur. Eşya adları, özellikleri ve kayıtlar değişmez.

Avedon'un geniş sol balta ucu ortak efekt sınırının dışında kalıyordu. İki ucu kapsayan özel sınır eklendi. Raptor'un aşağı kıvrılan ucu da özel sınır kullanır. Ice beyaz çekirdekli camgöbeği aura; lightning ince mavi-beyaz elektrik çevresi; flame sarı çekirdekli, yukarı taşan turuncu aura kullanır. Poison mor kalır. Efektler +7 ve +8'de çalışır.

Doğrulama: 30 oyun testi, 3 efekt testi, 128 tarayıcı ekipman geçişi ve +6/+7/+8 elemental kontrolleri geçti. Avedon'un iki ucu ve Raptor'un orak ucu için iki ırkta sınır testleri eklendi. Üretim derlemesi geçti. Mobil boyutta tarayıcı görüntüleri incelendi; fiziksel telefon testi yapılmadı.

## Görsel üretimi

Built-in imagegen edit. Hedef: `warrior-1.png`; silah referansı: `raptor.png`. Sonuç projede `src/assets/characters/weapons/warrior-raptor-v2.png` olarak saklanır. Orijinal üretim: `C:/Users/akcel/.codex/generated_images/01a081b0-b2f8-7d50-a41a-c094a78acd9e/exec-15201648-9d77-4a16-aac4-703ebd005eea.png`.

Prompt: Edit the first image, a 1254x1254 six-character sprite atlas, using the second image as the exact weapon silhouette reference. Only change the weapons held by the two warriors in the LEFT column (top human and bottom green orc). Replace their straight spearheads with the reference's Raptor scythe head: oversized hooked curved sickle blade sweeping to the RIGHT/downwards from shaft head, dark purple steel with silver cutting edge, two sharp opposite counter spikes, amber/brown haft. Keep the same diagonal two-hand grip, shaft connects naturally through hands at the same coordinates. Keep both characters identical, same face armor pose size foot placement. Keep the other four characters in middle/right columns UNCHANGED. Preserve three columns/two rows and generous separation. No glow baked into the weapon. Real transparent alpha background if possible. Entire blades must be visible within left cell and not touch other figures. The second image is weapon design only, not scene style.
