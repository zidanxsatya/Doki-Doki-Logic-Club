/* ===== story.js : MODE CERITA — Materi → Simulasi → Latihan → Evaluasi → akhir cerita, dengan keempat karakter =====
   Dua sistem tampilan (sengaja dipisah):
   - Diskusi edukasi : potret statis di kiri (assets/img/portraits, satu gambar per ekspresi) + area materi besar di kanan.
   - Adegan cerita   : sprite TANPA mikrofon (assets/img/sprites, dari menucharacters Takeover), DIAM; yang berganti hanya pembicara.
   Mode Mandiri (menu: Materi/Simulasi/Latihan/Evaluasi) tidak berubah: Story.on === false.
   Format baris dialog Mode Cerita: [teks, ekspresi, siapa]. Tanpa "siapa" = karakter utama bagian itu. */

const Story = { on: false, key: 'tkm_story' };
const SK = { s: 'sayori', y: 'yuri', n: 'natsuki', m: 'monika' };
const STEPS = ['n_intro', 'materi', 'n_1', 'simulasi', 'n_2', 'latihan', 'n_3', 'evaluasi', 'n_end'];
const STEP_NAME = { n_intro: 'Pembukaan', materi: 'Materi', n_1: 'Menuju Simulasi', simulasi: 'Simulasi', n_2: 'Menuju Latihan', latihan: 'Latihan', n_3: 'Menuju Evaluasi', evaluasi: 'Evaluasi', n_end: 'Penutup' };
const NEXT_LABEL = { materi: 'LANJUT KE SIMULASI ▶', simulasi: 'LANJUT KE LATIHAN ▶', latihan: 'LANJUT KE EVALUASI ▶', evaluasi: 'LANJUT KE AKHIR CERITA ▶' };
const L = (w, t, e) => [t, e, SK[w] ?? w];   // L('y', 'teks', 'explain')

/* ---------- potret statis: ekspresi kode (sama dengan CHARS.expr) -> nama file di assets/img/portraits ---------- */
const PORT = {
  sayori: { neutral: 'neutral', calm: 'neutral', happy: 'happ', talk: 'wah', cheer: 'yeah', sad: 'concern', shock: 'ooh', down: 'concern' },
  yuri: { neutral: 'neutral', breath: 'neutral', shy: 'blush', talk: 'smile', happy: 'happy', explain: 'ahaha', shock: 'ahh', down: 'ehh' },
  natsuki: { neutral: 'neutral', smug: 'happy', talk: 'wah', happy: 'wah', angry: 'angy', hmph: 'hmmph', shock: 'what', down: 'sick' },
  monika: { neutral: 'neutral', talk: 'neutral', happy: 'ahaha', cheer: 'wah', wink: 'ahh', shock: 'eeh', down: 'upset' }
};
/* label ekspresi -> kumpulan potret/sprite yang berputar (Story saja), supaya label yang sama tidak selalu menampilkan wajah yang sama.
   Isi kumpulan disesuaikan watak: Sayori ceria & jahil, Yuri pemalu & pemikir, Natsuki ekspresif & tsundere, Monika percaya diri & hangat. null (sprite) = sprite asli. */
