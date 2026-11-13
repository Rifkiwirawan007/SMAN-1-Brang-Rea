"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, LoaderCircle, Search, Upload, X } from "lucide-react";
import { useToast } from "@/components/dasbor/penyedia";

export type BerkasMedia = { url: string; nama: string; ukuran: number; diubah: string; sumber: "unggahan" | "situs" };
export type HasilUnggah = { url: string; lebar: number; tinggi: number; ukuran: number; nama: string };

/** Unggah satu foto ke /api/admin/unggah dengan laporan progres (0–100). */
export function unggahBerkas(berkas: File, progres?: (persen: number) => void): Promise<HasilUnggah> {
  return new Promise((ok, gagal) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/unggah");
    xhr.upload.onprogress = (e) => e.lengthComputable && progres?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { pesan?: string } & Partial<HasilUnggah> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* abaikan */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) ok(data as HasilUnggah);
      else gagal(new Error(data.pesan ?? `Gagal mengunggah ${berkas.name}.`));
    };
    xhr.onerror = () => gagal(new Error("Koneksi terputus saat mengunggah."));
    const fd = new FormData();
    fd.append("berkas", berkas);
    xhr.send(fd);
  });
}

export const ukuranBaca = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

const TERIMA = "image/jpeg,image/png,image/webp,image/gif,image/avif";

/** Tombol + zona unggah sederhana yang bisa dipakai di mana saja. */
export function useUnggah(selesai: (hasil: HasilUnggah[]) => void) {
  const toast = useToast();
  const [proses, setProses] = useState<{ nama: string; persen: number }[]>([]);
  const unggah = useCallback(
    async (berkas: File[]) => {
      if (!berkas.length) return;
      const hasil: HasilUnggah[] = [];
      setProses(berkas.map((b) => ({ nama: b.name, persen: 0 })));
      for (let i = 0; i < berkas.length; i++) {
        try {
          hasil.push(await unggahBerkas(berkas[i], (persen) => setProses((p) => p.map((x, j) => (j === i ? { ...x, persen } : x)))));
        } catch (e) {
          toast((e as Error).message, "galat");
        }
      }
      setProses([]);
      if (hasil.length) selesai(hasil);
    },
    [selesai, toast],
  );
  return { unggah, proses, sibuk: proses.length > 0 };
}

