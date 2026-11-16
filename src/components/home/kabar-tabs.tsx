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
          <CarouselRail ariaLabel="Daftar berita terbaru" className="lg:grid lg:grid-cols-20 lg:gap-6">
            {berita.slice(0, 4).map((b, i) => {
              // Baris 1: lebar-sempit, baris 2: sempit-lebar.
              const lebar = i % 4 === 0 || i % 4 === 3;
              return (
                <li key={b.slug} className={cx("w-[min(86vw,360px)] shrink-0 sm:w-[440px] lg:w-auto", lebar ? "lg:col-span-11" : "lg:col-span-9")}>
                  <Link
                    href={`/berita/${b.slug}`}
                    className="zoom-wrap group relative flex h-[340px] flex-col justify-end overflow-hidden rounded-[22px] rounded-br-none bg-brand-ink p-6 pr-[104px] text-white md:p-8 md:pr-[112px] lg:h-[380px]"
                  >
                    {b.gambar && (
                      <Image
                        src={b.gambar}
                        alt=""
                        fill
                        sizes={lebar ? "(min-width: 1024px) 55vw, 86vw" : "(min-width: 1024px) 45vw, 86vw"}
                        className="object-cover"
                        style={{ objectPosition: b.posisiGambar }}
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/45 via-55% to-transparent" aria-hidden="true" />
                    {labelContoh && b.gambar && apakahIlustrasi(b.gambar) && (
                      <span className="absolute right-3 top-3 z-[2] rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">Foto ilustrasi</span>
                    )}
                    <span className="relative flex flex-col gap-3">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/85">
                        <span className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">{b.kategori}</span>
                        {b.tanggalTampil}
                        {b.contoh && <Contoh />}
                      </span>
                      <span className="line-clamp-4 text-[1.25rem] font-extrabold leading-snug text-white lg:text-[1.5rem]">{b.judul}</span>
                    </span>
                    {/* Sudut kanan bawah "digigit": lekukan warna latar + tombol panah bulat. */}
                    <span className="kartu-sorotan-takik" aria-hidden="true">
                      <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-brand text-white transition-colors duration-200 group-hover:bg-brand-deep">
                        <ArrowUpRight size={28} strokeWidth={2.25} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
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
