import type { Metadata } from "next";

/**
 * Aplikasi BAREMA (ikon di layar HP guru). Manifest hanya dipasang di halaman masuk & dashboard,
 * jadi pengunjung situs publik tidak ditawari memasangnya.
 */
export const META_APLIKASI: Pick<Metadata, "manifest" | "appleWebApp" | "icons"> = {
  manifest: "/barema.webmanifest",
  appleWebApp: { capable: true, title: "BAREMA", statusBarStyle: "default" },
  icons: { icon: "/aplikasi/ikon-192.png", apple: "/aplikasi/apple-180.png" },
};
