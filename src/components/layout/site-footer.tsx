import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { MENU_UTAMA } from "@/data/navigasi";
import { IkonFacebook, IkonInstagram, IkonWhatsApp } from "@/components/ui/icons";
import { waLink } from "@/lib/format";
import type { Sekolah } from "@/lib/konten/tipe";
import { WordmarkFooter } from "@/components/ui/wordmark-footer";
import { SobekanKertas } from "@/components/layout/sobekan-kertas";

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

/** Footer situs publik: tepi kertas sobek, latar hijau bertekstur rumput, kolom tautan + tulisan besar "BAREMA". */
export function SiteFooter({ sekolah }: { sekolah: Sekolah }) {
  const tahun = 2026;
  const ikon = "grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ink-2 transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white";
  return (
    <WordmarkFooter
      name="BAREMA"
      legalName={`${sekolah.nama}. Hak cipta dilindungi.`}
      year={tahun}
      navLabel="Tautan footer"
      className="footer-rumput"
      hiasanAtas={<SobekanKertas />}
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
            href={sekolah.kontak.instagramUrl || "https://www.instagram.com/sman1brangrea/"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram SMAN 1 Brang Rea"
            className={ikon}
          >
            <IkonInstagram size={18} />
          </a>
          <a
            href={sekolah.kontak.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Facebook ${sekolah.kontak.facebook}`}
            className={ikon}
          >
            <IkonFacebook size={18} />
          </a>
          <a
            href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp sekolah"
            className={ikon}
          >
            <IkonWhatsApp size={18} />
          </a>
          <a href={`mailto:${sekolah.kontak.email}`} aria-label="Email sekolah" className={ikon}>
            <Mail size={17} aria-hidden="true" />
          </a>
        </div>
      }
    />
  );
}
