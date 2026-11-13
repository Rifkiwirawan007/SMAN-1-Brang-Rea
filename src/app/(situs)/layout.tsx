import { KerangkaSitus } from "@/components/situs/kerangka-situs";
import { LayarPemuat } from "@/components/situs/layar-pemuat";
import { ambilSekolah } from "@/lib/konten/baca";

/** Layout semua halaman publik: header + footer situs. Dashboard admin berada di luar grup ini. */
export default async function LayoutSitus({ children }: { children: React.ReactNode }) {
  const sekolah = await ambilSekolah();
  return (
    <>
      <LayarPemuat label={`Memuat ${sekolah.namaPendek}`} />
      <KerangkaSitus sekolah={sekolah}>{children}</KerangkaSitus>
    </>
  );
}
