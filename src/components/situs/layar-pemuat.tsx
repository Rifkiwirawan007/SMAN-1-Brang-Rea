"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TitikPemuat } from "@/components/situs/titik-pemuat";
import { tandaiPemuatSelesai } from "@/lib/pemuat";

/** Foto kegiatan sekolah yang berganti cepat di dalam huruf BAREMA (versi kecil khusus pemuat). */
const FOTO = Array.from({ length: 8 }, (_, i) => `/pemuat/barema-${String(i + 1).padStart(2, "0")}.webp`);
/** Foto di dalam huruf mulai diunduh paling lambat saat ini (atau lebih awal bila halaman sudah termuat). */
const FOTO_MS = 650;
const TOMBOL_GULIR = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

type Mode = "barema" | "titik";

/** Pengaturan waktu tiap jenis pemuat (ms). */
const WAKTU: Record<Mode | "barema-hp", { tampil: number; maksimal: number; jedaLatar: number; lepas: number }> = {
  // BAREMA terbuka di ±0,95 dtk, jadi tulisannya terlihat penuh ±2 dtk sebelum memudar.
  // Urutan keluar: logo + BAREMA memudar dulu, lalu latar putih, baru hero mulai bergerak.
  barema: { tampil: 3000, maksimal: 6500, jedaLatar: 250, lepas: 850 },
  // Versi HP (ringan, tanpa foto): urutannya lebih pendek, BAREMA sudah utuh di ±1 dtk.
  "barema-hp": { tampil: 1800, maksimal: 4500, jedaLatar: 150, lepas: 600 },
  // Tiga titik: singkat saja, cukup agar animasinya sempat terlihat.
  titik: { tampil: 800, maksimal: 4000, jedaLatar: 0, lepas: 500 },
};

/**
 * Layar pemuat saat situs dibuka / di-reload (dirender server agar langsung tampil):
 *  - Beranda: "logo lockup" BAREMA (terinspirasi SMAN 1 Mataram). Logo muncul, bergeser ke kiri,
 *    lalu tulisan BAREMA berisi foto kegiatan yang berganti cepat + nama sekolah terbuka di sampingnya.
 *  - Halaman lain: tiga titik hijau memantul yang ringan.
 * Jenisnya ditentukan sekali dari halaman pertama yang dibuka; berpindah halaman di dalam situs
 * tidak memunculkan pemuat lagi. Saat memudar, tandaiPemuatSelesai() memberi tahu hero/reveal
 * agar animasinya baru mulai.
 *
 * Di HP (< 768px) BAREMA memakai versi ringan: logo di atas lalu BAREMA hijau polos di bawahnya
 * (tanpa foto, tanpa animasi lebar), hanya animasi transform/opacity, dan durasinya lebih pendek.
 *
 * Performa (BAREMA desktop): foto di dalam huruf baru diunduh setelah cat pertama (atribut data-foto)
 * supaya tidak berebut bandwidth dengan gambar hero/LCP, dan lapisan foto memakai will-change
 * agar pergantian foto tidak memicu repaint.
 */
export function LayarPemuat({ label, subjudul }: { label: string; subjudul: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [mode] = useState<Mode>(() => (pathname === "/" ? "barema" : "titik"));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // HP (lebar < 768px) memakai versi ringan: tanpa foto di dalam huruf (tidak diunduh sama sekali).
    const hp = mode === "barema" && window.matchMedia("(max-width: 767px)").matches;
    const w = WAKTU[hp ? "barema-hp" : mode];
    const pakaiFoto = mode === "barema" && !hp;

    // Foto BAREMA (desktop): mulai unduh saat halaman termuat atau ~0,65 dtk, mana yang lebih dulu.
    const pasangFoto = () => el.setAttribute("data-foto", "");
    const tFoto = pakaiFoto ? setTimeout(pasangFoto, Math.max(0, FOTO_MS - performance.now())) : undefined;
    if (pakaiFoto) window.addEventListener("load", pasangFoto, { once: true });

    // Dihitung sejak animasi pemuat benar-benar mulai di layar (bukan sejak halaman diminta).
    const animPertama = el.querySelector(".pemuat-logo, .titik-pemuat span")?.getAnimations()[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
    const mulai = Number(animPertama?.startTime ?? fcp ?? performance.now());

    let t: ReturnType<typeof setTimeout>;
    const tutup = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        el.setAttribute("data-selesai", "");
        t = setTimeout(() => {
          tandaiPemuatSelesai();
          t = setTimeout(() => el.setAttribute("data-hilang", ""), w.lepas - w.jedaLatar);
        }, w.jedaLatar);
      }, Math.max(0, mulai + w.tampil - performance.now()));
    };
    if (document.readyState === "complete") {
      if (pakaiFoto) pasangFoto();
      tutup();
    } else window.addEventListener("load", tutup, { once: true });
    const cadangan = setTimeout(tutup, Math.max(0, mulai + w.maksimal - performance.now()));

    // Selama pemuat tampil, halaman di belakangnya tidak ikut tergulir.
    const tahan = (e: Event) => e.preventDefault();
    const tombol = (e: KeyboardEvent) => {
      if (!el.hasAttribute("data-selesai") && TOMBOL_GULIR.has(e.key)) e.preventDefault();
    };
    el.addEventListener("wheel", tahan, { passive: false });
    el.addEventListener("touchmove", tahan, { passive: false });
    window.addEventListener("keydown", tombol);
    return () => {
      clearTimeout(t);
      clearTimeout(tFoto);
      clearTimeout(cadangan);
      window.removeEventListener("load", pasangFoto);
      window.removeEventListener("load", tutup);
      el.removeEventListener("wheel", tahan);
      el.removeEventListener("touchmove", tahan);
      window.removeEventListener("keydown", tombol);
    };
  }, [mode]);

  if (mode === "titik") {
    return (
      <div ref={ref} className="pemuat" data-mode="titik">
        <TitikPemuat label={label} />
      </div>
    );
  }

  return (
    <div ref={ref} className="pemuat" data-mode="barema">
      <span className="sr-only" role="status">
        {label}
      </span>
      <div className="pemuat-isi" aria-hidden="true">
        <div className="pemuat-logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- harus tampil seketika dari HTML server, tanpa lazy-load */}
          <img
            src="/pemuat/logo-pemuat.webp"
            srcSet="/pemuat/logo-pemuat-208.webp 208w, /pemuat/logo-pemuat.webp 320w"
            sizes="(max-width: 767px) 104px, 290px"
            alt=""
            width={160}
            height={160}
            decoding="async"
          />
        </div>
        <div className="pemuat-teks-wadah">
          <div className="pemuat-teks">
            <span className="pemuat-garis" />
            <div>
              <p className="pemuat-judul" style={{ "--n": FOTO.length } as React.CSSProperties}>
                <span className="pemuat-judul-dasar">BAREMA</span>
                {FOTO.map((src, i) => (
                  <span
                    key={src}
                    className="pemuat-judul-foto"
                    style={{ "--foto": `url(${src})`, "--i": i } as React.CSSProperties}
                  >
                    BAREMA
                  </span>
                ))}
              </p>
              <p className="pemuat-subjudul">{subjudul}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
