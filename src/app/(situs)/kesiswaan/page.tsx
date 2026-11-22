import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PemicuLightbox } from "@/components/ui/gambar-perbesar";
import {
  CircleCheck,
  HeartHandshake,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { Archivo, Yellowtail } from "next/font/google";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { BatasKartu } from "@/components/ui/batas-kartu";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { IkonWhatsApp } from "@/components/ui/icons";
import { EkskulGrid } from "@/components/kesiswaan/ekskul-grid";
import {
  ambilEkskul,
  ambilKesiswaan,
  ambilPosterPrestasi,
  ambilSekolah,
} from "@/lib/konten/baca";
import { KATEGORI_EKSKUL } from "@/lib/konten/tipe";
import { angkaHuruf, waLink } from "@/lib/format";
import { KertasFooterHijau } from "@/components/situs/kertas-footer-hijau";

/*
 * Gaya halaman ala luccilambrusco.com: latar hijau tua polos, aksen krem,
 * judul tebal kapital (Archivo condensed, pengganti gratis "Ginto Nord Condensed")
 * dan tulisan sambung (Yellowtail, pengganti "Flatface Script").
 */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-lucci", display: "swap" });
const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], variable: "--font-sambung", display: "swap" });

/** Teks berjalan tulisan sambung. */
function Marquee({ teks }: { teks: string }) {
  const isi = Array.from({ length: 8 }, () => teks);
  return (
    <div aria-hidden="true" className="lucci-marquee overflow-hidden border-y border-krem/25 py-4">
      <div className="lucci-marquee-jalur flex w-max gap-10">
        {[...isi, ...isi].map((t, i) => (
          <span key={i} className="font-sambung whitespace-nowrap text-3xl text-krem md:text-4xl">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Kata-kata besar bertangga (seperti "BUBBLY. BALANCED. FRUIT-FORWARD."). */
function KataBertangga({ kata, className }: { kata: string[]; className?: string }) {
  const geser = ["md:ml-[4%]", "md:ml-[22%]", "md:ml-[46%]", "md:ml-[12%]"];
  return (
    <p aria-hidden="true" className={`flex flex-col ${className ?? ""}`}>
      {kata.map((k, i) => (
        <span
          key={k}
          data-reveal
          style={{ "--d": i } as React.CSSProperties}
          className={`judul-lucci text-krem text-[clamp(3rem,10vw,9rem)] ${geser[i % geser.length]} ${i % 2 ? "md:-rotate-2" : "md:rotate-1"}`}
        >
          {k}
        </span>
      ))}
    </p>
  );
}

export const metadata: Metadata = {
  title: "Kesiswaan",
  description:
    "OSIS, ekstrakurikuler, prestasi, tata tertib, dan bimbingan konseling SMA Negeri 1 Brang Rea.",
};

export default async function Kesiswaan() {
  const [sekolah, ekskul, kesiswaan, poster] = await Promise.all([
    ambilSekolah(),
    ambilEkskul(),
    ambilKesiswaan(),
    ambilPosterPrestasi(),
  ]);
  const { osis, tataTertib, layananBk } = kesiswaan;
  return (
    <div className={`${archivo.variable} ${yellowtail.variable}`}>

      <KertasFooterHijau />
      <div className="tema-hijau tema-lucci on-dark overflow-x-clip">
        <h1 className="sr-only">Kesiswaan SMA Negeri 1 Brang Rea</h1>
        {/* OSIS */}
        {/* Seksi pertama sekaligus pembuka halaman (tanpa banner foto & sub-navigasi). data-hero membuat header transparan di atas hijau tua. */}
        <section id="osis" data-hero aria-labelledby="judul-osis" className="pt-36 md:pt-44">
          <div className="container-site">
            <KataBertangga kata={["Memimpin.", "Melayani.", "Berkarya."]} />
            <div className="mt-14 grid items-center gap-10 md:mt-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
              <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[18px] sm:aspect-[4/3] lg:aspect-[5/6]">
                <Image src="/images/sekolah/bg-osis.webp" alt="Pengurus OSIS SMA Negeri 1 Brang Rea berfoto bersama di tangga sekolah" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" style={{ objectPosition: "center 40%" }} />
              </div>
              <div>
                <div data-reveal className="flex flex-wrap items-center gap-3">
                  <h2 id="judul-osis" className="judul-lucci text-[clamp(2.5rem,5vw,4.25rem)] text-krem">
                    Organisasi Siswa Intra Sekolah
                  </h2>
                  {osis.contoh ? <Contoh /> : null}
                </div>
                <ol aria-label="Bidang OSIS" className="mt-8 flex flex-col">
                  {osis.bidang.map((b, i) => (
                    <li key={b.nama} data-reveal style={{ "--d": i } as React.CSSProperties} className="grid grid-cols-[3rem_1fr] gap-x-3 border-t border-krem/25 py-5">
                      <span aria-hidden="true" className="font-sambung text-3xl leading-none text-krem/70">{i + 1}.</span>
                      <div>
                        <h3 className="judul-lucci text-2xl text-krem">{b.nama}</h3>
                        <p className="mt-2 text-[0.9375rem] text-white/75">{b.teks}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <div className="mt-20 md:mt-28">
            <Marquee teks="Berprestasi. Berkarakter." />
          </div>
        </section>

        {/* Ekskul: blok krem + foto, lalu kisi kegiatan */}
        <section id="ekstrakurikuler" aria-labelledby="judul-ekskul" className="pt-20 md:pt-28">
          <div className="container-site">
            <div data-reveal className="grid overflow-hidden rounded-[18px] bg-krem md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 text-brand-ink sm:p-12 lg:p-16">
                <h2 id="judul-ekskul" className="judul-lucci text-[clamp(2.25rem,4vw,3.75rem)] text-brand-ink">
                  Ekstrakurikuler
                </h2>
                <p className="font-sambung mt-3 text-3xl text-[#34724c]">Temukan minatmu</p>
                <p className="mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-brand-ink/80">
                  {angkaHuruf(ekskul.length, { kapital: true })} pilihan kegiatan di luar jam pelajaran. Pramuka wajib bagi kelas X, sisanya dipilih sesuai minat.
                </p>
              </div>
              <div className="relative min-h-[300px] md:min-h-[460px]">
                <Image src="/images/sekolah/banner-paskibra.webp" alt="Pasukan pengibar bendera sekolah saat upacara" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            </div>
            {ekskul.some((e) => e.contoh) ? (
              <CatatanContoh className="mt-8">
                Daftar, jadwal, dan foto ekstrakurikuler masih contoh.
              </CatatanContoh>
            ) : null}
            <div className="mt-12">
              <EkskulGrid daftar={ekskul} kategori={KATEGORI_EKSKUL} />
            </div>
          </div>
        </section>

        {/* Prestasi: judul kiri + rel poster */}
        <section id="prestasi" aria-labelledby="judul-prestasi" className="pt-20 md:pt-28">
          <div className="container-site">
            <div data-reveal>
              <h2 id="judul-prestasi" className="judul-lucci text-[clamp(2.5rem,5vw,4.25rem)] text-krem">
                Prestasi siswa
              </h2>
              <p className="font-sambung mt-2 text-3xl text-krem/80">Capaian di berbagai lomba dan kejuaraan</p>
            </div>
            {/* Poster prestasi dari Instagram sekolah; ketuk untuk ukuran penuh. */}
            <BatasKartu jumlah={poster.length}>
              <CarouselRail
                ariaLabel="Poster prestasi siswa"
                gelap
                wrapClassName="mt-8 lg:mt-10"
                className="lg:grid lg:grid-cols-3 lg:gap-6"
              >
                {poster.map((p, i) => (
                  <li
                    key={p.id}
                    data-reveal
                    style={{ "--d": i % 3 } as React.CSSProperties}
                    className="w-[min(74vw,260px)] shrink-0 sm:w-[280px] lg:w-auto"
                  >
                    <PemicuLightbox
                      src={p.src}
                      alt={p.judul}
                      className="zoom-wrap group block w-full cursor-zoom-in text-left"
                    >
                      <span className="relative block aspect-[9/10] overflow-hidden rounded-[18px] bg-paper-2">
                        <Image
                          src={p.src}
                          alt={p.judul}
                          fill
                          sizes="(min-width: 1024px) 33vw, 74vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="judul-lucci mt-4 block text-xl text-krem">
                        {p.judul}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-white/65">
                        {p.ket}
                      </span>
                    </PemicuLightbox>
                  </li>
                ))}
              </CarouselRail>
            </BatasKartu>
          </div>
        </section>

        {/* Tata tertib: kalimat besar bertangga, lalu daftar buka-tutup */}
        <section id="tata-tertib" aria-labelledby="judul-tatib" className="pt-24 md:pt-36">
          <div className="container-site">
            <KataBertangga kata={["Disiplin", "di sekolah.", "Santun", "di mana saja."]} />
            <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 id="judul-tatib" data-reveal className="judul-lucci text-[clamp(2.5rem,5vw,4.25rem)] text-krem">
                    Tata tertib siswa
                  </h2>
                  {tataTertib.contoh && <Contoh />}
                </div>
                <p data-reveal className="mt-6 max-w-[44ch] text-lead text-white/75">
                  Aturan bersama agar sekolah tetap aman, tertib, dan nyaman untuk belajar. Buka tiap bagian untuk membaca butirnya.
                </p>
              </div>
              <div data-reveal className="flex flex-col">
                {tataTertib.butir.map((b, i) => (
                  <details key={b.judul} className="group border-t border-krem/25 last:border-b" open={i === 0}>
                    <summary className="flex cursor-pointer items-center justify-between gap-4 py-6 text-krem">
                      <span className="judul-lucci text-2xl md:text-3xl">{b.judul}</span>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-krem/50 transition-transform group-open:rotate-180">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <ul className="flex flex-col gap-3 pb-7">
                      {b.isi.map((t) => (
                        <li key={t} className="flex gap-3 text-white/80">
                          <CircleCheck size={18} aria-hidden="true" className="mt-1 shrink-0 text-krem" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BK: blok krem + foto (terbalik) */}
        <section id="bk" aria-labelledby="judul-bk" className="pb-24 pt-20 md:pb-32 md:pt-28">
          <div className="container-site">
            <div data-reveal className="grid overflow-hidden rounded-[18px] bg-krem md:grid-cols-2">
              <div className="relative order-last min-h-[300px] md:order-first md:min-h-[560px]">
                <Image src="/images/sekolah/bg-guru-baju-adat.webp" alt="Guru SMA Negeri 1 Brang Rea mengenakan pakaian adat" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8 text-brand-ink sm:p-12 lg:p-16">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 id="judul-bk" className="judul-lucci text-[clamp(2.25rem,4vw,3.75rem)] text-brand-ink">
                    Bimbingan konseling
                  </h2>
                  {layananBk.contoh ? <Contoh /> : null}
                </div>
                <p className="font-sambung mt-3 text-3xl text-[#34724c]">Kamu tidak sendiri</p>
                <p className="mt-5 max-w-[46ch] leading-relaxed text-brand-ink/80">{layananBk.ringkas}</p>
                <ul aria-label="Layanan bimbingan konseling" className="mt-6 flex flex-col">
                  {layananBk.layanan.map((l, i) => (
                    <li key={l.nama} className="flex gap-4 border-t border-brand-ink/15 py-4">
                      <span className="mt-0.5 text-[#34724c]">
                        {i === 0 ? <HeartHandshake size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
                      </span>
                      <div>
                        <h3 className="judul-lucci text-xl text-brand-ink">{l.nama}</h3>
                        <p className="mt-1 text-[0.9375rem] text-brand-ink/75">{l.teks}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={waLink(
                      "Halo, saya ingin membuat janji dengan guru bimbingan konseling SMAN 1 Brang Rea.",
                      sekolah.kontak.whatsapp,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-krem-isi"
                  >
                    <IkonWhatsApp size={18} />
                    Buat janji dengan guru BK
                  </a>
                  <Link href="/lapor" className="btn-krem-garis">
                    <ShieldAlert size={18} aria-hidden="true" />
                    Lapor perundungan / masalah
                  </Link>
                </div>
                <p className="mt-4 text-sm text-brand-ink/65">
                  Laporan langsung diterima guru BK; kerahasiaan siswa dijaga.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
