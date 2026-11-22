"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type BarisIdentitas = { label: string; nilai: string; lebar?: boolean };

/** Jumlah baris yang tampil dulu di HP; sisanya lewat tombol "Lihat semua". */
const AWAL_HP = 6;

/**
 * Tabel identitas sekolah. Desktop: dua kolom penuh seperti biasa.
 * HP: kotak kecil dua kolom (isian panjang memakai satu baris penuh; urutan data dibuat berpasangan
 * supaya tidak ada sel kosong) dan hanya 6 data pertama,
 * sisanya dibuka lewat tombol, supaya tidak memakan banyak gulir.
 */
export function IdentitasRingkas({ data }: { data: BarisIdentitas[] }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <dl data-reveal className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line md:mt-12 md:gap-0 md:bg-paper">
        {data.map((b, i) => (
          <div
            key={b.label}
            className={[
              "flex min-w-0 flex-col gap-0.5 bg-paper px-3.5 py-2.5 sm:px-6 md:col-span-1 md:grid md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] md:gap-4 md:border-b md:border-line md:py-4 md:odd:border-r",
              b.lebar ? "col-span-2" : "",
              !buka && i >= AWAL_HP ? "max-md:hidden" : "",
            ].join(" ")}
          >
            <dt className="text-[11px] font-medium text-muted md:text-sm md:font-normal">{b.label}</dt>
            <dd className="min-w-0 break-words text-[13.5px] leading-snug font-medium text-ink md:text-[0.9375rem]">{b.nilai}</dd>
          </div>
        ))}
      </dl>
      {data.length > AWAL_HP && (
        <button
          type="button"
          onClick={() => setBuka((x) => !x)}
          aria-expanded={buka}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-brand md:hidden"
        >
          {buka ? "Tampilkan lebih sedikit" : `Lihat semua data (${data.length})`}
          <ChevronDown size={17} aria-hidden="true" className={buka ? "rotate-180" : ""} />
        </button>
      )}
    </>
  );
}
