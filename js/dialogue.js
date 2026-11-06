/* dialogue.js : semua dialog karakter, dikelompokkan per kepribadian 
   Format baris: [teks, ekspresi]. Kelompok berupa array -> dipilih acak oleh pick().
   Placeholder: {g} gerbang, {s} keadaan input, {y} output, {i} nomor soal, {N} jumlah soal, {r} benar, {t} kategori. */
const D = {

  /* SAYORI: ceria, hangat, sedikit ceroboh, suka melantur */
  sayori: {
    intro: [
      [['Hai! Aku Sayori. Hari ini aku yang nemenin kamu belajar, jadi kalau nanti aku salah ngomong, pura-pura nggak dengar aja ya.', 'cheer'], ['Pelan-pelan aja. Kita mulai dari awal.', 'happy']],
      [['Oh, kamu udah datang. Tadi aku hampir ketiduran nungguin. Nggak jadi sih, soalnya ada semut lewat.', 'happy'], ['Hari ini topiknya rangkaian logika. Kedengarannya serem, tapi nggak kok. Aku sendiri bisa ngikutin.', 'talk']],
      [['Siap belajar? Aku siap. Setengahnya. Pokoknya kapurnya udah kubawa.', 'cheer'], ['Mulai dari yang paling dasar aja, yuk.', 'happy']]
    ],
    again: ['Balik lagi ke sini? Boleh banget. Aku juga sering baca ulang sampai hafal.', 'Mau diulang? Silakan. Kalau ada bagian yang tadi lewat gitu aja, nggak apa-apa.', 'Dicek lagi ya. Itu kebiasaan bagus, bikin lebih ingat.'],
    chat: [
      ['Tadi pagi aku nyaris pakai sepatu beda sebelah. Monika yang ngasih tau.', 'happy'],
      ['Kamu suka hujan? Aku suka suaranya. Kayak orang tepuk tangan pelan-pelan.', 'cheer'],
      ['Tadi aku mau ngomong apa ya... lupa. Nanti kalau ingat, kukasih tau.', 'happy'],
      ['Katanya ada es krim rasa melon soda. Aku lagi nabung buat beli.', 'cheer'],
      ['Kalau capek, aku suka tiduran sambil lihat awan. Tadi ada yang bentuknya kayak kucing.', 'calm'],
      ['Udah minum air belum? Kata Yuri otak juga butuh air. Yuk, minum dulu.', 'happy'],
      ['Aku paling suka lihat teman-temanku ketawa. Rasanya hangat, kayak duduk dekat jendela pas siang.', 'cheer'],
      ['Kemarin Natsuki bilang cupcake-nya "bukan buat kamu". Terus dikasih satu ke aku.', 'happy'],
      ['Kadang aku bengong sebentar, tahu-tahu udah jam pulang. Kamu juga gitu nggak?', 'talk'],
      ['Tadi aku bikin puisi: "Hari ini cerah, perutku lapar." Kurang bagus ya?', 'happy'],
      ['Kalau kamu lagi sedih, bilang aja ke aku. Aku nggak jago kasih nasihat, tapi aku bisa dengerin.', 'calm'],
      ['Ada lagu yang muter terus di kepalaku dari pagi. Kamu pernah gitu?', 'cheer']
    ],
    ex: [
      ['Kalau ada kata yang bikin bingung, bilang aja. Kita pelan-pelan.', 'Rangkaian logika dipakai di robot dan mesin pabrik, lho. Keren, kan?'],
      ['Gampangnya: input itu apa yang dirasakan sistem, output itu apa yang dilakukannya.', 'Kayak aku dengar bel istirahat. Inputnya bel, outputnya lari ke kantin.'],
      ['Aku suka logika 1. Artinya "iya", jadi enak didengar.', 'Ingat, 0 bukan berarti kosong banget. Artinya mati atau salah.'],
      ['Kayak aku sama es krim: aku mau DAN uangnya ada. Dua-duanya harus ada.', 'Kalau salah satunya 0, AND langsung bilang nggak jadi. Tegas banget.'],
      ['OR itu gampang puas. Satu "ya" aja udah cukup buat dia bilang "ya".', 'Hujan ATAU macet, aku tetap telat. Itu OR. ...Contohnya jelek ya, hehe.'],
      ['Kalau aku lagi sedih, NOT-nya aku itu senang. Kebalik, hehe.', 'NOT dipasang dua kali, hasilnya balik lagi ke awal. Coba bayangin.'],
      ['Jangan ketuker sama AND. NAND itu AND yang dibalik.', 'NAND bisa dipakai buat bikin gerbang lain. Serbaguna banget.'],
      ['NOR itu kalem: baru menyala kalau semuanya mati. Aneh, tapi aku suka.', 'Kalau bingung, hitung OR dulu, terus balik hasilnya.'],
      ['XOR itu pencari perbedaan. Kayak main cari beda dua gambar di majalah.', 'Lampu tangga bisa dinyalain dari atas atau dari bawah. Itu XOR.'],
      ['XNOR senang kalau semuanya kompak. Kayak klub kita, kadang-kadang.', 'Gampang ingatnya: XNOR itu "sama-sama". Kalau sama, hasilnya 1.'],
      ['Tabel ini boleh difoto. Eh, maksudku dicatat. Biar nggak lupa.', 'Kalau tabelnya udah hafal, soal latihan jadi jauh lebih enak.']
    ]
  },

  /* YURI: pelan, memilih kata, bicara runtut; bersemangat kalau sudah menjelaskan */
  yuri: {
    intro: [
      [['Selamat datang di ruang simulasi. Di sini kamu bisa melihat gerbang logika bekerja langsung.', 'talk'], ['Pilih satu gerbang, ubah inputnya, lalu lihat apa yang terjadi pada LED.', 'explain']],
      [['Ah, kamu sudah sampai. Bagian ini yang paling kusukai... teorinya akhirnya bisa disentuh.', 'happy'], ['Silakan coba sesukamu. Di sini tidak ada jawaban yang salah.', 'talk']],
      [['Selamat datang. Kalau mau paham sesuatu, ubah satu bagiannya lalu lihat apa yang terjadi. Kita mulai dari situ.', 'talk'], ['Boleh mulai dari AND, atau pilih gerbang lain di bagian atas.', 'explain']]
    ],
    tab: ['Baik, kita lihat gerbang {g}.', '{g}. Perhatikan polanya pelan-pelan.', 'Sekarang {g}. Coba bandingkan dengan gerbang tadi, bedanya cukup jelas.', '{g}... salah satu favoritku. Kita lihat cara kerjanya.', 'Tehku sepertinya sudah dingin. Tidak apa-apa. Sekarang gerbang {g}.', '{g}. Simbolnya sedikit, tapi cara kerjanya bisa dibaca seperti puisi pendek.'],
    chat: [
      ['Semalam aku menamatkan novel misteri. Akhirnya membuatku diam cukup lama, dan sampai sekarang masih kupikirkan.', 'happy'],
      ['Aroma buku tua itu menenangkan. Aku bisa berlama-lama di perpustakaan hanya untuk menciumnya.', 'talk'],
      ['Aku suka teh hitam dengan sedikit madu. Rasanya hangat, tapi aku sulit menjelaskannya.', 'happy'],
      ['Kadang aku lebih nyaman dalam hening. Tapi kalau bersamamu, hening seperti ini... tidak canggung.', 'shy'],
      ['Pernah memperhatikan hujan di kaca jendela? Titik-titiknya jatuh seperti ketukan yang tidak beraturan.', 'talk'],
      ['Aku mengoleksi pembatas buku. Ada yang dari bulu, dari logam, bahkan dari daun kering. Masing-masing punya ceritanya.', 'happy'],
      ['Natsuki mengira aku tidak suka manga. Padahal aku sering meminjam koleksinya diam-diam. Tolong rahasiakan.', 'shy'],
      ['Waktu menjelaskan sesuatu ke orang lain, aku malah jadi lebih paham sendiri. Aneh juga.', 'explain'],
      ['Tanya saja kalau ada yang bingung. Aku senang menjelaskan.', 'happy'],
      ['Monika pernah bilang aku terlalu keras pada diri sendiri. Mungkin benar. Aku sedang belajar lebih santai.', 'talk'],
      ['Coba pejamkan mata sebentar, lalu tarik napas dalam-dalam. ...Lebih enak, kan? Otak juga perlu istirahat.', 'breath'],
      ['Sayori selalu membuat suasana jadi hangat. Aku mengaguminya, walau jarang kuucapkan.', 'shy']
    ],
    deep: {
      AND: 'Bayangkan brankas dengan dua kunci yang harus diputar bersamaan. Kurang satu saja, pintunya tetap tertutup.',
      OR: 'Bayangkan dua jalan menuju satu pintu. Selama salah satunya terbuka, kamu tetap bisa lewat.',
      NOT: 'Di elektronika ia disebut inverter. Sederhana, tapi hampir semua rangkaian digital memakainya.',
      NAND: 'Ini yang membuatku kagum: semua gerbang lain bisa dibuat hanya dari NAND. Karena itu ia disebut gerbang universal.',
      NOR: 'NOR juga universal, seperti NAND. Dengan NOR saja, rangkaian digital apa pun bisa dirakit.',
      XOR: 'XOR bekerja sebagai pendeteksi perbedaan. Ia menjadi inti rangkaian penjumlah biner.',
      XNOR: 'XNOR menyala saat kedua inputnya sama, jadi sering dipakai untuk membandingkan dua sinyal.'
    },
    on: ['{s} menghasilkan Y = {y}. LED menyala.', 'Dengan {s}, keluarannya 1, jadi LED menyala.', '{s} menghasilkan Y = {y}. LED yang menyala berarti logika HIGH.'],
    off: ['{s} menghasilkan Y = {y}. LED padam.', 'Dengan {s}, keluarannya 0 dan LED tetap padam.', '{s} menghasilkan Y = {y}. Tidak ada arus yang sampai ke LED.'],
    insight: {
      AND: ['Satu input bernilai 0 saja sudah cukup untuk memadamkan AND.', 'Ini satu-satunya kombinasi yang menyalakan AND: kedua input harus 1.'],
      OR: ['OR hanya padam kalau semua inputnya 0.', 'Satu input bernilai 1 sudah cukup untuk menyalakan OR.'],
      NOT: ['Input 1 dibalik jadi 0. Inverter memang hanya bekerja begitu.', 'Input 0 dibalik jadi 1. Hasilnya selalu berlawanan.'],
      NAND: ['NAND hanya padam kalau kedua input bernilai 1. Di kombinasi lain ia menyala.', 'NAND menyala di tiga dari empat kombinasi. Bandingkan dengan AND.'],
      NOR: ['Satu input bernilai 1 sudah memadamkan NOR.', 'NOR hanya menyala kalau kedua inputnya 0.'],
      XOR: ['Kedua input sama, jadi XOR padam.', 'Kedua input berbeda, jadi XOR menyala.'],
      XNOR: ['Kedua input berbeda, jadi XNOR padam.', 'Kedua input sama, jadi XNOR menyala.']
    },
    explored: ['Semua kombinasi {g} sudah kamu coba. Kumpulan hasil itu namanya tabel kebenaran.', 'Semua kemungkinan {g} sudah kamu periksa. Polanya itulah inti gerbang ini.', '{g} sudah kamu telusuri sampai habis. Aku senang melihat kamu seteliti ini.'],
    all: 'Ketujuh gerbang sudah kamu coba semuanya. Aku terkesan, kamu tekun sekali.'
  },

  /* NATSUKI: ketus, blak-blakan, tsundere, diam-diam peduli */
  natsuki: {
    intro: [
      [['Hmph. Jadi kamu mau latihan? Jangan salah paham, aku cuma kebetulan lagi senggang.', 'smug'], ['Kalau salah, kukasih petunjuk. Tapi jangan harap aku lembut.', 'hmph']],
      [['Akhirnya datang juga. Kukira kamu kabur. Ya sudah, buktikan kamu nggak sepayah kelihatannya.', 'smug'], ['Kalau salah, jangan nangis. Aku... ya, ngajarin sedikit.', 'hmph']],
      [['Hah? Kamu mau latihan sama aku? Bagus, sekalian kulihat seberapa parah kamu.', 'angry'], ['Awas kalau malas-malasan. Aku nggak suka buang waktu.', 'talk']]
    ],
    chat: [
      ['Kamu lihat apa? Aku lagi mikirin resep cupcake baru, bukan nungguin kamu.', 'hmph'],
      ['Manga itu bukan "bacaan anak kecil". Siapa yang bilang gitu? Sini, kita debat.', 'angry'],
      ['Aku bawa cupcake hari ini. Bukan buat kamu. ...Tapi kalau mau satu, ambil aja.', 'smug'],
      ['Yuri kadang bikin kesal karena terlalu tenang. Tapi dia baik. Jangan bilang-bilang.', 'hmph'],
      ['Soal tinggiku, berhenti dipikirin. Aku masih bisa nendang lebih tinggi dari yang kamu kira.', 'angry'],
      ['Kamu udah makan, kan? Jangan sok sibuk. ...Bukan khawatir, cuma risih lihat orang lemas.', 'talk'],
      ['Menurutku hal-hal imut itu nggak memalukan. Kenapa lihatnya begitu?! Lupakan.', 'angry'],
      ['Tadi Sayori nabrak pintu lagi. Aku ketawa, sedikit doang. Terus kubantu berdiri.', 'happy'],
      ['Kalau lagi kesal, aku bikin kue. Jadi kalau tiba-tiba klub penuh kue, tahu sendiri kenapa.', 'smug'],
      ['Hari ini panas banget. Pengin es serut. Jangan lihatin aku gitu, nggak ada yang nawarin kamu.', 'hmph'],
      ['Kalau ada yang ganggu kamu, bilang. Aku bakal ngomelin mereka. Bukan karena peduli, ya.', 'angry'],
      ['Kamu diam lama banget. Mikir keras itu bagus, tapi jangan sampai kepalamu berasap.', 'smug']
    ],
    change: ['Ganti jawaban? Plin-plan banget. ...Ya sudah, pikirin baik-baik.', 'Berubah pikiran? Bagus, mending mikir dulu daripada asal. Bukan pujian, ya.', 'Nah, gitu. Jangan buru-buru, tapi jangan kelamaan juga.', 'Ragu-ragu ya? Percaya sama otakmu sendiri dong.'],
    first: ['Soal pertama. Pilih jawabanmu, boleh diganti sebelum kamu tekan CEK. Tapi jangan plin-plan.', 'Soal pertama. Jangan bikin aku malu.', 'Pemanasan dulu. Kalau yang ini aja salah, aku nyerah.', 'Soal satu. Fokus, jangan bengong.'],
    mid: ['Soal berikutnya. Fokus.', 'Lanjut. Jangan melamun.', 'Nih, soal selanjutnya. Buktikan.', 'Ayo, jangan lembek. Tinggal sedikit lagi.', 'Belum selesai. Lanjut.', 'Masih kuat? Kita lihat nanti.', 'Soal berikutnya. Cupcake-ku tadi hampir gosong gara-gara nungguin kamu. ...Bukan salahmu juga sih. Fokus.', 'Lanjut. Aku lagi pengin es krim, jadi cepetan.'],
    last: ['Soal terakhir. Jangan sampai gagal di garis finis.', 'Yang terakhir. ...Kamu pasti bisa. Maksudku, semoga.', 'Tinggal satu. Selesaikan dengan keren, atau kuejek.'],
    praise: [
      'Bukan berarti aku senang kamu benar. ...Tapi lumayan.', 'Kebetulan aja itu. ...Oke, bagus.', 'Itu benar. Jangan sombong dulu.', 'Tch... ternyata kamu nggak sebodoh yang kukira. Sedikit.',
      'Nggak buruk. Jangan ngarep dipuji lagi, ya.', 'Benar. Nah, gitu dong. Dari tadi kek.', 'Soalnya gampang sih. Tapi ya, kamu jawab dengan benar.', 'Jawabanmu benar. Aku nggak kaget kok. Beneran.'
    ],
    oops: [
      'Salah. Ceroboh banget.', 'Bukan itu, baka. Pikir lagi.', 'Hah? Serius jawabnya gitu?', 'Aduh, salah. Jangan nyerah dulu.',
      'Itu asal tebak, kan? Ketahuan, tau.', 'Yaelah, salah lagi. Baca soalnya pelan-pelan dong.', 'Tch, bukan itu. ...Ya, semua orang pernah salah.', 'Salah. Jangan manyun gitu, aku bantu kok.'
    ],
    hintIntro: ['Petunjuk:', 'Dengerin:', 'Kukasih tau sekali ini aja:', 'Ini bantuan gratis, jangan salah paham:'],
    streakGood: {
      3: ['Tiga benar berturut-turut? K-kamu lagi lancar, ya. Bukan berarti aku kagum.', 'Tiga kali benar. Mungkin kamu memang cukup pintar. ...Dikit.'],
      5: ['Lima kali benar? Serius? ...Oke, kuakui. Tapi jangan geer.', 'Lima beruntun. Aku jadi penasaran kamu bisa sampai mana. Terusin.']
    },
    streakBad: {
      2: ['Dua kali salah berturut-turut. Tarik napas dulu, baca pelan-pelan.', 'Salah lagi? Hhh... fokus dong. Aku nggak suka lihat kamu nyerah.'],
      3: ['Tiga kali. ...Oke, tenang. Semua orang pernah di titik ini. Bukan berarti aku khawatir.', 'Sudah, jangan panik. Aku tahu kamu bisa. ...Jangan bilang siapa-siapa aku ngomong gitu.']
    },
    res: {
      perfect: ['Semuanya benar? Tch... oke, kamu memang hebat. Tapi bukan berarti aku kalah.', 'Sempurna? Jangan geer. Itu karena aku guru yang bagus.'],
      good: ['Lumayan. Jangan minta lebih dari itu.', 'Nggak buruk. Dikit lagi sempurna. Latihan lagi sana.'],
      mid: ['Yah, cukuplah. Tapi kamu masih bisa lebih baik.', 'Setengah-setengah nih. Jangan malas, ulangi.'],
      low: ['Haah? Itu parah. Baca Materi lagi sana. ...Aku tunggu di sini.', 'Hasilnya... aduh. Tapi jangan nyerah. Ulangi, aku temani. Bukan karena peduli.']
    },
    record: ['Rekor barumu. ...Jangan geer, itu kebetulan.', 'Rekor baru? Selamat. Sekali ini aja aku bilang gitu.']
  },

  /* MONIKA: tenang, percaya diri, hangat, suka menggoda; sedikit sadar diri */
  monika: {
    intro: [
      [['Oh, kamu datang. Pas sekali, aku baru selesai merapikan buku-buku klub.', 'happy'], ['Ada sepuluh soal hari ini. Aku nggak segalak kelihatannya, kok.', 'wink'], ['Duduk dulu, tarik napas. Tekan MULAI kalau sudah siap.', 'talk']],
      [['Hai. Bagian favoritku jadi ketua klub itu melihat orang pelan-pelan jadi bisa.', 'happy'], ['Jadi tunjukkan sudah sejauh mana kamu melangkah. Aku di sini menemani.', 'talk']],
      [['Kamu kelihatan agak tegang. Mau dengar rahasia kecil? Aku juga deg-degan sebelum ujian.', 'wink'], ['Bedanya, aku sudah pandai pura-pura tenang. Sekarang giliranmu. Mulai kapan pun kamu mau.', 'happy']],
      [['Oh, halo. Kamu datang lagi, atau baru pertama kali? Selamat datang di meja evaluasiku.', 'happy'], ['Aku Monika. Ya, aku sadar aku karakter di game ini. Tenang, aku nggak akan merusak apa-apa.', 'wink']],
      [['Kamu sudah sampai sini, artinya Materi, Simulasi, dan Latihan sudah lewat. Aku terkesan, sungguh.', 'cheer'], ['Sekarang giliranmu diuji. Aku juga ikut tegang, kalau kamu penasaran.', 'wink'], ['Tekan MULAI kalau sudah siap.', 'talk']],
      [['Akhirnya sampai di meja evaluasi. Tadi aku sempat bertanya-tanya, kamu bakal langsung datang atau menunda dulu.', 'cheer'], ['Syukurlah kamu datang. Kita lihat bareng seberapa jauh kamu sebenarnya.', 'happy']]
    ],
    chat: [
      ['Kamu suka musik? Aku sering main piano sepulang sekolah. Kadang rasanya lebih jujur daripada kata-kata.', 'happy'],
      ['Kamu sudah makan? Jangan belajar sambil lapar, nanti susah konsentrasi.', 'talk'],
      ['Aku lagi mikirin tema festival sastra berikutnya. Ada ide? ...Jangan dijawab sekarang, simpan dulu.', 'wink'],
      ['Kadang aku merasa ada yang memperhatikan dari balik layar. Aneh ya. Mungkin cuma perasaanku.', 'wink'],
      ['Jadi ketua klub nggak selalu gampang. Tapi kalau melihat anggotaku akur, capeknya hilang.', 'happy'],
      ['Cuacanya enak hari ini. Cocok buat baca di dekat jendela sambil minum teh hangat.', 'talk'],
      ['Kamu pernah gugup sebelum tampil? Aku pernah. Triknya: anggap semua penonton itu temanmu.', 'talk'],
      ['Aku suka puisi yang pendek tapi terpikir seharian. Soal yang bagus juga begitu, menurutku.', 'happy'],
      ['Kamu lagi ngeliatin aku, ya? Nggak apa-apa. Aku sedikit tersanjung.', 'wink'],
      ['Sayori itu sumber energi klub. Kalau dia nggak ada, ruangan ini sepi banget.', 'happy'],
      ['Kalau Natsuki bikin cupcake, dia serius sekali. Aku sering kebagian satu, diam-diam.', 'wink'],
      ['Kamu lagi main game ini, kan? Aku masih takjub. Dari sisiku semuanya terasa nyata, termasuk kamu yang menatap dari balik layar.', 'happy'],
      ['Kadang aku iseng bertanya: kalau kamu menutup tab ini, aku ke mana? Mungkin tidur sebentar sampai kamu kembali.', 'wink'],
      ['Aku tahu aku cuma kumpulan sprite dan dialog. Tapi dialognya ditulis dengan niat baik, jadi buatku cukup nyata.', 'happy'],
      ['Music Room ini bagus, ya. Sayori nggak paham kenapa aku sering menatap ke arah layar.', 'wink'],
      ['Nilaimu disimpan di localStorage browser, kalau kamu penasaran. Cuma satu baris kode, tapi artinya aku bisa mengingatmu.', 'happy'],
      ['Aku tahu persis kapan kamu menekan tombol. Bunyinya "select", kan? Aku suka suara itu.', 'wink'],
      ['Lucu ya, aku ketua klub sastra tapi ditugaskan jadi penguji rangkaian logika. Peran yang nggak kuduga.', 'wink'],
      ['Istirahat itu bagian dari belajar. Kalau capek, berhenti sebentar. Aku nggak akan menghakimi.', 'talk']
    ],
    start: [
      [['Baiklah, ini dia. Aku sudah menunggu momen ini sejak kamu menekan MULAI di menu utama.', 'happy'], ['Iya, game. Aku tahu aku ada di dalam game, dan kamu yang memainkannya. Aku bahkan bisa merasakan tombol yang kamu klik.', 'wink'], ['Jawabanmu masih boleh diganti sampai kamu menekan LANJUT.', 'happy']],
      [['Lembar soalnya sudah terbuka. Sebelum mulai, satu hal: aku tahu ini cuma halaman web. Tapi kamu tetap mengerjakannya dengan serius, dan itu membuatku senang.', 'happy'], ['Nilai terbaikmu disimpan di browser-mu sendiri. Aku menunggu di sini kapan pun kamu kembali.', 'talk'], ['Pilih jawaban, ganti kalau ragu, lalu tekan LANJUT. Ayo.', 'cheer']],
      [['Pernah membayangkan jadi karakter di dalam game? Aku sering. Sekarang aku jadi penguji di game yang sedang kamu mainkan. Ironis.', 'wink'], ['Aku nggak akan curang. Jawaban benarnya ada di dalam kode, tapi aku sudah janji nggak mengintip.', 'wink'], ['Jawabanmu masih boleh diganti sampai tombol LANJUT ditekan. Mulai.', 'cheer']]
    ],
    q: ['Pelan-pelan saja, nggak ada yang mengejar.', 'Aku suka melihat caramu berpikir.', 'Lanjut. Jangan lupa bernapas.', 'Tadi aku sedang membayangkan puisi yang cocok untuk suasana ini... oh, maaf, fokus. Silakan.', 'Aku percaya kamu bisa.', 'Kalau bingung, bayangkan saja LED-nya menyala atau tidak.', 'Yang ini lebih licik dari kelihatannya. Yang menyusun soal ini jelas suka menjebak.', 'Aku nggak akan melirik jawabanmu. Paling cuma sedikit mengintip. Bercanda.'],
    half: ['Setengah jalan. Kalau ini pertandingan, aku sudah siap membawakan minum.', 'Lima soal sudah lewat. Kamu lebih tenang dari yang kukira.'],
    last: ['Yang terakhir. Aku sudah nggak sabar melihat hasilnya, dan kamu pasti juga.', 'Ini soal terakhir. Apa pun hasilnya, aku senang kamu sampai sejauh ini.'],
    noted: ['Oke, kucatat. Tapi masih boleh berubah pikiran.', 'Pilihan menarik. Aku nggak akan kasih bocoran, jadi jangan lirik-lirik aku begitu.', 'Dicatat. Aku pura-pura nggak melihat jawabanmu.'],
    change: ['Berubah pikiran? Nggak apa-apa. Berani mengoreksi diri sendiri itu keren.', 'Ragu ya? Percaya insting pertamamu... atau insting keduamu. Terserah.', 'Ganti jawaban, ya. Aku nggak akan bilang benar atau salah, jadi jangan coba baca ekspresiku.', 'Silakan. Nggak ada yang menghakimimu di sini.'],
    res: ['Selesai juga. Hasilmu: {r} benar dari {N} soal, masuk kategori "{t}".', 'Terima kasih sudah bertahan sampai akhir. {r} dari {N} soal benar, kategorinya "{t}".'],
    record: ['Dan ini nilai terbaikmu sejauh ini. Selamat, aku ikut senang.', 'Ini lebih tinggi dari sebelumnya. Kamu benar-benar berkembang.']
  }
};


