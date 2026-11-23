import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { MENU_UTAMA } from "@/data/navigasi";
import { IkonFacebook, IkonInstagram, IkonWhatsApp } from "@/components/ui/icons";
import { waLink } from "@/lib/format";
import type { Sekolah } from "@/lib/konten/tipe";
import { WordmarkFooter } from "@/components/ui/wordmark-footer";

const KOLOM = [
  ...MENU_UTAMA.filter((m) => m.anak).map((m) => ({
    judul: m.label,
    tautan: [{ label: `Halaman ${m.label.toLowerCase()}`, href: m.href }, ...m.anak!],
  })),
  {
    judul: "Informasi",
    tautan: [
      { label: "Berita", href: "/berita" },
      { label: "Pengumuman", href: "/berita#pengumuman" },
      { label: "Agenda", href: "/berita#agenda" },
      { label: "Galeri", href: "/galeri" },
      { label: "SPMB", href: "/spmb" },
      { label: "Kontak", href: "/kontak" },
    ],
  },
];

/** Footer situs publik: latar hijau tua bergaris vertikal halus + bintik, kolom tautan + tulisan besar "BAREMA". */
export function SiteFooter({ sekolah }: { sekolah: Sekolah }) {
  const tahun = 2026;
  const ikon =
    "grid h-11 w-11 place-items-center rounded-full text-white shadow-[0_8px_18px_-6px_rgb(15_30_22/0.35)] transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110";
  return (
    <WordmarkFooter
      name="BAREMA"
      legalName={`${sekolah.nama}. Hak cipta dilindungi.`}
      year={tahun}
      navLabel="Tautan footer"
      className="footer-rumput"
      description="Sekolah menengah atas negeri di Kecamatan Brang Rea, Sumbawa Barat. Mendidik generasi yang berkarakter dan berprestasi."
      columns={KOLOM.map((k) => ({ title: k.judul, links: k.tautan.map((t) => ({ label: t.label, href: t.href })) }))}
      credit={{ label: sekolah.tagar, href: "/" }}
      brand={
        <Link href="/" className="flex items-center gap-3 rounded-lg">
          <Image src="/images/logo-sman1brangrea.png" alt="" width={48} height={48} className="h-12 w-12" />
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-[-0.015em] text-ink">{sekolah.nama}</span>
            <span className="block text-sm text-muted">NPSN {sekolah.npsn}</span>
          </span>
        </Link>
      }
      aside={
        <div className="mt-6 flex items-center gap-3">
          <a
            href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp sekolah"
            className={`${ikon} bg-[#5fcf6f]`}
          >
            <IkonWhatsApp size={22} />
          </a>
          <a
            href={sekolah.kontak.instagramUrl || "https://www.instagram.com/sman1brangrea/"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram SMAN 1 Brang Rea"
            className={`${ikon} bg-[#d1416a]`}
          >
            <IkonInstagram size={22} />
          </a>
          <a
            href={sekolah.kontak.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Facebook ${sekolah.kontak.facebook}`}
            className={`${ikon} bg-[#2f63f0]`}
          >
            <IkonFacebook size={22} />
          </a>
          <a href={`mailto:${sekolah.kontak.email}`} aria-label="Email sekolah" className={`${ikon} bg-[#f28c00]`}>
            <Mail size={20} aria-hidden="true" />
          </a>
        </div>
      }
    />
  );
}
