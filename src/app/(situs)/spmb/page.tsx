import type { Metadata } from "next";
import { CircleCheck, FileText, MessageCircleQuestion } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SubNav } from "@/components/ui/sub-nav";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { CatatanContoh, Contoh } from "@/components/ui/contoh";
import { IkonWhatsApp } from "@/components/ui/icons";
import { WaForm } from "@/components/kontak/wa-form";
import { ambilSekolah, ambilSpmb } from "@/lib/konten/baca";
import { waLink } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const spmb = await ambilSpmb();
  return {
    title: `SPMB ${spmb.tahunAjaran}`,
    description: "Jalur, jadwal, syarat, dan alur Sistem Penerimaan Murid Baru SMA Negeri 1 Brang Rea.",
  };
}

const BAGIAN = [
  { id: "jalur", label: "Jalur" },
  { id: "jadwal", label: "Jadwal" },
  { id: "syarat", label: "Syarat" },
  { id: "alur", label: "Alur" },
  { id: "tanya", label: "Tanya jawab" },
  { id: "hubungi-panitia", label: "Hubungi panitia" },
];

export default async function Spmb() {
  const [sekolah, spmb] = await Promise.all([ambilSekolah(), ambilSpmb()]);
  return (
    <>
      <PageHero
        judul={`SPMB ${spmb.tahunAjaran}`}
        teks="Sistem Penerimaan Murid Baru SMA Negeri 1 Brang Rea."
        gambar="/images/sekolah/upacara-pemimpin.jpg"
        alt="Siswa pemimpin upacara berselempang hijau"
        posisiGambar="center 30%"
        jejak={[{ label: "Beranda", href: "/" }, { label: "SPMB" }]}
        tambahan={
          <>
            <span className="inline-flex items-center rounded-full border border-white/50 px-4 py-1.5 text-sm font-medium text-white">
              Status: {spmb.status}
            </span>
            {spmb.contoh && <Contoh teks="Seluruh info contoh" />}
          </>
        }
      />
      <SubNav items={BAGIAN} />

      {/* Jalur */}
      <section id="jalur" aria-labelledby="judul-jalur" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-jalur"
            judul="Empat jalur pendaftaran"
            teks={<p>Pilih jalur yang sesuai dengan kondisi calon murid. Kuota mengikuti aturan SPMB jenjang SMA dan petunjuk teknis Provinsi NTB.</p>}
          />
          <CarouselRail
            ariaLabel="Jalur pendaftaran SPMB"
            wrapClassName="mt-10 lg:mt-14"
            className="lg:grid lg:grid-cols-4 lg:gap-px lg:overflow-hidden lg:rounded-[14px] lg:border lg:border-line lg:bg-line"
          >
            {spmb.jalur.map((j, i) => (
              <li
                key={j.nama}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="flex w-[min(80vw,300px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[320px] sm:p-8 lg:w-auto lg:rounded-none lg:border-0"
              >
                <h3 className="text-h2">{j.nama}</h3>
                <p className="mt-2 text-sm font-semibold text-brand">Kuota {j.kuota}</p>
                <span aria-hidden="true" className="mt-5 block h-1 w-10 rounded-full bg-sun" />
                <p className="mt-5 text-[0.9375rem] text-ink-2">{j.teks}</p>
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Jadwal */}
      <section id="jadwal" aria-labelledby="judul-jadwal-spmb" className="section-y bg-paper-2">
        <div className="container-site">
          <SectionHead id="judul-jadwal-spmb" judul="Jadwal" teks={<p>Perkiraan tahapan SPMB. Tanggal pasti diumumkan setelah juknis resmi terbit.</p>} />
          {spmb.contoh ? <CatatanContoh className="mt-8">Tanggal di bawah ini contoh.</CatatanContoh> : null}
          <CarouselRail
            sebagai="ol"
            ariaLabel="Jadwal tahapan SPMB"
            wrapClassName="mt-8 lg:mt-10"
            className="lg:grid lg:grid-cols-6 lg:gap-4"
          >
            {spmb.jadwal.map((j, i) => (
              <li
                key={j.tahap}
                data-reveal
                style={{ "--d": i % 3 } as React.CSSProperties}
                className="flex w-[min(76vw,260px)] shrink-0 flex-col rounded-[14px] border border-line bg-paper p-6 sm:w-[280px] lg:w-auto"
              >
                <span className="text-[2.5rem] font-light leading-none tabular-nums text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-6 font-semibold text-ink">{j.tahap}</span>
                <span className="mt-1 text-sm text-ink-2">{j.waktu}</span>
                {j.keterangan ? <span className="mt-2 text-xs leading-relaxed text-muted">{j.keterangan}</span> : null}
              </li>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Syarat */}
      <section id="syarat" aria-labelledby="judul-syarat" className="section-y">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="judul-syarat" data-reveal className="text-h2">
              Dokumen yang disiapkan
            </h2>
            <p data-reveal className="mt-6 max-w-[42ch] text-lead text-ink-2">
              Siapkan pindaian dokumen dalam format PDF atau JPG sebelum mendaftar agar proses unggah lancar.
            </p>
          </div>
          <ul data-reveal className="flex flex-col divide-y divide-line rounded-[14px] border border-line">
            {spmb.syarat.map((s) => (
              <li key={s} className="flex gap-4 px-6 py-4 text-ink">
                <CircleCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Alur */}
      <section id="alur" aria-labelledby="judul-alur" className="on-dark section-y bg-brand text-white">
        <div className="container-site">
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
                  <span className="tabular-nums text-white/60">{i + 1}.</span> {a.judul}
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
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <FileText size={16} aria-hidden="true" />
            Tautan portal SPMB resmi Provinsi NTB akan dicantumkan di sini setelah diumumkan.
          </p>
        </div>
      </section>
    </>
  );
}