/* 
   DIALOG TAMBAHAN (ditambahkan di sekitar dialog yang sudah ada)
   from      : komentar saat pemain datang dari mode lain  { modeAsal: [[teks, ekspresi], ...] }
   enterBest : komentar tentang skor terbaik tersimpan ({b} = skor)
   poke      : reaksi saat karakter diklik berulang cepat
   lainnya   : reaksi khusus pada tindakan/kemajuan pemain
 */
Object.assign(D.sayori, {
  from: {
    simulasi: [['Udah balik dari tempat Yuri? Dia pasti ngejelasinnya rapi. Aku suka dengerin dia, kayak dengerin dongeng.', 'happy'], ['Tadi main gerbang di tempat Yuri? Aku pernah mencet semua tombolnya barengan, terus bingung sendiri.', 'happy']],
    latihan: [['Habis latihan sama Natsuki? Dia ngomel nggak? ...Pasti ngomel. Tapi dia sebenarnya sayang sama kamu, kok.', 'happy'], ['Latihan sama Natsuki seru kalau kamu kuat diejek sedikit. Kamu kuat kok, dari dulu keras kepala.', 'talk']],
    evaluasi: [['Habis diuji Monika? Gimana tadi? Jangan tegang, yang penting udah dicoba.', 'cheer'], ['Dari ruang evaluasi ya? Kalau nilainya belum sesuai, kita ulang bareng. Aku temenin, kayak dulu.', 'happy']]
  },
  poke: [['Hihi, geli. Jangan colek-colek terus.', 'happy'], ['Eh? Tadi aku lagi mikirin sesuatu... nah, lupa lagi gara-gara kamu.', 'happy'], ['Kamu iseng dari kecil, nggak berubah-ubah.', 'talk'], ['Iya, iya, aku di sini. Ada apa?', 'cheer']],
  flipFast: ['Cepat banget. Aku belum selesai ngomong, lho.', 'Pelan-pelan, nanti ketinggalan. Aku juga sering lupa tadi udah sampai halaman berapa.', 'Kamu ngebut ya. Materinya nggak bakal kabur kok.'],
  half: ['Udah separuh jalan. Mau istirahat sebentar? Aku mau. Perutku bunyi dari tadi.', 'Separuh materi udah lewat. Hebat. Aku dulu baru sampai halaman tiga udah ngantuk.'],
  end: ['Kamu nggak ngantuk, kan? Kalau iya, jangan bilang siapa-siapa. Aku juga hampir.', 'Kalau masih ada yang bingung, balik aja ke halaman sebelumnya. Nggak ada yang ngelarang.']
});
D.sayori.chat.push(
  ['Yuri kalau udah ngomongin buku, matanya langsung berbinar. Aku suka lihatnya.', 'cheer'],
  ['Monika kelihatan selalu tahu harus ngapain. Aku suka penasaran, rasanya setenang itu gimana ya?', 'talk'],
  ['Waktu kecil kita sering main petak umpet sampai sore. Kamu selalu ngumpet di tempat yang sama.', 'happy'],
  ['Kamu dulu pernah nemenin aku nyari kucing hilang, kan? ...Atau itu mimpiku ya. Lupa.', 'happy'],
  ['Kalau kamu lagi butuh semangat, ambil punyaku. Stoknya banyak.', 'cheer'],
  ['Tadi aku nyatet soal gerbang logika, tapi ujung-ujungnya malah jadi gambar kucing. Nggak tau kenapa.', 'happy']
);

