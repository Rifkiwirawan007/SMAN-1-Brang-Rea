import { promises as fs } from "node:fs";
import path from "node:path";
import { fileDariUrl } from "@/lib/server/media";

const JENIS: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

/** Sajikan foto unggahan dashboard dari data/unggahan/ (nama file unik, jadi aman di-cache lama). */
export async function GET(_req: Request, { params }: RouteContext<"/media/[...path]">) {
  const { path: bagian } = await params;
  const file = fileDariUrl(`/media/${bagian.join("/")}`);
  const jenis = file ? JENIS[path.extname(file).toLowerCase()] : undefined;
  if (!file || !jenis) return new Response("Tidak ditemukan", { status: 404 });
  try {
    const isi = await fs.readFile(file);
    return new Response(new Uint8Array(isi), {
      headers: {
        "content-type": jenis,
        "content-length": String(isi.length),
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Tidak ditemukan", { status: 404 });
  }
}
