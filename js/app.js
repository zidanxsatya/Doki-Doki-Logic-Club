/* ===== app.js : navigasi, menu, dan keempat mode ===== */
const stage = $('#stage'), chars = {}, SC = {};
let warm = Promise.resolve();
let scene = null, together = null, busy = false;
const M = {
  materi: { id: 'materi', label: 'MATERI', key: 'sayori', music: 'sayoc', bg: 'DDLCbg', sub: 'Belajar dasar bersama kelas' },
  simulasi: { id: 'simulasi', label: 'SIMULASI', key: 'yuri', music: 'yuric', bg: 'DDLCbg', sub: 'Coba gerbang logika' },
  latihan: { id: 'latihan', label: 'LATIHAN', key: 'natsuki', music: 'natsc', bg: 'Music_Room', sub: 'Asah kemampuanmu' },
  evaluasi: { id: 'evaluasi', label: 'EVALUASI', key: 'monika', music: 'monic', bg: 'Music_Room', sub: '10 soal penilaian akhir' }
};
const MODES = [M.materi, M.simulasi, M.latihan, M.evaluasi];
const Journey = { prev: null, last: null }; // mode terakhir yang dikunjungi, agar karakter bisa bereaksi saat pemain berpindah bagian


/* ---------- pindah layar (fade + ganti musik) ---------- */
async function go(id) {
  if (busy) return; busy = true;
  const f = $('#fade'); f.classList.add('on'); await wait(380);
  if (id !== 'menu' && id !== 'settings') await warm;   // aset karakter dimuat di latar belakang setelah MULAI aktif
  if (scene) { scene.cleanup(); scene = null }
  $$('.screen').forEach(s => s.classList.remove('on'));
  if (id === 'menu') { buildMenu(); Snd.music('Lunchbox') }
  else if (id === 'settings') buildSettings();   // musik menu tetap berjalan
  else { Journey.prev = Journey.last; Journey.last = id; SC[id](); Snd.music(M[id].music) }
  await wait(60); f.classList.remove('on'); busy = false;
}

/* ---------- menu utama ---------- */
function buildMenu() {
  const el = $('#menu');
  el.innerHTML = `<div class="mbg"></div><div class="mtitle"><small>TEKNIK KONTROL MEKATRONIKA</small><h1>DOKI DOKI<br>LOGIC CLUB</h1><h2>★ Rangkaian Logika ★</h2></div>
  <div class="mlist">${MODES.map((m, i) => `<button class="mbtn" data-i="${i}" data-k="${m.key}"><i>▶</i><b>${m.label}</b><span>${CHARS[m.key].name} · ${m.sub}</span></button>`).join('')}</div>
  <div class="mchar"></div>
  <button class="btn setbtn" id="setb">⚙ PENGATURAN</button>`;
  $('.mchar', el).appendChild(together.canvas); together.start(); together.play('t', { loop: true });
  $('#setb').onclick = () => { Snd.sfx('select'); go('settings') };
  const btns = $$('.mbtn', el); let sel = -1;
  const set = (i, snd = true) => { if (i === sel) return; sel = i; btns.forEach((b, k) => b.classList.toggle('sel', k === i)); if (snd) Snd.sfx('scrollMenu') }; // snd=false untuk mouse (suara hover ditangani global)
  btns.forEach((b, i) => { b.onmouseenter = e => { set(i, false); spark(e, 5) }; b.onclick = e => { spark(e, 14); Snd.sfx('select'); go(MODES[i].id) } });
  document.onkeydown = e => {
    if (!el.classList.contains('on')) return;
    if (e.key === 'ArrowDown') set((sel + 1) % 4); else if (e.key === 'ArrowUp') set((sel + 3) % 4); else if (e.key === 'Enter' && sel >= 0) btns[sel].click();
  };
  scene = { cleanup() { together.stop(); together.canvas.remove(); document.onkeydown = null } };
  el.classList.add('on');
}

