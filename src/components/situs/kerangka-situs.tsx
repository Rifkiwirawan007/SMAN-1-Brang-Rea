import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RevealObserver } from "@/components/layout/reveal-observer";
import { SitusProvider } from "@/components/situs/konteks";
import { PencatatKunjungan } from "@/components/situs/pencatat-kunjungan";
import type { Sekolah } from "@/lib/konten/tipe";

/**
 * Kerangka halaman publik: header, <main>, footer, animasi muncul, dan pencatat kunjungan.
 * Dipakai app/(situs)/layout.tsx dan app/not-found.tsx (404 dirender di luar layout grup (situs)).
 * Halaman admin (/dashboard, /masuk) sengaja tidak memakainya.
 */
export function KerangkaSitus({
  sekolah,
  catatKunjungan = true,
  children,
}: {
  sekolah: Sekolah;
  /** false di halaman 404, supaya alamat yang salah tidak ikut statistik kunjungan. */
  catatKunjungan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SitusProvider sekolah={sekolah}>
      <SiteHeader />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter sekolah={sekolah} />
      <RevealObserver />
      {catatKunjungan ? <PencatatKunjungan /> : null}
    </SitusProvider>
  );
}
