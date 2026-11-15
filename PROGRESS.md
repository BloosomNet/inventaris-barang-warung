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
- Formulir barang masuk/keluar di halaman belum ada — endpointnya sudah jalan di potongan 1 (di bawah), tampilannya menyusul potongan 2.
- Belum ada data supplier — itu Tahap 4.
- Belum ada kolom pencarian dan belum ter-deploy.

## Tahap 2 (potongan 1 — selesai): Tabel riwayat + endpoint barang masuk/keluar

Yang dibuat kali ini (sisi server dulu, belum ada tampilannya):
- Tabel baru `riwayat_stok` di `database/schema.sql` dan `src/config/siapkanTabel.js` — jadi kebikin otomatis pas server nyala: id, produk_id, jenis (masuk/keluar), jumlah, harga_beli, keterangan, dibuat_pada. Keterangan diisi nama supplier kalau barang masuk, atau alasan kayak "rusak" kalau barang keluar.
- Model baru `src/models/RiwayatStok.js`: `catat` dan `daftar`. `catat` jalan dalam satu transaksi: kunci baris produknya dulu (`FOR UPDATE`), ubah stoknya, terus simpan baris riwayatnya. Kalau produknya nggak ada atau stok kurang buat barang keluar, semuanya dibatalkan — stok nggak berubah setengah-setengah. `daftar` mengambil riwayat paling baru dulu (maksimal 100 baris), lengkap dengan nama produknya, boleh disaring per produk.
- Tiga endpoint baru di `src/controllers/stokController.js` + `src/routes/stok.js`: `POST /api/stok/masuk` (201 kalau berhasil, 404 kalau produk nggak ada, 400 kalau jumlahnya nggak benar), `POST /api/stok/keluar` (sama, plus 400 kalau jumlah keluar lebih besar dari stok), dan `GET /api/stok/riwayat` (boleh `?produk_id=...`).
- Komentar di `server.js` disesuaikan, dan rencana Tahap 3 di README dibetulkan: riwayat pergerakan stok itu bagian Tahap 2, bukan Tahap 3.

Cara kerja singkat:
- Permintaan masuk/keluar dikirim ke `POST /api/stok/masuk` atau `/api/stok/keluar` dengan produk_id + jumlah. Server mengubah stok produk dan menyimpan jejaknya di `riwayat_stok` dalam satu transaksi, lalu mengembalikan stok barunya. `GET /api/stok/riwayat` dipakai buat melihat jejak itu.

Yang sudah diuji (basis data MariaDB/MySQL lokal, server di port 3002):
- Data uji: Kopi Sachet Rp5.000 (stok 20), Gula 1kg Rp17.000 (stok 3)
- `POST /api/stok/masuk` (Kopi +10, harga beli 4500, keterangan "Toko Sinar") 201, stok jadi 30
- `POST /api/stok/keluar` (Gula -2, keterangan "rusak") 201, stok jadi 1
- `POST /api/stok/keluar` (Gula -5, melebihi stok 1) 400 "Stok tidak cukup", stok tetap 1
- Produk yang tidak ada (id 999) 404; jumlah 0 dan jumlah negatif 400
- `GET /api/stok/riwayat` mengembalikan 2 baris, paling baru dulu, lengkap dengan nama produk; `?produk_id=1` mengembalikan 1 baris
- Regresi: `/api/sehat`, `/api/stok`, `/api/stok/ringkasan`, dan halaman `/` semuanya 200; ringkasan benar (total stok 31, menipis 1). Tidak ada error di log server.
- Catatan: MariaDB lokal mati lagi sebelum uji (sama kayak run-run sebelumnya) — dinyalakan dulu, lalu db `inventaris_warung` + pengguna `inventaris` dibuat ulang dari `.env` lokal karena ikut hilang. Bukan masalah kode.
- Data uji dibersihkan, tabel produk dan riwayat kembali kosong

Kekurangan saat ini (jujur):
- Formulir barang masuk/keluar di halaman belum ada — itu potongan 2.
- Riwayat baru bisa dilihat lewat endpoint, belum tampil di halaman — itu juga potongan 2.
- Belum ada data supplier — itu Tahap 4.
- Belum ada kolom pencarian dan belum ter-deploy.
- Catatan: repo GitHub `BloosomNet/inventaris-barang-warung` sudah dibuat 2026-11-15 09:38 WIB lewat browser (publik, kosong, tanpa README awal). Push pertama sempat gagal 404 jam 09:xx WIB karena repo belum ada waktu itu; bikin repo lewat API juga gagal 403 ("Resource not accessible by integration").

## Rencana gabung dengan project lain

Project ini dirancang supaya nanti bisa digabung dengan aplikasi kasir warung dan katalog produk menjadi satu sistem manajemen UMKM:
- Inti bersama yang sama di semua project: stack sama (Node + Express + MySQL), struktur MVC sama (`src/config`, `src/models`, `src/controllers`, `src/routes`, `public`, `database`), penamaan tabel dan kolom sama, format `.env` sama.
- Tabel yang dipakai bersama: `produk` (id, nama, harga, stok, kategori), serta nanti tabel `pengguna` untuk login dan tabel `transaksi` dan `detail_transaksi`.
- Pembagian peran: kasir mengurangi stok saat transaksi, inventaris menambah dan mengelola stok, katalog menampilkan produk yang sama ke pelanggan. Ketiganya memakai tabel `produk` yang sama, supaya nanti tinggal digabung jadi satu sistem: satu login, satu basis data, satu dashboard dengan modul kasir + inventaris + katalog.
- Project yang berjalan paralel: aplikasi-kasir-warung (sudah selesai semua tahap, termasuk login dan deploy) dan katalog-produk-warung (Tahap 3 selesai, berikutnya pencarian dan filter kategori).
- Arah jangka panjang: kesulitan naik bertahap — setelah gabung jadi sistem UMKM, tambah modul yang lebih dalam (keuangan warung, laporan dan grafik, export data, pencarian/filter/pagination, multi-pengguna dan peran), menuju aplikasi nyata yang dipakai orang sungguhan. Tiap project tetap maksimal satu konsep baru dan tetap bisa dijelaskan ulang saat interview. Konsep baru project ini: pencatatan barang masuk/keluar (Tahap 2).

## Tahap berikutnya

Tahap 2 (potongan 2): Formulir barang masuk/keluar di halaman inventaris (pilih produk, isi jumlah, harga beli, keterangan) dan tampilkan riwayat pergerakan stok di bawah tabel — pakai endpoint yang sudah dibuat di potongan 1.
