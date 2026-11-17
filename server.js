// Titik masuk aplikasi: menjalankan server Express dan melayani halaman inventaris.
// Tahap 1: kerangka + daftar stok. Tahap 2: barang masuk/keluar + riwayat.
// Tahap 3: daftar perlu dibeli. Tahap 4: supplier. Tahap 5: pencarian.
require('dotenv').config();
const express = require('express');
const path = require('path');
const siapkanTabel = require('./src/config/siapkanTabel');

const app = express();
const PORT = process.env.PORT || 3000;

// Membaca data JSON dari permintaan (dipakai saat barang masuk/keluar nanti)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis dari folder public (HTML, CSS, dan JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

// Rute pemeriksaan: memastikan server dan basis data masih bisa dihubungi
app.get('/api/sehat', async (req, res) => {
  res.json({ status: 'ok', pesan: 'Server inventaris warung berjalan' });
});

// Rute stok barang.
app.use('/api/stok', require('./src/routes/stok'));

// Rute supplier.
app.use('/api/supplier', require('./src/routes/supplier'));

// Tabel dibuat dulu sebelum server menerima permintaan, supaya
// endpoint langsung bisa dipakai tanpa jalanin schema.sql manual.
siapkanTabel().then(() => {
  app.listen(PORT, () => {
    console.log(`Server inventaris warung berjalan di http://localhost:${PORT}`);
  });
});
