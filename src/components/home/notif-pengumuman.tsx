"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, X } from "lucide-react";

export type PengumumanBaru = {
  slug: string;
  judul: string;
  ringkasan: string;
  /** YYYY-MM-DD: tanggal pengumuman, atau tanggal dibuat bila tanggal kosong. */
  terbit: string;
  tanggalTampil: string;
};

/** Pengumuman dianggap "baru" selama sekian hari sejak terbit. */
const MASA_BARU_HARI = 7;
/** Seksi pemicu: notifikasi muncul saat seksi sambutan kepala sekolah terlihat. */
const PEMICU = 'section[aria-labelledby="judul-sambutan"]';

/**
 * Notifikasi pengumuman terbaru di Beranda: kertas catatan putih (sudut melengkung) yang terbuka dari
 * lipatan, lalu ditancap paku payung hijau. Muncul saat pengunjung menggulir sampai seksi sambutan,
 * hanya bila pengumumannya masih baru (≤ 7 hari). Tombol tutup hanya menyembunyikan untuk kunjungan itu;
 * setiap kali Beranda dibuka / di-refresh, muncul lagi.
 * Umur dihitung di browser supaya tetap benar walau halaman beranda tersimpan di cache.
 */
export function NotifPengumuman({ data }: { data: PengumumanBaru | null }) {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    if (!data?.terbit) return;
    const umurHari = (Date.now() - new Date(`${data.terbit}T00:00:00+08:00`).getTime()) / 86_400_000;
    if (!(umurHari >= -1 && umurHari <= MASA_BARU_HARI)) return;
    const seksi = document.querySelector(PEMICU);
    if (!seksi) {
      const t = setTimeout(() => setTampil(true), 1200);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entri) => {
        if (entri.some((e) => e.isIntersecting)) {
          setTampil(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(seksi);
    return () => io.disconnect();
  }, [data]);

  if (!data || !tampil) return null;

  return (
    <aside aria-label="Pengumuman baru" className="notif-pengumuman fixed right-3 bottom-3 z-40 w-[150px] sm:right-8 sm:bottom-8 sm:w-[232px]">
      <div className="notif-catatan relative">
        {/* kertas: sudut kanan atas & kiri bawah terpotong, lalu ditutup lipatan melengkung */}
        <div className="[filter:drop-shadow(0_16px_16px_rgb(6_16_11/0.2))_drop-shadow(0_2px_3px_rgb(6_16_11/0.16))]">
          <div className="notif-kertas-putih relative px-3 pt-7 pb-3 text-center text-ink sm:px-5 sm:pt-10 sm:pb-7">
            <span aria-hidden="true" className="notif-bayang-lipat pointer-events-none absolute inset-0" />

            <p className="relative text-[11px] font-medium sm:text-[14px]">Pengumuman</p>
            <p className="relative mt-0.5 text-[26px] leading-none font-black tracking-[-0.01em] sm:text-[40px]">
              {/* tiap huruf ikut melompat bergantian (gelombang), lalu berulang pelan */}
              <span className="notif-baru inline-block" aria-label="BARU!">
                {"BARU!".split("").map((h, i) => (
                  <span key={i} aria-hidden="true" className="notif-huruf inline-block" style={{ "--i": i } as CSSProperties}>
                    {h}
                  </span>
                ))}
              </span>
            </p>
            <p className="relative mt-2 line-clamp-3 text-[11.5px] leading-[1.2] sm:mt-3 font-extrabold text-brand uppercase sm:text-[15px]">{data.judul}</p>
            {data.tanggalTampil && (
              <p className="relative mt-1.5 inline-flex items-center gap-1 text-[10.5px] sm:mt-2.5 sm:gap-1.5 font-medium text-ink-2 sm:text-[12.5px]">
                <CalendarDays size={13} className="text-brand" aria-hidden="true" />
                {data.tanggalTampil}
              </p>
            )}
            <div className="relative">
              <Link
                href={`/berita/${data.slug}`}
                className="inline-flex min-h-9 items-center gap-1 text-[11px] sm:mt-1 sm:min-h-10 font-bold text-brand underline-offset-4 hover:underline sm:text-[13px]"
              >
                Baca selengkapnya
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTampil(false)}
          aria-label="Tutup notifikasi"
          className="absolute top-0.5 left-0.5 grid h-8 w-8 sm:top-1 sm:left-1 sm:h-9 sm:w-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper-3 hover:text-ink"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* paku payung hijau: turun lalu menancap */}
        <svg aria-hidden="true" viewBox="0 0 40 52" className="notif-paku absolute -top-[20px] left-1/2 w-[28px] -ml-[14px] sm:w-[40px] sm:-ml-[20px]">
          <defs>
            <linearGradient id="paku-badan" x1="0" x2="1">
              <stop offset="0" stopColor="#1f4d31" />
              <stop offset="0.35" stopColor="#4f9a69" />
              <stop offset="0.6" stopColor="#34724c" />
              <stop offset="1" stopColor="#1c4229" />
            </linearGradient>
            <radialGradient id="paku-atas" cx="0.38" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#8fd3a6" />
              <stop offset="0.5" stopColor="#3f8a5a" />
              <stop offset="1" stopColor="#24563a" />
            </radialGradient>
          </defs>
          {/* bayangan di kertas */}
          <ellipse className="notif-paku-bayang" cx="24" cy="46" rx="13" ry="3.6" fill="rgb(6 16 11 / 0.3)" />
          {/* alas lebar */}
          <ellipse cx="20" cy="42" rx="14" ry="5.2" fill="url(#paku-badan)" />
          <ellipse cx="20" cy="40.4" rx="14" ry="4.6" fill="#45925f" />
          {/* leher pendek & gemuk */}
          <path d="M13 22 L27 22 L25 40 L15 40 Z" fill="url(#paku-badan)" />
          {/* kepala besar */}
          <ellipse cx="20" cy="22" rx="13" ry="5.5" fill="url(#paku-badan)" />
          <ellipse cx="20" cy="15" rx="13" ry="12" fill="url(#paku-atas)" />
          <ellipse cx="15" cy="9.5" rx="4" ry="2.4" fill="#ffffff" opacity="0.5" />
        </svg>
      </div>
    </aside>
  );
}
