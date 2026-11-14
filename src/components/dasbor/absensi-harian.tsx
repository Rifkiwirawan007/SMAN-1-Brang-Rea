"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, History, Keyboard, LoaderCircle, Pencil, ScanLine, Search, Settings2, UserX, Users } from "lucide-react";
import {
  KET_STATUS,
  LABEL_CARA,
  LABEL_STATUS,
  STATUS_ABSEN,
  WARNA_STATUS,
  jamWita,
  tanggalPanjang,
  type AturAbsensi,
  type CatatanAbsen,
  type StatusAbsen,
} from "@/lib/absensi/tipe";
import { aturStatusAbsen, scanAbsen, simpanPengaturanAbsensi, tandaiBelumAbsen, type HasilScan } from "@/app/dashboard/absensi/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana, waktuLengkap } from "@/components/dasbor/ui";
import { PemindaiQr } from "@/components/dasbor/pemindai-qr";

type SiswaRingkas = { id: string; nama: string; kelas: string; nisn: string };
type Filter = "semua" | "belum" | StatusAbsen;

/** Bunyi singkat: nada tinggi = berhasil, dua nada rendah = gagal/ulang. */
function bunyi(jenis: "ok" | "ulang" | "gagal") {
  try {
    const W = window as typeof window & { __audioAbsen?: AudioContext };
    const ctx = (W.__audioAbsen ??= new AudioContext());
    const nada = jenis === "ok" ? [[1046, 0, 0.12]] : jenis === "ulang" ? [[660, 0, 0.1], [660, 0.15, 0.1]] : [[220, 0, 0.18], [180, 0.22, 0.22]];
    for (const [f, mulai, lama] of nada) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = jenis === "gagal" ? "square" : "sine";
      g.gain.setValueAtTime(0.18, ctx.currentTime + mulai);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + mulai + lama);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + mulai);
      o.stop(ctx.currentTime + mulai + lama + 0.02);
    }
  } catch {
    /* audio tidak tersedia */
  }
}