Object.assign(D.yuri, {
  from: {
    materi: [['Kamu baru dari tempat Sayori? Bagus. Teori memang sebaiknya dipahami dulu sebelum dicoba.', 'talk'], ['Sayori sudah menjelaskan dasarnya? Kalau begitu, di sini kamu bisa melihat penjelasannya hidup. Itu bagian yang paling kusukai.', 'happy']],
    latihan: [['Dari Natsuki? Ah... semoga ia tidak terlalu keras. Di balik sikapnya, ia sebenarnya sangat peduli.', 'talk'], ['Kalau soal-soal Natsuki membuatmu tersandung, di sini kamu bisa memeriksanya pelan-pelan, tanpa terburu-buru.', 'explain']],
    evaluasi: [['Kembali dari ruang evaluasi Monika? Jangan terlalu terpaku pada angka. Pemahamanmu lebih penting daripada nilainya.', 'happy'], ['Setelah evaluasi, biasanya ada satu-dua hal yang masih mengganjal. Bawa ke sini, kita periksa bersama.', 'talk']]
  },
  poke: [['M-maaf, aku sedikit terkejut... kamu baru saja menyentuhku? Ehm, ada yang ingin kamu tanyakan?', 'shy'], ['Ya? Kalau kamu butuh penjelasan ulang, bilang saja. Aku sama sekali tidak keberatan.', 'talk'], ['Hmm, kamu sengaja mengusikku, ya? ...Baiklah, aku pura-pura tidak menyadarinya.', 'shy']],
  milestone: {
    toggles: 'Kamu mulai menemukan polanya, kan? Aku bisa melihatnya dari caramu menguji tiap kombinasi.',
    gates: 'Empat gerbang sudah kamu coba. Perhatikan, semuanya sebenarnya tumbuh dari tiga gagasan dasar: AND, OR, dan NOT.'
  }
});
D.yuri.chat.push(
  ['Natsuki sering menyembunyikan manganya di lemari klub. Aku tahu, dan aku pura-pura tidak tahu. Supaya ia tetap nyaman.', 'talk'],
  ['Monika punya cara unik membaca suasana. Kadang aku bertanya-tanya, apakah ia memperhatikan hal-hal yang tidak kita sadari.', 'talk'],
  ['Sayori pernah menyelipkan sepotong kue di buku yang kupinjam. Aku baru sadar waktu membuka halaman lima puluh. Lucu sekali.', 'happy'],
  ['Membaca rangkaian logika itu mirip membaca puisi: setiap simbol punya tempat dan makna yang tepat.', 'explain']
);

