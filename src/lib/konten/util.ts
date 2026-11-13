import type { Sekolah } from "@/lib/konten/tipe";

/** Utilitas konten yang aman untuk server dan klien. */

export const mapsEmbed = (s: Pick<Sekolah, "koordinat">) =>
  `https://maps.google.com/maps?q=${s.koordinat.lat},${s.koordinat.lng}&z=16&output=embed`;

export const mapsLink = (s: Pick<Sekolah, "koordinat">) =>
  `https://www.google.com/maps/search/?api=1&query=${s.koordinat.lat},${s.koordinat.lng}`;

/** Foto di /images/ilustrasi/ dianggap ilustrasi (bukan foto sekolah) dan diberi label. */
export function apakahIlustrasi(src: string) {
  return src.startsWith("/images/ilustrasi/");
}

/** Ubah teks menjadi slug URL: huruf kecil, angka, dan tanda hubung. */
export function jadikanSlug(teks: string) {
  return teks
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
