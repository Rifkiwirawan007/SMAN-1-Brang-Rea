import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { GaleriGrid } from "@/components/galeri/galeri-grid";
import { ambilGaleri, ambilSekolah } from "@/lib/konten/baca";
import { KATEGORI_GALERI } from "@/lib/konten/tipe";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Potret kegiatan belajar, upacara, dan ekstrakurikuler SMA Negeri 1 Brang Rea.",
};

export default async function Galeri() {
  const [galeri, sekolah] = await Promise.all([ambilGaleri(), ambilSekolah()]);
  // Tab kategori: urutan baku yang memang dipakai foto, lalu kategori lain (bila ada) di belakang.
  const baku: readonly string[] = KATEGORI_GALERI;
  const ada = new Set(galeri.map((f) => f.kategori).filter(Boolean));
  const kategori = [...baku.filter((k) => ada.has(k)), ...[...ada].filter((k) => !baku.includes(k))];
  const akunIg = sekolah.kontak.instagram?.trim();
  return (
    <>
      <PageHero
        judul="Galeri kegiatan"
        teks="Potret kegiatan belajar, upacara, dan ekstrakurikuler siswa."
        gambar="/images/sekolah/banner-kostum-budaya.webp"
        alt="Siswi berbusana adat berfoto bersama di depan kelas"
        posisiGambar="center 15%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />
      <section aria-labelledby="judul-galeri" className="section-y">
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="judul-galeri" data-reveal className="text-h2">
              {galeri.length} foto kegiatan
            </h2>
            <p data-reveal className="max-w-[48ch] text-sm text-muted">
              Foto dari Instagram resmi{" "}
              <a
                href={sekolah.kontak.instagramUrl || "https://www.instagram.com/sman1brangrea/"}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink"
              >
                {akunIg ? (akunIg.startsWith("@") ? akunIg : `@${akunIg}`) : "@sman1brangrea"}
              </a>{" "}
              dan buletin sekolah Lensa Barema.
            </p>
          </div>
          <div className="mt-10">
            <GaleriGrid foto={galeri} kategori={kategori} />
          </div>
        </div>
      </section>
    </>
  );
}
