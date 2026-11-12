"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import type { Berita, KategoriBerita } from "@/data/berita";
import { apakahIlustrasi } from "@/data/foto";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { Contoh } from "@/components/ui/contoh";

type BeritaTampil = Berita & { tanggalTampil: string };

const PER_HALAMAN = 6;

/** Daftar berita: saring kategori, cari judul, dan "Muat lebih banyak". */
export function BeritaList({ daftar, kategori }: { daftar: BeritaTampil[]; kategori: KategoriBerita[] }) {
  const [pilih, setPilih] = useState<KategoriBerita | "Semua">("Semua");
  const [cari, setCari] = useState("");
  const [jumlah, setJumlah] = useState(PER_HALAMAN);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter(
      (b) =>
        (pilih === "Semua" || b.kategori === pilih) &&
        (!q || b.judul.toLowerCase().includes(q) || b.ringkasan.toLowerCase().includes(q)),
    );
  }, [daftar, pilih, cari]);

  const tampil = hasil.slice(0, jumlah);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Saring kategori">
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
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Cari berita</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={cari}
            onChange={(e) => {
              setCari(e.target.value);
              setJumlah(PER_HALAMAN);
            }}
            placeholder="Cari judul atau isi berita"
            className="field pl-11"
          />
        </label>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        Menampilkan {tampil.length} dari {hasil.length} tulisan
      </p>

      {hasil.length === 0 ? (
        <div className="mt-6 rounded-[14px] border border-dashed border-line-2 px-6 py-16 text-center">
          <p className="text-h3">Belum ada yang cocok</p>
          <p className="mt-2 text-ink-2">Coba kata kunci lain atau pilih kategori Semua.</p>
          <button
            type="button"
            className="btn-pill mt-6"
            onClick={() => {
              setCari("");
              setPilih("Semua");
            }}
          >
            Atur ulang pencarian
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {tampil.map((b) => (
            <li key={b.slug}>
              <Link href={`/berita/${b.slug}`} className="zoom-wrap group flex h-full flex-col">
                <span className="relative block aspect-[16/10] overflow-hidden rounded-[10px] bg-paper-3">
                  {b.gambar ? (
                    <Image
                      src={b.gambar}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: b.posisiGambar }}
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center bg-brand-soft">
                      <Image src="/images/logo-sman1brangrea.png" alt="" width={72} height={72} className="opacity-90" />
                    </span>
                  )}
                  {TAMPILKAN_LABEL_CONTOH && b.gambar && apakahIlustrasi(b.gambar) && (
                    <span className="absolute right-3 top-3 rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 text-white">
                      Foto ilustrasi
                    </span>
                  )}
                </span>
                <span className="mt-5 text-h3 text-ink transition-colors duration-200 group-hover:text-brand">{b.judul}</span>
                <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
                  {b.tanggalTampil && (
                    <>
                      <CalendarDays size={15} aria-hidden="true" />
                      {b.tanggalTampil}
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span className="font-semibold text-brand">{b.kategori}</span>
                  {b.contoh && <Contoh className="ml-1" />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {jumlah < hasil.length && (
        <div className="mt-14 flex justify-center">
          <button type="button" className="btn-pill" onClick={() => setJumlah((j) => j + PER_HALAMAN)}>
            Muat lebih banyak
          </button>
        </div>
      )}
    </div>
  );
}
