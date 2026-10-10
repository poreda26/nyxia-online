import { esc, page } from './layout.mjs';

export function buildStatic(data) {
  const classes = data.classes;
  const blurb = {
    warrior: 'Ön safın sağlam savaşçısı: yüksek can, güçlü savunma.',
    rogue: 'Menzilli okçu: hızlı atışlar, yüksek kritik.',
    mage: 'Yıkıcı büyücü: en yüksek hasar, düşük can.',
  };
  const home = page({
    title: 'Mobil Online RPG', description: 'Nyxia Online: karakterini geliştir, klanınla boss\'lara karşı savaş, savaş alanında rakiplerini yen. Mobil online RPG.', active: 'home', root: '',
    extraHead: '<link rel="preload" as="image" href="img/hero.jpg">',
    body: `
    <section class="hero" style="background-image:linear-gradient(180deg,rgba(11,12,16,.55),rgba(11,12,16,.96)),url(img/hero.jpg)">
      <img class="logo" src="nyxia-logo.png" alt="Nyxia Online">
      <h1>Kendi efsaneni yaz.</h1>
      <p class="lead">Nyxia Online, cebinde taşıdığın bir online RPG. Karakterini geliştir, klanınla boss'lara karşı savaş, savaş alanında rakiplerini yen.</p>
      <div class="buttons">
        <a class="btn primary" href="wiki/">Wiki'yi keşfet</a>
        <a class="btn" href="#trailer">Fragmanı izle</a>
      </div>
      <div class="stores"><span class="store">Google Play · yakında</span><span class="store">App Store · yakında</span></div>
    </section>

    <section id="trailer" class="section">
      <h2>Fragman</h2>
      <div class="video"><video controls preload="metadata" poster="img/trailer-poster.jpg" playsinline><source src="trailer.mp4" type="video/mp4">Tarayıcın videoyu oynatamıyor.</video></div>
    </section>

    <section class="section">
      <h2>Bir sınıf seç, kaderini çiz</h2>
      <div class="cards three">${classes.map((c) => `<a class="card class-card" style="--c:${c.color}" href="wiki/siniflar.html#${c.id}"><div class="pair"><img src="img/chars/${c.id}-human.webp" alt="" loading="lazy"><img src="img/chars/${c.id}-orc.webp" alt="" loading="lazy"></div><h3>${esc(c.name === 'Rogue' ? 'Rogue (Okçu)' : c.name)}</h3><p>${esc(blurb[c.id])}</p></a>`).join('')}</div>
    </section>

    <section class="section">
      <h2>${data.maps.length} bölge, sayısız canavar</h2>
      <div class="strip">${data.maps.map((m) => `<a href="wiki/bolgeler.html#${m.id}" style="background-image:url(img/regions/${m.id}.webp);--c:${m.color}"><span>${esc(m.name)}<small>Sv. ${m.levelMin}–${m.levelMax}</small></span></a>`).join('')}</div>
    </section>

    <section class="section">
      <h2>Oyunda seni neler bekliyor?</h2>
      <div class="cards">
        <article class="card"><h3>Klan ve boss savaşları</h3><p>Klanını kur, ortak depoyu yönet. ${data.clanDungeon.total} aşamalı klan zindanında ve klan boss'unda birlikte savaş.</p></article>
        <article class="card"><h3>Savaş alanı</h3><p>${data.warzone.unlockLevel}. seviyeden sonra dünya boss'ları, güçlendirilmiş av ve haftalık sıralama.</p></article>
        <article class="card"><h3>Eşya ve geliştirme</h3><p>6 kalitede silah ve zırh, takılar, kanatlar. Eşyalarını geliştir, setlerini tamamla.</p></article>
        <article class="card"><h3>Oyuncu pazarı</h3><p>Eşyalarını tezgâhına koy, diğer oyuncularla takas et.</p></article>
        <article class="card"><h3>Hep çevrimiçi</h3><p>İlerlemen sunucuda saklanır. Telefon değiştirsen de kaldığın yerden devam edersin.</p></article>
        <article class="card"><h3>Adil oyun</h3><p>Savaşlar ve ödüller sunucuda hesaplanır, hileye karşı korunur.</p></article>
      </div>
    </section>

    <section class="section cta">
      <h2>Yardıma mı ihtiyacın var?</h2>
      <p>Wiki'de oyunun tüm sistemleri anlatılıyor. Bir sorunun varsa destek ekibimize yaz.</p>
      <div class="buttons"><a class="btn primary" href="wiki/">Wiki</a><a class="btn" href="support.html">Destek talebi aç</a></div>
    </section>`,
  });

  const support = page({
    title: 'Destek', description: 'Nyxia Online destek talebi aç: hesap, hata, ödeme, şikayet ve önerilerin için bize yaz.', active: 'support', root: '',
    body: `
    <h1>Destek</h1>
    <p class="lead">Bir sorun mu yaşıyorsun? Talebini yaz, sana bir numara ve takip bağlantısı verelim. Yanıtları o bağlantıdan (ve e-postandan) görürsün. Önce <a href="wiki/sss.html">sık sorulan sorulara</a> bakabilirsin.</p>
    <form id="ticket-form" class="form" novalidate>
      <label>E-posta<input type="email" name="email" autocomplete="email" required maxlength="120" placeholder="ornek@mail.com"></label>
      <label>Oyundaki kullanıcı adın <small>(isteğe bağlı)</small><input type="text" name="username" maxlength="24" placeholder="kullanici_adi"></label>
      <label>Konu türü
        <select name="category">
          <option value="account">Hesap / giriş</option>
          <option value="bug">Hata bildirimi</option>
          <option value="payment">Ödeme / elmas</option>
          <option value="report">Oyuncu şikayeti</option>
          <option value="suggestion">Öneri</option>
          <option value="other">Diğer</option>
        </select>
      </label>
      <label>Başlık<input type="text" name="subject" required maxlength="120" placeholder="Kısaca ne oldu?"></label>
      <label>Mesajın<textarea name="message" rows="7" required minlength="10" maxlength="4000" placeholder="Ne zaman oldu, hangi karakterle, ne gördün? Ne kadar ayrıntı verirsen o kadar hızlı yardım ederiz."></textarea></label>
      <label class="trap" aria-hidden="true">Web sitesi<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <p class="muted">Şifreni ya da kart bilgilerini ASLA yazma; destek ekibi bunları hiçbir zaman istemez.</p>
      <button class="btn primary" type="submit">Talebi gönder</button>
      <p id="ticket-error" class="error" role="alert" hidden></p>
    </form>
    <div id="ticket-done" class="callout" hidden></div>
    <section id="mine" hidden><h2>Bu cihazdaki taleplerin</h2><ul id="mine-list" class="plain"></ul></section>`,
    script: '<script src="support.js"></script>',
  });

  const ticket = page({
    title: 'Destek talebi', description: 'Destek talebinin durumunu gör ve yanıt yaz.', active: 'support', root: '',
    body: `
    <h1>Destek talebi <span id="t-code" class="pill"></span></h1>
    <p id="t-status" class="muted">Yükleniyor…</p>
    <div id="t-error" class="callout warn" role="alert" hidden></div>
    <div id="t-thread" class="thread"></div>
    <form id="t-reply" class="form" hidden>
      <label>Yanıtın<textarea name="message" rows="5" required maxlength="4000" placeholder="Mesajını yaz…"></textarea></label>
      <button class="btn primary" type="submit">Gönder</button>
      <p id="t-reply-error" class="error" role="alert" hidden></p>
    </form>
    <p class="muted">Bu sayfanın bağlantısı sana özeldir; başkasıyla paylaşma.</p>`,
    script: '<script src="ticket.js"></script>',
  });

  return { 'index.html': home, 'support.html': support, 'ticket.html': ticket };
}
