"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, LoaderCircle, Pencil, Search, Trash2, UserPlus, Users } from "lucide-react";
import { urutKelas, type Siswa } from "@/lib/absensi/tipe";
import { formatTanggal } from "@/lib/format";
import { hapusSiswa, imporSiswa, simpanSiswa, type HasilImpor } from "@/app/dashboard/siswa/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana } from "@/components/dasbor/ui";

function Dialog({ buka, tutup, judul, lebar = 480, children }: { buka: boolean; tutup: () => void; judul: string; lebar?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (buka && !ref.current?.open) ref.current?.showModal();
    if (!buka && ref.current?.open) ref.current.close();
  }, [buka]);
  return (
    <dialog
      ref={ref}
      className="d-dialog"
      style={{ width: `min(94vw, ${lebar}px)` }}
      onCancel={(e) => {
        e.preventDefault();
        tutup();
      }}
      aria-label={judul}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-ink">{judul}</h2>
        <div className="mt-4">{buka && children}</div>
      </div>
    </dialog>
  );
}

function Isian({ label, galat, bantuan, children }: { label: string; galat?: string; bantuan?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="d-label">{label}</span>
      {children}
      {galat ? <span className="d-galat">{galat}</span> : bantuan ? <span className="d-bantuan">{bantuan}</span> : null}
    </label>
  );
}

const KOSONG = { nisn: "", nama: "", kelas: "", tglLahir: "", kodeQr: "", aktif: true };
const CONTOH = "NISN\tNama\tKelas\tTanggal lahir\n0081234567\tAhmad Rizki\tX-1\t17/05/2009\n0087654321\tSiti Aisyah\tX-1\t02/11/2008";

