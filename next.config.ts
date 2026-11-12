import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Sembunyikan ikon "N" Next.js di pojok kiri bawah (hanya muncul saat development).
  devIndicators: false,
  // Halaman buletin ditampilkan dengan kualitas 90 agar teks koran tetap tajam.
  images: { qualities: [75, 90] },
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
