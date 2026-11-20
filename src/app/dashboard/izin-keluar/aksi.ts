"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import { bacaSiswa, cariDariKode } from "@/lib/server/absensi";
import { bacaIzinTanggal, tambahIzin, ubahIzin } from "@/lib/server/izin-keluar";
import { tanggalIni } from "@/lib/absensi/tipe";
import type { IzinKeluar } from "@/lib/izin-keluar/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "izin-keluar")) return "Akun Anda tidak punya akses ke izin keluar.";
  return p;
}

type SiswaRingkas = IzinKeluar["siswa"];

export type HasilCari =
  | { ok: true; siswa: SiswaRingkas; /** Izin hari ini yang sudah ada (tidak termasuk yang dibatalkan). */ sebelumnya: IzinKeluar[] }
  | { ok: false; pesan: string };

/** Dipanggil saat QR kartu terbaca atau NISN diketik. Belum mencatat apa pun. */
export async function cariSiswaIzin(kode: string): Promise<HasilCari> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const bersih = String(kode ?? "").trim().slice(0, 300);
  if (!bersih) return { ok: false, pesan: "Kode kosong." };
  const s = cariDariKode(bersih, await bacaSiswa());
  if (!s) return { ok: false, pesan: `QR tidak dikenal: "${bersih.slice(0, 40)}". Cek data siswa.` };
  const sebelumnya = (await bacaIzinTanggal(tanggalIni())).filter((z) => z.siswa.id === s.id && !z.batal);
  return { ok: true, siswa: { id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn }, sebelumnya };
}

export type HasilIzin = { ok: true; izin: IzinKeluar; pesan: string } | { ok: false; pesan: string };

/** Catat izin keluar sekarang (jam keluar = waktu server, WITA). */
export async function beriIzinKeluar(siswaId: string, keperluan: string): Promise<HasilIzin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const s = (await bacaSiswa()).find((x) => x.id === siswaId && x.aktif);
  if (!s) return { ok: false, pesan: "Siswa tidak ditemukan atau sudah tidak aktif." };
  const k = String(keperluan ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (k.length < 3) return { ok: false, pesan: "Isi keperluan siswa keluar." };

  const izin = await tambahIzin({
    tanggal: tanggalIni(),
    jamKeluar: new Date().toISOString(),
    siswa: { id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn },
    keperluan: k,
    oleh: { id: p.id, nama: p.nama },
  });
  await catatAktivitas(p, "buat", "izin-keluar", { target: s.nama, targetId: izin.id, ket: `${izin.nomor}: ${k}` });
  return { ok: true, izin, pesan: `Izin keluar ${s.nama} tercatat (${izin.nomor}).` };
}

/** Hitung cetak ulang (resi macet/hilang). */
export async function catatCetakUlang(tanggal: string, id: string): Promise<HasilIzin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const izin = await ubahIzin(tanggal, id, (z) => ({ ...z, cetakUlang: (z.cetakUlang ?? 0) + 1 }));
  if (!izin) return { ok: false, pesan: "Izin tidak ditemukan." };
  return { ok: true, izin, pesan: "Resi dicetak ulang." };
}

/** Batalkan izin yang salah input. Hanya hari ini, oleh pemberi izin atau admin. Catatan tetap disimpan. */
export async function batalkanIzin(tanggal: string, id: string, alasan: string): Promise<HasilIzin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const ada = (await bacaIzinTanggal(tanggal)).find((z) => z.id === id);
  if (!ada) return { ok: false, pesan: "Izin tidak ditemukan." };
  if (ada.batal) return { ok: false, pesan: "Izin ini sudah dibatalkan." };
  if (p.peran !== "admin" && (ada.oleh.id !== p.id || tanggal !== tanggalIni()))
    return { ok: false, pesan: "Hanya pemberi izin (di hari yang sama) atau admin yang bisa membatalkan." };
  const a = String(alasan ?? "").trim().slice(0, 200);
  const izin = await ubahIzin(tanggal, id, (z) => ({ ...z, batal: { waktu: new Date().toISOString(), oleh: p.nama, alasan: a || undefined } }));
  if (!izin) return { ok: false, pesan: "Izin tidak ditemukan." };
  await catatAktivitas(p, "hapus", "izin-keluar", { target: ada.siswa.nama, targetId: id, ket: `${ada.nomor} dibatalkan${a ? `: ${a}` : ""}` });
  return { ok: true, izin, pesan: `Izin ${ada.nomor} dibatalkan.` };
}
