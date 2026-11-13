"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import { buatAdminPertama, masuk, type StatusMasuk } from "@/app/masuk/aksi";

function Sandi({ nama, label, galat, autoComplete, otomatisFokus }: { nama: string; label: string; galat?: string; autoComplete: string; otomatisFokus?: boolean }) {
  const [lihat, setLihat] = useState(false);
  return (
    <div>
      <label htmlFor={nama} className="d-label mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <input
          id={nama}
          name={nama}
          type={lihat ? "text" : "password"}
          className="d-input pr-11"
          autoComplete={autoComplete}
          required
          autoFocus={otomatisFokus}
          aria-invalid={!!galat || undefined}
          aria-describedby={galat ? `${nama}-galat` : undefined}
        />
        <button
          type="button"
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-paper-2 hover:text-ink"
          onClick={() => setLihat((x) => !x)}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
          {lihat ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {galat && (
        <p id={`${nama}-galat`} className="d-galat mt-1.5">
          {galat}
        </p>
      )}
    </div>
  );
}

export function FormMasuk({ ke, keluar }: { ke?: string; keluar?: boolean }) {
  const [state, aksi, sibuk] = useActionState<StatusMasuk, FormData>(masuk, {});
  return (
    <form action={aksi} className="flex flex-col gap-4" noValidate>
      {keluar && !state.pesan && (
        <p role="status" className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-deep">
          Anda sudah keluar. Sampai jumpa lagi.
        </p>
      )}
      {state.pesan && (
        <p role="alert" className="rounded-lg border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm font-medium text-[#b42318]">
          {state.pesan}
        </p>
      )}
      <input type="hidden" name="ke" value={ke ?? ""} />
      <div>
        <label htmlFor="username" className="d-label mb-1.5 block">
          Nama pengguna
        </label>
        <input
          id="username"
          name="username"
          className="d-input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          defaultValue={state.nilai?.username}
        />
      </div>
      <Sandi nama="sandi" label="Kata sandi" autoComplete="current-password" />
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
        <input type="checkbox" name="ingat" className="d-kotak-centang" />
        Ingat saya di perangkat ini (30 hari)
      </label>
      <button type="submit" className="d-btn d-btn-utama mt-1 h-11 w-full" disabled={sibuk}>
        {sibuk ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
        Masuk
      </button>
      <p className="text-center text-xs text-muted">Lupa kata sandi? Minta admin sekolah mengatur ulang dari menu Pengguna.</p>
    </form>
  );
}

export function FormAdminPertama() {
  const [state, aksi, sibuk] = useActionState<StatusMasuk, FormData>(buatAdminPertama, {});
  const g = state.galat ?? {};
  return (
    <form action={aksi} className="flex flex-col gap-4" noValidate>
      <p className="flex gap-3 rounded-lg bg-brand-soft px-4 py-3 text-sm leading-relaxed text-brand-ink">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
        <span>Belum ada akun. Buat akun <strong>admin pertama</strong> sekarang; akun lain (admin atau editor) bisa ditambahkan dari dashboard.</span>
      </p>
      {state.pesan && (
        <p role="alert" className="rounded-lg border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm font-medium text-[#b42318]">
          {state.pesan}
        </p>
      )}
      <div>
        <label htmlFor="nama" className="d-label mb-1.5 block">
          Nama lengkap
        </label>
        <input id="nama" name="nama" className="d-input" autoComplete="name" defaultValue={state.nilai?.nama} aria-invalid={!!g.nama || undefined} autoFocus />
        {g.nama && <p className="d-galat mt-1.5">{g.nama}</p>}
      </div>
      <div>
        <label htmlFor="username" className="d-label mb-1.5 block">
          Nama pengguna
        </label>
        <input
          id="username"
          name="username"
          className="d-input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.nilai?.username}
          aria-invalid={!!g.username || undefined}
          placeholder="mis. admin.sekolah"
        />
        {g.username ? <p className="d-galat mt-1.5">{g.username}</p> : <p className="d-bantuan mt-1.5">Huruf kecil, angka, titik, atau garis bawah.</p>}
      </div>
      <Sandi nama="sandi" label="Kata sandi" autoComplete="new-password" galat={g.sandi} />
      <Sandi nama="ulang" label="Ulangi kata sandi" autoComplete="new-password" galat={g.ulang} />
      <p className="d-bantuan -mt-2">Minimal 8 karakter, memuat huruf dan angka.</p>
      <button type="submit" className="d-btn d-btn-utama mt-1 h-11 w-full" disabled={sibuk}>
        {sibuk && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
        Buat akun admin
      </button>
    </form>
  );
}
