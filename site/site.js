// Wiki menüsünü (mobil) açıp kapatır.
(function () {
  var toggle = document.querySelector('.wiki-toggle');
  var nav = document.querySelector('.wiki-nav');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
