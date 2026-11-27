import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { wajibMasuk, bacaSemuaPengguna } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaAturanPoin, bacaPoinSemester } from "@/lib/server/poin";
import { bacaJadwal } from "@/lib/server/jadwal";
import { bacaDokumen } from "@/lib/server/penyimpanan";
import { tanggalIni, tanggalPanjang } from "@/lib/absensi/tipe";
import { labelSemester, semesterDari, semesterSah, tingkatDari } from "@/lib/poin/tipe";
import { TombolCetak } from "@/app/cetak-qr/tombol-cetak";
import "./cetak-poin.css";

/**
 * Lembar cetak A4 berkop: riwayat pelanggaran atau surat panggilan orang tua.
 * Di luar folder dashboard supaya tanpa sidebar; tetap wajib masuk.
 */
export const metadata: Metadata = { title: "Cetak poin pelanggaran", robots: { index: false } };

type Props = { searchParams: Promise<{ siswa?: string; semester?: string; jenis?: string }> };

export default function CetakPoin(props: Props) {
  return (
    <Suspense fallback={<p className="cp-kosong">Memuat…</p>}>
      <IsiCetak {...props} />
    </Suspense>
  );
}

async function IsiCetak({ searchParams }: Props) {
  await connection();
  await wajibMasuk("poin");
  const sp = await searchParams;
  const hariIni = tanggalIni();
  const ini = semesterDari(hariIni).kunci;
  const semester = semesterSah(sp.semester) && sp.semester <= ini ? sp.semester : ini;
  const jenis = sp.jenis === "panggilan" ? "panggilan" : "riwayat";

  const [siswa, semua, aturan, sekolah, jadwal, pengguna] = await Promise.all([
    bacaSiswa(),
    bacaPoinSemester(semester),
    bacaAturanPoin(),
    bacaDokumen("sekolah"),
    bacaJadwal(),
    bacaSemuaPengguna(),
  ]);
  const catatan = semua.filter((c) => c.siswa.id === sp.siswa && !c.batal).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const s = siswa.find((x) => x.id === sp.siswa) ?? catatan[0]?.siswa;
  if (!s) return <p className="cp-kosong">Siswa tidak ditemukan.</p>;

  const total = catatan.reduce((n, c) => n + c.poin, 0);
  const t = tingkatDari(total, aturan.tingkat);
  const idWali = jadwal.wali?.[s.kelas];
  const wali = pengguna.find((p) => p.id === idWali)?.nama;
  const titik = "…………………………………";

  const tabel = (
    <table className="cp-tabel">
      <thead>
        <tr>
          <th>No</th>
          <th>Tanggal</th>
          <th>Pelanggaran</th>
          <th>Keterangan</th>
          <th>Poin</th>
        </tr>
      </thead>
      <tbody>
        {catatan.map((c, i) => (
          <tr key={c.id}>
            <td className="cp-tengah">{i + 1}</td>
            <td className="cp-nowrap">{tanggalPanjang(c.tanggal)}</td>
            <td>{c.pelanggaran.nama}</td>
            <td>
              {c.ket}
              {c.tidakLapor && <>{c.ket ? " · " : ""}Tidak melapor (×2)</>}
              {(c.tindakLanjut ?? []).map((x, j) => (
                <span key={j} className="cp-tl">Tindak lanjut: {x.teks}</span>
              ))}
            </td>
            <td className="cp-tengah">{c.poin}</td>
          </tr>
        ))}
        {catatan.length === 0 && (
          <tr>
            <td colSpan={5} className="cp-tengah">Tidak ada pelanggaran.</td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="cp-kanan">Jumlah poin</td>
          <td className="cp-tengah">{total}</td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div className="cp">
      <div className="cp-alat">
        <Link href={`/dashboard/poin/${s.id}?semester=${semester}`} className="cp-kembali">← Kembali</Link>
        <Link href={`/cetak-poin?siswa=${s.id}&semester=${semester}&jenis=riwayat`} className={jenis === "riwayat" ? "cp-aktif" : ""}>Riwayat</Link>
        <Link href={`/cetak-poin?siswa=${s.id}&semester=${semester}&jenis=panggilan`} className={jenis === "panggilan" ? "cp-aktif" : ""}>Surat panggilan</Link>
        <TombolCetak />
        <p className="cp-bantuan">Kertas A4, skala 100%. Bagian bertitik diisi tangan sebelum ditandatangani.</p>
      </div>

      <article className="cp-lembar">
        <header className="cp-kop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-sman1brangrea.png" alt="" />
          <div>
            <p>PEMERINTAH PROVINSI NUSA TENGGARA BARAT</p>
            <p>DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
            <p className="cp-nama">{(sekolah.nama || "SMA Negeri 1 Brang Rea").toUpperCase()}</p>
            <p className="cp-alamat">
              {sekolah.alamat?.lengkap}
              {sekolah.kontak?.email ? ` · ${sekolah.kontak.email}` : ""}
            </p>
          </div>
        </header>

        {jenis === "riwayat" ? (
          <>
            <h1 className="cp-judul">RIWAYAT PELANGGARAN TATA TERTIB SISWA</h1>
            <p className="cp-sub">{labelSemester(semester)}</p>
            <table className="cp-identitas">
              <tbody>
                <tr><td>Nama</td><td>: {s.nama}</td></tr>
                <tr><td>Kelas</td><td>: {s.kelas}</td></tr>
                <tr><td>NISN</td><td>: {s.nisn}</td></tr>
                <tr><td>Total poin</td><td>: {total} (Tingkat {t.kode} · {t.sanksi})</td></tr>
              </tbody>
            </table>
            {tabel}
            <div className="cp-ttd cp-ttd-2">
              <div>
                <p>Wali Kelas</p>
                <p className="cp-nama-ttd">{wali ?? titik}</p>
              </div>
              <div>
                <p>Brang Rea, {tanggalPanjang(hariIni)}</p>
                <p>Guru BK</p>
                <p className="cp-nama-ttd">{titik}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <table className="cp-nomor">
              <tbody>
                <tr><td>Nomor</td><td>: {titik}</td><td className="cp-kanan">Brang Rea, {tanggalPanjang(hariIni)}</td></tr>
                <tr><td>Lampiran</td><td>: 1 (satu) lembar</td><td /></tr>
                <tr><td>Hal</td><td>: <b>Panggilan Orang Tua/Wali Siswa</b></td><td /></tr>
              </tbody>
            </table>
            <p className="cp-kepada">
              Kepada Yth.
              <br />
              Bapak/Ibu Orang Tua/Wali dari <b>{s.nama}</b>
              <br />
              di Tempat
            </p>
            <p>Dengan hormat,</p>
            <p>Bersama surat ini kami memberitahukan bahwa putra/putri Bapak/Ibu:</p>
            <table className="cp-identitas">
              <tbody>
                <tr><td>Nama</td><td>: {s.nama}</td></tr>
                <tr><td>Kelas</td><td>: {s.kelas}</td></tr>
                <tr><td>NISN</td><td>: {s.nisn}</td></tr>
              </tbody>
            </table>
            <p>
              telah mengumpulkan <b>{total} poin pelanggaran tata tertib</b> pada {labelSemester(semester)}, dengan tingkat <b>{t.kode}</b> ({t.sanksi.toLowerCase()}). Rincian
              pelanggaran terlampir.
            </p>
            <p>Untuk itu kami mengharapkan kehadiran Bapak/Ibu di sekolah pada:</p>
            <table className="cp-identitas">
              <tbody>
                <tr><td>Hari/tanggal</td><td>: {titik}</td></tr>
                <tr><td>Pukul</td><td>: …………… WITA</td></tr>
                <tr><td>Tempat</td><td>: Ruang Bimbingan Konseling (BK)</td></tr>
                <tr><td>Keperluan</td><td>: Pembinaan kedisiplinan siswa</td></tr>
              </tbody>
            </table>
            <p>Mengingat pentingnya hal tersebut, kami mohon Bapak/Ibu dapat hadir tepat waktu. Atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
            <div className="cp-ttd cp-ttd-2">
              <div>
                <p>Wali Kelas</p>
                <p className="cp-nama-ttd">{wali ?? titik}</p>
              </div>
              <div>
                <p>Guru BK</p>
                <p className="cp-nama-ttd">{titik}</p>
              </div>
            </div>
            <div className="cp-ttd">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <p className="cp-nama-ttd">{sekolah.kepalaSekolah || titik}</p>
                <p>NIP. ………………………………</p>
              </div>
            </div>

            <div className="cp-lampiran">
              <h1 className="cp-judul">LAMPIRAN: RINCIAN PELANGGARAN</h1>
              <p className="cp-sub">
                {s.nama} · {s.kelas} · {labelSemester(semester)}
              </p>
              {tabel}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
