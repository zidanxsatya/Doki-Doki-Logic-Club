/* ===== story.js : MODE CERITA — Materi → Simulasi → Latihan → Evaluasi → akhir cerita, dengan keempat karakter =====
   Dua sistem tampilan (sengaja dipisah):
   - Diskusi edukasi : potret statis di kiri (assets/img/portraits, satu gambar per ekspresi) + area materi besar di kanan.
   - Adegan cerita   : sprite biasa, DIAM (tanpa idle/gerak), hanya ganti ekspresi dengan transisi halus.
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
const portSrc = (k, e) => `assets/img/portraits/${k}_${PORT[k][e] || 'neutral'}.webp`;
const preloadPortraits = () => Object.keys(PORT).forEach(k => new Set(Object.values(PORT[k])).forEach(n => { new Image().src = `assets/img/portraits/${k}_${n}.webp` }));

/* ---------- sprite diam: pose = frame terakhir animasi ekspresi (idle = frame pertama), tanpa loop ---------- */
function stillExpr(ch, e, fade = true) {
  const a = ch.actor, c = a.canvas, nm = ch.cfg.expr[e] || 'idle';
  const draw = () => { a.play(nm, { loop: false }); if (nm !== 'idle') a.tick(10); c.style.opacity = 1 };
  if (fade && c.dataset.on === '1') { c.style.opacity = 0; setTimeout(draw, 130) } else { draw(); c.dataset.on = '1' }
}

/* ---------- kemajuan cerita (localStorage: tkm_story) ---------- */
Story.prog = () => store.get(Story.key, { step: 0, done: false, lat: null, ev: null });
Story.save = p => store.set(Story.key, p);
Story.start = fresh => { const p = Story.prog(); if (fresh) { p.step = 0; Story.save(p) } Story.on = true; preloadPortraits(); go(STEPS[p.step]) };
Story.advance = () => { const p = Story.prog(); p.step = Math.min(p.step + 1, STEPS.length - 1); Story.save(p); Story.on = true; go(STEPS[p.step]) };
Story.index = () => STEPS.indexOf(Journey.last);
Story.menuSub = () => { const p = Story.prog(); return p.step > 0 ? `Lanjutkan: ${STEP_NAME[STEPS[p.step]]}` : p.done ? `Selesai · nilai ${p.ev * 10} · main lagi` : 'Belajar bareng semua karakter' };

/* ---------- potret kiri (layout diskusi edukasi) ---------- */
function makeCast(ptEl) {
  const img = $('img', ptEl), cast = {}; let cur = '';
  Object.keys(CHARS).forEach(k => cast[k] = {
    key: k, cfg: CHARS[k],
    setExpression(e) {
      const src = portSrc(k, e), who = ptEl.dataset.k !== k; if (src === cur) return; cur = src; ptEl.dataset.k = k;
      img.style.opacity = 0; img.style.transform = who ? 'translateX(-14px)' : 'translateX(0)';
      const n = new Image(); n.onload = n.onerror = () => { if (cur !== src) return; img.src = src; img.getBoundingClientRect(); img.style.opacity = 1; img.style.transform = 'none' }; n.src = src;
    }
  });
  return cast;
}

