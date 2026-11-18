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
- Formulir barang masuk/keluar di halaman sudah dibuat di potongan 2 (di bawah).
- Riwayat sudah tampil di halaman — itu juga potongan 2.
- Belum ada data supplier — itu Tahap 4.
- Belum ada kolom pencarian dan belum ter-deploy.
- Catatan: repo GitHub `BloosomNet/inventaris-barang-warung` sudah dibuat 2026-11-15 09:38 WIB lewat browser (publik, kosong, tanpa README awal). Push pertama sempat gagal 404 jam 09:xx WIB karena repo belum ada waktu itu; bikin repo lewat API juga gagal 403 ("Resource not accessible by integration").

## Tahap 2 (potongan 2 — selesai): Formulir barang masuk/keluar + riwayat di halaman

Yang dibuat kali ini:
- Formulir di `public/index.html`: pilih barang (dropdown), jenis masuk/keluar, jumlah, harga beli, keterangan. Harga beli cuma muncul kalau jenisnya masuk — kalau keluar, kolomnya disembunyiin biar nggak bingung.
- Logika di `public/js/app.js`: dropdown barang diisi dari `/api/stok` (semua barang, termasuk yang stoknya habis); kirim ke `POST /api/stok/masuk` atau `/api/stok/keluar` sesuai jenis yang dipilih. Kalau berhasil muncul pesan hijau berisi stok barunya, formulir ke-reset, terus ringkasan, tabel stok, pilihan barang, dan riwayat dimuat ulang. Kalau gagal (misalnya stok kurang buat barang keluar) muncul pesan merah dari server.
- Tabel riwayat di bawah tabel stok: waktu, barang, jenis (Masuk hijau / Keluar merah), jumlah, harga beli, keterangan. Diambil dari `GET /api/stok/riwayat`, paling baru dulu. Nama barang dan keterangan diamankan dulu sebelum ditempel ke halaman, biar tanda `<` `>` dari ketikan pengguna nggak kebaca sebagai HTML.
- Gaya baru di `public/css/style.css`: formulir dua kolom (jadi satu kolom di HP), kolom isian setinggi 44px, tombol utama hijau, pesan berhasil hijau dan gagal merah, label jenis masuk/keluar. Antar kartu dikasih jarak.
- Catatan di bawah halaman diubah: sekarang tinggal "Daftar supplier menyusul di tahap berikutnya."

Cara kerja singkat:
- Pemilik pilih barang, jenis, jumlah, lalu simpan. Peramban kirim ke endpoint masuk/keluar yang dibuat di potongan 1 — server yang mengubah stok dan mencatat riwayatnya dalam satu transaksi. Sesudah berhasil, halaman memuat ulang datanya sendiri, jadi stok baru dan baris riwayat langsung kelihatan tanpa muat ulang halaman.

Yang sudah diuji (basis data MariaDB/MySQL lokal, server di port 3002):
- Data uji: Kopi Sachet Rp5.000 (stok 20), Gula 1kg Rp17.000 (stok 3)
- `POST /api/stok/masuk` Kopi +10, harga beli 4500, keterangan "Toko Sinar" — 201, stok jadi 30
- `POST /api/stok/keluar` Gula -2, keterangan "rusak" — 201, stok jadi 1
- `POST /api/stok/keluar` Gula -5 ditolak 400 "Stok tidak cukup", stok tetap 1
- `GET /api/stok/riwayat` mengembalikan 2 baris, paling baru dulu, lengkap dengan nama produk, harga beli, dan keterangan
- `GET /api/stok/ringkasan` benar: total produk 2, total stok 31, menipis 1, habis 0
- Halaman `/`, `/css/style.css`, `/js/app.js`, `/api/sehat`, dan `/api/stok/ringkasan` dimuat HTTP 200; semua elemen formulir dan tabel riwayat ada di halaman; CSS baru ikut tersaji; tidak ada error di log server
- Catatan: MariaDB lokal mati lagi sebelum uji — dinyalakan dulu, lalu db `inventaris_warung` + pengguna `inventaris` dibuat ulang dari `.env` lokal karena ikut hilang. Bukan masalah kode.
- Data uji dibersihkan, tabel produk dan riwayat kembali kosong

Kekurangan saat ini (jujur):
- Riwayat cuma menampilkan 100 baris terbaru, belum bisa disaring per barang dari halaman (endpointnya sudah bisa `?produk_id=`, tampilannya belum).
- Belum ada data supplier — itu Tahap 4.
- Belum ada kolom pencarian dan belum ter-deploy.
- Klik tombol simpan di peramban sungguhan belum diuji — yang diuji endpointnya lewat curl dan elemen halamannya; alur kirim formulirnya memakai fetch yang sama seperti di kode.

