import type { Metadata } from "next";
import { BookOpenCheck, CalendarDays, Coffee, Download, Layers3, Sparkles, UsersRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CountUp } from "@/components/ui/count-up";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { ambilAkademik, ambilSekolah } from "@/lib/konten/baca";

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

const IKON_KOMPONEN = [BookOpenCheck, Layers3, Sparkles];

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
        gambar="/images/sekolah/tka-komputer.jpg"
        alt="Siswa mengerjakan tes di laboratorium komputer"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Akademik" }]}
      />
      <SubNav items={BAGIAN} />

      {/* Kurikulum */}
      <section id="kurikulum" aria-labelledby="judul-kurikulum" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-kurikulum"
            judul={kurikulum.nama}
            tambahan={kurikulum.contoh ? <Contoh className="self-start" /> : null}
            teks={<p>{kurikulum.ringkas}</p>}
          />
          <CarouselRail
            ariaLabel="Komponen kurikulum"
            wrapClassName="mt-10 lg:mt-14"
            className="lg:grid lg:grid-cols-3 lg:gap-5"
          >
            {kurikulum.komponen.map((k, i) => {
              const Ikon = IKON_KOMPONEN[i % IKON_KOMPONEN.length];
              return (
                <li
                  key={k.nama}
                  data-reveal
                  style={{ "--d": i } as React.CSSProperties}
                  className="flex w-[min(82vw,320px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[340px] sm:p-8 lg:w-auto"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                    <Ikon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-h3">{k.nama}</h3>
                  <span aria-hidden="true" className="mt-4 block h-1 w-10 rounded-full bg-sun" />
                  <p className="mt-4 text-ink-2">{k.teks}</p>
                </li>
              );
            })}
          </CarouselRail>
        </div>
      </section>

      {/* Rombel (data asli) */}
      <section id="rombel" aria-labelledby="judul-rombel" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-rombel"
            judul="Rombongan belajar tahun ini"
            teks={<p>Angka resmi semester {s.semesterData} dari Data Pokok Pendidikan, bukan perkiraan.</p>}
          />
          <dl className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 border-t border-line pt-10 sm:gap-10 sm:pt-12 lg:mt-12 lg:grid-cols-4">
            {[
              { k: "Rombongan belajar", v: s.rombel, ket: "kelas X, XI, dan XII" },
              { k: "Peserta didik", v: s.siswa, ket: `${s.siswaLaki} laki-laki, ${s.siswaPerempuan} perempuan` },
              { k: "Siswa per rombel", v: s.rasioSiswaRombel, ket: "rata-rata tiap kelas" },
              { k: "Siswa per guru", v: s.rasioSiswaGuru, ket: `dengan ${s.guru} guru` },
            ].map((d, i) => (
              <div key={d.k} data-reveal style={{ "--d": i } as React.CSSProperties}>
                <dt className="text-sm font-semibold text-brand">{d.k}</dt>
                <dd className="mt-4 text-stat text-ink">
                  <CountUp nilai={d.v} />
                </dd>
                <dd className="mt-3 text-[0.9375rem] text-ink-2">{d.ket}</dd>
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
            tambahan={mapel.contoh ? <Contoh className="self-start" /> : null}
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

      {/* Jadwal */}
      <section id="jadwal" aria-labelledby="judul-jadwal" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-jadwal"
            judul="Jadwal dan jam pelajaran"
            tambahan={jadwal.contoh ? <Contoh className="self-start" /> : null}
            teks={<p>Sekolah menyelenggarakan pembelajaran pagi selama enam hari, Senin sampai Sabtu (data Dapodik).{labelContoh && jadwal.contoh ? " Jam di bawah ini contoh." : null}</p>}
          />
          <div data-reveal className="mt-12 overflow-x-auto rounded-[14px] border border-line bg-paper">
            <table className="w-full min-w-[560px] text-left">
              <caption className="sr-only">Jam pelajaran per hari</caption>
              <thead>
                <tr className="border-b border-line text-sm text-muted">
                  <th scope="col" className="px-6 py-4 font-medium">Hari</th>
                  <th scope="col" className="px-6 py-4 font-medium">Jam belajar (WITA)</th>
                  <th scope="col" className="px-6 py-4 font-medium">Kegiatan khusus</th>
                </tr>
              </thead>
              <tbody>
                {jadwal.hari.map((h) => (
                  <tr key={h.hari} className="border-b border-line last:border-0">
                    <th scope="row" className="px-6 py-4 font-semibold text-ink">{h.hari}</th>
                    <td className="px-6 py-4 tabular-nums text-ink">{h.jam}</td>
                    <td className="px-6 py-4 text-ink-2">{h.ket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-3 text-ink-2">
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
