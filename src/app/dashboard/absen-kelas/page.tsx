import type { Metadata } from "next";
import { connection } from "next/server";
import { BookOpenCheck } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaAbsenTanggal, bacaSiswa } from "@/lib/server/absensi";
import { bacaJadwal, bacaSesiTanggal } from "@/lib/server/jadwal";
import { tanggalIni, tanggalSah } from "@/lib/absensi/tipe";
import { blokGuru, blokKelas, daftarKelasJadwal, hariDari, jamSekarang, kunciSesi, LABEL_HARI, type Blok } from "@/lib/jadwal/tipe";
import { JudulHalaman } from "@/components/dasbor/ui";
import { AbsenKelas, type RingkasSesi } from "@/components/dasbor/absen-kelas";

export const instant = false;
export const metadata: Metadata = { title: "Absen kelas" };

export default async function HalamanAbsenKelas({ searchParams }: PageProps<"/dashboard/absen-kelas">) {
  await connection();
  const p = await wajibMasuk("absen-kelas");
  const sp = await searchParams;
  const admin = p.peran === "admin";
  const hariIni = tanggalIni();
  const tanggal = admin && tanggalSah(sp.tanggal) && sp.tanggal <= hariIni ? sp.tanggal : hariIni;
  const hari = hariDari(tanggal);

  const [jadwal, sesiHari] = await Promise.all([bacaJadwal(), bacaSesiTanggal(tanggal)]);
  const semuaKelas = daftarKelasJadwal(jadwal);
  const blokSaya = hari ? blokGuru(jadwal, hari, p.id) : [];
  const kelasLain = typeof sp.kelas === "string" && semuaKelas.includes(sp.kelas) ? sp.kelas : "";
  const blokLain = hari && kelasLain ? blokKelas(jadwal, hari, kelasLain) : [];
  const kelasWali = Object.entries(jadwal.wali).find(([, id]) => id === p.id)?.[0] ?? "";

  // Blok yang dibuka: dari URL, atau otomatis pelajaran yang sedang berlangsung (hanya hari ini).
  const jamUrl = Number(sp.jam);
  const kelasBlok = typeof sp.kelasBlok === "string" ? sp.kelasBlok : "";
  let terpilih: Blok | undefined = hari && kelasBlok && jamUrl ? blokKelas(jadwal, hari, kelasBlok).find((b) => b.jamMulai === jamUrl) : undefined;
  const kini = jamSekarang();
  const berlangsung = tanggal === hariIni ? blokSaya.find((b) => b.mulai <= kini && kini < b.selesai) : undefined;
  if (!terpilih && !sp.jam && berlangsung) terpilih = berlangsung;

  const terisi: Record<string, RingkasSesi> = {};
  for (const s of sesiHari) {
    terisi[kunciSesi(s.tanggal, s.kelas, s.jamMulai)] = { oleh: s.oleh.nama, waktu: s.waktu, tidakHadir: Object.keys(s.tidakHadir).length };
  }

  let formulir = null;
  if (terpilih) {
    const [siswa, pagi] = await Promise.all([bacaSiswa(), bacaAbsenTanggal(tanggal)]);
    const diKelas = siswa.filter((s) => s.aktif && s.kelas === terpilih.kelas).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    const petaPagi = new Map(pagi.map((c) => [c.siswaId, c.status]));
    formulir = {
      blok: terpilih,
      siswa: diKelas.map((s) => ({ id: s.id, nama: s.nama, nisn: s.nisn, pagi: petaPagi.get(s.id) ?? null })),
      sesi: sesiHari.find((s) => s.kelas === terpilih.kelas && s.jamMulai === terpilih.jamMulai) ?? null,
    };
  }

  return (
    <>
      <JudulHalaman
        judul="Absen kelas"
        ikon={BookOpenCheck}
        deskripsi="Absen per jam pelajaran. Semua siswa dianggap hadir, cukup tandai yang sakit, izin, atau alpa lalu simpan. Orang tua melihat rinciannya per mata pelajaran di halaman Cek absensi."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Absen kelas" }]}
      />
      <AbsenKelas
        key={`${tanggal}|${kelasLain}|${terpilih?.kelas}|${terpilih?.jamMulai}`}
        tanggal={tanggal}
        hariIni={hariIni}
        labelHari={hari ? LABEL_HARI[hari] : "Minggu"}
        libur={!hari}
        admin={admin}
        jamKini={kini}
        blokSaya={blokSaya}
        semuaKelas={semuaKelas}
        kelasLain={kelasLain}
        blokLain={blokLain}
        kelasWali={kelasWali}
        terisi={terisi}
        formulir={formulir}
        adaJadwal={jadwal.guru.length > 0}
      />
    </>
  );
}
