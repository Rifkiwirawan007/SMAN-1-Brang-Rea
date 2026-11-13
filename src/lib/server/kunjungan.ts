import "server-only";
import { createHash } from "node:crypto";
import { bacaJson, filePrivat, ubahJson } from "@/lib/server/penyimpanan";

/**
 * Statistik kunjungan sederhana tanpa layanan pihak ketiga.
 * Disimpan per hari (WITA) di data/privat/kunjungan.json. Pengunjung unik dihitung dari
 * ID acak di localStorage browser (di-hash, tidak menyimpan IP).
 */
export type HariKunjungan = {
  tampil: number;
  unik: string[];
  halaman: Record<string, number>;
  rujukan: Record<string, number>;
  perangkat: { hp: number; komputer: number };
};
export type DataKunjungan = { hari: Record<string, HariKunjungan> };

export type Kunjungan = { path: string; pengunjung: string; rujukan: string; hp: boolean; waktu: number };

const FILE = filePrivat("kunjungan");
const SIMPAN_HARI = 400;

type Global = typeof globalThis & { __bufKunjungan?: Kunjungan[]; __timerKunjungan?: ReturnType<typeof setTimeout> | null };
const g = globalThis as Global;
g.__bufKunjungan ??= [];

export const tanggalWita = (ms: number = Date.now()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms),
  );

const hariKosong = (): HariKunjungan => ({ tampil: 0, unik: [], halaman: {}, rujukan: {}, perangkat: { hp: 0, komputer: 0 } });

export function catatKunjungan(k: Kunjungan) {
  g.__bufKunjungan!.push(k);
  if (g.__bufKunjungan!.length >= 50) void simpanKunjungan();
  else if (!g.__timerKunjungan) {
    g.__timerKunjungan = setTimeout(() => void simpanKunjungan(), 10_000);
    g.__timerKunjungan.unref?.();
  }
}

/** Tulis antrean kunjungan ke file. Dipanggil otomatis, dan sebelum dashboard membaca statistik. */
export async function simpanKunjungan() {
  if (g.__timerKunjungan) {
    clearTimeout(g.__timerKunjungan);
    g.__timerKunjungan = null;
  }
  const antre = g.__bufKunjungan!.splice(0);
  if (!antre.length) return;
  await ubahJson<DataKunjungan>(FILE, { hari: {} }, (data) => {
    for (const k of antre) {
      const tgl = tanggalWita(k.waktu);
      const h = (data.hari[tgl] ??= hariKosong());
      h.tampil++;
      const idHash = createHash("sha256").update(k.pengunjung).digest("hex").slice(0, 12);
      if (!h.unik.includes(idHash)) h.unik.push(idHash);
      h.halaman[k.path] = (h.halaman[k.path] ?? 0) + 1;
      h.rujukan[k.rujukan] = (h.rujukan[k.rujukan] ?? 0) + 1;
      h.perangkat[k.hp ? "hp" : "komputer"]++;
    }
    const batas = tanggalWita(Date.now() - SIMPAN_HARI * 86_400_000);
    for (const tgl of Object.keys(data.hari)) if (tgl < batas) delete data.hari[tgl];
    return data;
  });
}

export type RingkasanKunjungan = {
  seri: { tanggal: string; tampil: number; unik: number }[];
  totalTampil: number;
  totalUnik: number;
  halaman: { path: string; jumlah: number }[];
  rujukan: { sumber: string; jumlah: number }[];
  perangkat: { hp: number; komputer: number };
  /** Total periode sebelumnya (untuk perbandingan naik/turun). */
  sebelumnya: { tampil: number; unik: number };
};

/** Ringkasan `jumlahHari` hari terakhir (termasuk hari ini). */
export async function ringkasanKunjungan(jumlahHari: number): Promise<RingkasanKunjungan> {
  await simpanKunjungan();
  const data = await bacaJson<DataKunjungan>(FILE, { hari: {} });
  const seri: RingkasanKunjungan["seri"] = [];
  const halaman: Record<string, number> = {};
  const rujukan: Record<string, number> = {};
  const perangkat = { hp: 0, komputer: 0 };
  const unikTotal = new Set<string>();
  let totalTampil = 0;

  for (let i = jumlahHari - 1; i >= 0; i--) {
    const tgl = tanggalWita(Date.now() - i * 86_400_000);
    const h = data.hari[tgl];
    seri.push({ tanggal: tgl, tampil: h?.tampil ?? 0, unik: h?.unik.length ?? 0 });
    if (!h) continue;
    totalTampil += h.tampil;
    h.unik.forEach((u) => unikTotal.add(u));
    for (const [p, n] of Object.entries(h.halaman)) halaman[p] = (halaman[p] ?? 0) + n;
    for (const [r, n] of Object.entries(h.rujukan)) rujukan[r] = (rujukan[r] ?? 0) + n;
    perangkat.hp += h.perangkat.hp;
    perangkat.komputer += h.perangkat.komputer;
  }

  const unikLalu = new Set<string>();
  let tampilLalu = 0;
  for (let i = jumlahHari * 2 - 1; i >= jumlahHari; i--) {
    const h = data.hari[tanggalWita(Date.now() - i * 86_400_000)];
    if (!h) continue;
    tampilLalu += h.tampil;
    h.unik.forEach((u) => unikLalu.add(u));
  }

  const urut = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]);
  return {
    seri,
    totalTampil,
    totalUnik: unikTotal.size,
    halaman: urut(halaman).slice(0, 15).map(([path, jumlah]) => ({ path, jumlah })),
    rujukan: urut(rujukan).slice(0, 10).map(([sumber, jumlah]) => ({ sumber, jumlah })),
    perangkat,
    sebelumnya: { tampil: tampilLalu, unik: unikLalu.size },
  };
}
