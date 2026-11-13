import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaKoleksi } from "@/lib/server/penyimpanan";
import { KOLEKSI } from "@/lib/cms/modul";
import { NAMA_KOLEKSI, type NamaKoleksi } from "@/lib/konten/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { FormulirKoleksi } from "@/components/dasbor/formulir";

const sah = (k: string): k is NamaKoleksi => (NAMA_KOLEKSI as string[]).includes(k);

async function ambil(kunci: string, id: string) {
  if (!sah(kunci)) return null;
  const item = (await bacaKoleksi(kunci)).find((x) => x.id === id);
  return item ? { modul: KOLEKSI[kunci], item, kunci } : null;
}

export async function generateMetadata({ params }: PageProps<"/dashboard/[modul]/[id]">): Promise<Metadata> {
  const { modul, id } = await params;
  const d = await ambil(modul, id);
  return { title: d ? `Ubah: ${d.modul.judul(d.item as never)}` : "Tidak ditemukan" };
}

export default async function HalamanUbah({ params }: PageProps<"/dashboard/[modul]/[id]">) {
  await connection();
  const { modul: kunciModul, id } = await params;
  if (!sah(kunciModul)) notFound();
  await wajibMasuk(kunciModul);
  const d = await ambil(kunciModul, id);
  if (!d) notFound();
  const judul = d.modul.judul(d.item as never) || "(tanpa judul)";

  return (
    <>
      <JudulHalaman
        judul={judul}
        ikon={d.modul.ikon}
        jejak={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: d.modul.label, href: `/dashboard/${d.kunci}` },
          { label: "Ubah" },
        ]}
      />
      <FormulirKoleksi key={id} kunci={d.kunci} awal={d.item as unknown as Record<string, unknown>} id={id} />
    </>
  );
}
