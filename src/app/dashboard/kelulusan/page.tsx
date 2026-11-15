import type { Metadata } from "next";
import { connection } from "next/server";
import { GraduationCap } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaKelulusan, sudahDibuka } from "@/lib/server/kelulusan";
import { kelasAkhir } from "@/lib/kelulusan/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaKelulusan } from "@/components/dasbor/kelola-kelulusan";

export const instant = false;
export const metadata: Metadata = { title: "Kelulusan" };

export default async function HalamanKelulusan() {
  await connection();
  await wajibMasuk("kelulusan");
  const [siswa, data] = await Promise.all([bacaSiswa(), bacaKelulusan()]);
  const kelasXII = siswa
    .filter((s) => s.aktif && kelasAkhir(s.kelas))
    .map((s) => ({ nisn: s.nisn, nama: s.nama, kelas: s.kelas, adaTglLahir: !!s.tglLahir }));
  return (
    <>
      <JudulHalaman
        judul="Kelulusan"
        ikon={GraduationCap}
        deskripsi="Tandai status kelulusan siswa kelas XII dan atur jadwal pengumuman. Siswa mengecek di halaman Cek kelulusan dengan NISN dan tanggal lahir."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Kelulusan" }]}
        aksi={
          <a href="/cek-kelulusan" target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis d-btn-kecil">
            Lihat halaman publik
          </a>
        }
      />
      <KelolaKelulusan siswa={kelasXII} data={data} terbuka={sudahDibuka(data.atur)} />
    </>
  );
}
