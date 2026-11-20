import "server-only";
import path from "node:path";
import { bacaJson, DIR_PRIVAT, idBaru, ubahJson } from "@/lib/server/penyimpanan";
import { bulanSah, tanggalSah } from "@/lib/absensi/tipe";
import type { IzinKeluar } from "@/lib/izin-keluar/tipe";

/** data/privat/izin-keluar/YYYY-MM.json — satu file per bulan supaya tidak membengkak. */
const fileBulan = (bulan: string) => {
  if (!bulanSah(bulan)) throw new Error(`Bulan tidak sah: ${bulan}`);
  return path.join(DIR_PRIVAT, "izin-keluar", `${bulan}.json`);
};

export function bacaIzinBulan(bulan: string): Promise<IzinKeluar[]> {
  return bacaJson<IzinKeluar[]>(fileBulan(bulan), []);
}

export async function bacaIzinTanggal(tanggal: string): Promise<IzinKeluar[]> {
  if (!tanggalSah(tanggal)) return [];
  return (await bacaIzinBulan(tanggal.slice(0, 7))).filter((z) => z.tanggal === tanggal);
}

/** Semua izin di antara dua tanggal (inklusif), terbaru di depan. */
export async function bacaIzinRentang(dari: string, sampai: string): Promise<IzinKeluar[]> {
  const bulan: string[] = [];
  for (let b = dari.slice(0, 7); b <= sampai.slice(0, 7) && bulan.length < 24; ) {
    bulan.push(b);
    const [y, m] = b.split("-").map(Number);
    b = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  }
  const semua = (await Promise.all(bulan.map(bacaIzinBulan))).flat();
  return semua.filter((z) => z.tanggal >= dari && z.tanggal <= sampai).sort((a, b) => b.jamKeluar.localeCompare(a.jamKeluar));
}

/** Simpan izin baru; nomor resi urut per hari dibuat di dalam kunci file supaya tidak dobel. */
export async function tambahIzin(data: Omit<IzinKeluar, "id" | "nomor">): Promise<IzinKeluar> {
  let baru!: IzinKeluar;
  await ubahJson<IzinKeluar[]>(fileBulan(data.tanggal.slice(0, 7)), [], (semua) => {
    const urut = semua.filter((z) => z.tanggal === data.tanggal).length + 1;
    const [y, m, d] = data.tanggal.split("-");
    baru = { id: idBaru(), nomor: `IK-${y.slice(2)}${m}${d}-${String(urut).padStart(3, "0")}`, ...data };
    semua.push(baru);
    return semua;
  });
  return baru;
}

/** Ubah satu izin (cetak ulang / batal). Mengembalikan izin terbaru atau null bila tidak ada. */
export async function ubahIzin(tanggal: string, id: string, fn: (z: IzinKeluar) => IzinKeluar): Promise<IzinKeluar | null> {
  if (!tanggalSah(tanggal)) return null;
  let hasil: IzinKeluar | null = null;
  await ubahJson<IzinKeluar[]>(fileBulan(tanggal.slice(0, 7)), [], (semua) =>
    semua.map((z) => {
      if (z.id !== id) return z;
      hasil = fn(z);
      return hasil;
    }),
  );
  return hasil;
}
