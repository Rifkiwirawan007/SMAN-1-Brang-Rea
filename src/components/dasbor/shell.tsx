"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Contact,
  ExternalLink,
  FolderOpen,
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
        { href: "/dashboard/siswa", label: "Data siswa", ikon: Contact, kunci: "siswa" },
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
    <nav aria-label="Menu dashboard" className="flex flex-col gap-5 px-3 pb-6">
      {nav.map((g, i) => (
        <div key={i}>
          {g.judul && <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted">{g.judul}</p>}
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
    <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4" onClick={() => setLaci(false)}>
      <Image src="/images/logo-sman1brangrea.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[0.9375rem] font-bold text-ink">{namaSekolah}</span>
        <span className="block text-xs text-muted">Dashboard {LABEL_PERAN[pengguna.peran].toLowerCase()}</span>
      </span>
    </Link>
  );

  return (
    <div className="dasbor">
      <a href="#isi-dasbor" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Lewati ke isi
      </a>

      {/* Samping (layar besar) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-white lg:flex">
        {merek}
        <div className="min-h-0 flex-1 overflow-y-auto pt-1">{isiNav}</div>
      </aside>

      {/* Laci (HP / tablet) */}
      {laci && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu dashboard">
          <button type="button" className="absolute inset-0 bg-scrim/45" aria-label="Tutup menu" onClick={() => setLaci(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              {merek}
              <button type="button" className="d-btn d-btn-hantu d-btn-ikon" onClick={() => setLaci(false)} aria-label="Tutup menu">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{isiNav}</div>
          </aside>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur md:px-6">
          <button type="button" className="d-btn d-btn-hantu d-btn-ikon lg:hidden" onClick={() => setLaci(true)} aria-label="Buka menu">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" rel="noopener noreferrer" className="d-btn d-btn-garis d-btn-kecil">
            <ExternalLink size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Lihat situs</span>
          </a>
          <MenuPengguna pengguna={pengguna} />
        </header>

        <main id="isi-dasbor" className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
          {children}
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
        className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-paper-3"
        aria-haspopup="menu"
        aria-expanded={buka}
        onClick={() => setBuka((b) => !b)}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">{inisial}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[14ch] truncate text-sm font-semibold text-ink">{pengguna.nama}</span>
          <span className="block text-xs text-muted">{LABEL_PERAN[pengguna.peran]}</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="text-muted" />
      </button>
      {buka && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] w-60 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-[0_16px_40px_-16px_rgb(6_16_11/0.35)]">
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
