import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Mail, MapPin } from "lucide-react";
import { MENU_UTAMA } from "@/data/navigasi";
import { IkonFacebook, IkonWhatsApp } from "@/components/ui/icons";
import { waLink } from "@/lib/format";
import { mapsLink } from "@/lib/konten/util";
import type { Sekolah } from "@/lib/konten/tipe";

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

/** Footer situs publik (komponen server). Data sekolah dikirim dari KerangkaSitus. */
export function SiteFooter({ sekolah }: { sekolah: Sekolah }) {
  const tahun = 2026;
  return (
    <footer className="border-t border-line bg-paper-2 text-ink-2">
      <div className="container-site pt-16 md:pt-20">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex flex-col items-center gap-3 rounded-lg sm:flex-row sm:gap-4">
            <Image src="/images/logo-sman1brangrea.png" alt="" width={64} height={64} className="h-16 w-16" />
            <span className="text-left leading-tight">
              <span className="block text-xl font-bold tracking-[-0.015em] text-ink">{sekolah.nama}</span>
              <span className="block text-sm text-muted">NPSN {sekolah.npsn}</span>
            </span>
          </Link>
          <p className="mt-6 flex max-w-[60ch] items-start justify-center gap-2 text-[0.9375rem]">
            <MapPin size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand" />
            <span>
              <span className="font-semibold text-ink">Alamat: </span>
              <a href={mapsLink(sekolah)} target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">
                {sekolah.alamat.lengkap}
              </a>
            </span>
          </p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.9375rem]">
            <a href={`mailto:${sekolah.kontak.email}`} className="flex items-center gap-2 hover:text-brand">
              <Mail size={18} aria-hidden="true" className="text-brand" />
              {sekolah.kontak.email}
            </a>
            <a
              href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand"
            >
              <IkonWhatsApp size={18} className="text-brand" />
              {sekolah.kontak.whatsappTampil}
            </a>
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 border-t border-line pt-6 md:grid-cols-2 md:pt-12 lg:grid-cols-4">
          {KOLOM.map((k) => (
            <details key={k.judul} className="group border-b border-line md:border-0" open>
              <summary className="flex cursor-pointer items-center justify-between py-4 font-semibold text-ink md:pointer-events-none md:py-0 md:pb-4">
                {k.judul}
                <ChevronDown size={18} aria-hidden="true" className="chev text-muted md:hidden" />
              </summary>
              <ul className="flex flex-col gap-2.5 pb-5 text-[0.9375rem]">
                {k.tautan.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="transition-colors duration-200 hover:text-brand">
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-line">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {tahun} {sekolah.nama}. Hak cipta dilindungi.
          </p>
          <p className="font-semibold text-brand">{sekolah.tagar}</p>
          <div className="flex items-center gap-5">
            <a href={sekolah.kontak.instagramUrl || "https://www.instagram.com/sman1brangrea/"} target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">
              Instagram
            </a>
            <a
              href={sekolah.kontak.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Facebook ${sekolah.kontak.facebook}`}
              className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ink-2 transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white"
            >
              <IkonFacebook size={18} />
            </a>
            <a
              href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp sekolah"
              className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ink-2 transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white"
            >
              <IkonWhatsApp size={18} />
            </a>
            <a
              href={`mailto:${sekolah.kontak.email}`}
              aria-label="Email sekolah"
              className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ink-2 transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white"
            >
              <Mail size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
