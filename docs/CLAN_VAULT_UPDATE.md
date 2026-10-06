# Klan deposu ve savaş arayüzü — 2026-10-06

- Klan > Klan merkezi: 60 yuvalı ortak depo, son 50 aktarım, yardımcı/üye izinleri.
- Lider izinleri değiştirir; liderin yetkisi kaldırılamaz. Depoya koyma/alma, davet, üye çıkarma, bina geliştirme, bağış, zindana giriş ayrı ayrı yönetilir.
- Depo: ticarete uygun silah, zırh, takı, klan malzemeleri. Bağlı/ilk ödeme eşyaları aktarılamaz. Mevcut pazarın paylaşılabilir eşya türleri korunur.
- Envanter ve klan deposu aynı SQLite transaction içinde güncellenir. Dolu çanta/ağırlık ve depo sınırı aktarımı durdurur. Son üye depoyu boşaltmadan klanı kapatamaz.
- Klan rolleri karaktere özeldir. Yardımcı veya yetkili üye lideri/yardımcıyı çıkaramaz; lider yardımcıları yönetebilir.
- Depo işlemleri sunucu ekonomisi açık hesaplarda çalışır; eski istemci ekonomisiyle ortak eşya aktarımı kapalıdır. Mevcut sunucu ekonomi bayrağı korunur (`server/set-economy.mjs` veya `ECONOMY_FOR_ALL=1`; bkz. SERVER_AUTHORITY.md).
- Yeni API: GET /api/clan/vault, PATCH /api/clan/permissions. Aktarımlar /api/game/act üzerindeki clan/vaultDeposit ve clan/vaultWithdraw eylemleridir. Yeni tablolar sunucu açılırken otomatik oluşturulur; backend de güncellenmelidir.
- Savaş alanında PracticeDuel kaldırıldı. Ödüllü rakip bulma ve arkadaş düellosu korunur.
- Normal/solo, klan zindanı, savaş alanı av/boss, arkadaş düellosunda geri çekilme onayı; normal ve klan savaşından sekme değiştirerek çıkış da onaylıdır.
- +8 zırhlar: birleşik yumuşak ışık halesi, yüzey parlaması, kayan ışık ve küçük parıltılar. Slot birleşimlerine sert kontur çizilmez; istatistikler değişmez.

Kontroller: npm run test:clans; npm run test:game; npm run test:server; npm run build.
Tarayıcı: 320/390 px klan, arkadaşlar, savaş alanı; iptal/onay geri çekilme ve sekme çıkışı; 60 sınıf/ırk/tier/+7/+8 kombinasyonu, 300 zırh efekti.
