"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import type { Ekskul, KategoriEkskul } from "@/lib/konten/tipe";
import { apakahIlustrasi } from "@/lib/konten/util";
import { useLabelContoh } from "@/components/situs/konteks";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { Contoh } from "@/components/ui/contoh";
import { IKON_EKSKUL } from "@/components/ui/icons";

/** Kisi ekstrakurikuler dengan saringan kategori (carousel di HP/tablet, grid di desktop). */
export function EkskulGrid({ daftar, kategori }: { daftar: Ekskul[]; kategori: readonly KategoriEkskul[] }) {
  const labelContoh = useLabelContoh();
  const [pilih, setPilih] = useState<KategoriEkskul | "Semua">("Semua");
  const hasil = useMemo(() => daftar.filter((e) => pilih === "Semua" || e.kategori === pilih), [daftar, pilih]);

  return (
    <div>
      <div
        className="rail -mx-[clamp(20px,5vw,64px)] flex gap-2 overflow-x-auto px-[clamp(20px,5vw,64px)] pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label="Saring ekstrakurikuler"
      >
        {(["Semua", ...kategori] as const).map((k) => (
          <button key={k} type="button" aria-pressed={pilih === k} onClick={() => setPilih(k)} className="chip-filter">
            {k}
          </button>
        ))}
      </div>
      <CarouselRail
        ariaLabel="Daftar kegiatan ekstrakurikuler"
        wrapClassName="mt-8 sm:mt-10"
        className="lg:grid lg:grid-cols-3 lg:gap-5"
      >
        {hasil.map((e) => {
          const Ikon = IKON_EKSKUL[e.ikon] ?? IKON_EKSKUL.buku;
          return (
            <li
              key={e.id}
              className="flex w-[min(82vw,320px)] shrink-0 flex-col overflow-hidden rounded-[14px] border border-line bg-paper sm:w-[340px] lg:w-auto"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-brand">
                {e.gambar ? (
                  <>
                    <Image src={e.gambar} alt={`Kegiatan ${e.nama}`} fill sizes="(min-width: 1024px) 400px, 82vw" className="object-cover" style={{ objectPosition: e.posisiGambar }} />
                    {labelContoh && apakahIlustrasi(e.gambar) && (
                      <span className="absolute right-3 top-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">
                        Foto ilustrasi
                      </span>
                    )}
                  </>
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-white/90">
                    <Ikon size={56} strokeWidth={1.3} aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span className="font-semibold text-brand">{e.kategori}</span>
                  {e.wajib && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-ink">Wajib kelas X</span>}
                </p>
                <h3 className="mt-2 text-h3">{e.nama}</h3>
                <p className="mt-3 flex-1 text-[0.9375rem] text-ink-2">{e.deskripsi}</p>
                <p className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm text-ink-2">
                  <CalendarClock size={16} aria-hidden="true" className="text-brand" />
                  {e.jadwal}
                  {e.contoh && <Contoh className="ml-auto" />}
                </p>
              </div>
            </li>
          );
        })}
      </CarouselRail>
    </div>
  );
}
