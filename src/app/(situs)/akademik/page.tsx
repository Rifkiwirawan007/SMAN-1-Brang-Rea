import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Coffee, Download, UsersRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CountUp } from "@/components/ui/count-up";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { ambilAkademik, ambilSekolah } from "@/lib/konten/baca";
import { cx } from "@/lib/format";
import { JamWeker, TumpukanBuku } from "@/components/situs/ilustrasi-jadwal";

/** Foto samar di belakang pita jadwal per hari (bergiliran). */
const FOTO_JADWAL = [
  "/images/sekolah/banner-paskibra.webp",
  "/images/sekolah/banner-kelas.jpg",
  "/images/sekolah/banner-apel-lapangan.webp",
  "/images/sekolah/banner-senam-pagi.webp",
  "/images/sekolah/banner-duduk.jpg",
  "/images/sekolah/banner-tim-olahraga.webp",
];

export const metadata: Metadata = {
  title: "Akademik",
  description: "Kurikulum, rombongan belajar, mata pelajaran, jadwal, dan kalender akademik SMA Negeri 1 Brang Rea.",
};

const BAGIAN = [
  { id: "kurikulum", label: "Kurikulum" },
  { id: "rombel", label: "Rombongan belajar" },
  { id: "mapel", label: "Mata pelajaran" },
  { id: "jadwal", label: "Jadwal" },
  { id: "kalender", label: "Kalender akademik" },
];


