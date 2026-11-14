"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { idBaru } from "@/lib/server/penyimpanan";
import { boleh } from "@/lib/cms/peran";
import { bacaTanggalLahir, nisnSah, rapikanKelas, rapikanNama, ubahSiswa } from "@/lib/server/absensi";
import type { Siswa } from "@/lib/absensi/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "siswa")) return "Akun Anda tidak punya akses ke data siswa.";
  return p;
}

export type InputSiswa = { nisn: string; nama: string; kelas: string; tglLahir?: string; kodeQr?: string; aktif?: boolean };
export type HasilSiswa = { ok: true; pesan: string } | { ok: false; pesan: string; galat?: Record<string, string> };

/** NISN dari Excel sering kehilangan angka 0 di depan: 8–9 digit dilengkapi jadi 10. */
const rapikanNisn = (n: string) => {
  const a = String(n ?? "").replace(/\D/g, "");
  return a.length >= 8 && a.length < 10 ? a.padStart(10, "0") : a;
};

function periksa(input: InputSiswa) {
  const galat: Record<string, string> = {};
  const nisn = rapikanNisn(input.nisn);
  const nama = rapikanNama(String(input.nama ?? ""));
  const kelas = rapikanKelas(String(input.kelas ?? ""));
  const tglMentah = String(input.tglLahir ?? "").trim();
  const tglLahir = tglMentah ? bacaTanggalLahir(tglMentah) : null;
  const kodeQr = String(input.kodeQr ?? "").trim().slice(0, 300) || undefined;
  if (!nisnSah(nisn)) galat.nisn = "NISN harus 10 angka.";
  if (nama.length < 2) galat.nama = "Isi nama siswa.";
  if (!kelas) galat.kelas = "Isi kelas, mis. X-1 atau XI IPA 2.";
  if (tglMentah && !tglLahir) galat.tglLahir = "Format tanggal lahir: 17/05/2008 atau 2008-05-17.";
  return { galat, data: { nisn, nama, kelas, tglLahir: tglLahir ?? undefined, kodeQr } };
}

export async function simpanSiswa(id: string | null, input: InputSiswa): Promise<HasilSiswa> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const { galat, data } = periksa(input);
  if (Object.keys(galat).length) return { ok: false, pesan: "Periksa lagi isian yang ditandai.", galat };

  let pesan = "";
  await ubahSiswa((semua) => {
    if (semua.some((s) => s.nisn === data.nisn && s.id !== id)) {
      galat.nisn = "NISN ini sudah dipakai siswa lain.";
      return semua;
    }
    if (data.kodeQr && semua.some((s) => (s.kodeQr === data.kodeQr || s.nisn === data.kodeQr) && s.id !== id)) {
      galat.kodeQr = "Kode QR ini sudah dipakai siswa lain.";
      return semua;
    }
    const kini = new Date().toISOString();
    if (!id) {
      pesan = `${data.nama} ditambahkan.`;
      return [...semua, { id: idBaru(), ...data, aktif: true, dibuat: kini }];
    }
    pesan = `Data ${data.nama} disimpan.`;
    return semua.map((s) => (s.id === id ? { ...s, ...data, aktif: input.aktif ?? s.aktif, diubah: kini } : s));
  });
  if (Object.keys(galat).length) return { ok: false, pesan: Object.values(galat)[0], galat };
  await catatAktivitas(p, id ? "ubah" : "buat", "siswa", { target: data.nama, ket: `NISN ${data.nisn}, kelas ${data.kelas}` });
  return { ok: true, pesan };
}

export async function hapusSiswa(id: string): Promise<HasilSiswa> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  let hapus: Siswa | undefined;
  await ubahSiswa((semua) => {
    hapus = semua.find((s) => s.id === id);
    return semua.filter((s) => s.id !== id);
  });
  if (!hapus) return { ok: false, pesan: "Siswa tidak ditemukan." };
  await catatAktivitas(p, "hapus", "siswa", { target: hapus.nama, ket: `NISN ${hapus.nisn}` });
  return { ok: true, pesan: `${hapus.nama} dihapus dari daftar siswa.` };
}

export type HasilImpor = { ok: boolean; pesan: string; tambah: number; perbarui: number; gagal: { baris: number; isi: string; alasan: string }[] };

