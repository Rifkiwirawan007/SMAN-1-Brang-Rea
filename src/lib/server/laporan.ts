import "server-only";
import { randomInt } from "node:crypto";
import { bacaJson, filePrivat, idBaru, ubahJson } from "@/lib/server/penyimpanan";
import type { Laporan } from "@/lib/laporan/tipe";

/**
 * Laporan siswa ke BK (rahasia, tidak ikut Git):
 * - data/privat/laporan.json
 */
const FILE = filePrivat("laporan");

export function bacaSemuaLaporan(): Promise<Laporan[]> {
  return bacaJson<Laporan[]>(FILE, []);
}

export function ubahSemuaLaporan(fn: (semua: Laporan[]) => Laporan[] | Promise<Laporan[]>) {
  return ubahJson<Laporan[]>(FILE, [], fn);
}

/** Kode cek 6 karakter tanpa huruf/angka yang mirip (0/O, 1/I/L). */
export function kodeBaru() {
  const huruf = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => huruf[randomInt(huruf.length)]).join("");
}

/** Nomor urut per tahun: LP-2026-0001, LP-2026-0002, ... */
export function nomorBerikut(semua: Laporan[], tahun: string) {
  const awalan = `LP-${tahun}-`;
  const terbesar = semua.filter((l) => l.nomor.startsWith(awalan)).reduce((m, l) => Math.max(m, Number(l.nomor.slice(awalan.length)) || 0), 0);
  return `${awalan}${String(terbesar + 1).padStart(4, "0")}`;
}

export { idBaru };
