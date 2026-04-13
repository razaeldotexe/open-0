# OpenZero 🚀
**OpenZero** adalah bot Discord modular yang dirancang sebagai asisten riset dan pengembangan (R&D). Bot ini menghubungkan pengguna langsung ke berbagai sumber data terbuka (*Open Data*) melalui perintah teks sederhana.

## 🌟 Fitur Utama
- **arXiv Search (`!arxiv`)**: Cari makalah ilmiah di bidang fisika, matematika, komputer, dll.
- **Wikipedia (`!wikipedia`)**: Ringkasan artikel Wikipedia langsung di Discord.
- **Open Library (`!openlibrary`)**: Akses katalog jutaan buku digital.
- **Nerd Fonts (`!nerdfont` / `!nf`)**: Cari dan download font ikonik untuk developer (Zip & GitHub link).
- **Interactive UI**: Menggunakan tombol navigasi dan skema warna High-Tech Cyan (`#20f0f2`).

## 🛠️ Stack Teknologi
- **Node.js v18+** & **Discord.js v14** (ES Modules)
- **Python 3** (Helper API scripts)
- **urllib/json** untuk pengambilan data real-time.

## 🚀 Cara Menjalankan
1. Clone repositori ini.
2. Buat file `.env` dan masukkan `DISCORD_TOKEN`.
3. Jalankan `npm install`.
4. Jalankan bot dengan `node index.js`.

## 📂 Struktur Folder
- `commands/`: Logika perintah Discord.
- `API/`: Skrip Python untuk fetching data eksternal.
- `index.js`: Entry point utama bot.
