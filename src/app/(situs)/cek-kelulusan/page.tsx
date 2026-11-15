import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHero } from "@/components/ui/page-hero";
import { CekKelulusan } from "@/components/kelulusan/cek-kelulusan";
import { bacaKelulusan, kiniMs } from "@/lib/server/kelulusan";
import { ambilSekolah } from "@/lib/konten/baca";

export const metadata: Metadata = {
  title: "Cek kelulusan",
  description: "Siswa kelas XII SMA Negeri 1 Brang Rea dapat melihat pengumuman kelulusan dengan NISN dan tanggal lahir.",
};

async function Isi() {
  await connection();
  const [{ atur }, sekolah] = await Promise.all([bacaKelulusan(), ambilSekolah()]);
  return (
    <CekKelulusan
      aktif={atur.aktif}
      buka={atur.buka}
      kiniServer={kiniMs()}
      tahunPelajaran={atur.tahunPelajaran}
      sekolah={{
        nama: sekolah.nama,
        npsn: sekolah.npsn,
        alamat: sekolah.alamat.lengkap,
        email: sekolah.kontak.email,
        kabupaten: sekolah.alamat.kabupaten.replace(/^(Kabupaten|Kab\.)\s*/i, ""),
        kepala: sekolah.kepalaSekolah,
        akreditasi: sekolah.akreditasi.nilai,
      }}
    />
  );
}

export default function HalamanCekKelulusan() {
  return (
    <>
      <PageHero
        judul="Cek kelulusan"
        teks="Pengumuman kelulusan siswa kelas XII. Masukkan NISN dan tanggal lahir untuk melihat hasilnya."
        gambar="/images/sekolah/banner-pelepasan-xii.webp"
        alt="Pelepasan siswa kelas XII SMAN 1 Brang Rea"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Cek kelulusan" }]}
      />
      <section className="section-y" aria-label="Cek kelulusan">
        <div className="container-site">
          <Suspense fallback={<div className="mx-auto h-[300px] max-w-[720px] animate-pulse rounded-[18px] bg-paper-2" />}>
            <Isi />
          </Suspense>
        </div>
      </section>
    </>
  );
}
