import type { MetadataRoute } from "next";
import { ambilBerita } from "@/lib/konten/baca";
import { URL_SITUS } from "@/lib/situs-url";

const HALAMAN = ["", "/profil", "/akademik", "/kesiswaan", "/berita", "/galeri", "/spmb", "/kontak", "/cek-absen"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const berita = await ambilBerita();
  return [
    ...HALAMAN.map((h) => ({
      url: `${URL_SITUS}${h}`,
      changeFrequency: (h === "" || h === "/berita" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: h === "" ? 1 : 0.7,
    })),
    ...berita.map((b) => ({
      url: `${URL_SITUS}/berita/${b.slug}`,
      lastModified: b.tanggal ? new Date(b.tanggal) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
