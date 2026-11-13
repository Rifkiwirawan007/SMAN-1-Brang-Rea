"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Copy,
  Crosshair,
  FolderOpen,
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { kosong, objekAwal, opsiNormal, type Bidang, type Galat, type Rekaman } from "@/lib/cms/bidang";
import { jadikanSlug } from "@/lib/konten/util";
import { IndikatorUnggah, PemilihMedia, useUnggah, type HasilUnggah } from "@/components/dasbor/media";

/** Pengubah nilai yang menerima nilai baru atau fungsi (nilai lama → nilai baru). */
export type Pengubah<T> = (v: T | ((lama: T) => T)) => void;

const terapkan = <T,>(v: T | ((lama: T) => T), lama: T): T => (typeof v === "function" ? (v as (l: T) => T)(lama) : v);

const KOLOM: Record<string, string> = {
  penuh: "sm:col-span-6",
  setengah: "sm:col-span-3",
  sepertiga: "sm:col-span-2",
};

/** Daftar bidang dalam grid 6 kolom. */
export function DaftarBidang({
  bidang,
  nilai,
  ubah,
  galat,
  jalur = "",
}: {
  bidang: Bidang[];
  nilai: Rekaman;
  ubah: Pengubah<Rekaman>;
  galat: Galat;
  jalur?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-6">
      {bidang.map((b) => (
        <div key={b.nama} className={`col-span-1 min-w-0 ${KOLOM[b.lebar ?? "penuh"]}`}>
          <BarisBidang
            bidang={b}
            nilai={nilai?.[b.nama]}
            induk={nilai}
            ubah={(v) => ubah((lama) => ({ ...lama, [b.nama]: terapkan(v, lama?.[b.nama]) }))}
            galat={galat}
            jalur={jalur}
          />
        </div>
      ))}
    </div>
  );
}

type PropsBaris = { bidang: Bidang; nilai: unknown; induk: Rekaman; ubah: Pengubah<unknown>; galat: Galat; jalur: string };

