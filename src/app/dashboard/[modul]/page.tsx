import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ExternalLink, Plus } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaDokumen, bacaKoleksi } from "@/lib/server/penyimpanan";
import { cariModul } from "@/lib/cms/modul";
import { JudulHalaman } from "@/components/dasbor/ui";
import { DaftarKonten } from "@/components/dasbor/daftar-konten";
import { FormulirDokumen } from "@/components/dasbor/formulir";

export async function generateMetadata({ params }: PageProps<"/dashboard/[modul]">): Promise<Metadata> {
  const { modul } = await params;
  return { title: cariModul(modul)?.label ?? "Tidak ditemukan" };
}

export default async function HalamanModul({ params }: PageProps<"/dashboard/[modul]">) {
  await connection();
  const { modul: kunci } = await params;
  const modul = cariModul(kunci);
  if (!modul) notFound();
  await wajibMasuk(kunci);

  if (modul.jenis === "dokumen") {
    const nilai = await bacaDokumen(modul.kunci);
    return (
      <>
        <JudulHalaman judul={modul.label} deskripsi={modul.deskripsi} ikon={modul.ikon} jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: modul.label }]} />
        <FormulirDokumen kunci={modul.kunci} awal={nilai as unknown as Record<string, unknown>} />
      </>
    );
  }

  const items = await bacaKoleksi(modul.kunci);
  const contohPublik = modul.publik?.(items[0] as never);
  return (
    <>
      <JudulHalaman
        judul={modul.label}
        deskripsi={modul.deskripsi}
        ikon={modul.ikon}
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: modul.label }]}
        aksi={
          <>
            {contohPublik && (
              <a href={contohPublik.startsWith("/berita/") ? "/berita" : contohPublik} target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis">
                <ExternalLink size={16} aria-hidden="true" /> Lihat di situs
              </a>
            )}
            <Link href={`/dashboard/${modul.kunci}/baru`} className="d-btn d-btn-utama">
              <Plus size={16} aria-hidden="true" /> Tambah {modul.satuan}
            </Link>
          </>
        }
      />
      <DaftarKonten kunci={modul.kunci} items={items as never} />
    </>
  );
}
