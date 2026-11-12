"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Satu observer untuk semua elemen [data-reveal] (fade-up gaya AOS saat digulir).
 *
 * Animasi dijalankan lewat Web Animations API, bukan dengan menambah kelas, sehingga
 * atribut milik React tidak pernah diubah: aman untuk hidrasi dan untuk render ulang.
 * Tanpa JavaScript konten tetap terlihat, karena keadaan tersembunyi hanya berlaku di bawah kelas .js.
 */
export function RevealObserver() {
  useEffect(() => {
    window.__revealReady = true;
    // Gerak dikurangi: CSS sudah menampilkan semua elemen tanpa animasi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const easing =
      getComputedStyle(document.documentElement).getPropertyValue("--ease-out-soft").trim() ||
      "cubic-bezier(0.22, 1, 0.36, 1)";
    const sudah = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const urutan = parseFloat(getComputedStyle(e.target).getPropertyValue("--d")) || 0;
          // Mode kata per kata: tiap span.kata naik halus bergiliran.
          if (e.target.hasAttribute("data-reveal-kata")) {
            const jeda = parseFloat(e.target.getAttribute("data-reveal-kata") || "") || 30;
            e.target.querySelectorAll<HTMLElement>(".kata").forEach((k) => {
              const i = parseFloat(k.style.getPropertyValue("--i")) || 0;
              k.animate(
                [
                  { opacity: 0, transform: "translate3d(0, 0.6em, 0)" },
                  { opacity: 1, transform: "none" },
                ],
                { duration: 700, delay: urutan * 110 + i * jeda, easing, fill: "both" },
              );
            });
            continue;
          }
          (e.target as HTMLElement).animate(
            [
              { opacity: 0, transform: "translate3d(0, 32px, 0)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 900, delay: urutan * 110, easing, fill: "both" },
          );
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const pindai = () => {
      document.querySelectorAll("[data-reveal], [data-reveal-kata]").forEach((el) => {
        if (sudah.has(el)) return;
        sudah.add(el);
        io.observe(el);
      });
    };
    pindai();
    const mo = new MutationObserver(pindai);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
