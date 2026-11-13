import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { History } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaAktivitas, type JenisAksi } from "@/lib/server/aktivitas";
import { JudulHalaman, Kartu } from "@/components/dasbor/ui";
import { BarisAktivitas, KATA_AKSI, labelModul } from "@/components/dasbor/aktivitas";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata: Metadata = { title: "Log aktivitas" };
const PER = 50;

export default async function HalamanAktivitas({ searchParams }: PageProps<"/dashboard/aktivitas">) {
  await connection();
  await wajibMasuk("aktivitas");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const [oleh, modul, aksi] = [s("oleh"), s("modul"), s("aksi")];
  const hal = Math.max(1, Number(s("hal")) || 1);

  const semua = await bacaAktivitas();
  const daftarOleh = Array.from(new Map(semua.filter((a) => a.oleh).map((a) => [a.oleh!.id, a.oleh!.nama])));
  const daftarModul = Array.from(new Set(semua.map((a) => a.modul)));
  const tersaring = semua.filter((a) => (!oleh || a.oleh?.id === oleh) && (!modul || a.modul === modul) && (!aksi || a.aksi === aksi));
  const total = Math.max(1, Math.ceil(tersaring.length / PER));
  const tampil = tersaring.slice((hal - 1) * PER, hal * PER);
  const tautan = (n: number) => `/dashboard/aktivitas?${new URLSearchParams({ ...(oleh && { oleh }), ...(modul && { modul }), ...(aksi && { aksi }), hal: String(n) })}`;

  return (
    <>
      <JudulHalaman
        judul="Log aktivitas"
        ikon={History}
        deskripsi="Catatan siapa mengubah apa dan kapan, termasuk upaya masuk yang gagal. Menyimpan 3.000 aktivitas terakhir."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Log aktivitas" }]}
      />
      <form className="d-kartu mb-4 flex flex-wrap items-end gap-3 p-3" method="get">
        <label className="flex flex-col gap-1">
          <span className="d-label">Pengguna</span>
          <select name="oleh" defaultValue={oleh} className="d-input d-input-kecil w-auto min-w-[160px]">
            <option value="">Semua</option>
            {daftarOleh.map(([id, nama]) => (
              <option key={id} value={id}>
                {nama}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="d-label">Bagian</span>
          <select name="modul" defaultValue={modul} className="d-input d-input-kecil w-auto min-w-[160px]">
            <option value="">Semua</option>
            {daftarModul.map((m) => (
              <option key={m} value={m}>
                {labelModul(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="d-label">Aksi</span>
          <select name="aksi" defaultValue={aksi} className="d-input d-input-kecil w-auto min-w-[160px]">
            <option value="">Semua</option>
            {(Object.keys(KATA_AKSI) as JenisAksi[]).map((k) => (
              <option key={k} value={k}>
                {KATA_AKSI[k]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="d-btn d-btn-utama d-btn-kecil">
          Terapkan
        </button>
        {(oleh || modul || aksi) && (
          <Link href="/dashboard/aktivitas" className="d-btn d-btn-hantu d-btn-kecil">
            Reset
          </Link>
        )}
        <span className="ml-auto self-center text-sm text-muted">{tersaring.length} catatan</span>
      </form>

      <Kartu isiClassName="px-5 py-1">
        {tampil.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Tidak ada aktivitas yang cocok.</p>
        ) : (
          <ul className="divide-y divide-line">
            {tampil.map((a) => (
              <BarisAktivitas key={a.id} a={a} />
            ))}
          </ul>
        )}
      </Kartu>

      {total > 1 && (
        <nav className="mt-4 flex items-center justify-end gap-2 text-sm" aria-label="Halaman">
          {hal > 1 && (
            <Link href={tautan(hal - 1)} className="d-btn d-btn-garis d-btn-kecil">
              Sebelumnya
            </Link>
          )}
          <span className="tabular-nums text-muted">
            {hal} / {total}
          </span>
          {hal < total && (
            <Link href={tautan(hal + 1)} className="d-btn d-btn-garis d-btn-kecil">
              Berikutnya
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
