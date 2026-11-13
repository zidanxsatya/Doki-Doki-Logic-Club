/* simplus.js : pemilih mode Simulasi (hanya mode mandiri) + SIMULASI+ (rangkaian gerbang gabungan) 
   Memakai ulang dari core.js/app.js: F, GL, wc, INK, gBody, Snd, go, SC, $, $$, M.
   Mode Cerita tidak lewat file ini: Story memanggil go('simulasi') langsung. Simulasi+ tanpa sprite, potret, atau dialog. */

/* geometri & gambar gerbang (koordinat lokal sama dengan gateSVG) */
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

/* suara Simulasi+: sintetis (tanpa file), mengikuti slider SFX & mute; hanya bunyi jika AudioContext sudah aktif */
const Sfx = (() => {
  const tone = (c, t, f0, f1, dur, type, vol, at = 0) => { const o = c.createOscillator(), g = c.createGain(), s = t + at; o.type = type; o.frequency.setValueAtTime(f0, s); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, s + dur); g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + .006); g.gain.exponentialRampToValueAtTime(.0001, s + dur); o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + dur + .03) };
  const S = {
    place: (c, t, v) => { tone(c, t, 300, 110, .12, 'sine', .34 * v); tone(c, t, 640, 260, .05, 'triangle', .12 * v) },    // gerbang diletakkan: "tok" lembut
    plug: (c, t, v) => { tone(c, t, 620, 620, .045, 'square', .06 * v); tone(c, t, 930, 930, .08, 'triangle', .2 * v, .05) },   // kabel terpasang: klik-klik colok
    unplug: (c, t, v) => tone(c, t, 760, 280, .12, 'triangle', .2 * v),                                                         // kabel dilepas/dihapus
    del: (c, t, v) => { tone(c, t, 380, 80, .18, 'sine', .3 * v); tone(c, t, 200, 70, .14, 'triangle', .12 * v, .02) },          // gerbang dihapus / kosongkan
    bad: (c, t, v) => { tone(c, t, 150, 140, .17, 'square', .07 * v); tone(c, t, 112, 104, .17, 'square', .07 * v) },            // ditolak: dengung rendah
    on: (c, t, v) => tone(c, t, 840, 1180, .08, 'triangle', .2 * v),                                                            // saklar -> 1
    off: (c, t, v) => tone(c, t, 640, 430, .08, 'triangle', .18 * v),                                                           // saklar -> 0
    tick: (c, t, v) => tone(c, t, 540, 540, .04, 'sine', .15 * v),                                                              // navigasi kecil
    win: (c, t, v) => [523, 659, 784, 1046].forEach((f, i) => tone(c, t, f, f, .16, 'triangle', .2 * v, i * .09))                // tantangan selesai
  };
  return k => { const c = Snd.ac; if (Snd.muted || Snd.sv <= 0 || !c || c.state !== 'running') return; S[k](c, c.currentTime, clamp01(Snd.sv)) };
})();

/* mode tantangan: susun rangkaian sampai tabel X sama dengan target. y = kolom X per baris (A = bit tertinggi).
   id = nomor tetap untuk simpanan tkm_ch (jangan diubah atau dipakai ulang); urutan tampil = urutan array. l = level (indeks LVN).
   h = [konsep, rancangan] untuk tombol HINT; s = kunci jawaban 'g1=GERBANG kaki kaki;...>keluaran' (langkah 3 petunjuk dibuat dari s, dan s diperiksa oleh tes terhadap y dan ok) */
