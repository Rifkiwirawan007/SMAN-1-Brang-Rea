"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** Video YouTube ringan: thumbnail dulu, iframe baru dimuat saat diklik. */
export function VideoYoutube({ id, judul }: { id: string; judul: string }) {
  const [main, setMain] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-brand-ink">
      {main ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={judul}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setMain(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Putar video: ${judul}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-brand-ink/25" aria-hidden="true" />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white text-brand shadow-lg transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
            <Play size={30} fill="currentColor" className="ml-1" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
