import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cx } from "@/lib/format";

type Aksi = { label: string; href: string };

/**
 * Kepala seksi gaya Pertamina: judul di kiri, paragraf di tengah, tombol pil di kanan.
 */
export function SectionHead({
  judul,
  teks,
  aksi,
  id,
  tambahan,
  className,
  sebagai: Tag = "h2",
  tengah,
}: {
  judul: string;
  teks?: React.ReactNode;
  aksi?: Aksi;
  id?: string;
  tambahan?: React.ReactNode;
  className?: string;
  sebagai?: "h1" | "h2";
  /** Judul dan teks bertumpuk di tengah (bukan judul kiri, teks kanan). */
  tengah?: boolean;
}) {
  return (
    <div
      className={cx(
        tengah
          ? "mx-auto flex max-w-3xl flex-col items-center gap-4 text-center"
          : "grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_auto] lg:items-start lg:gap-10",
        className,
      )}
    >
      <div data-reveal className={cx("flex min-w-0 flex-col gap-3", tengah && "items-center")}>
        <Tag id={id} className={cx("text-h2", !tengah && "max-w-[18ch]")}>
          {judul}
        </Tag>
        {tambahan}
      </div>
      {teks ? (
        <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="max-w-[62ch] text-lead text-ink-2">
          {teks}
        </div>
      ) : tengah ? null : (
        <div className="hidden lg:block" />
      )}
      {aksi ? (
        <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="lg:pt-1">
          <Link href={aksi.href} className="btn-pill">
            {aksi.label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
