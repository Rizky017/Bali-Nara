# NARA Website — Pembaruan 4 Produk

## Produk
1. Traditional Dip Incense — `pages/product-natural.html`
2. Herbal Incense — `pages/product-premium.html`
3. Hand-Rolled Incense — `pages/product-hand-rolled.html`
4. Custom Incense Development — `pages/product-oem.html`

## 3D Aroma Studio
Viewer interaktif disematkan pada halaman Hand-Rolled Incense. Sumber ada di `assets/NARA-3D-Interactive-Premium/`. Pertahankan semua file/foldernya saat mengunggah karena demo memuat `aroma-viewer.js`, `nara-incense-stick.glb`, dan aset pada `assets/aromas/`. Viewer membutuhkan koneksi internet untuk Three.js dari CDN.

## Instalasi
Ekstrak arsip dan unggah isi folder `Dupa-Export-Website` ke hosting dengan struktur folder tetap utuh. Buat backup dari versi website sebelumnya sebelum mengganti file di hosting.

Catatan: deskripsi dan spesifikasi di halaman produk mengikuti brief yang diberikan. Nilai pembakaran dan detail lain tetap ditampilkan sebagai perkiraan sebagaimana dinyatakan pada brief. Pilihan aroma pada viewer 3D merupakan visual arah aroma; bukan daftar komposisi yang dikonfirmasi untuk semua produk.


Pembaruan tata letak (24 Oktober 2026): hero besar di halaman Hand-Rolled Incense yang menampilkan gambar produk, tombol quote, dan ringkasan spesifikasi dihapus sesuai permintaan. Halaman kini dibuka dengan pengantar singkat dan studio aroma 3D. Spesifikasi lengkap tetap tersedia pada bagian informasi produk di bawah studio.


Pembaruan Custom Incense Development (24 Oktober 2026): studio 3D memakai siluet batang dupa yang konsisten dengan Hand-Rolled, dengan perbedaan finishing warna halus untuk Traditional, Herbal, dan Custom. Selector Custom diperluas untuk menampilkan pilihan aroma, bahan, formulasi, dimensi, performa, packaging, private label, R&D, dan sampling. Semua aroma/bahan di studio adalah referensi diskusi; bukan formula yang dijamin, dan bergantung pada ketersediaan serta feasibility.

## Pembaruan tampilan dan tipografi
- Filter kategori aroma berbentuk pill dihapus dari semua varian studio produk. Semua opsi tampil langsung di grid pilihan aroma.
- Tipografi seluruh halaman menggunakan DM Serif Display untuk heading dan DM Sans untuk isi, navigasi, tombol, spesifikasi, dan elemen UI.
- Homepage dan halaman All Products dirapikan pada ukuran kartu, hierarki judul, jarak, dan responsivitas desktop/mobile.


PEMBARUAN FOTO HOMEPAGE + ALL PRODUCTS
- Hero utama homepage tetap memakai foto Bali asli `images/factory/hero.jpg` dan tidak diganti.
- Perubahan foto homepage hanya pada bagian koleksi/produk: Traditional Dip, Herbal, Hand-Rolled, serta Custom/Private Label.
- Halaman All Products memakai foto kategori dupa dan bahan aromatik yang berbeda untuk membedakan karakter tiap kategori.
- Banner produk tetap memakai foto dupa single-stick yang dikirim pengguna.
- File `css/sitewide-responsive-polish.css` dimuat terakhir untuk menjaga konsistensi layout; header All Products berada dalam alur dokumen agar judul tidak tertutup navbar.
- File CSS tertentu diberi query versi untuk membantu browser memuat stylesheet terbaru.
- Website belum diunggah ke hosting; ZIP ini berisi file siap diunggah.

