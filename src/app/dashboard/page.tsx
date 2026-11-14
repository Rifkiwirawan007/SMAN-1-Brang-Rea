import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  CircleAlert,
  Eye,
  ImagePlus,
  Inbox,
  Newspaper,
  PartyPopper,
  PenLine,
  Trophy,
  Users,
} from "lucide-react";
import { wajibMasuk } from "@/lib/server/pengguna";
import { bacaDokumen, bacaKoleksi } from "@/lib/server/penyimpanan";
import { bacaSemuaPesan } from "@/lib/server/pesan";
import { bacaAktivitas } from "@/lib/server/aktivitas";
import { ringkasanKunjungan, tanggalWita } from "@/lib/server/kunjungan";
import { boleh } from "@/lib/cms/peran";
import { KOLEKSI } from "@/lib/cms/modul";
import { NAMA_KOLEKSI } from "@/lib/konten/tipe";
import { formatTanggal } from "@/lib/format";
import { Kartu, Lencana, waktuRelatif } from "@/components/dasbor/ui";
import { formatAngka, GrafikHarian } from "@/components/dasbor/grafik";
import { BarisAktivitas } from "@/components/dasbor/aktivitas";

/** Halaman dashboard selalu dinamis (butuh sesi masuk). */
export const instant = false;

export const metadata = { title: { absolute: "Ringkasan · Dashboard" } };

function sapaan() {
  const jam = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Makassar" }).format(new Date()));
  return jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam";
}

function Tren({ kini, lalu }: { kini: number; lalu: number }) {
  if (!lalu) return null;
  const persen = Math.round(((kini - lalu) / lalu) * 100);
  if (!persen) return <span className="text-xs text-muted">sama dengan sebelumnya</span>;
  return (
    <span className={`text-xs font-semibold ${persen > 0 ? "text-brand" : "text-[#b42318]"}`}>
      {persen > 0 ? "▲" : "▼"} {Math.abs(persen)}% <span className="font-normal text-muted">dari 7 hari sebelumnya</span>
    </span>
  );
}

