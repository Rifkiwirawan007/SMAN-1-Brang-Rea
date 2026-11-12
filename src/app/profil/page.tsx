import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, UserRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CountUp } from "@/components/ui/count-up";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { Foto } from "@/components/ui/foto";
import { GURU_CONTOH, MISI, SAMBUTAN, SARANA, SEJARAH, STRUKTUR, VISI } from "@/data/profil";
import { SEKOLAH } from "@/data/sekolah";

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

export default function Profil() {
  const s = SEKOLAH.statistik;
  const identitas: [string, React.ReactNode][] = [
    ["Nama sekolah", SEKOLAH.nama],
    ["NPSN", SEKOLAH.npsn],
    ["Status", SEKOLAH.status],
    ["Bentuk pendidikan", SEKOLAH.bentuk],
    ["Akreditasi", `${SEKOLAH.akreditasi.nilai} (SK ${SEKOLAH.akreditasi.sk}, ${SEKOLAH.akreditasi.tanggal})`],
    ["SK pendirian", `Nomor ${SEKOLAH.pendirian.sk}, ${SEKOLAH.pendirian.tanggal}`],
    ["Kepala sekolah", SEKOLAH.kepalaSekolah],
    ["Alamat", SEKOLAH.alamat.jalan],
    ["Desa", SEKOLAH.alamat.desa.replace("Desa ", "")],
    ["Kecamatan", "Brang Rea"],
    ["Kabupaten", "Sumbawa Barat"],
    ["Provinsi", SEKOLAH.alamat.provinsi],
    ["Koordinat", `${SEKOLAH.koordinat.lat}, ${SEKOLAH.koordinat.lng}`],
    ["Luas tanah", "13.000 m²"],
    ["Daya listrik", s.listrik],
    ["Akses internet", s.internet],
    ["Waktu belajar", s.penyelenggaraan],
    ["Email", SEKOLAH.kontak.email],
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
              <Image src={SAMBUTAN.foto2} alt={`${SAMBUTAN.nama}, ${SAMBUTAN.jabatan}`} fill sizes="(min-width: 1024px) 460px, 90vw" className="object-contain object-bottom" />
            </div>
            <div className="potret-alas" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div data-reveal className="flex flex-wrap items-center gap-3">
              <h2 id="judul-sambutan" className="text-h2">
                Sambutan kepala sekolah
              </h2>
              {SAMBUTAN.contoh && <Contoh teks="Teks contoh" />}
            </div>
            <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="prose-sekolah mt-8 max-w-[64ch] text-ink-2">
              <p>{SAMBUTAN.salam}</p>
              {SAMBUTAN.paragraf.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p>{SAMBUTAN.penutup}</p>
            </div>
            <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="mt-8 border-t border-line pt-6">
              <p className="text-h3">{SAMBUTAN.nama}</p>
              <p className="mt-1 text-ink-2">{SAMBUTAN.jabatan}</p>
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
          <dl data-reveal className="mt-12 grid overflow-hidden rounded-[14px] border border-line bg-paper md:grid-cols-2">
            {identitas.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-4 border-b border-line px-6 py-4 md:odd:border-r">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="min-w-0 break-words text-[0.9375rem] font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted">
            Sumber:{" "}
            <a href={SEKOLAH.sumber.dapodik} target="_blank" rel="noopener noreferrer" className="link-ink inline-flex items-center gap-1">
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
            judul="Perjalanan sejak 2006"
            teks={<p>Dua dekade melayani pendidikan menengah atas di Brang Rea, Sumbawa Barat.</p>}
          />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {SEJARAH.map((p, i) => (
              <li key={p.tahun} data-reveal style={{ "--d": i } as React.CSSProperties} className="flex flex-col bg-paper p-7 md:p-8">
                <span className="text-stat text-brand">{p.tahun}</span>
                <span className="mt-6 text-h3 text-ink">{p.judul}</span>
                <span className="mt-3 text-[0.9375rem] text-ink-2">{p.teks}</span>
                {p.contoh && <Contoh className="mt-5 self-start" />}
              </li>
            ))}
          </ol>
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
              {VISI.contoh && <Contoh />}
            </div>
            <p className="mt-8 text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-light leading-snug tracking-[-0.015em] text-white">
              {VISI.teks}
            </p>
          </div>
          <div data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <h2 className="text-h2 text-white">Misi</h2>
            <ol className="mt-8 flex flex-col divide-y divide-white/20 border-y border-white/20">
              {MISI.butir.map((m, i) => (
                <li key={m} className="flex gap-5 py-4">
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
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STRUKTUR.map((p, i) => (
              <li key={p.jabatan} data-reveal style={{ "--d": i % 4 } as React.CSSProperties} className="flex flex-col rounded-[14px] border border-line bg-paper p-6">
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
          </ul>
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
          <dl className="mt-12 grid gap-8 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
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
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {GURU_CONTOH.map((g) => (
              <li key={g.mapel} className="flex flex-col items-start rounded-[14px] border border-line bg-paper p-5">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                  <UserRound size={22} aria-hidden="true" />
                </span>
                <span className="mt-4 font-semibold text-ink">{g.nama}</span>
                <span className="text-sm text-ink-2">Guru {g.mapel}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sarana */}
      <section id="sarana" aria-labelledby="judul-sarana" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-sarana"
            judul="Sarana dan prasarana"
            teks={<p>Ruang belajar dan fasilitas pendukung di atas lahan seluas 13.000 meter persegi.</p>}
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SARANA.map((r, i) => (
              <li key={r.satuan} data-reveal style={{ "--d": i } as React.CSSProperties} className="zoom-wrap flex flex-col">
                {r.gambar ? (
                  <Foto src={r.gambar} alt={r.satuan} sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] rounded-[14px]" />
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
          </ul>
          <p className="mt-10 text-sm text-muted">
            Listrik {s.listrik}, internet {s.internet.toLowerCase()}. Sumber angka: Dapodik semester {s.semesterData}.
          </p>
        </div>
      </section>
    </>
  );
}