const POOL = {
  sayori: { talk: ['wah', 'neutral', 'happ'], happy: ['happ', 'yeah', 'wah'], cheer: ['yeah', 'wah', 'ooh'], calm: ['neutral', 'happ'], playful: ['wah', 'yeah'], wink: ['yeah'], pout: ['grumpy'], sad: ['concern', 'ehh'], down: ['concern', 'ehh'], worry: ['ehh', 'concern'], shy: ['ehh', 'neutral'] },
  yuri: { talk: ['smile', 'neutral'], explain: ['ahaha', 'smile', 'neutral'], happy: ['happy', 'smile'], shy: ['blush', 'ehh'], calm: ['neutral', 'smile'], down: ['ehh', 'blush'] },
  natsuki: { talk: ['wah', 'neutral', 'happy'], smug: ['happy', 'neutral'], happy: ['wah', 'happy'], angry: ['angy', 'sick'], hmph: ['hmmph', 'neutral'], grump: ['hmmph', 'angy'], shy: ['hmmph', 'neutral'], down: ['sick'] },
  monika: { talk: ['neutral', 'ahaha'], happy: ['ahaha', 'wah'], cheer: ['wah', 'ahaha'], calm: ['neutral', 'ahaha'], wink: ['ahh'], down: ['upset', 'eeh'], shy: ['eeh', 'ahaha'] }
};
const CYC = {}, nextOf = (pool, key) => pool[CYC[key] = ((CYC[key] ?? -1) + 1) % pool.length];
const portSrc = (k, e) => { const pl = POOL[k][e] || PORT[k][e] && [PORT[k][e]]; return `assets/img/portraits/${k}_${pl ? nextOf(pl, k + e) : 'neutral'}.webp` };
const PCACHE = {};   // satu objek Image per potret, dibuat sekali & didecode di awal (dulu: new Image() tiap ganti ekspresi + fade 160ms)
const getPort = src => PCACHE[src] ??= (() => { const i = new Image(); i.src = src; i.decode && i.decode().catch(() => { }); return i })();
const preloadPortraits = () => { Object.keys(PORT).forEach(k => new Set([...Object.values(PORT[k]), ...Object.values(POOL[k]).flat()]).forEach(n => getPort(`assets/img/portraits/${k}_${n}.webp`))); Object.keys(CHARS).forEach(k => getPort(`assets/img/sprites/${k}.webp`)) };

/* ---------- kemajuan cerita (localStorage: tkm_story) ---------- */
Story.prog = () => store.get(Story.key, { step: 0, done: false, lat: null, ev: null });
Story.save = p => store.set(Story.key, p);
Story.start = fresh => { const p = Story.prog(); if (fresh) { p.step = 0; Story.save(p) } Story.on = true; preloadPortraits(); preloadExpr(); go(STEPS[p.step]) };
Story.advance = () => { const p = Story.prog(); p.step = Math.min(p.step + 1, STEPS.length - 1); Story.save(p); Story.on = true; go(STEPS[p.step]) };
Story.index = () => STEPS.indexOf(Journey.last);
Story.menuSub = () => { const p = Story.prog(); return p.step > 0 ? `Lanjutkan: ${STEP_NAME[STEPS[p.step]]}` : p.done ? `Selesai · nilai ${p.ev * 10} · main lagi` : 'Belajar bareng semua karakter' };

/* ---------- potret kiri (layout diskusi edukasi) ---------- */
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

