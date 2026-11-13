"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { MENU_ATAS, MENU_UTAMA, type MenuNav } from "@/data/navigasi";
import { useSekolah } from "@/components/situs/konteks";
import { IkonWhatsApp } from "@/components/ui/icons";
import { cx, waLink } from "@/lib/format";

function PathnameSync({ onChange }: { onChange: (p: string) => void }) {
  const p = usePathname();
  useEffect(() => {
    onChange(p);
  }, [p, onChange]);
  return null;
}

const idPanel = (m: MenuNav) => `menu-${m.href.replace(/\W/g, "")}`;

export function SiteHeader() {
  const sekolah = useSekolah();
  const [path, setPath] = useState("");
  const [adaHero, setAdaHero] = useState(true);
  const [digulir, setDigulir] = useState(false);
  const [sembunyi, setSembunyi] = useState(false);
  const [buka, setBuka] = useState<string | null>(null);
  const [laci, setLaci] = useState(false);
  const [laciBuka, setLaciBuka] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // Cek ulang hero & tutup semua menu saat pindah halaman (setelah DOM halaman baru terpasang).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAdaHero(!!document.querySelector("[data-hero]"));
      setBuka(null);
      setLaci(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [path]);

  // Header: transparan di atas hero, putih saat digulir, sembunyi saat turun, muncul saat naik.
  useEffect(() => {
    let lastY = window.scrollY;
    let jalan = false;
    const perbarui = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      setDigulir(y > 8);
      if (y < 160) setSembunyi(false);
      else if (delta > 6) setSembunyi(true);
      else if (delta < -6) setSembunyi(false);
      lastY = y;
      jalan = false;
    };
    const onScroll = () => {
      if (!jalan) {
        jalan = true;
        requestAnimationFrame(perbarui);
      }
    };
    perbarui();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tersembunyi = sembunyi && !buka && !laci;
  const transparan = adaHero && !digulir && !buka && !laci;

  // Offset untuk sub-navigasi lengket di bawah header.
  useEffect(() => {
    const h = headerRef.current?.offsetHeight ?? 0;
    document.documentElement.style.setProperty(
      "--header-offset",
      !tersembunyi && digulir ? `${h}px` : "0px",
    );
  }, [tersembunyi, digulir]);

  // Kunci gulir halaman saat laci seluler terbuka.
  useEffect(() => {
    document.documentElement.style.overflow = laci ? "hidden" : "";
  }, [laci]);

  // Esc menutup menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBuka(null);
        setLaci(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bukaNanti = useCallback((label: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBuka(label), 90);
  }, []);
  const tutupNanti = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBuka(null), 160);
  }, []);
  const batal = useCallback(() => window.clearTimeout(timer.current), []);

  const aktif = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <>
      <Suspense fallback={null}>
        <PathnameSync onChange={setPath} />
      </Suspense>
      <header
        ref={headerRef}
        data-hidden={tersembunyi}
        onMouseLeave={tutupNanti}
        className={cx(
          "site-header fixed inset-x-0 top-0 z-50 border-b",
          transparan
            ? "on-dark border-transparent bg-transparent text-white"
            : "border-line bg-paper text-ink",
        )}
      >
        <a
          href="#konten"
          className="absolute left-4 top-3 -translate-y-24 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white focus-visible:translate-y-0"
        >
          Lewati ke konten
        </a>
        <div className="container-site flex h-[76px] items-center justify-between gap-6 lg:h-[104px]">
          <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg" aria-label={`${sekolah.nama}, ke beranda`}>
            <Image
              src="/images/logo-sman1brangrea.png"
              alt=""
              width={52}
              height={52}
              loading="eager"
              className="h-11 w-11 lg:h-[52px] lg:w-[52px]"
            />
            <span className="leading-tight">
              <span className="block text-[1.0625rem] font-bold tracking-[-0.015em]">{sekolah.namaPendek}</span>
              <span className={cx("block text-[0.8125rem]", transparan ? "text-white/80" : "text-muted")}>
                {sekolah.wilayah}, NTB
              </span>
            </span>
          </Link>

          <div className="hidden flex-col items-end gap-2.5 lg:flex">
            <div className="flex items-center gap-6 text-[0.875rem]">
              {MENU_ATAS.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cx(
                    "rounded-sm transition-colors duration-200",
                    transparan ? "text-white/85 hover:text-white" : "text-ink-2 hover:text-brand",
                  )}
                >
                  {m.label}
                </Link>
              ))}
              <Link
                href="/spmb"
                className={cx(
                  "rounded-full border px-4 py-1.5 text-[0.8125rem] font-medium transition-colors duration-200",
                  transparan
                    ? "border-white/60 text-white hover:bg-white hover:text-brand-ink"
                    : "border-brand text-brand hover:bg-brand hover:text-white",
                )}
              >
                Info SPMB {"2027"}
              </Link>
            </div>
            <nav aria-label="Menu utama">
              <ul className="flex items-center gap-1">
                {MENU_UTAMA.map((m) => {
                  const on = aktif(m.href);
                  if (!m.anak) {
                    return (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          onMouseEnter={() => {
                            batal();
                            setBuka(null);
                          }}
                          aria-current={on ? "page" : undefined}
                          className="relative block rounded-md px-3 py-2 text-[1.0625rem] font-medium"
                        >
                          {m.label}
                          <Garis on={on} />
                        </Link>
                      </li>
                    );
                  }
                  const terbuka = buka === m.label;
                  return (
                    <li key={m.href}>
                      <button
                        type="button"
                        aria-expanded={terbuka}
                        aria-controls={idPanel(m)}
                        onClick={() => setBuka(terbuka ? null : m.label)}
                        onMouseEnter={() => bukaNanti(m.label)}
                        className="relative flex items-center gap-1 rounded-md px-3 py-2 text-[1.0625rem] font-medium"
                      >
                        {m.label}
                        <ChevronDown size={16} aria-hidden="true" className="chev opacity-70" />
                        <Garis on={on || terbuka} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-current/30 lg:hidden"
            aria-expanded={laci}
            aria-controls="menu-seluler"
            aria-label="Buka menu"
            onClick={() => setLaci(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>

        {MENU_UTAMA.filter((m) => m.anak).map((m) => (
          <div
            key={m.href}
            id={idPanel(m)}
            data-open={buka === m.label}
            onMouseEnter={batal}
            className="mega absolute inset-x-0 top-full hidden border-t border-line bg-paper text-ink shadow-panel lg:block"
          >
            <div className="container-site grid gap-10 py-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
              <div className="flex flex-col items-start">
                <p className="text-h3">{m.label}</p>
                <p className="mt-3 max-w-[38ch] text-ink-2">{m.ringkas}</p>
                <Link href={m.href} className="btn-pill mt-6" onClick={() => setBuka(null)}>
                  Buka halaman {m.label.toLowerCase()}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 xl:grid-cols-3">
                {m.anak!.map((a) => (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      onClick={() => setBuka(null)}
                      className="group block rounded-xl p-4 transition-colors duration-200 hover:bg-paper-2"
                    >
                      <span className="flex items-start justify-between gap-3 font-semibold text-ink group-hover:text-brand">
                        {a.label}
                        <ArrowUpRight
                          size={18}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        />
                      </span>
                      {a.ket && <span className="mt-1 block text-sm text-muted">{a.ket}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </header>

      {/* Laci menu seluler */}
      <div
        id="menu-seluler"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-open={laci}
        className="drawer fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper text-ink lg:hidden"
      >
        <div className="container-site flex h-[76px] shrink-0 items-center justify-between border-b border-line">
          <Link href="/" className="flex items-center gap-3" onClick={() => setLaci(false)}>
            <Image src="/images/logo-sman1brangrea.png" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="text-[1.0625rem] font-bold">{sekolah.namaPendek}</span>
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-line-2"
            aria-label="Tutup menu"
            onClick={() => setLaci(false)}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Menu seluler" className="container-site flex-1 py-4">
          <ul className="divide-y divide-line">
            {MENU_UTAMA.map((m) => (
              <li key={m.href}>
                {m.anak ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={laciBuka === m.label}
                      onClick={() => setLaciBuka(laciBuka === m.label ? null : m.label)}
                      className="flex w-full items-center justify-between py-4 text-left text-xl font-semibold"
                    >
                      {m.label}
                      <ChevronDown size={20} aria-hidden="true" className="chev" />
                    </button>
                    <ul hidden={laciBuka !== m.label} className="pb-4">
                      <li>
                        <Link href={m.href} onClick={() => setLaci(false)} className="block py-2 font-medium text-brand">
                          Semua tentang {m.label.toLowerCase()}
                        </Link>
                      </li>
                      {m.anak.map((a) => (
                        <li key={a.href}>
                          <Link href={a.href} onClick={() => setLaci(false)} className="block py-2 text-ink-2">
                            {a.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={m.href} onClick={() => setLaci(false)} className="block py-4 text-xl font-semibold">
                    {m.label}
                  </Link>
                )}
              </li>
            ))}
            {MENU_ATAS.map((m) => (
              <li key={m.href}>
                <Link href={m.href} onClick={() => setLaci(false)} className="block py-3 text-ink-2">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-site flex flex-col gap-3 border-t border-line py-6">
          <Link href="/spmb" onClick={() => setLaci(false)} className="btn-solid w-full">
            Info SPMB 2027
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <a
            href={waLink("Halo SMAN 1 Brang Rea, saya ingin bertanya.", sekolah.kontak.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill w-full justify-center"
          >
            <IkonWhatsApp size={18} />
            {sekolah.kontak.whatsappTampil}
          </a>
        </div>
      </div>
    </>
  );
}

function Garis({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-current transition-transform duration-300"
      style={{ transform: on ? "scaleX(1)" : "scaleX(0)" }}
    />
  );
}
