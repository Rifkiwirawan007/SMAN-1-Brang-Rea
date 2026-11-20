import type { Metadata } from "next";
import { connection } from "next/server";
import { DoorOpen } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaIzinTanggal } from "@/lib/server/izin-keluar";
import { bacaDokumen } from "@/lib/server/penyimpanan";
import { tanggalIni, tanggalSah, urutKelas } from "@/lib/absensi/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaIzinKeluar } from "@/components/dasbor/kelola-izin-keluar";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Izin keluar" };

export default async function HalamanIzinKeluar({ searchParams }: PageProps<"/dashboard/izin-keluar">) {
  await connection();
  const p = await wajibMasuk("izin-keluar");
  const sp = await searchParams;
  const hariIni = tanggalIni();
  const tanggal = tanggalSah(sp.tanggal) && sp.tanggal <= hariIni ? sp.tanggal : hariIni;

  const [siswa, izin, sekolah] = await Promise.all([bacaSiswa(), bacaIzinTanggal(tanggal), bacaDokumen("sekolah")]);
  const aktif = siswa.filter((s) => s.aktif);

  return (
    <>
      <JudulHalaman
        judul="Izin keluar"
        ikon={DoorOpen}
        deskripsi="Siswa yang keluar sekolah di jam pelajaran: scan kartunya, pilih keperluan, lalu resi tercetak. Siswa menunjukkan resi ke satpam."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Izin keluar" }]}
      />
      <KelolaIzinKeluar
        key={tanggal}
        tanggal={tanggal}
        hariIni={hariIni}
        izinAwal={izin}
        siswa={aktif.map((s) => ({ id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn }))}
        daftarKelas={[...new Set(aktif.map((s) => s.kelas))].sort(urutKelas)}
        namaSekolah={sekolah.nama || "SMA Negeri 1 Brang Rea"}
        pengguna={{ id: p.id, admin: p.peran === "admin" }}
      />
    </>
  );
}
