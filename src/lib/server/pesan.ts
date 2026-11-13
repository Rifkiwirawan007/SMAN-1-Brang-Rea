import "server-only";
import { bacaJson, filePrivat, idBaru, ubahJson } from "@/lib/server/penyimpanan";

export type JenisPesan = "kontak" | "spmb";
export type StatusPesan = "baru" | "dibaca" | "dibalas" | "arsip";

export type Pesan = {
  id: string;
  /** ISO waktu masuk. */
  waktu: string;
  jenis: JenisPesan;
  nama: string;
  /** "Saya adalah": orang tua, calon murid, dst. */
  peran: string;
  keperluan: string;
  telepon?: string;
  isi: string;
  /** Halaman tempat formulir diisi. */
  halaman?: string;
  status: StatusPesan;
  /** Catatan internal petugas (tidak terlihat pengirim). */
  catatan?: string;
  diubah?: string;
  oleh?: string;
};

const FILE = filePrivat("pesan");
const MAKS_SIMPAN = 5000;

export function bacaSemuaPesan(): Promise<Pesan[]> {
  return bacaJson<Pesan[]>(FILE, []);
}

export async function tambahPesan(data: Omit<Pesan, "id" | "waktu" | "status">) {
  const pesan: Pesan = { id: idBaru(), waktu: new Date().toISOString(), status: "baru", ...data };
  await ubahJson<Pesan[]>(FILE, [], (semua) => [pesan, ...semua].slice(0, MAKS_SIMPAN));
  return pesan;
}

export function ubahPesan(ids: string[], ubah: (p: Pesan) => Pesan) {
  const set = new Set(ids);
  return ubahJson<Pesan[]>(FILE, [], (semua) => semua.map((p) => (set.has(p.id) ? ubah(p) : p)));
}

export function hapusPesan(ids: string[]) {
  const set = new Set(ids);
  return ubahJson<Pesan[]>(FILE, [], (semua) => semua.filter((p) => !set.has(p.id)));
}
