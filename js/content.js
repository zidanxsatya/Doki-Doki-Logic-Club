/* content.js : semua teks & soal (mudah diedit) */
const gateBoard = (g, desc) => `<div class="gb"><div class="gl"><div class="card">${gateSVG(g, null, null, null, false)}</div><p>${desc}</p></div><div class="gr"><div class="card">${tt(g)}</div><p class="fm">${FORM[g]}</p></div></div>`;

const MATERI = [
  { t: 'Pengertian Rangkaian Logika', e: 'talk', html: '<ul><li>Rangkaian logika = rangkaian <b>digital</b> yang memproses sinyal bernilai <b>0</b> atau <b>1</b>.</li><li>Dibangun dari <b>gerbang logika</b> yang mengambil keputusan.</li><li>Di mekatronika: PLC, interlock mesin, kontrol motor, alarm sensor.</li></ul>',
    say: ['Mulai dari dasar ya. Rangkaian logika itu rangkaian digital yang mengambil keputusan dari sinyal 0 dan 1.', 'Di dalamnya ada gerbang-gerbang kecil yang kerjanya "memutuskan". Kedengarannya ribet, tapi nggak kok.'] },
  { t: 'Konsep Input dan Output', e: 'happy', html: '<div class="flow"><div>INPUT<small>sensor, tombol, saklar</small></div><span>➜</span><div>PROSES<small>gerbang logika</small></div><span>➜</span><div>OUTPUT<small>lampu, motor, buzzer</small></div></div><p>Contoh: tombol START ditekan (input) → logika memutuskan → motor menyala (output).</p>',
    say: ['Sistem kontrol apa pun punya input, proses, dan output.', 'Input itu telinganya, gerbang logika otaknya, output tangannya. Gitu cara aku ngebayanginnya.'] },
  { t: 'Logika 0 dan 1', e: 'calm', html: '<div class="flow"><div>LOGIKA 0<small>LOW · OFF · 0 V · salah</small></div><div>LOGIKA 1<small>HIGH · ON · +5 V · benar</small></div></div><p>Tombol ditekan = 1, dilepas = 0. Sensor mendeteksi benda = 1, tidak = 0.</p>',
    say: ['Komputer cuma kenal dua keadaan, 0 yang mati dan 1 yang hidup. Kayak saklar lampu.', 'Catat ya: 1 itu HIGH, ON, benar. 0 itu LOW, OFF, salah.'] },
  { t: 'Gerbang AND', e: 'talk', html: gateBoard('AND', 'Output <b>1</b> hanya jika <b>semua</b> input = 1. Seperti dua saklar yang dipasang <b>seri</b>.'),
    say: ['AND itu tegas. Outputnya baru 1 kalau A dan B dua-duanya 1.', 'Contohnya mesin press yang baru jalan kalau tombol kiri dan kanan ditekan bareng. Tangan jadi aman.'] },
  { t: 'Gerbang OR', e: 'happy', html: gateBoard('OR', 'Output <b>1</b> jika <b>minimal satu</b> input = 1. Seperti saklar yang dipasang <b>paralel</b>.'),
    say: ['OR lebih santai. Satu input 1 saja, outputnya langsung 1.', 'Contohnya alarm yang bunyi kalau sensor asap atau sensor panas aktif.'] },
  { t: 'Gerbang NOT', e: 'calm', html: gateBoard('NOT', 'Hanya <b>1 input</b>. Output adalah <b>kebalikan</b> input (inverter).'),
    say: ['NOT tukang balik. Masuk 0 keluar 1, masuk 1 keluar 0.', 'Inputnya cuma satu, beda dari gerbang dasar yang lain.'] },
  { t: 'Gerbang NAND', e: 'talk', html: gateBoard('NAND', 'NAND = <b>NOT AND</b>. Output 0 hanya jika semua input 1.'),
    say: ['NAND itu AND yang hasilnya dibalik pakai NOT.', 'Katanya semua gerbang lain bisa dibuat dari NAND saja. Yuri yang cerita, aku cuma percaya.'] },
  { t: 'Gerbang NOR', e: 'happy', html: gateBoard('NOR', 'NOR = <b>NOT OR</b>. Output 1 hanya jika semua input 0.'),
    say: ['NOR itu OR yang dibalik. Outputnya 1 cuma kalau semua input 0.', 'Sama seperti NAND, NOR juga bisa dipakai membuat gerbang lain.'] },
  { t: 'Gerbang XOR', e: 'talk', html: gateBoard('XOR', 'Exclusive OR: output <b>1</b> jika kedua input <b>berbeda</b>.'),
    say: ['XOR itu pendeteksi beda. A dan B berbeda, outputnya 1. Sama, outputnya 0.', 'Contohnya lampu tangga yang bisa dinyalakan dari atas maupun dari bawah.'] },
  { t: 'Gerbang XNOR', e: 'calm', html: gateBoard('XNOR', 'XNOR = <b>NOT XOR</b>: output <b>1</b> jika kedua input <b>sama</b>.'),
    say: ['XNOR kebalikan XOR. Outputnya 1 kalau A dan B sama.', 'Dipakai buat membandingkan dua sinyal, sama atau tidak.'] },
  { t: 'Tabel Kebenaran', e: 'cheer', html: `<table class="tt wide"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th><th>XNOR</th></tr>${[0, 1, 2, 3].map(i => `<tr><td>${i >> 1}</td><td>${i & 1}</td>${['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].map(g => `<td>${F[g](i >> 1, i & 1)}</td>`).join('')}</tr>`).join('')}</table><p>NOT: 0 → 1 dan 1 → 0. Dengan 2 input ada 2² = <b>4</b> kombinasi.</p>`,
    say: ['Tabel kebenaran mencatat output untuk semua kombinasi input. Dua input berarti empat baris.', 'Materinya selesai! Habis ini coba SIMULASI sama Yuri, terus LATIHAN dan EVALUASI.'] }
];

/* Flash Card Materi. f = sisi depan, b = sisi belakang, t = nama singkat di ringkasan. Semua isi bersumber dari halaman Materi. Tambah kartu = tambah objek. */
const GATE_RULE = {
  AND: 'Output 1 hanya jika semua input 1. Seperti saklar seri.', OR: 'Output 1 jika minimal satu input 1. Seperti saklar paralel.', NOT: 'Pembalik (inverter). Satu-satunya gerbang dasar dengan satu input.',
  NAND: 'NOT AND: output 0 hanya jika semua input 1.', NOR: 'NOT OR: output 1 hanya jika semua input 0.', XOR: 'Output 1 jika kedua input berbeda.', XNOR: 'NOT XOR: output 1 jika kedua input sama.'
};
const gateFront = g => gateSVG(g, null, null, null, false).replace(/<text x="\d+" y="2"[^>]*>[A-Z]+<\/text>/, '');   // nama gerbang dihapus dari gambar: itu jawabannya
const FLASH = [
  { t: 'Rangkaian logika', f: 'Rangkaian logika memproses sinyal bernilai apa?', b: 'Sinyal <b>digital</b>: hanya <b>0</b> atau <b>1</b>. Dibangun dari gerbang logika yang mengambil keputusan.' },
  { t: 'Input, proses, output', f: 'Sebutkan tiga bagian sistem kontrol, dan contoh masing-masing.', b: '<b>Input</b>: sensor, tombol, saklar.<br><b>Proses</b>: gerbang logika.<br><b>Output</b>: lampu, motor, buzzer.' },
  { t: 'Logika 1 dan 0', f: 'Apa arti logika <b>1</b> dan logika <b>0</b>?', b: '<b>1</b> = HIGH, ON, sekitar +5 V, benar.<br><b>0</b> = LOW, OFF, 0 V, salah.' },
  ...['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].map(g => ({ t: g, f: `<div class="card sm">${gateFront(g)}</div><p>Gerbang apa ini?</p>`, b: `<b>Gerbang ${g}</b><p>${GATE_RULE[g]}</p><p class="fm">${FORM[g]}</p>` })),
  { t: 'Mesin press', f: 'Mesin press baru jalan kalau tombol kiri <b>dan</b> tombol kanan ditekan. Gerbang apa?', b: '<b>AND</b>. Kedua input harus 1, jadi kedua tangan operator aman di tombol.' },
  { t: 'Alarm', f: 'Alarm berbunyi kalau sensor asap <b>atau</b> sensor panas aktif. Gerbang apa?', b: '<b>OR</b>. Cukup salah satu input 1 untuk membuat output 1.' },
  { t: 'Lampu tangga', f: 'Lampu tangga bisa dinyalakan dari lantai atas maupun bawah. Gerbang apa?', b: '<b>XOR</b>. Output 1 kalau kedua saklar berbeda posisi.' },
  { t: 'Seri dan paralel', f: 'Saklar <b>seri</b> setara gerbang apa? Dan saklar <b>paralel</b>?', b: 'Seri = <b>AND</b>. Paralel = <b>OR</b>.' },
  { t: 'Gerbang universal', f: 'Gerbang apa saja yang disebut <b>universal</b>?', b: '<b>NAND</b> dan <b>NOR</b>. Dengan salah satunya saja, semua gerbang lain bisa dibuat.' },
  { t: 'NAND 1 dan 1', f: 'NAND dengan A = 1 dan B = 1: berapa output?', b: '<b>0</b>. AND-nya 1, lalu dibalik oleh NOT menjadi 0.' },
  { t: 'XOR 1 dan 1', f: 'XOR dengan A = 1 dan B = 1: berapa output?', b: '<b>0</b>. Kedua input sama, dan XOR hanya 1 kalau inputnya berbeda.' },
  { t: 'XNOR 0 dan 0', f: 'XNOR dengan A = 0 dan B = 0: berapa output?', b: '<b>1</b>. Kedua input sama, dan itulah syarat XNOR menghasilkan 1.' },
  { t: 'Baris tabel', f: 'Tabel kebenaran dengan 2 input punya berapa baris?', b: '<b>4 baris</b>: 00, 01, 10, 11 (2² kombinasi). Dengan n input, ada 2ⁿ baris.' }
];
const FLASH_SAY = {
  go: 'Mau ulang materinya? Ada FLASH CARD di tombol bawah.',
  start: ['Ini Flash Card. Baca sisi depan, jawab dalam hati, lalu ketuk kartunya buat lihat jawaban.', 'Panah di bawah buat pindah kartu. Nggak ada nilai, jadi santai aja.']
};

const SIM_SAY = {
  AND: 'AND: keluarannya 1 hanya kalau A dan B sama-sama 1. Coba ubah salah satu input jadi 0, lalu lihat LED-nya.',
  OR: 'OR: satu input bernilai 1 saja sudah membuat outputnya 1. LED baru padam kalau keduanya 0.',
  NOT: 'NOT hanya punya satu input, dan outputnya selalu kebalikan dari input itu.',
  NAND: 'NAND itu AND yang dibalik. Bandingkan dengan tabel AND, hasilnya selalu berlawanan.',
  NOR: 'NOR itu OR yang dibalik. LED hanya menyala kalau A dan B sama-sama 0.',
  XOR: 'XOR menyala kalau kedua input berbeda. Kalau sama, hasilnya 0.',
  XNOR: 'XNOR kebalikan XOR. LED menyala kalau kedua input sama.'
};

/* LATIHAN (Natsuki): soal dibuat acak */
const HINT = { AND: 'AND hanya 1 kalau SEMUA input 1.', OR: 'OR bernilai 1 kalau minimal satu input 1.', NOT: 'NOT membalik: 0 jadi 1, 1 jadi 0.', NAND: 'NAND = kebalikan AND. Hitung AND dulu, lalu balik.', NOR: 'NOR = kebalikan OR. Hitung OR dulu, lalu balik.', XOR: 'XOR bernilai 1 kalau kedua input BERBEDA.', XNOR: 'XNOR bernilai 1 kalau kedua input SAMA.' };
const G2 = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];
const CONCEPT = [
  { q: 'Gerbang mana yang outputnya 1 hanya jika SEMUA input 1?', o: ['AND', 'OR', 'XOR', 'NOR'], a: 0, hint: 'Pikirkan dua saklar seri.' },
  { q: 'Gerbang yang hanya punya satu input adalah…', o: ['NOT', 'AND', 'XOR', 'NAND'], a: 0, hint: 'Dia si pembalik sinyal.' },
  { q: 'Logika 1 sama dengan keadaan…', o: ['HIGH / ON', 'LOW / OFF', 'Tidak terdefinisi', 'Selalu salah'], a: 0, hint: '1 = HIGH = ON = benar.' },
  { q: 'Berapa banyak baris tabel kebenaran untuk 2 input?', o: ['4', '2', '3', '8'], a: 0, hint: '2 pangkat jumlah input.' },
  { q: 'NAND sama dengan…', o: ['NOT AND', 'AND NOT', 'OR NOT', 'NOT OR'], a: 0, hint: 'Nama "N" di depan berarti dibalik.' },
  { q: 'Sensor dan tombol pada sistem kontrol berperan sebagai…', o: ['Input', 'Output', 'Gerbang', 'Catu daya'], a: 0, hint: 'Mereka mengirim informasi ke sistem.' },
  { q: 'Dua saklar yang dirangkai SERI (arus harus melewati keduanya) berperilaku seperti gerbang…', o: ['AND', 'OR', 'XOR', 'NOT'], a: 0, hint: 'Lampu hanya menyala kalau kedua saklar tertutup.' },
  { q: 'Dua saklar yang dirangkai PARALEL (arus boleh lewat salah satunya) berperilaku seperti gerbang…', o: ['OR', 'AND', 'NAND', 'XNOR'], a: 0, hint: 'Cukup satu saklar tertutup agar lampu menyala.' },
  { q: 'Salah satu gerbang universal, yang bisa dipakai menyusun semua gerbang lain, adalah…', o: ['NAND', 'XOR', 'AND', 'XNOR'], a: 0, hint: 'NAND dan NOR bisa membentuk gerbang apa pun.' },
  { q: 'Hasil dari NOT (NOT A) adalah…', o: ['A', 'NOT A', '0', '1'], a: 0, hint: 'Dibalik dua kali, kembali ke nilai awal.' },
  { q: 'Hasil dari A AND 0 selalu…', o: ['0', '1', 'A', 'NOT A'], a: 0, hint: 'AND butuh semua input 1, sedangkan satu inputnya sudah 0.' },
  { q: 'Hasil dari A OR 1 selalu…', o: ['1', '0', 'A', 'NOT A'], a: 0, hint: 'OR cukup satu input 1, dan satu inputnya sudah 1.' },
  { q: 'Hasil dari A XOR A (kedua inputnya sama) selalu…', o: ['0', '1', 'A', 'NOT A'], a: 0, hint: 'XOR hanya 1 kalau kedua input berbeda.' },
  { q: 'Menurut hukum De Morgan, NOT (A AND B) sama dengan…', o: ['(NOT A) OR (NOT B)', '(NOT A) AND (NOT B)', 'A OR B', 'NOT A'], a: 0, hint: 'Balik tiap input, lalu tukar AND menjadi OR.' },
  { q: 'Berapa banyak baris tabel kebenaran untuk 3 input?', o: ['8', '6', '9', '3'], a: 0, hint: '2 pangkat jumlah input: 2 × 2 × 2.' }
];
// situasi sehari-hari -> gerbang yang cocok
const SKEN = [
  ['AND', 'Brankas bank hanya terbuka kalau kunci fisik DAN kode PIN sama-sama benar.'],
  ['AND', 'Mesin pemotong hanya jalan kalau tombol kiri dan tombol kanan ditekan bersamaan.'],
  ['OR', 'Alarm rumah berbunyi kalau sensor pintu ATAU sensor jendela aktif.'],
  ['OR', 'Lampu lorong menyala kalau ada gerakan atau tombol manual ditekan.'],
  ['NOT', 'Lampu taman menyala saat sensor cahaya TIDAK mendeteksi cahaya (malam hari).'],
  ['XOR', 'Lampu tangga dengan dua saklar (atas dan bawah): lampu menyala kalau posisi kedua saklar berbeda.'],
  ['NAND', 'Lampu peringatan lift menyala kecuali kalau kedua pintu tertutup rapat.'],
  ['NOR', 'Mode hemat daya aktif hanya kalau tidak ada gerakan dan tidak ada suara.'],
  ['XNOR', 'Lampu hijau menyala kalau status dua sensor SAMA (sama-sama aktif atau sama-sama mati).']
];
// ekspresi Boolean (HTML, NOT = garis atas); par: hasil AND/OR/XOR dikurung saat jadi input gerbang lain
const BX = { AND: (a, b) => `${a} · ${b}`, OR: (a, b) => `${a} + ${b}`, XOR: (a, b) => `${a} ⊕ ${b}`, NAND: (a, b) => nb(`${a} · ${b}`), NOR: (a, b) => nb(`${a} + ${b}`), XNOR: (a, b) => nb(`${a} ⊕ ${b}`), NOT: a => nb(a) }, par = (g, s) => /^(AND|OR|XOR)$/.test(g) ? `(${s})` : s;
const QGEN = [
  () => { const g = pick(GL), a = rnd(), b = rnd(), y = F[g](a, b); // menentukan output
    return { kind: 'mc', q: `Berapa output Y gerbang ${g} jika ${g === 'NOT' ? 'A = ' + a : `A = ${a} dan B = ${b}`}?`, vis: `<div class="card sm">${gateSVG(g, a, g === 'NOT' ? null : b, null, false)}</div>`, opts: ['0', '1'], a: y, hint: HINT[g] } },
  () => { const g = pick(G2), o = shuffle(G2.filter(x => x !== g)).slice(0, 3); const opts = shuffle([g, ...o]); // menentukan gerbang
    return { kind: 'mc', q: 'Tabel kebenaran ini milik gerbang apa?', vis: `<div class="card sm">${tt(g)}</div>`, opts, a: opts.indexOf(g), hint: 'Lihat baris A=0,B=0 dan A=1,B=1, lalu cocokkan dengan aturan tiap gerbang.' } },
  () => { const g = pick(GL); // melengkapi tabel kebenaran
    const n = g === 'NOT' ? 2 : 4, ans = [...Array(n).keys()].map(i => g === 'NOT' ? F.NOT(i) : F[g](i >> 1, i & 1));
    return { kind: 'tt', g, n, ans, q: `Lengkapi tabel kebenaran gerbang ${g} (klik kotak "?" untuk mengubah 0/1).`, hint: HINT[g] } },
  () => ({ kind: 'mc', ...shuffleOpts(pick(CONCEPT)) }),
  () => { // membaca rangkaian 2 gerbang
    const [g1, g2] = [pick(G2), pick(['AND', 'OR', 'XOR', 'NAND', 'NOR'])], a = rnd(), b = rnd(), c = rnd(), x = F[g1](a, b), y = F[g2](x, c);
    return { kind: 'mc', q: 'Baca rangkaian berikut. Berapa output Y?', vis: `<div class="card sm">${circ(g1, g2, { t: { A: 'A = ' + a, B: 'B = ' + b, C: 'C = ' + c }, names: true, out: 'Y = ?', alt: `Gerbang ${g1} dengan input A=${a}, B=${b}, keluarannya masuk gerbang ${g2} bersama C=${c}; output Y` })}</div>`, opts: ['0', '1'], a: y, hint: `Hitung dulu X = ${g1}(A,B), lalu Y = ${g2}(X,C). ${HINT[g1]}` } },
  () => { // persamaan Boolean dari gambar rangkaian (1 gerbang atau 2 gerbang)
    const two = Math.random() < .55, ex = (g1, g2) => g2 === 'NOT' ? BX.NOT(BX[g1]('A', 'B')) : BX[g2](par(g1, BX[g1]('A', 'B')), 'C');
    if (!two) { const g = pick(GL), e = g => g === 'NOT' ? BX.NOT('A') : BX[g]('A', 'B'), opts = shuffle([g, ...shuffle(GL.filter(x => x !== g)).slice(0, 3)]).map(e), s = e(g);
      return { kind: 'mc', q: 'Persamaan Boolean output X dari rangkaian ini adalah ….', vis: `<div class="card sm">${circ(g, null, { out: 'X' })}</div>`, opts, a: opts.indexOf(s), hint: 'Hafalkan: AND = A · B, OR = A + B, garis di atas = NOT.' } }
    const pr = () => [pick(G2), pick(['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT'])], tv = ([g1, g2]) => [...Array(8).keys()].map(i => { const x = F[g1](i >> 2, (i >> 1) & 1); return g2 === 'NOT' ? F.NOT(x) : F[g2](x, i & 1) }).join('');
    const ans = pr(), seen = new Set([tv(ans)]), o = [ans];
    while (o.length < 4) { const p = pr(); if (!seen.has(tv(p))) { seen.add(tv(p)); o.push(p) } }
    const opts = shuffle(o.map(p => ex(...p)));
    return { kind: 'mc', q: 'Persamaan Boolean output X dari rangkaian ini adalah ….', vis: `<div class="card sm">${circ(ans[0], ans[1] === 'NOT' ? 'NOT' : ans[1], { out: 'X' })}</div>`, opts, a: opts.indexOf(ex(...ans)), hint: 'Tulis keluaran gerbang pertama dulu, lalu masukkan sebagai input gerbang kedua.' } },
  () => { // kombinasi input yang membuat output X = 1 (3 input)
    let g1, g2, on, off; do { [g1, g2] = [pick(G2), pick(['AND', 'OR', 'XOR', 'NAND', 'NOR'])]; const all = [...Array(8).keys()].map(i => [i >> 2, (i >> 1) & 1, i & 1]); on = all.filter(([a, b, c]) => F[g2](F[g1](a, b), c)); off = all.filter(v => !on.includes(v)) } while (!on.length || off.length < 3);
    const t = ([a, b, c]) => `A = ${a}, B = ${b}, C = ${c}`, good = pick(on), opts = shuffle([good, ...shuffle(off).slice(0, 3)]);
    return { kind: 'mc', q: 'Kombinasi input mana yang membuat output X = 1?', vis: `<div class="card sm">${circ(g1, g2, { names: true, out: 'X' })}</div>`, opts: opts.map(t), a: opts.indexOf(good), hint: `Hitung ${g1}(A,B) dulu, lalu masukkan hasilnya ke ${g2} bersama C. ${HINT[g1]}` } },
  () => { // detektif gerbang: baris tabel dibuka bertahap, pemain menebak gerbangnya
    const g = pick(G2); return { kind: 'det', g, order: shuffle([0, 1, 2, 3]), q: 'Detektif gerbang: tebak gerbangnya dari baris tabel yang terbuka. Buka baris lagi kalau belum yakin.', hint: `Gerbangnya ${g}. ${HINT[g]}` } },
  () => ({ kind: 'match', pairs: shuffle(GL).slice(0, 4), q: 'Cocokkan simbol gerbang dengan namanya. Ketuk satu simbol, lalu satu nama.', hint: 'Gelembung kecil di ujung keluaran = NOT di belakangnya. Lengkung ganda di depan = XOR/XNOR. Badan melengkung lancip = OR/NOR, badan rata di depan = AND/NAND.' }),
  () => { // nyalakan LED: atur saklar sesuai target (kadang dengan syarat tepat satu saklar ON)
    const g = pick(GL), two = g !== 'NOT', all = two ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0], [1]], f = s => g === 'NOT' ? F.NOT(s[0]) : F[g](s[0], s[1]), t = rnd();
    const one = two && Math.random() < .45 && all.some(s => f(s) === t && s[0] + s[1] === 1), good = s => f(s) === t && (!one || s[0] + s[1] === 1), s0 = pick(all.filter(s => !good(s)));
    return { kind: 'led', g, a: s0[0], b: two ? s0[1] : null, t, one, good, f, q: `Atur saklar agar LED ${t ? 'NYALA' : 'MATI'}${one ? ', dengan tepat satu saklar ON' : ''}.`, hint: `${HINT[g]}${one ? ' Cari kombinasi yang hanya menyalakan satu saklar.' : ''}` } },
  () => { // tabel kebenaran rangkaian gerbang + NOT
    const g = pick(G2);
    return { kind: 'tt', g: g + '+NOT', n: 4, ans: [0, 1, 2, 3].map(i => F.NOT(F[g](i >> 1, i & 1))), vis: `<div class="card sm">${circ(g, 'NOT', { names: true, out: 'Y' })}</div>`, q: 'Lengkapi tabel kebenaran rangkaian ini (klik kotak "?" untuk mengubah 0/1).', hint: `Hitung ${g}(A,B) dulu, lalu balik hasilnya dengan NOT. ${HINT[g]}` } },
  () => { const [g, s] = pick(SKEN), opts = shuffle([g, ...shuffle(GL.filter(x => x !== g)).slice(0, 3)]);   // situasi nyata -> gerbang
    return { kind: 'mc', q: `<b>Situasi:</b> ${s}<br>Gerbang logika yang paling cocok adalah ….`, opts, a: opts.indexOf(g), hint: HINT[g] } },
  () => { const g = pick(G2), r = Math.random() * 4 | 0, y = i => i === r ? 1 - F[g](i >> 1, i & 1) : F[g](i >> 1, i & 1);   // cari baris yang salah
    return { kind: 'mc', q: `Tabel kebenaran gerbang ${g} ini punya SATU baris yang salah. Baris yang mana?`, vis: `<div class="card sm"><table class="tt"><tr><th>A</th><th>B</th><th>Y</th></tr>${[0, 1, 2, 3].map(i => `<tr><td>${i >> 1}</td><td>${i & 1}</td><td>${y(i)}</td></tr>`).join('')}</table></div>`, opts: ['A = 0, B = 0', 'A = 0, B = 1', 'A = 1, B = 0', 'A = 1, B = 1'], a: r, hint: `${HINT[g]} Cocokkan tiap baris dengan aturan itu.` } },
  () => { const g = pick(G2), c = [0, 1, 2, 3].filter(i => F[g](i >> 1, i & 1)).length, opts = shuffle([c, ...shuffle([0, 1, 2, 3, 4].filter(x => x !== c)).slice(0, 3)]);   // hitung baris bernilai 1
    return { kind: 'mc', q: `Dari 4 kombinasi input (A, B), berapa kombinasi yang membuat gerbang ${g} berkeluaran 1?`, opts: opts.map(String), a: opts.indexOf(c), hint: `${HINT[g]} Isi tabelnya, lalu hitung angka 1 di kolom Y.` } },
  () => { const a = rnd(), b = rnd(), y = rnd(), no = G2.filter(g => F[g](a, b) !== y), ok = G2.filter(g => F[g](a, b) === y), bad = pick(no), opts = shuffle([bad, ...shuffle(ok).slice(0, 3)]);   // gerbang yang mustahil
    return { kind: 'mc', q: `Input A = ${a}, B = ${b} menghasilkan Y = ${y}. Gerbang mana yang TIDAK mungkin?`, opts, a: opts.indexOf(bad), hint: `Hitung tiap pilihan untuk A = ${a}, B = ${b}. Yang hasilnya bukan ${y} adalah jawabannya.` } },
  () => { let g1, g2, c; do { [g1, g2] = [pick(G2), pick(['AND', 'OR', 'XOR', 'NAND', 'NOR'])]; c = [...Array(8).keys()].filter(i => F[g2](F[g1](i >> 2, (i >> 1) & 1), i & 1)).length } while (c < 1 || c > 7);   // hitung kombinasi rangkaian
    const opts = shuffle([c, ...shuffle([1, 2, 3, 4, 5, 6, 7].filter(x => x !== c)).slice(0, 3)]);
    return { kind: 'mc', q: 'Dari 8 kombinasi input A, B, C, berapa kombinasi yang membuat output X = 1?', vis: `<div class="card sm">${circ(g1, g2, { names: true, out: 'X' })}</div>`, opts: opts.map(String), a: opts.indexOf(c), hint: `Hitung ${g1}(A,B) dulu, lalu ${g2} dengan C, untuk tiap kombinasi. ${HINT[g1]}` } }
];
const LIFE_SAY = {
  start: 'Kamu punya 3 nyawa. Tiap jawaban salah mengurangi satu, dan kalau habis, latihannya selesai.',
  startT: 'Mode waktu. Tiap soal ada batasnya dan kamu tetap punya 3 nyawa. Kehabisan waktu dihitung salah, jadi jangan kelamaan mikir.',
  timeUp: ['Waktunya habis. Itu dihitung salah.', 'Keburu habis. Kalau sudah tahu, jawab dulu, ragunya belakangan.', 'Tuh kan, habis. Jangan diam saja.'],
  startB: 'Mode Berantai. Soal datang terus tanpa jeda, makin lama makin licik, dan waktunya makin pendek. Nyawamu tiga, dan tiap lima jawaban benar berturut-turut memulihkan satu.',
  last: ['Nyawamu tinggal satu. Sekarang bukan waktunya menebak.', 'Satu nyawa lagi. Baca soalnya dua kali, baka.'],
  out: ['Nyawamu habis. Padahal tadi lumayan.', 'Habis deh. Ya sudah, ulang lagi. Aku masih di sini.']
};
function shuffleOpts(c) { const idx = shuffle(c.o.map((_, i) => i)); return { q: c.q, opts: idx.map(i => c.o[i]), a: idx.indexOf(c.a), hint: c.hint, vis: c.vis, e: c.e } }
// indeks QGEN: 0-6 soal lama, 7 detektif gerbang, 8 cocokkan simbol, 9 nyalakan LED, 10 tabel rangkaian gerbang+NOT, 11 situasi nyata, 12 cari baris salah, 13 hitung baris 1, 14 gerbang mustahil, 15 hitung kombinasi rangkaian
const makeSet = n => shuffle([0, 2, 4, 5, 6, 1, 3, 10, 7, 8, 9, 11, 12, 13, 14, 15, 11, 12, 14, 15, 0, 2, 4, 7]).slice(0, n).map(i => QGEN[i]());



