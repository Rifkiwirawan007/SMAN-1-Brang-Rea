import type { Metadata } from "next";
import { connection } from "next/server";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaDokumen } from "@/lib/server/penyimpanan";
import { bacaSemuaPesan } from "@/lib/server/pesan";
import { boleh } from "@/lib/cms/peran";
import { PenyediaDasbor } from "@/components/dasbor/penyedia";
import { ShellDasbor } from "@/components/dasbor/shell";
import "../dasbor.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

// Dashboard selalu dirender saat diminta (membaca sesi dan data terbaru).
export const instant = false;

export default async function LayoutDasbor({ children }: LayoutProps<"/dashboard">) {
  await connection();
  const p = await wajibMasuk();
  const [sekolah, pesan] = await Promise.all([bacaDokumen("sekolah"), boleh(p.peran, "pesan") ? bacaSemuaPesan() : Promise.resolve([])]);
  const pesanBaru = pesan.filter((x) => x.status === "baru").length;

  return (
    <PenyediaDasbor>
      <ShellDasbor pengguna={{ nama: p.nama, username: p.username, peran: p.peran }} pesanBaru={pesanBaru} namaSekolah={sekolah.namaPendek}>
        {children}
      </ShellDasbor>
    </PenyediaDasbor>
  );
}
