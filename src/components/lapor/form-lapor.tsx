"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { CircleCheck, Copy, LoaderCircle, Send, ShieldAlert } from "lucide-react";
import { JENIS_LAPORAN, type JenisLaporan } from "@/lib/laporan/tipe";
import { simpanLaporanPerangkat } from "@/lib/laporan/perangkat";

function Galat({ id, pesan }: { id: string; pesan?: string }) {
  return pesan ? (
    <p id={id} className="text-sm text-sun-ink">
      {pesan}
    </p>
  ) : null;
}

function Label({ htmlFor, children, opsional }: { htmlFor: string; children: React.ReactNode; opsional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children} {opsional && <span className="font-normal text-muted">(opsional)</span>}
    </label>
  );
}

export function FormLapor() {
  const id = useId();
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [telepon, setTelepon] = useState("");
  const [jenis, setJenis] = useState<JenisLaporan | "">("");
  const [terlibat, setTerlibat] = useState("");
  const [isi, setIsi] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState<{ nomor: string; kode: string } | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const refSitus = useRef<HTMLInputElement>(null);

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (nama.trim().length < 3) g.nama = "Tulis nama lengkap kamu.";
    if (!kelas.trim()) g.kelas = "Tulis kelas kamu, mis. XI-2.";
    if (!jenis) g.jenis = "Pilih jenis laporan.";
    if (isi.trim().length < 20) g.isi = "Ceritakan kejadiannya minimal satu-dua kalimat.";
    if (!setuju) g.setuju = "Centang pernyataan ini untuk mengirim.";
    setGalat(g);
    if (Object.keys(g).length) {
      setPesan("Periksa lagi isian yang ditandai.");
      document.querySelector<HTMLElement>(`[aria-invalid="true"]`)?.focus();
      return;
    }

    const fd = new FormData();
    Object.entries({ nama, kelas, telepon, jenis, terlibat, isi, setuju: "ya", situs: refSitus.current?.value ?? "" }).forEach(([k, v]) => fd.set(k, v));
    setSibuk(true);
    setPesan("");
    try {
      const r = await fetch("/api/laporan", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) {
        setGalat(j.galat ?? {});
        setPesan(j.pesan ?? "Laporan gagal dikirim. Coba lagi.");
        return;
      }
      setHasil({ nomor: j.nomor, kode: j.kode });
      if (jenis) simpanLaporanPerangkat({ kode: j.kode, nomor: j.nomor, jenis, dibuat: new Date().toISOString() });
      window.scrollTo({ top: document.getElementById("form-lapor")!.offsetTop - 100, behavior: "smooth" });
    } catch {
      setPesan("Koneksi terputus. Periksa internet lalu kirim lagi.");
    } finally {
      setSibuk(false);
    }
  };

  if (hasil) {
    return (
      <div id="form-lapor" className="mx-auto max-w-[720px] rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10">
        <CircleCheck size={44} className="text-brand" aria-hidden="true" />
        <h2 className="mt-4 text-h3 text-ink">Laporan terkirim ke guru BK</h2>
        <p className="mt-2 text-ink-2">Terima kasih sudah berani melapor. Guru BK akan membaca laporanmu dan bisa memanggilmu untuk bicara.</p>
        <div className="mt-6 rounded-[14px] border-2 border-dashed border-brand/40 bg-brand-soft p-5 text-center">
          <p className="text-sm text-ink-2">Kode laporan kamu</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-[0.25em] text-ink">{hasil.kode}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
            onClick={() => {
              void navigator.clipboard?.writeText(hasil.kode);
              setTersalin(true);
            }}
          >
            <Copy size={16} aria-hidden="true" /> {tersalin ? "Tersalin" : "Salin kode"}
          </button>
        </div>
        <p className="mt-4 text-sm text-ink-2">
          Laporan ini sudah <b>tersimpan otomatis di perangkat ini</b>: buka <b>Cek status laporan</b> kapan saja untuk melihat balasan guru BK, tanpa mengetik
          apa-apa. Kode di atas hanya perlu bila kamu cek dari HP lain.
        </p>
        <p className="mt-2 text-sm text-muted">Pakai HP/komputer milik orang lain? Setelah selesai, hapus laporan dari perangkat ini di halaman cek status.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/lapor/cek" className="btn-solid">
            Cek status laporan
          </Link>
          <Link href="/" className="btn-pill">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  const bidang = (k: string) => ({ "aria-invalid": galat[k] ? true : undefined, "aria-describedby": galat[k] ? `${id}-${k}-g` : undefined });

  return (
    <form id="form-lapor" onSubmit={kirim} noValidate className="mx-auto flex max-w-[760px] flex-col gap-8 rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10">
      <div className="flex items-start gap-3 rounded-[12px] border border-[#fecdca] bg-[#fef3f2] p-4 text-sm text-[#912018]">
        <ShieldAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          <b>Dalam bahaya sekarang?</b> Jangan tunggu balasan. Segera temui guru BK, guru piket, atau wali kelas, atau hubungi 112.
        </p>
      </div>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 text-lg font-semibold text-ink">1. Identitas pelapor</legend>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-nama`}>Nama lengkap</Label>
            <input id={`${id}-nama`} className="field" value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" maxLength={80} {...bidang("nama")} />
            <Galat id={`${id}-nama-g`} pesan={galat.nama} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-kelas`}>Kelas</Label>
            <input id={`${id}-kelas`} className="field" value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Mis. XI-2" maxLength={20} {...bidang("kelas")} />
            <Galat id={`${id}-kelas-g`} pesan={galat.kelas} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-telepon`} opsional>
            Nomor HP / WhatsApp
          </Label>
          <input
            id={`${id}-telepon`}
            className="field sm:max-w-[320px]"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="08…"
            maxLength={20}
            {...bidang("telepon")}
          />
          {galat.telepon ? <Galat id={`${id}-telepon-g`} pesan={galat.telepon} /> : <p className="text-sm text-muted">Supaya guru BK bisa menghubungi kamu bila perlu.</p>}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 text-lg font-semibold text-ink">2. Apa yang terjadi?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Jenis laporan" {...bidang("jenis")}>
          {JENIS_LAPORAN.map((j) => (
            <label
              key={j.kunci}
              className={`flex cursor-pointer gap-3 rounded-[12px] border p-3.5 transition-colors ${jenis === j.kunci ? "border-brand bg-brand-soft" : "border-line hover:bg-paper-2"}`}
            >
              <input type="radio" name="jenis" className="mt-1 h-4 w-4 shrink-0 self-start accent-[var(--color-brand)]" checked={jenis === j.kunci} onChange={() => setJenis(j.kunci)} />
              <span>
                <span className="block font-semibold text-ink">{j.label}</span>
                <span className="block text-sm text-muted">{j.ket}</span>
              </span>
            </label>
          ))}
        </div>
        <Galat id={`${id}-jenis-g`} pesan={galat.jenis} />

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-terlibat`} opsional>
            Siapa yang terlibat?
          </Label>
          <input
            id={`${id}-terlibat`}
            className="field"
            value={terlibat}
            onChange={(e) => setTerlibat(e.target.value)}
            placeholder="Nama/kelas pelaku, korban lain, atau saksi bila tahu"
            maxLength={300}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-isi`}>Ceritakan kejadiannya</Label>
          <textarea
            id={`${id}-isi`}
            className="field min-h-[170px] resize-y"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Apa yang terjadi, sejak kapan, dan bagaimana perasaanmu. Tulis sejelas yang kamu bisa."
            maxLength={4000}
            {...bidang("isi")}
          />
          {galat.isi ? <Galat id={`${id}-isi-g`} pesan={galat.isi} /> : <p className="text-sm text-muted">{isi.length}/4000</p>}
        </div>
      </fieldset>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input ref={refSitus} tabIndex={-1} autoComplete="off" name="situs" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-ink-2">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-brand)]" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} {...bidang("setuju")} />
          <span>Saya menyatakan laporan ini benar. Saya mengerti laporan palsu atau iseng dapat dikenai sanksi sesuai tata tertib sekolah.</span>
        </label>
        <Galat id={`${id}-setuju-g`} pesan={galat.setuju} />
      </div>

      {pesan && (
        <p role="alert" className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#912018]">
          {pesan}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-solid" disabled={sibuk}>
          {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {sibuk ? "Mengirim…" : "Kirim laporan ke guru BK"}
        </button>
        <span className="text-sm text-muted">Nama kamu hanya terlihat oleh guru BK.</span>
      </div>
    </form>
  );
}
