"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, GraduationCap, LoaderCircle, Search, TriangleAlert } from "lucide-react";
import { urutKelas } from "@/lib/absensi/tipe";
import { LABEL_LULUS, STATUS_LULUS, waktuPengumuman, type DataKelulusan, type StatusLulus } from "@/lib/kelulusan/tipe";
import { imporKelulusan, simpanAturKelulusan, tandaiKelulusan, type HasilImporLulus } from "@/app/dashboard/kelulusan/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong } from "@/components/dasbor/ui";

type SiswaXII = { nisn: string; nama: string; kelas: string; adaTglLahir: boolean };

const GAYA: Record<StatusLulus | "belum", string> = {
  lulus: "d-lencana d-lencana-hijau",
  tidak: "d-lencana d-lencana-merah",
  tunda: "d-lencana d-lencana-kuning",
  belum: "d-lencana",
};

/** ISO → nilai input datetime-local dalam WITA. */
function keLokal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 8 * 3600_000);
  return d.toISOString().slice(0, 16);
}

function Dialog({ buka, tutup, judul, children }: { buka: boolean; tutup: () => void; judul: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (buka && !ref.current?.open) ref.current?.showModal();
    if (!buka && ref.current?.open) ref.current.close();
  }, [buka]);
  return (
    <dialog ref={ref} className="d-dialog" style={{ width: "min(94vw, 620px)" }} onCancel={(e) => { e.preventDefault(); tutup(); }} aria-label={judul}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-ink">{judul}</h2>
        <div className="mt-4">{buka && children}</div>
      </div>
    </dialog>
  );
}

const CONTOH = "NISN\tStatus\tKeterangan\n0081234567\tLulus\t\n0087654321\tTidak lulus\tNilai belum lengkap";

