"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cx } from "@/lib/format";

type Props = {
  children: React.ReactNode;
  ariaLabel?: string;
  /** Kelas tambahan pada elemen daftar/kontainer (mis. lg:grid lg:grid-cols-4). */
  className?: string;
  /** Kelas pada pembungkus luar. */
  wrapClassName?: string;
  /** Kelas tambahan pada baris kontrol bawah. */
  kontrolClassName?: string;
  /** Tampilkan tombol geser kiri/kanan di mobile & tablet. Bawaan: true. */
  kontrol?: boolean;
  /** Mode warna kontrol untuk latar gelap (seperti seksi berlatar hijau). */
  gelap?: boolean;
  /** Apakah daftar berada di dalam .container-site dan perlu melebar ke tepi layar saat digeser. Bawaan: true. */
  bleed?: boolean;
  /** Elemen daftar yang dirender: ul, ol, atau div. Bawaan: ul. */
  sebagai?: "ul" | "ol" | "div";
  /** Hanya aktifkan carousel di bawah breakpoint tertentu, lalu kembali ke grid di desktop. Bawaan: "lg" (< 1024px carousel). */
  batas?: "sm" | "md" | "lg" | "selalu";
};

/**
 * Kontainer daftar responsif yang otomatis menjadi carousel geser (scroll-snap)
 * di layar mobile & tablet, lengkap dengan indikator posisi & tombol navigasi,
 * lalu berubah menjadi grid biasa di layar desktop.
 */
export function CarouselRail({
  children,
  ariaLabel,
  className,
  wrapClassName,
  kontrolClassName,
  kontrol = true,
  gelap = false,
  bleed = true,
  sebagai: Tag = "ul",
  batas = "lg",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [awal, setAwal] = useState(true);
  const [akhir, setAkhir] = useState(false);
  const [bisaGeser, setBisaGeser] = useState(false);
  const [aktif, setAktif] = useState(1);
  const [total, setTotal] = useState(0);

  const cek = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const jumlahAnak = el.children.length;
    setTotal(jumlahAnak);
    setBisaGeser(maxScroll > 12);
    setAwal(el.scrollLeft < 8);
    setAkhir(el.scrollLeft >= maxScroll - 8);

    if (jumlahAnak > 0 && maxScroll > 0) {
      const rasio = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
      setAktif(Math.min(jumlahAnak, Math.max(1, Math.round(rasio * (jumlahAnak - 1)) + 1)));
    } else {
      setAktif(1);
    }
  }, []);

  useEffect(() => {
    cek();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", cek, { passive: true });
    window.addEventListener("resize", cek);
    const ro = new ResizeObserver(cek);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", cek);
      window.removeEventListener("resize", cek);
      ro.disconnect();
    };
  }, [cek, children]);

  const geser = (arah: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const anakPertama = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "16") || 16;
    const lebar = anakPertama ? anakPertama.clientWidth + gap : el.clientWidth * 0.82;
    el.scrollBy({ left: arah * lebar, behavior: "smooth" });
  };

  const kelasBleed = bleed
    ? "-mx-[clamp(20px,5vw,64px)] px-[clamp(20px,5vw,64px)]"
    : "";

  const kelasResetDesktop =
    batas === "lg"
      ? "lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible"
      : batas === "md"
        ? "md:mx-0 md:px-0 md:pb-0 md:overflow-visible"
        : batas === "sm"
          ? "sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible"
          : "";

  const kelasSembunyiKontrol =
    batas === "lg"
      ? "lg:hidden"
      : batas === "md"
        ? "md:hidden"
        : batas === "sm"
          ? "sm:hidden"
          : "";

  const progres = total > 1 ? (aktif / total) * 100 : 100;

  return (
    <div className={cx("relative", wrapClassName)}>
      <Tag
        // @ts-expect-error ref polimorfik untuk ul/ol/div
        ref={ref}
        aria-label={ariaLabel}
        className={cx(
          "rail flex gap-4 overflow-x-auto pb-2 sm:gap-5",
          kelasBleed,
          kelasResetDesktop,
          className,
        )}
      >
        {children}
      </Tag>

      {kontrol && bisaGeser && (
        <div
          className={cx(
            "mt-5 flex items-center justify-between gap-4",
            kelasSembunyiKontrol,
            kontrolClassName,
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cx(
                "text-xs font-semibold tabular-nums",
                gelap ? "text-white/90" : "text-ink-2",
              )}
              aria-live="polite"
            >
              {String(aktif).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className={cx(
                "relative h-1 w-20 overflow-hidden rounded-full sm:w-28",
                gelap ? "bg-white/25" : "bg-line-2",
              )}
            >
              <span
                className={cx(
                  "block h-full rounded-full transition-all duration-300",
                  gelap ? "bg-white" : "bg-brand",
                )}
                style={{ width: `${progres}%` }}
              />
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => geser(-1)}
              disabled={awal}
              aria-label="Sebelumnya"
              className={cx(
                "btn-square h-10 w-10 rounded-lg",
                gelap &&
                  "border-white/35 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-ink disabled:border-white/20 disabled:bg-transparent disabled:text-white/40",
              )}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => geser(1)}
              disabled={akhir}
              aria-label="Berikutnya"
              className={cx(
                "btn-square h-10 w-10 rounded-lg",
                gelap &&
                  "border-white/35 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-ink disabled:border-white/20 disabled:bg-transparent disabled:text-white/40",
              )}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
