"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaJadwal, simpanJadwal, tulisSesi } from "@/lib/server/jadwal";
import { tanggalIni, tanggalSah } from "@/lib/absensi/tipe";
import {
  blokKelas,
  hariDari,
  HARI,
  labelJam,
  LABEL_MAPEL,
  type Jadwal,
  type SesiMapel,
  type StatusMapel,
} from "@/lib/jadwal/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "absen-kelas")) return "Akun Anda tidak punya akses ke absen kelas.";
  return p;
}

export type HasilSesi = { ok: true; pesan: string; sesi: SesiMapel } | { ok: false; pesan: string };

/**
 * Guru menyimpan absen satu blok pelajaran. Hanya siswa yang tidak hadir dikirim.
 * Guru: hanya untuk hari ini. Admin: hari ini atau tanggal yang sudah lewat (koreksi).
 */
export async function simpanAbsenKelas(input: {
  tanggal: string;
  kelas: string;
  jamMulai: number;
  tidakHadir: Record<string, StatusMapel>;
}): Promise<HasilSesi> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const hariIni = tanggalIni();
  if (!tanggalSah(input.tanggal) || input.tanggal > hariIni) return { ok: false, pesan: "Tanggal tidak sah." };
  if (input.tanggal !== hariIni && p.peran !== "admin") {
    return { ok: false, pesan: "Absen kelas hanya bisa diisi pada hari yang sama. Hubungi admin untuk koreksi." };
  }
  const hari = hariDari(input.tanggal);
  if (!hari) return { ok: false, pesan: "Hari Minggu tidak ada jadwal pelajaran." };

  const jadwal = await bacaJadwal();
  const blok = blokKelas(jadwal, hari, input.kelas).find((b) => b.jamMulai === Number(input.jamMulai));
  if (!blok) return { ok: false, pesan: "Jam pelajaran ini tidak ada di jadwal." };

  const siswa = (await bacaSiswa()).filter((s) => s.aktif && s.kelas === input.kelas);
  const ids = new Set(siswa.map((s) => s.id));
  const tidakHadir: SesiMapel["tidakHadir"] = {};
  for (const [id, st] of Object.entries(input.tidakHadir ?? {})) {
    if (ids.has(id) && (st === "sakit" || st === "izin" || st === "alpa")) tidakHadir[id] = st;
  }

  const n = { sakit: 0, izin: 0, alpa: 0 };
  for (const st of Object.values(tidakHadir)) n[st]++;
  const ringkas = `Hadir ${siswa.length - Object.keys(tidakHadir).length}, sakit ${n.sakit}, izin ${n.izin}, alpa ${n.alpa}`;
  const pengganti = blok.akunId && blok.akunId !== p.id && p.peran !== "admin";

  const sesi = await tulisSesi(
    {
      tanggal: input.tanggal,
      kelas: blok.kelas,
      jamMulai: blok.jamMulai,
      jamSelesai: blok.jamSelesai,
      kode: blok.kode,
      mapel: blok.mapel,
      guruJadwal: blok.guru,
      oleh: { id: p.id, nama: p.nama },
      tidakHadir,
      jumlahSiswa: siswa.length,
    },
    pengganti ? `${ringkas} (guru pengganti)` : ringkas,
  );
  await catatAktivitas(p, "ubah", "absen-kelas", {
    target: `${blok.kelas} · ${labelJam(blok)} · ${blok.mapel}`,
    ket: `${input.tanggal}: ${ringkas}`,
  });
  const nama = (id: string) => siswa.find((s) => s.id === id)?.nama ?? "";
  const tidak = Object.entries(tidakHadir)
    .slice(0, 3)
    .map(([id, st]) => `${nama(id)} (${LABEL_MAPEL[st].toLowerCase()})`)
    .join(", ");
  return {
    ok: true,
    pesan: Object.keys(tidakHadir).length ? `Tersimpan. Tidak hadir: ${tidak}${Object.keys(tidakHadir).length > 3 ? ", …" : ""}` : "Tersimpan. Semua siswa hadir.",
    sesi,
  };
}

/* ---------------- Jadwal (admin) ---------------- */

const jamSah = (s: unknown) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export async function simpanJadwalPelajaran(j: Jadwal): Promise<{ ok: boolean; pesan: string }> {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "jadwal")) return { ok: false, pesan: "Hanya admin yang bisa mengubah jadwal." };

  const guru = (Array.isArray(j.guru) ? j.guru : [])
    .map((g) => ({
      kode: Math.trunc(Number(g.kode)),
      nama: String(g.nama ?? "").trim().slice(0, 80),
      mapel: String(g.mapel ?? "").trim().slice(0, 60),
      akunId: g.akunId ? String(g.akunId) : undefined,
    }))
    .filter((g) => g.kode > 0 && g.nama && g.mapel);
  const kodeSah = new Set(guru.map((g) => g.kode));
  if (kodeSah.size !== guru.length) return { ok: false, pesan: "Ada kode guru yang dobel. Setiap kode harus unik." };

  const jam: Jadwal["jam"] = { umum: {}, jumat: {} };
  for (const jenis of ["umum", "jumat"] as const) {
    for (const [k, v] of Object.entries(j.jam?.[jenis] ?? {})) {
      if (!Array.isArray(v) || !jamSah(v[0]) || !jamSah(v[1]) || v[0] >= v[1]) {
        return { ok: false, pesan: `Jam ke-${k} (${jenis === "umum" ? "Senin–Sabtu" : "Jumat"}) tidak sah. Contoh 07:50 – 08:25.` };
      }
      jam[jenis][k] = [v[0], v[1]];
    }
  }

  const jadwal: Jadwal["jadwal"] = {};
  for (const h of HARI) {
    const isi = j.jadwal?.[h];
    if (!isi) continue;
    const batas = Object.keys(h === "jumat" ? jam.jumat : jam.umum).length;
    jadwal[h] = {};
    for (const [kelas, baris] of Object.entries(isi)) {
      const k = String(kelas).trim().toUpperCase().slice(0, 20);
      if (!k) continue;
      const b = (Array.isArray(baris) ? baris : []).slice(0, batas).map((x) => Math.trunc(Number(x)) || 0);
      const salah = b.find((x) => x && !kodeSah.has(x));
      if (salah) return { ok: false, pesan: `Kode ${salah} di ${h} kelas ${k} tidak ada di daftar guru.` };
      jadwal[h]![k] = b;
    }
  }

  const wali: Jadwal["wali"] = {};
  for (const [k, v] of Object.entries(j.wali ?? {})) if (v) wali[k] = String(v);

  await simpanJadwal({
    tahunAjaran: String(j.tahunAjaran ?? "").slice(0, 20),
    semester: String(j.semester ?? "").slice(0, 20),
    jam,
    guru: guru.sort((a, b) => a.kode - b.kode),
    jadwal,
    wali,
    diubah: { waktu: new Date().toISOString(), oleh: p.nama },
  });
  await catatAktivitas(p, "ubah", "jadwal", { target: "Jadwal pelajaran", ket: `${j.tahunAjaran} ${j.semester}` });
  return { ok: true, pesan: "Jadwal pelajaran disimpan." };
}
