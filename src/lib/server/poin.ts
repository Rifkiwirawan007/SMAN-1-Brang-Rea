import "server-only";
import path from "node:path";
import { bacaJson, DIR_PRIVAT, filePrivat, idBaru, tulisJson, ubahJson } from "@/lib/server/penyimpanan";
import { ATURAN_BAWAAN, semesterSah, type AturanPoin, type CatatanPoin } from "@/lib/poin/tipe";

/** data/privat/poin/<2026-ganjil>.json — satu file per semester, jadi poin otomatis mulai dari 0 tiap semester. */
const fileSemester = (semester: string) => {
  if (!semesterSah(semester)) throw new Error(`Semester tidak sah: ${semester}`);
  return path.join(DIR_PRIVAT, "poin", `${semester}.json`);
};
const FILE_ATURAN = filePrivat("tata-tertib");

/** Daftar pelanggaran + tingkat sanksi. Bila belum pernah diubah admin, pakai isi buku saku. */
export async function bacaAturanPoin(): Promise<AturanPoin> {
  const a = await bacaJson<AturanPoin | null>(FILE_ATURAN, null);
  return a && a.pelanggaran?.length && a.tingkat?.length ? a : ATURAN_BAWAAN;
}

export function simpanAturanPoin(a: AturanPoin) {
  return tulisJson(FILE_ATURAN, a);
}

export function bacaPoinSemester(semester: string): Promise<CatatanPoin[]> {
  return bacaJson<CatatanPoin[]>(fileSemester(semester), []);
}

export async function tambahCatatanPoin(semester: string, data: Omit<CatatanPoin, "id">): Promise<CatatanPoin> {
  const baru: CatatanPoin = { id: idBaru(), ...data };
  await ubahJson<CatatanPoin[]>(fileSemester(semester), [], (semua) => [...semua, baru]);
  return baru;
}

export async function ubahCatatanPoin(semester: string, id: string, fn: (c: CatatanPoin) => CatatanPoin): Promise<CatatanPoin | null> {
  let hasil: CatatanPoin | null = null;
  await ubahJson<CatatanPoin[]>(fileSemester(semester), [], (semua) =>
    semua.map((c) => {
      if (c.id !== id) return c;
      hasil = fn(c);
      return hasil;
    }),
  );
  return hasil;
}

/** Total poin per siswa (catatan yang dibatalkan tidak dihitung). */
export function totalPerSiswa(catatan: CatatanPoin[]): Map<string, { poin: number; jumlah: number; terakhir: string }> {
  const peta = new Map<string, { poin: number; jumlah: number; terakhir: string }>();
  for (const c of catatan) {
    if (c.batal) continue;
    const r = peta.get(c.siswa.id) ?? { poin: 0, jumlah: 0, terakhir: "" };
    r.poin += c.poin;
    r.jumlah++;
    if (c.tanggal > r.terakhir) r.terakhir = c.tanggal;
    peta.set(c.siswa.id, r);
  }
  return peta;
}
