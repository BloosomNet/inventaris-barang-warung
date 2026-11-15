// Halaman inventaris: mengambil ringkasan dan daftar stok dari server,
// lalu menampilkannya. Saringan Semua / Menipis / Habis cuma ganti
// permintaan ke server, datanya tetap diambil dari basis data.
const daftarStok = document.getElementById('daftar-stok');
const pesan = document.getElementById('pesan');
const kosong = document.getElementById('kosong');
const saringan = document.getElementById('saringan');

let saringAktif = '';

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
  const alamat = saringAktif ? `/api/stok?saring=${saringAktif}` : '/api/stok';
  const res = await fetch(alamat);
  if (!res.ok) {
    pesan.textContent = 'Gagal mengambil daftar stok, coba muat ulang halaman.';
    return;
  }
  const data = await res.json();
  pesan.textContent = '';
  daftarStok.innerHTML = '';
  kosong.hidden = data.produk.length > 0;

  data.produk.forEach((p) => {
    const baris = document.createElement('tr');
    let kelasStok = '';
    if (p.stok === 0) kelasStok = 'stok-habis';
    else if (p.stok <= data.batasMenipis) kelasStok = 'stok-menipis';
    baris.innerHTML =
      `<td>${p.nama}</td>` +
      `<td>${p.kategori || '–'}</td>` +
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

muatRingkasan();
muatStok();