/* ---------- kerangka diskusi edukasi mode cerita (pengganti scaffold biasa, API sama) ---------- */
Story.scaffold = id => {
  const m = M[id], el = $('#scene'), n = STEPS.indexOf(id), tot = 4, no = [1, 3, 5, 7].indexOf(n) + 1;
  el.classList.add('story'); el.dataset.sec = id;
  el.innerHTML = `<div class="bg" data-b="${m.bg}" style="background-image:url(assets/img/${m.bg}.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>${m.label}</b><i class="hintc">Cerita ${no}/${tot} · klik potret untuk ngobrol</i></div><div id="panel" class="panel"></div><div class="pt"><span class="pn"></span><img alt=""></div><div class="dlg"></div>`;
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

/* ---------- adegan cerita: sprite diam + dialog multi-karakter ---------- */
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
  const keys = ['sayori', 'yuri', 'natsuki', 'monika'].filter(k => lines.some(l => l[2] === k)), pos = NPOS[keys.length];
  el.classList.add('narr');
  el.innerHTML = `<div class="bg" data-b="${A.bg}" style="background-image:url(assets/img/${A.bg}.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>CERITA</b><i class="hintc">${A.title}</i></div>
  <div class="nar">${keys.map((k, i) => `<div class="ns" data-k="${k}" style="--x:${pos[i]}%;--h:${NH[k]}"><img alt="" src="assets/img/sprites/${k}.webp"></div>`).join('')}</div><div id="panel" class="panel npanel"></div><div class="dlg"></div><button class="btn big ngo" hidden>${A.go || 'LANJUT ▶'}</button>`;
  const cast = {}; keys.forEach(k => cast[k] = { key: k, cfg: CHARS[k], setExpression(e) { const im = $(`.ns[data-k=${k}] img`, el), src = exSrc(k, e); if (im && !im.src.endsWith(src)) im.src = src } });
  const d = new Dialogue($('.dlg', el), cast[lines[0][2]], cast); d.base = lines[0][2];
  const vis = new Set(A.reveal ? [lines[0][2]] : keys), place = () => { const ks = keys.filter(k => vis.has(k)); ks.forEach((k, i) => $(`.ns[data-k=${k}]`, el).style.setProperty('--x', NPOS[ks.length][i] + '%')); $$('.ns', el).forEach(n => n.classList.toggle('off', !vis.has(n.dataset.k))) };
  if (A.reveal) place();   // adegan pembuka: hanya pembicara pertama yang tampil, lainnya masuk saat pertama bicara
  d.onSpeaker = k => { if (!vis.has(k)) { vis.add(k); place() } $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === k)) };
  const goBtn = $('.ngo', el); let finished = false;
  const done = () => { if (finished) return; finished = true; goBtn.hidden = false; if (A.card) A.card($('#panel', el)); goBtn.onclick = () => { Snd.sfx('select'); A.next ? A.next() : Story.advance() } };
  const watch = setInterval(() => { if (!d.typing && !d.q.length && d.shown) { done(); clearInterval(watch) } }, 200);
  d.say(lines, done);
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === lines[0][2]));
  el.classList.add('on');
  scene = { cleanup() { clearInterval(watch); d.destroy(); el.classList.remove('narr'); el.innerHTML = ''; document.onkeydown = null } };
}

/* =====================================================================================
   NASKAH CERITA
   ===================================================================================== */
