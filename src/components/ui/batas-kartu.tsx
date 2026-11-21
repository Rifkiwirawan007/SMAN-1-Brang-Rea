"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const BATAS = 6;

/**
 * Tampilkan hanya 6 kartu pertama (li di dalam <ul>), sisanya muncul lewat tombol "Lihat semua".
 * Kartu lain tetap ada di HTML (cuma disembunyikan), jadi animasi muncul & mesin pencari tetap jalan.
 */
export function BatasKartu({ jumlah, children }: { jumlah: number; children: React.ReactNode }) {
  const [buka, setBuka] = useState(false);
  const ringkas = !buka && jumlah > BATAS;
  return (
    <div className={ringkas ? "[&_ul>li:nth-child(n+7)]:hidden" : undefined}>
      {children}
      {jumlah > BATAS && (
        <div className="mt-8 flex justify-center">
          <button type="button" className="btn-pill" aria-expanded={buka} onClick={() => setBuka((b) => !b)}>
            {buka ? "Tampilkan lebih sedikit" : `Lihat semua (${jumlah})`}
            <ChevronDown size={18} aria-hidden="true" className={buka ? "rotate-180" : ""} />
          </button>
        </div>
      )}
    </div>
  );
}
