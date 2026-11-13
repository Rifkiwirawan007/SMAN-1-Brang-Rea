import "server-only";
import { bacaJson, filePrivat, idBaru, ubahJson } from "@/lib/server/penyimpanan";

export type JenisAksi =
  | "buat"
  | "ubah"
  | "hapus"
  | "terbit"
  | "draf"
  | "urutkan"
  | "duplikat"
  | "unggah"
  | "masuk"
  | "keluar"
  | "gagal-masuk"
  | "akun"
  | "pesan";

export type Aktivitas = {
  id: string;
  waktu: string;
  oleh: { id: string; nama: string } | null;
  aksi: JenisAksi;
  /** Kunci modul, mis. "berita", "pengguna", "pesan". */
  modul: string;
  target?: string;
  targetId?: string;
  ket?: string;
};

const FILE = filePrivat("aktivitas");
const MAKS = 3000;

export function bacaAktivitas(): Promise<Aktivitas[]> {
  return bacaJson<Aktivitas[]>(FILE, []);
}

export async function catatAktivitas(
  oleh: { id: string; nama: string } | null,
  aksi: JenisAksi,
  modul: string,
  data: { target?: string; targetId?: string; ket?: string } = {},
) {
  const entri: Aktivitas = {
    id: idBaru(),
    waktu: new Date().toISOString(),
    oleh: oleh ? { id: oleh.id, nama: oleh.nama } : null,
    aksi,
    modul,
    ...data,
  };
  try {
    await ubahJson<Aktivitas[]>(FILE, [], (semua) => [entri, ...semua].slice(0, MAKS));
  } catch (e) {
    console.error("Gagal mencatat aktivitas", e);
  }
}
