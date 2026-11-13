"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Eye, EyeOff, LoaderCircle, Save, Send, Trash2 } from "lucide-react";
import { DaftarBidang, type Pengubah } from "@/components/dasbor/bidang";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Lencana, waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";
import { ratakan, validasi, type Galat, type Rekaman } from "@/lib/cms/bidang";
import { DOKUMEN, KOLEKSI } from "@/lib/cms/modul";
import type { NamaDokumen, NamaKoleksi, Status } from "@/lib/konten/tipe";
import { duplikatItem, hapusItem, simpanDokumen, simpanItem, type HasilAksi } from "@/app/dashboard/aksi";

/* ---------- Keadaan formulir bersama ---------- */

function gulirKeGalat() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"], .d-galat');
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el && "focus" in el && el.matches("input,textarea,select,button")) el.focus({ preventScroll: true });
  });
}

function useFormulir(awal: Rekaman, cekLokal: (n: Rekaman) => Galat) {
  const [nilai, setNilai] = useState<Rekaman>(awal);
  const [asli, setAsli] = useState(() => JSON.stringify(awal));
  const [coba, setCoba] = useState(false);
  const [galatServer, setGalatServer] = useState<Galat>({});
  const [sibuk, setSibuk] = useState<string | null>(null);
  const kotor = JSON.stringify(nilai) !== asli;
  const galat = coba ? { ...galatServer, ...cekLokal(nilai) } : galatServer;

  const ubah: Pengubah<Rekaman> = useCallback((v) => {
    setGalatServer({});
    setNilai((l) => (typeof v === "function" ? v(l) : v));
  }, []);

  // Peringatan saat meninggalkan halaman dengan perubahan belum tersimpan.
  useEffect(() => {
    if (!kotor) return;
    const tutupTab = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const klik = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      if (!window.confirm("Ada perubahan yang belum disimpan. Tinggalkan halaman ini?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", tutupTab);
    document.addEventListener("click", klik, true);
    return () => {
      window.removeEventListener("beforeunload", tutupTab);
      document.removeEventListener("click", klik, true);
    };
  }, [kotor]);

  /** Jalankan aksi simpan dengan validasi lokal dulu. */
  const jalankan = async (label: string, aksi: () => Promise<HasilAksi>, sukses?: (h: Extract<HasilAksi, { ok: true }>) => void) => {
    setCoba(true);
    const g = cekLokal(nilai);
    if (Object.keys(g).length) {
      gulirKeGalat();
      return { ok: false as const, pesan: `Ada ${Object.keys(g).length} isian yang perlu diperbaiki.` };
    }
    setSibuk(label);
    try {
      const h = await aksi();
      if (!h.ok) {
        setGalatServer(h.galat ?? {});
        if (h.galat) gulirKeGalat();
        return h;
      }
      if (h.data) {
        setNilai(h.data);
        setAsli(JSON.stringify(h.data));
      } else setAsli(JSON.stringify(nilai));
      setCoba(false);
      setGalatServer({});
      sukses?.(h);
      return h;
    } catch {
      return { ok: false as const, pesan: "Gagal terhubung ke server. Periksa koneksi lalu coba lagi." };
    } finally {
      setSibuk(null);
    }
  };

  return { nilai, ubah, galat, kotor, sibuk, jalankan, tandaiBersih: () => setAsli(JSON.stringify(nilai)) };
}

function usePintasanSimpan(fn: () => void) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [fn]);
}

