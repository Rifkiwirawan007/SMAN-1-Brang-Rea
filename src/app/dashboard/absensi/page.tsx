import type { Metadata } from "next";
import { connection } from "next/server";
import { ClipboardCheck } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaAbsenTanggal, bacaAturAbsensi, bacaSiswa } from "@/lib/server/absensi";
import { tanggalIni, tanggalSah, urutKelas } from "@/lib/absensi/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { AbsensiHarian } from "@/components/dasbor/absensi-harian";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Absensi siswa" };

export default async function HalamanAbsensi({ searchParams }: PageProps<"/dashboard/absensi">) {
  await connection();
  const p = await wajibMasuk("absensi");
  const sp = await searchParams;
  const hariIni = tanggalIni();
  const tanggal = tanggalSah(sp.tanggal) && sp.tanggal <= hariIni ? sp.tanggal : hariIni;
  const kelas = typeof sp.kelas === "string" ? sp.kelas : "";

  const [siswa, catatan, atur] = await Promise.all([bacaSiswa(), bacaAbsenTanggal(tanggal), bacaAturAbsensi()]);
  const aktif = siswa.filter((s) => s.aktif);
  const daftarKelas = [...new Set(aktif.map((s) => s.kelas))].sort(urutKelas);

  return (
    <>
      <JudulHalaman
        judul="Absensi siswa"
        ikon={ClipboardCheck}
        deskripsi="Scan QR di kartu siswa untuk mencatat kehadiran. Siswa yang tidak hadir bisa diubah ke sakit, izin, atau alpa. Orang tua melihat hasilnya di halaman Cek absensi dengan NISN."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Absensi siswa" }]}
      />
      <AbsensiHarian
        key={`${tanggal}|${kelas}`}
        tanggal={tanggal}
        hariIni={hariIni}
        kelas={kelas}
        daftarKelas={daftarKelas}
        siswa={aktif.map((s) => ({ id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn }))}
        catatanAwal={catatan}
        atur={atur}
        admin={p.peran === "admin"}
      />
    </>
  );
}
