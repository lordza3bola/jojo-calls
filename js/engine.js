/* Shared helpers: asset lookup, saving, a pause-aware clock, and little effects. */
(function () {
  const stage = document.getElementById('stage');
  let manifest = { characters: {}, voice: [], overrides: { items: {}, backgrounds: {} } };

  const G = window.G = {
    stage,
    setManifest(m) { manifest = m; },
    manifest: () => manifest,
    // sticker path, e.g. G.stk('jojo/face_hungry')
    stk(k) { const [who, name] = k.split('/'); const p = (manifest.characters[who] || {})[name]; return p ? 'assets/' + p : ''; },
    item(k) { const o = manifest.overrides && manifest.overrides.items[k]; return o ? 'assets/' + o : ART.item(k); },
    bg(k) { const o = manifest.overrides && manifest.overrides.backgrounds[k]; return o ? 'assets/' + o : ART.bg(k); },
    voiceFor(event) { return manifest.voice.filter(v => v.events.includes(event)).map(v => 'assets/' + v.file); },
    pick: (a) => a[Math.floor(Math.random() * a.length)],
    shuffle: (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    esc: (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  };

  /* ---------- screens ---------- */
  G.show = function (html, bgKey) {
    stage.style.backgroundImage = bgKey ? `url("${G.bg(bgKey)}")` : '';
    stage.innerHTML = html;
    return stage;
  };
  G.$ = (sel, root) => (root || stage).querySelector(sel);
  G.$$ = (sel, root) => Array.from((root || stage).querySelectorAll(sel));
  G.el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* ---------- save (on her phone only) ---------- */
  const KEY = 'jojo-calls-save-v1';
  const fresh = () => ({ score: 0, hearts: 0, missions: {}, gallery: [], vol: { music: 0.5, sfx: 0.8, voice: 1 }, muted: false, calls: 0 });
  G.save = fresh();
  G.load = function () { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) G.save = Object.assign(fresh(), s); } catch (e) {} };
  G.persist = function () { try { localStorage.setItem(KEY, JSON.stringify(G.save)); } catch (e) {} };
  G.reset = function () { const v = G.save.vol, m = G.save.muted; G.save = fresh(); G.save.vol = v; G.save.muted = m; G.persist(); };

  /* ---------- pause-aware clock ---------- */
  let cur = null, last = performance.now();
  G.newCtx = function () {
    if (cur) cur.dead = true;
    cur = { paused: false, dead: false, timers: [], loops: [], perfect: true, thoughtful: false, fast: false };
    cur.after = (ms, fn) => { const t = { left: ms, fn }; cur.timers.push(t); return t; };
    cur.cancel = (t) => { cur.timers = cur.timers.filter(x => x !== t); };
    cur.loop = (fn) => { cur.loops.push(fn); return fn; };
    cur.unloop = (fn) => { cur.loops = cur.loops.filter(x => x !== fn); };
    cur.wait = (ms) => new Promise(r => cur.after(ms, r));
    return cur;
  };
  G.ctx = () => cur;
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const c = cur;
    if (c && !c.paused && !c.dead) {
      const due = [];
      for (const t of c.timers) { t.left -= dt * 1000; if (t.left <= 0) due.push(t); }
      if (due.length) { c.timers = c.timers.filter(t => !due.includes(t)); due.forEach(t => { if (!c.dead) t.fn(); }); }
      for (const f of c.loops.slice()) { if (c.dead) break; f(dt); }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* countdown pill: calls onEnd at 0; returns { left, stop() } */
  G.countdown = function (c, seconds, pillEl, onEnd) {
    const cd = { left: seconds, total: seconds, stopped: false };
    const f = c.loop((dt) => {
      if (cd.stopped) return;
      cd.left = Math.max(0, cd.left - dt);
      if (pillEl) { pillEl.textContent = Math.ceil(cd.left) + 's'; pillEl.classList.toggle('warn', cd.left <= 5); }
      if (cd.left <= 0) { cd.stopped = true; c.unloop(f); onEnd(); }
    });
    cd.stop = () => { cd.stopped = true; c.unloop(f); };
    return cd;
  };

  /* ---------- effects ---------- */
  G.floatText = function (text, x, y, bad) {
    const e = G.el(`<div class="float${bad ? ' bad' : ''}">${G.esc(text)}</div>`);
    e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.transform = 'translateX(-50%)';
    stage.appendChild(e); setTimeout(() => e.remove(), 1000);
  };
  G.hearts = function (n, x, y) {
    for (let i = 0; i < n; i++) {
      const e = G.el(`<img class="fxheart" alt="" src="${G.item('heart')}">`);
      e.style.left = (x - 17 + (Math.random() * 40 - 20)) + 'px'; e.style.top = (y + Math.random() * 20) + 'px';
      e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); e.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
      e.style.animationDelay = (i * 0.07) + 's';
      stage.appendChild(e); setTimeout(() => e.remove(), 1600 + i * 70);
    }
  };
  G.rel = function (el) { const a = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height / 2, w: a.width, h: a.height }; };

  G.ICON = {
    pause: '<svg viewBox="0 0 24 24" fill="#2A1A1A"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="#2A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="#2A1A1A"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="none" stroke="#2A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="#2A1A1A"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="#2A1A1A" stroke-width="2.5"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="#2A1A1A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    phoneUp: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
    phoneDown: '<svg viewBox="0 0 24 24" fill="#fff"><path transform="rotate(135 12 12)" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
    lock: '<svg class="lock" viewBox="0 0 24 24" fill="#2A1A1A"><rect x="4" y="10" width="16" height="12" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#2A1A1A" stroke-width="3"/></svg>',
    heartFull: '<svg viewBox="0 0 24 24"><path d="M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7-10 13z" fill="#E2456B" stroke="#2A1A1A" stroke-width="2"/></svg>',
    heartEmpty: '<svg viewBox="0 0 24 24"><path d="M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7-10 13z" fill="#FFFFFF" stroke="#2A1A1A" stroke-width="2"/></svg>'
  };
  G.heartRow = (n) => `<div class="hearts" role="img" aria-label="Love Meter ${n} of ${CONFIG.heartsMax}">` + Array.from({ length: CONFIG.heartsMax }, (_, i) => i < n ? G.ICON.heartFull : G.ICON.heartEmpty).join('') + '</div>';
  G.say = (en, ar) => `${G.esc(en)}${ar ? `<span class="ar">${G.esc(ar)}</span>` : ''}`;
})();
