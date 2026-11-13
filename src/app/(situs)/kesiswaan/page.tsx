import type { Metadata } from "next";
import Image from "next/image";
import { PemicuLightbox } from "@/components/ui/gambar-perbesar";
import { Award, CircleCheck, HeartHandshake, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { IkonWhatsApp } from "@/components/ui/icons";
import { EkskulGrid } from "@/components/kesiswaan/ekskul-grid";
import { ambilEkskul, ambilKesiswaan, ambilPosterPrestasi, ambilPrestasi, ambilSekolah } from "@/lib/konten/baca";
import { KATEGORI_EKSKUL } from "@/lib/konten/tipe";
import { angkaHuruf, waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kesiswaan",
  description: "OSIS, ekstrakurikuler, prestasi, tata tertib, dan bimbingan konseling SMA Negeri 1 Brang Rea.",
};

const BAGIAN = [
  { id: "osis", label: "OSIS" },
  { id: "ekstrakurikuler", label: "Ekstrakurikuler" },
  { id: "prestasi", label: "Prestasi" },
  { id: "tata-tertib", label: "Tata tertib" },
  { id: "bk", label: "Bimbingan konseling" },
];

export default async function Kesiswaan() {
  const [sekolah, ekskul, kesiswaan, prestasi, poster] = await Promise.all([
    ambilSekolah(),
    ambilEkskul(),
    ambilKesiswaan(),
    ambilPrestasi(),
    ambilPosterPrestasi(),
  ]);
  const { osis, tataTertib, layananBk } = kesiswaan;
  return (
    <>
      <PageHero
        judul="Kesiswaan"
        teks="Organisasi siswa, ekstrakurikuler, prestasi, dan layanan pembinaan."
        gambar="/images/sekolah/paskibra-barisan.jpg"
        alt="Siswa petugas upacara berbaris di lapangan sekolah"
        posisiGambar="center 35%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Kesiswaan" }]}
      />
      <SubNav items={BAGIAN} />

      {/* OSIS */}
      <section id="osis" aria-labelledby="judul-osis" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-osis"
            judul="Organisasi Siswa Intra Sekolah"
            tambahan={osis.contoh ? <Contoh className="self-start" /> : null}
            teks={<p>{osis.ringkas}</p>}
          />
          <CarouselRail
            sebagai="ol"
            ariaLabel="Bidang OSIS"
            wrapClassName="mt-10 lg:mt-14"
            className="lg:grid lg:grid-cols-4 lg:gap-px lg:overflow-hidden lg:rounded-[14px] lg:border lg:border-line lg:bg-line"
          >
            {osis.bidang.map((b, i) => (
              <li
                key={b.nama}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="flex w-[min(80vw,300px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[320px] sm:p-7 lg:w-auto lg:rounded-none lg:border-0"
              >
                <h3 className="text-h3">{b.nama}</h3>
                <p className="mt-3 text-[0.9375rem] text-ink-2">{b.teks}</p>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Ekskul */}
      <section id="ekstrakurikuler" aria-labelledby="judul-ekskul" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-ekskul"
            judul="Ekstrakurikuler"
            teks={<p>{angkaHuruf(ekskul.length, { kapital: true })} pilihan kegiatan di luar jam pelajaran. Pramuka wajib bagi kelas X, sisanya dipilih sesuai minat.</p>}
          />
          {ekskul.some((e) => e.contoh) ? (
            <CatatanContoh className="mt-8">Daftar, jadwal, dan foto ekstrakurikuler masih contoh.</CatatanContoh>
          ) : null}
          <div className="mt-8">
            <EkskulGrid daftar={ekskul} kategori={KATEGORI_EKSKUL} />
          </div>
        </div>
      </section>

      {/* Prestasi */}
      <section id="prestasi" aria-labelledby="judul-prestasi" className="section-y">
        <div className="container-site">
          <SectionHead id="judul-prestasi" judul="Prestasi siswa" teks={<p>Capaian siswa di berbagai lomba dan kejuaraan.</p>} />
          {/* Poster prestasi dari Instagram sekolah; ketuk untuk ukuran penuh. */}
          <CarouselRail
            ariaLabel="Poster prestasi siswa"
            wrapClassName="mt-8 lg:mt-10"
            className="lg:grid lg:grid-cols-4 lg:gap-4"
          >
            {poster.map((p, i) => (
              <li
                key={p.id}
                data-reveal
                style={{ "--d": i % 4 } as React.CSSProperties}
                className="w-[min(74vw,260px)] shrink-0 sm:w-[280px] lg:w-auto"
              >
                <PemicuLightbox src={p.src} alt={p.judul} className="zoom-wrap group block w-full cursor-zoom-in text-left">
                  <span className="relative block aspect-[9/10] overflow-hidden rounded-[14px] border border-line bg-paper-2">
                    <Image src={p.src} alt={p.judul} fill sizes="(min-width: 1024px) 25vw, 74vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  </span>
                  <span className="mt-3 block text-sm font-semibold leading-snug text-ink">{p.judul}</span>
                  <span className="mt-1 block text-[0.8125rem] text-muted">{p.ket}</span>
                </PemicuLightbox>
              </li>
            ))}
          </CarouselRail>
          <p className="mt-10 flex items-center gap-2 text-sm text-muted md:hidden" aria-hidden="true">
            Geser tabel ke samping <span className="geser-panah">→</span>
          </p>
          <div data-reveal className="mt-3 overflow-x-auto rounded-[14px] border border-line md:mt-12">
            <table className="w-full min-w-[640px] text-left">
              <caption className="sr-only">Daftar prestasi siswa</caption>
              <thead className="bg-paper-2">
                <tr className="text-sm text-muted">
                  <th scope="col" className="px-6 py-4 font-medium">Tahun</th>
                  <th scope="col" className="px-6 py-4 font-medium">Prestasi</th>
                  <th scope="col" className="px-6 py-4 font-medium">Tingkat</th>
                  <th scope="col" className="px-6 py-4 font-medium">Bidang</th>
                </tr>
              </thead>
              <tbody>
                {prestasi.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-6 py-4 tabular-nums text-ink-2">{p.tahun}</td>
                    <th scope="row" className="px-6 py-4 font-semibold text-ink">
                      <span className="flex items-start gap-3">
                        <Award size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                        <span>
                          {p.judul}
                          {p.nama && <span className="mt-0.5 block text-sm font-normal text-ink-2">{p.nama}</span>}
                        </span>
                      </span>
                    </th>
                    <td className="px-6 py-4 text-ink-2">{p.tingkat}</td>
                    <td className="px-6 py-4 text-ink-2">{p.bidang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tata tertib */}
      <section id="tata-tertib" aria-labelledby="judul-tatib" className="section-y bg-paper-2">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="judul-tatib" data-reveal className="text-h2">
                Tata tertib siswa
              </h2>
              {tataTertib.contoh && <Contoh />}
            </div>
            <p data-reveal className="mt-6 max-w-[44ch] text-lead text-ink-2">
              Aturan bersama agar sekolah tetap aman, tertib, dan nyaman untuk belajar. Buka tiap bagian untuk membaca butirnya.
            </p>
          </div>
          <div data-reveal className="flex flex-col gap-3">
            {tataTertib.butir.map((b, i) => (
              <details key={b.judul} className="group rounded-[14px] border border-line bg-paper" open={i === 0}>
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-[14px] px-6 py-5 font-semibold text-ink hover:text-brand">
                  {b.judul}
                  <span className="chev grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-2 text-muted transition-transform group-open:rotate-180">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </summary>
                <ul className="flex flex-col gap-3 px-6 pb-6">
                  {b.isi.map((t) => (
                    <li key={t} className="flex gap-3 text-ink-2">
                      <CircleCheck size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand" />
                      {t}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BK */}
      <section id="bk" aria-labelledby="judul-bk" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-bk"
            judul="Bimbingan konseling"
            tambahan={layananBk.contoh ? <Contoh className="self-start" /> : null}
            teks={<p>{layananBk.ringkas}</p>}
          />
          <CarouselRail
            ariaLabel="Layanan bimbingan konseling"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-3 lg:gap-5"
          >
            {layananBk.layanan.map((l, i) => (
              <li
                key={l.nama}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="w-[min(82vw,320px)] shrink-0 rounded-[14px] border border-line bg-paper p-6 sm:w-[340px] sm:p-8 lg:w-auto"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                  {i === 0 ? <HeartHandshake size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
                </span>
                <h3 className="mt-6 text-h3">{l.nama}</h3>
                <p className="mt-3 text-ink-2">{l.teks}</p>
              </li>
            ))}
          </CarouselRail>
          <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={waLink("Halo, saya ingin membuat janji dengan guru bimbingan konseling SMAN 1 Brang Rea.", sekolah.kontak.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
            >
              <IkonWhatsApp size={18} />
              Buat janji dengan guru BK
            </a>
            <span className="text-sm text-muted">Pesan dibuka di WhatsApp Anda; kerahasiaan siswa dijaga.</span>
          </div>
        </div>
      </section>
    </>
  );
}
