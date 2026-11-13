import { TitikPemuat } from "@/components/situs/titik-pemuat";

/** Tampil saat pindah halaman yang datanya belum siap. */
export default function Memuat() {
  return (
    <div className="grid min-h-[70svh] place-items-center">
      <TitikPemuat />
    </div>
  );
}
