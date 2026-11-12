import Image from "next/image";
import { apakahIlustrasi } from "@/data/foto";
import { TAMPILKAN_LABEL_CONTOH } from "@/data/sekolah";
import { cx } from "@/lib/format";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  /** true = memenuhi induk (absolute inset-0); false = blok relatif biasa. */
  penuh?: boolean;
  /** Posisi label "Foto ilustrasi". */
  label?: "kanan-bawah" | "kanan-atas" | "kiri-atas" | "tidak";
  style?: React.CSSProperties;
  /** object-position gambar, mis. "10% center". */
  posisi?: string;
};

/** Gambar cover + label otomatis untuk foto ilustrasi (bukan foto sekolah). */
export function Foto({ src, alt, sizes, className, imgClassName, preload, penuh, label = "kanan-bawah", style, posisi }: Props) {
  const tampilLabel = TAMPILKAN_LABEL_CONTOH && apakahIlustrasi(src) && label !== "tidak";
  return (
    <div className={cx(penuh ? "absolute inset-0" : "relative", "overflow-hidden bg-paper-3", className)} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={preload ? "eager" : undefined}
        fetchPriority={preload ? "high" : undefined}
        className={cx("object-cover", imgClassName)}
        style={posisi ? { objectPosition: posisi } : undefined}
      />
      {tampilLabel && <LabelIlustrasi posisi={label} />}
    </div>
  );
}

export function LabelIlustrasi({ posisi = "kanan-bawah", className }: { posisi?: Props["label"]; className?: string }) {
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
