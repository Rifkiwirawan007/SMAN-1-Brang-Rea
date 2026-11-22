import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Download, Table2 } from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaAbsenTanggal, bacaSiswa } from "@/lib/server/absensi";
import { bacaJadwal, bacaSesiTanggal } from "@/lib/server/jadwal";
import { LABEL_STATUS, masuk, tanggalIni, tanggalPanjang, tanggalSah } from "@/lib/absensi/tipe";
import { blokKelas, daftarKelasJadwal, hariDari, labelJam, SINGKAT_MAPEL, type StatusMapel } from "@/lib/jadwal/tipe";
import { JudulHalaman, Kartu, Kosong, Lencana } from "@/components/dasbor/ui";

export const instant = false;
export const metadata: Metadata = { title: "Rekap absen kelas" };

const WARNA_SEL: Record<StatusMapel, string> = {
  hadir: "text-brand",
  sakit: "bg-[#e8f0fb] text-[#1d5fa8]",
  izin: "bg-[#f0ebfa] text-[#6b4fb0]",
  alpa: "bg-[#fdeceb] text-[#b42318]",
};

export default async function RekapAbsenKelas({ searchParams }: PageProps<"/dashboard/absen-kelas/rekap">) {
  await connection();
  const p = await wajibMasuk("absen-kelas");
  const sp = await searchParams;
  const hariIni = tanggalIni();
  const tanggal = tanggalSah(sp.tanggal) && sp.tanggal <= hariIni ? sp.tanggal : hariIni;
  const jadwal = await bacaJadwal();
  const semuaKelas = daftarKelasJadwal(jadwal);
  const kelasWali = Object.entries(jadwal.wali).find(([, id]) => id === p.id)?.[0] ?? "";
  const kelas = typeof sp.kelas === "string" && semuaKelas.includes(sp.kelas) ? sp.kelas : kelasWali || semuaKelas[0] || "";
  const hari = hariDari(tanggal);
  const blok = hari && kelas ? blokKelas(jadwal, hari, kelas) : [];

  const [siswaSemua, pagi, sesiHari] = await Promise.all([bacaSiswa(), bacaAbsenTanggal(tanggal), bacaSesiTanggal(tanggal)]);
  const siswa = siswaSemua.filter((s) => s.aktif && s.kelas === kelas).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const petaPagi = new Map(pagi.map((c) => [c.siswaId, c.status]));
  const sesi = blok.map((b) => sesiHari.find((s) => s.kelas === kelas && s.jamMulai === b.jamMulai) ?? null);
  const belum = blok.filter((_, i) => !sesi[i]);

  // Bolos jam pelajaran: hadir di absen pagi tetapi alpa di kelas.
  const bolos = siswa
    .map((s) => ({
      s,
      mapel: blok.filter((_, i) => sesi[i]?.tidakHadir[s.id] === "alpa").map((b) => `${labelJam(b)} ${b.mapel}`),
    }))
    .filter((x) => x.mapel.length && masuk(petaPagi.get(x.s.id) ?? "alpa"));

  const bulan = tanggal.slice(0, 7);

  return (
    <>
      <JudulHalaman
        judul="Rekap absen kelas"
        ikon={Table2}
        deskripsi="Kehadiran siswa per jam pelajaran dalam satu hari. Merah tebal = hadir pagi tetapi alpa di kelas (bolos jam pelajaran)."
        jejak={[{ label: "Ringkasan", href: "/dashboard" }, { label: "Absen kelas", href: "/dashboard/absen-kelas" }, { label: "Rekap" }]}
      />
      <div className="flex flex-col gap-6">
        <form className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Tanggal</span>
            <input type="date" name="tanggal" className="d-input w-auto" defaultValue={tanggal} max={hariIni} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="d-label">Kelas</span>
            <select name="kelas" className="d-input w-auto min-w-[140px]" defaultValue={kelas}>
              {semuaKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                  {k === kelasWali ? " (kelas wali)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="d-btn d-btn-utama">
            Tampilkan
          </button>
          <div className="flex-1" />
          <a href={`/dashboard/absen-kelas/ekspor?bulan=${bulan}&kelas=${encodeURIComponent(kelas)}`} className="d-btn d-btn-garis">
            <Download size={16} aria-hidden="true" /> Unduh rekap bulan ini (Excel/CSV)
          </a>
        </form>

        {!hari ? (
          <Kartu>
            <Kosong ikon={Table2} judul="Hari Minggu" teks="Tidak ada jadwal pelajaran." />
          </Kartu>
        ) : (
          <>
            {(belum.length > 0 || bolos.length > 0) && (
              <div className="grid gap-3 lg:grid-cols-2">
                {belum.length > 0 && (
                  <div className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
                    <p className="font-semibold text-ink">Belum diisi guru ({belum.length})</p>
                    <ul className="mt-1 text-ink-2">
                      {belum.map((b) => (
                        <li key={b.jamMulai}>
                          {labelJam(b)} · {b.mapel} · {b.guru}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {bolos.length > 0 && (
                  <div className="rounded-2xl border border-[#f3c5c1] bg-[#fdeceb] px-4 py-3 text-sm">
                    <p className="font-semibold text-[#b42318]">Hadir pagi, tetapi alpa di kelas ({bolos.length})</p>
                    <ul className="mt-1 text-[#7a1a12]">
                      {bolos.map((x) => (
                        <li key={x.s.id}>
                          {x.s.nama}: {x.mapel.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Kartu judul={`Kelas ${kelas} · ${tanggalPanjang(tanggal)}`} deskripsi={`${siswa.length} siswa · H hadir, S sakit, I izin, A alpa, – belum diisi`} isiClassName="">
              {siswa.length === 0 ? (
                <Kosong ikon={Table2} judul="Belum ada siswa di kelas ini" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="d-tabel text-sm">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-[1] bg-white">Siswa</th>
                        <th className="text-center">Pagi</th>
                        {blok.map((b, i) => (
                          <th key={b.jamMulai} className="min-w-[6.5rem] text-center align-top font-normal">
                            <b className="block text-ink">{labelJam(b)}</b>
                            <span className="block text-xs text-ink-2">{b.mapel}</span>
                            {!sesi[i] && (
                              <span className="mt-1 inline-block">
                                <Lencana warna="merah">belum diisi</Lencana>
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {siswa.map((s) => {
                        const pg = petaPagi.get(s.id);
                        return (
                          <tr key={s.id}>
                            <td className="sticky left-0 z-[1] max-w-[14rem] bg-white">
                              <span className="block truncate font-medium text-ink">{s.nama}</span>
                            </td>
                            <td className="whitespace-nowrap text-center text-xs text-ink-2">{pg ? LABEL_STATUS[pg] : "—"}</td>
                            {blok.map((b, i) => {
                              const ss = sesi[i];
                              const st: StatusMapel | null = ss ? (ss.tidakHadir[s.id] ?? "hadir") : null;
                              const bolosIni = st === "alpa" && pg && masuk(pg);
                              return (
                                <td
                                  key={b.jamMulai}
                                  className={`text-center font-semibold ${st ? WARNA_SEL[st] : "text-muted"} ${bolosIni ? "ring-2 ring-inset ring-[#b42318]" : ""}`}
                                  title={bolosIni ? "Hadir pagi tetapi alpa di kelas" : undefined}
                                >
                                  {st ? SINGKAT_MAPEL[st] : "–"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Kartu>
          </>
        )}
        <p className="text-sm">
          <Link href="/dashboard/absen-kelas" className="text-brand underline-offset-2 hover:underline">
            ← Kembali ke absen kelas
          </Link>
        </p>
      </div>
    </>
  );
}
