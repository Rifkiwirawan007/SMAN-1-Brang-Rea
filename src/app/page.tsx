import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Navigation } from "lucide-react";
import { HeroSlider, type SlideHero } from "@/components/home/hero-slider";
import { LayananRail, type KartuLayanan } from "@/components/home/layanan-rail";
import { KabarTabs } from "@/components/home/kabar-tabs";
import { EkskulTabs } from "@/components/home/ekskul-tabs";
import { SectionHead } from "@/components/ui/section-head";
import { CountUp } from "@/components/ui/count-up";
import { Contoh } from "@/components/ui/contoh";
import { Foto, LabelIlustrasi } from "@/components/ui/foto";
import { IkonWhatsApp } from "@/components/ui/icons";
import { AGENDA, urutBerita } from "@/data/berita";
import { EKSKUL, PRESTASI } from "@/data/kesiswaan";
import { SAMBUTAN } from "@/data/profil";
import { apakahIlustrasi } from "@/data/foto";
import { MAPS_EMBED, MAPS_LINK, SEKOLAH, TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { bagianTanggal, formatTanggal, waLink } from "@/lib/format";

const SLIDES: SlideHero[] = [
  {
    tab: "Selamat datang",
    judul: "Selamat datang di SMAN 1 Brang Rea",
    teks: "Sekolah menengah atas negeri di Desa Beru, Sumbawa Barat, sejak 2006.",
    gambar: "/images/hero-sekolah-baru.jpg",
    alt: "Papan nama SMAN 1 Brang Rea, siswa berjalan menuju gedung sekolah, dan penari berkostum sayap emas",
    posisi: "center 40%",
    aksi: { label: "Profil sekolah", href: "/profil" },
    aksi2: { label: "Info SPMB", href: "/spmb" },
  },
  {
    tab: "Ekstrakurikuler",
    judul: "Ruang tumbuh di luar kelas",
    teks: "Pramuka, Paskibra, seni tari, olahraga, dan kegiatan keagamaan.",
    gambar: "/images/sekolah/video-ekskul-poster.jpg",
    alt: "Penampil berkostum merah menari di depan air terjun di Brang Rea",
    video: { besar: "/video/ekskul-hd.mp4", kecil: "/video/ekskul-hp.mp4" },
    durasi: 20000,
    aksi: { label: "Lihat kesiswaan", href: "/kesiswaan" },
  },
  {
    tab: "Kabar sekolah",
    judul: "Kabar terbaru dari sekolah",
    teks: "Berita, pengumuman, dan agenda untuk siswa serta orang tua.",
    gambar: "/images/sekolah/snbp-2026.jpg",
    alt: "Poster Selamat dan Sukses siswa-siswi SMAN 1 Brang Rea atas kelulusan SNBP 2026, berisi foto 14 siswa berjas hitam",
    posisi: "50% center",
    poster: true,
    aksi: { label: "Baca berita", href: "/berita" },
  },
  {
    tab: "SPMB 2027/2028",
    judul: "SPMB 2027/2028 segera dibuka",
    teks: "Pelajari jalur, jadwal, dan syarat pendaftaran murid baru.",
    gambar: "/images/sekolah/spmb-poster.jpg",
    alt: "Poster SPMB SMAN 1 Brang Rea: kepala sekolah dan dua siswa berseragam di depan gedung sekolah",
    posisi: "50% center",
    poster: true,
    aksi: { label: "Lihat info SPMB", href: "/spmb" },
  },
];

const LAYANAN: KartuLayanan[] = [
  { judul: "Kalender akademik", teks: "Tanggal penting semester ganjil dan genap tahun pelajaran 2026/2027.", href: "/akademik#kalender" },
  { judul: "Jadwal pelajaran", teks: "Jam masuk, istirahat, dan pembagian enam hari belajar.", href: "/akademik#jadwal" },
  { judul: "Ekstrakurikuler", teks: "Sepuluh pilihan kegiatan untuk menyalurkan bakat dan minat.", href: "/kesiswaan#ekstrakurikuler" },
  { judul: "Prestasi siswa", teks: "Capaian siswa di tingkat kecamatan, kabupaten, dan provinsi.", href: "/kesiswaan#prestasi" },
  { judul: "Bimbingan konseling", teks: "Pendampingan belajar, pribadi, dan rencana studi lanjut.", href: "/kesiswaan#bk" },
  { judul: "Informasi SPMB", teks: "Jalur, jadwal, dan syarat penerimaan murid baru.", href: "/spmb" },
];

const UBIN = [
  { label: "Mengenal sekolah", judul: "Profil sekolah", href: "/profil", gambar: "/images/hero-sekolah-baru.jpg", posisi: "10% center", alt: "Papan nama SMAN 1 Brang Rea dan siswa berjalan menuju gedung sekolah" },
  { label: "Belajar dan kurikulum", judul: "Akademik", href: "/akademik", gambar: "/images/sekolah/tka-siswa.jpg", alt: "Siswa mengerjakan tes di laboratorium komputer" },
  { label: "Organisasi dan bakat", judul: "Kesiswaan", href: "/kesiswaan", gambar: "/images/sekolah/karnaval-sayap-emas.jpg", alt: "Siswi berkostum sayap emas pada karnaval budaya" },
  { label: "Murid baru", judul: "SPMB 2027/2028", href: "/spmb", gambar: "/images/sekolah/upacara-pemimpin.jpg", alt: "Siswa pemimpin upacara berselempang hijau" },
];

export default function Beranda() {
  const urut = urutBerita();
  const berita = urut
    .filter((b) => b.kategori !== "Pengumuman")
    .map((b) => ({ ...b, tanggalTampil: formatTanggal(b.tanggal) }));
  const pengumuman = urut
    .filter((b) => b.kategori === "Pengumuman")
    .map((b) => ({ ...b, tanggalTampil: formatTanggal(b.tanggal) }));
  const agenda = AGENDA.map((a) => {
    const t = bagianTanggal(a.tanggal);
    return {
      ...a,
      ...t,
      rentang: a.sampai ? `${t.namaHari}, s.d. ${formatTanggal(a.sampai, { pendek: true })}` : t.namaHari,
    };
  });
  const s = SEKOLAH.statistik;
  const statistik = [
    { label: "Peserta didik", nilai: s.siswa, ket: `${s.siswaLaki} laki-laki dan ${s.siswaPerempuan} perempuan` },
    { label: "Guru", nilai: s.guru, ket: `${s.guruSertifikasi} bersertifikat pendidik` },
    { label: "Rombongan belajar", nilai: s.rombel, ket: `Rata-rata ${s.rasioSiswaRombel} siswa per rombel` },
    { label: "Laboratorium", nilai: s.laboratorium, ket: `Ditambah ${s.ruangKelas} ruang kelas dan ${s.perpustakaan} perpustakaan` },
  ];

  return (
    <>
      <HeroSlider slides={SLIDES} />

      {/* Sambutan kepala sekolah */}
      <section aria-labelledby="judul-sambutan" className="section-y bg-paper-2">
        <div className="container-site grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Potret berdiri di atas alas 3D tipis (diam, tanpa animasi). */}
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="relative aspect-[4/5]">
              <Image
                src={SAMBUTAN.foto}
                alt={`${SAMBUTAN.nama}, ${SAMBUTAN.jabatan}`}
                fill
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-contain object-bottom"
              />
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
            <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="mt-8 flex flex-col gap-5 text-lead text-ink-2">
              <p>{SAMBUTAN.salam}</p>
              <p>{SAMBUTAN.paragraf[0]}</p>
            </div>
            <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-h3 text-ink">{SAMBUTAN.nama}</p>
                <p className="mt-1 text-ink-2">{SAMBUTAN.jabatan}</p>
              </div>
              <Link href="/profil#sambutan" className="btn-pill">
                Baca sambutan lengkap
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ubin foto penuh 4 kolom */}
      <section aria-label="Jelajahi sekolah" className="grid sm:grid-cols-2 lg:grid-cols-4">
        {UBIN.map((u, i) => (
          <Link
            key={u.href}
            href={u.href}
            data-reveal
            style={{ "--d": i } as React.CSSProperties}
            className="zoom-wrap group relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden bg-brand-ink p-6 text-white md:min-h-[460px] lg:min-h-[560px] lg:p-8"
          >
            <Foto src={u.gambar} alt={u.alt} posisi={"posisi" in u ? u.posisi : undefined} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" penuh className="-z-20" label="tidak" />
            <span className="scrim-bottom absolute inset-0 -z-10 opacity-90 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
            {TAMPILKAN_LABEL_CONTOH && apakahIlustrasi(u.gambar) && <LabelIlustrasi posisi="kanan-atas" />}
            <span className="text-h3 text-white">{u.judul}</span>
            <span className="mt-2 text-sm text-white/80">{u.label}</span>
            <span className="btn-round mt-6 text-white group-hover:bg-white group-hover:text-brand-ink">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>

      {/* Tentang + angka */}
      <section aria-labelledby="judul-tentang" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-tentang"
            judul="Sekolah negeri di jantung Brang Rea"
            teks={
              <p>
                Berdiri sejak {SEKOLAH.pendirian.tanggal}, {SEKOLAH.nama} melayani pendidikan menengah atas bagi
                anak-anak Kecamatan Brang Rea dan sekitarnya di Kabupaten Sumbawa Barat. Sekolah ini terakreditasi{" "}
                {SEKOLAH.akreditasi.nilai} dengan NPSN {SEKOLAH.npsn}.
              </p>
            }
            aksi={{ label: "Profil sekolah", href: "/profil" }}
          />
          <div className="mt-14 border-t border-line pt-14 md:mt-20 md:pt-16">
            <dl className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {statistik.map((st, i) => (
                <div key={st.label} data-reveal style={{ "--d": i } as React.CSSProperties} className="flex flex-col">
                  <dt className="order-1 text-sm font-semibold text-brand">{st.label}</dt>
                  <dd className="order-2 mt-4 text-stat text-ink">
                    <CountUp nilai={st.nilai} />
                  </dd>
                  <dd className="order-3 mt-4 max-w-[26ch] text-[0.9375rem] text-ink-2">{st.ket}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-12 text-sm text-muted">
              Sumber:{" "}
              <a href={SEKOLAH.sumber.dapodik} target="_blank" rel="noopener noreferrer" className="link-ink">
                Data Pokok Pendidikan Kemendikdasmen
              </a>
              , semester {s.semesterData}.
            </p>
          </div>
        </div>
      </section>

      {/* Layanan: foto kiri + carousel kartu kanan */}
      <section aria-labelledby="judul-layanan" className="pt-[clamp(72px,6vw+40px,128px)]">
        <div className="container-site">
          <SectionHead
            id="judul-layanan"
            judul="Layanan untuk siswa dan orang tua"
            teks={<p>Semua yang sering dicari, dari kalender akademik sampai pendaftaran murid baru, dalam satu deret kartu.</p>}
          />
        </div>
        <div className="relative mt-14 lg:min-h-[600px]">
          <Foto
            src="/images/sekolah/tka-lab.jpg"
            alt="Siswa belajar di laboratorium komputer sekolah"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-[300px] sm:h-[380px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/2"
            label="kiri-atas"
          />
          <div className="relative z-10 bg-paper-2 py-12 lg:ml-[50%] lg:flex lg:min-h-[600px] lg:flex-col lg:justify-center lg:py-16">
            <div className="pl-[clamp(20px,5vw,64px)] lg:-ml-36 lg:pl-0">
              <LayananRail kartu={LAYANAN} />
            </div>
          </div>
        </div>
      </section>

      {/* Ruang berita */}
      <section aria-labelledby="judul-kabar" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-kabar"
            judul="Kabar sekolah"
            teks={<p>Berita kegiatan dari buletin Lensa Barema, pengumuman resmi, dan agenda terdekat. Pengumuman dan agenda masih contoh.</p>}
            aksi={{ label: "Semua berita", href: "/berita" }}
          />
          <div className="mt-14">
            <KabarTabs berita={berita} pengumuman={pengumuman} agenda={agenda} />
          </div>
        </div>
      </section>

      {/* Kegiatan siswa */}
      <section aria-labelledby="judul-kegiatan" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-kegiatan"
            judul="Kegiatan dan prestasi siswa"
            teks={<p>Sepuluh ekstrakurikuler menjadi tempat siswa berlatih memimpin, berkarya, dan bertanding.</p>}
            aksi={{ label: "Kesiswaan", href: "/kesiswaan" }}
          />
          <div className="mt-14">
            <EkskulTabs ekskul={EKSKUL} prestasi={PRESTASI} />
          </div>
        </div>
      </section>

      {/* Lokasi */}
      <section aria-labelledby="judul-lokasi" className="section-y">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col">
            <h2 id="judul-lokasi" data-reveal className="text-h2">
              Kunjungi sekolah
            </h2>
            <ul data-reveal style={{ "--d": 1 } as React.CSSProperties} className="mt-8 flex flex-col gap-6 text-ink-2">
              <li className="flex gap-4">
                <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                <span>{SEKOLAH.alamat.lengkap}</span>
              </li>
              <li className="flex gap-4">
                <Clock size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                <span className="flex flex-col gap-1">
                  <span>Senin–Kamis 07.00–14.30, Jumat 07.00–11.30, Sabtu 07.00–12.30 WITA</span>
                  <Contoh className="self-start" />
                </span>
              </li>
              <li className="flex gap-4">
                <Mail size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                <a href={`mailto:${SEKOLAH.kontak.email}`} className="link-ink">
                  {SEKOLAH.kontak.email}
                </a>
              </li>
            </ul>
            <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="mt-10 flex flex-wrap gap-3">
              <a href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.")} target="_blank" rel="noopener noreferrer" className="btn-solid">
                <IkonWhatsApp size={18} />
                Chat WhatsApp
              </a>
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill">
                <Navigation size={18} aria-hidden="true" />
                Petunjuk arah
              </a>
            </div>
          </div>
          <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="relative min-h-[360px] overflow-hidden rounded-[14px] border border-line bg-paper-3 lg:min-h-[440px]">
            <iframe
              title={`Peta lokasi ${SEKOLAH.nama}`}
              src={MAPS_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
