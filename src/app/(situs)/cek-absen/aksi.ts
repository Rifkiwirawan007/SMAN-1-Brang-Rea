"use server";

import { headers } from "next/headers";
import { bolehLanjut } from "@/lib/server/batas";
import { bacaAbsenBulan, bacaAturAbsensi, bacaSiswa, bacaTanggalLahir } from "@/lib/server/absensi";
import { bulanSah, geserBulan, STATUS_ABSEN, tanggalIni, type CaraAbsen, type StatusAbsen } from "@/lib/absensi/tipe";

export type BarisCek = { tanggal: string; status: StatusAbsen; jam?: string; ket?: string; cara: CaraAbsen; oleh: string; waktu: string };

export type HasilCek =
  | {
      ok: true;
      siswa: { nama: string; kelas: string; disamarkan: boolean };
      hariIni: string;
      statusHariIni: BarisCek | null;
      bulan: string;
      bulanIni: string;
      rekap: Record<StatusAbsen, number>;
      daftar: BarisCek[];
      /** Ketidakhadiran / keterlambatan 14 hari terakhir, terbaru di depan. */
      pengumuman: BarisCek[];
    }
  | { ok: false; pesan: string };

/** "Ahmad Rizki Saputra" → "Ahmad R. S." (dipakai bila cek cukup dengan NISN). */
const samarkan = (nama: string) => {
  const [depan, ...lain] = nama.split(" ");
  return [depan, ...lain.map((k) => `${k[0]}.`)].join(" ");
};

const baris = (c: { tanggal: string; status: StatusAbsen; jam?: string; ket?: string; cara: CaraAbsen; oleh: { nama: string }; waktu: string }): BarisCek => ({
  tanggal: c.tanggal,
  status: c.status,
  jam: c.jam,
  ket: c.ket,
  cara: c.cara,
  oleh: c.oleh.nama,
  waktu: c.waktu,
});

/** Halaman publik Cek absensi: orang tua memasukkan NISN (dan tanggal lahir bila diwajibkan sekolah). */
export async function cekAbsensi(input: { nisn: string; tglLahir?: string; bulan?: string }): Promise<HasilCek> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`cek-absen:${ip}`, 40, 10 * 60_000)) return { ok: false, pesan: "Terlalu banyak pencarian. Coba lagi dalam 10 menit." };

  const atur = await bacaAturAbsensi();
  const nisn = String(input.nisn ?? "").replace(/\D/g, "");
  if (nisn.length !== 10) return { ok: false, pesan: "NISN terdiri dari 10 angka. Lihat di kartu pelajar atau rapor." };
  const tgl = atur.wajibTglLahir ? bacaTanggalLahir(String(input.tglLahir ?? "")) : null;
  if (atur.wajibTglLahir && !tgl) return { ok: false, pesan: "Isi tanggal lahir anak." };

  const siswa = (await bacaSiswa()).find((s) => s.nisn === nisn && s.aktif);
  if (!siswa || (atur.wajibTglLahir && siswa.tglLahir !== tgl)) {
    return {
      ok: false,
      pesan: atur.wajibTglLahir
        ? "NISN atau tanggal lahir tidak cocok dengan data sekolah. Periksa lagi, atau hubungi wali kelas."
        : "NISN tidak terdaftar di data absensi sekolah. Periksa lagi, atau hubungi wali kelas.",
    };
  }

  const hariIni = tanggalIni();
  const bulanIni = hariIni.slice(0, 7);
  const bulan = bulanSah(input.bulan) && input.bulan <= bulanIni ? input.bulan : bulanIni;
  const milik = (daftar: Awaited<ReturnType<typeof bacaAbsenBulan>>) => daftar.filter((c) => c.siswaId === siswa.id);

  const [dataBulan, dataIni, dataLalu] = await Promise.all([
    bacaAbsenBulan(bulan).then(milik),
    bulan === bulanIni ? null : bacaAbsenBulan(bulanIni).then(milik),
    bacaAbsenBulan(geserBulan(bulanIni, -1)).then(milik),
  ]);
  const terkini = [...(dataIni ?? dataBulan), ...dataLalu];

  const rekap = Object.fromEntries(STATUS_ABSEN.map((s) => [s, 0])) as Record<StatusAbsen, number>;
  for (const c of dataBulan) rekap[c.status]++;

  const batas = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const hariIniC = terkini.find((c) => c.tanggal === hariIni);

  return {
    ok: true,
    siswa: { nama: atur.wajibTglLahir ? siswa.nama : samarkan(siswa.nama), kelas: siswa.kelas, disamarkan: !atur.wajibTglLahir },
    hariIni,
    statusHariIni: hariIniC ? baris(hariIniC) : null,
    bulan,
    bulanIni,
    rekap,
    daftar: dataBulan.sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map(baris),
    pengumuman: terkini
      .filter((c) => c.status !== "hadir" && c.tanggal >= batas)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .slice(0, 6)
      .map(baris),
  };
}
