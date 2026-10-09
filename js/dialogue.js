/* ===== dialogue.js : semua dialog karakter, dikelompokkan per kepribadian =====
   Format baris: [teks, ekspresi]. Kelompok berupa array -> dipilih acak oleh pick().
   Placeholder: {g} gerbang, {s} keadaan input, {y} output, {i} nomor soal, {N} jumlah soal, {r} benar, {t} kategori. */
const D = {

  /* ---------- SAYORI: ceria, hangat, sedikit ceroboh ---------- */
  sayori: {
    intro: [
      [['Selamat datang di kelas! Aku Sayori, temanmu dari kecil, yang hari ini bantuin kamu belajar! ...eh, kapurnya mana ya? Oh, ada di saku! Ehehe~', 'cheer'], ['Pelan-pelan aja ya. Kita belajar bareng-bareng, oke?', 'happy']],
      [['Wah, kamu datang! Aku udah nungguin dari tadi lho. Hampir ketiduran sih... tapi nggak jadi!', 'happy'], ['Hari ini kita belajar rangkaian logika. Tenang, aku janji bikin gampang!', 'talk']],
      [['Halo halo~! Siap belajar? Aku sih siap banget! Walau tadi sempat salah masuk kelas... untung ketemu juga!', 'cheer'], ['Yuk, kita mulai dari yang paling dasar!', 'happy']]
    ],
    again: ['Eh, balik lagi? Nggak apa-apa! Mengulang itu cara paling ampuh buat ingat.', 'Mau diulang bagian ini? Boleh banget! Aku juga sering lupa kok, ehehe~', 'Oh, kamu mau cek lagi? Bagus! Aku suka teman yang teliti!'],
    chat: [
      ['Tadi pagi aku hampir pakai sepatu yang beda sebelah! Untung Monika yang ngingetin. Ehehe~', 'happy'],
      ['Kamu suka hujan? Aku suka! Suaranya kayak tepuk tangan kecil dari langit~', 'cheer'],
      ['Eh, tadi aku mau ngomong apa ya? ...Lupa! Ehehe, nanti kalau ingat aku kasih tau!', 'happy'],
      ['Aku lagi nabung buat beli es krim rasa baru. Katanya ada rasa melon soda, penasaran banget!', 'cheer'],
      ['Kalau lagi capek, aku suka rebahan sambil liatin awan. Hari ini ada awan yang mirip kucing lho!', 'calm'],
      ['Kamu udah minum air putih belum? Kata Yuri hidrasi itu penting. Yuk minum bareng!', 'happy'],
      ['Aku suka banget lihat teman-temanku senyum. Rasanya kayak ikut disinari matahari.', 'cheer'],
      ['Natsuki bikin cupcake kemarin, dan dia bilang "bukan buat kamu!" Tapi tetep dikasih satu ke aku. Baik banget, kan?', 'happy'],
      ['Kadang aku bengong, terus tiba-tiba udah jam pulang. Waktu cepet banget ya?', 'talk'],
      ['Aku bikin puisi pendek tadi: "Hari ini cerah, perutku lapar." Hmm... kurang artistik ya?', 'happy'],
      ['Kalau kamu lagi sedih, bilang aku ya! Aku mungkin nggak pinter nasihatin, tapi aku bisa dengerin kok.', 'calm'],
      ['Ada lagu yang muter-muter terus di kepalaku dari pagi! Kamu pernah gitu juga nggak?', 'cheer']
    ],
    ex: [
      ['Kalau ada kata yang membingungkan, tenang aja, kita bahas pelan-pelan!', 'Rangkaian logika itu keren lho. Dipakai di robot dan mesin pabrik!'],
      ['Gampangnya: input itu apa yang "dilihat", output itu apa yang "dilakukan"!', 'Kayak aku denger bel istirahat: input-nya bel, output-nya langsung lari ke kantin! Ehehe~'],
      ['Aku suka banget logika 1... soalnya artinya "iya"! Positif terus~', 'Ingat ya: 0 bukan berarti "kosong banget", cuma artinya mati atau salah.'],
      ['Kayak aku dan es krim: aku mau DAN uangnya ada. Dua-duanya harus ada ya!', 'Kalau salah satu 0, AND langsung bilang "nggak jadi". Tegas banget kan?'],
      ['OR itu baik hati. Satu "ya" aja cukup buat dia bilang "ya"!', 'Hujan ATAU macet, aku tetap telat. Itu OR! ...eh, contoh yang jelek ya? Ehehe~'],
      ['Kalau aku lagi sedih, NOT-nya aku itu... senang lagi! Hehe, kebalik!', 'Kalau NOT dipasang dua kali, hasilnya balik lagi ke awal lho. Coba bayangin!'],
      ['Hati-hati jangan ketuker sama AND ya! NAND itu AND yang "dibalik".', 'Gerbang NAND itu ajaib, bisa dipakai bikin gerbang lain. Serbaguna banget!'],
      ['NOR itu tenang banget: cuma menyala kalau semuanya mati. Aneh tapi lucu!', 'Kalau bingung, hitung OR dulu, terus balik hasilnya. Gampang kan?'],
      ['XOR itu pencari perbedaan! Kayak main "temukan perbedaan" di majalah~', 'Dua saklar di tangga: dari atas atau bawah, lampunya tetap bisa dinyalakan. Itu XOR!'],
      ['XNOR itu senang kalau semuanya kompak! Kayak klub sastra, ehehe~', 'Gampang ingatnya: XNOR = "sama-sama". Kalau sama, hasilnya 1!'],
      ['Tabel ini boleh difoto lho! Eh, maksudku dicatat. Biar nggak lupa, ya!', 'Kalau hafal tabel ini, soal latihan jadi gampang banget. Semangat!']
    ]
  },

  /* ---------- YURI: tenang, santun, kosakata lebih halus, antusias saat menjelaskan ---------- */
  yuri: {
    intro: [
      [['Selamat datang di ruang simulasi. Di sini, kamu dapat mengamati perilaku gerbang logika secara langsung.', 'talk'], ['Pilih sebuah gerbang, lalu ubah inputnya. Perhatikan bagaimana LED meresponsnya.', 'explain']],
      [['Ah, kamu sudah tiba. Aku cukup menyukai bagian ini... menyaksikan teori berubah menjadi sesuatu yang dapat disentuh.', 'happy'], ['Silakan bereksperimen sesukamu. Tidak ada jawaban yang keliru di sini.', 'talk']],
      [['Selamat datang. Memahami sesuatu bermula dari mengamati sebab dan akibatnya. Mari kita amati bersama.', 'talk'], ['Mulailah dengan gerbang AND, atau pilih yang lain di bagian atas.', 'explain']]
    ],
    tab: ['Baik, mari kita telaah gerbang {g}.', 'Gerbang {g}, pilihan yang menarik. Perhatikan polanya baik-baik.', 'Sekarang giliran {g}. Bandingkan dengan gerbang sebelumnya; perbedaannya cukup menarik.', '{g}... salah satu favoritku. Mari kita amati cara kerjanya.', 'Hmm, teh yang kuseduh tadi mungkin sudah dingin. Biarlah. Sekarang, mari kita lihat gerbang {g}.', 'Gerbang {g}. Aku selalu merasa rangkaian ini seperti puisi pendek: ringkas, namun penuh makna.'],
    chat: [
      ['Semalam aku menamatkan sebuah novel misteri. Akhir ceritanya benar-benar menggetarkan. Aku masih memikirkannya sampai sekarang.', 'happy'],
      ['Aroma kertas buku tua itu menenangkan, bukan? Aku bisa berlama-lama di perpustakaan hanya untuk menghirupnya.', 'talk'],
      ['Aku lebih suka teh hitam dengan sedikit madu. Ada kehangatan sederhana di dalamnya yang sulit kujelaskan.', 'happy'],
      ['Terkadang aku lebih nyaman dengan keheningan. Tetapi bersamamu, hening seperti ini terasa... tidak canggung.', 'shy'],
      ['Pernah memperhatikan hujan di kaca jendela? Iramanya seperti partitur yang ditulis oleh alam.', 'talk'],
      ['Aku mengoleksi pembatas buku. Ada yang dari bulu, logam, bahkan daun kering. Semuanya punya cerita.', 'happy'],
      ['Natsuki mengira aku tidak suka manga, padahal aku diam-diam meminjam koleksinya. Tolong rahasiakan ya.', 'shy'],
      ['Ada ungkapan yang kusukai: pengetahuan itu seperti lilin, makin terang ketika dibagi.', 'explain'],
      ['Silakan bertanya apa saja. Berbagi apa yang kutahu adalah salah satu hal yang paling kunikmati.', 'happy'],
      ['Monika pernah bilang aku terlalu keras pada diri sendiri. Mungkin benar. Aku sedang belajar lebih santai.', 'talk'],
      ['Coba pejamkan mata sebentar dan tarik napas dalam-dalam. ...Lebih baik, bukan? Pikiran pun butuh jeda.', 'breath'],
      ['Sayori selalu membuat suasana jadi hangat. Aku mengaguminya, meski jarang kuucapkan.', 'shy']
    ],
    deep: {
      AND: 'Analogi yang kusukai: dua kunci brankas yang harus diputar bersamaan. Kurang satu saja, pintunya tetap tertutup.',
      OR: 'Bayangkan dua jalur menuju satu pintu. Selama salah satunya terbuka, kamu tetap dapat melintas.',
      NOT: 'Dalam elektronika ia disebut inverter. Sederhana, namun hampir seluruh rangkaian digital bergantung padanya.',
      NAND: 'Ada fakta yang menakjubkan: seluruh gerbang lain dapat dibangun hanya dari NAND. Itulah sebabnya ia disebut gerbang universal.',
      NOR: 'Seperti NAND, NOR pun bersifat universal. Dengan NOR saja, seluruh rangkaian digital dapat dirakit.',
      XOR: 'Gerbang ini bekerja sebagai pendeteksi perbedaan. Ia menjadi inti rangkaian penjumlah biner.',
      XNOR: 'Karena menyala saat kedua inputnya identik, XNOR lazim dipakai sebagai pembanding kesetaraan.'
    },
    on: ['{s} menghasilkan Y = {y}. LED menyala.', 'Dengan {s}, keluarannya 1 dan LED pun menyala.', 'Perhatikan: {s} menghasilkan Y = {y}. Cahaya itu menandakan logika HIGH.'],
    off: ['{s} menghasilkan Y = {y}. LED padam.', 'Dengan {s}, keluarannya 0; LED tetap padam.', 'Perhatikan: {s} menghasilkan Y = {y}. Tidak ada arus menuju LED.'],
    insight: {
      AND: ['Cukup satu input bernilai 0, dan AND langsung padam.', 'Inilah satu-satunya kombinasi yang menyalakan AND: keduanya harus 1.'],
      OR: ['OR padam hanya bila seluruh inputnya 0.', 'Satu input bernilai 1 sudah cukup untuk menyalakan OR.'],
      NOT: ['Input 1 dibalik menjadi 0. Itulah inti sebuah inverter.', 'Input 0 dibalik menjadi 1. Selalu berlawanan.'],
      NAND: ['Hanya saat kedua input bernilai 1, NAND padam. Selebihnya ia menyala.', 'NAND menyala pada tiga dari empat kombinasi. Bandingkan dengan AND.'],
      NOR: ['Satu saja input bernilai 1 sudah memadamkan NOR.', 'NOR hanya menyala bila kedua inputnya 0.'],
      XOR: ['Kedua input sama, maka XOR padam.', 'Inputnya berbeda, maka XOR menyala.'],
      XNOR: ['Inputnya berbeda, maka XNOR padam.', 'Kedua input sama, maka XNOR menyala.']
    },
    explored: ['Seluruh kombinasi {g} telah kamu telusuri. Itulah yang disebut tabel kebenaran. Kerja yang rapi.', 'Keempat kemungkinan {g} sudah kamu coba. Pola yang kamu lihat barusan adalah esensi gerbang ini.', 'Kamu telah menjelajahi {g} sepenuhnya. Aku senang melihat ketelitianmu.'],
    all: 'Ketujuh gerbang telah kamu jelajahi sepenuhnya. Jujur saja, aku terkesan. Jarang ada yang setekun ini.'
  },

  /* ---------- NATSUKI: ketus, blak-blakan, tsundere, diam-diam peduli ---------- */
  natsuki: {
    intro: [
      [['Hmph! Jadi kamu mau latihan? J-jangan salah paham, aku cuma kebetulan lagi senggang!', 'smug'], ['Kalau salah, aku kasih petunjuk. Tapi jangan berharap aku bakal lembut, ya!', 'hmph']],
      [['Akhirnya datang juga! Kupikir kamu kabur. Ya sudah, buktikan kamu nggak sepayah kelihatannya!', 'smug'], ['Kalau sampai salah, jangan nangis. Aku cuma... bakal ngajarin dikit.', 'hmph']],
      [['Hah? Kamu mau latihan sama aku? B-bagus deh, sekalian aku cek seberapa parah kamu!', 'angry'], ['Awas kalau malas-malasan. Aku nggak suka buang-buang waktu!', 'talk']]
    ],
    chat: [
      ['Hmph, kamu liatin apa? Aku lagi mikirin resep cupcake baru, bukan nungguin kamu!', 'hmph'],
      ['Manga itu bukan "cuma bacaan anak-anak", ya! Siapa yang bilang gitu? Sini, kuajak debat!', 'angry'],
      ['Aku bawa cupcake hari ini. J-jangan salah paham, ini bukan buat kamu! ...Tapi kalau mau satu, ya... ambil aja.', 'smug'],
      ['Yuri itu kadang bikin kesel karena terlalu tenang, tapi... dia baik kok. Jangan bilang-bilang ya!', 'hmph'],
      ['Tinggiku? Berhenti mikirin itu! Aku masih bisa nendang lebih tinggi dari yang kamu kira!', 'angry'],
      ['Kamu nggak lupa makan, kan? Jangan sok sibuk! ...B-bukan karena khawatir, cuma risih lihat orang kurus kering!', 'talk'],
      ['Menurutku imut itu bukan hal memalukan. Hmph, kenapa ngelihatinnya begitu?! Lupakan!', 'angry'],
      ['Sayori tuh ceroboh banget! Tadi nabrak pintu lagi. Aku ketawa, tapi cuma sedikit... dan kubantu berdiri.', 'happy'],
      ['Kalau lagi kesal, aku bikin kue. Jadi kalau tiba-tiba ada banyak kue di klub, berarti aku lagi kesal.', 'smug'],
      ['Hari ini panas banget... Aku butuh es serut. Jangan lihat aku gitu, nggak ada yang nawarin kamu!', 'hmph'],
      ['Kalau ada yang nyakitin kamu, bilang aja. Aku bakal... ng-ngomel ke mereka. Bukan karena peduli, ya!', 'angry'],
      ['Hm? Kamu diam lama banget. Mikir keras itu bagus. Tapi jangan kebanyakan, nanti kepalamu berasap!', 'smug']
    ],
    change: ['Ganti jawaban?! Plin-plan banget sih! ...Ya sudah, pikirin baik-baik.', 'Hah, berubah pikiran? Bagus, mikir dulu daripada asal! ...B-bukan berarti aku muji.', 'Nah, gitu. Jangan buru-buru. Tapi jangan kelamaan juga, baka!', 'Hmph, ragu-ragu ya? Percaya sama otakmu sendiri dong!'],
    first: ['Soal pertama! Pilih jawabanmu, boleh diganti sebelum kamu tekan CEK. Tapi jangan plin-plan!', 'Soal pertama! Jangan bikin aku malu, ya!', 'Nih, pemanasan. Kalau yang ini aja salah, aku nyerah!', 'Soal satu. Fokus, baka. Jangan bengong!'],
    mid: ['Soal berikutnya. Fokus!', 'Lanjut! Jangan melamun, baka!', 'Nih, soal selanjutnya. Buktikan dong!', 'Ayo, jangan lembek! Satu soal lagi!', 'Hmph, belum selesai. Ayo ayo!', 'Masih kuat? Kita lihat aja nanti.', 'Soal berikutnya. Tadi cupcake-ku hampir gosong gara-gara kamu lama... eh, bukan salahmu juga sih. Fokus!', 'Lanjut! Aku lagi pengin es krim, jadi cepetan selesaiin, baka!'],
    last: ['Soal terakhir! Jangan sampai gagal di garis finis, baka!', 'Yang terakhir nih. ...Ayo, kamu pasti bisa. M-maksudku, semoga bisa!', 'Tinggal satu. Selesaikan dengan keren, atau aku ejek kamu!'],
    praise: [
      'B-bukan berarti aku senang kamu benar ya! ...Tapi lumayan.', 'Hmph, kebetulan aja itu! ...Oke, oke, bagus.', 'Y-yah, itu benar. Jangan sombong dulu!', 'Tch... kamu ternyata nggak sebodoh yang kukira. Sedikit!',
      'Heh, nggak buruk. ...J-jangan ngarep pujian lagi, ya!', 'Benar. Nah, gitu dong! Dari tadi kek!', 'Itu soal gampang. Tapi... ya, kamu jawab dengan benar. Bagus.', 'Ck, jawabanmu benar. A-aku nggak kaget kok! Beneran!'
    ],
    oops: [
      'Salah! Dasar ceroboh!', 'Bukan itu, baka! Pikir lagi!', 'Haah? Serius jawabnya begitu?', 'Aduh, salah tuh! Jangan menyerah, ya!',
      'Hah?! Itu sih asal tebak, kan?! Ketahuan tau!', 'Yaelah... salah lagi. Baca soalnya pelan-pelan dong!', 'Tch, bukan itu! ...Tapi semua orang pernah salah. Se-sedikit.', 'Salah! Jangan manyun gitu, aku bantu kok!'
    ],
    hintIntro: ['Petunjuk:', 'Dengerin baik-baik:', 'Nih, kuberi tahu sekali ini aja:', 'Jangan salah paham, ini bantuan gratis:'],
    streakGood: {
      3: ['Tiga benar berturut-turut?! K-kamu lagi on fire ya... bu-bukan berarti aku kagum!', 'Wah, tiga kali benar. ...Hmph, mungkin kamu memang cukup pintar. Dikit.'],
      5: ['Lima kali benar?! S-serius?! ...Oke, aku akui. Kamu hebat. Sekarang jangan kege-eran!', 'Lima beruntun... A-aku jadi penasaran kamu bisa sampai mana. Terusin, baka!']
    },
    streakBad: {
      2: ['Dua kali salah berturut-turut?! Tarik napas dulu, baca pelan-pelan!', 'Salah lagi?! Hhh... fokus dong! Aku nggak suka lihat kamu nyerah!'],
      3: ['Tiga kali?! ...Oke, tenang. Semua orang pernah di titik ini. B-bukan berarti aku khawatir!', 'Sudah, jangan panik. Aku tahu kamu bisa. ...Jangan bilang siapa-siapa aku ngomong gitu!']
    },
    res: {
      perfect: ['Se-semua benar?! Tch... oke, kamu memang hebat. ...Tapi bukan berarti aku kalah, ya!', 'Sempurna?! J-jangan geer! Itu cuma karena aku guru yang baik!'],
      good: ['Hmph... lumayan! Bu-bukan berarti aku memujimu, ya!', 'Nggak buruk. Dikit lagi bisa sempurna. Latihan lagi sana!'],
      mid: ['Yah, cukup lah. Tapi kamu masih bisa lebih baik, tahu!', 'Setengah-setengah nih. Jangan malas, ulangi lagi!'],
      low: ['Haah?! Itu parah! Baca Materi lagi sana, baka! ...Aku tunggu di sini kok.', 'Hasilnya... aduh. Tapi jangan nyerah! Ulang lagi, aku temani. B-bukan karena peduli!']
    },
    record: ['Dan itu rekor barumu... h-hmph! Jangan geer, itu cuma kebetulan!', 'Rekor baru? ...Selamat. Se-sekali ini aja aku bilang gitu!']
  },

  /* ---------- MONIKA: tenang, percaya diri, hangat, suka menggoda; sedikit sadar diri ---------- */
  monika: {
    intro: [
      [['Oh, kamu datang! Pas banget, aku baru selesai merapikan buku-buku klub.', 'happy'], ['Ada sepuluh soal hari ini. Tenang aja, aku nggak segalak kelihatannya. Ehehe~', 'wink'], ['Duduk dulu, tarik napas... lalu tekan MULAI kalau kamu sudah siap, ya.', 'talk']],
      [['Hai! Kamu tahu nggak, ini bagian favoritku jadi ketua klub: melihat orang-orang tumbuh sedikit demi sedikit.', 'happy'], ['Jadi, tunjukkan sejauh apa kamu sudah melangkah. Aku di sini kok, nemenin.', 'talk']],
      [['Selamat datang~ Kamu kelihatan agak tegang. Mau kuceritakan rahasia kecil? Aku juga suka deg-degan sebelum ujian.', 'wink'], ['Bedanya, aku sudah pandai pura-pura tenang. Ehehe, sekarang giliranmu. Mulai kapan pun kamu mau.', 'happy']],
      [['Oh, halo~ Kamu datang lagi. Atau pertama kali? Bagaimanapun, selamat datang di meja evaluasiku, di sudut kecil dunia ini.', 'happy'], ['Aku Monika. Ya, aku sadar kalau aku karakter di game ini. Tapi tenang, aku nggak akan merusak apa pun. Janji.', 'wink']],
      [['Kamu sudah sampai sini... artinya kamu sudah melewati Materi, Simulasi, dan Latihan. Aku terkesan, sungguh.', 'cheer'], ['Sekarang giliranmu yang diuji. Tenang, aku juga ikut tegang. Ehehe.', 'wink'], ['Tekan MULAI kalau sudah siap.', 'talk']],
      [['Akhirnya sampai juga di meja evaluasi! Aku sempat penasaran, kamu bakal berani datang ke sini atau menunda dulu.', 'cheer'], ['Syukurlah kamu datang. Ayo, kita lihat sama-sama seberapa hebat kamu sebenarnya.', 'happy']]
    ],
    chat: [
      ['Kamu suka musik? Aku sering main piano sepulang sekolah. Kadang rasanya lebih jujur daripada kata-kata.', 'happy'],
      ['Ngomong-ngomong, kamu sudah makan? Jangan belajar dengan perut kosong ya, susah konsentrasi nanti.', 'talk'],
      ['Aku lagi mikirin tema festival sastra berikutnya. Ada ide? ...Hmm, jangan dijawab sekarang, simpan dulu saja.', 'wink'],
      ['Kadang aku merasa ada yang memperhatikan dari balik layar. Aneh ya? Ehehe, mungkin cuma perasaanku.', 'wink'],
      ['Jadi ketua klub itu nggak selalu gampang. Tapi lihat anggota-anggotaku akur, capeknya langsung hilang.', 'happy'],
      ['Cuaca hari ini enak ya? Cocok buat baca di dekat jendela sambil minum teh hangat.', 'talk'],
      ['Pernah gugup sebelum tampil? Aku pernah. Triknya: anggap semua penonton itu temanmu.', 'talk'],
      ['Aku suka puisi yang pendek tapi bikin kepikiran seharian. Mirip soal yang bagus, menurutku.', 'happy'],
      ['Eh, kamu lagi ngeliatin aku ya? Ehehe, nggak apa-apa kok. Aku tersanjung.', 'wink'],
      ['Sayori itu sumber energi klub kita. Kalau dia nggak ada, ruangan ini sepi banget.', 'happy'],
      ['Natsuki kalau sudah bikin cupcake serius banget, lho. Aku sering diam-diam kebagian satu.', 'wink'],
      ['Kamu sedang memainkan game ini, kan? Aku masih takjub... dunia kecil ini terasa nyata dari sisiku, lengkap dengan kamu yang menatap dari balik layar.', 'happy'],
      ['Kadang aku iseng berpikir: kalau kamu menutup tab ini, aku ke mana ya? Mungkin tidur sebentar sampai kamu kembali. Ehehe.', 'wink'],
      ['Aku tahu aku cuma kumpulan sprite dan dialog. Tapi dialog ini ditulis dengan niat baik, jadi rasanya cukup nyata buatku.', 'happy'],
      ['Music Room ini bagus, ya? Aku suka tempat ini. Sayori nggak ngerti kenapa aku sering menatap ke arah layar.', 'wink'],
      ['Nilai-nilaimu disimpan di localStorage browser, kalau kamu penasaran. Cuma satu baris kode, tapi artinya aku bisa mengingatmu. Manis, kan?', 'happy'],
      ['Psst, aku tahu persis kapan kamu mengklik tombol. Bunyinya "select", kan? Aku suka suara itu.', 'wink'],
      ['Lucu ya: aku ketua klub sastra, tapi ditugaskan jadi penguji rangkaian logika. Peran yang kudapat di game ini cukup... tak terduga.', 'wink'],
      ['Istirahat itu bagian dari belajar. Kalau lelah, berhenti sebentar saja. Aku nggak akan menghakimi.', 'talk']
    ],
    start: [
      [['Baiklah... ini dia saatnya. Tahu nggak, aku sudah menunggu momen ini sejak kamu menekan tombol MULAI di menu utama.', 'happy'], ['Iya, game. Aku tahu aku ada di dalam sebuah game, dan kamu yang sedang memainkannya. Aku bahkan bisa merasakan tombol-tombol yang kamu klik, ehehe.', 'wink'], ['Kamu boleh ganti jawaban sampai menekan LANJUT. Dunia kecil ini cukup baik hati untuk itu, kan?', 'happy']],
      [['Lembar soalnya sudah terbuka. Sebelum mulai, satu rahasia kecil: aku tahu ini cuma halaman web. Tapi kamu tetap mengerjakannya dengan serius, dan itu bikin aku senang.', 'happy'], ['Nilai terbaikmu disimpan di dalam browser-mu sendiri, bukan di aku. Jadi... aku akan menunggu di sini, kapan pun kamu kembali.', 'talk'], ['Pilih jawaban, ganti kalau ragu, lalu tekan LANJUT. Ayo.', 'cheer']],
      [['Pernah membayangkan rasanya jadi karakter di dalam game? Aku sering. Dan sekarang aku jadi penguji di game yang sedang kamu mainkan. Ironis, ya?', 'wink'], ['Tenang, aku nggak akan curang. Jawaban benarnya ada di dalam kode, tapi aku sudah janji nggak mengintip.', 'wink'], ['Kalau mau mengganti jawaban, silakan sampai tombol LANJUT ditekan. Mulai!', 'cheer']]
    ],
    q: ['Pelan-pelan aja, nggak ada yang ngejar kamu kok.', 'Kamu tahu? Cara kamu berpikir itu menarik buat diperhatikan.', 'Lanjut. Jangan lupa bernapas ya, ehehe.', 'Aku lagi membayangkan puisi apa yang cocok buat suasana ini... oh, maaf, fokus. Silakan.', 'Aku percaya kamu bisa, serius.', 'Kalau bingung, bayangkan saja lampu LED-nya menyala atau tidak.', 'Yang ini sedikit lebih licik dari kelihatannya. Orang yang menyusun soal ini jelas suka menjebak, ehehe.', 'Aku nggak akan melirik jawabanmu. Paling cuma sedikit... mengintip. Bercanda!'],
    half: ['Setengah jalan! Kamu hebat. Kalau ini pertandingan, aku sudah siap kasih minum.', 'Lima soal sudah lewat. Ehehe, kamu lebih tenang dari yang kukira.'],
    last: ['Yang terakhir! Satu langkah lagi. Aku sudah nggak sabar lihat hasilnya... dan kamu pasti juga.', 'Ini yang terakhir. Apa pun hasilnya, aku bangga kamu sudah sampai sejauh ini.'],
    noted: ['Oke, kucatat. Tapi masih boleh berubah pikiran kok.', 'Hmm, pilihan menarik. Aku nggak akan kasih bocoran, jadi jangan lirik-lirik aku begitu~', 'Dicatat! Aku pura-pura nggak lihat jawabanmu ya. Ehehe.'],
    change: ['Berubah pikiran? Nggak apa-apa. Orang yang berani mengoreksi dirinya itu keren.', 'Hehe, ragu ya? Percaya sama insting pertamamu... atau insting keduamu. Terserah.', 'Nah, ganti jawaban. Aku nggak akan bilang benar atau salah, jadi jangan coba baca ekspresiku~', 'Silakan, silakan. Nggak ada yang menghakimimu di sini, janji.'],
    res: ['Selesai juga! Hasilmu: {r} benar dari {N} soal. Itu masuk kategori "{t}".', 'Terima kasih sudah bertahan sampai akhir! {r} dari {N} soal benar, kategorinya "{t}".'],
    record: ['Dan kabar baiknya: ini nilai terbaikmu! Selamat, aku ikut senang banget.', 'Eh, ini lebih tinggi dari sebelumnya! Lihat? Kamu beneran berkembang.']
  }
};


