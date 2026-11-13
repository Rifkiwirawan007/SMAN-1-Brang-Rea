import type { Metadata } from "next";
import { connection } from "next/server";
import { UsersRound } from "lucide-react";
import { amankan, bacaSemuaPengguna, wajibMasuk } from "@/lib/server/pengguna";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaPengguna } from "@/components/dasbor/kelola-pengguna";

export const metadata: Metadata = { title: "Pengguna" };

export default async function HalamanPengguna() {
  await connection();
  const saya = await wajibMasuk("pengguna");
  const daftar = (await bacaSemuaPengguna()).map(amankan).sort((a, b) => Number(b.peran === "admin") - Number(a.peran === "admin") || a.nama.localeCompare(b.nama, "id"));
  return (
    <>
      <JudulHalaman
        judul="Pengguna"
        ikon={UsersRound}
        deskripsi="Akun yang bisa masuk ke dashboard. Admin mengelola semua fitur; Editor hanya konten. Setelah sandi diatur ulang atau akun dinonaktifkan, sesi lamanya langsung berakhir."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Pengguna" }]}
      />
      <KelolaPengguna daftar={daftar} sayaId={saya.id} />
    </>
  );
}
