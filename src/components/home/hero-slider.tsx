"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { apakahIlustrasi } from "@/lib/konten/util";
import { Contoh, LabelIlustrasi } from "@/components/ui/contoh";
import { cx } from "@/lib/format";
import { KetikUlang } from "@/components/ui/ketik-ulang";

export type SlideHero = {
  tab: string;
  judul: string;
  teks: string;
  gambar: string;
  alt: string;
  posisi?: string;
  /** Titik fokus khusus HP (layar tegak memotong sisi kiri-kanan gambar). */
  posisiHp?: string;
  aksi: { label: string; href: string };
  aksi2?: { label: string; href: string };
  contoh?: boolean;
  /** Video latar (tanpa suara). `gambar` tetap dipakai sebagai poster/cadangan.
   *  Seperti hero video Pertamina, judulnya sudah ada di dalam video, jadi teks situs disembunyikan. */
  video?: { besar: string; kecil?: string };
  /** Gambar berupa poster yang sudah memuat judul: teks situs disembunyikan, seluruh slide jadi tautan aksi. */
  poster?: boolean;
  /** Lama slide ini tampil (ms). Bawaan: durasi slider. */
  durasi?: number;
};

/** Video latar hero: hanya diputar saat slidenya aktif, berhenti saat dijeda atau di luar layar. */
function VideoHero({ video, poster, main, aktif }: { video: NonNullable<SlideHero["video"]>; poster: string; main: boolean; aktif: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [siap, setSiap] = useState(false);

  // Seperti Pertamina: setiap kali slide video dibuka, film diputar dari awal.
  useEffect(() => {
    const v = ref.current;
    if (v && aktif && v.readyState > 0) v.currentTime = 0;
  }, [aktif]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (main) {
      if (v.preload !== "auto") v.preload = "auto";
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [main]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setSiap(true)}
      className={cx(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
        siap ? "opacity-100" : "opacity-0",
      )}
    >
      {video.kecil ? <source src={video.kecil} type="video/mp4" media="(max-width: 767px)" /> : null}
      <source src={video.besar} type="video/mp4" />
    </video>
  );
}

const kueriGerak = "(prefers-reduced-motion: reduce)";
function langgananGerak(cb: () => void) {
  const mq = window.matchMedia(kueriGerak);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Hero layar penuh gaya pertamina.com: slide memudar, zoom pelan, tab progres di dasar. */
export function HeroSlider({ slides, durasi = 7000 }: { slides: SlideHero[]; durasi?: number }) {
  const [aktif, setAktif] = useState(0);
  const [putaran, setPutaran] = useState(0);
  const [jedaPengguna, setJedaPengguna] = useState<boolean | null>(null);
  const [terlihat, setTerlihat] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const gerakDikurangi = useSyncExternalStore(
    langgananGerak,
    () => window.matchMedia(kueriGerak).matches,
    () => false,
  );
  // Gerak dikurangi = tidak berputar otomatis, kecuali pengguna menekan putar.
  const jeda = jedaPengguna ?? gerakDikurangi;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pilih = (i: number) => {
    setAktif(i);
    setPutaran((p) => p + 1);
  };
  const lanjut = () => setAktif((i) => (i + 1) % slides.length);

  return (
    <section
      ref={ref}
      data-hero
      aria-roledescription="carousel"
      aria-label="Sorotan sekolah"
      data-paused={jeda || !terlihat}
      className="on-dark relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-brand-ink text-white"
    >
      {slides.map((s, i) => {
        const on = i === aktif;
        const Judul = i === 0 ? "h1" : "h2";
        return (
          <div
            key={`${i}-${s.judul}`}
            className="hero-slide absolute inset-0"
            data-active={on}
            aria-hidden={!on}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${slides.length}: ${s.tab}`}
          >
            <div className="absolute inset-0 -z-20 overflow-hidden">
              {s.poster ? (
                // Di HP poster ditampilkan utuh; latar diisi salinan buram poster yang sama.
                <Image src={s.gambar} alt="" aria-hidden="true" fill sizes="50vw" className="scale-110 object-cover blur-2xl brightness-75 md:hidden" />
              ) : null}
              <Image
                src={s.gambar}
                alt={s.alt}
                fill
                sizes="100vw"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className={cx("hero-media", s.poster ? "object-contain md:object-cover" : "object-cover")}
                style={{ "--pos": s.posisi ?? "center", "--pos-hp": s.posisiHp ?? s.posisi ?? "center" } as React.CSSProperties}
              />
              {s.video ? (
                <VideoHero video={s.video} poster={s.gambar} main={on && !jeda && terlihat && !gerakDikurangi} aktif={on} />
              ) : null}
            </div>
            <div className={cx(s.video || s.poster ? "scrim-video" : "scrim-hero", "absolute inset-0 -z-10")} aria-hidden="true" />
            {apakahIlustrasi(s.gambar) && (
              <LabelIlustrasi posisi="kanan-atas" className="top-[96px] lg:top-[124px]" />
            )}
            {s.poster ? (
              <Link
                href={s.aksi.href}
                tabIndex={on ? undefined : -1}
                aria-label={`${s.judul}. ${s.aksi.label}`}
                className="absolute inset-0"
              />
            ) : null}
            {s.video || s.poster ? (
              <div className="sr-only">
                <Judul>{s.judul}</Judul>
                <p>{s.teks}</p>
                <Link href={s.aksi.href} tabIndex={on ? undefined : -1}>
                  {s.aksi.label}
                </Link>
              </div>
            ) : (
            <div className="container-site flex h-full flex-col justify-end pb-[128px] md:pb-[168px]">
              <div className="hero-copy max-w-[44rem]">
                {s.contoh ? <Contoh className="mb-4" /> : null}
                <Judul className="text-display max-w-[15ch] text-white">
                  <JudulKetik judul={s.judul} aktif={on && !gerakDikurangi} />
                </Judul>
                <p className="mt-5 max-w-[46ch] text-lead text-white/88">{s.teks}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={s.aksi.href} className="btn-solid" tabIndex={on ? undefined : -1}>
                    {s.aksi.label}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  {s.aksi2 ? (
                    <Link href={s.aksi2.href} className="btn-pill" tabIndex={on ? undefined : -1}>
                      {s.aksi2.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            )}
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="container-site flex items-end gap-5 pb-7 md:pb-9">
          <div
            role="tablist"
            aria-label="Pilih sorotan"
            className="grid flex-1 gap-3 md:gap-5"
            style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
          >
            {slides.map((s, i) => {
              const on = i === aktif;
              return (
                <button
                  key={`${i}-${s.tab}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={s.tab}
                  data-active={on}
                  onClick={() => pilih(i)}
                  className="hero-tab group rounded-sm pt-3 text-left"
                  style={{ "--dur": `${s.durasi ?? durasi}ms` } as React.CSSProperties}
                >
                  <span
                    className={cx(
                      "hidden pb-3 text-[0.9375rem] leading-snug transition-colors duration-300 md:block",
                      on ? "font-medium text-white" : "text-white/60 group-hover:text-white",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "mr-2 inline-block h-2 w-2 rounded-full align-middle transition-colors duration-300",
                        on ? "bg-sun" : "bg-white/25",
                      )}
                    />
                    {s.tab}
                  </span>
                  <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25">
                    <span
                      key={on ? `on-${aktif}-${putaran}` : "idle"}
                      className="hero-bar absolute inset-0 rounded-full bg-white"
                      onAnimationEnd={
                        on
                          ? (e) => {
                              if (e.animationName === "hero-progress") lanjut();
                            }
                          : undefined
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setJedaPengguna(!jeda)}
            aria-label={jeda ? "Putar slider" : "Jeda slider"}
            className="btn-round h-10 w-10 shrink-0 border-white/50 text-white hover:bg-white hover:text-brand-ink"
          >
            {jeda ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/** Nama sekolah di judul hero diberi efek mengetik berulang; bagian judul lain tetap diam. */
const NAMA_KETIK = "SMAN 1 Brang Rea";
function JudulKetik({ judul, aktif }: { judul: string; aktif: boolean }) {
  const i = judul.indexOf(NAMA_KETIK);
  if (i < 0) return <>{judul}</>;
  return (
    <>
      {judul.slice(0, i)}
      <KetikUlang teks={NAMA_KETIK} aktif={aktif} />
      {judul.slice(i + NAMA_KETIK.length)}
    </>
  );
}
