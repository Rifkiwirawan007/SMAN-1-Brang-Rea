"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Copy, KeyRound, LoaderCircle, Pencil, Shuffle, Trash2, UserPlus } from "lucide-react";
import { LABEL_PERAN, KET_PERAN, type Peran } from "@/lib/cms/peran";
import { aturUlangSandi, hapusPengguna, tambahPengguna, ubahPengguna } from "@/app/dashboard/aksi-akun";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Lencana, waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";

export type PenggunaBaris = { id: string; nama: string; username: string; peran: Peran; aktif: boolean; dibuat: string; terakhirMasuk?: string };

/** Sandi acak mudah dibaca (tanpa huruf/angka yang mirip). */
function sandiAcak() {
  const huruf = "abcdefghjkmnpqrstuvwxyz";
  const angka = "23456789";
  const ambil = (s: string, n: number) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => s[x % s.length]).join("");
  return `${ambil(huruf, 4)}-${ambil(angka, 4)}-${ambil(huruf, 4)}`;
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
      className="d-dialog w-[min(94vw,480px)]"
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

function PilihPeran({ nilai, ubah }: { nilai: Peran; ubah: (p: Peran) => void }) {
  return (
    <div className="grid gap-2">
      {(["guru", "bk", "editor", "admin"] as Peran[]).map((p) => (
        <label key={p} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${nilai === p ? "border-brand bg-brand-soft" : "border-line hover:bg-paper-2"}`}>
          <input type="radio" name="peran" className="d-kotak-centang mt-0.5" checked={nilai === p} onChange={() => ubah(p)} />
          <span>
            <span className="block text-sm font-semibold text-ink">{LABEL_PERAN[p]}</span>
            <span className="block text-xs text-muted">{KET_PERAN[p]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function KotakSandi({ nilai, ubah, galat }: { nilai: string; ubah: (s: string) => void; galat?: string }) {
  const toast = useToast();
  return (
    <Isian label="Kata sandi" galat={galat} bantuan="Minimal 8 karakter, berisi huruf dan angka. Sampaikan langsung ke pemilik akun.">
      <div className="flex gap-2">
        <input className="d-input font-mono" value={nilai} onChange={(e) => ubah(e.target.value)} autoComplete="new-password" aria-invalid={!!galat || undefined} />
        <button type="button" className="d-btn d-btn-garis d-btn-ikon" title="Buat sandi acak" aria-label="Buat sandi acak" onClick={() => ubah(sandiAcak())}>
          <Shuffle size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="d-btn d-btn-garis d-btn-ikon"
          title="Salin"
          aria-label="Salin kata sandi"
          disabled={!nilai}
          onClick={() => {
            void navigator.clipboard.writeText(nilai);
            toast("Kata sandi disalin.", "info");
          }}
        >
          <Copy size={16} aria-hidden="true" />
        </button>
      </div>
    </Isian>
  );
}

export function KelolaPengguna({ daftar, sayaId }: { daftar: PenggunaBaris[]; sayaId: string }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [mode, setMode] = useState<{ jenis: "tambah" } | { jenis: "ubah" | "sandi"; p: PenggunaBaris } | null>(null);
  const [form, setForm] = useState({ nama: "", username: "", peran: "editor" as Peran, sandi: "", aktif: true });
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [sibuk, setSibuk] = useState(false);

  const buka = (m: NonNullable<typeof mode>) => {
    setGalat({});
    if (m.jenis === "tambah") setForm({ nama: "", username: "", peran: "editor", sandi: sandiAcak(), aktif: true });
    else setForm({ nama: m.p.nama, username: m.p.username, peran: m.p.peran, sandi: m.jenis === "sandi" ? sandiAcak() : "", aktif: m.p.aktif });
    setMode(m);
  };

  const kirim = async () => {
    if (!mode) return;
    setSibuk(true);
    const h =
      mode.jenis === "tambah"
        ? await tambahPengguna({ nama: form.nama, username: form.username, peran: form.peran, sandi: form.sandi })
        : mode.jenis === "ubah"
          ? await ubahPengguna(mode.p.id, { nama: form.nama, peran: form.peran, aktif: form.aktif })
          : await aturUlangSandi(mode.p.id, form.sandi);
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

  const hapus = async (p: PenggunaBaris) => {
    if (!(await konfirmasi({ judul: `Hapus akun ${p.nama}?`, pesan: "Pemilik akun tidak bisa masuk lagi. Riwayat aktivitasnya tetap tersimpan di log.", tombol: "Hapus akun", bahaya: true }))) return;
    const h = await hapusPengguna(p.id);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="d-btn d-btn-utama" onClick={() => buka({ jenis: "tambah" })}>
          <UserPlus size={16} aria-hidden="true" /> Tambah pengguna
        </button>
      </div>
      <div className="d-kartu overflow-x-auto">
        <table className="d-tabel">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Peran</th>
              <th className="hidden md:table-cell">Status</th>
              <th className="hidden md:table-cell">Terakhir masuk</th>
              <th className="w-32">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((p) => (
              <tr key={p.id}>
                <td>
                  <p className="font-semibold text-ink">
                    {p.nama} {p.id === sayaId && <span className="font-normal text-muted">(Anda)</span>}
                  </p>
                  <p className="text-xs text-muted">@{p.username}</p>
                </td>
                <td>
                  <Lencana warna={p.peran === "admin" ? "hijau" : "biru"}>{LABEL_PERAN[p.peran]}</Lencana>
                </td>
                <td className="hidden md:table-cell">{p.aktif ? <Lencana warna="hijau">Aktif</Lencana> : <Lencana warna="merah">Nonaktif</Lencana>}</td>
                <td className="hidden text-xs text-muted md:table-cell" title={waktuLengkap(p.terakhirMasuk)}>
                  {p.terakhirMasuk ? waktuRelatif(p.terakhirMasuk) : "Belum pernah"}
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" title="Ubah" aria-label={`Ubah ${p.nama}`} onClick={() => buka({ jenis: "ubah", p })}>
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button type="button" className="d-btn d-btn-hantu d-btn-ikon d-btn-kecil" title="Atur ulang kata sandi" aria-label={`Atur ulang sandi ${p.nama}`} onClick={() => buka({ jenis: "sandi", p })}>
                      <KeyRound size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="d-btn d-btn-hantu-bahaya d-btn-ikon d-btn-kecil"
                      title="Hapus"
                      aria-label={`Hapus ${p.nama}`}
                      disabled={p.id === sayaId}
                      onClick={() => void hapus(p)}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        buka={!!mode}
        tutup={() => setMode(null)}
        judul={mode?.jenis === "tambah" ? "Tambah pengguna" : mode?.jenis === "ubah" ? `Ubah ${mode.p.nama}` : mode ? `Atur ulang sandi ${mode.p.nama}` : ""}
      >
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void kirim();
          }}
        >
          {mode?.jenis !== "sandi" && (
            <Isian label="Nama lengkap" galat={galat.nama}>
              <input className="d-input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} aria-invalid={!!galat.nama || undefined} autoFocus />
            </Isian>
          )}
          {mode?.jenis === "tambah" && (
            <Isian label="Nama pengguna" galat={galat.username} bantuan="Untuk masuk. Huruf kecil, angka, titik, atau garis bawah.">
              <input
                className="d-input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!galat.username || undefined}
                placeholder="mis. humas.sekolah"
              />
            </Isian>
          )}
          {mode?.jenis !== "sandi" && (
            <div className="flex flex-col gap-1.5">
              <span className="d-label">Peran</span>
              <PilihPeran nilai={form.peran} ubah={(peran) => setForm({ ...form, peran })} />
              {galat.peran && <span className="d-galat">{galat.peran}</span>}
            </div>
          )}
          {mode?.jenis === "ubah" && (
            <label className="flex items-center gap-3">
              <button type="button" role="switch" aria-checked={form.aktif} className="d-saklar" onClick={() => setForm({ ...form, aktif: !form.aktif })}>
                <span className="sr-only">Akun aktif</span>
              </button>
              <span className="text-sm text-ink">{form.aktif ? "Akun aktif" : "Akun nonaktif (tidak bisa masuk)"}</span>
            </label>
          )}
          {mode && mode.jenis !== "ubah" && <KotakSandi nilai={form.sandi} ubah={(sandi) => setForm({ ...form, sandi })} galat={galat.sandi} />}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="d-btn d-btn-garis" onClick={() => setMode(null)}>
              Batal
            </button>
            <button type="submit" className="d-btn d-btn-utama" disabled={sibuk}>
              {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {mode?.jenis === "tambah" ? "Buat akun" : mode?.jenis === "ubah" ? "Simpan" : "Atur ulang sandi"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
