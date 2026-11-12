"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2 } from "lucide-react";
import { IkonFacebook, IkonWhatsApp } from "@/components/ui/icons";

const tanpaLangganan = () => () => {};

/** Tombol bagikan: memakai alamat halaman saat ini, jadi tetap benar setelah situs online. */
export function BagikanBerita({ judul }: { judul: string }) {
  const url = useSyncExternalStore(tanpaLangganan, () => window.location.href, () => "");
  const [tersalin, setTersalin] = useState<"ya" | "gagal" | null>(null);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setTersalin("ya");
    } catch {
      setTersalin("gagal");
    }
    window.setTimeout(() => setTersalin(null), 2400);
  };

  return (
    <div className="rounded-[14px] border border-line p-6">
      <p className="font-semibold text-ink">Bagikan</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${judul}\n${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill min-h-11 px-4"
        >
          <IkonWhatsApp size={18} />
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill min-h-11 px-4"
        >
          <IkonFacebook size={18} />
          Facebook
        </a>
        <button type="button" onClick={salin} className="btn-pill min-h-11 px-4">
          {tersalin === "ya" ? <Check size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
          {tersalin === "ya" ? "Tersalin" : "Salin tautan"}
        </button>
      </div>
      <p className="mt-3 min-h-5 text-sm text-muted" aria-live="polite">
        {tersalin === "gagal" ? "Peramban menolak akses papan klip. Salin alamat dari bilah alamat." : ""}
      </p>
    </div>
  );
}
