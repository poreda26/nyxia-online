# 28 Eylül 2026 — Görseller, başarımlar ve Savaş Alanı

- raceScroll/jobScroll ortak ItemIcon üzerinden ayrı mühür ve işaretlerle çizilir. Eski kayıt kimlikleri değiştirilmedi.
- Dükkândaki 4 HP / 4 MP iksiri envanterle aynı ItemIcon / potionImageFor kaynağını kullanır.
- Başarımlar: kahramanlık günlüğü, tamamlanan/devam eden filtreleri, ilerleme çubukları; eski 10 kimlik/unvan korundu. 1.000 ve 5.000 av, 100 sandık, 50 düello hedefleri eklendi; yeni güç bonusu eklenmedi.
- Canavar Ara can/savunma %30, saldırı %45 azaltıldı. Çarpan panelin powerMult değerinden sonra uygulanır; kayıtlı eski 1.5 override da yeni profili kullanır. Haritaların normal canavarları, dünya bossları ve ödül oranları değiştirilmedi.
- Canavar Ara ve dünya bosslarında kuşanılmış beceriler: mana/öğrenilmiş-kuşanılmış kontrolü, tur bazlı cooldown, hasar/execute/iyileştirme/buff/DOT. Dünya bossu etkileri boss ve spawn kimliğine bağlı; ağ hatasında mana/etki commit edilmez. PvP otomatik beceri düzeni korunur.

Doğrulama:
- npm run test:warzone: üç sınıfın 39 becerisi; mana/cooldown, heal/DOT ve input değişmezliği. Mevcut fixture ile her sınıfta dört Crimson canavarı x100 tohum = toplam 1.200 av. Level65/T6+8 silah, mevcut T5+8 zırhlar, fixture takıları ve sınırlı iksirlerle yeni profilde %100 kazanım, ortalama yaklaşık9 tur. Bu kullanıcının canlı hesabının birebir simülasyonu değildir.
- npm run test:world:42 test geçti.
- npm run test:admin-loot:247 eşya ve canlı ödül bağlantıları geçti. Node ESM import sorunu için resmi paketleme/çalıştırma komutu eklendi.
- scripts/check-warzone-ui.mjs: yerel Vite5188, mocked API; scroll SVG, başarım mobil genişliği, gerçek boss/hunt skill düğmesi ve MP değişimi,8 iksir görseli; canlı oyunculara istek göndermez.
- npm run build başarılı. Önceden mevcut büyük bundle uyarısı devam ediyor.
