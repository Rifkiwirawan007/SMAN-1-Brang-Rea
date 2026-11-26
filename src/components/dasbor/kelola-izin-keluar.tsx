"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bluetooth,
  BluetoothOff,
  CircleAlert,
  Download,
  DoorOpen,
  ImageDown,
  Keyboard,
  LoaderCircle,
  Printer,
  RotateCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { jamWita, tanggalPanjang } from "@/lib/absensi/tipe";
import { KEPERLUAN, type DataResi, type IzinKeluar } from "@/lib/izin-keluar/tipe";
import { batalkanIzin, beriIzinKeluar, catatCetakUlang, cariSiswaIzin } from "@/app/dashboard/izin-keluar/aksi";
import { bagikanGambar, bluetoothTersedia, cetakBluetooth, cetakBrowser, hubungkanPrinter, lupakanPrinter, pantauPrinter } from "@/lib/izin-keluar/cetak";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana } from "@/components/dasbor/ui";
import { PemindaiQr } from "@/components/dasbor/pemindai-qr";

type SiswaRingkas = { id: string; nama: string; kelas: string; nisn: string };
type CaraCetak = "bluetooth" | "gambar" | "browser";

const LABEL_CARA: Record<CaraCetak, string> = {
  bluetooth: "Printer Bluetooth (langsung)",
  gambar: "Simpan/bagikan gambar resi",
  browser: "Dialog cetak browser",
};
const KUNCI_CARA = "izin-keluar:cara-cetak";