export function KelolaSiswa({ daftar }: { daftar: Siswa[] }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [cari, setCari] = useState("");
  const [kelas, setKelas] = useState("");
  const [mode, setMode] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [sibuk, setSibuk] = useState(false);
  const [impor, setImpor] = useState(false);
  const [teksImpor, setTeksImpor] = useState("");
  const [hasilImpor, setHasilImpor] = useState<HasilImpor | null>(null);

  const daftarKelas = useMemo(() => [...new Set(daftar.map((s) => s.kelas))].sort(urutKelas), [daftar]);
  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar
      .filter((s) => (!kelas || s.kelas === kelas) && (!q || s.nama.toLowerCase().includes(q) || s.nisn.includes(q)))
      .sort((a, b) => urutKelas(a.kelas, b.kelas) || a.nama.localeCompare(b.nama, "id"));
  }, [daftar, cari, kelas]);

  const buka = (s?: Siswa) => {
    setGalat({});
    setForm(s ? { nisn: s.nisn, nama: s.nama, kelas: s.kelas, tglLahir: s.tglLahir ?? "", kodeQr: s.kodeQr ?? "", aktif: s.aktif } : { ...KOSONG, kelas });
    setMode({ id: s?.id ?? null });
  };

  const kirim = async () => {
    if (!mode) return;
    setSibuk(true);
    const h = await simpanSiswa(mode.id, form);
    setSibuk(false);
    if (!h.ok) {
      setGalat(h.galat ?? {});
      toast(h.pesan, "galat");
      return;
    }
    toast(h.pesan);
    setMode(null);
    router.refresh();
  };

  const hapus = async (s: Siswa) => {
    const ok = await konfirmasi({
      judul: `Hapus ${s.nama}?`,
      pesan: "QR kartunya tidak dikenali lagi dan orang tua tidak bisa cek absensi dengan NISN ini. Catatan absensi lama tetap tersimpan.",
      tombol: "Hapus",
      bahaya: true,
    });
    if (!ok) return;
    const h = await hapusSiswa(s.id);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    router.refresh();
  };

  const jalankanImpor = async () => {
    setSibuk(true);
    const h = await imporSiswa(teksImpor);
    setSibuk(false);
    setHasilImpor(h);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.tambah || h.perbarui) router.refresh();
    if (h.ok && !h.gagal.length) {
      setImpor(false);
      setTeksImpor("");
    }
  };

  return (
    <>
      <Kartu
        judul={`${daftar.length} siswa`}
        deskripsi={`${daftarKelas.length} kelas`}
        isiClassName=""
        aksi={
          <>
            <button
              type="button"
              className="d-btn d-btn-garis d-btn-kecil"
              onClick={() => {
                setHasilImpor(null);
                setImpor(true);
              }}
            >
              <FileSpreadsheet size={15} aria-hidden="true" /> <span className="hidden sm:inline">Impor dari</span> Excel
            </button>
            <button type="button" className="d-btn d-btn-utama d-btn-kecil" onClick={() => buka()}>
              <UserPlus size={15} aria-hidden="true" /> Tambah
            </button>
          </>
        }
      >
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau NISN" aria-label="Cari siswa" />
          </div>
          <select className="d-input w-auto min-w-[150px]" value={kelas} onChange={(e) => setKelas(e.target.value)} aria-label="Saring kelas">
            <option value="">Semua kelas</option>
            {daftarKelas.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {daftar.length === 0 ? (
          <Kosong
            ikon={Users}
            judul="Belum ada siswa"
            teks="Cara tercepat: buka file Excel data siswa, blok kolom NISN, Nama, Kelas (dan Tanggal lahir), salin, lalu tempel lewat tombol Impor."
            aksi={
              <button type="button" className="d-btn d-btn-utama" onClick={() => setImpor(true)}>
                <FileSpreadsheet size={16} aria-hidden="true" /> Impor dari Excel
              </button>
            }
          />
        ) : tampil.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Tidak ada siswa yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="d-tabel">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NISN</th>
                  <th>Kelas</th>
                  <th>Tanggal lahir</th>
                  <th>Kode QR</th>
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {tampil.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="font-medium text-ink">{s.nama}</span> {!s.aktif && <Lencana>Nonaktif</Lencana>}
                    </td>
                    <td className="font-mono text-sm">{s.nisn}</td>
                    <td>{s.kelas}</td>
                    <td className="text-sm">{s.tglLahir ? formatTanggal(s.tglLahir, { pendek: true }) : <span className="text-muted">—</span>}</td>
                    <td className="max-w-[18ch] truncate font-mono text-xs text-muted">{s.kodeQr || "= NISN"}</td>
                    <td>
                      <div className="flex gap-1">
                        <button type="button" className="d-btn d-btn-hantu d-btn-kecil d-btn-ikon" onClick={() => buka(s)} aria-label={`Ubah ${s.nama}`} title="Ubah">
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil d-btn-ikon" onClick={() => hapus(s)} aria-label={`Hapus ${s.nama}`} title="Hapus">
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>

      <Dialog buka={!!mode} tutup={() => setMode(null)} judul={mode?.id ? "Ubah data siswa" : "Tambah siswa"}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void kirim();
          }}
        >
          <Isian label="Nama lengkap" galat={galat.nama}>
            <input className="d-input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} aria-invalid={!!galat.nama || undefined} autoFocus />
          </Isian>
          <div className="grid gap-4 sm:grid-cols-2">
            <Isian label="NISN" galat={galat.nisn} bantuan="10 angka">
              <input
                className="d-input font-mono"
                inputMode="numeric"
                value={form.nisn}
                onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                aria-invalid={!!galat.nisn || undefined}
              />
            </Isian>
            <Isian label="Kelas" galat={galat.kelas}>
              <input className="d-input" list="daftar-kelas" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} aria-invalid={!!galat.kelas || undefined} />
              <datalist id="daftar-kelas">
                {daftarKelas.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </Isian>
          </div>
          <Isian label="Tanggal lahir (opsional)" galat={galat.tglLahir} bantuan="Dipakai bila cek absensi orang tua diwajibkan tanggal lahir.">
            <input type="date" className="d-input" value={form.tglLahir} onChange={(e) => setForm({ ...form, tglLahir: e.target.value })} aria-invalid={!!galat.tglLahir || undefined} />
          </Isian>
          <Isian label="Kode QR (opsional)" galat={galat.kodeQr} bantuan="Kosongkan bila QR di kartu berisi NISN. Isi bila QR berisi kode lain (scan kartu lalu salin hasilnya ke sini).">
            <input className="d-input font-mono" value={form.kodeQr} onChange={(e) => setForm({ ...form, kodeQr: e.target.value })} aria-invalid={!!galat.kodeQr || undefined} />
          </Isian>
          {mode?.id && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="d-kotak-centang" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
              Siswa aktif (matikan bila pindah/lulus: tidak muncul di absensi)
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="d-btn d-btn-garis" onClick={() => setMode(null)}>
              Batal
            </button>
            <button type="submit" className="d-btn d-btn-utama" disabled={sibuk}>
              {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog buka={impor} tutup={() => setImpor(false)} judul="Impor siswa dari Excel" lebar={640}>
        <div className="flex flex-col gap-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
            <li>Buka file Excel / Google Sheets data siswa.</li>
            <li>
              Blok kolom <b>NISN, Nama, Kelas</b> (boleh tambah <b>Tanggal lahir</b> dan <b>Kode QR</b>), termasuk baris judulnya.
            </li>
            <li>Salin (Ctrl/Cmd + C), lalu tempel di kotak bawah.</li>
          </ol>
          <textarea
            className="d-input min-h-[200px] font-mono text-xs"
            value={teksImpor}
            onChange={(e) => setTeksImpor(e.target.value)}
            placeholder={CONTOH}
            spellCheck={false}
          />
          <p className="d-bantuan">NISN yang sudah ada akan diperbarui (tidak dobel). Tanpa baris judul, urutan kolom dianggap: NISN, Nama, Kelas, Tanggal lahir, Kode QR.</p>
          {hasilImpor && (
            <div className={`rounded-xl border p-3 text-sm ${hasilImpor.gagal.length ? "border-[#fedf89] bg-[#fffaeb]" : "border-[#abefc6] bg-[#ecfdf3]"}`}>
              <p className="font-semibold text-ink">{hasilImpor.pesan}</p>
              {hasilImpor.gagal.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-ink-2">
                  {hasilImpor.gagal.map((g) => (
                    <li key={g.baris}>
                      Baris {g.baris}: {g.alasan} <span className="font-mono text-muted">({g.isi})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="d-btn d-btn-garis" onClick={() => setImpor(false)}>
              Tutup
            </button>
            <button type="button" className="d-btn d-btn-utama" onClick={jalankanImpor} disabled={sibuk || !teksImpor.trim()}>
              {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Impor
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
