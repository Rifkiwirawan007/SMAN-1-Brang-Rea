"use client";

import { useEffect, useRef, useState } from "react";

/** Pembungkus timeline: menandai `data-jalan` saat terlihat, lalu CSS menjalankan pita berurutan. */
export function PitaJalan({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [jalan, setJalan] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setJalan(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} data-jalan={jalan}>
      {children}
    </div>
  );
}
