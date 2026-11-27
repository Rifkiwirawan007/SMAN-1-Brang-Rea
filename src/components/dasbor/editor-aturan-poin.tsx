"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { simpanAturan } from "@/app/dashboard/poin/aksi";
import { useToast } from "@/components/dasbor/penyedia";
import { Kartu, waktuLengkap } from "@/components/dasbor/ui";
import type { AturanPoin, JenisPelanggaran, Tingkat } from "@/lib/poin/tipe";

export function EditorAturanPoin({ awal }: { awal: AturanPoin }) {
  const router = useRouter();
  const toast = useToast();
  const [pel, setPel] = useState<JenisPelanggaran[]>(awal.pelanggaran);
  const [tk, setTk] = useState<Tingkat[]>(awal.tingkat);
  const [sibuk, setSibuk] = useState(false);

  const ubahPel = (i: number, ubah: Partial<JenisPelanggaran>) => setPel((d) => d.map((x, j) => (j === i ? { ...x, ...ubah } : x)));
  const ubahTk = (i: number, ubah: Partial<Tingkat>) => setTk((d) => d.map((x, j) => (j === i ? { ...x, ...ubah } : x)));

  const simpan = async () => {
    setSibuk(true);
    try {
      const h = await simpanAturan({ pelanggaran: pel, tingkat: tk });
      toast(h.pesan, h.ok ? "sukses" : "galat");
      if (h.ok) router.refresh();
    } catch {
      toast("Koneksi ke server gagal. Coba lagi.", "galat");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Kartu judul="Tingkat sanksi" deskripsi="Berdasarkan total poin siswa dalam satu semester." isiClassName="p-0">
        <div className="overflow-x-auto">
          <table className="d-tabel">
            <thead>
              <tr>
                <th className="w-20">Tingkat</th>
                <th className="w-24">Dari</th>
                <th className="w-24">Sampai</th>
                <th>Sanksi</th>
              </tr>
            </thead>
            <tbody>
              {tk.map((t, i) => (
                <tr key={i}>
                  <td><input className="d-input d-input-kecil" value={t.kode} onChange={(e) => ubahTk(i, { kode: e.target.value })} aria-label="Kode tingkat" /></td>
                  <td><input type="number" className="d-input d-input-kecil tabular-nums" value={t.dari} onChange={(e) => ubahTk(i, { dari: Number(e.target.value) })} aria-label="Poin dari" /></td>
                  <td><input type="number" className="d-input d-input-kecil tabular-nums" value={t.sampai} onChange={(e) => ubahTk(i, { sampai: Number(e.target.value) })} aria-label="Poin sampai" /></td>
                  <td><input className="d-input d-input-kecil min-w-[260px]" value={t.sanksi} onChange={(e) => ubahTk(i, { sanksi: e.target.value })} aria-label="Sanksi" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      <Kartu
        judul={`Jenis pelanggaran (${pel.length})`}
        deskripsi="Isi poin dari–sampai sama bila poinnya tetap. Bila berbeda, guru memilih poin di dalam rentang itu."
        isiClassName="p-0"
        aksi={
          <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setPel((d) => [...d, { no: 0, nama: "", min: 5, maks: 5 }])}>
            <Plus size={14} aria-hidden="true" /> Tambah
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="d-tabel">
            <thead>
              <tr>
                <th className="w-12">No</th>
                <th>Pelanggaran</th>
                <th className="w-24">Poin dari</th>
                <th className="w-24">Sampai</th>
                <th className="w-px" />
              </tr>
            </thead>
            <tbody>
              {pel.map((p, i) => (
                <tr key={i}>
                  <td className="text-sm tabular-nums text-muted">{p.no || "baru"}</td>
                  <td><input className="d-input d-input-kecil min-w-[280px]" value={p.nama} onChange={(e) => ubahPel(i, { nama: e.target.value })} aria-label="Nama pelanggaran" /></td>
                  <td><input type="number" className="d-input d-input-kecil tabular-nums" value={p.min} onChange={(e) => ubahPel(i, { min: Number(e.target.value) })} aria-label="Poin dari" /></td>
                  <td><input type="number" className="d-input d-input-kecil tabular-nums" value={p.maks} onChange={(e) => ubahPel(i, { maks: Number(e.target.value) })} aria-label="Poin sampai" /></td>
                  <td>
                    <button type="button" className="d-btn d-btn-hantu-bahaya d-btn-kecil" onClick={() => setPel((d) => d.filter((_, j) => j !== i))} aria-label={`Hapus ${p.nama}`}>
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="d-btn d-btn-utama" onClick={simpan} disabled={sibuk}>
          {sibuk && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Simpan aturan
        </button>
        <p className="text-sm text-muted">{awal.diubah ? `Terakhir diubah ${awal.oleh} · ${waktuLengkap(awal.diubah)}` : "Masih memakai isi Buku Saku (21 Juli 2023)."}</p>
      </div>
    </div>
  );
}
