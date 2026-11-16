# Inventaris Barang Warung

Buat pemilik warung yang pengen tahu stoknya masih berapa tanpa harus ngitung manual. Buka halaman ini, langsung kelihatan mana barang yang masih aman, mana yang mulai menipis, dan mana yang udah habis — jadi ketahuan kapan harus belanja lagi.

## Siapa penggunanya

Pemilik warung atau toko kecil. Selama ini stok cuma diingat-ingat atau dicatat di buku; di sini semuanya kelihatan dalam satu halaman.

## Fitur

- [x] Tahap 1: Kerangka aplikasi dan daftar stok (ringkasan stok, saringan menipis/habis)
- [x] Tahap 2: Barang masuk dan keluar (endpoint + formulir di halaman + tabel riwayat)
- [ ] Tahap 3: Peringatan stok menipis yang lebih jelas
- [ ] Tahap 4: Supplier sederhana (siapa yang nyuplai barang apa)
- [ ] Tahap 5: Pencarian dan tampilan rapi di HP
- [ ] Tahap 6: Deploy online

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

Belum ter-deploy. Tautan demo akan ditulis di sini setelah tahap deploy selesai.

## Kemajuan

Lihat `PROGRESS.md` untuk catatan tiap tahap: apa yang sudah selesai, apa yang belum, dan apa tahap berikutnya.
