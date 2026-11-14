"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, LoaderCircle, SwitchCamera } from "lucide-react";

type Detektor = (sumber: HTMLVideoElement, kanvas: HTMLCanvasElement) => Promise<string | null>;

/** BarcodeDetector bawaan browser (Chrome/Android) bila ada; selain itu jsQR (semua browser, termasuk Safari). */
async function siapkanDetektor(): Promise<Detektor> {
  type KelasBD = {
    new (o: { formats: string[] }): { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };
    getSupportedFormats: () => Promise<string[]>;
  };
  const BD = (globalThis as { BarcodeDetector?: KelasBD }).BarcodeDetector;
  if (BD) {
    try {
      if ((await BD.getSupportedFormats()).includes("qr_code")) {
        const d = new BD({ formats: ["qr_code"] });
        return async (video) => (await d.detect(video))[0]?.rawValue ?? null;
      }
    } catch {
      /* jatuh ke jsQR */
    }
  }
  const jsQR = (await import("jsqr")).default;
  return async (video, kanvas) => {
    const lebar = Math.min(720, video.videoWidth);
    const tinggi = Math.round((video.videoHeight / video.videoWidth) * lebar);
    if (!lebar || !tinggi) return null;
    kanvas.width = lebar;
    kanvas.height = tinggi;
    const ctx = kanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, lebar, tinggi);
    const img = ctx.getImageData(0, 0, lebar, tinggi);
    return jsQR(img.data, lebar, tinggi, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

/**
 * Kamera pemindai QR. Memanggil `onKode` setiap QR terbaca. Kode yang sama diabaikan selama 8 detik
 * supaya satu kartu yang masih di depan kamera tidak tercatat berkali-kali.
 */
export function PemindaiQr({ onKode, jeda }: { onKode: (kode: string) => void; jeda: boolean }) {
  const refVideo = useRef<HTMLVideoElement>(null);
  const refKanvas = useRef<HTMLCanvasElement>(null);
  const refOnKode = useRef(onKode);
  const refJeda = useRef(jeda);
  useEffect(() => {
    refOnKode.current = onKode;
    refJeda.current = jeda;
  });

  const [nyala, setNyala] = useState(false);
  const [status, setStatus] = useState<"mati" | "memuat" | "jalan" | "galat">("mati");
  const [galat, setGalat] = useState("");
  const [depan, setDepan] = useState(false);

  useEffect(() => {
    if (!nyala) return;
    let batal = false;
    let stream: MediaStream | null = null;
    let timer = 0;
    const terakhir = new Map<string, number>();

    (async () => {
      setStatus("memuat");
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus("galat");
        setGalat("Kamera hanya bisa dibuka di alamat https:// (atau localhost). Pakai kolom ketik/scanner USB di samping, atau buka situs lewat https.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: depan ? "user" : { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (e) {
        setStatus("galat");
        setGalat(
          (e as Error).name === "NotAllowedError"
            ? "Izin kamera ditolak. Izinkan kamera untuk situs ini di pengaturan browser, lalu coba lagi."
            : "Kamera tidak bisa dibuka. Pastikan tidak sedang dipakai aplikasi lain.",
        );
        return;
      }
      if (batal) return stream.getTracks().forEach((t) => t.stop());
      const video = refVideo.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      const deteksi = await siapkanDetektor();
      if (batal) return;
      setStatus("jalan");

      const putar = async () => {
        if (batal) return;
        if (!refJeda.current && video.readyState >= 2) {
          try {
            const kode = (await deteksi(video, refKanvas.current!))?.trim();
            const kini = Date.now();
            if (kode && kini - (terakhir.get(kode) ?? 0) > 8000) {
              terakhir.set(kode, kini);
              refOnKode.current(kode);
            }
          } catch {
            /* bingkai gagal dibaca: coba bingkai berikutnya */
          }
        }
        timer = window.setTimeout(putar, 140);
      };
      void putar();
    })();

    return () => {
      batal = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      setStatus("mati");
    };
  }, [nyala, depan]);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0b1510]">
        <video ref={refVideo} playsInline muted className={`h-full w-full object-cover ${depan ? "-scale-x-100" : ""} ${status === "jalan" ? "" : "invisible"}`} />
        <canvas ref={refKanvas} className="hidden" />
        {status === "jalan" && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="aspect-square w-[58%] rounded-2xl border-[3px] border-white/85 shadow-[0_0_0_9999px_rgb(0_0_0/0.28)]" />
          </div>
        )}
        {status !== "jalan" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm text-white/85">
            {status === "memuat" ? (
              <>
                <LoaderCircle size={28} className="animate-spin" aria-hidden="true" />
                Membuka kamera…
              </>
            ) : status === "galat" ? (
              <>
                <CameraOff size={28} aria-hidden="true" />
                <p className="max-w-[40ch]">{galat}</p>
              </>
            ) : (
              <>
                <Camera size={28} aria-hidden="true" />
                <p>Kamera mati. Tekan &ldquo;Buka kamera&rdquo; lalu arahkan ke QR kartu siswa.</p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={`d-btn ${nyala ? "d-btn-garis" : "d-btn-utama"}`} onClick={() => setNyala((n) => !n)}>
          {nyala ? <CameraOff size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
          {nyala ? "Matikan kamera" : "Buka kamera"}
        </button>
        {nyala && (
          <button type="button" className="d-btn d-btn-garis" onClick={() => setDepan((d) => !d)}>
            <SwitchCamera size={16} aria-hidden="true" />
            {depan ? "Kamera belakang" : "Kamera depan"}
          </button>
        )}
      </div>
    </div>
  );
}
