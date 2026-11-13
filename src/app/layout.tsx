import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ambilSekolah } from "@/lib/konten/baca";
import { URL_SITUS } from "@/lib/situs-url";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const sekolah = await ambilSekolah();
  return {
    metadataBase: new URL(URL_SITUS),
    title: {
      default: `${sekolah.nama} | Sumbawa Barat`,
      template: `%s | ${sekolah.namaPendek}`,
    },
    description:
      "Laman resmi SMA Negeri 1 Brang Rea, Desa Beru, Kecamatan Brang Rea, Kabupaten Sumbawa Barat, Nusa Tenggara Barat: profil, akademik, kesiswaan, berita, galeri, dan SPMB.",
    applicationName: sekolah.namaPendek,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: sekolah.nama,
      images: [{ url: "/images/hero-sekolah-baru.jpg", width: 1672, height: 941, alt: sekolah.nama }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#34724c",
};

// Pasang kelas .js sebelum cat pertama (animasi muncul aktif hanya bila JS jalan),
// dan cabut lagi bila React gagal memuat, supaya konten tidak pernah tersembunyi.
const skripAwal = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealReady){document.documentElement.classList.remove('js')}},3500);`;

// Header/footer situs publik ada di app/(situs)/layout.tsx, sehingga halaman admin tidak ikut memakainya.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={jakarta.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripAwal }} />
      </head>
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  );
}
