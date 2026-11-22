"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarClock, CircleCheck, LoaderCircle, RotateCcw, Table2, TriangleAlert, Users } from "lucide-react";
import { LABEL_STATUS, tanggalPanjang, type StatusAbsen } from "@/lib/absensi/tipe";
import { kunciSesi, labelJam, LABEL_MAPEL, SINGKAT_MAPEL, STATUS_MAPEL, type Blok, type SesiMapel, type StatusMapel } from "@/lib/jadwal/tipe";
import { simpanAbsenKelas } from "@/app/dashboard/absen-kelas/aksi";
import { useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana, waktuLengkap } from "@/components/dasbor/ui";

export type RingkasSesi = { oleh: string; waktu: string; tidakHadir: number };
type SiswaForm = { id: string; nama: string; nisn: string; pagi: StatusAbsen | null };

const WARNA: Record<StatusMapel, string> = {
  hadir: "bg-brand text-white border-brand",
  sakit: "bg-[#1d5fa8] text-white border-[#1d5fa8]",
  izin: "bg-[#6b4fb0] text-white border-[#6b4fb0]",
  alpa: "bg-[#b42318] text-white border-[#b42318]",
};

/** Status awal dari absen pagi: sakit/izin/alpa ikut terbawa, selain itu hadir. */
const dariPagi = (pagi: StatusAbsen | null): StatusMapel => (pagi === "sakit" || pagi === "izin" || pagi === "alpa" ? pagi : "hadir");

