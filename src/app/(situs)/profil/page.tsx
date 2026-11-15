import type { Metadata } from "next";
import Image from "next/image";
import { Eye, Target, UserRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CountUp } from "@/components/ui/count-up";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { Foto } from "@/components/ui/foto";
import { TeksKata } from "@/components/ui/teks-kata";
import { VideoYoutube } from "@/components/ui/video-youtube";
import { ambilProfil, ambilSambutan, ambilSekolah } from "@/lib/konten/baca";
import { formatAngka } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profil sekolah",
  description: "Sambutan kepala sekolah, identitas, sejarah, visi misi, struktur organisasi, guru, dan sarana SMA Negeri 1 Brang Rea.",
};

const BAGIAN = [
  { id: "sambutan", label: "Sambutan" },
  { id: "video", label: "Video profil" },
  { id: "identitas", label: "Identitas" },
  { id: "sejarah", label: "Sejarah" },
  { id: "visi-misi", label: "Visi dan misi" },
  { id: "struktur", label: "Struktur organisasi" },
  { id: "guru", label: "Guru dan tendik" },
  { id: "sarana", label: "Sarana" },
];

export default async function Profil() {
  const [sekolah, sambutan, profil] = await Promise.all([ambilSekolah(), ambilSambutan(), ambilProfil()]);
  const s = sekolah.statistik;
  const identitas: [string, React.ReactNode][] = [
    ["Nama sekolah", sekolah.nama],
    ["NPSN", sekolah.npsn],
    ["Status", sekolah.status],
    ["Bentuk pendidikan", sekolah.bentuk],
    ["Akreditasi", `${sekolah.akreditasi.nilai} (SK ${sekolah.akreditasi.sk}, ${sekolah.akreditasi.tanggal})`],
    ["SK pendirian", `Nomor ${sekolah.pendirian.sk}, ${sekolah.pendirian.tanggal}`],
    ["Kepala sekolah", sekolah.kepalaSekolah],
    ["Alamat", sekolah.alamat.jalan],
    ["Desa", sekolah.alamat.desa.replace("Desa ", "")],
    ["Kecamatan", sekolah.alamat.kecamatan.replace(/^(Kecamatan|Kec\.)\s*/i, "")],
    ["Kabupaten", sekolah.alamat.kabupaten.replace(/^(Kabupaten|Kab\.)\s*/i, "")],
    ["Provinsi", sekolah.alamat.provinsi],
    ["Koordinat", `${sekolah.koordinat.lat}, ${sekolah.koordinat.lng}`],
    ["Luas tanah", `${formatAngka(s.luasTanah)} m²`],
    ["Daya listrik", s.listrik],
    ["Akses internet", s.internet],
    ["Waktu belajar", s.penyelenggaraan],
    ["Email", sekolah.kontak.email],
  ];

  return (
    <>
      <PageHero
        judul="Profil sekolah"
        teks="Mengenal SMA Negeri 1 Brang Rea, dari sejarah hingga sarana belajarnya."
        gambar="/images/hero-sekolah-baru.jpg"
        alt="Papan nama SMAN 1 Brang Rea dan siswa berjalan menuju gedung sekolah"
        posisiGambar="center 40%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Profil" }]}
      />
      <SubNav items={BAGIAN} />

      {/* Sambutan */}
      <section id="sambutan" aria-labelledby="judul-sambutan" className="section-y">
        <div className="container-site grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Potret berdiri di atas alas 3D tipis (diam, tanpa animasi). */}
          <div className="mx-auto w-full max-w-[460px]">
            <div className="relative aspect-[4/5]">
              <Image src={sambutan.foto2 ?? sambutan.foto} alt={`${sambutan.nama}, ${sambutan.jabatan}`} fill sizes="(min-width: 1024px) 460px, 90vw" className="object-contain object-bottom" />
            </div>
            <div className="potret-alas" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div data-reveal className="flex flex-wrap items-center gap-3">
              <h2 id="judul-sambutan" className="text-h2">
                Sambutan kepala sekolah
              </h2>
              {sambutan.contoh && <Contoh teks="Teks contoh" />}
            </div>
            <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="prose-sekolah mt-8 max-w-[64ch] text-ink-2">
              <p>{sambutan.salam}</p>
              {sambutan.paragraf.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p>{sambutan.penutup}</p>
            </div>
            <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="mt-8 border-t border-line pt-6">
              <p className="text-h3">{sambutan.nama}</p>
              <p className="mt-1 text-ink-2">{sambutan.jabatan}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video profil */}
      <section id="video" aria-labelledby="judul-video" className="section-y">
        <div className="container-site">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="judul-video" className="text-h2 text-brand-ink">Video profil sekolah</h2>
            <p className="mt-4 text-lead text-ink-2">Mengenal lebih dekat suasana belajar, kegiatan, dan warga SMA Negeri 1 Brang Rea.</p>
          </div>
          <div data-reveal className="mx-auto mt-10 max-w-5xl md:mt-12">
            {/* Bayangan di sekeliling video, terlihat timbul */}
            <div
              className="overflow-hidden rounded-[14px]"
              style={{
                boxShadow:
                  "0 0 0 1px rgb(0 0 0 / 0.08), 0 0 12px 2px rgb(0 0 0 / 0.22), 0 0 40px 8px rgb(0 0 0 / 0.28), 0 0 80px 16px rgb(0 0 0 / 0.22)",
              }}
            >
              <VideoYoutube id="1PU1U5qi0J4" judul="Video profil SMA Negeri 1 Brang Rea" />
            </div>
          </div>
        </div>
      </section>

      {/* Identitas */}
      <section id="identitas" aria-labelledby="judul-identitas" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-identitas"
            judul="Identitas sekolah"
            teks={<p>Data resmi sekolah sebagaimana tercatat di Data Pokok Pendidikan Kementerian Pendidikan Dasar dan Menengah.</p>}
          />
          <dl data-reveal className="mt-10 grid overflow-hidden rounded-[14px] border border-line bg-paper md:mt-12 md:grid-cols-2">
            {identitas.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 border-b border-line px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-4 sm:px-6 sm:py-4 md:odd:border-r">
                <dt className="text-xs font-medium text-muted sm:text-sm sm:font-normal">{k}</dt>
                <dd className="min-w-0 break-words text-[0.9375rem] font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Sejarah */}
      <section id="sejarah" aria-labelledby="judul-sejarah" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-sejarah"
            judul={`Perjalanan sejak ${sekolah.pendirian.tahun}`}
            teks={<p>Dua dekade melayani pendidikan menengah atas di Brang Rea, Sumbawa Barat.</p>}
          />
          <CarouselRail
            sebagai="ol"
            ariaLabel="Tonggak sejarah sekolah"
            wrapClassName="mt-10 lg:mt-14"
            className="lg:grid lg:grid-cols-4 lg:gap-px lg:overflow-hidden lg:rounded-[14px] lg:border lg:border-line lg:bg-line"
          >
            {profil.sejarah.map((p, i) => (
              <li
                key={`${i}-${p.tahun}`}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="flex w-[min(80vw,300px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[320px] md:p-8 lg:w-auto lg:rounded-none lg:border-0"
              >
                <span className="text-stat text-brand">{p.tahun}</span>
                <span className="mt-6 text-h3 text-ink">{p.judul}</span>
                <span className="mt-3 text-[0.9375rem] text-ink-2">{p.teks}</span>
                {p.contoh && <Contoh className="mt-5 self-start" />}
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Visi & misi */}
      <section id="visi-misi" aria-labelledby="judul-visi" className="on-dark section-y relative overflow-hidden bg-brand-ink text-white">
        {/* Hiasan cahaya lembut */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand opacity-60 blur-[120px]" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-brand opacity-50 blur-[130px]" />
        <div className="container-site relative grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div data-reveal className="flex flex-wrap items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Eye size={22} aria-hidden="true" />
              </span>
              <h2 id="judul-visi" className="text-h2 text-white">
                Visi
              </h2>
              {profil.visi.contoh && <Contoh />}
            </div>
            <div className="relative mt-8">
              <span aria-hidden="true" className="absolute -left-2 -top-10 select-none font-serif text-[8rem] leading-none text-white/10">&ldquo;</span>
              <p
                data-reveal-kata="45"
                className="relative text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)] font-semibold leading-snug tracking-[-0.015em] text-white"
              >
                <TeksKata teks={profil.visi.teks} />
              </p>
              <span data-reveal style={{ "--d": 3 } as React.CSSProperties} className="mt-8 block h-1 w-24 rounded-full bg-white/60" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div data-reveal className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Target size={22} aria-hidden="true" />
              </span>
              <h2 className="text-h2 text-white">Misi</h2>
            </div>
            <ol className="mt-8 grid gap-4">
              {profil.misi.butir.map((m, i) => (
                <li
                  key={i}
                  data-reveal
                  style={{ "--d": i + 1 } as React.CSSProperties}
                  className="group flex items-start gap-5 rounded-[14px] bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12] md:p-6"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[0.9375rem] font-bold tabular-nums text-brand-ink transition-transform duration-300 group-hover:scale-110">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-2 leading-relaxed text-white/90">{m}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Struktur */}
      <section id="struktur" aria-labelledby="judul-struktur" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-struktur"
            judul="Struktur organisasi"
            teks={<p>Pimpinan dan pengelola sekolah. Nama yang belum tersedia ditandai dan akan dilengkapi.</p>}
          />
          <CarouselRail
            ariaLabel="Struktur organisasi sekolah"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-4 lg:gap-5"
          >
            {profil.struktur.map((p, i) => (
              <li
                key={`${i}-${p.jabatan}`}
                data-reveal
                style={{ "--d": i % 4 } as React.CSSProperties}
                className="zoom-wrap group relative flex aspect-[4/5] w-[min(76vw,260px)] shrink-0 flex-col justify-end overflow-hidden rounded-[10px] bg-brand-ink p-5 text-white sm:w-[280px] lg:w-auto"
              >
                {p.foto ? (
                  <Image src={p.foto} alt={p.nama} fill sizes="(min-width: 1024px) 300px, 280px" className="object-cover object-top" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center bg-brand-soft pb-16 text-brand" aria-hidden="true">
                    <UserRound size={64} strokeWidth={1.25} />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-ink/95 via-brand-ink/60 to-transparent" aria-hidden="true" />
                <div className="relative flex flex-col">
                  <p className="text-sm text-white/80 first-letter:uppercase">{p.jabatan}</p>
                  <p className="mt-1 text-[1.125rem] font-semibold leading-tight text-white">{p.nama}</p>
                  {p.contoh && <Contoh className="mt-3 self-start" />}
                </div>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Guru */}
      <section id="guru" aria-labelledby="judul-guru" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-guru"
            judul="Guru dan tenaga kependidikan"
            teks={<p>Pendidik yang mendampingi {s.siswa} siswa setiap hari, dengan rasio satu guru untuk {s.rasioSiswaGuru} siswa.</p>}
          />
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-8 sm:gap-8 sm:py-10 lg:mt-12 lg:grid-cols-4">
            <div data-reveal>
              <dt className="text-sm font-semibold text-brand">Guru aktif</dt>
              <dd className="mt-3 text-stat-sm text-ink">
                <CountUp nilai={s.guru} />
              </dd>
            </div>
            {[
              ["Berkualifikasi S1/D4", s.guruKualifikasi],
              ["Bersertifikat pendidik", s.guruSertifikasi],
              ["Berstatus PNS", s.guruPns],
            ].map(([k, v], i) => (
              <div key={k} data-reveal style={{ "--d": i + 1 } as React.CSSProperties}>
                <dt className="text-sm font-semibold text-brand">{k}</dt>
                <dd className="mt-3 text-stat-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <CatatanContoh className="mt-10">Nama dan foto guru di bawah masih contoh, akan diisi dari data kepegawaian sekolah.</CatatanContoh>
          <CarouselRail
            ariaLabel="Daftar guru dan tenaga kependidikan"
            wrapClassName="mt-6"
            className="lg:grid lg:grid-cols-4 lg:gap-4"
          >
            {profil.guru.map((g, i) => (
              <li
                key={`${i}-${g.nama}`}
                className="zoom-wrap group relative flex aspect-[4/5] w-[min(72vw,240px)] shrink-0 flex-col justify-end overflow-hidden rounded-[10px] bg-brand-ink p-5 text-white sm:w-[260px] lg:w-auto"
              >
                {"foto" in g && g.foto ? (
                  <Image src={g.foto as string} alt={g.nama} fill sizes="(min-width: 1024px) 300px, 260px" className="object-cover object-top" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center bg-brand-soft pb-16 text-brand" aria-hidden="true">
                    <UserRound size={56} strokeWidth={1.25} />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-ink/95 via-brand-ink/60 to-transparent" aria-hidden="true" />
                <span className="relative flex flex-col">
                  <span className="text-[1.125rem] font-semibold leading-tight text-white">{g.nama}</span>
                  <span className="mt-1 text-sm text-white/80">Guru {g.mapel}</span>
                </span>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Sarana */}
      <section id="sarana" aria-labelledby="judul-sarana" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-sarana"
            judul="Sarana dan prasarana"
            teks={<p>Ruang belajar dan fasilitas pendukung di atas lahan seluas {formatAngka(s.luasTanah)} meter persegi.</p>}
          />
          <CarouselRail
            ariaLabel="Daftar sarana dan prasarana"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-4 lg:gap-6"
          >
            {profil.sarana.map((r, i) => (
              <li
                key={`${i}-${r.satuan}`}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="zoom-wrap flex w-[min(78vw,280px)] shrink-0 flex-col sm:w-[300px] lg:w-auto"
              >
                {r.gambar ? (
                  <Foto src={r.gambar} alt={r.satuan} sizes="(min-width: 1024px) 300px, 78vw" className="aspect-[4/3] rounded-[14px]" />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-[14px] bg-brand-soft">
                    <Image src="/images/logo-sman1brangrea.png" alt="" width={88} height={88} className="opacity-90" />
                  </div>
                )}
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="text-[2.75rem] font-light leading-none tracking-[-0.03em] text-ink">
                    {new Intl.NumberFormat("id-ID").format(r.angka)}
                  </span>
                  <span className="font-semibold text-brand">{r.satuan}</span>
                </p>
                <p className="mt-2 text-[0.9375rem] text-ink-2">{r.ket}</p>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>
    </>
  );
}