/* ---------- kerangka diskusi edukasi mode cerita (pengganti scaffold biasa, API sama) ---------- */
Story.scaffold = id => {
  const m = M[id], el = $('#scene'), n = STEPS.indexOf(id), tot = 4, no = [1, 3, 5, 7].indexOf(n) + 1;
  el.classList.add('story');
  el.innerHTML = `<div class="bg" data-b="${m.bg}" style="background-image:url(assets/img/${m.bg}.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>${m.label}</b><i class="hintc">Cerita ${no}/${tot} · klik potret untuk ngobrol</i></div><div id="panel" class="panel"></div><div class="pt"><img alt=""></div><div class="dlg"></div>`;
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
function narrScene(id) {
  const A = ST[id], el = $('#scene'), keys = ['sayori', 'yuri', 'natsuki', 'monika'], lines = typeof A.lines === 'function' ? A.lines() : A.lines;
  el.classList.add('narr');
  el.innerHTML = `<div class="bg" data-b="${A.bg}" style="background-image:url(assets/img/${A.bg}.png)"></div><div class="top"><button class="btn sm" id="back">◀ MENU</button><b>CERITA</b><i class="hintc">${A.title}</i></div>
  <div class="nar">${keys.map(k => `<div class="ns" data-k="${k}"></div>`).join('')}</div><div id="panel" class="panel npanel"></div><div class="dlg"></div><button class="btn big ngo" hidden>${A.go || 'LANJUT ▶'}</button>`;
  const cast = {};
  keys.forEach(k => {
    const ch = chars[k], c = ch.actor.canvas, slot = $(`.ns[data-k=${k}]`, el);
    c.style.height = `calc(${c.height * ch.cfg.sc}px * var(--ks))`; c.dataset.on = ''; slot.appendChild(c); stillExpr(ch, 'neutral', false);
    cast[k] = { key: k, cfg: ch.cfg, setExpression: e => stillExpr(ch, e) };
  });
  const d = new Dialogue($('.dlg', el), cast[lines[0][2]], cast); d.base = lines[0][2];
  d.onSpeaker = k => $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === k));
  const goBtn = $('.ngo', el); let finished = false;
  const done = () => { if (finished) return; finished = true; goBtn.hidden = false; if (A.card) A.card($('#panel', el)); goBtn.onclick = () => { Snd.sfx('select'); A.next ? A.next() : Story.advance() } };
  const watch = setInterval(() => { if (!d.typing && !d.q.length && d.shown) { done(); clearInterval(watch) } }, 200);
  d.say(lines, done);
  const back = () => { Snd.sfx('cancelMenu'); go('menu') };
  $('#back').onclick = back; document.onkeydown = e => { if (e.key === 'Escape') back() };
  $$('.ns', el).forEach(n => n.classList.toggle('on', n.dataset.k === lines[0][2]));
  el.classList.add('on');
  scene = { cleanup() { clearInterval(watch); d.destroy(); keys.forEach(k => { const c = chars[k].actor.canvas; c.style.height = c.height * CHARS[k].sc + 'px'; c.style.opacity = ''; c.remove() }); el.classList.remove('narr'); el.innerHTML = ''; document.onkeydown = null } };
}

/* =====================================================================================
   NASKAH CERITA
   ===================================================================================== */
