import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Sembunyikan ikon "N" Next.js di pojok kiri bawah (hanya muncul saat development).
  devIndicators: false,
  // Halaman buletin ditampilkan dengan kualitas 90 agar teks koran tetap tajam;
  // 60/70 dipakai foto latar samar dan banner halaman yang tidak butuh detail.
  images: {
    qualities: [60, 70, 75, 90],
    formats: ["image/avif", "image/webp"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
