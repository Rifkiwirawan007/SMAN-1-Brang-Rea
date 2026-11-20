import { penggunaSaatIni } from "@/lib/server/pengguna";
import { bacaIzinRentang } from "@/lib/server/izin-keluar";
import { boleh } from "@/lib/cms/peran";
import { jamWita, tanggalIni, tanggalSah } from "@/lib/absensi/tipe";

const sel = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

/** Unduh rekap izin keluar sebagai CSV (pemisah titik koma, UTF-8 + BOM agar rapi di Excel). */
export async function GET(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "izin-keluar")) return new Response("Tidak diizinkan", { status: 401 });

  const q = new URL(request.url).searchParams;
  const hariIni = tanggalIni();
  const sampai = tanggalSah(q.get("sampai")) ? q.get("sampai")! : hariIni;
  const dari = tanggalSah(q.get("dari")) && q.get("dari")! <= sampai ? q.get("dari")! : sampai;
  const kelas = q.get("kelas") ?? "";
  const izin = (await bacaIzinRentang(dari, sampai)).filter((z) => !kelas || z.siswa.kelas === kelas).reverse();

  const baris = [
    ["No. resi", "Tanggal", "Jam keluar (WITA)", "Nama", "Kelas", "NISN", "Keperluan", "Diberi izin oleh", "Status"].map(sel).join(";"),
    // NISN ditulis ="0081..." supaya Excel tidak membuang angka 0 di depan.
    ...izin.map((z) =>
      [z.nomor, z.tanggal, jamWita(z.jamKeluar), z.siswa.nama, z.siswa.kelas, `="${z.siswa.nisn}"`, z.keperluan, z.oleh.nama, z.batal ? `Dibatalkan (${z.batal.oleh})` : "Keluar"]
        .map(sel)
        .join(";"),
    ),
  ];

  const nama = dari === sampai ? dari : `${dari}_sd_${sampai}`;
  return new Response("\uFEFF" + baris.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="izin-keluar-${nama}${kelas ? `-${kelas.replace(/[^\w-]+/g, "")}` : ""}.csv"`,
      "cache-control": "no-store",
    },
  });
}
