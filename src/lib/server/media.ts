import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { DIR_KONTEN, DIR_UNGGAHAN } from "@/lib/server/penyimpanan";
import { jadikanSlug } from "@/lib/konten/util";

/**
 * Foto unggahan dashboard disimpan di data/unggahan/TAHUN/BULAN/nama-acak.webp dan disajikan lewat /media/...
 * (bukan public/, karena file yang ditambahkan ke public/ setelah build tidak disajikan oleh `next start`).
 */
const DIR_PUBLIC = path.join(process.cwd(), "public");
export const MAKS_BYTE = 15 * 1024 * 1024;
const SISI_MAKS = 2400;

export type BerkasMedia = {
  url: string;
  nama: string;
  ukuran: number;
  diubah: string;
  sumber: "unggahan" | "situs";
};

export type HasilUnggah = { url: string; lebar: number; tinggi: number; ukuran: number; nama: string };

export class GalatMedia extends Error {}

export async function simpanUnggahan(berkas: File): Promise<HasilUnggah> {
  if (berkas.size > MAKS_BYTE) throw new GalatMedia("Ukuran foto maksimal 15 MB.");
  const masukan = Buffer.from(await berkas.arrayBuffer());

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(masukan).metadata();
  } catch {
    throw new GalatMedia("Berkas bukan gambar yang bisa dibaca. Gunakan JPG, PNG, atau WebP.");
  }
  if (!meta.format || !["jpeg", "png", "webp", "gif", "avif", "tiff"].includes(meta.format)) {
    throw new GalatMedia(`Format ${meta.format ?? "ini"} belum didukung. Ubah ke JPG atau PNG lalu unggah lagi.`);
  }

  const { data, info } = await sharp(masukan, { animated: false })
    .rotate()
    .resize({ width: SISI_MAKS, height: SISI_MAKS, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const kini = new Date();
  const sub = path.join(String(kini.getFullYear()), String(kini.getMonth() + 1).padStart(2, "0"));
  const dasar = jadikanSlug(berkas.name.replace(/\.[^.]+$/, "")).slice(0, 50) || "foto";
  const nama = `${dasar}-${randomBytes(3).toString("hex")}.webp`;
  await fs.mkdir(path.join(DIR_UNGGAHAN, sub), { recursive: true });
  await fs.writeFile(path.join(DIR_UNGGAHAN, sub, nama), data);

  return {
    url: `/media/${sub.split(path.sep).join("/")}/${nama}`,
    lebar: info.width,
    tinggi: info.height,
    ukuran: data.length,
    nama,
  };
}

/** Ubah URL situs (/media/... atau /images/...) menjadi path file di disk, atau null bila tidak sah. */
export function fileDariUrl(url: string): string | null {
  const bersih = decodeURIComponent(url.split(/[?#]/)[0]);
  let dasar: string;
  let rel: string;
  if (bersih.startsWith("/media/")) {
    dasar = DIR_UNGGAHAN;
    rel = bersih.slice("/media/".length);
  } else if (bersih.startsWith("/")) {
    dasar = DIR_PUBLIC;
    rel = bersih.slice(1);
  } else return null;
  const penuh = path.resolve(dasar, rel);
  if (!penuh.startsWith(dasar + path.sep)) return null;
  return penuh;
}

/** Ukuran asli gambar (piksel), untuk galeri. */
export async function ukuranGambar(url: string): Promise<{ w: number; h: number } | null> {
  const file = fileDariUrl(url);
  if (!file) return null;
  try {
    const m = await sharp(file).metadata();
    if (!m.width || !m.height) return null;
    const putar = (m.orientation ?? 1) >= 5;
    return putar ? { w: m.height, h: m.width } : { w: m.width, h: m.height };
  } catch {
    return null;
  }
}

const EKSTENSI_GAMBAR = /\.(jpe?g|png|webp|gif|avif)$/i;

async function jelajah(dir: string, awalanUrl: string, sumber: BerkasMedia["sumber"], hasil: BerkasMedia[]) {
  let isi: import("node:fs").Dirent[];
  try {
    isi = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of isi) {
    if (e.name.startsWith(".")) continue;
    const penuh = path.join(dir, e.name);
    if (e.isDirectory()) await jelajah(penuh, `${awalanUrl}/${e.name}`, sumber, hasil);
    else if (EKSTENSI_GAMBAR.test(e.name)) {
      const st = await fs.stat(penuh);
      hasil.push({ url: `${awalanUrl}/${e.name}`, nama: e.name, ukuran: st.size, diubah: st.mtime.toISOString(), sumber });
    }
  }
}

/** Semua foto: unggahan dashboard + foto bawaan situs (public/images). Terbaru dulu. */
export async function daftarMedia(): Promise<BerkasMedia[]> {
  const hasil: BerkasMedia[] = [];
  await jelajah(DIR_UNGGAHAN, "/media", "unggahan", hasil);
  await jelajah(path.join(DIR_PUBLIC, "images"), "/images", "situs", hasil);
  return hasil.sort((a, b) => b.diubah.localeCompare(a.diubah));
}

/** Modul konten yang memakai URL ini (dicari di semua file data/konten/*.json). */
export async function pemakaianMedia(url: string): Promise<string[]> {
  const file = await fs.readdir(DIR_KONTEN).catch(() => [] as string[]);
  const dipakai: string[] = [];
  for (const f of file) {
    if (!f.endsWith(".json")) continue;
    const teks = await fs.readFile(path.join(DIR_KONTEN, f), "utf8");
    if (teks.includes(`"${url}"`)) dipakai.push(f.replace(/\.json$/, ""));
  }
  return dipakai;
}

/** Hapus foto unggahan (foto bawaan situs tidak bisa dihapus dari dashboard). */
export async function hapusMedia(url: string) {
  if (!url.startsWith("/media/")) throw new GalatMedia("Foto bawaan situs tidak bisa dihapus dari dashboard.");
  const file = fileDariUrl(url);
  if (!file) throw new GalatMedia("Alamat foto tidak sah.");
  const dipakai = await pemakaianMedia(url);
  if (dipakai.length) throw new GalatMedia(`Foto masih dipakai di: ${dipakai.join(", ")}. Lepas dulu dari konten tersebut.`);
  await fs.unlink(file);
}
