"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquarePlus, Scale } from "lucide-react";
import { batalkanPelanggaran, tambahTindakLanjut } from "@/app/dashboard/poin/aksi";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu, Kosong, Lencana, waktuLengkap } from "@/components/dasbor/ui";
import { tanggalPanjang } from "@/lib/absensi/tipe";
import type { CatatanPoin } from "@/lib/poin/tipe";

export function RiwayatPoin({
  semester,
  catatan,
  pengguna,
  bisaUbah,
}: {
  semester: string;
  catatan: CatatanPoin[];
  pengguna: { id: string; bisaBatalSemua: boolean };
  bisaUbah: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [buka, setBuka] = useState<string | null>(null);
  const [teks, setTeks] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const simpanTL = async (id: string) => {
    setSibuk(true);
    try {
      const h = await tambahTindakLanjut(semester, id, teks);
      toast(h.pesan, h.ok ? "sukses" : "galat");
      if (h.ok) {
        setBuka(null);
        setTeks("");
        router.refresh();
      }
    } catch {
      toast("Koneksi ke server gagal. Coba lagi.", "galat");
    } finally {
      setSibuk(false);
    }
  };

  const batalkan = async (c: CatatanPoin) => {
    const ya = await konfirmasi({
      judul: "Batalkan catatan ini?",
      pesan: `${c.pelanggaran.nama} (+${c.poin} poin) tidak akan dihitung lagi. Catatannya tetap tersimpan sebagai bukti.`,
      tombol: "Batalkan catatan",
      bahaya: true,
    });
    if (!ya) return;
    const alasan = window.prompt("Alasan pembatalan (opsional), mis. salah siswa") ?? "";
    const h = await batalkanPelanggaran(semester, c.id, alasan);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) router.refresh();
  };

  return (
    <Kartu judul="Riwayat pelanggaran" deskripsi="Terbaru di atas. Catatan yang dibatalkan tidak dihitung." isiClassName="p-0">
      {catatan.length === 0 ? (
        <Kosong ikon={Scale} judul="Tidak ada pelanggaran" teks="Siswa ini belum punya catatan pelanggaran di semester ini." />
      ) : (
        <ol className="divide-y divide-line">
          {catatan.map((c) => (
            <li key={c.id} className={`px-5 py-4 ${c.batal ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                <span className="w-full text-sm font-medium text-ink sm:w-44">{tanggalPanjang(c.tanggal)}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-ink ${c.batal ? "line-through" : ""}`}>{c.pelanggaran.nama}</p>
                  {c.ket && <p className="mt-0.5 text-sm text-ink-2">{c.ket}</p>}
                  <p className="mt-1 text-xs text-muted">
                    Dicatat {c.oleh.nama} · {waktuLengkap(c.waktu)}
                    {c.tidakLapor && ` · tidak melapor (${c.poinDasar} × 2)`}
                  </p>
                  {c.batal && (
                    <p className="mt-1">
                      <Lencana warna="merah">
                        Dibatalkan {c.batal.oleh}
                        {c.batal.alasan ? `: ${c.batal.alasan}` : ""}
                      </Lencana>
                    </p>
                  )}
                  {(c.tindakLanjut ?? []).length > 0 && (
                    <ul className="mt-3 flex flex-col gap-2 border-l-2 border-brand/40 pl-3">
                      {c.tindakLanjut!.map((t, i) => (
                        <li key={i} className="text-sm">
                          <span className="text-ink">{t.teks}</span>
                          <span className="block text-xs text-muted">
                            {t.oleh} · {waktuLengkap(t.waktu)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {buka === c.id && (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea className="d-input min-h-[70px]" value={teks} onChange={(e) => setTeks(e.target.value)} maxLength={400} placeholder="Mis. sudah dipanggil ke ruang BK, siswa berjanji tidak mengulangi" autoFocus />
                      <div className="flex gap-2">
                        <button type="button" className="d-btn d-btn-utama d-btn-kecil" onClick={() => simpanTL(c.id)} disabled={sibuk || teks.trim().length < 3}>
                          Simpan
                        </button>
                        <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => setBuka(null)}>
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-lg font-bold tabular-nums text-ink">+{c.poin}</span>
              </div>
              {bisaUbah && !c.batal && buka !== c.id && (
                <div className="mt-3 flex flex-wrap gap-2 sm:pl-48">
                  <button
                    type="button"
                    className="d-btn d-btn-garis d-btn-kecil"
                    onClick={() => {
                      setBuka(c.id);
                      setTeks("");
                    }}
                  >
                    <MessageSquarePlus size={14} aria-hidden="true" /> Tindak lanjut
                  </button>
                  {(pengguna.bisaBatalSemua || c.oleh.id === pengguna.id) && (
                    <button type="button" className="d-btn d-btn-garis d-btn-kecil" onClick={() => batalkan(c)}>
                      Batalkan
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Kartu>
  );
}
