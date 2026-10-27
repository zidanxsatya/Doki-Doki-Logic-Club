/* ===== core.js : utilitas, atlas XML, karakter, audio, dialog, gerbang logika ===== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.random() * a.length | 0];
const rnd = () => Math.random() < .5 ? 0 : 1;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]] } return a };
const bag = a => { let q = []; return () => (q.length || (q = shuffle(a)), q.pop()) }; // acak tanpa ulang sampai semua terpakai
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } } };

/* ---------- Atlas (PNG + XML Sparrow) ---------- */
const _img = {}, _atl = {};
const loadImg = s => _img[s] ??= new Promise((ok, no) => { const i = new Image(); i.onload = () => (i.decode ? i.decode().catch(() => { }) : Promise.resolve()).then(() => ok(i)); i.onerror = no; i.src = s });
const loadAtlas = base => _atl[base] ??= (async () => {
  const [img, txt] = await Promise.all([loadImg(base + '.webp'), fetch(base + '.xml').then(r => r.text())]);
  const doc = new DOMParser().parseFromString(txt.replace(/^\uFEFF/, ''), 'text/xml');
  const list = [...doc.getElementsByTagName('SubTexture')].map(e => {
    const g = k => +e.getAttribute(k) || 0;
    return { n: e.getAttribute('name'), x: g('x'), y: g('y'), w: g('width'), h: g('height'), fx: g('frameX'), fy: g('frameY') };
  }).sort((a, b) => a.n < b.n ? -1 : 1);
  return { img, list };
})();

/* ---------- Actor: pemutar animasi di <canvas> ---------- */
class Actor {
  // anims: { key: {name:'prefix XML', indices:[], offsets:[x,y], fps, loop} }
  constructor(atlas, anims) {
    this.atlas = atlas; this.anims = {}; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [k, d] of Object.entries(anims)) {
      let fr = atlas.list.filter(f => f.n.startsWith(d.name));
      if (d.indices && d.indices.length) fr = d.indices.map(i => fr[i]).filter(Boolean);
      if (!fr.length) continue;
      const o = d.offsets || [0, 0];
      this.anims[k] = { fr, o, fps: d.fps || 24, loop: !!d.loop };
      for (const f of fr) { const dx = -o[0] - f.fx, dy = -o[1] - f.fy; x0 = Math.min(x0, dx); y0 = Math.min(y0, dy); x1 = Math.max(x1, dx + f.w); y1 = Math.max(y1, dy + f.h) }
    }
    this.b = [x0, y0];
    const c = this.canvas = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0; this.ctx = c.getContext('2d');
    this.cur = null; this.t = 0; this.fi = -1;
  }
  play(name, o = {}) {
    const a = this.anims[name]; if (!a) return;
    this.cur = a; this.loop = o.loop ?? a.loop; this.then = o.then || null; this.t = 0; this.fi = -1; this.done = false; this.tick(0);
  }
  tick(dt) {
    const a = this.cur; if (!a) return; this.t += dt;
    let i = Math.floor(this.t * a.fps); const n = a.fr.length;
    if (i >= n) {
      if (this.loop) i %= n;
      else { i = n - 1; if (!this.done) { this.done = true; if (this.then) { const t = this.then; this.then = null; this.play(t.name, t.opts); return } } }
    }
    if (i !== this.fi) {
      this.fi = i; const f = a.fr[i];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.atlas.img, f.x, f.y, f.w, f.h, -a.o[0] - f.fx - this.b[0], -a.o[1] - f.fy - this.b[1], f.w, f.h);
    }
  }
  start() { Actor.live.add(this) } stop() { Actor.live.delete(this) }
}
Actor.live = new Set();
(() => { let last = performance.now(); const loop = n => { const dt = Math.min((n - last) / 1000, .1); last = n; Actor.live.forEach(a => a.tick(dt)); requestAnimationFrame(loop) }; requestAnimationFrame(loop) })();

/* ---------- Character: API sederhana di atas Actor ----------
   character.setExpression("happy"); character.playAnimation("singLEFT"); character.idle(); */
