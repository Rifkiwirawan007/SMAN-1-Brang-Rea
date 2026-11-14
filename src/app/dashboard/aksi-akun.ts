"use server";

import { redirect } from "next/navigation";
import {
  bacaSemuaPengguna,
  normalUsername,
  penggunaBaru,
  penggunaSaatIni,
  ubahSemuaPengguna,
  usernameValid,
  type Pengguna,
} from "@/lib/server/pengguna";
import { cekKekuatanSandi, cocokSandi, hashSandi } from "@/lib/server/sandi";
import { hapusSesi, pasangSesi } from "@/lib/server/sesi";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { LABEL_PERAN, type Peran } from "@/lib/cms/peran";
import type { HasilAksi } from "@/app/dashboard/aksi";

const gagal = (pesan: string, galat?: Record<string, string>): HasilAksi => ({ ok: false, pesan, galat });
const peranSah = (p: unknown): p is Peran => p === "admin" || p === "editor" || p === "guru";

export async function keluar() {
  const p = await penggunaSaatIni();
  await hapusSesi();
  if (p) await catatAktivitas(p, "keluar", "akun");
  redirect("/masuk?keluar=1");
}

/* ---------- Akun saya ---------- */

export async function ubahNamaSaya(nama: string): Promise<HasilAksi> {
  const p = await penggunaSaatIni();
  if (!p) return gagal("Sesi berakhir. Silakan masuk lagi.");
  const bersih = nama.trim().replace(/\s+/g, " ");
  if (bersih.length < 3 || bersih.length > 60) return gagal("Periksa nama.", { nama: "Nama 3–60 karakter." });
  await ubahSemuaPengguna((semua) => semua.map((x) => (x.id === p.id ? { ...x, nama: bersih } : x)));
  await catatAktivitas({ ...p, nama: bersih }, "akun", "akun", { ket: "Mengubah nama tampilan" });
  return { ok: true, pesan: "Nama tersimpan." };
}

export async function gantiSandiSaya(lama: string, baru: string, ulang: string): Promise<HasilAksi> {
  const p = await penggunaSaatIni();
  if (!p) return gagal("Sesi berakhir. Silakan masuk lagi.");
  const galat: Record<string, string> = {};
  const lemah = cekKekuatanSandi(baru);
  if (lemah) galat.baru = lemah;
  else if (baru !== ulang) galat.ulang = "Ulangi kata sandi baru yang sama.";
  if (baru && baru === lama) galat.baru = "Kata sandi baru harus berbeda dari yang lama.";
  const data = (await bacaSemuaPengguna()).find((x) => x.id === p.id);
  if (!data || !(await cocokSandi(lama, data.hashSandi))) galat.lama = "Kata sandi lama salah.";
  if (Object.keys(galat).length) return gagal("Kata sandi belum diganti.", galat);

  const hash = await hashSandi(baru);
  let versi = 1;
  await ubahSemuaPengguna((semua) =>
    semua.map((x) => {
      if (x.id !== p.id) return x;
      versi = x.versiSesi + 1;
      return { ...x, hashSandi: hash, versiSesi: versi };
    }),
  );
  await pasangSesi(p.id, versi, false); // perangkat lain otomatis keluar, perangkat ini tetap masuk
  await catatAktivitas(p, "akun", "akun", { ket: "Mengganti kata sandi" });
  return { ok: true, pesan: "Kata sandi diganti. Perangkat lain otomatis keluar." };
}

export async function keluarSemuaPerangkat(): Promise<HasilAksi> {
  const p = await penggunaSaatIni();
  if (!p) return gagal("Sesi berakhir.");
  let versi = 1;
  await ubahSemuaPengguna((semua) =>
    semua.map((x) => {
      if (x.id !== p.id) return x;
      versi = x.versiSesi + 1;
      return { ...x, versiSesi: versi };
    }),
  );
  await pasangSesi(p.id, versi, false);
  await catatAktivitas(p, "akun", "akun", { ket: "Keluar dari semua perangkat lain" });
  return { ok: true, pesan: "Semua perangkat lain sudah dikeluarkan." };
}

/* ---------- Kelola pengguna (admin) ---------- */

async function adminSaja() {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (p.peran !== "admin") return "Hanya admin yang bisa mengelola akun.";
  return p;
}

const jumlahAdminAktif = (semua: Pengguna[]) => semua.filter((x) => x.peran === "admin" && x.aktif).length;