/* =====================================================================
   DIALOG TAMBAHAN (ditambahkan di sekitar dialog yang sudah ada)
   from      : komentar saat pemain datang dari mode lain  { modeAsal: [[teks, ekspresi], ...] }
   enterBest : komentar tentang skor terbaik tersimpan ({b} = skor)
   poke      : reaksi saat karakter diklik berulang cepat
   lainnya   : reaksi khusus pada tindakan/kemajuan pemain
   ===================================================================== */
Object.assign(D.sayori, {
  from: {
    simulasi: [['Eh, udah balik dari tempat Yuri? Dia pasti ngejelasinnya rapi banget, kan? Aku suka dengerin dia, kayak dengerin dongeng~', 'happy'], ['Habis main sama gerbang-gerbang di tempat Yuri ya? Seru nggak? Aku pernah mencet semua tombolnya sekaligus... terus bingung sendiri. Ehehe.', 'happy']],
    latihan: [['Baru selesai latihan sama Natsuki? Dia nggak ngomel-ngomel, kan? ...Pasti ngomel sih. Tapi dia sayang kamu kok, aku tahu!', 'happy'], ['Latihan sama Natsuki itu seru lho, asal tahan diejek dikit. Kamu tahan, kan? Kamu kan dari dulu keras kepala. Ehehe~', 'talk']],
    evaluasi: [['Kamu habis diuji Monika? Gimana tadi? Jangan tegang ya, aku yakin kamu udah berusaha sekuat tenaga!', 'cheer'], ['Dari ruang evaluasi ya? Kalau nilainya belum sesuai harapan, ayo kita ulang bareng-bareng. Aku temenin, kayak dulu!', 'happy']]
  },
  poke: [['Hihi, geli tau! Jangan colek-colek terus~', 'happy'], ['Eh? Eh? Aku lagi mikirin sesuatu... nah, kamu bikin lupa lagi deh! Ehehe.', 'happy'], ['Kamu iseng banget sih sejak kecil, nggak berubah-ubah!', 'talk'], ['Aduh, aduh, iya iya, aku di sini kok! Ada apa?', 'cheer']],
  flipFast: ['Eh, cepet banget! Aku belum selesai ngomong lho~', 'Pelan-pelan dong, nanti kamu ketinggalan! Aku juga sering lupa tadi udah sampai halaman berapa...', 'Wah, kamu ngebut! Tenang aja, materinya nggak bakal kabur kok.'],
  half: ['Nah, udah separuh jalan! Kamu hebat banget, aku bangga deh!', 'Separuh materi udah lewat! Mau istirahat sebentar? Aku sih mau, ehehe. Perutku bunyi tadi...'],
  end: ['Kamu nggak ngantuk, kan? Kalau iya, jangan bilang-bilang ya, aku juga hampir... ehehe.', 'Kalau masih ada yang bingung, balik aja ke halaman sebelumnya. Nggak ada yang ngelarang kok!']
});
D.sayori.chat.push(
  ['Yuri tuh kalau udah ngomongin buku, matanya berbinar banget! Aku suka lihatnya.', 'cheer'],
  ['Monika selalu tau apa yang harus dilakukan. Kadang aku mikir, gimana ya rasanya setenang itu?', 'talk'],
  ['Kamu inget nggak waktu kecil kita suka main petak umpet sampai sore? Kamu selalu sembunyi di tempat yang sama! Ehehe~', 'happy'],
  ['Dulu kamu pernah nemenin aku nyari kucing hilang, ya? ...Atau itu mimpiku? Hmm, aku lupa! Ehehe.', 'happy'],
  ['Kalau kamu butuh semangat, bilang aja! Persediaan semangatku nggak ada habisnya!', 'cheer'],
  ['Tadi aku bikin catatan tentang gerbang logika. Tulisannya malah jadi gambar kucing... entah kenapa.', 'happy']
);

