"use client";

import { useEffect } from "react";

const TEKS = "h2, h3, h4, p, .btn-pill, .btn-solid";

/**
 * Beranda: semua judul dan paragraf di dalam [data-reveal-paragraf] muncul dari bawah
 * satu per satu (per paragraf), bukan satu blok sekaligus.
 * Efek ini jalan sebelum RevealObserver di layout, jadi blok [data-reveal] di dalamnya
 * diambil alih: atributnya dilepas dan isinya dianimasikan per paragraf.
 */
export function RevealParagraf() {
  useEffect(() => {
    const wadah = document.querySelector<HTMLElement>("[data-reveal-paragraf]");
    if (!wadah) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Lepas animasi blok; teks di dalamnya yang akan bergerak.
    wadah.querySelectorAll<HTMLElement>("[data-reveal]").forEach((b) => {
      if (b.querySelector(TEKS) || b.matches(TEKS)) b.removeAttribute("data-reveal");
    });

    const semua = [...wadah.querySelectorAll<HTMLElement>(TEKS)].filter(
      (el) =>
        el.innerText.trim() &&
        !el.closest("[data-reveal-kata]") &&
        !el.closest("[data-reveal]") &&
        // Hanya elemen teks terluar (p di dalam p/judul tidak dihitung dua kali).
        !el.parentElement?.closest(TEKS),
    );
    if (!semua.length) return;

    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
    const io = new IntersectionObserver(
      (entries) => {
        const masuk = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        masuk.forEach((e, i) => {
          io.unobserve(e.target);
          (e.target as HTMLElement).animate(
            [
              { opacity: 0, transform: "translate3d(0, 28px, 0)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 800, delay: i * 120, easing, fill: "both" },
          );
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    for (const el of semua) {
      // Sembunyikan dulu (lewat animasi beku) supaya tidak berkedip sebelum muncul.
      el.animate([{ opacity: 0, transform: "translate3d(0, 28px, 0)" }], { duration: 0, fill: "forwards" });
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return null;
}