/* ---------- PENGATURAN: volume musik, volume efek, mode tampilan, tata letak (tersimpan di localStorage) ---------- */
function buildSettings() {
  const el = $('#settings'), cfg = Settings.data;
  el.innerHTML = `<div class="mbg"></div><div class="top"><button class="btn sm" id="sback">◀ MENU</button><b id="stitle">PENGATURAN</b></div>
  <div class="setcard">
    <div class="srow"><label>🎵 Volume Musik <b id="mvv"></b></label><input type="range" id="mv" min="0" max="100" step="1" aria-label="Volume Musik"></div>
    <div class="srow"><label>🔊 Volume Efek Suara <b id="svv"></b></label><input type="range" id="sv" min="0" max="100" step="1" aria-label="Volume Efek Suara"></div>
    <div class="srow"><label>🖥️ Mode Tampilan</label><div class="seg" id="sdisp"><button class="btn sm" data-v="window">Jendela</button><button class="btn sm" data-v="full">Desktop Fullscreen</button></div><small id="fsn"></small></div>
    <div class="srow"><label>📱 Tata Letak</label><div class="seg" id="slay"><button class="btn sm" data-v="auto">Otomatis</button><button class="btn sm" data-v="desktop">Desktop</button><button class="btn sm" data-v="mobile">Mobile / Android</button></div><small>Otomatis menyesuaikan ukuran layar. Pilih Mobile / Android untuk tampilan ponsel.</small></div>
  </div>
  <div class="setcard credcard" hidden>
    <p class="cnote">${CREDIT.note}</p>
    <div class="cgrid">${CREDIT.people.map(c => `<div class="cp" data-k="${c.img}"><img src="assets/img/credit/${c.img}.png" alt="" width="72" height="72"><b>${c.name}</b><small>${c.role}</small></div>`).join('')}</div>
  </div>
  <button class="credlink" id="scred">Credit</button>`;
  const cred = $('.credcard'), main = $('.setcard:not(.credcard)'), showCred = on => { cred.hidden = !on; main.hidden = on; $('#stitle').textContent = on ? 'CREDIT' : 'PENGATURAN'; $('#scred').textContent = on ? 'Pengaturan' : 'Credit' };
  $('#scred').onclick = () => { Snd.sfx('select'); showCred(cred.hidden) };
  const mv = $('#mv'), sv = $('#sv'), paint = (r, lab) => { r.style.setProperty('--p', r.value + '%'); $(lab).textContent = r.value + '%' };
  mv.value = Math.round(cfg.music * 100); sv.value = Math.round(cfg.sfx * 100); paint(mv, '#mvv'); paint(sv, '#svv');
  mv.oninput = () => { paint(mv, '#mvv'); Snd.setMusic(mv.value / 100); Settings.set('music', Snd.mv) };   // hanya musik latar
  sv.oninput = () => { paint(sv, '#svv'); Snd.setSfx(sv.value / 100); Settings.set('sfx', Snd.sv) };       // hanya efek suara
  sv.onchange = () => Snd.sfx('select');                                                                  // contoh suara efek
  const mark = () => {
    $$('#sdisp .btn').forEach(b => { b.classList.toggle('on', b.dataset.v === (Full.on ? 'full' : 'window')); if (b.dataset.v === 'full') b.disabled = !Full.ok });
    $$('#slay .btn').forEach(b => b.classList.toggle('on', b.dataset.v === Settings.data.layout));
    $('#fsn').textContent = Full.ok ? '' : 'Browser ini tidak mendukung layar penuh (misalnya iPhone/iPad). Di Android, gunakan Chrome.';
  };
  $('#sdisp').onclick = async e => { const b = e.target.closest('.btn'); if (!b || b.disabled) return; Snd.sfx('select'); await Full.set(b.dataset.v === 'full'); Settings.set('display', Full.on ? 'full' : 'window'); mark() };
  $('#slay').onclick = e => { const b = e.target.closest('.btn'); if (!b) return; Snd.sfx('select'); Settings.set('layout', b.dataset.v); Layout.apply(); mark() };
  addEventListener('settingschange', mark);
  const back = () => { Snd.sfx('cancelMenu'); cred.hidden ? go('menu') : showCred(false) };
  $('#sback').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  scene = { cleanup() { removeEventListener('settingschange', mark); document.onkeydown = null; el.innerHTML = '' } };
  mark(); el.classList.add('on');
}

