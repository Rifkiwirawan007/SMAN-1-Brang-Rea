import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircleQuestion } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { IkonWhatsApp } from "@/components/ui/icons";
import { WaForm } from "@/components/kontak/wa-form";
import { KuotaSpmb } from "@/components/spmb/kuota-spmb";
import { JalurTabs } from "@/components/spmb/jalur-tabs";
import { GarisJadwal } from "@/components/spmb/garis-jadwal";
import { TombolDaftar } from "@/components/spmb/tombol-daftar";
import { VideoYoutube } from "@/components/ui/video-youtube";
import { ambilSekolah, ambilSpmb } from "@/lib/konten/baca";
import { waLink } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const spmb = await ambilSpmb();
  return {
    title: `SPMB ${spmb.tahunAjaran}`,
    description: "Jalur, jadwal, syarat, dan alur Sistem Penerimaan Murid Baru SMA Negeri 1 Brang Rea.",
  };
}

/** Ambil ID video dari tautan YouTube (youtu.be/ID, watch?v=ID, embed/ID, shorts/ID). */
function idYoutube(url?: string) {
  const m = url?.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m?.[1];
}

const BAGIAN = [
  { id: "daftar", label: "Pendaftaran" },
  { id: "kuota", label: "Kuota" },
  { id: "jadwal", label: "Jadwal" },
  { id: "jalur", label: "Jalur" },
  { id: "syarat", label: "Syarat" },
  { id: "alur", label: "Alur" },
  { id: "tanya", label: "Tanya jawab" },
  { id: "hubungi-panitia", label: "Hubungi panitia" },
];

