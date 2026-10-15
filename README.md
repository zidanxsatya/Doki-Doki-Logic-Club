# Doki Doki Logic Club

Game visual novel untuk belajar rangkaian logika, dibuat sebagai media pembelajaran mata pelajaran **Teknik Kontrol Mekatronika (TKM)**. Pemain belajar gerbang logika bersama empat karakter dari *Doki Doki Literature Club*: membaca materi, mencoba gerbang secara langsung, mengerjakan latihan, lalu mengikuti evaluasi.

## Isi pelajaran

Materi mencakup dua belas halaman: pengertian rangkaian logika, konsep input dan output, logika 0 dan 1, gerbang AND, OR, NOT, NAND, NOR, XOR, XNOR, tabel kebenaran, dan cara membaca rangkaian yang menggabungkan beberapa gerbang.

## Cara bermain

Menu utama punya lima pilihan.

| Pilihan | Pemandu | Isi |
|---|---|---|
| Cerita | Keempat karakter | Alur lengkap dari pembukaan sampai hasil akhir. Kemajuan tersimpan dan bisa dilanjutkan atau diulang. |
| Materi | Sayori | Dua belas halaman materi dengan diagram gerbang dan tabel kebenaran. |
| Simulasi | Yuri | Tujuh gerbang yang bisa dicoba. Klik kotak input A atau B untuk mengubahnya, lalu lihat output pada lampu LED dan tabel kebenaran. |
| Latihan | Natsuki | Delapan soal acak per sesi: membaca rangkaian, melengkapi tabel kebenaran, mengenali gerbang, dan soal konsep. Soal dibangkitkan ulang setiap sesi. |
| Evaluasi | Monika | Sepuluh soal penilaian akhir dengan kategori nilai dari "Perlu Belajar Lagi" sampai "Sangat Baik". |

Di Mode Cerita, tombol lanjut baru muncul setelah halaman materi terakhir dibaca, syarat Simulasi terpenuhi, serta Latihan dan Evaluasi selesai. Keempat mode lain bisa dibuka kapan saja dari menu.

### Pengaturan

- **Volume Musik** dan **Volume Efek Suara** adalah dua slider yang terpisah.
- **Mode Tampilan**: jendela atau fullscreen (tidak tersedia di Safari iPhone dan iPad).
- **Tata Letak**: otomatis, desktop, atau mobile. Tata letak mobile mendukung potret dan lanskap; mode otomatis memilih mobile pada layar sentuh kecil.
- Semua pengaturan tersimpan di browser.

## Menjalankan

**Lewat GitHub Pages.** Unggah seluruh isi folder ke repositori, lalu buka *Settings > Pages* dan pilih branch `main` dengan folder root.

**Di komputer sendiri.** Jalankan server statis dari folder proyek, lalu buka alamatnya di browser:

```
python -m http.server 8000
```

Buka `http://localhost:8000`. Jangan membuka `index.html` dengan klik ganda, karena browser memblokir pemuatan berkas lokal yang dipakai game.

## Struktur proyek

```
index.html          kerangka halaman
css/style.css       seluruh tampilan, termasuk tata letak mobile (kelas .m dan .p)
js/core.js          pemuat atlas, karakter, audio, mesin dialog, gambar gerbang logika
js/content.js       materi, bank soal latihan, soal evaluasi, kategori nilai, data credit
js/dialogue.js      dialog tiap karakter menurut kepribadiannya
js/story.js         naskah dan alur Mode Cerita, pilihan ekspresi
js/settings.js      pengaturan tersimpan dan penyesuaian layout
js/app.js           menu, navigasi, dan keempat mode mandiri
assets/             gambar, audio, font, dan konfigurasi karakter
tests/              skrip pemeriksaan kurikulum (Node.js)
```

Isi pelajaran diubah di `js/content.js`, gaya bicara karakter di `js/dialogue.js`, dan naskah cerita di `js/story.js`.

### Data yang disimpan di browser

| Kunci | Isi |
|---|---|
| `tkm_settings` | Volume, mode tampilan, tata letak |
| `tkm_story` | Kemajuan Mode Cerita |
| `tkm_latihan_best` | Skor terbaik Latihan |
| `tkm_eval_best` | Jumlah benar terbaik di Evaluasi (0 sampai 10) |

## Atribusi dan hak cipta

Game ini memakai karakter, grafis, musik, dan efek suara dari proyek Doki Doki Takeover. Hak atas semuanya tetap milik pembuat aslinya.

- **Doki Doki Literature Club** dibuat oleh **Dan Salvato** dan Team Salvato. Karakter Sayori, Yuri, Natsuki, dan Monika adalah milik mereka. Proyek ini mengikuti [IP Guidelines Team Salvato](https://teamsalvato.com/ip-guidelines): non-komersial dan gratis. Dukung karya aslinya di [teamsalvato.com](https://teamsalvato.com).
- **Doki Doki Takeover** dibuat oleh **Jorge-SunSpirit** dan kontributornya. Sprite, potret, latar, musik, dan efek suara dalam game ini berasal dari [repositori Doki Doki Takeover](https://github.com/Jorge-SunSpirit/Doki-Doki-Takeover) yang berlisensi Apache 2.0. Teks lisensinya ada di [`LICENSE-DokiDokiTakeover.txt`](LICENSE-DokiDokiTakeover.txt).