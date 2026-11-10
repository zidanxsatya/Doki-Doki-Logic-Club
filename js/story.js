/* story.js : MODE CERITA: Materi → Simulasi → Latihan → Evaluasi → akhir cerita, dengan keempat karakter 
   Dua sistem tampilan (sengaja dipisah):
   - Diskusi edukasi : potret statis di kiri (assets/img/portraits, satu gambar per ekspresi) + area materi besar di kanan.
   - Adegan cerita   : sprite TANPA mikrofon (assets/img/sprites, dari menucharacters Takeover), DIAM; yang berganti hanya pembicara.
   Mode Mandiri (menu: Materi/Simulasi/Latihan/Evaluasi) tidak berubah: Story.on === false.
   Format baris dialog Mode Cerita: [teks, ekspresi, siapa]. Tanpa "siapa" = karakter utama bagian itu. */

const Story = { on: false, key: 'tkm_story' };
const SK = { s: 'sayori', y: 'yuri', n: 'natsuki', m: 'monika' };
const STEPS = ['n_intro', 'materi', 'n_1', 'simulasi', 'n_2', 'latihan', 'n_3', 'k_alarm', 'k_tangga', 'k_brankas', 'n_4', 'evaluasi', 'n_end'];
const CHAPI = ['materi', 'simulasi', 'latihan', 'evaluasi'].map(id => STEPS.indexOf(id));   // indeks 4 bab belajar (kartu judul bab, langkah di menu)
const STEP_NAME = { n_intro: 'Pembukaan', materi: 'Materi', n_1: 'Menuju Simulasi', simulasi: 'Simulasi', n_2: 'Menuju Latihan', latihan: 'Latihan', n_3: 'Menuju Kasus Nyata', k_alarm: 'Kasus 1: Alarm', k_tangga: 'Kasus 2: Lampu Tangga', k_brankas: 'Kasus 3: Brankas', n_4: 'Menuju Evaluasi', evaluasi: 'Evaluasi', n_end: 'Penutup' };
const NEXT_LABEL = { materi: 'LANJUT KE SIMULASI ▶', simulasi: 'LANJUT KE LATIHAN ▶', latihan: 'LANJUT KE EVALUASI ▶', evaluasi: 'LANJUT KE AKHIR CERITA ▶' };
const L = (w, t, e) => [t, e, SK[w] ?? w];   // L('y', 'teks', 'explain')

/* potret statis: ekspresi kode (sama dengan CHARS.expr) -> nama file di assets/img/portraits */
const PORT = {
  sayori: { neutral: 'neutral', calm: 'neutral', happy: 'happ', talk: 'wah', cheer: 'yeah', sad: 'concern', shock: 'ooh', down: 'concern' },
  yuri: { neutral: 'neutral', breath: 'neutral', shy: 'blush', talk: 'smile', happy: 'happy', explain: 'ahaha', shock: 'ahh', down: 'ehh' },
  natsuki: { neutral: 'neutral', smug: 'happy', talk: 'wah', happy: 'wah', angry: 'angy', hmph: 'hmmph', shock: 'what', down: 'sick' },
  monika: { neutral: 'neutral', talk: 'neutral', happy: 'ahaha', cheer: 'ahh', wink: 'ahh', shock: 'eeh', down: 'upset' }
};
/* label ekspresi -> kumpulan potret/sprite yang berputar (Story saja), supaya label yang sama tidak selalu menampilkan wajah yang sama.
   Isi kumpulan disesuaikan watak: Sayori ceria & jahil, Yuri pemalu & pemikir, Natsuki ekspresif & tsundere, Monika percaya diri & hangat. null (sprite) = sprite asli. */
const POOL = {
  sayori: { talk: ['wah', 'neutral', 'happ'], happy: ['happ', 'yeah', 'wah'], cheer: ['yeah', 'wah', 'ooh'], calm: ['neutral', 'happ'], playful: ['wah', 'yeah'], wink: ['yeah'], pout: ['grumpy'], sad: ['concern', 'ehh'], down: ['concern', 'ehh'], worry: ['ehh', 'concern'], shy: ['ehh', 'neutral'] },
  yuri: { talk: ['smile', 'neutral'], explain: ['ahaha', 'smile', 'neutral'], happy: ['happy', 'smile'], shy: ['blush', 'ehh'], calm: ['neutral', 'smile'], down: ['ehh', 'blush'] },
  natsuki: { talk: ['wah', 'neutral', 'happy'], smug: ['happy', 'neutral'], happy: ['wah', 'happy'], angry: ['angy', 'sick'], hmph: ['hmmph', 'neutral'], grump: ['hmmph', 'angy'], shy: ['hmmph', 'neutral'], down: ['sick'] },
  monika: { talk: ['neutral', 'ahaha'], happy: ['ahaha', 'ahh'], cheer: ['ahh', 'ahaha'], calm: ['neutral', 'ahaha'], wink: ['ahh'], down: ['upset', 'eeh'], shy: ['eeh', 'ahaha'] }
};
const CYC = {}, nextOf = (pool, key) => pool[CYC[key] = ((CYC[key] ?? -1) + 1) % pool.length];
const portSrc = (k, e) => { const pl = POOL[k][e] || PORT[k][e] && [PORT[k][e]]; return `assets/img/portraits/${k}_${pl ? nextOf(pl, k + e) : 'neutral'}.webp` };
const PCACHE = {};   // satu objek Image per potret, dibuat sekali & didecode di awal (dulu: new Image() tiap ganti ekspresi + fade 160ms)
const getPort = src => PCACHE[src] ??= (() => { const i = new Image(); i.src = src; i.decode && i.decode().catch(() => { }); return i })();
const preloadPortraits = () => { Object.keys(PORT).forEach(k => new Set([...Object.values(PORT[k]), ...Object.values(POOL[k]).flat()]).forEach(n => getPort(`assets/img/portraits/${k}_${n}.webp`))); Object.keys(CHARS).forEach(k => getPort(`assets/img/sprites/${k}.webp`)) };

