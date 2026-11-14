"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeft, ChevronRight, LoaderCircle, MessageSquareText, Search, Trash2 } from "lucide-react";
import { cekLaporan, type HasilCekLaporan } from "@/app/(situs)/lapor/cek/aksi";
import { KET_STATUS_PELAPOR, LABEL_JENIS, LABEL_STATUS_LAPORAN, type StatusLaporan } from "@/lib/laporan/tipe";
import { bacaLaporanPerangkat, hapusLaporanPerangkat, simpanLaporanPerangkat, type LaporanTersimpan } from "@/lib/laporan/perangkat";

const GAYA: Record<StatusLaporan, string> = {
  baru: "bg-[#fffaeb] text-[#b54708] border-[#fedf89]",
  ditinjau: "bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]",
  ditangani: "bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]",
  selesai: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  ditolak: "bg-paper-2 text-ink-2 border-line",
};

const waktu = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(
    new Date(iso),
  ) + " WITA";

const tanggal = (iso: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date(iso));

export function CekLaporan() {
  const id = useId();
  const [tersimpan, setTersimpan] = useState<LaporanTersimpan[] | null>(null);
  const [kode, setKode] = useState("");
  const [kodeAktif, setKodeAktif] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");
  const [hasil, setHasil] = useState<Extract<HasilCekLaporan, { ok: true }> | null>(null);

  const buka = async (k: string) => {
    const bersih = k.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setSibuk(true);
    setGalat("");
    try {
      const h = await cekLaporan({ kode: bersih });
      if (h.ok) {
        setHasil(h);
        setKodeAktif(bersih);
        simpanLaporanPerangkat({ kode: bersih, nomor: h.nomor, jenis: h.jenis, dibuat: h.dibuat });
      } else {
        setGalat(h.pesan);
        // Laporan yang sudah dihapus sekolah: buang juga dari daftar di perangkat.
        if (h.pesan.startsWith("Kode tidak ditemukan")) hapusLaporanPerangkat(bersih);
      }
      setTersimpan(bacaLaporanPerangkat());
    } catch {
      setGalat("Koneksi gagal. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  // Saat dibuka: ?kode=... di alamat, atau satu-satunya laporan di perangkat ini, langsung ditampilkan.
  useEffect(() => {
    let batal = false;
    void Promise.resolve().then(() => {
      if (batal) return;
      const daftar = bacaLaporanPerangkat();
      setTersimpan(daftar);
      const dariUrl = new URLSearchParams(window.location.search).get("kode");
      if (dariUrl) window.history.replaceState(null, "", window.location.pathname);
      const k = dariUrl ?? (daftar.length === 1 ? daftar[0].kode : null);
      if (k) void buka(k);
    });
    return () => {
      batal = true;
    };
  }, []);

  if (hasil) {
    return (
      <div className="mx-auto flex max-w-[760px] flex-col gap-6">
        <div className="rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-ink">{LABEL_JENIS[hasil.jenis]}</p>
              <p className="text-sm text-muted">
                Dikirim {waktu(hasil.dibuat)} · kode <span className="font-mono">{kodeAktif}</span>
              </p>
            </div>
            <span className={`rounded-full border px-4 py-1.5 font-semibold ${GAYA[hasil.status]}`}>{LABEL_STATUS_LAPORAN[hasil.status]}</span>
          </div>
          <p className="mt-5 text-ink-2">{KET_STATUS_PELAPOR[hasil.status]}</p>
        </div>

        <div className="rounded-[18px] border border-line bg-paper p-6 md:p-8">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <MessageSquareText size={18} aria-hidden="true" className="text-brand" /> Balasan guru BK
          </p>
          {hasil.balasan.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Belum ada balasan. Cek lagi nanti, atau temui guru BK langsung bila mendesak.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {hasil.balasan.map((b, i) => (
                <li key={i} className="rounded-[12px] bg-brand-soft p-4">
                  <p className="whitespace-pre-line text-ink">{b.isi}</p>
                  <p className="mt-2 text-xs text-muted">{waktu(b.waktu)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[18px] border border-line bg-paper p-6 md:p-8">
          <p className="font-semibold text-ink">Riwayat</p>
          <ol className="mt-4 flex flex-col gap-3 border-l-2 border-line pl-5">
            {[...hasil.riwayat].reverse().map((r, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-brand" aria-hidden="true" />
                <p className="font-medium text-ink">{LABEL_STATUS_LAPORAN[r.status]}</p>
                <p className="text-sm text-muted">{waktu(r.waktu)}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-pill" onClick={() => setHasil(null)}>
            <ArrowLeft size={16} aria-hidden="true" /> {(tersimpan?.length ?? 0) > 1 ? "Laporan lain" : "Kembali"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-[#b42318]"
            onClick={() => {
              hapusLaporanPerangkat(kodeAktif);
              setTersimpan(bacaLaporanPerangkat());
              setHasil(null);
            }}
          >
            <Trash2 size={15} aria-hidden="true" /> Hapus dari perangkat ini
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6">
      {tersimpan && tersimpan.length > 0 && (
        <div className="rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-8">
          <p className="font-semibold text-ink">Laporan kamu di perangkat ini</p>
          <ul className="mt-4 flex flex-col gap-2">
            {tersimpan.map((l) => (
              <li key={l.kode}>
                <button
                  type="button"
                  onClick={() => void buka(l.kode)}
                  disabled={sibuk}
                  className="flex w-full items-center gap-3 rounded-[12px] border border-line p-4 text-left hover:border-brand hover:bg-brand-soft"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{LABEL_JENIS[l.jenis]}</span>
                    <span className="block text-sm text-muted">Dikirim {tanggal(l.dibuat)}</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="flex flex-col gap-4 rounded-[18px] border border-line bg-paper p-6 md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void buka(kode);
        }}
      >
        <label htmlFor={`${id}-kode`} className="font-semibold text-ink">
          {tersimpan?.length ? "Cek dengan kode dari HP lain" : "Masukkan kode laporan"}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={`${id}-kode`}
            className="field font-mono text-lg uppercase tracking-[0.25em] sm:max-w-[240px]"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            placeholder="K7M2Q9"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={galat ? true : undefined}
          />
          <button type="submit" className="btn-solid" disabled={sibuk || kode.length !== 6}>
            {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            Cek status
          </button>
        </div>
        <p className="text-sm text-muted">Kode 6 huruf/angka muncul setelah kamu mengirim laporan.</p>
        {galat && (
          <p role="alert" className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#912018]">
            {galat}
          </p>
        )}
      </form>
    </div>
  );
}
