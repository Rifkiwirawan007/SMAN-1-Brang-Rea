"use server";

import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import {
  bacaAbsenTanggal,
  bacaAturAbsensi,
  bacaSiswa,
  cariDariKode,
  menitDariJam,
  menitWita,
  simpanAturAbsensi,
  tulisAbsen,
} from "@/lib/server/absensi";
import { LABEL_STATUS, masuk, STATUS_ABSEN, tanggalIni, tanggalSah, type CatatanAbsen, type StatusAbsen } from "@/lib/absensi/tipe";

async function petugas(): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, "absensi")) return "Akun Anda tidak punya akses ke absensi.";
  return p;
}

export type HasilScan =
  | {
      ok: true;
      /** baru = baru tercatat; ulang = sudah scan sebelumnya hari ini. */
      jenis: "baru" | "ulang";
      siswa: { id: string; nama: string; kelas: string; nisn: string };
      catatan: CatatanAbsen;
      pesan: string;
    }
  | { ok: false; pesan: string };

/** Dipanggil setiap kali QR terbaca (kamera) atau scanner USB mengetik kode + Enter. Hanya untuk hari ini. */
export async function scanAbsen(kode: string): Promise<HasilScan> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };

  const bersih = String(kode ?? "").trim().slice(0, 300);
  if (!bersih) return { ok: false, pesan: "Kode kosong." };
  const siswa = cariDariKode(bersih, await bacaSiswa());
  if (!siswa) return { ok: false, pesan: `QR tidak dikenal: "${bersih.slice(0, 40)}". Cek data siswa.` };

  const tanggal = tanggalIni();
  const ada = (await bacaAbsenTanggal(tanggal)).find((c) => c.siswaId === siswa.id);
  const ringkas = { id: siswa.id, nama: siswa.nama, kelas: siswa.kelas, nisn: siswa.nisn };
  if (ada && masuk(ada.status)) {
    return { ok: true, jenis: "ulang", siswa: ringkas, catatan: ada, pesan: `${siswa.nama} sudah absen hari ini.` };
  }

  const kini = new Date().toISOString();
  const atur = await bacaAturAbsensi();
  const status: StatusAbsen = menitWita(kini) > menitDariJam(atur.jamMasuk) ? "terlambat" : "hadir";
  // Siswa yang sempat ditandai sakit/izin/alpa lalu datang: status diganti, catatan lama tetap di riwayat.
  const ket = ada ? `Sebelumnya ${LABEL_STATUS[ada.status].toLowerCase()}, lalu scan masuk` : undefined;
  const [catatan] = await tulisAbsen(tanggal, [{ siswaId: siswa.id, status, cara: "scan", jam: kini, ket }], p);
  return { ok: true, jenis: "baru", siswa: ringkas, catatan, pesan: `${siswa.nama} — ${LABEL_STATUS[status]}` };
}

export type HasilUbah = { ok: true; pesan: string; catatan: CatatanAbsen[] } | { ok: false; pesan: string };

/** Guru mengisi/mengubah status manual (mis. sakit dengan surat, atau lupa bawa kartu). */
export async function aturStatusAbsen(siswaIds: string[], tanggal: string, status: StatusAbsen, ket: string): Promise<HasilUbah> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!tanggalSah(tanggal)) return { ok: false, pesan: "Tanggal tidak sah." };
  if (tanggal > tanggalIni()) return { ok: false, pesan: "Tidak bisa mengisi absensi untuk tanggal yang belum tiba." };
  if (!STATUS_ABSEN.includes(status)) return { ok: false, pesan: "Status tidak dikenal." };
  const semua = await bacaSiswa();
  const ids = siswaIds.filter((id) => semua.some((s) => s.id === id));
  if (!ids.length) return { ok: false, pesan: "Siswa tidak ditemukan." };

  const k = String(ket ?? "").trim().slice(0, 300);
  const sebelum = await bacaAbsenTanggal(tanggal);
  const kini = new Date().toISOString();
  const catatan = await tulisAbsen(
    tanggal,
    ids.map((siswaId) => {
      const lama = sebelum.find((c) => c.siswaId === siswaId);
      // Jam hadir dipakai sebagai bukti; diisi saat guru menandai hadir manual pada hari yang sama.
      const jam = masuk(status) ? (lama?.jam ?? (tanggal === tanggalIni() ? kini : undefined)) : lama?.jam;
      return { siswaId, status, cara: "manual" as const, ket: k, jam };
    }),
    p,
  );
  const nama = ids.length === 1 ? semua.find((s) => s.id === ids[0])!.nama : `${ids.length} siswa`;
  await catatAktivitas(p, "ubah", "absensi", { target: nama, ket: `${tanggal}: ${LABEL_STATUS[status]}${k ? ` (${k})` : ""}` });
  return { ok: true, pesan: `${nama} ditandai ${LABEL_STATUS[status].toLowerCase()}.`, catatan };
}

/** Selesai absen: semua siswa (di kelas terpilih) yang belum punya catatan ditandai Alpa. */
export async function tandaiBelumAbsen(tanggal: string, kelas: string): Promise<HasilUbah> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!tanggalSah(tanggal) || tanggal > tanggalIni()) return { ok: false, pesan: "Tanggal tidak sah." };

  const ada = new Set((await bacaAbsenTanggal(tanggal)).map((c) => c.siswaId));
  const sasaran = (await bacaSiswa()).filter((s) => s.aktif && (!kelas || s.kelas === kelas) && !ada.has(s.id));
  if (!sasaran.length) return { ok: true, pesan: "Semua siswa sudah punya catatan.", catatan: [] };

  const catatan = await tulisAbsen(
    tanggal,
    sasaran.map((s) => ({ siswaId: s.id, status: "alpa" as const, cara: "otomatis" as const, ket: "Tidak scan sampai absen ditutup" })),
    p,
    true,
  );
  await catatAktivitas(p, "ubah", "absensi", { target: kelas || "Semua kelas", ket: `${tanggal}: ${catatan.length} siswa ditandai alpa` });
  return { ok: true, pesan: `${catatan.length} siswa yang belum absen ditandai alpa.`, catatan };
}

export async function simpanPengaturanAbsensi(data: { jamMasuk: string; wajibTglLahir: boolean }): Promise<{ ok: boolean; pesan: string }> {
  const p = await penggunaSaatIni();
  if (!p || p.peran !== "admin") return { ok: false, pesan: "Hanya admin yang bisa mengubah pengaturan absensi." };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.jamMasuk)) return { ok: false, pesan: "Jam masuk tidak sah (contoh 07:15)." };
  await simpanAturAbsensi({ jamMasuk: data.jamMasuk, wajibTglLahir: !!data.wajibTglLahir });
  await catatAktivitas(p, "ubah", "absensi", { target: "Pengaturan", ket: `Jam masuk ${data.jamMasuk}${data.wajibTglLahir ? ", cek wajib tanggal lahir" : ""}` });
  return { ok: true, pesan: "Pengaturan absensi disimpan." };
}
