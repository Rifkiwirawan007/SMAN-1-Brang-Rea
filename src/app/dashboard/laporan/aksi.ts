"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import { idBaru, ubahSemuaLaporan } from "@/lib/server/laporan";
import { LABEL_STATUS_LAPORAN, STATUS_LAPORAN, type Laporan, type StatusLaporan } from "@/lib/laporan/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "laporan")) return "Akun Anda tidak punya akses ke laporan siswa.";
  return p;
}

export type HasilLaporan = { ok: true; pesan: string } | { ok: false; pesan: string };

/** Ubah satu laporan di dalam kunci file. Mengembalikan laporan sesudah diubah, atau null bila tidak ada. */
async function ubahSatu(id: string, fn: (l: Laporan) => Laporan): Promise<Laporan | null> {
  let hasil: Laporan | null = null;
  await ubahSemuaLaporan((semua) =>
    semua.map((l) => {
      if (l.id !== id) return l;
      hasil = fn(l);
      return hasil;
    }),
  );
  return hasil;
}

export async function aturStatusLaporan(id: string, status: StatusLaporan, diam = false): Promise<HasilLaporan> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!STATUS_LAPORAN.includes(status)) return { ok: false, pesan: "Status tidak dikenal." };
  const kini = new Date().toISOString();
  const l = await ubahSatu(id, (x) =>
    x.status === status ? x : { ...x, status, diubah: kini, riwayat: [...x.riwayat, { waktu: kini, oleh: p.nama, status }] },
  );
  if (!l) return { ok: false, pesan: "Laporan tidak ditemukan." };
  if (!diam) await catatAktivitas(p, "ubah", "laporan", { target: l.nomor, ket: `Status: ${LABEL_STATUS_LAPORAN[status]}` });
  return { ok: true, pesan: `${l.nomor} ditandai ${LABEL_STATUS_LAPORAN[status].toLowerCase()}.` };
}

/** Catatan internal (hanya BK) atau balasan yang terlihat oleh pelapor di halaman cek status. */
export async function tambahCatatanLaporan(id: string, isi: string, untukPelapor: boolean): Promise<HasilLaporan> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const bersih = String(isi ?? "").trim().slice(0, 2000);
  if (bersih.length < 2) return { ok: false, pesan: "Tulis isi catatan dulu." };
  const kini = new Date().toISOString();
  const l = await ubahSatu(id, (x) => ({
    ...x,
    diubah: kini,
    catatan: [...x.catatan, { id: idBaru(), waktu: kini, oleh: p.nama, isi: bersih, untukPelapor: !!untukPelapor }],
  }));
  if (!l) return { ok: false, pesan: "Laporan tidak ditemukan." };
  await catatAktivitas(p, "ubah", "laporan", { target: l.nomor, ket: untukPelapor ? "Membalas pelapor" : "Menambah catatan internal" });
  return { ok: true, pesan: untukPelapor ? "Balasan terkirim. Pelapor bisa membacanya di halaman cek status." : "Catatan internal disimpan." };
}

/** Hanya admin, untuk laporan iseng/spam. */
export async function hapusLaporan(id: string): Promise<HasilLaporan> {
  const p = await penggunaSaatIni();
  if (!p || p.peran !== "admin") return { ok: false, pesan: "Hanya admin yang bisa menghapus laporan." };
  let hapus: Laporan | undefined;
  await ubahSemuaLaporan((semua) => {
    hapus = semua.find((l) => l.id === id);
    return semua.filter((l) => l.id !== id);
  });
  if (!hapus) return { ok: false, pesan: "Laporan tidak ditemukan." };
  await catatAktivitas(p, "hapus", "laporan", { target: hapus.nomor });
  return { ok: true, pesan: `${hapus.nomor} dihapus.` };
}