export function IndikatorUnggah({ proses }: { proses: { nama: string; persen: number }[] }) {
  if (!proses.length) return null;
  return (
    <ul className="flex flex-col gap-1.5" aria-live="polite">
      {proses.map((p, i) => (
        <li key={i} className="text-xs text-ink-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <LoaderCircle size={13} className="shrink-0 animate-spin text-brand" aria-hidden="true" />
              <span className="truncate">{p.nama}</span>
            </span>
            <span className="tabular-nums text-muted">{p.persen}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper-3">
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${p.persen}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Pemilih foto dari pustaka (unggahan + foto bawaan situs), dengan unggah langsung. */
export function PemilihMedia({
  buka,
  tutup,
  pilih,
  banyak = false,
  judul = "Pilih foto",
}: {
  buka: boolean;
  tutup: () => void;
  pilih: (url: string[]) => void;
  banyak?: boolean;
  judul?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [berkas, setBerkas] = useState<BerkasMedia[] | null>(null);
  const [cari, setCari] = useState("");
  const [sumber, setSumber] = useState<"semua" | "unggahan" | "situs">("semua");
  const [terpilih, setTerpilih] = useState<string[]>([]);
  const [galatMuat, setGalatMuat] = useState("");

  const muat = useCallback(async () => {
    setGalatMuat("");
    try {
      const r = await fetch("/api/admin/media", { cache: "no-store" });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).pesan ?? "Gagal memuat pustaka foto.");
      setBerkas((await r.json()).berkas);
    } catch (e) {
      setGalatMuat((e as Error).message);
    }
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) {
      d.showModal();
      setTerpilih([]);
      void muat();
    } else if (!buka && d.open) d.close();
  }, [buka, muat]);

  const { unggah, proses, sibuk } = useUnggah(
    useCallback((hasil: HasilUnggah[]) => {
      setBerkas((b) => [
        ...hasil.map((h) => ({ url: h.url, nama: h.nama, ukuran: h.ukuran, diubah: new Date().toISOString(), sumber: "unggahan" as const })),
        ...(b ?? []),
      ]);
      setSumber("semua");
      setCari("");
      setTerpilih((t) => (banyak ? [...hasil.map((h) => h.url), ...t] : [hasil[0].url]));
    }, [banyak]),
  );

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return (berkas ?? []).filter((b) => (sumber === "semua" || b.sumber === sumber) && (!q || b.url.toLowerCase().includes(q)));
  }, [berkas, cari, sumber]);

  const klik = (url: string) => {
    if (!banyak) {
      setTerpilih([url]);
      return;
    }
    setTerpilih((t) => (t.includes(url) ? t.filter((x) => x !== url) : [...t, url]));
  };

  const selesai = () => {
    if (!terpilih.length) return;
    pilih(terpilih);
    tutup();
  };

  return (
    <dialog
      ref={ref}
      className="d-dialog w-[min(96vw,980px)]"
      onCancel={(e) => {
        e.preventDefault();
        tutup();
      }}
      aria-labelledby="judul-pemilih"
    >
      <div className="flex max-h-[88svh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id="judul-pemilih" className="text-base font-semibold text-ink">
            {judul}
          </h2>
          <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" onClick={tutup} aria-label="Tutup">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Cari foto</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="d-input d-input-kecil pl-9" placeholder="Cari nama berkas…" value={cari} onChange={(e) => setCari(e.target.value)} />
          </label>
          <select className="d-input d-input-kecil w-auto" value={sumber} onChange={(e) => setSumber(e.target.value as typeof sumber)} aria-label="Sumber foto">
            <option value="semua">Semua foto</option>
            <option value="unggahan">Unggahan dashboard</option>
            <option value="situs">Foto bawaan situs</option>
          </select>
          <button type="button" className="d-btn d-btn-utama d-btn-kecil" onClick={() => inputRef.current?.click()} disabled={sibuk}>
            <Upload size={15} aria-hidden="true" /> Unggah foto baru
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={TERIMA}
            multiple={banyak}
            className="hidden"
            onChange={(e) => {
              void unggah(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>

        <div className="min-h-[300px] flex-1 overflow-y-auto p-5">
          <IndikatorUnggah proses={proses} />
          {galatMuat && <p className="d-galat">{galatMuat}</p>}
          {!berkas && !galatMuat && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="d-kerangka aspect-square" />
              ))}
            </div>
          )}
          {berkas && tampil.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center text-sm text-muted">
              <ImagePlus size={28} aria-hidden="true" />
              <p className="mt-2">Tidak ada foto yang cocok.</p>
            </div>
          )}
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {tampil.map((b) => {
              const on = terpilih.includes(b.url);
              return (
                <li key={b.url}>
                  <button
                    type="button"
                    onClick={() => klik(b.url)}
                    onDoubleClick={() => {
                      if (!banyak) {
                        pilih([b.url]);
                        tutup();
                      }
                    }}
                    className={`group relative block w-full overflow-hidden rounded-lg border-2 bg-paper-3 text-left ${on ? "border-brand" : "border-transparent hover:border-line-2"}`}
                    aria-pressed={on}
                    title={b.url}
                  >
                    <span className="relative block aspect-square">
                      <Image src={b.url} alt="" fill sizes="160px" className="object-cover" />
                    </span>
                    {on && (
                      <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand text-white shadow">
                        <Check size={14} aria-hidden="true" />
                      </span>
                    )}
                    {b.sumber === "unggahan" && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 text-[0.625rem] font-semibold text-brand-deep">Unggahan</span>
                    )}
                  </button>
                  <p className="mt-1 truncate text-[0.6875rem] text-muted">{b.nama}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-sm text-muted">{terpilih.length ? `${terpilih.length} foto dipilih` : banyak ? "Klik foto untuk memilih (bisa lebih dari satu)." : "Klik foto untuk memilih."}</p>
          <div className="flex gap-2">
            <button type="button" className="d-btn d-btn-garis" onClick={tutup}>
              Batal
            </button>
            <button type="button" className="d-btn d-btn-utama" onClick={selesai} disabled={!terpilih.length}>
              Pakai foto
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
