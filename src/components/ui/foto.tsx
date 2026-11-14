import Image from "next/image";
import { LabelIlustrasi, type PosisiLabel } from "@/components/ui/contoh";
import { apakahIlustrasi } from "@/lib/konten/util";
import { cx } from "@/lib/format";

// LabelIlustrasi tinggal di contoh.tsx (komponen klien, ikut pengaturan label contoh); diekspor ulang di sini.
export { LabelIlustrasi };

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
  label?: PosisiLabel;
  style?: React.CSSProperties;
  /** object-position gambar, mis. "10% center". */
  posisi?: string;
};

/** Gambar cover + label otomatis untuk foto ilustrasi (bukan foto sekolah). */
export function Foto({ src, alt, sizes, className, imgClassName, preload, penuh, label = "kanan-bawah", style, posisi }: Props) {
  const tampilLabel = apakahIlustrasi(src) && label !== "tidak";
  return (
    <div className={cx(penuh ? "absolute inset-0" : "relative", "overflow-hidden bg-paper-3", className)} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={preload}
        className={cx("object-cover", imgClassName)}
        style={posisi ? { objectPosition: posisi } : undefined}
      />
      {tampilLabel && <LabelIlustrasi posisi={label} />}
    </div>
  );
}
