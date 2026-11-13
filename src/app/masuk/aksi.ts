"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  adaPengguna,
  bacaSemuaPengguna,
  normalUsername,
  penggunaBaru,
  ubahSemuaPengguna,
  usernameValid,
  type Pengguna,
} from "@/lib/server/pengguna";
import { cekKekuatanSandi, cocokSandi, hashSandi } from "@/lib/server/sandi";
import { pasangSesi } from "@/lib/server/sesi";
import { bolehLanjut, hapusBatas, sisaTunggu } from "@/lib/server/batas";
import { catatAktivitas } from "@/lib/server/aktivitas";

export type StatusMasuk = { pesan?: string; galat?: Record<string, string>; nilai?: Record<string, string> };

const JENDELA = 15 * 60_000;

/** Tujuan setelah masuk: hanya jalur di dalam /dashboard (cegah open redirect). */
function tujuanAman(ke: FormDataEntryValue | null) {
  const s = String(ke ?? "");
  return s.startsWith("/dashboard") && !s.startsWith("//") ? s : "/dashboard";
}

let hashPalsu: Promise<string> | null = null;

export async function masuk(_sebelum: StatusMasuk, fd: FormData): Promise<StatusMasuk> {
  const username = normalUsername(String(fd.get("username") ?? ""));
  const sandi = String(fd.get("sandi") ?? "");
  const ingat = fd.get("ingat") === "on";
  const nilai = { username };

  if (!username || !sandi) return { pesan: "Isi nama pengguna dan kata sandi.", nilai };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "lokal";
  const kunciIp = `masuk:ip:${ip}`;
  const kunciAkun = `masuk:akun:${username}`;
  if (!bolehLanjut(kunciIp, 20, JENDELA) || !bolehLanjut(kunciAkun, 6, JENDELA)) {
    const menit = Math.ceil(Math.max(sisaTunggu(kunciIp, JENDELA), sisaTunggu(kunciAkun, JENDELA)) / 60_000);
    return { pesan: `Terlalu banyak percobaan masuk. Coba lagi dalam ${menit} menit.`, nilai };
  }

  const p = (await bacaSemuaPengguna()).find((x) => x.username === username);
  // Tetap hitung hash walau akun tidak ada, supaya waktu respons tidak membocorkan nama pengguna yang terdaftar.
  const cocok = p ? await cocokSandi(sandi, p.hashSandi) : (await cocokSandi(sandi, await (hashPalsu ??= hashSandi("bukan-sandi-1"))), false);

  if (!p || !cocok) {
    await catatAktivitas(null, "gagal-masuk", "akun", { target: username, ket: `IP ${ip}` });
    return { pesan: "Nama pengguna atau kata sandi salah.", nilai };
  }
  if (!p.aktif) return { pesan: "Akun ini dinonaktifkan. Hubungi admin sekolah.", nilai };

  hapusBatas(kunciAkun);
  await ubahSemuaPengguna((semua) => semua.map((x) => (x.id === p.id ? { ...x, terakhirMasuk: new Date().toISOString() } : x)));
  await pasangSesi(p.id, p.versiSesi, ingat);
  await catatAktivitas(p, "masuk", "akun", { ket: ingat ? "Ingat saya 30 hari" : undefined });
  redirect(tujuanAman(fd.get("ke")));
}

/** Hanya berjalan bila belum ada akun sama sekali (pemasangan pertama). */
export async function buatAdminPertama(_sebelum: StatusMasuk, fd: FormData): Promise<StatusMasuk> {
  const nama = String(fd.get("nama") ?? "").trim().replace(/\s+/g, " ");
  const username = normalUsername(String(fd.get("username") ?? ""));
  const sandi = String(fd.get("sandi") ?? "");
  const ulang = String(fd.get("ulang") ?? "");
  const nilai = { nama, username };
  const galat: Record<string, string> = {};

  if (nama.length < 3) galat.nama = "Tulis nama minimal 3 huruf.";
  if (!usernameValid(username)) galat.username = "3–32 karakter: huruf kecil, angka, titik, atau garis bawah.";
  const lemah = cekKekuatanSandi(sandi);
  if (lemah) galat.sandi = lemah;
  else if (sandi !== ulang) galat.ulang = "Ulangi kata sandi yang sama.";
  if (Object.keys(galat).length) return { galat, nilai };

  const hash = await hashSandi(sandi);
  let dibuat: Pengguna | null = null;
  await ubahSemuaPengguna((semua) => {
    if (semua.length) return semua; // sudah ada yang lebih dulu membuat akun
    dibuat = penggunaBaru({ nama, username, peran: "admin", hashSandi: hash });
    return [dibuat];
  });
  if (!dibuat) return { pesan: "Akun admin sudah dibuat sebelumnya. Silakan masuk.", nilai };
  const p = dibuat as Pengguna;
  await pasangSesi(p.id, p.versiSesi, false);
  await catatAktivitas(p, "akun", "pengguna", { target: p.nama, ket: "Admin pertama dibuat" });
  redirect("/dashboard?selamat=1");
}

export async function statusPemasangan() {
  return { adaAkun: await adaPengguna() };
}
