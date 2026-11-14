/**
 * Peran pengguna dashboard dan hak aksesnya. Aman dipakai di server maupun klien.
 * - admin: semua fitur.
 * - editor: konten saja (berita, agenda, prestasi, ekskul, galeri, halaman), tanpa pengaturan sekolah,
 *   pesan masuk, statistik, akun pengguna, dan log aktivitas.
 */
export type Peran = "admin" | "editor" | "guru";

export const LABEL_PERAN: Record<Peran, string> = { admin: "Admin", editor: "Editor", guru: "Guru" };
export const KET_PERAN: Record<Peran, string> = {
  admin: "Semua fitur, termasuk info sekolah, pesan masuk, statistik, akun, dan log aktivitas.",
  editor: "Kelola konten: berita, agenda, prestasi, ekskul, galeri, dan isi halaman.",
  guru: "Absensi siswa saja: scan QR kartu siswa, ubah status (sakit/izin/alpa), dan kelola data siswa.",
};

/** Admin dan editor: pengelola konten situs. */
const SEMUA: Peran[] = ["admin", "editor"];
const ADMIN: Peran[] = ["admin"];
const ABSENSI: Peran[] = ["admin", "guru"];

/** Kunci modul/halaman dashboard → peran yang boleh membuka. */
export const AKSES: Record<string, Peran[]> = {
  ringkasan: SEMUA,
  akun: ["admin", "editor", "guru"],
  absensi: ABSENSI,
  siswa: ABSENSI,
  media: SEMUA,
  berita: SEMUA,
  agenda: SEMUA,
  prestasi: SEMUA,
  "poster-prestasi": SEMUA,
  ekskul: SEMUA,
  galeri: SEMUA,
  hero: SEMUA,
  sambutan: SEMUA,
  profil: SEMUA,
  akademik: SEMUA,
  kesiswaan: SEMUA,
  spmb: SEMUA,
  sekolah: ADMIN,
  pesan: ADMIN,
  statistik: ADMIN,
  pengguna: ADMIN,
  aktivitas: ADMIN,
};

export function boleh(peran: Peran | undefined, modul: string): boolean {
  if (!peran) return false;
  return AKSES[modul]?.includes(peran) ?? false;
}
