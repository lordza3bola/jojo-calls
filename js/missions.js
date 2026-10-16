/* The six missions. Each one gets:
   c   - the pause-aware clock (c.after, c.loop, c.perfect, ...)
   api - { hud(title), win(flags), fail(en, ar), level, data }
   To add a mission: push another object with the same shape. */
(function () {
  const S = (k) => G.stk(k), I = (k) => G.item(k);
  const say = G.say;

  // a bottom panel used by several missions
  function panel(html) {
    const old = G.$('.sheet'); if (old) old.remove();
    const p = G.el(`<div class="sheet pad" style="position:absolute;left:0;right:0;bottom:0;z-index:15;display:flex;flex-direction:column;gap:10px;padding-bottom:22px">${html}</div>`);
    G.stage.appendChild(p); return p;
  }
  function bubble(html, style) {
    const old = G.$('.scene-bubble'); if (old) old.remove();
    const b = G.el(`<div class="bubble tail scene-bubble pop" style="position:absolute;z-index:12;${style || 'left:6%;right:6%;top:70px'}">${html}</div>`);
    G.stage.appendChild(b); return b;
  }
  function sticker(src, style, cls) {
    const e = G.el(`<img class="stk ${cls || 'pop'}" alt="" src="${src}" style="position:absolute;${style}">`);
    G.stage.appendChild(e); return e;
  }
  function burst(el, n) { const r = G.rel(el); G.hearts(n || 8, r.x, r.y); }
  function tapItems(c, keys, spots, onTap) {
    const out = [];
    keys.forEach((k, i) => {
      const [l, t] = spots[i];
      const b = G.el(`<button class="tapitem" aria-label="${k}" style="left:${l}%;top:${t}%;animation-delay:${(i % 5) * 0.3}s"><img alt="" src="${I(k)}"></button>`);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!c.paused && !c.dead) onTap(k, b); });
      G.stage.appendChild(b); out.push(b);
    });
    return out;
  }
  function checklist(keys) {
    const el = G.el(`<div class="checklist" style="position:absolute;left:0;right:0;top:70px;z-index:14">${keys.map(k => `<div class="slot" data-k="${k}"><img alt="${k}" src="${I(k)}"></div>`).join('')}</div>`);
    G.stage.appendChild(el); return el;
  }
  function flyAway(b) { b.classList.add('done'); b.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.5) translateY(-40px)', opacity: 0 }], { duration: 420, fill: 'forwards' }); }
  function wrongTap(b, en, ar) { SOUND.play('wrong'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); const r = G.rel(b); G.floatText(en + ' ' + (ar || ''), r.x, r.y - 30, true); }
  const SPOTS = [[6, 24], [39, 22], [72, 24], [8, 41], [40, 40], [74, 42], [56, 57], [80, 60], [38, 58], [6, 58], [62, 74], [80, 78]];

  /* ======================= 1. HUNGRY: runner ======================= */
  const hungry = {
    id: 'hungry', name: 'Jojo Is Hungry', ar: 'جوجو جعانة', thumb: 'jojo/face_hungry',
    reward: { img: 'jojo/pose_jump_joy', en: 'Fed the Queen', ar: 'أكّلت الملكة' },
    setup: () => ({ food: G.pick(CONFIG.foods) }),
    request: (d) => ({ sticker: 'jojo/face_hungry', html: say("Habibi, I'm hungry! I want " + d.food.en + '!', 'أنا جعانة! عايزة ' + d.food.ar) }),
    run(c, api) {
      const L = api.level, cfg = CONFIG.hungry, need = cfg.need, food = api.data.food;
      const { pill } = api.hud('Jojo Is Hungry');
      const counter = G.el(`<div class="pill" style="position:absolute;z-index:21;top:62px;left:14px;display:flex;align-items:center;gap:6px"><img alt="" src="${I(food.key)}" style="width:30px"><span>0/${need}</span></div>`);
      G.stage.appendChild(counter);
      const tip = G.el(`<div class="bubble" style="position:absolute;z-index:21;top:62px;right:14px;font-size:15px;padding:4px 10px">Tap to jump<span class="ar">اضغط عشان تنط</span></div>`);
      G.stage.appendChild(tip); c.after(3500, () => tip.remove());

      const cv = G.el('<canvas aria-label="Mohamed runs through the house" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas>');
      G.stage.insertBefore(cv, G.stage.firstChild);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = G.stage.clientWidth, ch = G.stage.clientHeight;
      cv.width = cw * dpr; cv.height = ch * dpr;
      const g = cv.getContext('2d'); g.scale(dpr, dpr);
      const img = (src) => { const m = new Image(); m.src = src; return m; };
      const runImg = img(S('mohamed/pose_run')), tripImg = img(S('mohamed/pose_trip'));
      const obsKeys = ['toycar', 'slippers', 'cat', 'laundry'];
      const imgs = {}; obsKeys.concat(CONFIG.foods.map(f => f.key)).forEach(k => imgs[k] = img(I(k)));

      const ground = ch * 0.82, gravity = ch * 3.6, jumpV = ch * 1.42;
      const pw = cw * 0.3, ph = pw * 1.3, px = cw * 0.12;
      const p = { y: ground - ph, vy: 0, jumps: 0, trip: 0, inv: 0 };
      const speed = cfg.speed[L - 1] * (cw / 390);
      let scroll = 0, things = [], nextObs = 1.6, nextFood = 0.8, got = 0, wrong = false, done = false, t = 0;
      const cd = G.countdown(c, cfg.time[L - 1], pill, () => { if (!done) api.fail('Too slow! The food got cold.', 'اتأخرت! الأكل برد'); });

      cv.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (c.paused || done || p.trip > 0) return;
        if (p.jumps < 2) { p.vy = -jumpV * (p.jumps ? 0.8 : 1); p.jumps++; SOUND.play('jump'); }
      });

      function spawnObstacle() {
        const k = G.pick(obsKeys), s = cw * 0.17;
        things.push({ kind: 'obs', k, x: cw + 20, y: ground - s * 0.86, w: s, h: s * 0.86 });
      }
      function spawnFood() {
        const right = Math.random() < 0.55;
        const k = right ? food.key : G.pick(CONFIG.foods.filter(f => f.key !== food.key)).key;
        const s = cw * 0.15;
        const nearObs = things.some(o => o.kind === 'obs' && Math.abs(o.x - (cw + 20)) < cw * 0.35);
        const air = nearObs || Math.random() < 0.45;
        things.push({ kind: 'food', k, right: k === food.key, x: cw + 20, y: air ? ground - ch * 0.27 - s : ground - s - 4, w: s, h: s, bob: Math.random() * 6 });
      }
      const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

      function drawBg() {
        g.fillStyle = '#F7E2C4'; g.fillRect(0, 0, cw, ground);
        const s1 = (scroll * 0.5) % 40;
        g.fillStyle = '#F2D8B4'; for (let x = -s1; x < cw; x += 40) g.fillRect(x, 0, 16, ground);
        const s2 = scroll % 520;
        for (let x = -s2; x < cw + 520; x += 520) {
          g.fillStyle = '#B07A4A'; g.fillRect(x + 40, ground - ch * 0.42, cw * 0.3, ch * 0.42);
          g.fillStyle = '#C48A55'; g.fillRect(x + 52, ground - ch * 0.40, cw * 0.3 - 24, ch * 0.40);
          g.fillStyle = '#F2B63C'; g.beginPath(); g.arc(x + 40 + cw * 0.26, ground - ch * 0.2, 6, 0, 7); g.fill();
          g.fillStyle = '#8A5A34'; g.fillRect(x + 300, ch * 0.28, 70, 86); g.fillStyle = '#FFF7EA'; g.fillRect(x + 307, ch * 0.28 + 7, 56, 72);
          g.fillStyle = '#E2456B'; g.beginPath(); const hx = x + 335, hy = ch * 0.28 + 48;
          g.moveTo(hx, hy + 10); g.bezierCurveTo(hx - 22, hy - 8, hx - 8, hy - 24, hx, hy - 10); g.bezierCurveTo(hx + 8, hy - 24, hx + 22, hy - 8, hx, hy + 10); g.fill();
        }
        g.fillStyle = '#FFFFFF'; g.fillRect(0, ground - 10, cw, 12);
        g.fillStyle = '#C98F5B'; g.fillRect(0, ground, cw, ch - ground);
        g.strokeStyle = '#B87D4B'; g.lineWidth = 3;
        for (let y = ground + 24; y < ch; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
        const s3 = scroll % 90; for (let x = -s3; x < cw; x += 90) { g.beginPath(); g.moveTo(x, ground); g.lineTo(x - 30, ch); g.stroke(); }
      }

      c.loop((dt) => {
        t += dt;
        const sp = done ? 0 : speed * (p.trip > 0 ? 0.35 : 1);
        scroll += sp * dt;
        if (!done) {
          nextObs -= dt; nextFood -= dt;
          if (nextObs <= 0) { spawnObstacle(); nextObs = cfg.obstacleGap[L - 1] * (0.8 + Math.random() * 0.6); }
          if (nextFood <= 0) { spawnFood(); nextFood = 1.0 + Math.random() * 0.7; }
        }
        p.vy += gravity * dt; p.y += p.vy * dt;
        if (p.y >= ground - ph) { p.y = ground - ph; p.vy = 0; p.jumps = 0; }
        if (p.trip > 0) p.trip -= dt; if (p.inv > 0) p.inv -= dt;
        const box = { x: px + pw * 0.28, y: p.y + ph * 0.18, w: pw * 0.42, h: ph * 0.74 };
        for (const o of things) {
          o.x -= sp * dt;
          if (o.gone || done) continue;
          const ob = o.kind === 'obs' ? { x: o.x + o.w * 0.15, y: o.y + o.h * 0.25, w: o.w * 0.7, h: o.h * 0.75 } : o;
          if (!hit(box, ob)) continue;
          if (o.kind === 'obs' && p.inv <= 0) {
            p.trip = 0.9; p.inv = 1.8; c.perfect = false; SOUND.play('thud'); G.floatText('Ouch! آه', px + pw / 2, p.y, true);
          } else if (o.kind === 'food') {
            o.gone = true;
            if (o.right) { got++; SOUND.play('coin'); G.floatText('Yum! +1', o.x + o.w / 2, o.y, false); counter.querySelector('span').textContent = got + '/' + need; }
            else { wrong = true; c.perfect = false; SOUND.play('wrong'); G.floatText('Not that! مش ده', o.x + o.w / 2, o.y, true); }
          }
        }
        things = things.filter(o => o.x > -o.w - 20 && !o.gone);
        if (!done && got >= need) { done = true; cd.stop(); SOUND.play('sparkle'); c.after(500, finish); }

        g.clearRect(0, 0, cw, ch); drawBg();
        for (const o of things) { const m = imgs[o.k]; if (m.complete) g.drawImage(m, o.x, o.kind === 'food' ? o.y + Math.sin(t * 4 + o.bob) * 4 : o.y, o.w, o.kind === 'food' ? o.h : o.w); }
        const m = p.trip > 0 ? tripImg : runImg;
        const blink = p.inv > 0 && p.trip <= 0 && Math.floor(t * 12) % 2;
        if (m.complete && !blink) {
          const bob = p.jumps === 0 && p.trip <= 0 ? Math.abs(Math.sin(t * 14)) * 5 : 0;
          const r = m.naturalHeight / m.naturalWidth || 1.3, w = pw, h = w * r;
          g.drawImage(m, px, p.y + ph - h - bob, w, h);
          if (p.jumps === 0 && p.trip <= 0 && Math.floor(t * 7) % 2 === 0 && !done) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(px + 10, ground - 6, 7, 0, 7); g.fill(); }
        }
      });

      function finish() {
        c.loops = []; cv.remove(); counter.remove();
        G.stage.style.backgroundImage = `url("${G.bg('living')}")`;
        const j = sticker(S('jojo/pose_jump_joy'), 'right:4%;bottom:12%;width:44%');
        const mo = sticker(S('mohamed/pose_carry_food'), 'left:2%;bottom:10%;width:44%;--from:-150%;animation:slidein .7s ease-out both', '');
        bubble(say('Yum! Thank you habibi!', 'تسلم إيدك يا حبيبي'));
        c.after(700, () => { SOUND.play('kiss'); burst(j, 10); });
        c.after(2400, () => api.win({ fast: cd.left > cd.total / 3, thoughtful: !wrong }));
      }
    }
  };

  /* ======================= 2. SICK: find the items ======================= */
  const sick = {
    id: 'sick', name: 'Jojo Is Sick', ar: 'جوجو تعبانة', thumb: 'jojo/face_sick',
    reward: { img: 'mohamed/pose_carry_medicine', en: 'Nurse Mohamed', ar: 'الدكتور محمد' },
    setup: () => ({}),
    request: () => ({ sticker: 'jojo/pose_sick_bed', html: say("I'm sick... bring me my medicine, water, blanket and soup!", 'أنا تعبانة… هات الدوا والمية والبطانية والشوربة') }),
    run(c, api) {
      const L = api.level, need = ['medicine', 'water', 'blanket', 'soup'];
      const decoys = G.shuffle(['sock', 'book', 'remote', 'dumbbell', 'slippers', 'toycar', 'keys', 'popcorn']).slice(0, CONFIG.sick.decoys[L - 1]);
      G.stage.style.backgroundImage = `url("${G.bg('bedroom')}")`;
      const { pill } = api.hud('Jojo Is Sick');
      const jojo = sticker(S('jojo/pose_sick_bed'), 'left:2%;bottom:3%;width:50%');
      const list = checklist(need);
      const keys = G.shuffle(need.concat(decoys));
      const spots = G.shuffle(SPOTS.slice(0, 11)).map(([l, t]) => [l, t + 6]);
      let found = 0, wrongs = 0, done = false;
      const cd = G.countdown(c, CONFIG.sick.time[L - 1], pill, () => { if (!done) api.fail("She's still waiting for her medicine!", 'لسه مستنية الدوا!'); });
      tapItems(c, keys, spots, (k, b) => {
        if (done) return;
        if (need.includes(k)) {
          SOUND.play('pop'); flyAway(b); found++;
          G.$(`.slot[data-k="${k}"]`, list).classList.add('got');
          if (found === need.length) { done = true; cd.stop(); SOUND.play('sparkle'); c.after(500, finish); }
        } else { wrongs++; c.perfect = false; wrongTap(b, 'Not that!', 'مش ده'); }
      });
      function finish() {
        G.$$('.tapitem').forEach(e => e.remove()); list.remove();
        sticker(S('mohamed/pose_carry_medicine'), 'right:4%;bottom:6%;width:42%;--from:150%;animation:slidein .7s ease-out both', '');
        bubble(say('Thank you habibi, I feel better already!', 'تسلم يا حبيبي، بقيت أحسن'));
        c.after(900, () => { SOUND.play('kiss'); burst(jojo, 8); });
        c.after(2500, () => api.win({ fast: cd.left > cd.total / 3, thoughtful: wrongs === 0 }));
      }
    }
  };

  /* ======================= 3. BORED: pick an activity ======================= */
  const JOKES = [
    ["I'm not late...", "I'm on Egyptian time!", 'أنا مش متأخر… أنا في الميعاد المصري'],
    ['I love you more than macarona bechamel...', 'okay, the same amount.', 'بحبك أكتر من المكرونة بشاميل… طيب زيها بالظبط'],
    ['My diet starts tomorrow...', 'like every tomorrow.', 'الدايت من بكرة… زي كل بكرة'],
    ['I asked the cat to clean the room...', "he said 'meow-be later'.", 'قلت للقطة تنضف الأوضة… قالتلي بعدين']
  ];
  const bored = {
    id: 'bored', name: 'Jojo Is Bored', ar: 'جوجو زهقانة', thumb: 'jojo/face_bored',
    reward: { img: 'jojo/face_laughing', en: 'Made her laugh', ar: 'ضحّكتها' },
    setup: () => ({}),
    request: () => ({ sticker: 'jojo/face_bored', html: say("I'm boooored! Do something!", 'أنا زهقانة! اعمل حاجة') }),
    run(c, api) {
      const L = api.level;
      G.stage.style.backgroundImage = `url("${G.bg('living')}")`;
      api.hud('Jojo Is Bored');
      const jojo = sticker(S('jojo/pose_bored_sofa'), 'left:18%;top:20%;width:64%');
      const setJojo = (k) => { jojo.src = S(k); jojo.classList.remove('pop'); void jojo.offsetWidth; jojo.classList.add('pop'); };
      bubble(say('Entertain me!', 'سلّيني!'), 'left:6%;right:6%;top:64px');
      const finish = (en, ar, thoughtful) => {
        panel('');
        setJojo('jojo/face_laughing'); jojo.style.width = '56%'; jojo.style.left = '22%';
        bubble(say(en, ar), 'left:6%;right:6%;top:64px');
        SOUND.play('win'); c.after(500, () => { SOUND.play('kiss'); burst(jojo, 10); });
        c.after(2400, () => api.win({ thoughtful }));
      };
      const menu = () => {
        const p = panel(`<div class="choice">
          <button class="opt" data-a="tv"><img alt="" src="${I('tv')}">Watch a show<span class="ar">نتفرج على مسلسل</span></button>
          <button class="opt" data-a="game"><img alt="" src="${I('scissors')}">Play a game<span class="ar">نلعب لعبة</span></button>
          <button class="opt" data-a="joke"><img alt="" src="${I('joke')}">Tell a joke<span class="ar">قول نكتة</span></button>
          <button class="opt" data-a="movie"><img alt="" src="${I('popcorn')}">Movie night<span class="ar">سهرة فيلم</span></button></div>`);
        p.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b || c.paused) return; SOUND.play('tap'); ({ tv, game, joke, movie })[b.dataset.a](); });
      };
      function tv() {
        const favs = G.shuffle(CONFIG.shows.filter(s => s.fav)).slice(0, 4), bad = G.shuffle(CONFIG.shows.filter(s => !s.fav)).slice(0, 2);
        const list = G.shuffle(favs.concat(bad));
        const p = panel(`<div class="bubble" style="font-size:17px">What should we watch?<span class="ar">نتفرج على إيه؟</span></div><div class="choice">${list.map((s, i) => `<button class="opt" data-i="${i}">${G.esc(s.en)}<span class="ar">${G.esc(s.ar)}</span></button>`).join('')}</div>`);
        p.addEventListener('click', (e) => {
          const b = e.target.closest('[data-i]'); if (!b || c.paused) return;
          const s = list[+b.dataset.i];
          if (s.fav) { SOUND.play('sparkle'); finish('Yesss! ' + s.en + '!', 'أيوه! ' + s.ar + ' ده المفضل', true); }
          else { c.perfect = false; b.disabled = true; setJojo('jojo/face_angry'); wrongTap(b, 'No way!', 'لأ طبعاً'); c.after(900, () => setJojo('jojo/pose_bored_sofa')); }
        });
      }
      function game() {
        const moves = [['rock', 'Rock', 'حجر'], ['paper', 'Paper', 'ورقة'], ['scissors', 'Scissors', 'مقص']];
        const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
        let round = 0, me = 0, her = 0;
        const draw = (msg) => {
          const p = panel(`<div class="bubble" style="font-size:17px">${msg}<span class="ar">جولة ${round + 1} من 3 · أنت ${me} - جوجو ${her}</span></div>
            <div class="choice" style="grid-template-columns:repeat(3,minmax(0,1fr))">${moves.map(m => `<button class="opt" data-m="${m[0]}"><img alt="" src="${I(m[0])}">${m[1]}<span class="ar">${m[2]}</span></button>`).join('')}</div>`);
          p.addEventListener('click', (e) => {
            const b = e.target.closest('[data-m]'); if (!b || c.paused) return;
            const mine = b.dataset.m, r = Math.random();
            const hers = r < 0.55 ? Object.keys(beats).find(k => beats[k] === mine) : r < 0.8 ? mine : beats[mine];
            let res;
            if (hers === mine) res = 'Tie!'; else if (beats[hers] === mine) { her++; res = 'Jojo wins!'; SOUND.play('wrong'); } else { me++; res = 'You win!'; SOUND.play('coin'); }
            round++;
            const name = (k) => moves.find(m => m[0] === k)[1];
            if (round >= 3) {
              if (her >= me) finish('I win! كسبتك! ' + her + '-' + me, 'أنا أشطر منك', true);
              else finish('Cheater! ' + me + '-' + her + ' ... rematch later!', 'غشاش! هنلعب تاني', false);
            } else draw(`You: ${name(mine)} · Jojo: ${name(hers)} · ${res}`);
          });
        };
        draw('Rock, paper, scissors! Best of 3');
      }
      function joke() {
        const order = G.shuffle(JOKES); let tries = 0, hits = 0;
        const zone = CONFIG.joke.zone[L - 1], spd = CONFIG.joke.speed[L - 1];
        const z0 = 0.5 - zone / 2;
        const p = panel(`<div class="bubble" style="font-size:17px" id="jk"></div>
          <div class="bar" style="position:relative;height:34px"><i style="position:absolute;left:${z0 * 100}%;width:${zone * 100}%;background:#7DBE58"></i><b id="mk" style="position:absolute;top:-6px;width:8px;height:40px;background:#2A1A1A;border-radius:4px;left:0"></b></div>
          <button class="btn big" id="pl">Punchline!<span class="ar" style="display:block;font-size:16px">الإفيه!</span></button>`);
        const jk = G.$('#jk', p), mk = G.$('#mk', p);
        let pos = 0, dir = 1, waiting = false;
        const show = () => { const j = order[tries % order.length]; jk.innerHTML = say(j[0], j[2]); };
        show();
        const f = c.loop((dt) => { if (waiting) return; pos += dir * spd * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } mk.style.left = `calc(${pos * 100}% - 4px)`; });
        G.$('#pl', p).addEventListener('click', () => {
          if (waiting || c.paused) return;
          const j = order[tries % order.length], ok = pos >= z0 && pos <= z0 + zone;
          tries++; waiting = true;
          if (ok) { hits++; SOUND.play('sparkle'); setJojo('jojo/face_laughing'); jk.innerHTML = say(j[1] + ' Hahaha!', 'هههههه'); }
          else { c.perfect = false; SOUND.play('wrong'); setJojo('jojo/face_bored'); jk.innerHTML = say(j[1] + ' ...bad timing.', 'مش مضحكة'); }
          c.after(1500, () => {
            waiting = false;
            if (hits >= 2) { c.unloop(f); finish('Hahaha! You are so funny!', 'إنت دمك خفيف أوي', hits === tries); return; }
            if (tries >= 3) { tries = 0; hits = 0; G.floatText('Try again! تاني', G.stage.clientWidth / 2, G.stage.clientHeight * 0.5, true); }
            setJojo('jojo/pose_bored_sofa'); show();
          });
        });
      }
      function movie() {
        panel('');
        const keys = ['popcorn', 'blanket', 'tea', 'lights', 'remote'];
        const { pill } = { pill: G.$('.hud .pill') };
        pill.hidden = false;
        bubble(say('Get everything for movie night!', 'هات كل حاجة للسهرة!'), 'left:6%;right:6%;top:64px');
        const list = checklist(keys); list.style.top = '150px';
        const spots = G.shuffle([[6, 62], [38, 66], [72, 62], [10, 80], [42, 82], [74, 80]]);
        let n = 0, done = false;
        const cd = G.countdown(c, CONFIG.movie.time[L - 1], pill, () => { if (!done) api.fail('The movie started without the popcorn!', 'الفيلم بدأ من غير فشار!'); });
        tapItems(c, keys, spots, (k, b) => {
          if (done) return; SOUND.play('pop'); flyAway(b); n++;
          G.$(`.slot[data-k="${k}"]`, list).classList.add('got');
          if (n === keys.length) {
            done = true; cd.stop(); pill.hidden = true;
            c.after(400, () => { list.remove(); G.$$('.tapitem').forEach(e => e.remove()); G.stage.appendChild(G.el('<div style="position:absolute;inset:0;background:rgba(30,20,50,.35);z-index:5;pointer-events:none"></div>')); finish('Movie night! Best husband!', 'سهرة فيلم! أحلى زوج', cd.left > cd.total / 3); });
          }
        });
      }
      G.$('.hud .pill').hidden = true;
      menu();
    }
  };

  /* ======================= 4. TAKE HER OUT ======================= */
  const out = {
    id: 'out', name: 'Take Jojo Out', ar: 'خرّج جوجو', thumb: 'jojo/face_wink_thumbs_up',
    reward: { img: 'couple/kiss', en: 'Date night', ar: 'خروجة حلوة' },
    setup: () => ({}),
    request: () => ({ sticker: 'jojo/pose_stand', html: say("Let's go out! Take me somewhere nice.", 'يلا نخرج! وديني حتة حلوة') }),
    run(c, api) {
      const L = api.level;
      G.stage.style.backgroundImage = `url("${G.bg('living')}")`;
      const { pill } = api.hud('Take Jojo Out'); pill.hidden = true;
      const jojo = sticker(S('jojo/pose_stand'), 'right:6%;top:24%;width:36%');
      bubble(say('Where are we going?', 'هنروح فين؟'), 'left:6%;right:6%;top:64px');
      let place = null;
      const p = panel(`<div class="choice">${CONFIG.places.map((pl, i) => `<button class="opt" data-i="${i}"><img alt="" src="${I(pl.item)}">${pl.en}<span class="ar">${pl.ar}</span></button>`).join('')}</div>`);
      p.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b || place || c.paused) return; SOUND.play('tap'); place = CONFIG.places[+b.dataset.i]; prep(); });
      function prep() {
        panel(''); jojo.remove();
        bubble(say("Grab everything! Don't forget anything!", 'خد كل حاجة! متنساش حاجة'), 'left:6%;right:6%;top:64px');
        const keys = ['wallet', 'keys', 'phone', 'sunglasses', 'carkey'];
        const list = checklist(keys); list.style.top = '150px';
        const spots = G.shuffle([[6, 40], [40, 42], [72, 40], [8, 60], [42, 62], [74, 60], [24, 78], [60, 80]]);
        pill.hidden = false; let n = 0, done = false;
        const cd = G.countdown(c, CONFIG.out.prepTime[L - 1], pill, () => { if (!done) api.fail("She's dressed and waiting at the door!", 'لابسة ومستنياك على الباب!'); });
        tapItems(c, keys, spots, (k, b) => {
          if (done) return; SOUND.play('pop'); flyAway(b); n++;
          G.$(`.slot[data-k="${k}"]`, list).classList.add('got');
          if (n === keys.length) { done = true; cd.stop(); pill.hidden = true; c.fastPrep = cd.left > cd.total / 3; c.after(400, () => { list.remove(); G.$$('.tapitem').forEach(e => e.remove()); gag(); }); }
        });
      }
      function gag() {
        G.$('.scene-bubble').remove();
        const mo = sticker(S('mohamed/pose_run'), 'left:4%;top:34%;width:46%;--from:-140%;animation:slidein .6s ease-out both', '');
        SOUND.play('whoosh');
        c.after(900, () => {
          mo.src = S('mohamed/face_panic'); mo.className = 'stk pop'; mo.style.width = '56%'; mo.style.left = '22%';
          SOUND.play('wrong');
          bubble(say('Wait... I forgot the keys in the house!', 'استنى… نسيت المفاتيح جوه!'), 'left:6%;right:6%;top:64px');
          const need = CONFIG.out.mash[L - 1]; let taps = 0; const t0 = { s: 0 };
          const f = c.loop((dt) => { t0.s += dt; });
          const pp = panel(`<div class="bar"><i id="mb"></i></div><button class="btn big" id="rb">Run back! Tap fast!<span class="ar" style="display:block;font-size:16px">ارجع بسرعة!</span></button>`);
          G.$('#rb', pp).addEventListener('pointerdown', (e) => {
            e.preventDefault(); if (c.paused) return;
            taps++; SOUND.play('step'); G.$('#mb', pp).style.width = Math.min(100, taps / need * 100) + '%';
            if (taps === need) { c.unloop(f); if (t0.s > 5) c.perfect = false; SOUND.play('coin'); date(); }
          });
        });
      }
      function date() {
        G.$$('.stk').forEach(e => e.remove()); panel('').remove();
        G.stage.style.backgroundImage = `url("${G.bg(place.key)}")`;
        const k = sticker(S('couple/kiss'), 'left:14%;bottom:8%;width:72%');
        const lines = { cafe: ['Mocha frappe date? Perfect!', 'موكا فرابيه؟ تحفة!'], restaurant: ['Dinner with you is the best!', 'العشا معاك أحلى حاجة'], park: ['A walk with you, I love it!', 'تمشية معاك بحبها'], travel: ['Travelling abroad with you?! Yes!', 'نسافر برة سوا؟! أيوه!'] }[place.key];
        bubble(say(lines[0], lines[1]), 'left:6%;right:6%;top:64px');
        SOUND.play('win'); c.after(600, () => { SOUND.play('kiss'); burst(k, 14); });
        c.after(2800, () => api.win({ thoughtful: place.fav, fast: c.fastPrep }));
      }
    }
  };

  /* ======================= 5. PRESENT ======================= */
  const present = {
    id: 'present', name: 'Buy Jojo a Present', ar: 'هدية لجوجو', thumb: 'jojo/face_gift_excited',
    reward: { img: 'jojo/face_gift_excited', en: 'The perfect gift', ar: 'أحلى هدية' },
    setup: () => ({ hint: G.pick(['roses', 'gold']) }),
    request: (d) => ({ sticker: 'jojo/face_wink_thumbs_up', html: say(CONFIG.giftHints[d.hint].en + ' Just saying!', CONFIG.giftHints[d.hint].ar + '… بقول بس') }),
    run(c, api) {
      const L = api.level, hint = api.data.hint;
      G.stage.style.backgroundImage = `url("${G.bg('living')}")`;
      const { pill } = api.hud('Buy Jojo a Present');
      let budget = CONFIG.startBudget, taps = 0, done = false;
      const money = G.el(`<div class="pill" style="position:absolute;z-index:21;top:62px;left:14px;display:flex;align-items:center;gap:6px"><img alt="" src="${I('coin')}" style="width:28px"><span>£${budget}</span></div>`);
      G.stage.appendChild(money);
      bubble(say('Catch the coins to save up!', 'لم الفلوس عشان الهدية!'), 'left:22%;right:4%;top:120px;font-size:16px');
      const coins = [];
      let next = 0;
      const W = G.stage.clientWidth, H = G.stage.clientHeight;
      const f = c.loop((dt) => {
        if (done) return;
        next -= dt;
        if (next <= 0) {
          next = 0.42;
          const s = W * 0.16, b = G.el(`<button class="tapitem" aria-label="coin" style="animation:none;width:${s}px;left:${Math.random() * (W - s)}px;top:-${s}px"><img alt="" src="${I('coin')}"></button>`);
          const o = { b, y: -s, v: H * (0.32 + Math.random() * 0.22) };
          b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (c.paused || o.got) return; o.got = true; taps++; budget += CONFIG.coinValue; money.querySelector('span').textContent = '£' + budget; SOUND.play('coin'); flyAway(b); });
          G.stage.appendChild(b); coins.push(o);
        }
        for (const o of coins) { if (o.got) continue; o.y += o.v * dt; o.b.style.top = o.y + 'px'; if (o.y > H) { o.got = true; o.b.remove(); } }
      });
      const cd = G.countdown(c, CONFIG.present.coinTime[L - 1], pill, () => { done = true; c.unloop(f); G.$$('.tapitem').forEach(e => e.remove()); pill.hidden = true; shop(); });
      function shop() {
        G.stage.style.backgroundImage = `url("${G.bg('shop')}")`;
        bubble(say('You saved £' + budget + '! Pick a gift.', 'معاك ' + budget + ' جنيه! اختار هدية'), 'left:6%;right:6%;top:150px');
        const p = panel(`<div class="choice">${CONFIG.gifts.map((g, i) => `<button class="opt" data-i="${i}" ${g.price > budget ? 'disabled' : ''}><img alt="" src="${I(g.key)}">${g.en} · £${g.price}<span class="ar">${g.price > budget ? 'محتاج فلوس أكتر' : g.ar}</span></button>`).join('')}</div>`);
        p.addEventListener('click', (e) => {
          const b = e.target.closest('[data-i]'); if (!b || b.disabled || c.paused) return;
          const gift = CONFIG.gifts[+b.dataset.i]; SOUND.play('pop'); give(gift);
        });
      }
      function give(gift) {
        panel('').remove(); money.remove();
        const match = gift.key === hint;
        if (!match) c.perfect = false;
        sticker(S('mohamed/pose_carry_gift'), 'left:2%;bottom:6%;width:40%;--from:-150%;animation:slidein .6s ease-out both', '');
        const j = sticker(S(match ? 'jojo/face_gift_excited' : 'jojo/face_wink_thumbs_up'), 'right:4%;bottom:22%;width:50%');
        const gi = sticker(I(gift.key), 'left:40%;bottom:40%;width:20%');
        bubble(match ? say('OMG! That is exactly what I wanted! Love you!', 'ده بالظبط اللي كنت عايزاه! بحبك') : say('Aww, thank you habibi!', 'ميرسي يا حبيبي!'), 'left:6%;right:6%;top:150px');
        SOUND.play(match ? 'win' : 'sparkle'); c.after(600, () => { SOUND.play('kiss'); burst(j, match ? 16 : 6); });
        c.after(2800, () => api.win({ thoughtful: match, fast: taps >= 14 }));
      }
    }
  };

  /* ======================= 6. ATTENTION ======================= */
  const WANTS = {
    hug: ['I just need a hug...', 'محتاجة حضن'], cuddle: ['Come sit next to me...', 'تعالى اقعد جنبي'],
    talk: ['I want to tell you about my day...', 'عايزة أحكيلك عن يومي'], tv: ['Watch something with me...', 'تعالى نتفرج سوا'], surprise: ['Surprise me!', 'فاجئني!']
  };
  const attention = {
    id: 'attention', name: 'Jojo Wants Attention', ar: 'جوجو عايزة اهتمام', thumb: 'jojo/face_calling',
    reward: { img: 'jojo/face_blow_kiss', en: 'All hers', ar: 'كله ليها' },
    setup: () => ({ want: G.pick(Object.keys(WANTS)) }),
    request: () => ({ sticker: 'jojo/face_angry', html: say('MOHAMED! Put that phone down and come here!', 'محمد! سيب التليفون وتعالى!') }),
    run(c, api) {
      const L = api.level, want = api.data.want;
      G.stage.style.backgroundImage = `url("${G.bg('living')}")`;
      const { pill } = api.hud('Jojo Wants Attention');
      const mo = sticker(S('mohamed/pose_stand'), 'left:4%;bottom:14%;width:44%');
      const ph = sticker(I('phone'), 'left:30%;bottom:38%;width:16%', 'wobble');
      const jo = sticker(S('jojo/face_angry'), 'right:2%;top:16%;width:48%', 'wobble');
      bubble(say('Phone down. Now!', 'سيب التليفون. حالاً!'), 'left:6%;right:50%;top:64px;font-size:17px');
      const clips = G.voiceFor('attention'); if (clips.length) SOUND.playVoice(G.pick(clips));
      const need = CONFIG.attention.mash[L - 1]; let taps = 0, stage2 = false;
      const p = panel(`<div class="bar"><i id="mb"></i></div><button class="btn big" id="mash">Put the phone down!<span class="ar" style="display:block;font-size:16px">سيب التليفون! دوس بسرعة</span></button>`);
      const cd = G.countdown(c, CONFIG.attention.mashTime[L - 1], pill, () => { if (!stage2) api.fail('Too late... she is upset now!', 'اتأخرت… زعلت خلاص!'); });
      G.$('#mash', p).addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (c.paused || stage2) return;
        taps++; SOUND.play('tap'); G.$('#mb', p).style.width = Math.min(100, taps / need * 100) + '%';
        if (taps >= need) { stage2 = true; cd.stop(); pill.hidden = true; c.fastMash = cd.left > cd.total / 2; ph.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(-300px,-200px) rotate(-540deg)', opacity: 0 }], { duration: 700, fill: 'forwards' }); SOUND.play('whoosh'); choose(); }
      });
      function choose() {
        jo.src = S('jojo/face_in_love'); jo.className = 'stk pop';
        bubble(say(WANTS[want][0], WANTS[want][1]), 'left:6%;right:50%;top:64px;font-size:17px');
        const opts = [['cuddle', 'Cuddle', 'نتحضن ع الكنبة'], ['talk', 'Talk', 'نتكلم'], ['tv', 'Watch TV', 'نتفرج سوا'], ['hug', 'Big hug', 'حضن كبير'], ['surprise', 'Surprise', 'مفاجأة']];
        const p2 = panel(`<div class="choice" style="grid-template-columns:repeat(3,minmax(0,1fr))">${opts.map(o => `<button class="opt" data-k="${o[0]}"><img alt="" src="${I(o[0])}" style="width:52px;height:52px">${o[1]}<span class="ar">${o[2]}</span></button>`).join('')}</div>`);
        p2.addEventListener('click', (e) => {
          const b = e.target.closest('[data-k]'); if (!b || c.paused) return;
          const match = b.dataset.k === want; if (!match) c.perfect = false;
          panel('').remove(); mo.remove(); jo.remove();
          const k = sticker(S('couple/kiss'), 'left:14%;bottom:10%;width:72%');
          bubble(match ? say('Exactly what I needed. Love you!', 'ده اللي كنت محتاجاه بالظبط. بحبك') : say('Okay... that works too!', 'ماشي… حلوة برضه!'), 'left:6%;right:6%;top:64px');
          SOUND.play('win'); c.after(500, () => { SOUND.play('kiss'); burst(k, match ? 14 : 8); });
          c.after(2600, () => api.win({ thoughtful: match, fast: c.fastMash }));
        });
      }
    }
  };

  window.MISSIONS = [hungry, sick, bored, out, present, attention];
})();
