"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, FolderOpen, LoaderCircle, Search, Trash2, Upload } from "lucide-react";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { IndikatorUnggah, ukuranBaca, useUnggah, type BerkasMedia, type HasilUnggah } from "@/components/dasbor/media";
import { Kosong, Lencana, waktuLengkap } from "@/components/dasbor/ui";

export function KelolaMedia() {
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const input = useRef<HTMLInputElement>(null);
  const [berkas, setBerkas] = useState<BerkasMedia[] | null>(null);
  const [cari, setCari] = useState("");
  const [sumber, setSumber] = useState<"semua" | "unggahan" | "situs">("semua");
  const [aktif, setAktif] = useState<BerkasMedia | null>(null);
  const [pakai, setPakai] = useState<string[] | null>(null);
  const [batas, setBatas] = useState(60);

  const muat = useCallback(async () => {
    const r = await fetch("/api/admin/media", { cache: "no-store" });
    if (r.ok) setBerkas((await r.json()).berkas);
    else toast("Gagal memuat pustaka foto.", "galat");
  }, [toast]);

  useEffect(() => {
    let batal = false;
    fetch("/api/admin/media", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !batal && setBerkas(d.berkas))
      .catch(() => !batal && toast("Gagal memuat pustaka foto.", "galat"));
    return () => {
      batal = true;
    };
  }, [toast]);

  const pilih = (b: BerkasMedia) => {
    setAktif(b);
    setPakai(null);
    fetch(`/api/admin/media?pakai=${encodeURIComponent(b.url)}`)
      .then((r) => r.json())
      .then((d) => setPakai(d.dipakai ?? []))
      .catch(() => setPakai([]));
  };

  const { unggah, proses, sibuk } = useUnggah(
    useCallback(
      (h: HasilUnggah[]) => {
        toast(`${h.length} foto diunggah.`);
        void muat();
      },
      [muat, toast],
    ),
  );

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return (berkas ?? []).filter((b) => (sumber === "semua" || b.sumber === sumber) && (!q || b.url.toLowerCase().includes(q)));
  }, [berkas, cari, sumber]);

  const hapus = async (b: BerkasMedia) => {
    if (!(await konfirmasi({ judul: "Hapus foto ini?", pesan: "Foto dihapus permanen dari server.", tombol: "Hapus", bahaya: true }))) return;
    const r = await fetch(`/api/admin/media?url=${encodeURIComponent(b.url)}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return toast(d.pesan ?? "Gagal menghapus foto.", "galat");
    toast("Foto dihapus.");
    setAktif(null);
    void muat();
  };

  const jumlahUnggahan = (berkas ?? []).filter((b) => b.sumber === "unggahan").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="d-kartu mb-4 flex flex-wrap items-center gap-2 p-3">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Cari foto</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="d-input d-input-kecil pl-9" placeholder="Cari nama berkas…" value={cari} onChange={(e) => setCari(e.target.value)} />
          </label>
          <select className="d-input d-input-kecil w-auto" value={sumber} onChange={(e) => setSumber(e.target.value as typeof sumber)} aria-label="Sumber">
            <option value="semua">Semua ({berkas?.length ?? 0})</option>
            <option value="unggahan">Unggahan dashboard ({jumlahUnggahan})</option>
            <option value="situs">Foto bawaan situs ({(berkas?.length ?? 0) - jumlahUnggahan})</option>
          </select>
          <button type="button" className="d-btn d-btn-utama d-btn-kecil" onClick={() => input.current?.click()} disabled={sibuk}>
            {sibuk ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />} Unggah foto
          </button>
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
        </div>
        <IndikatorUnggah proses={proses} />
        {!berkas ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="d-kerangka aspect-square" />
            ))}
          </div>
        ) : tampil.length === 0 ? (
          <div className="d-kartu">
            <Kosong ikon={FolderOpen} judul="Tidak ada foto" teks="Unggah foto atau ubah pencarian." />
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {tampil.slice(0, batas).map((b) => (
                <li key={b.url}>
                  <button
                    type="button"
                    onClick={() => pilih(b)}
                    className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-paper-3 ${aktif?.url === b.url ? "border-brand" : "border-transparent hover:border-line-2"}`}
                    title={b.nama}
                  >
                    <Image src={b.url} alt="" fill sizes="160px" className="object-cover" />
                    {b.sumber === "unggahan" && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1 text-[0.625rem] font-semibold text-brand-deep">Unggahan</span>}
                  </button>
                </li>
              ))}
            </ul>
            {tampil.length > batas && (
              <div className="mt-4 text-center">
                <button type="button" className="d-btn d-btn-garis" onClick={() => setBatas((n) => n + 60)}>
                  Tampilkan lebih banyak ({tampil.length - batas} lagi)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <aside className="d-kartu h-fit p-5 xl:sticky xl:top-24">
        {!aktif ? (
          <p className="py-8 text-center text-sm text-muted">Klik foto untuk melihat detail, menyalin alamat, atau menghapusnya.</p>
        ) : (
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-3">
              <Image src={aktif.url} alt="" fill sizes="320px" className="object-contain" />
            </div>
            <p className="mt-3 break-all text-sm font-semibold text-ink">{aktif.nama}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted">Sumber</dt>
              <dd>{aktif.sumber === "unggahan" ? <Lencana warna="hijau">Unggahan dashboard</Lencana> : <Lencana>Bawaan situs</Lencana>}</dd>
              <dt className="text-muted">Ukuran</dt>
              <dd className="text-ink">{ukuranBaca(aktif.ukuran)}</dd>
              <dt className="text-muted">Tanggal</dt>
              <dd className="text-ink">{waktuLengkap(aktif.diubah)}</dd>
              <dt className="text-muted">Dipakai di</dt>
              <dd className="text-ink">{pakai === null ? "memeriksa…" : pakai.length ? pakai.join(", ") : "belum dipakai"}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="d-btn d-btn-garis d-btn-kecil"
                onClick={() => {
                  void navigator.clipboard.writeText(aktif.url);
                  toast("Alamat foto disalin.", "info");
                }}
              >
                <Copy size={14} aria-hidden="true" /> Salin alamat
              </button>
              <a href={aktif.url} target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis d-btn-kecil">
                <ExternalLink size={14} aria-hidden="true" /> Buka
              </a>
            </div>
            {aktif.sumber === "unggahan" && (
              <button
                type="button"
                className="d-btn d-btn-hantu-bahaya d-btn-kecil mt-4"
                disabled={!pakai || pakai.length > 0}
                title={pakai?.length ? "Lepas dulu dari konten yang memakainya" : undefined}
                onClick={() => void hapus(aktif)}
              >
                <Trash2 size={14} aria-hidden="true" /> Hapus foto
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
