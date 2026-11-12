import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Contoh } from "@/components/ui/contoh";
import { BagikanBerita } from "@/components/berita/bagikan";
import { BERITA, cariBerita, urutBerita } from "@/data/berita";
import { formatTanggal } from "@/lib/format";

// Semua slug sudah diprerender lewat generateStaticParams; izinkan navigasi menunggu
// isi artikel tanpa peringatan validasi "instant" di mode dev.
export const instant = false;

export function generateStaticParams() {
  return BERITA.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/berita/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = cariBerita(slug);
  if (!b) return { title: "Berita tidak ditemukan" };
  return { title: b.judul, description: b.ringkasan };
}

export default async function DetailBerita({ params }: PageProps<"/berita/[slug]">) {
  const { slug } = await params;
  const b = cariBerita(slug);
  if (!b) notFound();

  const terkait = urutBerita()
    .filter((x) => x.slug !== b.slug && x.gambar)
    .sort((x, y) => Number(y.kategori === b.kategori) - Number(x.kategori === b.kategori))
    .slice(0, 3);

  return (
    <>
      <PageHero
        judul={b.judul}
        teks={b.ringkasan}
        gambar={b.halaman || !b.gambar ? "/images/hero-sekolah-baru.jpg" : b.gambar}
        alt=""
        jejak={[{ label: "Beranda", href: "/" }, { label: "Berita", href: "/berita" }, { label: b.kategori === "Berita" ? "Artikel" : b.kategori }]}
      />

      <article className="section-y">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-20">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="font-semibold text-brand">{b.kategori}</span>
              <span className="flex items-center gap-2">
                <CalendarDays size={15} aria-hidden="true" />
                <time dateTime={b.tanggal}>{formatTanggal(b.tanggal)}</time>
              </span>
              {b.contoh && <Contoh teks="Berita contoh" />}
            </p>
            <div className="prose-sekolah mt-8 max-w-[68ch] text-ink-2">
              {b.isi.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            {b.halaman && (
              <figure className="mt-10 max-w-[720px]">
                <a href={b.halaman} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[14px] border border-line">
                  <Image
                    src={b.halaman}
                    alt={`Halaman buletin Lensa Barema: ${b.judul}`}
                    width={1486}
                    height={1800}
                    sizes="(min-width: 768px) 720px, 100vw"
                    quality={90}
                    className="h-auto w-full"
                  />
                </a>
                <figcaption className="mt-3 text-sm text-muted">Halaman buletin Lensa Barema. Ketuk gambar untuk membuka ukuran penuh.</figcaption>
              </figure>
            )}
            {b.sumber && <p className="mt-8 text-sm text-muted">Sumber: {b.sumber}</p>}
            <Link href="/berita" className="btn-pill mt-8">
              <ArrowLeft size={18} aria-hidden="true" />
              Kembali ke berita
            </Link>
          </div>

          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <BagikanBerita judul={b.judul} />
            {terkait.length > 0 && (
              <div>
                <p className="font-semibold text-ink">Baca juga</p>
                <ul className="mt-4 flex flex-col gap-5">
                  {terkait.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/berita/${t.slug}`} className="zoom-wrap group grid grid-cols-[96px_minmax(0,1fr)] gap-4">
                        <span className="relative aspect-square overflow-hidden rounded-[10px] bg-paper-3">
                          <Image src={t.gambar!} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: t.posisiGambar }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.9375rem] font-semibold leading-snug text-ink group-hover:text-brand">{t.judul}</span>
                          <span className="mt-1 block text-[0.8125rem] text-muted">{formatTanggal(t.tanggal)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
