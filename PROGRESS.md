# Kemajuan — Inventaris Barang Warung

## Tahap 1 — Selesai: Kerangka aplikasi dan daftar stok

Yang sudah dibuat:
- Struktur folder pola MVC: `src/config`, `src/models`, `src/controllers`, `src/routes`, `public`, dan `database` — sama seperti aplikasi kasir warung dan katalog, supaya nanti bisa digabung
- Server Express di `server.js` yang melayani halaman inventaris dan rute pemeriksaan `/api/sehat`
- Koneksi MySQL di `src/config/database.js` memakai `mysql2` dan pengaturan dari `.env`
- Tabel dibuat otomatis pas server nyala (`src/config/siapkanTabel.js`, dicoba ulang sampai 12 kali kalau basis data belum siap) — jadi pas deploy ke Railway nanti nggak perlu jalanin schema.sql manual
- Skema tabel `produk` di `database/schema.sql` — kolomnya sama persis dengan tabel produk di kasir dan katalog (id, nama, harga, stok, kategori), supaya nanti tinggal digabung jadi satu sistem dengan satu basis data
- Model produk di `src/models/Produk.js` (hanya baca di tahap ini): `semuaProduk` (boleh disaring: semua / menipis / habis) dan `ringkasanStok` (jumlah jenis barang, total stok, berapa yang menipis, berapa yang habis). Batas menipis: stok 1 sampai 5.
- Pengatur stok di `src/controllers/stokController.js` dan rute di `src/routes/stok.js`: `GET /api/stok` (daftar + batas menipis) dan `GET /api/stok/ringkasan`
- Halaman inventaris di `public/index.html` dan `public/js/app.js`: empat kartu angka ringkasan di atas, tombol saringan Semua / Menipis / Habis, dan tabel stok (nama, kategori, harga rupiah, stok). Stok 0 ditulis merah tebal, stok 1-5 kuning tebal.
- CSS di `public/css/style.css`: kartu angka, tombol saringan bulat setinggi minimal 44px supaya gampang diketuk, aturan layar kecil (max-width 600px)

Cara kerja singkat:
- Peramban meminta `GET /api/stok/ringkasan` dan `GET /api/stok` saat halaman dibuka. Server menghitung ringkasan langsung dari tabel `produk`, lalu peramban menampilkannya sebagai kartu angka dan tabel.
- Mengetuk tombol saringan mengirim permintaan baru dengan `?saring=menipis` atau `?saring=habis`, dan server menyaring di basis data.
- Inventaris di tahap ini hanya membaca stok — kasir yang mengurangi stok saat transaksi, dan ubah stok dari inventaris dibuat di tahap berikutnya.

Yang sudah diuji (basis data MariaDB/MySQL lokal):
- Data uji: Kopi Sachet Rp5.000 (Minuman, stok 20), Gula 1kg Rp17.000 (Bahan Dapur, stok 3), Teh Melati Rp4.000 (Minuman, stok 0)
- `GET /api/stok` mengembalikan 3 produk; `?saring=menipis` mengembalikan 1 produk (Gula, stok 3); `?saring=habis` mengembalikan 1 produk (Teh Melati, stok 0)
- `GET /api/stok/ringkasan` mengembalikan total_produk 3, total_stok 23, menipis 1, habis 1
- Halaman `/`, `/css/style.css`, dan `/js/app.js` dimuat HTTP 200, tidak ada error di log server
- Data uji dibersihkan, tabel kembali kosong

Kekurangan saat ini (jujur):
- Belum bisa menambah barang atau mengubah stok dari aplikasi — itu Tahap 2 (barang masuk/keluar).
- Belum ada riwayat pergerakan stok dan belum ada data supplier — itu Tahap 3 dan 4.
- Belum ada kolom pencarian dan belum ter-deploy.
- Catatan: repo GitHub `BloosomNet/inventaris-barang-warung` sudah dibuat 2026-11-15 09:38 WIB lewat browser (publik, kosong, tanpa README awal). Push pertama sempat gagal 404 jam 09:xx WIB karena repo belum ada waktu itu; bikin repo lewat API juga gagal 403 ("Resource not accessible by integration").

## Rencana gabung dengan project lain

Project ini dirancang supaya nanti bisa digabung dengan aplikasi kasir warung dan katalog produk menjadi satu sistem manajemen UMKM:
- Inti bersama yang sama di semua project: stack sama (Node + Express + MySQL), struktur MVC sama (`src/config`, `src/models`, `src/controllers`, `src/routes`, `public`, `database`), penamaan tabel dan kolom sama, format `.env` sama.
- Tabel yang dipakai bersama: `produk` (id, nama, harga, stok, kategori), serta nanti tabel `pengguna` untuk login dan tabel `transaksi` dan `detail_transaksi`.
- Pembagian peran: kasir mengurangi stok saat transaksi, inventaris menambah dan mengelola stok, katalog menampilkan produk yang sama ke pelanggan. Ketiganya memakai tabel `produk` yang sama, supaya nanti tinggal digabung jadi satu sistem: satu login, satu basis data, satu dashboard dengan modul kasir + inventaris + katalog.
- Project yang berjalan paralel: aplikasi-kasir-warung (sudah selesai semua tahap, termasuk login dan deploy) dan katalog-produk-warung (Tahap 2 selesai, berikutnya pesan via WhatsApp).
- Arah jangka panjang: kesulitan naik bertahap — setelah gabung jadi sistem UMKM, tambah modul yang lebih dalam (keuangan warung, laporan dan grafik, export data, pencarian/filter/pagination, multi-pengguna dan peran), menuju aplikasi nyata yang dipakai orang sungguhan. Tiap project tetap maksimal satu konsep baru dan tetap bisa dijelaskan ulang saat interview. Konsep baru project ini: pencatatan barang masuk/keluar (Tahap 2).

## Tahap berikutnya

Tahap 2: Barang masuk dan keluar — formulir tambah stok (barang masuk, dengan catatan supplier dan harga beli) dan kurangi stok (barang keluar/rusak), tersimpan di tabel riwayat stok yang baru, supaya pergerakan stok ketahuan asalnya.