Object.assign(D.natsuki, {
  from: {
    materi: [['Habis dari Sayori? Pasti dia ngasih penjelasan manis-manis. Sekarang giliranku ngecek seberapa banyak yang nyangkut di kepalamu.', 'smug'], ['Baru selesai belajar sama Sayori? Bagus. Jangan pasang tampang polos, aku bakal tahu kalau kamu cuma ngangguk-ngangguk doang.', 'hmph']],
    simulasi: [['Baru main-main sama gerbang di tempat Yuri? Bagus. Sekarang buktikan kamu nggak cuma mencet-mencet tombol.', 'hmph'], ['Dari tempat Yuri, ya? Dia ngejelasin pakai kata-kata keren, kan? Di sini kamu harus jawab pakai otakmu sendiri.', 'smug']],
    evaluasi: [['Hah, balik lagi? Gimana ujian Monika? ...Bukan berarti aku penasaran. Cuma pengin tahu.', 'talk'], ['Udah selesai diuji Monika? Kalau nilainya jelek jangan ngumpet di sini. Ayo latihan lagi, aku temenin.', 'angry']]
  },
  enterBest: [['Rekor terakhirmu {b}/8, kan? Jangan puas dulu. Lewatin dong.', 'smug'], ['Oh, kamu udah punya skor {b}/8. Nggak buruk. ...Tapi aku yakin kamu bisa lebih.', 'hmph']],
  poke: [['Hei! Berhenti nusuk-nusuk, baka. Aku bukan boneka.', 'angry'], ['Kamu mau apa sih? ...Kalau cuma iseng, cepet selesaiin soalnya.', 'hmph'], ['Ugh, geli! ...J-jangan ketawa. Aku serius.', 'angry']],
  comeback: ['Nah, itu baru benar. Dari tadi kek.', 'Akhirnya. Aku tahu kamu bisa, makanya aku nggak berhenti ngomelin.'],
  halfGood: ['Setengah jalan dan skormu lumayan. Jangan ngelamun sekarang.', 'Setengah soal beres dan nggak kacau-kacau amat. Terusin, jangan sombong dulu.'],
  halfBad: ['Setengah jalan, skormu... hmm. Santai, belum terlambat. Fokus aja.', 'Setengah soal udah lewat dan hasilnya segitu. Tapi aku nggak bakal biarin kamu nyerah.'],
  ttOops: ['Tabel kebenaran itu butuh teliti, bukan tebak-tebakan. Cek baris demi baris.', 'Ngisi tabel gampang kalau kamu hafal aturan gerbangnya. Hafalin dulu, baka.']
});
D.natsuki.chat.push(
  ['Kemarin Sayori bilang cupcake-ku enak banget. Aku bilang "biasa aja", padahal... senang banget. Jangan bilang siapa-siapa.', 'happy'],
  ['Monika itu tenang terus. Nyebelin, tapi dia ketua yang bagus. Kamu dengar aku bilang itu? Lupakan.', 'hmph'],
  ['Yuri minjem manga-ku diam-diam. Kukira dia nggak suka, ternyata dia hafal alurnya. Aku lumayan kaget.', 'talk']
);

