"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Check, Copy, Download, Inbox, Mail, MailOpen, MessageCircle, Search, Trash2 } from "lucide-react";
import type { Pesan, StatusPesan } from "@/lib/server/pesan";
import { aturStatusPesan, hapusPesanTerpilih, simpanCatatanPesan } from "@/app/dashboard/pesan/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kosong, Lencana, waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";

const TAB: { kunci: "aktif" | StatusPesan | "semua"; label: string }[] = [
  { kunci: "aktif", label: "Kotak masuk" },
  { kunci: "baru", label: "Belum dibaca" },
  { kunci: "dibalas", label: "Dibalas" },
  { kunci: "arsip", label: "Arsip" },
  { kunci: "semua", label: "Semua" },
];

const WARNA: Record<StatusPesan, "kuning" | "abu" | "hijau" | "biru"> = { baru: "kuning", dibaca: "abu", dibalas: "hijau", arsip: "biru" };
const LABEL: Record<StatusPesan, string> = { baru: "Baru", dibaca: "Dibaca", dibalas: "Dibalas", arsip: "Arsip" };

/** 0812… → 62812… untuk tautan wa.me */
const nomorWa = (t?: string) => {
  if (!t) return null;
  let d = t.replace(/\D/g, "");
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  return d.length >= 9 ? d : null;
};

