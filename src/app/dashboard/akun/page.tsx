import type { Metadata } from "next";
import { connection } from "next/server";
import { UserCog } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { LABEL_PERAN, KET_PERAN } from "@/lib/cms/peran";
import { JudulHalaman, waktuLengkap } from "@/components/dasbor/ui";
import { AkunSaya } from "@/components/dasbor/akun-saya";

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
      <AkunSaya nama={p.nama} />
    </>
  );
}
