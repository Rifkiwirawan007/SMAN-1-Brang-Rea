import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { NamaDokumen, NamaKoleksi, PetaDokumen, PetaKoleksi } from "@/lib/konten/tipe";

/**
 * Penyimpanan berbasis file JSON di folder data/ (tanpa database).
 * - data/konten/   isi situs (ikut di-commit)
 * - data/unggahan/ foto yang diunggah lewat dashboard (ikut di-commit)
 * - data/privat/   akun, pesan, statistik, log (TIDAK di-commit)
 * Penulisan memakai kunci per file + tulis-ke-file-sementara-lalu-rename agar file tidak pernah setengah jadi.
 */
export const AKAR_DATA = path.join(process.cwd(), "data");
export const DIR_KONTEN = path.join(AKAR_DATA, "konten");
export const DIR_UNGGAHAN = path.join(AKAR_DATA, "unggahan");
export const DIR_PRIVAT = path.join(AKAR_DATA, "privat");

const fileKonten = (nama: string) => path.join(DIR_KONTEN, `${nama}.json`);
export const filePrivat = (nama: string) => path.join(DIR_PRIVAT, `${nama}.json`);

type Global = typeof globalThis & { __kunciFile?: Map<string, Promise<unknown>> };
const g = globalThis as Global;
const antrean: Map<string, Promise<unknown>> = (g.__kunciFile ??= new Map<string, Promise<unknown>>());

/** Jalankan fn secara berurutan untuk satu file (mencegah dua penulisan saling menimpa). */
async function denganKunci<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const sebelumnya = antrean.get(file) ?? Promise.resolve();
  const jalan = sebelumnya.catch(() => undefined).then(fn);
  antrean.set(file, jalan);
  try {
    return await jalan;
  } finally {
    if (antrean.get(file) === jalan) antrean.delete(file);
  }
}

export async function bacaJson<T>(file: string, bawaan: T): Promise<T> {
  try {
    const teks = await fs.readFile(file, "utf8");
    return JSON.parse(teks) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return bawaan;
    throw e;
  }
}

export async function tulisJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const sementara = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(sementara, JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(sementara, file);
}

/** Baca-ubah-tulis satu file di dalam kunci. */
export function ubahJson<T>(file: string, bawaan: T, fn: (data: T) => T | Promise<T>): Promise<T> {
  return denganKunci(file, async () => {
    const lama = await bacaJson<T>(file, bawaan);
    const baru = await fn(lama);
    await tulisJson(file, baru);
    return baru;
  });
}

/* ---------- Konten ---------- */

export function bacaKoleksi<K extends NamaKoleksi>(nama: K): Promise<PetaKoleksi[K][]> {
  return bacaJson<PetaKoleksi[K][]>(fileKonten(nama), []);
}

export function ubahKoleksi<K extends NamaKoleksi>(
  nama: K,
  fn: (daftar: PetaKoleksi[K][]) => PetaKoleksi[K][] | Promise<PetaKoleksi[K][]>,
) {
  return ubahJson<PetaKoleksi[K][]>(fileKonten(nama), [], fn);
}

export async function bacaDokumen<K extends NamaDokumen>(nama: K): Promise<PetaDokumen[K]> {
  const isi = await bacaJson<PetaDokumen[K] | null>(fileKonten(nama), null);
  if (!isi) throw new Error(`Dokumen konten "${nama}" tidak ditemukan di data/konten/${nama}.json`);
  return isi;
}

export function tulisDokumen<K extends NamaDokumen>(nama: K, isi: PetaDokumen[K]) {
  return denganKunci(fileKonten(nama), () => tulisJson(fileKonten(nama), isi));
}

/** ID pendek acak untuk item baru. */
export const idBaru = () => randomBytes(5).toString("hex");
