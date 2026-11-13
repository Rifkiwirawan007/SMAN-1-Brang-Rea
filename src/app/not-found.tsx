import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KerangkaSitus } from "@/components/situs/kerangka-situs";
import { ambilSekolah } from "@/lib/konten/baca";

// 404 global dirender di bawah root layout saja (di luar grup (situs)), jadi header dan footer dipasang sendiri.
export default async function TidakDitemukan() {
  const sekolah = await ambilSekolah();
  return (
    <KerangkaSitus sekolah={sekolah} catatKunjungan={false}>
      <section className="section-y pt-40 md:pt-48">
        <div className="container-site flex flex-col items-start">
          <p className="text-stat text-brand">404</p>
          <h1 className="mt-6 text-h1 max-w-[16ch]">Halaman tidak ditemukan</h1>
          <p className="mt-5 max-w-[50ch] text-lead text-ink-2">
            Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Coba mulai dari beranda atau buka berita terbaru.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="btn-solid">
              Ke beranda
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/berita" className="btn-pill">
              Berita sekolah
            </Link>
          </div>
        </div>
      </section>
    </KerangkaSitus>
  );
}