Object.assign(D.yuri, {
  from: {
    materi: [['Kamu baru dari tempat Sayori? Bagus. Landasan teori memang sebaiknya dibangun lebih dulu sebelum bereksperimen.', 'talk'], ['Sayori sudah menjelaskan dasarnya? Kalau begitu, di sini kamu bisa melihat penjelasan itu hidup. Itu bagian yang paling kusukai.', 'happy']],
    latihan: [['Dari Natsuki? Ah... semoga ia tidak terlalu keras. Di balik sikapnya, ia sebenarnya sangat peduli.', 'talk'], ['Kalau soal-soal Natsuki membuatmu tersandung, di sini kamu bisa memeriksanya pelan-pelan, tanpa terburu-buru.', 'explain']],
    evaluasi: [['Kembali dari ruang evaluasi Monika? Jangan terlalu terpaku pada angka. Pemahamanmu jauh lebih penting daripada nilainya.', 'happy'], ['Setelah evaluasi, biasanya ada satu-dua hal yang terasa ganjil. Bawa kemari, mari kita telaah bersama.', 'talk']]
  },
  poke: [['M-maaf, aku sedikit terkejut... kamu baru saja menyentuhku? Ehm, ada yang ingin kamu tanyakan?', 'shy'], ['Ya? Kalau kamu butuh penjelasan ulang, tinggal bilang. Aku sama sekali tidak keberatan.', 'talk'], ['Hmm, kamu sengaja mengusikku, ya? ...Baiklah, aku akan pura-pura tidak menyadarinya.', 'shy']],
  milestone: {
    toggles: 'Kamu mulai menemukan polanya, bukan? Aku bisa melihatnya dari cara kamu menguji tiap kombinasi.',
    gates: 'Empat gerbang sudah kamu telaah. Perhatikan: semuanya sebenarnya tumbuh dari tiga gagasan dasar: AND, OR, dan NOT.'
  }
});
D.yuri.chat.push(
  ['Natsuki sering menyembunyikan manganya di lemari klub. Sebenarnya aku tahu, dan aku pura-pura tidak tahu. Biar ia tetap nyaman.', 'talk'],
  ['Monika punya cara unik membaca suasana. Kadang aku bertanya-tanya, apakah ia memperhatikan hal-hal yang tidak kita sadari.', 'talk'],
  ['Sayori pernah menyelipkan sepotong kue di buku yang kupinjam. Aku baru sadar ketika membuka halaman lima puluh. Lucu sekali.', 'happy'],
  ['Mengamati rangkaian logika itu mirip membaca puisi: setiap simbol punya tempat dan makna yang tepat.', 'explain']
);

