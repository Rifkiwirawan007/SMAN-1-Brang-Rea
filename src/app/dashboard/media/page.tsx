import type { Metadata } from "next";
import { connection } from "next/server";
import { FolderOpen } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaMedia } from "@/components/dasbor/kelola-media";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Pustaka foto" };

export default async function HalamanMedia() {
  await connection();
  await wajibMasuk("media");
  return (
    <>
      <JudulHalaman
        judul="Pustaka foto"
        ikon={FolderOpen}
        deskripsi="Semua foto unggahan dashboard dan foto bawaan situs. Foto besar otomatis diperkecil (maks. 2400 px) dan diubah ke WebP agar situs tetap ringan."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Pustaka foto" }]}
      />
      <KelolaMedia />
    </>
  );
}
