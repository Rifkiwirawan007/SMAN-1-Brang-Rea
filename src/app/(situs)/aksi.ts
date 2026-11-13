"use server";

import { headers } from "next/headers";
import { tambahPesan, type JenisPesan } from "@/lib/server/pesan";
import { bolehLanjut } from "@/lib/server/batas";

export type InputPesan = {
  nama: string;
  peran: string;
  keperluan: string;
  telepon?: string;
  isi: string;
  halaman?: string;
  /** Kolom jebakan bot: harus kosong. */
  situs?: string;
};

const potong = (v: unknown, maks: number) => String(v ?? "").trim().slice(0, maks);

/**
 * Simpan salinan pesan formulir kontak/SPMB ke dashboard (Pesan masuk).
 * Pengiriman WhatsApp tetap terjadi di sisi pengunjung; fungsi ini hanya mencatat.
 */
export async function kirimPesan(input: InputPesan): Promise<{ ok: boolean }> {
  if (input.situs) return { ok: true }; // bot mengisi kolom tersembunyi: abaikan diam-diam

  const nama = potong(input.nama, 80);
  const isi = potong(input.isi, 2000);
  if (nama.length < 2 || isi.length < 10) return { ok: false };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`pesan:${ip}`, 5, 10 * 60_000)) return { ok: false };

  const keperluan = potong(input.keperluan, 60) || "Informasi umum";
  const halaman = potong(input.halaman, 120);
  const jenis: JenisPesan = /spmb|pendaftaran/i.test(keperluan) || halaman.startsWith("/spmb") ? "spmb" : "kontak";
  const telepon = potong(input.telepon, 20).replace(/[^\d+]/g, "");

  await tambahPesan({
    jenis,
    nama,
    peran: potong(input.peran, 40),
    keperluan,
    telepon: telepon || undefined,
    isi,
    halaman: halaman || undefined,
  });
  return { ok: true };
}