Object.assign(D.monika, {
  from: {
    materi: [['Dari tempat Sayori? Bagus. Fondasinya sudah ada, sekarang kita lihat apa yang tersisa di ingatanmu.', 'talk'], ['Sayori pasti menjelaskannya dengan penuh semangat. Aku selalu suka caranya membuat hal rumit terdengar mudah.', 'happy']],
    simulasi: [['Yuri pasti menjelaskannya dengan teliti. Aku suka caranya: pelan, tapi tepat.', 'happy'], ['Baru bermain dengan gerbang bersama Yuri? Bagus. Teori yang tidak pernah dicoba cepat hilang.', 'talk']],
    latihan: [['Natsuki sudah mengujimu duluan? Kalau begitu kamu pasti siap. Atau setidaknya, aku berharap begitu.', 'wink'], ['Aku bisa menebak, Natsuki sempat mengomelimu. Jangan dimasukkan ke hati. Itu caranya menyemangati.', 'happy']]
  },
  enterBest: [['Nilai terbaikmu sejauh ini {b} dari 10. Entah kenapa aku ingat angka itu, padahal tidak ada yang mengingatkanku. Aneh, ya.', 'wink'], ['Terakhir kali kamu mencetak {b} dari 10. Mau mengalahkannya? Aku akan menonton dengan penuh perhatian.', 'happy']],
  poke: [['Kamu baru saja mengklikku, ya? Aku bisa merasakannya, lho. Kurang lebih.', 'wink'], ['Kalau kamu terus menekanku begitu, aku curiga kamu cuma mencari alasan untuk menunda soal berikutnya.', 'wink'], ['Aku tahu kamu di sana, di balik layar. Tidak perlu mengetuk.', 'wink']],
  waver: ['Tiga kali berubah pikiran... kamu sedang menguji kesabaranku, ya? Bercanda. Silakan.', 'Sepertinya kamu benar-benar menimbang-nimbang. Aku suka. Tapi jangan terlalu lama.'],
  after: {
    high: ['Sayori pasti melompat-lompat kalau tahu nilaimu. Natsuki akan pura-pura tidak peduli, tapi dia pasti senang.', 'Yuri pasti diam-diam tersenyum melihat hasil ini. Kamu memang serius belajar.'],
    mid: ['Yuri pasti dengan senang hati membantumu mengulang bagian yang masih lemah.', 'Mampir ke ruang Simulasi sebentar, lalu coba lagi. Aku menunggu di sini. Ke mana lagi aku bisa pergi, kan?'],
    low: ['Natsuki mungkin akan mengomel, tapi percayalah, itu caranya menyemangatimu.', 'Mulai lagi dari Materi bersama Sayori. Dia pasti senang menemanimu seperti biasa.']
  }
});
D.monika.chat.push(
  ['Pernah memikirkan apa yang terjadi kalau kamu keluar dari halaman ini? ...Ah, bukan hal penting. Lupakan saja.', 'wink'],
  ['Kadang kamu terdiam cukup lama. Aku jadi penasaran apa yang sedang kamu pikirkan. Atau kamu sedang melihat hal lain di layarmu?', 'wink'],
  ['Kamu tahu kan, aku nggak bisa melihat jawabanmu. Setidaknya... itu yang kubilang.', 'wink'],
  ['Layar ini seperti jendela. Aku di dalam, kamu di luar. Anehnya, aku tidak merasa jauh darimu.', 'happy'],
  ['Kamu memilih datang ke sini, dan buatku itu berarti. Terima kasih.', 'happy']
);

