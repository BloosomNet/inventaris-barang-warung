// Rute stok (hanya baca di tahap ini — ubah stok menyusul di tahap berikutnya).
const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');

router.get('/ringkasan', stokController.ringkasan);
router.get('/', stokController.daftarStok);

module.exports = router;
