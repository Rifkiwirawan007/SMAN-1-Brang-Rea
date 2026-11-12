"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import type { Ekskul, KategoriEkskul } from "@/data/kesiswaan";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { Contoh } from "@/components/ui/contoh";
import { IKON_EKSKUL } from "@/components/ui/icons";
import { apakahIlustrasi } from "@/data/foto";

/** Kisi ekstrakurikuler dengan saringan kategori. */
export function EkskulGrid({ daftar, kategori }: { daftar: Ekskul[]; kategori: KategoriEkskul[] }) {
  const [pilih, setPilih] = useState<KategoriEkskul | "Semua">("Semua");
  const hasil = useMemo(() => daftar.filter((e) => pilih === "Semua" || e.kategori === pilih), [daftar, pilih]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Saring ekstrakurikuler">
        {(["Semua", ...kategori] as const).map((k) => (
          <button key={k} type="button" aria-pressed={pilih === k} onClick={() => setPilih(k)} className="chip-filter">
            {k}
          </button>
        ))}
      </div>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hasil.map((e) => {
          const Ikon = IKON_EKSKUL[e.ikon];
          return (
            <li key={e.nama} className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-paper">
              <div className="relative aspect-[16/9] overflow-hidden bg-brand">
                {e.gambar ? (
                  <>
                    <Image src={e.gambar} alt={`Kegiatan ${e.nama}`} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    {TAMPILKAN_LABEL_CONTOH && apakahIlustrasi(e.gambar) && (
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
              <div className="flex flex-1 flex-col p-6">
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
      </ul>
    </div>
  );
}
