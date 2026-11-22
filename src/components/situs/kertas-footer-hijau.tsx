"use client";

import { useEffect } from "react";

/**
 * Tandai <body> supaya tepi kertas footer ikut hijau tua (halaman bertema gelap seperti Kesiswaan).
 * Pakai efek, bukan CSS :has(): Next menyimpan halaman sebelumnya tersembunyi di DOM setelah pindah
 * halaman, sehingga :has(.tema-hijau) ikut menghitamkan footer di semua halaman lain. Efek ini
 * dibersihkan saat halaman disembunyikan.
 */
export function KertasFooterHijau() {
  useEffect(() => {
    document.body.dataset.kertas = "hijau";
    return () => {
      delete document.body.dataset.kertas;
    };
  }, []);
  return null;
}
