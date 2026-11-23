import type { Metadata } from "next";
import { connection } from "next/server";
import { UserCog } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { LABEL_PERAN, KET_PERAN } from "@/lib/cms/peran";
import { JudulHalaman, waktuLengkap } from "@/components/dasbor/ui";
import { AkunSaya } from "@/components/dasbor/akun-saya";
import { PasangAplikasi } from "@/components/dasbor/pasang-aplikasi";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Akun saya" };

export default async function HalamanAkun() {
  await connection();
  const p = await wajibMasuk("akun");
  return (
    <>
      <JudulHalaman
        judul="Akun saya"
        ikon={UserCog}
        deskripsi={
          <>
            Masuk sebagai <strong className="text-ink">@{p.username}</strong> · {LABEL_PERAN[p.peran]}: {KET_PERAN[p.peran]}
            {p.terakhirMasuk && <> Terakhir masuk {waktuLengkap(p.terakhirMasuk)}.</>}
          </>
        }
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Akun saya" }]}
      />
      {p.wajibGantiSandi && (
        <p role="alert" className="mb-6 rounded-2xl border border-[#f0c36d] bg-[#fff8e6] px-5 py-4 text-sm text-[#7a5200]">
          <strong className="block text-[0.9375rem]">Ganti kata sandi dulu, ya.</strong>
          Akun Anda masih memakai kata sandi awal dari admin. Buat kata sandi baru (minimal 8 karakter, ada huruf dan angka) di bawah, lalu menu dashboard akan terbuka.
        </p>
      )}
      <AkunSaya nama={p.nama} />
      <div className="mt-6">
        <PasangAplikasi />
      </div>
    </>
  );
}