/* kemajuan cerita (localStorage: tkm_story) */
/* v33 menyisipkan 4 langkah (3 kasus + jembatan) sebelum Evaluasi: simpanan lama (tanpa v) digeser sekali */
Story.prog = () => { const p = store.get(Story.key, null); if (!p) return { step: 0, done: false, lat: null, ev: null, v: 2 }; if (p.v !== 2) { if (p.step >= 7) p.step += 4; p.v = 2; Story.save(p) } return p };
Story.save = p => store.set(Story.key, p);
Story.start = fresh => { const p = Story.prog(); if (fresh) { p.step = 0; Story.save(p) } Story.on = true; preloadPortraits(); preloadExpr(); go(STEPS[p.step]) };
Story.advance = () => { const p = Story.prog(); p.step = Math.min(p.step + 1, STEPS.length - 1); Story.save(p); Story.on = true; go(STEPS[p.step]) };
/* kartu judul bab: muncul sebentar saat masuk bagian belajar lewat Mode Cerita; tidak menghalangi sentuhan */
Story.chap = id => {
  const n = CHAPI.indexOf(STEPS.indexOf(id)) + 1; if (!Story.on || !n) return;
  $('.chap')?.remove(); const c = document.createElement('div'); c.className = 'chap'; c.setAttribute('role', 'status'); c.setAttribute('aria-label', `Bab ${n}: ${STEP_NAME[id]}`);
  c.innerHTML = `<b class="cn">${n}</b><span class="ct">${STEP_NAME[id]}</span><span class="cd" aria-hidden="true">${[1, 2, 3, 4].map(k => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  $('#stage').append(c); setTimeout(() => c.remove(), 2000);
};
Story.menuSub = () => { const p = Story.prog(); return p.step > 0 ? `Lanjutkan: ${STEP_NAME[STEPS[p.step]]}` : p.done ? `Selesai · nilai ${p.ev * 10} · main lagi` : 'Belajar bareng semua karakter' };

/* potret kiri (layout diskusi edukasi) */
function makeCast(ptEl) {
  const img = $('img', ptEl), nm = $('.pn', ptEl), cast = {}; let cur = '';
  Object.keys(CHARS).forEach(k => cast[k] = {
    key: k, cfg: CHARS[k],
    setExpression(e) {
      const src = portSrc(k, e), who = ptEl.dataset.k !== k; if (src === cur) return; cur = src;
      if (who) { ptEl.dataset.k = k; nm.textContent = CHARS[k].name; ptEl.style.setProperty('--pc', CHARS[k].color); ptEl.style.setProperty('--pd', CHARS[k].dk); ptEl.style.setProperty('--pp', `url(../assets/img/theme/${k}.webp)`) }
      const show = () => { if (cur !== src) return; img.src = src; if (who) { img.classList.remove('in'); void img.offsetWidth; img.classList.add('in') } };   // gambar sudah di cache -> tampil di frame yang sama; dialog tidak menunggu
      const g = getPort(src); g.complete && g.naturalWidth ? show() : (g.decode ? g.decode().then(show, show) : (g.onload = show))
    }
  });
  return cast;
}

/* kerangka diskusi edukasi mode cerita (pengganti scaffold biasa, API sama) */
Story.scaffold = id => {
  const m = M[id], el = $('#scene'), n = STEPS.indexOf(id), tot = 4, no = CHAPI.indexOf(n) + 1;
  el.classList.add('story'); el.dataset.sec = id;
  el.innerHTML = `<div class="bg" data-b="${m.bg}" style="background-image:url(assets/img/${m.bg}.webp)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>${m.label}</b><i class="hintc">Cerita ${no}/${tot}</i></div><div id="panel" class="panel"></div><div class="pt"><span class="pn"></span><img alt=""></div><div class="dlg"></div>`;
  const cast = makeCast($('.pt', el)), d = new Dialogue($('.dlg', el), cast[m.key], cast), bags = {}, chatOf = k => (bags[k] ??= bag(D[k].chat))();
  const chat = bag(D[m.key].chat);
  let last = performance.now(); const act = () => { last = performance.now() }, talk = () => { const k = d.ch.key, [t, e] = chatOf(k); d.say([[t, e, k]]) };
  addEventListener('pointerdown', act, true); addEventListener('keydown', act, true);
  const idle = setInterval(() => { if (performance.now() - last > 25000 && !d.typing && !d.q.length) { last = performance.now(); talk() } }, 2000);
  $('.pt', el).onclick = () => { if (d.typing || d.q.length) { d.advance(); return } Snd.sfx('select'); talk() };
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  el.classList.add('on');
  scene = { cleanup() { clearInterval(idle); removeEventListener('pointerdown', act, true); removeEventListener('keydown', act, true); d.destroy(); el.classList.remove('story'); el.innerHTML = ''; document.onkeydown = null } };
  return { ch: cast[m.key], d, panel: $('#panel'), chat };
};

/* adegan cerita: sprite diam + dialog multi-karakter */
const NPOS = { 1: [50], 2: [40, 60], 3: [31, 50, 69], 4: [24, 42, 59, 77] };   // pusat tiap karakter (% lebar layar) menurut jumlah karakter
const NH = { sayori: 687, yuri: 782, natsuki: 628, monika: 793 };               // tinggi sprite (px asli, sudah dipangkas) -> tinggi relatif tetap
/* ekspresi adegan cerita = sprite badan penuh per ekspresi (assets/img/expr/{k}_{nama}.webp, dari lembar ekspresi; sel berwatermark dibuang).
   Label dialog tak terdaftar / tanpa sprite = sprite asli assets/img/sprites/{k}.webp. Tanpa idle: badan tidak bergerak, hanya gambar yang diganti. */
const EX = {
  sayori: { happy: ['happy', 'playful'], cheer: ['playful', 'happy'], talk: ['calm', null, 'happy'], playful: ['playful'], calm: ['calm'], sad: ['sad', 'cry'], down: ['sad'], worry: ['cry', 'sad'], shock: ['shock'], pout: ['kiss'], shy: ['shy'], wink: ['wink'] },
  yuri: { shy: ['shy'], happy: ['happy'], shock: ['shock'], calm: ['calm'], down: ['calm'], talk: [null, 'calm'], explain: [null, 'calm'] },
  natsuki: { happy: ['happy'], smug: ['happy', null], shock: ['shock'], shy: ['shy', 'blush'], hmph: ['hmph', 'grump'], angry: ['grump', 'hmph'], grump: ['grump'], down: ['grump', 'blush'], talk: [null, 'happy'] },
  monika: { happy: ['happy', 'smile'], cheer: ['happy'], talk: ['smile', null], calm: ['smile'], down: ['down'], wink: ['wink'], shock: ['shock'] }
};
const exSrc = (k, e) => { const pl = EX[k][e], n = pl && nextOf(pl, 's' + k + e); return n ? `assets/img/expr/${k}_${n}.webp` : `assets/img/sprites/${k}.webp` };
const preloadExpr = () => Object.keys(EX).forEach(k => new Set(Object.values(EX[k]).flat().filter(Boolean)).forEach(n => getPort(`assets/img/expr/${k}_${n}.webp`)));
function narrScene(id) {
  const A = ST[id], el = $('#scene'), lines = typeof A.lines === 'function' ? A.lines() : A.lines;
  const all = [...lines, ...(A.win || []), ...(A.hints || []), ...(A.ask ? A.ask.opts.flatMap(o => o.lines) : [])], keys = ['sayori', 'yuri', 'natsuki', 'monika'].filter(k => all.some(l => l[2] === k)), pos = NPOS[keys.length];
  el.classList.add('narr'); el.classList.toggle('kz', !!A.kz);
  el.innerHTML = `<div class="bg" data-b="${A.bg}" style="background-image:url(assets/img/${A.bg}.webp)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>CERITA</b><i class="hintc">${A.title}</i></div>
  <div class="nar">${keys.map((k, i) => `<div class="ns" data-k="${k}" style="--x:${pos[i]}%;--h:${NH[k]}"><img alt="" src="assets/img/sprites/${k}.webp"></div>`).join('')}</div><div id="panel" class="panel npanel"></div><div class="dlg"></div><button class="btn big ngo" hidden>${A.go || 'LANJUT ▶'}</button>`;
  const cast = {}; keys.forEach(k => cast[k] = { key: k, cfg: CHARS[k], setExpression(e) { const im = $(`.ns[data-k=${k}] img`, el), src = exSrc(k, e); if (im && !im.src.endsWith(src)) im.src = src } });
  const d = new Dialogue($('.dlg', el), cast[lines[0][2]], cast); d.base = lines[0][2];
  const vis = new Set(A.reveal ? [lines[0][2]] : keys), place = () => { const ks = keys.filter(k => vis.has(k)); ks.forEach((k, i) => $(`.ns[data-k=${k}]`, el).style.setProperty('--x', NPOS[ks.length][i] + '%')); $$('.ns', el).forEach(n => n.classList.toggle('off', !vis.has(n.dataset.k))) };
  if (A.reveal) place();   // adegan pembuka: hanya pembicara pertama yang tampil, lainnya masuk saat pertama bicara
  d.onSpeaker = k => { if (!vis.has(k)) { vis.add(k); place() } $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === k)) };
  const goBtn = $('.ngo', el); let finished = false;
  const done = () => { if (finished) return; finished = true; goBtn.hidden = false; if (A.card) { A.card($('#panel', el), d); const ft = $('.kzm', el) || $('.rfoot', el); if (ft) ft.append(goBtn) } if (Story.replay) goBtn.textContent = 'KEMBALI KE PETA ▶'; goBtn.onclick = () => { Snd.sfx('select'); A.next ? A.next() : Story.replay ? Story.leave() : Story.advance() } };
  /* pilihan (A.ask): dialog sampai pertanyaan -> kartu pilihan -> reaksi sesuai pilihan -> sisa dialog (setelah A.skip baris). Tanpa A.ask: perilaku lama. */
  const ask = A.ask, first = ask ? lines.slice(0, ask.at + 1) : lines, rest = ask ? lines.slice(ask.at + 1 + (ask.skip || 0)) : [];
  let phase = ask ? 0 : 2;   // 0 = sebelum pilihan, 1 = menunggu pilihan, 2 = setelah
  const askUI = () => {
    const P = $('#panel', el); P.innerHTML = `<div class="startcard sc choice" role="group" aria-label="${ask.q}"><div class="qq">${ask.q}</div><div class="qo">${ask.opts.map((o, i) => `<button class="opt" data-i="${i}">${o.t}</button>`).join('')}</div></div>`;
    P.onclick = e => { const b = e.target.closest('.opt'); if (!b) return; const o = ask.opts[+b.dataset.i]; P.onclick = null; Snd.sfx('select'); P.innerHTML = ''; phase = 2; d.say([...o.lines, ...rest], after) };
    $('.opt', P).focus({ preventScroll: true });
  };
  const after = () => { if (phase === 0) { phase = 1; askUI() } else if (phase === 2) done() };
  const watch = setInterval(() => { if (!d.typing && !d.q.length && d.shown && phase !== 1) { after(); if (phase === 2) clearInterval(watch) } }, 200);
  d.say(first, after);
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === lines[0][2]));
  el.classList.add('on');
  scene = { cleanup() { clearInterval(watch); d.destroy(); el.classList.remove('narr', 'kz'); el.innerHTML = ''; document.onkeydown = null } };
}