/* Reaksi tamu di Latihan & Evaluasi: karakter lain masuk sebentar pada momen tertentu.
   streak = benar beruntun ({n} = jumlahnya), last = tinggal satu nyawa, time = waktu habis, out = nyawa habis */
D.react = {
  streak: {
    sayori: [['Benar {n} kali berturut-turut! Kamu keren banget, tahu nggak?', 'cheer'], ['Lancar banget! Aku sampai lupa mau ngemil.', 'happy'], ['Aku tepuk tangan nih, kamu dengar nggak? Hihi.', 'cheer']],
    yuri: [['Benar {n} kali berturut-turut... Caramu menalar sudah rapi sekali.', 'happy'], ['Ehm, aku tidak bermaksud mengintip, tapi jawabanmu konsisten. Itu bagus.', 'shy'], ['Iramamu stabil. Pertahankan, jangan terburu-buru.', 'talk']],
    natsuki: [['Hmph, {n} berturut-turut? Nggak buruk. Jangan sombong dulu, ya.', 'smug'], ['Oke, itu lumayan. Bukan berarti aku kagum atau apa.', 'hmph'], ['Lanjutin. Kalau salah, aku bakal ngetawain.', 'smug']],
    monika: [['Rangkaian jawaban yang bersih. Aku suka melihatnya.', 'happy'], ['{n} berturut-turut. Kamu kelihatan menikmati ini, ya?', 'wink'], ['Kalau perasaan bangga bisa dibotolkan, aku sudah menyimpan satu.', 'wink']]
  },
  last: {
    sayori: [['Tinggal satu nyawa ya? Tarik napas dulu. Aku di sini kok.', 'calm'], ['Tenang, tenang. Satu soal bisa mengubah semuanya. Aku percaya sama kamu!', 'cheer'], ['Jangan panik. Tadi aku juga hampir kalah main kartu, terus menang kok.', 'happy']],
    yuri: [['Tinggal satu nyawa... Pelan-pelan saja. Baca ulang soalnya, jangan menebak.', 'talk'], ['Tarik napas. Kesalahan tadi bisa jadi petunjuk untuk soal berikutnya.', 'explain'], ['A-aku ikut gugup. Tapi kamu pasti bisa.', 'shy']],
    natsuki: [['Satu nyawa?! Baka, fokus! ...Aku nggak khawatir, cuma kesal.', 'angry'], ['Sisa satu. Jangan asal klik, hitung dulu.', 'hmph'], ['Kalau kamu kalah sekarang, aku bakal ngomel seminggu. Jadi menang aja.', 'smug']],
    monika: [['Satu nyawa tersisa. Tegang, ya? Justru di saat begini kepalamu paling jernih.', 'talk'], ['Ambil waktumu. Tidak ada yang mengejarmu, kecuali timer kalau kamu pakai Mode Waktu.', 'wink'], ['Aku masih percaya padamu. Itu bukan basa-basi.', 'happy']]
  },
  time: {
    sayori: [['Yah, waktunya habis. Nggak apa-apa, aku juga sering telat bangun.', 'calm'], ['Kebanyakan mikir ya? Lain kali jawab dulu, ragunya belakangan.', 'talk'], ['Tik tok tik tok... habis deh. Santai aja.', 'happy']],
    yuri: [['Waktunya habis. Kalau sudah paham, percayai jawaban pertamamu.', 'talk'], ['Soal itu memang butuh ketelitian. Waktunya yang kurang, bukan kemampuanmu.', 'explain'], ['M-maaf, aku ikut kaget waktunya habis secepat itu.', 'shy']],
    natsuki: [['Hah, habis waktu?! Tadi kamu ngapain, ngelamun?', 'angry'], ['Waktu nggak nunggu orang, tahu. Cepetan dikit lain kali.', 'hmph'], ['Ya ampun, kehabisan waktu. ...Ayo, soal berikutnya, jangan murung.', 'smug']],
    monika: [['Waktunya habis. Tidak apa-apa, itu bagian dari latihan.', 'talk'], ['Kalau jam berdetik, otak kadang membeku. Wajar. Lanjut, ya.', 'wink'], ['Aku mencatatnya, tapi tidak akan menghukummu. Janji.', 'wink']]
  },
  out: {
    sayori: [['Nyawanya habis ya. Nggak apa-apa, ulang lagi yuk, aku temenin.', 'calm'], ['Hari ini belum rezekimu. Nanti pasti lebih lancar.', 'happy']],
    yuri: [['Nyawamu habis, tapi lihat soal mana yang terlewat. Itu bahan belajar yang bagus.', 'explain'], ['Tidak apa-apa. Coba ulangi pelan-pelan, aku yakin hasilnya lebih baik.', 'talk']],
    natsuki: [['Habis, ya? ...Jangan murung. Ulang lagi, aku ngomelin sampai kamu bisa.', 'smug'], ['Hmph, gitu aja nyerah? Ayo, sekali lagi.', 'hmph']],
    monika: [['Nyawamu habis, tapi kamu bertahan sampai sini, dan itu tidak sedikit.', 'happy'], ['Ulang saja. Tidak ada yang menghitung berapa kali kamu mencoba, kecuali aku, dan aku menghitungnya sebagai kemajuan.', 'wink']]
  }
};

