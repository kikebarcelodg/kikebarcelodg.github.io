/* Cabecera y footer únicos para todas las páginas.
   La ruta base se calcula desde la ubicación de este script, así funciona
   en la raíz de un dominio o dentro de un subdirectorio de GitHub Pages. */
(function () {
  var B = new URL('../', document.currentScript.src).href;
  window.SITE_BASE = B;
  document.documentElement.classList.add('js');
  var P = window.PROJECTS || [], here = location.pathname.split('/').pop(), inProj = location.pathname.indexOf('/proyectos/') > -1;
  function a(h, t, on) { return '<a href="' + B + h + '"' + (on ? ' class="on"' : '') + '>' + t + '</a>'; }
  var nav = a('trabajos.html', 'Trabajos <sup>' + P.length + '</sup>', here === 'trabajos.html' || inProj) +
    a('sobre-mi.html', 'Sobre mí', here === 'sobre-mi.html') + a('contacto.html', 'Contacto', here === 'contacto.html');
  var h = document.createElement('header'); h.className = 'site-header';
  h.innerHTML = '<a class="brand" href="' + B + 'index.html" aria-label="Kike Barceló, inicio"><img src="' + B + 'img/logo/k.png" alt="k."></a><nav>' + nav + '</nav><button class="burger" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span></button>';
  document.body.prepend(h);
  var b = h.querySelector('.burger');
  b.onclick = function () { var o = h.classList.toggle('menu-open'); b.setAttribute('aria-expanded', o); };
  var f = document.createElement('footer'); f.className = 'site-footer';
  f.innerHTML = '<a class="big display" href="mailto:kikebarcelodg@gmail.com">Hablemos</a><div class="frow"><img class="flogo" src="' + B + 'img/logo/k.png" alt="k."><div><a href="mailto:kikebarcelodg@gmail.com">kikebarcelodg@gmail.com</a><br><a href="tel:+34637464787">+34 637 464 787</a></div><div class="fnav"><a href="' + B + 'trabajos.html">Trabajos</a><a href="' + B + 'sobre-mi.html">Sobre mí</a><a href="' + B + 'contacto.html">Contacto</a></div><div>© ' + new Date().getFullYear() + ' Kike Barceló</div></div>';
  document.body.append(f);
})();
