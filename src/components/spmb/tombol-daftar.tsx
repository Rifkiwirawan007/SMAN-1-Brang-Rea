import { ArrowUpRight, Lock } from "lucide-react";
import { cx } from "@/lib/format";

/**
 * Tombol "Daftar sekarang" ke portal SPMB provinsi.
 * - Status "Dibuka": tautan aktif dengan bingkai cahaya berputar + titik denyut "Pendaftaran dibuka".
 * - Status lain: tombol terkunci (bukan tautan), menjelaskan kapan bisa dipakai.
 */
export function TombolDaftar({ portal, status, className }: { portal?: string; status: string; className?: string }) {
  const buka = status === "Dibuka" && !!portal;
  const domain = portal?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (buka) {
    return (
      <div className={cx("flex flex-col items-center gap-3", className)}>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="tombol-daftar-denyut absolute inset-0 rounded-full bg-brand" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
          </span>
          Pendaftaran sedang dibuka
        </span>
        <a href={portal} target="_blank" rel="noopener noreferrer" className="tombol-daftar group">
          <span className="tombol-daftar-isi">
            <span className="flex flex-col text-left">
              <span className="text-[1.375rem] font-extrabold leading-tight tracking-[-0.01em] text-white md:text-[1.625rem]">Daftar sekarang</span>
              <span className="mt-0.5 text-sm text-white/70">{domain}</span>
            </span>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105">
              <ArrowUpRight size={26} strokeWidth={2.25} aria-hidden="true" />
            </span>
          </span>
        </a>
      </div>
    );
  }

  const ket =
    status === "Belum dibuka"
      ? "Tombol ini aktif otomatis saat pendaftaran dibuka."
      : status === "Pengumuman hasil"
        ? "Pendaftaran sudah ditutup. Hasil seleksi dapat dilihat di portal SPMB."
        : "Pendaftaran tahun ini sudah ditutup.";

  return (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-line-2" aria-hidden="true" />
        Status: {status}
      </span>
      <span role="link" aria-disabled="true" className="tombol-daftar tombol-daftar-kunci">
        <span className="tombol-daftar-isi">
          <span className="flex flex-col text-left">
            <span className="text-[1.375rem] font-extrabold leading-tight tracking-[-0.01em] text-ink/45 md:text-[1.625rem]">Daftar sekarang</span>
            <span className="mt-0.5 text-sm text-muted">{domain ?? "Portal SPMB"}</span>
          </span>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-line-2 text-muted">
            <Lock size={22} aria-hidden="true" />
          </span>
        </span>
      </span>
      <p className="max-w-[40ch] text-center text-sm text-muted">{ket}</p>
    </div>
  );
}
