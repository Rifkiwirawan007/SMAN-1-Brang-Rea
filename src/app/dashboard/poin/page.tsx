import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Scale, Settings2 } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaAturanPoin, bacaPoinSemester, totalPerSiswa } from "@/lib/server/poin";
import { boleh } from "@/lib/cms/peran";
import { tanggalIni, urutKelas } from "@/lib/absensi/tipe";
import { labelSemester, semesterDari, semesterSah, semesterSebelum } from "@/lib/poin/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { KelolaPoin } from "@/components/dasbor/kelola-poin";

export const instant = false;
export const metadata: Metadata = { title: "Poin pelanggaran" };

export default async function HalamanPoin({ searchParams }: PageProps<"/dashboard/poin">) {
  await connection();
  const p = await wajibMasuk("poin");
  const sp = await searchParams;
  const hariIni = tanggalIni();
  const ini = semesterDari(hariIni);
  const semester = semesterSah(sp.semester) && sp.semester <= ini.kunci ? sp.semester : ini.kunci;

  const [siswa, catatan, aturan] = await Promise.all([bacaSiswa(), bacaPoinSemester(semester), bacaAturanPoin()]);
  const aktif = siswa.filter((s) => s.aktif);
  const total = totalPerSiswa(catatan);
  const peringkat = [...total.entries()]
    .map(([id, t]) => {
      const s = siswa.find((x) => x.id === id) ?? catatan.find((c) => c.siswa.id === id)!.siswa;
      return { id, nama: s.nama, kelas: s.kelas, nisn: s.nisn, ...t };
    })
    .sort((a, b) => b.poin - a.poin || a.nama.localeCompare(b.nama, "id"));
  const pilihanSemester = [ini.kunci, semesterSebelum(ini.kunci), semesterSebelum(semesterSebelum(ini.kunci))].map((k) => ({ kunci: k, label: labelSemester(k) }));

  return (
    <>
      <JudulHalaman
        judul="Poin pelanggaran"
        ikon={Scale}
        deskripsi="Catat pelanggaran tata tertib sesuai buku saku. Poin dijumlahkan per semester dan otomatis mulai dari 0 di semester baru."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Poin pelanggaran" }]}
        aksi={
          boleh(p.peran, "poin-aturan") ? (
            <Link href="/dashboard/poin/aturan" className="d-btn d-btn-garis">
              <Settings2 size={16} aria-hidden="true" /> Aturan &amp; poin
            </Link>
          ) : undefined
        }
      />
      <KelolaPoin
        key={semester}
        semester={semester}
        semesterIni={ini.kunci}
        labelSemesterIni={ini.label}
        pilihanSemester={pilihanSemester}
        hariIni={hariIni}
        awalSemester={ini.dari}
        aturan={aturan}
        siswa={aktif.map((s) => ({ id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn }))}
        daftarKelas={[...new Set(aktif.map((s) => s.kelas))].sort(urutKelas)}
        peringkat={peringkat}
        terbaru={catatan
          .filter((c) => !c.batal)
          .sort((a, b) => b.waktu.localeCompare(a.waktu))
          .slice(0, 8)}
      />
    </>
  );
}
