import "server-only";
import path from "node:path";
import { bacaJson, DIR_PRIVAT, filePrivat, idBaru, tulisJson, ubahJson } from "@/lib/server/penyimpanan";
import {
  ATUR_BAWAAN,
  bulanSah,
  tanggalSah,
  type AturAbsensi,
  type CaraAbsen,
  type CatatanAbsen,
  type Siswa,
  type StatusAbsen,
} from "@/lib/absensi/tipe";

/**
 * Data absensi (privat, tidak ikut Git):
 * - data/privat/siswa.json              daftar siswa
 * - data/privat/absensi/YYYY-MM.json    catatan absensi per bulan (file tidak membengkak)
 * - data/privat/absensi-atur.json       jam masuk, aturan cek absensi
 */
const FILE_SISWA = filePrivat("siswa");
const FILE_ATUR = filePrivat("absensi-atur");
const fileBulan = (bulan: string) => {
  if (!bulanSah(bulan)) throw new Error(`Bulan tidak sah: ${bulan}`);
  return path.join(DIR_PRIVAT, "absensi", `${bulan}.json`);
};

/* ---------- Siswa ---------- */

export function bacaSiswa(): Promise<Siswa[]> {
  return bacaJson<Siswa[]>(FILE_SISWA, []);
}

export function ubahSiswa(fn: (semua: Siswa[]) => Siswa[] | Promise<Siswa[]>) {
  return ubahJson<Siswa[]>(FILE_SISWA, [], fn);
}

export const nisnSah = (n: string) => /^\d{10}$/.test(n);

/** Rapikan nama: spasi ganda dibuang, huruf besar di awal kata bila semuanya kapital/kecil. */
export function rapikanNama(nama: string) {
  const s = nama.trim().replace(/\s+/g, " ").slice(0, 80);
  if (s === s.toUpperCase() || s === s.toLowerCase()) return s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (h) => h.toUpperCase());
  return s;
}

export const rapikanKelas = (k: string) => k.trim().replace(/\s+/g, " ").toUpperCase().slice(0, 20);

/** Terima "2008-05-17", "17/05/2008", "17-05-2008", "17.05.2008". Mengembalikan YYYY-MM-DD atau null. */
export function bacaTanggalLahir(t: string): string | null {
  const s = t.trim();
  if (!s) return null;
  let y: number, m: number, d: number;
  let cocok = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (cocok) [y, m, d] = [Number(cocok[1]), Number(cocok[2]), Number(cocok[3])];
  else if ((cocok = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/))) [d, m, y] = [Number(cocok[1]), Number(cocok[2]), Number(cocok[3])];
  else return null;
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime()) || dt.getUTCDate() !== d || y < 1990 || y > 2030) return null;
  return iso;
}

/**
 * Cari siswa dari isi QR / ketikan scanner. Urutan: kode QR khusus → NISN persis →
 * NISN di dalam teks (mis. QR berisi tautan atau "NISN: 0081234567").
 */
export function cariDariKode(kode: string, semua: Siswa[]): Siswa | null {
  const k = kode.trim();
  if (!k) return null;
  const aktif = semua.filter((s) => s.aktif);
  const persis = aktif.find((s) => s.kodeQr && s.kodeQr === k) ?? aktif.find((s) => s.nisn === k);
  if (persis) return persis;
  const angka = k.match(/(?<!\d)\d{10}(?!\d)/g) ?? [];
  for (const a of angka) {
    const s = aktif.find((x) => x.nisn === a);
    if (s) return s;
  }
  return null;
}

/* ---------- Catatan absensi ---------- */

export async function bacaAbsenBulan(bulan: string): Promise<CatatanAbsen[]> {
  return bacaJson<CatatanAbsen[]>(fileBulan(bulan), []);
}

export async function bacaAbsenTanggal(tanggal: string): Promise<CatatanAbsen[]> {
  if (!tanggalSah(tanggal)) return [];
  return (await bacaAbsenBulan(tanggal.slice(0, 7))).filter((c) => c.tanggal === tanggal);
}

type Petugas = { id: string; nama: string };

/**
 * Tulis status untuk satu siswa pada satu tanggal. Bila sudah ada catatan, status diganti dan
 * riwayat lama tetap disimpan. Mengembalikan catatan terbaru.
 */
export function tulisAbsen(
  tanggal: string,
  daftar: { siswaId: string; status: StatusAbsen; cara: CaraAbsen; ket?: string; jam?: string }[],
  oleh: Petugas,
  /** Lewati siswa yang sudah punya catatan (dipakai "tandai alpa" & scan ulang). */
  lewatiYangAda = false,
): Promise<CatatanAbsen[]> {
  const hasil: CatatanAbsen[] = [];
  return ubahJson<CatatanAbsen[]>(fileBulan(tanggal.slice(0, 7)), [], (semua) => {
    const kini = new Date().toISOString();
    for (const d of daftar) {
      const i = semua.findIndex((c) => c.tanggal === tanggal && c.siswaId === d.siswaId);
      const jejak = { waktu: kini, oleh: oleh.nama, status: d.status, cara: d.cara, ket: d.ket || undefined };
      if (i === -1) {
        const baru: CatatanAbsen = {
          id: idBaru(),
          siswaId: d.siswaId,
          tanggal,
          status: d.status,
          cara: d.cara,
          jam: d.jam,
          ket: d.ket || undefined,
          oleh: { id: oleh.id, nama: oleh.nama },
          waktu: kini,
          riwayat: [jejak],
        };
        semua.push(baru);
        hasil.push(baru);
      } else if (!lewatiYangAda) {
        const lama = semua[i];
        const baru: CatatanAbsen = {
          ...lama,
          status: d.status,
          cara: d.cara,
          jam: d.jam ?? lama.jam,
          ket: d.ket || undefined,
          oleh: { id: oleh.id, nama: oleh.nama },
          waktu: kini,
          riwayat: [...lama.riwayat, jejak],
        };
        semua[i] = baru;
        hasil.push(baru);
      }
    }
    return semua;
  }).then(() => hasil);
}

/* ---------- Pengaturan ---------- */

export async function bacaAturAbsensi(): Promise<AturAbsensi> {
  return { ...ATUR_BAWAAN, ...(await bacaJson<Partial<AturAbsensi>>(FILE_ATUR, {})) };
}

export function simpanAturAbsensi(atur: AturAbsensi) {
  return tulisJson(FILE_ATUR, atur);
}

/** Menit sejak tengah malam (WITA) dari ISO, untuk dibandingkan dengan jam masuk. */
export function menitWita(iso: string) {
  const [j, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Makassar" })
    .format(new Date(iso))
    .split(":")
    .map(Number);
  return (j % 24) * 60 + m;
}

export const menitDariJam = (hhmm: string) => {
  const [j, m] = hhmm.split(":").map(Number);
  return j * 60 + m;
};
