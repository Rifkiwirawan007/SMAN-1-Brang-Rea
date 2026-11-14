"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { bolehLanjut } from "@/lib/server/batas";
import { bacaSemuaLaporan } from "@/lib/server/laporan";
import type { JenisLaporan, StatusLaporan } from "@/lib/laporan/tipe";

export type HasilCekLaporan =
  | {
      ok: true;
      nomor: string;
      dibuat: string;
      jenis: JenisLaporan;
      status: StatusLaporan;
      /** Perubahan status tanpa nama guru. */
      riwayat: { waktu: string; status: StatusLaporan }[];
      /** Hanya balasan untuk pelapor (catatan internal BK tidak dikirim). */
      balasan: { waktu: string; isi: string }[];
    }
  | { ok: false; pesan: string };

const sama = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function cekLaporan(input: { nomor: string; kode: string }): Promise<HasilCekLaporan> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`cek-lapor:${ip}`, 30, 10 * 60_000)) return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi dalam 10 menit." };

  const nomor = String(input.nomor ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const kode = String(input.kode ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (!/^LP-\d{4}-\d{4,}$/.test(nomor) || !/^[A-Z0-9]{6}$/.test(kode)) {
    return { ok: false, pesan: "Tulis nomor laporan (mis. LP-2026-0001) dan kode 6 karakter dengan benar." };
  }
  const l = (await bacaSemuaLaporan()).find((x) => x.nomor === nomor);
  if (!l || !sama(l.kode, kode)) return { ok: false, pesan: "Nomor laporan atau kode tidak cocok. Periksa lagi huruf dan angkanya." };

  return {
    ok: true,
    nomor: l.nomor,
    dibuat: l.dibuat,
    jenis: l.jenis,
    status: l.status,
    riwayat: l.riwayat.map((r) => ({ waktu: r.waktu, status: r.status })),
    balasan: l.catatan.filter((c) => c.untukPelapor).map((c) => ({ waktu: c.waktu, isi: c.isi })),
  };
}
