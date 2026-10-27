/* Render de listas, filtros, páginas de proyecto y transiciones */
(function () {
  var P = window.PROJECTS || [], B = window.SITE_BASE;
  var $ = function (s) { return document.querySelector(s); };
  var url = function (p) { return B + 'proyectos/' + p.slug + '.html'; };
  var st = function (p) { return '--c:' + p.color + ';--t:' + p.ink; };
  function media(p, n, cls) {
    return '<div class="media reveal ' + (cls || '') + '" style="' + st(p) + '"><span class="ph">' + p.name + '</span><img src="' + B + 'img/proyectos/' + p.slug + '/' + n + '.jpg" alt="' + p.name + '" loading="lazy" onerror="this.remove()"></div>';
  }
  function morph(p, it) {
    var d = B + 'img/proyectos/' + p.slug + '/';
    return '<figure class="shot morph half reveal"><button class="stack" type="button" aria-label="Cambiar entre las dos imágenes"><img src="' + d + it.morph[0] + '.jpg" alt="' + p.name + ', círculos sobre las articulaciones"><img src="' + d + it.morph[1] + '.jpg" alt="' + p.name + ', círculos unidos con degradados" aria-hidden="true"></button><figcaption data-caps=\'' + JSON.stringify(it.caps || []).replace(/'/g, '&#39;') + '\'>' + (it.caps ? it.caps[0] : '') + '</figcaption></figure>';
  }
  function initMorph() {
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    document.querySelectorAll('.morph').forEach(function (f) {
      var cap = f.querySelector('figcaption'), caps = JSON.parse(cap.getAttribute('data-caps') || '[]'), t = null;
      function set(on) { f.classList.toggle('on', on); if (caps.length) cap.textContent = caps[on ? 1 : 0]; }
      function start() { if (!calm && !t) t = setInterval(function () { set(!f.classList.contains('on')); }, 4200); }
      function stop() { clearInterval(t); t = null; }
      f.querySelector('.stack').onclick = function () { stop(); set(!f.classList.contains('on')); start(); };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: .4 }).observe(f); else start();
    });
  }
  function shots(p) {
    var g = p.gallery || ['1', '2', '3'];
    return '<section class="wrap gallery">' + g.map(function (it) {
      var o = typeof it === 'object', f = o ? it.f : it;
      if (o && it.morph) return morph(p, it);
      return '<figure class="shot reveal' + (o && it.m ? ' mult' : '') + (o && it.h ? ' half' : '') + '" style="' + st(p) + '"><span class="ph">' + p.name + '</span><img src="' + B + 'img/proyectos/' + p.slug + '/' + f + '.jpg" alt="' + p.name + '" loading="lazy" onload="this.parentNode.classList.toggle(\'wide\',this.naturalWidth>this.naturalHeight&&!this.parentNode.classList.contains(\'half\'))" onerror="this.parentNode.classList.add(\'empty\');this.remove()"></figure>';
    }).join('') + '</section>';
  }
  function card(p, i) {
    return '<a class="card c' + (i % 4) + '" href="' + url(p) + '">' + media(p, 'cover') + '<div class="cap"><b>' + p.name + '</b><span>' + p.tags.join(', ') + '</span></div></a>';
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  function watch() { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); }); }

  var L = $('#work-list');
  if (L) L.innerHTML = P.map(function (p) {
    return '<a class="row" href="' + url(p) + '" style="' + st(p) + '"><span class="nm display">' + p.name + '</span><span class="tg ui">' + p.tags.join(', ') + '</span><span class="ar">↗</span></a>';
  }).join('');
  var S = $('#strip');
  if (S) S.innerHTML = P.filter(function (p) { return p.feat; }).map(card).join('');

  var G = $('#grid'), F = $('#filters');
  if (G) {
    var tags = ['Todos'].concat(P.reduce(function (a, p) { p.tags.forEach(function (t) { if (a.indexOf(t) < 0) a.push(t); }); return a; }, []));
    F.innerHTML = tags.map(function (t, i) { return '<button' + (i ? '' : ' class="on"') + '>' + t + '</button>'; }).join('');
    var draw = function (f) {
      G.innerHTML = P.filter(function (p) { return f === 'Todos' || p.tags.indexOf(f) > -1; }).map(card).join('');
      watch();
    };
    F.onclick = function (e) {
      if (e.target.tagName !== 'BUTTON') return;
      F.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
      e.target.classList.add('on'); draw(e.target.textContent);
    };
    draw('Todos');
  }

  var C = $('#clients');
  if (C) C.textContent = P.map(function (p) { return p.name; }).join(', ');

  var M = $('#project');
  if (M) {
    var i = P.findIndex(function (p) { return p.slug === M.dataset.slug; }), p = P[i], n = P[(i + 1) % P.length];
    M.innerHTML = '<section class="ph-hero" style="' + st(p) + '"><div class="wrap"><h1 class="display">' + p.name + '</h1></div></section>' +
      '<section class="wrap meta"><div><h2 class="ui">Cliente</h2><p>' + p.client + '</p></div><div><h2 class="ui">Trabajo realizado</h2><ul>' + p.tasks.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div><div><h2 class="ui">El proyecto</h2><p>' + p.desc + '</p>' + (p.link ? '<p><a class="link" href="' + p.link.url + '" target="_blank" rel="noopener">' + p.link.label + '</a></p>' : '') + '</div></section>' +
      shots(p) +
      '<a class="next" href="' + url(n) + '" style="' + st(n) + '"><span class="ui">Siguiente proyecto</span><span class="display">' + n.name + '</span></a>';
  }
  initMorph();
  watch();

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target || a.href.indexOf(B) !== 0 || a.getAttribute('href').charAt(0) === '#') return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 280);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
})();
