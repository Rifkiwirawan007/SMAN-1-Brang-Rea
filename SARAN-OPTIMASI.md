# Ringkasan Saran Optimasi — Web SMAN 1 Brang Rea

Dokumen ini merangkum daftar rekomendasi optimasi performa, SEO, arsitektur produksi, dan UX untuk proyek **SMAN 1 Brang Rea**.

---

## 1. Performa Gambar, Video & LCP (*Largest Contentful Paint*)

| Area | File Terkait | Masalah Saat Ini | Solusi Optimasi |
| :--- | :--- | :--- | :--- |
| **Format Gambar Modern** | `next.config.ts` | Hanya mengatur `qualities: [75, 90]`, belum mengaktifkan AVIF/WebP. | Tambahkan `formats: ["image/avif", "image/webp"]` pada konfigurasi `images` untuk menghemat ukuran gambar 40–60%. |
| **Gambar Ganda di Hero Mobile** | `src/components/home/hero-slider.tsx` | Mode `poster` di mobile merender 2 `<Image>` penuh sekaligus (latar blur + poster utama). | Gunakan `sizes="20vw"` dan `quality={30}` untuk gambar latar blur, atau ganti dengan gradien warna CSS. |
| **Peringatan Preload Gambar** | `src/components/ui/foto.tsx`, `src/components/ui/page-hero.tsx` | Muncul peringatan *preload not used within a few seconds* di Console. | Gunakan prop `priority` bawaan `next/image` untuk gambar hero utama agar preload disesuaikan dengan viewport. |
| **Lazy Loading Slide Hero** | `src/components/home/hero-slider.tsx` | Semua slide dirender sekaligus saat halaman pertama kali dimuat. | Tunda pemuatan gambar pada slide ke-3 dst. hingga slide sebelumnya aktif. |

---

## 2. Optimasi Font & Bundle DOM

- **Variasi Bobot Font (`src/app/layout.tsx`)**
  - Saat ini memuat 6 bobot statis (`300, 400, 500, 600, 700, 800`) untuk `Plus_Jakarta_Sans`.
  - **Saran:** Hapus bobot `800` yang tidak terpakai atau gunakan *variable font* bawaan (tanpa mendefinisikan array `weight`) untuk memperkecil unduhan file `.woff2`.
- **Jumlah DOM Nodes pada `TeksKata` (`src/app/(situs)/page.tsx`)**
  - Paragraf sambutan kepala sekolah dipecah per kata menjadi ratusan elemen `<span class="kata">`.
  - **Saran:** Pertahankan efek `TeksKata` hanya pada judul (`h2`), dan gunakan `data-reveal` per paragraf pada isi sambutan agar animasi lebih ringan di perangkat HP spesifikasi rendah.

---

## 3. Kesiapan Deployment & Penyimpanan Data

- **Penyimpanan Berbasis File Lokal (`src/lib/server/penyimpanan.ts` & `src/lib/server/kunjungan.ts`)**
  - Seluruh data konten (`data/konten`), unggahan (`data/unggahan`), dan statistik (`data/privat`) ditulis menggunakan `fs.writeFile`.
  - **Jika deploy di VPS (Docker / PM2 / Node Server):** Sudah aman, cukup pastikan folder `data/` disimpan sebagai *persistent volume*.
  - **Jika deploy di Serverless (Vercel / Netlify):** Sistem file bersifat *read-only* / sementara. Perlu memigrasikan `penyimpanan.ts` ke database cloud (seperti **Supabase / Neon / Turso**) dan penyimpanan file ke **Cloudflare R2 / Supabase Storage**.

---

## 4. SEO, Sitemap & Pratinjau Media Sosial

- **Sitemap & Robots Otomatis (`src/app/sitemap.ts` & `src/app/robots.ts`)**
  - Buat `sitemap.ts` untuk mendaftarkan seluruh halaman statis dan artikel berita (`ambilBerita()`) secara otomatis ke mesin pencari.
  - Buat `robots.ts` untuk memblokir indeksasi pada rute internal (`/dashboard`, `/masuk`, `/api`).
- **OpenGraph untuk Pratinjau WhatsApp (`src/app/(situs)/berita/[slug]/page.tsx`)**
  - Tambahkan `openGraph: { images: [b.gambar] }` di dalam `generateMetadata()` agar saat tautan berita dibagikan di grup WhatsApp, foto kegiatan muncul sebagai thumbnail.
- **Structured Data JSON-LD (`src/app/(situs)/page.tsx`)**
  - Tambahkan skema `EducationalOrganization` / `HighSchool` (nama resmi, NPSN, alamat, koordinat, kontak, logo) untuk memperkuat tampilan profil sekolah di hasil pencarian Google.

---

## 5. Pengalaman Pengguna (UX) Mobile & Tablet

- **Indikator Geser pada Tabel Lebar (`src/app/(situs)/akademik/page.tsx` & `src/app/(situs)/kesiswaan/page.tsx`)**
  - Tambahkan petunjuk visual kecil (*"Geser tabel ke samping →"*) di atas/bawah tabel Jadwal Pelajaran dan tabel Daftar Prestasi pada layar mobile.
- **Lightbox untuk Buletin & Poster Prestasi (`src/app/(situs)/berita/[slug]/page.tsx`)**
  - Gunakan modal `<dialog class="lightbox">` untuk menampilkan halaman koran buletin *Lensa Barema* dan poster prestasi agar pengunjung tidak perlu berpindah tab (`target="_blank"`).