const CHARS = {
  sayori: { name: 'Sayori', sc: .8, color: '#95e0fa', dk: '#1d5f8a', expr: { neutral: 'idle', happy: 'singLEFT', talk: 'singRIGHT', calm: 'singDOWN', cheer: 'singUP', sad: 'nara' } },
  yuri: { name: 'Yuri', sc: .78, color: '#b394e0', dk: '#432a86', expr: { neutral: 'idle', shy: 'singLEFT', talk: 'singRIGHT', happy: 'singUP', explain: 'singDOWN', breath: 'breath' } },
  natsuki: { name: 'Natsuki', sc: .83, color: '#fc95d3', dk: '#8c1c63', expr: { neutral: 'idle', smug: 'singLEFT', talk: 'singRIGHT', angry: 'singDOWN', happy: 'singUP', hmph: 'hmmph' } },
  monika: { name: 'Monika', sc: .6, color: '#8cd465', dk: '#1e6a2e', expr: { neutral: 'idle', talk: 'singLEFT', happy: 'singRIGHT', cheer: 'singDOWN', wink: 'singUP' } }
};
class Character {
  constructor(key, actor) { this.key = key; this.actor = actor; this.cfg = CHARS[key]; actor.canvas.style.height = actor.canvas.height * this.cfg.sc + 'px' }
  static async load(key) {
    const cfg = await fetch(`assets/data/${key}.json`).then(r => r.json());
    const atlas = await loadAtlas('assets/img/' + cfg.image.split('/').pop());
    const anims = {};
    cfg.animations.forEach(a => anims[a.anim] = { name: a.name, indices: a.indices, offsets: a.offsets, fps: a.fps, loop: a.loop });
    if (!anims.idle && anims.danceLeft) anims.idle = { ...anims.danceLeft, indices: [...anims.danceLeft.indices, ...anims.danceRight.indices] };
    anims.idle.fps = 12; anims.idle.loop = true;
    return new Character(key, new Actor(atlas, anims));
  }
  mount(el) {
    el.appendChild(this.actor.canvas); this.actor.start(); this.idle();
    if (this.actor.anims.breath) this.bi = setInterval(() => { if (this.actor.cur === this.actor.anims.idle) this.playAnimation('breath') }, 7000); // variasi idle Yuri
  }
  unmount() { clearInterval(this.bi); this.actor.canvas.remove(); this.actor.stop() }
  idle() { this.actor.play('idle', { loop: true }) }
  playAnimation(name, o = {}) { this.actor.play(name, { then: { name: 'idle', opts: { loop: true } }, ...o }) }
  setExpression(e) { const a = this.cfg.expr[e] || 'idle'; a === 'idle' ? this.idle() : this.playAnimation(a) } // main sekali, lalu kembali idle
}

