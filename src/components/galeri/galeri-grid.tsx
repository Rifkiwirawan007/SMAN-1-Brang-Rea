"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { FotoGaleri } from "@/lib/konten/tipe";
import { apakahIlustrasi } from "@/lib/konten/util";
import { useLabelContoh } from "@/components/situs/konteks";

const PER_HALAMAN = 12;

/** Galeri: saring kategori, kisi bata, lightbox dengan keyboard. */
export function GaleriGrid({ foto, kategori }: { foto: FotoGaleri[]; kategori: string[] }) {
  const labelContoh = useLabelContoh();
  const [pilih, setPilih] = useState("Semua");
  const [jumlah, setJumlah] = useState(PER_HALAMAN);
  const [buka, setBuka] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const hasil = useMemo(() => foto.filter((f) => pilih === "Semua" || f.kategori === pilih), [foto, pilih]);
  const tampil = hasil.slice(0, jumlah);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (buka !== null && !d.open) d.showModal();
    if (buka === null && d.open) d.close();
  }, [buka]);

  const geser = useCallback(
    (arah: 1 | -1) => setBuka((i) => (i === null ? i : (i + arah + hasil.length) % hasil.length)),
    [hasil.length],
  );

  useEffect(() => {
    if (buka === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") geser(1);
      if (e.key === "ArrowLeft") geser(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buka, geser]);

  const aktif = buka !== null ? hasil[buka] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Saring kategori foto">
        {(["Semua", ...kategori] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={pilih === k}
            onClick={() => {
              setPilih(k);
              setJumlah(PER_HALAMAN);
            }}
            className="chip-filter"
          >
            {k}
          </button>
        ))}
      </div>

      <ul className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {tampil.map((f, i) => (
          <li key={f.id} className="mb-5 break-inside-avoid">
            <button
              type="button"
              onClick={() => setBuka(i)}
              className="zoom-wrap group relative block w-full overflow-hidden rounded-[10px] bg-paper-3 text-left"
              aria-label={`Perbesar foto: ${f.judul}`}
            >
              <Image
                src={f.src}
                alt={f.judul}
                width={f.w}
                height={f.h}
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
              <span className="scrim-bottom absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex flex-col">
                  <span className="text-[0.8125rem] text-white/80">{f.kategori}</span>
                  <span className="font-semibold leading-snug">{f.judul}</span>
                </span>
                <ZoomIn size={20} aria-hidden="true" className="shrink-0" />
              </span>
              {labelContoh && apakahIlustrasi(f.src) && (
                <span className="absolute right-3 top-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">
                  Foto ilustrasi
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {jumlah < hasil.length && (
        <div className="mt-10 flex justify-center">
          <button type="button" className="btn-pill" onClick={() => setJumlah((j) => j + PER_HALAMAN)}>
            Muat lebih banyak foto
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="lightbox on-dark"
        aria-label={aktif ? aktif.judul : "Foto"}
        onClose={() => setBuka(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setBuka(null);
        }}
      >
        {aktif && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <p className="min-w-0 text-sm text-white/80">
                {buka! + 1} / {hasil.length}
                <span className="ml-3 font-semibold text-white">{aktif.judul}</span>
              </p>
              <button
                type="button"
                onClick={() => setBuka(null)}
                className="btn-round h-11 w-11 shrink-0 border-white/40 text-white hover:bg-white hover:text-brand-ink"
                aria-label="Tutup"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && setBuka(null)}>
              <Image src={aktif.src} alt={aktif.judul} fill sizes="100vw" className="object-contain p-4 md:p-10" />
              {labelContoh && apakahIlustrasi(aktif.src) && (
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-scrim/70 px-3 py-1 text-xs text-white">
                  Foto ilustrasi
                </span>
              )}
            </div>
            <div className="flex justify-center gap-3 pb-6">
              <button type="button" onClick={() => geser(-1)} className="btn-round border-white/40 text-white hover:bg-white hover:text-brand-ink" aria-label="Foto sebelumnya">
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => geser(1)} className="btn-round border-white/40 text-white hover:bg-white hover:text-brand-ink" aria-label="Foto berikutnya">
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
