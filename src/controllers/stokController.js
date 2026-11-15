// Pengatur stok: menerima permintaan dari rute, memanggil model,
// lalu mengirim hasilnya sebagai JSON.
const Produk = require('../models/Produk');

// GET /api/stok — daftar produk beserta stoknya.
// Boleh disaring dengan ?saring=menipis atau ?saring=habis,
// misalnya /api/stok?saring=menipis
async function daftarStok(req, res) {
  try {
    const produk = await Produk.semuaProduk(req.query.saring);
    res.json({ produk, batasMenipis: Produk.BATAS_MENIPIS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: 'Gagal mengambil daftar stok' });
  }
}

// GET /api/stok/ringkasan — angka ringkasan buat kartu di halaman utama.
async function ringkasan(req, res) {
  try {
    const data = await Produk.ringkasanStok();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: 'Gagal mengambil ringkasan stok' });
  }
}

module.exports = { daftarStok, ringkasan };
