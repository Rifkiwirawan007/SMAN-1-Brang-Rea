import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ambilSekolah } from "@/lib/konten/baca";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  // 800 hanya dipakai tulisan BAREMA di layar pemuat; file font variabelnya sama, jadi tidak menambah unduhan.
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const sekolah = await ambilSekolah();
  return {
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
      images: [
        {
          url: "/images/hero-sekolah-baru.jpg",
          width: 1200,
          height: 630,
          alt: sekolah.nama,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#34724c",
};

// Pasang kelas .js sebelum cat pertama (animasi muncul aktif hanya bila JS jalan),
// dan cabut lagi bila React gagal memuat, supaya konten tidak pernah tersembunyi.
// .pemuat-aktif: layar pemuat (BAREMA di beranda, tiga titik di halaman lain) sedang tampil;
// hero & reveal menunggu sampai LayarPemuat melepasnya. Halaman tanpa pemuat (dashboard, 404)
// langsung melepasnya begitu HTML selesai diurai.
const skripAwal = `var h=document.documentElement;h.classList.add('js','pemuat-aktif');document.addEventListener('DOMContentLoaded',function(){if(!document.querySelector('.pemuat'))h.classList.remove('pemuat-aktif')});setTimeout(function(){if(!window.__revealReady){h.classList.remove('js','pemuat-aktif')}},3500);`;

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
