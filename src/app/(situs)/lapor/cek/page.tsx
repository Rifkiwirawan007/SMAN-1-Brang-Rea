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
        teks="Laporan yang kamu kirim dari HP ini langsung muncul di sini. Dari HP lain, cukup masukkan kode laporan."
        gambar="/images/sekolah/banner-duduk.jpg"
        alt="Seorang siswa duduk di pondok kayu memandangi hujan"
        posisiGambar="center top"
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