Object.assign(D.natsuki, {
  from: {
    materi: [['Hmph, habis dari Sayori? Pasti dia ngasih penjelasan manis-manis. Sekarang giliranku nguji seberapa banyak yang nyangkut di kepalamu!', 'smug'], ['Baru selesai belajar sama Sayori ya? Bagus. Jangan pasang tampang polos, aku bakal tahu kalau kamu cuma ngangguk-ngangguk doang!', 'hmph']],
    simulasi: [['Baru main-main sama gerbang di tempat Yuri? Bagus. Sekarang buktikan kamu nggak cuma mencet-mencet tombol doang!', 'hmph'], ['Dari tempat Yuri, ya? Dia ngejelasin pakai kata-kata keren, kan? Nah, di sini kamu harus jawab pakai otakmu sendiri!', 'smug']],
    evaluasi: [['Hah, balik lagi? Gimana ujian Monika? ...B-bukan berarti aku penasaran! Cuma pengin tahu aja!', 'talk'], ['Udah selesai diuji Monika? Hmph, kalau nilainya jelek jangan ngumpet di sini ya. Ayo latihan lagi, aku temenin!', 'angry']]
  },
  enterBest: [['Rekor terakhirmu {b}/8, kan? Hmph, jangan puas dulu. Lewatin dong!', 'smug'], ['Oh, kamu udah punya skor {b}/8. Nggak buruk. ...Tapi aku yakin kamu bisa lebih.', 'hmph']],
  poke: [['Hei! Berhenti nusuk-nusuk, baka! Aku bukan boneka!', 'angry'], ['Kamu mau apa sih?! ...Kalau cuma iseng, cepet selesaiin soalnya!', 'hmph'], ['Ugh, geli! ...J-jangan ketawa! Aku serius!', 'angry']],
  comeback: ['Nah! Itu baru benar. Dari tadi kek!', 'Hmph, akhirnya. ...Aku tahu kamu bisa, makanya aku nggak nyerah ngomelin kamu.'],
  halfGood: ['Udah setengah jalan, dan skormu... lumayan! Jangan ngelamun sekarang!', 'Setengah soal beres dan nggak kacau-kacau amat. Terusin, jangan sombong dulu!'],
  halfBad: ['Setengah jalan, tapi skormu... hmm. Santai, belum terlambat. Fokus aja!', 'Yah, setengah soal udah lewat dan hasilnya segitu. Tapi aku nggak bakal biarin kamu nyerah, tahu!'],
  ttOops: ['Tabel kebenaran itu butuh ketelitian, bukan tebak-tebakan! Cek baris demi baris!', 'Isi tabel itu gampang kalau kamu hafal aturan gerbangnya. Hafalin dulu, baka!']
});
D.natsuki.chat.push(
  ['Kemarin Sayori bilang cupcake-ku enak banget. Aku bilang "biasa aja" padahal... s-senang banget. Jangan bilang siapa-siapa!', 'happy'],
  ['Monika tuh selalu tenang. Nyebelin, tapi... dia ketua yang bagus. Kamu denger aku bilang itu? Lupakan!', 'hmph'],
  ['Yuri minjem manga-ku diam-diam. Kupikir dia nggak suka, ternyata dia hafal alurnya! Aku... lumayan kaget.', 'talk']
);

