"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Kartu } from "@/components/dasbor/ui";

type PromptPasang = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** Kartu "Pasang BAREMA di HP": tombol pasang (Chrome Android/desktop) atau petunjuk manual (iPhone). */
export function PasangAplikasi() {
  const [prompt, setPrompt] = useState<PromptPasang | null>(null);
  const [mode, setMode] = useState<"memuat" | "terpasang" | "ios" | "lain">("memuat");

  useEffect(() => {
    const terpasang = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // Ditunda satu tick supaya setState tidak terjadi langsung di dalam efek.
    const t = setTimeout(() => setMode(terpasang ? "terpasang" : ios ? "ios" : "lain"), 0);
    const tangkap = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptPasang);
    };
    const selesai = () => setMode("terpasang");
    window.addEventListener("beforeinstallprompt", tangkap);
    window.addEventListener("appinstalled", selesai);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", tangkap);
      window.removeEventListener("appinstalled", selesai);
    };
  }, []);

  const pasang = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setMode("terpasang");
    setPrompt(null);
  };

  if (mode === "memuat") return null;

  return (
    <Kartu judul="Pasang BAREMA di HP" deskripsi="Ikon BAREMA di layar HP langsung membuka dashboard, tanpa mengetik alamat. Centang “Ingat saya” saat masuk supaya tidak perlu login setiap hari.">
      {mode === "terpasang" ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-brand">
          <Smartphone size={18} aria-hidden="true" /> BAREMA sudah terpasang di perangkat ini.
        </p>
      ) : (
        <div className="flex flex-col gap-4 text-sm text-ink-2">
          {prompt && (
            <button type="button" onClick={pasang} className="d-btn self-start">
              <Download size={16} aria-hidden="true" /> Pasang BAREMA
            </button>
          )}
          {mode === "ios" ? (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Buka halaman ini di <b>Safari</b>.</li>
              <li>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</li>
              <li>Pilih <b>Tambahkan ke Layar Utama</b>, lalu ketuk <b>Tambah</b>.</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Buka halaman ini di <b>Chrome</b>.</li>
              <li>
                {prompt ? "Ketuk tombol di atas, atau ketuk" : "Ketuk"} menu <b>⋮</b> (titik tiga) di kanan atas.
              </li>
              <li>
                Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>, lalu <b>Pasang</b>.
              </li>
            </ol>
          )}
        </div>
      )}
    </Kartu>
  );
}