/* ---------- Audio: satu musik aktif, fade antar halaman ---------- */
const clamp01 = v => Math.max(0, Math.min(1, v));
const Snd = {
  m: null, cur: null, mg: 1, MG: { A_Story_of_Everyday_Life: .55, A_Wonderful_Happening: .55 }, mv: .55, sv: .7, muted: false, ac: null, g: null, buf: {}, last: {}, // mv = volume MUSIK, sv = volume EFEK SUARA (diatur di Pengaturan, saling terpisah)
  // fade berbasis waktu pada pengali per-lagu a._k (0..1); volume nyata = _k * slider musik * gain lagu -> slider tetap berlaku di tengah transisi
  apply(a) { a.volume = clamp01(a._k * this.mv * a._g) },
  fade(a, k1, cb, ms = 900) { clearInterval(a._iv); const k0 = a._k, t0 = performance.now(); a._iv = setInterval(() => { const t = Math.min(1, (performance.now() - t0) / ms); a._k = k0 + (k1 - k0) * t * t * (3 - 2 * t); this.apply(a); if (t >= 1) { clearInterval(a._iv); cb && cb() } }, 30) },
  // ---- SFX latensi rendah: semua file didecode SEKALI di awal (preload) lalu diputar lewat Web Audio (tanpa membuat objek Audio per bunyi) ----
  async preload(names = ['scrollMenu', 'select', 'cancelMenu', 'openOS', 'metronomeBar', 'metronomeBeat', 'flip_page', 'confirmMenu']) {
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OC) return;   // decode tanpa AudioContext -> tidak butuh gestur pengguna
    const oc = new OC(2, 1, 44100);
    await Promise.all(names.map(async n => {
      try {
        const ab = await (await fetch(`assets/audio/${n}.ogg`)).arrayBuffer();
        this.buf[n] = await new Promise((ok, no) => { const p = oc.decodeAudioData(ab, ok, no); p && p.catch && p.catch(no) });
      } catch (e) { /* gagal -> pakai HTMLAudio cadangan */ }
    }));
  },
  unlock() { // dipanggil dari gestur pengguna (klik/tap/tombol): buat & resume AudioContext sesuai kebijakan autoplay
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!this.ac) { try { this.ac = new AC({ latencyHint: 'interactive' }) } catch (e) { this.ac = new AC() } this.g = this.ac.createGain(); this.g.connect(this.ac.destination) }
    if (this.ac.state !== 'running') this.ac.resume().catch(() => { });
  },
  sfx(n) {
    if (this.muted || this.sv <= 0) return;
    const t = performance.now(); if (t - (this.last[n] || -1e9) < 35) return; this.last[n] = t;      // cegah bunyi ganda hampir bersamaan
    const b = this.buf[n], c = this.ac;
    if (b && c && c.state === 'running') { const s = c.createBufferSource(); s.buffer = b; this.g.gain.value = clamp01(this.sv); s.connect(this.g); s.start(0); return }   // volume SFX dari Pengaturan
    const a = new Audio(`assets/audio/${n}.ogg`); a.volume = clamp01(this.sv); a.play().catch(() => { });   // cadangan (perilaku lama) bila Web Audio belum siap
  },
  tick() { // tick ketikan dialog: bip sintetis ~35 ms (tanpa file), volume mengikuti slider SFX, diam saat mute / AudioContext belum aktif
    const c = this.ac; if (this.muted || this.sv <= 0 || !c || c.state !== 'running') return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = 'triangle'; o.frequency.value = 480 + Math.random() * 90;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07 * clamp01(this.sv), t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .035);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .04);
  },
  music(n) {
    if (this.cur === n) return; this.cur = n; const old = this.m, g = this.MG[n] || 1, slow = g < 1 || (old && old._g < 1);   // lagu Mode Cerita: lebih keras di sumbernya (~-10 LUFS vs BGM ~-15.6) -> diturunkan & fade lebih lambat
    const a = new Audio(`assets/audio/${n}.ogg`); a.loop = true; a._k = 0; a._g = g; a.muted = this.muted; this.apply(a); this.m = a; this.mg = g; a.play().catch(() => { });
    if (old) { clearTimeout(old._to); this.fade(old, 0, () => { old.pause() }, slow ? 700 : 500) }   // lagu lama keluar dulu, lagu baru masuk setelah lagu lama setengah turun: tanpa celah sunyi, tanpa dua lagu penuh bertumpuk
    a._to = setTimeout(() => this.fade(a, 1, null, slow ? 1500 : 1000), old ? 300 : 0);
  },
  setMusic(v) { this.mv = clamp01(v); if (this.m) this.apply(this.m) }, // hanya memengaruhi musik latar (lagu yang sedang fade-out ikut lewat apply di tiap langkah fade)
  setSfx(v) { this.sv = clamp01(v) },                                         // hanya memengaruhi efek suara
  mute() { this.muted = !this.muted; if (this.m) this.m.muted = this.muted; return this.muted }
};

['pointerdown', 'touchend', 'keydown', 'click'].forEach(ev => addEventListener(ev, () => Snd.unlock(), { capture: true, passive: true }));

