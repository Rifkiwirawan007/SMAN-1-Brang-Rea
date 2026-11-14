import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { BeritaList } from "@/components/berita/berita-list";
import { beritaTampil } from "@/components/berita/tampil";
import { ambilAgenda, ambilBerita, ambilSekolah } from "@/lib/konten/baca";
import { KATEGORI_BERITA } from "@/lib/konten/tipe";
import { apakahIlustrasi } from "@/lib/konten/util";
import { bagianTanggal, formatTanggal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Berita dan informasi",
  description: "Berita kegiatan, pengumuman resmi, prestasi, dan agenda SMA Negeri 1 Brang Rea.",
};

export default async function HalamanBerita() {
  const [sekolah, berita, agenda] = await Promise.all([ambilSekolah(), ambilBerita(), ambilAgenda()]);
  const labelContoh = sekolah.tampilkanLabelContoh !== false;
  const semua = berita.map(beritaTampil);
  const sorotan = semua.filter((b) => b.gambar).slice(0, 3);
  const pengumuman = semua.filter((b) => b.kategori === "Pengumuman");

  return (
    <>
      <PageHero
        judul="Berita dan informasi"
        teks="Kabar kegiatan, pengumuman resmi, dan agenda SMA Negeri 1 Brang Rea."
        gambar="/images/sekolah/banner-pelepasan-xii.webp"
        alt="Guru dan siswa pada acara pelepasan kelas XII angkatan 16"
        posisiGambar="center 45%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
      />

      {/* Sorotan */}
      <section aria-labelledby="judul-sorotan" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-sorotan"
            judul="Sorotan terbaru"
            teks={<p>Liputan kegiatan dan prestasi siswa dari buletin sekolah Lensa Barema.</p>}
          />
          <CarouselRail
            ariaLabel="Sorotan berita terbaru"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-2 lg:gap-4"
          >
            {sorotan.map((b, i) => (
              <li
                key={b.slug}
                className={`w-[min(84vw,340px)] shrink-0 sm:w-[380px] lg:w-auto ${i === 0 ? "lg:row-span-2" : ""}`}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
              >
                <Link
                  href={`/berita/${b.slug}`}
                  className={`zoom-wrap group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-[10px] bg-brand-ink p-6 text-white md:p-8 ${i === 0 ? "lg:min-h-[540px]" : "lg:min-h-[260px]"}`}
                >
                  <Image src={b.gambar!} alt="" fill sizes={i === 0 ? "(min-width: 1024px) 60vw, 84vw" : "(min-width: 1024px) 40vw, 84vw"} className="object-cover" style={{ objectPosition: b.posisiGambar }} />
                  <span className="scrim-bottom absolute inset-0" aria-hidden="true" />
                  {b.halaman && <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-ink from-45% to-transparent" aria-hidden="true" />}
                  {labelContoh && apakahIlustrasi(b.gambar!) && (
                    <span className="absolute right-3 top-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5">Foto ilustrasi</span>
                  )}
                  <span className="relative flex flex-col gap-2">
                    <span className={`font-semibold leading-tight text-white group-hover:underline group-hover:underline-offset-4 ${i === 0 ? "text-[1.25rem] lg:text-[clamp(1.5rem,1.1rem+1.2vw,2.125rem)]" : "text-[1.25rem]"}`}>
                      {b.judul}
                    </span>
                    {i === 0 && <span className="line-clamp-2 max-w-[56ch] text-sm text-white/85 lg:line-clamp-none lg:text-base">{b.ringkasan}</span>}
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-white/80">
                      {b.tanggalTampil && (
                        <>
                          <CalendarDays size={15} aria-hidden="true" />
                          {b.tanggalTampil}
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      {b.kategori}
                      {b.contoh && <Contoh className="ml-1" />}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Semua tulisan */}
      <section aria-labelledby="judul-semua" className="section-y bg-paper-2">
        <div className="container-site">
          <h2 id="judul-semua" data-reveal className="text-h2">
            Semua tulisan
          </h2>
          <div className="mt-10">
            <BeritaList daftar={semua} kategori={KATEGORI_BERITA} />
          </div>
        </div>
      </section>

      {/* Pengumuman */}
      <section id="pengumuman" aria-labelledby="judul-pengumuman" className="section-y">
        <div className="container-site">
          <SectionHead id="judul-pengumuman" judul="Pengumuman resmi" teks={<p>Informasi penting untuk siswa dan orang tua dari sekolah.</p>} />
          <CarouselRail
            ariaLabel="Daftar pengumuman resmi"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:block lg:divide-y lg:divide-line lg:border-y lg:border-line"
          >
            {pengumuman.map((p) => (
              <li
                key={p.slug}
                data-reveal
                className="w-[min(82vw,320px)] shrink-0 sm:w-[360px] lg:w-auto"
              >
                <Link
                  href={`/berita/${p.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-[14px] border border-line bg-paper p-6 lg:grid lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:gap-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-7"
                >
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <CalendarDays size={16} aria-hidden="true" className="text-brand" />
                    {p.tanggalTampil}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-h3 transition-colors duration-200 group-hover:text-brand">{p.judul}</span>
                      {p.contoh && <Contoh />}
                    </span>
                    <span className="mt-2 line-clamp-3 block max-w-[72ch] text-ink-2 lg:line-clamp-none">{p.ringkasan}</span>
                  </span>
                </Link>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Agenda */}
      <section id="agenda" aria-labelledby="judul-agenda" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead id="judul-agenda" judul="Agenda sekolah" teks={<p>Kegiatan terdekat yang perlu dicatat siswa, guru, dan orang tua.</p>} />
          {agenda.some((a) => a.contoh) ? <CatatanContoh className="mt-8">Agenda di bawah ini contoh.</CatatanContoh> : null}
          <CarouselRail
            sebagai="ol"
            ariaLabel="Agenda sekolah"
            wrapClassName="mt-8"
            className="lg:grid lg:grid-cols-3 lg:gap-4"
          >
            {agenda.map((a, i) => {
              const t = bagianTanggal(a.tanggal);
              return (
                <li
                  key={a.id}
                  data-reveal
                  style={{ "--d": i % 3 } as React.CSSProperties}
                  className="flex w-[min(82vw,320px)] shrink-0 gap-5 rounded-[14px] border border-line bg-paper p-5 sm:w-[340px] sm:gap-6 sm:p-6 lg:w-auto"
                >
                  <span className="flex w-16 shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand py-3 text-white">
                    <span className="text-[1.75rem] font-light leading-none">{t.hari}</span>
                    <span className="mt-1 text-xs font-semibold">{t.bulan}</span>
                    <span className="text-[0.6875rem] text-white/80">{t.tahun}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug text-ink">{a.judul}</span>
                    <span className="mt-3 flex flex-col gap-1.5 text-sm text-ink-2">
                      <span className="flex items-center gap-2">
                        <Clock size={15} aria-hidden="true" className="shrink-0 text-muted" />
                        <span>
                          {t.namaHari}
                          {a.sampai ? ` s.d. ${formatTanggal(a.sampai, { pendek: true })}` : ""}, {a.waktu}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={15} aria-hidden="true" className="shrink-0 text-muted" />
                        <span>{a.tempat}</span>
                      </span>
                    </span>
                  </span>
                </li>
              );
            })}
          </CarouselRail>
        </div>
      </section>
    </>
  );
}
