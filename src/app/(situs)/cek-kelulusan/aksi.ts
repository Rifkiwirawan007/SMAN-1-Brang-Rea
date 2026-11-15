"use server";

import { headers } from "next/headers";
import { bolehLanjut } from "@/lib/server/batas";
import { bacaSiswa, bacaTanggalLahir } from "@/lib/server/absensi";
import { bacaKelulusan, sudahDibuka } from "@/lib/server/kelulusan";
import { kelasAkhir, type StatusLulus } from "@/lib/kelulusan/tipe";

export type HasilCekLulus =
  | {
      ok: true;
      siswa: { nama: string; nisn: string; kelas: string; tglLahir: string };
      status: StatusLulus;
      ket?: string;
      pesan: string;
      skl: boolean;
      nomorSurat: string;
      tahunPelajaran: string;
    }
  | { ok: false; pesan: string; belumBuka?: boolean };

export async function cekKelulusan(input: { nisn: string; tglLahir: string }): Promise<HasilCekLulus> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`cek-lulus:${ip}`, 20, 10 * 60_000)) return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi dalam 10 menit." };

  const { atur, hasil } = await bacaKelulusan();
  if (!sudahDibuka(atur)) return { ok: false, belumBuka: true, pesan: "Pengumuman kelulusan belum dibuka." };

  const nisn = String(input.nisn ?? "").replace(/\D/g, "");
  if (nisn.length !== 10) return { ok: false, pesan: "NISN terdiri dari 10 angka. Lihat di kartu pelajar atau rapor." };
  const tgl = bacaTanggalLahir(String(input.tglLahir ?? ""));
  if (!tgl) return { ok: false, pesan: "Isi tanggal lahir." };

  const siswa = (await bacaSiswa()).find((s) => s.nisn === nisn && s.aktif && kelasAkhir(s.kelas));
  if (!siswa || !siswa.tglLahir || siswa.tglLahir !== tgl) {
    return { ok: false, pesan: "NISN atau tanggal lahir tidak cocok dengan data siswa kelas XII. Periksa lagi, atau hubungi wali kelas." };
  }
  const r = hasil[nisn];
  if (!r) return { ok: false, pesan: "Status kelulusan Anda belum tersedia. Silakan hubungi wali kelas atau bagian kurikulum." };

  return {
    ok: true,
    siswa: { nama: siswa.nama, nisn, kelas: siswa.kelas, tglLahir: tgl },
    status: r.status,
    ket: r.ket,
    pesan: r.status === "lulus" ? atur.pesanLulus : atur.pesanTidak,
    skl: atur.skl && r.status === "lulus",
    nomorSurat: atur.nomorSurat,
    tahunPelajaran: atur.tahunPelajaran,
  };
}
