import "server-only";
import { cacheTag } from "next/cache";
import { bacaDokumen, bacaKoleksi } from "@/lib/server/penyimpanan";
import { tagKonten, type Berita } from "@/lib/konten/tipe";

/**
 * Pembaca konten untuk halaman PUBLIK. Hasilnya di-cache ("use cache") dan diberi tag,
 * sehingga halaman tetap cepat; dashboard memanggil updateTag(tagKonten(nama)) setelah menyimpan
 * agar perubahan langsung tampil. Halaman dashboard membaca langsung dari lib/server/penyimpanan (tanpa cache).
 */

/* ---------- Dokumen tunggal ---------- */

export async function ambilSekolah() {
  "use cache";
  cacheTag(tagKonten("sekolah"));
  return bacaDokumen("sekolah");
}

export async function ambilSambutan() {
  "use cache";
  cacheTag(tagKonten("sambutan"));
  return bacaDokumen("sambutan");
}

export async function ambilProfil() {
  "use cache";
  cacheTag(tagKonten("profil"));
  return bacaDokumen("profil");
}

export async function ambilAkademik() {
  "use cache";
  cacheTag(tagKonten("akademik"));
  return bacaDokumen("akademik");
}

export async function ambilKesiswaan() {
  "use cache";
  cacheTag(tagKonten("kesiswaan"));
  return bacaDokumen("kesiswaan");
}

export async function ambilSpmb() {
  "use cache";
  cacheTag(tagKonten("spmb"));
  return bacaDokumen("spmb");
}

/* ---------- Koleksi ---------- */

/** Berita yang sudah terbit, terbaru dulu (berita tanpa tanggal di akhir). */
export async function ambilBerita(): Promise<Berita[]> {
  "use cache";
  cacheTag(tagKonten("berita"));
  const semua = await bacaKoleksi("berita");
  return urutBerita(semua.filter((b) => b.status !== "draf"));
}

/** Satu berita terbit berdasarkan slug, atau null. */
export async function cariBerita(slug: string): Promise<Berita | null> {
  const ada = (await ambilBerita()).find((b) => b.slug === slug);
  if (ada) return ada;
  // Sesaat setelah berita diterbitkan, cache daftar bisa masih basi (diperbarui di latar belakang).
  // Agar kunjungan pertama ke berita baru tidak berujung "tidak ditemukan", periksa langsung ke data.
  const semua = await bacaKoleksi("berita");
  return semua.find((b) => b.slug === slug && b.status !== "draf") ?? null;
}

export function urutBerita(daftar: Berita[]) {
  return [...daftar].sort((a, b) => {
    if (!a.tanggal && !b.tanggal) return 0;
    if (!a.tanggal) return 1;
    if (!b.tanggal) return -1;
    return b.tanggal.localeCompare(a.tanggal);
  });
}

/** Agenda urut tanggal naik. */
export async function ambilAgenda() {
  "use cache";
  cacheTag(tagKonten("agenda"));
  const semua = await bacaKoleksi("agenda");
  return [...semua].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

/** Prestasi sesuai urutan di dashboard. */
export async function ambilPrestasi() {
  "use cache";
  cacheTag(tagKonten("prestasi"));
  return bacaKoleksi("prestasi");
}

/** Poster prestasi sesuai urutan di dashboard. */
export async function ambilPosterPrestasi() {
  "use cache";
  cacheTag(tagKonten("poster-prestasi"));
  return bacaKoleksi("poster-prestasi");
}

export async function ambilEkskul() {
  "use cache";
  cacheTag(tagKonten("ekskul"));
  return bacaKoleksi("ekskul");
}

export async function ambilGaleri() {
  "use cache";
  cacheTag(tagKonten("galeri"));
  return bacaKoleksi("galeri");
}

/** Slide hero yang aktif, sesuai urutan di dashboard. */
export async function ambilHero() {
  "use cache";
  cacheTag(tagKonten("hero"));
  const semua = await bacaKoleksi("hero");
  return semua.filter((s) => s.aktif !== false);
}
