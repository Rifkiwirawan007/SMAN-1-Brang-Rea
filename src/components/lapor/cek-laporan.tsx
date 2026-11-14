"use client";

import { useEffect, useId, useState } from "react";
import { LoaderCircle, MessageSquareText, Search } from "lucide-react";
import { cekLaporan, type HasilCekLaporan } from "@/app/(situs)/lapor/cek/aksi";
import { KET_STATUS_PELAPOR, LABEL_JENIS, LABEL_STATUS_LAPORAN, type StatusLaporan } from "@/lib/laporan/tipe";

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

export function CekLaporan() {
  const id = useId();
  const [nomor, setNomor] = useState("");
  const [kode, setKode] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState<HasilCekLaporan | null>(null);

  const cari = async (n: string, k: string) => {
    setSibuk(true);
    try {
      setHasil(await cekLaporan({ nomor: n, kode: k }));
    } catch {
      setHasil({ ok: false, pesan: "Koneksi gagal. Coba lagi." });
    } finally {
      setSibuk(false);
    }
  };

  // Dibuka dari tautan setelah mengirim laporan (?nomor=...&kode=...): langsung cek.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = q.get("nomor");
    const k = q.get("kode");
    if (!n || !k) return;
    window.history.replaceState(null, "", window.location.pathname); // kode tidak tertinggal di bilah alamat
    let batal = false;
    void Promise.resolve().then(() => {
      if (batal) return;
      setNomor(n);
      setKode(k);
      void cari(n, k);
    });
    return () => {
      batal = true;
    };
  }, []);

  if (hasil?.ok) {
    return (
      <div className="mx-auto flex max-w-[760px] flex-col gap-6">
        <div className="rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-muted">{hasil.nomor}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{LABEL_JENIS[hasil.jenis]}</p>
              <p className="text-sm text-muted">Dikirim {waktu(hasil.dibuat)}</p>
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

        <div>
          <button type="button" className="btn-pill" onClick={() => setHasil(null)}>
            <Search size={16} aria-hidden="true" /> Cek laporan lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mx-auto flex max-w-[640px] flex-col gap-5 rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        void cari(nomor, kode);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-nomor`} className="text-sm font-semibold text-ink">
            Nomor laporan
          </label>
          <input
            id={`${id}-nomor`}
            className="field font-mono uppercase"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="LP-2026-0001"
            autoComplete="off"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-kode`} className="text-sm font-semibold text-ink">
            Kode cek
          </label>
          <input
            id={`${id}-kode`}
            className="field font-mono uppercase tracking-[0.2em]"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="6 karakter"
            maxLength={6}
            autoComplete="off"
            required
          />
        </div>
      </div>
      {hasil && !hasil.ok && (
        <p role="alert" className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#912018]">
          {hasil.pesan}
        </p>
      )}
      <div>
        <button type="submit" className="btn-solid" disabled={sibuk}>
          {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          Cek status
        </button>
      </div>
    </form>
  );
}