/* ---------- Dialogue box (Text_Boxes.png/xml: satu kotak per karakter, label nama sudah menyatu) ---------- */
const BOX = { sayori: 'Doki Dialogue Sayo0000', yuri: 'Doki Dialogue Yuri0000', natsuki: 'Doki Dialogue Natsu0000', monika: 'Doki Dialogue Moni0000' };
class Dialogue {
  constructor(el, ch, cast = null) { // cast (Mode Cerita): { sayori, yuri, natsuki, monika } -> beberapa pembicara; baris dialog boleh [teks, ekspresi, siapa]
    this.el = el; this.ch = ch; this.cast = cast; this.base = ch.key; this.q = []; this.typing = false; el.style.setProperty('--tc', ch.cfg.dk);
    el.innerHTML = '<canvas class="box"></canvas><div class="tx"><span class="r"></span><span class="h"></span></div><div class="nx">▼</div>';
    this.tx = $('.tx', el); this.r = $('.r', el); this.hd = $('.h', el); this.nx = $('.nx', el);
    loadAtlas('assets/img/Text_Boxes').then(at => { if (this.dead) return; this.at = at; this.f = at.list.find(x => x.n === BOX[this.ch.key]); this.paint() });
    this.onLayout = () => { this.paint(); this.fit() }; addEventListener('layoutchange', this.onLayout);
    el.onclick = () => this.advance();
  }
  // Layout potret (ponsel): bagian tengah kotak diregangkan secara vertikal agar teks muat; bagian label & tepi tetap proporsional
  paint() {
    const f = this.f, c = $('.box', this.el); if (!f || !c) return;
    const ctx = c.getContext('2d'), img = this.at.img, T = 52, B = 152, k = Layout.mobile && Layout.portrait ? 1.8 : 1;
    if (k === 1) { c.width = f.w; c.height = f.h; ctx.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); return }
    const mh = Math.round((B - T) * k); c.width = f.w; c.height = T + mh + (f.h - B);
    ctx.drawImage(img, f.x, f.y, f.w, T, 0, 0, f.w, T); ctx.drawImage(img, f.x, f.y + T, f.w, B - T, 0, T, f.w, mh); ctx.drawImage(img, f.x, f.y + B, f.w, f.h - B, 0, T + mh, f.w, f.h - B);
  }
  say(lines, onDone) { this.q = lines.map(l => typeof l === 'string' ? [l] : l); this.onDone = onDone; this.next() }
  line(t, e) { this.say([[t, e]]) }
  // Teks penuh ditaruh di span tersembunyi sejak awal -> tata letak tetap, kata tidak melompat saat diketik
  next() {
    const [t0, e, who] = this.q.shift(), t = t0.replace(/(\w)-(\w)/g, '$1-\u2060$2'); let sw = false;
    if (this.cast && (who || this.base) !== this.ch.key) { this.speaker(who || this.base); sw = true }   // ganti pembicara: kotak dialog, warna, potret/sprite
    if (e) this.ch.setExpression(e); else if (sw || (this.cast && !this.shown)) this.ch.setExpression('neutral'); this.shown = true;
    this.full = t; this.r.textContent = ''; this.hd.textContent = t; this.fit(); let i = 0; this.typing = true; this.nx.style.visibility = 'hidden'; clearInterval(this.iv);
    this.iv = setInterval(() => { i++; this.r.textContent = t.slice(0, i); this.hd.textContent = t.slice(i); if (i % 3 === 1 && t[i - 1] !== ' ') Snd.tick(); if (i >= t.length) this.fin() }, 18);
  }
  speaker(k) {
    this.ch = this.cast[k]; this.el.style.setProperty('--tc', this.ch.cfg.dk);
    if (this.at) { this.f = this.at.list.find(x => x.n === BOX[k]); this.paint() }
    this.onSpeaker && this.onSpeaker(k);
  }
  fit() { let s = parseFloat(getComputedStyle(this.tx).getPropertyValue('--fs')) || 24; this.tx.style.fontSize = s + 'px'; while (this.tx.scrollHeight > this.tx.clientHeight + 1 && s > 12) this.tx.style.fontSize = (--s) + 'px' }
  fin() { clearInterval(this.iv); this.r.textContent = this.full; this.hd.textContent = ''; this.typing = false; this.nx.style.visibility = this.q.length ? 'visible' : 'hidden' }
  advance() { if (this.typing) this.fin(); else if (this.q.length) { Snd.sfx('select'); this.next() } else if (this.onDone) { const f = this.onDone; this.onDone = null; f() } }
  destroy() { this.dead = true; clearInterval(this.iv); removeEventListener('layoutchange', this.onLayout) }
}

