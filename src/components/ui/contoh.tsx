"use client";

import { useLabelContoh } from "@/components/situs/konteks";
import { cx } from "@/lib/format";

/*
 * Penanda konten contoh/dummy dan foto ilustrasi. Semua label di file ini ikut pengaturan
 * sekolah `tampilkanLabelContoh` (diatur dari dashboard), dibaca lewat useLabelContoh().
 */

/** Label kecil penanda konten contoh/dummy. */
export function Contoh({ teks = "Contoh", className }: { teks?: string; className?: string }) {
  const tampil = useLabelContoh();
  if (!tampil) return null;
  return (
    <span className={cx("chip-contoh", className)} title="Konten contoh, akan diganti data resmi sekolah">
      {teks}
    </span>
  );
}

/** Catatan satu baris untuk seksi yang seluruh isinya contoh. */
export function CatatanContoh({ children, className }: { children?: React.ReactNode; className?: string }) {
  const tampil = useLabelContoh();
  if (!tampil) return null;
  return (
    <p className={cx("flex flex-wrap items-center gap-2 text-sm text-muted", className)}>
      <Contoh />
      <span>{children ?? "Isi seksi ini contoh dan akan diganti data resmi sekolah."}</span>
    </p>
  );
}

export type PosisiLabel = "kanan-bawah" | "kanan-atas" | "kiri-atas" | "tidak";

/** Label "Foto ilustrasi" untuk gambar yang bukan foto sekolah (lihat apakahIlustrasi). */
export function LabelIlustrasi({ posisi = "kanan-bawah", className }: { posisi?: PosisiLabel; className?: string }) {
  const tampil = useLabelContoh();
  if (!tampil || posisi === "tidak") return null;
  const tempat =
    posisi === "kanan-atas"
      ? "right-3 top-3"
      : posisi === "kiri-atas"
        ? "left-3 top-3"
        : "right-3 bottom-3";
  return (
    <span
      className={cx(
        "pointer-events-none absolute z-[2] rounded-full bg-scrim/60 px-2.5 py-0.5 text-[0.6875rem] leading-5 font-medium text-white backdrop-blur-sm",
        tempat,
        className,
      )}
    >
      Foto ilustrasi
    </span>
  );
}