/* NASKAH CERITA */
const ST = {
  n_intro: {
    bg: 'DDLCbg', title: 'Klik kotak dialog untuk lanjut', go: 'MULAI BELAJAR: MATERI ▶', reveal: true,   // karakter masuk satu per satu saat pertama kali bicara
    ask: { at: 16, q: 'Kenapa kamu mau belajar rangkaian logika?', opts: [
      { t: 'Supaya lulus ujian', lines: [L('n', 'Oke, jelas. Aku suka yang tahu maunya.', 'smug'), L('s', 'Kami bantu sampai lulus, janji!', 'cheer')] },
      { t: 'Penasaran saja', lines: [L('m', 'Penasaran aja udah cukup buat mulai, kok.', 'happy'), L('y', 'Orang yang penasaran biasanya cepat nangkep. ...Aku senang dengarnya.', 'shy')] },
      { t: 'Disuruh guru', lines: [L('s', 'Hehe, sama! Awalnya aku juga terpaksa.', 'playful'), L('n', 'Terpaksa juga nggak apa-apa. Yang penting dikerjakan sampai kelar.', 'hmph')] }
    ] },
    lines: [
      L('s', 'Ah, kamu datang! Hai hai! Aku Sayori. Kamu yang mau belajar buat ujian Teknik Kontrol Mekatronika, kan?', 'happy'),
      L('s', 'Rangkaian logika itu bikin kepalaku muter-muter... Makanya aku ngajak teman-teman klubku belajar bareng. Ayo, ikut aku!', 'worry'),
      L('s', 'Nah, ini klubku! Biasanya kami baca puisi dan makan camilan di sini. Hari ini ruangannya kita pakai buat belajar. Duduk di mana aja, ya!', 'cheer'),
      L('s', 'Hmm, yang lain mana ya? ...Ah, itu dia! Natsuki!', 'calm'),
      L('n', 'Sayori! Kamu belum selesai nyiapin meja, tahu! ...Eh? Siapa dia? Oh, yang mau ikut belajar itu?', 'angry'),
      L('s', 'Meja bisa nanti! Tamunya dulu, hehe.', 'playful'),
      L('n', 'Aku Natsuki. Kalau mau belajar, jangan setengah-setengah, ya. Aku bikin kartu soal sendiri, lho. B-bukan khusus buat Sayori!', 'hmph'),
      L('s', 'Natsuki, jangan galak dulu~ Dia kan baru datang!', 'pout'),
      L('n', 'Aku nggak galak. Aku cuma jujur. ...Beda, kok.', 'grump'),
      L('y', 'M-maaf, aku terlambat... Aku Yuri. Semalam aku merangkum catatan gerbang logika. Kalau mau, boleh dipinjam.', 'shy'),
      L('s', 'Wah, Yuri baik banget! Aku pinjam duluan, ya!', 'wink'),
      L('n', 'Pinjam duluan, bacanya kapan-kapan. Kebiasaanmu banget.', 'smug'),
      L('m', 'Sepertinya semua sudah berkumpul. Selamat datang! Aku Monika, ketua klub ini.', 'calm'),
      L('m', 'Hari ini klub sastra kita nyamar jadi Doki Doki Logic Club. Aturannya satu: jangan ada yang ketinggalan. Yang ragu, tanya. Yang paham, jelasin.', 'happy'),
      L('s', 'Aku yang ragu bertanya!', 'cheer'),
      L('n', 'Dan aku yang paham menjelaskan. Pembagian tugas yang jelas.', 'smug'),
      L('m', 'Kalau begitu, kamu sendiri: kenapa mau belajar rangkaian logika hari ini?', 'talk'),
      L('y', 'Aku sudah mengatur urutannya. Materi dulu, lalu simulasi, latihan soal, dan terakhir evaluasi.', 'explain'),
      L('n', 'Bagian latihan soal aku yang pegang! Jangan harap aku lembek, ya.', 'smug'),
      L('m', 'Urutannya rapi banget, ya? Seolah-olah ada yang sudah menyusun jalan ceritanya untuk kita. Ahaha, abaikan saja ucapanku barusan.', 'wink'),
      L('s', 'Pokoknya kamu nggak sendirian! Ayo mulai dari Materi!', 'cheer')
    ]
  },
  n_1: {
    bg: 'DDLCbg', title: 'Materi selesai', go: 'KE SIMULASI ▶',
    ask: { at: 2, skip: 4, q: 'Gerbang apa yang outputnya 1 hanya kalau semua inputnya 1?', opts: [
      { t: 'AND', lines: [L('n', 'Betul, AND! Kamu lebih cepat dari Sayori.', 'happy'), L('s', 'Eh, aku tadi mau jawab itu juga, lho!', 'worry'), L('y', 'Gampangnya begini: AND itu "dan", semuanya harus terpenuhi. OR itu "atau", satu saja cukup.', 'explain')] },
      { t: 'OR', lines: [L('n', 'OR itu cukup satu input saja yang bernilai 1. Yang dicari AND!', 'angry'), L('s', 'Yah, sama kayak aku... Kita senasib!', 'worry'), L('y', 'Wajar tertukar. AND itu "dan", semuanya harus terpenuhi. OR itu "atau", satu saja cukup.', 'explain')] },
      { t: 'XOR', lines: [L('y', 'XOR keluarannya 1 kalau kedua input berbeda. Kalau keduanya 1, hasilnya justru 0. Yang dicari AND.', 'explain'), L('n', 'Berani juga jawabanmu. Tapi salah arah.', 'smug'), L('s', 'Oh iya! "Dan" ketat, "atau" santai. Aku catat!', 'cheer')] }
    ] },
    lines: [
      L('y', 'Semua materi sudah kamu lewati. Bagian dasar sering diremehkan, padahal dari situ semuanya mulai.', 'calm'),
      L('s', 'Aku juga ngerasa makin paham! ...mungkin. Sedikit.', 'happy'),
      L('n', 'Sedikit? Buktikan. Gerbang apa yang outputnya 1 cuma kalau semua inputnya 1?', 'smug'),
      L('s', 'Ehh, sebentar... OR!', 'worry'),
      L('n', 'AND, Sayori! Yang OR itu yang cukup satu input saja.', 'angry'),
      L('y', 'Wajar tertukar. Gampangnya begini: AND itu "dan", semuanya harus terpenuhi. OR itu "atau", satu saja cukup.', 'explain'),
      L('s', 'Oh iya! "Dan" ketat, "atau" santai. Besok aku nggak tertukar lagi. Janji!', 'cheer'),
      L('m', 'Makanya kita ke Simulasi. Salah tebak di sana nggak ada yang menegur, lampunya langsung kasih jawaban.', 'calm'),
      L('y', 'Bagian ini favoritku. Kamu ubah inputnya, lalu lihat sendiri gerbangnya bereaksi seperti apa.', 'happy'),
      L('m', 'Sekarang kamu yang menekan tombolnya. Ayo ke Simulasi!', 'calm')
    ]
  },
  n_2: {
    bg: 'Music_Room', title: 'Simulasi selesai', go: 'KE LATIHAN ▶',
    ask: { at: 6, q: 'Kalau A = 1 dan B = 1, berapa output NAND?', opts: [
      { t: '0', lines: [L('n', 'Betul, 0! AND-nya menghasilkan 1, lalu dibalik jadi 0.', 'smug'), L('s', 'Wah, aku hampir menjawab 1...', 'worry')] },
      { t: '1', lines: [L('n', 'Salah! AND-nya 1, tapi NAND membaliknya jadi 0.', 'hmph'), L('y', 'Jebakan klasik, lupa membalik di akhir. Itu yang Natsuki bilang licik.', 'calm')] }
    ] },
    lines: [
      L('n', 'Oke, sudah puas mainin gerbang? Sekarang giliranku menguji kemampuanmu!', 'smug'),
      L('s', 'Aduh, deg-degan...', 'worry'),
      L('y', 'Tenang. Tadi kamu sudah melihat pola tiap gerbang sendiri. Kalau ragu, bayangkan tabel kebenarannya.', 'calm'),
      L('n', 'Aku sudah menyiapkan delapan soal. Beberapa lumayan licik, jadi bersiaplah.', 'smug'),
      L('s', 'Licik?! Natsuki jangan menakut-nakuti dong!', 'shock'),
      L('n', 'Licik itu maksudnya jebakan buat yang kurang teliti. Contohnya, ada yang ngira NAND sama dengan AND. Padahal NAND itu AND yang dibalik.', 'hmph'),
      L('n', 'Coba jawab dulu: kalau A = 1 dan B = 1, berapa output NAND?', 'smug'),
      L('y', 'Jebakannya adil, kok. Semuanya bisa dijawab lewat tabel kebenaran.', 'calm'),
      L('m', 'Di latihan boleh salah, kok. Jawabannya juga masih bisa diganti sebelum dicek.', 'happy'),
      L('s', 'Natsuki, tadi katanya nggak galak.', 'playful'),
      L('n', 'D-diam, Sayori! Ayo mulai!', 'shy')
    ]
  },
  n_3: {
    bg: 'Music_Room', title: 'Latihan selesai', go: 'KE KASUS NYATA ▶',
    ask: { at: 4, q: 'Menurutmu, gerbang logika paling sering muncul di mana?', opts: [
      { t: 'Alarm dan sensor', lines: [L('m', 'Tepat. Itu kasus pertama kita.', 'happy'), L('n', 'Jangan senang dulu. Menyusunnya tidak segampang menyebutnya.', 'smug')] },
      { t: 'Lampu dan saklar', lines: [L('s', 'Lampu tangga di rumahku begitu! Nanti kita bahas.', 'cheer'), L('y', 'Itu kasus kedua. Kamu menebak urutannya dengan baik.', 'happy')] },
      { t: 'Belum kepikiran', lines: [L('y', 'Wajar. Justru itu yang mau kita lihat sekarang.', 'calm'), L('s', 'Tenang, nanti kebayang sendiri!', 'happy')] }
    ] },
    lines: [
      L('m', 'Latihan selesai. Sebelum Evaluasi, ada satu hal yang mau kami tunjukkan.', 'calm'),
      L('s', 'Kasus nyata! Gerbang yang kamu pelajari ternyata dipakai di sekitar kita.', 'cheer'),
      L('n', 'Bukan teori doang. Kamu yang menyusun rangkaiannya, kami yang mengujinya.', 'smug'),
      L('y', 'Ada tiga kasus: alarm, lampu tangga, dan brankas. Masing-masing memakai gerbang yang sudah kamu kenal.', 'explain'),
      L('m', 'Sebelum mulai: menurutmu gerbang logika paling sering muncul di mana?', 'talk'),
      L('y', 'Alarm, lampu, pintu otomatis, mesin cuci. Semuanya memutuskan sesuatu dari beberapa sinyal.', 'explain'),
      L('s', 'Ayo mulai dari alarm!', 'cheer')
    ]
  },
  n_4: {
    bg: 'Music_Room', title: 'Kasus selesai', go: 'KE EVALUASI AKHIR ▶',
    ask: { at: 6, q: 'Bagaimana perasaanmu menjelang evaluasi?', opts: [
      { t: 'Gugup sedikit', lines: [L('m', 'Wajar. Tarik napas dulu, lalu kerjakan satu soal demi satu soal.', 'calm'), L('s', 'Tenang, kamu nggak sendirian di sini!', 'cheer')] },
      { t: 'Siap!', lines: [L('n', 'Percaya diri itu bagus. Asal tetap teliti, ya.', 'smug'), L('m', 'Wah, semangatmu kebawa ke aku.', 'happy')] },
      { t: 'Lapar, mau cupcake', lines: [L('n', 'D-dasar! Fokus ujian dulu, cupcake belakangan!', 'angry'), L('s', 'Hehe, ujung-ujungnya selalu ke cupcake.', 'playful')] }
    ] },
    lines: [
      L('m', 'Tiga kasus selesai. Sekarang bagian yang paling kutunggu: Evaluasi akhir.', 'calm'),
      L('s', 'Kamu pasti bisa! Aku sudah siapin permen keberuntungan!', 'playful'),
      L('n', 'Permen apanya... Tapi, ya, jangan gugup. Kamu sudah jauh lebih baik dibanding tadi pagi. B-bukan berarti aku khawatir, ya!', 'shy'),
      L('m', 'Dua kalimat pertama itu perhatian, Natsuki. Kalimat terakhirnya pembelaan diri.', 'wink'),
      L('n', 'Monika!', 'angry'),
      L('y', 'Sepuluh soal, tanpa petunjuk. Bekalnya sudah kamu bawa semua, kok.', 'calm'),
      L('s', 'Ngomong-ngomong, kamu sendiri gugup nggak menjelang evaluasi?', 'talk'),
      L('s', 'Habis ujian, kita makan cupcake bareng, ya? Natsuki pasti sudah menyiapkannya!', 'happy'),
      L('n', 'C-cupcake? Memang sudah kubuat. Tapi itu hadiah untuk yang mengerjakan dengan baik, ya!', 'shy'),
      L('y', 'Eh, kalau boleh tahu, rasanya apa?', 'shy'),
      L('n', 'Rahasia sampai ujian selesai.', 'smug'),
      L('m', 'Setelah ini, cerita kita sampai ke ujungnya. Kerjakan dengan tenang, ya.', 'wink')
    ]
  },
  n_end: {
    bg: 'DDLCbg', title: 'Akhir cerita', go: 'KEMBALI KE MENU',
    next: () => { Story.on = false; go('menu') },
    lines: () => {
      const p = Story.prog(), r = p.ev ?? 0, N = EVAL_N, hi = r >= 8, mid = r >= 5, g = GRADES.find(x => r >= x.min);
      return [
        L('m', `Evaluasi akhirmu: ${r} dari ${N} benar, nilai ${r * 10}. Kategorinya "${g.t}".`, hi ? 'happy' : 'calm'),
        ...(hi ? [L('s', 'Tuh kaaan! Aku bilang juga apa! Kamu hebat banget!!', 'cheer'), L('n', 'Hmph... lumayan. Eh, bagus. Bagus banget, maksudku. Jangan geer!', 'hmph'), L('m', 'Natsuki, itu pujian jujur pertamamu hari ini. Kucatat.', 'wink'), L('n', 'B-bukan pujian! Itu... penilaian objektif!', 'shy'), L('y', 'Pemahamanmu sudah kuat. Kamu bisa menjelaskan ini ke orang lain sekarang.', 'happy')]
          : mid ? [L('s', 'Wah, sudah bagus lho! Tinggal dirapikan sedikit lagi!', 'happy'), L('n', 'Tidak buruk. Yang salah itu bisa dilatih lagi, kan? Latihanku selalu terbuka.', 'smug'), L('s', 'Latihannya jangan yang licik-licik lagi, ya...', 'worry'), L('n', 'Itu justru yang paling berguna.', 'hmph'), L('y', 'Soal yang salah menunjukkan bagian mana yang perlu dibaca ulang. Jadi tidak ada yang sia-sia.', 'calm')]
            : [L('s', 'Nggak apa-apa! Kita ulang bareng-bareng, aku temani!', 'happy'), L('y', 'Satu kali percobaan belum menentukan kemampuanmu. Materi dan Simulasi bisa kamu buka lagi kapan saja.', 'talk'), L('n', 'Jangan menyerah! Aku masih punya setumpuk soal... dan aku nggak akan kasihan, ya. Hmph!', 'angry'), L('m', 'Maksud Natsuki: dia akan menemanimu sampai bisa. Dengan cara yang galak.', 'wink'), L('n', 'Aku nggak bilang begitu! ...tapi ya, begitu.', 'shy')]),
        hi ? L('n', 'Cupcake-nya buat kalian semua. Yang paling besar buat kamu. Anggap saja bonus!', 'happy')
          : mid ? L('n', 'Cupcake-nya tetap ada, kok. Tapi untuk dapat dua, kamu harus latihan sekali lagi!', 'smug')
            : L('n', 'Cupcake-nya kusimpan dulu. Kita ulang belajarnya, baru kita makan bareng. Janji!', 'down'),
        L('s', 'Hari ini seru banget. Terima kasih sudah belajar bareng aku!', 'cheer'),
        L('m', 'Terima kasih sudah menemani kami sampai akhir. Kapan pun mau balik, pintunya terbuka. Sampai jumpa!', 'wink')
      ];
    },
    card: panel => {
      const p = Story.prog(), r = p.ev ?? 0, g = GRADES.find(x => r >= x.min);
      panel.innerHTML = `<div class="startcard res"><h2>HASIL CERITA</h2><div class="rg"><div><b>${p.lat ?? '-'}</b>Latihan /8</div><div><b>${r * 10}</b>Evaluasi</div><div><b>${r / EVAL_N * 100}%</b>Benar</div></div><p class="grade">${g.t}</p><div class="rfoot"><button class="btn" id="again">↻ MAIN CERITA LAGI</button></div></div>`;
      $('#again', panel).onclick = () => { Snd.sfx('select'); Story.start(true) };
    }
  },

  /* komentar karakter lain di dalam tiap bagian (muncul kontekstual, bukan setiap baris) */
  materi: {
    enter: [L('y', 'Aku ikut menemani. Kalau ada istilah yang kurang jelas, tanya saja, nanti kujelaskan.', 'talk'), L('n', 'Dan kalau Sayori salah ngomong, aku yang koreksi!', 'smug'), L('s', 'Heiii~! Aku nggak sesering itu salah kok!', 'pout'), L('m', 'Sudah, sudah. Mulai dari halaman pertama saja.', 'calm')],
    pg: {
      0: [L('m', 'Rangkaian logika dipakai di hampir semua kontrol mesin yang pernah kamu lihat. PLC, sensor, interlock.', 'calm'), L('s', 'PLC itu... permen bentuk lonceng?', 'worry'), L('n', 'Programmable Logic Controller! Otak kecil di panel mesin, bukan permen.', 'angry'), L('y', 'Ia membaca sinyal dari sensor dan tombol, lalu menyalakan atau mematikan motor dan lampu sesuai logika di dalamnya.', 'explain')],
      1: [L('s', 'Jadi tombol itu input, motor itu output, dan gerbang di tengah jadi otaknya?', 'talk'), L('n', 'Otak itu berlebihan. Gerbang cuma juri: lihat input, putuskan output.', 'smug'), L('y', 'Itu cukup tepat. Inputnya sensor, tombol, atau saklar. Outputnya lampu, motor, atau buzzer.', 'explain')],
      2: [L('y', 'Di dunia nyata, 0 dan 1 adalah tegangan rendah dan tinggi. Sinyal digital hanya melihat nilainya berada di sisi mana.', 'explain'), L('s', 'Kayak saklar lampu kamarku! Atas nyala, bawah mati.', 'happy'), L('n', 'Intinya: 0 itu mati, 1 itu hidup. Kalau sampai ketukar, kujewer!', 'angry')],
      3: [L('n', 'AND itu pelit: semua input harus 1, baru output ikut 1.', 'smug'), L('y', 'Contoh di mesin: motor hanya jalan kalau tombol START ditekan dan pintu pengaman tertutup. Salah satunya tidak terpenuhi, motor diam.', 'explain'), L('s', 'Jadi kalau pintunya kebuka, motornya ngambek?', 'playful'), L('n', 'Motornya aman. Kamu juga.', 'hmph')],
      4: [L('s', 'OR itu baik hati! Satu aja yang hidup, hasilnya ikut hidup!', 'playful'), L('n', 'Baik hati? Aku bilang longgar. Aturannya gampang dipenuhi.', 'smug'), L('y', 'Output OR baru 0 kalau semua inputnya 0. Contohnya alarm yang berbunyi bila salah satu sensor aktif.', 'explain')],
      5: [L('m', 'NOT unik: satu-satunya gerbang dasar yang hanya punya satu input.', 'talk'), L('s', 'NOT itu tukang usil. Kamu bilang 1, dia bilang 0.', 'playful'), L('n', 'Mirip kamu kalau kuajak ke perpustakaan.', 'smug'), L('y', 'Tepatnya: input 1 menghasilkan 0, dan input 0 menghasilkan 1. Itulah inverter.', 'explain')],
      6: [L('y', 'NAND disebut gerbang universal: semua gerbang lain bisa dibangun hanya dari NAND.', 'explain'), L('s', 'Wow, satu gerbang bisa jadi semuanya? Keren~', 'shock'), L('n', 'Buktikan dulu. Bikin NOT pakai NAND, bisa?', 'smug'), L('y', 'Bisa. Hubungkan kedua input NAND ke sinyal yang sama, hasilnya kebalikan sinyal itu.', 'calm'), L('n', '...Oke. Itu masuk akal.', 'hmph')],
      7: [L('s', 'NOR itu NOT OR, ya? Jadi kebalikannya OR! ...aku sudah mulai hafal polanya, lho.', 'happy'), L('n', 'Oke, buktikan. NOR nyala kapan?', 'smug'), L('s', 'Kalau salah satu nyala?', 'worry'), L('n', 'Itu OR, Sayori!', 'angry'), L('y', 'NOR hanya menyala kalau semua inputnya 0. Karena OR dibalik, hasilnya juga terbalik.', 'explain')],
      8: [L('n', 'XOR itu soal "beda atau sama?". Beda: nyala. Sama: mati. Gampang!', 'talk'), L('s', 'Jadi kalau dua-duanya 1, XOR mati?', 'talk'), L('n', 'Nah, itu benar! Kenapa tadi kamu ragu?', 'hmph'), L('m', 'Soalnya kamu terlalu cepat mengangguk, Natsuki.', 'wink')],
      9: [L('y', 'XNOR hanya menyala jika kedua input sama. Cara mudah mengingatnya: ia lawan dari XOR.', 'explain'), L('s', 'Berarti XNOR itu... OR?', 'worry'), L('y', 'Bukan. XNOR itu hasil XOR yang dibalik. Sama-sama 0 atau sama-sama 1, outputnya 1.', 'calm'), L('n', 'Nah, itu baru ringkasan yang enak. Catat, Sayori!', 'happy')],
      10: [L('m', 'Tabel kebenaran itu catatan semua kemungkinan input. Nanti di Simulasi kamu bisa lihat tabelnya berubah langsung.', 'happy'), L('s', 'Kalau inputnya dua, berarti ada empat baris. Kalau tiga, enam baris, kan?', 'talk'), L('y', 'Delapan baris. Tiap input tambahan menggandakan jumlah kombinasi, jadi dua pangkat jumlah input.', 'explain'), L('n', 'Enam dari mana? Dua kali tiga? Itu asal kali-kali, Sayori.', 'angry'), L('s', 'Aku nggak asal! Aku... estimasi!', 'pout')]
    },
    end: [L('m', 'Itu halaman terakhir. Semua materi sudah kamu baca.', 'happy'), L('n', 'Jangan senang dulu. Hafal belum tentu paham.', 'smug'), L('s', 'Hore! Sekarang kita pindah ke Simulasi bareng Yuri!', 'cheer')]
  },
  sim: {
    enter: [L('s', 'Wah, ada lampunya! Boleh aku yang pencet duluan?', 'cheer'), L('y', 'Silakan. Klik kotak A atau B, lalu perhatikan LED-nya.', 'talk'), L('n', 'Lihat tabelnya dulu baru pencet. Jangan asal, kayak ngetik PIN sambil ngelamun.', 'smug'), L('m', 'Supaya ceritanya lanjut, coba minimal empat gerbang berbeda dan ubah inputnya beberapa kali. Nanti kuberi tahu kalau sudah cukup.', 'calm')],
    gate: {
      AND: [L('n', 'AND: kalau ada satu saja yang 0, selesai. Mati.', 'smug'), L('s', 'Aku coba A nyala, B mati... lampunya mati! Natsuki benar!', 'shock')],
      OR: [L('s', 'OR itu kayak "mau es krim atau kue?" Dapat salah satu pun senang!', 'playful'), L('n', 'Dan kalau dapat dua-duanya, kamu lebih senang lagi. Outputnya tetap 1, ya.', 'smug')],
      NOT: [L('m', 'Gerbang paling sederhana, tapi hampir semua rangkaian memakainya.', 'talk')],
      NAND: [L('n', 'Hei, NAND itu AND yang dibalik. Jawab cepat: kapan outputnya 0?', 'smug'), L('s', 'Hmm, kalau semuanya 0?', 'worry'), L('y', 'Hanya ketika A dan B sama-sama 1. Coba klik keduanya dan lihat sendiri.', 'happy')],
      NOR: [L('s', 'NOR... jadi nyala cuma kalau semuanya mati? Aneh, tapi keren!', 'happy'), L('y', 'Betul. Semua inputnya harus 0, baru outputnya 1.', 'calm')],
      XOR: [L('m', 'XOR: "salah satu, tetapi tidak keduanya." Cermati bedanya dengan OR.', 'wink'), L('n', 'Gampangnya: OR tapi pelit sama yang kembar. Dua-duanya 1 malah mati.', 'smug')],
      XNOR: [L('n', 'Kebalikan XOR. Sama-sama = nyala. Gampang, kan?', 'talk'), L('s', 'Gampang! ...asal kamu nggak nanya aku lima menit lagi.', 'playful')]
    },
    ok: [L('m', 'Cukup! Kamu sudah coba banyak gerbang. Siap lanjut ke Latihan?', 'happy'), L('s', 'Yuk yuk! Natsuki udah nungguin tuh.', 'cheer'), L('n', 'Siapa yang nungguin? Aku cuma... nyiapin soal. Kebetulan lagi di sini.', 'shy')],
    need: (g, t) => `Syarat lanjut cerita: gerbang berbeda ${Math.min(g, 4)}/4 · ubah input ${Math.min(t, 6)}/6`
  },
  lat: {
    enter: [L('m', 'Latihannya 8 soal acak. Nggak ada nilai jelek di sini, tinggal diulang kalau kurang.', 'talk'), L('y', 'Kalau ragu, bayangkan tabel kebenarannya.', 'talk'), L('s', 'Semangat! Aku nonton dari sini, ya!', 'cheer'), L('n', 'Diam dan perhatikan, Sayori! ...Eh, maksudku, ikut semangatin aja boleh.', 'shy')],
    ok: [L('s', 'Yeay! Benar! Kamu keren banget!', 'cheer'), L('y', 'Jawabannya tepat, alasannya juga masuk akal.', 'happy'), L('m', 'Bagus. Jawabanmu mantap.', 'happy'), L('n', 'Yang itu memang soal mudah. Tunggu yang berikutnya.', 'smug'), L('s', 'Natsuki, kamu senyum tadi, aku lihat!', 'playful')],
    bad: [L('s', 'Nggak apa-apa! Salah itu bagian dari belajar, kok.', 'happy'), L('y', 'Coba lihat petunjuknya. Sering kali kuncinya cuma satu pola sederhana.', 'talk'), L('m', 'Satu soal belum menentukan apa-apa. Lanjut saja pelan-pelan.', 'calm'), L('n', 'Hampir! Baca lagi soalnya, kali ini sampai kata terakhir.', 'hmph'), L('s', 'Aku juga sering salah di situ. Jadi tenang, kamu nggak sendirian!', 'worry')],
    half: { good: [L('m', 'Setengah jalan dan hasilmu bagus. Pertahankan ritmenya.', 'happy'), L('n', 'Jangan sombong dulu. Soal berikutnya sengaja kubuat lebih menjebak.', 'smug')], bad: [L('y', 'Tidak masalah. Cobalah baca ulang soal sampai kata terakhir sebelum menjawab.', 'calm'), L('s', 'Setengah jalan lagi! Ayo, ayo, ayo!', 'cheer')] },
    end: s => [s >= 6 ? L('s', 'Kamu hebat! Aku bangga banget sama kamu!', 'cheer') : L('s', 'Capek ya? Tapi kamu sudah menyelesaikan satu set penuh. Itu keren!', 'happy'), s >= 6 ? L('n', 'Lumayan. Tapi aku punya soal yang lebih sulit kalau kamu mau.', 'smug') : L('n', 'Nilainya belum bagus, tapi kamu menyelesaikan semuanya. Itu yang penting.', 'shy'), L('m', 'Satu set sudah selesai. Kalau siap, kita lanjut ke Evaluasi.', 'talk')]
  },
  eval: {
    enter: [L('n', 'Evaluasi, ya? Kali ini nggak ada hint dariku. Jangan mengandalkan aku!', 'smug'), L('y', 'Bacalah tiap soal sampai selesai. Banyak kesalahan terjadi pada kata terakhir.', 'talk'), L('s', 'Tarik napas dulu~ Kamu pasti bisa!', 'playful'), L('m', 'Natsuki bilang tanpa hint, tapi dia yang paling duluan gelisah.', 'wink'), L('n', 'A-aku nggak gelisah!', 'shy')],
    half: [L('s', 'Sudah setengah! Sedikit lagi!', 'cheer'), L('y', 'Ritmemu bagus. Tetap fokus.', 'explain'), L('n', 'Setengahnya lagi bukan alasan buat santai. Teliti!', 'hmph')],
    swap: [L('n', 'Yakin mau diganti? Hmph... terserah, itu hakmu.', 'grump'), L('m', 'Ganti jawaban itu boleh. Pastikan ada alasannya, jangan cuma karena ragu.', 'calm')],
    end: s => [s >= 7 ? L('n', 'Bagus juga. Jangan senang dulu!', 'smug') : L('n', 'Masih bisa lebih baik. Aku tahu kamu bisa.', 'talk'), L('s', s >= 7 ? 'Natsuki, kamu senyum lagi!' : 'Tos dulu! Kamu sudah berusaha keras!', s >= 7 ? 'playful' : 'cheer'), L('y', 'Apa pun hasilnya, hari ini kamu sudah banyak belajar.', 'calm')]
  }
};