export default async function Ringkasan({ searchParams }: PageProps<"/dashboard">) {
  await connection();
  const p = await wajibMasuk();
  // Akun guru hanya mengurus absensi: langsung ke halaman absensi.
  if (!boleh(p.peran, "ringkasan")) redirect(boleh(p.peran, "absensi") ? "/dashboard/absensi" : "/dashboard/akun");
  const admin = boleh(p.peran, "pesan");
  const sp = await searchParams;

  const [berita, agenda, prestasi, poster, ekskul, galeri, hero, sambutan, profil, akademik, kesiswaan, spmb] = await Promise.all([
    bacaKoleksi("berita"),
    bacaKoleksi("agenda"),
    bacaKoleksi("prestasi"),
    bacaKoleksi("poster-prestasi"),
    bacaKoleksi("ekskul"),
    bacaKoleksi("galeri"),
    bacaKoleksi("hero"),
    bacaDokumen("sambutan"),
    bacaDokumen("profil"),
    bacaDokumen("akademik"),
    bacaDokumen("kesiswaan"),
    bacaDokumen("spmb"),
  ]);
  const [pesan, aktivitas, kunjungan] = admin
    ? await Promise.all([bacaSemuaPesan(), bacaAktivitas(), ringkasanKunjungan(14)])
    : [[], [], null];

  const hariIni = tanggalWita();
  const agendaMendatang = agenda.filter((a) => (a.sampai || a.tanggal) >= hariIni).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const beritaTerbit = berita.filter((b) => b.status !== "draf");
  const draf = berita.filter((b) => b.status === "draf");
  const terbaru = [...berita].sort((a, b) => String(b.diubah ?? "").localeCompare(String(a.diubah ?? ""))).slice(0, 5);
  const pesanBaru = pesan.filter((x) => x.status === "baru");
  const tujuhHari = kunjungan ? kunjungan.seri.slice(-7).reduce((n, s) => n + s.tampil, 0) : 0;
  const tujuhLalu = kunjungan ? kunjungan.seri.slice(0, 7).reduce((n, s) => n + s.tampil, 0) : 0;

  const koleksi = { berita, agenda, prestasi, "poster-prestasi": poster, ekskul, galeri, hero } as const;
  const daftarContoh = [
    ...NAMA_KOLEKSI.map((k) => ({
      href: `/dashboard/${k}`,
      label: KOLEKSI[k].label,
      ket: `${(koleksi[k] as { contoh?: boolean }[]).filter((x) => x.contoh).length} item`,
      ada: (koleksi[k] as { contoh?: boolean }[]).some((x) => x.contoh),
    })),
    { href: "/dashboard/sambutan", label: "Sambutan kepala sekolah", ket: "teks sambutan", ada: sambutan.contoh },
    {
      href: "/dashboard/profil",
      label: "Profil sekolah",
      ket: "visi, misi, sejarah, struktur",
      ada: profil.visi.contoh || profil.misi.contoh || profil.sejarah.some((x) => x.contoh) || profil.struktur.some((x) => x.contoh),
    },
    {
      href: "/dashboard/akademik",
      label: "Akademik",
      ket: "kurikulum, mapel, jadwal, kalender",
      ada: akademik.kurikulum.contoh || akademik.mapel.contoh || akademik.jadwal.contoh || akademik.kalenderContoh,
    },
    { href: "/dashboard/kesiswaan", label: "Kesiswaan", ket: "OSIS, tata tertib, BK", ada: kesiswaan.osis.contoh || kesiswaan.tataTertib.contoh || kesiswaan.layananBk.contoh },
    { href: "/dashboard/spmb", label: "SPMB", ket: "jalur, jadwal, syarat", ada: spmb.contoh },
  ].filter((x) => x.ada);

  const kartu = [
    { label: "Berita terbit", nilai: beritaTerbit.length, ket: draf.length ? `${draf.length} draf menunggu` : "tidak ada draf", href: "/dashboard/berita", ikon: Newspaper },
    { label: "Agenda mendatang", nilai: agendaMendatang.length, ket: agendaMendatang[0] ? `berikutnya ${formatTanggal(agendaMendatang[0].tanggal, { pendek: true })}` : "belum ada agenda", href: "/dashboard/agenda", ikon: CalendarDays },
    { label: "Prestasi", nilai: prestasi.length, ket: `${poster.length} poster, ${poster.filter((x) => x.beranda).length} di beranda`, href: "/dashboard/prestasi", ikon: Trophy },
    { label: "Foto galeri", nilai: galeri.length, ket: `${ekskul.length} ekskul, ${hero.filter((h) => h.aktif !== false).length} slide aktif`, href: "/dashboard/galeri", ikon: ImagePlus },
  ];

  return (
    <div className="flex flex-col gap-6">
      {sp.akses === "ditolak" && (
        <p role="alert" className="flex items-center gap-2.5 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">
          <CircleAlert size={18} aria-hidden="true" /> Akun Anda tidak punya akses ke halaman tadi. Hubungi admin bila perlu.
        </p>
      )}
      {sp.selamat === "1" && (
        <div className="flex gap-3 rounded-xl border border-brand/30 bg-brand-soft px-5 py-4 text-sm text-brand-ink">
          <PartyPopper size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-semibold">Akun admin siap dipakai.</p>
            <p className="mt-0.5">
              Langkah berikutnya: periksa <Link href="/dashboard/sekolah" className="font-semibold underline">Info &amp; kontak sekolah</Link>, lalu ganti konten bertanda contoh, dan tambahkan akun editor di{" "}
              <Link href="/dashboard/pengguna" className="font-semibold underline">Pengguna</Link>.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted">{formatTanggal(hariIni)}</p>
          <h1 className="mt-1 text-[1.625rem] font-semibold tracking-[-0.015em] text-ink md:text-[1.875rem]">
            {sapaan()}, {p.nama.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/berita/baru" className="d-btn d-btn-utama">
            <PenLine size={16} aria-hidden="true" /> Tulis berita
          </Link>
          <Link href="/dashboard/agenda/baru" className="d-btn d-btn-garis">
            <CalendarPlus size={16} aria-hidden="true" /> Agenda
          </Link>
          <Link href="/dashboard/galeri" className="d-btn d-btn-garis">
            <ImagePlus size={16} aria-hidden="true" /> Foto
          </Link>
          <Link href="/dashboard/prestasi/baru" className="d-btn d-btn-garis">
            <Trophy size={16} aria-hidden="true" /> Prestasi
          </Link>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((k) => (
          <li key={k.label}>
            <Link href={k.href} className="d-kartu group flex h-full flex-col p-5 transition-shadow hover:shadow-[0_12px_32px_-20px_rgb(6_16_11/0.4)]">
              <span className="flex items-center justify-between text-sm text-muted">
                {k.label}
                <k.ikon size={18} aria-hidden="true" className="text-brand" />
              </span>
              <span className="mt-2 text-[2rem] font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink">{formatAngka(k.nilai)}</span>
              <span className="mt-2 text-xs text-muted">{k.ket}</span>
            </Link>
          </li>
        ))}
      </ul>

      {admin && kunjungan && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Kartu
            judul="Kunjungan 14 hari terakhir"
            deskripsi={
              <>
                {formatAngka(tujuhHari)} tayangan dalam 7 hari terakhir · <Tren kini={tujuhHari} lalu={tujuhLalu} />
              </>
            }
            aksi={
              <Link href="/dashboard/statistik" className="d-btn d-btn-hantu d-btn-kecil">
                Detail <ArrowRight size={14} aria-hidden="true" />
              </Link>
            }
          >
            <GrafikHarian seri={kunjungan.seri} tinggi={170} />
          </Kartu>
          <Kartu
            judul={
              <span className="flex items-center gap-2">
                Pesan masuk {pesanBaru.length > 0 && <Lencana warna="kuning">{pesanBaru.length} baru</Lencana>}
              </span>
            }
            aksi={
              <Link href="/dashboard/pesan" className="d-btn d-btn-hantu d-btn-kecil">
                Semua <ArrowRight size={14} aria-hidden="true" />
              </Link>
            }
            isiClassName="p-2"
          >
            {pesan.length === 0 ? (
              <p className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted">
                <Inbox size={24} aria-hidden="true" /> Belum ada pesan dari formulir kontak.
              </p>
            ) : (
              <ul>
                {pesan.slice(0, 5).map((m) => (
                  <li key={m.id}>
                    <Link href={`/dashboard/pesan?buka=${m.id}`} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-paper-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.status === "baru" ? "bg-sun" : "bg-transparent"}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${m.status === "baru" ? "font-semibold text-ink" : "text-ink-2"}`}>{m.nama}</span>
                          <span className="shrink-0 text-[0.6875rem] text-muted">{waktuRelatif(m.waktu)}</span>
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {m.keperluan} · {m.isi}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Kartu>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Kartu
          judul="Terakhir diubah"
          aksi={
            <Link href="/dashboard/berita" className="d-btn d-btn-hantu d-btn-kecil">
              Semua berita <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
          isiClassName="p-2"
        >
          <ul>
            {terbaru.map((b) => (
              <li key={b.id}>
                <Link href={`/dashboard/berita/${b.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-paper-2">
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-semibold text-ink">{b.judul}</span>
                    <span className="block text-xs text-muted">
                      {b.kategori} · diubah {waktuRelatif(b.diubah)}
                      {b.oleh ? ` oleh ${b.oleh}` : ""}
                    </span>
                  </span>
                  {b.status === "draf" ? <Lencana warna="kuning">Draf</Lencana> : <Lencana warna="hijau">Terbit</Lencana>}
                </Link>
              </li>
            ))}
          </ul>
        </Kartu>

        <Kartu
          judul="Agenda mendatang"
          aksi={
            <Link href="/dashboard/agenda/baru" className="d-btn d-btn-hantu d-btn-kecil">
              Tambah <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
          isiClassName="p-2"
        >
          {agendaMendatang.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">Tidak ada agenda mendatang. Agenda yang lewat otomatis tidak dihitung.</p>
          ) : (
            <ul>
              {agendaMendatang.slice(0, 5).map((a) => {
                const d = new Date(`${a.tanggal}T12:00:00+08:00`);
                return (
                  <li key={a.id}>
                    <Link href={`/dashboard/agenda/${a.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-paper-2">
                      <span className="grid w-12 shrink-0 place-items-center rounded-lg bg-brand-soft py-1 text-brand-deep">
                        <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                        <span className="text-[0.625rem] font-semibold uppercase">{new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-semibold text-ink">{a.judul}</span>
                        <span className="block truncate text-xs text-muted">
                          {a.waktu} · {a.tempat}
                        </span>
                      </span>
                      {a.contoh && <Lencana>Contoh</Lencana>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Kartu>
      </div>

      <div className={`grid gap-6 ${admin ? "xl:grid-cols-2" : ""}`}>
        <Kartu
          judul="Konten contoh yang perlu diganti"
          deskripsi={daftarContoh.length ? "Bagian ini masih memakai teks/data contoh. Label “Contoh” tampil di situs sampai diganti." : undefined}
          isiClassName="p-2"
        >
          {daftarContoh.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Semua konten sudah memakai data resmi. Anda bisa mematikan label contoh di Info &amp; kontak sekolah.</p>
          ) : (
            <ul>
              {daftarContoh.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-paper-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-sun" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-ink">{c.label}</span> <span className="text-muted">· {c.ket}</span>
                    </span>
                    <ArrowUpRight size={15} className="text-muted" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Kartu>

        {admin && (
          <Kartu
            judul="Aktivitas terbaru"
            aksi={
              <Link href="/dashboard/aktivitas" className="d-btn d-btn-hantu d-btn-kecil">
                Log lengkap <ArrowRight size={14} aria-hidden="true" />
              </Link>
            }
            isiClassName="px-5 py-2"
          >
            {aktivitas.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Belum ada aktivitas.</p>
            ) : (
              <ul className="divide-y divide-line">
                {aktivitas.slice(0, 7).map((a) => (
                  <BarisAktivitas key={a.id} a={a} ringkas />
                ))}
              </ul>
            )}
          </Kartu>
        )}
      </div>

      {!admin && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <Users size={14} aria-hidden="true" /> Anda masuk sebagai Editor: bisa mengelola konten. Info sekolah, pesan, statistik, dan akun dikelola Admin.
        </p>
      )}
      {admin && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <Eye size={14} aria-hidden="true" /> Perubahan yang disimpan langsung tampil di situs.
        </p>
      )}
    </div>
  );
}
