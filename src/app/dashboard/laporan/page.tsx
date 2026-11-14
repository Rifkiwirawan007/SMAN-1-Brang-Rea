import type { Metadata } from "next";
import { connection } from "next/server";
import { ShieldAlert } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSemuaLaporan } from "@/lib/server/laporan";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaLaporan } from "@/components/dasbor/kelola-laporan";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Laporan siswa" };

export default async function HalamanLaporan({ searchParams }: PageProps<"/dashboard/laporan">) {
  await connection();
  const p = await wajibMasuk("laporan");
  const [laporan, { buka }] = await Promise.all([bacaSemuaLaporan(), searchParams]);
  return (
    <>
      <JudulHalaman
        judul="Laporan siswa"
        ikon={ShieldAlert}
        deskripsi="Laporan perundungan, kekerasan, dan masalah lain dari halaman Lapor ke guru BK. Rahasia: hanya guru BK dan admin yang bisa membuka. Balasan untuk pelapor terlihat di halaman cek status; catatan internal tidak."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Laporan siswa" }]}
      />
      {/* Kode cek tidak dikirim ke browser. */}
      <KelolaLaporan laporan={laporan.map(({ kode, ...l }) => (void kode, l))} bukaAwal={typeof buka === "string" ? buka : undefined} admin={p.peran === "admin"} />
    </>
  );
}