export function KelolaIzinKeluar({
  tanggal,
  hariIni,
  izinAwal,
  siswa,
  daftarKelas,
  namaSekolah,
  pengguna,
}: {
  tanggal: string;
  hariIni: string;
  izinAwal: IzinKeluar[];
  siswa: SiswaRingkas[];
  daftarKelas: string[];
  namaSekolah: string;
  pengguna: { id: string; admin: boolean };
}) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const bisaIzin = tanggal === hariIni;

  const [izin, setIzin] = useState(izinAwal);
  const [dipilih, setDipilih] = useState<{ siswa: SiswaRingkas; sebelumnya: IzinKeluar[] } | null>(null);
  const [pilihKeperluan, setPilihKeperluan] = useState<string>("");
  const [lainnya, setLainnya] = useState("");
  const [galatScan, setGalatScan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [ketik, setKetik] = useState("");
  const [terakhir, setTerakhir] = useState<IzinKeluar | null>(null);
  // Di HP form ada di bawah kamera: gulir ke form begitu siswa terbaca.
  const refForm = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (dipilih) refForm.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [dipilih]);

  // Printer
  const [adaBt, setAdaBt] = useState(false);
  const [cara, setCara] = useState<CaraCetak>("gambar");
  const [namaPrinter, setNamaPrinter] = useState<string | null>(null);
  const [menyambung, setMenyambung] = useState(false);
  useEffect(() => {
    const bt = bluetoothTersedia();
    const simpan = localStorage.getItem(KUNCI_CARA) as CaraCetak | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dukungan browser hanya diketahui di klien
    setAdaBt(bt);
    setCara(simpan && (simpan !== "bluetooth" || bt) ? simpan : bt ? "bluetooth" : "gambar");
    return pantauPrinter(setNamaPrinter);
  }, []);
  // State namaPrinter tertinggal satu render setelah hubungkan(); untuk cek di tengah klik pakai ref ini.
  const refNama = useRef<string | null>(null);
  useEffect(() => pantauPrinter((n) => void (refNama.current = n)), []);
  const sambunganAda = () => !!refNama.current;
  const gantiCara = (c: CaraCetak) => {
    setCara(c);
    localStorage.setItem(KUNCI_CARA, c);
  };

  // Daftar
  const [cari, setCari] = useState("");
  const [kelas, setKelas] = useState("");
  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return izin
      .filter((z) => (!kelas || z.siswa.kelas === kelas) && (!q || z.siswa.nama.toLowerCase().includes(q) || z.siswa.nisn.includes(q) || z.nomor.toLowerCase().includes(q)))
      .sort((a, b) => b.jamKeluar.localeCompare(a.jamKeluar));
  }, [izin, cari, kelas]);
  const jumlahAktif = izin.filter((z) => !z.batal).length;

  const resi = (z: IzinKeluar): DataResi => ({ ...z, namaSekolah });

  const hubungkan = async () => {
    setMenyambung(true);
    try {
      const nama = await hubungkanPrinter();
      toast(`Printer ${nama} terhubung.`, "sukses");
      return true;
    } catch (e) {
      const err = e as Error;
      if (err.name !== "NotFoundError") toast(err.message || "Printer tidak bisa dihubungkan.", "galat"); // NotFoundError = batal memilih
      return false;
    } finally {
      setMenyambung(false);
    }
  };

  /** Cetak satu resi sesuai cara terpilih. Mengembalikan true bila terkirim. */
  const cetak = async (z: IzinKeluar) => {
    const d = resi(z);
    try {
      if (cara === "bluetooth") {
        await cetakBluetooth(d);
        toast("Resi dicetak.", "sukses");
      } else if (cara === "gambar") {
        const h = await bagikanGambar(d);
        if (h === "diunduh") toast("Gambar resi diunduh. Buka di aplikasi printer untuk mencetak.", "info");
      } else cetakBrowser(d);
      return true;
    } catch (e) {
      toast((e as Error).message || "Gagal mencetak.", "galat");
      return false;
    }
  };

  const tesCetak = () =>
    cetak({
      id: "tes",
      nomor: "IK-TES-000",
      tanggal: hariIni,
      jamKeluar: new Date().toISOString(),
      siswa: { id: "", nama: "Contoh Nama Siswa", kelas: "XI-1", nisn: "0000000000" },
      keperluan: "Tes printer",
      oleh: { id: "", nama: "Petugas piket" },
    });

  /* ---------- Pilih siswa ---------- */

  const pilihDariKode = async (kode: string) => {
    if (sibuk || dipilih) return;
    setSibuk(true);
    setGalatScan("");
    try {
      const h = await cariSiswaIzin(kode);
      if (!h.ok) setGalatScan(h.pesan);
      else {
        setDipilih({ siswa: h.siswa, sebelumnya: h.sebelumnya });
        setPilihKeperluan("");
        setLainnya("");
      }
    } catch {
      setGalatScan("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  const saran = useMemo(() => {
    const q = ketik.trim().toLowerCase();
    if (q.length < 2 || /^\d+$/.test(q)) return [];
    return siswa.filter((s) => s.nama.toLowerCase().includes(q)).slice(0, 6);
  }, [ketik, siswa]);

  const keperluan = pilihKeperluan === "lainnya" ? lainnya.trim() : pilihKeperluan;

  const beriIzin = async () => {
    if (!dipilih || keperluan.length < 3) return;
    // Pilih printer dulu selagi masih di dalam klik (browser mewajibkan klik untuk memilih perangkat Bluetooth).
    if (cara === "bluetooth" && !sambunganAda() && !(await hubungkan())) {
      const lanjut = await konfirmasi({
        judul: "Printer belum terhubung",
        pesan: "Izin tetap dicatat. Resi bisa dicetak setelah printer terhubung lewat tombol Cetak ulang.",
        tombol: "Catat tanpa cetak",
      });
      if (!lanjut) return;
    }
    setSibuk(true);
    try {
      const h = await beriIzinKeluar(dipilih.siswa.id, keperluan);
      if (!h.ok) return toast(h.pesan, "galat");
      setIzin((l) => [h.izin, ...l]);
      setTerakhir(h.izin);
      setDipilih(null);
      setKetik("");
      toast(h.pesan, "sukses");
      if (cara !== "bluetooth" || sambunganAda()) await cetak(h.izin);
    } catch {
      toast("Koneksi ke server gagal. Izin belum tercatat, coba lagi.", "galat");
    } finally {
      setSibuk(false);
    }
  };
  const cetakUlang = async (z: IzinKeluar) => {
    if (cara === "bluetooth" && !sambunganAda() && !(await hubungkan())) return;
    if (await cetak(z)) {
      const h = await catatCetakUlang(z.tanggal, z.id);
      if (h.ok) setIzin((l) => l.map((x) => (x.id === z.id ? h.izin : x)));
    }
  };

  const batalkan = async (z: IzinKeluar) => {
    const ok = await konfirmasi({
      judul: `Batalkan izin ${z.nomor}?`,
      pesan: (
        <>
          Izin keluar <b>{z.siswa.nama}</b> pukul {jamWita(z.jamKeluar)} ditandai dibatalkan (mis. salah pilih siswa). Catatannya tetap tersimpan sebagai bukti.
        </>
      ),
      tombol: "Batalkan izin",
      bahaya: true,
    });
    if (!ok) return;
    const h = await batalkanIzin(z.tanggal, z.id, "");
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) setIzin((l) => l.map((x) => (x.id === z.id ? h.izin : x)));
  };

  const pindahTanggal = (t: string) => router.push(`/dashboard/izin-keluar${t !== hariIni ? `?tanggal=${t}` : ""}`);

  return (
    <div className="flex flex-col gap-6">
      {/* Printer */}
      <Kartu
        judul="Printer resi"
        deskripsi={
          cara === "bluetooth"
            ? "Nyalakan printer Bluetooth, lalu tekan Hubungkan dan pilih nama printernya. Perlu diulang bila halaman dimuat ulang."
            : cara === "gambar"
              ? "Resi dibuat sebagai gambar. Di HP pilih aplikasi printer saat dibagikan; di laptop gambar diunduh."
              : "Membuka dialog cetak browser dengan kertas 58 mm. Untuk printer yang sudah terpasang di laptop."
        }
      >
        <div className="flex min-w-0 flex-wrap items-end gap-3">
          <label className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto">
            <span className="d-label">Cara cetak</span>
            <select className="d-input w-full min-w-0 max-w-full truncate sm:w-auto" value={cara} onChange={(e) => gantiCara(e.target.value as CaraCetak)}>
              {(Object.keys(LABEL_CARA) as CaraCetak[]).map((c) => (
                <option key={c} value={c} disabled={c === "bluetooth" && !adaBt}>
                  {LABEL_CARA[c]}
                  {c === "bluetooth" && !adaBt ? " — tidak didukung browser ini" : ""}
                </option>
              ))}
            </select>
          </label>
          {cara === "bluetooth" &&
            (namaPrinter ? (
              <>
                <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ecfdf3] px-3 text-sm font-medium text-[#067647]">
                  <Bluetooth size={16} aria-hidden="true" /> {namaPrinter}
                </span>
                <button type="button" className="d-btn d-btn-garis" onClick={() => lupakanPrinter()}>
                  <BluetoothOff size={16} aria-hidden="true" /> Putuskan
                </button>
              </>
            ) : (
              <button type="button" className="d-btn d-btn-utama" onClick={hubungkan} disabled={menyambung}>
                {menyambung ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Bluetooth size={16} aria-hidden="true" />} Hubungkan printer
              </button>
            ))}
          <button type="button" className="d-btn d-btn-garis" onClick={tesCetak} disabled={cara === "bluetooth" && !namaPrinter}>
            <Printer size={16} aria-hidden="true" /> Tes cetak
          </button>
        </div>
        {!adaBt && (
          <p className="mt-3 text-xs text-muted">
            Browser ini tidak bisa Bluetooth langsung (mis. iPhone/Safari/Firefox). Pakai Chrome di Android atau laptop untuk mencetak langsung.
          </p>
        )}
      </Kartu>

      {/* Scan & beri izin */}
      {bisaIzin ? (
        <Kartu judul="Beri izin keluar" deskripsi="Scan QR kartu siswa, atau ketik NISN / nama bila kartu tidak terbaca.">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <PemindaiQr onKode={pilihDariKode} jeda={!!dipilih || sibuk} />
            <div className="flex min-w-0 flex-col gap-4">
              {!dipilih ? (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (saran.length === 1) return void pilihDariKode(saran[0].nisn);
                      if (ketik.trim()) void pilihDariKode(ketik.trim());
                    }}
                    className="relative"
                  >
                    <label className="flex flex-col gap-1.5">
                      <span className="d-label flex items-center gap-1.5">
                        <Keyboard size={14} aria-hidden="true" /> Scanner USB / NISN / nama siswa
                      </span>
                      <div className="flex gap-2">
                        <input
                          className="d-input"
                          value={ketik}
                          onChange={(e) => setKetik(e.target.value)}
                          placeholder="Ketik NISN + Enter, atau cari nama"
                          autoComplete="off"
                        />
                        <button type="submit" className="d-btn d-btn-utama" disabled={!ketik.trim() || sibuk}>
                          Cari
                        </button>
                      </div>
                    </label>
                    {saran.length > 0 && (
                      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">
                        {saran.map((s) => (
                          <li key={s.id}>
                            <button type="button" className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-paper-2" onClick={() => pilihDariKode(s.nisn)}>
                              <span className="min-w-0 flex-1 truncate font-medium text-ink">{s.nama}</span>
                              <span className="shrink-0 text-xs text-muted">
                                {s.kelas} · {s.nisn}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </form>

                  {sibuk ? (
                    <div className="flex items-center gap-2 rounded-xl border border-line p-4 text-sm text-muted">
                      <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Mencari siswa…
                    </div>
                  ) : galatScan ? (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#fecdca] bg-[#fef3f2] p-4 text-sm text-[#912018]">
                      <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <p>{galatScan}</p>
                    </div>
                  ) : terakhir ? (
                    <div className="rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm">
                      <p className="font-semibold text-ink">
                        {terakhir.siswa.nama} · {terakhir.siswa.kelas}
                      </p>
                      <p className="text-ink-2">
                        {terakhir.nomor} · keluar {jamWita(terakhir.jamKeluar)} WITA · {terakhir.keperluan}
                      </p>
                      <button type="button" className="d-btn d-btn-garis d-btn-kecil mt-3" onClick={() => cetakUlang(terakhir)}>
                        <RotateCcw size={14} aria-hidden="true" /> Cetak ulang resi
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                      <DoorOpen size={20} aria-hidden="true" /> Data siswa muncul di sini setelah kartu di-scan.
                    </div>
                  )}
                </>
              ) : (
                <div ref={refForm} className="flex scroll-mt-20 flex-col gap-4 rounded-xl border border-brand/40 bg-brand-soft/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-ink">{dipilih.siswa.nama}</p>
                      <p className="text-sm text-ink-2">
                        {dipilih.siswa.kelas} · NISN {dipilih.siswa.nisn}
                      </p>
                    </div>
                    <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setDipilih(null)} aria-label="Batal, pilih siswa lain">
                      <X size={14} aria-hidden="true" /> Batal
                    </button>
                  </div>

                  {dipilih.sebelumnya.length > 0 && (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#fedf89] bg-[#fffaeb] p-3 text-sm text-[#93370d]">
                      <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <p>
                        Sudah izin keluar hari ini pukul {dipilih.sebelumnya.map((z) => jamWita(z.jamKeluar)).join(", ")} ({dipilih.sebelumnya.at(-1)!.keperluan}). Pastikan
                        ini izin baru, bukan scan ulang.
                      </p>
                    </div>
                  )}

                  <fieldset>
                    <legend className="d-label mb-2">Keperluan</legend>
                    <div className="flex flex-wrap gap-2">
                      {[...KEPERLUAN, "lainnya"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={pilihKeperluan === k}
                          onClick={() => setPilihKeperluan(k)}
                          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${pilihKeperluan === k ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-paper-2"}`}
                        >
                          {k === "lainnya" ? "Lainnya…" : k}
                        </button>
                      ))}
                    </div>
                    {pilihKeperluan === "lainnya" && (
                      <input
                        className="d-input mt-3"
                        value={lainnya}
                        maxLength={120}
                        autoFocus
                        onChange={(e) => setLainnya(e.target.value)}
                        placeholder="Tulis keperluan, mis. ambil berkas di kantor desa"
                      />
                    )}
                  </fieldset>

                  <button type="button" className="d-btn d-btn-utama justify-center py-3 text-base" onClick={beriIzin} disabled={sibuk || keperluan.length < 3}>
                    {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Printer size={18} aria-hidden="true" />}
                    Beri izin &amp; cetak resi
                  </button>
                </div>
              )}
            </div>
          </div>
        </Kartu>
      ) : (
        <p className="rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
          Izin keluar hanya bisa diberikan untuk hari ini. Ini rekap {tanggalPanjang(tanggal)}.
        </p>
      )}

      {/* Daftar */}
      <Kartu
        judul={`Izin keluar ${tanggal === hariIni ? "hari ini" : tanggalPanjang(tanggal)}`}
        deskripsi={`${jumlahAktif} siswa keluar${izin.length > jumlahAktif ? ` · ${izin.length - jumlahAktif} dibatalkan` : ""}`}
        aksi={
          <a
            className="d-btn d-btn-garis d-btn-kecil"
            href={`/dashboard/izin-keluar/ekspor?dari=${tanggal.slice(0, 8)}01&sampai=${tanggal}${kelas ? `&kelas=${encodeURIComponent(kelas)}` : ""}`}
            title="Unduh rekap dari awal bulan sampai tanggal ini (bisa dibuka di Excel)"
          >
            <Download size={14} aria-hidden="true" /> Rekap bulan ini
          </a>
        }
        isiClassName=""
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Tanggal</span>
            <input type="date" className="d-input w-auto" value={tanggal} max={hariIni} onChange={(e) => e.target.value && pindahTanggal(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Kelas</span>
            <select className="d-input w-auto min-w-[140px]" value={kelas} onChange={(e) => setKelas(e.target.value)}>
              <option value="">Semua kelas</option>
              {daftarKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, NISN, atau no. resi" aria-label="Cari izin" />
          </div>
          {tanggal !== hariIni && (
            <button type="button" className="d-btn d-btn-garis" onClick={() => pindahTanggal(hariIni)}>
              Kembali ke hari ini
            </button>
          )}
        </div>

        {izin.length === 0 ? (
          <Kosong ikon={DoorOpen} judul="Belum ada izin keluar" teks={tanggal === hariIni ? "Siswa yang diberi izin hari ini akan tampil di sini." : "Tidak ada siswa yang izin keluar pada tanggal ini."} />
        ) : tampil.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Tidak ada yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="d-tabel">
              <thead>
                <tr>
                  <th>Jam keluar</th>
                  <th>Siswa</th>
                  <th>Keperluan</th>
                  <th>Diberi izin oleh</th>
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {tampil.map((z) => (
                  <tr key={z.id} className={z.batal ? "opacity-60" : ""}>
                    <td className="whitespace-nowrap">
                      <span className="block font-semibold tabular-nums text-ink">{jamWita(z.jamKeluar)}</span>
                      <span className="block font-mono text-xs text-muted">{z.nomor}</span>
                    </td>
                    <td>
                      <span className={`block font-medium text-ink ${z.batal ? "line-through" : ""}`}>{z.siswa.nama}</span>
                      <span className="block text-xs text-muted">
                        {z.siswa.kelas} · NISN {z.siswa.nisn}
                      </span>
                    </td>
                    <td className="max-w-[28ch] text-sm text-ink-2">
                      {z.batal ? <Lencana warna="merah">Dibatalkan</Lencana> : <span className="line-clamp-2">{z.keperluan}</span>}
                    </td>
                    <td className="text-sm text-ink-2">{z.oleh.nama}</td>
                    <td>
                      {!z.batal && (
                        <div className="flex gap-2">
                          <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => cetakUlang(z)} title={z.cetakUlang ? `Sudah dicetak ulang ${z.cetakUlang}×` : undefined}>
                            {cara === "gambar" ? <ImageDown size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />} Cetak ulang
                          </button>
                          {(pengguna.admin || (z.oleh.id === pengguna.id && tanggal === hariIni)) && (
                            <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => batalkan(z)}>
                              Batalkan
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>
    </div>
  );
}