export async function tambahPengguna(data: { nama: string; username: string; peran: string; sandi: string }): Promise<HasilAksi> {
  const admin = await adminSaja();
  if (typeof admin === "string") return gagal(admin);
  const nama = data.nama.trim().replace(/\s+/g, " ");
  const username = normalUsername(data.username);
  const galat: Record<string, string> = {};
  if (nama.length < 3 || nama.length > 60) galat.nama = "Nama 3–60 karakter.";
  if (!usernameValid(username)) galat.username = "3–32 karakter: huruf kecil, angka, titik, atau garis bawah.";
  if (!peranSah(data.peran)) galat.peran = "Pilih peran.";
  const lemah = cekKekuatanSandi(data.sandi);
  if (lemah) galat.sandi = lemah;
  if (!galat.username && (await bacaSemuaPengguna()).some((x) => x.username === username)) galat.username = "Nama pengguna sudah dipakai.";
  if (Object.keys(galat).length) return gagal("Akun belum dibuat.", galat);

  const baru = penggunaBaru({ nama, username, peran: data.peran as Peran, hashSandi: await hashSandi(data.sandi) });
  let bentrok = false;
  await ubahSemuaPengguna((semua) => {
    if (semua.some((x) => x.username === username)) {
      bentrok = true;
      return semua;
    }
    return [...semua, baru];
  });
  if (bentrok) return gagal("Akun belum dibuat.", { username: "Nama pengguna sudah dipakai." });
  await catatAktivitas(admin, "akun", "pengguna", { target: nama, targetId: baru.id, ket: `Akun ${LABEL_PERAN[baru.peran]} dibuat` });
  return { ok: true, id: baru.id, pesan: `Akun ${nama} dibuat. Berikan nama pengguna dan kata sandinya secara langsung.` };
}

export async function ubahPengguna(id: string, data: { nama: string; peran: string; aktif: boolean }): Promise<HasilAksi> {
  const admin = await adminSaja();
  if (typeof admin === "string") return gagal(admin);
  const nama = data.nama.trim().replace(/\s+/g, " ");
  if (nama.length < 3 || nama.length > 60) return gagal("Periksa isian.", { nama: "Nama 3–60 karakter." });
  if (!peranSah(data.peran)) return gagal("Periksa isian.", { peran: "Pilih peran." });

  let pesanGagal = "";
  let target: Pengguna | undefined;
  await ubahSemuaPengguna((semua) => {
    target = semua.find((x) => x.id === id);
    if (!target) {
      pesanGagal = "Akun tidak ditemukan.";
      return semua;
    }
    if (id === admin.id && (data.peran !== "admin" || !data.aktif)) {
      pesanGagal = "Anda tidak bisa menurunkan peran atau menonaktifkan akun sendiri.";
      return semua;
    }
    const sesudah = semua.map((x) =>
      x.id === id
        ? { ...x, nama, peran: data.peran as Peran, aktif: data.aktif, versiSesi: data.aktif ? x.versiSesi : x.versiSesi + 1 }
        : x,
    );
    if (jumlahAdminAktif(sesudah) === 0) {
      pesanGagal = "Harus ada minimal satu admin yang aktif.";
      return semua;
    }
    return sesudah;
  });
  if (pesanGagal) return gagal(pesanGagal);
  await catatAktivitas(admin, "akun", "pengguna", {
    target: nama,
    targetId: id,
    ket: `${LABEL_PERAN[data.peran as Peran]}, ${data.aktif ? "aktif" : "nonaktif"}`,
  });
  return { ok: true, pesan: `Akun ${nama} diperbarui.` };
}

export async function aturUlangSandi(id: string, sandi: string): Promise<HasilAksi> {
  const admin = await adminSaja();
  if (typeof admin === "string") return gagal(admin);
  const lemah = cekKekuatanSandi(sandi);
  if (lemah) return gagal("Kata sandi belum diganti.", { sandi: lemah });
  const hash = await hashSandi(sandi);
  let nama = "";
  await ubahSemuaPengguna((semua) =>
    semua.map((x) => {
      if (x.id !== id) return x;
      nama = x.nama;
      return { ...x, hashSandi: hash, versiSesi: x.versiSesi + 1 };
    }),
  );
  if (!nama) return gagal("Akun tidak ditemukan.");
  if (id === admin.id) {
    const saya = (await bacaSemuaPengguna()).find((x) => x.id === id);
    if (saya) await pasangSesi(id, saya.versiSesi, false);
  }
  await catatAktivitas(admin, "akun", "pengguna", { target: nama, targetId: id, ket: "Kata sandi diatur ulang" });
  return { ok: true, pesan: `Kata sandi ${nama} diatur ulang. Sesi lamanya otomatis berakhir.` };
}

export async function hapusPengguna(id: string): Promise<HasilAksi> {
  const admin = await adminSaja();
  if (typeof admin === "string") return gagal(admin);
  if (id === admin.id) return gagal("Anda tidak bisa menghapus akun sendiri.");
  let pesanGagal = "";
  let nama = "";
  await ubahSemuaPengguna((semua) => {
    const t = semua.find((x) => x.id === id);
    if (!t) {
      pesanGagal = "Akun tidak ditemukan.";
      return semua;
    }
    nama = t.nama;
    const sesudah = semua.filter((x) => x.id !== id);
    if (jumlahAdminAktif(sesudah) === 0) {
      pesanGagal = "Harus ada minimal satu admin yang aktif.";
      return semua;
    }
    return sesudah;
  });
  if (pesanGagal) return gagal(pesanGagal);
  await catatAktivitas(admin, "akun", "pengguna", { target: nama, targetId: id, ket: "Akun dihapus" });
  return { ok: true, pesan: `Akun ${nama} dihapus.` };
}