## Pemasangan
Unggah seluruh isi folder `Dupa-Export-Website` dan timpa file versi lama setelah membuat backup. Setelah unggah, lakukan hard refresh browser dengan `Ctrl+F5`.
## Pembaruan lengkap responsif & konsistensi visual (24 Oktober 2026)
- Menambahkan `css/sitewide-responsive-polish.css` sebagai lapisan CSS final untuk seluruh halaman publik; stylesheet ini dimuat setelah stylesheet lainnya supaya aturan responsif dan tipografi konsisten.
- Font judul menggunakan DM Serif Display, sedangkan teks isi, navigasi, tombol, form, dan antarmuka menggunakan DM Sans.
- Foto Traditional Dip Incense di homepage dan All Products sekarang menggunakan `images/products/incense-traditional-dip.webp`; foto Herbal memakai foto bahan herbal/botanical; Hand-Rolled memakai foto batang dupa; Custom memakai foto contoh kemasan private label.
- Foto hero utama Bali pada homepage tetap menggunakan `images/factory/hero.jpg`. Hanya kartu koleksi produk homepage yang diubah.
- Halaman All Products mengatur header ke alur dokumen biasa pada halaman ini, agar judul banner tidak tertutup navigasi. Kartu produk ditata ulang untuk desktop, tablet, dan HP.
- Breakpoint tambahan mencakup layar lebar, tablet, HP, dan layar kecil; termasuk tata letak kartu, form, hero, heading, footer, serta spesifikasi produk.
- File CSS dan referensi aset pada seluruh 16 halaman publik telah diaudit secara lokal; jalur aset lokal yang dirujuk oleh HTML valid dan stylesheet baru lolos parsing CSS. Perubahan belum dipublikasikan ke domain aktif.


Pembaruan gambar lanjutan (24 Oktober 2026): foto dupa pilihan pengguna disimpan sebagai `images/products/incense-user-hero.jpeg` dan digunakan pada banner halaman All Products. Gambar Custom di homepage dan All Products menggunakan `images/products/custom-incense-variety.jpg`, yang menampilkan variasi ukuran batang dupa dan bahan/aroma. Foto bahan untuk Traditional Dip, Herbal, dan Hand-Rolled tetap dipertahankan agar masing-masing kategori tetap menggambarkan karakter dan bahannya.


Pembaruan studio aroma dan tekstur dupa (24 Oktober 2026):
- Model batang dupa di studio 3D sekarang memakai texture maps yang dibuat dari empat foto referensi pengguna. UV mapping dibuat di runtime karena file GLB asli tidak memiliki UV coordinates.
- Traditional Dip menggunakan tekstur “Plain & Dip”; Hand-Rolled menggunakan tekstur hand-roll untuk seluruh pilihannya, termasuk opsi “Basic”; Traditional Dip tetap menggunakan tekstur Plain & Dip. Herbal Incense mengganti tekstur antara referensi herbal Sandalwood dan herbal Frankincense sesuai pilihan bahan.
- Selector Traditional Dip sekarang memuat 29 aroma dengan nama tampilan bahasa Inggris. Daftar pemetaan tersedia di `assets/NARA-3D-Interactive-Premium/TRADITIONAL-AROMA-CATALOG-EN.md`.
- Ditambahkan aset gambar aroma lokal untuk pilihan baru. Sesuai pola studio yang sudah ada, visual aroma berupa cutout sprite yang ditempatkan dan dianimasikan dalam scene 3D, bukan 29 model mesh 3D terpisah. Visual bersifat ilustratif dan tidak memastikan formula produk.

- Pada profil Hand-Rolled, opsi “Polos” diganti menjadi “Basic” dan memakai tekstur hand-roll seperti pilihan lainnya.
- Cutout aroma dibersihkan dari halo pucat/putih dan pinhole transparan kecil agar tampil lebih rapi pada latar gelap.
- Scroll aroma meneruskan gerakan ke halaman produk ketika sudah mencapai ujung daftar, dan tinggi iframe HP disesuaikan per studio untuk mengurangi gap kosong.
