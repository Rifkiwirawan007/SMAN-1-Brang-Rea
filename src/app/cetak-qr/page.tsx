import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import QRCode from "qrcode";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaSiswa } from "@/lib/server/absensi";
import { urutKelas, type Siswa } from "@/lib/absensi/tipe";
import { TombolCetak } from "./tombol-cetak";
import "./cetak.css";

/**
 * Lembar stiker QR siswa (A4) untuk ditempel di kartu pelajar.
 * Isi QR = Kode QR siswa bila diisi, selain itu NISN — sama persis dengan yang dicocokkan saat scan absensi.
 * Di luar folder dashboard supaya tidak ikut sidebar; tetap wajib masuk.
 */
export const metadata: Metadata = { title: "Cetak stiker QR siswa", robots: { index: false } };

type Props = { searchParams: Promise<{ kelas?: string }> };

async function svgQr(isi: string) {
  return QRCode.toString(isi, { type: "svg", errorCorrectionLevel: "M", margin: 1 });
}

export default async function CetakQr({ searchParams }: Props) {
  await connection();
  await wajibMasuk("siswa");
  const { kelas = "" } = await searchParams;
  const semua = (await bacaSiswa()).filter((s) => s.aktif);
  const daftarKelas = [...new Set(semua.map((s) => s.kelas))].sort(urutKelas);
  const dipilih = kelas === "semua" ? daftarKelas : daftarKelas.filter((k) => k === kelas);

  const kelompok: { kelas: string; siswa: (Siswa & { svg: string })[] }[] = [];
  for (const k of dipilih) {
    const anggota = semua.filter((s) => s.kelas === k).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    kelompok.push({
      kelas: k,
      siswa: await Promise.all(anggota.map(async (s) => ({ ...s, svg: await svgQr(s.kodeQr || s.nisn) }))),
    });
  }

  return (
    <div className="cq">
      <div className="cq-alat">
        <Link href="/dashboard/siswa" className="cq-kembali">← Data siswa</Link>
        <form className="cq-form">
          <label>
            Kelas{" "}
            <select name="kelas" defaultValue={kelas}>
              <option value="" disabled>Pilih kelas</option>
              {daftarKelas.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
              <option value="semua">Semua kelas</option>
            </select>
          </label>
          <button type="submit">Tampilkan</button>
        </form>
        {kelompok.length > 0 && <TombolCetak />}
        <p className="cq-bantuan">
          Cetak di kertas A4 (stiker atau HVS), skala 100% / &quot;Actual size&quot;. Gunting mengikuti garis putus-putus, lalu tempel di kartu pelajar.
        </p>
      </div>

      {kelompok.length === 0 && <p className="cq-kosong">Pilih kelas lalu klik Tampilkan.</p>}

      {kelompok.map((g) => (
        <section key={g.kelas} className="cq-kelas">
          <h2 className="cq-judul">
            Stiker QR absensi · Kelas {g.kelas} · {g.siswa.length} siswa
          </h2>
          <div className="cq-grid">
            {g.siswa.map((s) => (
              <div key={s.id} className="cq-stiker">
                <div className="cq-qr" dangerouslySetInnerHTML={{ __html: s.svg }} />
                <div className="cq-nama">{s.nama}</div>
                <div className="cq-info">
                  {s.kelas} · {s.nisn}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
