"use client";

import { useRef, useState } from "react";
import { CircleCheck } from "lucide-react";
import type { Spmb } from "@/lib/konten/tipe";
import { cx } from "@/lib/format";

type Jalur = Spmb["jalur"][number];

const nomor = (i: number) => String(i + 1).padStart(2, "0");

/** Empat jalur SPMB dalam tab: jadwal jalur, persyaratan, dan urutan kriteria seleksi. */
export function JalurTabs({ jalur }: { jalur: Jalur[] }) {
  const [aktif, setAktif] = useState(0);
  const tabRef = useRef<(HTMLButtonElement | null)[]>([]);

  const pindah = (e: React.KeyboardEvent, i: number) => {
    const arah = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!arah) return;
    e.preventDefault();
    const n = (i + arah + jalur.length) % jalur.length;
    setAktif(n);
    tabRef.current[n]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Jalur pendaftaran" className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0" data-reveal>
        {jalur.map((j, i) => (
          <button
            key={j.nama}
            ref={(el) => {
              tabRef.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-jalur-${i}`}
            aria-selected={aktif === i}
            aria-controls={`panel-jalur-${i}`}
            tabIndex={aktif === i ? 0 : -1}
            onClick={() => setAktif(i)}
            onKeyDown={(e) => pindah(e, i)}
            className={cx(
              "group relative flex min-w-[200px] snap-start flex-col items-start overflow-hidden rounded-[16px] border p-5 text-left transition-colors duration-300 lg:min-w-0",
              aktif === i ? "border-brand-ink bg-brand-ink text-white shadow-panel" : "border-line bg-paper text-ink hover:border-aksen/60",
            )}
          >
            <span className={cx("text-sm font-semibold tabular-nums tracking-[0.2em]", aktif === i ? "text-aksen" : "text-aksen-ink")}>JALUR {nomor(i)}</span>
            <span className="mt-2 text-[1.375rem] font-bold leading-tight">{j.nama}</span>
            <span className={cx("mt-1 text-sm", aktif === i ? "text-white/70" : "text-muted")}>{j.kuota}</span>
            <span
              aria-hidden="true"
              className={cx("absolute inset-x-0 bottom-0 h-[3px] origin-left bg-aksen transition-transform duration-500", aktif === i ? "scale-x-100" : "scale-x-0")}
            />
          </button>
        ))}
      </div>

      {jalur.map((j, i) => (
        <div
          key={j.nama}
          role="tabpanel"
          id={`panel-jalur-${i}`}
          aria-labelledby={`tab-jalur-${i}`}
          hidden={aktif !== i}
          className="mt-6 overflow-hidden rounded-[22px] border border-line bg-paper shadow-card"
        >
          {/* Kepala panel */}
          <div className="grid gap-6 border-b border-line p-6 md:p-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-12">
            <span className="text-[clamp(4rem,3rem+4vw,7rem)] font-extralight leading-[0.8] tracking-[-0.05em] text-aksen tabular-nums" aria-hidden="true">
              {nomor(i)}
            </span>
            <div>
              <h3 className="text-h2">Jalur {j.nama}</h3>
              <p className="mt-3 inline-flex items-center rounded-full border border-aksen/50 bg-aksen-terang/30 px-4 py-1.5 text-sm font-semibold text-aksen-ink">Kuota {j.kuota}</p>
              <p className="mt-4 max-w-[64ch] text-lead text-ink-2">{j.teks}</p>
            </div>
          </div>

          {/* Jadwal jalur */}
          {j.jadwal && j.jadwal.length > 0 && (
            <ol className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4" aria-label={`Jadwal jalur ${j.nama}`}>
              {j.jadwal.map((t, k) => (
                <li key={t.tahap} className="flex flex-col gap-1 bg-paper-2 px-6 py-5 md:px-8">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-ink text-[0.6875rem] text-aksen tabular-nums">{k + 1}</span>
                    {t.tahap}
                  </span>
                  <span className="mt-1 text-[1.0625rem] font-semibold text-ink">{t.waktu}</span>
                </li>
              ))}
            </ol>
          )}

          {/* Persyaratan + kriteria */}
          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            {j.syarat && j.syarat.length > 0 && (
              <div className="p-6 md:p-10">
                <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-aksen-ink">Persyaratan jalur</h4>
                <ul className="mt-6 flex flex-col gap-4">
                  {j.syarat.map((s) => (
                    <li key={s} className="flex gap-3 text-ink-2">
                      <CircleCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {j.kriteria && j.kriteria.length > 0 && (
              <div className="on-dark relative overflow-hidden bg-brand-ink p-6 text-white md:p-10">
                <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-aksen/15 blur-3xl" />
                <h4 className="relative text-xs font-semibold uppercase tracking-[0.22em] text-aksen">Urutan kriteria seleksi</h4>
                <ol className="relative mt-6 flex flex-col gap-5">
                  {j.kriteria.map((k, n) => (
                    <li key={k} className="flex gap-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-aksen/60 text-sm font-semibold text-aksen tabular-nums">{n + 1}</span>
                      <span className="pt-1 text-white/90">{k}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
