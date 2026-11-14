import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { CekLaporan } from "@/components/lapor/cek-laporan";

export const metadata: Metadata = {
  title: "Cek status laporan BK",
  description: "Lihat status dan balasan guru BK untuk laporan yang sudah dikirim.",
  robots: { index: false, follow: false },
};

export default function HalamanCekLaporan() {
  return (
    <>
      <PageHero
        judul="Cek status laporan"
        teks="Masukkan nomor laporan dan kode cek yang kamu dapat saat mengirim laporan."
        gambar="/images/sekolah/apel-guru-2.jpg"
        alt="Guru SMAN 1 Brang Rea"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Lapor ke guru BK", href: "/lapor" }, { label: "Cek status" }]}
      />
      <section className="section-y" aria-label="Cek status laporan">
        <div className="container-site">
          <CekLaporan />
        </div>
      </section>
    </>
  );
}
