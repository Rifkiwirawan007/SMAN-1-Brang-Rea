import type { Berita } from "@/lib/konten/tipe";
import { formatTanggal } from "@/lib/format";

/**
 * Data berita secukupnya untuk kartu dan daftar (tanpa isi artikel), supaya muatan halaman
 * yang dikirim ke komponen klien tetap ringan. Aman dipakai di server maupun klien.
 */
export type BeritaTampil = Pick<
  Berita,
  "slug" | "judul" | "kategori" | "tanggal" | "ringkasan" | "gambar" | "posisiGambar" | "halaman" | "contoh"
> & { tanggalTampil: string };

export function beritaTampil(b: Berita): BeritaTampil {
  return {
    slug: b.slug,
    judul: b.judul,
    kategori: b.kategori,
    tanggal: b.tanggal,
    ringkasan: b.ringkasan,
    gambar: b.gambar,
    posisiGambar: b.posisiGambar,
    halaman: b.halaman,
    contoh: b.contoh,
    tanggalTampil: formatTanggal(b.tanggal),
  };
}
