"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Contact,
  DoorOpen,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  UserCog,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { DOKUMEN, KOLEKSI, type GrupNav } from "@/lib/cms/modul";
import { boleh, LABEL_PERAN, type Peran } from "@/lib/cms/peran";
import { keluar } from "@/app/dashboard/aksi-akun";

/** "Jumat, 20 November 2026" (WITA). */
const tanggalHariIni = () =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date());

type ItemNav = { href: string; label: string; ikon: LucideIcon; kunci: string; lencana?: number };

function susunNav(peran: Peran, pesanBaru: number, laporanBaru: number): { judul?: string; item: ItemNav[] }[] {
  const dariModul = (grup: GrupNav): ItemNav[] =>
    [...Object.values(KOLEKSI), ...Object.values(DOKUMEN)]
      .filter((m) => m.grup === grup)
      .map((m) => ({ href: `/dashboard/${m.kunci}`, label: m.label, ikon: m.ikon, kunci: m.kunci }));

  const grup: { judul?: string; item: ItemNav[] }[] = [
    { item: [{ href: "/dashboard", label: "Ringkasan", ikon: LayoutDashboard, kunci: "ringkasan" }] },
    {
      judul: "Absensi",
      item: [
        { href: "/dashboard/absensi", label: "Absensi siswa", ikon: ClipboardCheck, kunci: "absensi" },
        { href: "/dashboard/absen-kelas", label: "Absen kelas", ikon: BookOpenCheck, kunci: "absen-kelas" },
        { href: "/dashboard/izin-keluar", label: "Izin keluar", ikon: DoorOpen, kunci: "izin-keluar" },
        { href: "/dashboard/siswa", label: "Data siswa", ikon: Contact, kunci: "siswa" },
        { href: "/dashboard/kelulusan", label: "Kelulusan", ikon: GraduationCap, kunci: "kelulusan" },
      ],
    },
    {
      judul: "Bimbingan konseling",
      item: [{ href: "/dashboard/laporan", label: "Laporan siswa", ikon: ShieldAlert, kunci: "laporan", lencana: laporanBaru }],
    },
    { judul: "Konten", item: [...dariModul("Konten"), { href: "/dashboard/media", label: "Pustaka foto", ikon: FolderOpen, kunci: "media" }] },
    { judul: "Halaman situs", item: dariModul("Halaman situs") },
    {
      judul: "Sekolah",
      item: [
        ...dariModul("Sekolah"),
        { href: "/dashboard/pesan", label: "Pesan masuk", ikon: Inbox, kunci: "pesan", lencana: pesanBaru },
        { href: "/dashboard/statistik", label: "Statistik kunjungan", ikon: BarChart3, kunci: "statistik" },
        { href: "/dashboard/pengguna", label: "Pengguna", ikon: UsersRound, kunci: "pengguna" },
        { href: "/dashboard/aktivitas", label: "Log aktivitas", ikon: History, kunci: "aktivitas" },
      ],
    },
  ];
  return grup.map((g) => ({ ...g, item: g.item.filter((i) => boleh(peran, i.kunci)) })).filter((g) => g.item.length);
}

export type PenggunaShell = { nama: string; username: string; peran: Peran };

