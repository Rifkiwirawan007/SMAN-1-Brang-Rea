import "server-only";
import { bacaJson, filePrivat, ubahJson } from "@/lib/server/penyimpanan";
import { ATUR_LULUS_BAWAAN, type DataKelulusan } from "@/lib/kelulusan/tipe";

/** data/privat/kelulusan.json: pengaturan pengumuman + status per NISN (privat, tidak ikut Git). */
const FILE = filePrivat("kelulusan");
const KOSONG: DataKelulusan = { atur: ATUR_LULUS_BAWAAN, hasil: {} };

export async function bacaKelulusan(): Promise<DataKelulusan> {
  const d = await bacaJson<Partial<DataKelulusan>>(FILE, KOSONG);
  return { atur: { ...ATUR_LULUS_BAWAAN, ...(d.atur ?? {}) }, hasil: d.hasil ?? {} };
}

export function ubahKelulusan(fn: (d: DataKelulusan) => DataKelulusan | Promise<DataKelulusan>) {
  return ubahJson<DataKelulusan>(FILE, KOSONG, async (lama) =>
    fn({ atur: { ...ATUR_LULUS_BAWAAN, ...(lama.atur ?? {}) }, hasil: lama.hasil ?? {} }),
  );
}

/** Sudah boleh dicek? (aktif dan waktu buka sudah lewat). */
export function sudahDibuka(atur: DataKelulusan["atur"], kini = Date.now()) {
  return atur.aktif && (!atur.buka || new Date(atur.buka).getTime() <= kini);
}

/** Waktu server sekarang (ms), untuk menyelaraskan hitung mundur di browser. */
export const kiniMs = () => Date.now();
