import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RevealObserver } from "@/components/layout/reveal-observer";
import { SEKOLAH } from "@/data/sekolah";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SEKOLAH.nama} | Sumbawa Barat`,
    template: `%s | ${SEKOLAH.namaPendek}`,
  },
  description:
    "Laman resmi SMA Negeri 1 Brang Rea, Desa Beru, Kecamatan Brang Rea, Kabupaten Sumbawa Barat, Nusa Tenggara Barat: profil, akademik, kesiswaan, berita, galeri, dan SPMB.",
  applicationName: SEKOLAH.namaPendek,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SEKOLAH.nama,
  },
};

export const viewport: Viewport = {
  themeColor: "#34724c",
};

// Pasang kelas .js sebelum cat pertama (animasi muncul aktif hanya bila JS jalan),
// dan cabut lagi bila React gagal memuat, supaya konten tidak pernah tersembunyi.
const skripAwal = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealReady){document.documentElement.classList.remove('js')}},3500);`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={jakarta.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripAwal }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
