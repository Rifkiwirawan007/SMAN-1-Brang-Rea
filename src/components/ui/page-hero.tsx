import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Foto, LabelIlustrasi } from "@/components/ui/foto";
import { apakahIlustrasi } from "@/data/foto";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { cx } from "@/lib/format";

type Jejak = { label: string; href?: string };

/** Hero halaman dalam: foto penuh, jejak halaman, judul kiri bawah. */
export function PageHero({
  judul,
  teks,
  gambar,
  alt,
  jejak,
  posisiGambar = "center",
  tambahan,
}: {
  judul: string;
  teks: string;
  gambar: string;
  alt: string;
  jejak: Jejak[];
  posisiGambar?: string;
  tambahan?: React.ReactNode;
}) {
  return (
    <section
      data-hero
      className="on-dark relative isolate flex min-h-[min(76svh,660px)] items-end overflow-hidden bg-brand-ink text-white"
    >
      <Foto
        src={gambar}
        alt={alt}
        sizes="100vw"
        preload
        penuh
        className="-z-20"
        label="tidak"
        imgClassName="page-hero-media"
        style={{ "--pos": posisiGambar } as React.CSSProperties}
      />
      <div className="scrim-hero absolute inset-0 -z-10" aria-hidden="true" />
      {TAMPILKAN_LABEL_CONTOH && apakahIlustrasi(gambar) && <LabelIlustrasi posisi="kanan-bawah" />}
      <div className="container-site pb-14 pt-36 md:pb-20">
        <nav aria-label="Jejak halaman" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/85">
            {jejak.map((j, i) => (
              <li key={`${i}-${j.label}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} aria-hidden="true" className="opacity-70" />}
                {j.href ? (
                  <Link href={j.href} className="rounded-sm hover:text-white hover:underline">
                    {j.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {j.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={cx("text-h1 max-w-[17ch] text-white")}>{judul}</h1>
        <p className="mt-5 max-w-[52ch] text-lead text-white/85">{teks}</p>
        {tambahan ? <div className="mt-8 flex flex-wrap items-center gap-3">{tambahan}</div> : null}
      </div>
    </section>
  );
}
