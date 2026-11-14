import type { Metadata } from "next";
import { connection } from "next/server";
import { Contact } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaSiswa } from "@/components/dasbor/kelola-siswa";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Data siswa" };

export default async function HalamanSiswa() {
  await connection();
  await wajibMasuk("siswa");
  const siswa = await bacaSiswa();
  return (
    <>
      <JudulHalaman
        judul="Data siswa"
        ikon={Contact}
        deskripsi="Daftar siswa untuk absensi. QR di kartu siswa dicocokkan dengan NISN (atau kolom Kode QR bila isi QR berbeda). Data ini privat, tidak tampil di situs."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Absensi siswa", href: "/dashboard/absensi" }, { label: "Data siswa" }]}
      />
      <KelolaSiswa daftar={siswa} />
    </>
  );
}
