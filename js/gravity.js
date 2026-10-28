/* Portada: al hacer click en "Kike Barceló" las letras caen con gravedad,
   chocan entre sí y se pueden arrastrar con el ratón o el dedo.
   Caen solas a los 4 s de entrar (o al hacer click) y se pueden recolocar con el botón.
   Usa Matter.js (se carga en index.html). Si no carga, el título queda como está. */
(function () {
  var h1 = document.querySelector('.hero h1');
  if (!h1) return;
  var hero = h1.closest('.hero'), intro = hero.querySelector('.intro');
  var lines = [].slice.call(h1.children);

  /* Divide cada línea en letras (<i class="ch"> para no heredar los estilos de "span") */
  h1.setAttribute('aria-label', lines.map(function (l) { return l.textContent; }).join(' '));
  lines.forEach(function (line) {
    var txt = line.textContent;
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = txt.split('').map(function (c) { return '<i class="ch">' + c + '</i>'; }).join('');
  });

  var M = window.Matter, armed = false, fallen = false, touched = false;
  var engine, items = [], drags = {}, raf = 0, last = 0, acc = 0, running = false, resetBtn;
  var STEP = 1000 / 60;

  // Esperamos a que termine la animación de entrada del título
  setTimeout(function () { armed = true; if (M) h1.classList.add('can-fall'); }, 1500);
  h1.addEventListener('click', function () { if (armed && !fallen && M) fall(); });
  // A los 4 s de entrar, las letras caen solas (una sola vez; si ya cayeron o se recolocaron, no se repite)
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  setTimeout(function () { if (M && !touched && !fallen && !calm) fall(); }, 4000);

  function fall() {
    fallen = true; touched = true;
    h1.classList.remove('can-fall'); h1.classList.add('fallen');
    var sx = window.scrollX, sy = window.scrollY;
    var cs = getComputedStyle(h1), size = parseFloat(cs.fontSize);
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.font = cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily;

    engine = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    engine.gravity.y = 2;
    items = [];

    lines.forEach(function (line) {
      // La línea base de cada renglón, para ajustar la caja de colisión a la letra
      var probe = document.createElement('i');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      line.appendChild(probe);
      var base = probe.getBoundingClientRect().bottom + sy;
      line.removeChild(probe);

      [].forEach.call(line.querySelectorAll('.ch'), function (el) {
        var r = el.getBoundingClientRect(), m = ctx.measureText(el.textContent);
        var asc = m.actualBoundingBoxAscent || size * 0.72;
        var desc = Math.max(0, m.actualBoundingBoxDescent || 0);
        var w = Math.max(8, r.width * 0.94), h = asc + desc;
        var cx = r.left + sx + r.width / 2, cy = base - asc + h / 2;
        var b = M.Bodies.rectangle(cx, cy, w, h, {
          chamfer: { radius: Math.min(w, h) * 0.12 },
          restitution: 0.2, friction: 0.5, frictionStatic: 0.8, frictionAir: 0.012, sleepThreshold: 40
        });
        M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 2, y: 0 });
        M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.04);
        el.style.transformOrigin = (cx - (r.left + sx)) + 'px ' + (cy - (r.top + sy)) + 'px';
        el.style.willChange = 'transform';
        el.dataset.i = items.length;
        items.push({ el: el, b: b, cx: cx, cy: cy });
      });
    });

    // Suelo = parte baja de la portada (o del viewport si la portada se sale de pantalla)
    var W = document.documentElement.clientWidth, T = 600;
    var lowest = Math.max.apply(null, items.map(function (i) { return i.b.bounds.max.y; }));
    var heroBottom = hero.getBoundingClientRect().bottom + sy;
    var floor = Math.max(Math.min(heroBottom - 6, sy + window.innerHeight - 6), lowest + 24);
    var S = { isStatic: true, friction: 0.6 };
    M.Composite.add(engine.world, items.map(function (i) { return i.b; }).concat([
      M.Bodies.rectangle(W / 2, floor + T / 2, W + 2 * T, T, S),
      M.Bodies.rectangle(-T / 2, floor - 1500, T, 3000 + floor, S),
      M.Bodies.rectangle(W + T / 2, floor - 1500, T, 3000 + floor, S),
      M.Bodies.rectangle(W / 2, -T / 2, W + 2 * T, T, S)
    ]));

    if (!resetBtn) {
      resetBtn = document.createElement('button');
      resetBtn.type = 'button'; resetBtn.className = 'ui reset-letters';
      resetBtn.textContent = '↺ Recolocar letras';
      resetBtn.onclick = function () { reset(); };
      intro.appendChild(resetBtn);
    }
    resetBtn.hidden = false;
    run();
  }

  function run() {
    if (running || !fallen) return;
    running = true; last = 0; raf = requestAnimationFrame(frame);
  }

  function frame(t) {
    acc += last ? Math.min(t - last, 50) : STEP; last = t;
    var n = 0;
    while (acc >= STEP && n++ < 3) {
      Object.keys(drags).forEach(function (k) { M.Sleeping.set(drags[k].it.b, false); });
      M.Engine.update(engine, STEP);
      acc -= STEP;
      items.forEach(function (it) {          // evita que atraviesen el suelo a mucha velocidad
        var v = it.b.velocity, s = Math.hypot(v.x, v.y);
        if (s > 50) M.Body.setVelocity(it.b, { x: v.x * 50 / s, y: v.y * 50 / s });
      });
    }
    if (acc > STEP) acc = 0;
    items.forEach(function (it) {
      it.el.style.transform = 'translate(' + (it.b.position.x - it.cx) + 'px,' + (it.b.position.y - it.cy) + 'px) rotate(' + it.b.angle + 'rad)';
    });
    var idle = !Object.keys(drags).length && items.every(function (it) { return it.b.isSleeping; });
    if (idle) { running = false; return; }   // todo en reposo: paramos para no gastar CPU
    raf = requestAnimationFrame(frame);
  }

  /* Arrastrar con ratón o dedo: un muelle entre el puntero y la letra */
  h1.addEventListener('pointerdown', function (e) {
    if (!fallen || e.button) return;
    var el = e.target.closest && e.target.closest('.ch');
    if (!el || el.dataset.i === undefined) return;
    e.preventDefault();
    var it = items[+el.dataset.i], b = it.b;
    var px = e.clientX + window.scrollX, py = e.clientY + window.scrollY;
    var dx = px - b.position.x, dy = py - b.position.y, c = Math.cos(b.angle), s = Math.sin(b.angle);
    M.Sleeping.set(b, false);
    var con = M.Constraint.create({
      pointA: { x: px, y: py }, bodyB: b,
      pointB: { x: dx * c + dy * s, y: -dx * s + dy * c },
      stiffness: 0.2, damping: 0.1, length: 0
    });
    M.Composite.add(engine.world, con);
    drags[e.pointerId] = { con: con, it: it };
    h1.classList.add('drag');
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    run();
  });
  window.addEventListener('pointermove', function (e) {
    var d = drags[e.pointerId];
    if (!d) return;
    d.con.pointA.x = e.clientX + window.scrollX;
    d.con.pointA.y = e.clientY + window.scrollY;
  });
  function drop(e) {
    var d = drags[e.pointerId];
    if (!d) return;
    M.Composite.remove(engine.world, d.con);
    delete drags[e.pointerId];
    if (!Object.keys(drags).length) h1.classList.remove('drag');
    run();
  }
  window.addEventListener('pointerup', drop);
  window.addEventListener('pointercancel', drop);

  /* Volver al estado inicial (también si cambia el ancho de la ventana) */
  function reset() {
    if (!fallen) return;
    fallen = false; running = false; cancelAnimationFrame(raf); drags = {};
    M.Composite.clear(engine.world, false); M.Engine.clear(engine);
    h1.classList.remove('fallen', 'drag'); h1.classList.add('can-fall');
    items.forEach(function (it) {
      it.el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      it.el.style.transform = '';
    });
    var old = items; items = [];
    setTimeout(function () {
      old.forEach(function (it) { it.el.style.transition = it.el.style.willChange = it.el.style.transformOrigin = ''; });
    }, 650);
    if (resetBtn) resetBtn.hidden = true;
  }
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (fallen && window.innerWidth !== lastW) reset();
    lastW = window.innerWidth;
  });
})();