/* ---------- kerangka scene umum (latar kelas + karakter + dialog) ---------- */
function scaffold(id) {
  const m = M[id], el = $('#scene'), ch = chars[m.key];
  el.innerHTML = `<div class="bg" data-b="${m.bg}" style="background-image:url(assets/img/${m.bg}.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>${m.label}</b><i class="hintc">💬 klik karakter untuk ngobrol</i></div><div id="panel" class="panel"></div><div class="cw"></div><div class="dlg"></div>`;
  ch.mount($('.cw', el)); const d = new Dialogue($('.dlg', el), ch), chat = bag(D[m.key].chat);
  // obrolan bebas: karakter bicara di luar topik saat pemain diam ~25 dtk, atau saat karakternya diklik
  let last = performance.now(); const act = () => { last = performance.now() }, talk = () => { const [t, e] = chat(); d.line(t, e) };
  addEventListener('pointerdown', act, true); addEventListener('keydown', act, true);
  const idle = setInterval(() => { if (performance.now() - last > 25000 && !d.typing && !d.q.length) { last = performance.now(); talk() } }, 2000);
  let pk = 0, pkT = 0; // klik karakter berulang cepat (>=3x dalam ~2,6 dtk) -> reaksi khusus karakter
  $('.cw', el).onclick = () => {
    const now = performance.now(); if (!d.q.length) { pk = now - pkT < 2600 ? pk + 1 : 1; pkT = now } // klik yang hanya mempercepat ketikan juga terhitung
    if (d.typing || d.q.length) { d.advance(); return }
    Snd.sfx('select');
    if (pk >= 3 && D[m.key].poke) { const [t, e] = pick(D[m.key].poke); d.line(t, e) } else talk();
  };
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  el.classList.add('on');
  scene = { cleanup() { clearInterval(idle); removeEventListener('pointerdown', act, true); removeEventListener('keydown', act, true); ch.unmount(); d.destroy(); el.innerHTML = ''; document.onkeydown = null } };
  return { ch, d, panel: $('#panel'), chat };
}
const startCard = (S, title, desc, onGo) => {
  S.panel.innerHTML = `<div class="startcard"><h2>${title}</h2><p>${desc}</p><button class="btn big" id="go">MULAI ▶</button></div>`;
  $('#go').onclick = () => { Snd.sfx('select'); onGo() };
};

/* ---------- reaksi karakter saat pemain datang dari bagian lain & terhadap skor terbaik yang tersimpan ---------- */
const entryExtra = key => {
  const d = D[key], f = d.from && d.from[Journey.prev], b = key === 'natsuki' ? store.get('tkm_latihan_best', 0) : key === 'monika' ? store.get('tkm_eval_best', null) : 0;
  const ln = f ? pick(f) : null, bl = d.enterBest && b ? pick(d.enterBest) : null, bw = bl ? [bl[0].replace('{b}', b), bl[1]] : null;
  return ln && bw ? [Math.random() < .5 ? ln : bw] : ln ? [ln] : bw ? [bw] : [];
};

