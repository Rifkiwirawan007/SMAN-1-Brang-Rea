import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Printer, Scale } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaAturanPoin, bacaPoinSemester } from "@/lib/server/poin";
import { tanggalIni } from "@/lib/absensi/tipe";
import { labelSemester, perluSurat, rentangTingkat, semesterDari, semesterSah, tingkatDari, warnaTingkat } from "@/lib/poin/tipe";
import { JudulHalaman, Lencana } from "@/components/dasbor/ui";
import { RiwayatPoin } from "@/components/dasbor/riwayat-poin";

export const instant = false;
export const metadata: Metadata = { title: "Riwayat poin siswa" };

export default async function HalamanRiwayatPoin({ params, searchParams }: PageProps<"/dashboard/poin/[siswaId]">) {
  await connection();
  const p = await wajibMasuk("poin");
  const { siswaId } = await params;
  const sp = await searchParams;
  const ini = semesterDari(tanggalIni()).kunci;
  const semester = semesterSah(sp.semester) && sp.semester <= ini ? sp.semester : ini;

  const [siswa, semua, aturan] = await Promise.all([bacaSiswa(), bacaPoinSemester(semester), bacaAturanPoin()]);
  const catatan = semua.filter((c) => c.siswa.id === siswaId).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.waktu.localeCompare(a.waktu));
  const s = siswa.find((x) => x.id === siswaId) ?? catatan[0]?.siswa;
  if (!s) notFound();

  const total = catatan.filter((c) => !c.batal).reduce((n, c) => n + c.poin, 0);
  const t = tingkatDari(total, aturan.tingkat);
  const surat = perluSurat(total, aturan.tingkat);

  return (
    <>
      <JudulHalaman
        judul={s.nama}
        ikon={Scale}
        deskripsi={`${s.kelas} · NISN ${s.nisn} · ${labelSemester(semester)}`}
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Poin pelanggaran", href: `/dashboard/poin?semester=${semester}` }, { label: s.nama }]}
        aksi={
          catatan.length > 0 ? (
            <>
              <Link href={`/cetak-poin?siswa=${s.id}&semester=${semester}&jenis=riwayat`} className="d-btn d-btn-garis" target="_blank">
                <Printer size={16} aria-hidden="true" /> Cetak riwayat
              </Link>
              <Link href={`/cetak-poin?siswa=${s.id}&semester=${semester}&jenis=panggilan`} className={`d-btn ${surat ? "d-btn-utama" : "d-btn-garis"}`} target="_blank">
                <Printer size={16} aria-hidden="true" /> Surat panggilan orang tua
              </Link>
            </>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="d-kartu p-5">
          <p className="text-sm text-muted">Total poin semester ini</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-ink">{total}</p>
        </div>
        <div className="d-kartu p-5 sm:col-span-2">
          <div className="flex items-center gap-2">
            <Lencana warna={warnaTingkat(total, aturan.tingkat)}>Tingkat {t.kode}</Lencana>
            <span className="text-sm text-muted">
              {rentangTingkat(t)} poin
            </span>
          </div>
          <p className="mt-2 font-semibold text-ink">{t.sanksi}</p>
          {surat && <p className="mt-1 text-sm text-ink-2">Sudah perlu surat untuk orang tua/wali. Cetak lewat tombol di atas.</p>}
        </div>
      </div>

      <RiwayatPoin
        semester={semester}
        catatan={catatan}
        pengguna={{ id: p.id, bisaBatalSemua: p.peran === "admin" || p.peran === "bk" }}
        bisaUbah={semester === ini}
      />
    </>
  );
}
