"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Ekskul, PosterPrestasi } from "@/lib/konten/tipe";
import { apakahIlustrasi } from "@/lib/konten/util";
import { useLabelContoh } from "@/components/situs/konteks";
import { Contoh } from "@/components/ui/contoh";
import { IKON_EKSKUL } from "@/components/ui/icons";

const TAB = ["Ekstrakurikuler", "Prestasi"] as const;

/** Kartu foto vertikal gaya "Our Group Businesses" Pertamina. */
export function EkskulTabs({ ekskul, prestasi }: { ekskul: Ekskul[]; prestasi: PosterPrestasi[] }) {
  const [tab, setTab] = useState<(typeof TAB)[number]>("Ekstrakurikuler");
  const labelContoh = useLabelContoh();
  // Yang punya foto tampil dulu; sisanya memakai panel hijau berikon sampai fotonya tersedia.
  const kartu = [...ekskul].sort((a, b) => Number(!!b.gambar) - Number(!!a.gambar)).slice(0, 5);

  return (
    <div>
      <div role="tablist" aria-label="Kegiatan siswa" className="seg" data-reveal>
        {TAB.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className="seg-btn"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div role="tabpanel" id="panel-Ekstrakurikuler" aria-labelledby="tab-Ekstrakurikuler" hidden={tab !== "Ekstrakurikuler"}>
          <ul className="rail -mx-[clamp(20px,5vw,64px)] flex gap-4 overflow-x-auto px-[clamp(20px,5vw,64px)] pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {kartu.map((e) => {
              const Ikon = IKON_EKSKUL[e.ikon] ?? IKON_EKSKUL.buku;
              return (
              <li key={e.id} className="w-[min(64vw,240px)] shrink-0 lg:w-auto">
                <Link
                  href="/kesiswaan#ekstrakurikuler"
                  className="zoom-wrap group relative block aspect-[4/5] overflow-hidden rounded-[10px] bg-brand-ink text-white"
                >
                  {e.gambar ? (
                    <>
                      <Image
                        src={e.gambar}
                        alt={`Kegiatan ${e.nama}`}
                        fill
                        sizes="(min-width: 1024px) 20vw, 64vw"
                        className="object-cover" style={{ objectPosition: e.posisiGambar }}
                      />
                      <span className="scrim-top absolute inset-0" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="absolute inset-0 grid place-items-center bg-brand" aria-hidden="true">
                      <Ikon size={72} strokeWidth={1.25} className="text-white/35 transition-transform duration-500 group-hover:scale-110" />
                    </span>
                  )}
                  <span className="absolute inset-x-0 top-0 flex flex-col gap-1 p-6">
                    <span className="text-[1.125rem] font-semibold leading-snug">{e.nama}</span>
                    <span className="text-[0.8125rem] text-white/80">{e.kategori}</span>
                  </span>
                  {labelContoh && e.gambar && apakahIlustrasi(e.gambar) && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5">
                      Foto ilustrasi
                    </span>
                  )}
                </Link>
              </li>
              );
            })}
          </ul>
          {labelContoh && ekskul.some((e) => e.contoh) ? (
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Contoh /> Daftar ekstrakurikuler dan jadwalnya masih contoh.
            </p>
          ) : null}
        </div>

        <div role="tabpanel" id="panel-Prestasi" aria-labelledby="tab-Prestasi" hidden={tab !== "Prestasi"}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prestasi.map((p) => (
              <li key={p.id}>
                <Link href="/kesiswaan#prestasi" className="zoom-wrap group flex h-full flex-col overflow-hidden rounded-[10px] border border-line bg-paper">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                    <Image
                      src={p.src}
                      alt={p.judul}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-sm text-muted">{p.ket}</span>
                    <span className="mt-1 font-semibold leading-snug text-ink">{p.judul}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/kesiswaan#prestasi" className="btn-pill mt-8">
            Semua prestasi
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