/* ---------- MATERI (Sayori) ---------- */
SC.materi = () => {
  const S = scaffold('materi'); let p = 0, lastFlip = 0; const seen = new Set(), ms = new Set();
  const flipLine = () => { const now = performance.now(), fast = now - lastFlip < 2500; lastFlip = now; return fast && Math.random() < .6 ? [[pick(D.sayori.flipFast), 'happy']] : [] }; // pemain membalik halaman terlalu cepat
  const show = (intro = []) => {
    const P = MATERI[p];
    S.panel.innerHTML = `<div class="board"><div class="bt">${p + 1}. ${P.t}</div><div class="bb">${P.html}</div></div>
    <div class="nav"><button class="btn" id="pv">◀ SEBELUMNYA</button><span>${p + 1} / ${MATERI.length}</span><button class="btn" id="nx">SELANJUTNYA ▶</button></div>`;
    const pv = $('#pv'), nx = $('#nx'); pv.disabled = !p; nx.disabled = p === MATERI.length - 1;
    pv.onclick = () => { p--; Snd.sfx('flip_page'); show(flipLine()) }; nx.onclick = () => { p++; Snd.sfx('flip_page'); show(flipLine()) };
    const ex = Math.random() < .3 ? S.chat() : [pick(D.sayori.ex[p]), pick(['happy', 'talk', 'cheer'])];
    const extra = []; // tonggak kemajuan: separuh jalan & halaman terakhir
    if (p === 5 && !ms.has('h')) { ms.add('h'); extra.push([pick(D.sayori.half), 'cheer']) }
    if (p === MATERI.length - 1 && !ms.has('e')) { ms.add('e'); extra.push([pick(D.sayori.end), 'happy']) }
    S.d.say([...intro, ...(seen.has(p) ? [[pick(D.sayori.again), 'happy'], [P.say[0], P.e]] : [[P.say[0], P.e], ex, [P.say[1], P.e]]), ...extra]); seen.add(p);
  };
  show([...entryExtra('sayori'), ...pick(D.sayori.intro)]);
};

/* ---------- SIMULASI (Yuri) ---------- */
SC.simulasi = () => {
  const S = scaffold('simulasi'), DY = D.yuri; let g = 'AND', togg = 0; const v = [0, 0], visited = new Set(), combos = {}, full = new Set();
  const st = () => g === 'NOT' ? `A=${v[0]}` : `A=${v[0]}, B=${v[1]}`;
  const draw = () => {
    const o = F[g](v[0], v[1]), hl = g === 'NOT' ? v[0] : v[0] * 2 + v[1];
    S.panel.innerHTML = `<div class="tabs">${GL.map(x => `<button class="tab${x === g ? ' on' : ''}" data-g="${x}">${x}</button>`).join('')}</div>
    <div class="sim"><div class="card big">${gateSVG(g, v[0], g === 'NOT' ? null : v[1], o, true)}<p class="tip">Klik kotak A / B untuk mengubah input · LED menunjukkan output Y</p></div><div class="card">${tt(g, hl)}<p class="fm">${FORM[g]}</p></div></div>`;
  };
  S.panel.onclick = e => {
    const t = e.target.closest('.tab'), w = e.target.closest('.sw');
    if (t) { // ganti gerbang
      g = t.dataset.g; draw(); Snd.sfx('select'); const first = !visited.has(g); visited.add(g);
      S.d.say([[pick(DY.tab).replace('{g}', g), 'talk'], [SIM_SAY[g], 'explain'], ...(first ? [[DY.deep[g], 'happy']] : []), ...(first && new Set([...visited, 'AND']).size === 4 ? [[DY.milestone.gates, 'explain']] : [])]);
    } else if (w) { // ubah input: 1 = metronomeBar (aksen), 0 = metronomeBeat
      const i = +w.dataset.i; v[i] ^= 1; draw(); Snd.sfx(v[i] ? 'metronomeBar' : 'metronomeBeat');
      const o = F[g](v[0], v[1]), key = g === 'NOT' ? '' + v[0] : '' + v[0] + v[1], set = combos[g] ??= new Set(); set.add(key);
      let line, isFull = false;
      if (set.size === (g === 'NOT' ? 2 : 4) && !full.has(g)) { full.add(g); isFull = true; line = full.size === GL.length ? DY.all : pick(DY.explored).replace('{g}', g) }
      else line = Math.random() < .5 ? pick(DY.insight[g].slice(o ? 1 : 0, o ? 2 : 1)) : pick(o ? DY.on : DY.off).replace('{s}', st()).replace('{y}', o);
      if (++togg === 8) S.d.line(DY.milestone.toggles, 'happy');
      else if (!isFull && Math.random() < .12) { const [t, e] = S.chat(); S.d.line(t, e) } else S.d.line(line, o ? 'happy' : 'explain');
    }
  };
  draw(); S.d.say([...entryExtra('yuri'), ...pick(DY.intro), [SIM_SAY.AND, 'explain']]);
};

