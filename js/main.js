/* Screens and flow: splash -> menu -> call -> mission -> results. */
(function () {
  const S = G.stk, say = G.say, ICON = G.ICON;
  const M = window.MISSIONS;
  let inMission = false;

  const levelOf = (m) => Math.min(3, ((G.save.missions[m.id] || {}).wins || 0) + 1);
  const unlocked = (i) => i === 0 || !!(G.save.missions[M[i - 1].id] || {}).wins;
  const muteBtn = () => `<button class="iconbtn" id="mute" aria-label="${SOUND.isMuted() ? 'شغّل الصوت' : 'اكتم الصوت'}">${SOUND.isMuted() ? ICON.muted : ICON.sound}</button>`;
  function bindMute() {
    const b = G.$('#mute'); if (!b) return;
    b.addEventListener('click', () => { SOUND.init(); SOUND.setMuted(!SOUND.isMuted()); G.save.muted = SOUND.isMuted(); G.persist(); b.innerHTML = SOUND.isMuted() ? ICON.muted : ICON.sound; b.setAttribute('aria-label', SOUND.isMuted() ? 'شغّل الصوت' : 'اكتم الصوت'); });
  }

  /* ---------------- splash ---------------- */
  function splash() {
    G.newCtx();
    G.show(`<div class="screen pad" style="align-items:center;justify-content:center;gap:22px;text-align:center">
      <div class="logo"><b>جوجو بتنادي…</b><b>محمد بيجري!</b><span>لعبة معمولة مخصوص عشانك يا قطه</span></div>
      <img class="stk pop" alt="جوجو ومحمد" src="${S('couple/call_salute')}" style="width:62%;max-height:46%;object-fit:contain">
      <button class="btn big" id="start">دوسي عشان نبدأ</button>
      <div style="font-weight:700;color:var(--ink-soft);font-size:15px">شغّلي الصوت لو سمحتي</div></div>`, 'menu');
    G.$('#start').addEventListener('click', async () => {
      SOUND.init(); SOUND.play('pop');
      G.manifest().voice.forEach(v => SOUND.load('assets/' + v.file));
      menu();
    }, { once: true });
  }

  /* ---------------- menu ---------------- */
  function menu() {
    inMission = false; SOUND.stopVoice();
    const c = G.newCtx();
    SOUND.startMusic('menu');
    const cards = M.map((m, i) => {
      const r = G.save.missions[m.id] || {}, open = unlocked(i);
      const stars = r.best ? '★'.repeat(r.best) + '☆'.repeat(3 - r.best) : '☆☆☆';
      return `<button class="mcard${open ? '' : ' locked'}" data-i="${i}" ${open ? '' : 'aria-disabled="true"'} aria-label="${m.name}${open ? '' : '، مقفولة'}">
        ${open ? '' : ICON.lock}<img alt="" src="${S(m.thumb)}"><span>${m.name}</span><span class="stars" aria-hidden="true">${stars}</span></button>`;
    }).join('');
    G.show(`<div class="screen pad" style="gap:10px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <button class="iconbtn" id="gal" aria-label="لحظاتنا"><img alt="" src="${G.item('heart')}" style="width:30px"></button>
        <div class="pill" aria-label="نقط الحب">♥ ${G.save.score}</div>
        <div style="display:flex;gap:8px">${muteBtn()}<button class="iconbtn" id="set" aria-label="الإعدادات">${ICON.gear}</button></div>
      </div>
      <div class="logo" style="margin-top:2px"><b style="font-size:36px">جوجو بتنادي…</b><b style="font-size:36px">محمد بيجري!</b></div>
      <div style="flex:1;min-height:0;display:grid;place-items:center"><img class="stk squash" alt="جوجو ومحمد" src="${S('couple/call_salute')}" style="height:100%;max-height:250px;max-width:70%;object-fit:contain"></div>
      ${G.heartRow(G.save.hearts)}
      <div class="missions">${cards}</div>
      <button class="btn big" id="play">يلا نلعب</button>
    </div>`, 'menu');
    bindMute();
    G.$('#gal').addEventListener('click', () => { SOUND.play('tap'); gallery(); });
    G.$('#set').addEventListener('click', () => { SOUND.play('tap'); settings(); });
    G.$('#play').addEventListener('click', () => {
      SOUND.play('tap');
      const next = M.findIndex((m, i) => unlocked(i) && !(G.save.missions[m.id] || {}).wins);
      const pool = M.filter((m, i) => unlocked(i));
      call(next >= 0 ? M[next] : G.pick(pool));
    });
    G.$('.missions').addEventListener('click', (e) => {
      const b = e.target.closest('.mcard'); if (!b) return;
      const i = +b.dataset.i;
      if (!unlocked(i)) { SOUND.play('wrong'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); G.floatText('خلّصي اللي قبلها الأول!', G.stage.clientWidth / 2, G.rel(b).y - 40, true); return; }
      SOUND.play('tap'); call(M[i]);
    });
    // She calls on her own if you sit on the menu
    c.after(CONFIG.idleCallSeconds * 1000, () => call(G.pick(M.filter((m, i) => unlocked(i)))));
  }

  /* ---------------- incoming call ---------------- */
  function call(m) {
    const c = G.newCtx();
    SOUND.stopMusic();
    G.save.calls++; G.persist();
    const data = m.setup(levelOf(m));
    G.show(`<div class="screen call">
      <div class="who">قطتي 🐱<small>بتتصل بيك…</small></div>
      <div class="ringwrap"><img alt="جوجو بتتصل" src="${S('jojo/face_calling')}"></div>
      <div id="note" style="min-height:52px;text-align:center;font-weight:800;font-size:18px;padding:0 20px"></div>
      <div class="callbtns">
        <div><button class="cbtn no" id="no" aria-label="رفض">${ICON.phoneDown}</button><small>رفض</small></div>
        <div><button class="cbtn yes" id="yes" aria-label="رد">${ICON.phoneUp}</button><small>رد</small></div>
      </div></div>`);
    const clips = G.voiceFor('call');
    let answered = false;
    const ringLoop = () => {
      if (answered) return;
      if (clips.length) {
        SOUND.play('ring');
        c.after(700, () => { if (answered) return; const d = SOUND.playVoice(G.pick(clips)); c.after(Math.max(1200, d * 1000 + 900), ringLoop); });
      } else { SOUND.play('ring'); c.after(1600, ringLoop); }
    };
    ringLoop();
    let declines = 0;
    G.$('#no').addEventListener('click', () => {
      declines++; SOUND.play('wrong');
      const lines = [['', 'مينفعش ترفض القطه!'], ['', 'بتتصل تاني…'], ['', 'رد. حالاً.']];
      const l = lines[Math.min(declines - 1, 2)];
      G.$('#note').innerHTML = say(l[0], l[1]);
      const img = G.$('.ringwrap img'); img.src = S('jojo/face_angry');
    });
    G.$('#yes').addEventListener('click', () => {
      if (answered) return; answered = true; SOUND.stopVoice(); SOUND.play('pop');
      react(m, data);
    });
  }

  function react(m, data) {
    const c = G.newCtx();
    G.show(`<div class="screen pad" style="align-items:center;justify-content:center;gap:16px">
      <img class="stk pop" alt="" src="${S(G.pick(['mohamed/face_answer_call', 'mohamed/face_panic']))}" style="width:76%">
      <div class="bubble pop" style="font-size:26px;animation-delay:.2s">${say('', 'جاي حالاً يا قطه!')}</div></div>`, 'menu');
    SOUND.play('whoosh');
    c.after(1500, () => intro(m, data));
  }

  /* ---------------- mission intro ---------------- */
  function intro(m, data) {
    const c = G.newCtx();
    const r = m.request(data), L = levelOf(m);
    G.show(`<div class="screen pad" style="align-items:center;justify-content:center;gap:14px;text-align:center">
      <div style="font-weight:800;font-size:16px;color:var(--ink-soft)">مهمة · مستوى ${L} من 3</div>
      <div style="font-size:30px;font-weight:800;line-height:1">${G.esc(m.name)}</div>
      <div class="bubble tail pop" style="max-width:92%">${r.html}</div>
      <img class="stk pop wobble" alt="جوجو" src="${S(r.sticker)}" style="width:66%;max-height:40%;object-fit:contain">
      <button class="btn big go" id="go">يلا!</button></div>`, 'menu');
    G.$('#go').addEventListener('click', () => { SOUND.play('tap'); runMission(m, data); });
  }

  /* ---------------- running a mission ---------------- */
  function runMission(m, data) {
    inMission = true;
    const c = G.newCtx();
    SOUND.startMusic('mission');
    G.show('', 'menu');
    const api = {
      level: levelOf(m), data,
      hud(title) {
        const h = G.el(`<div class="hud"><button class="iconbtn" id="pause" aria-label="استراحة">${ICON.pause}</button><div class="title">${G.esc(title)}</div><div class="pill" role="timer">--</div></div>`);
        G.stage.appendChild(h);
        G.$('#pause').addEventListener('click', () => pause(m, data));
        return { pill: G.$('.pill', h) };
      },
      win(flags) { if (c.dead) return; inMission = false; results(m, Object.assign({ perfect: c.perfect }, flags)); },
      fail(en, ar) { if (c.dead) return; inMission = false; failed(m, data, en, ar); }
    };
    m.run(c, api);
  }

  function pause(m, data) {
    const c = G.ctx(); if (!c || c.paused) return;
    c.paused = true; SOUND.stopMusic(); SOUND.play('tap');
    const o = G.el(`<div class="overlay" role="dialog" aria-label="استراحة"><div class="card">
      <h2>استراحة</h2>
      <button class="btn big go" id="res">كمّل</button>
      <button class="btn" id="rst">ابدأ المهمة من الأول</button>
      <button class="btn" id="quit">ارجع للقائمة</button></div></div>`);
    G.stage.appendChild(o);
    G.$('#res', o).addEventListener('click', () => { o.remove(); c.paused = false; SOUND.startMusic('mission'); });
    G.$('#rst', o).addEventListener('click', () => { o.remove(); runMission(m, m.setup(levelOf(m))); });
    G.$('#quit', o).addEventListener('click', () => { o.remove(); menu(); });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && inMission) { const c = G.ctx(); if (c && !c.paused) { const m = M.find(x => G.$('.hud .title') && G.$('.hud .title').textContent === x.name); if (m) pause(m, null); } }
  });

  /* ---------------- results ---------------- */
  function results(m, f) {
    const c = G.newCtx();
    SOUND.stopMusic();
    const P = CONFIG.points;
    const pts = P.complete + (f.fast ? P.fast : 0) + (f.thoughtful ? P.thoughtful : 0) + (f.perfect ? P.perfect : 0);
    const stars = 1 + (f.fast ? 1 : 0) + (f.perfect ? 1 : 0);
    const before = G.save.hearts;
    const r = G.save.missions[m.id] || { wins: 0, best: 0 };
    r.wins++; r.best = Math.max(r.best, stars); G.save.missions[m.id] = r;
    G.save.score += pts;
    G.save.hearts = Math.min(CONFIG.heartsMax, G.save.hearts + 1 + (f.perfect ? 1 : 0));
    const newUnlock = !G.save.gallery.includes(m.id);
    if (newUnlock) G.save.gallery.push(m.id);
    const fullNow = G.save.hearts >= CONFIG.heartsMax && !G.save.gallery.includes('full');
    if (fullNow) G.save.gallery.push('full');
    G.persist();
    const row = (on, label, ar, v) => `<div class="${on ? '' : 'off'}"><span>${ar}</span><span>${on ? '+' + v : '—'}</span></div>`;
    G.show(`<div class="screen pad" style="align-items:center;gap:10px;justify-content:center">
      <div style="font-size:34px;font-weight:800;line-height:1;text-align:center;color:var(--rose);-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill">المهمة تمت!<span style="display:block;font-size:22px;color:var(--ink);-webkit-text-stroke:0">${G.esc(m.name)}</span></div>
      <div style="font-size:30px;color:var(--gold);-webkit-text-stroke:1.5px var(--ink);letter-spacing:4px" aria-label="${stars} من 3 نجوم">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <img class="stk pop" id="kiss" alt="جوجو بتبوس محمد" src="${S('couple/kiss')}" style="width:52%;max-height:30%;object-fit:contain">
      <div class="card" style="width:100%">
        <div class="rows">
          ${row(true, '', 'المهمة اتعملت', P.complete)}
          ${row(f.fast, '', 'بسرعة', P.fast)}
          ${row(f.thoughtful, '', 'فاهمها', P.thoughtful)}
          ${row(f.perfect, '', 'من غير ولا غلطة', P.perfect)}
          <div class="tot"><span>نقط الحب</span><span id="tot">+0</span></div>
          <div style="justify-content:center;font-size:17px">مجموع الحب ♥ <span id="score">${G.save.score - pts}</span></div>
        </div>
      </div>
      <div id="meter">${G.heartRow(before)}</div>
      ${newUnlock ? `<div class="bubble pop" style="font-size:16px;padding:6px 14px">جديد في لحظاتنا: ${G.esc(m.reward.ar)}</div>` : ''}
      ${fullNow ? `<div class="bubble pop" style="font-size:16px;padding:6px 14px;background:var(--rose);color:#fff">عداد الحب اتملى! لحظة مميزة اتفتحت</div>` : ''}
      <button class="btn big go" id="cont">كمّل</button></div>`, 'menu');
    SOUND.play('win');
    c.after(500, () => { SOUND.play('kiss'); const k = G.rel(G.$('#kiss')); G.hearts(12, k.x, k.y); });
    let shown = 0; const base = G.save.score - pts;
    const f2 = c.loop((dt) => { shown = Math.min(pts, shown + pts * dt * 1.4); G.$('#tot').textContent = '+' + Math.round(shown); G.$('#score').textContent = base + Math.round(shown); if (shown >= pts) c.unloop(f2); });
    c.after(1300, () => { G.$('#meter').innerHTML = G.heartRow(G.save.hearts); SOUND.play('sparkle'); });
    G.$('#cont').addEventListener('click', () => { SOUND.play('tap'); menu(); });
  }

  function failed(m, data, en, ar) {
    G.newCtx();
    SOUND.stopMusic(); SOUND.play('fail');
    G.show(`<div class="screen pad" style="align-items:center;justify-content:center;gap:14px;text-align:center">
      <div style="font-size:34px;font-weight:800;line-height:1">يا خبر!</div>
      <div class="bubble tail pop">${say(en, ar)}</div>
      <img class="stk pop" alt="محمد بيعيط" src="${S('mohamed/face_crying')}" style="width:62%">
      <div style="font-weight:700;color:var(--ink-soft)">نقطك محفوظة. جرّب تاني!</div>
      <button class="btn big go" id="retry">تاني</button>
      <button class="btn" id="home">ارجع للقائمة</button></div>`, 'menu');
    G.$('#retry').addEventListener('click', () => { SOUND.play('tap'); runMission(m, m.setup(levelOf(m))); });
    G.$('#home').addEventListener('click', () => { SOUND.play('tap'); menu(); });
  }

  /* ---------------- gallery ---------------- */
  function gallery() {
    G.newCtx();
    const items = M.map(m => ({ id: m.id, img: m.reward.img, en: m.reward.en, ar: m.reward.ar }))
      .concat([{ id: 'full', img: 'couple/call_salute', en: '', ar: 'عداد الحب اتملى' }]);
    G.show(`<div class="screen pad" style="gap:12px">
      <div style="display:flex;align-items:center;gap:12px"><button class="iconbtn" id="back" aria-label="رجوع">${ICON.back}</button>
      <div style="font-size:28px;font-weight:800">لحظاتنا</div></div>
      <div class="gallery">${items.map(it => { const has = G.save.gallery.includes(it.id); return `<div class="gitem${has ? '' : ' locked'}"><img alt="${has ? G.esc(it.ar) : 'مقفولة'}" src="${S(it.img)}">${has ? G.esc(it.ar) : 'لسه مقفولة'}</div>`; }).join('')}</div></div>`, 'menu');
    G.$('#back').addEventListener('click', () => { SOUND.play('tap'); menu(); });
  }

  /* ---------------- settings ---------------- */
  function settings() {
    const v = SOUND.getVol();
    const o = G.el(`<div class="overlay" role="dialog" aria-label="الإعدادات"><div class="card">
      <h2>الإعدادات</h2>
      <label class="slider" for="v-voice">صوت جوجو<input id="v-voice" type="range" min="0" max="1" step="0.05" value="${v.voice}"></label>
      <label class="slider" for="v-music">المزيكا<input id="v-music" type="range" min="0" max="1" step="0.05" value="${v.music}"></label>
      <label class="slider" for="v-sfx">المؤثرات الصوتية<input id="v-sfx" type="range" min="0" max="1" step="0.05" value="${v.sfx}"></label>
      <button class="btn small" id="reset">امسح التقدم</button>
      <button class="btn big go" id="done">تمام</button>
      <div style="font-size:12px;color:var(--ink-soft)">المزيكا والمؤثرات معمولة مخصوص للعبة دي.</div></div></div>`);
    G.stage.appendChild(o);
    ['voice', 'music', 'sfx'].forEach(k => G.$('#v-' + k, o).addEventListener('input', (e) => { SOUND.setVol(k, +e.target.value); G.save.vol[k] = +e.target.value; G.persist(); if (k === 'sfx') SOUND.play('coin'); }));
    let armed = false;
    G.$('#reset', o).addEventListener('click', (e) => {
      if (!armed) { armed = true; e.target.textContent = 'دوسي تاني عشان تمسحي كل حاجة'; e.target.style.background = 'var(--rose)'; e.target.style.color = '#fff'; return; }
      G.reset(); o.remove(); menu();
    });
    G.$('#done', o).addEventListener('click', () => { o.remove(); menu(); });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    G.load();
    try { const r = await fetch('assets/manifest.json', { cache: 'no-cache' }); G.setManifest(await r.json()); } catch (e) { G.show('<div class="screen pad" style="justify-content:center;text-align:center;font-size:20px;font-weight:800">مقدرناش نحمّل ملفات اللعبة. اتأكدي من النت وافتحيها تاني.</div>'); return; }
    Object.entries(G.save.vol).forEach(([k, val]) => SOUND.setVol(k, val));
    SOUND.setMuted(!!G.save.muted);
    // warm the image cache so stickers appear instantly
    const m = G.manifest();
    Object.values(m.characters).forEach(group => Object.values(group).forEach(p => { const i = new Image(); i.src = 'assets/' + p; }));
    splash();
  }
  boot();
  window.__game = { menu, call, results, M };
})();
