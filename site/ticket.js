// Destek talebi sayfası: kod (?c=) ve gizli anahtar (#k=) ile talebi gösterir, yanıt yazdırır.
(function () {
  var params = new URLSearchParams(location.search);
  var code = (params.get('c') || '').toUpperCase();
  var key = new URLSearchParams(location.hash.replace(/^#/, '')).get('k') || '';
  var codeEl = document.getElementById('t-code');
  var statusEl = document.getElementById('t-status');
  var errorEl = document.getElementById('t-error');
  var thread = document.getElementById('t-thread');
  var form = document.getElementById('t-reply');
  var replyError = document.getElementById('t-reply-error');
  var STATUS = { open: 'Durum: yanıt bekliyor', answered: 'Durum: yanıtlandı', closed: 'Durum: kapalı (yeni mesaj yazarsan yeniden açılır)' };
  codeEl.textContent = code || '';
  function fail(text) { statusEl.hidden = true; errorEl.hidden = false; errorEl.textContent = text; }
  function post(path, body) {
    return fetch('/api/support/tickets/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw Object.assign(new Error(j.error || 'ERROR'), { code: j.error }); return j; }); });
  }
  function date(ms) { return new Date(ms).toLocaleString('tr-TR'); }
  function render(ticket) {
    statusEl.hidden = false;
    statusEl.textContent = ticket.subject + ' · ' + (STATUS[ticket.status] || '');
    errorEl.hidden = true;
    thread.textContent = '';
    ticket.messages.forEach(function (m) {
      var div = document.createElement('div'); div.className = 'msg ' + (m.author === 'staff' ? 'staff' : 'user');
      var small = document.createElement('small'); small.textContent = (m.author === 'staff' ? 'Nyxia Destek' : 'Sen') + ' · ' + date(m.created_at);
      var p = document.createElement('span'); p.textContent = m.body;
      div.appendChild(small); div.appendChild(p); thread.appendChild(div);
    });
    form.hidden = false;
  }
  if (!code || !key) return fail('Bağlantı eksik. Talep açarken sana verilen bağlantının tamamını kullan.');
  post('view', { code: code, key: key }).then(render).catch(function () { fail('Talep bulunamadı. Bağlantıyı kontrol et.'); });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    replyError.hidden = true;
    var text = form.elements.message.value;
    var button = form.querySelector('button'); button.disabled = true;
    post('reply', { code: code, key: key, message: text }).then(function (ticket) { form.elements.message.value = ''; render(ticket); })
      .catch(function (e) { replyError.hidden = false; replyError.textContent = e.code === 'TOO_MANY_MESSAGES' ? 'Çok fazla mesaj yazdın, biraz bekle.' : 'Mesaj gönderilemedi. Tekrar dene.'; })
      .then(function () { button.disabled = false; });
  });
})();