/* ---------- renderer soal (dipakai Latihan & Evaluasi) ---------- */
function renderQ(panel, Q, i, n, { reveal, onAns, next, onPick }) {
  panel.innerHTML = `<div class="qh">Soal ${i + 1} / ${n}</div><div class="qq">${Q.q}</div><div class="qv">${Q.vis || ''}</div><div class="qo"></div><div class="qf"></div>`;
  const o = $('.qo', panel), f = $('.qf', panel); let locked = false;
  const done = ok => { locked = true; onAns(ok); f.innerHTML = `<button class="btn" id="qn">${i + 1 < n ? 'LANJUT ▶' : 'SELESAI ▶'}</button>`; $('#qn').onclick = () => { Snd.sfx('select'); next() }; f.scrollIntoView({ block: 'nearest' }) }; // tombol aksi selalu terlihat di layar kecil
  if (Q.kind === 'tt') {
    const st = Array(Q.n).fill(-1), A = Q.g === 'NOT';
    o.innerHTML = `<table class="tt"><tr><th>A</th>${A ? '' : '<th>B</th>'}<th>Y</th></tr>${st.map((_, r) => `<tr><td>${A ? r : r >> 1}</td>${A ? '' : `<td>${r & 1}</td>`}<td><button class="cell" data-i="${r}">?</button></td></tr>`).join('')}</table><button class="btn" id="chk">CEK JAWABAN</button>`;
    o.onclick = e => {
      if (locked) return; const c = e.target.closest('.cell');
      if (c) { const r = +c.dataset.i; st[r] = st[r] < 1 ? st[r] + 1 : 0; c.textContent = st[r]; Snd.sfx('openOS') }
      else if (e.target.id === 'chk') { Snd.sfx('select');
        if (st.includes(-1)) { e.target.textContent = 'ISI SEMUA DULU!'; return }
        $$('.cell', o).forEach((c, r) => c.classList.add(st[r] === Q.ans[r] ? 'ok' : 'bad')); e.target.remove(); done(st.every((x, r) => x === Q.ans[r]));
      }
    };
    return;
  }
  let choice = -1; // jawaban boleh diganti sampai menekan CEK JAWABAN (Latihan) / LANJUT (Evaluasi)
  const showBtn = () => {
    if (f.firstChild) return;
    if (reveal) f.innerHTML = '<button class="btn" id="ck">CEK JAWABAN</button>', $('#ck').onclick = () => {
      Snd.sfx('select'); locked = true; const ok = choice === Q.a, bs = $$('.opt', o);
      bs[choice].classList.remove('picked'); bs[choice].classList.add(ok ? 'ok' : 'bad'); if (!ok) bs[Q.a].classList.add('ok'); done(ok);
    };
    else f.innerHTML = `<button class="btn" id="qn">${i + 1 < n ? 'LANJUT ▶' : 'SELESAI ▶'}</button>`, $('#qn').onclick = () => { Snd.sfx('select'); onAns(choice === Q.a); next() };
    f.scrollIntoView({ block: 'nearest' });
  };
  Q.opts.forEach((t, k) => {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = t;
    b.onclick = () => {
      if (locked) return; Snd.sfx('openOS'); onPick && onPick(k, choice); choice = k;
      $$('.opt', o).forEach((x, j) => x.classList.toggle('picked', j === k)); showBtn();
    };
    o.appendChild(b);
  });
}

