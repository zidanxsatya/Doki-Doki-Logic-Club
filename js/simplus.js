/* ===== simplus.js : pemilih mode Simulasi (hanya mode mandiri) + SIMULASI+ (rangkaian gerbang gabungan) =====
   Memakai ulang dari core.js/app.js: F, GL, wc, INK, gBody, Snd, go, SC, $, $$, M.
   Mode Cerita tidak lewat file ini: Story memanggil go('simulasi') langsung. Simulasi+ tanpa sprite, potret, atau dialog. */

/* ---------- geometri & gambar gerbang (koordinat lokal sama dengan gateSVG) ---------- */
const gGeo = g => { const neg = /^(NAND|NOR|XNOR|NOT)$/.test(g), tip = g === 'NOT' ? 118 : /AND/.test(g) ? 127 : 130, ox = tip + (neg ? 12 : 0); return { neg, tip, ox, xi: 30, xo: ox + 22, ys: g === 'NOT' ? [50] : [32, 68] } };
// (tx,ty) = posisi ujung kaki masuk (tengah) pada kanvas, s = skala
const gGfx = (g, tx, ty, s) => {
  const o = gGeo(g); let h = `<g transform="translate(${tx} ${ty}) scale(${s}) translate(${-o.xi} -50)" stroke="${INK}" fill="none" stroke-linecap="round" stroke-linejoin="round">`;
  o.ys.forEach(y => h += `<path d="M${o.xi} ${y}H58" stroke-width="5"/>`);
  h += `<path d="M${o.ox} 50H${o.xo}" stroke-width="5"/>`;
  if (g.startsWith('X')) h += '<path d="M36 15Q59 50 36 85" stroke-width="4"/>';
  h += `<path d="${gBody(g)}" fill="#ffd1e6" stroke-width="4"/>`;
  if (o.neg) h += `<circle cx="${o.tip + 6}" cy="50" r="6" fill="#fff" stroke-width="4"/>`;
  return h + '</g>';
};