## Rencana gabung dengan project lain

Project ini dirancang supaya nanti bisa digabung dengan aplikasi kasir warung dan katalog produk menjadi satu sistem manajemen UMKM:
- Inti bersama yang sama di semua project: stack sama (Node + Express + MySQL), struktur MVC sama (`src/config`, `src/models`, `src/controllers`, `src/routes`, `public`, `database`), penamaan tabel dan kolom sama, format `.env` sama.
- Tabel yang dipakai bersama: `produk` (id, nama, harga, stok, kategori), serta nanti tabel `pengguna` untuk login dan tabel `transaksi` dan `detail_transaksi`.
- Pembagian peran: kasir mengurangi stok saat transaksi, inventaris menambah dan mengelola stok, katalog menampilkan produk yang sama ke pelanggan. Ketiganya memakai tabel `produk` yang sama, supaya nanti tinggal digabung jadi satu sistem: satu login, satu basis data, satu dashboard dengan modul kasir + inventaris + katalog.
- Project yang berjalan paralel: aplikasi-kasir-warung (sudah selesai semua tahap, termasuk login dan deploy) dan katalog-produk-warung (Tahap 3 selesai, berikutnya pencarian dan filter kategori).
- Arah jangka panjang: kesulitan naik bertahap — setelah gabung jadi sistem UMKM, tambah modul yang lebih dalam (keuangan warung, laporan dan grafik, export data, pencarian/filter/pagination, multi-pengguna dan peran), menuju aplikasi nyata yang dipakai orang sungguhan. Tiap project tetap maksimal satu konsep baru dan tetap bisa dijelaskan ulang saat interview. Konsep baru project ini: pencatatan barang masuk/keluar (Tahap 2).

## Tahap berikutnya

Tahap 3: Peringatan stok menipis yang lebih jelas — barang yang perlu segera dibeli lagi ditampilkan menonjol di atas halaman, bukan cuma warna di tabel.

## Tahap 3 — Selesai: Peringatan stok menipis yang lebih jelas

Yang dibuat kali ini:
- Model `src/models/Produk.js`: fungsi baru `perluDibeli` — produk yang stoknya habis atau menipis (stok ≤ batas menipis), diurutkan dari stok paling kecil, jadi yang paling mendesak paling atas.
- Endpoint baru `GET /api/stok/perlu-dibeli` di `src/controllers/stokController.js` + `src/routes/stok.js`, menjawab daftarnya plus batas menipisnya.
- Kartu "⚠️ Perlu dibeli lagi" di `public/index.html` tepat di bawah kartu angka: tiap barang ditulis dengan lencana Habis (merah) atau Menipis (kuning) dan sisa stoknya. Kalau tidak ada yang perlu dibeli, kartunya disembunyikan dan diganti tulisan "Semua stok masih aman".
- Logika `muatPeringatan` di `public/js/app.js`, dimuat ulang tiap barang masuk/keluar berhasil dicatat. Nama barang diamankan dulu sebelum ditempel ke halaman, seperti di tabel lain.
- Gaya kartu peringatan di `public/css/style.css`: tepi kuning tegas dan latar krem, biar langsung kelihatan beda dari kartu biasa.

Cara kerja singkat:
- Peramban meminta `GET /api/stok/perlu-dibeli` saat halaman dibuka. Server menyaring produk dengan stok ≤ 5 di basis data dan mengurutkannya dari yang paling kecil, lalu peramban menampilkannya sebagai daftar peringatan.

## Tahap 4 — Selesai: Supplier sederhana

Yang dibuat kali ini:
- Dua tabel baru di `database/schema.sql` dan `src/config/siapkanTabel.js` (jadi kebikin otomatis pas server nyala): `supplier` (nama, kontak, alamat) dan `supplier_produk` (hubungan supplier dengan produk, satu pasangan cuma boleh sekali lewat kunci unik). Tabel `produk` tidak diubah, supaya tetap sama dengan kasir dan katalog.
- Model baru `src/models/Supplier.js`: `semua` (lengkap dengan jumlah barang dan nama barang yang disuplai, diambil dengan GROUP_CONCAT), `cariBerdasarkanId`, `tambah`, dan `tautkan` (INSERT IGNORE, jadi menghubungkan dua kali tidak dobel; produk yang tidak ada dijawab dengan kode galat khusus).
- Pengatur baru `src/controllers/supplierController.js` dan rute `src/routes/supplier.js` (didaftarkan di `server.js`): `GET /api/supplier`, `POST /api/supplier` (nama wajib diisi, 400 kalau kosong; kontak dan alamat boleh kosong), dan `POST /api/supplier/:id/produk` (404 kalau supplier atau produknya tidak ada).
- Bagian Supplier di `public/index.html`: formulir tambah supplier, daftar supplier beserta barang yang disuplai masing-masing, dan formulir hubungkan supplier dengan barang.
- Logika di `public/js/app.js`: `muatSupplier` dan `muatPilihanTautan`, plus kirim kedua formulirnya. Pilihan supplier yang sedang dipilih dipertahankan sesudah daftar dimuat ulang.