export function ShellDasbor({
  pengguna,
  pesanBaru,
  laporanBaru,
  namaSekolah,
  children,
}: {
  pengguna: PenggunaShell;
  pesanBaru: number;
  laporanBaru: number;
  namaSekolah: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [laci, setLaci] = useState(false);
  const nav = susunNav(pengguna.peran, pesanBaru, laporanBaru);

  useEffect(() => {
    if (!laci) return;
    const tutup = (e: KeyboardEvent) => e.key === "Escape" && setLaci(false);
    window.addEventListener("keydown", tutup);
    return () => window.removeEventListener("keydown", tutup);
  }, [laci]);

  const aktif = (href: string) => (href === "/dashboard" ? path === "/dashboard" : path === href || path.startsWith(`${href}/`));

  const isiNav = (
    <nav aria-label="Menu dashboard" className="flex flex-col gap-5 px-3 pb-5">
      {nav.map((g, i) => (
        <div key={i}>
          {g.judul && <p className="d-nav-judul">{g.judul}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.item.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="d-nav-tautan" aria-current={aktif(it.href) ? "page" : undefined} onClick={() => setLaci(false)}>
                  <it.ikon size={18} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  {!!it.lencana && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1.5 text-[0.6875rem] font-bold text-white">
                      {it.lencana > 99 ? "99+" : it.lencana}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const merek = (
    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-4" onClick={() => setLaci(false)}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
        <Image src="/images/logo-sman1brangrea.png" alt="" width={36} height={36} className="h-8 w-8 object-contain" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[0.9375rem] font-bold text-white">{namaSekolah}</span>
        <span className="block text-xs text-white/55">Dashboard {LABEL_PERAN[pengguna.peran].toLowerCase()}</span>
      </span>
    </Link>
  );

  return (
    <div className="dasbor">
      <a href="#isi-dasbor" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Lewati ke isi
      </a>

      {/* Samping (layar besar) */}
      <aside className="d-kaca fixed bottom-4 left-4 top-4 z-30 hidden w-[256px] flex-col overflow-hidden rounded-[26px] lg:flex">
        {merek}
        <div className="mx-4 mb-3 h-px bg-white/10" />
        <div className="d-gulir-tipis min-h-0 flex-1 overflow-y-auto">{isiNav}</div>
      </aside>

      {/* Laci (HP / tablet) */}
      {laci && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu dashboard">
          <button type="button" className="absolute inset-0 bg-scrim/45" aria-label="Tutup menu" onClick={() => setLaci(false)} />
          <aside className="d-kaca d-laci absolute bottom-2 left-2 top-2 flex w-[min(86vw,300px)] flex-col overflow-hidden rounded-[24px]">
            <div className="flex items-center justify-between pr-3">
              {merek}
              <button type="button" className="d-btn d-btn-kaca d-btn-ikon" onClick={() => setLaci(false)} aria-label="Tutup menu">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="d-gulir-tipis min-h-0 flex-1 overflow-y-auto">{isiNav}</div>
          </aside>
        </div>
      )}

      <div className="px-2 pb-3 sm:px-3 lg:pb-4 lg:pl-[288px] lg:pr-4">
        <div className="d-latar-tetap sticky top-0 z-20 -mx-2 px-2 py-2 sm:-mx-3 sm:px-3 lg:mx-0 lg:px-0 lg:py-4">
          <header className="d-kaca flex h-16 items-center gap-3 rounded-[20px] px-3 sm:px-4">
            <button type="button" className="d-btn d-btn-kaca d-btn-ikon lg:hidden" onClick={() => setLaci(true)} aria-label="Buka menu">
              <Menu size={20} aria-hidden="true" />
            </button>
            <p className="hidden min-w-0 truncate text-sm text-white/65 sm:block" suppressHydrationWarning>
              <CalendarDays size={15} aria-hidden="true" className="-mt-0.5 mr-2 inline text-aksen" />
              {tanggalHariIni()}
            </p>
            <div className="flex-1" />
            <a href="/" target="_blank" rel="noopener noreferrer" className="d-btn d-btn-kaca d-btn-kecil">
              <ExternalLink size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Lihat situs</span>
            </a>
            <MenuPengguna pengguna={pengguna} />
          </header>
        </div>

        <main id="isi-dasbor" className="d-panel min-h-[calc(100svh-6.5rem)] rounded-[24px] px-4 py-6 md:rounded-[30px] md:px-8 md:py-8 lg:min-h-[calc(100svh-7.5rem)]">
          <div className="mx-auto w-full max-w-[1240px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function MenuPengguna({ pengguna }: { pengguna: PenggunaShell }) {
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!buka) return;
    const luar = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setBuka(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    document.addEventListener("mousedown", luar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", luar);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);

  const inisial = pengguna.nama
    .split(" ")
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={buka}
        onClick={() => setBuka((b) => !b)}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-aksen to-brand text-xs font-bold text-white ring-2 ring-white/20">{inisial}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[14ch] truncate text-sm font-semibold text-white">{pengguna.nama}</span>
          <span className="block text-xs text-white/55">{LABEL_PERAN[pengguna.peran]}</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="text-white/60" />
      </button>
      {buka && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-[0_24px_48px_-16px_rgb(6_16_11/0.45)]">
          <div className="border-b border-line px-4 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-semibold text-ink">{pengguna.nama}</p>
            <p className="truncate text-xs text-muted">
              @{pengguna.username} · {LABEL_PERAN[pengguna.peran]}
            </p>
          </div>
          <Link role="menuitem" href="/dashboard/akun" className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-paper-2" onClick={() => setBuka(false)}>
            <UserCog size={16} aria-hidden="true" /> Akun saya
          </Link>
          {pengguna.peran === "admin" && (
            <Link role="menuitem" href="/dashboard/pengguna" className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-paper-2" onClick={() => setBuka(false)}>
              <UserRound size={16} aria-hidden="true" /> Kelola pengguna
            </Link>
          )}
          <form action={keluar}>
            <button role="menuitem" type="submit" className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#b42318] hover:bg-[#fef3f2]">
              <LogOut size={16} aria-hidden="true" /> Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