export function PesanMasuk({ pesan, bukaAwal }: { pesan: Pesan[]; bukaAwal?: string }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [tab, setTab] = useState<(typeof TAB)[number]["kunci"]>("aktif");
  const [jenis, setJenis] = useState<"" | "kontak" | "spmb">("");
  const [cari, setCari] = useState("");
  const [aktif, setAktif] = useState<string | null>(bukaAwal ?? null);
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [catatan, setCatatan] = useState<Record<string, string>>({});

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return pesan.filter((m) => {
      if (tab === "aktif" && m.status === "arsip") return false;
      if (tab !== "aktif" && tab !== "semua" && m.status !== tab) return false;
      if (jenis && m.jenis !== jenis) return false;
      if (q && ![m.nama, m.isi, m.keperluan, m.peran, m.telepon ?? ""].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pesan, tab, jenis, cari]);

  const jumlah = (k: (typeof TAB)[number]["kunci"]) =>
    k === "aktif" ? pesan.filter((m) => m.status !== "arsip").length : k === "semua" ? pesan.length : pesan.filter((m) => m.status === k).length;

  const dipilih = pesan.find((m) => m.id === aktif) ?? null;

  // Buka pesan = tandai dibaca otomatis.
  useEffect(() => {
    if (dipilih?.status === "baru") {
      void aturStatusPesan([dipilih.id], "dibaca").then(() => router.refresh());
    }
  }, [dipilih?.id, dipilih?.status, router]);

  const status = async (ids: string[], s: StatusPesan) => {
    const h = await aturStatusPesan(ids, s);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    setTerpilih(new Set());
    router.refresh();
  };

  const hapus = async (ids: string[]) => {
    if (!(await konfirmasi({ judul: ids.length === 1 ? "Hapus pesan ini?" : `Hapus ${ids.length} pesan?`, pesan: "Pesan yang dihapus tidak bisa dikembalikan.", tombol: "Hapus", bahaya: true }))) return;
    const h = await hapusPesanTerpilih(ids);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (ids.includes(aktif ?? "")) setAktif(null);
    setTerpilih(new Set());
    router.refresh();
  };

  const urlEkspor = `/dashboard/pesan/ekspor?${new URLSearchParams({ ...(tab !== "aktif" && tab !== "semua" ? { status: tab } : {}), ...(jenis ? { jenis } : {}) })}`;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="d-kartu flex min-h-[560px] flex-col overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-line px-2 pt-2" role="tablist">
          {TAB.map((t) => (
            <button
              key={t.kunci}
              role="tab"
              type="button"
              aria-selected={tab === t.kunci}
              onClick={() => setTab(t.kunci)}
              className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1.5 text-sm font-semibold ${tab === t.kunci ? "border-brand text-brand-deep" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t.label} <span className="font-normal">({jumlah(t.kunci)})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <label className="relative min-w-[160px] flex-1">
            <span className="sr-only">Cari pesan</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="d-input d-input-kecil pl-8" placeholder="Cari nama atau isi…" value={cari} onChange={(e) => setCari(e.target.value)} />
          </label>
          <select className="d-input d-input-kecil w-auto" value={jenis} onChange={(e) => setJenis(e.target.value as typeof jenis)} aria-label="Jenis pesan">
            <option value="">Semua jenis</option>
            <option value="kontak">Kontak umum</option>
            <option value="spmb">SPMB</option>
          </select>
          <a href={urlEkspor} className="d-btn d-btn-garis d-btn-kecil" title="Unduh daftar pesan (bisa dibuka di Excel)">
            <Download size={14} aria-hidden="true" /> Ekspor
          </a>
        </div>
        {terpilih.size > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-brand-soft px-3 py-2">
            <span className="mr-auto text-sm font-semibold text-brand-deep">{terpilih.size} dipilih</span>
            <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => void status([...terpilih], "dibaca")}>
              <MailOpen size={14} aria-hidden="true" /> Dibaca
            </button>
            <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => void status([...terpilih], "arsip")}>
              <Archive size={14} aria-hidden="true" /> Arsip
            </button>
            <button type="button" className="d-btn d-btn-bahaya d-btn-kecil" onClick={() => void hapus([...terpilih])}>
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        )}
        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
          {daftar.length === 0 && (
            <li>
              <Kosong ikon={Inbox} judul={pesan.length ? "Tidak ada pesan di sini" : "Belum ada pesan"} teks={pesan.length ? undefined : "Pesan dari formulir Kontak dan SPMB akan muncul di sini."} />
            </li>
          )}
          {daftar.map((m) => (
            <li key={m.id} className={`flex gap-2.5 px-3 py-3 ${aktif === m.id ? "bg-brand-soft" : "hover:bg-paper-2"}`}>
              <input
                type="checkbox"
                className="d-kotak-centang mt-1"
                aria-label={`Pilih pesan dari ${m.nama}`}
                checked={terpilih.has(m.id)}
                onChange={() =>
                  setTerpilih((t) => {
                    const n = new Set(t);
                    if (n.has(m.id)) n.delete(m.id);
                    else n.add(m.id);
                    return n;
                  })
                }
              />
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setAktif(m.id)}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate text-sm ${m.status === "baru" ? "font-bold text-ink" : "font-medium text-ink-2"}`}>
                    {m.status === "baru" && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-sun align-middle" aria-label="belum dibaca" />}
                    {m.nama}
                  </span>
                  <span className="shrink-0 text-[0.6875rem] text-muted">{waktuRelatif(m.waktu)}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  {m.jenis === "spmb" && <Lencana warna="biru">SPMB</Lencana>}
                  <span className="truncate">{m.keperluan}</span>
                </span>
                <span className="mt-1 line-clamp-2 block text-[0.8125rem] text-ink-2">{m.isi}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="d-kartu min-h-[560px]">
        {!dipilih ? (
          <Kosong ikon={Mail} judul="Pilih pesan" teks="Klik salah satu pesan untuk membaca isinya, membalas lewat WhatsApp, atau menambah catatan." />
        ) : (
          <article className="flex h-full flex-col">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink">{dipilih.nama}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {dipilih.peran} · {dipilih.keperluan}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {waktuLengkap(dipilih.waktu)}
                  {dipilih.halaman && <> · dari halaman {dipilih.halaman}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Lencana warna={WARNA[dipilih.status]}>{LABEL[dipilih.status]}</Lencana>
                {dipilih.jenis === "spmb" && <Lencana warna="biru">SPMB</Lencana>}
              </div>
            </header>

            <div className="flex-1 p-5">
              <p className="whitespace-pre-wrap rounded-xl bg-paper-2 p-4 text-[0.9375rem] leading-relaxed text-ink">{dipilih.isi}</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted">No. WhatsApp</dt>
                <dd className="text-ink">{dipilih.telepon ?? <span className="text-muted">tidak diisi (lihat chat WhatsApp sekolah)</span>}</dd>
                {dipilih.oleh && (
                  <>
                    <dt className="text-muted">Terakhir diproses</dt>
                    <dd className="text-ink">
                      {dipilih.oleh}, {waktuRelatif(dipilih.diubah)}
                    </dd>
                  </>
                )}
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                {nomorWa(dipilih.telepon) && (
                  <a
                    className="d-btn d-btn-utama"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${nomorWa(dipilih.telepon)}?text=${encodeURIComponent(`Halo ${dipilih.nama}, terima kasih sudah menghubungi kami. Terkait pesan Anda tentang "${dipilih.keperluan}": `)}`}
                    onClick={() => dipilih.status !== "dibalas" && void status([dipilih.id], "dibalas")}
                  >
                    <MessageCircle size={16} aria-hidden="true" /> Balas via WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="d-btn d-btn-garis"
                  onClick={() => {
                    void navigator.clipboard.writeText(`${dipilih.nama} (${dipilih.peran})\n${dipilih.keperluan}\n\n${dipilih.isi}`);
                    toast("Isi pesan disalin.", "info");
                  }}
                >
                  <Copy size={16} aria-hidden="true" /> Salin
                </button>
                {dipilih.status !== "dibalas" && (
                  <button type="button" className="d-btn d-btn-garis" onClick={() => void status([dipilih.id], "dibalas")}>
                    <Check size={16} aria-hidden="true" /> Tandai dibalas
                  </button>
                )}
                {dipilih.status === "arsip" ? (
                  <button type="button" className="d-btn d-btn-garis" onClick={() => void status([dipilih.id], "dibaca")}>
                    <ArchiveRestore size={16} aria-hidden="true" /> Keluarkan dari arsip
                  </button>
                ) : (
                  <button type="button" className="d-btn d-btn-garis" onClick={() => void status([dipilih.id], "arsip")}>
                    <Archive size={16} aria-hidden="true" /> Arsipkan
                  </button>
                )}
                <button type="button" className="d-btn d-btn-hantu" onClick={() => void status([dipilih.id], "baru")}>
                  <Mail size={16} aria-hidden="true" /> Tandai belum dibaca
                </button>
              </div>

              <div className="mt-6">
                <label htmlFor="catatan-pesan" className="d-label">
                  Catatan internal
                </label>
                <p className="d-bantuan">Hanya terlihat oleh petugas, mis. “sudah ditelepon, datang Senin”.</p>
                <textarea
                  id="catatan-pesan"
                  className="d-input mt-1.5"
                  rows={3}
                  value={catatan[dipilih.id] ?? dipilih.catatan ?? ""}
                  onChange={(e) => setCatatan((c) => ({ ...c, [dipilih.id]: e.target.value }))}
                />
                <div className="mt-2 flex items-center justify-between">
                  <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil" onClick={() => void hapus([dipilih.id])}>
                    <Trash2 size={14} aria-hidden="true" /> Hapus pesan
                  </button>
                  <button
                    type="button"
                    className="d-btn d-btn-garis d-btn-kecil"
                    disabled={(catatan[dipilih.id] ?? dipilih.catatan ?? "") === (dipilih.catatan ?? "")}
                    onClick={async () => {
                      const h = await simpanCatatanPesan(dipilih.id, catatan[dipilih.id] ?? "");
                      toast(h.pesan, h.ok ? "sukses" : "galat");
                      router.refresh();
                    }}
                  >
                    Simpan catatan
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
