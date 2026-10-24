# NARA — Interactive 3D Incense Aroma Studio

Paket ini menyediakan halaman demo dengan batang dupa 3D yang dapat diputar menggunakan drag/touch, zoom, putaran otomatis ringan, serta pilihan visual aroma. Desain mengikuti konsep premium berwarna cokelat gelap, champagne, dan emas.

## Isi paket
- `demo.html` — halaman demo interaktif.
- `aroma-viewer.js` — kontrol viewer, selector aroma, pencahayaan merata, dan animasi ringan.
- `nara-incense-stick.glb` — model batang dupa 3D tanpa dudukan atau packaging.
- `assets/aromas/*.webp` — cutout fotorealistis untuk pilihan aroma dan bahan mode Basic.
- `embed-snippet.html` — contoh iframe untuk disisipkan ke website.
- `NARA-3D-Aroma-Assets-Preview.jpg` — ringkasan visual aset.
- `NARA-3D-Premium-Concept.png` — referensi konsep desain statis, bukan viewer interaktif.

## Interaksi
- Viewer mendukung drag untuk memutar, scroll/pinch untuk zoom, dan putaran otomatis pelan.
- Pilihan aroma menampilkan visual aroma terpilih saja. Rose menggunakan bunga mawar beserta kelopak; Pineapple menampilkan nanas dan potongan buah.
- Mode Basic menampilkan visual bahan alami seperti kayu aromatik dan resin, tanpa bunga atau buah aroma.
- Musk memakai bentuk aura bulat berwarna krem-amber sebagai representasi visual wewangian, bukan bahan formula.
- Rendering dioptimalkan dengan pixel ratio dibatasi sekitar 1.35, jumlah sprite terbatas, tanpa shadow map dan tanpa post-processing berat.

## Product 001 — Traditional Dip Incense fragrance options
The selector now includes 29 English-language display names: Sandalwood, Honey Sandalwood, Agarwood, Benzoin Resin, Thousand Flowers, Rose, Jasmine, Sai Flora, Lemongrass, Lavender, Musk, Champaca, Lotus, Honey, Bhakti, Senthamil, Maiden, Sage, Cinnamon, Tuberose, Cherry Blossom, Orchid, Pineapple, Apple, Orange, Green Tea, Kraton, Night Jasmine (Parijata), and Majumu. Names that appear to be proprietary fragrance names (Sai Flora, Bhakti, Senthamil, Maiden, Kraton, and Majumu) are retained as supplied.

## Photo-based incense textures
The main 3D incense model uses photo-derived texture maps from the four provided reference photos:
- Traditional Dip Incense uses the “Plain & Dip” reference texture.
- The Hand-Rolled Incense profile uses the “Hand-Rolled” reference, while its “Basic” selection uses the “Plain & Dip” reference.
- Herbal Incense switches to the sandalwood reference texture when Sandalwood is selected and the frankincense reference texture when Frankincense or Agarwood is selected.
- Aroma cutouts are presented as animated sprites inside the existing interactive 3D scene. They visually complement the selected scent but are not individual 3D mesh models and do not confirm a fixed formula.

## Menjalankan demo
Viewer memuat Three.js dari CDN, sehingga perlu koneksi internet. Jalankan server di folder paket:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000/demo.html`.

## Integrasi ke website
Unggah folder `NARA-3D-Interactive-Premium` beserta seluruh isinya. Sesuaikan atribut `src` pada `embed-snippet.html` dengan path publik di hosting Anda. Jangan memindahkan `nara-incense-stick.glb` atau folder `assets/aromas/` terpisah dari `demo.html` dan `aroma-viewer.js`.

## Catatan akurasi visual
Batang dupa adalah mesh GLB 3D. Bunga, nanas, kayu, dan resin berupa gambar cutout transparan yang ditempatkan sebagai sprite di ruang 3D dan dianimasikan agar tampak melayang serta berputar saat perspektif diputar. Jadi aset aroma belum berupa mesh 3D penuh yang bisa diperiksa dari semua sisi. Visual nanas diperbarui dengan komposisi transparan beresolusi lebih tinggi yang menampilkan nanas utuh dan beberapa potongan buah segar; seluruh elemen disusun agar jelas saat dianimasikan di viewer. Visual bahan dan aroma merupakan ilustrasi, bukan konfirmasi formula setiap varian. Katalog menyebut aromatic woods, ghee, dan bahan alami lain bergantung pada formulasi.
