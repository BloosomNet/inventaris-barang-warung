-- Skema basis data inventaris barang warung.
-- Jalankan berkas ini di MySQL untuk membuat semua tabel yang dibutuhkan.
-- Tabel produk di sini SAMA PERSIS dengan tabel produk di aplikasi-kasir-warung
-- dan katalog-produk-warung (id, nama, harga, stok, kategori), supaya nanti
-- ketiga project bisa digabung menjadi satu sistem manajemen UMKM dengan
-- satu basis data.
CREATE DATABASE IF NOT EXISTS inventaris_warung;
USE inventaris_warung;

CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  kategori VARCHAR(50),
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tiap barang masuk/keluar dicatat di sini, supaya ketahuan stok
-- berubah karena apa dan kapan. jenis cuma 'masuk' atau 'keluar'.
CREATE TABLE IF NOT EXISTS riwayat_stok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id INT NOT NULL,
  jenis ENUM('masuk', 'keluar') NOT NULL,
  jumlah INT NOT NULL,
  harga_beli INT NULL,
  keterangan VARCHAR(255) NULL,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
