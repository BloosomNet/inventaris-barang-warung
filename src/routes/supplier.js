// Rute supplier: daftar, tambah supplier, dan hubungkan supplier
// dengan produk yang disuplainya.
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.get('/', supplierController.daftarSupplier);
router.post('/', supplierController.tambahSupplier);
router.post('/:id/produk', supplierController.tautkanProduk);

module.exports = router;