const LVN = ['Pemanasan', 'Dua gerbang', 'Gerbang universal', 'Merakit gerbang baru', 'Tantangan akhir'], LVD = ['Mudah', 'Mudah', 'Sedang', 'Sedang', 'Sulit'];
const CH = [
  { id: 17, l: 0, t: 'Tarik kabel dari A langsung ke X', n: 1, y: '01', ok: null, h: ['Lihat kolom TARGET: nilainya sama persis dengan kolom A. Jadi X cukup meniru A.', 'Tidak butuh gerbang. Tarik kabel dari titik di ujung kanan A ke titik X di sisi kanan kanvas.'], s: '>A' },
  { id: 18, l: 0, t: 'Balik sinyal: X = NOT A', n: 1, y: '10', ok: ['NOT'], h: ['TARGET selalu kebalikan dari A: A = 0 menghasilkan 1, A = 1 menghasilkan 0.', 'Gerbang yang membalik sinyal adalah NOT. Pasang satu NOT di antara A dan X.'], s: 'g1=NOT A>g1' },
  { id: 19, l: 0, t: 'Dua saklar seri: X = 1 bila A dan B sama-sama 1', n: 2, y: '0001', ok: ['AND'], h: ['X hanya 1 kalau A dan B sama-sama 1. Itu aturan gerbang AND.', 'Pasang satu AND. Sambungkan A dan B ke dua kakinya, lalu keluarannya ke X.'], s: 'g1=AND A B>g1' },
  { id: 20, l: 0, t: 'Alarm: X = 1 bila A atau B menyala', n: 2, y: '0111', ok: ['OR'], h: ['X menyala kalau salah satu atau kedua input menyala. Itu aturan gerbang OR.', 'Pasang satu OR. Sambungkan A dan B ke dua kakinya, lalu keluarannya ke X.'], s: 'g1=OR A B>g1' },
  { id: 21, l: 0, t: 'Lampu tangga: X = 1 bila A dan B berbeda', n: 2, y: '0110', ok: ['XOR'], h: ['X = 1 hanya kalau A dan B berbeda. Gerbang mana yang menilai "beda atau sama"?', 'Pasang satu XOR. Sambungkan A dan B ke dua kakinya, lalu keluarannya ke X.'], s: 'g1=XOR A B>g1' },
  { id: 22, l: 1, t: 'NAND dari AND dan NOT', n: 2, y: '1110', ok: ['AND', 'NOT'], h: ['NAND adalah AND yang dibalik. Susun dua gerbang berurutan.', 'AND dulu untuk A dan B, lalu balik hasilnya dengan NOT sebelum masuk ke X.'], s: 'g1=AND A B;g2=NOT g1>g2' },
  { id: 23, l: 1, t: 'NOR dari OR dan NOT', n: 2, y: '1000', ok: ['OR', 'NOT'], h: ['NOR adalah OR yang dibalik. Susun dua gerbang berurutan.', 'OR dulu untuk A dan B, lalu balik hasilnya dengan NOT sebelum masuk ke X.'], s: 'g1=OR A B;g2=NOT g1>g2' },
  { id: 11, l: 1, t: 'X = A · (B + C)', n: 3, y: '00000111', ok: null, h: ['Yang dalam kurung dikerjakan dulu: B + C adalah OR. Hasilnya dikalikan (AND) dengan A.', 'Dua gerbang: OR untuk B dan C, lalu AND yang menerima A dan hasil OR.'], s: 'g1=OR B C;g2=AND A g1>g2' },
  { id: 9, l: 1, t: 'Brankas: X = 1 hanya untuk kode A = 1, B = 0, C = 1', n: 3, y: '00000100', ok: null, h: ['X hanya 1 saat A = 1, B = 0, C = 1. Supaya B = 0 terhitung "cocok", B harus dibalik dulu.', 'NOT untuk B. Lalu A, hasil NOT, dan C harus sama-sama 1. AND hanya punya dua kaki, jadi pakai dua AND berurutan.'], s: 'g1=NOT B;g2=AND A g1;g3=AND g2 C>g3' },
  { id: 0, l: 2, t: 'NOT dari NAND saja', n: 2, y: '1100', ok: ['NAND'], h: ['Kalau kedua kaki NAND diberi sinyal yang sama, hasilnya selalu kebalikan sinyal itu.', 'Sambungkan A ke kedua kaki satu gerbang NAND, lalu keluarannya ke X. B tidak dipakai.'], s: 'g1=NAND A A>g1' },
  { id: 1, l: 2, t: 'AND dari NAND saja', n: 2, y: '0001', ok: ['NAND'], h: ['NAND adalah AND yang dibalik. Balik sekali lagi dan hasilnya kembali menjadi AND.', 'NAND pertama menerima A dan B. NAND kedua menerima hasil pertama di kedua kakinya (jadi berfungsi sebagai NOT).'], s: 'g1=NAND A B;g2=NAND g1 g1>g2' },
  { id: 2, l: 2, t: 'OR dari NAND saja', n: 2, y: '0111', ok: ['NAND'], h: ['Balik dulu tiap input, lalu NAND-kan hasilnya. Itu sama dengan OR (hukum De Morgan).', 'Satu NAND dengan kedua kaki disatukan membalik sinyal. Pakai dua untuk A dan B, lalu NAND ketiga menerima keduanya.'], s: 'g1=NAND A A;g2=NAND B B;g3=NAND g1 g2>g3' },
  { id: 3, l: 2, t: 'AND dari NOR saja', n: 2, y: '0001', ok: ['NOR'], h: ['Balik dulu A dan B, lalu NOR-kan hasilnya. (NOT A) NOR (NOT B) sama dengan A AND B.', 'NOR dengan kedua kaki disatukan berfungsi sebagai NOT. Pakai dua untuk A dan B, lalu NOR ketiga menerima keduanya.'], s: 'g1=NOR A A;g2=NOR B B;g3=NOR g1 g2>g3' },
  { id: 4, l: 2, t: 'OR dari NOR saja', n: 2, y: '0111', ok: ['NOR'], h: ['NOR adalah OR yang dibalik. Balik sekali lagi dan hasilnya kembali menjadi OR.', 'NOR pertama menerima A dan B. NOR kedua menerima hasil pertama di kedua kakinya.'], s: 'g1=NOR A B;g2=NOR g1 g1>g2' },
  { id: 5, l: 3, t: 'XOR dari AND, OR, dan NOT', n: 2, y: '0110', ok: ['AND', 'OR', 'NOT'], h: ['XOR bernilai 1 kalau minimal satu input 1, tetapi tidak kalau keduanya 1.', 'Gabungkan OR (minimal satu) dengan NOT dari AND (bukan keduanya), lalu AND-kan kedua hasil itu.'], s: 'g1=OR A B;g2=AND A B;g3=NOT g2;g4=AND g1 g3>g4' },
  { id: 6, l: 3, t: 'XNOR dari AND, OR, dan NOT', n: 2, y: '1001', ok: ['AND', 'OR', 'NOT'], h: ['XNOR bernilai 1 kalau kedua input sama: sama-sama 1, atau sama-sama 0.', 'AND mendeteksi sama-sama 1. NOT dari OR mendeteksi sama-sama 0. Gabungkan keduanya dengan OR.'], s: 'g1=AND A B;g2=OR A B;g3=NOT g2;g4=OR g1 g3>g4' },
  { id: 8, l: 3, t: 'Sama atau beda: X = 1 bila A = B, tanpa XOR dan XNOR', n: 2, y: '1001', ok: ['AND', 'OR', 'NOT', 'NAND', 'NOR'], h: ['X = 1 saat A dan B sama: sama-sama 1, atau sama-sama 0.', 'AND untuk sama-sama 1, NOR untuk sama-sama 0, lalu gabungkan keduanya dengan OR.'], s: 'g1=AND A B;g2=NOR A B;g3=OR g1 g2>g3' },
  { id: 10, l: 3, t: 'Mayoritas: X = 1 bila minimal 2 input = 1', n: 3, y: '00010111', ok: null, h: ['Minimal 2 dari 3 input bernilai 1 berarti ada satu pasangan yang sama-sama 1: A dan B, A dan C, atau B dan C.', 'Tiga AND untuk ketiga pasangan itu, lalu gabungkan semuanya dengan OR (dua OR berurutan).'], s: 'g1=AND A B;g2=AND A C;g3=AND B C;g4=OR g1 g2;g5=OR g4 g3>g5' },
  { id: 12, l: 3, t: 'Tombol kuis: X = 1 bila tepat satu input = 1', n: 3, y: '01101000', ok: null, h: ['Tepat satu input 1 berarti jumlah angka 1 ganjil, tetapi bukan ketiganya sekaligus.', 'Dua XOR berurutan memberi "jumlah 1 ganjil". Lalu keluarkan kasus A, B, C semuanya 1 dengan AND dan NOT.'], s: 'g1=XOR A B;g2=XOR g1 C;g3=AND A B;g4=AND g3 C;g5=NOT g4;g6=AND g2 g5>g6' },
  { id: 13, l: 4, t: 'Pemilih (MUX): A = 0 pilih B, A = 1 pilih C', n: 3, y: '00110101', ok: null, h: ['Saat A = 0 hanya B yang boleh lewat, saat A = 1 hanya C. A bertugas sebagai pemilih.', 'AND-kan B dengan NOT A, AND-kan C dengan A, lalu gabungkan keduanya dengan OR.'], s: 'g1=NOT A;g2=AND g1 B;g3=AND A C;g4=OR g2 g3>g4' },
  { id: 14, l: 4, t: 'Paritas ganjil: X = 1 bila jumlah input 1 ganjil', n: 3, y: '01101001', ok: null, h: ['XOR bernilai 1 kalau jumlah angka 1 pada inputnya ganjil. Dengan tiga input, rantai dua XOR.', 'XOR pertama untuk A dan B. XOR kedua untuk hasilnya dan C.'], s: 'g1=XOR A B;g2=XOR g1 C>g2' },
  { id: 15, l: 4, t: 'Paritas genap: X = 1 bila jumlah input 1 genap', n: 3, y: '10010110', ok: null, h: ['Paritas genap adalah kebalikan paritas ganjil.', 'Sama seperti paritas ganjil, tetapi gerbang terakhir diganti XNOR.'], s: 'g1=XOR A B;g2=XNOR g1 C>g2' },
  { id: 7, l: 4, t: 'XOR dari NAND saja', n: 2, y: '0110', ok: ['NAND'], h: ['Mulai dari NAND(A, B). Hasilnya dipakai ulang di dua tempat.', 'NAND kedua menerima A dan hasil pertama. NAND ketiga menerima B dan hasil pertama. NAND keempat menggabungkan hasil kedua dan ketiga.'], s: 'g1=NAND A B;g2=NAND A g1;g3=NAND B g1;g4=NAND g2 g3>g4' },
  { id: 16, l: 4, t: 'Juri 4 orang: X = 1 bila minimal 3 dari 4 input = 1', n: 4, y: '0000000100010111', ok: null, h: ['Minimal 3 dari 4 berarti A dan B menyala bersama salah satu dari C atau D, atau C dan D menyala bersama salah satu dari A atau B.', 'Bagian pertama: (A · B) · (C + D). Bagian kedua: (C · D) · (A + B). Gabungkan keduanya dengan OR.'], s: 'g1=AND A B;g2=OR C D;g3=AND g1 g2;g4=AND C D;g5=OR A B;g6=AND g4 g5;g7=OR g3 g6>g7' }
];
/* kunci jawaban s -> daftar langkah untuk petunjuk ke-3 */
const solText = s => { const [st, o] = s.split('>'), src = x => /^g\d+$/.test(x) ? 'hasil langkah ' + x.slice(1) : 'input ' + x, steps = st ? st.split(';').map(p => { const [g, e] = p.split('='), [t, ...a] = e.split(' '); return `Langkah ${g.slice(1)}: pasang ${t}. ${a.length === 1 ? `Kakinya dari ${src(a[0])}.` : `Kaki atas dari ${src(a[0])}, kaki bawah dari ${src(a[1])}.`}` }) : []; return [...steps, `Sambungkan ${o[0] === 'g' ? 'output langkah ' + o.slice(1) : 'input ' + o} ke X.`].join('\n') };

