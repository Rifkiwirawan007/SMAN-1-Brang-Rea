"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { Agenda } from "@/lib/konten/tipe";
import { apakahIlustrasi } from "@/lib/konten/util";
import type { BeritaTampil } from "@/components/berita/tampil";
import { useLabelContoh } from "@/components/situs/konteks";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { Contoh } from "@/components/ui/contoh";
import { cx } from "@/lib/format";

type AgendaTampil = Agenda & { hari: string; bulan: string; tahun: string; rentang: string };

const TAB = ["Berita", "Pengumuman", "Agenda"] as const;

/** Ruang berita gaya Pertamina: tab bersegmen + grid bento. */
export function KabarTabs({
  berita,
  pengumuman,
  agenda,
}: {
  berita: BeritaTampil[];
  pengumuman: BeritaTampil[];
  agenda: AgendaTampil[];
}) {
  const [tab, setTab] = useState<(typeof TAB)[number]>("Berita");
  const labelContoh = useLabelContoh();

  return (
    <div>
      <div role="tablist" aria-label="Jenis kabar" className="seg" data-reveal>
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

      <div className="mt-8 lg:mt-10">
        <div role="tabpanel" id="panel-Berita" aria-labelledby="tab-Berita" hidden={tab !== "Berita"}>
          <CarouselRail
            ariaLabel="Daftar berita terbaru"
            className="lg:grid lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(0,250px))] lg:gap-4"
          >
            {berita.slice(0, 5).map((b, i) => (
              <li
                key={b.slug}
                className={cx(
                  "w-[min(82vw,320px)] shrink-0 sm:w-[340px] lg:w-auto",
                  i === 0 && "lg:col-span-2 lg:row-span-2",
                )}
              >
                <Link
                  href={`/berita/${b.slug}`}
                  className={cx(
                    "zoom-wrap group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-[10px] bg-brand-ink p-6 text-white sm:min-h-[320px]",
                    i === 0 ? "lg:min-h-[380px] lg:p-8" : "lg:min-h-[250px]",
                  )}
                >
                  {b.gambar && (
                    <Image
                      src={b.gambar}
                      alt=""
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 50vw, 85vw" : "(min-width: 1024px) 25vw, 85vw"}
                      className="-z-0 object-cover"
                      style={{ objectPosition: b.posisiGambar }}
                    />
                  )}
                  <span className="scrim-bottom absolute inset-0" aria-hidden="true" />
                  {b.halaman && <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-ink from-45% to-transparent" aria-hidden="true" />}
                  {labelContoh && b.gambar && apakahIlustrasi(b.gambar) && (
                    <span className="absolute right-3 top-3 z-[2] rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">
                      Foto ilustrasi
                    </span>
                  )}
                  <span className="relative flex flex-col gap-2">
                    <span
                      className={cx(
                        "font-semibold leading-snug text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4",
                        i === 0 ? "text-h3 lg:text-[1.75rem] lg:leading-tight" : "text-[1.0625rem]",
                      )}
                    >
                      {b.judul}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-white/80">
                      {b.tanggalTampil && (
                        <>
                          <CalendarDays size={15} aria-hidden="true" />
                          {b.tanggalTampil}
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      {b.kategori}
                      {b.contoh && <Contoh className="ml-1" />}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </CarouselRail>
        </div>

        <div role="tabpanel" id="panel-Pengumuman" aria-labelledby="tab-Pengumuman" hidden={tab !== "Pengumuman"}>
          <CarouselRail
            ariaLabel="Daftar pengumuman"
            className="lg:block lg:divide-y lg:divide-line lg:border-y lg:border-line"
          >
            {pengumuman.map((p) => (
              <li
                key={p.slug}
                className="w-[min(82vw,320px)] shrink-0 sm:w-[360px] lg:w-auto"
              >
                <Link
                  href={`/berita/${p.slug}`}
                  className="group flex h-full flex-col justify-between gap-3 rounded-[12px] border border-line bg-paper p-6 lg:grid lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] lg:items-start lg:gap-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-7"
                >
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <CalendarDays size={16} aria-hidden="true" className="text-brand" />
                    {p.tanggalTampil}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-h3 group-hover:text-brand">{p.judul}</span>
                      {p.contoh && <Contoh />}
                    </span>
                    <span className="mt-2 line-clamp-3 block max-w-[70ch] text-ink-2 lg:line-clamp-none">{p.ringkasan}</span>
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="self-end text-muted transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand lg:self-auto"
                  />
                </Link>
              </li>
            ))}
          </CarouselRail>
        </div>

        <div role="tabpanel" id="panel-Agenda" aria-labelledby="tab-Agenda" hidden={tab !== "Agenda"}>
          <CarouselRail
            ariaLabel="Daftar agenda terdekat"
            className="lg:grid lg:grid-cols-4 lg:gap-4"
          >
            {agenda.slice(0, 4).map((a) => (
              <li
                key={a.id}
                className="flex w-[min(78vw,280px)] shrink-0 flex-col rounded-[10px] border border-line bg-paper p-6 sm:w-[300px] lg:w-auto lg:p-7"
              >
                <span className="flex items-baseline gap-2 text-brand">
                  <span className="text-[2.75rem] font-light leading-none tracking-[-0.04em] lg:text-[3rem]">{a.hari}</span>
                  <span className="text-sm font-semibold">
                    {a.bulan} {a.tahun}
                  </span>
                </span>
                <span className="mt-5 text-h3 text-ink">{a.judul}</span>
                <span className="mt-4 flex flex-col gap-1.5 text-sm text-ink-2">
                  <span className="flex items-center gap-2">
                    <Clock size={15} aria-hidden="true" className="shrink-0 text-muted" /> {a.rentang}, {a.waktu}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={15} aria-hidden="true" className="shrink-0 text-muted" /> {a.tempat}
                  </span>
                </span>
                {a.contoh && <Contoh className="mt-5 self-start" />}
              </li>
            ))}
          </CarouselRail>
        </div>
      </div>
    </div>
  );
}