export function KelolaKelulusan({ siswa, data, terbuka }: { siswa: SiswaXII[]; data: DataKelulusan; terbuka: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [atur, setAtur] = useState({ ...data.atur, bukaLokal: keLokal(data.atur.buka) });
  const [sibuk, setSibuk] = useState(false);
  const [cari, setCari] = useState("");
  const [kelas, setKelas] = useState("");
  const [saring, setSaring] = useState<StatusLulus | "belum" | "">("");
  const [impor, setImpor] = useState(false);
  const [teks, setTeks] = useState("");
  const [hasilImpor, setHasilImpor] = useState<HasilImporLulus | null>(null);

  const daftarKelas = useMemo(() => [...new Set(siswa.map((s) => s.kelas))].sort(urutKelas), [siswa]);
  const statusDari = (n: string): StatusLulus | "belum" => data.hasil[n]?.status ?? "belum";
  const hitung = useMemo(() => {
    const h = { lulus: 0, tidak: 0, tunda: 0, belum: 0 };
    for (const s of siswa) h[statusDari(s.nisn)]++;
    return h;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswa, data]);
  const tanpaTgl = siswa.filter((s) => !s.adaTglLahir).length;

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return siswa
      .filter((s) => (!kelas || s.kelas === kelas) && (!saring || statusDari(s.nisn) === saring) && (!q || s.nama.toLowerCase().includes(q) || s.nisn.includes(q)))
      .sort((a, b) => urutKelas(a.kelas, b.kelas) || a.nama.localeCompare(b.nama, "id"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswa, data, cari, kelas, saring]);

  const simpanAtur = async () => {
    setSibuk(true);
    const h = await simpanAturKelulusan(atur);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) router.refresh();
  };

  const tandai = async (nisn: string[], status: StatusLulus | null) => {
    const h = await tandaiKelulusan(nisn, status);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) router.refresh();
  };

  const tandaiSemua = async () => {
    const belum = tampil.filter((s) => statusDari(s.nisn) === "belum").map((s) => s.nisn);
    if (!belum.length) return toast("Semua siswa yang tampil sudah punya status.", "galat");
    const ok = await konfirmasi({ judul: `Tandai ${belum.length} siswa lulus?`, pesan: "Hanya siswa yang belum punya status (sesuai saringan saat ini). Status yang sudah ada tidak diubah.", tombol: "Tandai lulus" });
    if (ok) await tandai(belum, "lulus");
  };

  const jalankanImpor = async () => {
    setSibuk(true);
    const h = await imporKelulusan(teks);
    setSibuk(false);
    setHasilImpor(h);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.berhasil) router.refresh();
    if (h.ok && !h.gagal.length) { setImpor(false); setTeks(""); }
  };

  return (
    <div className="flex flex-col gap-6">
      <Kartu
        judul="Pengumuman"
        deskripsi={
          !data.atur.aktif
            ? "Nonaktif: halaman cek kelulusan menampilkan \"belum dibuka\"."
            : terbuka
              ? "Sedang dibuka: siswa sudah bisa mengecek."
              : `Terjadwal: hitung mundur tampil sampai ${waktuPengumuman(data.atur.buka!)}.`
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-start gap-3 md:col-span-2">
            <button type="button" role="switch" aria-checked={atur.aktif} className="d-saklar mt-0.5" onClick={() => setAtur({ ...atur, aktif: !atur.aktif })}>
              <span className="sr-only">Aktifkan cek kelulusan</span>
            </button>
            <div>
              <p className="font-medium text-ink">Aktifkan halaman cek kelulusan</p>
              <p className="d-bantuan">Bila jadwal diisi, siswa melihat hitung mundur sampai waktu itu.</p>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Jadwal pengumuman (WITA)</span>
            <input type="datetime-local" className="d-input" value={atur.bukaLokal} onChange={(e) => setAtur({ ...atur, bukaLokal: e.target.value })} />
            <span className="d-bantuan">Kosongkan bila langsung dibuka saat diaktifkan.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Tahun pelajaran</span>
            <input className="d-input" value={atur.tahunPelajaran} onChange={(e) => setAtur({ ...atur, tahunPelajaran: e.target.value })} placeholder="2026/2027" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Pesan untuk yang lulus</span>
            <textarea className="d-input min-h-[84px]" value={atur.pesanLulus} onChange={(e) => setAtur({ ...atur, pesanLulus: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Pesan untuk yang tidak lulus / ditunda</span>
            <textarea className="d-input min-h-[84px]" value={atur.pesanTidak} onChange={(e) => setAtur({ ...atur, pesanTidak: e.target.value })} />
          </label>
          <div className="flex items-start gap-3">
            <button type="button" role="switch" aria-checked={atur.skl} className="d-saklar mt-0.5" onClick={() => setAtur({ ...atur, skl: !atur.skl })}>
              <span className="sr-only">Tampilkan SKL</span>
            </button>
            <div>
              <p className="font-medium text-ink">Siswa bisa cetak Surat Keterangan Lulus (SKL)</p>
              <p className="d-bantuan">Hanya untuk siswa berstatus lulus.</p>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Nomor surat SKL</span>
            <input className="d-input" value={atur.nomorSurat} onChange={(e) => setAtur({ ...atur, nomorSurat: e.target.value })} placeholder="Mis. 421.3/045/SMAN1BR/V/2027" />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className="d-btn d-btn-utama" onClick={simpanAtur} disabled={sibuk}>
            {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan pengaturan
          </button>
        </div>
      </Kartu>

      {tanpaTgl > 0 && (
        <p className="flex items-start gap-2 rounded-xl border border-[#fedf89] bg-[#fffaeb] px-4 py-3 text-sm text-[#93370d]">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          {tanpaTgl} siswa kelas XII belum punya tanggal lahir di Data siswa, jadi belum bisa mengecek kelulusan. Lengkapi di menu Data siswa.
        </p>
      )}

      <Kartu
        judul={`${siswa.length} siswa kelas XII`}
        deskripsi={`${hitung.lulus} lulus · ${hitung.tidak} tidak lulus · ${hitung.tunda} ditunda · ${hitung.belum} belum ditandai`}
        isiClassName=""
        aksi={
          <>
            <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => { setHasilImpor(null); setImpor(true); }}>
              <FileSpreadsheet size={15} aria-hidden="true" /> Impor
            </button>
            <button type="button" className="d-btn d-btn-utama d-btn-kecil" onClick={tandaiSemua}>
              <GraduationCap size={15} aria-hidden="true" /> Tandai lulus yang belum
            </button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2 border-b border-line p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau NISN" aria-label="Cari siswa" />
          </div>
          <select className="d-input w-auto min-w-[130px]" value={kelas} onChange={(e) => setKelas(e.target.value)} aria-label="Saring kelas">
            <option value="">Semua kelas</option>
            {daftarKelas.map((k) => <option key={k}>{k}</option>)}
          </select>
          <select className="d-input w-auto min-w-[150px]" value={saring} onChange={(e) => setSaring(e.target.value as typeof saring)} aria-label="Saring status">
            <option value="">Semua status</option>
            {STATUS_LULUS.map((s) => <option key={s} value={s}>{LABEL_LULUS[s]}</option>)}
            <option value="belum">Belum ditandai</option>
          </select>
        </div>
        {siswa.length === 0 ? (
          <div className="p-5">
            <Kosong ikon={GraduationCap} judul="Belum ada siswa kelas XII" teks="Tambahkan siswa dengan kelas berawalan XII (mis. XII-1, XII IPA 2) di menu Data siswa." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="d-tabel">
              <thead>
                <tr><th>Nama</th><th>NISN</th><th>Kelas</th><th>Status</th><th className="w-[170px]">Ubah</th></tr>
              </thead>
              <tbody>
                {tampil.map((s) => {
                  const st = statusDari(s.nisn);
                  return (
                    <tr key={s.nisn}>
                      <td className="font-medium text-ink">
                        {s.nama}
                        {!s.adaTglLahir && <span className="block text-xs text-[#b54708]">Tanggal lahir kosong</span>}
                        {data.hasil[s.nisn]?.ket && <span className="block text-xs text-muted">{data.hasil[s.nisn].ket}</span>}
                      </td>
                      <td className="font-mono text-sm">{s.nisn}</td>
                      <td>{s.kelas}</td>
                      <td><span className={GAYA[st]}>{st === "belum" ? "Belum" : LABEL_LULUS[st]}</span></td>
                      <td>
                        <select
                          className="d-input d-input-kecil"
                          value={st === "belum" ? "" : st}
                          onChange={(e) => void tandai([s.nisn], (e.target.value || null) as StatusLulus | null)}
                          aria-label={`Status kelulusan ${s.nama}`}
                        >
                          <option value="">Belum ditandai</option>
                          {STATUS_LULUS.map((x) => <option key={x} value={x}>{LABEL_LULUS[x]}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tampil.length === 0 && <p className="p-6 text-center text-sm text-muted">Tidak ada siswa yang cocok.</p>}
          </div>
        )}
      </Kartu>

      <Dialog buka={impor} tutup={() => setImpor(false)} judul="Impor status kelulusan">
        <p className="text-sm text-ink-2">
          Salin kolom dari Excel/Google Sheets lalu tempel di sini. Kolom: <b>NISN</b>, <b>Status</b> (Lulus / Tidak lulus / Ditunda), <b>Keterangan</b> (opsional). NISN harus sudah ada di Data siswa.
        </p>
        <textarea className="d-input mt-3 min-h-[200px] font-mono text-xs" value={teks} onChange={(e) => setTeks(e.target.value)} placeholder={CONTOH} />
        {hasilImpor && hasilImpor.gagal.length > 0 && (
          <ul className="mt-3 max-h-40 overflow-auto rounded-lg border border-[#fecdca] bg-[#fef3f2] p-3 text-xs text-[#912018]">
            {hasilImpor.gagal.map((g) => <li key={g.baris}>Baris {g.baris}: {g.alasan} <span className="opacity-70">({g.isi})</span></li>)}
          </ul>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="d-btn d-btn-garis" onClick={() => setImpor(false)}>Tutup</button>
          <button type="button" className="d-btn d-btn-utama" onClick={jalankanImpor} disabled={sibuk || !teks.trim()}>
            {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Impor
          </button>
        </div>
      </Dialog>
    </div>
  );
}
