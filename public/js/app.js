// Halaman inventaris: mengambil ringkasan dan daftar stok dari server,
// lalu menampilkannya. Saringan Semua / Menipis / Habis cuma ganti
// permintaan ke server, datanya tetap diambil dari basis data.
const daftarStok = document.getElementById('daftar-stok');
const pesan = document.getElementById('pesan');
const kosong = document.getElementById('kosong');
const saringan = document.getElementById('saringan');
const pilihProduk = document.getElementById('pilih-produk');
const pilihJenis = document.getElementById('pilih-jenis');
const kolomHargaBeli = document.getElementById('kolom-harga-beli');
const formPergerakan = document.getElementById('form-pergerakan');
const pesanForm = document.getElementById('pesan-form');
const daftarRiwayat = document.getElementById('daftar-riwayat');
const pesanRiwayat = document.getElementById('pesan-riwayat');
const riwayatKosong = document.getElementById('riwayat-kosong');
const kartuPeringatan = document.getElementById('kartu-peringatan');
const daftarPeringatan = document.getElementById('daftar-peringatan');
const stokAman = document.getElementById('stok-aman');
const kolomCari = document.getElementById('cari');
const formSupplier = document.getElementById('form-supplier');
const pesanSupplier = document.getElementById('pesan-supplier');
const daftarSupplier = document.getElementById('daftar-supplier');
const supplierKosong = document.getElementById('supplier-kosong');
const formTautan = document.getElementById('form-tautan');
const pesanTautan = document.getElementById('pesan-tautan');
const tautanSupplier = document.getElementById('tautan-supplier');
const tautanProduk = document.getElementById('tautan-produk');

let saringAktif = '';
let cariAktif = '';

// Teks dari pengguna (nama barang, keterangan) jangan langsung ditempel
// ke halaman — diamankan dulu biar tanda < > nggak kebaca sebagai HTML.
function amankanTeks(teks) {
  return String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Harga ditampilkan dengan format rupiah, misal 5000 jadi Rp5.000.
function formatRupiah(nilai) {
  return 'Rp' + Number(nilai).toLocaleString('id-ID');
}

// Mengambil angka ringkasan (total produk, total stok, menipis, habis)
// dan menaruhnya di kartu atas.
async function muatRingkasan() {
  const res = await fetch('/api/stok/ringkasan');
  if (!res.ok) return;
  const data = await res.json();
  document.getElementById('total-produk').textContent = data.total_produk;
  document.getElementById('total-stok').textContent = data.total_stok;
  document.getElementById('stok-menipis').textContent = data.menipis;
  document.getElementById('stok-habis').textContent = data.habis;
}

// Mengambil daftar stok sesuai saringan yang aktif, lalu mengisi tabel.
// Stok 0 ditulis merah tebal, stok 1-5 kuning tebal, sisanya biasa.
async function muatStok() {
  pesan.textContent = 'Memuat...';
  const parameter = new URLSearchParams();
  if (saringAktif) parameter.set('saring', saringAktif);
  if (cariAktif) parameter.set('cari', cariAktif);
  const alamat = parameter.toString() ? `/api/stok?${parameter}` : '/api/stok';
  const res = await fetch(alamat);
  if (!res.ok) {
    pesan.textContent = 'Gagal mengambil daftar stok, coba muat ulang halaman.';
    return;
  }
  const data = await res.json();
  pesan.textContent = '';
  daftarStok.innerHTML = '';
  kosong.hidden = data.produk.length > 0;
  kosong.textContent = cariAktif
    ? `Tidak ada barang yang cocok dengan "${cariAktif}".`
    : 'Belum ada barang di sini.';

  data.produk.forEach((p) => {
    const baris = document.createElement('tr');
    let kelasStok = '';
    if (p.stok === 0) kelasStok = 'stok-habis';
    else if (p.stok <= data.batasMenipis) kelasStok = 'stok-menipis';
    baris.innerHTML =
      `<td>${amankanTeks(p.nama)}</td>` +
      `<td>${amankanTeks(p.kategori || '–')}</td>` +
      `<td>${formatRupiah(p.harga)}</td>` +
      `<td class="${kelasStok}">${p.stok}</td>`;
    daftarStok.appendChild(baris);
  });
}

// Tombol saringan: ganti yang aktif, lalu muat ulang daftarnya.
saringan.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-saring]');
  if (!tombol) return;
  saringan.querySelectorAll('.tombol-saring').forEach((b) => b.classList.remove('aktif'));
  tombol.classList.add('aktif');
  saringAktif = tombol.dataset.saring;
  muatStok();
});

