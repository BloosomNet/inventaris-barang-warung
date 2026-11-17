// Model Produk: semua perintah baca ke tabel produk dikumpulkan di sini.
// Tabelnya sama persis dengan tabel produk di kasir dan katalog, supaya
// nanti ketiganya bisa digabung.
const pool = require('../config/database');

// Batas stok menipis: 5 ke bawah (tapi masih di atas nol) dianggap menipis.
// Angka ini dipakai di mana-mana, jadi ditaruh di sini saja.
const BATAS_MENIPIS = 5;

// Kata kunci pencarian diamankan dulu: tanda %, _, dan \ dianggap huruf
// biasa, bukan pola LIKE. Sama seperti di kasir dan katalog — sengaja
// tanpa klausa ESCAPE tambahan, karena MariaDB pernah menolaknya (500).
function amankanPola(cari) {
  return cari.replace(/[%_\\]/g, (tanda) => '\\' + tanda);
}

// Mengambil semua produk, diurutkan berdasarkan nama.
// Saringannya: 'semua' (bawaan), 'menipis' (stok 1 sampai 5),
// atau 'habis' (stok 0). Kata kunci cari (boleh kosong) mencocokkan
// nama atau kategori, dan boleh dipakai bareng saringan.
async function semuaProduk(saringan, cari) {
  const syarat = [];
  const nilai = [];
  if (saringan === 'menipis') {
    syarat.push('stok > 0 AND stok <= ?');
    nilai.push(BATAS_MENIPIS);
  } else if (saringan === 'habis') {
    syarat.push('stok = 0');
  }
  if (cari) {
    syarat.push('(nama LIKE ? OR kategori LIKE ?)');
    const pola = '%' + amankanPola(cari) + '%';
    nilai.push(pola, pola);
  }
  const klausa = syarat.length ? ' WHERE ' + syarat.join(' AND ') : '';
  const [baris] = await pool.query(
    'SELECT * FROM produk' + klausa + ' ORDER BY nama ASC',
    nilai
  );
  return baris;
}

// Daftar belanja: produk yang perlu dibeli lagi — stoknya habis atau
// menipis — diurutkan dari yang paling mendesak (stok paling kecil dulu).
async function perluDibeli() {
  const [baris] = await pool.query(
    'SELECT * FROM produk WHERE stok <= ? ORDER BY stok ASC, nama ASC',
    [BATAS_MENIPIS]
  );
  return baris;
}

// Ringkasan stok buat kartu di atas halaman: jumlah produk, total stok,
// berapa yang menipis, dan berapa yang habis. Dihitung sekali jalan
// dari tabel produk.
async function ringkasanStok() {
  const [baris] = await pool.query(
    `SELECT
      COUNT(*) AS total_produk,
      COALESCE(SUM(stok), 0) AS total_stok,
      COALESCE(SUM(CASE WHEN stok > 0 AND stok <= ? THEN 1 ELSE 0 END), 0) AS menipis,
      COALESCE(SUM(CASE WHEN stok = 0 THEN 1 ELSE 0 END), 0) AS habis
     FROM produk`,
    [BATAS_MENIPIS]
  );
  return baris[0];
}

module.exports = { semuaProduk, ringkasanStok, perluDibeli, BATAS_MENIPIS };