export default async function Spmb() {
  const [sekolah, spmb] = await Promise.all([ambilSekolah(), ambilSpmb()]);
  const portal = spmb.portal?.trim();
  const idVideo = idYoutube(spmb.videoTutorial);
  // Matriks jadwal: baris = tahap (dari jalur pertama yang punya jadwal), kolom = jalur.
  const tahapJalur = spmb.jalur.find((j) => j.jadwal?.length)?.jadwal?.map((t) => t.tahap) ?? [];
  return (
    <>
      <PageHero
        judul={`SPMB ${spmb.tahunAjaran}`}
        teks="Sistem Penerimaan Murid Baru SMA Negeri 1 Brang Rea."
        gambar="/images/sekolah/banner-kostum-budaya.webp"
        alt="Siswa SMAN 1 Brang Rea berbusana adat berfoto bersama di depan kelas"
        posisiGambar="center 15%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "SPMB" }]}
        tambahan={
          <>
            <span className="inline-flex items-center rounded-full border border-white/50 bg-brand-ink/40 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Status: {spmb.status}
            </span>
            {portal && (
              <a href={portal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep">
                Portal SPMB NTB <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
            {spmb.contoh && <Contoh teks="Seluruh info contoh" />}
          </>
        }
      />
      <SubNav items={BAGIAN} />

      {/* Pendaftaran: poster link + tombol daftar (gaya seksi Video profil) */}
      <section id="daftar" aria-labelledby="judul-daftar" className="section-y">
        <div className="container-site">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="judul-daftar" className="text-h2 text-brand-ink">
              Link pendaftaran SPMB {spmb.tahunAjaran}
            </h2>
            <p className="mt-4 text-lead text-ink-2">Pendaftaran dilakukan secara daring di portal SPMB Provinsi Nusa Tenggara Barat. Tonton tutorialnya dulu, petunjuk teknis lengkap dapat diunduh di halaman pendaftaran.</p>
          </div>
          {idVideo && (
            <div data-reveal className="mx-auto mt-10 max-w-5xl md:mt-12">
              {/* Bayangan di sekeliling video, terlihat timbul (sama seperti video profil) */}
              <div
                className="overflow-hidden rounded-[14px]"
                style={{
                  boxShadow:
                    "0 0 0 1px rgb(0 0 0 / 0.08), 0 0 12px 2px rgb(0 0 0 / 0.22), 0 0 40px 8px rgb(0 0 0 / 0.28), 0 0 80px 16px rgb(0 0 0 / 0.22)",
                }}
              >
                <VideoYoutube id={idVideo} judul={`Tutorial pendaftaran SPMB Provinsi NTB ${spmb.tahunAjaran}`} />
              </div>
            </div>
          )}
          <div data-reveal className="mt-12 flex flex-col items-center gap-6 md:mt-16">
            <TombolDaftar portal={portal} status={spmb.status} />
          </div>
        </div>
      </section>

      {/* Kuota + Jadwal: satu latar foto lapangan sekolah dengan gradasi hijau tua yang menyambung */}
      <div className="on-dark relative overflow-hidden bg-brand-ink text-white">
        <Image src="/images/sekolah/banner-senam-pagi.webp" alt="" fill sizes="100vw" quality={70} className="object-cover" style={{ objectPosition: "center 35%" }} />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-brand-ink/95 via-brand-ink/80 to-brand-ink/90" />
        {/* Batas atas berombak: diisi warna latar seksi sebelumnya (putih) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[-3px] z-[1] h-[48px] w-full text-paper md:h-[90px]"
        >
          <path
            fill="currentColor"
            d="M0 0H1440V46C1360 78 1290 98 1200 92C1090 84 1020 34 900 30C780 26 720 86 600 96C480 106 420 52 300 44C190 37 110 70 0 92Z"
          />
        </svg>

      {/* Kuota */}
      <section id="kuota" aria-labelledby="judul-kuota" className="section-y relative">
        <div className="container-site relative">
          <div className="max-w-[60ch]">
            <p data-reveal className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Tahun pelajaran {spmb.tahunAjaran}</p>
            <h2 id="judul-kuota" data-reveal className="mt-4 text-h2 text-white">
              Kuota pendaftaran murid baru
            </h2>
            <p data-reveal className="mt-4 text-lead text-white/75">
              Pembagian kursi per jalur sesuai petunjuk teknis SPMB Provinsi Nusa Tenggara Barat.
            </p>
          </div>
          <div className="mt-12 lg:mt-16">
            <KuotaSpmb spmb={spmb} />
          </div>
        </div>
      </section>

      {/* Jadwal */}
      <section id="jadwal" aria-labelledby="judul-jadwal-spmb" className="section-y relative">
        <div className="container-site relative">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)] lg:gap-10">
            <div>
              <p data-reveal className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Jadwal kegiatan</p>
              <h2 id="judul-jadwal-spmb" data-reveal className="mt-4 max-w-[18ch] text-h2 text-white">
                Jadwal kegiatan SPMB {spmb.tahunAjaran}
              </h2>
            </div>
            <p data-reveal style={{ "--d": 1 } as React.CSSProperties} className="max-w-[62ch] text-lead text-white/80 lg:pt-8">
              Dari finalisasi petunjuk teknis sampai pendaftaran ulang tiap jalur.
            </p>
          </div>
          {spmb.contoh ? <CatatanContoh className="mt-8">Tanggal di bawah ini contoh.</CatatanContoh> : null}

          {/* Linimasa umum: garis hijau yang tumbuh saat digulir */}
          <div className="mt-12 lg:mt-16">
            <GarisJadwal jadwal={spmb.jadwal} />
          </div>

          {/* Matriks per jalur */}
          {tahapJalur.length > 0 && (
            <div data-reveal className="mt-16 overflow-x-auto rounded-[22px] border border-line shadow-card">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <caption className="sr-only">Jadwal tiap jalur SPMB {spmb.tahunAjaran}</caption>
                <thead>
                  <tr className="bg-brand-ink text-white">
                    <th scope="col" className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Kegiatan</th>
                    {spmb.jalur.map((j, i) => (
                      <th key={j.nama} scope="col" className="px-6 py-5">
                        <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] text-white/60">JALUR {String(i + 1).padStart(2, "0")}</span>
                        <span className="text-lg font-bold">{j.nama}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tahapJalur.map((tahap, r) => (
                    <tr key={tahap} className={r % 2 ? "bg-paper-2" : "bg-paper"}>
                      <th scope="row" className="border-t border-line px-6 py-5 font-semibold text-ink">{tahap}</th>
                      {spmb.jalur.map((j) => (
                        <td key={j.nama} className="border-t border-line px-6 py-5 text-ink-2">
                          {j.jadwal?.find((t) => t.tahap === tahap)?.waktu ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
        {/* Batas bawah berombak: diisi warna latar seksi Jalur (paper-2) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-[-3px] z-[1] h-[48px] w-full text-paper-2 md:h-[90px]"
        >
          <path
            fill="currentColor"
            d="M0 120H1440V70C1330 34 1240 22 1130 32C1010 43 950 96 820 98C690 100 640 40 520 30C400 20 330 74 210 84C130 90 60 76 0 58Z"
          />
        </svg>
      </div>

      {/* Jalur */}
      <section id="jalur" aria-labelledby="judul-jalur" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-jalur"
            judul="Empat jalur pendaftaran"
            teks={<p>Pilih jalur untuk melihat jadwal, persyaratan, dan urutan kriteria seleksinya.</p>}
          />
          <div className="mt-10 lg:mt-14">
            <JalurTabs jalur={spmb.jalur} />
          </div>
        </div>
      </section>

      {/* Syarat */}
      <section id="syarat" aria-labelledby="judul-syarat" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-syarat"
            judul="Persyaratan pendaftaran"
            teks={<p>Berlaku untuk semua jalur. Siapkan dokumennya sebelum mendaftar di portal SPMB.</p>}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              { judul: "Persyaratan umum", isi: spmb.syarat },
              { judul: "Persyaratan khusus", isi: spmb.syaratKhusus ?? [] },
            ]
              .filter((g) => g.isi.length > 0)
              .map((g) => (
                <div key={g.judul} data-reveal className="relative overflow-hidden rounded-[22px] border border-line bg-paper p-6 shadow-card md:p-10">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{g.judul}</h3>
                  <ol className="mt-6 flex flex-col gap-5">
                    {g.isi.map((x, i) => (
                      <li key={x} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-ink-2">
                        <span className="font-serif text-lg italic leading-6 text-brand">{String.fromCharCode(97 + i)}.</span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Alur */}
      <section id="alur" aria-labelledby="judul-alur" className="on-dark section-y relative overflow-hidden bg-brand-ink text-white">
        {/* Batas atas & bawah melengkung besar (busur, beda dari ombak di Kuota/Jadwal): diisi putih seksi tetangga */}
        <svg aria-hidden="true" viewBox="0 0 1440 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[-3px] h-[36px] w-full text-paper md:h-[72px]">
          <path fill="currentColor" d="M0 0H1440V100C1080 -8 360 -8 0 100Z" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 1440 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-[-3px] h-[36px] w-full text-paper md:h-[72px]">
          <path fill="currentColor" d="M0 0C360 108 1080 108 1440 0V100H0Z" />
        </svg>
        <div className="container-site relative">
          <h2 id="judul-alur" data-reveal className="text-h2 text-white">
            Alur pendaftaran
          </h2>
          <CarouselRail
            sebagai="ol"
            gelap
            ariaLabel="Alur pendaftaran SPMB"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10"
          >
            {spmb.alur.map((a, i) => (
              <li
                key={a.judul}
                data-reveal
                style={{ "--d": i % 3 } as React.CSSProperties}
                className="w-[min(80vw,300px)] shrink-0 rounded-[14px] border border-white/25 bg-white/10 p-6 sm:w-[320px] lg:w-auto lg:rounded-none lg:border-0 lg:border-t lg:border-white/25 lg:bg-transparent lg:p-0 lg:pt-6"
              >
                <h3 className="text-h3 text-white">
                  <span className="tabular-nums text-white/60">{String(i + 1).padStart(2, "0")}</span> {a.judul}
                </h3>
                <p className="mt-2 text-white/85">{a.teks}</p>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Tanya jawab */}
      <section id="tanya" aria-labelledby="judul-tanya" className="section-y">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="judul-tanya" data-reveal className="text-h2">
              Pertanyaan yang sering diajukan
            </h2>
            <a
              href={waLink("Halo panitia SPMB SMAN 1 Brang Rea, saya ingin bertanya tentang pendaftaran.", sekolah.kontak.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid mt-8"
              data-reveal
            >
              <IkonWhatsApp size={18} />
              Tanya panitia
            </a>
          </div>
          <div data-reveal className="flex flex-col gap-3">
            {spmb.tanya.map((t) => (
              <details key={t.q} className="group rounded-[14px] border border-line bg-paper">
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-[14px] px-6 py-5 font-semibold text-ink hover:text-brand">
                  <span className="flex items-center gap-3">
                    <MessageCircleQuestion size={20} aria-hidden="true" className="shrink-0 text-brand" />
                    {t.q}
                  </span>
                  <span className="chev grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-2 text-muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </summary>
                <p className="px-6 pb-6 text-ink-2">{t.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Hubungi panitia */}
      <section id="hubungi-panitia" aria-labelledby="judul-hubungi" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead
            id="judul-hubungi"
            judul="Kirim pertanyaan ke panitia"
            teks={<p>Isi formulir, periksa pratinjau, lalu kirim lewat WhatsApp Anda sendiri.</p>}
          />
          <div className="mt-12 rounded-[18px] border border-line bg-paper p-6 md:p-10">
            <WaForm keperluanAwal="SPMB / pendaftaran" />
          </div>
        </div>
      </section>
    </>
  );
}
