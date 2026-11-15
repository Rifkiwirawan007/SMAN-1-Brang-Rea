"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import { bacaSiswa } from "@/lib/server/absensi";
import { ubahKelulusan } from "@/lib/server/kelulusan";
import { bacaStatusLulus, LABEL_LULUS, STATUS_LULUS, type AturKelulusan, type StatusLulus } from "@/lib/kelulusan/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "kelulusan")) return "Akun Anda tidak punya akses ke data kelulusan.";
  return p;
}

export type Hasil = { ok: boolean; pesan: string };

export async function simpanAturKelulusan(input: AturKelulusan & { bukaLokal?: string }): Promise<Hasil> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  let buka: string | null = null;
  const lokal = String(input.bukaLokal ?? "").trim();
  if (lokal) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(lokal)) return { ok: false, pesan: "Format jadwal pengumuman tidak sah." };
    buka = `${lokal}:00+08:00`;
    if (Number.isNaN(new Date(buka).getTime())) return { ok: false, pesan: "Jadwal pengumuman tidak sah." };
  }
  const atur: AturKelulusan = {
    aktif: !!input.aktif,
    buka,
    tahunPelajaran: String(input.tahunPelajaran ?? "").trim().slice(0, 20) || "2026/2027",
    nomorSurat: String(input.nomorSurat ?? "").trim().slice(0, 80),
    pesanLulus: String(input.pesanLulus ?? "").trim().slice(0, 400),
    pesanTidak: String(input.pesanTidak ?? "").trim().slice(0, 400),
    skl: !!input.skl,
  };
  await ubahKelulusan((d) => ({ ...d, atur }));
  await catatAktivitas(p, "ubah", "kelulusan", { target: "Pengaturan kelulusan", ket: atur.aktif ? `Aktif${buka ? `, dibuka ${lokal.replace("T", " ")} WITA` : ""}` : "Nonaktif" });
  return { ok: true, pesan: "Pengaturan kelulusan disimpan." };
}

/** Ubah status satu atau beberapa siswa (status null = hapus tanda). */
export async function tandaiKelulusan(nisn: string[], status: StatusLulus | null, ket?: string): Promise<Hasil> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (status && !STATUS_LULUS.includes(status)) return { ok: false, pesan: "Status tidak dikenal." };
  const daftar = [...new Set(nisn.map((n) => String(n).replace(/\D/g, "")).filter((n) => n.length === 10))].slice(0, 3000);
  if (!daftar.length) return { ok: false, pesan: "Tidak ada siswa dipilih." };
  const kini = new Date().toISOString();
  await ubahKelulusan((d) => {
    const hasil = { ...d.hasil };
    for (const n of daftar) {
      if (!status) delete hasil[n];
      else hasil[n] = { status, ket: ket?.trim().slice(0, 200) || (hasil[n]?.status === status ? hasil[n]?.ket : undefined), diubah: kini, oleh: p.nama };
    }
    return { ...d, hasil };
  });
  await catatAktivitas(p, "ubah", "kelulusan", {
    target: daftar.length === 1 ? `NISN ${daftar[0]}` : `${daftar.length} siswa`,
    ket: status ? `Ditandai ${LABEL_LULUS[status]}` : "Tanda dihapus",
  });
  return { ok: true, pesan: daftar.length === 1 ? (status ? `Ditandai ${LABEL_LULUS[status].toLowerCase()}.` : "Tanda dihapus.") : `${daftar.length} siswa ${status ? `ditandai ${LABEL_LULUS[status].toLowerCase()}` : "dihapus tandanya"}.` };
}

export type HasilImporLulus = Hasil & { berhasil: number; gagal: { baris: number; isi: string; alasan: string }[] };

/**
 * Impor dari salin-tempel Excel/Sheets atau CSV. Kolom: NISN, Status, Keterangan (opsional).
 * Baris judul dikenali otomatis. NISN harus sudah ada di Data siswa.
 */
export async function imporKelulusan(teks: string): Promise<HasilImporLulus> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p, berhasil: 0, gagal: [] };
  const baris = String(teks ?? "").slice(0, 1_000_000).split(/\r?\n/).map((b, i) => ({ no: i + 1, b })).filter((x) => x.b.trim());
  if (!baris.length) return { ok: false, pesan: "Tidak ada data untuk diimpor.", berhasil: 0, gagal: [] };
  const pemisah = baris[0].b.includes("\t") ? "\t" : baris[0].b.includes(";") ? ";" : ",";
  const pecah = (b: string) => b.split(pemisah).map((s) => s.trim().replace(/^"(.*)"$/, "$1"));

  let iNisn = 0, iStatus = 1, iKet = 2;
  const judul = pecah(baris[0].b).map((s) => s.toLowerCase());
  if (judul.includes("nisn")) {
    iNisn = judul.indexOf("nisn");
    iStatus = judul.findIndex((s) => s.includes("status") || s.includes("kelulusan") || s === "hasil");
    iKet = judul.findIndex((s) => s.startsWith("ket") || s.includes("catatan"));
    baris.shift();
    if (iStatus < 0) return { ok: false, pesan: "Kolom Status tidak ditemukan di baris judul.", berhasil: 0, gagal: [] };
  }

  const siswa = new Map((await bacaSiswa()).map((s) => [s.nisn, s]));
  const gagal: HasilImporLulus["gagal"] = [];
  const masuk: { nisn: string; status: StatusLulus; ket?: string }[] = [];
  for (const { no, b } of baris.slice(0, 3000)) {
    const sel = pecah(b);
    let nisn = String(sel[iNisn] ?? "").replace(/\D/g, "");
    if (nisn.length >= 8 && nisn.length < 10) nisn = nisn.padStart(10, "0");
    const status = bacaStatusLulus(String(sel[iStatus] ?? ""));
    const isi = b.slice(0, 80);
    if (nisn.length !== 10) gagal.push({ baris: no, isi, alasan: "NISN harus 10 angka." });
    else if (!siswa.has(nisn)) gagal.push({ baris: no, isi, alasan: "NISN belum ada di Data siswa." });
    else if (!status) gagal.push({ baris: no, isi, alasan: "Status harus Lulus, Tidak lulus, atau Ditunda." });
    else masuk.push({ nisn, status, ket: iKet >= 0 ? String(sel[iKet] ?? "").trim().slice(0, 200) || undefined : undefined });
  }
  if (masuk.length) {
    const kini = new Date().toISOString();
    await ubahKelulusan((d) => {
      const hasil = { ...d.hasil };
      for (const m of masuk) hasil[m.nisn] = { status: m.status, ket: m.ket, diubah: kini, oleh: p.nama };
      return { ...d, hasil };
    });
    await catatAktivitas(p, "buat", "kelulusan", { target: "Impor kelulusan", ket: `${masuk.length} berhasil, ${gagal.length} gagal` });
  }
  return {
    ok: masuk.length > 0,
    pesan: `${masuk.length} siswa diperbarui${gagal.length ? `, ${gagal.length} baris gagal` : ""}.`,
    berhasil: masuk.length,
    gagal: gagal.slice(0, 100),
  };
}