/* KASUS NYATA (v33): pemain memilih gerbang untuk tiap tahap, rangkaiannya diuji dengan skenario.
   in = sinyal masuk (urutan = urutan nilai di sc); st = tahap [{id, in, opts, ans, name, hint}], tahap terakhir = keluaran; sc = [...nilai input, teks skenario]. 'KABEL' = sinyal diteruskan tanpa gerbang. */
const KASUS = {
  k_alarm: {
    no: 1, bg: 'DDLCbg', title: 'Kasus 1 dari 3: Alarm toko', go: 'KASUS BERIKUTNYA ▶', name: 'ALARM TOKO KUE',
    desc: 'Alarm bunyi kalau sistem menyala dan ada gangguan di pintu atau jendela.',
    in: { P: 'pintu', J: 'jendela', S: 'sistem' }, out: ['BUNYI', 'DIAM'],
    st: [
      { id: 'g1', in: ['P', 'J'], opts: ['AND', 'OR', 'XOR'], ans: 'OR', name: 'Sensor', hint: L('y', 'Gangguan itu pintu atau jendela. Satu yang terbuka saja sudah cukup, dua-duanya terbuka pun tetap gangguan.', 'explain') },
      { id: 'Y', in: ['g1', 'S'], opts: ['AND', 'OR', 'NAND'], ans: 'AND', name: 'Alarm', hint: L('y', 'Alarm hanya boleh bunyi kalau ada gangguan dan sistem menyala. Dua syarat itu wajib terpenuhi bersamaan.', 'explain') }
    ],
    sc: [[1, 0, 1, 'Pintu terbuka, sistem menyala'], [0, 1, 1, 'Jendela terbuka, sistem menyala'], [1, 1, 1, 'Pintu dan jendela terbuka, sistem menyala'], [0, 0, 1, 'Semua tertutup, sistem menyala'], [1, 0, 0, 'Pintu terbuka, sistem mati']],
    lines: [
      L('n', 'Kasus pertama punyaku. Aku mau buka toko kue kecil di sekolah, jadi butuh alarm.', 'happy'),
      L('n', 'Ada tiga sinyal: sensor pintu, sensor jendela, dan saklar sistem yang dipegang penjaga.', 'talk'),
      L('s', 'Aku yang jadi pencuri percobaan!', 'playful'),
      L('n', 'Diam, Sayori. Aturannya: alarm bunyi kalau sistem menyala dan ada yang mengganggu, lewat pintu atau jendela.', 'hmph'),
      L('y', 'Jadi ada dua tahap. Tahap pertama menggabungkan pintu dan jendela. Tahap kedua menggabungkan hasilnya dengan saklar sistem.', 'explain'),
      L('n', 'Pilih gerbang di tiap tahap. Aku uji dengan lima skenario, dan semuanya harus benar.', 'smug')
    ],
    win: [L('y', 'Tahap pertama OR: pintu atau jendela, satu saja cukup. Tahap kedua AND: ada gangguan dan sistem menyala, dua-duanya wajib.', 'explain'), L('n', 'Alarmku jadi bunyi di saat yang tepat. ...Lumayan. Eh, bagus!', 'happy'), L('s', 'Pencuri percobaannya tertangkap!', 'cheer')]
  },
  k_tangga: {
    no: 2, bg: 'Music_Room', title: 'Kasus 2 dari 3: Lampu tangga', go: 'KASUS BERIKUTNYA ▶', name: 'LAMPU TANGGA',
    desc: 'Satu saklar di bawah, satu di atas. Menekan salah satunya membalik keadaan lampu.',
    in: { A: 'saklar bawah ditekan', B: 'saklar atas ditekan' }, out: ['NYALA', 'MATI'],
    st: [{ id: 'Y', in: ['A', 'B'], opts: ['AND', 'OR', 'XOR', 'XNOR'], ans: 'XOR', name: 'Lampu', hint: L('y', 'Kalau kedua saklar sama posisinya, lampu mati. Kalau berbeda, lampu nyala. Gerbang mana yang menilai "beda atau sama"?', 'explain') }],
    sc: [[0, 0, 'Belum ada saklar yang ditekan'], [1, 0, 'Naik tangga, saklar bawah ditekan'], [1, 1, 'Sampai atas, saklar atas ikut ditekan'], [0, 1, 'Hanya saklar atas yang ditekan']],
    lines: [
      L('s', 'Kasus kedua dari rumahku! Tangga di rumahku gelap banget kalau malam.', 'worry'),
      L('s', 'Di bawah ada saklar, di atas juga ada. Mau pencet yang mana saja, lampunya harus ikut berubah.', 'talk'),
      L('y', 'Awalnya kedua saklar di posisi biasa dan lampu mati. Menekan satu saklar menyalakan lampu. Menekan saklar yang satunya lagi mematikannya.', 'explain'),
      L('m', 'Jadi lampu nyala saat kedua saklar berbeda posisi. Satu gerbang saja cukup. Pilih yang tepat.', 'wink')
    ],
    win: [L('y', 'XOR: output 1 kalau kedua input berbeda, 0 kalau sama. Cocok untuk dua saklar di dua tempat.', 'explain'), L('s', 'Jadi itu gunanya XOR! Kukira dia cuma ada di soal ujian.', 'shock'), L('n', 'Sekarang kamu tahu gunanya. Jangan tertukar dengan OR lagi.', 'smug')]
  },
  k_brankas: {
    no: 3, bg: 'DDLCbg', title: 'Kasus 3 dari 3: Brankas klub', go: 'KE PENUTUP KASUS ▶', name: 'BRANKAS KLUB',
    desc: 'Brankas terbuka kalau kedua kunci diputar dan tombol darurat tidak aktif.',
    in: { K: 'kunci ketua', W: 'kunci wakil', D: 'tombol darurat' }, out: ['TERBUKA', 'TERKUNCI'],
    st: [
      { id: 'n1', in: ['D'], opts: ['NOT', 'KABEL'], ans: 'NOT', name: 'Tombol darurat', hint: L('y', 'Tombol darurat yang aktif harus menahan brankas. Sinyalnya perlu dibalik supaya "aktif" berubah jadi 0.', 'explain') },
      { id: 'g1', in: ['K', 'W'], opts: ['AND', 'OR', 'XOR'], ans: 'AND', name: 'Dua kunci', hint: L('m', 'Kedua kunci harus diputar bersamaan. Kalau cuma satu, brankas tidak boleh terbuka.', 'talk') },
      { id: 'Y', in: ['g1', 'n1'], opts: ['AND', 'OR', 'NOR'], ans: 'AND', name: 'Brankas', hint: L('y', 'Brankas terbuka kalau dua kunci sudah diputar dan tombol darurat tidak aktif. Dua syarat, keduanya wajib.', 'explain') }
    ],
    sc: [[1, 1, 0, 'Dua kunci diputar, darurat tidak aktif'], [1, 1, 1, 'Dua kunci diputar, darurat aktif'], [1, 0, 0, 'Hanya kunci ketua diputar'], [0, 1, 0, 'Hanya kunci wakil diputar'], [0, 0, 0, 'Tidak ada kunci diputar']],
    lines: [
      L('m', 'Kasus terakhir punyaku. Klub kita punya brankas kecil untuk menyimpan uang kas.', 'calm'),
      L('m', 'Brankas terbuka kalau dua kunci diputar bersamaan: kunci ketua dan kunci wakil. Tapi ada satu syarat lagi.', 'talk'),
      L('y', 'Tombol darurat. Kalau tombol itu aktif, brankas tetap terkunci walau kedua kuncinya diputar.', 'explain'),
      L('n', 'Tiga sinyal, tiga tahap. Ini yang paling panjang, jadi jangan buru-buru.', 'smug'),
      L('s', 'Wah, ada tiga gerbang! Aku bantu pegang kuncinya!', 'cheer'),
      L('m', 'Tahap pertama untuk tombol darurat, kedua untuk dua kunci, ketiga menggabungkan keduanya.', 'calm')
    ],
    win: [L('y', 'NOT membalik tombol darurat: aktif jadi 0, dan 0 menahan AND terakhir. Dua kunci digabung AND, lalu digabung lagi dengan hasil NOT.', 'explain'), L('m', 'Cara berpikirnya sama dengan panel kontrol di mesin: beberapa sinyal masuk, gerbang yang memutuskan.', 'happy'), L('n', 'Tiga kasus selesai. Tinggal sekali lagi: Evaluasi.', 'smug')]
  }
};
const kzCalc = (c, pick, v) => {   // keluaran rangkaian untuk nilai masukan v; null bila ada tahap belum dipilih
  const sig = {}; Object.keys(c.in).forEach((k, i) => sig[k] = v[i]);
  for (const s of c.st) { const g = pick[s.id]; if (!g) return null; const a = sig[s.in[0]]; sig[s.id] = s.in.length === 1 ? (g === 'NOT' ? F.NOT(a) : a) : F[g](a, sig[s.in[1]]) }
  return sig[c.st[c.st.length - 1].id];
};
const kzExpr = (c, pick) => {   // teks rumus dari pilihan pemain
  const sg = id => { const s = c.st.find(x => x.id === id); if (!s) return id; const g = pick[id], a = sg(s.in[0]); if (s.in.length === 1) return g ? (g === 'NOT' ? nb(a) : a) : '?'; return `(${a} ${g || '?'} ${sg(s.in[1])})` };
  return 'Y = ' + sg('Y').replace(/^\((.*)\)$/, '$1');
};
function kasusCard(id, panel, d) {
  const c = KASUS[id], pick = {}, n = c.sc.length, nIn = Object.keys(c.in).length, ans = Object.fromEntries(c.st.map(s => [s.id, s.ans])); let solved = false;
  const go = $('.ngo'); go.hidden = true;   // tombol lanjut tampil setelah semua skenario lolos
  panel.innerHTML = `<div class="startcard sc kz"><h2>${c.name}</h2><p class="kzd">${c.desc}</p><p class="kzl">${Object.entries(c.in).map(([k, v]) => `<b>${k}</b> ${v}`).join(' · ')}</p>
    <div class="kzb"><div><div class="kzs">${c.st.map((s, i) => `<div class="kzt"><b class="kzn">${c.st.length > 1 ? `Tahap ${i + 1}: ` : ''}${s.name} <i>(${s.in.map(x => c.in[x] ? x : 'hasil tahap ' + (c.st.findIndex(y => y.id === x) + 1)).join(', ')})</i></b><div class="kzo" role="radiogroup" aria-label="${s.name}">${s.opts.map(o => `<button class="opt" role="radio" aria-checked="false" data-s="${s.id}" data-g="${o}">${o}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="kzf" aria-live="polite"></div></div>
    <div class="kzr">${c.sc.map((r, i) => `<div class="kzrow" data-i="${i}"><span class="kzx">${r[nIn]}</span><span class="kze">harus ${c.out[kzCalc(c, ans, r) ? 0 : 1]}</span><span class="kzv"></span></div>`).join('')}</div></div>
    <div class="kzm"><span class="kzp"></span><button class="btn sm" id="khint">PETUNJUK</button></div><div class="rfoot"></div></div>`;
  const rows = $$('.kzrow', panel), msg = $('.kzp', panel), fm = $('.kzf', panel);
  const draw = () => {
    let ok = 0; c.sc.forEach((r, i) => { const o = kzCalc(c, pick, r), want = kzCalc(c, ans, r), el = rows[i], v = $('.kzv', el); const pass = o === want;
      el.className = 'kzrow' + (o == null ? '' : pass ? ' ok' : ' bad'); v.textContent = o == null ? '...' : `${c.out[o ? 0 : 1]} ${pass ? '✓' : '✗'}`; if (pass) ok++ });
    fm.innerHTML = kzExpr(c, pick);
    $$('.opt', panel).forEach(b => { const on = pick[b.dataset.s] === b.dataset.g; b.classList.toggle('picked', on); b.setAttribute('aria-checked', on) });
    msg.textContent = Object.keys(pick).length < c.st.length ? 'Pilih gerbang di tiap tahap.' : ok === n ? 'Semua skenario lolos!' : `${ok} dari ${n} skenario lolos.`;
    if (ok === n && Object.keys(pick).length === c.st.length && !solved) { solved = true; Snd.cue('star'); Story.record('kasus', Math.max(Story.prog().kasus || 0, c.no)); $$('.opt', panel).forEach(b => b.disabled = true); $('#khint', panel).disabled = true; go.hidden = false; $('#khint', panel).hidden = true; d.say(c.win) }
  };
  panel.onclick = e => { const b = e.target.closest('.opt'); if (!b || solved) return; Snd.sfx('select'); pick[b.dataset.s] = b.dataset.g; draw() };
  $('#khint', panel).onclick = () => { if (solved) return; Snd.sfx('select'); const s = c.st.find(x => pick[x.id] !== x.ans); s && d.say([s.hint]) };
  draw();
  const fit = () => {   // panel kasus tidak boleh melewati kotak dialog, berapa pun tinggi dialog di layar itu
    const dl = $('.dlg'), r = panel.getBoundingClientRect(), k = panel.offsetHeight ? r.height / panel.offsetHeight : 1;
    if (!dl || !r.height) return; panel.style.maxHeight = Math.max(120, (dl.getBoundingClientRect().top - r.top - 6) / k) + 'px'; panel.style.overflowY = 'auto'; const kc = $('.kz', panel); kc.classList.remove('tight'); if (panel.scrollHeight > panel.clientHeight + 2) kc.classList.add('tight'); upd();   // masih meluap: rapatkan dulu sebelum menggulir
  }, upd = () => panel.classList.toggle('scr', panel.scrollTop + panel.clientHeight < panel.scrollHeight - 4);   // bayangan di tepi bawah bila masih ada isi di bawah
  panel.addEventListener('scroll', upd);
  fit(); removeEventListener('resize', Story.kzFit); Story.kzFit = fit; addEventListener('resize', fit); setTimeout(fit, 400);
}
Object.keys(KASUS).forEach(id => { const c = KASUS[id]; ST[id] = { bg: c.bg, title: c.title, go: c.go, kz: true, lines: c.lines, win: c.win, hints: c.st.map(s => s.hint), card: (panel, d) => kasusCard(id, panel, d) }; SC[id] = () => narrScene(id) });

/* pengait ke scene (dipanggil dari app.js; semuanya [] / no-op bila Mode Cerita mati) */
const SL = {
  enter: k => Story.on ? ST[k].enter : [],
  materiPage: (p, first) => Story.on && first ? (ST.materi.pg[p] || []) : [],
  materiEnd: () => Story.on ? ST.materi.end : [],
  gate: (g, first) => Story.on && first ? ST.sim.gate[g] : [],
  lat: (k, a) => Story.on ? (k === 'ok' || k === 'bad' ? (Math.random() < .4 ? [pick(ST.lat[k])] : []) : k === 'half' ? ST.lat.half[a ? 'good' : 'bad'] : ST.lat.end(a)) : [],
  eval: (k, a) => Story.on ? (k === 'half' ? [pick(ST.eval.half)] : k === 'swap' ? (Math.random() < .5 ? ST.eval.swap : []) : ST.eval.end(a)) : []
};

/* tombol "lanjut cerita" yang muncul hanya setelah aktivitas wajib selesai */
Story.contBtn = (id, label = NEXT_LABEL[id]) => { const b = document.createElement('button'); b.className = 'btn big contstory'; b.textContent = label; b.onclick = () => { Snd.sfx('select'); Story.advance() }; return b };
Story.leave = () => { Story.replay = false; Story.on = false; go('peta') };
Story.record = (k, v) => { const p = Story.prog(); p[k] = v; Story.save(p) };

SC.n_intro = () => narrScene('n_intro'); SC.n_1 = () => narrScene('n_1'); SC.n_2 = () => narrScene('n_2'); SC.n_3 = () => narrScene('n_3'); SC.n_4 = () => narrScene('n_4');
SC.n_end = () => { const p = Story.prog(); p.step = 0; p.done = true; Story.save(p); narrScene('n_end') };