const ST = {
  n_intro: {
    bg: 'DDLCbg', title: 'Klik kotak dialog untuk lanjut', go: 'MULAI BELAJAR: MATERI ▶', reveal: true,   // karakter masuk satu per satu saat pertama kali bicara
    lines: [
      L('s', 'Ah, kamu datang! Hai hai! Aku Sayori. Kamu yang mau belajar buat ujian Teknik Kontrol Mekatronika, kan?', 'happy'),
      L('s', 'Jujur, rangkaian logika itu bikin kepalaku muter-muter... Makanya aku ngajak teman-teman klubku buat belajar bareng. Ayo, ikut aku!', 'worry'),
      L('s', 'Nah, ini klubku! Biasanya kami baca puisi dan makan camilan di sini. Hari ini ruangannya kita pakai buat belajar. Duduk di mana aja, ya!', 'cheer'),
      L('s', 'Hmm, yang lain mana ya? ...Ah, itu dia! Natsuki!', 'calm'),
      L('n', 'Sayori! Kamu belum selesai nyiapin meja, tahu! ...Eh? Siapa dia? Oh, yang mau ikut belajar itu?', 'angry'),
      L('n', 'Aku Natsuki. Kalau mau belajar, jangan setengah-setengah, ya. Aku bikin kartu soal sendiri, lho. B-bukan khusus buat Sayori!', 'hmph'),
      L('s', 'Natsuki, jangan galak dulu~ Dia kan baru datang!', 'pout'),
      L('y', 'M-maaf, aku terlambat... Aku Yuri. Semalam aku merangkum catatan gerbang logika. Kalau mau, boleh dipinjam.', 'shy'),
      L('s', 'Wah, Yuri baik banget! Aku pinjam duluan, ya!', 'wink'),
      L('m', 'Sepertinya semua sudah berkumpul. Selamat datang! Aku Monika, ketua klub ini.', 'calm'),
      L('m', 'Hari ini klub sastra kita menyamar jadi Doki Doki Logic Club. Aturannya cuma satu: tidak ada yang ditinggal. Yang ragu bertanya, yang paham menjelaskan.', 'happy'),
      L('y', 'Aku sudah menyusun urutannya: materi dasar dulu, lalu simulasi gerbang logika, latihan soal, dan terakhir evaluasi akhir.', 'explain'),
      L('n', 'Bagian latihan soal aku yang pegang! Jangan harap aku lembek, ya.', 'smug'),
      L('m', 'Urutannya rapi banget, ya? Seolah-olah ada yang sudah menyusun jalan ceritanya untuk kita. Ahaha, abaikan saja ucapanku barusan.', 'wink'),
      L('s', 'Pokoknya kamu nggak sendirian! Ayo mulai dari Materi!', 'playful')
    ]
  },
  n_1: {
    bg: 'DDLCbg', title: 'Materi selesai', go: 'KE SIMULASI ▶',
    lines: [
      L('y', 'Seluruh materinya sudah kamu lewati. Dasar seperti itu sering diremehkan, padahal semuanya bertumpu di sana.', 'calm'),
      L('s', 'Aku juga ngerasa makin paham! ...mungkin. Sedikit.', 'happy'),
      L('n', 'Sedikit? Hmph. Tapi ya, lumayan lah.', 'grump'),
      L('y', 'Tadi aku sempat khawatir penjelasanku terlalu panjang. Syukurlah kamu tetap mengikutinya sampai habis.', 'shy'),
      L('s', 'Kalau Yuri yang menjelaskan, aku jadi ingat terus! Terutama 0 itu mati, 1 itu hidup.', 'cheer'),
      L('y', 'Bagian berikutnya favoritku: Simulasi. Kamu bisa mengubah input dan melihat sendiri bagaimana tiap gerbang bereaksi.', 'happy'),
      L('m', 'Kali ini bukan sekadar membaca. Kamu yang menekan tombolnya. Ayo ke Simulasi!', 'calm')
    ]
  },
  n_2: {
    bg: 'Music_Room', title: 'Simulasi selesai', go: 'KE LATIHAN ▶',
    lines: [
      L('n', 'Oke, sudah puas mainin gerbang? Sekarang giliranku menguji kemampuanmu!', 'smug'),
      L('s', 'Aduh, deg-degan...', 'worry'),
      L('y', 'Tenang. Tadi kamu sudah melihat pola tiap gerbang sendiri. Kalau ragu, bayangkan tabel kebenarannya.', 'calm'),
      L('n', 'Aku sudah menyiapkan delapan soal. Beberapa lumayan licik, jadi bersiaplah.', 'smug'),
      L('s', 'Licik?! Natsuki jangan menakut-nakuti dong!', 'shock'),
      L('m', 'Latihan itu tempat yang boleh salah. Jawabanmu juga masih bisa diganti sebelum dicek.', 'happy'),
      L('n', 'Bukan berarti boleh asal-asalan, ya! Ayo mulai!', 'hmph')
    ]
  },
  n_3: {
    bg: 'Music_Room', title: 'Latihan selesai', go: 'KE EVALUASI AKHIR ▶',
    lines: [
      L('m', 'Latihan selesai. Sekarang bagian yang paling kutunggu: Evaluasi akhir.', 'calm'),
      L('s', 'Kamu pasti bisa! Aku sudah siapin permen keberuntungan!', 'playful'),
      L('n', 'Permen apanya... Tapi, ya, jangan gugup. Kamu sudah jauh lebih baik dibanding tadi pagi. B-bukan berarti aku khawatir, ya!', 'shy'),
      L('y', 'Sepuluh soal, tanpa petunjuk. Tapi kamu sudah membawa semua bekalnya.', 'calm'),
      L('s', 'Habis ujian, kita makan cupcake bareng, ya? Natsuki pasti sudah menyiapkannya!', 'happy'),
      L('n', 'C-cupcake? Memang sudah kubuat. Tapi itu hadiah untuk yang mengerjakan dengan baik, ya!', 'shy'),
      L('m', 'Setelah ini, cerita kita sampai ke ujungnya. Kerjakan dengan tenang, ya.', 'wink')
    ]
  },
  n_end: {
    bg: 'DDLCbg', title: 'Akhir cerita', go: 'KEMBALI KE MENU',
    next: () => { Story.on = false; go('menu') },
    lines: () => {
      const p = Story.prog(), r = p.ev ?? 0, N = EVAL.length, hi = r >= 8, mid = r >= 5, g = GRADES.find(x => r >= x.min);
      return [
        L('m', `Evaluasi akhirmu: ${r} dari ${N} benar, nilai ${r * 10}. Kategorinya "${g.t}".`, hi ? 'happy' : 'calm'),
        ...(hi ? [L('s', 'Tuh kaaan! Aku bilang juga apa! Kamu hebat banget!!', 'cheer'), L('n', 'Hmph... lumayan. Eh, bagus. Bagus banget, maksudku. Jangan geer!', 'hmph'), L('y', 'Pemahamanmu sudah kuat. Kamu bisa menjelaskan ini ke orang lain sekarang.', 'happy')]
          : mid ? [L('s', 'Wah, sudah bagus lho! Tinggal dirapikan sedikit lagi!', 'happy'), L('n', 'Tidak buruk. Yang salah itu bisa dilatih lagi, kan? Latihanku selalu terbuka.', 'smug'), L('y', 'Kesalahanmu adalah petunjuk bagian mana yang perlu dibaca ulang. Tidak ada yang sia-sia.', 'calm')]
            : [L('s', 'Nggak apa-apa! Kita ulang bareng-bareng, aku temani!', 'happy'), L('y', 'Satu kali percobaan bukan ukuran kemampuanmu. Materi dan Simulasi bisa kamu buka kapan saja.', 'talk'), L('n', 'Jangan menyerah! Aku masih punya setumpuk soal... dan aku nggak akan kasihan, ya. Hmph!', 'angry')]),
        hi ? L('n', 'Cupcake-nya buat kalian semua. Yang paling besar buat kamu. Hmph, anggap saja bonus!', 'happy')
          : mid ? L('n', 'Cupcake-nya tetap ada, kok. Tapi untuk dapat dua, kamu harus latihan sekali lagi!', 'smug')
            : L('n', 'Cupcake-nya kusimpan dulu. Kita ulang belajarnya, baru kita makan bareng. Janji!', 'down'),
        L('s', 'Hari ini seru banget. Terima kasih sudah belajar bareng aku!', 'cheer'),
        L('m', 'Terima kasih sudah menemani kami sampai akhir cerita ini. Kamu tahu kan, kamu boleh kembali kapan pun. Sampai jumpa lagi!', 'wink')
      ];
    },
    card: panel => {
      const p = Story.prog(), r = p.ev ?? 0, g = GRADES.find(x => r >= x.min);
      panel.innerHTML = `<div class="startcard res"><h2>HASIL CERITA</h2><div class="rg"><div><b>${p.lat ?? '-'}</b>Latihan /8</div><div><b>${r * 10}</b>Evaluasi</div><div><b>${r / EVAL.length * 100}%</b>Benar</div></div><p class="grade">${g.t}</p><button class="btn" id="again">↻ MAIN CERITA LAGI</button></div>`;
      $('#again', panel).onclick = () => { Snd.sfx('select'); Story.start(true) };
    }
  },

  /* ----- komentar karakter lain di dalam tiap bagian (muncul kontekstual, bukan setiap baris) ----- */
  materi: {
    enter: [L('y', 'Aku ikut menemani. Kalau ada istilah teknis yang kurang jelas, aku siap menjelaskan lebih rinci.', 'talk'), L('n', 'Dan kalau Sayori salah ngomong, aku yang koreksi!', 'smug'), L('s', 'Heiii~! Aku nggak sesering itu salah kok!', 'pout')],
    pg: {
      0: [L('m', 'Rangkaian logika itu dasar hampir semua kontrol mesin yang pernah kamu lihat: PLC, sensor, interlock, semuanya.', 'calm')],
      1: [L('s', 'Eh, tunggu... jadi kalau inputnya dua, ada empat kombinasi, ya?', 'talk'), L('y', 'Benar: dua pangkat dua. Untuk tiga input, ada delapan kombinasi.', 'explain')],
      2: [L('y', 'Di dunia nyata, 0 dan 1 adalah tegangan rendah dan tinggi. Sinyal digital hanya peduli di sisi mana sebuah nilai berada.', 'explain'), L('n', 'Intinya: 0 itu mati, 1 itu hidup. Kalau sampai ketukar, kujewer!', 'angry')],
      3: [L('n', 'AND itu pelit: semua input harus 1, baru output ikut 1.', 'smug')],
      4: [L('s', 'OR itu baik hati! Satu aja yang hidup, hasilnya ikut hidup!', 'playful')],
      5: [L('m', 'NOT unik: satu-satunya gerbang dasar yang hanya punya satu input.', 'talk')],
      6: [L('y', 'NAND disebut gerbang universal: semua gerbang lain bisa dibangun hanya dari NAND.', 'explain'), L('s', 'Wow, satu gerbang bisa jadi semuanya? Keren~', 'shock')],
      7: [L('s', 'NOR itu NOT OR, ya? Jadi kebalikannya OR! ...aku sudah mulai hafal polanya, lho.', 'happy')],
      8: [L('n', 'XOR itu soal "beda atau sama?". Beda: nyala. Sama: mati. Gampang!', 'talk')],
      9: [L('y', 'XNOR hanya menyala jika kedua input sama. Cara mudah mengingatnya: ia lawan dari XOR.', 'explain'), L('n', 'Nah, itu baru ringkasan yang enak. Catat, Sayori!', 'happy')],
      10: [L('m', 'Tabel kebenaran adalah catatan lengkap semua kemungkinan. Di Simulasi nanti, tabelnya akan hidup di depan matamu.', 'happy')]
    },
    end: [L('m', 'Itu halaman terakhirnya. Kamu sudah melihat semua materi satu per satu.', 'happy'), L('s', 'Hore! Sekarang kita pindah ke Simulasi bareng Yuri!', 'cheer')]
  },
  sim: {
    enter: [L('s', 'Wah, ada lampunya! Boleh aku yang pencet duluan?', 'cheer'), L('y', 'Silakan. Klik kotak A atau B, lalu perhatikan LED-nya.', 'talk'), L('n', 'Lihat tabelnya dulu baru pencet. Jangan asal, kayak ngetik PIN sambil ngelamun.', 'smug'), L('m', 'Untuk melanjutkan cerita, cobalah minimal empat gerbang berbeda dan ubah input beberapa kali. Aku akan memberi tahu kalau sudah cukup.', 'calm')],
    gate: {
      AND: [L('n', 'AND: kalau ada satu saja yang 0, selesai. Mati.', 'smug')],
      OR: [L('s', 'OR itu kayak "mau es krim atau kue?" Dapat salah satu pun senang!', 'playful')],
      NOT: [L('m', 'Gerbang yang paling sederhana. Tapi hampir semua rangkaian membutuhkannya.', 'talk')],
      NAND: [L('n', 'Hei, NAND itu AND yang dibalik. Jawab cepat: kapan outputnya 0?', 'smug'), L('y', 'Hanya ketika A dan B sama-sama 1.', 'happy')],
      NOR: [L('s', 'NOR... jadi nyala cuma kalau semuanya mati? Aneh, tapi keren!', 'happy')],
      XOR: [L('m', 'XOR: "salah satu, tetapi tidak keduanya." Cermati bedanya dengan OR.', 'wink')],
      XNOR: [L('n', 'Kebalikan XOR. Sama-sama = nyala. Gampang, kan?', 'talk')]
    },
    ok: [L('m', 'Cukup! Kamu sudah mencoba cukup banyak gerbang dan input. Siap lanjut ke Latihan?', 'happy'), L('s', 'Yuk yuk! Natsuki udah nungguin tuh.', 'cheer')],
    need: (g, t) => `Syarat lanjut cerita: gerbang berbeda ${Math.min(g, 4)}/4 · ubah input ${Math.min(t, 6)}/6`
  },
  lat: {
    enter: [L('m', 'Latihan ini terdiri dari 8 soal acak. Tidak ada nilai jelek di sini, hanya kesempatan mengulang.', 'talk'), L('y', 'Kalau ragu, bayangkan tabel kebenarannya.', 'talk'), L('s', 'Semangat! Aku nonton dari sini, ya!', 'cheer'), L('n', 'Diam dan perhatikan, Sayori! ...Eh, maksudku, ikut semangatin aja boleh.', 'shy')],
    ok: [L('s', 'Yeay! Benar! Kamu keren banget!', 'cheer'), L('y', 'Jawaban yang tepat, dan alasannya juga sah.', 'happy'), L('m', 'Bagus. Itu jawaban yang matang.', 'happy')],
    bad: [L('s', 'Nggak apa-apa! Salah itu bagian dari belajar, kok.', 'happy'), L('y', 'Perhatikan petunjuknya: sering kali kuncinya satu pola sederhana.', 'talk'), L('m', 'Satu soal bukan penentu. Lanjut saja dengan tenang.', 'calm')],
    half: { good: [L('m', 'Setengah jalan dan hasilmu bagus. Pertahankan ritmenya.', 'happy')], bad: [L('y', 'Tidak masalah. Cobalah baca ulang soal sampai kata terakhir sebelum menjawab.', 'calm')] },
    end: s => [s >= 6 ? L('s', 'Kamu hebat! Aku bangga banget sama kamu!', 'cheer') : L('s', 'Capek ya? Tapi kamu sudah menyelesaikan satu set penuh. Itu keren!', 'happy'), L('m', 'Satu set penuh sudah kamu tuntaskan. Kalau siap, kita lanjut ke Evaluasi akhir.', 'talk')]
  },
  eval: {
    enter: [L('n', 'Evaluasi, ya? Kali ini nggak ada hint dariku. Jangan mengandalkan aku!', 'smug'), L('y', 'Bacalah tiap soal sampai selesai. Banyak kesalahan terjadi pada kata terakhir.', 'talk'), L('s', 'Tarik napas dulu~ Kamu pasti bisa!', 'playful')],
    half: [L('s', 'Sudah setengah! Sedikit lagi!', 'cheer'), L('y', 'Ritmemu bagus. Tetap fokus.', 'explain')],
    swap: [L('n', 'Yakin mau diganti? Hmph... terserah, itu hakmu.', 'grump')],
    end: s => [s >= 7 ? L('n', 'Hmph, bagus juga. Jangan senang dulu!', 'smug') : L('n', 'Masih bisa lebih baik. Aku tahu kamu bisa.', 'talk'), L('y', 'Apa pun hasilnya, proses yang kamu lalui hari ini berharga.', 'calm')]
  }
};

