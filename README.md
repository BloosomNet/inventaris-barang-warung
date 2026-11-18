# Inventaris Barang Warung

Buat pemilik warung yang pengen tahu stoknya masih berapa tanpa harus ngitung manual. Buka halaman ini, langsung kelihatan mana barang yang masih aman, mana yang mulai menipis, dan mana yang udah habis — jadi ketahuan kapan harus belanja lagi.

## Siapa penggunanya

Pemilik warung atau toko kecil. Selama ini stok cuma diingat-ingat atau dicatat di buku; di sini semuanya kelihatan dalam satu halaman.

## Fitur

- [x] Tahap 1: Kerangka aplikasi dan daftar stok (ringkasan stok, saringan menipis/habis)
- [x] Tahap 2: Barang masuk dan keluar (endpoint + formulir di halaman + tabel riwayat)
- [x] Tahap 3: Peringatan stok menipis yang lebih jelas (daftar "Perlu dibeli lagi" di atas halaman, dari yang paling mendesak)
- [x] Tahap 4: Supplier sederhana (siapa yang nyuplai barang apa)
- [x] Tahap 5: Pencarian dan tampilan rapi di HP (kolom cari gabung saringan, tabel bisa digeser di layar kecil)
- [x] Tahap 6: Deploy online

## Teknologi yang dipakai

- Node.js dan Express.js — server dan REST API
- MySQL — basis data produk (tabel yang sama dengan aplikasi kasir warung)
- HTML5, CSS3, dan JavaScript — tampilan dan interaksi di peramban
- Fetch API — mengambil data dari server

## Cara menjalankan

1. Salin berkas `.env.example` menjadi `.env`, lalu isi pengaturannya:

   ```bash
   cp .env.example .env
   ```

2. Buat basis data dari berkas `database/schema.sql` di MySQL.
3. Buat pengguna basis data yang sama dengan isi `.env` (misalnya pengguna `inventaris` dengan kata sandi yang kamu tulis di `.env`):

   ```sql
   CREATE USER 'inventaris'@'localhost' IDENTIFIED BY 'kata-sandi-di-.env';
   GRANT ALL PRIVILEGES ON inventaris_warung.* TO 'inventaris'@'localhost';
   ```

4. Pasang paket yang dibutuhkan:

   ```bash
   npm install
   ```

5. Jalankan server:

   ```bash
   npm start
   ```

6. Buka di peramban: http://localhost:3002

## Demo

Tersedia online: https://inventaris-barang-warung-production.up.railway.app

Di-deploy ke Railway (Node.js + MySQL). Demo sudah diisi data contoh (5 barang, 2 supplier, beberapa catatan stok masuk/keluar) supaya halaman langsung kelihatan hidup. Catatan teknis: karena batas jumlah resource di plan Railway yang dipakai, aplikasi ini memakai instance MySQL yang sama dengan katalog-produk-warung, tapi databasenya terpisah sendiri (`inventaris_warung`).

## Kemajuan

Lihat `PROGRESS.md` untuk catatan tiap tahap: apa yang sudah selesai, apa yang belum, dan apa tahap berikutnya.
