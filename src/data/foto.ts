/**
 * Foto di /images/ilustrasi/ dianggap foto ilustrasi (bukan foto sekolah) dan otomatis diberi label.
 * Saat ini semua foto sudah foto asli sekolah (public/images/sekolah/), jadi folder itu tidak dipakai.
 */
export function apakahIlustrasi(src: string) {
  return src.startsWith("/images/ilustrasi/");
}
