import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { cx } from "@/lib/format";

/** Label kecil penanda konten contoh/dummy. Matikan semua lewat TAMPILKAN_LABEL_CONTOH. */
export function Contoh({ teks = "Contoh", className }: { teks?: string; className?: string }) {
  if (!TAMPILKAN_LABEL_CONTOH) return null;
  return (
    <span className={cx("chip-contoh", className)} title="Konten contoh, akan diganti data resmi sekolah">
      {teks}
    </span>
  );
}

/** Catatan satu baris untuk seksi yang seluruh isinya contoh. */
export function CatatanContoh({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!TAMPILKAN_LABEL_CONTOH) return null;
  return (
    <p className={cx("flex flex-wrap items-center gap-2 text-sm text-muted", className)}>
      <Contoh />
      <span>{children ?? "Isi seksi ini contoh dan akan diganti data resmi sekolah."}</span>
    </p>
  );
}
