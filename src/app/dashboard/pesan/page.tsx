import type { Metadata } from "next";
import { connection } from "next/server";
import { Inbox } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSemuaPesan } from "@/lib/server/pesan";
import { JudulHalaman } from "@/components/dasbor/ui";
import { PesanMasuk } from "@/components/dasbor/pesan-masuk";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Pesan masuk" };

export default async function HalamanPesan({ searchParams }: PageProps<"/dashboard/pesan">) {
  await connection();
  await wajibMasuk("pesan");
  const [pesan, { buka }] = await Promise.all([bacaSemuaPesan(), searchParams]);
  return (
    <>
      <JudulHalaman
        judul="Pesan masuk"
        ikon={Inbox}
        deskripsi="Salinan pesan dari formulir Kontak dan SPMB. Pengunjung tetap mengirim lewat WhatsApp; di sini petugas bisa memantau, membalas, dan mencatat tindak lanjut."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Pesan masuk" }]}
      />
      <PesanMasuk pesan={pesan} bukaAwal={typeof buka === "string" ? buka : undefined} />
    </>
  );
}
