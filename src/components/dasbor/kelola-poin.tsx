"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, LoaderCircle, Scale, Search, X } from "lucide-react";
import { catatPelanggaran } from "@/app/dashboard/poin/aksi";
import { useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana } from "@/components/dasbor/ui";
import { tanggalPanjang } from "@/lib/absensi/tipe";
import { labelPoin, rentangTingkat, tingkatDari, warnaTingkat, type AturanPoin, type CatatanPoin, type JenisPelanggaran } from "@/lib/poin/tipe";

type SiswaRingkas = { id: string; nama: string; kelas: string; nisn: string };
type Peringkat = SiswaRingkas & { poin: number; jumlah: number; terakhir: string };

export function KelolaPoin({
  semester,
  semesterIni,
  labelSemesterIni,
  pilihanSemester,
  hariIni,
  awalSemester,
  aturan,
  siswa,
  daftarKelas,
  peringkat,
  terbaru,
}: {
  semester: string;
  semesterIni: string;
  labelSemesterIni: string;
  pilihanSemester: { kunci: string; label: string }[];
  hariIni: string;
  awalSemester: string;
  aturan: AturanPoin;
  siswa: SiswaRingkas[];
  daftarKelas: string[];
  peringkat: Peringkat[];
  terbaru: CatatanPoin[];
}) {
  const router = useRouter();
  const toast = useToast();
  const bisaCatat = semester === semesterIni;

  /* ---------- Form catat ---------- */
  const [cariSiswa, setCariSiswa] = useState("");
  const [dipilih, setDipilih] = useState<SiswaRingkas | null>(null);
  const [cariPel, setCariPel] = useState("");
  const [jenis, setJenis] = useState<JenisPelanggaran | null>(null);
  const [poin, setPoin] = useState(0);
  const [tidakLapor, setTidakLapor] = useState(false);
  const [tanggal, setTanggal] = useState(hariIni);
  const [ket, setKet] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const saranSiswa = useMemo(() => {
    const q = cariSiswa.trim().toLowerCase();
    if (q.length < 2) return [];
    return siswa.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q)).slice(0, 7);
  }, [cariSiswa, siswa]);

  const daftarPel = useMemo(() => {
    const q = cariPel.trim().toLowerCase();
    return aturan.pelanggaran.filter((p) => !q || p.nama.toLowerCase().includes(q) || String(p.no) === q);
  }, [cariPel, aturan.pelanggaran]);

  const pilihJenis = (p: JenisPelanggaran) => {
    setJenis(p);
    setPoin(p.min);
  };

  const totalSiswa = dipilih ? (peringkat.find((x) => x.id === dipilih.id)?.poin ?? 0) : 0;
  const poinAkhir = tidakLapor ? poin * 2 : poin;

  const simpan = async () => {
    if (!dipilih || !jenis) return;
    setSibuk(true);
    try {
      const h = await catatPelanggaran({ siswaId: dipilih.id, no: jenis.no, poin, tidakLapor, tanggal, ket });
      toast(h.pesan, h.ok ? "sukses" : "galat");
      if (h.ok) {
        setDipilih(null);
        setCariSiswa("");
        setJenis(null);
        setCariPel("");
        setTidakLapor(false);
        setKet("");
        setTanggal(hariIni);
        router.refresh();
      }
    } catch {
      toast("Koneksi ke server gagal. Coba lagi.", "galat");
    } finally {
      setSibuk(false);
    }
  };

  /* ---------- Daftar ---------- */
  const [kelas, setKelas] = useState("");
  const [cari, setCari] = useState("");
  const tampil = peringkat.filter(
    (r) => (!kelas || r.kelas === kelas) && (!cari.trim() || r.nama.toLowerCase().includes(cari.trim().toLowerCase()) || r.nisn.includes(cari.trim())),
  );
  const urutTingkat = [...aturan.tingkat].sort((a, b) => a.dari - b.dari);
  const hitungTingkat = urutTingkat.map((t) => ({ t, n: peringkat.filter((r) => tingkatDari(r.poin, urutTingkat).kode === t.kode).length }));

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] [&>*]:min-w-0">
      {/* ---------- Catat pelanggaran ---------- */}
      <Kartu
        judul="Catat pelanggaran"
        deskripsi={bisaCatat ? labelSemesterIni : "Semester lama hanya bisa dilihat."}
        className="xl:sticky xl:top-24 xl:self-start"
      >
        {!bisaCatat ? (
          <p className="text-sm text-muted">
            Anda sedang melihat semester lama.{" "}
            <Link href="/dashboard/poin" className="font-medium text-brand hover:underline">
              Kembali ke semester ini
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Siswa */}
            <div>
              <span className="d-label">1. Siswa</span>
              {dipilih ? (
                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{dipilih.nama}</p>
                    <p className="text-xs text-muted">
                      {dipilih.kelas} · NISN {dipilih.nisn} · {totalSiswa} poin semester ini
                    </p>
                  </div>
                  <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setDipilih(null)} aria-label="Ganti siswa">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1.5">
                  <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="d-input pl-9" value={cariSiswa} onChange={(e) => setCariSiswa(e.target.value)} placeholder="Ketik nama atau NISN" aria-label="Cari siswa" />
                  {saranSiswa.length > 0 && (
                    <ul className="mt-1.5 overflow-hidden rounded-xl border border-line bg-paper">
                      {saranSiswa.map((s) => (
                        <li key={s.id}>
                          <button type="button" className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm hover:bg-brand-soft" onClick={() => setDipilih(s)}>
                            <span className="min-w-0 truncate font-medium text-ink">{s.nama}</span>
                            <span className="shrink-0 text-xs text-muted">{s.kelas}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {cariSiswa.trim().length >= 2 && saranSiswa.length === 0 && <p className="mt-1.5 text-xs text-muted">Siswa tidak ditemukan.</p>}
                </div>
              )}
            </div>

            {/* Jenis pelanggaran */}
            <div>
              <span className="d-label">2. Jenis pelanggaran</span>
              {jenis ? (
                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5">
                  <p className="min-w-0 text-sm font-medium text-ink">
                    {jenis.no}. {jenis.nama}
                  </p>
                  <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setJenis(null)} aria-label="Ganti pelanggaran">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <input className="d-input mt-1.5" value={cariPel} onChange={(e) => setCariPel(e.target.value)} placeholder="Cari, mis. terlambat, HP, berkelahi" aria-label="Cari jenis pelanggaran" />
                  <ul className="d-gulir-tipis mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line bg-paper">
                    {daftarPel.map((p) => (
                      <li key={p.no}>
                        <button type="button" className="flex w-full items-start justify-between gap-3 px-3.5 py-2 text-left text-sm hover:bg-brand-soft" onClick={() => pilihJenis(p)}>
                          <span className="min-w-0 text-ink">
                            <span className="text-muted">{p.no}.</span> {p.nama}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-ink">{labelPoin(p)}</span>
                        </button>
                      </li>
                    ))}
                    {daftarPel.length === 0 && <li className="px-3.5 py-3 text-sm text-muted">Tidak ada yang cocok.</li>}
                  </ul>
                </>
              )}
            </div>

            {jenis && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="d-label">3. Poin {jenis.min !== jenis.maks && `(${jenis.min}–${jenis.maks})`}</span>
                    {jenis.min === jenis.maks ? (
                      <span className="d-input bg-paper-2 font-semibold tabular-nums">{jenis.min}</span>
                    ) : (
                      <input type="number" className="d-input tabular-nums" min={jenis.min} max={jenis.maks} value={poin} onChange={(e) => setPoin(Number(e.target.value))} />
                    )}
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="d-label">Tanggal kejadian</span>
                    <input type="date" className="d-input" value={tanggal} min={awalSemester} max={hariIni} onChange={(e) => e.target.value && setTanggal(e.target.value)} />
                  </label>
                </div>
                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input type="checkbox" className="d-kotak-centang mt-0.5" checked={tidakLapor} onChange={(e) => setTidakLapor(e.target.checked)} />
                  <span>
                    Siswa tidak melapor ke petugas <span className="text-muted">(poin dikali 2, sesuai buku saku)</span>
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="d-label">Keterangan (opsional)</span>
                  <textarea className="d-input min-h-[72px]" value={ket} onChange={(e) => setKet(e.target.value)} maxLength={300} placeholder="Mis. ketahuan merokok di belakang kantin saat istirahat" />
                </label>
                <button type="button" className="d-btn d-btn-utama justify-center py-3 text-base" onClick={simpan} disabled={sibuk || !dipilih || poin < jenis.min || poin > jenis.maks}>
                  {sibuk && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
                  Simpan +{poinAkhir || 0} poin
                </button>
                {!dipilih && <p className="-mt-3 text-center text-xs text-muted">Pilih siswa dulu.</p>}
              </>
            )}
          </div>
        )}
      </Kartu>

      <div className="flex min-w-0 flex-col gap-6">
        {/* Ringkasan tingkat */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
          {hitungTingkat.map(({ t, n }) => (
            <li key={t.kode} className="d-kartu min-w-0 p-4">
              <div className="flex items-center justify-between gap-2">
                <Lencana warna={warnaTingkat(t.dari, urutTingkat)}>Tingkat {t.kode}</Lencana>
                <span className="text-xl font-bold tabular-nums text-ink">{n}</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {rentangTingkat(t)} poin
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-ink-2">{t.sanksi}</p>
            </li>
          ))}
        </ul>

        {/* Peringkat siswa */}
        <Kartu judul="Poin siswa" deskripsi="Diurutkan dari poin terbanyak. Klik nama untuk melihat riwayat dan mencetak surat." isiClassName="p-0">
          <div className="flex flex-wrap items-end gap-3 border-b border-line px-5 py-4">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="d-label">Semester</span>
              <select className="d-input w-full min-w-0 sm:w-auto" value={semester} onChange={(e) => router.push(`/dashboard/poin?semester=${e.target.value}`)}>
                {pilihanSemester.map((s) => (
                  <option key={s.kunci} value={s.kunci}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="d-label">Kelas</span>
              <select className="d-input w-full min-w-[120px] sm:w-auto" value={kelas} onChange={(e) => setKelas(e.target.value)}>
                <option value="">Semua kelas</option>
                {daftarKelas.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <div className="relative min-w-[200px] flex-1">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau NISN" aria-label="Cari siswa" />
            </div>
          </div>
          {peringkat.length === 0 ? (
            <Kosong ikon={Scale} judul="Belum ada pelanggaran" teks="Siswa yang dicatat melanggar di semester ini akan tampil di sini." />
          ) : tampil.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Tidak ada yang cocok.</p>
          ) : (
            <ul className="divide-y divide-line">
              {tampil.map((r) => {
                const t = tingkatDari(r.poin, urutTingkat);
                return (
                  <li key={r.id}>
                    <Link href={`/dashboard/poin/${r.id}?semester=${semester}`} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-soft/60">
                      <span className="w-12 shrink-0 text-right text-lg font-bold tabular-nums text-ink">{r.poin}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink">{r.nama}</span>
                        <span className="block truncate text-xs text-muted">
                          {r.kelas} · {r.jumlah} pelanggaran · terakhir {tanggalPanjang(r.terakhir)}
                        </span>
                      </span>
                      <span className="hidden min-w-0 max-w-[34ch] truncate text-xs text-ink-2 md:block">{t.sanksi}</span>
                      <Lencana warna={warnaTingkat(r.poin, urutTingkat)}>{t.kode}</Lencana>
                      <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Kartu>

        {terbaru.length > 0 && (
          <Kartu judul="Catatan terbaru" isiClassName="p-0">
            <ul className="divide-y divide-line">
              {terbaru.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-5 py-2.5 text-sm">
                  <span className="font-medium text-ink">{c.siswa.nama}</span>
                  <span className="text-muted">{c.siswa.kelas}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-2">{c.pelanggaran.nama}</span>
                  <span className="font-semibold tabular-nums text-ink">+{c.poin}</span>
                  <span className="w-full text-xs text-muted sm:w-auto">oleh {c.oleh.nama}</span>
                </li>
              ))}
            </ul>
          </Kartu>
        )}
      </div>
    </div>
  );
}