const KOLOM: Record<string, keyof InputSiswa> = {
  nisn: "nisn",
  nama: "nama",
  "nama siswa": "nama",
  "nama lengkap": "nama",
  "nama peserta didik": "nama",
  kelas: "kelas",
  rombel: "kelas",
  "rombongan belajar": "kelas",
  "tanggal lahir": "tglLahir",
  "tgl lahir": "tglLahir",
  "tgl. lahir": "tglLahir",
  "kode qr": "kodeQr",
  qr: "kodeQr",
};

/**
 * Impor dari salin-tempel Excel/Google Sheets (dipisah tab) atau CSV (koma/titik koma).
 * Urutan bawaan tanpa judul kolom: NISN, Nama, Kelas, Tanggal lahir, Kode QR.
 * Siswa dengan NISN yang sudah ada diperbarui, bukan digandakan.
 */
export async function imporSiswa(teks: string): Promise<HasilImpor> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p, tambah: 0, perbarui: 0, gagal: [] };

  const baris = String(teks ?? "")
    .slice(0, 2_000_000)
    .split(/\r?\n/)
    .map((b, i) => ({ no: i + 1, b }))
    .filter((x) => x.b.trim());
  if (!baris.length) return { ok: false, pesan: "Tidak ada data untuk diimpor.", tambah: 0, perbarui: 0, gagal: [] };

  const pemisah = baris[0].b.includes("\t") ? "\t" : baris[0].b.includes(";") ? ";" : ",";
  const pecah = (b: string) => b.split(pemisah).map((s) => s.trim().replace(/^"(.*)"$/, "$1"));

  let urutan: (keyof InputSiswa | null)[] = ["nisn", "nama", "kelas", "tglLahir", "kodeQr"];
  const judul = pecah(baris[0].b).map((s) => s.toLowerCase());
  if (judul.some((s) => KOLOM[s] === "nisn") && judul.some((s) => KOLOM[s] === "nama")) {
    urutan = judul.map((s) => KOLOM[s] ?? null);
    baris.shift();
  }

  const gagal: HasilImpor["gagal"] = [];
  const masuk: { no: number; isi: string; data: ReturnType<typeof periksa>["data"] }[] = [];
  const nisnDilihat = new Set<string>();
  for (const { no, b } of baris.slice(0, 3000)) {
    const sel = pecah(b);
    const input: InputSiswa = { nisn: "", nama: "", kelas: "" };
    urutan.forEach((k, i) => {
      if (k && sel[i] !== undefined) (input as Record<string, unknown>)[k] = sel[i];
    });
    const { galat, data } = periksa(input);
    const isi = b.slice(0, 80);
    if (Object.keys(galat).length) gagal.push({ baris: no, isi, alasan: Object.values(galat).join(" ") });
    else if (nisnDilihat.has(data.nisn)) gagal.push({ baris: no, isi, alasan: "NISN dobel di data yang ditempel." });
    else {
      nisnDilihat.add(data.nisn);
      masuk.push({ no, isi, data });
    }
  }

  let tambah = 0;
  let perbarui = 0;
  await ubahSiswa((semua) => {
    const kini = new Date().toISOString();
    const hasil = [...semua];
    for (const m of masuk) {
      const i = hasil.findIndex((s) => s.nisn === m.data.nisn);
      if (i === -1) {
        hasil.push({ id: idBaru(), ...m.data, aktif: true, dibuat: kini });
        tambah++;
      } else {
        const lama = hasil[i];
        hasil[i] = { ...lama, ...m.data, tglLahir: m.data.tglLahir ?? lama.tglLahir, kodeQr: m.data.kodeQr ?? lama.kodeQr, diubah: kini };
        perbarui++;
      }
    }
    return hasil;
  });

  if (tambah || perbarui) await catatAktivitas(p, "buat", "siswa", { target: "Impor data siswa", ket: `${tambah} baru, ${perbarui} diperbarui, ${gagal.length} gagal` });
  const pesan = `${tambah} siswa baru, ${perbarui} diperbarui${gagal.length ? `, ${gagal.length} baris gagal` : ""}.`;
  return { ok: tambah + perbarui > 0, pesan, tambah, perbarui, gagal: gagal.slice(0, 100) };
}
