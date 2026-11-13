# Situs SMA Negeri 1 Brang Rea

Situs sekolah + dashboard admin (Next.js 16).

## Menjalankan di komputer sendiri (VS Code)

Syarat: **Node.js 20.9 atau lebih baru** (cek: `node -v`). Unduh di https://nodejs.org (pilih versi LTS).

1. Buka folder proyek ini di VS Code (File > Open Folder).
2. Buka terminal: menu **Terminal > New Terminal**.
3. Sekali saja (atau setiap habis `git pull` yang mengubah `package.json`):
   ```bash
   npm install
   ```
4. Jalankan:
   ```bash
   npm run dev
   ```
5. Buka http://localhost:3000 di browser. Dashboard: http://localhost:3000/masuk

Atau tanpa mengetik: tekan **F5** dan pilih "Jalankan situs (npm run dev)".
Matikan server dengan `Ctrl + C` di terminal.

## Masalah yang sering terjadi

| Pesan | Solusi |
| --- | --- |
| `next: command not found` / `Cannot find module` | Belum `npm install`. |
| `Another next dev server is already running` / `Unable to acquire lock` | Server lain masih jalan di folder ini. Tutup terminal lainnya (atau `Ctrl + C`), lalu ulangi. Bila masih: hapus folder `.next`. |
| `Port 3000 is in use` | Next otomatis pindah ke 3001, lihat alamat di terminal. |
| `You are using Node.js 18...` | Perbarui Node.js ke versi 20.9+ lalu `npm install` lagi. |
| Tombol ▷ "Run Code" di pojok kanan atas | Jangan dipakai, itu menjalankan satu file saja. Pakai `npm run dev` atau F5. |

## Data

- Konten situs: `data/konten/*.json` (diubah lewat dashboard, ikut ke Git).
- Data privat (akun admin, pesan, statistik): `data/privat/`, **tidak** ikut ke Git.
  Di komputer baru, buka `/masuk` lalu buat akun admin pertama.
- Foto unggahan: `data/unggahan/`.
