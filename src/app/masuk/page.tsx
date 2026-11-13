import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { adaPengguna, penggunaSaatIni } from "@/lib/server/pengguna";
import { bacaDokumen } from "@/lib/server/penyimpanan";
import { FormAdminPertama, FormMasuk } from "@/components/dasbor/form-masuk";
import "../dasbor.css";

export const metadata: Metadata = {
  title: "Masuk dashboard",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function HalamanMasuk({ searchParams }: PageProps<"/masuk">) {
  await connection();
  if (await penggunaSaatIni()) redirect("/dashboard");
  const [{ ke, keluar }, ada, sekolah] = await Promise.all([searchParams, adaPengguna(), bacaDokumen("sekolah")]);
  const tujuan = typeof ke === "string" ? ke : undefined;

  return (
    <div className="dasbor grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative hidden overflow-hidden bg-brand-ink lg:block">
        <Image src="/images/hero-sekolah-baru.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <Image src="/images/logo-sman1brangrea.png" alt="" width={64} height={64} className="h-16 w-16 object-contain" />
          <p className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.02em]">{sekolah.nama}</p>
          <p className="mt-3 max-w-[44ch] text-white/80">
            Dashboard pengelola situs: berita, agenda, prestasi, galeri, isi halaman, pesan masuk, dan statistik kunjungan.
          </p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2 self-start text-sm text-muted hover:text-brand">
          <ArrowLeft size={16} aria-hidden="true" /> Kembali ke situs
        </Link>
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/images/logo-sman1brangrea.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <span className="font-bold text-ink">{sekolah.namaPendek}</span>
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">{ada ? "Masuk dashboard" : "Pemasangan pertama"}</h1>
          <p className="mb-7 mt-1.5 text-sm text-muted">{ada ? "Gunakan akun yang diberikan admin sekolah." : "Satu langkah sebelum mulai mengelola situs."}</p>
          {ada ? <FormMasuk ke={tujuan} keluar={keluar === "1"} /> : <FormAdminPertama />}
        </main>
        <p className="text-center text-xs text-muted">© {new Date().getFullYear()} {sekolah.nama}</p>
      </div>
    </div>
  );
}
