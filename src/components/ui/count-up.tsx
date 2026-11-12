"use client";

import { useEffect, useRef, useState } from "react";

const fmt = new Intl.NumberFormat("id-ID");

/** Angka yang menghitung naik saat pertama terlihat (gaya countUp Pertamina). */
export function CountUp({ nilai, durasi = 1800 }: { nilai: number; durasi?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tampil, setTampil] = useState(nilai);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Hanya animasikan bila belum terlihat saat dimuat, supaya tidak ada kedipan.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setTampil(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const langkah = (t: number) => {
          const p = Math.min(1, (t - t0) / durasi);
          const halus = 1 - Math.pow(1 - p, 4);
          setTampil(Math.round(nilai * halus));
          if (p < 1) raf = requestAnimationFrame(langkah);
        };
        raf = requestAnimationFrame(langkah);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [nilai, durasi]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={fmt.format(nilai)}>
      <span aria-hidden="true">{fmt.format(tampil)}</span>
    </span>
  );
}