// Mengisi pilihan barang di formulir dari daftar stok (tanpa saringan,
// biar semua barang bisa dipilih walaupun stoknya lagi habis).
async function muatPilihanProduk() {
  const res = await fetch('/api/stok');
  if (!res.ok) return;
  const data = await res.json();
  const dipilih = pilihProduk.value;
  pilihProduk.innerHTML = '<option value="">Pilih barang dulu</option>';
  data.produk.forEach((p) => {
    const pilihan = document.createElement('option');
    pilihan.value = p.id;
    pilihan.textContent = `${p.nama} (stok ${p.stok})`;
    pilihProduk.appendChild(pilihan);
  });
  // Kalau barang yang tadi dipilih masih ada, tetap dipilih.
  if (dipilih) pilihProduk.value = dipilih;
}

// Harga beli cuma dipakai buat barang masuk — kalau jenisnya keluar,
// kolomnya disembunyiin aja biar nggak bingung.
function aturKolomHargaBeli() {
  const masuk = pilihJenis.value === 'masuk';
  kolomHargaBeli.hidden = !masuk;
  if (!masuk) document.getElementById('harga-beli').value = '';
}

pilihJenis.addEventListener('change', aturKolomHargaBeli);

// Kirim formulir: barang masuk ke /api/stok/masuk, barang keluar ke
// /api/stok/keluar. Kalau berhasil, daftar stok, ringkasan, dan riwayat
// dimuat ulang supaya angkanya langsung berubah.
formPergerakan.addEventListener('submit', async (e) => {
  e.preventDefault();
  pesanForm.textContent = 'Menyimpan...';
  pesanForm.className = 'pesan';

  const jenis = pilihJenis.value;
  const badan = {
    produk_id: Number(pilihProduk.value),
    jumlah: Number(document.getElementById('jumlah').value),
    keterangan: document.getElementById('keterangan').value.trim() || null,
  };
  if (jenis === 'masuk') {
    const hargaBeli = document.getElementById('harga-beli').value;
    if (hargaBeli !== '') badan.harga_beli = Number(hargaBeli);
  }

  const res = await fetch(`/api/stok/${jenis}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badan),
  });
  const data = await res.json();
  if (!res.ok) {
    pesanForm.textContent = data.pesan || 'Gagal menyimpan, coba lagi.';
    pesanForm.classList.add('pesan-gagal');
    return;
  }
  pesanForm.textContent = `${data.pesan} — stok sekarang ${data.stok_baru}.`;
  pesanForm.classList.add('pesan-berhasil');
  formPergerakan.reset();
  aturKolomHargaBeli();
  muatRingkasan();
  muatPeringatan();
  muatStok();
  muatPilihanProduk();
  muatRiwayat();
  muatPilihanTautan();
});

// Mengambil riwayat pergerakan stok (paling baru dulu) lalu mengisi tabel.
// Waktu ditampilkan dengan format Indonesia, harga beli kosong ditulis "–".
async function muatRiwayat() {
  pesanRiwayat.textContent = 'Memuat...';
  const res = await fetch('/api/stok/riwayat');
  if (!res.ok) {
    pesanRiwayat.textContent = 'Gagal mengambil riwayat stok, coba muat ulang halaman.';
    return;
  }
  const data = await res.json();
  pesanRiwayat.textContent = '';
  daftarRiwayat.innerHTML = '';
  riwayatKosong.hidden = data.riwayat.length > 0;

  data.riwayat.forEach((r) => {
    const baris = document.createElement('tr');
    const waktu = new Date(r.dibuat_pada).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const jenis = r.jenis === 'masuk'
      ? '<span class="jenis-masuk">Masuk</span>'
      : '<span class="jenis-keluar">Keluar</span>';
    baris.innerHTML =
      `<td>${waktu}</td>` +
      `<td>${amankanTeks(r.nama_produk)}</td>` +
      `<td>${jenis}</td>` +
      `<td>${r.jumlah}</td>` +
      `<td>${r.harga_beli === null ? '–' : formatRupiah(r.harga_beli)}</td>` +
      `<td>${r.keterangan ? amankanTeks(r.keterangan) : '–'}</td>`;
    daftarRiwayat.appendChild(baris);
  });
}

// Daftar perlu dibeli: barang habis/menipis ditampilkan menonjol di atas,
// dari yang stoknya paling kecil. Kalau tidak ada, tampilkan kabar aman.
async function muatPeringatan() {
  const res = await fetch('/api/stok/perlu-dibeli');
  if (!res.ok) return;
  const data = await res.json();
  daftarPeringatan.innerHTML = '';
  kartuPeringatan.hidden = data.produk.length === 0;
  stokAman.hidden = data.produk.length > 0;
  data.produk.forEach((p) => {
    const item = document.createElement('li');
    const habis = p.stok === 0;
    item.innerHTML =
      `<span class="lencana ${habis ? 'lencana-habis' : 'lencana-menipis'}">${habis ? 'Habis' : 'Menipis'}</span>` +
      `<strong>${amankanTeks(p.nama)}</strong>` +
      `<span class="sisa">sisa ${p.stok}</span>`;
    daftarPeringatan.appendChild(item);
  });
}

// Pencarian: permintaan baru dikirim 300 ms sesudah berhenti mengetik,
// supaya server tidak dibanjiri tiap ketikan. Sama seperti di kasir.
let jedaCari = null;
kolomCari.addEventListener('input', () => {
  clearTimeout(jedaCari);
  jedaCari = setTimeout(() => {
    cariAktif = kolomCari.value.trim();
    muatStok();
  }, 300);
});

// Daftar supplier beserta barang yang disuplai masing-masing.
async function muatSupplier() {
  const res = await fetch('/api/supplier');
  if (!res.ok) return;
  const data = await res.json();
  daftarSupplier.innerHTML = '';
  supplierKosong.hidden = data.supplier.length > 0;
  const dipilih = tautanSupplier.value;
  tautanSupplier.innerHTML = '<option value="">Pilih supplier dulu</option>';
  data.supplier.forEach((s) => {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-supplier';
    kartu.innerHTML =
      `<strong>${amankanTeks(s.nama)}</strong>` +
      (s.kontak ? `<span class="kontak">${amankanTeks(s.kontak)}</span>` : '') +
      `<span class="suplai">${s.nama_produk ? 'Menyuplai: ' + amankanTeks(s.nama_produk) : 'Belum ada barang yang dihubungkan.'}</span>`;
    daftarSupplier.appendChild(kartu);
    const pilihan = document.createElement('option');
    pilihan.value = s.id;
    pilihan.textContent = s.nama;
    tautanSupplier.appendChild(pilihan);
  });
  if (dipilih) tautanSupplier.value = dipilih;
}

// Pilihan barang di formulir hubungkan supplier: isinya sama seperti
// pilihan barang di formulir pergerakan, diambil dari /api/stok.
async function muatPilihanTautan() {
  const res = await fetch('/api/stok');
  if (!res.ok) return;
  const data = await res.json();
  tautanProduk.innerHTML = '<option value="">Pilih barang dulu</option>';
  data.produk.forEach((p) => {
    const pilihan = document.createElement('option');
    pilihan.value = p.id;
    pilihan.textContent = p.nama;
    tautanProduk.appendChild(pilihan);
  });
}

// Tambah supplier baru lewat POST /api/supplier.
formSupplier.addEventListener('submit', async (e) => {
  e.preventDefault();
  pesanSupplier.textContent = 'Menyimpan...';
  pesanSupplier.className = 'pesan';
  const res = await fetch('/api/supplier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: document.getElementById('supplier-nama').value.trim(),
      kontak: document.getElementById('supplier-kontak').value.trim() || null,
      alamat: document.getElementById('supplier-alamat').value.trim() || null,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    pesanSupplier.textContent = data.pesan || 'Gagal menambah supplier.';
    pesanSupplier.classList.add('pesan-gagal');
    return;
  }
  pesanSupplier.textContent = data.pesan + ': ' + data.supplier.nama + '.';
  pesanSupplier.classList.add('pesan-berhasil');
  formSupplier.reset();
  muatSupplier();
});

// Hubungkan supplier dengan barang yang disuplainya.
formTautan.addEventListener('submit', async (e) => {
  e.preventDefault();
  pesanTautan.textContent = 'Menyimpan...';
  pesanTautan.className = 'pesan';
  const res = await fetch(`/api/supplier/${tautanSupplier.value}/produk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produk_id: Number(tautanProduk.value) }),
  });
  const data = await res.json();
  if (!res.ok) {
    pesanTautan.textContent = data.pesan || 'Gagal menghubungkan.';
    pesanTautan.classList.add('pesan-gagal');
    return;
  }
  pesanTautan.textContent = data.pesan + '.';
  pesanTautan.classList.add('pesan-berhasil');
  formTautan.reset();
  muatSupplier();
});

muatRingkasan();
muatPeringatan();
muatStok();
muatPilihanProduk();
aturKolomHargaBeli();
muatRiwayat();
muatSupplier();
muatPilihanTautan();