function Dialog({ buka, tutup, judul, children }: { buka: boolean; tutup: () => void; judul: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (buka && !ref.current?.open) ref.current?.showModal();
    if (!buka && ref.current?.open) ref.current.close();
  }, [buka]);
  return (
    <dialog
      ref={ref}
      className="d-dialog w-[min(94vw,520px)]"
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

export function AbsensiHarian({
  tanggal,
  hariIni,
  kelas,
  daftarKelas,
  siswa,
  catatanAwal,
  atur,
  admin,
}: {
  tanggal: string;
  hariIni: string;
  kelas: string;
  daftarKelas: string[];
  siswa: SiswaRingkas[];
  catatanAwal: CatatanAbsen[];
  atur: AturAbsensi;
  admin: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [catatan, setCatatan] = useState(() => new Map(catatanAwal.map((c) => [c.siswaId, c])));
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [hasil, setHasil] = useState<HasilScan | null>(null);
  const [log, setLog] = useState<{ waktu: number; hasil: HasilScan }[]>([]);
  const [sibukScan, setSibukScan] = useState(false);
  const [ketik, setKetik] = useState("");
  const [ubah, setUbah] = useState<SiswaRingkas | null>(null);
  const [formUbah, setFormUbah] = useState<{ status: StatusAbsen; ket: string }>({ status: "sakit", ket: "" });
  const [sibuk, setSibuk] = useState(false);
  const [aturBuka, setAturBuka] = useState(false);
  const [formAtur, setFormAtur] = useState(atur);
  const antrean = useRef(Promise.resolve());

  const bisaScan = tanggal === hariIni;
  const diKelas = useMemo(() => siswa.filter((s) => !kelas || s.kelas === kelas), [siswa, kelas]);

  const hitung = useMemo(() => {
    const h: Record<Filter, number> = { semua: diKelas.length, belum: 0, hadir: 0, terlambat: 0, sakit: 0, izin: 0, alpa: 0 };
    for (const s of diKelas) {
      const c = catatan.get(s.id);
      h[c ? c.status : "belum"]++;
    }
    return h;
  }, [diKelas, catatan]);

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return diKelas
      .filter((s) => {
        const c = catatan.get(s.id);
        if (filter === "belum" ? c : filter !== "semua" && c?.status !== filter) return false;
        return !q || s.nama.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .sort((a, b) => a.kelas.localeCompare(b.kelas, "id", { numeric: true }) || a.nama.localeCompare(b.nama, "id"));
  }, [diKelas, catatan, filter, cari]);

  const pindah = (t: string, k: string) => {
    const q = new URLSearchParams();
    if (t !== hariIni) q.set("tanggal", t);
    if (k) q.set("kelas", k);
    router.push(`/dashboard/absensi${q.size ? `?${q}` : ""}`);
  };

  const gabung = (daftar: CatatanAbsen[]) =>
    setCatatan((m) => {
      const baru = new Map(m);
      for (const c of daftar) baru.set(c.siswaId, c);
      return baru;
    });

  /** Scan diproses berurutan supaya dua kartu yang cepat berganti tidak saling tumpang. */
  const prosesKode = (kode: string) => {
    antrean.current = antrean.current.then(async () => {
      setSibukScan(true);
      let h: HasilScan;
      try {
        h = await scanAbsen(kode);
      } catch {
        h = { ok: false, pesan: "Koneksi ke server gagal. Coba scan lagi." };
      }
      setSibukScan(false);
      setHasil(h);
      setLog((l) => [{ waktu: Date.now(), hasil: h }, ...l].slice(0, 30));
      if (h.ok) gabung([h.catatan]);
      bunyi(!h.ok ? "gagal" : h.jenis === "ulang" ? "ulang" : "ok");
    });
  };

  const bukaUbah = (s: SiswaRingkas) => {
    const c = catatan.get(s.id);
    setFormUbah({ status: c?.status ?? "sakit", ket: c?.ket ?? "" });
    setUbah(s);
  };

  const simpanUbah = async () => {
    if (!ubah) return;
    setSibuk(true);
    const h = await aturStatusAbsen([ubah.id], tanggal, formUbah.status, formUbah.ket);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      gabung(h.catatan);
      setUbah(null);
    }
  };

  const tutupAbsen = async () => {
    const n = hitung.belum;
    if (!n) return toast("Semua siswa sudah punya catatan.", "info");
    const ok = await konfirmasi({
      judul: `Tandai ${n} siswa sebagai alpa?`,
      pesan: (
        <>
          Siswa {kelas ? `kelas ${kelas} ` : ""}yang belum scan atau belum diisi pada {tanggalPanjang(tanggal)} akan dicatat <b>Alpa</b>. Orang tua akan melihatnya di
          halaman Cek absensi. Status masih bisa diubah ke sakit/izin setelahnya.
        </>
      ),
      tombol: "Tandai alpa",
      bahaya: true,
    });
    if (!ok) return;
    const h = await tandaiBelumAbsen(tanggal, kelas);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) gabung(h.catatan);
  };

  const simpanAtur = async () => {
    setSibuk(true);
    const h = await simpanPengaturanAbsensi(formAtur);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setAturBuka(false);
      router.refresh();
    }
  };

  const tombolFilter: { k: Filter; label: string }[] = [
    { k: "semua", label: "Semua" },
    { k: "belum", label: "Belum absen" },
    ...STATUS_ABSEN.map((s) => ({ k: s, label: LABEL_STATUS[s] })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Pilihan tanggal & kelas */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="d-label">Tanggal</span>
          <input type="date" className="d-input w-auto" value={tanggal} max={hariIni} onChange={(e) => e.target.value && pindah(e.target.value, kelas)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="d-label">Kelas</span>
          <select className="d-input w-auto min-w-[160px]" value={kelas} onChange={(e) => pindah(tanggal, e.target.value)}>
            <option value="">Semua kelas</option>
            {daftarKelas.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        {tanggal !== hariIni && (
          <button type="button" className="d-btn d-btn-garis" onClick={() => pindah(hariIni, kelas)}>
            Kembali ke hari ini
          </button>
        )}
        <div className="flex-1" />
        {admin && (
          <button type="button" className="d-btn d-btn-garis" onClick={() => setAturBuka(true)}>
            <Settings2 size={16} aria-hidden="true" /> Pengaturan
          </button>
        )}
      </div>

      <p className="-mt-2 text-sm text-muted">
        {tanggalPanjang(tanggal)} · jam masuk {atur.jamMasuk.replace(":", ".")} WITA (scan setelahnya tercatat terlambat)
      </p>

      {/* Pemindai */}
      {bisaScan ? (
        <Kartu judul="Scan QR kartu siswa" deskripsi="Arahkan kamera ke QR. Bunyi tinggi = tercatat, bunyi ganda = sudah absen, bunyi rendah = QR tidak dikenal.">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <PemindaiQr onKode={prosesKode} jeda={false} />
            <div className="flex min-w-0 flex-col gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (ketik.trim()) prosesKode(ketik.trim());
                  setKetik("");
                }}
              >
                <label className="flex flex-col gap-1.5">
                  <span className="d-label flex items-center gap-1.5">
                    <Keyboard size={14} aria-hidden="true" /> Scanner USB / ketik NISN
                  </span>
                  <div className="flex gap-2">
                    <input
                      className="d-input font-mono"
                      value={ketik}
                      onChange={(e) => setKetik(e.target.value)}
                      placeholder="Klik di sini lalu scan, atau ketik NISN + Enter"
                      autoComplete="off"
                      inputMode="numeric"
                    />
                    <button type="submit" className="d-btn d-btn-utama" disabled={!ketik.trim()}>
                      Catat
                    </button>
                  </div>
                </label>
              </form>

              <HasilTerakhir hasil={hasil} sibuk={sibukScan} />

              {log.length > 0 && (
                <div>
                  <p className="d-label mb-2">Scan barusan</p>
                  <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-xl border border-line text-sm">
                    {log.map((l, i) => (
                      <li key={`${l.waktu}-${i}`} className="flex items-center gap-3 px-3 py-2">
                        <span className="w-12 shrink-0 tabular-nums text-muted">
                          {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(l.waktu)}
                        </span>
                        {l.hasil.ok ? (
                          <>
                            <span className="min-w-0 flex-1 truncate text-ink">
                              {l.hasil.siswa.nama} <span className="text-muted">· {l.hasil.siswa.kelas}</span>
                            </span>
                            {l.hasil.jenis === "ulang" ? (
                              <Lencana>Sudah absen</Lencana>
                            ) : (
                              <Lencana warna={WARNA_STATUS[l.hasil.catatan.status]}>{LABEL_STATUS[l.hasil.catatan.status]}</Lencana>
                            )}
                          </>
                        ) : (
                          <span className="min-w-0 flex-1 truncate text-[#b42318]">{l.hasil.pesan}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Kartu>
      ) : (
        <p className="rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
          Scan QR hanya untuk hari ini. Untuk tanggal yang sudah lewat, status bisa diisi atau dikoreksi manual lewat tombol <b>Ubah</b> di daftar.
        </p>
      )}

      {/* Ringkasan angka */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-7">
        {tombolFilter.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setFilter(t.k)}
            aria-pressed={filter === t.k}
            className={`rounded-xl border px-2.5 py-2 text-left transition-colors sm:px-3 sm:py-3 ${filter === t.k ? "border-brand bg-brand-soft" : "border-line bg-white hover:bg-paper-2"}`}
          >
            <span className="block truncate text-xs text-muted">{t.label}</span>
            <span className="mt-0.5 block text-lg font-semibold sm:text-xl tabular-nums text-ink">{hitung[t.k]}</span>
          </button>
        ))}
      </div>

      {/* Daftar siswa */}
      <Kartu
        judul={`Daftar siswa${kelas ? ` kelas ${kelas}` : ""}`}
        deskripsi={`${tampil.length} dari ${diKelas.length} siswa ditampilkan`}
        aksi={
          hitung.belum > 0 ? (
            <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={tutupAbsen}>
              <UserX size={15} aria-hidden="true" /> Belum absen → Alpa
            </button>
          ) : null
        }
        isiClassName=""
      >
        <div className="border-b border-line p-4">
          <div className="relative max-w-sm">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau NISN" aria-label="Cari siswa" />
          </div>
        </div>
        {siswa.length === 0 ? (
          <Kosong
            ikon={Users}
            judul="Belum ada data siswa"
            teks="Masukkan data siswa dulu (bisa salin-tempel dari Excel) supaya QR kartu bisa dikenali."
            aksi={
              <Link href="/dashboard/siswa" className="d-btn d-btn-utama">
                Buka data siswa
              </Link>
            }
          />
        ) : tampil.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Tidak ada siswa yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="d-tabel">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Status</th>
                  <th>Jam</th>
                  <th>Keterangan</th>
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {tampil.map((s) => {
                  const c = catatan.get(s.id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="block font-medium text-ink">{s.nama}</span>
                        <span className="block text-xs text-muted">
                          {s.kelas} · NISN {s.nisn}
                        </span>
                      </td>
                      <td>{c ? <Lencana warna={WARNA_STATUS[c.status]}>{LABEL_STATUS[c.status]}</Lencana> : <span className="text-sm text-muted">Belum absen</span>}</td>
                      <td className="tabular-nums text-sm">{c?.jam ? jamWita(c.jam) : "—"}</td>
                      <td className="max-w-[26ch] text-sm text-ink-2">
                        <span className="line-clamp-2">{c?.ket || (c ? LABEL_CARA[c.cara] : "")}</span>
                      </td>
                      <td>
                        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => bukaUbah(s)}>
                          <Pencil size={14} aria-hidden="true" /> Ubah
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>

      {/* Dialog ubah status */}
      <Dialog buka={!!ubah} tutup={() => setUbah(null)} judul={ubah ? `${ubah.nama} · ${ubah.kelas}` : ""}>
        {ubah && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">{tanggalPanjang(tanggal)}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STATUS_ABSEN.map((s) => (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${formUbah.status === s ? "border-brand bg-brand-soft" : "border-line hover:bg-paper-2"}`}
                >
                  <input type="radio" name="status" className="d-kotak-centang" checked={formUbah.status === s} onChange={() => setFormUbah((f) => ({ ...f, status: s }))} />
                  <span className="font-medium text-ink">{LABEL_STATUS[s]}</span>
                </label>
              ))}
            </div>
            <p className="-mt-2 text-xs text-muted">{KET_STATUS[formUbah.status]}</p>
            <label className="flex flex-col gap-1.5">
              <span className="d-label">Keterangan (terlihat oleh orang tua)</span>
              <textarea
                className="d-input min-h-[80px]"
                value={formUbah.ket}
                maxLength={300}
                onChange={(e) => setFormUbah((f) => ({ ...f, ket: e.target.value }))}
                placeholder={formUbah.status === "sakit" ? "Mis. demam, ada surat dokter" : formUbah.status === "izin" ? "Mis. acara keluarga, izin dari orang tua" : "Opsional"}
              />
            </label>

            <RiwayatCatatan c={catatan.get(ubah.id)} />

            <div className="flex justify-end gap-2">
              <button type="button" className="d-btn d-btn-garis" onClick={() => setUbah(null)}>
                Batal
              </button>
              <button type="button" className="d-btn d-btn-utama" onClick={simpanUbah} disabled={sibuk}>
                {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog pengaturan (admin) */}
      <Dialog buka={aturBuka} tutup={() => setAturBuka(false)} judul="Pengaturan absensi">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Jam masuk (WITA)</span>
            <input type="time" className="d-input w-auto" value={formAtur.jamMasuk} onChange={(e) => setFormAtur((f) => ({ ...f, jamMasuk: e.target.value }))} />
            <span className="d-bantuan">Scan setelah jam ini otomatis dicatat Terlambat.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="d-kotak-centang mt-0.5"
              checked={formAtur.wajibTglLahir}
              onChange={(e) => setFormAtur((f) => ({ ...f, wajibTglLahir: e.target.checked }))}
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Cek absensi wajib tanggal lahir</span>
              <span className="block text-xs text-muted">
                Orang tua memasukkan NISN + tanggal lahir anak. Lebih aman karena NISN mudah diketahui orang lain. Bila mati, cukup NISN dan nama anak
                disamarkan sebagian.
              </span>
            </span>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="d-btn d-btn-garis" onClick={() => setAturBuka(false)}>
              Batal
            </button>
            <button type="button" className="d-btn d-btn-utama" onClick={simpanAtur} disabled={sibuk}>
              Simpan
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function HasilTerakhir({ hasil, sibuk }: { hasil: HasilScan | null; sibuk: boolean }) {
  if (sibuk && !hasil)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-line p-4 text-sm text-muted">
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Mencatat…
      </div>
    );
  if (!hasil)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
        <ScanLine size={20} aria-hidden="true" /> Hasil scan muncul di sini.
      </div>
    );
  if (!hasil.ok)
    return (
      <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#fecdca] bg-[#fef3f2] p-4 text-sm text-[#912018]">
        <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>{hasil.pesan}</p>
      </div>
    );
  const st = hasil.catatan.status;
  const ulang = hasil.jenis === "ulang";
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border p-4 ${ulang ? "border-line bg-paper-2" : st === "terlambat" ? "border-[#fedf89] bg-[#fffaeb]" : "border-[#abefc6] bg-[#ecfdf3]"}`}
    >
      <CircleCheck size={24} className={`mt-0.5 shrink-0 ${ulang ? "text-muted" : st === "terlambat" ? "text-[#b54708]" : "text-brand"}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-ink">{hasil.siswa.nama}</p>
        <p className="text-sm text-ink-2">
          {hasil.siswa.kelas} · NISN {hasil.siswa.nisn}
        </p>
        <p className="mt-1 text-sm font-medium text-ink">
          {ulang ? `Sudah absen pukul ${jamWita(hasil.catatan.jam)} (${LABEL_STATUS[st]})` : `${LABEL_STATUS[st]} · pukul ${jamWita(hasil.catatan.jam)} WITA`}
        </p>
      </div>
    </div>
  );
}

function RiwayatCatatan({ c }: { c?: CatatanAbsen }) {
  if (!c) return <p className="text-xs text-muted">Belum ada catatan untuk tanggal ini.</p>;
  return (
    <details className="rounded-xl border border-line px-3 py-2 text-sm">
      <summary className="flex cursor-pointer items-center gap-2 text-ink-2">
        <History size={14} aria-hidden="true" /> Riwayat perubahan ({c.riwayat.length})
      </summary>
      <ol className="mt-2 flex flex-col gap-1.5 pb-1">
        {c.riwayat.map((r, i) => (
          <li key={i} className="text-xs text-ink-2">
            <span className="text-muted">{waktuLengkap(r.waktu)}</span> — <b>{LABEL_STATUS[r.status]}</b> ({LABEL_CARA[r.cara].toLowerCase()}) oleh {r.oleh}
            {r.ket ? `: ${r.ket}` : ""}
          </li>
        ))}
      </ol>
    </details>
  );
}
