"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";

type Item = { id: string; label: string };

/** Navigasi bagian halaman yang lengket + penanda bagian aktif (scroll spy). */
export function SubNav({ items }: { items: Item[] }) {
  const [aktif, setAktif] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);
  const kunci = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = kunci.split("|");
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const terlihat = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (terlihat[0]) setAktif(terlihat[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [kunci]);

  useEffect(() => {
    const ul = listRef.current;
    const a = ul?.querySelector<HTMLAnchorElement>(`a[href="#${aktif}"]`);
    if (!ul || !a) return;
    const kiri = a.offsetLeft - ul.clientWidth / 2 + a.clientWidth / 2;
    ul.scrollTo({ left: Math.max(0, kiri), behavior: "smooth" });
  }, [aktif]);

  return (
    <div className="subnav sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
      <nav aria-label="Bagian halaman" className="container-site">
        <ul ref={listRef} className="rail -mx-1 flex gap-1 overflow-x-auto">
          {items.map((i) => {
            const on = aktif === i.id;
            return (
              <li key={i.id} className="shrink-0">
                <a
                  href={`#${i.id}`}
                  aria-current={on ? "location" : undefined}
                  className={cx(
                    "relative block whitespace-nowrap px-3 py-4 text-[0.9375rem] transition-colors duration-200",
                    on ? "font-semibold text-brand" : "text-ink-2 hover:text-brand",
                  )}
                >
                  {i.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 origin-left bg-brand transition-transform duration-300"
                    style={{ transform: on ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