/* ---------- LATIHAN (Natsuki) ---------- */
SC.latihan = () => {
  const S = scaffold('latihan'), DN = D.natsuki, N = 8, best = () => store.get('tkm_latihan_best', 0); let qs, i, sc, good, bad, wasBad;
  const begin = () => { qs = makeSet(N); i = 0; sc = 0; good = 0; bad = 0; wasBad = false; q() };
  const q = () => {
    if (i === N / 2) { const g = sc >= N / 2 - 1; S.d.line(pick(g ? DN.halfGood : DN.halfBad), g ? 'smug' : 'hmph') } // komentar kemajuan di tengah latihan
    else if (i > 0 && i < N - 1 && Math.random() < .2) { const [t, e] = S.chat(); S.d.line(t, e) }
    else S.d.line(i === 0 ? pick(DN.first) : i === N - 1 ? pick(DN.last) : pick(DN.mid), i ? 'talk' : 'smug');
    renderQ(S.panel, qs[i], i, N, { reveal: true, next: () => ++i < N ? q() : end(),
      onPick: (k, prev) => { if (prev >= 0 && k !== prev && Math.random() < .7) S.d.line(pick(DN.change), pick(['hmph', 'smug'])) }, onAns: ok => {
      sc += ok ? 1 : 0; ok ? (good++, bad = 0) : (bad++, good = 0); const wb = wasBad; wasBad = !ok;
      if (ok) S.d.line(DN.streakGood[good] ? pick(DN.streakGood[good]) : wb && Math.random() < .6 ? pick(DN.comeback) : pick(DN.praise), pick(['happy', 'smug']));
      else S.d.line((bad >= 2 ? pick(DN.streakBad[Math.min(bad, 3)]) : qs[i].kind === 'tt' && Math.random() < .6 ? pick(DN.ttOops) : pick(DN.oops)) + ' ' + pick(DN.hintIntro) + ' ' + qs[i].hint, pick(['angry', 'hmph']));
    } });
  };
  const end = () => {
    const prev = best(), rec = prev > 0 && sc > prev; if (sc > prev) store.set('tkm_latihan_best', sc);
    S.panel.innerHTML = `<div class="startcard"><h2>Hasil Latihan</h2><p class="score">${sc} / ${N}</p><p>Skor terbaik: <b>${best()}/${N}</b></p><button class="btn big" id="go">ULANGI ↻</button></div>`;
    $('#go').onclick = () => { Snd.sfx('select'); begin() };
    const tier = sc === N ? 'perfect' : sc >= 6 ? 'good' : sc >= 4 ? 'mid' : 'low', e = { perfect: 'happy', good: 'happy', mid: 'smug', low: 'angry' }[tier];
    S.d.say([[pick(DN.res[tier]), e], ...(rec ? [[pick(DN.record), 'smug']] : [])]);
  };
  startCard(S, 'LATIHAN', `${N} soal acak: tentukan output, kenali gerbang, lengkapi tabel kebenaran, dan baca rangkaian.<br>Skor terbaik: <b>${best()}/${N}</b>`, begin);
  S.d.say([...entryExtra('natsuki'), ...pick(DN.intro)]);
};

/* ---------- EVALUASI (Monika) ---------- */
SC.evaluasi = () => {
  const S = scaffold('evaluasi'), DM = D.monika, N = EVAL.length, best = () => store.get('tkm_eval_best', null); let qs, i, right;
  const bestTxt = () => best() == null ? 'Belum ada' : `${best() * 10} (${best()}/${N} benar)`;
  const begin = () => { qs = shuffle(EVAL).map(c => ({ kind: 'mc', ...shuffleOpts(c) })); i = 0; right = 0; q() };
  const q = () => {
    if (i === 0) S.d.say(pick(DM.start));
    else if (i === N - 1) S.d.line(pick(DM.last), 'talk');
    else if (i === N / 2) S.d.line(pick(DM.half), 'happy');
    else if (Math.random() < .2) { const [t, e] = S.chat(); S.d.line(t, e) }
    else S.d.line(pick(DM.q), pick(['talk', 'wink', 'happy']));
    let swaps = 0; // berapa kali pemain mengganti jawaban pada soal ini
    renderQ(S.panel, qs[i], i, N, { reveal: false, onAns: ok => { if (ok) right++ }, next: () => ++i < N ? q() : end(),
      onPick: (k, prev) => { if (prev >= 0 && k !== prev) swaps++; if (swaps >= 3 && prev >= 0 && k !== prev) S.d.line(pick(DM.waver), 'wink'); else if (k !== prev && Math.random() < (prev < 0 ? .4 : .85)) S.d.line(pick(prev < 0 ? DM.noted : DM.change), prev < 0 ? 'talk' : pick(['wink', 'talk'])) } });
  };
  const end = () => {
    const wrong = N - right, gr = GRADES.find(g => right >= g.min), prev = best(), rec = prev != null && right > prev; if (prev == null || right > prev) store.set('tkm_eval_best', right);
    S.panel.innerHTML = `<div class="startcard res"><h2>HASIL EVALUASI</h2><div class="rg"><div><b>${right}</b>Benar</div><div><b>${wrong}</b>Salah</div><div><b>${right * 10}</b>Nilai</div><div><b>${right / N * 100}%</b>Persentase</div></div><p class="grade">${gr.t}</p><p>Nilai terbaik: <b>${bestTxt()}</b></p><button class="btn big" id="go">ULANGI ↻</button></div>`;
    $('#go').onclick = () => { Snd.sfx('select'); begin() };
    S.d.say([[pick(DM.res).replace('{r}', right).replace('{N}', N).replace('{t}', gr.t), gr.e], [pick(gr.s), gr.e], ...(rec ? [[pick(DM.record), 'happy']] : []), ...(Math.random() < .6 ? [[pick(DM.after[right >= 7 ? 'high' : right >= 5 ? 'mid' : 'low']), 'wink']] : [])]);
  };
  startCard(S, 'EVALUASI AKHIR', `${N} soal dari seluruh materi rangkaian logika. Tidak ada petunjuk, tetapi jawaban boleh diganti sebelum lanjut.<br>Nilai terbaik: <b>${bestTxt()}</b>`, begin);
  S.d.say([...entryExtra('monika'), ...pick(DM.intro)]);
};

