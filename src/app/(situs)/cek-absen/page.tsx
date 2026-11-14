import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHero } from "@/components/ui/page-hero";
import { CekAbsen } from "@/components/absen/cek-absen";
import { bacaAturAbsensi } from "@/lib/server/absensi";

export const metadata: Metadata = {
  title: "Cek absensi siswa",
  description: "Orang tua dan wali murid dapat melihat catatan kehadiran siswa SMA Negeri 1 Brang Rea dengan memasukkan NISN.",
};

/** Pengaturan (wajib tanggal lahir atau tidak) dibaca saat diminta, bukan saat build. */
async function FormCek() {
  await connection();
  const atur = await bacaAturAbsensi();
  return <CekAbsen wajibTglLahir={atur.wajibTglLahir} />;
}

export default function HalamanCekAbsen() {
  return (
    <>
      <PageHero
        judul="Cek absensi siswa"
        teks="Untuk orang tua dan wali murid: lihat catatan kehadiran anak setiap hari, langsung dari absensi QR di sekolah."
        gambar="/images/sekolah/upacara-pemimpin.jpg"
        alt="Siswa SMAN 1 Brang Rea mengikuti upacara di halaman sekolah"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Cek absensi" }]}
      />
      <section className="section-y" aria-label="Pencarian absensi">
        <div className="container-site">
          <Suspense fallback={<div className="mx-auto h-[260px] max-w-[720px] animate-pulse rounded-[18px] bg-paper-2" />}>
            <FormCek />
          </Suspense>
        </div>
      </section>
    </>
  );
}
