/* One page: render de destacados y lista, y despliegue de cada proyecto en su sitio */
(function () {
  var P = window.PROJECTS || [], B = window.SITE_BASE;
  var $ = function (s) { return document.querySelector(s); };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SMOOTH = calm ? 'auto' : 'smooth';
  var st = function (p) { return '--c:' + p.color + ';--t:' + p.ink; };
  var bySlug = function (s) { return P.filter(function (p) { return p.slug === s; })[0]; };
  function go(el) { el.scrollIntoView({ behavior: SMOOTH, block: 'start' }); }
  function setHash(h) { try { history.replaceState(null, '', h || location.pathname + location.search); } catch (_) {} }

  function morph(p, it) {
    var d = B + 'img/proyectos/' + p.slug + '/';
    return '<figure class="shot morph half reveal"><button class="stack" type="button" aria-label="Cambiar entre las dos imágenes"><img src="' + d + it.morph[0] + '.jpg" alt="' + p.name + ', círculos sobre las articulaciones"><img src="' + d + it.morph[1] + '.jpg" alt="' + p.name + ', círculos unidos con degradados" aria-hidden="true"></button><figcaption data-caps=\'' + JSON.stringify(it.caps || []).replace(/'/g, '&#39;') + '\'>' + (it.caps ? it.caps[0] : '') + '</figcaption></figure>';
  }
  function initMorph(root) {
    root.querySelectorAll('.morph').forEach(function (f) {
      var cap = f.querySelector('figcaption'), caps = JSON.parse(cap.getAttribute('data-caps') || '[]'), t = null, obs = null;
      function set(on) { f.classList.toggle('on', on); if (caps.length) cap.textContent = caps[on ? 1 : 0]; }
      function start() { if (!calm && !t) t = setInterval(function () { set(!f.classList.contains('on')); }, 4200); }
      function stop() { clearInterval(t); t = null; }
      f.querySelector('.stack').onclick = function () { stop(); set(!f.classList.contains('on')); start(); };
      if ('IntersectionObserver' in window) { obs = new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: .4 }); obs.observe(f); } else start();
      f._stop = function () { stop(); if (obs) obs.disconnect(); };
    });
  }
  function shots(p) {
    var g = p.gallery || ['1', '2', '3'];
    return '<div class="gallery">' + g.map(function (it) {
      var o = typeof it === 'object', f = o ? it.f : it;
      if (o && it.morph) return morph(p, it);
      return '<figure class="shot reveal' + (o && it.m ? ' mult' : '') + (o && it.h ? ' half' : '') + '" style="' + st(p) + '"><span class="ph">' + p.name + '</span><img src="' + B + 'img/proyectos/' + p.slug + '/' + f + '.jpg" alt="' + p.name + '" onload="this.parentNode.classList.toggle(\'wide\',this.naturalWidth>this.naturalHeight&&!this.parentNode.classList.contains(\'half\'))" onerror="this.parentNode.classList.add(\'empty\');this.remove()"></figure>';
    }).join('') + '</div>';
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  function watch() { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); }); }

  /* Listas */
  var L = $('#work-list');
  if (L) L.innerHTML = P.map(function (p) {
    return '<div class="work-item"><a class="row" href="#' + p.slug + '" data-slug="' + p.slug + '" aria-expanded="false" style="' + st(p) + '"><span class="nm display">' + p.name + '</span><span class="tg ui">' + p.tags.join(', ') + '</span><span class="ar">↗</span></a></div>';
  }).join('');
  var C = $('#clients');
  if (C) C.textContent = P.map(function (p) { return p.name; }).join(', ');

  /* Panel de proyecto: se crea al abrir y se elimina al cerrar */
  function panel(p) {
    var next = P[(P.indexOf(p) + 1) % P.length], el = document.createElement('div');
    el.className = 'proj'; el.id = 'p-' + p.slug; el.setAttribute('style', st(p));
    el.innerHTML = '<div class="proj-in">' +
      '<div class="meta"><div><h2 class="ui">Cliente</h2><p>' + p.client + '</p></div>' +
      (p.tasks && p.tasks.length ? '<div><h2 class="ui">Trabajo realizado</h2><ul>' + p.tasks.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' : '') +
      (p.desc || p.link ? '<div><h2 class="ui">El proyecto</h2>' + (p.desc ? '<p>' + p.desc + '</p>' : '') + (p.link ? '<p><a class="link" href="' + p.link.url + '" target="_blank" rel="noopener">' + p.link.label + '</a></p>' : '') + '</div>' : '') + '</div>' +
      shots(p) +
      '<div class="proj-foot"><button class="ui link" type="button" data-close>Cerrar proyecto</button><button class="ui link" type="button" data-next="' + next.slug + '">Siguiente: ' + next.name + '</button></div></div>';
    return el;
  }
  var cur = null;   // proyecto abierto: { slug, trigger, el }
  function mark(tr, on) {
    tr.setAttribute('aria-expanded', on);
    tr.querySelector('.ar').textContent = on ? '↑' : '↗';
  }
  function destroy(el) {
    el.querySelectorAll('.morph').forEach(function (f) { if (f._stop) f._stop(); });
    el.remove();
  }
  function closeCur(instant) {
    if (!cur) return;
    var c = cur; cur = null; mark(c.trigger, false);
    if (instant || calm) { destroy(c.el); return; }
    var done = false;
    function fin() { if (!done) { done = true; destroy(c.el); } }
    c.el.addEventListener('transitionend', function (e) { if (e.target === c.el) fin(); });
    setTimeout(fin, 900);
    c.el.classList.remove('open');
  }
  function open(slug) {
    var p = bySlug(slug); if (!p || !L) return;
    if (cur && cur.slug === slug) { close(false); return; }
    closeCur(true);                          // el anterior se quita al instante para que las posiciones no se muevan
    var tr = L.querySelector('[data-slug="' + slug + '"]'); if (!tr) return;
    var el = panel(p);
    tr.parentNode.appendChild(el);
    mark(tr, true);
    cur = { slug: slug, trigger: tr, el: el };
    initMorph(el); watch();
    void el.offsetHeight; el.classList.add('open');
    go(tr);
    setHash('#' + slug);
  }
  function close(back) {
    if (!cur) return;
    var tr = cur.trigger;
    closeCur(false); setHash('');
    if (back) go(tr);
  }

  /* "Más sobre mí" */
  var A = $('#about'), AL = $('[data-about]');
  function about(on) {
    var o = on === undefined ? !A.classList.contains('open') : on;
    A.classList.toggle('open', o);
    AL.textContent = o ? 'Menos sobre mí' : 'Más sobre mí'; AL.setAttribute('aria-expanded', o);
    if (o) { go($('#sobre-mi')); setHash('#sobre-mi'); } else if (location.hash === '#sobre-mi') setHash('');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('a,button'); if (!t) return;
    if (t.matches('[data-slug]')) { e.preventDefault(); open(t.dataset.slug); return; }
    if (t.hasAttribute('data-close')) { close(true); return; }
    if (t.dataset.next) { open(t.dataset.next); return; }
    var href = t.tagName === 'A' && t.getAttribute('href');
    if (!href || href.charAt(0) !== '#' || href.length < 2) return;
    var id = href.slice(1);
    e.preventDefault();
    if (id === 'inicio') { window.scrollTo({ top: 0, behavior: SMOOTH }); setHash(''); return; }
    if (id === 'sobre-mi') { about(t.hasAttribute('data-about') ? undefined : true); return; }
    var el = document.getElementById(id);
    if (el) { go(el); setHash('#' + id); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) close(true); });

  /* Enlaces directos: tuweb/#aceites-el-nino abre ese proyecto */
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (bySlug(id)) open(id); else if (id === 'sobre-mi') about(true);
  }
  window.addEventListener('hashchange', fromHash);
  if (document.readyState === 'complete') fromHash(); else window.addEventListener('load', fromHash);
  watch();
})();
