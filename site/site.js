// Wiki menüsünü (mobil) açıp kapatır.
(function () {
  var toggle = document.querySelector('.wiki-toggle');
  var nav = document.querySelector('.wiki-nav');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
// Türkçe sayfada tarayıcı dili Türkçe değilse İngilizce sürümü öneren küçük bir şerit gösterir (kapatılınca hatırlanır).
(function () {
  try {
    if (document.documentElement.lang !== 'tr') return;
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(function (l) { return String(l).toLowerCase(); });
    if (langs.some(function (l) { return l.indexOf('tr') === 0; })) return;
    if (localStorage.getItem('nyxia_en_hint')) return;
    var alt = document.getElementById('lang');
    if (!alt) return;
    var bar = document.createElement('div');
    bar.className = 'lang-hint';
    var link = document.createElement('a'); link.href = alt.href; link.textContent = 'This site is also available in English →';
    var close = document.createElement('button'); close.type = 'button'; close.setAttribute('aria-label', 'Close'); close.textContent = '×';
    close.addEventListener('click', function () { bar.remove(); try { localStorage.setItem('nyxia_en_hint', '1'); } catch (e) { /* depolama kapalı */ } });
    bar.appendChild(link); bar.appendChild(close);
    document.body.insertBefore(bar, document.body.firstChild);
  } catch (e) { /* sorun değil */ }
})();
