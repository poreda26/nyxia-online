// Dil sözlüğü — kullanıcı isteği: "İngilizce dil seçeneği ekle." Kapsam
// bilinçli olarak aşamalı: bu ilk turda oyunun "iskeleti" (menüler,
// butonlar, Ayarlar, giriş/karakter/sınıf/ırk ekranları, Kaptan tutorial'ı)
// çevrildi. Silah/canavar/görev isimleri, item lore'u ve savaş içi toast
// mesajları gibi veri katmanı metinleri HENÜZ çevrilmedi — bunlar ayrı,
// çok daha büyük bir iş (yüzlerce string, data/*.js dosyalarına dağılmış),
// sonraki turlarda parça parça eklenecek. `en` içinde eksik olan her
// anahtar LanguageContext.jsx'teki `t()` tarafından otomatik olarak `tr`
// karşılığına düşüyor — yani eksik bir çeviri asla boş/kırık görünmez,
// sadece o satır Türkçe kalır.
export const translations = {
  tr: {
    nav: {
      battle: "Savaş", inventory: "Envanter", market: "Pazar", upgrade: "Yükselt",
      captain: "Kaptan", clan: "Klan", warzone: "Savaş Alanı", chat: "Sohbet", character: "Karakter",
    },
    settings: {
      title: "Ayarlar", musicVolume: "Müzik Sesi", sfxVolume: "Efekt Sesi",
      muteOn: "Sesi Kapat", muteOff: "Sesi Aç", off: "Kapalı", language: "Dil",
    },
    login: {
      welcome: "HOŞ GELDİN", title: "Kullanıcı adını gir.",
      subtitle: "Bu isim karakterlerini bu tarayıcıda ayırt eder.",
      placeholder: "kullanıcı adı", submit: "Giriş Yap",
      caveat: "Bu yerel bir profildir — şifre yok, sunucu yok. Sadece bu tarayıcıda karakterlerini saklamak için kullanılır.",
    },
    raceSelect: {
      eyebrow: "YENİ KARAKTER", title: "Bir ırk seç.",
      subtitle: "{a} mı, {b} mı — hangi milletin bayrağı altında savaşacaksın?",
      continueAs: "{race} olarak devam et",
    },
    classSelect: {
      eyebrow: "YENİ MACERA", title: "Bir sınıf seç.",
      subtitle: "Zindanlara ineceksin, zırh toplayacaksın, pazarda satacaksın.",
      namePlaceholder: "Karakter adı", nameRequired: "Bir karakter adı girmelisin.",
      startAs: "{cls} olarak başla",
      confirmTitle: "{cls} sınıfını seçmek istediğine emin misin?",
      confirmSubtitle: "\"{nick}\" adıyla bu sınıfta bir macera başlıyor.",
      cancel: "Vazgeç", confirmYes: "Evet, Başla",
    },
    characterSelect: {
      subtitle: "{n} karakter slotun var. Birini oyna, ya da boş bir slotta yeni bir karakter yarat.",
      lockedSlot: "Kilitli Slot", emptySlot: "Boş Slot", createCharacter: "Karakter Oluştur",
      diamondCost: "{cost} Elmas — hesapta {have}",
      open: "Aç", play: "Oyna", logout: "Çıkış Yap",
      deleteWarn: "Karakteri silersen üstündeki tüm eşyaları ve altını kaybedersin. Silme bedeli {cost} elmas (hesaptan).",
      deleteFinal: "Karakteri silmek istediğine kesinlikle emin misin? Bu işlem geri alınamaz.",
      deleteNotEnough: "Silmek için hesapta en az {cost} elmas olmalı (şu an: {have}).",
      cancel: "Vazgeç", continue: "Devam Et", confirmDelete: "Evet, Sil ({cost} Elmas)",
    },
    topBar: { maxLevel: "MAKS SEVİYE", dailyLogin: "Günlük Giriş Ödülü" },
    tutorial: {
      badge: "KAPTAN ANLATIYOR", skip: "Atla", back: "Geri", next: "İleri", start: "Başla!",
      steps: [
        { title: "Nyxia Online'a Hoş Geldin", text: "Selam, evlat. Ben Kaptan — bu toprakların nöbetçisiyim. Sana birkaç şey göstereceğim, uzun sürmez. Canın sıkılırsa sağ üstteki çarpıya bas, beni susturursun." },
        { title: "Dünyayı Keşfet", text: "Savaş sekmesinde bir bölge seç, bir yaratığa dokun, yaklaş ve Saldır'a bas. Altın, tecrübe, bazen de ekipman ya da sandık düşer. Başka bölgelere yine Savaş menüsündeki Kapı'dan geçersin." },
        { title: "Envanter", text: "Düşen eşyaları çantandan kuşan. 12 slotluk bir kuşanma panelin var — sınıfına uymayan zırhlar kilitli görünür, onları takamazsın, boşuna zorlama." },
        { title: "Pazar", text: "Oyuncu Pazarı'nda çantandaki eşyaları (sınıfına uymasa bile) satışa çıkarabilir ya da başkalarının tezgahından alışveriş yapabilirsin. Dükkan'da iksir, Özel Market'te elmas karşılığı özel parşömenler bulursun." },
        { title: "Kaptan", text: "Beni sık sık ziyaret et. Her canavar için ayrı bir avcılık görevim var — hedefi tamamla, panomdan altın, tecrübe ve sandık al. Tamamladığında sana haber veririm, merak etme." },
        { title: "Yükselt", text: "Parşömen ve altın getir, ekipmanını +8'e kadar güçlendireyim. Yükseltme Ustası'nı alt menüyü kaydırarak bulursun — ama uyarayım, başarısız olursan eşya da parşömen de gider." },
        { title: "Klan & Savaş Alanı", text: "Bir klana katıl, Savaş Alanı'nda diğer maceracılara karşı sınan, haftalık National Point sıralamasında yüksel. Klanına bağışta bulunursan Klan Binası güçlenir, Klan Boss'u açılır. Artık hazırsın — iyi avlar, evlat." },
      ],
    },
  },
  en: {
    nav: {
      battle: "Battle", inventory: "Inventory", market: "Market", upgrade: "Upgrade",
      captain: "Captain", clan: "Clan", warzone: "Warzone", chat: "Chat", character: "Character",
    },
    settings: {
      title: "Settings", musicVolume: "Music Volume", sfxVolume: "Effects Volume",
      muteOn: "Mute", muteOff: "Unmute", off: "Off", language: "Language",
    },
    login: {
      welcome: "WELCOME", title: "Enter your username.",
      subtitle: "This name tells your characters apart on this browser.",
      placeholder: "username", submit: "Log In",
      caveat: "This is a local profile — no password, no server. It's only used to store your characters in this browser.",
    },
    raceSelect: {
      eyebrow: "NEW CHARACTER", title: "Choose a nation.",
      subtitle: "{a} or {b} — which nation's banner will you fight under?",
      continueAs: "Continue as {race}",
    },
    classSelect: {
      eyebrow: "NEW ADVENTURE", title: "Choose a class.",
      subtitle: "You'll delve into dungeons, gather gear, and sell it on the market.",
      namePlaceholder: "Character name", nameRequired: "You need to enter a character name.",
      startAs: "Start as {cls}",
      confirmTitle: "Are you sure you want to choose {cls}?",
      confirmSubtitle: "An adventure begins in this class under the name \"{nick}\".",
      cancel: "Cancel", confirmYes: "Yes, Start",
    },
    characterSelect: {
      subtitle: "You have {n} character slot(s). Play one, or create a new character in an empty slot.",
      lockedSlot: "Locked Slot", emptySlot: "Empty Slot", createCharacter: "Create Character",
      diamondCost: "{cost} Diamonds — you have {have}",
      open: "Unlock", play: "Play", logout: "Log Out",
      deleteWarn: "Deleting this character loses all its items and gold. The deletion fee is {cost} diamonds (from your account).",
      deleteFinal: "Are you absolutely sure you want to delete this character? This cannot be undone.",
      deleteNotEnough: "You need at least {cost} diamonds in your account to delete (currently: {have}).",
      cancel: "Cancel", continue: "Continue", confirmDelete: "Yes, Delete ({cost} Diamonds)",
    },
    topBar: { maxLevel: "MAX LEVEL", dailyLogin: "Daily Login Reward" },
    tutorial: {
      badge: "THE CAPTAIN EXPLAINS", skip: "Skip", back: "Back", next: "Next", start: "Start!",
      steps: [
        { title: "Welcome to Nyxia Online", text: "Hello there. I'm the Captain — guardian of these lands. I'll show you a few things, it won't take long. If you get bored, tap the X in the top corner and I'll quiet down." },
        { title: "Explore the World", text: "Pick a region in the Battle tab, tap a creature, close in and hit Attack. You'll earn gold, experience, and sometimes gear or a chest. You can reach other regions through the Gate in the Battle menu." },
        { title: "Inventory", text: "Equip the items that drop from your bag. You have a 12-slot loadout — armor that doesn't fit your class shows locked, don't bother trying." },
        { title: "Market", text: "List items from your bag (even ones that don't fit your class) on the Player Market, or buy from other stalls. The Shop sells potions, and the Special Market trades diamonds for premium scrolls." },
        { title: "The Captain", text: "Come see me often. I keep a separate hunting task for every creature — finish it, and claim gold, experience, and a chest from my board. I'll let you know when one's done." },
        { title: "Upgrade", text: "Bring me scrolls and gold, and I'll strengthen your gear up to +8 — find the Upgrade Master by scrolling the bottom menu. Fair warning: fail, and both the item and the scroll are lost." },
        { title: "Clan & Warzone", text: "Join a clan, test yourself against other adventurers in the Warzone, and climb the weekly National Point leaderboard. Donate to your clan to strengthen the Clan Hall and unlock the Clan Boss. You're ready now — good hunting." },
      ],
    },
  },
};
