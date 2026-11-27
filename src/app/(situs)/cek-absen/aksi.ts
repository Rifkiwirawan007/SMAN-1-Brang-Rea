"use server";

import { headers } from "next/headers";
import { bolehLanjut } from "@/lib/server/batas";
import { bacaAbsenBulan, bacaAturAbsensi, bacaSiswa, bacaTanggalLahir } from "@/lib/server/absensi";
import { bulanSah, geserBulan, STATUS_ABSEN, tanggalIni, type CaraAbsen, type StatusAbsen } from "@/lib/absensi/tipe";
import { bacaSesiBulan } from "@/lib/server/jadwal";
import { labelJam, type StatusMapel } from "@/lib/jadwal/tipe";
import { bacaAturanPoin, bacaPoinSemester } from "@/lib/server/poin";
import { semesterDari, tingkatDari } from "@/lib/poin/tipe";

/** Satu ketidakhadiran di jam pelajaran. */
export type BarisMapel = { tanggal: string; jam: string; mapel: string; status: Exclude<StatusMapel, "hadir"> };
export type RekapMapel = { mapel: string; pertemuan: number; sakit: number; izin: number; alpa: number };

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
      /** Ketidakhadiran per jam pelajaran di bulan terpilih, terbaru di depan. */
      mapel: BarisMapel[];
      /** Rekap per mata pelajaran di bulan terpilih (hanya mapel yang sudah diabsen). */
      rekapMapel: RekapMapel[];
      /** Poin pelanggaran tata tertib semester berjalan. */
      poin: { semester: string; total: number; tingkat: string; sanksi: string; daftar: { tanggal: string; pelanggaran: string; poin: number }[] };
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

  const sem = semesterDari(hariIni);
  const [dataBulan, dataIni, dataLalu, sesiBulan, catatanPoin, aturanPoin] = await Promise.all([
    bacaAbsenBulan(bulan).then(milik),
    bulan === bulanIni ? null : bacaAbsenBulan(bulanIni).then(milik),
    bacaAbsenBulan(geserBulan(bulanIni, -1)).then(milik),
    bacaSesiBulan(bulan),
    bacaPoinSemester(sem.kunci),
    bacaAturanPoin(),
  ]);
  const poinSiswa = catatanPoin.filter((c) => c.siswa.id === siswa.id && !c.batal).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const totalPoin = poinSiswa.reduce((n, c) => n + c.poin, 0);
  const tingkatPoin = tingkatDari(totalPoin, aturanPoin.tingkat);
  const sesiSiswa = sesiBulan.filter((x) => x.kelas === siswa.kelas || x.tidakHadir[siswa.id]);
  const peta = new Map<string, RekapMapel>();
  const mapel: BarisMapel[] = [];
  for (const x of sesiSiswa) {
    const r = peta.get(x.mapel) ?? { mapel: x.mapel, pertemuan: 0, sakit: 0, izin: 0, alpa: 0 };
    r.pertemuan++;
    const st = x.tidakHadir[siswa.id];
    if (st) {
      r[st]++;
      mapel.push({ tanggal: x.tanggal, jam: labelJam(x), mapel: x.mapel, status: st });
    }
    peta.set(x.mapel, r);
  }
  mapel.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.jam.localeCompare(a.jam, "id", { numeric: true }));
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
    mapel,
    poin: {
      semester: sem.label,
      total: totalPoin,
      tingkat: tingkatPoin.kode,
      sanksi: tingkatPoin.sanksi,
      daftar: poinSiswa.map((c) => ({ tanggal: c.tanggal, pelanggaran: c.pelanggaran.nama, poin: c.poin })),
    },
    rekapMapel: [...peta.values()].sort((a, b) => b.alpa + b.sakit + b.izin - (a.alpa + a.sakit + a.izin) || a.mapel.localeCompare(b.mapel, "id")),
  };
}
