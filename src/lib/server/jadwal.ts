import "server-only";
import path from "node:path";
import { bacaJson, DIR_PRIVAT, filePrivat, idBaru, tulisJson, ubahJson } from "@/lib/server/penyimpanan";
import { bulanSah, geserBulan } from "@/lib/absensi/tipe";
import { JADWAL_KOSONG, type Jadwal, type SesiMapel } from "@/lib/jadwal/tipe";

/**
 * Data privat:
 * - data/privat/jadwal.json                 jadwal pelajaran + daftar kode guru-mapel + wali kelas
 * - data/privat/absen-mapel/YYYY-MM.json    sesi absen per jam pelajaran, per bulan
 */
const FILE_JADWAL = filePrivat("jadwal");
const fileBulan = (bulan: string) => {
  if (!bulanSah(bulan)) throw new Error(`Bulan tidak sah: ${bulan}`);
  return path.join(DIR_PRIVAT, "absen-mapel", `${bulan}.json`);
};

export async function bacaJadwal(): Promise<Jadwal> {
  return { ...JADWAL_KOSONG, ...(await bacaJson<Partial<Jadwal>>(FILE_JADWAL, {})) };
}

export function simpanJadwal(j: Jadwal) {
  return tulisJson(FILE_JADWAL, j);
}

export function bacaSesiBulan(bulan: string): Promise<SesiMapel[]> {
  return bacaJson<SesiMapel[]>(fileBulan(bulan), []);
}

export async function bacaSesiTanggal(tanggal: string): Promise<SesiMapel[]> {
  return (await bacaSesiBulan(tanggal.slice(0, 7))).filter((s) => s.tanggal === tanggal);
}

/** Sesi dalam rentang bulan [dari, sampai] (YYYY-MM). */
export async function bacaSesiRentang(dari: string, sampai: string): Promise<SesiMapel[]> {
  const hasil: SesiMapel[] = [];
  for (let b = dari; b <= sampai; b = geserBulan(b, 1)) hasil.push(...(await bacaSesiBulan(b)));
  return hasil;
}

/** Simpan/ganti satu sesi (kunci: tanggal + kelas + jam mulai). Riwayat lama dipertahankan. */
export function tulisSesi(
  data: Omit<SesiMapel, "id" | "riwayat" | "waktu">,
  ringkas: string,
): Promise<SesiMapel> {
  let hasil!: SesiMapel;
  return ubahJson<SesiMapel[]>(fileBulan(data.tanggal.slice(0, 7)), [], (semua) => {
    const kini = new Date().toISOString();
    const jejak = { waktu: kini, oleh: data.oleh.nama, ringkas };
    const i = semua.findIndex((s) => s.tanggal === data.tanggal && s.kelas === data.kelas && s.jamMulai === data.jamMulai);
    if (i === -1) {
      hasil = { ...data, id: idBaru(), waktu: kini, riwayat: [jejak] };
      semua.push(hasil);
    } else {
      hasil = { ...semua[i], ...data, waktu: kini, riwayat: [...semua[i].riwayat, jejak] };
      semua[i] = hasil;
    }
    return semua;
  }).then(() => hasil);
}
