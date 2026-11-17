// Rute stok: baca daftar dan ringkasan, plus catat barang masuk/keluar
// (formulir di halaman menyusul di potongan berikutnya).
const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');

router.get('/ringkasan', stokController.ringkasan);
router.get('/perlu-dibeli', stokController.perluDibeli);
router.get('/riwayat', stokController.riwayat);
router.post('/masuk', stokController.barangMasuk);
router.post('/keluar', stokController.barangKeluar);
router.get('/', stokController.daftarStok);

module.exports = router;
