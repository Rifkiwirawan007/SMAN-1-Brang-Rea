"use client";

import { useEffect, useId, useState } from "react";
import { CalendarClock, LoaderCircle, PartyPopper, Printer, Search, ShieldCheck, UserRound } from "lucide-react";
import { cekKelulusan, type HasilCekLulus } from "@/app/(situs)/cek-kelulusan/aksi";
import { LABEL_LULUS, waktuPengumuman } from "@/lib/kelulusan/tipe";

type InfoSekolah = { nama: string; npsn: string; alamat: string; email: string; kabupaten: string; kepala: string; akreditasi: string };

const tanggalId = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date(iso.length === 10 ? `${iso}T12:00:00+08:00` : iso));

function HitungMundur({ buka, selisih, selesai }: { buka: string; selisih: number; selesai: () => void }) {
  const target = new Date(buka).getTime();
  const [kini, setKini] = useState(() => Date.now() + selisih);
  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now() + selisih;
      setKini(n);
      if (n >= target) {
        clearInterval(t);
        selesai();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [target, selisih, selesai]);
  const sisa = Math.max(0, Math.floor((target - kini) / 1000));
  const bagian = [
    ["Hari", Math.floor(sisa / 86400)],
    ["Jam", Math.floor((sisa % 86400) / 3600)],
    ["Menit", Math.floor((sisa % 3600) / 60)],
    ["Detik", sisa % 60],
  ] as const;
  return (
    <div className="mx-auto max-w-[760px] rounded-[18px] border border-line bg-paper p-6 text-center shadow-card md:p-10">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
        <CalendarClock size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-h3 text-ink">Pengumuman kelulusan dibuka dalam</h2>
      <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="off">
        {bagian.map(([l, v]) => (
          <div key={l} className="rounded-[14px] bg-brand-ink px-1 py-4 text-white sm:py-6">
            <span className="block text-[clamp(1.75rem,1.2rem+2.5vw,3.25rem)] font-bold tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
            <span className="mt-2 block text-xs text-white/75 sm:text-sm">{l}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-ink-2">{waktuPengumuman(buka)}</p>
    </div>
  );
}

function Skl({ h, sekolah }: { h: Extract<HasilCekLulus, { ok: true }>; sekolah: InfoSekolah }) {
  const hariIni = new Date().toISOString();
  return (
    <div id="skl-cetak" className="hidden bg-white p-10 text-[12pt] leading-relaxed text-black print:block">
      <div className="flex items-center gap-4 border-b-[3px] border-double border-black pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-sman1brangrea.png" alt="" width={80} height={80} loading="eager" className="h-20 w-20" />
        <div className="flex-1 text-center">
          <p className="text-[11pt] font-semibold uppercase">Pemerintah Provinsi Nusa Tenggara Barat</p>
          <p className="text-[11pt] font-semibold uppercase">Dinas Pendidikan dan Kebudayaan</p>
          <p className="text-[15pt] font-bold uppercase">{sekolah.nama}</p>
          <p className="text-[9.5pt]">{sekolah.alamat}</p>
          <p className="text-[9.5pt]">NPSN {sekolah.npsn} · Terakreditasi {sekolah.akreditasi} · {sekolah.email}</p>
        </div>
      </div>
      <p className="mt-6 text-center text-[13pt] font-bold uppercase underline">Surat Keterangan Lulus</p>
      {h.nomorSurat && <p className="text-center">Nomor: {h.nomorSurat}</p>}
      <p className="mt-6">Yang bertanda tangan di bawah ini, Kepala {sekolah.nama}, menerangkan bahwa:</p>
      <table className="my-4 ml-8">
        <tbody>
          {[
            ["Nama", h.siswa.nama],
            ["NISN", h.siswa.nisn],
            ["Tanggal lahir", tanggalId(h.siswa.tglLahir)],
            ["Kelas", h.siswa.kelas],
          ].map(([k, v]) => (
            <tr key={k}>
              <td className="w-40 py-0.5 align-top">{k}</td>
              <td className="px-2 align-top">:</td>
              <td className="align-top font-semibold">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        dinyatakan <b>LULUS</b> dari {sekolah.nama} pada tahun pelajaran {h.tahunPelajaran}, berdasarkan kriteria kelulusan yang ditetapkan
        satuan pendidikan.
      </p>
      <p className="mt-3">Surat keterangan ini berlaku sementara sampai ijazah diterbitkan.</p>
      <div className="mt-12 flex justify-end">
        <div className="w-64 text-center">
          <p>{sekolah.kabupaten}, {tanggalId(hariIni)}</p>
          <p>Kepala Sekolah,</p>
          <div className="h-20" />
          <p className="font-bold underline">{sekolah.kepala}</p>
        </div>
      </div>
      <p className="mt-10 text-[9pt] italic">Dicetak dari situs resmi sekolah. Keaslian dapat diperiksa di halaman Cek kelulusan.</p>
    </div>
  );
}

export function CekKelulusan({
  aktif,
  buka,
  kiniServer,
  tahunPelajaran,
  sekolah,
}: {
  aktif: boolean;
  buka: string | null;
  kiniServer: number;
  tahunPelajaran: string;
  sekolah: InfoSekolah;
}) {
  const id = useId();
  const [selisih] = useState(() => kiniServer - Date.now());
  const [dibuka, setDibuka] = useState(() => aktif && (!buka || new Date(buka).getTime() <= kiniServer));
  const [nisn, setNisn] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState<HasilCekLulus | null>(null);

  if (!aktif) {
    return (
      <div className="mx-auto max-w-[720px] rounded-[18px] border border-line bg-paper p-8 text-center shadow-card md:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
          <CalendarClock size={26} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-h3 text-ink">Pengumuman kelulusan belum dibuka</h2>
        <p className="mt-3 text-ink-2">Jadwal pengumuman tahun pelajaran {tahunPelajaran} akan diinformasikan melalui halaman Berita dan media sosial sekolah.</p>
      </div>
    );
  }

  if (!dibuka && buka) return <HitungMundur buka={buka} selisih={selisih} selesai={() => setDibuka(true)} />;

  if (hasil?.ok) {
    const lulus = hasil.status === "lulus";
    return (
      <div id="hasil-kelulusan" className="mx-auto flex max-w-[760px] flex-col gap-6">
        <div className="print:hidden">
          <div className={`overflow-hidden rounded-[18px] border shadow-card ${lulus ? "border-[#abefc6]" : "border-line"}`}>
            <div className={`px-6 py-10 text-center md:px-10 ${lulus ? "bg-gradient-to-b from-brand to-brand-ink text-white" : "bg-paper-2 text-ink"}`}>
              {lulus && <PartyPopper size={40} className="mx-auto mb-4" aria-hidden="true" />}
              <p className={`text-sm ${lulus ? "text-white/80" : "text-muted"}`}>Tahun pelajaran {hasil.tahunPelajaran}</p>
              <p className="mt-2 text-[clamp(2rem,1.4rem+3vw,3.5rem)] font-bold uppercase leading-none tracking-[0.02em]">{LABEL_LULUS[hasil.status]}</p>
              {hasil.ket && <p className={`mt-3 ${lulus ? "text-white/90" : "text-ink-2"}`}>{hasil.ket}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-paper p-5 md:p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <UserRound size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-ink">{hasil.siswa.nama}</p>
                <p className="text-sm text-muted">Kelas {hasil.siswa.kelas} · NISN {hasil.siswa.nisn}</p>
              </div>
            </div>
            {hasil.pesan && <p className="border-t border-line bg-paper px-5 py-4 text-ink-2 md:px-6">{hasil.pesan}</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {hasil.skl && (
              <button type="button" className="btn-solid" onClick={() => window.print()}>
                <Printer size={18} aria-hidden="true" /> Cetak / unduh SKL
              </button>
            )}
            <button type="button" className="btn-pill" onClick={() => { setHasil(null); setNisn(""); setTglLahir(""); }}>
              <Search size={16} aria-hidden="true" /> Cek NISN lain
            </button>
          </div>
          {hasil.skl && <p className="mt-3 text-sm text-muted">Untuk menyimpan sebagai PDF, pilih &ldquo;Simpan sebagai PDF&rdquo; di jendela cetak.</p>}
        </div>
        {hasil.skl && <Skl h={hasil} sekolah={sekolah} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10">
      <h2 className="text-h3 text-ink">Masukkan data siswa</h2>
      <p className="mt-2 text-ink-2">Gunakan NISN (10 angka) dan tanggal lahir sesuai data sekolah.</p>
      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setSibuk(true);
          try {
            const h = await cekKelulusan({ nisn, tglLahir });
            setHasil(h);
            if (!h.ok && h.belumBuka) setDibuka(false);
          } catch {
            setHasil({ ok: false, pesan: "Koneksi gagal. Periksa internet lalu coba lagi." });
          } finally {
            setSibuk(false);
          }
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-nisn`} className="text-sm font-semibold text-ink">NISN</label>
            <input
              id={`${id}-nisn`}
              className="field font-mono tracking-wider"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              placeholder="Contoh: 0081234567"
              value={nisn}
              onChange={(e) => setNisn(e.target.value.replace(/[^\d]/g, ""))}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-lahir`} className="text-sm font-semibold text-ink">Tanggal lahir</label>
            <input id={`${id}-lahir`} type="date" className="field" value={tglLahir} onChange={(e) => setTglLahir(e.target.value)} required />
          </div>
        </div>
        {hasil && !hasil.ok && (
          <p role="alert" className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#912018]">{hasil.pesan}</p>
        )}
        <div>
          <button type="submit" className="btn-solid" disabled={sibuk || nisn.length < 10 || !tglLahir}>
            {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            Lihat hasil
          </button>
        </div>
      </form>
      <p className="mt-8 flex items-start gap-2 text-sm text-muted">
        <ShieldCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
        Hasil hanya tampil bila NISN dan tanggal lahir cocok. Bila data tidak ditemukan, hubungi wali kelas.
      </p>
    </div>
  );
}
