import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { FormLapor } from "@/components/lapor/form-lapor";

export const metadata: Metadata = {
  title: "Lapor ke guru BK",
  description: "Siswa SMA Negeri 1 Brang Rea dapat melaporkan perundungan, kekerasan, atau masalah lain langsung ke guru bimbingan konseling.",
};

export default function HalamanLapor() {
  return (
    <>
      <PageHero
        judul="Lapor ke guru BK"
        teks="Mengalami atau melihat perundungan, kekerasan, atau masalah lain di sekolah? Ceritakan di sini. Laporanmu langsung diterima guru bimbingan konseling."
        gambar="/images/sekolah/apel-guru-2.jpg"
        alt="Guru SMAN 1 Brang Rea"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Kesiswaan", href: "/kesiswaan" }, { label: "Lapor ke guru BK" }]}
        tambahan={
          <Link href="/lapor/cek" className="btn-pill">
            <Search size={18} aria-hidden="true" /> Cek status laporan
          </Link>
        }
      />
      <section className="section-y" aria-label="Formulir laporan">
        <div className="container-site">
          <FormLapor />
        </div>
      </section>
    </>
  );
}
