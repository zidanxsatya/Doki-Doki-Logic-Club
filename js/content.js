/* ===== content.js : semua teks & soal (mudah diedit) ===== */
const gateBoard = (g, desc) => `<div class="gb"><div class="gl"><div class="card">${gateSVG(g, null, null, null, false)}</div><p>${desc}</p></div><div class="gr"><div class="card">${tt(g)}</div><p class="fm">${FORM[g]}</p></div></div>`;

const MATERI = [
  { t: 'Pengertian Rangkaian Logika', e: 'talk', html: '<ul><li>Rangkaian logika = rangkaian <b>digital</b> yang memproses sinyal bernilai <b>0</b> atau <b>1</b>.</li><li>Dibangun dari <b>gerbang logika</b> yang mengambil keputusan.</li><li>Di mekatronika: PLC, interlock mesin, kontrol motor, alarm sensor.</li></ul>',
    say: ['Nah, pertama-tama: rangkaian logika itu rangkaian digital yang bikin keputusan dari sinyal 0 dan 1.', 'Di dalamnya ada gerbang-gerbang kecil yang tugasnya "memutuskan". Sederhana kok, aku janji!'] },
  { t: 'Konsep Input dan Output', e: 'happy', html: '<div class="flow"><div>INPUT<small>sensor, tombol, saklar</small></div><span>➜</span><div>PROSES<small>gerbang logika</small></div><span>➜</span><div>OUTPUT<small>lampu, motor, buzzer</small></div></div><p>Contoh: tombol START ditekan (input) → logika memutuskan → motor menyala (output).</p>',
    say: ['Setiap sistem kontrol punya tiga bagian: input, proses, dan output.', 'Input itu "telinga" sistem, gerbang logika itu "otak", dan output itu "tangan" yang bekerja!'] },
  { t: 'Logika 0 dan 1', e: 'calm', html: '<div class="flow"><div>LOGIKA 0<small>LOW · OFF · 0 V · salah</small></div><div>LOGIKA 1<small>HIGH · ON · +5 V · benar</small></div></div><p>Tombol ditekan = 1, dilepas = 0. Sensor mendeteksi benda = 1, tidak = 0.</p>',
    say: ['Komputer cuma kenal dua keadaan: 0 (mati) dan 1 (hidup). Seperti saklar lampu!', 'Ingat ya: 1 = HIGH = ON = benar, 0 = LOW = OFF = salah.'] },
  { t: 'Gerbang AND', e: 'talk', html: gateBoard('AND', 'Output <b>1</b> hanya jika <b>semua</b> input = 1. Seperti dua saklar yang dipasang <b>seri</b>.'),
    say: ['Gerbang AND itu pemilih yang tegas: output baru 1 kalau A DAN B keduanya 1.', 'Contoh: mesin press baru jalan kalau tombol kiri DAN tombol kanan ditekan. Aman buat tangan!'] },
  { t: 'Gerbang OR', e: 'happy', html: gateBoard('OR', 'Output <b>1</b> jika <b>minimal satu</b> input = 1. Seperti saklar yang dipasang <b>paralel</b>.'),
    say: ['Gerbang OR lebih santai: cukup salah satu input 1, output langsung 1.', 'Contoh: alarm berbunyi kalau sensor asap ATAU sensor panas aktif.'] },
  { t: 'Gerbang NOT', e: 'calm', html: gateBoard('NOT', 'Hanya <b>1 input</b>. Output adalah <b>kebalikan</b> input (inverter).'),
    say: ['NOT itu si pembalik. Masuk 0 keluar 1, masuk 1 keluar 0.', 'Dia satu-satunya gerbang dasar yang inputnya cuma satu, lho!'] },
  { t: 'Gerbang NAND', e: 'talk', html: gateBoard('NAND', 'NAND = <b>NOT AND</b>. Output 0 hanya jika semua input 1.'),
    say: ['NAND adalah AND yang dibalik. Hasil AND dibalik pakai NOT.', 'Fakta seru: gerbang NAND bisa dipakai untuk membuat semua gerbang lain!'] },
  { t: 'Gerbang NOR', e: 'happy', html: gateBoard('NOR', 'NOR = <b>NOT OR</b>. Output 1 hanya jika semua input 0.'),
    say: ['NOR adalah OR yang dibalik. Output 1 cuma kalau semua input 0.', 'Mirip NAND, NOR juga termasuk gerbang universal.'] },
  { t: 'Gerbang XOR', e: 'talk', html: gateBoard('XOR', 'Exclusive OR: output <b>1</b> jika kedua input <b>berbeda</b>.'),
    say: ['XOR itu "detektor beda". Kalau A dan B berbeda, output 1. Kalau sama, output 0.', 'Contoh: lampu tangga yang bisa dinyalakan dari lantai atas maupun bawah!'] },
  { t: 'Gerbang XNOR', e: 'calm', html: gateBoard('XNOR', 'XNOR = <b>NOT XOR</b>: output <b>1</b> jika kedua input <b>sama</b>.'),
    say: ['XNOR kebalikan XOR: output 1 kalau A dan B sama.', 'Sering dipakai sebagai pembanding: apakah dua sinyal sama?'] },
  { t: 'Tabel Kebenaran', e: 'cheer', html: `<table class="tt wide"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th><th>XNOR</th></tr>${[0, 1, 2, 3].map(i => `<tr><td>${i >> 1}</td><td>${i & 1}</td>${['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].map(g => `<td>${F[g](i >> 1, i & 1)}</td>`).join('')}</tr>`).join('')}</table><p>NOT: 0 → 1 dan 1 → 0. Dengan 2 input ada 2² = <b>4</b> kombinasi.</p>`,
    say: ['Tabel kebenaran mencatat output untuk semua kombinasi input. Dengan 2 input ada 4 baris.', 'Yeay, materi selesai! Selanjutnya coba SIMULASI bareng Yuri, lalu LATIHAN dan EVALUASI ya!'] }
];

const SIM_SAY = {
  AND: 'Gerbang AND: keluarannya 1 hanya bila A dan B sama-sama 1. Coba ubah salah satu input menjadi 0, lalu perhatikan LED-nya.',
  OR: 'Gerbang OR: cukup satu input bernilai 1, maka output menjadi 1. LED padam hanya jika keduanya 0.',
  NOT: 'Gerbang NOT hanya punya satu input. Outputnya selalu kebalikan dari input.',
  NAND: 'NAND adalah AND yang dibalik. Bandingkan dengan tabel AND, ya... hasilnya selalu berlawanan.',
  NOR: 'NOR adalah OR yang dibalik. LED hanya menyala ketika A dan B sama-sama 0.',
  XOR: 'XOR menyala jika kedua input berbeda. Jika sama, hasilnya 0.',
  XNOR: 'XNOR kebalikan XOR: LED menyala jika kedua input sama.'
};

/* ---------- LATIHAN (Natsuki): soal dibuat acak ---------- */
const HINT = { AND: 'AND hanya 1 kalau SEMUA input 1.', OR: 'OR bernilai 1 kalau minimal satu input 1.', NOT: 'NOT membalik: 0 jadi 1, 1 jadi 0.', NAND: 'NAND = kebalikan AND. Hitung AND dulu, lalu balik.', NOR: 'NOR = kebalikan OR. Hitung OR dulu, lalu balik.', XOR: 'XOR bernilai 1 kalau kedua input BERBEDA.', XNOR: 'XNOR bernilai 1 kalau kedua input SAMA.' };
const G2 = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];
const CONCEPT = [
  { q: 'Gerbang mana yang outputnya 1 hanya jika SEMUA input 1?', o: ['AND', 'OR', 'XOR', 'NOR'], a: 0, hint: 'Pikirkan dua saklar seri.' },
  { q: 'Gerbang yang hanya punya satu input adalah…', o: ['NOT', 'AND', 'XOR', 'NAND'], a: 0, hint: 'Dia si pembalik sinyal.' },
  { q: 'Logika 1 sama dengan keadaan…', o: ['HIGH / ON', 'LOW / OFF', 'Tidak terdefinisi', 'Selalu salah'], a: 0, hint: '1 = HIGH = ON = benar.' },
  { q: 'Berapa banyak baris tabel kebenaran untuk 2 input?', o: ['4', '2', '3', '8'], a: 0, hint: '2 pangkat jumlah input.' },
  { q: 'NAND sama dengan…', o: ['NOT AND', 'AND NOT', 'OR NOT', 'NOT OR'], a: 0, hint: 'Nama "N" di depan berarti dibalik.' },
  { q: 'Sensor dan tombol pada sistem kontrol berperan sebagai…', o: ['Input', 'Output', 'Gerbang', 'Catu daya'], a: 0, hint: 'Mereka mengirim informasi ke sistem.' }
];
const TXT = { q: 'Pilih jawaban yang benar', kind: 'mc' };
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
    return { kind: 'mc', q: 'Baca rangkaian berikut. Berapa output Y?', vis: `<div class="flow sm2"><div>A=${a}<br>B=${b}</div><span>➜</span><div>${g1}</div><span>X ➜</span><div>${g2}</div><span>⬅</span><div>C=${c}</div><span>➜</span><div><b>Y=?</b></div></div>`, opts: ['0', '1'], a: y, hint: `Hitung dulu X = ${g1}(A,B), lalu Y = ${g2}(X,C). ${HINT[g1]}` } }
];
function shuffleOpts(c) { const idx = shuffle(c.o.map((_, i) => i)); return { q: c.q, opts: idx.map(i => c.o[i]), a: idx.indexOf(c.a), hint: c.hint } }
const makeSet = n => shuffle([0, 1, 2, 3, 4, 0, 2, 4, 1, 3]).slice(0, n).map(i => QGEN[i]());

