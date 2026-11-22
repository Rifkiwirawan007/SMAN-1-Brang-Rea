import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarClock } from "lucide-react";
import { bacaSemuaPengguna, wajibMasuk } from "@/lib/server/pengguna";
import { bacaJadwal } from "@/lib/server/jadwal";
import { JudulHalaman } from "@/components/dasbor/ui";
import { AturJadwal } from "@/components/dasbor/atur-jadwal";

export const instant = false;
export const metadata: Metadata = { title: "Jadwal pelajaran" };

export default async function HalamanJadwal() {
  await connection();
  await wajibMasuk("jadwal");
  const [jadwal, pengguna] = await Promise.all([bacaJadwal(), bacaSemuaPengguna()]);
  return (
    <>
      <JudulHalaman
        judul="Jadwal pelajaran"
        ikon={CalendarClock}
        deskripsi="Jadwal ini dipakai absen kelas: guru melihat jam mengajarnya, orang tua melihat nama mapel. Isi setiap sel dengan kode guru (KG) seperti di jadwal cetak sekolah."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Absen kelas", href: "/dashboard/absen-kelas" }, { label: "Jadwal" }]}
      />
      <AturJadwal
        awal={jadwal}
        akun={pengguna
          .filter((u) => u.aktif && u.peran !== "editor")
          .map((u) => ({ id: u.id, nama: u.nama, username: u.username }))
          .sort((a, b) => a.nama.localeCompare(b.nama, "id"))}
      />
    </>
  );
}
