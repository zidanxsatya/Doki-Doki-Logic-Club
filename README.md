# Doki Doki Logic Club (Web Game Edukasi VN)
Mata pelajaran: Teknik Kontrol Mekatronika – Rangkaian Logika

Game edukasi bergaya Visual Novel, murni HTML + CSS + JavaScript (tanpa backend/database/library).
Menu: **MATERI** (Sayori) · **SIMULASI** (Yuri) · **LATIHAN** (Natsuki) · **EVALUASI** (Monika).

## Menjalankan
- **GitHub Pages**: upload seluruh isi folder ini ke repository → Settings → Pages → Branch `main` / root.
- **Lokal**: `python -m http.server 8000` lalu buka http://localhost:8000 (jangan klik-ganda `index.html`, browser memblokir `fetch` untuk file lokal).

## Struktur
```
index.html            kerangka halaman
css/style.css         seluruh tampilan
js/core.js            atlas XML, Actor/Character, Audio, Dialogue, gambar gerbang logika
js/content.js         isi materi, bank soal latihan, 10 soal evaluasi, kategori nilai  <- edit konten di sini
js/settings.js        pengaturan tersimpan (localStorage) + layout adaptif desktop/mobile
js/dialogue.js        semua dialog karakter per kepribadian  <- edit gaya bicara di sini (kelompok "chat" = obrolan bebas)
js/app.js             menu, navigasi, dan 4 mode
assets/img|audio|data PNG+XML atlas, musik/SFX (.ogg), konfigurasi JSON karakter
```

## API karakter
```js
const c = chars.sayori;           // sayori | yuri | natsuki | monika
c.setExpression('happy');         // ekspresi (ditahan di pose akhir)
c.playAnimation('singLEFT');      // animasi sekali, lalu kembali idle
c.idle();
```
Daftar ekspresi tiap karakter ada di `CHARS` (js/core.js).

## localStorage
`tkm_eval_best` (benar terbaik Evaluasi, 0–10) dan `tkm_latihan_best` (skor terbaik Latihan).

## Menambah soal
- Evaluasi: tambah objek `{q, o:[...], a:indexJawabanBenar}` di `EVAL` (`js/content.js`).
- Latihan: tambah ke `CONCEPT`, atau buat generator baru di `QGEN`.

Lihat `CREDITS.md` untuk atribusi asset.

## Dialog & SFX
- Dialog ada di `js/dialogue.js` (objek `D`). Tiap kelompok berupa array, satu kalimat dipilih acak. Format baris: `[teks, ekspresi]`.
- SFX (`assets/audio`):
  - `scrollMenu` : hanya saat pointer hover ke sebuah opsi/tombol (dan panah keyboard di menu utama)
  - `select` : klik/pilih apa pun yang tidak punya SFX khusus (menu, MULAI, LANJUT, ULANGI, tab gerbang, CEK JAWABAN, lanjut dialog)
  - `openOS` : memilih opsi jawaban di Latihan & Evaluasi
  - `metronomeBar` / `metronomeBeat` : kotak input A/B di Simulasi (jadi 1 / jadi 0)
  - `flip_page` : pindah halaman Materi
  - `cancelMenu` : kembali ke menu (tombol MENU / Esc)

## Kotak dialog, latar, dan obrolan bebas
- Kotak dialog memakai `Text_Boxes.png/xml` (satu kotak per karakter, label nama sudah menyatu).
- Latar: `DDLCbg` (Materi, Simulasi) dan `Music_Room` (Latihan, Evaluasi).
- Obrolan bebas: klik karakter, atau diam ~25 detik, maka karakter bicara di luar topik pelajaran (`D.<karakter>.chat`).

## Pengaturan (menu utama -> PENGATURAN)
- **Volume Musik** dan **Volume Efek Suara** adalah dua slider terpisah (`Snd.mv` = musik latar, `Snd.sv` = SFX). Mengubah satu tidak memengaruhi yang lain.
- **Mode Tampilan**: Jendela / Desktop Fullscreen (Fullscreen API; tidak tersedia di iPhone/iPad Safari).
- **Tata Letak**: Otomatis / Desktop / Mobile-Android. Satu game yang sama; layout mobile mengatur ulang UI, kotak dialog, tombol, menu, posisi karakter, dan isi konten
  (landscape dan potret). Mode Otomatis memilih mobile pada layar sentuh kecil.
- Semua pengaturan tersimpan di `localStorage` (`tkm_settings`) dan dipulihkan saat halaman dibuka lagi.

## Dialog tambahan
- `D.<karakter>.from` : reaksi saat pemain datang dari bagian lain; `enterBest` : reaksi pada skor terbaik tersimpan; `poke` : klik karakter berulang cepat.
- Reaksi kemajuan/tindakan: Sayori (balik halaman cepat, separuh materi, halaman terakhir), Yuri (milestone simulasi), Natsuki (comeback, tengah latihan, soal tabel),
  Monika (ganti jawaban berkali-kali, komentar antar-karakter di hasil akhir).


## Font
Judul memakai **Anton** (SIL OFL 1.1) di `assets/fonts/anton.woff2`, lisensi di `assets/fonts/Anton-OFL.txt`.

## Mode Cerita vs Mode Mandiri
- **Cerita** (menu paling atas): Pembukaan → Materi → Simulasi → Latihan → Evaluasi → Akhir cerita + hasil. Keempat karakter ikut di setiap bagian; kemajuan tersimpan (`tkm_story`) dan bisa dilanjutkan / diulang. Tombol lanjut baru muncul setelah halaman materi terakhir / syarat Simulasi terpenuhi / Latihan & Evaluasi selesai.
- **Mandiri** (Materi/Simulasi/Latihan/Evaluasi di menu): tidak berubah, satu karakter utama per bagian (Sayori, Yuri, Natsuki, Monika), bisa dibuka kapan saja.
- Tampilan: diskusi edukasi memakai potret statis di kiri (`assets/img/portraits/`, satu gambar per ekspresi) + area materi besar; adegan cerita memakai sprite biasa yang diam dan hanya berganti ekspresi. Naskah ada di `js/story.js`.

## Aset sprite tanpa mikrofon
Adegan cerita memakai `assets/img/sprites/*.webp` (frame pertama `menucharacters/*` dari Doki Doki Takeover, dipangkas dari XML atlasnya; dicek bahwa semua frame berisi karakter). Aset ini hanya punya satu pose per karakter, jadi di adegan cerita yang berganti hanya pembicara/kotak dialog. Potret diskusi edukasi (`assets/img/portraits`) tetap yang lama (sebagian memegang mikrofon).
