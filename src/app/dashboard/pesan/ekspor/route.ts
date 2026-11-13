import { penggunaSaatIni } from "@/lib/server/pengguna";
import { bacaSemuaPesan } from "@/lib/server/pesan";
import { boleh } from "@/lib/cms/peran";
import { tanggalWita } from "@/lib/server/kunjungan";

const sel = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

/** Unduh pesan masuk sebagai CSV (pemisah titik koma, UTF-8 + BOM agar rapi di Excel berbahasa Indonesia). */
export async function GET(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "pesan")) return new Response("Tidak diizinkan", { status: 401 });

  const q = new URL(request.url).searchParams;
  const status = q.get("status");
  const jenis = q.get("jenis");
  const pesan = (await bacaSemuaPesan()).filter((m) => (!status || m.status === status) && (!jenis || m.jenis === jenis));

  const waktu = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(iso));
  const baris = [
    ["Waktu (WITA)", "Jenis", "Status", "Nama", "Sebagai", "Keperluan", "No. WhatsApp", "Pesan", "Catatan petugas", "Halaman"].map(sel).join(";"),
    ...pesan.map((m) =>
      [waktu(m.waktu), m.jenis === "spmb" ? "SPMB" : "Kontak", m.status, m.nama, m.peran, m.keperluan, m.telepon, m.isi, m.catatan, m.halaman].map(sel).join(";"),
    ),
  ];

  return new Response("\uFEFF" + baris.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="pesan-masuk-${tanggalWita()}.csv"`,
      "cache-control": "no-store",
    },
  });
}
