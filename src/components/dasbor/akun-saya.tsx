"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut, Save } from "lucide-react";
import { gantiSandiSaya, keluarSemuaPerangkat, ubahNamaSaya } from "@/app/dashboard/aksi-akun";
import { useKonfirmasi, useToast } from "@/components/dasbor/penyedia";
import { Kartu } from "@/components/dasbor/ui";

export function AkunSaya({ nama: namaAwal }: { nama: string }) {
  const router = useRouter();
  const toast = useToast();
  const konfirmasi = useKonfirmasi();
  const [nama, setNama] = useState(namaAwal);
  const [sandi, setSandi] = useState({ lama: "", baru: "", ulang: "" });
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [sibuk, setSibuk] = useState<string | null>(null);

  const simpanNama = async () => {
    setSibuk("nama");
    const h = await ubahNamaSaya(nama);
    setSibuk(null);
    setGalat(h.ok ? {} : (h.galat ?? {}));
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) router.refresh();
  };

  const simpanSandi = async () => {
    setSibuk("sandi");
    const h = await gantiSandiSaya(sandi.lama, sandi.baru, sandi.ulang);
    setSibuk(null);
    setGalat(h.ok ? {} : (h.galat ?? {}));
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) setSandi({ lama: "", baru: "", ulang: "" });
  };

  const keluarSemua = async () => {
    if (!(await konfirmasi({ judul: "Keluar dari semua perangkat lain?", pesan: "Perangkat lain yang sedang masuk dengan akun ini harus masuk ulang. Perangkat ini tetap masuk.", tombol: "Keluarkan" }))) return;
    const h = await keluarSemuaPerangkat();
    toast(h.pesan, h.ok ? "sukses" : "galat");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Kartu judul="Nama tampilan" deskripsi="Nama ini tercatat di log aktivitas dan di kolom “diubah oleh”.">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void simpanNama();
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Nama lengkap</span>
            <input className="d-input" value={nama} onChange={(e) => setNama(e.target.value)} aria-invalid={!!galat.nama || undefined} />
            {galat.nama && <span className="d-galat">{galat.nama}</span>}
          </label>
          <div>
            <button type="submit" className="d-btn d-btn-utama" disabled={sibuk === "nama" || nama.trim() === namaAwal}>
              {sibuk === "nama" ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Simpan nama
            </button>
          </div>
        </form>
      </Kartu>

      <Kartu judul="Ganti kata sandi" deskripsi="Setelah diganti, perangkat lain yang memakai akun ini otomatis keluar.">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void simpanSandi();
          }}
        >
          {(
            [
              ["lama", "Kata sandi sekarang", "current-password"],
              ["baru", "Kata sandi baru", "new-password"],
              ["ulang", "Ulangi kata sandi baru", "new-password"],
            ] as const
          ).map(([k, label, ac]) => (
            <label key={k} className="flex flex-col gap-1.5">
              <span className="d-label">{label}</span>
              <input
                type="password"
                className="d-input"
                autoComplete={ac}
                value={sandi[k]}
                onChange={(e) => setSandi({ ...sandi, [k]: e.target.value })}
                aria-invalid={!!galat[k] || undefined}
              />
              {galat[k] && <span className="d-galat">{galat[k]}</span>}
            </label>
          ))}
          <p className="d-bantuan">Minimal 8 karakter, memuat huruf dan angka.</p>
          <div>
            <button type="submit" className="d-btn d-btn-utama" disabled={sibuk === "sandi" || !sandi.lama || !sandi.baru}>
              {sibuk === "sandi" && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />} Ganti kata sandi
            </button>
          </div>
        </form>
      </Kartu>

      <Kartu judul="Sesi" deskripsi="Lupa keluar di komputer sekolah atau HP lain? Keluarkan semua perangkat lain dari sini." className="lg:col-span-2">
        <button type="button" className="d-btn d-btn-garis" onClick={() => void keluarSemua()}>
          <LogOut size={16} aria-hidden="true" /> Keluar dari semua perangkat lain
        </button>
      </Kartu>
    </div>
  );
}