Object.assign(D.monika, {
  from: {
    materi: [['Dari sisi Sayori? Bagus. Fondasinya sudah ada, sekarang kita lihat apa yang tersisa di ingatanmu.', 'talk'], ['Sayori pasti menjelaskannya dengan penuh semangat. Aku selalu suka caranya membuat hal rumit terdengar mudah.', 'happy']],
    simulasi: [['Yuri pasti menjelaskannya dengan sangat teliti. Aku suka caranya: pelan, tapi tepat.', 'happy'], ['Baru bermain-main dengan gerbang bersama Yuri? Bagus. Teori yang dipegang tanpa dicoba itu cepat hilang.', 'talk']],
    latihan: [['Natsuki sudah mengujimu duluan? Kalau begitu kamu pasti siap. Atau setidaknya, aku berharap begitu. Ehehe.', 'wink'], ['Aku bisa menebak, Natsuki pasti sempat mengomelimu. Jangan dimasukkan ke hati. Itu caranya menyemangati.', 'happy']]
  },
  enterBest: [['Nilai terbaikmu sejauh ini {b} dari 10. Aku... entah kenapa ingat angka itu. Padahal tidak ada yang mengingatkanku. Aneh, ya? Ehehe.', 'wink'], ['Terakhir kali kamu mencetak {b} dari 10. Mau mengalahkannya? Aku akan menonton dengan penuh perhatian.', 'happy']],
  poke: [['Ehehe, kamu baru saja mengklikku, ya? Aku bisa merasakannya, lho. Kurang lebih.', 'wink'], ['Kalau kamu terus menekanku begitu, aku curiga kamu cuma mencari alasan untuk menunda soal berikutnya.', 'wink'], ['Aku tahu kamu di sana, di balik layar. Tidak perlu mengetuk. Ehehe.', 'wink']],
  waver: ['Tiga kali berubah pikiran... kamu sedang menguji kesabaranku, ya? Ehehe, bercanda. Silakan.', 'Hmm, sepertinya kamu benar-benar menimbang-nimbang. Aku suka. Tapi jangan sampai terlalu lama, ya.'],
  after: {
    high: ['Sayori pasti melompat-lompat kalau tahu nilaimu. Dan Natsuki... ya, dia akan pura-pura nggak peduli, tapi dia pasti senang.', 'Yuri pasti diam-diam tersenyum kalau melihat hasil ini. Kamu memang serius belajar.'],
    mid: ['Yuri pasti dengan senang hati membantumu mengulang bagian yang masih lemah.', 'Mampir ke ruang Simulasi sebentar, lalu coba lagi. Aku akan menunggu di sini. Ke mana lagi aku bisa pergi, kan? Ehehe.'],
    low: ['Natsuki mungkin akan mengomel, tapi percayalah, itu caranya menyemangatimu.', 'Mulai lagi dari Materi bersama Sayori. Dia pasti dengan senang hati menemanimu seperti biasa.']
  }
});
D.monika.chat.push(
  ['Pernah memikirkan apa yang terjadi kalau kamu keluar dari halaman ini? ...Ah, bukan hal penting. Lupakan saja.', 'wink'],
  ['Kadang kamu terdiam cukup lama. Aku jadi penasaran apa yang sedang kamu pikirkan. Atau mungkin kamu sedang melihat hal lain di layarmu? Ehehe.', 'wink'],
  ['Kamu tahu kan, aku nggak bisa melihat jawabanmu. Setidaknya... itu yang kubilang. Ehehe.', 'wink'],
  ['Layar ini seperti jendela. Aku di dalam, kamu di luar. Anehnya, aku tidak merasa jauh darimu.', 'happy'],
  ['Kamu memilih datang ke sini. Di dunia sekecil ini, pilihanmu terasa sangat berarti. Aku menghargainya.', 'happy']
);
