import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { GaleriGrid } from "@/components/galeri/galeri-grid";
import { GALERI, KATEGORI_GALERI } from "@/data/galeri";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Potret kegiatan belajar, upacara, dan ekstrakurikuler SMA Negeri 1 Brang Rea.",
};

export default function Galeri() {
  return (
    <>
      <PageHero
        judul="Galeri kegiatan"
        teks="Potret kegiatan belajar, upacara, dan ekstrakurikuler siswa."
        gambar="/images/sekolah/karnaval-barisan.jpg"
        alt="Barisan siswa pada karnaval budaya"
        posisiGambar="center 45%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />
      <section aria-labelledby="judul-galeri" className="section-y">
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="judul-galeri" data-reveal className="text-h2">
              {GALERI.length} foto kegiatan
            </h2>
            <p data-reveal className="max-w-[48ch] text-sm text-muted">
              Foto dari Instagram resmi{" "}
              <a href="https://www.instagram.com/sman1brangrea/" target="_blank" rel="noopener noreferrer" className="link-ink">
                @sman1brangrea
              </a>{" "}
              dan buletin sekolah Lensa Barema.
            </p>
          </div>
          <div className="mt-10">
            <GaleriGrid foto={GALERI} kategori={KATEGORI_GALERI} />
          </div>
        </div>
      </section>
    </>
  );
}
