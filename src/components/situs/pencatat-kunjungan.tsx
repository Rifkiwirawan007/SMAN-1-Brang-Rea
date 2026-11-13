"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Kirim satu catatan kunjungan setiap kali halaman publik dibuka (tanpa cookie, tanpa pihak ketiga). */
let sudahKirimRujukan = false;

export function PencatatKunjungan() {
  const path = usePathname();
  const terakhir = useRef<string | null>(null);

  useEffect(() => {
    if (!path || terakhir.current === path) return;
    terakhir.current = path;
    let id = "";
    try {
      id = localStorage.getItem("bv") ?? "";
      if (!id) {
        id = crypto.randomUUID().replace(/-/g, "");
        localStorage.setItem("bv", id);
      }
    } catch {
      id = "tanpa-penyimpanan";
    }
    // Rujukan (asal pengunjung) hanya bermakna untuk halaman pertama yang dibuka.
    const rujukan = !sudahKirimRujukan ? document.referrer : "";
    sudahKirimRujukan = true;
    fetch("/api/kunjungan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ p: path, v: id, r: rujukan }),
      keepalive: true,
    }).catch(() => undefined);
  }, [path]);

  return null;
}
