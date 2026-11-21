"use client";

import { useEffect, useRef, useState } from "react";
import type { Spmb } from "@/lib/konten/tipe";
import { cx } from "@/lib/format";

type Tahap = Spmb["jadwal"][number];

/**
 * Jadwal SPMB bergaya garis hijau vertikal: garis "tumbuh" ke bawah mengikuti guliran,
 * titik tahap menyala saat dilewati, kartu muncul selang-seling kiri-kanan (HP: semua di kanan garis).
 * Ringan: satu listener scroll + requestAnimationFrame, hanya mengubah transform.
 */
export function GarisJadwal({ jadwal }: { jadwal: Tahap[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const isiRef = useRef<HTMLSpanElement>(null);
  const [nyala, setNyala] = useState(-1);
  const [tampil, setTampil] = useState<boolean[]>(() => jadwal.map(() => false));

  useEffect(() => {
    const ol = ref.current;
    const isi = isiRef.current;
    if (!ol || !isi) return;
    const titik = Array.from(ol.querySelectorAll<HTMLElement>("[data-titik]"));
    const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const hitung = () => {
      raf = 0;
      const r = ol.getBoundingClientRect();
      // Ujung garis mengikuti titik 60% tinggi layar.
      const batas = window.innerHeight * 0.6;
      const p = kurangGerak ? 1 : Math.min(Math.max((batas - r.top) / r.height, 0), 1);
      isi.style.transform = `scaleY(${p})`;
      let n = -1;
      titik.forEach((t, i) => {
        if (kurangGerak || t.getBoundingClientRect().top + t.offsetHeight / 2 <= batas) n = i;
      });
      setNyala(n);
    };
    const jadwalkan = () => {
      if (!raf) raf = requestAnimationFrame(hitung);
    };

    const io = new IntersectionObserver(
      (entri) => {
        setTampil((lama) => {
          const baru = [...lama];
          let ubah = false;
          entri.forEach((e) => {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (e.isIntersecting && !baru[i]) {
              baru[i] = true;
              ubah = true;
            }
          });
          return ubah ? baru : lama;
        });
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
    );
    ol.querySelectorAll("[data-kartu]").forEach((el) => io.observe(el));

    hitung();
    window.addEventListener("scroll", jadwalkan, { passive: true });
    window.addEventListener("resize", jadwalkan);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", jadwalkan);
      window.removeEventListener("resize", jadwalkan);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [jadwal.length]);

  return (
    <ol ref={ref} className="garis-jadwal relative mx-auto max-w-[1040px]" aria-label="Linimasa SPMB">
      {/* Rel garis: abu tipis + isian hijau yang tumbuh */}
      <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-0 w-[2px] rounded-full bg-white/20 md:left-1/2 md:-translate-x-1/2">
        <span ref={isiRef} style={{ transform: "scaleY(0)" }} className="block h-full w-full origin-top rounded-full bg-brand" />
      </span>

      {jadwal.map((t, i) => {
        const kiri = i % 2 === 0;
        const aktif = i <= nyala;
        return (
          <li
            key={t.tahap}
            // Desktop: kartu kiri-kanan saling tumpang (zig-zag) supaya tidak ada ruang kosong panjang.
            className={cx("relative grid grid-cols-[32px_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:gap-x-0 md:pb-8", i > 0 && "md:-mt-28")}
          >
            {/* Titik */}
            <span
              data-titik
              aria-hidden="true"
              className={cx(
                "relative z-[1] col-start-1 row-start-1 mt-6 grid h-[32px] w-[32px] place-items-center rounded-full border-2 bg-paper transition-[border-color,box-shadow] duration-500 md:col-start-2 md:mx-auto",
                aktif ? "border-brand shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-brand)_18%,transparent)]" : "border-line-2",
              )}
            >
              <span className={cx("h-3 w-3 rounded-full transition-[background-color,transform] duration-500", aktif ? "scale-100 bg-brand" : "scale-50 bg-line-2")} />
            </span>

            {/* Kartu */}
            <div
              data-kartu
              data-i={i}
              className={cx(
                "col-start-2 row-start-1 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,0.84,0.24,1)]",
                kiri ? "md:col-start-1 md:pr-10 md:text-right" : "md:col-start-3 md:pl-10",
                tampil[i] ? "translate-x-0 opacity-100" : cx("translate-y-6 opacity-0", kiri ? "md:-translate-x-10 md:translate-y-0" : "md:translate-x-10 md:translate-y-0"),
              )}
            >
              <div
                className={cx(
                  "relative overflow-hidden rounded-[20px] border bg-paper p-6 transition-[border-color,box-shadow] duration-500 md:p-7",
                  aktif ? "border-brand/50 shadow-card" : "border-line",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute top-0 h-[3px] w-full bg-brand transition-transform duration-700",
                    kiri ? "right-0 origin-right md:origin-right" : "left-0 origin-left",
                    aktif ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tahap {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[1.25rem] font-bold leading-snug text-ink">{t.tahap}</h3>
                <p className={cx("mt-3 inline-flex rounded-full px-3.5 py-1 text-sm font-semibold", aktif ? "bg-brand text-white" : "bg-paper-2 text-brand")}>{t.waktu}</p>
                {t.keterangan ? <p className="mt-3 text-sm leading-relaxed text-muted">{t.keterangan}</p> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
