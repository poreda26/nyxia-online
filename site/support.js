// Destek talebi formu: talebi sunucuya gönderir, kod ve takip bağlantısını gösterir, talepleri bu cihazda hatırlar.
(function () {
  var form = document.getElementById('ticket-form');
  var done = document.getElementById('ticket-done');
  var error = document.getElementById('ticket-error');
  var mine = document.getElementById('mine');
  var list = document.getElementById('mine-list');
  var KEY = 'nyxia_tickets';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    INVALID_EMAIL: 'Enter a valid email address.',
    SUBJECT_REQUIRED: 'The subject must be at least 3 characters.',
    MESSAGE_TOO_SHORT: 'Your message must be at least 10 characters.',
    TOO_MANY_TICKETS: 'You sent too many requests. Try again later.',
    TOO_MANY_REQUESTS: 'Too many requests. Wait a moment and try again.',
    FAILED: 'The request could not be sent. Check your connection and try again.',
    RECEIVED: 'Request received. Your number: ',
    FOLLOW: 'Follow replies and status at the link below. The link is private to you; it stays saved on this device and we also sent it to your email.',
    OPEN: 'Open my request'
  } : {
    INVALID_EMAIL: 'Geçerli bir e-posta adresi yaz.',
    SUBJECT_REQUIRED: 'Başlık en az 3 karakter olmalı.',
    MESSAGE_TOO_SHORT: 'Mesajın en az 10 karakter olmalı.',
    TOO_MANY_TICKETS: 'Çok fazla talep gönderdin. Bir süre sonra tekrar dene.',
    TOO_MANY_REQUESTS: 'Çok hızlı istek attın. Biraz bekleyip tekrar dene.',
    FAILED: 'Talep gönderilemedi. Bağlantını kontrol edip tekrar dene.',
    RECEIVED: 'Talebin alındı. Numaran: ',
    FOLLOW: 'Yanıtları ve durumu aşağıdaki bağlantıdan takip edebilirsin. Bağlantı sana özeldir; bu cihazda da kayıtlı kalır, e-posta adresine de gönderdik.',
    OPEN: 'Talebimi aç'
  };
  var MESSAGES = T;
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(items) { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 20))); } catch (e) { /* depolama kapalı */ } }
  function renderMine() {
    var items = saved();
    mine.hidden = !items.length;
    list.textContent = '';
    items.forEach(function (t) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = 'ticket.html?c=' + encodeURIComponent(t.code) + '#k=' + encodeURIComponent(t.key);
      a.textContent = t.code + ' · ' + t.subject;
      li.appendChild(a);
      list.appendChild(li);
    });
  }
  renderMine();
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    error.hidden = true;
    var data = new FormData(form);
    var body = {};
    data.forEach(function (value, key) { body[key] = value; });
    var button = form.querySelector('button[type=submit]');
    button.disabled = true;
    fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(MESSAGES[res.body.error] || T.FAILED);
        var link = 'ticket.html?c=' + encodeURIComponent(res.body.code) + '#k=' + encodeURIComponent(res.body.key);
        var items = saved(); items.unshift({ code: res.body.code, key: res.body.key, subject: String(body.subject).slice(0, 80) }); save(items);
        form.hidden = true;
        done.hidden = false;
        done.textContent = '';
        var strong = document.createElement('strong');
        strong.textContent = T.RECEIVED + res.body.code;
        var p = document.createElement('p');
        p.textContent = T.FOLLOW;
        var a = document.createElement('a'); a.className = 'btn primary'; a.href = link; a.textContent = T.OPEN;
        done.appendChild(strong); done.appendChild(p); done.appendChild(a);
        renderMine();
      })
      .catch(function (e) { error.textContent = e.message; error.hidden = false; })
      .then(function () { button.disabled = false; });
  });
})();
