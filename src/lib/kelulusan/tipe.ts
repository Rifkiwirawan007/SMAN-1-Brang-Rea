/** Tipe data kelulusan. Aman dipakai di server maupun klien. */
export type StatusLulus = "lulus" | "tidak" | "tunda";

export const STATUS_LULUS: StatusLulus[] = ["lulus", "tidak", "tunda"];

export const LABEL_LULUS: Record<StatusLulus, string> = {
  lulus: "Lulus",
  tidak: "Tidak lulus",
  tunda: "Ditunda",
};

export type AturKelulusan = {
  /** Halaman cek kelulusan bisa dipakai (sebelum jadwal tetap menampilkan hitung mundur). */
  aktif: boolean;
  /** Waktu pengumuman dibuka (ISO, mis. 2027-05-05T14:00:00+08:00). Kosong = langsung terbuka saat aktif. */
  buka: string | null;
  tahunPelajaran: string;
  /** Nomor surat SKL, mis. 421.3/045/SMAN1BR/V/2027. */
  nomorSurat: string;
  pesanLulus: string;
  pesanTidak: string;
  /** Tampilkan tombol cetak Surat Keterangan Lulus. */
  skl: boolean;
};

export type HasilLulus = { status: StatusLulus; ket?: string; diubah: string; oleh: string };

export type DataKelulusan = { atur: AturKelulusan; hasil: Record<string, HasilLulus> };

export const ATUR_LULUS_BAWAAN: AturKelulusan = {
  aktif: false,
  buka: null,
  tahunPelajaran: "2026/2027",
  nomorSurat: "",
  pesanLulus: "Selamat! Teruslah belajar dan jaga nama baik almamater SMA Negeri 1 Brang Rea.",
  pesanTidak: "Jangan berkecil hati. Silakan hubungi wali kelas atau bagian kurikulum untuk informasi selanjutnya.",
  skl: true,
};

/** Kelas XII (kelas akhir). */
export const kelasAkhir = (kelas: string) => /^XII(\b|[^I])/.test(kelas.trim().toUpperCase());

/** "lulus", "L", "tidak lulus", "TL", "tunda" → StatusLulus. */
export function bacaStatusLulus(t: string): StatusLulus | null {
  const s = t.trim().toLowerCase().replace(/\s+/g, " ");
  if (["lulus", "l", "ya", "y", "1"].includes(s)) return "lulus";
  if (["tidak lulus", "tidak", "tl", "belum lulus", "0", "t"].includes(s)) return "tidak";
  if (["tunda", "ditunda", "pending", "d"].includes(s)) return "tunda";
  return null;
}

/** Waktu ISO → "Selasa, 5 Mei 2027 pukul 14.00 WITA". */
export function waktuPengumuman(iso: string) {
  const d = new Date(iso);
  const tgl = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(d);
  const jam = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(d);
  return `${tgl} pukul ${jam} WITA`;
}
