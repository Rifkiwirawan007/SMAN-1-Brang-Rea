"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";

/** Bungkus apa saja (kartu, gambar) agar saat diklik membuka gambar `src` di lightbox. */
export function PemicuLightbox({
  src,
  alt,
  className,
  children,
  quality = 90,
}: {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
  quality?: number;
}) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setBuka(true)} className={className} aria-label={`Perbesar: ${alt}`}>
        {children}
      </button>
      <Lightbox src={src} alt={alt} quality={quality} buka={buka} tutup={() => setBuka(false)} />
    </>
  );
}

function Lightbox({ src, alt, quality, buka, tutup }: { src: string; alt: string; quality: number; buka: boolean; tutup: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) d.showModal();
    if (!buka && d.open) d.close();
  }, [buka]);
  return (
    <dialog ref={ref} className="lightbox on-dark" aria-label={alt} onClose={tutup} onClick={(e) => e.target === e.currentTarget && tutup()}>
      {buka && (
        <div className="flex h-full flex-col">
          <div className="flex justify-end px-5 py-4 md:px-8">
            <button type="button" onClick={tutup} className="btn-round h-11 w-11 border-white/40 text-white hover:bg-white hover:text-brand-ink" aria-label="Tutup">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && tutup()}>
            <Image src={src} alt={alt} fill sizes="100vw" quality={quality} className="object-contain p-3 md:p-8" />
          </div>
        </div>
      )}
    </dialog>
  );
}

/** Gambar yang bisa diklik untuk dilihat besar di lightbox (tanpa pindah tab). */
export function GambarPerbesar({
  src,
  alt,
  width,
  height,
  sizes,
  quality = 90,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  quality?: number;
}) {
  return (
    <PemicuLightbox src={src} alt={alt} quality={quality} className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[14px] border border-line">
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} quality={quality} className="h-auto w-full" />
      <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-scrim/60 text-white opacity-80 transition-opacity group-hover:opacity-100" aria-hidden="true">
        <ZoomIn size={18} />
      </span>
    </PemicuLightbox>
  );
}