const PRAISE = ['B-bukan berarti aku senang kamu benar ya! ...Tapi lumayan.', 'Hmph, kebetulan aja itu! ...Oke, oke, bagus.', 'Y-yah, itu benar. Jangan sombong dulu!', 'Tch... kamu ternyata nggak sebodoh yang kukira. Sedikit!'];
const OOPS = ['Salah! Dasar ceroboh!', 'Bukan itu, baka! Pikir lagi!', 'Haah? Serius jawabnya begitu?', 'Aduh, salah tuh! Jangan menyerah, ya!'];

/* ---------- EVALUASI (Monika): 10 soal ---------- */
const EVAL = [
  { q: 'Rangkaian logika bekerja dengan sinyal berupa…', o: ['Digital 0 dan 1', 'Analog kontinu', 'Gelombang radio', 'Arus bolak-balik saja'], a: 0 },
  { q: 'Pada sistem kontrol, sensor dan tombol termasuk…', o: ['Input', 'Output', 'Gerbang logika', 'Catu daya'], a: 0 },
  { q: 'Logika 1 pada rangkaian digital umumnya menyatakan keadaan…', o: ['HIGH / ON', 'LOW / OFF', '0 Volt', 'Salah'], a: 0 },
  { q: 'Output gerbang AND bernilai 1 jika…', o: ['Semua input bernilai 1', 'Minimal satu input bernilai 1', 'Semua input bernilai 0', 'Kedua input berbeda'], a: 0 },
  { q: 'Gerbang yang outputnya 1 jika minimal satu input bernilai 1 adalah…', o: ['OR', 'AND', 'NAND', 'XNOR'], a: 0 },
  { q: 'Jika input gerbang NOT bernilai 1, maka outputnya adalah…', o: ['0', '1', 'Tidak tentu', 'Sama dengan A dan B'], a: 0 },
  { q: 'Gerbang yang outputnya 0 hanya jika semua inputnya 1 adalah…', o: ['NAND', 'NOR', 'AND', 'XOR'], a: 0 },
  { q: 'Pada gerbang NOR, jika A = 0 dan B = 0, outputnya…', o: ['1', '0', 'Tidak tentu', 'Sama dengan A'], a: 0 },
  { q: 'Gerbang XOR bernilai 1 apabila…', o: ['Kedua input berbeda', 'Kedua input sama', 'Semua input 1', 'Semua input 0'], a: 0 },
  { q: 'Pada tabel kebenaran XNOR 2 input, berapa baris yang menghasilkan output 1?', o: ['2', '1', '3', '4'], a: 0 }
];
const GRADES = [
  { min: 9, t: 'Sangat Baik', e: 'cheer', s: ['Wow. Serius, aku sempat merinding. Kamu menguasai ini dengan sangat baik, dan aku bangga banget sama kamu.', 'Hampir sempurna! Kalau ada klub rangkaian logika, aku langsung rekrut kamu jadi wakil ketua. Ehehe~', 'Luar biasa! Aku nggak akan bohong, aku sedikit iri sama otakmu.', 'Nilai ini akan kucatat dengan tinta paling tebal. Secara harfiah: di localStorage. Ehehe.'] },
  { min: 7, t: 'Baik', e: 'happy', s: ['Bagus banget! Tinggal sedikit lagi menuju sempurna. Sisanya cuma soal kebiasaan dan ketelitian.', 'Hasil yang solid. Aku tahu kamu masih bisa lebih tinggi, dan aku suka melihat potensimu.', 'Kerja bagus! Ada beberapa bagian yang bisa dipoles, tapi dasarmu kuat.', 'Tinggal sedikit lagi. Dunia kecil ini pasti senang punya pemain sepertimu.'] },
  { min: 5, t: 'Cukup', e: 'talk', s: ['Lumayan kok! Fondasinya sudah ada. Latihan sedikit lagi di Simulasi, dan kamu bakal naik kelas.', 'Nggak buruk, belum sempurna juga. Tapi percayalah, ini titik awal yang bagus. Coba lagi, ya?', 'Setengah jalan itu tetap jalan. Ayo ulangi pelan-pelan, aku temani.', 'Tenang, aku nggak ke mana-mana. Kecuali kamu menutup tab ini, tentu. Ehehe.'] },
  { min: 0, t: 'Perlu Belajar Lagi', e: 'talk', s: ['Hei, jangan sedih. Nilai ini bukan soal seberapa pintar kamu, cuma soal hari ini. Yuk ulang dari Materi bareng Sayori.', 'Nggak apa-apa, serius. Semua orang mulai dari sini. Istirahat sebentar, minum teh, lalu kita coba lagi.', 'Aku nggak kecewa sama sekali. Aku justru melihat kamu mau mencoba, dan itu yang terpenting.', 'Kalau mau, kita ulang dari awal. Aku nggak akan bosan. Salah satu kelebihan jadi karakter game.'] }
];

/* ---------- Credit (tampil di Pengaturan > Credit) — ganti nama/peran kontributor di sini ---------- */
const CREDIT = {
  note: 'Aset dari Doki Doki Takeover (Jorge-SunSpirit &amp; kontributor). Doki Doki Literature Club © Team Salvato. Proyek edukasi non-komersial.',
  people: [
    { img: 'sayori', name: 'Sayori', role: 'Pemandu Materi' },
    { img: 'yuri', name: 'Yuri', role: 'Pemandu Simulasi' },
    { img: 'natsuki', name: 'Natsuki', role: 'Pemandu Latihan' },
    { img: 'monika', name: 'Monika', role: 'Pemandu Evaluasi' },
    { img: 'kontributor2', name: 'Dan Salvato', role: 'Pembuat Doki Doki Literature Club' },
    { img: 'kontributor1', name: 'Jorge-SunSpirit', role: 'Pembuat Doki Doki Takeover' },
  ]
};