const ST = {
  n_intro: {
    bg: 'DDLCbg', title: 'Klik kotak dialog untuk lanjut', go: 'MULAI BELAJAR: MATERI ▶',
    lines: [
      L('s', 'Akhirnyaaa kamu datang! Aku udah nungguin dari tadi, lho!', 'happy'),
      L('s', 'Hari ini ujian Teknik Kontrol Mekatronika, kan? Rangkaian logika... aku sendiri belum paham-paham amat, ehehe.', 'talk'),
      L('n', 'Belum paham?! Kamu bilang begitu sejak minggu lalu, tahu!', 'angry'),
      L('s', 'Habisnya angka 0 sama 1 itu bikin pusing~', 'sad'),
      L('m', 'Makanya hari ini klub sastra kita menyamar jadi Doki Doki Logic Club. Kita belajar bareng sampai kalian berdua siap.', 'talk'),
      L('y', 'Aku sudah menyusun urutannya: materi dasar dulu, lalu simulasi gerbang logika, latihan soal, dan terakhir evaluasi akhir.', 'explain'),
      L('n', 'Bagian latihan soal aku yang pegang! Jangan harap aku lembek, ya.', 'smug'),
      L('m', 'Urutannya rapi banget, ya? Seolah-olah ada yang sudah menyusun jalan ceritanya untuk kita. Ahaha, abaikan saja ucapanku barusan.', 'wink'),
      L('s', 'Pokoknya aku di sampingmu! Ayo mulai dari Materi!', 'cheer')
    ]
  },
  n_1: {
    bg: 'DDLCbg', title: 'Materi selesai', go: 'KE SIMULASI ▶',
    lines: [
      L('y', 'Seluruh materinya sudah kamu lewati. Dasar seperti itu sering diremehkan, padahal semuanya bertumpu di sana.', 'happy'),
      L('s', 'Aku juga ngerasa makin paham! ...mungkin. Sedikit.', 'happy'),
      L('n', 'Sedikit? Hmph. Tapi ya, lumayan lah.', 'smug'),
      L('y', 'Bagian berikutnya favoritku: Simulasi. Kamu bisa mengubah input dan melihat sendiri bagaimana tiap gerbang bereaksi.', 'explain'),
      L('m', 'Kali ini bukan sekadar membaca. Kamu yang menekan tombolnya. Ayo ke Simulasi!', 'talk')
    ]
  },
  n_2: {
    bg: 'Music_Room', title: 'Simulasi selesai', go: 'KE LATIHAN ▶',
    lines: [
      L('n', 'Oke, sudah puas mainin gerbang? Sekarang giliranku menguji kemampuanmu!', 'smug'),
      L('s', 'Aduh, deg-degan...', 'sad'),
      L('y', 'Tenang. Tadi kamu sudah melihat pola tiap gerbang sendiri. Kalau ragu, bayangkan tabel kebenarannya.', 'talk'),
      L('m', 'Latihan itu tempat yang boleh salah. Jawabanmu juga masih bisa diganti sebelum dicek.', 'happy'),
      L('n', 'Bukan berarti boleh asal-asalan, ya! Ayo mulai!', 'hmph')
    ]
  },
  n_3: {
    bg: 'Music_Room', title: 'Latihan selesai', go: 'KE EVALUASI AKHIR ▶',
    lines: [
      L('m', 'Latihan selesai. Sekarang bagian yang paling kutunggu: Evaluasi akhir.', 'talk'),
      L('s', 'Kamu pasti bisa! Aku sudah siapin permen keberuntungan!', 'cheer'),
      L('n', 'Permen apanya... Tapi, ya, jangan gugup. Kamu sudah jauh lebih baik dibanding tadi pagi. B-bukan berarti aku khawatir, ya!', 'hmph'),
      L('y', 'Sepuluh soal, tanpa petunjuk. Tapi kamu sudah membawa semua bekalnya.', 'shy'),
      L('m', 'Setelah ini, cerita kita sampai ke ujungnya. Kerjakan dengan tenang, ya.', 'wink')
    ]
  },
  n_end: {
    bg: 'DDLCbg', title: 'Akhir cerita', go: 'KEMBALI KE MENU',
    next: () => { Story.on = false; go('menu') },
    lines: () => {
      const p = Story.prog(), r = p.ev ?? 0, N = EVAL.length, hi = r >= 8, mid = r >= 5, g = GRADES.find(x => r >= x.min);
      return [
        L('m', `Evaluasi akhirmu: ${r} dari ${N} benar, nilai ${r * 10}. Kategorinya "${g.t}".`, hi ? 'cheer' : 'talk'),
        ...(hi ? [L('s', 'Tuh kaaan! Aku bilang juga apa! Kamu hebat banget!!', 'cheer'), L('n', 'Hmph... lumayan. Eh, bagus. Bagus banget, maksudku. Jangan geer!', 'hmph'), L('y', 'Pemahamanmu sudah kuat. Kamu bisa menjelaskan ini ke orang lain sekarang.', 'happy')]
          : mid ? [L('s', 'Wah, sudah bagus lho! Tinggal dirapikan sedikit lagi!', 'happy'), L('n', 'Tidak buruk. Yang salah itu bisa dilatih lagi, kan? Latihanku selalu terbuka.', 'smug'), L('y', 'Kesalahanmu adalah petunjuk bagian mana yang perlu dibaca ulang. Tidak ada yang sia-sia.', 'explain')]
            : [L('s', 'Nggak apa-apa! Kita ulang bareng-bareng, aku temani!', 'happy'), L('y', 'Satu kali percobaan bukan ukuran kemampuanmu. Materi dan Simulasi bisa kamu buka kapan saja.', 'talk'), L('n', 'Jangan menyerah! Aku masih punya setumpuk soal... dan aku nggak akan kasihan, ya. Hmph!', 'angry')]),
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
    enter: [L('y', 'Aku ikut menemani. Kalau ada istilah teknis yang kurang jelas, aku siap menjelaskan lebih rinci.', 'talk'), L('n', 'Dan kalau Sayori salah ngomong, aku yang koreksi!', 'smug'), L('s', 'Heiii~! Aku nggak sesering itu salah kok!', 'sad')],
    pg: {
      0: [L('m', 'Rangkaian logika itu dasar hampir semua kontrol mesin yang pernah kamu lihat: PLC, sensor, interlock, semuanya.', 'talk')],
      1: [L('s', 'Eh, tunggu... jadi kalau inputnya dua, ada empat kombinasi, ya?', 'talk'), L('y', 'Benar: dua pangkat dua. Untuk tiga input, ada delapan kombinasi.', 'explain')],
      2: [L('y', 'Di dunia nyata, 0 dan 1 adalah tegangan rendah dan tinggi. Sinyal digital hanya peduli di sisi mana sebuah nilai berada.', 'explain'), L('n', 'Intinya: 0 itu mati, 1 itu hidup. Kalau sampai ketukar, kujewer!', 'angry')],
      3: [L('n', 'AND itu pelit: semua input harus 1, baru output ikut 1.', 'smug')],
      4: [L('s', 'OR itu baik hati! Satu aja yang hidup, hasilnya ikut hidup!', 'cheer')],
      5: [L('m', 'NOT unik: satu-satunya gerbang dasar yang hanya punya satu input.', 'talk')],
      6: [L('y', 'NAND disebut gerbang universal: semua gerbang lain bisa dibangun hanya dari NAND.', 'explain'), L('s', 'Wow, satu gerbang bisa jadi semuanya? Keren~', 'cheer')],
      8: [L('n', 'XOR itu soal "beda atau sama?". Beda: nyala. Sama: mati. Gampang!', 'talk')],
      10: [L('m', 'Tabel kebenaran adalah catatan lengkap semua kemungkinan. Di Simulasi nanti, tabelnya akan hidup di depan matamu.', 'happy')]
    },
    end: [L('m', 'Itu halaman terakhirnya. Kamu sudah melihat semua materi satu per satu.', 'happy'), L('s', 'Hore! Sekarang kita pindah ke Simulasi bareng Yuri!', 'cheer')]
  },
  sim: {
    enter: [L('s', 'Wah, ada lampunya! Boleh aku yang pencet duluan?', 'cheer'), L('y', 'Silakan. Klik kotak A atau B, lalu perhatikan LED-nya.', 'talk'), L('n', 'Lihat tabelnya dulu baru pencet. Jangan asal, kayak ngetik PIN sambil ngelamun.', 'smug'), L('m', 'Untuk melanjutkan cerita, cobalah minimal empat gerbang berbeda dan ubah input beberapa kali. Aku akan memberi tahu kalau sudah cukup.', 'talk')],
    gate: {
      AND: [L('n', 'AND: kalau ada satu saja yang 0, selesai. Mati.', 'smug')],
      OR: [L('s', 'OR itu kayak "mau es krim atau kue?" Dapat salah satu pun senang!', 'happy')],
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
    enter: [L('m', 'Latihan ini terdiri dari 8 soal acak. Tidak ada nilai jelek di sini, hanya kesempatan mengulang.', 'talk'), L('y', 'Kalau ragu, bayangkan tabel kebenarannya.', 'talk'), L('s', 'Semangat! Aku nonton dari sini, ya!', 'cheer'), L('n', 'Diam dan perhatikan, Sayori! ...Eh, maksudku, ikut semangatin aja boleh.', 'hmph')],
    ok: [L('s', 'Yeay! Benar! Kamu keren banget!', 'cheer'), L('y', 'Jawaban yang tepat, dan alasannya juga sah.', 'happy'), L('m', 'Bagus. Itu jawaban yang matang.', 'happy')],
    bad: [L('s', 'Nggak apa-apa! Salah itu bagian dari belajar, kok.', 'happy'), L('y', 'Perhatikan petunjuknya: sering kali kuncinya satu pola sederhana.', 'talk'), L('m', 'Satu soal bukan penentu. Lanjut saja dengan tenang.', 'talk')],
    half: { good: [L('m', 'Setengah jalan dan hasilmu bagus. Pertahankan ritmenya.', 'happy')], bad: [L('y', 'Tidak masalah. Cobalah baca ulang soal sampai kata terakhir sebelum menjawab.', 'talk')] },
    end: s => [s >= 6 ? L('s', 'Kamu hebat! Aku bangga banget sama kamu!', 'cheer') : L('s', 'Capek ya? Tapi kamu sudah menyelesaikan satu set penuh. Itu keren!', 'happy'), L('m', 'Satu set penuh sudah kamu tuntaskan. Kalau siap, kita lanjut ke Evaluasi akhir.', 'talk')]
  },
  eval: {
    enter: [L('n', 'Evaluasi, ya? Kali ini nggak ada hint dariku. Jangan mengandalkan aku!', 'smug'), L('y', 'Bacalah tiap soal sampai selesai. Banyak kesalahan terjadi pada kata terakhir.', 'talk'), L('s', 'Tarik napas dulu~ Kamu pasti bisa!', 'cheer')],
    half: [L('s', 'Sudah setengah! Sedikit lagi!', 'cheer'), L('y', 'Ritmemu bagus. Tetap fokus.', 'talk')],
    swap: [L('n', 'Yakin mau diganti? Hmph... terserah, itu hakmu.', 'hmph')],
    end: s => [s >= 7 ? L('n', 'Hmph, bagus juga. Jangan senang dulu!', 'smug') : L('n', 'Masih bisa lebih baik. Aku tahu kamu bisa.', 'talk'), L('y', 'Apa pun hasilnya, proses yang kamu lalui hari ini berharga.', 'happy')]
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
