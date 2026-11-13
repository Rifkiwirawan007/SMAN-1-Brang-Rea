import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Spmb } from "@/lib/konten/tipe";
import { Contoh } from "@/components/ui/contoh";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PitaJalan } from "@/components/home/pita-jalan";

type Tahap = Spmb["jadwal"][number];

/** 2 tahap per baris: alur berkelok lebih panjang ke bawah. */
const PER_BARIS = 2;
/** Lama satu langkah animasi pita (detik). Belokan dihitung satu langkah tersendiri. */
const LANGKAH = 0.45;
const jedaSeg = (i: number) => (i + Math.floor(i / PER_BARIS)) * LANGKAH;

/** Warna segmen bergantian: hijau sekolah dan hijau tua. */
const warna = (i: number) => (i % 2 === 0 ? "var(--color-brand)" : "var(--color-brand-ink)");

function bagi<T>(daftar: T[], n: number) {
  const hasil: T[][] = [];
  for (let i = 0; i < daftar.length; i += n) hasil.push(daftar.slice(i, i + n));
  return hasil;
}

function Label({ no, t, w, jeda }: { no: number; t: Tahap; w: string; jeda: number }) {
  return (
    <div className="tl-label" style={{ "--jeda": `${jeda}s` } as React.CSSProperties}>
      <div className="tl-kurung" aria-hidden="true" />
      <p className="tl-kartu">
        <span className="tl-nomor" style={{ background: w }}>
          {String(no).padStart(2, "0")}
        </span>
        <span className="tl-tahap">{t.tahap}</span>
      </p>
      {t.keterangan ? <p className="tl-ket">{t.keterangan}</p> : null}
    </div>
  );
}

/**
 * Timeline SPMB berkelok (gaya pita), 3 tahap per baris, berbelok di ujung baris.
 * Di HP berubah jadi daftar vertikal.
 */
export function TimelineSpmb({ spmb }: { spmb: Spmb }) {
  const jadwal = spmb.jadwal;
  if (jadwal.length === 0) return null;
  const baris = bagi(jadwal, PER_BARIS);

  return (
    <section
      aria-labelledby="judul-timeline-spmb"
      className="section-y overflow-hidden"
      // Menyambung langsung dari seksi Sambutan (sama-sama putih), jadi jarak atas dirapatkan.
      style={{ paddingTop: "clamp(8px, 2vw, 32px)" }}
    >
      <div className="container-site">
        <div data-reveal className="flex flex-wrap items-center gap-3">
          <p className="tl-kicker">Timeline SPMB {spmb.tahunAjaran}</p>
          {spmb.contoh && <Contoh teks="Jadwal contoh" />}
        </div>
        <h2 id="judul-timeline-spmb" data-reveal style={{ "--d": 1 } as React.CSSProperties} className="text-h2 mt-4 max-w-[24ch]">
          <span className="text-brand">Jadwal tercatat,</span> langkah jadi siswa Barema makin dekat
        </h2>

        {/* Desktop: pita berkelok */}
        <PitaJalan className={`tl-pita mt-14 hidden lg:block ${baris.length > 2 ? "ada-kiri" : ""}`}>
          {baris.map((isi, b) => {
            const balik = b % 2 === 1;
            const adaBerikut = b < baris.length - 1;
            const iTerakhir = b * PER_BARIS + isi.length - 1;
            return (
              <div key={b} className="tl-baris">
                <ol start={b * PER_BARIS + 1} className="tl-grid" aria-label={b === 0 ? `Tahapan SPMB ${spmb.tahunAjaran}` : undefined}>
                  {isi.map((t, j) => {
                    const i = b * PER_BARIS + j;
                    // Ujung baris yang tersambung ke belokan dibuat rata; selain itu runcing.
                    const rata = j === isi.length - 1 && adaBerikut;
                    return (
                      <li key={i} className="tl-sel" style={{ gridColumn: balik ? PER_BARIS - j : j + 1 }}>
                        <Label no={i + 1} t={t} w={warna(i)} jeda={jedaSeg(i) + 0.3} />
                        <div
                          className={`tl-seg ${balik ? "kiri" : "kanan"} ${rata ? "" : "panah"} ${j > 0 ? "takik" : ""}`}
                          style={{ background: warna(i), "--jeda": `${jedaSeg(i)}s` } as React.CSSProperties}
                        >
                          <span>{t.waktu}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {adaBerikut ? (
                  <div className={`tl-belok ${balik ? "kiri" : "kanan"}`} style={{ borderColor: warna(iTerakhir), "--jeda": `${jedaSeg(iTerakhir) + LANGKAH}s` } as React.CSSProperties} aria-hidden="true" />
                ) : null}
              </div>
            );
          })}
        </PitaJalan>

        {/* HP & tablet: carousel horizontal tahapan */}
        <CarouselRail
          sebagai="ol"
          ariaLabel={`Tahapan SPMB ${spmb.tahunAjaran}`}
          wrapClassName="mt-8 lg:hidden"
          batas="selalu"
        >
          {jadwal.map((t, i) => (
            <li
              key={i}
              data-reveal
              style={{ "--d": i } as React.CSSProperties}
              className="w-[min(80vw,300px)] shrink-0 sm:w-[320px]"
            >
              <div className="flex h-full flex-col rounded-[14px] border border-line bg-paper p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="tl-nomor shrink-0" style={{ background: warna(i) }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
                    {t.waktu}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold leading-snug text-ink">{t.tahap}</p>
                {t.keterangan ? <p className="mt-2 text-sm leading-relaxed text-ink-2">{t.keterangan}</p> : null}
              </div>
            </li>
          ))}
        </CarouselRail>

        <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3 lg:mt-14">
          <Link href="/spmb" className="btn-pill">
            Info lengkap SPMB
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