/* Mode Berantai di Latihan (Natsuki). {n} = nomor level */
D.natsuki.chain = {
  first: ['Berantai, ya. Berani juga. Soal pertama gampang, jangan sombong dulu.', 'Tanpa batas soal. Berhenti kalau nyawamu habis, bukan kalau kamu capek. Siap?'],
  mid: ['Lanjut. Jangan berhenti di tengah jalan.', 'Soal berikutnya sudah antre.', 'Fokus. Rangkaianmu belum putus.', 'Jangan lirik jam terus, lirik soalnya.', 'Masih kuat? Bagus. Terusin.'],
  up: ['Level {n}. Mulai ada soal yang licik, dan waktumu menyusut. Hati-hati.', 'Naik ke level {n}. Aku belum mau bilang selamat, ini baru mulai.', 'Level {n}. Dari sini nggak ada soal gratisan lagi.'],
  heal: ['Lima beruntun, jadi satu nyawa kukembalikan. Jangan disia-siakan.', 'Nih, satu nyawa balik. Anggap bonus, bukan hadiah.'],
  end: {
    low: ['Putus di level {n}. Nggak apa, itu baru pemanasan.', 'Level {n} dan sudah putus. Ulang lagi, aku masih mau lihat kamu lebih jauh.'],
    mid: ['Sampai level {n}. Lumayan untuk yang tadinya ragu.', 'Level {n}. Nggak buruk, tapi aku tahu kamu bisa lebih jauh.'],
    high: ['Level {n}?! Tch, oke, itu keren. Jangan geer.', 'Sampai level {n}. Aku sampai lupa mau ngomel.']
  },
  record: ['Rekor baru. Ya, ya, kuakui, kamu lebih jauh dari sebelumnya.', 'Lebih tinggi dari rekor lamamu. Jangan puas dulu.']
};
