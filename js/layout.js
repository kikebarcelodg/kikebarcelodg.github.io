/* Cabecera y footer. Los enlaces apuntan a secciones de la misma página (one page).
   La ruta base se calcula desde la ubicación de este script, así funciona
   en la raíz de un dominio o dentro de un subdirectorio de GitHub Pages. */
(function () {
  var B = new URL('../', document.currentScript.src).href;
  window.SITE_BASE = B;
  document.documentElement.classList.add('js');
  var P = window.PROJECTS || [];
  function a(id, t) { return '<a href="#' + id + '" data-nav="' + id + '">' + t + '</a>'; }
  var nav = a('trabajos', 'Trabajos <sup>' + P.length + '</sup>') + a('sobre-mi', 'Sobre mí') + a('contacto', 'Contacto');
  var h = document.createElement('header'); h.className = 'site-header';
  h.innerHTML = '<a class="brand" href="#inicio" aria-label="Kike Barceló, inicio"><img src="' + B + 'img/logo/k.png" alt="k."></a><nav>' + nav + '</nav><button class="burger" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span></button>';
  document.body.prepend(h);
  var b = h.querySelector('.burger');
  b.onclick = function () { var o = h.classList.toggle('menu-open'); b.setAttribute('aria-expanded', o); };
  h.querySelector('nav').addEventListener('click', function (e) {      // en móvil, cierra el menú al elegir una sección
    if (e.target.closest('a')) { h.classList.remove('menu-open'); b.setAttribute('aria-expanded', 'false'); }
  });
  var f = document.createElement('footer'); f.className = 'site-footer'; f.id = 'contacto';
  f.innerHTML = '<a class="big display" href="mailto:kikebarcelodg@gmail.com">Hablemos</a><div class="frow"><img class="flogo" src="' + B + 'img/logo/k.png" alt="k."><div><a href="mailto:kikebarcelodg@gmail.com">kikebarcelodg@gmail.com</a><br><a href="tel:+34637464787">+34 637 464 787</a></div><div class="fnav"><a href="#trabajos">Trabajos</a><a href="#sobre-mi">Sobre mí</a><a href="mailto:kikebarcelodg@gmail.com">Contacto</a></div><div>© ' + new Date().getFullYear() + ' Kike Barceló</div></div>';
  document.body.append(f);

  /* Marca en el menú la sección que se está viendo */
  var ids = ['trabajos', 'sobre-mi', 'contacto'], links = {}, ticking = false;
  ids.forEach(function (id) { links[id] = h.querySelector('[data-nav="' + id + '"]'); });
  function spy() {
    ticking = false;
    var y = window.innerHeight * 0.35, act = '';
    ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= y) act = id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) act = 'contacto';
    ids.forEach(function (id) { links[id].classList.toggle('on', id === act); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();
})();