/* EVALUASI (Monika): bank soal, tiap sesi mengambil EVAL_N soal acak. Pilihan pertama = jawaban benar (diacak saat tampil). */
const EVAL_N = 10, cv = (g1, g2, o) => `<div class="card sm">${circ(g1, g2, o)}</div>`;
const EVAL = [
  { q: 'Rangkaian logika bekerja dengan sinyal berupa…', o: ['Digital 0 dan 1', 'Analog kontinu', 'Gelombang radio', 'Arus bolak-balik saja'], a: 0, e: 'Rangkaian logika hanya mengenal dua keadaan, 0 dan 1. Itu sebabnya sinyalnya disebut digital, bukan analog yang berubah halus.' },
  { q: 'Pada sistem kontrol, sensor dan tombol termasuk…', o: ['Input', 'Output', 'Gerbang logika', 'Catu daya'], a: 0, e: 'Sensor dan tombol mengirim informasi ke sistem, jadi disebut input. Output adalah yang dikendalikan, seperti lampu atau motor.' },
  { q: 'Logika 1 pada rangkaian digital umumnya menyatakan keadaan…', o: ['HIGH / ON', 'LOW / OFF', '0 Volt', 'Salah'], a: 0, e: 'Logika 1 = HIGH = ON = benar. Logika 0 = LOW = OFF = salah.' },
  { q: 'Output gerbang AND bernilai 1 jika…', o: ['Semua input bernilai 1', 'Minimal satu input bernilai 1', 'Semua input bernilai 0', 'Kedua input berbeda'], a: 0, e: 'AND bernilai 1 hanya jika semua inputnya 1, seperti dua saklar yang dipasang seri.' },
  { q: 'Gerbang yang outputnya 1 jika minimal satu input bernilai 1 adalah…', o: ['OR', 'AND', 'NAND', 'XNOR'], a: 0, e: 'OR bernilai 1 jika minimal satu input 1, seperti saklar yang dipasang paralel.' },
  { q: 'Jika input gerbang NOT bernilai 1, maka outputnya adalah…', o: ['0', '1', 'Tidak tentu', 'Sama dengan A dan B'], a: 0, e: 'NOT membalik nilai: input 1 menjadi 0, dan input 0 menjadi 1.' },
  { q: 'Gerbang yang outputnya 0 hanya jika semua inputnya 1 adalah…', o: ['NAND', 'NOR', 'AND', 'XOR'], a: 0, e: 'NAND adalah kebalikan AND. Output 0 hanya terjadi saat semua input bernilai 1.' },
  { q: 'Pada gerbang NOR, jika A = 0 dan B = 0, outputnya…', o: ['1', '0', 'Tidak tentu', 'Sama dengan A'], a: 0, e: 'NOR adalah kebalikan OR. OR(0,0) = 0, jadi NOR(0,0) = 1.' },
  { q: 'Gerbang XOR bernilai 1 apabila…', o: ['Kedua input berbeda', 'Kedua input sama', 'Semua input 1', 'Semua input 0'], a: 0, e: 'XOR bernilai 1 jika kedua input berbeda, dan 0 jika kedua input sama.' },
  { q: 'Pada tabel kebenaran XNOR 2 input, berapa baris yang menghasilkan output 1?', o: ['2', '1', '3', '4'], a: 0, e: 'XNOR bernilai 1 jika kedua input sama: baris 00 dan 11. Jadi ada 2 baris dengan output 1.' },
  // ---- dari dokumen Soal gerbang logika ddlc.docx ----
  { q: 'Pada rangkaian logika, nilai logika 1 menunjukkan keadaan ….', o: ['hidup atau ada tegangan', 'mati atau tidak ada tegangan', 'arus bolak-balik', 'hambatan yang besar', 'terputus dari catu daya'], a: 0, e: 'Logika 1 berarti hidup atau ada tegangan (HIGH). Logika 0 berarti mati atau tidak ada tegangan.' },
  { q: 'Gerbang OR menghasilkan output berlogika 1 apabila ….', vis: cv('OR', null), o: ['minimal satu input berlogika 1', 'kedua input berlogika 0', 'kedua input berlogika 1 saja', 'kedua input berlogika berbeda saja', 'hanya input B yang berlogika 1'], a: 0, e: 'OR menghasilkan 1 jika minimal satu input bernilai 1. Hanya saat kedua input 0 outputnya 0.' },
  { q: 'Perhatikan gambar simbol gerbang logika berikut. Gerbang tersebut adalah gerbang ….', vis: cv('NOT', null, { out: 'X' }), o: ['NOT', 'AND', 'OR', 'NAND', 'XOR'], a: 0, e: 'Segitiga dengan lingkaran kecil di ujung adalah simbol NOT. Gerbang ini hanya punya satu input.' },
  { q: 'Persamaan Boolean yang tepat untuk gerbang AND dengan input A dan B serta output X adalah ….', vis: cv('AND', null, { out: 'X' }), o: ['X = A · B', 'X = A + B', `X = ${nb('A')}`, `X = ${nb('A · B')}`, `X = ${nb('A + B')}`], a: 0, e: 'AND ditulis dengan tanda kali: X = A · B. Garis di atas ekspresi berarti NOT, seperti pada NAND dan NOR.' },
  { q: 'Pada gerbang NAND dengan dua input A dan B, output bernilai 0 hanya jika ….', vis: cv('NAND', null), o: ['A = 1 dan B = 1', 'A = 0 dan B = 0', 'A = 0 dan B = 1', 'A = 1 dan B = 0', 'salah satu input bernilai 1'], a: 0, e: 'NAND = NOT AND. AND bernilai 1 hanya saat A = 1 dan B = 1, jadi NAND bernilai 0 hanya saat itu.' },
  { q: 'Perhatikan rangkaian berikut. Output X bernilai 1 hanya jika ….', vis: cv('OR', 'NOT', { out: 'X' }), o: ['kedua input A dan B bernilai 0', 'kedua input A dan B bernilai 1', 'input A bernilai 1 dan input B bernilai 0', 'salah satu input bernilai 1', 'input A dan B bernilai berbeda'], a: 0, e: 'OR lalu NOT sama dengan NOR. Output 1 hanya saat OR bernilai 0, yaitu saat A dan B sama-sama 0.' },
  { q: 'Gerbang logika dibuat dalam bentuk … yang terdiri atas transistor-transistor, diode, dan komponen-komponen lainnya.', o: ['IC (Integrated Circuit)', 'ICU', 'gerbang', 'hambatan', 'saklar'], a: 0, e: 'Gerbang logika dibuat dalam bentuk IC (Integrated Circuit) yang berisi transistor, diode, dan komponen lain.' },
  { q: 'Perhatikan rangkaian berikut. Persamaan Boolean output X adalah ….', vis: cv('OR', 'AND', { out: 'X' }), o: ['X = (A + B) · C', 'X = A + B + C', 'X = A · B · C', 'X = (A · B) + C', 'X = A + (B · C)'], a: 0, e: 'A dan B masuk gerbang OR lebih dulu: (A + B). Hasilnya masuk gerbang AND bersama C, sehingga X = (A + B) · C.' },
  { q: 'Berikut adalah gerbang logika dasar yang benar adalah …', o: ['AND, OR, NOT', 'AND, NOT, NAND', 'OR, NOT, NOR', 'XOR, XNOR', 'BUFFER, NAND, OR'], a: 0, e: 'Gerbang dasar ada tiga: AND, OR, dan NOT. NAND, NOR, XOR, dan XNOR adalah turunannya.' }
];
const GRADES = [
  { min: 9, t: 'Sangat Baik', e: 'cheer', s: ['Wah. Aku sampai merinding. Kamu benar-benar menguasainya, dan aku bangga.', 'Hampir sempurna. Kalau klub ini punya wakil ketua, aku sudah menunjuk kamu.', 'Sungguh, aku sedikit iri sama otakmu.', 'Nilai ini kucatat pakai tinta paling tebal. Maksudku di localStorage, tapi ya, tebal.'] },
  { min: 7, t: 'Baik', e: 'happy', s: ['Bagus. Tinggal sedikit menuju sempurna, sisanya soal teliti.', 'Hasilnya solid. Kurasa kamu masih bisa naik lagi.', 'Kerja bagus. Beberapa bagian masih bisa dirapikan, tapi dasarmu sudah kuat.', 'Tinggal selangkah lagi. Senang rasanya kamu yang memainkan game ini.'] },
  { min: 5, t: 'Cukup', e: 'talk', s: ['Lumayan. Dasarnya sudah ada. Main sebentar lagi di Simulasi, nilaimu pasti naik.', 'Belum sempurna, tapi ini awal yang bagus. Coba lagi?', 'Separuh jalan tetap jalan. Ulang pelan-pelan, aku temani.', 'Aku nggak ke mana-mana, kecuali kamu menutup tab ini. Itu pengecualiannya.'] },
  { min: 0, t: 'Perlu Belajar Lagi', e: 'talk', s: ['Hei, jangan sedih dulu. Nilai ini cuma gambaran hari ini. Yuk ulang dari Materi sama Sayori.', 'Nggak apa-apa. Semua orang mulai dari sini. Istirahat dulu, minum teh, nanti kita coba lagi.', 'Aku nggak kecewa. Aku senang kamu mau mencoba sampai selesai.', 'Kalau mau, kita ulang dari awal. Aku nggak akan bosan. Itu enaknya jadi karakter game.'] }
];

/* Credit (tampil di Pengaturan > Credit) : ganti nama/peran kontributor di sini */
const CREDIT = {
  note: 'Aset dari Doki Doki Takeover (Jorge-SunSpirit &amp; kontributor). Doki Doki Literature Club © Team Salvato. Proyek edukasi non-komersial.',
  people: [
    { img: 'sayori', name: 'Sayori', role: 'Pemandu Materi' },
    { img: 'yuri', name: 'Yuri', role: 'Pemandu Simulasi' },
    { img: 'natsuki', name: 'Natsuki', role: 'Pemandu Latihan' },
    { img: 'monika', name: 'Monika', role: 'Pemandu Evaluasi' },
    { img: 'Dan Salvato', name: 'Dan Salvato', role: 'Pembuat Doki Doki Literature Club' },
    { img: 'Jorge Sun Spirit', name: 'Jorge-SunSpirit', role: 'Pembuat Doki Doki Takeover' },
  ]
};
