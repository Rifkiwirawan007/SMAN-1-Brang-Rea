"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cx } from "@/lib/format";

export type KartuLayanan = { judul: string; teks: string; href: string };

/** Carousel kartu gaya "Investor Relation" Pertamina: geser, panah persegi, kartu aktif hijau. */
export function LayananRail({ kartu }: { kartu: KartuLayanan[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [awal, setAwal] = useState(true);
  const [akhir, setAkhir] = useState(false);

  const cek = useCallback(() => {
    const r = railRef.current;
    if (!r) return;
    setAwal(r.scrollLeft < 8);
    setAkhir(r.scrollLeft + r.clientWidth > r.scrollWidth - 8);
  }, []);

  useEffect(() => {
    cek();
    const r = railRef.current;
    r?.addEventListener("scroll", cek, { passive: true });
    window.addEventListener("resize", cek);
    return () => {
      r?.removeEventListener("scroll", cek);
      window.removeEventListener("resize", cek);
    };
  }, [cek]);

  const geser = (arah: 1 | -1) => {
    const r = railRef.current;
    if (!r) return;
    const kartuPertama = r.querySelector("li");
    const lebar = (kartuPertama?.clientWidth ?? 300) + 24;
    r.scrollBy({ left: arah * lebar, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={railRef}
        className="rail group/rail flex gap-6 overflow-x-auto py-5 pr-[clamp(20px,5vw,64px)]"
        aria-label="Layanan sekolah"
      >
        {kartu.map((k, i) => (
          <li key={k.judul} className="w-[min(78vw,300px)] shrink-0">
            <Link
              href={k.href}
              className={cx(
                "group flex h-full min-h-[340px] flex-col rounded-[10px] p-8 shadow-card transition-colors duration-300 md:p-10",
                i === 0
                  ? "bg-brand text-white group-hover/rail:bg-paper group-hover/rail:text-ink hover:bg-brand! hover:text-white!"
                  : "bg-paper text-ink hover:bg-brand hover:text-white",
              )}
            >
              <h3 className="text-h3 text-current">{k.judul}</h3>
              <span
                aria-hidden="true"
                className={cx(
                  "mt-5 block h-1 w-10 rounded-full transition-colors duration-300",
                  i === 0
                    ? "bg-white group-hover/rail:bg-sun group-hover:bg-white!"
                    : "bg-sun group-hover:bg-white",
                )}
              />
              <p className="mt-6 text-[0.9375rem] leading-relaxed opacity-90">{k.teks}</p>
              <ArrowUpRight size={22} aria-hidden="true" className="mt-auto self-end pt-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-3 lg:ml-36">
        <button type="button" className="btn-square" onClick={() => geser(-1)} disabled={awal} aria-label="Kartu sebelumnya">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button type="button" className="btn-square" onClick={() => geser(1)} disabled={akhir} aria-label="Kartu berikutnya">
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