export default async function Akademik() {
  const [sekolah, akademik] = await Promise.all([ambilSekolah(), ambilAkademik()]);
  const { kurikulum, mapel, jadwal, kalender } = akademik;
  const s = sekolah.statistik;
  const labelContoh = sekolah.tampilkanLabelContoh !== false;
  return (
    <>
      <PageHero
        judul="Akademik"
        teks="Kurikulum, rombongan belajar, jadwal, dan kalender pendidikan sekolah."
        gambar="/images/sekolah/banner-paskibra.webp"
        alt="Petugas Paskibra SMAN 1 Brang Rea mengibarkan bendera saat upacara di lapangan sekolah"
        posisiGambar="center 35%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Akademik" }]}
      />
      <SubNav items={BAGIAN} />

      {/* Kurikulum: logo Kurikulum Merdeka + ringkasan di kiri, tiga komponen sebagai daftar bernomor yang bersih */}
      <section id="kurikulum" aria-labelledby="judul-kurikulum" className="section-y">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20">
          <div data-reveal>
            <h2 id="judul-kurikulum" className="sr-only">
              {kurikulum.nama}
            </h2>
            <Image
              src="/images/akademik/kurikulum-merdeka.webp"
              alt={kurikulum.nama}
              width={1085}
              height={422}
              sizes="(min-width: 1024px) 420px, 80vw"
              className="h-auto w-full max-w-[420px]"
            />
            {kurikulum.contoh ? <Contoh className="mt-4" /> : null}
          </div>
          <ol className="border-t border-line">
            {kurikulum.komponen.map((k, i) => (
              <li key={k.nama} data-reveal style={{ "--d": i } as React.CSSProperties} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-b border-line py-7 sm:grid-cols-[4rem_minmax(0,1fr)] sm:py-8">
                <span className="text-sm font-semibold tabular-nums text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-h3">{k.nama}</h3>
                  <p className="mt-2 text-ink-2">{k.teks}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rombel (data asli): latar foto guru berbaju adat, tepi atas-bawah miring (bukan gelombang) */}
      <section
        id="rombel"
        aria-labelledby="judul-rombel"
        className="on-dark relative overflow-hidden bg-brand-ink py-32 text-white md:py-44"
        style={{ clipPath: "polygon(0 0, 100% 7%, 100% 100%, 0 93%)" }}
      >
        <Image src="/images/sekolah/bg-guru-baju-adat.webp" alt="" fill sizes="100vw" quality={70} className="object-cover" style={{ objectPosition: "center 40%" }} />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-brand-ink/95 via-brand-ink/85 to-brand-ink/70" />
        <div className="container-site relative">
          <div className="max-w-[60ch]">
            <p data-reveal className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Semester {s.semesterData}</p>
            <h2 id="judul-rombel" data-reveal className="mt-4 text-h2 text-white">
              Rombongan belajar tahun ini
            </h2>
            <p data-reveal className="mt-4 text-lead text-white/75">
              Angka resmi dari Data Pokok Pendidikan, bukan perkiraan.
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 border-t border-white/20 pt-10 sm:gap-10 sm:pt-12 lg:mt-12 lg:grid-cols-4">
            {[
              { k: "Rombongan belajar", v: s.rombel, ket: "kelas X, XI, dan XII" },
              { k: "Peserta didik", v: s.siswa, ket: `${s.siswaLaki} laki-laki, ${s.siswaPerempuan} perempuan` },
              { k: "Siswa per rombel", v: s.rasioSiswaRombel, ket: "rata-rata tiap kelas" },
              { k: "Siswa per guru", v: s.rasioSiswaGuru, ket: `dengan ${s.guru} guru` },
            ].map((d, i) => (
              <div key={d.k} data-reveal style={{ "--d": i } as React.CSSProperties} className="border-l border-white/20 pl-5">
                <dt className="text-sm font-semibold text-white/70">{d.k}</dt>
                <dd className="mt-4 text-stat font-extralight text-white">
                  <CountUp nilai={d.v} />
                </dd>
                <dd className="mt-3 text-[0.9375rem] text-white/70">{d.ket}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mapel */}
      <section id="mapel" aria-labelledby="judul-mapel" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-mapel"
            judul="Mata pelajaran"
            tengah
            tambahan={mapel.contoh ? <Contoh /> : null}
            teks={<p>Kelas X mempelajari mata pelajaran umum. Mulai kelas XI, siswa memilih mata pelajaran sesuai minat dan rencana studi lanjut.</p>}
          />
          <CarouselRail
            sebagai="div"
            ariaLabel="Kelompok mata pelajaran"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-2 lg:gap-5"
          >
            {[
              { judul: "Mata pelajaran umum", ket: "Fase E, kelas X", daftar: mapel.umum },
              { judul: "Mata pelajaran pilihan", ket: "Fase F, kelas XI dan XII", daftar: mapel.pilihan },
            ].map((g, i) => (
              <div
                key={g.judul}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="w-[min(86vw,420px)] shrink-0 rounded-[14px] border border-line bg-paper p-6 sm:w-[460px] sm:p-8 lg:w-auto"
              >
                <h3 className="text-h3">{g.judul}</h3>
                <p className="mt-1 text-sm text-muted">{g.ket}</p>
                <ul className="mt-5 grid grid-cols-2 gap-x-4 sm:mt-6 sm:gap-x-6">
                  {g.daftar.map((m) => (
                    <li key={m} className="border-b border-line py-2.5 text-sm text-ink sm:py-3 sm:text-[0.9375rem]">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Jadwal: gaya poster "program mingguan": judul miring tebal, satu pita hijau per hari
          berlatar foto sekolah samar, susunan hari/jam bergantian kiri-kanan */}
      <section id="jadwal" aria-labelledby="judul-jadwal" className="section-y relative overflow-hidden bg-paper-2">
        {/* Hiasan ilustrasi bertekstur (gaya sablon): tumpukan buku di kiri, jam weker di kanan */}
        <TumpukanBuku className="pointer-events-none absolute -left-16 top-1/2 w-60 -rotate-6 opacity-20 md:-left-6 md:w-72 md:opacity-40 xl:left-0 xl:w-60 xl:opacity-100" />
        <JamWeker className="pointer-events-none absolute -right-12 top-14 w-44 rotate-[10deg] opacity-20 md:-right-4 md:w-56 md:opacity-40 xl:right-10 xl:w-64 xl:opacity-100" />
        <div className="container-site relative">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="judul-jadwal" className="inline-block -rotate-3 text-[clamp(2.2rem,1.4rem+3.6vw,4.4rem)] font-black uppercase leading-[0.95] tracking-[-0.02em]">
              <span className="block text-brand">Jadwal &amp; jam</span>
              <span className="block text-brand-ink">pelajaran</span>
            </h2>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Senin – Sabtu · pembelajaran pagi (WITA)
            </p>
            {labelContoh && jadwal.contoh ? (
              <div className="mt-4 flex justify-center">
                <Contoh teks="Jam contoh" />
              </div>
            ) : null}
          </div>

          <ol className="relative mx-auto mt-10 grid max-w-4xl gap-4 md:mt-12 md:gap-5">
            {jadwal.hari.map((h, i) => {
              const balik = i % 2 === 1;
              const [mulai, selesai] = h.jam.split(/\s*[–-]\s*/);
              const foto = FOTO_JADWAL[i % FOTO_JADWAL.length];
              return (
                <li
                  key={h.hari}
                  data-reveal
                  style={{ "--d": i } as React.CSSProperties}
                  className={cx(
                    "on-dark relative flex min-h-[112px] items-stretch overflow-hidden rounded-[14px] bg-brand text-white shadow-[0_14px_30px_-16px_rgb(6_16_11/0.55)] md:min-h-[128px]",
                    balik && "flex-row-reverse",
                  )}
                >
                  <Image src={foto} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" quality={60} className="object-cover opacity-30 mix-blend-luminosity" />
                  <span aria-hidden="true" className={cx("absolute inset-0 from-brand via-brand/80 to-brand/40", balik ? "bg-gradient-to-l" : "bg-gradient-to-r")} />
                  {/* Hari */}
                  <div className={cx("relative flex w-[92px] shrink-0 flex-col justify-center px-4 sm:w-[124px] sm:px-6", balik && "text-right")}>
                    <span className="text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-white/90 sm:text-sm">{h.hari}</span>
                    <span className="text-[2rem] font-black leading-none tabular-nums sm:text-[2.6rem]">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {/* Kegiatan */}
                  <div className={cx("relative flex min-w-0 flex-1 items-center px-2 sm:px-4", balik && "justify-end text-right")}>
                    <p className="text-[1.05rem] font-black uppercase leading-tight tracking-[-0.01em] sm:text-[1.6rem]">{h.ket}</p>
                  </div>
                  {/* Jam */}
                  <div className={cx("relative my-4 flex w-[84px] shrink-0 flex-col justify-center border-white/70 px-3 text-[0.95rem] font-extrabold leading-tight tabular-nums sm:w-[112px] sm:px-5 sm:text-[1.15rem]", balik ? "border-r" : "border-l text-right")}>
                    <span>{mulai}</span>
                    {selesai && <span>{selesai}</span>}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3 text-ink-2">
            <Coffee size={18} aria-hidden="true" className="text-brand" />
            Istirahat: {jadwal.istirahat.join(" dan ")}
          </p>
        </div>
      </section>

      {/* Kalender */}
      <section id="kalender" aria-labelledby="judul-kalender" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-kalender"
            judul="Kalender akademik 2026/2027"
            tengah
            teks={<p>Tanggal penting dua semester. Kalender resmi mengikuti ketetapan Dinas Pendidikan dan Kebudayaan Provinsi NTB.</p>}
          />
          {akademik.kalenderContoh ? (
            <CatatanContoh className="mt-8">Semua tanggal di kalender ini contoh dan perlu dicocokkan dengan kalender resmi.</CatatanContoh>
          ) : null}
          <CarouselRail
            sebagai="div"
            ariaLabel="Kalender akademik per semester"
            wrapClassName="mt-8"
            className="lg:grid lg:grid-cols-2 lg:gap-6"
          >
            {kalender.map((sem, i) => (
              <div
                key={sem.semester}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="w-[min(86vw,420px)] shrink-0 rounded-[14px] border border-line bg-paper sm:w-[460px] lg:w-auto"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
                  <h3 className="text-h3">Semester {sem.semester.toLowerCase()}</h3>
                  <span className="text-sm text-muted">{sem.periode}</span>
                </div>
                <ol className="px-5 py-3 sm:px-7">
                  {sem.butir.map((b, j) => (
                    <li key={`${j}-${b.kegiatan}`} className="grid gap-1 border-b border-line py-3.5 last:border-0 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-5 sm:py-4">
                      <span className="flex items-center gap-2 text-sm font-semibold text-brand">
                        <CalendarDays size={15} aria-hidden="true" className="shrink-0" />
                        {b.tanggal}
                      </span>
                      <span className="text-[0.9375rem] text-ink">{b.kegiatan}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </CarouselRail>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="btn-pill" aria-disabled="true">
              <Download size={18} aria-hidden="true" />
              Unduh kalender (PDF)
            </span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <UsersRound size={16} aria-hidden="true" />
              Berkas PDF menyusul setelah kalender resmi terbit.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