/* ---------- pemilih mode: SIMULASI DASAR / SIMULASI+ ---------- */
SC.simpick = () => {
  const el = $('#scene');
  const plus = `<svg class="pkic" viewBox="0 0 200 90" aria-hidden="true">${gGfx('AND', 6, 26, .5)}${gGfx('XOR', 6, 64, .5)}${gGfx('OR', 118, 45, .55)}<path d="M66 26C92 26 92 35 118 35M67 64C92 64 92 55 118 55" stroke="#ff7eb6" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;
  el.innerHTML = `<div class="bg" data-b="DDLCbg" style="background-image:url(assets/img/DDLCbg.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>SIMULASI</b><i class="hintc">Pilih jenis simulasi</i></div>
  <div class="pick"><button class="pickc" data-go="simulasi"><svg class="pkic" viewBox="0 0 160 80" aria-hidden="true">${gGfx('AND', 14, 40, .9)}</svg><b>SIMULASI DASAR</b><span>Satu gerbang pada satu waktu. Ubah input, lihat LED dan tabel kebenarannya bersama Yuri.</span><em>BUKA ▶</em></button>
  <button class="pickc" data-go="simplus">${plus}<b>SIMULASI+</b><span>Susun rangkaian dari beberapa gerbang dengan kabel, lalu lihat hasil gabungannya.</span><em>BUKA ▶</em></button></div>`;
  $$('.pickc', el).forEach(b => b.onclick = () => { Snd.sfx('select'); go(b.dataset.go) });
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  el.classList.add('on');
  scene = { cleanup() { el.innerHTML = ''; document.onkeydown = null } };
};

/* ---------- SIMULASI+ ---------- */
SC.simplus = () => {
  const el = $('#scene');
  el.innerHTML = `<div class="bg" data-b="DDLCbg" style="background-image:url(assets/img/DDLCbg.png)"></div><div class="top"><button class="btn sm" id="back">◀ PILIH MODE</button><b>SIMULASI+</b><i class="hintc">Susun rangkaian dari beberapa gerbang</i></div>
  <div class="xp">
    <div class="xpal" aria-label="Palet gerbang">${GL.map(g => `<button class="xpi" data-g="${g}" aria-label="Tambah gerbang ${g}" title="Seret ke kanvas, atau ketuk untuk menambah"><svg viewBox="0 0 130 70" aria-hidden="true">${gGfx(g, 10, 36, .8)}</svg><b>${g}</b></button>`).join('')}</div>
    <div class="xcv"><svg class="xsvg" id="xsvg" role="application" aria-label="Kanvas rangkaian"></svg><p class="xempty">Seret gerbang dari palet ke sini.<br>Lalu tarik kabel dari A, B, atau output gerbang ke kaki input gerbang, dan dari output gerbang ke Y.</p><div class="xtoast" role="status" aria-live="polite"></div></div>
    <div class="xside">
      <div class="xcard xio"><div class="xlab">INPUT<span class="xseg" role="group" aria-label="Jumlah input"><button class="xmode on" data-n="2" aria-pressed="true">2 INPUT</button><button class="xmode" data-n="3" aria-pressed="false">3 INPUT</button></span></div><div class="xrow"><button class="xtg" data-i="0" aria-pressed="false"></button><button class="xtg" data-i="1" aria-pressed="false"></button><button class="xtg" data-i="2" aria-pressed="false" hidden></button><span class="xy" id="xy"></span></div></div>
      <div class="xcard xttc"><div class="xlab">TABEL KEBENARAN Y</div><table class="tt xtt" id="xtt"></table><p class="xmsg" id="xmsg"></p></div>
      <div class="xcard xtools"><button class="btn sm" id="xdw" disabled>HAPUS KABEL</button><button class="btn sm" id="xdg" disabled>HAPUS GERBANG</button><button class="btn sm" id="xcl" disabled>KOSONGKAN</button></div>
    </div>
  </div>`;
  const svg = $('#xsvg', el), cv = $('.xcv', el), pal = $('.xpal', el), toast = $('.xtoast', el), stg = $('#stage');
  const G = [], W = []; let nid = 0, wid = 0, sel = null, drag = null, flash = null, cw = 0, ch = 0, K = .8, tT = 0, fT = 0, nin = 2, tblN = 0; const ab = [0, 0, 0];   // nin = jumlah input aktif (2: A,B; 3: A,B,C)
  const gate = id => G.find(n => n.id === id), into = (id, pin) => W.find(w => w.to.t === 'g' && w.to.id === id && w.to.pin === pin), yw = () => W.find(w => w.to.t === 'y');

  /* evaluasi: null = belum diketahui (kaki kosong merambat; tidak pernah dianggap 0) */
  const evalAt = vals => {
    const memo = {}, v = s => s.t === 'in' ? vals[s.k] : gv(s.id);
    const gv = id => { if (id in memo) return memo[id]; memo[id] = null; const n = gate(id), ins = (n.type === 'NOT' ? [0] : [0, 1]).map(p => { const w = into(id, p); return w ? v(w.from) : null }); return memo[id] = ins.includes(null) ? null : F[n.type](...ins) };
    return { v, gv };
  };
  const yVal = vals => { const w = yw(); return w ? evalAt(vals).v(w.from) : null };

  /* posisi */
  const IN = 'ABC', term = () => { const f = nin === 3 ? [.2, .5, .8] : [.3, .7, 0], t = { Y: { x: cw - 78, y: ch / 2 } }; for (let i = 0; i < nin; i++) t[IN[i]] = { x: 84, y: ch * f[i] }; return t };
  const gp = n => { const o = gGeo(n.type), w = (o.xo - o.xi) * K, tx = n.x - w / 2; return { o, w, tx, ins: o.ys.map(y => ({ x: tx, y: n.y + (y - 50) * K })), out: { x: tx + w, y: n.y } } };
  const clampG = n => { const hw = gp(n).w / 2; n.x = Math.max(112 + hw, Math.min(cw - 104 - hw, n.x)); n.y = Math.max(58, Math.min(ch - 40, n.y)) };
  const pinMap = () => {
    const t = term(), m = { Y: { kind: 'dst', ...t.Y, d: { t: 'y' } } }; for (let i = 0; i < nin; i++) m[IN[i]] = { kind: 'src', ...t[IN[i]], d: { t: 'in', k: i } };
    G.forEach(n => { const p = gp(n); m[`g${n.id}o`] = { kind: 'src', ...p.out, d: { t: 'g', id: n.id } }; p.ins.forEach((q, i) => m[`g${n.id}i${i}`] = { kind: 'dst', ...q, d: { t: 'g', id: n.id, pin: i } }) });
    Object.keys(m).forEach(k => m[k].key = k); return m;
  };
  const keyOf = d => d.t === 'in' ? IN[d.k] : d.t === 'y' ? 'Y' : d.pin === undefined ? `g${d.id}o` : `g${d.id}i${d.pin}`;
  const nearest = (pm, p, r, skip) => { let best = null, bd = r; for (const k in pm) { if (k === skip) continue; const d = Math.hypot(pm[k].x - p.x, pm[k].y - p.y); if (d < bd) { bd = d; best = k } } return best };
  const pt = e => { const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y } };

  /* aturan koneksi */
  const downstream = id => { const s = new Set([id]); let moved = true; while (moved) { moved = false; W.forEach(w => { if (w.from.t === 'g' && s.has(w.from.id) && w.to.t === 'g' && !s.has(w.to.id)) { s.add(w.to.id); moved = true } }) } return s };
  const why = (a, b) => {   // alasan penolakan, atau null bila sambungan sah
    if (a.kind === b.kind) return a.kind === 'src' ? 'Ditolak: terminal input (A/B/C) dan output gerbang hanya boleh disambung ke kaki input atau Y.' : 'Ditolak: kaki input tidak bisa disambung ke kaki input lain.';
    const s = a.kind === 'src' ? a : b, d = a.kind === 'src' ? b : a;
    if (s.d.t === 'g' && d.d.t === 'g' && downstream(d.d.id).has(s.d.id)) return 'Ditolak: sambungan ini membuat putaran (siklus) yang tidak bisa dihitung.';
    return null;
  };
  const say = (msg, kind = 'info') => { toast.textContent = msg; toast.className = 'xtoast show ' + kind; clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('show'), 2800) };
  const connect = (a, b) => {
    const bad = why(a, b); if (bad) { Snd.sfx('cancelMenu'); return say(bad, 'bad') }
    const s = a.kind === 'src' ? a : b, d = a.kind === 'src' ? b : a, dk = keyOf(d.d), old = W.find(w => keyOf(w.to) === dk);
    if (old && keyOf(old.from) === keyOf(s.d)) return say('Sudah tersambung.', 'info');
    if (old) W.splice(W.indexOf(old), 1);   // satu kaki input = satu sumber: sambungan baru menggantikan yang lama
    W.push({ id: ++wid, from: s.d, to: d.d }); sel = null; Snd.sfx('confirmMenu');
    flash = dk; clearTimeout(fT); fT = setTimeout(() => { flash = null; render() }, 900);
    if (old) say('Kabel lama pada kaki itu diganti dengan yang baru.', 'ok');
  };

  /* edit */
  const freeSpot = () => { for (const fy of [.3, .55, .8]) for (const fx of [.32, .5, .68]) { const x = cw * fx, y = ch * fy; if (!G.some(n => Math.abs(n.x - x) < 100 && Math.abs(n.y - y) < 60)) return { x, y } } return { x: cw / 2 + Math.random() * 40, y: ch / 2 + Math.random() * 40 } };
  const place = (type, x, y) => { const n = { id: ++nid, type, x, y }; clampG(n); G.push(n); sel = { k: 'g', id: n.id }; Snd.sfx('select'); render() };
  const delSel = () => {
    if (!sel) return;
    if (sel.k === 'w') W.splice(W.findIndex(w => w.id === sel.id), 1);
    else { const id = sel.id; for (let i = W.length - 1; i >= 0; i--) if ((W[i].from.t === 'g' && W[i].from.id === id) || (W[i].to.t === 'g' && W[i].to.id === id)) W.splice(i, 1); G.splice(G.findIndex(n => n.id === id), 1) }   // kabel yang menempel ikut dihapus
    sel = null; Snd.sfx('cancelMenu'); render();
  };
  const toggleIn = i => { if (i >= nin) return; ab[i] ^= 1; Snd.sfx(ab[i] ? 'metronomeBar' : 'metronomeBeat'); render() };

  const setN = n => {
    if (n === nin) return; let cut = 0;
    if (n === 2) { for (let i = W.length - 1; i >= 0; i--) if (W[i].from.t === 'in' && W[i].from.k === 2) { W.splice(i, 1); cut++ } ab[2] = 0; sel = null }   // input C dihapus: kabel dari C ikut dihapus
    nin = n; Snd.sfx('select'); say(n === 3 ? 'Input C ditambahkan: tabel kebenaran jadi 8 baris.' : cut ? `Kembali ke 2 input: ${cut} kabel dari C dihapus.` : 'Kembali ke 2 input.', 'info'); render();
  };

  /* gambar */
  const wpath = (a, b) => { const dx = Math.max(36, Math.abs(b.x - a.x) / 2); return `M${a.x} ${a.y}C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}` };   // kabel lentur (kurva Bezier) dari pin ke pin
  const vtxt = v => v == null ? '?' : v;
  const render = () => {
    if (!cw) return;
    const pm = pinMap(), ev = evalAt(ab), t = term(); let h = '';
    W.forEach(w => {
      const a = pm[keyOf(w.from)], b = pm[keyOf(w.to)], v = ev.v(w.from), d = wpath(a, b), on = sel && sel.k === 'w' && sel.id === w.id;
      h += `<g class="xw" data-w="${w.id}">${on ? `<path d="${d}" stroke="#ff7eb6" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5"/>` : ''}<path d="${d}" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${v == null ? '#cdbfd6' : wc(v)}" stroke-width="3.6" fill="none" stroke-linecap="round"${v == null ? ' stroke-dasharray="7 6"' : ''}/><path class="xwh" d="${d}" stroke="transparent" stroke-width="20" fill="none"/></g>`;
    });
    G.forEach(n => {
      const p = gp(n), on = sel && sel.k === 'g' && sel.id === n.id, nx = p.tx + ((n.type === 'NOT' ? 85 : 88) - 30) * K;
      h += `<g class="xg${on ? ' on' : ''}" data-g="${n.id}">${on ? `<rect x="${p.tx - 12}" y="${n.y - 35 * K - 28}" width="${p.w + 24}" height="${70 * K + 36}" rx="12" fill="#ff7eb61f" stroke="#ff7eb6" stroke-width="2.5" stroke-dasharray="6 4"/>` : ''}<rect x="${p.tx - 8}" y="${n.y - 35 * K - 6}" width="${p.w + 16}" height="${70 * K + 12}" fill="transparent"/>${gGfx(n.type, p.tx, n.y, K)}<rect x="${nx - 24}" y="${n.y - 35 * K - 24}" width="48" height="17" rx="8.5" fill="${INK}"/><text x="${nx}" y="${n.y - 35 * K - 11}" font-size="11.5" font-weight="800" fill="#fff" text-anchor="middle">${n.type}</text></g>`;
    });
    // terminal A, B, (C) di kiri dan Y di kanan
    IN.slice(0, nin).split('').forEach((k, i) => {   // terminal input = saklar: huruf + angka 0/1; menyala (pink + glow) saat 1, kabur (lavender) saat 0
      const q = t[k], v = ab[i], x0 = q.x - 70, y0 = q.y - 15;
      h += `<g class="xt${v ? ' on' : ''}" data-t="${i}" role="button" aria-label="Input ${k} = ${v}. Klik untuk mengubah"><path d="M${q.x - 14} ${q.y}H${q.x}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${q.x - 14} ${q.y}H${q.x}" stroke="${wc(v)}" stroke-width="3.6" stroke-linecap="round"/><rect x="${x0}" y="${y0}" width="56" height="30" rx="15" fill="${v ? '#ff7eb6' : '#e6dcf5'}" stroke="${INK}" stroke-width="3" style="${v ? 'filter:drop-shadow(0 0 7px #ff4d6d)' : ''}"/><circle cx="${v ? x0 + 41 : x0 + 15}" cy="${q.y}" r="11" fill="${INK}"/><text x="${v ? x0 + 41 : x0 + 15}" y="${q.y + 5}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${k}</text><text x="${v ? x0 + 15 : x0 + 41}" y="${q.y + 7}" font-size="19" font-weight="800" fill="${v ? INK : '#8a6b86'}" text-anchor="middle">${v}</text><text x="${x0 + 28}" y="${y0 + 46}" font-size="11" font-weight="800" fill="${v ? '#d6336c' : '#8a6b86'}" text-anchor="middle">${v ? 'AKTIF (1)' : 'MATI (0)'}</text></g>`;
    });
    const yv = yVal(ab), yl = yw();
    h += `<path d="M${t.Y.x} ${t.Y.y}H${t.Y.x + 30}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="${t.Y.x + 36}" cy="${t.Y.y}" r="17" fill="${yv ? '#ff8fb0' : yv === 0 ? '#e6dcf5' : '#fff'}" stroke="${INK}" stroke-width="3"${yv == null ? ' stroke-dasharray="5 4"' : ''} style="${yv ? 'filter:drop-shadow(0 0 8px #ff4d6d)' : ''}"/><text x="${t.Y.x + 36}" y="${t.Y.y + 6}" font-size="17" font-weight="800" fill="${INK}" text-anchor="middle">Y</text><text x="${t.Y.x + 36}" y="${t.Y.y + 36}" font-size="13" font-weight="800" fill="${yv ? '#ff4d6d' : INK}" text-anchor="middle">${yl ? `Y = ${vtxt(yv)}` : 'Y kosong'}</text>`;
    // pin
    const cand = drag && drag.k === 'wire' ? nearest(pm, drag.p, 24, drag.from.key) : null;
    for (const k in pm) {
      const q = pm[k], d = q.d, linked = q.kind === 'dst' ? W.some(w => keyOf(w.to) === k) : true;
      const v = q.kind === 'src' ? ev.v(d) : (W.find(w => keyOf(w.to) === k) ? ev.v(W.find(w => keyOf(w.to) === k).from) : null);
      h += `<circle class="xpin" data-pin="${k}" cx="${q.x}" cy="${q.y}" r="7" fill="${v == null ? '#fff' : wc(v)}" stroke="${q.kind === 'dst' && !linked ? '#ff4d6d' : INK}" stroke-width="3"${q.kind === 'dst' && !linked ? ' stroke-dasharray="3 2.5"' : ''}/>`;
      if (q.kind === 'src' && d.t === 'g') h += `<text x="${q.x + 3}" y="${q.y - 12}" font-size="12" font-weight="800" fill="${v == null ? '#a8809f' : INK}" text-anchor="middle">${vtxt(v)}</text>`;
      if (flash === k) h += `<circle cx="${q.x}" cy="${q.y}" r="13" fill="none" stroke="#ff7eb6" stroke-width="3"/>`;
    }
    if (drag && drag.k === 'wire') {
      const f = drag.from, c = cand ? pm[cand] : null, bad = c ? why(f, c) : null, e2 = c || drag.p, a = f.kind === 'src' ? f : e2, b = f.kind === 'src' ? e2 : f;
      h += `<path d="${wpath(a, b)}" stroke="${bad ? '#ff4d6d' : '#ff7eb6'}" stroke-width="4" fill="none" stroke-dasharray="8 6" stroke-linecap="round"/>`;
      if (c) h += `<circle cx="${c.x}" cy="${c.y}" r="14" fill="none" stroke="${bad ? '#ff4d6d' : '#18b04a'}" stroke-width="3.5"/>`;
      h += `<circle cx="${f.x}" cy="${f.y}" r="12" fill="none" stroke="#ff7eb6" stroke-width="3"/>`;
    }
    svg.innerHTML = h;
    sync(yv);
  };
  const sync = yv => {
    $('.xp', el).classList.toggle('n3', nin === 3);
    $$('.xmode', el).forEach(b => { const on = +b.dataset.n === nin; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) });
    $$('.xtg', el).forEach((b, i) => { b.hidden = i >= nin; b.textContent = `${IN[i]} = ${ab[i]}`; b.setAttribute('aria-pressed', ab[i]); b.classList.toggle('on', !!ab[i]) });
    const xy = $('#xy', el); xy.textContent = `Y = ${vtxt(yv)}`; xy.className = 'xy' + (yv ? ' on' : yv == null ? ' na' : '');
    const rows = 1 << nin, bit = (r, i) => (r >> (nin - 1 - i)) & 1;   // baris r: A = bit tertinggi
    if (tblN !== nin) { tblN = nin; $('#xtt', el).innerHTML = `<tr>${IN.slice(0, nin).split('').map(k => `<th>${k}</th>`).join('')}<th>Y</th></tr>` + Array.from({ length: rows }, (_, r) => `<tr data-r="${r}">${IN.slice(0, nin).split('').map((_, i) => `<td>${bit(r, i)}</td>`).join('')}<td class="xyc"></td></tr>`).join('') }
    const cur = ab.slice(0, nin).reduce((a, v) => a * 2 + v, 0);
    $$('#xtt tr[data-r]', el).forEach(tr => { const r = +tr.dataset.r, y = yVal(Array.from({ length: 3 }, (_, i) => i < nin ? bit(r, i) : 0)), c = tr.lastElementChild; c.textContent = y == null ? '–' : y; c.classList.toggle('na', y == null); tr.classList.toggle('hl', r === cur) });
    const msg = $('#xmsg', el), has = yw();
    msg.textContent = !G.length && !has ? 'Belum ada rangkaian. Tambahkan gerbang dan sambungkan ke Y.' : !has ? 'Hasil belum tersedia: Y belum tersambung ke output gerbang atau terminal.' : yv == null ? 'Hasil belum tersedia: rangkaian belum lengkap, masih ada kaki input gerbang yang kosong.' : `Saat ini ${IN.slice(0, nin).split('').map((k, i) => `${k} = ${ab[i]}`).join(', ')}, maka Y = ${yv}.`;
    msg.classList.toggle('warn', yv == null && !!(G.length || has));
    $('.xempty', el).hidden = G.length > 0;
    $('#xdw', el).disabled = !(sel && sel.k === 'w'); $('#xdg', el).disabled = !(sel && sel.k === 'g'); $('#xcl', el).disabled = !(G.length || W.length);
  };

  /* pointer: kanvas (pindah gerbang, tarik kabel, pilih) */
  svg.addEventListener('pointerdown', e => {
    if (e.button > 0) return; const p = pt(e), pm = pinMap(), k = nearest(pm, p, 18), tg = e.target.closest('[data-t]'), gg = e.target.closest('[data-g]'), ww = e.target.closest('[data-w]');
    svg.setPointerCapture(e.pointerId); drag = null;
    if (k) { drag = { k: 'wire', from: pm[k], p, id: e.pointerId }; sel = null }
    else if (tg) toggleIn(+tg.dataset.t);
    else if (gg) { const n = gate(+gg.dataset.g); drag = { k: 'gate', n, dx: n.x - p.x, dy: n.y - p.y, moved: false, id: e.pointerId }; sel = { k: 'g', id: n.id } }
    else if (ww) sel = { k: 'w', id: +ww.dataset.w };
    else sel = null;
    render();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return; const p = pt(e);
    if (drag.k === 'gate') { drag.n.x = p.x + drag.dx; drag.n.y = p.y + drag.dy; clampG(drag.n) } else drag.p = p;
    render();
  });
  const endDrag = (e, ok) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
    if (ok && d.k === 'wire') { const pm = pinMap(), k = nearest(pm, pt(e), 24, d.from.key); if (k) connect(d.from, pm[k]) }
    render();
  };
  svg.addEventListener('pointerup', e => endDrag(e, true)); svg.addEventListener('pointercancel', e => endDrag(e, false));

  /* pointer: palet -> kanvas (seret) atau ketuk untuk menambah */
  let pd = null;
  const ghost = type => { const g = document.createElement('div'); g.className = 'xghost'; g.innerHTML = `<svg viewBox="0 0 130 70">${gGfx(type, 10, 36, .8)}</svg>`; stg.appendChild(g); return g };
  const moveGhost = (g, e) => { const r = stg.getBoundingClientRect(), k = r.width / stg.offsetWidth; g.style.left = (e.clientX - r.left) / k + 'px'; g.style.top = (e.clientY - r.top) / k + 'px' };
  pal.addEventListener('pointerdown', e => { const b = e.target.closest('.xpi'); if (!b || e.button > 0) return; pd = { type: b.dataset.g, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, gh: null }; pal.setPointerCapture(e.pointerId) });
  pal.addEventListener('pointermove', e => { if (!pd || e.pointerId !== pd.id) return; if (!pd.moved && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 6) { pd.moved = true; pd.gh = ghost(pd.type) } if (pd.gh) moveGhost(pd.gh, e) });
  const palEnd = (e, ok) => {
    if (!pd || e.pointerId !== pd.id) return; const d = pd; pd = null; d.gh && d.gh.remove(); if (!ok) return;
    if (!d.moved) { const s = freeSpot(); place(d.type, s.x, s.y); return }
    const r = svg.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { const q = pt(e); place(d.type, q.x, q.y) } else say('Lepaskan gerbang di atas kanvas.', 'info');
  };
  pal.addEventListener('pointerup', e => palEnd(e, true)); pal.addEventListener('pointercancel', e => palEnd(e, false));
  pal.addEventListener('click', e => { const b = e.target.closest('.xpi'); if (b && e.detail === 0) { const s = freeSpot(); place(b.dataset.g, s.x, s.y) } });   // aktivasi lewat keyboard

  /* tombol */
  $$('.xtg', el).forEach(b => b.onclick = () => toggleIn(+b.dataset.i));
  $$('.xmode', el).forEach(b => b.onclick = () => setN(+b.dataset.n));
  $('#xdw').onclick = delSel; $('#xdg').onclick = delSel;
  $('#xcl').onclick = () => { G.length = 0; W.length = 0; sel = null; Snd.sfx('cancelMenu'); say('Rangkaian dikosongkan.', 'info'); render() };
  const back = () => { Snd.sfx('cancelMenu'); go('simpick') };
  $('#back').onclick = back;
  document.onkeydown = e => { if (e.key === 'Escape') back(); else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); delSel() } };

  el.classList.add('on');
  const ro = new ResizeObserver(() => { cw = cv.clientWidth; ch = cv.clientHeight; if (!cw) return; K = document.body.classList.contains('m') ? .66 : .8; svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`); G.forEach(clampG); render() });
  ro.observe(cv);
  scene = { cleanup() { ro.disconnect(); clearTimeout(tT); clearTimeout(fT); pd && pd.gh && pd.gh.remove(); el.innerHTML = ''; document.onkeydown = null } };
};
