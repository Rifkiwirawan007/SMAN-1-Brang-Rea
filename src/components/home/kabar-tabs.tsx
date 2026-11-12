"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { Agenda, Berita } from "@/data/berita";
import { apakahIlustrasi } from "@/data/foto";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { Contoh } from "@/components/ui/contoh";
import { cx } from "@/lib/format";

type BeritaTampil = Berita & { tanggalTampil: string };
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

      <div className="mt-10">
        <div role="tabpanel" id="panel-Berita" aria-labelledby="tab-Berita" hidden={tab !== "Berita"}>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(0,250px))]">
            {berita.slice(0, 5).map((b, i) => (
              <li key={b.slug} className={cx(i === 0 && "md:col-span-2 lg:row-span-2")}>
                <Link
                  href={`/berita/${b.slug}`}
                  className={cx(
                    "zoom-wrap group relative flex h-full flex-col justify-end overflow-hidden rounded-[10px] bg-brand-ink p-6 text-white",
                    i === 0 ? "min-h-[380px] md:p-8" : "min-h-[250px]",
                  )}
                >
                  {b.gambar && (
                    <Image
                      src={b.gambar}
                      alt=""
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"}
                      className="-z-0 object-cover"
                      style={{ objectPosition: b.posisiGambar }}
                    />
                  )}
                  <span className="scrim-bottom absolute inset-0" aria-hidden="true" />
                  {b.halaman && <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-ink from-45% to-transparent" aria-hidden="true" />}
                  {TAMPILKAN_LABEL_CONTOH && b.gambar && apakahIlustrasi(b.gambar) && (
                    <span className="absolute right-3 top-3 z-[2] rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">
                      Foto ilustrasi
                    </span>
                  )}
                  <span className="relative flex flex-col gap-2">
                    <span
                      className={cx(
                        "font-semibold leading-snug text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4",
                        i === 0 ? "text-h3 md:text-[1.75rem] md:leading-tight" : "text-[1.0625rem]",
                      )}
                    >
                      {b.judul}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-white/80">
                      <CalendarDays size={15} aria-hidden="true" />
                      {b.tanggalTampil}
                      <span aria-hidden="true">·</span>
                      {b.kategori}
                      {b.contoh && <Contoh className="ml-1" />}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div role="tabpanel" id="panel-Pengumuman" aria-labelledby="tab-Pengumuman" hidden={tab !== "Pengumuman"}>
          <ul className="divide-y divide-line border-y border-line">
            {pengumuman.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/berita/${p.slug}`}
                  className="group grid gap-3 py-7 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] md:items-start md:gap-10"
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
                    <span className="mt-2 block max-w-[70ch] text-ink-2">{p.ringkasan}</span>
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="hidden text-muted transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand md:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div role="tabpanel" id="panel-Agenda" aria-labelledby="tab-Agenda" hidden={tab !== "Agenda"}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agenda.slice(0, 4).map((a) => (
              <li key={a.judul} className="flex flex-col rounded-[10px] border border-line bg-paper p-7">
                <span className="flex items-baseline gap-2 text-brand">
                  <span className="text-[3rem] font-light leading-none tracking-[-0.04em]">{a.hari}</span>
                  <span className="text-sm font-semibold">
                    {a.bulan} {a.tahun}
                  </span>
                </span>
                <span className="mt-5 text-h3 text-ink">{a.judul}</span>
                <span className="mt-4 flex flex-col gap-1.5 text-sm text-ink-2">
                  <span className="flex items-center gap-2">
                    <Clock size={15} aria-hidden="true" className="text-muted" /> {a.rentang}, {a.waktu}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={15} aria-hidden="true" className="text-muted" /> {a.tempat}
                  </span>
                </span>
                {a.contoh && <Contoh className="mt-5 self-start" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
