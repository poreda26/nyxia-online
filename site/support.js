// Destek talebi formu: talebi sunucuya gönderir, kod ve takip bağlantısını gösterir, talepleri bu cihazda hatırlar.
(function () {
  var form = document.getElementById('ticket-form');
  var done = document.getElementById('ticket-done');
  var error = document.getElementById('ticket-error');
  var mine = document.getElementById('mine');
  var list = document.getElementById('mine-list');
  var KEY = 'nyxia_tickets';
  var MESSAGES = {
    INVALID_EMAIL: 'Geçerli bir e-posta adresi yaz.',
    SUBJECT_REQUIRED: 'Başlık en az 3 karakter olmalı.',
    MESSAGE_TOO_SHORT: 'Mesajın en az 10 karakter olmalı.',
    TOO_MANY_TICKETS: 'Çok fazla talep gönderdin. Bir süre sonra tekrar dene.',
    TOO_MANY_REQUESTS: 'Çok hızlı istek attın. Biraz bekleyip tekrar dene.'
  };
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
        if (!res.ok) throw new Error(MESSAGES[res.body.error] || 'Talep gönderilemedi. Bağlantını kontrol edip tekrar dene.');
        var link = 'ticket.html?c=' + encodeURIComponent(res.body.code) + '#k=' + encodeURIComponent(res.body.key);
        var items = saved(); items.unshift({ code: res.body.code, key: res.body.key, subject: String(body.subject).slice(0, 80) }); save(items);
        form.hidden = true;
        done.hidden = false;
        done.textContent = '';
        var strong = document.createElement('strong');
        strong.textContent = 'Talebin alındı. Numaran: ' + res.body.code;
        var p = document.createElement('p');
        p.textContent = 'Yanıtları ve durumu aşağıdaki bağlantıdan takip edebilirsin. Bağlantı sana özeldir; bu cihazda da kayıtlı kalır, e-posta adresine de gönderdik.';
        var a = document.createElement('a'); a.className = 'btn primary'; a.href = link; a.textContent = 'Talebimi aç';
        done.appendChild(strong); done.appendChild(p); done.appendChild(a);
        renderMine();
      })
      .catch(function (e) { error.textContent = e.message; error.hidden = false; })
      .then(function () { button.disabled = false; });
  });
})();