/* ---------- Gerbang logika ---------- */
const F = { AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: a => +!a, NAND: (a, b) => +!(a & b), NOR: (a, b) => +!(a | b), XOR: (a, b) => a ^ b, XNOR: (a, b) => +!(a ^ b) };
const GL = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
const nb = s => `<span class="ov">${s}</span>`;   // NOT = garis di atas ekspresi (tanpa ' atau ¬)
const FORM = { AND: 'Y = A · B', OR: 'Y = A + B', NOT: `Y = ${nb('A')}`, NAND: `Y = ${nb('A · B')}`, NOR: `Y = ${nb('A + B')}`, XOR: 'Y = A ⊕ B', XNOR: `Y = ${nb('A ⊕ B')}` };
const INK = '#4a2040', wc = v => v == null ? INK : v ? '#18b04a' : '#b9a9c8';
const gBody = g => g === 'NOT' ? 'M52 15V85L118 50Z' : /AND/.test(g) ? 'M52 15H92A35 35 0 0 1 92 85H52Z' : 'M47 15Q82 15 130 50Q82 85 47 85Q70 50 47 15Z';   // bentuk badan gerbang (dipakai juga oleh Simulasi+)
// a,b,o: 0/1 atau null (tidak diketahui). sw=true -> saklar input bisa diklik (.sw[data-i])
// Nama gerbang selalu di ATAS gerbang (bukan di dalam badan gerbang). Gaya: Materi (a null) = LED kuning, Latihan (a angka, o null) = keluaran "?", Simulasi (sw) = saklar + LED menyala.
function gateSVG(g, a, b, o, sw) {
  const two = g !== 'NOT', neg = /^(NAND|NOR|XNOR|NOT)$/.test(g), ys = two ? [32, 68] : [50], vs = [a, b], known = a != null;
  const body = gBody(g);
  const tip = g === 'NOT' ? 118 : /AND/.test(g) ? 127 : 130, ox = tip + (neg ? 12 : 0), gx = g === 'NOT' ? 85 : 88;
  let s = '<svg class="gate' + (sw ? ' sim' : '') + '" viewBox="-52 -22 340 130">';
  ys.forEach((y, i) => {
    const wire = sw ? wc(vs[i]) : INK;
    s += `<path d="M${sw ? 20 : -14} ${y}H58" stroke="${wire}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (sw) s += `<g class="sw" data-i="${i}" role="button" aria-label="Input ${'AB'[i]} = ${vs[i]}"><circle cx="-40" cy="${y}" r="11" fill="${INK}"/><text x="-40" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${'AB'[i]}</text><rect class="swp" x="-24" y="${y - 13}" width="52" height="26" rx="13" fill="${vs[i] ? '#ff7eb6' : '#e6dcf5'}" stroke="${INK}" stroke-width="2.5"/><circle cx="${vs[i] ? 15 : -11}" cy="${y}" r="9" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="${vs[i] ? 15 : -11}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${vs[i]}</text></g>`;
    else if (known) s += `<rect x="-50" y="${y - 12}" width="50" height="24" rx="12" fill="${INK}"/><text x="-38" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${'AB'[i]}</text><circle cx="-14" cy="${y}" r="9" fill="#ffd54a" stroke="${INK}" stroke-width="1.5"/><text x="-14" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${vs[i]}</text>`;
    else s += `<text x="-34" y="${y + 6}" font-size="16" font-weight="800" text-anchor="middle" fill="${INK}">${'AB'[i]}</text>`;
  });
  s += `<path d="M${ox} 50H${sw || known ? 244 : 256}" stroke="${sw ? wc(o) : INK}" stroke-width="5" stroke-linecap="round"/>`;
  if (g.startsWith('X')) s += `<path d="M36 15Q59 50 36 85" fill="none" stroke="${INK}" stroke-width="4"/>`;
  s += `<path d="${body}" fill="#ffd1e6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  if (neg) s += `<circle cx="${tip + 6}" cy="50" r="6" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  // nama gerbang di atas
  s += sw ? `<rect x="${gx - 24}" y="-20" width="48" height="22" rx="11" fill="${INK}"/><text x="${gx}" y="-4.5" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${g}</text>`
    : `<text x="${gx}" y="2" font-size="15" font-weight="800" fill="${INK}" text-anchor="middle">${g}</text>`;
  // keluaran
  if (sw) {
    if (o) s += [0, 45, 90, 135, 180, 225, 270, 315].map(r => `<line class="ray" x1="272" y1="25" x2="272" y2="17" transform="rotate(${r} 272 50)" stroke="#ff4d6d" stroke-width="3" stroke-linecap="round"/>`).join('');
    s += `<circle class="${o ? 'led lit' : 'led'}" cx="272" cy="50" r="14" fill="${o ? '#ff8fb0' : '#e6dcf5'}" stroke="${INK}" stroke-width="3" style="${o ? 'filter:drop-shadow(0 0 8px #ff4d6d)' : ''}"/><text x="272" y="100" font-size="12" font-weight="800" fill="${o ? '#ff4d6d' : INK}" text-anchor="middle">${o ? 'LED NYALA' : 'LED MATI'}</text>`;
  } else if (known) s += `<circle cx="262" cy="50" r="20" fill="#fff" stroke="${INK}" stroke-width="3" stroke-dasharray="5 4"/><text x="262" y="59" font-size="24" font-weight="800" fill="#ff7eb6" text-anchor="middle">?</text><text x="262" y="92" font-size="13" font-weight="800" fill="${INK}" text-anchor="middle">Y</text>`;
  else s += `<circle cx="264" cy="50" r="13" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><text x="264" y="26" font-size="12" font-weight="800" fill="${INK}" text-anchor="middle">LED</text><text x="264" y="86" font-size="14" font-weight="800" fill="${INK}" text-anchor="middle">Y</text>`;
  return s + '</svg>';
}
// Rangkaian bergambar simbol gerbang (pengganti kotak+panah). g2 opsional: 'NOT' atau gerbang 2 input yang menerima input C.
// o.t = label input {A:'A = 1'} (pil), o.names = nama gerbang di atas simbol, o.out = label output, o.alt = teks alternatif
function circ(g1, g2, o = {}) {
  const T = o.t, L = T ? 64 : 34, out = o.out || 'Y', tip = g => g === 'NOT' ? 118 : /AND/.test(g) ? 127 : 130, neg = g => /^(NAND|NOR|XNOR|NOT)$/.test(g), end = g => tip(g) + (neg(g) ? 12 : 0);
  const x1 = L + 8, X1 = x1 + end(g1), two2 = g2 && g2 !== 'NOT', c2 = two2 ? 88 : 50, x2 = X1 + 10, gl = g2 || g1, xl = g2 ? x2 : x1, XE = xl + end(gl), cl = g2 ? c2 : 50, W = XE + 36 + 14 + out.length * 12;
  const line = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`, tx = (t, x, y, a = 'middle', c = INK) => `<text x="${x}" y="${y}" font-size="20" font-weight="800" fill="${c}" text-anchor="${a}">${t}</text>`;
  const pin = (n, y, x) => line(`M${L} ${y}H${x}`) + (T ? `<rect x="2" y="${y - 14}" width="${L - 8}" height="28" rx="14" fill="${INK}"/>` + tx(T[n], (L - 4) / 2 + 2, y + 6, 'middle', '#fff').replace('20"', '16"') : tx(n, L - 12, y + 7, 'end'));
  const gate = (g, x, c) => `<g transform="translate(${x} ${c - 50})">${g[0] === 'X' ? `<path d="M36 15Q59 50 36 85" fill="none" stroke="${INK}" stroke-width="4"/>` : ''}<path d="${gBody(g)}" fill="#ffd1e6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>${neg(g) ? `<circle cx="${tip(g) + 6}" cy="50" r="6" fill="#fff" stroke="${INK}" stroke-width="4"/>` : ''}${o.names ? tx(g, g === 'NOT' ? 85 : 88, 2).replace('20"', '16"') : ''}</g>`;
  let s = g1 === 'NOT' ? pin('A', 50, x1 + 58) : pin('A', 32, x1 + 58) + pin('B', 68, x1 + 58);
  s += line(`M${X1} 50` + (g2 ? (two2 ? `H${X1 + 34}V${c2 - 18}` : '') + `H${x2 + 58}` : `H${XE + 36}`));
  if (g2) s += (two2 ? pin('C', c2 + 18, x2 + 58) : '') + line(`M${XE} ${cl}H${XE + 36}`);
  s += gate(g1, x1, 50) + (g2 ? gate(g2, x2, c2) : '') + tx(out, XE + 46, cl + 7, 'start');
  return `<svg class="gate circ" viewBox="0 -14 ${W} ${two2 ? 140 : 100}" style="width:${Math.round(W * .8)}px" role="img" aria-label="${o.alt || 'Gambar rangkaian logika'}">${s}</svg>`;
}
const tt = (g, hl = -1) => g === 'NOT'
  ? `<table class="tt"><tr><th>A</th><th>Y</th></tr>${[0, 1].map(a => `<tr class="${a === hl ? 'hl' : ''}"><td>${a}</td><td>${F.NOT(a)}</td></tr>`).join('')}</table>`
  : `<table class="tt"><tr><th>A</th><th>B</th><th>Y</th></tr>${[0, 1, 2, 3].map(i => `<tr class="${i === hl ? 'hl' : ''}"><td>${i >> 1}</td><td>${i & 1}</td><td>${F[g](i >> 1, i & 1)}</td></tr>`).join('')}</table>`;

/* ---------- Efek sparkle ---------- */
function spark(e, n = 6) {
  const st = $('#stage'), r = st.getBoundingClientRect(), k = r.width / st.offsetWidth, x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'sp'; s.textContent = '✦';
    s.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.random() - .5) * 130}px;--dy:${(Math.random() - .85) * 130}px;color:${pick(['#ffd54a', '#ff7eb6', '#8cd4ff', '#fff'])}`;
    st.appendChild(s); setTimeout(() => s.remove(), 700);
  }
}
