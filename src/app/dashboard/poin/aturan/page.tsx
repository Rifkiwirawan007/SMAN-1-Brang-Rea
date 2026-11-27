import type { Metadata } from "next";
import { connection } from "next/server";
import { Settings2 } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaAturanPoin } from "@/lib/server/poin";
import { JudulHalaman } from "@/components/dasbor/ui";
import { EditorAturanPoin } from "@/components/dasbor/editor-aturan-poin";

export const instant = false;
export const metadata: Metadata = { title: "Aturan poin pelanggaran" };

export default async function HalamanAturanPoin() {
  await connection();
  await wajibMasuk("poin-aturan");
  const aturan = await bacaAturanPoin();
  return (
    <>
      <JudulHalaman
        judul="Aturan & poin"
        ikon={Settings2}
        deskripsi="Daftar pelanggaran dan tingkat sanksi dari buku saku. Ubah di sini bila tata tertib direvisi; catatan yang sudah ada tidak ikut berubah."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Poin pelanggaran", href: "/dashboard/poin" }, { label: "Aturan & poin" }]}
      />
      <EditorAturanPoin awal={aturan} />
    </>
  );
}
