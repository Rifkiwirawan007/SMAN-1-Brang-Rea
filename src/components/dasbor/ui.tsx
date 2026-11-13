import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Komponen tampilan dashboard tanpa state (aman dipakai di Server Component). */

export function JudulHalaman({
  judul,
  deskripsi,
  ikon: Ikon,
  aksi,
  jejak,
}: {
  judul: string;
  deskripsi?: React.ReactNode;
  ikon?: LucideIcon;
  aksi?: React.ReactNode;
  jejak?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {jejak && jejak.length > 0 && (
          <nav aria-label="Jejak halaman" className="mb-2 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-muted">
            {jejak.map((j, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {j.href ? (
                  <Link href={j.href} className="hover:text-brand hover:underline">
                    {j.label}
                  </Link>
                ) : (
                  <span className="text-ink-2">{j.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="flex items-center gap-3 text-[1.5rem] font-semibold leading-tight tracking-[-0.015em] text-ink md:text-[1.75rem]">
          {Ikon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Ikon size={20} aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0">{judul}</span>
        </h1>
        {deskripsi && <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted">{deskripsi}</p>}
      </div>
      {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
    </div>
  );
}

export function Kartu({
  judul,
  deskripsi,
  aksi,
  children,
  className = "",
  isiClassName = "p-5",
}: {
  judul?: React.ReactNode;
  deskripsi?: React.ReactNode;
  aksi?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isiClassName?: string;
}) {
  return (
    <section className={`d-kartu ${className}`}>
      {(judul || aksi) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {judul && <h2 className="text-[0.9375rem] font-semibold text-ink">{judul}</h2>}
            {deskripsi && <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted">{deskripsi}</p>}
          </div>
          {aksi && <div className="flex shrink-0 items-center gap-2">{aksi}</div>}
        </header>
      )}
      <div className={isiClassName}>{children}</div>
    </section>
  );
}

export function Kosong({ ikon: Ikon, judul, teks, aksi }: { ikon: LucideIcon; judul: string; teks?: string; aksi?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-paper-3 text-muted">
        <Ikon size={26} aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-ink">{judul}</p>
      {teks && <p className="mt-1 max-w-[42ch] text-sm text-muted">{teks}</p>}
      {aksi && <div className="mt-5">{aksi}</div>}
    </div>
  );
}

export function Lencana({
  children,
  warna = "abu",
}: {
  children: React.ReactNode;
  warna?: "abu" | "hijau" | "kuning" | "merah" | "biru";
}) {
  const kelas = warna === "abu" ? "" : `d-lencana-${warna}`;
  return <span className={`d-lencana ${kelas}`}>{children}</span>;
}

/** Waktu relatif singkat: "baru saja", "5 menit lalu", "kemarin", atau tanggal. */
export function waktuRelatif(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const detik = Math.round((Date.now() - d.getTime()) / 1000);
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
  if (detik < 86_400) return `${Math.floor(detik / 3600)} jam lalu`;
  if (detik < 2 * 86_400) return "kemarin";
  if (detik < 7 * 86_400) return `${Math.floor(detik / 86_400)} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" }).format(d);
}

export function waktuLengkap(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  }).format(new Date(iso)) + " WITA";
}
