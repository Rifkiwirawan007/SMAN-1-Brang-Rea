"use server";

import { penggunaSaatIni } from "@/lib/server/pengguna";
import { hapusPesan, ubahPesan, type StatusPesan } from "@/lib/server/pesan";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import type { HasilAksi } from "@/app/dashboard/aksi";

const STATUS: StatusPesan[] = ["baru", "dibaca", "dibalas", "arsip"];
const LABEL: Record<StatusPesan, string> = { baru: "belum dibaca", dibaca: "dibaca", dibalas: "dibalas", arsip: "diarsipkan" };

async function petugas() {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "pesan")) return "Akun Anda tidak punya akses ke pesan masuk.";
  return p;
}

export async function aturStatusPesan(ids: string[], status: StatusPesan): Promise<HasilAksi> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!STATUS.includes(status)) return { ok: false, pesan: "Status tidak dikenal." };
  const kini = new Date().toISOString();
  await ubahPesan(ids, (x) => ({ ...x, status, diubah: kini, oleh: p.nama }));
  if (status !== "dibaca") await catatAktivitas(p, "pesan", "pesan", { ket: `${ids.length} pesan ditandai ${LABEL[status]}` });
  return { ok: true, pesan: ids.length === 1 ? `Pesan ditandai ${LABEL[status]}.` : `${ids.length} pesan ditandai ${LABEL[status]}.` };
}

export async function simpanCatatanPesan(id: string, catatan: string): Promise<HasilAksi> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const bersih = catatan.trim().slice(0, 1000);
  await ubahPesan([id], (x) => ({ ...x, catatan: bersih || undefined, diubah: new Date().toISOString(), oleh: p.nama }));
  return { ok: true, pesan: "Catatan tersimpan." };
}

export async function hapusPesanTerpilih(ids: string[]): Promise<HasilAksi> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  await hapusPesan(ids);
  await catatAktivitas(p, "hapus", "pesan", { ket: `${ids.length} pesan dihapus` });
  return { ok: true, pesan: ids.length === 1 ? "Pesan dihapus." : `${ids.length} pesan dihapus.` };
}