function BarisBidang(p: PropsBaris) {
  const id = useId();
  const { bidang: b, galat, jalur } = p;
  const kunci = jalur + b.nama;
  const pesanGalat = galat[kunci];
  const idBantuan = `${id}-bantuan`;
  const idGalat = `${id}-galat`;
  const keterangan = [b.bantuan ? idBantuan : "", pesanGalat ? idGalat : ""].filter(Boolean).join(" ") || undefined;

  if (b.jenis === "grup") {
    return (
      <fieldset className="rounded-xl border border-line p-4" data-jalur={kunci}>
        <legend className="px-1.5 text-[0.8125rem] font-semibold text-ink">
          {b.label}
          {!b.wajib && <span className="ml-1 font-normal text-muted">(opsional)</span>}
        </legend>
        {b.bantuan && <p className="d-bantuan mb-3">{b.bantuan}</p>}
        <DaftarBidang
          bidang={b.bidang}
          nilai={(p.nilai as Rekaman) ?? objekAwal(b.bidang)}
          ubah={(v) => p.ubah((lama: unknown) => terapkan(v, (lama as Rekaman) ?? objekAwal(b.bidang)))}
          galat={galat}
          jalur={`${kunci}.`}
        />
        {pesanGalat && <p className="d-galat mt-2">{pesanGalat}</p>}
      </fieldset>
    );
  }

  if (b.jenis === "daftar") return <BidangDaftar {...p} />;

  const label =
    b.jenis === "saklar" ? null : (
      <label htmlFor={id} className="d-label mb-1.5 flex items-baseline gap-1">
        {b.label}
        {b.wajib && (
          <span className="text-[#b42318]" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );

  return (
    <div data-jalur={kunci}>
      {label}
      <Masukan {...p} id={id} keterangan={keterangan} salah={!!pesanGalat} />
      {b.bantuan && (
        <p id={idBantuan} className="d-bantuan mt-1.5">
          {b.bantuan}
        </p>
      )}
      {pesanGalat && (
        <p id={idGalat} className="d-galat mt-1.5">
          {pesanGalat}
        </p>
      )}
    </div>
  );
}

type PropsMasukan = PropsBaris & { id: string; keterangan?: string; salah: boolean };

function Masukan(p: PropsMasukan) {
  const { bidang: b, id, keterangan, salah } = p;
  const teks = p.nilai === undefined || p.nilai === null ? "" : String(p.nilai);
  const umum = { id, "aria-invalid": salah || undefined, "aria-describedby": keterangan, "aria-required": b.wajib || undefined };

  switch (b.jenis) {
    case "teks": {
      const jenisInput = b.format === "email" ? "email" : b.format === "telepon" ? "tel" : b.format === "url" ? "url" : "text";
      return (
        <div>
          <input {...umum} type={jenisInput} className="d-input" value={teks} placeholder={b.placeholder} onChange={(e) => p.ubah(e.target.value)} />
          {b.maks && <Penghitung n={teks.length} maks={b.maks} />}
        </div>
      );
    }
    case "teksPanjang":
      return (
        <div>
          <textarea {...umum} className="d-input" rows={b.baris ?? 4} value={teks} placeholder={b.placeholder} onChange={(e) => p.ubah(e.target.value)} />
          {b.maks && <Penghitung n={teks.length} maks={b.maks} />}
        </div>
      );
    case "paragraf":
      return <BidangParagraf {...p} />;
    case "daftarTeks":
      return <BidangDaftarTeks {...p} />;
    case "angka":
      return (
        <div className="flex items-center gap-2">
          <input
            {...umum}
            type="number"
            inputMode="decimal"
            className="d-input"
            value={teks}
            min={b.min}
            max={b.max}
            step={b.langkah ?? 1}
            onChange={(e) => p.ubah(e.target.value === "" ? "" : e.target.value)}
          />
          {b.satuan && <span className="shrink-0 text-sm text-muted">{b.satuan}</span>}
        </div>
      );
    case "tanggal":
      return (
        <div className="flex items-center gap-2">
          <input {...umum} type="date" className="d-input" value={teks} onChange={(e) => p.ubah(e.target.value)} />
          {!b.wajib && teks && (
            <button type="button" className="d-btn d-btn-hantu d-btn-ikon" onClick={() => p.ubah("")} aria-label={`Kosongkan ${b.label.toLowerCase()}`} title="Kosongkan">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      );
    case "pilihan":
      return (
        <select {...umum} className="d-input" value={teks} onChange={(e) => p.ubah(e.target.value)}>
          {(!b.wajib || !teks) && <option value="">{b.wajib ? "Pilih…" : "— Tidak ada —"}</option>}
          {b.opsi.map((o) => {
            const x = opsiNormal(o);
            return (
              <option key={x.nilai} value={x.nilai}>
                {x.label}
              </option>
            );
          })}
        </select>
      );
    case "saklar": {
      const on = p.nilai === true;
      return (
        <div className="flex items-start gap-3">
          <button {...umum} type="button" role="switch" aria-checked={on} className="d-saklar mt-0.5" onClick={() => p.ubah(!on)}>
            <span className="sr-only">{b.label}</span>
          </button>
          <label htmlFor={id} className="cursor-pointer select-none">
            <span className="block text-sm font-semibold text-ink">{b.teks ?? b.label}</span>
            {b.teks && <span className="block text-xs text-muted">{b.label}</span>}
          </label>
        </div>
      );
    }
    case "gambar":
      return <BidangGambar {...p} />;
    case "galeri":
      return <BidangGaleri {...p} />;
    case "fokus":
      return <BidangFokus {...p} />;
    case "slug":
      return <BidangSlug {...p} />;
    default:
      return null;
  }
}

function Penghitung({ n, maks }: { n: number; maks: number }) {
  const lewat = n > maks;
  return (
    <p className={`mt-1 text-right text-[0.6875rem] tabular-nums ${lewat ? "font-semibold text-[#b42318]" : n > maks * 0.9 ? "text-sun-ink" : "text-muted"}`}>
      {n}/{maks}
    </p>
  );
}

/* ---------- Paragraf (string[] diedit sebagai satu teks) ---------- */

const pecahParagraf = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((x) => x.trim())
    .filter(Boolean);

function BidangParagraf(p: PropsMasukan) {
  const arr = Array.isArray(p.nilai) ? (p.nilai as string[]) : [];
  const [teks, setTeks] = useState(() => arr.join("\n\n"));
  const [terakhir, setTerakhir] = useState(() => JSON.stringify(arr));
  // Nilai berubah dari luar (mis. setelah disimpan): samakan teks.
  const masuk = JSON.stringify(arr);
  if (masuk !== terakhir) {
    setTerakhir(masuk);
    setTeks(arr.join("\n\n"));
  }
  const kata = teks.trim() ? teks.trim().split(/\s+/).length : 0;
  return (
    <div>
      <textarea
        id={p.id}
        aria-invalid={p.salah || undefined}
        aria-describedby={p.keterangan}
        className="d-input min-h-[260px]"
        rows={12}
        value={teks}
        placeholder={(p.bidang as { placeholder?: string }).placeholder ?? "Tulis paragraf pertama…\n\nParagraf kedua dipisah satu baris kosong."}
        onChange={(e) => {
          setTeks(e.target.value);
          const baru = pecahParagraf(e.target.value);
          setTerakhir(JSON.stringify(baru));
          p.ubah(baru);
        }}
      />
      <p className="mt-1 text-right text-[0.6875rem] text-muted">
        {arr.length} paragraf · {kata} kata
      </p>
    </div>
  );
}

/* ---------- Daftar teks (string[]) ---------- */

function BidangDaftarTeks(p: PropsMasukan) {
  const b = p.bidang as Extract<Bidang, { jenis: "daftarTeks" }>;
  const arr = Array.isArray(p.nilai) ? (p.nilai as string[]) : [];
  const ref = useRef<HTMLDivElement>(null);
  const ubah = p.ubah as Pengubah<string[]>;
  const fokusKe = (i: number) => requestAnimationFrame(() => ref.current?.querySelectorAll("input")[i]?.focus());
  const label = b.labelItem ?? "baris";

  return (
    <div ref={ref} className="flex flex-col gap-2" id={p.id} aria-describedby={p.keterangan}>
      {arr.length === 0 && <p className="text-sm text-muted">Belum ada {label}.</p>}
      {arr.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted">{i + 1}.</span>
          <input
            className="d-input d-input-kecil"
            value={v}
            placeholder={b.placeholder}
            aria-label={`${b.label} ${i + 1}`}
            onChange={(e) => ubah((lama) => (lama ?? []).map((x, j) => (j === i ? e.target.value : x)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                ubah((lama) => [...(lama ?? []).slice(0, i + 1), "", ...(lama ?? []).slice(i + 1)]);
                fokusKe(i + 1);
              } else if (e.key === "Backspace" && v === "" && arr.length > 0) {
                e.preventDefault();
                ubah((lama) => (lama ?? []).filter((_, j) => j !== i));
                fokusKe(Math.max(0, i - 1));
              }
            }}
            onPaste={(e) => {
              const isi = e.clipboardData.getData("text");
              if (!isi.includes("\n")) return;
              e.preventDefault();
              const baris = isi.split(/\r?\n/).map((x) => x.replace(/^\s*[-•*\d.)]+\s*/, "").trim()).filter(Boolean);
              ubah((lama) => [...(lama ?? []).slice(0, i), ...(v ? [v] : []), ...baris, ...(lama ?? []).slice(i + 1)]);
            }}
          />
          <TombolUrut naik={() => ubah((l) => pindah(l ?? [], i, i - 1))} turun={() => ubah((l) => pindah(l ?? [], i, i + 1))} awal={i === 0} akhir={i === arr.length - 1} />
          <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-ikon d-btn-kecil" onClick={() => ubah((l) => (l ?? []).filter((_, j) => j !== i))} aria-label={`Hapus ${label} ${i + 1}`} title="Hapus">
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          className="d-btn d-btn-garis d-btn-kecil"
          onClick={() => {
            ubah((l) => [...(l ?? []), ""]);
            fokusKe(arr.length);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Tambah {label}
        </button>
        <span className="ml-3 text-[0.6875rem] text-muted">Tip: tekan Enter untuk baris baru, tempel daftar untuk mengisi sekaligus.</span>
      </div>
    </div>
  );
}

function pindah<T>(arr: T[], dari: number, ke: number): T[] {
  if (ke < 0 || ke >= arr.length) return arr;
  const salin = [...arr];
  const [x] = salin.splice(dari, 1);
  salin.splice(ke, 0, x);
  return salin;
}

function TombolUrut({ naik, turun, awal, akhir, horizontal }: { naik: () => void; turun: () => void; awal: boolean; akhir: boolean; horizontal?: boolean }) {
  const [A, B] = horizontal ? [ArrowLeft, ArrowRight] : [ArrowUp, ArrowDown];
  return (
    <>
      <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" onClick={naik} disabled={awal} aria-label="Pindah ke atas" title={horizontal ? "Geser ke kiri" : "Naikkan"}>
        <A size={15} aria-hidden="true" />
      </button>
      <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" onClick={turun} disabled={akhir} aria-label="Pindah ke bawah" title={horizontal ? "Geser ke kanan" : "Turunkan"}>
        <B size={15} aria-hidden="true" />
      </button>
    </>
  );
}

/* ---------- Gambar tunggal ---------- */

function BidangGambar(p: PropsMasukan) {
  const b = p.bidang as Extract<Bidang, { jenis: "gambar" }>;
  const url = p.nilai ? String(p.nilai) : "";
  const [pustaka, setPustaka] = useState(false);
  const [seret, setSeret] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { unggah, proses, sibuk } = useUnggah(useCallback((h: HasilUnggah[]) => p.ubah(h[0].url), [p]));

  return (
    <div
      id={p.id}
      aria-describedby={p.keterangan}
      onDragOver={(e) => {
        e.preventDefault();
        setSeret(true);
      }}
      onDragLeave={() => setSeret(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSeret(false);
        const f = Array.from(e.dataTransfer.files).filter((x) => x.type.startsWith("image/"));
        if (f.length) void unggah([f[0]]);
      }}
      className={`rounded-xl border border-dashed p-3 transition-colors ${seret ? "border-brand bg-brand-soft" : p.salah ? "border-[#d92d20]" : "border-line-2"}`}
    >
      {url ? (
        <div className="relative overflow-hidden rounded-lg bg-paper-3" style={{ aspectRatio: b.rasio ?? "16/10" }}>
          <Image src={url} alt="" fill sizes="(min-width: 1024px) 340px, 90vw" className="object-contain" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-paper-2 px-4 py-8 text-center text-sm text-muted hover:bg-paper-3"
          style={{ aspectRatio: b.rasio ?? "16/10" }}
        >
          <ImagePlus size={26} aria-hidden="true" />
          <span className="font-semibold text-ink">Unggah foto</span>
          <span className="text-xs">atau seret foto ke sini · JPG, PNG, WebP maks. 15 MB</span>
        </button>
      )}
      <div className="mt-2.5">
        <IndikatorUnggah proses={proses} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => input.current?.click()} disabled={sibuk}>
          <Upload size={14} aria-hidden="true" /> {url ? "Ganti" : "Unggah"}
        </button>
        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setPustaka(true)}>
          <FolderOpen size={14} aria-hidden="true" /> Pustaka
        </button>
        {url && (
          <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil" onClick={() => p.ubah("")}>
            <X size={14} aria-hidden="true" /> Lepas
          </button>
        )}
      </div>
      {url && <p className="mt-2 truncate text-[0.6875rem] text-muted" title={url}>{url}</p>}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          void unggah(Array.from(e.target.files ?? []).slice(0, 1));
          e.target.value = "";
        }}
      />
      <PemilihMedia buka={pustaka} tutup={() => setPustaka(false)} pilih={(u) => p.ubah(u[0])} judul={`Pilih ${b.label.toLowerCase()}`} />
    </div>
  );
}

/* ---------- Galeri (string[]) ---------- */

function BidangGaleri(p: PropsMasukan) {
  const arr = Array.isArray(p.nilai) ? (p.nilai as string[]) : [];
  const ubah = p.ubah as Pengubah<string[]>;
  const [pustaka, setPustaka] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { unggah, proses, sibuk } = useUnggah(useCallback((h: HasilUnggah[]) => ubah((l) => [...(l ?? []), ...h.map((x) => x.url)]), [ubah]));

  return (
    <div id={p.id} aria-describedby={p.keterangan}>
      {arr.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {arr.map((u, i) => (
            <li key={`${u}-${i}`} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] bg-paper-3">
                <Image src={u} alt="" fill sizes="200px" className="object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 text-[0.6875rem] font-semibold tabular-nums text-ink">{i + 1}</span>
              </div>
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex">
                  <TombolUrut horizontal naik={() => ubah((l) => pindah(l ?? [], i, i - 1))} turun={() => ubah((l) => pindah(l ?? [], i, i + 1))} awal={i === 0} akhir={i === arr.length - 1} />
                </div>
                <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-ikon d-btn-kecil" onClick={() => ubah((l) => (l ?? []).filter((_, j) => j !== i))} aria-label={`Lepas foto ${i + 1}`} title="Lepas">
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <IndikatorUnggah proses={proses} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => input.current?.click()} disabled={sibuk}>
          <Upload size={14} aria-hidden="true" /> Unggah foto
        </button>
        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setPustaka(true)}>
          <FolderOpen size={14} aria-hidden="true" /> Pilih dari pustaka
        </button>
        {arr.length > 0 && <span className="self-center text-xs text-muted">{arr.length} foto</span>}
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          void unggah(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <PemilihMedia banyak buka={pustaka} tutup={() => setPustaka(false)} pilih={(u) => ubah((l) => [...(l ?? []), ...u])} judul="Tambah foto" />
    </div>
  );
}

/* ---------- Titik fokus (object-position) ---------- */

const PRESET_FOKUS = [
  { label: "Atas", nilai: "center top" },
  { label: "Tengah", nilai: "center center" },
  { label: "Bawah", nilai: "center bottom" },
];

function keXY(pos: string): { x: number; y: number } {
  const kata: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const [a = "center", c = "center"] = pos.trim().split(/\s+/);
  const ubah = (s: string) => (s.endsWith("%") ? parseFloat(s) : (kata[s] ?? 50));
  return { x: ubah(a), y: ubah(c) };
}

function BidangFokus(p: PropsMasukan) {
  const b = p.bidang as Extract<Bidang, { jenis: "fokus" }>;
  const gambar = p.induk?.[b.gambar] ? String(p.induk[b.gambar]) : "";
  const pos = p.nilai ? String(p.nilai) : "center center";
  const { x, y } = keXY(pos);
  const ref = useRef<HTMLDivElement>(null);

  if (!gambar) return <p className="text-sm text-muted">Pilih foto terlebih dahulu.</p>;

  const atur = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ("clientX" in e && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const nx = Math.round(((e.clientX - r.left) / r.width) * 100);
      const ny = Math.round(((e.clientY - r.top) / r.height) * 100);
      p.ubah(`${Math.min(100, Math.max(0, nx))}% ${Math.min(100, Math.max(0, ny))}%`);
    }
  };

  return (
    <div id={p.id} aria-describedby={p.keterangan}>
      <div ref={ref} className="relative cursor-crosshair overflow-hidden rounded-lg bg-paper-3" onClick={atur} role="presentation">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gambar} alt="" className="block h-auto w-full select-none" draggable={false} />
        <span
          className="pointer-events-none absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-brand/80 text-white shadow"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <Crosshair size={14} aria-hidden="true" />
        </span>
      </div>
      <p className="d-bantuan mt-1.5">Klik bagian foto yang paling penting (wajah, tulisan) agar tidak terpotong.</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {PRESET_FOKUS.map((f) => (
          <button key={f.nilai} type="button" className={`d-btn d-btn-kecil ${pos === f.nilai ? "d-btn-utama" : "d-btn-garis"}`} onClick={() => p.ubah(f.nilai)}>
            {f.label}
          </button>
        ))}
        <span className="text-[0.6875rem] tabular-nums text-muted">{pos}</span>
      </div>
      <p className="mt-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">Pratinjau potongan</p>
      <div className="mt-1.5 flex items-end gap-2">
        {["16/9", "4/3", "4/5"].map((r) => (
          <div key={r} className="relative overflow-hidden rounded-md bg-paper-3" style={{ aspectRatio: r, width: r === "4/5" ? 56 : 96 }} title={`Rasio ${r}`}>
            <Image src={gambar} alt="" fill sizes="100px" className="object-cover" style={{ objectPosition: pos }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Slug ---------- */

function BidangSlug(p: PropsMasukan) {
  const b = p.bidang as Extract<Bidang, { jenis: "slug" }>;
  const nilai = p.nilai ? String(p.nilai) : "";
  const otomatis = jadikanSlug(String(p.induk?.[b.dari] ?? ""));
  return (
    <div>
      <div className="flex items-stretch overflow-hidden rounded-[10px] border border-line-2 bg-white focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--color-brand-soft)]">
        {b.awalan && <span className="flex items-center border-r border-line bg-paper-2 px-3 text-sm text-muted">{b.awalan}</span>}
        <input
          id={p.id}
          aria-invalid={p.salah || undefined}
          aria-describedby={p.keterangan}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[0.9375rem] text-ink outline-none"
          value={nilai}
          placeholder={otomatis || "terisi-otomatis-dari-judul"}
          onChange={(e) => p.ubah(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
        />
        {otomatis && nilai !== otomatis && (
          <button type="button" className="flex items-center gap-1.5 border-l border-line px-3 text-xs font-semibold text-brand hover:bg-brand-soft" onClick={() => p.ubah(otomatis)} title="Buat ulang dari judul">
            <RefreshCw size={13} aria-hidden="true" /> Dari judul
          </button>
        )}
      </div>
      {!nilai && otomatis && <p className="mt-1 text-[0.6875rem] text-muted">Akan dipakai: {b.awalan}{otomatis}</p>}
    </div>
  );
}

/* ---------- Daftar objek (repeater) ---------- */

function BidangDaftar(p: PropsBaris) {
  const b = p.bidang as Extract<Bidang, { jenis: "daftar" }>;
  const arr = Array.isArray(p.nilai) ? (p.nilai as Rekaman[]) : [];
  const ubah = p.ubah as Pengubah<Rekaman[]>;
  const kunci = p.jalur + b.nama;
  const [tertutup, setTertutup] = useState<Set<number>>(() => (arr.length > 4 ? new Set(arr.map((_, i) => i)) : new Set()));
  const pesanGalat = p.galat[kunci];
  const adaGalatDi = (i: number) => Object.keys(p.galat).some((k) => k.startsWith(`${kunci}.${i}.`));

  const tambah = () => {
    ubah((l) => [...(l ?? []), objekAwal(b.bidang)]);
    setTertutup((t) => {
      const n = new Set(t);
      n.delete(arr.length);
      return n;
    });
  };
  const alih = (i: number) =>
    setTertutup((t) => {
      const n = new Set(t);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div data-jalur={kunci}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="d-label">
          {b.label} <span className="font-normal text-muted">({arr.length})</span>
        </p>
        {arr.length > 1 && (
          <div className="flex gap-1">
            <button type="button" className="d-btn d-btn-hantu d-btn-kecil" onClick={() => setTertutup(new Set())}>
              Buka semua
            </button>
            <button type="button" className="d-btn d-btn-hantu d-btn-kecil" onClick={() => setTertutup(new Set(arr.map((_, i) => i)))}>
              Tutup semua
            </button>
          </div>
        )}
      </div>
      {b.bantuan && <p className="d-bantuan mb-2">{b.bantuan}</p>}
      <ol className="flex flex-col gap-2.5">
        {arr.map((item, i) => {
          const judul = (b.judulItem && String(item?.[b.judulItem] ?? "").trim()) || `${b.labelItem} ${i + 1}`;
          const tutup = tertutup.has(i) && !adaGalatDi(i);
          return (
            <li key={i} className={`rounded-xl border bg-white ${adaGalatDi(i) ? "border-[#fda29b]" : "border-line"}`}>
              <div className="flex items-center gap-1 py-1.5 pl-2 pr-1.5">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-paper-2" onClick={() => alih(i)} aria-expanded={!tutup}>
                  <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-muted transition-transform ${tutup ? "-rotate-90" : ""}`} />
                  <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{i + 1}.</span>
                  <span className="truncate text-sm font-semibold text-ink">{judul}</span>
                </button>
                <TombolUrut naik={() => ubah((l) => pindah(l ?? [], i, i - 1))} turun={() => ubah((l) => pindah(l ?? [], i, i + 1))} awal={i === 0} akhir={i === arr.length - 1} />
                <button
                  type="button"
                  className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil"
                  onClick={() => ubah((l) => [...(l ?? []).slice(0, i + 1), structuredClone((l ?? [])[i]), ...(l ?? []).slice(i + 1)])}
                  aria-label={`Gandakan ${judul}`}
                  title="Gandakan"
                >
                  <Copy size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="d-btn d-btn-hantu-bahaya d-btn-ikon d-btn-kecil"
                  onClick={() => {
                    if (!kosong(item) && !window.confirm(`Hapus “${judul}”?`)) return;
                    ubah((l) => (l ?? []).filter((_, j) => j !== i));
                  }}
                  aria-label={`Hapus ${judul}`}
                  title="Hapus"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              {!tutup && (
                <div className="border-t border-line p-4">
                  <DaftarBidang
                    bidang={b.bidang}
                    nilai={item ?? {}}
                    ubah={(v) => ubah((l) => (l ?? []).map((x, j) => (j === i ? terapkan(v, x ?? {}) : x)))}
                    galat={p.galat}
                    jalur={`${kunci}.${i}.`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {arr.length === 0 && <p className="rounded-xl border border-dashed border-line-2 px-4 py-5 text-center text-sm text-muted">Belum ada {b.labelItem.toLowerCase()}.</p>}
      {(!b.maksItem || arr.length < b.maksItem) && (
        <button type="button" className="d-btn d-btn-garis d-btn-kecil mt-2.5" onClick={tambah}>
          <Plus size={15} aria-hidden="true" /> Tambah {b.labelItem.toLowerCase()}
        </button>
      )}
      {pesanGalat && <p className="d-galat mt-1.5">{pesanGalat}</p>}
    </div>
  );
}

