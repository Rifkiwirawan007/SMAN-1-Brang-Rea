import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BarChart3, Monitor, Smartphone } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaKoleksi } from "@/lib/server/penyimpanan";
import { ringkasanKunjungan } from "@/lib/server/kunjungan";
import { JudulHalaman, Kartu } from "@/components/dasbor/ui";
import { BatangHorizontal, formatAngka, GrafikHarian } from "@/components/dasbor/grafik";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Statistik kunjungan" };

const RENTANG = [7, 30, 90] as const;
const NAMA_HALAMAN: Record<string, string> = {
  "/": "Beranda",
  "/profil": "Profil",
  "/akademik": "Akademik",
  "/kesiswaan": "Kesiswaan",
  "/spmb": "SPMB",
  "/berita": "Berita",
  "/galeri": "Galeri",
  "/kontak": "Kontak",
};

function Perubahan({ kini, lalu }: { kini: number; lalu: number }) {
  if (!lalu) return <span className="text-xs text-muted">belum ada data pembanding</span>;
  const persen = Math.round(((kini - lalu) / lalu) * 100);
  return (
    <span className={`text-xs font-semibold ${persen >= 0 ? "text-brand" : "text-[#b42318]"}`}>
      {persen >= 0 ? "▲" : "▼"} {Math.abs(persen)}% <span className="font-normal text-muted">dari periode sebelumnya</span>
    </span>
  );
}

export default async function HalamanStatistik({ searchParams }: PageProps<"/dashboard/statistik">) {
  await connection();
  await wajibMasuk("statistik");
  const { rentang: r } = await searchParams;
  const hari = RENTANG.includes(Number(r) as 7) ? Number(r) : 30;
  const [data, berita] = await Promise.all([ringkasanKunjungan(hari), bacaKoleksi("berita")]);
  const judulBerita = new Map(berita.map((b) => [`/berita/${b.slug}`, b.judul]));
  const nama = (path: string) => NAMA_HALAMAN[path] ?? judulBerita.get(path) ?? path;
  const totalPerangkat = data.perangkat.hp + data.perangkat.komputer;
  const persenHp = totalPerangkat ? Math.round((data.perangkat.hp / totalPerangkat) * 100) : 0;

  return (
    <>
      <JudulHalaman
        judul="Statistik kunjungan"
        ikon={BarChart3}
        deskripsi="Dihitung sendiri oleh situs tanpa layanan pihak ketiga dan tanpa menyimpan alamat IP. Kunjungan admin di dashboard tidak dihitung."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Statistik" }]}
        aksi={
          <div className="flex rounded-xl border border-line-2 bg-white p-1" role="group" aria-label="Rentang waktu">
            {RENTANG.map((n) => (
              <Link
                key={n}
                href={`/dashboard/statistik?rentang=${n}`}
                aria-current={hari === n ? "true" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${hari === n ? "bg-brand text-white" : "text-ink-2 hover:bg-paper-2"}`}
              >
                {n} hari
              </Link>
            ))}
          </div>
        }
      />

      <ul className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li className="d-kartu p-5">
          <p className="text-sm text-muted">Tayangan halaman</p>
          <p className="mt-2 text-[2rem] font-semibold leading-none tabular-nums text-ink">{formatAngka(data.totalTampil)}</p>
          <p className="mt-2">
            <Perubahan kini={data.totalTampil} lalu={data.sebelumnya.tampil} />
          </p>
        </li>
        <li className="d-kartu p-5">
          <p className="text-sm text-muted">Pengunjung unik</p>
          <p className="mt-2 text-[2rem] font-semibold leading-none tabular-nums text-ink">{formatAngka(data.totalUnik)}</p>
          <p className="mt-2">
            <Perubahan kini={data.totalUnik} lalu={data.sebelumnya.unik} />
          </p>
        </li>
        <li className="d-kartu p-5">
          <p className="text-sm text-muted">Rata-rata per hari</p>
          <p className="mt-2 text-[2rem] font-semibold leading-none tabular-nums text-ink">{formatAngka(Math.round(data.totalTampil / hari))}</p>
          <p className="mt-2 text-xs text-muted">
            {data.totalUnik ? `${(data.totalTampil / data.totalUnik).toFixed(1).replace(".", ",")} halaman per pengunjung` : "—"}
          </p>
        </li>
        <li className="d-kartu p-5">
          <p className="text-sm text-muted">Perangkat</p>
          <p className="mt-2 flex items-center gap-2 text-[2rem] font-semibold leading-none tabular-nums text-ink">
            {persenHp}% <Smartphone size={22} className="text-brand" aria-hidden="true" />
          </p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-paper-3" aria-hidden="true">
            <div className="bg-brand" style={{ width: `${persenHp}%` }} />
          </div>
          <p className="mt-2 flex justify-between text-xs text-muted">
            <span>HP {formatAngka(data.perangkat.hp)}</span>
            <span className="flex items-center gap-1">
              <Monitor size={12} aria-hidden="true" /> Komputer {formatAngka(data.perangkat.komputer)}
            </span>
          </p>
        </li>
      </ul>

      <Kartu judul={`Kunjungan harian, ${hari} hari terakhir`} className="mb-6">
        {data.totalTampil === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Belum ada kunjungan tercatat pada periode ini. Data mulai terkumpul sejak fitur statistik dipasang.</p>
        ) : (
          <GrafikHarian seri={data.seri} tinggi={220} />
        )}
      </Kartu>

      <div className="grid gap-6 xl:grid-cols-2">
        <Kartu judul="Halaman paling sering dibuka">
          <BatangHorizontal data={data.halaman.map((h) => ({ label: nama(h.path), nilai: h.jumlah, href: h.path }))} />
        </Kartu>
        <Kartu judul="Asal pengunjung" deskripsi="“Langsung” = mengetik alamat, bookmark, atau dari aplikasi seperti WhatsApp.">
          <BatangHorizontal data={data.rujukan.map((r) => ({ label: r.sumber, nilai: r.jumlah }))} />
        </Kartu>
      </div>
    </>
  );
}
