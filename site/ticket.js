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
  var EN = document.documentElement.lang === 'en';
  var STATUS = EN ? { open: 'Status: awaiting reply', answered: 'Status: answered', closed: 'Status: closed (reopens if you write a new message)' } : { open: 'Durum: yanıt bekliyor', answered: 'Durum: yanıtlandı', closed: 'Durum: kapalı (yeni mesaj yazarsan yeniden açılır)' };
  var TXT = EN ? { staff: 'Nyxia Support', you: 'You', missing: 'The link is incomplete. Use the whole link you were given when you opened the request.', notFound: 'Request not found. Check the link.', tooMany: 'You wrote too many messages, wait a bit.', sendFail: 'The message could not be sent. Try again.' } : { staff: 'Nyxia Destek', you: 'Sen', missing: 'Bağlantı eksik. Talep açarken sana verilen bağlantının tamamını kullan.', notFound: 'Talep bulunamadı. Bağlantıyı kontrol et.', tooMany: 'Çok fazla mesaj yazdın, biraz bekle.', sendFail: 'Mesaj gönderilemedi. Tekrar dene.' };
  codeEl.textContent = code || '';
  function fail(text) { statusEl.hidden = true; errorEl.hidden = false; errorEl.textContent = text; }
  function post(path, body) {
    return fetch('/api/support/tickets/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw Object.assign(new Error(j.error || 'ERROR'), { code: j.error }); return j; }); });
  }
  function date(ms) { return new Date(ms).toLocaleString(EN ? 'en-GB' : 'tr-TR'); }
  function render(ticket) {
    statusEl.hidden = false;
    statusEl.textContent = ticket.subject + ' · ' + (STATUS[ticket.status] || '');
    errorEl.hidden = true;
    thread.textContent = '';
    ticket.messages.forEach(function (m) {
      var div = document.createElement('div'); div.className = 'msg ' + (m.author === 'staff' ? 'staff' : 'user');
      var small = document.createElement('small'); small.textContent = (m.author === 'staff' ? TXT.staff : TXT.you) + ' · ' + date(m.created_at);
      var p = document.createElement('span'); p.textContent = m.body;
      div.appendChild(small); div.appendChild(p); thread.appendChild(div);
    });
    form.hidden = false;
  }
  if (!code || !key) return fail(TXT.missing);
  post('view', { code: code, key: key }).then(render).catch(function () { fail(TXT.notFound); });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    replyError.hidden = true;
    var text = form.elements.message.value;
    var button = form.querySelector('button'); button.disabled = true;
    post('reply', { code: code, key: key, message: text }).then(function (ticket) { form.elements.message.value = ''; render(ticket); })
      .catch(function (e) { replyError.hidden = false; replyError.textContent = e.code === 'TOO_MANY_MESSAGES' ? TXT.tooMany : TXT.sendFail; })
      .then(function () { button.disabled = false; });
  });
})();
