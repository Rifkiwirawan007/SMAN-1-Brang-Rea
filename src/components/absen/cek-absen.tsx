"use client";

import { useId, useState } from "react";
import { BellRing, ChevronLeft, ChevronRight, LoaderCircle, Printer, Search, ShieldCheck, UserRound } from "lucide-react";
import { cekAbsensi, type BarisCek, type HasilCek } from "@/app/(situs)/cek-absen/aksi";
import { KET_STATUS, LABEL_CARA, LABEL_STATUS, STATUS_ABSEN, geserBulan, jamWita, namaBulan, tanggalPanjang, type StatusAbsen } from "@/lib/absensi/tipe";

/** Warna status di situs publik. */
const GAYA: Record<StatusAbsen, string> = {
  hadir: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  terlambat: "bg-[#fffaeb] text-[#b54708] border-[#fedf89]",
  sakit: "bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]",
  izin: "bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]",
  alpa: "bg-[#fef3f2] text-[#b42318] border-[#fecdca]",
};

function Status({ s, besar }: { s: StatusAbsen; besar?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${besar ? "px-4 py-1.5 text-base" : "px-2.5 py-0.5 text-xs"} ${GAYA[s]}`}>
      {LABEL_STATUS[s]}
    </span>
  );
}

const waktuCatat = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(new Date(iso));

/** Kalimat pengumuman untuk orang tua. */
function kalimat(b: BarisCek) {
  if (b.status === "terlambat") return `Terlambat masuk sekolah, tercatat pukul ${jamWita(b.jam)} WITA.`;
  if (b.status === "alpa") return "Tidak hadir tanpa keterangan (alpa).";
  return `Tidak hadir: ${LABEL_STATUS[b.status].toLowerCase()}${b.ket ? ` (${b.ket})` : ""}.`;
}

/** "Selasa, 18 Nov" dari YYYY-MM-DD. */
const tanggalPendek = (t: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Makassar" }).format(new Date(`${t}T08:00:00+08:00`));

export function CekAbsen({ wajibTglLahir }: { wajibTglLahir: boolean }) {
  const id = useId();
  const [nisn, setNisn] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState<HasilCek | null>(null);
  const [kunci, setKunci] = useState<{ nisn: string; tglLahir: string } | null>(null);

  const cari = async (data: { nisn: string; tglLahir: string }, bulan?: string) => {
    setSibuk(true);
    try {
      const h = await cekAbsensi({ ...data, bulan });
      setHasil(h);
      if (h.ok) setKunci(data);
    } catch {
      setHasil({ ok: false, pesan: "Koneksi gagal. Periksa internet lalu coba lagi." });
    } finally {
      setSibuk(false);
    }
  };

  if (hasil?.ok && kunci) {
    const h = hasil;
    const totalHari = STATUS_ABSEN.reduce((n, s) => n + h.rekap[s], 0);
    return (
      <div id="hasil-cek-absen" className="mx-auto flex max-w-[860px] flex-col gap-6">
        {/* Identitas */}
        <div className="flex flex-wrap items-center gap-4 rounded-[18px] border border-line bg-paper p-5 shadow-card md:p-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
            <UserRound size={26} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold text-ink">{h.siswa.nama}</p>
            <p className="text-sm text-muted">
              Kelas {h.siswa.kelas} · NISN {kunci.nisn}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button type="button" className="btn-pill" onClick={() => window.print()}>
              <Printer size={16} aria-hidden="true" /> Cetak
            </button>
            <button
              type="button"
              className="btn-pill"
              onClick={() => {
                setHasil(null);
                setKunci(null);
              }}
            >
              <Search size={16} aria-hidden="true" /> NISN lain
            </button>
          </div>
        </div>

        {/* Hari ini */}
        <div className="rounded-[18px] border border-line bg-paper p-5 md:p-6">
          <p className="text-sm text-muted">Hari ini · {tanggalPanjang(h.hariIni)}</p>
          {h.statusHariIni ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Status s={h.statusHariIni.status} besar />
              <p className="text-ink-2">
                {KET_STATUS[h.statusHariIni.status]}
                {h.statusHariIni.jam && (h.statusHariIni.status === "hadir" || h.statusHariIni.status === "terlambat")
                  ? `, pukul ${jamWita(h.statusHariIni.jam)} WITA`
                  : ""}
                {h.statusHariIni.ket ? ` — ${h.statusHariIni.ket}` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-ink-2">Belum ada catatan absensi hari ini.</p>
          )}
        </div>

        {/* Pengumuman */}
        {h.pengumuman.length > 0 && (
          <div className="rounded-[18px] border border-[#fedf89] bg-[#fffaeb] p-5 md:p-6">
            <p className="flex items-center gap-2 font-semibold text-[#93370d]">
              <BellRing size={18} aria-hidden="true" /> Pemberitahuan untuk orang tua/wali
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {h.pengumuman.map((p) => (
                <li key={p.tanggal} className="flex flex-col gap-0.5 text-sm text-[#7a2e0e] sm:flex-row sm:gap-3">
                  <span className="shrink-0 font-semibold sm:w-[210px]">{tanggalPanjang(p.tanggal)}</span>
                  <span>{kalimat(p)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Riwayat bulanan */}
        <div className="rounded-[18px] border border-line bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 md:px-6">
            <p className="font-semibold text-ink">Riwayat {namaBulan(h.bulan)}</p>
            <div className="flex items-center gap-1 print:hidden">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-paper-2 disabled:opacity-40"
                onClick={() => cari(kunci, geserBulan(h.bulan, -1))}
                disabled={sibuk}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-paper-2 disabled:opacity-40"
                onClick={() => cari(kunci, geserBulan(h.bulan, 1))}
                disabled={sibuk || h.bulan >= h.bulanIni}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-5 sm:grid-cols-5 md:px-6">
            {STATUS_ABSEN.map((s) => (
              <div key={s} className={`rounded-xl border px-3 py-2.5 ${GAYA[s]}`}>
                <p className="text-xs font-medium">{LABEL_STATUS[s]}</p>
                <p className="text-2xl font-semibold tabular-nums">{h.rekap[s]}</p>
              </div>
            ))}
          </div>

          {totalHari === 0 ? (
            <p className="px-5 pb-8 pt-2 text-center text-sm text-muted md:px-6">Belum ada catatan absensi di bulan ini.</p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {h.daftar.map((b) => (
                <li key={b.tanggal} className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                  <span className="text-sm font-medium text-ink sm:w-[210px] sm:shrink-0">{tanggalPanjang(b.tanggal)}</span>
                  <span className="sm:w-[100px] sm:shrink-0">
                    <Status s={b.status} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink-2">
                    {b.jam && (b.status === "hadir" || b.status === "terlambat") ? `Masuk ${jamWita(b.jam)} WITA` : ""}
                    {b.ket ? `${b.jam && (b.status === "hadir" || b.status === "terlambat") ? " · " : ""}${b.ket}` : ""}
                    <span className="block text-xs text-muted">
                      {LABEL_CARA[b.cara]} · dicatat {b.oleh}, {waktuCatat(b.waktu)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Per jam pelajaran */}
        {h.rekapMapel.length > 0 && (
          <div className="rounded-[18px] border border-line bg-paper">
            <div className="border-b border-line p-5 md:px-6">
              <p className="font-semibold text-ink">Kehadiran per mata pelajaran · {namaBulan(h.bulan)}</p>
              <p className="mt-0.5 text-sm text-muted">Diisi guru mapel setiap jam pelajaran.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-5 py-2.5 font-medium md:px-6">Mata pelajaran</th>
                    <th className="px-2 py-2.5 text-center font-medium">Pertemuan</th>
                    <th className="px-2 py-2.5 text-center font-medium">Sakit</th>
                    <th className="px-2 py-2.5 text-center font-medium">Izin</th>
                    <th className="px-2 py-2.5 pr-5 text-center font-medium md:pr-6">Alpa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {h.rekapMapel.map((r) => (
                    <tr key={r.mapel}>
                      <td className="px-5 py-2.5 text-ink md:px-6">{r.mapel}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums text-ink-2">{r.pertemuan}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums">{r.sakit || "–"}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums">{r.izin || "–"}</td>
                      <td className={`px-2 py-2.5 pr-5 text-center tabular-nums md:pr-6 ${r.alpa ? "font-semibold text-[#b42318]" : ""}`}>{r.alpa || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {h.mapel.length > 0 ? (
              <ul className="divide-y divide-line border-t border-line">
                {h.mapel.map((m, i) => (
                  <li key={`${m.tanggal}-${m.jam}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm md:px-6">
                    <span className="font-medium text-ink sm:w-[150px]">{tanggalPendek(m.tanggal)}</span>
                    <span className="text-ink-2">
                      {m.jam} · {m.mapel}
                    </span>
                    <span className="ml-auto">
                      <Status s={m.status} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-line px-5 py-4 text-sm text-ink-2 md:px-6">Hadir di semua jam pelajaran yang sudah diabsen bulan ini.</p>
            )}
          </div>
        )}

        {/* Poin pelanggaran tata tertib */}
        <div className="rounded-[18px] border border-line bg-paper">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5 md:px-6">
            <div>
              <p className="font-semibold text-ink">Poin pelanggaran tata tertib</p>
              <p className="mt-0.5 text-sm text-muted">{h.poin.semester} · dihitung ulang dari 0 setiap semester.</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold tabular-nums ${h.poin.total >= 40 ? "text-[#b42318]" : h.poin.total > 0 ? "text-[#b54708]" : "text-[#067647]"}`}>{h.poin.total}</p>
              <p className="text-xs text-muted">poin</p>
            </div>
          </div>
          {h.poin.daftar.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-2 md:px-6">Tidak ada catatan pelanggaran semester ini.</p>
          ) : (
            <>
              <p className="border-b border-line px-5 py-3 text-sm text-ink-2 md:px-6">
                Tingkat <b className="text-ink">{h.poin.tingkat}</b>: {h.poin.sanksi}
              </p>
              <ul className="divide-y divide-line">
                {h.poin.daftar.map((d, i) => (
                  <li key={`${d.tanggal}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm md:px-6">
                    <span className="font-medium text-ink sm:w-[150px]">{tanggalPendek(d.tanggal)}</span>
                    <span className="min-w-0 flex-1 text-ink-2">{d.pelanggaran}</span>
                    <span className="font-semibold tabular-nums text-ink">+{d.poin}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <p className="flex items-start gap-2 text-sm text-muted">
          <ShieldCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
          Data berasal dari absensi QR dan catatan guru di sekolah. Setiap perubahan status tersimpan beserta nama guru dan waktunya. Bila ada yang keliru,
          hubungi wali kelas.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10">
      <h2 className="text-h3 text-ink">Masukkan NISN anak</h2>
      <p className="mt-2 text-ink-2">
        NISN (10 angka) ada di kartu pelajar, rapor, atau dapat ditanyakan ke wali kelas.
        {wajibTglLahir ? " Untuk keamanan data, isi juga tanggal lahir anak." : ""}
      </p>
      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void cari({ nisn, tglLahir });
        }}
      >
        <div className={`grid gap-5 ${wajibTglLahir ? "sm:grid-cols-2" : ""}`}>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-nisn`} className="text-sm font-semibold text-ink">
              NISN
            </label>
            <input
              id={`${id}-nisn`}
              className="field font-mono tracking-wider"
              inputMode="numeric"
              autoComplete="off"
              maxLength={14}
              placeholder="Contoh: 0081234567"
              value={nisn}
              onChange={(e) => setNisn(e.target.value.replace(/[^\d]/g, ""))}
              aria-invalid={hasil && !hasil.ok ? true : undefined}
              required
            />
          </div>
          {wajibTglLahir && (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${id}-lahir`} className="text-sm font-semibold text-ink">
                Tanggal lahir anak
              </label>
              <input id={`${id}-lahir`} type="date" className="field" value={tglLahir} onChange={(e) => setTglLahir(e.target.value)} required />
            </div>
          )}
        </div>
        {hasil && !hasil.ok && (
          <p role="alert" className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#912018]">
            {hasil.pesan}
          </p>
        )}
        <div>
          <button type="submit" className="btn-solid" disabled={sibuk || nisn.length < 10}>
            {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            Lihat absensi
          </button>
        </div>
      </form>
    </div>
  );
}
