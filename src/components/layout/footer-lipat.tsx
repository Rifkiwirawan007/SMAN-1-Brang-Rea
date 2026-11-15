"use client";

import { useEffect } from "react";

/** Di HP, menu footer (Profil, Akademik, dst.) tertutup dulu; di layar lebar selalu terbuka. */
export function FooterLipat() {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const atur = () => {
      document.querySelectorAll<HTMLDetailsElement>("details[data-footer-lipat]").forEach((d) => {
        d.open = mq.matches;
      });
    };
    atur();
    mq.addEventListener("change", atur);
    return () => mq.removeEventListener("change", atur);
  }, []);
  return null;
}
