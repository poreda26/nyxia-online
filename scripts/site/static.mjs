import { esc, page, INSTAGRAM, instagramIcon, DISCORD, discordIcon, playIcon, appleIcon } from './layout.mjs';

export function buildStatic(data, lang = 'tr') {
  const en = lang === 'en';
  const L = (tr, enText) => (en ? enText : tr);
  const prefix = en ? 'en/' : '';
  const A = en ? '../' : ''; // sitenin köküne göreli yol (ana sayfa/destek sayfaları bir klasör içinde değil)
  const classes = data.classes;
  const blurb = {
    warrior: L('Ön safın sağlam savaşçısı: yüksek can, güçlü savunma.', 'A sturdy front-line fighter: high health, strong defense.'),
    rogue: L('Menzilli okçu: hızlı atışlar, yüksek kritik.', 'A ranged archer: fast shots, high crit.'),
    mage: L('Yıkıcı büyücü: en yüksek hasar, düşük can.', 'A destructive caster: top damage, low health.'),
  };
  const className = (c) => (c.name === 'Rogue' ? L('Rogue (Okçu)', 'Rogue (Archer)') : c.name);
  const home = page({
    title: L('Mobil Online RPG', 'Mobile Online RPG'),
    description: L("Nyxia Online: karakterini geliştir, klanınla boss'lara karşı savaş, savaş alanında rakiplerini yen. Mobil online RPG.", 'Nyxia Online: level up your character, fight bosses with your clan and beat rivals in the Warzone. A mobile online RPG.'),
    active: 'home', lang, path: prefix + 'index.html',
    extraHead: `<link rel="preload" as="image" href="${A}img/hero.jpg">`,
    body: `
    <section class="hero" style="background-image:linear-gradient(180deg,rgba(11,12,16,.55),rgba(11,12,16,.96)),url(${A}img/hero.jpg)">
      <img class="logo" src="${A}nyxia-logo.png" alt="Nyxia Online">
      <h1>${L('Kendi efsaneni yaz.', 'Write your own legend.')}</h1>
      <p class="lead">${L("Nyxia Online, cebinde taşıdığın bir online RPG. Karakterini geliştir, klanınla boss'lara karşı savaş, savaş alanında rakiplerini yen.", 'Nyxia Online is an online RPG you carry in your pocket. Level up your character, fight bosses with your clan and beat your rivals in the Warzone.')}</p>
      <div class="buttons">
        <a class="btn primary" href="wiki/">${L("Wiki'yi keşfet", 'Explore the wiki')}</a>
        <a class="btn" href="#trailer">${L('Fragmanı izle', 'Watch the trailer')}</a>
        <a class="btn primary" href="${A}beta/">${L('Beta sürümünü oyna', 'Play the Beta')}</a>
      </div>
      <p class="muted beta-note">${L('Tarayıcıdan oynanan Beta sürümü: hesabın mobil uygulamayla aynıdır, hatalar olabilir.', 'The Beta runs in your browser: your account is the same as in the mobile app, and bugs may occur.')}</p>
      <div class="stores">
        <span class="store" role="img" aria-label="Google Play: ${L('yakında', 'coming soon')}">${playIcon}<span><small>${L('YAKINDA', 'COMING SOON')}</small><strong>Google Play</strong></span></span>
        <span class="store" role="img" aria-label="App Store: ${L('yakında', 'coming soon')}">${appleIcon}<span><small>${L('YAKINDA', 'COMING SOON')}</small><strong>App Store</strong></span></span>
      </div>
      <div class="buttons social">
        <a class="btn discord" href="${DISCORD}" target="_blank" rel="noopener">${discordIcon} ${L("Discord'a katıl", 'Join Discord')}</a>
        <a class="btn ig-btn" href="${INSTAGRAM}" target="_blank" rel="noopener">${instagramIcon} ${L("Instagram'da takip et", 'Follow on Instagram')}</a>
      </div>
    </section>

    <section id="trailer" class="section">
      <h2>${L('Fragman', 'Trailer')}</h2>
      <div class="video"><video controls preload="metadata" poster="${A}img/trailer-poster.jpg" playsinline><source src="${A}trailer.mp4" type="video/mp4">${L('Tarayıcın videoyu oynatamıyor.', 'Your browser cannot play the video.')}</video></div>
    </section>

    <section class="section">
      <h2>${L('Bir sınıf seç, kaderini çiz', 'Pick a class, shape your fate')}</h2>
      <div class="cards three">${classes.map((c) => `<a class="card class-card" style="--c:${c.color}" href="wiki/${en ? 'classes' : 'siniflar'}.html#${c.id}"><div class="pair"><img src="${A}img/chars/${c.id}-human.webp" alt="" loading="lazy"><img src="${A}img/chars/${c.id}-orc.webp" alt="" loading="lazy"></div><h3>${esc(className(c))}</h3><p>${esc(blurb[c.id])}</p></a>`).join('')}</div>
    </section>

    <section class="section">
      <h2>${L(`${data.maps.length} bölge, sayısız canavar`, `${data.maps.length} regions, countless monsters`)}</h2>
      <div class="strip">${data.maps.map((m) => `<a href="wiki/${en ? 'regions' : 'bolgeler'}.html#${m.id}" style="background-image:url(${A}img/regions/${m.id}.webp);--c:${m.color}"><span>${esc(m.name)}<small>${L('Sv.', 'Lv.')} ${m.levelMin}–${m.levelMax}</small></span></a>`).join('')}</div>
    </section>

    <section class="section">
      <h2>${L('Oyunda seni neler bekliyor?', 'What awaits you in the game?')}</h2>
      <div class="cards">
        <article class="card"><h3>${L('Klan ve boss savaşları', 'Clan and boss battles')}</h3><p>${L(`Klanını kur, ortak depoyu yönet. ${data.clanDungeon.total} aşamalı klan zindanında ve klan boss'unda birlikte savaş.`, `Found your clan and manage the shared vault. Fight together in the ${data.clanDungeon.total}-stage clan dungeon and the clan boss.`)}</p></article>
        <article class="card"><h3>${L('Savaş alanı', 'Warzone')}</h3><p>${L(`${data.warzone.unlockLevel}. seviyeden sonra dünya boss'ları, güçlendirilmiş av ve haftalık sıralama.`, `From level ${data.warzone.unlockLevel}: world bosses, an empowered hunt and the weekly ranking.`)}</p></article>
        <article class="card"><h3>${L('Eşya ve geliştirme', 'Gear and upgrades')}</h3><p>${L('6 kalitede silah ve zırh, takılar, kanatlar. Eşyalarını geliştir, setlerini tamamla.', 'Weapons and armor in 6 qualities, accessories and wings. Upgrade your gear and complete your sets.')}</p></article>
        <article class="card"><h3>${L('Oyuncu pazarı', 'Player market')}</h3><p>${L('Eşyalarını tezgâhına koy, diğer oyuncularla takas et.', 'Put your items on your stall and trade with other players.')}</p></article>
        <article class="card"><h3>${L('Hep çevrimiçi', 'Always online')}</h3><p>${L('İlerlemen sunucuda saklanır. Telefon değiştirsen de kaldığın yerden devam edersin.', 'Your progress is stored on the server. Change phones and continue where you left off.')}</p></article>
        <article class="card"><h3>${L('Adil oyun', 'Fair play')}</h3><p>${L('Savaşlar ve ödüller sunucuda hesaplanır, hileye karşı korunur.', 'Battles and rewards are calculated on the server and protected against cheating.')}</p></article>
      </div>
    </section>

    <section class="section cta follow">
      <h2>${L('Topluluğumuza katıl', 'Join our community')}</h2>
      <p>${L('Duyurular, güncellemeler ve etkinlikler için <strong>Discord</strong> sunucumuza gel; haberleri <strong>@nyxiaonline</strong> Instagram hesabında takip et.', 'Come to our <strong>Discord</strong> server for announcements, updates and events; follow the news on our <strong>@nyxiaonline</strong> Instagram account.')}</p>
      <p>${L("<strong>Discord ve Instagram'da düzenli çekilişler yapıyoruz!</strong> Katıl, takipte kal. Oyunun Ayarlar bölümünden her platform için bir kez 50 Elmas, iksirler ve 1 saatlik Mythic Premium kuponu kazanabilirsin.", '<strong>We run regular giveaways on Discord and Instagram!</strong> Join and keep following. In the game\'s Settings you can earn, once per platform, 50 Diamonds, potions and a 1-hour Mythic Premium voucher.')}</p>
      <div class="buttons"><a class="btn discord" href="${DISCORD}" target="_blank" rel="noopener">${discordIcon} ${L("Discord'a katıl", 'Join Discord')}</a><a class="btn ig-btn" href="${INSTAGRAM}" target="_blank" rel="noopener">${instagramIcon} @nyxiaonline</a></div>
    </section>

    <section class="section cta">
      <h2>${L('Yardıma mı ihtiyacın var?', 'Need help?')}</h2>
      <p>${L("Wiki'de oyunun tüm sistemleri anlatılıyor. Bir sorunun varsa destek ekibimize yaz.", 'The wiki explains every system in the game. If you have a problem, write to our support team.')}</p>
      <div class="buttons"><a class="btn primary" href="wiki/">Wiki</a><a class="btn" href="support.html">${L('Destek talebi aç', 'Open a support request')}</a></div>
    </section>`,
  });

  const support = page({
    title: L('Destek', 'Support'), description: L('Nyxia Online destek talebi aç: hesap, hata, ödeme, şikayet ve önerilerin için bize yaz.', 'Open a Nyxia Online support request: write to us about accounts, bugs, payments, reports and suggestions.'), active: 'support', lang, path: prefix + 'support.html',
    body: `
    <h1>${L('Destek', 'Support')}</h1>
    <p class="lead">${L('Bir sorun mu yaşıyorsun? Talebini yaz, sana bir numara ve takip bağlantısı verelim. Yanıtları o bağlantıdan (ve e-postandan) görürsün. Önce <a href="wiki/sss.html">sık sorulan sorulara</a> bakabilirsin.', 'Having a problem? Write your request and we will give you a number and a tracking link. You will see replies at that link (and in your email). You can first check the <a href="wiki/faq.html">frequently asked questions</a>.')}</p>
    <form id="ticket-form" class="form" novalidate>
      <label>${L('E-posta', 'Email')}<input type="email" name="email" autocomplete="email" required maxlength="120" placeholder="${L('ornek@mail.com', 'name@example.com')}"></label>
      <label>${L('Oyundaki kullanıcı adın', 'Your in-game username')} <small>${L('(isteğe bağlı)', '(optional)')}</small><input type="text" name="username" maxlength="24" placeholder="${L('kullanici_adi', 'username')}"></label>
      <label>${L('Konu türü', 'Topic')}
        <select name="category">
          <option value="account">${L('Hesap / giriş', 'Account / sign-in')}</option>
          <option value="bug">${L('Hata bildirimi', 'Bug report')}</option>
          <option value="payment">${L('Ödeme / elmas', 'Payment / diamonds')}</option>
          <option value="report">${L('Oyuncu şikayeti', 'Player report')}</option>
          <option value="suggestion">${L('Öneri', 'Suggestion')}</option>
          <option value="other">${L('Diğer', 'Other')}</option>
        </select>
      </label>
      <label>${L('Başlık', 'Subject')}<input type="text" name="subject" required maxlength="120" placeholder="${L('Kısaca ne oldu?', 'What happened, in short?')}"></label>
      <label>${L('Mesajın', 'Your message')}<textarea name="message" rows="7" required minlength="10" maxlength="4000" placeholder="${L('Ne zaman oldu, hangi karakterle, ne gördün? Ne kadar ayrıntı verirsen o kadar hızlı yardım ederiz.', 'When did it happen, with which character, what did you see? The more detail you give, the faster we can help.')}"></textarea></label>
      <label class="trap" aria-hidden="true">Web sitesi<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <p class="muted">${L('Şifreni ya da kart bilgilerini ASLA yazma; destek ekibi bunları hiçbir zaman istemez.', 'NEVER write your password or card details; the support team will never ask for them.')}</p>
      <button class="btn primary" type="submit">${L('Talebi gönder', 'Send request')}</button>
      <p id="ticket-error" class="error" role="alert" hidden></p>
    </form>
    <div id="ticket-done" class="callout" hidden></div>
    <section id="mine" hidden><h2>${L('Bu cihazdaki taleplerin', 'Your requests on this device')}</h2><ul id="mine-list" class="plain"></ul></section>`,
    script: '<script src="support.js"></script>',
  });

  const ticket = page({
    title: L('Destek talebi', 'Support request'), description: L('Destek talebinin durumunu gör ve yanıt yaz.', 'See the status of your support request and write a reply.'), active: 'support', lang, path: prefix + 'ticket.html',
    body: `
    <h1>${L('Destek talebi', 'Support request')} <span id="t-code" class="pill"></span></h1>
    <p id="t-status" class="muted">${L('Yükleniyor…', 'Loading…')}</p>
    <div id="t-error" class="callout warn" role="alert" hidden></div>
    <div id="t-thread" class="thread"></div>
    <form id="t-reply" class="form" hidden>
      <label>${L('Yanıtın', 'Your reply')}<textarea name="message" rows="5" required maxlength="4000" placeholder="${L('Mesajını yaz…', 'Write your message…')}"></textarea></label>
      <button class="btn primary" type="submit">${L('Gönder', 'Send')}</button>
      <p id="t-reply-error" class="error" role="alert" hidden></p>
    </form>
    <p class="muted">${L('Bu sayfanın bağlantısı sana özeldir; başkasıyla paylaşma.', 'The link to this page is private to you; do not share it.')}</p>`,
    script: '<script src="ticket.js"></script>',
  });

  return { [`${prefix}index.html`]: home, [`${prefix}support.html`]: support, [`${prefix}ticket.html`]: ticket };
}
