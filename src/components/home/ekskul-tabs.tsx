"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Award } from "lucide-react";
import type { Ekskul, Prestasi } from "@/data/kesiswaan";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { apakahIlustrasi } from "@/data/foto";
import { Contoh } from "@/components/ui/contoh";
import { IKON_EKSKUL } from "@/components/ui/icons";

const TAB = ["Ekstrakurikuler", "Prestasi"] as const;

/** Kartu foto vertikal gaya "Our Group Businesses" Pertamina. */
export function EkskulTabs({ ekskul, prestasi }: { ekskul: Ekskul[]; prestasi: Prestasi[] }) {
  const [tab, setTab] = useState<(typeof TAB)[number]>("Ekstrakurikuler");
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
              const Ikon = IKON_EKSKUL[e.ikon];
              return (
              <li key={e.nama} className="w-[min(64vw,240px)] shrink-0 lg:w-auto">
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
                        className="object-cover"
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
                  {TAMPILKAN_LABEL_CONTOH && e.gambar && apakahIlustrasi(e.gambar) && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5">
                      Foto ilustrasi
                    </span>
                  )}
                </Link>
              </li>
              );
            })}
          </ul>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Contoh /> Daftar ekstrakurikuler dan jadwalnya masih contoh.
          </p>
        </div>

        <div role="tabpanel" id="panel-Prestasi" aria-labelledby="tab-Prestasi" hidden={tab !== "Prestasi"}>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prestasi.map((p) => (
              <li key={p.judul} className="flex gap-5 rounded-[10px] border border-line bg-paper p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Award size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">
                    {p.tahun}, tingkat {p.tingkat.toLowerCase()}
                  </span>
                  <span className="mt-1 block font-semibold leading-snug text-ink">{p.judul}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
                    {p.bidang}
                    {p.contoh && <Contoh />}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