Cara kerja singkat:
- Pemilik menambah supplier sekali, lalu menghubungkannya dengan barang yang biasa dibeli dari supplier itu. Sesudah itu daftar supplier di halaman langsung menunjukkan siapa menyuplai apa — pas stok menipis, tinggal lihat daftar peringatan Tahap 3 lalu cek supplier-nya di sini.

## Tahap 5 — Selesai: Pencarian dan tampilan rapi di HP

Yang dibuat kali ini:
- Model `src/models/Produk.js`: `semuaProduk` sekarang menerima kata kunci — kalau ada, produk disaring dengan `LIKE` pada nama atau kategori. Tanda `%`, `_`, dan `\` diamankan dulu supaya dianggap huruf biasa, bukan pola. Sengaja tanpa klausa `ESCAPE` tambahan, sama seperti di kasir dan katalog (MariaDB pernah menolaknya dan bikin 500).
- Pengatur `src/controllers/stokController.js`: `daftarStok` membaca kata kunci dari `?cari=`, dipangkas dan dibatasi 100 huruf. Pencarian dan saringan (semua/menipis/habis) boleh dipakai bareng.
- Kolom pencarian di `public/index.html` di atas tombol saringan, tipe `search`. Di `public/js/app.js`, permintaan baru dikirim 300 ms sesudah berhenti mengetik (debounce), kata kunci dan saringan yang aktif disimpan di variabel supaya tidak saling menghapus. Kalau tidak ada yang cocok, muncul pesan "Tidak ada barang yang cocok dengan ...".
- Perbaikan kecil sekalian: nama dan kategori produk di tabel stok sekarang diamankan dulu sebelum ditempel ke halaman (sebelumnya langsung ditempel, tidak seperti tabel riwayat yang sudah diamankan).
- Tampilan HP di `public/css/style.css`: kedua tabel dibungkus `.bungkus-tabel` yang bisa digeser ke samping di layar kecil (kolom tidak kepotong), kolom pencarian setinggi 44px dengan huruf 16px supaya peramban HP tidak memperbesar layar saat disentuh, dan aturan layar sangat kecil (max-width 400px) membuat tabel lebih ringkas. Kartu angka memang sudah jadi dua kolom di layar kecil sejak Tahap 1.

Yang sudah diuji untuk Tahap 3–5 (basis data MariaDB 10.11 lokal, server di port 3002):
- Data uji: Kopi Sachet Rp5.000 (stok 20), Gula 1kg Rp17.000 (stok 3), Teh Melati Rp4.000 (stok 0), Mie Instan Rp3.500 (stok 50)
- `GET /api/stok/perlu-dibeli` mengembalikan 2 barang dengan urutan benar: Teh Melati (0) dulu, lalu Gula 1kg (3)
- `GET /api/stok?cari=kopi` mengembalikan 1 hasil (Kopi Sachet); `?cari=%` mengembalikan 0 hasil (tanda pola tidak dianggap pola); `?cari=minuman&saring=habis` mengembalikan Teh Melati — gabungan cari + saring jalan
- `POST /api/supplier` dengan nama "Toko Sinar" 201 dan tersimpan; tanpa nama 400 "Nama supplier wajib diisi"
- `POST /api/supplier/1/produk` (Kopi Sachet) 201; diulang tetap 201 dan hubungannya tidak dobel (jumlah_produk tetap 1); produk 999 dijawab 404; supplier 999 dijawab 404
- `GET /api/supplier` mengembalikan Toko Sinar lengkap dengan nama_produk "Kopi Sachet"
- Regresi: `POST /api/stok/masuk` Gula +10 (stok 3 jadi 13) 201, dan sesudah itu daftar perlu-dibeli tinggal Teh Melati saja; `/api/sehat`, halaman `/`, `/css/style.css`, dan `/js/app.js` semuanya 200; elemen kartu peringatan, kolom cari, dan kedua formulir supplier ada di halaman; tidak ada error di log server
- Data uji dibersihkan, semua tabel kembali kosong, server dimatikan sesudah uji

Kekurangan saat ini (jujur):
- Supplier belum bisa diubah atau dihapus dari halaman, dan hubungan supplier–produk belum bisa dilepas dari halaman — endpointnya pun belum ada.
- Daftar peringatan belum menampilkan supplier-nya sekalian; pemilik masih perlu cek bagian Supplier sendiri.
- Klik formulir di peramban sungguhan belum diuji — yang diuji endpointnya lewat curl dan elemen halamannya; alur kirim formulirnya memakai fetch yang sama seperti kode tahap sebelumnya.
- Belum ter-deploy — itu Tahap 6.

## Tahap berikutnya

Tahap 6: Deploy online — pola yang sama seperti aplikasi kasir (Railway, tabel kebikin sendiri pas server nyala sudah siap dari Tahap 1).

## Persiapan Tahap 6 — Deploy (menunggu persetujuan)

Kesiapan deploy sudah diperiksa (18 Nov 2026):
- `server.js` membaca port dari env `PORT` (Railway mengisinya otomatis) dan menjalankan `siapkanTabel()` sebelum listen — tabel kebikin sendiri pas server nyala, sama seperti pola kasir dan katalog.
- `package.json` punya script `start`. `.env` tertutup `.gitignore`. Tidak ada perubahan kode yang dibutuhkan buat deploy.
- Uji lokal ulang 18 Nov (MariaDB 10.11, port 3002): server sehat (`/api/sehat` ok), halaman utama tampil penuh dengan data contoh (ringkasan, peringatan stok habis, tabel stok, formulir masuk/keluar, riwayat, supplier) — sudah dilihat dan disetujui user lewat screenshot.

Yang belum dilakukan (menunggu persetujuan user, sesuai gerbang QC):
- Membuat service Railway buat repo ini + service MySQL-nya, mengisi env DB, dan deploy beneran.
- Sesudah demo live terverifikasi: centang Tahap 6 di README + tulis link demo, lalu push dokumentasi penutup.

## Tahap 6 — Selesai: Deploy online (18 Nov 2026)

Yang dilakukan:
- Service `inventaris-barang-warung` dibuat di Railway (project yang sama dengan kasir dan katalog) dari repo ini, branch main, dan domain publik dibuat: https://inventaris-barang-warung-production.up.railway.app
- Kendala: MySQL service terpisah TIDAK bisa ditambahkan — Railway menolak dengan pesan "Free plan resource provision limit exceeded" (batas jumlah resource plan gratis/Trial sudah mentok). Sesudah pilihan user, aplikasi memakai instance MySQL katalog yang sudah ada dengan database terpisah sendiri `inventaris_warung` — data katalog tidak disentuh. Env aplikasi diisi sebagai referensi Railway ke service MySQL itu (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD) + DB_NAME=inventaris_warung.
- Tabel kebikin otomatis pas server pertama nyala (pola siapkanTabel), terverifikasi: produk, riwayat_stok, supplier, supplier_produk.
- Demo diisi data contoh lewat editor query Railway (aplikasi memang tidak punya endpoint tambah produk — produk berasal dari data kasir): 5 barang, 2 supplier + 3 hubungan supplier–produk, 4 catatan riwayat (2 masuk, 2 keluar).

Yang sudah diuji (live, 18 Nov 2026):
- `GET /api/sehat` → ok; `GET /api/stok/ringkasan` → 5 produk, total stok 89, menipis 0, habis 1.
- `GET /api/stok`, `/api/stok/riwayat`, `/api/supplier` mengembalikan data contoh dengan benar; halaman utama tampil penuh (kartu ringkasan, peringatan Minyak Goreng habis, tabel stok, riwayat, supplier) — bukti screenshot dilihat user.
- Katalog (tetangga satu MySQL) dicek ulang sesudah perubahan: tetap normal, produknya utuh.

Kekurangan saat ini (jujur):
- Satu instance MySQL dipakai dua aplikasi (database tetap terpisah). Kalau nanti plan Railway di-upgrade, inventaris bisa dipindah ke MySQL sendiri tanpa ubah kode — cukup ganti env.
- Kekurangan lama Tahap 3–5 masih berlaku (supplier belum bisa diubah/dihapus dari halaman, dsb.).

## Tahap berikutnya

Semua tahap selesai. Pengembangan berikutnya mengikuti fase penggabungan di repo `sistem-manajemen-umkm`.
