import { penggunaSaatIni } from "@/lib/server/pengguna";
import { boleh } from "@/lib/cms/peran";
import { GalatMedia, simpanUnggahan } from "@/lib/server/media";
import { catatAktivitas } from "@/lib/server/aktivitas";

/** Unggah satu foto dari dashboard. Body: multipart/form-data dengan kolom "berkas". */
export async function POST(request: Request) {
  const p = await penggunaSaatIni();
  if (!p || !boleh(p.peran, "media")) return Response.json({ pesan: "Sesi berakhir. Silakan masuk lagi." }, { status: 401 });

  // Tolak unggahan dari situs lain (CSRF): asal permintaan harus sama dengan host server ini.
  const asal = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (asal && host && new URL(asal).host !== host) return Response.json({ pesan: "Permintaan ditolak." }, { status: 403 });

  let berkas: FormDataEntryValue | null;
  try {
    berkas = (await request.formData()).get("berkas");
  } catch {
    return Response.json({ pesan: "Berkas tidak terbaca." }, { status: 400 });
  }
  if (!(berkas instanceof File) || berkas.size === 0) return Response.json({ pesan: "Pilih foto terlebih dahulu." }, { status: 400 });

  try {
    const hasil = await simpanUnggahan(berkas);
    await catatAktivitas(p, "unggah", "media", { target: hasil.url, ket: berkas.name });
    return Response.json(hasil);
  } catch (e) {
    if (e instanceof GalatMedia) return Response.json({ pesan: e.message }, { status: 400 });
    console.error(e);
    return Response.json({ pesan: "Gagal memproses foto. Coba foto lain." }, { status: 500 });
  }
}