function BilahAksi({ kotor, kiri, children }: { kotor: boolean; kiri?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="sticky top-16 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-paper-2/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">
        {kiri}
        {kotor ? (
          <span className="flex items-center gap-1.5 font-medium text-sun-ink">
            <span className="h-2 w-2 rounded-full bg-sun" aria-hidden="true" /> Perubahan belum disimpan
          </span>
        ) : (
          <span className="text-muted">Semua perubahan tersimpan</span>
        )}
        <span className="hidden text-xs text-muted xl:inline">· Ctrl/⌘ + S untuk menyimpan</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const Putar = () => <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />;

/* ================= Formulir koleksi (berita, agenda, ...) ================= */

export function FormulirKoleksi({ kunci, awal, id }: { kunci: NamaKoleksi; awal: Rekaman; id: string | null }) {
  const modul = KOLEKSI[kunci];
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const cekLokal = useCallback(
    (n: Rekaman) => {
      const g: Galat = {};
      validasi(modul.bidang, n, g);
      return { ...g, ...(modul.cek?.(n) ?? {}) };
    },
    [modul],
  );
  const f = useFormulir(awal, cekLokal);
  const status = (f.nilai.status as Status | undefined) ?? (modul.status ? "draf" : undefined);
  const publik = id ? modul.publik?.(f.nilai as never) : null;

  const simpan = async (st?: Status, label = "simpan") => {
    const h = await f.jalankan(label, () => simpanItem(kunci, id, f.nilai, st), (h) => {
      if (!id && h.id) router.replace(`/dashboard/${kunci}/${h.id}`);
      else router.refresh();
    });
    toast(h.pesan, h.ok ? "sukses" : "galat");
  };

  const simpanUtama = () => void simpan(modul.status ? (id ? undefined : "draf") : undefined);
  usePintasanSimpan(simpanUtama);

  const hapus = async () => {
    if (!id) return;
    const judul = modul.judul(f.nilai as never) || modul.satuan;
    const ya = await konfirmasi({ judul: `Hapus ${modul.satuan} ini?`, pesan: `“${judul}” akan dihapus permanen dari situs.`, tombol: "Hapus", bahaya: true });
    if (!ya) return;
    const h = await hapusItem(kunci, [id]);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      f.tandaiBersih();
      router.push(`/dashboard/${kunci}`);
    }
  };

  const gandakan = async () => {
    if (!id) return;
    if (f.kotor && !(await konfirmasi({ judul: "Simpan dulu?", pesan: "Salinan dibuat dari versi yang sudah tersimpan. Perubahan yang belum disimpan tidak ikut tersalin.", tombol: "Tetap gandakan" }))) return;
    const h = await duplikatItem(kunci, id);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok && h.id) {
      f.tandaiBersih();
      router.push(`/dashboard/${kunci}/${h.id}`);
    }
  };

  const utama = modul.bidang.filter((b) => !b.sisi);
  const sisi = modul.bidang.filter((b) => b.sisi);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        simpanUtama();
      }}
    >
      <BilahAksi
        kotor={f.kotor}
        kiri={
          modul.status && (
            <Lencana warna={status === "terbit" ? "hijau" : "kuning"}>{status === "terbit" ? "Terbit" : "Draf"}</Lencana>
          )
        }
      >
        <Link href={`/dashboard/${kunci}`} className="d-btn d-btn-hantu">
          Kembali
        </Link>
        {modul.status ? (
          <>
            {(!id || status === "draf") && (
              <button type="button" className="d-btn d-btn-garis" onClick={() => void simpan("draf", "draf")} disabled={!!f.sibuk}>
                {f.sibuk === "draf" ? <Putar /> : <Save size={16} aria-hidden="true" />} Simpan draf
              </button>
            )}
            {id && status === "terbit" && (
              <button type="button" className="d-btn d-btn-garis" onClick={() => void simpan(undefined, "simpan")} disabled={!!f.sibuk}>
                {f.sibuk === "simpan" ? <Putar /> : <Save size={16} aria-hidden="true" />} Simpan
              </button>
            )}
            {status !== "terbit" || !id ? (
              <button type="button" className="d-btn d-btn-utama" onClick={() => void simpan("terbit", "terbit")} disabled={!!f.sibuk}>
                {f.sibuk === "terbit" ? <Putar /> : <Send size={16} aria-hidden="true" />} Terbitkan
              </button>
            ) : null}
          </>
        ) : (
          <button type="submit" className="d-btn d-btn-utama" disabled={!!f.sibuk}>
            {f.sibuk ? <Putar /> : <Save size={16} aria-hidden="true" />} {id ? "Simpan perubahan" : `Simpan ${modul.satuan}`}
          </button>
        )}
      </BilahAksi>

      <div className={`grid gap-6 ${sisi.length || id ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
        <Kartu isiClassName="p-5 md:p-6">
          <DaftarBidang bidang={utama} nilai={f.nilai} ubah={f.ubah} galat={f.galat} />
        </Kartu>

        {(sisi.length > 0 || id) && (
          <div className="flex flex-col gap-6">
            {sisi.length > 0 && (
              <Kartu isiClassName="p-5">
                <DaftarBidang bidang={sisi} nilai={f.nilai} ubah={f.ubah} galat={f.galat} />
              </Kartu>
            )}
            {id && (
              <Kartu judul="Info" isiClassName="p-5 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-muted">Dibuat</dt>
                  <dd className="text-ink">{waktuLengkap(f.nilai.dibuat as string)}</dd>
                  <dt className="text-muted">Diubah</dt>
                  <dd className="text-ink" title={waktuLengkap(f.nilai.diubah as string)}>
                    {waktuRelatif(f.nilai.diubah as string)}
                    {f.nilai.oleh ? ` oleh ${f.nilai.oleh}` : ""}
                  </dd>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {publik && (
                    <a href={publik} target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis d-btn-kecil">
                      <ExternalLink size={14} aria-hidden="true" /> Lihat di situs
                    </a>
                  )}
                  {modul.status && status === "draf" && <span className="flex items-center gap-1.5 text-xs text-muted"><EyeOff size={14} aria-hidden="true" /> Draf belum tampil di situs</span>}
                  <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => void gandakan()}>
                    <Copy size={14} aria-hidden="true" /> Gandakan
                  </button>
                </div>
                {modul.status && status === "terbit" && (
                  <button type="button" className="d-btn d-btn-hantu d-btn-kecil mt-3" onClick={() => void simpan("draf", "draf")} disabled={!!f.sibuk}>
                    <Eye size={14} aria-hidden="true" /> Tarik dari situs (jadikan draf)
                  </button>
                )}
                <div className="mt-5 border-t border-line pt-4">
                  <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil" onClick={() => void hapus()}>
                    <Trash2 size={14} aria-hidden="true" /> Hapus {modul.satuan} ini
                  </button>
                </div>
              </Kartu>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

/* ================= Formulir dokumen (profil, SPMB, ...) ================= */

export function FormulirDokumen({ kunci, awal }: { kunci: NamaDokumen; awal: Rekaman }) {
  const modul = DOKUMEN[kunci];
  const router = useRouter();
  const toast = useToast();
  const semua = useMemo(() => ratakan(modul.bagian), [modul]);
  const cekLokal = useCallback(
    (n: Rekaman) => {
      const g: Galat = {};
      validasi(semua, n, g);
      return g;
    },
    [semua],
  );
  const f = useFormulir(awal, cekLokal);

  const simpan = async () => {
    const h = await f.jalankan("simpan", () => simpanDokumen(kunci, f.nilai), () => router.refresh());
    toast(h.pesan, h.ok ? "sukses" : "galat");
  };
  usePintasanSimpan(() => void simpan());

  const idBagian = (i: number) => `bagian-${i}`;
  const galatDiBagian = (i: number) => {
    const nama = modul.bagian[i].bidang.map((b) => b.nama);
    return Object.keys(f.galat).some((k) => nama.includes(k.split(".")[0]));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void simpan();
      }}
    >
      <BilahAksi kotor={f.kotor}>
        {modul.publik && (
          <a href={modul.publik} target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis">
            <ExternalLink size={16} aria-hidden="true" /> Lihat halaman
          </a>
        )}
        <button type="submit" className="d-btn d-btn-utama" disabled={!!f.sibuk || !f.kotor}>
          {f.sibuk ? <Putar /> : <Save size={16} aria-hidden="true" />} Simpan perubahan
        </button>
      </BilahAksi>

      <div className={`grid gap-6 ${modul.bagian.length > 2 ? "lg:grid-cols-[200px_minmax(0,1fr)]" : ""}`}>
        {modul.bagian.length > 2 && (
          <nav aria-label="Bagian formulir" className="hidden lg:block">
            <ul className="sticky top-36 flex flex-col gap-0.5 text-sm">
              {modul.bagian.map((b, i) => (
                <li key={b.judul}>
                  <a href={`#${idBagian(i)}`} className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-ink-2 hover:bg-paper-3 hover:text-ink">
                    {b.judul}
                    {galatDiBagian(i) && <span className="h-2 w-2 rounded-full bg-[#d92d20]" aria-label="ada isian yang perlu diperbaiki" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex min-w-0 flex-col gap-6">
          {modul.bagian.map((b, i) => (
            <div key={b.judul} id={idBagian(i)} className="scroll-mt-36">
              <Kartu judul={b.judul} deskripsi={b.deskripsi} isiClassName="p-5 md:p-6">
                <DaftarBidang bidang={b.bidang} nilai={f.nilai} ubah={f.ubah} galat={f.galat} />
              </Kartu>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
