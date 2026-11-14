"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, MessageCircle, Phone, Search, Send, ShieldAlert, Trash2, Users } from "lucide-react";
import {
  JENIS_LAPORAN,
  LABEL_JENIS,
  LABEL_STATUS_LAPORAN,
  WARNA_STATUS_LAPORAN,
  type JenisLaporan,
  type Laporan,
  type StatusLaporan,
} from "@/lib/laporan/tipe";
import { waLink } from "@/lib/format";
import { aturStatusLaporan, hapusLaporan, tambahCatatanLaporan } from "@/app/dashboard/laporan/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kosong, Lencana, waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";

export type LaporanDasbor = Omit<Laporan, "kode">;

type Tab = "aktif" | StatusLaporan | "semua";
const TAB: { k: Tab; label: string }[] = [
  { k: "aktif", label: "Perlu ditangani" },
  { k: "baru", label: "Baru" },
  { k: "selesai", label: "Selesai" },
  { k: "ditolak", label: "Ditolak" },
  { k: "semua", label: "Semua" },
];
const AKTIF: StatusLaporan[] = ["baru", "ditinjau", "ditangani"];
const PILIHAN_STATUS: { s: StatusLaporan; ket: string }[] = [
  { s: "ditinjau", ket: "Sudah dibaca" },
  { s: "ditangani", ket: "Sedang ditindaklanjuti" },
  { s: "selesai", ket: "Tuntas" },
  { s: "ditolak", ket: "Tidak valid / iseng" },
];

