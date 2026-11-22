import { penggunaSaatIni } from "@/lib/server/pengguna";
import { boleh } from "@/lib/cms/peran";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaSesiBulan } from "@/lib/server/jadwal";
import { bulanSah, tanggalIni } from "@/lib/absensi/tipe";
import { labelJam, LABEL_MAPEL } from "@/lib/jadwal/tipe";

const sel = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

/**
 * Rekap absen kelas satu bulan (CSV, pemisah titik koma, UTF-8 + BOM agar rapi di Excel).
 * Bagian 1: jumlah sakit/izin/alpa per siswa per mapel. Bagian 2: rincian setiap ketidakhadiran.
 */
export async function GET(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "absen-kelas")) return new Response("Tidak diizinkan", { status: 401 });

  const q = new URL(request.url).searchParams;
  const bulan = bulanSah(q.get("bulan")) ? q.get("bulan")! : tanggalIni().slice(0, 7);
  const kelas = q.get("kelas") ?? "";
  const sesi = (await bacaSesiBulan(bulan))
    .filter((s) => !kelas || s.kelas === kelas)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.kelas.localeCompare(b.kelas, "id", { numeric: true }) || a.jamMulai - b.jamMulai);
  const siswa = (await bacaSiswa()).filter((s) => !kelas || s.kelas === kelas);
  const nama = new Map(siswa.map((s) => [s.id, s]));

  // Rekap per siswa × mapel
  const rekap = new Map<string, { sakit: number; izin: number; alpa: number; sesi: number }>();
  const mapelKelas = new Map<string, Set<string>>();
  for (const s of sesi) {
    if (!mapelKelas.has(s.kelas)) mapelKelas.set(s.kelas, new Set());
    mapelKelas.get(s.kelas)!.add(s.mapel);
    for (const sw of siswa.filter((x) => x.kelas === s.kelas && x.aktif)) {
      const k = `${sw.id}|${s.mapel}`;
      const r = rekap.get(k) ?? { sakit: 0, izin: 0, alpa: 0, sesi: 0 };
      r.sesi++;
      const st = s.tidakHadir[sw.id];
      if (st) r[st]++;
      rekap.set(k, r);
    }
  }

  const baris: string[] = [[`Rekap absen kelas ${bulan}${kelas ? ` kelas ${kelas}` : ""}`].map(sel).join(";"), ""];
  baris.push(["Nama", "Kelas", "NISN", "Mata pelajaran", "Jumlah pertemuan", "Sakit", "Izin", "Alpa"].map(sel).join(";"));
  for (const sw of [...siswa].filter((s) => s.aktif).sort((a, b) => a.kelas.localeCompare(b.kelas, "id", { numeric: true }) || a.nama.localeCompare(b.nama, "id"))) {
    for (const m of [...(mapelKelas.get(sw.kelas) ?? [])].sort()) {
      const r = rekap.get(`${sw.id}|${m}`);
      if (!r) continue;
      baris.push([sw.nama, sw.kelas, `="${sw.nisn}"`, m, r.sesi, r.sakit, r.izin, r.alpa].map(sel).join(";"));
    }
  }
  baris.push("", ["Rincian ketidakhadiran"].map(sel).join(";"));
  baris.push(["Tanggal", "Kelas", "Jam", "Mata pelajaran", "Guru", "Nama", "NISN", "Status", "Diisi oleh"].map(sel).join(";"));
  for (const s of sesi) {
    for (const [id, st] of Object.entries(s.tidakHadir)) {
      const sw = nama.get(id);
      if (!sw) continue;
      baris.push([s.tanggal, s.kelas, labelJam(s), s.mapel, s.guruJadwal, sw.nama, `="${sw.nisn}"`, LABEL_MAPEL[st], s.oleh.nama].map(sel).join(";"));
    }
  }

  return new Response(`\uFEFF${baris.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="absen-kelas-${bulan}${kelas ? `-${kelas}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
