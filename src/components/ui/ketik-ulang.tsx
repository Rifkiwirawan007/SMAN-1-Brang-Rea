"use client";

import { useEffect, useState } from "react";

/**
 * Efek mengetik berulang (seperti "Ramanda Prawita" di portofolio dr. Fitri):
 * huruf muncul satu per satu, diam sebentar, lalu terhapus dan diketik lagi.
 * Teks asli tetap di DOM (tak terlihat) untuk menjaga lebar & dibaca pembaca layar.
 */
export function KetikUlang({ teks, aktif = true }: { teks: string; aktif?: boolean }) {
  const [n, setN] = useState(teks.length);

  useEffect(() => {
    if (!aktif || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let arah = 1;
    let t: ReturnType<typeof setTimeout>;
    const tik = () => {
      if (document.hidden) {
        t = setTimeout(tik, 600);
        return;
      }
      i += arah;
      setN(i);
      let tunggu = arah > 0 ? 95 : 45;
      if (i >= teks.length) {
        arah = -1;
        tunggu = 2600;
      } else if (i <= 0) {
        arah = 1;
        tunggu = 500;
      }
      t = setTimeout(tik, tunggu);
    };
    // Mulai dari kosong setiap kali slide aktif.
    t = setTimeout(() => {
      setN(0);
      t = setTimeout(tik, 400);
    }, 500);
    return () => {
      clearTimeout(t);
      setN(teks.length);
    };
  }, [teks, aktif]);

  return (
    <span className="ketik">
      <span className="sr-only">{teks}</span>
      <span className="ketik-bayang" aria-hidden="true">
        {teks}
      </span>
      <span className="ketik-hidup" aria-hidden="true">
        {teks.slice(0, n)}
        <span className="ketik-kursor" />
      </span>
    </span>
  );
}
