// Model Produk: semua perintah baca ke tabel produk dikumpulkan di sini.
// Inventaris MEMBACA stok di tahap ini — tambah barang, barang masuk/keluar,
// dan ubah stok dibuat di tahap berikutnya. Tabelnya sama persis dengan
// tabel produk di kasir dan katalog, supaya nanti ketiganya bisa digabung.
const pool = require('../config/database');

// Batas stok menipis: 5 ke bawah (tapi masih di atas nol) dianggap menipis.
// Angka ini dipakai di mana-mana, jadi ditaruh di sini saja.
const BATAS_MENIPIS = 5;

// Mengambil semua produk, diurutkan berdasarkan nama.
// Saringannya: 'semua' (bawaan), 'menipis' (stok 1 sampai 5),
// atau 'habis' (stok 0).
async function semuaProduk(saringan) {
  if (saringan === 'menipis') {
    const [baris] = await pool.query(
      'SELECT * FROM produk WHERE stok > 0 AND stok <= ? ORDER BY nama ASC',
      [BATAS_MENIPIS]
    );
    return baris;
  }
  if (saringan === 'habis') {
    const [baris] = await pool.query(
      'SELECT * FROM produk WHERE stok = 0 ORDER BY nama ASC'
    );
    return baris;
  }
  const [baris] = await pool.query('SELECT * FROM produk ORDER BY nama ASC');
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

module.exports = { semuaProduk, ringkasanStok, BATAS_MENIPIS };