export function KelolaLaporan({ laporan, bukaAwal, admin }: { laporan: LaporanDasbor[]; bukaAwal?: string; admin: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [tab, setTab] = useState<Tab>("aktif");
  const [jenis, setJenis] = useState<JenisLaporan | "">("");
  const [cari, setCari] = useState("");
  const [aktif, setAktif] = useState<string | null>(bukaAwal ?? null);
  const [isi, setIsi] = useState("");
  const [untukPelapor, setUntukPelapor] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  const jumlah = (k: Tab) =>
    k === "aktif" ? laporan.filter((l) => AKTIF.includes(l.status)).length : k === "semua" ? laporan.length : laporan.filter((l) => l.status === k).length;

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return laporan.filter((l) => {
      if (tab === "aktif" ? !AKTIF.includes(l.status) : tab !== "semua" && l.status !== tab) return false;
      if (jenis && l.jenis !== jenis) return false;
      return !q || [l.nomor, l.nama, l.kelas, l.isi, l.terlibat ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [laporan, tab, jenis, cari]);

  const dipilih = laporan.find((l) => l.id === aktif) ?? null;

  // Membuka laporan baru = otomatis "Ditinjau" (pelapor melihat laporannya sudah dibaca).
  useEffect(() => {
    if (dipilih?.status === "baru") void aturStatusLaporan(dipilih.id, "ditinjau", true).then(() => router.refresh());
  }, [dipilih?.id, dipilih?.status, router]);

  const ubahStatus = async (s: StatusLaporan) => {
    if (!dipilih || dipilih.status === s) return;
    const h = await aturStatusLaporan(dipilih.id, s);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    router.refresh();
  };

  const kirimCatatan = async () => {
    if (!dipilih) return;
    if (untukPelapor) {
      const ok = await konfirmasi({
        judul: "Kirim balasan ke pelapor?",
        pesan: `Balasan ini bisa dibaca ${dipilih.nama} di halaman cek status laporan.`,
        tombol: "Kirim balasan",
      });
      if (!ok) return;
    }
    setSibuk(true);
    const h = await tambahCatatanLaporan(dipilih.id, isi, untukPelapor);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setIsi("");
      router.refresh();
    }
  };

  const hapus = async () => {
    if (!dipilih) return;
    const ok = await konfirmasi({
      judul: `Hapus ${dipilih.nomor}?`,
      pesan: "Untuk laporan iseng/spam. Laporan hilang permanen; pelapor tidak bisa cek status lagi.",
      tombol: "Hapus permanen",
      bahaya: true,
    });
    if (!ok) return;
    const h = await hapusLaporan(dipilih.id);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) setAktif(null);
    router.refresh();
  };

  const linimasa = dipilih
    ? [
        ...dipilih.riwayat.map((r) => ({ waktu: r.waktu, jenis: "status" as const, teks: LABEL_STATUS_LAPORAN[r.status], oleh: r.oleh, status: r.status })),
        ...dipilih.catatan.map((c) => ({ waktu: c.waktu, jenis: c.untukPelapor ? ("balasan" as const) : ("internal" as const), teks: c.isi, oleh: c.oleh })),
      ].sort((a, b) => a.waktu.localeCompare(b.waktu))
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      {/* Daftar */}
      <div className={`d-kartu flex min-h-[560px] flex-col overflow-hidden ${dipilih ? "hidden lg:flex" : ""}`}>
        <div className="flex gap-1 overflow-x-auto border-b border-line p-2">
          {TAB.map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${tab === t.k ? "bg-brand-soft font-semibold text-brand" : "text-ink-2 hover:bg-paper-2"}`}
            >
              {t.label} <span className="tabular-nums text-muted">{jumlah(t.k)}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-b border-line p-3">
          <div className="relative min-w-0 flex-1">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="d-input pl-9" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, kelas, isi" aria-label="Cari laporan" />
          </div>
          <select className="d-input w-auto max-w-[150px] shrink-0" value={jenis} onChange={(e) => setJenis(e.target.value as JenisLaporan | "")} aria-label="Saring jenis">
            <option value="">Semua jenis</option>
            {JENIS_LAPORAN.map((j) => (
              <option key={j.kunci} value={j.kunci}>
                {j.label}
              </option>
            ))}
          </select>
        </div>
        {daftar.length === 0 ? (
          <Kosong ikon={ShieldAlert} judul={laporan.length ? "Tidak ada laporan di sini" : "Belum ada laporan"} teks={laporan.length ? undefined : "Laporan dari halaman /lapor akan muncul di sini."} />
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
            {daftar.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAktif(l.id);
                    setIsi("");
                    setUntukPelapor(false);
                  }}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-paper-2 ${aktif === l.id ? "bg-brand-soft/60" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    {l.status === "baru" && <span className="h-2 w-2 shrink-0 rounded-full bg-sun" aria-label="Baru" />}
                    <span className={`min-w-0 flex-1 truncate text-sm ${l.status === "baru" ? "font-bold text-ink" : "font-semibold text-ink"}`}>{LABEL_JENIS[l.jenis]}</span>
                    <span className="shrink-0 text-xs text-muted">{waktuRelatif(l.dibuat)}</span>
                  </span>
                  <span className="truncate text-sm text-ink-2">
                    {l.nama} · {l.kelas}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">{l.nomor}</span>
                    <Lencana warna={WARNA_STATUS_LAPORAN[l.status]}>{LABEL_STATUS_LAPORAN[l.status]}</Lencana>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail */}
      <div className={`d-kartu min-h-[560px] ${dipilih ? "" : "hidden lg:block"}`}>
        {!dipilih ? (
          <Kosong ikon={ShieldAlert} judul="Pilih laporan" teks="Klik salah satu laporan di daftar untuk membaca dan menindaklanjuti." />
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-start gap-3 border-b border-line p-5">
              <button type="button" className="d-btn d-btn-hantu d-btn-ikon lg:hidden" onClick={() => setAktif(null)} aria-label="Kembali ke daftar">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted">{dipilih.nomor}</p>
                <h2 className="text-lg font-semibold text-ink">{LABEL_JENIS[dipilih.jenis]}</h2>
                <p className="text-sm text-muted">Masuk {waktuLengkap(dipilih.dibuat)}</p>
              </div>
              <Lencana warna={WARNA_STATUS_LAPORAN[dipilih.status]}>{LABEL_STATUS_LAPORAN[dipilih.status]}</Lencana>
            </div>

            <div className="flex flex-col gap-6 p-5">
              {/* Pelapor */}
              <section className="rounded-xl border border-line bg-paper-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pelapor</p>
                <p className="mt-1 text-base font-semibold text-ink">
                  {dipilih.nama} <span className="font-normal text-ink-2">· Kelas {dipilih.kelas}</span>
                </p>
                {dipilih.telepon ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-ink-2">
                      <Phone size={14} aria-hidden="true" /> {dipilih.telepon}
                    </span>
                    <a
                      href={waLink(`Halo ${dipilih.nama}, ini guru BK SMAN 1 Brang Rea terkait laporan ${dipilih.nomor}.`, dipilih.telepon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-btn d-btn-garis d-btn-kecil"
                    >
                      <MessageCircle size={14} aria-hidden="true" /> Hubungi via WA
                    </a>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted">Tidak mencantumkan nomor HP.</p>
                )}
              </section>

              {/* Kejadian */}
              <section>
                {dipilih.terlibat && (
                  <p className="mb-3 flex items-start gap-1.5 text-sm text-ink-2">
                    <Users size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" /> <span>Terlibat: {dipilih.terlibat}</span>
                  </p>
                )}
                <p className="whitespace-pre-line leading-relaxed text-ink">{dipilih.isi}</p>
              </section>

              {/* Status */}
              <section>
                <p className="d-label mb-2">Ubah status</p>
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                  {PILIHAN_STATUS.map((p) => (
                    <button
                      key={p.s}
                      type="button"
                      onClick={() => ubahStatus(p.s)}
                      aria-pressed={dipilih.status === p.s}
                      className={`rounded-xl border px-3 py-2 text-left ${dipilih.status === p.s ? "border-brand bg-brand-soft" : "border-line hover:bg-paper-2"}`}
                    >
                      <span className="block text-sm font-semibold text-ink">{LABEL_STATUS_LAPORAN[p.s]}</span>
                      <span className="block text-xs text-muted">{p.ket}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Linimasa */}
              <section>
                <p className="d-label mb-2">Tindak lanjut</p>
                <ol className="flex flex-col gap-2.5">
                  {linimasa.map((x, i) =>
                    x.jenis === "status" ? (
                      <li key={i} className="text-xs text-muted">
                        {waktuLengkap(x.waktu)} · status <b className="text-ink-2">{x.teks}</b> oleh {x.oleh}
                      </li>
                    ) : (
                      <li key={i} className={`rounded-xl border p-3 text-sm ${x.jenis === "balasan" ? "border-[#abefc6] bg-[#ecfdf3]" : "border-line bg-paper-2"}`}>
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
                          {x.jenis === "balasan" ? <Send size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                          {x.jenis === "balasan" ? "Balasan ke pelapor" : "Catatan internal"} · {x.oleh} · {waktuLengkap(x.waktu)}
                        </p>
                        <p className="whitespace-pre-line text-ink">{x.teks}</p>
                      </li>
                    ),
                  )}
                </ol>
              </section>

              <section className="flex flex-col gap-3 rounded-xl border border-line p-4">
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Jenis catatan">
                  {[
                    { v: false, label: "Catatan internal", ket: "Hanya BK & admin", ikon: Lock },
                    { v: true, label: "Balas ke pelapor", ket: "Terlihat di cek status", ikon: Send },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="radio"
                      aria-checked={untukPelapor === o.v}
                      onClick={() => setUntukPelapor(o.v)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${untukPelapor === o.v ? "border-brand bg-brand-soft text-ink" : "border-line text-ink-2 hover:bg-paper-2"}`}
                    >
                      <o.ikon size={14} aria-hidden="true" /> <b>{o.label}</b> <span className="text-xs text-muted">{o.ket}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  className="d-input min-h-[90px]"
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  maxLength={2000}
                  placeholder={untukPelapor ? "Mis. Terima kasih sudah melapor. Silakan temui Ibu di ruang BK besok jam istirahat." : "Mis. Sudah memanggil siswa yang terlibat, hasil..."}
                  aria-label="Isi catatan"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {admin ? (
                    <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil" onClick={hapus}>
                      <Trash2 size={14} aria-hidden="true" /> Hapus laporan
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" className="d-btn d-btn-utama" onClick={kirimCatatan} disabled={sibuk || isi.trim().length < 2}>
                    {untukPelapor ? <Send size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
                    {untukPelapor ? "Kirim balasan" : "Simpan catatan"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
