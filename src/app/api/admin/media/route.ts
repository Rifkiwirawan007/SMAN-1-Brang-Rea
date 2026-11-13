import { penggunaSaatIni } from "@/lib/server/pengguna";
import { boleh } from "@/lib/cms/peran";
import { daftarMedia, GalatMedia, hapusMedia, pemakaianMedia } from "@/lib/server/media";
import { catatAktivitas } from "@/lib/server/aktivitas";

/** Daftar semua foto (unggahan + bawaan situs) untuk pemilih media. */
export async function GET(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "media")) return Response.json({ pesan: "Sesi berakhir." }, { status: 401 });
  const url = new URL(request.url).searchParams.get("pakai");
  if (url) return Response.json({ dipakai: await pemakaianMedia(url) });
  return Response.json({ berkas: await daftarMedia() });
}

/** Hapus foto unggahan yang tidak dipakai. Query: ?url=/media/... */
export async function DELETE(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "media")) return Response.json({ pesan: "Sesi berakhir." }, { status: 401 });
  const url = new URL(request.url).searchParams.get("url") ?? "";
  try {
    await hapusMedia(url);
    await catatAktivitas(p, "hapus", "media", { target: url });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof GalatMedia) return Response.json({ pesan: e.message }, { status: 400 });
    return Response.json({ pesan: "Gagal menghapus foto." }, { status: 500 });
  }
}