/* pemilih mode: SIMULASI DASAR / SIMULASI+ */
SC.simpick = () => {
  const el = $('#scene');
  const plus = `<svg class="pkic" viewBox="0 0 200 90" aria-hidden="true">${gGfx('AND', 6, 26, .5)}${gGfx('XOR', 6, 64, .5)}${gGfx('OR', 118, 45, .55)}<path d="M66 26C92 26 92 35 118 35M67 64C92 64 92 55 118 55" stroke="#ff7eb6" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;
  el.innerHTML = `<div class="bg" data-b="DDLCbg" style="background-image:url(assets/img/DDLCbg.webp)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>SIMULASI</b><i class="hintc">Pilih jenis simulasi</i></div>
  <div class="pick"><button class="pickc" data-go="simulasi"><svg class="pkic" viewBox="0 0 160 80" aria-hidden="true">${gGfx('AND', 14, 40, .9)}</svg><b>SIMULASI DASAR</b><span>Satu gerbang pada satu waktu. Ubah input, lihat LED dan tabel kebenarannya bersama Yuri.</span><em>BUKA</em></button>
  <button class="pickc" data-go="simplus">${plus}<b>SIMULASI+</b><span>Susun rangkaian dari beberapa gerbang dengan kabel, lalu lihat hasil gabungannya.</span><em>BUKA</em></button></div>`;
  $$('.pickc', el).forEach(b => b.onclick = () => { Snd.sfx('select'); go(b.dataset.go) });
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  el.classList.add('on');
  scene = { cleanup() { el.innerHTML = ''; document.onkeydown = null } };
};

/* saklar input (pil) : dipakai di kanvas dan di kartu palet */
const pillG = (v, x0, cy, k) => `<rect x="${x0}" y="${cy - 15}" width="56" height="30" rx="15" fill="${v ? '#ff9cc6' : '#e6dcf5'}" stroke="${INK}" stroke-width="3"/><circle cx="${v ? x0 + 41 : x0 + 15}" cy="${cy}" r="11" fill="${INK}"/><text x="${v ? x0 + 41 : x0 + 15}" y="${cy + 5}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${k}</text><text x="${v ? x0 + 15 : x0 + 41}" y="${cy + 7}" font-size="19" font-weight="800" fill="${v ? INK : '#8a6b86'}" text-anchor="middle">${v}</text>`;

/* SIMULASI+ */
SC.simplus = () => {
  const el = $('#scene');
  const inCard = v => `<button class="xpi xin" data-g="in${v}" aria-label="Tambah input dengan nilai awal ${v}" title="Seret ke kanvas, atau ketuk untuk menambah"><svg viewBox="0 0 60 34" aria-hidden="true">${pillG(v, 2, 17, '+')}</svg><b>INPUT<span class="xv"> ${v}</span></b></button>`;
  el.innerHTML = `<div class="bg" data-b="DDLCbg" style="background-image:url(assets/img/DDLCbg.webp)"></div><div class="top"><button class="btn sm" id="back">◀ <span class="lg">PILIH </span>MODE</button><b>SIMULASI+</b><i class="hintc">Susun rangkaian dari input dan gerbang</i><button class="btn sm" id="xch">TANTANGAN</button></div>
  <div class="xp">
    <div class="xpal" aria-label="Palet gerbang dan input">${GL.map(g => `<button class="xpi" data-g="${g}" aria-label="Tambah gerbang ${g}" title="Seret ke kanvas, atau ketuk untuk menambah"><svg viewBox="0 0 130 70" aria-hidden="true">${gGfx(g, 10, 36, .8)}</svg><b>${g}</b></button>`).join('')}${inCard(0)}${inCard(1)}</div>
    <div class="xcv"><svg class="xsvg" id="xsvg" role="application" aria-label="Kanvas rangkaian"></svg><p class="xempty">Seret kartu INPUT dan gerbang dari palet ke sini.<br>Lalu tarik kabel dari titik output input atau gerbang ke kaki input gerbang, dan dari output gerbang ke X.</p><div class="xgoal" hidden><span class="xgt"></span><button id="xgn" hidden>LANJUT ▶</button><button id="xhi" aria-expanded="false">HINT</button><button id="xgl">DAFTAR</button><button id="xgx">KELUAR</button></div><div class="xtip" hidden></div><div class="xhint" role="region" aria-label="Petunjuk tantangan" hidden><div class="xhh"><b class="xhk"></b><button id="xhm">LAGI ▶</button><button id="xhx" aria-label="Tutup petunjuk">✕</button></div><p class="xht" aria-live="polite"></p></div><div class="xlist" hidden></div><div class="xundo"><button class="btn sm" id="xun" aria-label="Urungkan (Ctrl+Z)" title="Urungkan (Ctrl+Z)" disabled><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4"/><path d="M3 8h8a5 5 0 010 10H8"/></svg></button><button class="btn sm xre" id="xre" aria-label="Ulangi (Ctrl+Y)" title="Ulangi (Ctrl+Y)" disabled><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4"/><path d="M3 8h8a5 5 0 010 10H8"/></svg></button></div><button class="btn sm xstb" id="xst" hidden>▶ LANGKAH</button><div class="xstp" hidden><p class="xstt" id="xstt" aria-live="polite"></p><div class="xsb"><button class="btn sm" id="xsp">◀</button><button class="btn sm" id="xsx">LANJUT ▶</button><button class="btn sm" id="xse">SELESAI</button></div></div><div class="xtoast" role="status" aria-live="polite"></div></div>
    <div class="xside">
      <div class="xcard xio"><div class="xlab">INPUT<span class="xcnt" id="xcnt"></span></div><div class="xrow"><span class="xtgs" id="xtgs"></span><span class="xy" id="xy"></span></div></div>
      <div class="xcard xttc"><div class="xlab">TABEL KEBENARAN X</div><div class="xtw"><table class="tt xtt" id="xtt"></table></div><p class="xmsg" id="xmsg"></p><p class="xex" id="xex" hidden></p></div>
      <div class="xcard xtools"><button class="btn sm" id="xdw" disabled>HAPUS KABEL</button><button class="btn sm" id="xdg" disabled>HAPUS GERBANG</button><button class="btn sm" id="xcl" disabled>KOSONGKAN</button></div>
    </div>
  </div>`;
  const svg = $('#xsvg', el), cv = $('.xcv', el), pal = $('.xpal', el), toast = $('.xtoast', el), stg = $('#stage');
  const MAXIN = 6, LET = 'ABCDEF';   // input bebas: A..F (maks. 6 -> tabel 64 baris)
  const G = [], W = [], I = []; let hn = 0, stp = -1, nid = 0, wid = 0, iid = 0, sel = null, drag = null, flash = null, cw = 0, ch = 0, K = .8, tT = 0, fT = 0, tblK = '', ioK = '', curR = -1, chi = -1, solved = false; const done = new Set(store.get('tkm_ch', [])), nDone = () => CH.filter(c => done.has(c.id)).length   // tantangan selesai tersimpan (Peta Kemajuan membacanya);
  const gate = id => G.find(n => n.id === id), inp = id => I.find(n => n.id === id), into = (id, pin) => W.find(w => w.to.t === 'g' && w.to.id === id && w.to.pin === pin), yw = () => W.find(w => w.to.t === 'y');
  const SI = () => I.slice().sort((a, b) => a.name < b.name ? -1 : 1), curV = () => { const o = {}; I.forEach(n => o[n.id] = n.v); return o };   // urutan kolom tabel = urutan nama (A paling kiri / bit tertinggi)

  /* evaluasi: null = belum diketahui (kaki kosong merambat; tidak pernah dianggap 0). vals = {idInput: 0/1} */
  const evalAt = vals => {
    const memo = {}, v = s => s.t === 'in' ? vals[s.id] : gv(s.id);
    const gv = id => { if (id in memo) return memo[id]; memo[id] = null; const n = gate(id), ins = (n.type === 'NOT' ? [0] : [0, 1]).map(p => { const w = into(id, p); return w ? v(w.from) : null }); return memo[id] = ins.includes(null) ? null : F[n.type](...ins) };
    return { v, gv };
  };
  const yVal = vals => { const w = yw(); return w ? evalAt(vals).v(w.from) : null };

  /* posisi */
  const term = () => ({ Y: { x: cw - 78, y: ch / 2 } });
  const gp = n => { const o = gGeo(n.type), w = (o.xo - o.xi) * K, tx = n.x - w / 2; return { o, w, tx, ins: o.ys.map(y => ({ x: tx, y: n.y + (y - 50) * K })), out: { x: tx + w, y: n.y } } };
  const mob = () => document.body.classList.contains('m');
  const goal2 = () => { const g = $('.xgoal', el); return g && !g.hidden ? Math.max(0, g.offsetHeight - 36) : 0 };   // bilah tujuan dua baris di ponsel tegak
  const clampG = n => { const hw = gp(n).w / 2; n.x = Math.max(112 + hw, Math.min(cw - 104 - hw, n.x)); n.y = Math.max(chi >= 0 ? (mob() ? 88 + goal2() : 102) : 58, Math.min(ch - 40, n.y)) };
  const clampI = n => { n.x = Math.max(84, Math.min(Math.max(84, cw - 190), n.x)); n.y = Math.max(chi >= 0 ? (mob() ? 58 + goal2() : 70) : 30, Math.min(ch - 40, n.y)) };
  const pinMap = () => {
    const t = term(), m = { Y: { kind: 'dst', ...t.Y, d: { t: 'y' } } };
    I.forEach(n => m[n.name] = { kind: 'src', x: n.x, y: n.y, d: { t: 'in', id: n.id } });
    G.forEach(n => { const p = gp(n); m[`g${n.id}o`] = { kind: 'src', ...p.out, d: { t: 'g', id: n.id } }; p.ins.forEach((q, i) => m[`g${n.id}i${i}`] = { kind: 'dst', ...q, d: { t: 'g', id: n.id, pin: i } }) });
    Object.keys(m).forEach(k => m[k].key = k); return m;
  };
  const keyOf = d => d.t === 'in' ? inp(d.id).name : d.t === 'y' ? 'Y' : d.pin === undefined ? `g${d.id}o` : `g${d.id}i${d.pin}`;
  const nearest = (pm, p, r, skip) => { let best = null, bd = r; for (const k in pm) { if (k === skip) continue; const d = Math.hypot(pm[k].x - p.x, pm[k].y - p.y); if (d < bd) { bd = d; best = k } } return best };
  const pt = e => { const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y } };

  /* aturan koneksi */
  const downstream = id => { const s = new Set([id]); let moved = true; while (moved) { moved = false; W.forEach(w => { if (w.from.t === 'g' && s.has(w.from.id) && w.to.t === 'g' && !s.has(w.to.id)) { s.add(w.to.id); moved = true } }) } return s };
  const why = (a, b) => {   // alasan penolakan, atau null bila sambungan sah
    if (a.kind === b.kind) return a.kind === 'src' ? 'Ditolak: input dan output gerbang hanya boleh disambung ke kaki input gerbang atau X.' : 'Ditolak: kaki input tidak bisa disambung ke kaki input lain.';
    const s = a.kind === 'src' ? a : b, d = a.kind === 'src' ? b : a;
    if (s.d.t === 'g' && d.d.t === 'g' && downstream(d.d.id).has(s.d.id)) return 'Ditolak: sambungan ini membuat putaran (siklus) yang tidak bisa dihitung.';
    return null;
  };
  const say = (msg, kind = 'info') => { toast.textContent = msg; toast.className = 'xtoast show ' + kind; clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('show'), 2800) };
  const connect = (a, b) => {
    const bad = why(a, b); if (bad) { Sfx('bad'); return say(bad, 'bad') }
    const s = a.kind === 'src' ? a : b, d = a.kind === 'src' ? b : a, dk = keyOf(d.d), old = W.find(w => keyOf(w.to) === dk);
    if (old && keyOf(old.from) === keyOf(s.d)) return say('Sudah tersambung.', 'info');
    if (old) W.splice(W.indexOf(old), 1);   // satu kaki input = satu sumber: sambungan baru menggantikan yang lama
    W.push({ id: ++wid, from: s.d, to: d.d }); sel = null; Sfx('plug');
    flash = dk; clearTimeout(fT); fT = setTimeout(() => { flash = null; render() }, 900);
    if (old) say('Kabel lama pada kaki itu diganti dengan yang baru.', 'ok');
  };

  /* edit */
  const freeSpot = () => { for (const fy of [.3, .55, .8]) for (const fx of [.32, .5, .68]) { const x = cw * fx, y = ch * fy; if (!G.some(n => Math.abs(n.x - x) < 100 && Math.abs(n.y - y) < 60)) return { x, y } } return { x: cw / 2 + Math.random() * 40, y: ch / 2 + Math.random() * 40 } };
  const inSpot = () => { const top = chi >= 0 ? (mob() ? 58 + goal2() : 70) : 30, hit = (x, y) => I.some(n => Math.abs(n.x - x) < 80 && Math.abs(n.y - y) < 62) || G.some(g => Math.abs(g.x - 20 - x) < 110 && Math.abs(g.y - y) < 56); for (const x of [84, 170, 256, 342]) { if (x > Math.max(84, cw - 190)) break; for (const fy of [.3, .7, .5, .12, .9, .2, .8, .4, .6]) { const y = ch * fy; if (y >= top && y <= ch - 40 && !hit(x, y)) return { x, y } } } return { x: 84, y: ch / 2 } };   // slot kosong terdekat (tidak menimpa input/gerbang lain)
  const place = (type, x, y) => { if (!allowed(type)) return deny(type); const n = { id: ++nid, type, x, y }; clampG(n); G.push(n); sel = { k: 'g', id: n.id }; Sfx('place'); render() };
  const placeIn = (v, x, y) => {
    if (!allowed('in' + v)) return deny('in' + v);
    if (I.length >= MAXIN) { Sfx('bad'); return say(`Maksimal ${MAXIN} input.`, 'bad') }
    const used = new Set(I.map(n => n.name)), n = { id: ++iid, name: LET.split('').find(c => !used.has(c)), v, x, y }; clampI(n); I.push(n); sel = { k: 'i', id: n.id }; Sfx('place');
    say(`Input ${n.name} ditambahkan. Tabel kebenaran sekarang ${1 << I.length} baris.`, 'info'); render();
  };
  const put = (type, x, y) => type[0] === 'i' ? placeIn(+type[2], x + 42, y) : place(type, x, y);   // kartu input: titik jatuh = tengah saklar
  const delSel = () => {
    if (!sel) return;
    if (sel.k === 'i' && inp(sel.id).lock) { Sfx('bad'); return say('Input tantangan tidak bisa dihapus.', 'bad') }
    Sfx(sel.k === 'w' ? 'unplug' : 'del');
    if (sel.k === 'w') W.splice(W.findIndex(w => w.id === sel.id), 1);
    else { const id = sel.id, t = sel.k === 'i' ? 'in' : 'g'; for (let i = W.length - 1; i >= 0; i--) if ((W[i].from.t === t && W[i].from.id === id) || (t === 'g' && W[i].to.t === 'g' && W[i].to.id === id)) W.splice(i, 1); if (t === 'in') I.splice(I.findIndex(n => n.id === id), 1); else G.splice(G.findIndex(n => n.id === id), 1) }   // kabel yang menempel ikut dihapus
    sel = null; render();
  };
  const toggleIn = id => { const n = inp(id); if (!n) return; hideTip(); n.v ^= 1; Sfx(n.v ? 'on' : 'off'); render() };

  const allowed = t => chi < 0 || (t[0] !== 'i' && (!CH[chi].ok || CH[chi].ok.includes(t)));
  const deny = t => { Sfx('bad'); say(t[0] === 'i' ? 'Input tantangan sudah disediakan. Pakai A, B, ... yang ada di kanvas.' : `Tantangan ini hanya boleh memakai: ${CH[chi].ok.join(', ')}.`, 'bad') };
  const list = $('.xlist', el);
  const hintBox = $('.xhint', el), hiBtn = $('#xhi', el);
  const hfade = () => { const t = $('.xht', hintBox); if (t) hintBox.classList.toggle('more', t.scrollTop + t.clientHeight < t.scrollHeight - 2) };
  const showHint = k => {   // k = 1..3: tingkat petunjuk; makin tinggi makin spesifik
    const c = CH[chi]; hn = Math.max(hn, k); const t = hn === 3 ? solText(c.s) : c.h[hn - 1];
    $('.xhk', hintBox).textContent = `PETUNJUK ${hn} / 3`; $('.xht', hintBox).textContent = t; $('#xhm', hintBox).hidden = hn >= 3; clearTimeout(tT); toast.classList.remove('show'); hintBox.hidden = false; hiBtn.setAttribute('aria-expanded', 'true'); hiBtn.textContent = hn > 1 ? `HINT ${hn}/3` : 'HINT'; $('.xht', hintBox).scrollTop = 0; requestAnimationFrame(hfade);
  };
  const closeHint = () => { hintBox.hidden = true; hiBtn.setAttribute('aria-expanded', 'false') };
  const resetHint = () => { hn = 0; closeHint(); hiBtn.textContent = 'HINT' };
  const openList = () => {
    const nx = CH.findIndex(c => !done.has(c.id));
    list.innerHTML = `<div class="xlh"><b>PILIH TANTANGAN<small>${nDone()} / ${CH.length} selesai</small></b><button class="xlx" aria-label="Tutup daftar">✕</button></div><div class="xlg">${CH.map((c, i) => `${i === 0 || CH[i - 1].l !== c.l ? `<h3 class="xlv">LEVEL ${c.l + 1}<span>${LVN[c.l]}</span></h3>` : ''}<button class="xli${i === chi ? ' cur' : ''}${i === nx ? ' nxt' : ''}" data-i="${i}"><b>${i + 1}</b><span>${c.t}</span><i>${c.n} input · ${LVD[c.l]}${done.has(c.id) ? ' · ✓ selesai' : i === nx ? ' · berikutnya' : ''}</i></button>`).join('')}</div>`;
    list.hidden = false; $('.xlx', list).onclick = () => { list.hidden = true };
    $$('.xli', list).forEach(b => b.onclick = () => startCh(+b.dataset.i)); Sfx('tick');
    const cur = $('.xli.cur', list) || $('.xli.nxt', list); cur && requestAnimationFrame(() => cur.scrollIntoView({ block: 'nearest' }));
  };
  const startCh = i => {
    const had = G.length + I.length > 0, c = CH[i]; chi = i; solved = false; resetHint(); G.length = 0; W.length = 0; I.length = 0; iid = 0; sel = null; list.hidden = true; hideTip();
    const top = (mob() ? 58 + goal2() : 70), yIn = j => c.n >= 4 ? top + j * (ch - 40 - top) / (c.n - 1) : ch * (j + 1) / (c.n + 1);   // 4+ input: rata di seluruh tinggi kanvas
    for (let j = 0; j < c.n; j++) { const n = { id: ++iid, name: LET[j], v: 0, lock: true, x: 84, y: yIn(j) }; clampI(n); I.push(n) }   // tantangan: input A, B, ... disediakan dan terkunci
    if (c.n >= 4) requestAnimationFrame(() => requestAnimationFrame(() => { if (chi === i) { I.forEach((n, j) => { n.y = yIn(j); clampI(n) }); render() } }));   // tinggi kanvas berubah setelah bilah tujuan muncul
    Sfx('tick'); say(`Tantangan ${i + 1}: ${c.t}.${had ? ' Rangkaian lama dikosongkan.' : ''}`, 'info'); render();
  };
  const exitCh = () => { chi = -1; solved = false; resetHint(); I.forEach(n => { delete n.lock }); Sfx('tick'); say('Kembali ke mode bebas. Rangkaianmu tetap ada.', 'info'); render() };

  /* ekspresi Boolean: NOT = garis di atas (overline). p = tingkat (4 atom/garis atas, 3 AND, 2 XOR, 1 OR); d = kedalaman garis atas.
     h = HTML untuk ditampilkan, t = teks polos (¬) untuk pembaca layar */
  const OPS = { AND: '·', OR: '+', XOR: '⊕' }, BASE = { AND: 'AND', NAND: 'AND', OR: 'OR', NOR: 'OR', XOR: 'XOR', XNOR: 'XOR' }, PREC = { AND: 3, XOR: 2, OR: 1 };
  const bar = (h, t, d) => ({ h: `<span class="ov" style="padding-top:${(d - 1) * 3}px">${h}</span>`, t, p: 4, op: '', d });
  const expr = src => {
    if (src.t === 'in') { const n = inp(src.id); return { h: n.name, t: n.name, p: 4, op: '', d: 0 } }
    const n = gate(src.id), kids = (n.type === 'NOT' ? [0] : [0, 1]).map(p => { const w = into(n.id, p); return w ? expr(w.from) : null });
    if (kids.includes(null)) return null;
    if (n.type === 'NOT') { const e = kids[0]; return bar(e.h, e.p === 4 ? `¬${e.t}` : `¬(${e.t})`, e.d + 1) }
    const b = BASE[n.type], wr = e => e.p === 4 || e.op === b ? [e.h, e.t] : [`(${e.h})`, `(${e.t})`], a0 = wr(kids[0]), a1 = wr(kids[1]), h = a0[0] + OPS[b] + a1[0], t = a0[1] + OPS[b] + a1[1], d = Math.max(kids[0].d, kids[1].d);
    return /^N|^XN/.test(n.type) ? bar(h, `¬(${t})`, d + 1) : { h, t, p: PREC[b], op: b, d };
  };

  /* tooltip nilai: kursor di atas kabel/kaki (mouse), atau ketuk (layar sentuh) */
  const tip = $('.xtip', el); let tipT = 0;
  const nm = d => d.t === 'in' ? `Input ${inp(d.id).name}` : d.t === 'y' ? 'X' : d.pin === undefined ? `Output ${gate(d.id).type}` : `Kaki ${d.pin + 1} ${gate(d.id).type}`;
  const vw = v => v == null ? 'belum diketahui' : v ? '1 (menyala)' : '0 (mati)';
  const hideTip = () => { clearTimeout(tipT); tip.hidden = true };
  const showTip = (p, txt, hold) => { clearTimeout(tipT); tip.textContent = txt; tip.hidden = false; const half = Math.min(130, cw / 2 - 6); tip.style.left = Math.max(half, Math.min(cw - half, p.x)) + 'px'; tip.style.top = Math.max(4, p.y - 42) + 'px'; if (hold) tipT = setTimeout(hideTip, hold) };
  const wireTip = w => `Kabel ${nm(w.from)} → ${nm(w.to)}: ${vw(evalAt(curV()).v(w.from))}`;
  const pinTip = q => { const w = q.kind === 'dst' ? W.find(x => keyOf(x.to) === q.key) : null; return q.kind === 'dst' && !w ? `${nm(q.d)}: belum tersambung` : `${nm(q.d)}: ${vw(evalAt(curV()).v(w ? w.from : q.d))}` };

  /* gambar */
  const wpath = (a, b) => { const dx = Math.max(36, Math.abs(b.x - a.x) / 2); return `M${a.x} ${a.y}C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}` };   // kabel lentur (kurva Bezier) dari pin ke pin
  const vtxt = v => v == null ? '?' : v;
  const sc = v => v == null ? INK : v ? '#18b04a' : '#a592bd';   // satu warna sinyal: 1 = hijau, 0 = lavender, belum diketahui = tinta
  /* mode LANGKAH: telusuri rangkaian dari input ke X, satu gerbang per langkah */
  const RULE = { AND: 'AND: keluaran 1 hanya jika semua masukan 1', OR: 'OR: keluaran 1 jika minimal satu masukan 1', NOT: 'NOT: membalik masukan', NAND: 'NAND: kebalikan AND, keluaran 0 hanya jika semua masukan 1', NOR: 'NOR: kebalikan OR, keluaran 1 hanya jika semua masukan 0', XOR: 'XOR: keluaran 1 jika kedua masukan berbeda', XNOR: 'XNOR: keluaran 1 jika kedua masukan sama' };
  const order = () => { const w = yw(); if (!w || w.from.t !== 'g') return []; const out = [], seen = new Set(), vis = id => { if (seen.has(id)) return; seen.add(id); (gate(id).type === 'NOT' ? [0] : [0, 1]).forEach(p => { const x = into(id, p); if (x && x.from.t === 'g') vis(x.from.id) }); out.push(id) }; vis(w.from.id); return out };
  const gname = n => { const same = G.filter(x => x.type === n.type); return same.length > 1 ? `${n.type} ke-${same.indexOf(n) + 1}` : n.type };
  const stepUI = (ev, ord, yv) => {
    const ready = ord.length > 0 && yv != null, pan = $('.xstp', el), chip = $('#xst', el);
    if (stp >= 0 && !ready) stp = -1; if (stp > ord.length) stp = ord.length;
    chip.hidden = stp >= 0 || !ready; pan.hidden = stp < 0; if (stp < 0) return;
    const N = ord.length; let t;
    if (stp < N) { const g = gate(ord[stp]), ins = (g.type === 'NOT' ? [0] : [0, 1]).map(p => ev.v(into(g.id, p).from)); t = `Langkah ${stp + 1} dari ${N + 1}. Gerbang ${gname(g)}: masukan ${ins.join(' dan ')}, keluaran ${ev.gv(g.id)}. ${RULE[g.type]}.` }
    else t = `Langkah ${N + 1} dari ${N + 1}. Hasil akhir X = ${yv}. ${yv ? 'Rangkaian ini menyala.' : 'Rangkaian ini mati.'} Ubah input untuk melihat langkahnya berubah.`;
    $('#xstt', el).textContent = t; $('#xsp', el).disabled = stp === 0; $('#xsx', el).disabled = stp >= N;
  };
  /* undo/redo: potret struktur (gerbang, kabel, input) dicatat otomatis setelah perubahan berhenti 0,4 s (satu seretan = satu entri). Nilai saklar tidak dicatat. Mati selama Mode Tantangan. */
  const snap = () => ({ G: G.map(g => ({ ...g })), W: JSON.parse(JSON.stringify(W)), I: I.map(n => ({ ...n })), nid, wid, iid });
  const skey = () => JSON.stringify([G.map(g => [g.id, g.type, Math.round(g.x), Math.round(g.y)]), W.map(w => [w.id, w.from, w.to]), I.map(n => [n.id, n.name, Math.round(n.x), Math.round(n.y)])]);
  const btns = () => { $('.xundo', el).hidden = chi >= 0; $('#xun', el).disabled = !hist.length; $('#xre', el).disabled = !fut.length };
  const hist = [], fut = []; let base = snap(), baseKey = skey(), cT = 0;
  const commit = () => {
    const k = skey();
    if (chi >= 0) { hist.length = fut.length = 0; base = snap(); baseKey = k; return }
    if (k === baseKey) return;
    hist.push(base); if (hist.length > 60) hist.shift(); fut.length = 0; base = snap(); baseKey = k; btns();
  };
  const restore = s => {
    const cur = new Map(I.map(n => [n.id, n.v]));
    G.length = W.length = I.length = 0; G.push(...s.G.map(g => ({ ...g }))); W.push(...JSON.parse(JSON.stringify(s.W))); I.push(...s.I.map(n => ({ ...n, v: cur.has(n.id) ? cur.get(n.id) : n.v })));
    nid = Math.max(nid, s.nid); wid = Math.max(wid, s.wid); iid = Math.max(iid, s.iid); sel = null; stp = -1; hideTip(); base = snap(); baseKey = skey(); render();
  };
  const undo = () => { clearTimeout(cT); commit(); if (chi >= 0 || !hist.length) return; fut.push(base); Sfx('tick'); restore(hist.pop()) };
  const redo = () => { clearTimeout(cT); commit(); if (chi >= 0 || !fut.length) return; hist.push(base); Sfx('tick'); restore(fut.pop()) };
  const render = () => {
    if (!cw) return;
    const pm = pinMap(), vals = curV(), ev = evalAt(vals), t = term(), ord = order(); let h = '';
    if (stp >= 0 && (!ord.length || yVal(vals) == null)) stp = -1;
    const vis = new Set(ord.slice(0, stp + 1)), cur = stp >= 0 && stp < ord.length ? ord[stp] : -1, wdim = w => stp >= 0 && ((w.from.t === 'g' && !vis.has(w.from.id)) || (w.to.t === 'g' ? !vis.has(w.to.id) : stp < ord.length)), gdim = n => stp >= 0 && !vis.has(n.id);
    W.forEach(w => {
      const a = pm[keyOf(w.from)], b = pm[keyOf(w.to)], v = ev.v(w.from), d = wpath(a, b), on = sel && sel.k === 'w' && sel.id === w.id;
      h += `<g class="xw${wdim(w) ? ' xdim' : ''}" data-w="${w.id}">${on ? `<path d="${d}" stroke="#ff7eb6" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5"/>` : ''}<path d="${d}" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${v == null ? '#cdbfd6' : sc(v)}" stroke-width="3.6" fill="none" stroke-linecap="round"${v == null ? ' stroke-dasharray="7 6"' : ''}/><path class="xwh" d="${d}" stroke="transparent" stroke-width="20" fill="none"/></g>`;
    });
    G.forEach(n => {
      const p = gp(n), on = sel && sel.k === 'g' && sel.id === n.id, nx = p.tx + ((n.type === 'NOT' ? 85 : 88) - 30) * K;
      h += `<g class="xg${on ? ' on' : ''}${gdim(n) ? ' xdim' : ''}" data-g="${n.id}">${n.id === cur ? `<rect class="xhl" x="${p.tx - 12}" y="${n.y - 35 * K - 28}" width="${p.w + 24}" height="${70 * K + 36}" rx="12" fill="#ffd54a33" stroke="#ff7eb6" stroke-width="3.5"/>` : ''}${on ? `<rect x="${p.tx - 12}" y="${n.y - 35 * K - 28}" width="${p.w + 24}" height="${70 * K + 36}" rx="12" fill="#ff7eb61f" stroke="#ff7eb6" stroke-width="2.5" stroke-dasharray="6 4"/>` : ''}<rect x="${p.tx - 8}" y="${n.y - 35 * K - 6}" width="${p.w + 16}" height="${70 * K + 12}" fill="transparent"/>${gGfx(n.type, p.tx, n.y, K)}<rect x="${nx - 24}" y="${n.y - 35 * K - 24}" width="48" height="17" rx="8.5" fill="${INK}"/><text x="${nx}" y="${n.y - 35 * K - 11}" font-size="11.5" font-weight="800" fill="#fff" text-anchor="middle">${n.type}</text></g>`;
    });
    I.forEach(n => {   // input = saklar bebas: huruf + angka 0/1; pink saat 1, lavender saat 0. Ketuk = ubah nilai, seret = pindah
      const v = n.v, x0 = n.x - 70, on = sel && sel.k === 'i' && sel.id === n.id;
      h += `<g class="xt${v ? ' on' : ''}" data-t="${n.id}" role="button" aria-label="Input ${n.name} = ${v}. Ketuk untuk mengubah, seret untuk memindah">${on ? `<rect x="${x0 - 8}" y="${n.y - 23}" width="${56 + 8 + 14 + 8 + 6}" height="64" rx="12" fill="#ff7eb61f" stroke="#ff7eb6" stroke-width="2.5" stroke-dasharray="6 4"/>` : ''}<rect x="${x0 - 6}" y="${n.y - 19}" width="${56 + 6 + 16}" height="54" fill="transparent"/><path d="M${n.x - 14} ${n.y}H${n.x}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${n.x - 14} ${n.y}H${n.x}" stroke="${sc(v)}" stroke-width="3.6" stroke-linecap="round"/>${pillG(v, x0, n.y, n.name)}<text x="${x0 + 28}" y="${n.y + 31}" font-size="11" font-weight="800" fill="${v ? '#a8426c' : '#8a6b86'}" text-anchor="middle">${v ? 'AKTIF (1)' : 'MATI (0)'}</text></g>`;
    });
    const yv = yVal(vals), yl = yw(), lx = t.Y.x + 38, ly = t.Y.y;   // output X: lingkaran polos; pink + cahaya lembut saat 1, lavender saat 0, putus-putus saat belum diketahui
    h += `<defs><radialGradient id="xhalo"><stop offset=".4" stop-color="#ff9cc6" stop-opacity=".5"/><stop offset="1" stop-color="#ff9cc6" stop-opacity="0"/></radialGradient></defs>`;
    if (yv) h += `<circle cx="${lx}" cy="${ly}" r="40" fill="url(#xhalo)"/>`;
    h += `<path d="M${t.Y.x} ${ly}H${lx - 12}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${t.Y.x} ${ly}H${lx - 12}" stroke="${yl ? sc(yv) : '#cdbfd6'}" stroke-width="3.6" stroke-linecap="round"/>`;
    h += `<circle cx="${lx}" cy="${ly}" r="19" fill="${yv ? '#ff9cc6' : yv === 0 ? '#d9cbe8' : '#fff'}" stroke="${INK}" stroke-width="3.5"${yv == null ? ' stroke-dasharray="5 4"' : ''}/><text x="${lx}" y="${ly + 6}" font-size="17" font-weight="800" fill="${INK}" text-anchor="middle">X</text><text x="${lx}" y="${ly + 40}" font-size="13" font-weight="800" fill="${yv ? '#a8426c' : INK}" text-anchor="middle">${yl ? `X = ${vtxt(yv)}` : 'X kosong'}</text>`;
    // pin
    const cand = drag && drag.k === 'wire' ? nearest(pm, drag.p, 24, drag.from.key) : null;
    for (const k in pm) {
      const q = pm[k], d = q.d, linked = q.kind === 'dst' ? W.some(w => keyOf(w.to) === k) : true;
      const v = q.kind === 'src' ? ev.v(d) : (W.find(w => keyOf(w.to) === k) ? ev.v(W.find(w => keyOf(w.to) === k).from) : null);
      h += `<circle class="xpin" data-pin="${k}" cx="${q.x}" cy="${q.y}" r="7" fill="${v == null ? '#fff' : sc(v)}" stroke="${q.kind === 'dst' && !linked ? '#ff4d6d' : INK}" stroke-width="3"${q.kind === 'dst' && !linked ? ' stroke-dasharray="3 2.5"' : ''}/>`;
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
    stepUI(ev, ord, yv);
    sync(yv);
    clearTimeout(cT); cT = setTimeout(commit, 400);
    btns();
  };
  // bayangan di dasar tabel panjang: tanda masih ada baris di bawah
  const tfade = () => { const w = $('.xtw', el); if (w) w.classList.toggle('more', w.scrollTop + w.clientHeight < w.scrollHeight - 2) };
  $('.xtw', el).addEventListener('scroll', tfade, { passive: true }); new ResizeObserver(tfade).observe($('.xtw', el));
  const sync = yv => {
    const SIn = SI(), n = SIn.length, rows = 1 << n, bit = (r, i) => (r >> (n - 1 - i)) & 1, C = chi >= 0 ? CH[chi] : null;   // baris r: input pertama (A) = bit tertinggi
    $('.xp', el).classList.toggle('n3', n >= 3);
    const ik = SIn.map(x => x.id).join(',');
    if (ioK !== ik) { ioK = ik; $('#xtgs', el).innerHTML = n ? SIn.map(x => `<button class="xtg" data-id="${x.id}" aria-pressed="false"></button>`).join('') : '<span class="xnone">Belum ada input</span>' }
    $$('.xtg', el).forEach(b => { const x = inp(+b.dataset.id); b.textContent = `${x.name} = ${x.v}`; b.setAttribute('aria-pressed', x.v); b.classList.toggle('on', !!x.v) });
    $('#xcnt', el).textContent = `${n} / ${MAXIN}`;
    const xy = $('#xy', el); xy.textContent = `X = ${vtxt(yv)}`; xy.className = 'xy' + (yv ? ' on' : yv == null ? ' na' : '');
    const tk = SIn.map(x => x.name).join('') + (C ? '|c' : ''), tt = $('#xtt', el);
    tt.hidden = !n;
    if (tblK !== tk) { tblK = tk; curR = -1; tt.innerHTML = `<tr>${SIn.map(x => `<th>${x.name}</th>`).join('')}<th>X</th>${C ? '<th class="xth">TARGET</th>' : ''}</tr>` + Array.from({ length: rows }, (_, r) => `<tr data-r="${r}">${SIn.map((_, i) => `<td>${bit(r, i)}</td>`).join('')}<td class="xyc"></td>${C ? '<td class="xtgt"></td>' : ''}</tr>`).join('') }
    const cur = SIn.reduce((a, x) => a * 2 + x.v, 0); let okN = 0, nul = 0;
    $$('#xtt tr[data-r]', el).forEach(tr => {
      const r = +tr.dataset.r, vals = {}; SIn.forEach((x, i) => { vals[x.id] = bit(r, i) });
      const y = yVal(vals), c = tr.querySelector('.xyc'), tg = C ? +C.y[r] : null;
      c.textContent = y == null ? '–' : y; c.classList.toggle('na', y == null); tr.classList.toggle('hl', r === cur);
      if (y == null) nul++; else if (C && y === tg) okN++;
      if (C) { tr.querySelector('.xtgt').textContent = tg; c.classList.toggle('ok', y != null && y === tg); c.classList.toggle('bad', y != null && y !== tg) }
    });
    if (curR !== cur) {   // tabel panjang (banyak input): baris aktif selalu terlihat
      curR = cur; const w = $('.xtw', el), tr = $(`#xtt tr[data-r="${cur}"]`, el);
      if (tr && w.scrollHeight > w.clientHeight + 1) { const k = stg.getBoundingClientRect().width / stg.offsetWidth, wr = w.getBoundingClientRect(), tb = tr.getBoundingClientRect(), hh = $('#xtt th', el).getBoundingClientRect().height; if (tb.top < wr.top + hh) w.scrollTop += (tb.top - wr.top - hh) / k; else if (tb.bottom > wr.bottom) w.scrollTop += (tb.bottom - wr.bottom) / k }
    }
    const msg = $('#xmsg', el), has = yw(), now = !!C && !!has && !nul && okN === rows && n === C.n;
    if (now && !solved) { solved = true; closeHint(); done.add(C.id); store.set('tkm_ch', [...done]); Sfx('win'); say(`Benar! Tantangan selesai dengan ${G.length} gerbang.`, 'ok') } else if (!now) solved = false;
    msg.textContent = C && has && !nul ? (now ? `✓ Benar! Semua ${rows} baris cocok dengan target (${G.length} gerbang).` : `Cocok ${okN} dari ${rows} baris. Baris merah belum sesuai target.`)
      : !n ? 'Belum ada input. Seret kartu INPUT 0 atau INPUT 1 dari palet ke kanvas.' : !G.length && !has ? 'Belum ada gerbang. Tambahkan gerbang lalu sambungkan ke X.' : !has ? 'Hasil belum tersedia: X belum tersambung ke output gerbang atau input.' : yv == null ? 'Hasil belum tersedia: rangkaian belum lengkap, masih ada kaki input gerbang yang kosong.' : `Saat ini ${SIn.map(x => `${x.name} = ${x.v}`).join(', ')}, maka X = ${yv}.`;
    requestAnimationFrame(tfade);
    const E = has ? expr(has.from) : null, ex = $('#xex', el); ex.hidden = !has; ex.classList.toggle('na', !E);
    if (has) { if (E) { ex.innerHTML = `X = ${E.h}`; ex.setAttribute('aria-label', `X = ${E.t}`) } else { ex.textContent = 'X = … (rangkaian belum lengkap)'; ex.removeAttribute('aria-label') } }
    const gl = $('.xgoal', el); gl.hidden = !C; if (C) { $('.xgt', gl).innerHTML = `<b><span class="xgw">TANTANGAN </span>${chi + 1}/${CH.length}</b> ${C.t}`; gl.title = C.t; $('#xgn', el).hidden = !solved || chi >= CH.length - 1; hiBtn.hidden = solved }
    $$('.xpi', el).forEach(b => b.classList.toggle('dis', !allowed(b.dataset.g)));
    msg.classList.toggle('warn', yv == null && !!(G.length || has));
    $('.xempty', el).hidden = G.length + I.length > 0;
    const si = sel && sel.k === 'i';
    $('#xdw', el).disabled = !(sel && sel.k === 'w'); $('#xdg', el).disabled = !(sel && (sel.k === 'g' || (si && !inp(sel.id).lock))); $('#xdg', el).textContent = si ? 'HAPUS INPUT' : 'HAPUS GERBANG'; $('#xcl', el).disabled = !(G.length || W.length || (chi < 0 && I.length));
  };

  /* pointer: kanvas (pindah gerbang/input, tarik kabel, pilih) */
  svg.addEventListener('pointerdown', e => {
    if (e.button > 0) return; const p = pt(e), pm = pinMap(), k = nearest(pm, p, 18), tg = e.target.closest('[data-t]'), gg = e.target.closest('[data-g]'), ww = e.target.closest('[data-w]');
    svg.setPointerCapture(e.pointerId); drag = null; hideTip();
    if (k) { drag = { k: 'wire', from: pm[k], p, id: e.pointerId, moved: false }; sel = null }
    else if (tg) { const n = inp(+tg.dataset.t); drag = { k: 'inp', n, dx: n.x - p.x, dy: n.y - p.y, x0: p.x, y0: p.y, moved: false, id: e.pointerId }; sel = { k: 'i', id: n.id } }
    else if (gg) { const n = gate(+gg.dataset.g); drag = { k: 'gate', n, dx: n.x - p.x, dy: n.y - p.y, moved: false, id: e.pointerId }; sel = { k: 'g', id: n.id } }
    else if (ww) { const w = W.find(x => x.id === +ww.dataset.w); sel = { k: 'w', id: w.id }; showTip(p, wireTip(w), 2400) }
    else sel = null;
    render();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return; const p = pt(e);
    if (drag.k === 'gate') { drag.n.x = p.x + drag.dx; drag.n.y = p.y + drag.dy; clampG(drag.n) }
    else if (drag.k === 'inp') { if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) > 6) drag.moved = true; if (drag.moved) { drag.n.x = p.x + drag.dx; drag.n.y = p.y + drag.dy; clampI(drag.n) } }
    else { drag.p = p; if (Math.hypot(p.x - drag.from.x, p.y - drag.from.y) > 8) drag.moved = true }
    render();
  });
  const endDrag = (e, ok) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
    if (ok && d.k === 'inp' && !d.moved) return toggleIn(d.n.id);   // ketukan (tanpa geser) pada saklar = ubah nilai
    if (ok && d.k === 'wire') { const pm = pinMap(), k = nearest(pm, pt(e), 24, d.from.key); if (k && (d.moved || !why(d.from, pm[k]))) connect(d.from, pm[k]); else if (!d.moved) showTip({ x: d.from.x, y: d.from.y }, pinTip(d.from), 2400) }   // ketukan (tanpa geser) yang tidak menghasilkan sambungan sah: tampilkan nilai pin, bukan pesan penolakan
    render();
  };
  svg.addEventListener('pointermove', e => { if (drag || e.pointerType !== 'mouse') return; const p = pt(e), pm = pinMap(), k = nearest(pm, p, 12), ww = e.target.closest('[data-w]'); if (k) showTip(p, pinTip(pm[k])); else if (ww) showTip(p, wireTip(W.find(w => w.id === +ww.dataset.w))); else hideTip() });
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideTip() });   // sentuh: browser memicu pointerleave tepat setelah jari diangkat
  svg.addEventListener('pointerup', e => endDrag(e, true)); svg.addEventListener('pointercancel', e => endDrag(e, false));

  /* pointer: palet -> kanvas (seret) atau ketuk untuk menambah */
  let pd = null;
  const ghost = type => { const g = document.createElement('div'); g.className = 'xghost' + (type[0] === 'i' ? ' xi' : ''); g.innerHTML = type[0] === 'i' ? `<svg viewBox="0 0 60 34">${pillG(+type[2], 2, 17, '+')}</svg>` : `<svg viewBox="0 0 130 70">${gGfx(type, 10, 36, .8)}</svg>`; stg.appendChild(g); return g };
  const moveGhost = (g, e) => { const r = stg.getBoundingClientRect(), k = r.width / stg.offsetWidth; g.style.left = (e.clientX - r.left) / k + 'px'; g.style.top = (e.clientY - r.top) / k + 'px' };
  pal.addEventListener('pointerdown', e => { const b = e.target.closest('.xpi'); if (!b || e.button > 0) return; if (!allowed(b.dataset.g)) return deny(b.dataset.g); pd = { type: b.dataset.g, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, gh: null }; pal.setPointerCapture(e.pointerId) });
  pal.addEventListener('pointermove', e => { if (!pd || e.pointerId !== pd.id) return; if (!pd.moved && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 6) { pd.moved = true; pd.gh = ghost(pd.type) } if (pd.gh) moveGhost(pd.gh, e) });
  const palEnd = (e, ok) => {
    if (!pd || e.pointerId !== pd.id) return; const d = pd; pd = null; d.gh && d.gh.remove(); if (!ok) return;
    if (!d.moved) { const s = d.type[0] === 'i' ? inSpot() : freeSpot(); d.type[0] === 'i' ? placeIn(+d.type[2], s.x, s.y) : place(d.type, s.x, s.y); return }
    const r = svg.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { const q = pt(e); put(d.type, q.x, q.y) } else say('Lepaskan di atas kanvas.', 'info');
  };
  pal.addEventListener('pointerup', e => palEnd(e, true)); pal.addEventListener('pointercancel', e => palEnd(e, false));
  pal.addEventListener('click', e => { const b = e.target.closest('.xpi'); if (b && e.detail === 0) { const t = b.dataset.g, s = t[0] === 'i' ? inSpot() : freeSpot(); t[0] === 'i' ? placeIn(+t[2], s.x, s.y) : place(t, s.x, s.y) } });   // aktivasi lewat keyboard

  /* tombol */
  $('#xtgs', el).onclick = e => { const b = e.target.closest('.xtg'); if (b) toggleIn(+b.dataset.id) };
  $('#xdw').onclick = delSel; $('#xdg').onclick = delSel;
  $('#xst').onclick = () => { stp = 0; Sfx('tick'); render() }; $('#xsp').onclick = () => { stp = Math.max(0, stp - 1); Sfx('tick'); render() }; $('#xsx').onclick = () => { stp++; Sfx('tick'); render() }; $('#xse').onclick = () => { stp = -1; Sfx('tick'); render() };
  $('#xun').onclick = undo; $('#xre').onclick = redo;
  $('#xcl').onclick = () => { G.length = 0; W.length = 0; if (chi < 0) I.length = 0; sel = null; Sfx('del'); say('Rangkaian dikosongkan.', 'info'); render() };
  $('#xch').onclick = () => { if (list.hidden) openList(); else list.hidden = true };
  $('.xht', hintBox).addEventListener('scroll', hfade, { passive: true }); new ResizeObserver(hfade).observe(hintBox);
  $('#xgl').onclick = openList; hiBtn.onclick = () => { if (chi < 0) return; Sfx('tick'); if (!hintBox.hidden) closeHint(); else showHint(Math.max(hn, 1)) }; $('#xhm').onclick = () => { Sfx('tick'); showHint(hn + 1) }; $('#xhx').onclick = () => { Sfx('tick'); closeHint() }; $('#xgx').onclick = exitCh; $('#xgn').onclick = () => startCh(chi + 1);
  const back = () => { Sfx('tick'); go('simpick') };
  $('#back').onclick = back;
  document.onkeydown = e => { const z = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase(); if (z === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() } else if (z === 'y') { e.preventDefault(); redo() } else if (e.key === 'Escape') { if (!list.hidden) list.hidden = true; else back() } else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); delSel() } };

  el.classList.add('on');
  const ro = new ResizeObserver(() => { cw = cv.clientWidth; ch = cv.clientHeight; if (!cw) return; K = mob() ? .66 : .8; svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`); G.forEach(clampG); I.forEach(clampI); render() });
  ro.observe(cv);
  scene = { cleanup() { ro.disconnect(); clearTimeout(cT); clearTimeout(tT); clearTimeout(fT); clearTimeout(tipT); pd && pd.gh && pd.gh.remove(); el.innerHTML = ''; document.onkeydown = null } };
};
