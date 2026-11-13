import "server-only";
import { redirect } from "next/navigation";
import { bacaJson, filePrivat, idBaru, ubahJson } from "@/lib/server/penyimpanan";
import { bacaSesi } from "@/lib/server/sesi";
import { boleh, type Peran } from "@/lib/cms/peran";

export type Pengguna = {
  id: string;
  nama: string;
  /** Nama pengguna untuk masuk (huruf kecil, angka, titik, garis bawah). */
  username: string;
  peran: Peran;
  hashSandi: string;
  aktif: boolean;
  dibuat: string;
  terakhirMasuk?: string;
  /** Dinaikkan saat sandi diganti / keluar dari semua perangkat: sesi lama otomatis tidak berlaku. */
  versiSesi: number;
};

/** Data pengguna yang aman dikirim ke klien (tanpa hash sandi). */
export type PenggunaAman = Omit<Pengguna, "hashSandi" | "versiSesi">;

const FILE = filePrivat("pengguna");

export const amankan = (p: Pengguna): PenggunaAman => ({
  id: p.id,
  nama: p.nama,
  username: p.username,
  peran: p.peran,
  aktif: p.aktif,
  dibuat: p.dibuat,
  terakhirMasuk: p.terakhirMasuk,
});

export function bacaSemuaPengguna(): Promise<Pengguna[]> {
  return bacaJson<Pengguna[]>(FILE, []);
}

export function ubahSemuaPengguna(fn: (semua: Pengguna[]) => Pengguna[] | Promise<Pengguna[]>) {
  return ubahJson<Pengguna[]>(FILE, [], fn);
}

export async function adaPengguna() {
  return (await bacaSemuaPengguna()).length > 0;
}

export const normalUsername = (u: string) => u.trim().toLowerCase();
export const usernameValid = (u: string) => /^[a-z0-9._]{3,32}$/.test(u);

export function penggunaBaru(data: { nama: string; username: string; peran: Peran; hashSandi: string }): Pengguna {
  return { id: idBaru(), aktif: true, dibuat: new Date().toISOString(), versiSesi: 1, ...data };
}

/** Pengguna yang sedang masuk (dari cookie), atau null bila belum/tidak sah lagi. */
export async function penggunaSaatIni(): Promise<PenggunaAman | null> {
  const sesi = await bacaSesi();
  if (!sesi) return null;
  const p = (await bacaSemuaPengguna()).find((x) => x.id === sesi.u);
  if (!p || !p.aktif || p.versiSesi !== sesi.v) return null;
  return amankan(p);
}

/** Untuk halaman dashboard: wajib masuk, dan (opsional) wajib punya akses ke modul tertentu. */
export async function wajibMasuk(modul?: string): Promise<PenggunaAman> {
  const p = await penggunaSaatIni();
  if (!p) redirect("/masuk");
  if (modul && !boleh(p.peran, modul)) redirect("/dashboard?akses=ditolak");
  return p;
}
