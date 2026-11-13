"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  EllipsisVertical,
  ExternalLink,
  EyeOff,
  GripVertical,
  ImageOff,
  ListOrdered,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { KOLEKSI } from "@/lib/cms/modul";
import type { Rekaman } from "@/lib/cms/bidang";
import type { NamaKoleksi, Status } from "@/lib/konten/tipe";
import { aturStatus, duplikatItem, hapusItem, simpanUrutan, tambahBanyak } from "@/app/dashboard/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kosong, Lencana, waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";
import { IndikatorUnggah, useUnggah, type HasilUnggah } from "@/components/dasbor/media";

type Item = Rekaman & { id: string; status?: Status; diubah?: string; oleh?: string; contoh?: boolean };
const PER_HALAMAN = 20;

export function DaftarKonten({ kunci, items }: { kunci: NamaKoleksi; items: Item[] }) {
  const modul = KOLEKSI[kunci];
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();

  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [tabStatus, setTabStatus] = useState<"semua" | Status>("semua");
  const [hanyaContoh, setHanyaContoh] = useState(false);
  const [urut, setUrut] = useState<"bawaan" | "judul" | "diubah">("bawaan");
  const [halaman, setHalaman] = useState(1);
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [sibuk, setSibuk] = useState(false);
  const [modeUrut, setModeUrut] = useState<string[] | null>(null);
  const seret = useRef<number | null>(null);

  const opsiFilter = useMemo(
    () =>
      (modul.filter ?? []).map((f) => ({
        ...f,
        daftar: f.opsi ? [...f.opsi] : Array.from(new Set(items.map((x) => f.ambil(x as never)).filter(Boolean))).sort().reverse(),
      })),
    [modul, items],
  );

  const jumlah = useMemo(
    () => ({
      semua: items.length,
      terbit: items.filter((x) => x.status !== "draf").length,
      draf: items.filter((x) => x.status === "draf").length,
      contoh: items.filter((x) => modul.contoh?.(x as never)).length,
    }),
    [items, modul],
  );

  const tersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    let hasil = items.filter((x) => {
      if (modul.status && tabStatus !== "semua" && (x.status ?? "terbit") !== tabStatus) return false;
      if (hanyaContoh && !modul.contoh?.(x as never)) return false;
      for (const f of modul.filter ?? []) if (filter[f.kunci] && f.ambil(x as never) !== filter[f.kunci]) return false;
      if (q) {
        const teks = [modul.judul(x as never), modul.sub?.(x as never), ...(modul.kolom ?? []).map((k) => k.isi(x as never))].join(" ").toLowerCase();
        if (!teks.includes(q)) return false;
      }
      return true;
    });
    if (urut === "judul") hasil = [...hasil].sort((a, b) => modul.judul(a as never).localeCompare(modul.judul(b as never), "id"));
    else if (urut === "diubah") hasil = [...hasil].sort((a, b) => String(b.diubah ?? "").localeCompare(String(a.diubah ?? "")));
    else if (modul.urutan !== "manual") {
      const arah = modul.urutan === "tanggal-turun" ? -1 : 1;
      hasil = [...hasil].sort((a, b) => {
        const ta = String(a.tanggal ?? ""), tb = String(b.tanggal ?? "");
        if (!ta !== !tb) return ta ? -1 : 1;
        return ta.localeCompare(tb) * arah;
      });
    }
    return hasil;
  }, [items, cari, filter, tabStatus, hanyaContoh, urut, modul]);

  const adaSaring = !!cari || Object.values(filter).some(Boolean) || tabStatus !== "semua" || hanyaContoh || urut !== "bawaan";
  const totalHalaman = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN));
  const hal = Math.min(halaman, totalHalaman);
  const tampil = modeUrut
    ? modeUrut.map((id) => items.find((x) => x.id === id)).filter((x): x is Item => !!x)
    : tersaring.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);

  const pilihSemua = tampil.length > 0 && tampil.every((x) => terpilih.has(x.id));

  const sesudahAksi = (pesan: string, ok: boolean) => {
    toast(pesan, ok ? "sukses" : "galat");
    if (ok) {
      setTerpilih(new Set());
      router.refresh();
    }
  };

  const hapus = async (ids: string[]) => {
    const nama = ids.length === 1 ? `“${modul.judul(items.find((x) => x.id === ids[0]) as never)}”` : `${ids.length} ${modul.satuan}`;
    if (!(await konfirmasi({ judul: `Hapus ${ids.length === 1 ? modul.satuan : `${ids.length} ${modul.satuan}`}?`, pesan: `${nama} akan dihapus permanen dan hilang dari situs.`, tombol: "Hapus", bahaya: true }))) return;
    setSibuk(true);
    const h = await hapusItem(kunci, ids);
    setSibuk(false);
    sesudahAksi(h.pesan, h.ok);
  };

  const ubahStatus = async (ids: string[], status: Status) => {
    setSibuk(true);
    const h = await aturStatus(kunci, ids, status);
    setSibuk(false);
    sesudahAksi(h.pesan, h.ok);
  };

  const gandakan = async (id: string) => {
    const h = await duplikatItem(kunci, id);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok && h.id) router.push(`/dashboard/${kunci}/${h.id}`);
  };

  const pindahUrut = (dari: number, ke: number) =>
    setModeUrut((m) => {
      if (!m || ke < 0 || ke >= m.length) return m;
      const s = [...m];
      const [x] = s.splice(dari, 1);
      s.splice(ke, 0, x);
      return s;
    });

  const simpanUrut = async () => {
    if (!modeUrut) return;
    setSibuk(true);
    const h = await simpanUrutan(kunci, modeUrut);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setModeUrut(null);
      router.refresh();
    }
  };

  const bisaUrut = modul.urutan === "manual" && items.length > 1;

  return (
    <div>
      {/* Bilah alat */}
      <div className="d-kartu mb-4 p-3">
        {modeUrut ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex-1 text-sm text-ink">
              <strong>Mode atur urutan.</strong> Seret baris atau pakai tombol panah, lalu simpan. Urutan ini dipakai di situs.
            </p>
            <button type="button" className="d-btn d-btn-garis" onClick={() => setModeUrut(null)} disabled={sibuk}>
              Batal
            </button>
            <button type="button" className="d-btn d-btn-utama" onClick={() => void simpanUrut()} disabled={sibuk}>
              {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan urutan
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-[220px] flex-1">
              <span className="sr-only">Cari {modul.satuan}</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                className="d-input d-input-kecil pl-9"
                placeholder={`Cari ${modul.satuan}…`}
                value={cari}
                onChange={(e) => {
                  setCari(e.target.value);
                  setHalaman(1);
                }}
              />
            </label>
            {opsiFilter.map((f) => (
              <select
                key={f.kunci}
                className="d-input d-input-kecil w-auto"
                aria-label={f.label}
                value={filter[f.kunci] ?? ""}
                onChange={(e) => {
                  setFilter((x) => ({ ...x, [f.kunci]: e.target.value }));
                  setHalaman(1);
                }}
              >
                <option value="">{f.label}: semua</option>
                {f.daftar.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
            <select className="d-input d-input-kecil w-auto" aria-label="Urutkan" value={urut} onChange={(e) => setUrut(e.target.value as typeof urut)}>
              <option value="bawaan">{modul.urutan === "manual" ? "Urutan situs" : modul.urutan === "tanggal-turun" ? "Tanggal terbaru" : "Tanggal terdekat"}</option>
              <option value="judul">Judul A–Z</option>
              <option value="diubah">Terakhir diubah</option>
            </select>
            {jumlah.contoh > 0 && (
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-ink-2 hover:bg-paper-2">
                <input type="checkbox" className="d-kotak-centang" checked={hanyaContoh} onChange={(e) => setHanyaContoh(e.target.checked)} />
                Hanya contoh ({jumlah.contoh})
              </label>
            )}
            {adaSaring && (
              <button
                type="button"
                className="d-btn d-btn-hantu d-btn-kecil"
                onClick={() => {
                  setCari("");
                  setFilter({});
                  setTabStatus("semua");
                  setHanyaContoh(false);
                  setUrut("bawaan");
                }}
              >
                <X size={14} aria-hidden="true" /> Reset
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {bisaUrut && (
                <button
                  type="button"
                  className="d-btn d-btn-garis d-btn-kecil"
                  onClick={() => {
                    setTerpilih(new Set());
                    setModeUrut(items.map((x) => x.id));
                  }}
                  title="Atur urutan tampil di situs"
                >
                  <ListOrdered size={15} aria-hidden="true" /> Atur urutan
                </button>
              )}
              {modul.unggahMassal && <UnggahMassal kunci={kunci} />}
            </div>
          </div>
        )}

        {modul.status && !modeUrut && (
          <div className="mt-3 flex gap-1 border-t border-line pt-3" role="tablist" aria-label="Status">
            {(["semua", "terbit", "draf"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tabStatus === t}
                onClick={() => {
                  setTabStatus(t);
                  setHalaman(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tabStatus === t ? "bg-brand-soft text-brand-deep" : "text-ink-2 hover:bg-paper-2"}`}
              >
                {t === "semua" ? "Semua" : t === "terbit" ? "Terbit" : "Draf"} <span className="font-normal text-muted">({jumlah[t]})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bilah pilihan massal */}
      {terpilih.size > 0 && !modeUrut && (
        <div className="sticky top-[4.5rem] z-10 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-brand bg-brand-soft px-4 py-2.5">
          <p className="mr-auto text-sm font-semibold text-brand-deep">{terpilih.size} dipilih</p>
          {modul.status && (
            <>
              <button type="button" className="d-btn d-btn-garis d-btn-kecil" disabled={sibuk} onClick={() => void ubahStatus([...terpilih], "terbit")}>
                <Send size={14} aria-hidden="true" /> Terbitkan
              </button>
              <button type="button" className="d-btn d-btn-garis d-btn-kecil" disabled={sibuk} onClick={() => void ubahStatus([...terpilih], "draf")}>
                <EyeOff size={14} aria-hidden="true" /> Jadikan draf
              </button>
            </>
          )}
          <button type="button" className="d-btn d-btn-bahaya d-btn-kecil" disabled={sibuk} onClick={() => void hapus([...terpilih])}>
            <Trash2 size={14} aria-hidden="true" /> Hapus
          </button>
          <button type="button" className="d-btn d-btn-hantu d-btn-kecil" onClick={() => setTerpilih(new Set())}>
            Batal
          </button>
        </div>
      )}

      {/* Daftar */}
      <div className="d-kartu overflow-hidden">
        {tampil.length === 0 ? (
          items.length === 0 ? (
            <Kosong
              ikon={modul.ikon}
              judul={`Belum ada ${modul.satuan}`}
              teks={modul.deskripsi}
              aksi={
                <Link href={`/dashboard/${kunci}/baru`} className="d-btn d-btn-utama">
                  <Plus size={16} aria-hidden="true" /> Tambah {modul.satuan}
                </Link>
              }
            />
          ) : (
            <Kosong ikon={Search} judul="Tidak ada yang cocok" teks="Coba kata kunci lain atau reset filter." />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="d-tabel">
              <thead>
                <tr>
                  <th className="w-10">
                    {modeUrut ? (
                      <span className="sr-only">Urutan</span>
                    ) : (
                      <input
                        type="checkbox"
                        className="d-kotak-centang"
                        aria-label="Pilih semua di halaman ini"
                        checked={pilihSemua}
                        onChange={() =>
                          setTerpilih((t) => {
                            const n = new Set(t);
                            tampil.forEach((x) => (pilihSemua ? n.delete(x.id) : n.add(x.id)));
                            return n;
                          })
                        }
                      />
                    )}
                  </th>
                  <th>{modul.label}</th>
                  {(modul.kolom ?? []).map((k) => (
                    <th key={k.label} className="hidden md:table-cell">
                      {k.label}
                    </th>
                  ))}
                  <th className="hidden lg:table-cell">Diubah</th>
                  <th className="w-12">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((x, i) => {
                  const gambar = modul.gambar?.(x as never);
                  const publik = modul.publik?.(x as never);
                  return (
                    <tr
                      key={x.id}
                      data-pilih={terpilih.has(x.id) || undefined}
                      draggable={!!modeUrut}
                      onDragStart={() => (seret.current = i)}
                      onDragOver={(e) => modeUrut && e.preventDefault()}
                      onDrop={() => {
                        if (seret.current !== null) pindahUrut(seret.current, i);
                        seret.current = null;
                      }}
                      className={modeUrut ? "cursor-grab" : ""}
                    >
                      <td>
                        {modeUrut ? (
                          <span className="flex items-center gap-1 text-muted">
                            <GripVertical size={16} aria-hidden="true" />
                            <span className="w-5 text-xs tabular-nums">{i + 1}</span>
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            className="d-kotak-centang"
                            aria-label={`Pilih ${modul.judul(x as never)}`}
                            checked={terpilih.has(x.id)}
                            onChange={() =>
                              setTerpilih((t) => {
                                const n = new Set(t);
                                if (n.has(x.id)) n.delete(x.id);
                                else n.add(x.id);
                                return n;
                              })
                            }
                          />
                        )}
                      </td>
                      <td className="min-w-[260px]">
                        <div className="flex items-center gap-3">
                          {modul.gambar && (
                            <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper-3">
                              {gambar ? (
                                <Image src={gambar} alt="" fill sizes="64px" className="object-cover" />
                              ) : (
                                <ImageOff size={16} className="absolute inset-0 m-auto text-muted" aria-hidden="true" />
                              )}
                            </span>
                          )}
                          <div className="min-w-0">
                            {modeUrut ? (
                              <span className="line-clamp-1 font-semibold text-ink">{modul.judul(x as never)}</span>
                            ) : (
                              <Link href={`/dashboard/${kunci}/${x.id}`} className="line-clamp-2 font-semibold text-ink hover:text-brand hover:underline">
                                {modul.judul(x as never) || "(tanpa judul)"}
                              </Link>
                            )}
                            {modul.sub && <p className="line-clamp-1 text-xs text-muted">{modul.sub(x as never)}</p>}
                            <div className="mt-1 flex flex-wrap gap-1 empty:hidden">
                              {modul.status && x.status === "draf" && <Lencana warna="kuning">Draf</Lencana>}
                              {modul.contoh?.(x as never) && <Lencana>Contoh</Lencana>}
                              {kunci === "hero" && x.aktif === false && <Lencana>Disembunyikan</Lencana>}
                              {kunci === "poster-prestasi" && x.beranda === true && <Lencana warna="hijau">Beranda</Lencana>}
                            </div>
                          </div>
                        </div>
                      </td>
                      {(modul.kolom ?? []).map((k) => (
                        <td key={k.label} className="hidden whitespace-nowrap text-ink-2 md:table-cell">
                          {k.isi(x as never)}
                        </td>
                      ))}
                      <td className="hidden whitespace-nowrap text-xs text-muted lg:table-cell" title={waktuLengkap(x.diubah)}>
                        {waktuRelatif(x.diubah)}
                        {x.oleh && <span className="block">{String(x.oleh)}</span>}
                      </td>
                      <td>
                        {modeUrut ? (
                          <div className="flex">
                            <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" disabled={i === 0} onClick={() => pindahUrut(i, i - 1)} aria-label="Naikkan">
                              <ArrowUp size={15} aria-hidden="true" />
                            </button>
                            <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" disabled={i === tampil.length - 1} onClick={() => pindahUrut(i, i + 1)} aria-label="Turunkan">
                              <ArrowDown size={15} aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <MenuBaris>
                            <Link href={`/dashboard/${kunci}/${x.id}`} className="d-menu-item">
                              <Pencil size={15} aria-hidden="true" /> Ubah
                            </Link>
                            {publik && (
                              <a href={publik} target="_blank" rel="noopener noreferrer" className="d-menu-item">
                                <ExternalLink size={15} aria-hidden="true" /> Lihat di situs
                              </a>
                            )}
                            <button type="button" className="d-menu-item" onClick={() => void gandakan(x.id)}>
                              <Copy size={15} aria-hidden="true" /> Gandakan
                            </button>
                            {modul.status &&
                              (x.status === "draf" ? (
                                <button type="button" className="d-menu-item" onClick={() => void ubahStatus([x.id], "terbit")}>
                                  <Send size={15} aria-hidden="true" /> Terbitkan
                                </button>
                              ) : (
                                <button type="button" className="d-menu-item" onClick={() => void ubahStatus([x.id], "draf")}>
                                  <EyeOff size={15} aria-hidden="true" /> Jadikan draf
                                </button>
                              ))}
                            <button type="button" className="d-menu-item text-[#b42318]" onClick={() => void hapus([x.id])}>
                              <Trash2 size={15} aria-hidden="true" /> Hapus
                            </button>
                          </MenuBaris>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Halaman */}
      {!modeUrut && tersaring.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            Menampilkan {(hal - 1) * PER_HALAMAN + 1}–{Math.min(hal * PER_HALAMAN, tersaring.length)} dari {tersaring.length}
            {tersaring.length !== items.length && ` (total ${items.length})`}
          </p>
          {totalHalaman > 1 && (
            <div className="flex items-center gap-1">
              <button type="button" className="d-btn d-btn-garis d-btn-kecil" disabled={hal <= 1} onClick={() => setHalaman(hal - 1)}>
                Sebelumnya
              </button>
              <span className="px-2 tabular-nums">
                {hal} / {totalHalaman}
              </span>
              <button type="button" className="d-btn d-btn-garis d-btn-kecil" disabled={hal >= totalHalaman} onClick={() => setHalaman(hal + 1)}>
                Berikutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Menu titik tiga per baris. */
function MenuBaris({ children }: { children: React.ReactNode }) {
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!buka) return;
    const luar = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setBuka(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    document.addEventListener("mousedown", luar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", luar);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);
  return (
    <div ref={ref} className="relative">
      <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" aria-label="Aksi" aria-haspopup="menu" aria-expanded={buka} onClick={() => setBuka((b) => !b)}>
        <EllipsisVertical size={16} aria-hidden="true" />
      </button>
      {buka && (
        <div role="menu" className="d-menu absolute right-0 top-[calc(100%+4px)] z-20 w-48 py-1" onClick={() => setBuka(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- Unggah massal (galeri) ---------- */

const judulDariNama = (nama: string) =>
  nama
    .replace(/\.[^.]+$/, "")
    .replace(/-[0-9a-f]{6}$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

function UnggahMassal({ kunci }: { kunci: NamaKoleksi }) {
  const modul = KOLEKSI[kunci];
  const cfg = modul.unggahMassal!;
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [baris, setBaris] = useState<{ url: string; judul: string }[]>([]);
  const [bersama, setBersama] = useState<Rekaman>(cfg.bawaan);
  const [sibuk, setSibuk] = useState(false);
  const pilihKategori = modul.bidang.find((b) => b.nama === "kategori");

  const { unggah, proses, sibuk: mengunggah } = useUnggah((hasil: HasilUnggah[]) => {
    setBaris((b) => [...b, ...hasil.map((h) => ({ url: h.url, judul: judulDariNama(h.nama) }))]);
    if (!dialog.current?.open) dialog.current?.showModal();
  });

  const simpan = async () => {
    setSibuk(true);
    const h = await tambahBanyak(
      kunci,
      baris.map((b) => ({ ...bersama, [cfg.bidangGambar]: b.url, [cfg.bidangJudul]: b.judul })),
    );
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setBaris([]);
      dialog.current?.close();
      router.refresh();
    }
  };

  return (
    <>
      <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => input.current?.click()} disabled={mengunggah}>
        {mengunggah ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />} Unggah banyak foto
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
      {mengunggah && (
        <div className="fixed bottom-6 left-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2 rounded-xl border border-line bg-white p-4 shadow-xl">
          <p className="mb-2 text-sm font-semibold text-ink">Mengunggah foto…</p>
          <IndikatorUnggah proses={proses} />
        </div>
      )}
      <dialog ref={dialog} className="d-dialog w-[min(96vw,760px)]" aria-labelledby="judul-unggah-massal">
        <div className="flex max-h-[86svh] flex-col">
          <div className="border-b border-line px-5 py-4">
            <h2 id="judul-unggah-massal" className="text-base font-semibold text-ink">
              Beri judul {baris.length} foto
            </h2>
            <p className="mt-0.5 text-sm text-muted">Judul diambil dari nama berkas; ubah bila perlu.</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {pilihKategori && pilihKategori.jenis === "pilihan" && (
              <label className="mb-4 flex flex-wrap items-center gap-3">
                <span className="d-label">Kategori untuk semua foto</span>
                <select className="d-input d-input-kecil w-auto" value={String(bersama.kategori ?? "")} onChange={(e) => setBersama((b) => ({ ...b, kategori: e.target.value }))}>
                  {pilihKategori.opsi.map((o) => {
                    const v = typeof o === "string" ? o : o.nilai;
                    return (
                      <option key={v} value={v}>
                        {typeof o === "string" ? o : o.label}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}
            <ul className="flex flex-col gap-3">
              {baris.map((b, i) => (
                <li key={b.url} className="flex items-center gap-3">
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-paper-3">
                    <Image src={b.url} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <input
                    className="d-input d-input-kecil"
                    value={b.judul}
                    aria-label={`Judul foto ${i + 1}`}
                    onChange={(e) => setBaris((x) => x.map((y, j) => (j === i ? { ...y, judul: e.target.value } : y)))}
                  />
                  <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-ikon d-btn-kecil" onClick={() => setBaris((x) => x.filter((_, j) => j !== i))} aria-label="Buang dari daftar">
                    <X size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between gap-2 border-t border-line px-5 py-3">
            <button type="button" className="d-btn d-btn-garis" onClick={() => input.current?.click()}>
              <Plus size={15} aria-hidden="true" /> Tambah foto
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="d-btn d-btn-garis"
                onClick={() => {
                  setBaris([]);
                  dialog.current?.close();
                }}
              >
                Batal
              </button>
              <button type="button" className="d-btn d-btn-utama" onClick={() => void simpan()} disabled={sibuk || !baris.length || baris.some((b) => !b.judul.trim())}>
                {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan {baris.length} foto
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
