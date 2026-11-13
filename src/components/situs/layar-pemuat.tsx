"use client";

import { useEffect, useRef } from "react";
import { TitikPemuat } from "@/components/situs/titik-pemuat";

/**
 * Layar pemuat saat situs pertama dibuka (tiga titik hijau memantul).
 * Dirender di server agar langsung tampil, lalu memudar setelah halaman selesai dimuat
 * (minimal ~0,8 dtk agar animasi sempat terlihat, maksimal 4 dtk).
 */
export function LayarPemuat({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mulai = performance.now();
    let t: ReturnType<typeof setTimeout>;
    const tutup = () => {
      clearTimeout(t);
      t = setTimeout(() => el.setAttribute("data-selesai", ""), Math.max(0, 800 - (performance.now() - mulai)));
    };
    if (document.readyState === "complete") tutup();
    else window.addEventListener("load", tutup, { once: true });
    const cadangan = setTimeout(tutup, 4000);
    return () => {
      clearTimeout(t);
      clearTimeout(cadangan);
      window.removeEventListener("load", tutup);
    };
  }, []);

  return (
    <div ref={ref} className="pemuat" aria-hidden="true">
      <TitikPemuat label={label} />
    </div>
  );
}
