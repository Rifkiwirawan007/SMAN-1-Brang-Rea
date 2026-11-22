/** Jadwal pelajaran & absen per jam pelajaran. Aman dipakai di server maupun klien. */
import { ZONA } from "@/lib/absensi/tipe";

export type Hari = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";
export const HARI: Hari[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
export const LABEL_HARI: Record<Hari, string> = { senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis", jumat: "Jumat", sabtu: "Sabtu" };

/** Satu kode guru-mapel (KG) seperti di jadwal cetak sekolah. */
export type GuruMapel = { kode: number; nama: string; mapel: string; akunId?: string };

export type Jadwal = {
  tahunAjaran: string;
  semester: string;
  /** Jam ke → [mulai, selesai] "HH:MM" WITA. "jumat" berbeda dari hari lain. */
  jam: { umum: Record<string, [string, string]>; jumat: Record<string, [string, string]> };
  guru: GuruMapel[];
  /** jadwal[hari][kelas][jamKe-1] = kode guru-mapel (0 = kosong). */
  jadwal: Partial<Record<Hari, Record<string, number[]>>>;
  /** Kelas → id akun wali kelas. */
  wali: Record<string, string>;
  diubah?: { waktu: string; oleh: string };
};

export const JADWAL_KOSONG: Jadwal = { tahunAjaran: "", semester: "", jam: { umum: {}, jumat: {} }, guru: [], jadwal: {}, wali: {} };

/** Status kehadiran di kelas. */
export type StatusMapel = "hadir" | "sakit" | "izin" | "alpa";
export const STATUS_MAPEL: StatusMapel[] = ["hadir", "sakit", "izin", "alpa"];
export const LABEL_MAPEL: Record<StatusMapel, string> = { hadir: "Hadir", sakit: "Sakit", izin: "Izin", alpa: "Alpa" };
export const SINGKAT_MAPEL: Record<StatusMapel, string> = { hadir: "H", sakit: "S", izin: "I", alpa: "A" };

/**
 * Satu sesi pelajaran yang sudah diabsen: satu kelas, satu blok jam berturut-turut dengan mapel yang sama
 * (mis. jam 4–5 Fisika). Hanya siswa yang tidak hadir yang disimpan, sisanya dianggap hadir.
 */
export type SesiMapel = {
  id: string;
  /** YYYY-MM-DD WITA. */
  tanggal: string;
  kelas: string;
  jamMulai: number;
  jamSelesai: number;
  kode: number;
  mapel: string;
  /** Guru di jadwal (bisa berbeda dari yang mengisi, mis. guru pengganti). */
  guruJadwal: string;
  oleh: { id: string; nama: string };
  waktu: string;
  /** siswaId → status (hanya sakit/izin/alpa). */
  tidakHadir: Record<string, Exclude<StatusMapel, "hadir">>;
  /** Jumlah siswa aktif di kelas saat diisi. */
  jumlahSiswa: number;
  riwayat: { waktu: string; oleh: string; ringkas: string }[];
};

/** Blok pelajaran: jam berturut-turut dengan kode yang sama digabung. */
export type Blok = {
  kelas: string;
  jamMulai: number;
  jamSelesai: number;
  kode: number;
  mapel: string;
  guru: string;
  akunId?: string;
  mulai: string;
  selesai: string;
};

/** Hari (senin..sabtu) dari tanggal YYYY-MM-DD, null untuk Minggu. */
export function hariDari(tanggal: string): Hari | null {
  const i = new Date(`${tanggal}T12:00:00+08:00`).getUTCDay(); // 0 = Minggu
  return i === 0 ? null : HARI[i - 1];
}

export const jamHari = (j: Jadwal, hari: Hari) => (hari === "jumat" ? j.jam.jumat : j.jam.umum);

/** Semua blok pelajaran satu kelas pada satu hari. */
export function blokKelas(j: Jadwal, hari: Hari, kelas: string): Blok[] {
  const baris = j.jadwal[hari]?.[kelas] ?? [];
  const jam = jamHari(j, hari);
  const hasil: Blok[] = [];
  for (let i = 0; i < baris.length; i++) {
    const kode = baris[i];
    if (!kode) continue;
    const akhir = hasil.at(-1);
    if (akhir && akhir.kode === kode && akhir.jamSelesai === i) {
      akhir.jamSelesai = i + 1;
      akhir.selesai = jam[String(i + 1)]?.[1] ?? akhir.selesai;
      continue;
    }
    const g = j.guru.find((x) => x.kode === kode);
    hasil.push({
      kelas,
      jamMulai: i + 1,
      jamSelesai: i + 1,
      kode,
      mapel: g?.mapel ?? `Kode ${kode}`,
      guru: g?.nama ?? "—",
      akunId: g?.akunId,
      mulai: jam[String(i + 1)]?.[0] ?? "",
      selesai: jam[String(i + 1)]?.[1] ?? "",
    });
  }
  return hasil;
}

export const daftarKelasJadwal = (j: Jadwal) => {
  const s = new Set<string>();
  for (const h of HARI) for (const k of Object.keys(j.jadwal[h] ?? {})) s.add(k);
  return [...s].sort((a, b) => a.localeCompare(b, "id", { numeric: true }));
};

/** Semua blok yang diajar satu akun guru pada satu hari, urut jam. */
export function blokGuru(j: Jadwal, hari: Hari, akunId: string): Blok[] {
  return daftarKelasJadwal(j)
    .flatMap((k) => blokKelas(j, hari, k))
    .filter((b) => b.akunId === akunId)
    .sort((a, b) => a.jamMulai - b.jamMulai || a.kelas.localeCompare(b.kelas, "id", { numeric: true }));
}

export const labelJam = (b: { jamMulai: number; jamSelesai: number }) =>
  b.jamMulai === b.jamSelesai ? `Jam ${b.jamMulai}` : `Jam ${b.jamMulai}–${b.jamSelesai}`;

export const kunciSesi = (tanggal: string, kelas: string, jamMulai: number) => `${tanggal}|${kelas}|${jamMulai}`;

/** "HH:MM" WITA saat ini. */
export const jamSekarang = (ms: number = Date.now()) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA }).format(new Date(ms));
