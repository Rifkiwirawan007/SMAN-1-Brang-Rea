"use client";

import { useId, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { SEKOLAH } from "@/data/sekolah";
import { IkonWhatsApp } from "@/components/ui/icons";
import { waLink } from "@/lib/format";

const PERAN = ["Orang tua/wali", "Calon murid", "Siswa", "Alumni", "Masyarakat umum"];

/**
 * Penyusun pesan WhatsApp: isi formulir, lihat pratinjau, lalu buka WhatsApp
 * dengan pesan yang sudah tersusun. Tidak ada data yang dikirim ke server.
 */
export function WaForm({
  keperluanAwal = "Informasi umum",
  pilihanKeperluan = ["Informasi umum", "SPMB / pendaftaran", "Akademik", "Kesiswaan", "Alumni dan legalisir", "Lainnya"],
}: {
  keperluanAwal?: string;
  pilihanKeperluan?: string[];
}) {
  const id = useId();
  const [nama, setNama] = useState("");
  const [peran, setPeran] = useState(PERAN[0]);
  const [keperluan, setKeperluan] = useState(keperluanAwal);
  const [pesan, setPesan] = useState("");
  const [coba, setCoba] = useState(false);
  const [terbuka, setTerbuka] = useState(false);

  const salah = {
    nama: nama.trim().length < 2,
    pesan: pesan.trim().length < 10,
  };
  const valid = !salah.nama && !salah.pesan;

  const teks = useMemo(
    () =>
      [
        `Halo ${SEKOLAH.namaPendek},`,
        "",
        `Saya ${nama.trim() || "(nama)"} (${peran.toLowerCase()}).`,
        `Keperluan: ${keperluan}`,
        "",
        pesan.trim() || "(isi pesan)",
        "",
        "Terima kasih.",
      ].join("\n"),
    [nama, peran, keperluan, pesan],
  );

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    setCoba(true);
    if (!valid) return;
    window.open(waLink(teks), "_blank", "noopener,noreferrer");
    setTerbuka(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-nama`} className="text-sm font-semibold text-ink">
              Nama lengkap
            </label>
            <input
              id={`${id}-nama`}
              className="field"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="name"
              aria-invalid={coba && salah.nama}
              aria-describedby={coba && salah.nama ? `${id}-nama-err` : undefined}
              placeholder="Contoh: Siti Aminah"
            />
            {coba && salah.nama && (
              <p id={`${id}-nama-err`} className="text-sm text-sun-ink">
                Tulis nama minimal 2 huruf.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-peran`} className="text-sm font-semibold text-ink">
              Saya adalah
            </label>
            <select id={`${id}-peran`} className="field" value={peran} onChange={(e) => setPeran(e.target.value)}>
              {PERAN.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-perlu`} className="text-sm font-semibold text-ink">
            Keperluan
          </label>
          <select id={`${id}-perlu`} className="field" value={keperluan} onChange={(e) => setKeperluan(e.target.value)}>
            {pilihanKeperluan.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-pesan`} className="text-sm font-semibold text-ink">
            Pesan
          </label>
          <textarea
            id={`${id}-pesan`}
            className="field min-h-[150px] resize-y"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            aria-invalid={coba && salah.pesan}
            aria-describedby={`${id}-pesan-ket`}
            placeholder="Tulis pertanyaan Anda di sini"
          />
          <p id={`${id}-pesan-ket`} className={coba && salah.pesan ? "text-sm text-sun-ink" : "text-sm text-muted"}>
            {coba && salah.pesan ? "Pesan minimal 10 karakter." : "Pesan dikirim lewat aplikasi WhatsApp Anda sendiri."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-solid">
            <IkonWhatsApp size={18} />
            Buka di WhatsApp
          </button>
          <span className="text-sm text-muted">ke {SEKOLAH.kontak.whatsappTampil}</span>
        </div>
        {terbuka && (
          <p role="status" className="rounded-[10px] bg-brand-soft px-4 py-3 text-sm text-brand-ink">
            Pesan tersusun dan WhatsApp dibuka di tab baru. Pesan baru terkirim setelah Anda menekan tombol kirim di
            WhatsApp. Tab tidak muncul?{" "}
            <a href={waLink(teks)} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
              Buka WhatsApp di sini
            </a>
            .
          </p>
        )}
      </form>

      <div className="flex flex-col">
        <p className="text-sm font-semibold text-ink">Pratinjau pesan</p>
        <div className="mt-2 flex-1 rounded-[14px] bg-paper-3 p-5">
          <div className="ml-auto max-w-[95%] whitespace-pre-wrap rounded-[12px] rounded-tr-none bg-paper p-4 text-[0.9375rem] leading-relaxed text-ink shadow-card">
            {teks}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Send size={14} aria-hidden="true" />
            Tersusun otomatis dari isian formulir
          </p>
        </div>
      </div>
    </div>
  );
}