/* ---------- suara hover: scrollMenu HANYA saat pointer berpindah ke sebuah opsi ---------- */
// .sw (kotak A/B Simulasi) sengaja tidak masuk daftar: tanpa suara hover
const HOV = '.btn,.tab,.opt,.cell,.mbtn'; let hv = null, lp = null;
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const t = e.target.closest ? e.target.closest(HOV) : null, old = hv, prev = lp; lp = { x: e.clientX, y: e.clientY };
  if (t === old) return; hv = t; if (!t || t.disabled) return;
  if (old && !old.isConnected && prev) { const r = t.getBoundingClientRect(); if (prev.x >= r.left && prev.x <= r.right && prev.y >= r.top && prev.y <= r.bottom) return } // elemen dirender ulang di bawah kursor, bukan hover baru
  Snd.sfx(t.matches('.opt,.cell') ? 'metronomeBar' : 'scrollMenu'); // opsi jawaban: metronomeBar
});

/* ---------- boot ---------- */
(async () => {
  Layout.init();
  document.addEventListener('pointerdown', e => spark(e, 5));
  const ico = off => `<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>${off ? '<path d="M17 9l5 6M22 9l-5 6"/>' : '<path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'}</svg>`;
  $('#mute').innerHTML = ico(false);
  $('#mute').onclick = e => { e.currentTarget.innerHTML = ico(Snd.mute()) };
  const btn = $('#startBtn'), msg = $('#loadmsg');
  try {
    together = new Actor(await loadAtlas('assets/img/dokitogether'), { t: { name: 'Doki together club monika', fps: 12, loop: true } });
    await Snd.preload();   // SFX didecode sebelum tombol MULAI aktif
    const keys = Object.keys(CHARS);
    warm = Promise.all([...keys.map(k => Character.load(k).then(c => chars[k] = c)), loadAtlas('assets/img/Text_Boxes'), loadImg('assets/img/DDLCbg.png'), loadImg('assets/img/Music_Room.png')]);
    warm.catch(err => { msg.textContent = 'Gagal memuat asset.'; console.error(err) });
    msg.remove(); btn.disabled = false;
  } catch (err) { msg.textContent = 'Gagal memuat asset. Buka lewat GitHub Pages atau server lokal (python -m http.server), bukan dengan klik ganda file.'; console.error(err) }
  btn.onclick = () => { Snd.sfx('select'); if (Settings.data.display === 'full' && !Full.on) Full.set(true); go('menu') }; // preferensi layar penuh diterapkan saat klik pertama (syarat browser)
})();