/* ---------- pengait ke scene (dipanggil dari app.js; semuanya [] / no-op bila Mode Cerita mati) ---------- */
const SL = {
  enter: k => Story.on ? ST[k].enter : [],
  materiPage: (p, first) => Story.on && first ? (ST.materi.pg[p] || []) : [],
  materiEnd: () => Story.on ? ST.materi.end : [],
  gate: (g, first) => Story.on && first ? ST.sim.gate[g] : [],
  lat: (k, a) => Story.on ? (k === 'ok' || k === 'bad' ? (Math.random() < .4 ? [pick(ST.lat[k])] : []) : k === 'half' ? ST.lat.half[a ? 'good' : 'bad'] : ST.lat.end(a)) : [],
  eval: (k, a) => Story.on ? (k === 'half' ? [pick(ST.eval.half)] : k === 'swap' ? (Math.random() < .5 ? ST.eval.swap : []) : ST.eval.end(a)) : []
};

/* ---------- tombol "lanjut cerita" yang muncul hanya setelah aktivitas wajib selesai ---------- */
Story.contBtn = (id, label = NEXT_LABEL[id]) => { const b = document.createElement('button'); b.className = 'btn big contstory'; b.textContent = label; b.onclick = () => { Snd.sfx('select'); Story.advance() }; return b };
Story.record = (k, v) => { const p = Story.prog(); p[k] = v; Story.save(p) };

SC.n_intro = () => narrScene('n_intro'); SC.n_1 = () => narrScene('n_1'); SC.n_2 = () => narrScene('n_2'); SC.n_3 = () => narrScene('n_3');
SC.n_end = () => { const p = Story.prog(); p.step = 0; p.done = true; Story.save(p); narrScene('n_end') };
