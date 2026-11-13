import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, UserRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CountUp } from "@/components/ui/count-up";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { Foto } from "@/components/ui/foto";
import { ambilProfil, ambilSambutan, ambilSekolah } from "@/lib/konten/baca";
import { formatAngka } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profil sekolah",
  description: "Sambutan kepala sekolah, identitas, sejarah, visi misi, struktur organisasi, guru, dan sarana SMA Negeri 1 Brang Rea.",
};

const BAGIAN = [
  { id: "sambutan", label: "Sambutan" },
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

      {/* Identitas */}
      <section id="identitas" aria-labelledby="judul-identitas" className="section-y bg-paper-2">
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
          <p className="mt-6 text-sm text-muted">
            Sumber:{" "}
            <a href={sekolah.sumber.dapodik} target="_blank" rel="noopener noreferrer" className="link-ink inline-flex items-center gap-1">
              profil sekolah di Kemendikdasmen
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            , semester {s.semesterData}.
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section id="sejarah" aria-labelledby="judul-sejarah" className="section-y">
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
      <section id="visi-misi" aria-labelledby="judul-visi" className="on-dark section-y bg-brand text-white">
        <div className="container-site grid gap-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20">
          <div data-reveal>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="judul-visi" className="text-h2 text-white">
                Visi
              </h2>
              {profil.visi.contoh && <Contoh />}
            </div>
            <p className="mt-8 text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-light leading-snug tracking-[-0.015em] text-white">
              {profil.visi.teks}
            </p>
          </div>
          <div data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <h2 className="text-h2 text-white">Misi</h2>
            <ol className="mt-8 flex flex-col divide-y divide-white/20 border-y border-white/20">
              {profil.misi.butir.map((m, i) => (
                <li key={i} className="flex gap-5 py-4">
                  <span className="w-6 shrink-0 font-semibold tabular-nums text-white/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-white/90">{m}</span>
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
                className="flex w-[min(76vw,260px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[280px] lg:w-auto"
              >
                <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand">
                  {p.foto ? (
                    <Image src={p.foto} alt={p.nama} fill sizes="80px" className="object-cover object-top" />
                  ) : (
                    <UserRound size={34} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </div>
                <p className="mt-5 text-sm text-muted first-letter:uppercase">{p.jabatan}</p>
                <p className="mt-1 font-semibold text-ink">{p.nama}</p>
                {p.contoh && <Contoh className="mt-4 self-start" />}
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
                className="flex w-[min(72vw,240px)] shrink-0 flex-col items-start rounded-[14px] border border-line bg-paper p-5 sm:w-[260px] lg:w-auto"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                  <UserRound size={22} aria-hidden="true" />
                </span>
                <span className="mt-4 font-semibold text-ink">{g.nama}</span>
                <span className="text-sm text-ink-2">Guru {g.mapel}</span>
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
          <p className="mt-10 text-sm text-muted">
            Listrik {s.listrik}, internet {s.internet.toLowerCase()}. Sumber angka: Dapodik semester {s.semesterData}.
          </p>
        </div>
      </section>
    </>
  );
}
