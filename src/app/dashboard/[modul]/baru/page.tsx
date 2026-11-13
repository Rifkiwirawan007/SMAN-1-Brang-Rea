import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { wajibMasuk } from "@/lib/server/pengguna";
import { KOLEKSI } from "@/lib/cms/modul";
import { NAMA_KOLEKSI, type NamaKoleksi } from "@/lib/konten/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { FormulirKoleksi } from "@/components/dasbor/formulir";

const sah = (k: string): k is NamaKoleksi => (NAMA_KOLEKSI as string[]).includes(k);

export async function generateMetadata({ params }: PageProps<"/dashboard/[modul]/baru">): Promise<Metadata> {
  const { modul } = await params;
  return { title: sah(modul) ? `Tambah ${KOLEKSI[modul].satuan}` : "Tidak ditemukan" };
}

export default async function HalamanBaru({ params }: PageProps<"/dashboard/[modul]/baru">) {
  await connection();
  const { modul: kunci } = await params;
  if (!sah(kunci)) notFound();
  await wajibMasuk(kunci);
  const modul = KOLEKSI[kunci];

  return (
    <>
      <JudulHalaman
        judul={`Tambah ${modul.satuan}`}
        ikon={modul.ikon}
        jejak={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: modul.label, href: `/dashboard/${kunci}` },
          { label: "Baru" },
        ]}
      />
      <FormulirKoleksi kunci={kunci} awal={modul.bawaan()} id={null} />
    </>
  );
}
