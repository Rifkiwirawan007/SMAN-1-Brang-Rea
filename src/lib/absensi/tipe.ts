/** Tipe dan label absensi siswa. Aman dipakai di server maupun klien. */

export type StatusAbsen = "hadir" | "terlambat" | "sakit" | "izin" | "alpa";

export const STATUS_ABSEN: StatusAbsen[] = ["hadir", "terlambat", "sakit", "izin", "alpa"];

export const LABEL_STATUS: Record<StatusAbsen, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  sakit: "Sakit",
  izin: "Izin",
  alpa: "Alpa",
};

export const KET_STATUS: Record<StatusAbsen, string> = {
  hadir: "Hadir tepat waktu",
  terlambat: "Hadir, tetapi melewati jam masuk",
  sakit: "Tidak hadir karena sakit",
  izin: "Tidak hadir dengan izin",
  alpa: "Tidak hadir tanpa keterangan",
};

export type WarnaStatus = "hijau" | "kuning" | "biru" | "merah" | "abu";
export const WARNA_STATUS: Record<StatusAbsen, WarnaStatus> = {
  hadir: "hijau",
  terlambat: "kuning",
  sakit: "biru",
  izin: "biru",
  alpa: "merah",
};

/** Hadir di sekolah (tepat waktu atau terlambat). */
export const masuk = (s: StatusAbsen) => s === "hadir" || s === "terlambat";

export type Siswa = {
  id: string;
  /** Nomor Induk Siswa Nasional, 10 angka. Dipakai orang tua untuk cek absensi. */
  nisn: string;
  nama: string;
  kelas: string;
  /** YYYY-MM-DD (opsional, dipakai bila cek absensi wajib tanggal lahir). */
  tglLahir?: string;
  /** Isi QR di kartu siswa bila berbeda dari NISN. */
  kodeQr?: string;
  aktif: boolean;
  dibuat: string;
  diubah?: string;
};

export type CaraAbsen = "scan" | "manual" | "otomatis";
export const LABEL_CARA: Record<CaraAbsen, string> = { scan: "Scan QR", manual: "Diisi guru", otomatis: "Otomatis (tidak scan)" };

export type RiwayatAbsen = { waktu: string; oleh: string; status: StatusAbsen; cara: CaraAbsen; ket?: string };

/** Satu catatan absensi: satu siswa pada satu tanggal. */
export type CatatanAbsen = {
  id: string;
  siswaId: string;
  /** YYYY-MM-DD (WITA). */
  tanggal: string;
  status: StatusAbsen;
  cara: CaraAbsen;
  /** Waktu scan / waktu siswa tercatat hadir (ISO). */
  jam?: string;
  ket?: string;
  oleh: { id: string; nama: string };
  /** Waktu perubahan terakhir (ISO). */
  waktu: string;
  /** Jejak semua perubahan, terlama di depan. Tidak pernah dihapus (bukti). */
  riwayat: RiwayatAbsen[];
};

export type AturAbsensi = {
  /** Scan setelah jam ini (HH:MM WITA) dicatat "Terlambat". */
  jamMasuk: string;
  /** Halaman cek absensi meminta tanggal lahir selain NISN. */
  wajibTglLahir: boolean;
};

export const ATUR_BAWAAN: AturAbsensi = { jamMasuk: "07:15", wajibTglLahir: false };

export const ZONA = "Asia/Makassar";

/** Tanggal hari ini (atau dari ms) dalam WITA, format YYYY-MM-DD. */
export const tanggalIni = (ms: number = Date.now()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));

/** Jam WITA "07.12" dari ISO. */
export const jamWita = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: ZONA }).format(new Date(iso)) : "";

/** "Senin, 16 November 2026" dari YYYY-MM-DD. */
export const tanggalPanjang = (tgl: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: ZONA }).format(
    new Date(`${tgl}T08:00:00+08:00`),
  );

/** "November 2026" dari YYYY-MM. */
export const namaBulan = (bulan: string) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: ZONA }).format(new Date(`${bulan}-15T08:00:00+08:00`));

export const tanggalSah = (t: unknown): t is string => typeof t === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t) && !Number.isNaN(Date.parse(t));
export const bulanSah = (b: unknown): b is string => typeof b === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(b);

/** Geser bulan YYYY-MM sebanyak n (boleh negatif). */
export function geserBulan(bulan: string, n: number) {
  const [y, m] = bulan.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Urutan kelas alami: "X-2" sebelum "X-10", "X" sebelum "XI". */
export const urutKelas = (a: string, b: string) => a.localeCompare(b, "id", { numeric: true });
