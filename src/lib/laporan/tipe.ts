/** Tipe dan label laporan siswa ke guru BK. Aman dipakai di server maupun klien. */

export type JenisLaporan = "perundungan" | "kekerasan" | "pelecehan" | "kehilangan" | "konseling" | "lainnya";

export const JENIS_LAPORAN: { kunci: JenisLaporan; label: string; ket: string }[] = [
  { kunci: "perundungan", label: "Perundungan (bullying)", ket: "Diejek, dikucilkan, diancam, dipalak, atau dirundung di media sosial" },
  { kunci: "kekerasan", label: "Kekerasan / perkelahian", ket: "Dipukul, didorong, dikeroyok, atau melihat perkelahian" },
  { kunci: "pelecehan", label: "Pelecehan", ket: "Sentuhan, ucapan, atau pesan yang membuat tidak nyaman" },
  { kunci: "kehilangan", label: "Kehilangan / pencurian", ket: "Barang hilang atau diambil orang lain di sekolah" },
  { kunci: "konseling", label: "Masalah pribadi / butuh konseling", ket: "Masalah belajar, keluarga, pertemanan, atau perasaan" },
  { kunci: "lainnya", label: "Lainnya", ket: "Hal lain yang perlu diketahui guru BK" },
];

export const LABEL_JENIS = Object.fromEntries(JENIS_LAPORAN.map((j) => [j.kunci, j.label])) as Record<JenisLaporan, string>;

export type StatusLaporan = "baru" | "ditinjau" | "ditangani" | "selesai" | "ditolak";

export const STATUS_LAPORAN: StatusLaporan[] = ["baru", "ditinjau", "ditangani", "selesai", "ditolak"];

/** Label di dashboard BK. */
export const LABEL_STATUS_LAPORAN: Record<StatusLaporan, string> = {
  baru: "Baru",
  ditinjau: "Ditinjau",
  ditangani: "Ditangani",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

/** Kalimat untuk pelapor di halaman cek status. */
export const KET_STATUS_PELAPOR: Record<StatusLaporan, string> = {
  baru: "Laporan sudah diterima dan menunggu dibaca guru BK.",
  ditinjau: "Laporan sudah dibaca dan sedang ditinjau guru BK.",
  ditangani: "Guru BK sedang menindaklanjuti laporan ini.",
  selesai: "Laporan sudah selesai ditangani.",
  ditolak: "Laporan tidak dapat diproses. Lihat balasan guru BK di bawah.",
};

export const WARNA_STATUS_LAPORAN: Record<StatusLaporan, "kuning" | "biru" | "hijau" | "abu" | "merah"> = {
  baru: "kuning",
  ditinjau: "biru",
  ditangani: "biru",
  selesai: "hijau",
  ditolak: "abu",
};

export type CatatanLaporan = {
  id: string;
  waktu: string;
  oleh: string;
  isi: string;
  /** true = balasan yang terlihat oleh pelapor; false = catatan internal BK. */
  untukPelapor: boolean;
};

export type Laporan = {
  id: string;
  /** Nomor tampil, mis. LP-2026-0012. */
  nomor: string;
  /** Kode rahasia untuk cek status (diberikan ke pelapor sekali saat mengirim). */
  kode: string;
  dibuat: string;
  nama: string;
  kelas: string;
  telepon?: string;
  jenis: JenisLaporan;
  terlibat?: string;
  isi: string;
  status: StatusLaporan;
  riwayat: { waktu: string; oleh: string; status: StatusLaporan }[];
  catatan: CatatanLaporan[];
  diubah?: string;
};
