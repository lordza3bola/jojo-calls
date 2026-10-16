/* Sound: Jojo's real voice through WebAudio (so the volume slider works on iPhone),
   plus synthesized sound effects and an original music loop. Nothing here is a fake voice. */
(function () {
  let ctx = null, master, music, sfx, voice;
  const vol = { music: 0.5, sfx: 0.8, voice: 1 };
  let muted = false;
  const buffers = {};          // url -> AudioBuffer
  let voicePlaying = null;     // only one clip at a time
  let musicTimer = null, musicStep = 0, musicMode = null;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    music = ctx.createGain(); music.connect(master);
    sfx = ctx.createGain(); sfx.connect(master);
    voice = ctx.createGain(); voice.connect(master);
    apply();
  }
  function apply() {
    if (!ctx) return;
    master.gain.value = muted ? 0 : 1;
    music.gain.value = vol.music * 0.22 * (voicePlaying ? 0.3 : 1);
    sfx.gain.value = vol.sfx * 0.5;
    voice.gain.value = vol.voice;
  }
  async function load(url) {
    if (!ctx || buffers[url]) return;
    try {
      const r = await fetch(url);
      const ab = await r.arrayBuffer();
      buffers[url] = await new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej));
    } catch (e) { buffers[url] = null; }
  }
  function playVoice(url, onEnd) {
    if (!ctx) { onEnd && onEnd(); return 0; }
    stopVoice();
    const b = buffers[url];
    if (!b) { onEnd && onEnd(); return 0; }
    const src = ctx.createBufferSource();
    src.buffer = b; src.connect(voice);
    voicePlaying = src; apply();
    src.onended = () => { if (voicePlaying === src) { voicePlaying = null; apply(); } onEnd && onEnd(); };
    src.start();
    return b.duration;
  }
  function stopVoice() {
    if (voicePlaying) { const v = voicePlaying; voicePlaying = null; v.onended = null; try { v.stop(); } catch (e) {} apply(); }
  }

  function tone(type, f1, f2, dur, gain, when, dest) {
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfx); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, gain, filt, when) {
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filt || 1200;
    const g = ctx.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(sfx); s.start(t);
  }
  const SFX = {
    tap: () => tone('triangle', 660, 880, 0.08, 0.4),
    ring: () => { for (let i = 0; i < 2; i++) { tone('sine', 880, 0, 0.18, 0.5, i * 0.25); tone('sine', 1100, 0, 0.18, 0.4, i * 0.25 + 0.09); } },
    jump: () => tone('square', 300, 720, 0.16, 0.25),
    thud: () => { tone('sine', 160, 50, 0.25, 0.8); noise(0.15, 0.5, 400); },
    coin: () => { tone('square', 988, 0, 0.07, 0.25); tone('square', 1319, 0, 0.18, 0.25, 0.07); },
    wrong: () => tone('sawtooth', 220, 160, 0.22, 0.25),
    sparkle: () => { [1568, 1976, 2349, 3136].forEach((f, i) => tone('sine', f, 0, 0.12, 0.25, i * 0.05)); },
    pop: () => tone('sine', 500, 1400, 0.09, 0.5),
    kiss: () => { tone('sine', 1800, 600, 0.09, 0.4); noise(0.06, 0.6, 3000, 0.02); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, 0, 0.22, 0.4, i * 0.11)); },
    fail: () => { [392, 370, 349, 294].forEach((f, i) => tone('sawtooth', f, f * 0.97, 0.3, 0.22, i * 0.28)); },
    whoosh: () => noise(0.3, 0.7, 900),
    step: () => tone('sine', 140, 90, 0.05, 0.3)
  };
  function play(name) { try { SFX[name] && SFX[name](); } catch (e) {} }

  // Original 2-bar loops: a bouncy menu tune and a faster mission tune
  const TUNES = {
    menu: { bpm: 112, mel: [72, 0, 76, 79, 77, 0, 76, 74, 72, 0, 74, 76, 79, 0, 76, 0], bass: [48, 48, 55, 55, 53, 53, 55, 55] },
    mission: { bpm: 150, mel: [76, 79, 81, 79, 76, 0, 74, 76, 72, 74, 76, 0, 79, 81, 84, 0], bass: [45, 45, 52, 52, 50, 50, 52, 52] }
  };
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function startMusic(mode) {
    if (!ctx || musicMode === mode) return;
    stopMusic(); musicMode = mode; musicStep = 0;
    const tune = TUNES[mode], stepDur = 60 / tune.bpm / 2;
    musicTimer = setInterval(() => {
      const i = musicStep % 16, m = tune.mel[i];
      if (m) tone('triangle', hz(m), 0, stepDur * 0.9, 0.5, 0, music);
      if (i % 2 === 0) tone('sine', hz(tune.bass[(i / 2) % 8]), 0, stepDur * 1.8, 0.7, 0, music);
      musicStep++;
    }, stepDur * 1000);
  }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; musicMode = null; }

  window.SOUND = {
    init, load, play, playVoice, stopVoice, startMusic, stopMusic,
    setVol(k, v) { vol[k] = v; apply(); },
    getVol: () => ({ ...vol }),
    setMuted(m) { muted = m; apply(); },
    isMuted: () => muted
  };
})();
