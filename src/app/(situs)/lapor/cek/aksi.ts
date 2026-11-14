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

export async function cekLaporan(input: { kode: string }): Promise<HasilCekLaporan> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`cek-lapor:${ip}`, 30, 10 * 60_000)) return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi dalam 10 menit." };

  const kode = String(input.kode ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (kode.length !== 6) return { ok: false, pesan: "Kode laporan terdiri dari 6 huruf/angka, mis. K7M2Q9." };
  const l = (await bacaSemuaLaporan()).find((x) => sama(x.kode, kode));
  if (!l) return { ok: false, pesan: "Kode tidak ditemukan. Periksa lagi huruf dan angkanya." };

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