export function AbsenKelas(props: {
  tanggal: string;
  hariIni: string;
  labelHari: string;
  libur: boolean;
  admin: boolean;
  jamKini: string;
  blokSaya: Blok[];
  semuaKelas: string[];
  kelasLain: string;
  blokLain: Blok[];
  kelasWali: string;
  terisi: Record<string, RingkasSesi>;
  formulir: { blok: Blok; siswa: SiswaForm[]; sesi: SesiMapel | null } | null;
  adaJadwal: boolean;
}) {
  const { tanggal, hariIni, admin, blokSaya, kelasLain, blokLain, terisi, formulir } = props;
  const router = useRouter();
  const [isi, setIsi] = useState(terisi);

  const ke = (q: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    if (tanggal !== hariIni) u.set("tanggal", tanggal);
    for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== "") u.set(k, String(v));
    router.push(`/dashboard/absen-kelas${u.size ? `?${u}` : ""}`, { scroll: false });
  };
  const buka = (b: Blok) => ke({ kelas: kelasLain || undefined, kelasBlok: b.kelas, jam: b.jamMulai });
  const aktif = (b: Blok) => formulir?.blok.kelas === b.kelas && formulir.blok.jamMulai === b.jamMulai;

  const daftarBlok = (daftar: Blok[], tampilKelas: boolean) => (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {daftar.map((b) => {
        const s = isi[kunciSesi(tanggal, b.kelas, b.jamMulai)];
        const kini = tanggal === hariIni && b.mulai <= props.jamKini && props.jamKini < b.selesai;
        const lewat = tanggal < hariIni || (tanggal === hariIni && b.selesai <= props.jamKini);
        return (
          <li key={`${b.kelas}-${b.jamMulai}`}>
            <button
              type="button"
              onClick={() => buka(b)}
              aria-pressed={aktif(b)}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                aktif(b) ? "border-brand bg-brand-soft" : "border-line bg-white hover:bg-paper-2"
              }`}
            >
              <span className="mt-0.5 w-[5.6rem] shrink-0 text-xs leading-tight text-muted tabular-nums">
                <b className="block text-[0.8125rem] text-ink">{labelJam(b)}</b>
                {b.mulai.replace(":", ".")}–{b.selesai.replace(":", ".")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">
                  {tampilKelas ? `${b.kelas} · ` : ""}
                  {b.mapel}
                </span>
                <span className="block truncate text-xs text-muted">{tampilKelas ? b.guru : `Kelas ${b.kelas}`}</span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {kini && <Lencana warna="kuning">Sedang berlangsung</Lencana>}
                  {s ? (
                    <Lencana warna="hijau">Sudah diisi{s.tidakHadir ? ` · ${s.tidakHadir} tidak hadir` : ""}</Lencana>
                  ) : lewat ? (
                    <Lencana warna="merah">Belum diisi</Lencana>
                  ) : (
                    <Lencana>Belum diisi</Lencana>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        {admin && (
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Tanggal</span>
            <input
              type="date"
              className="d-input w-auto"
              value={tanggal}
              max={hariIni}
              onChange={(e) => e.target.value && router.push(`/dashboard/absen-kelas?tanggal=${e.target.value}`)}
            />
          </label>
        )}
        <p className="pb-2 text-sm text-muted">
          {tanggalPanjang(tanggal)}
          {tanggal === hariIni && <> · sekarang {props.jamKini.replace(":", ".")} WITA</>}
        </p>
        <div className="flex-1" />
        <Link href={`/dashboard/absen-kelas/rekap${props.kelasWali ? `?kelas=${props.kelasWali}` : ""}`} className="d-btn d-btn-garis">
          <Table2 size={16} aria-hidden="true" /> Rekap kelas{props.kelasWali ? ` ${props.kelasWali}` : ""}
        </Link>
        {admin && (
          <Link href="/dashboard/absen-kelas/jadwal" className="d-btn d-btn-garis">
            <CalendarClock size={16} aria-hidden="true" /> Atur jadwal
          </Link>
        )}
      </div>

      {!props.adaJadwal ? (
        <Kartu>
          <Kosong ikon={CalendarClock} judul="Jadwal pelajaran belum diisi" teks="Admin perlu mengisi jadwal pelajaran dulu supaya absen kelas bisa dipakai." />
        </Kartu>
      ) : props.libur ? (
        <Kartu>
          <Kosong ikon={CalendarClock} judul="Hari Minggu" teks="Tidak ada jadwal pelajaran hari ini." />
        </Kartu>
      ) : (
        <>
          <Kartu
            judul={`Jadwal saya · ${props.labelHari}`}
            deskripsi={blokSaya.length ? "Ketuk pelajaran untuk mengisi absen. Jam berturut-turut dengan mapel yang sama cukup diisi sekali." : undefined}
          >
            {blokSaya.length ? (
              daftarBlok(blokSaya, false)
            ) : (
              <p className="text-sm text-muted">
                {admin ? "Akun admin tidak punya jam mengajar. Pilih kelas di bawah untuk mengisi atau mengoreksi absen." : "Anda tidak punya jam mengajar di jadwal hari ini."}
              </p>
            )}
          </Kartu>

          <Kartu judul="Kelas lain / guru pengganti" deskripsi="Pilih kelas bila menggantikan guru lain atau mengoreksi absen kelas tertentu.">
            <select
              className="d-input w-auto min-w-[180px]"
              value={kelasLain}
              onChange={(e) => ke({ kelas: e.target.value || undefined })}
              aria-label="Pilih kelas"
            >
              <option value="">Pilih kelas…</option>
              {props.semuaKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            {kelasLain && (
              <div className="mt-4">
                {blokLain.length ? daftarBlok(blokLain, true) : <p className="text-sm text-muted">Tidak ada pelajaran di kelas ini hari ini.</p>}
              </div>
            )}
          </Kartu>

          {formulir && (
            <FormAbsen
              key={`${formulir.blok.kelas}-${formulir.blok.jamMulai}-${formulir.sesi?.waktu ?? ""}`}
              tanggal={tanggal}
              bolehIsi={tanggal === hariIni || admin}
              {...formulir}
              onTersimpan={(s) => setIsi((m) => ({ ...m, [kunciSesi(s.tanggal, s.kelas, s.jamMulai)]: { oleh: s.oleh.nama, waktu: s.waktu, tidakHadir: Object.keys(s.tidakHadir).length } }))}
            />
          )}
        </>
      )}
    </div>
  );
}

function FormAbsen({
  tanggal,
  blok,
  siswa,
  sesi,
  bolehIsi,
  onTersimpan,
}: {
  tanggal: string;
  blok: Blok;
  siswa: SiswaForm[];
  sesi: SesiMapel | null;
  bolehIsi: boolean;
  onTersimpan: (s: SesiMapel) => void;
}) {
  const toast = useToast();
  const awal = () => Object.fromEntries(siswa.map((s) => [s.id, sesi ? (sesi.tidakHadir[s.id] ?? "hadir") : dariPagi(s.pagi)])) as Record<string, StatusMapel>;
  const [status, setStatus] = useState<Record<string, StatusMapel>>(awal);
  const [sibuk, setSibuk] = useState(false);
  const [terakhir, setTerakhir] = useState(sesi);

  const hitung = useMemo(() => {
    const h: Record<StatusMapel, number> = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    for (const v of Object.values(status)) h[v]++;
    return h;
  }, [status]);
  const tanpaScan = siswa.filter((s) => !s.pagi).length;
  /** Absen pagi belum dipakai sama sekali untuk kelas ini: jangan beri tanda ⚠ di setiap baris. */
  const pagiKosong = tanpaScan === siswa.length;

  const simpan = async () => {
    setSibuk(true);
    const tidakHadir = Object.fromEntries(Object.entries(status).filter(([, v]) => v !== "hadir"));
    let h;
    try {
      h = await simpanAbsenKelas({ tanggal, kelas: blok.kelas, jamMulai: blok.jamMulai, tidakHadir });
    } catch {
      h = { ok: false as const, pesan: "Koneksi ke server gagal. Coba simpan lagi." };
    }
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setTerakhir(h.sesi);
      onTersimpan(h.sesi);
    }
  };

  return (
    <Kartu
      judul={`${blok.kelas} · ${labelJam(blok)} · ${blok.mapel}`}
      deskripsi={
        <>
          {blok.guru} · {blok.mulai.replace(":", ".")}–{blok.selesai.replace(":", ".")} WITA
          {terakhir && (
            <>
              <br />
              <span className="text-brand">
                Terakhir disimpan {terakhir.oleh.nama}, {waktuLengkap(terakhir.waktu)}
              </span>
            </>
          )}
        </>
      }
      aksi={
        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setStatus(Object.fromEntries(siswa.map((s) => [s.id, "hadir"])))}>
          <RotateCcw size={14} aria-hidden="true" /> Semua hadir
        </button>
      }
      isiClassName=""
    >
      {siswa.length === 0 ? (
        <Kosong ikon={Users} judul="Belum ada siswa di kelas ini" teks="Tambahkan data siswa lewat menu Data siswa." />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 border-b border-line p-4">
            {STATUS_MAPEL.map((st) => (
              <div key={st} className="rounded-xl border border-line bg-white px-3 py-2">
                <span className="block text-xs text-muted">{LABEL_MAPEL[st]}</span>
                <span className="block text-lg font-semibold tabular-nums text-ink">{hitung[st]}</span>
              </div>
            ))}
          </div>
          {pagiKosong ? (
            <p className="border-b border-line bg-paper-2 px-4 py-2.5 text-[0.8125rem] text-ink-2">Belum ada data absen pagi (scan QR) untuk kelas ini pada tanggal ini.</p>
          ) : (
            tanpaScan > 0 && (
              <p className="flex items-start gap-2 border-b border-line bg-[#fff8e6] px-4 py-2.5 text-[0.8125rem] text-[#7a5200]">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {tanpaScan} siswa belum tercatat di absen pagi (ditandai ⚠). Pastikan mereka memang ada di kelas.
              </p>
            )
          )}
          <ul className="divide-y divide-line">
            {siswa.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9375rem] font-medium text-ink">{s.nama}</span>
                  {!pagiKosong && (
                    <span className="block text-xs text-muted">
                      Pagi: {s.pagi ? LABEL_STATUS[s.pagi] : <span className="text-[#9a6700]">⚠ belum scan</span>}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 gap-0.5 sm:gap-1" role="radiogroup" aria-label={`Status ${s.nama}`}>
                  {STATUS_MAPEL.map((st) => (
                    <button
                      key={st}
                      type="button"
                      role="radio"
                      aria-checked={status[s.id] === st}
                      aria-label={LABEL_MAPEL[st]}
                      title={LABEL_MAPEL[st]}
                      disabled={!bolehIsi}
                      onClick={() => setStatus((m) => ({ ...m, [s.id]: st }))}
                      className={`h-8 w-8 rounded-full border text-sm font-semibold sm:h-9 sm:w-9 transition-colors ${
                        status[s.id] === st ? WARNA[st] : "border-line bg-white text-muted hover:bg-paper-2"
                      }`}
                    >
                      {SINGKAT_MAPEL[st]}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-3">
            <span className="min-w-0 flex-1 text-sm text-ink-2">
              {hitung.hadir} hadir · {siswa.length - hitung.hadir} tidak hadir
            </span>
            <button type="button" className="d-btn d-btn-utama" onClick={simpan} disabled={sibuk || !bolehIsi}>
              {sibuk ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <CircleCheck size={16} aria-hidden="true" />}
              {terakhir ? "Simpan perubahan" : "Simpan absen"}
            </button>
          </div>
        </>
      )}
    </Kartu>
  );
}
