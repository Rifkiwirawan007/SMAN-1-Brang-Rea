import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHead } from "@/components/ui/section-head";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { Contoh } from "@/components/ui/contoh";
import { IkonFacebook, IkonWhatsApp } from "@/components/ui/icons";
import { WaForm } from "@/components/kontak/wa-form";
import { ambilSekolah } from "@/lib/konten/baca";
import { mapsEmbed, mapsLink } from "@/lib/konten/util";
import { waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Alamat, WhatsApp, email, dan peta lokasi SMA Negeri 1 Brang Rea di Desa Beru, Brang Rea, Sumbawa Barat.",
};

export default async function Kontak() {
  const sekolah = await ambilSekolah();
  const kanal = [
    {
      ikon: <IkonWhatsApp size={22} />,
      judul: "WhatsApp",
      isi: sekolah.kontak.whatsappTampil,
      href: waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp),
      luar: true,
    },
    {
      ikon: <Mail size={22} aria-hidden="true" />,
      judul: "Email",
      isi: sekolah.kontak.email,
      href: `mailto:${sekolah.kontak.email}`,
      luar: false,
    },
    {
      ikon: <IkonFacebook size={22} />,
      judul: "Facebook",
      isi: sekolah.kontak.facebook,
      href: sekolah.kontak.facebookUrl,
      luar: true,
    },
    {
      ikon: <Phone size={22} aria-hidden="true" />,
      judul: "Telepon (tercatat di Dapodik)",
      isi: sekolah.kontak.dapodikTelepon,
      href: `tel:${sekolah.kontak.dapodikTelepon}`,
      luar: false,
    },
  ].filter((k) => k.isi); // saluran yang datanya kosong di dashboard tidak ditampilkan

  return (
    <>
      <PageHero
        judul="Hubungi kami"
        teks="Datang langsung, telepon, atau kirim pesan WhatsApp ke sekolah."
        gambar="/images/sekolah/apel-guru.jpg"
        alt="Guru dan tenaga kependidikan di depan gedung SMAN 1 Brang Rea"
        jejak={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
      />

      <section aria-labelledby="judul-kanal" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-kanal"
            judul="Saluran resmi sekolah"
            teks={<p>Pilih saluran yang paling mudah. Untuk urusan administrasi, sertakan nama lengkap dan kelas atau tahun lulus.</p>}
          />
          <CarouselRail
            ariaLabel="Saluran kontak resmi sekolah"
            wrapClassName="mt-10 lg:mt-12"
            className="lg:grid lg:grid-cols-4 lg:gap-4"
          >
            {kanal.map((k, i) => (
              <li
                key={k.judul}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="w-[min(78vw,280px)] shrink-0 sm:w-[300px] lg:w-auto"
              >
                <a
                  href={k.href}
                  target={k.luar ? "_blank" : undefined}
                  rel={k.luar ? "noopener noreferrer" : undefined}
                  className="group flex h-full flex-col rounded-[14px] border border-line bg-paper p-6 transition-colors duration-300 hover:border-brand hover:bg-brand hover:text-white sm:p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
                    {k.ikon}
                  </span>
                  <span className="mt-6 text-sm text-muted transition-colors duration-300 group-hover:text-white/80">{k.judul}</span>
                  <span className="mt-1 break-words font-semibold text-ink transition-colors duration-300 group-hover:text-white">{k.isi}</span>
                </a>
              </li>
            ))}
          </CarouselRail>
          <p className="mt-6 text-sm text-muted">
            {sekolah.kontak.dapodikEmail ? `Data Dapodik juga mencatat email ${sekolah.kontak.dapodikEmail}. ` : null}
            Nomor WhatsApp dan email di atas diambil dari unggahan resmi sekolah.
          </p>
        </div>
      </section>

      <section aria-labelledby="judul-alamat" className="section-y bg-paper-2">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="judul-alamat" data-reveal className="text-h2">
              Alamat dan jam layanan
            </h2>
            <ul data-reveal className="mt-8 flex flex-col gap-6 text-ink-2">
              <li className="flex gap-4">
                <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                <span>{sekolah.alamat.lengkap}</span>
              </li>
              {sekolah.jamLayanan.length > 0 && (
                <li className="flex gap-4">
                  <Clock size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                  <span className="flex flex-col gap-1">
                    {sekolah.jamLayanan.map((j, i) => (
                      <span key={i}>{`${j.hari} ${j.jam}`.trim()}</span>
                    ))}
                    <Contoh className="mt-1 self-start" />
                  </span>
                </li>
              )}
            </ul>
            <a href={mapsLink(sekolah)} target="_blank" rel="noopener noreferrer" className="btn-pill mt-10" data-reveal>
              <Navigation size={18} aria-hidden="true" />
              Buka di Google Maps
            </a>
          </div>
          <div data-reveal className="relative min-h-[380px] overflow-hidden rounded-[14px] border border-line bg-paper-3 lg:min-h-[480px]">
            <iframe
              title={`Peta lokasi ${sekolah.nama}`}
              src={mapsEmbed(sekolah)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>

      <section id="pesan" aria-labelledby="judul-pesan" className="section-y">
        <div className="container-site">
          <SectionHead
            id="judul-pesan"
            judul="Kirim pesan lewat WhatsApp"
            teks={<p>Tulis pertanyaan di formulir. Pesan tersusun rapi, lalu Anda kirim sendiri dari aplikasi WhatsApp.</p>}
          />
          <div className="mt-12 rounded-[18px] border border-line bg-paper p-6 shadow-card md:p-10">
            <WaForm />
          </div>
        </div>
      </section>
    </>
  );
}
