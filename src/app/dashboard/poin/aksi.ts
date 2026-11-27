"use server";

import { revalidatePath } from "next/cache";
import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { boleh } from "@/lib/cms/peran";
import { bacaSiswa } from "@/lib/server/absensi";
import { bacaAturanPoin, bacaPoinSemester, simpanAturanPoin, tambahCatatanPoin, ubahCatatanPoin } from "@/lib/server/poin";
import { tanggalIni, tanggalSah } from "@/lib/absensi/tipe";
import { semesterDari, semesterSah, type CatatanPoin, type JenisPelanggaran, type Tingkat } from "@/lib/poin/tipe";

async function petugas(modul = "poin"): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi berakhir. Silakan masuk lagi.";
  if (!boleh(p.peran, modul)) return "Akun Anda tidak punya akses ke fitur ini.";
  return p;
}

export type HasilPoin = { ok: true; catatan: CatatanPoin; pesan: string } | { ok: false; pesan: string };

/** Catat satu pelanggaran. Poin = poin dipilih (dalam rentang) × 2 bila siswa tidak melapor. */
export async function catatPelanggaran(input: {
  siswaId: string;
  no: number;
  poin: number;
  tidakLapor: boolean;
  tanggal: string;
  ket?: string;
}): Promise<HasilPoin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  const hariIni = tanggalIni();
  const tanggal = tanggalSah(input.tanggal) ? input.tanggal : hariIni;
  if (tanggal > hariIni) return { ok: false, pesan: "Tanggal kejadian tidak boleh di masa depan." };
  const sem = semesterDari(hariIni);
  if (tanggal < sem.dari) return { ok: false, pesan: "Tanggal kejadian harus di semester ini." };

  const s = (await bacaSiswa()).find((x) => x.id === input.siswaId && x.aktif);
  if (!s) return { ok: false, pesan: "Siswa tidak ditemukan atau sudah tidak aktif." };
  const jenis = (await bacaAturanPoin()).pelanggaran.find((x) => x.no === Number(input.no));
  if (!jenis) return { ok: false, pesan: "Pilih jenis pelanggaran." };
  const dasar = Math.round(Number(input.poin));
  if (!Number.isFinite(dasar) || dasar < jenis.min || dasar > jenis.maks)
    return { ok: false, pesan: `Poin untuk "${jenis.nama}" harus ${jenis.min}${jenis.min === jenis.maks ? "" : `–${jenis.maks}`}.` };
  const ket = String(input.ket ?? "").trim().replace(/\s+/g, " ").slice(0, 300);
  const tidakLapor = Boolean(input.tidakLapor);

  const catatan = await tambahCatatanPoin(sem.kunci, {
    tanggal,
    siswa: { id: s.id, nama: s.nama, kelas: s.kelas, nisn: s.nisn },
    pelanggaran: { no: jenis.no, nama: jenis.nama },
    poinDasar: dasar,
    tidakLapor,
    poin: tidakLapor ? dasar * 2 : dasar,
    ket: ket || undefined,
    oleh: { id: p.id, nama: p.nama },
    waktu: new Date().toISOString(),
  });
  await catatAktivitas(p, "buat", "poin", { target: s.nama, targetId: catatan.id, ket: `${jenis.nama} (+${catatan.poin})` });
  revalidatePath("/dashboard/poin", "layout");
  return { ok: true, catatan, pesan: `${s.nama}: ${jenis.nama} +${catatan.poin} poin tercatat.` };
}

/** Tambah catatan pembinaan / tindak lanjut pada satu pelanggaran. */
export async function tambahTindakLanjut(semester: string, id: string, teks: string): Promise<HasilPoin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!semesterSah(semester)) return { ok: false, pesan: "Semester tidak sah." };
  const t = String(teks ?? "").trim().replace(/\s+/g, " ").slice(0, 400);
  if (t.length < 3) return { ok: false, pesan: "Tulis tindak lanjutnya." };
  const c = await ubahCatatanPoin(semester, id, (x) => ({
    ...x,
    tindakLanjut: [...(x.tindakLanjut ?? []), { teks: t, oleh: p.nama, waktu: new Date().toISOString() }],
  }));
  if (!c) return { ok: false, pesan: "Catatan tidak ditemukan." };
  await catatAktivitas(p, "ubah", "poin", { target: c.siswa.nama, targetId: id, ket: `Tindak lanjut: ${t}` });
  revalidatePath("/dashboard/poin", "layout");
  return { ok: true, catatan: c, pesan: "Tindak lanjut disimpan." };
}

/** Batalkan catatan yang salah input. Oleh pencatatnya sendiri, guru BK, atau admin. Catatan tetap disimpan. */
export async function batalkanPelanggaran(semester: string, id: string, alasan: string): Promise<HasilPoin> {
  const p = await petugas();
  if (typeof p === "string") return { ok: false, pesan: p };
  if (!semesterSah(semester)) return { ok: false, pesan: "Semester tidak sah." };
  const ada = (await bacaPoinSemester(semester)).find((c) => c.id === id);
  if (!ada) return { ok: false, pesan: "Catatan tidak ditemukan." };
  if (ada.batal) return { ok: false, pesan: "Catatan ini sudah dibatalkan." };
  if (p.peran !== "admin" && p.peran !== "bk" && ada.oleh.id !== p.id)
    return { ok: false, pesan: "Hanya guru yang mencatat, guru BK, atau admin yang bisa membatalkan." };
  const a = String(alasan ?? "").trim().slice(0, 200);
  const c = await ubahCatatanPoin(semester, id, (x) => ({ ...x, batal: { waktu: new Date().toISOString(), oleh: p.nama, alasan: a || undefined } }));
  if (!c) return { ok: false, pesan: "Catatan tidak ditemukan." };
  await catatAktivitas(p, "hapus", "poin", { target: ada.siswa.nama, targetId: id, ket: `${ada.pelanggaran.nama} dibatalkan${a ? `: ${a}` : ""}` });
  revalidatePath("/dashboard/poin", "layout");
  return { ok: true, catatan: c, pesan: "Catatan dibatalkan dan tidak dihitung lagi." };
}

export type HasilAturan = { ok: true; pesan: string } | { ok: false; pesan: string };

/** Admin mengubah daftar pelanggaran dan tingkat sanksi (bila buku saku direvisi). */
export async function simpanAturan(input: { pelanggaran: JenisPelanggaran[]; tingkat: Tingkat[] }): Promise<HasilAturan> {
  const p = await petugas("poin-aturan");
  if (typeof p === "string") return { ok: false, pesan: p };
  const pel: JenisPelanggaran[] = [];
  const nomor = new Set<number>();
  for (const x of input.pelanggaran ?? []) {
    const nama = String(x.nama ?? "").trim().replace(/\s+/g, " ").slice(0, 150);
    if (!nama) continue;
    const min = Math.round(Number(x.min));
    const maks = Math.round(Number(x.maks));
    if (!Number.isFinite(min) || !Number.isFinite(maks) || min < 1 || maks < min || maks > 1000)
      return { ok: false, pesan: `Poin "${nama}" tidak benar (minimal 1, dan batas atas tidak boleh lebih kecil).` };
    // Nomor lama dipertahankan supaya catatan lama tetap cocok; baris baru dapat nomor berikutnya.
    let no = Math.round(Number(x.no));
    if (!Number.isFinite(no) || no < 1 || nomor.has(no)) no = Math.max(0, ...nomor, ...(input.pelanggaran ?? []).map((y) => Number(y.no) || 0)) + 1;
    nomor.add(no);
    pel.push({ no, nama, min, maks });
  }
  if (!pel.length) return { ok: false, pesan: "Daftar pelanggaran tidak boleh kosong." };

  const tk: Tingkat[] = (input.tingkat ?? [])
    .map((t) => ({
      kode: String(t.kode ?? "").trim().slice(0, 4),
      dari: Math.round(Number(t.dari)),
      sampai: Math.round(Number(t.sampai)),
      sanksi: String(t.sanksi ?? "").trim().replace(/\s+/g, " ").slice(0, 200),
    }))
    .filter((t) => t.kode && t.sanksi)
    .sort((a, b) => a.dari - b.dari);
  if (tk.length < 2) return { ok: false, pesan: "Isi minimal dua tingkat sanksi." };
  for (const t of tk) if (!Number.isFinite(t.dari) || !Number.isFinite(t.sampai) || t.sampai < t.dari) return { ok: false, pesan: `Rentang poin tingkat ${t.kode} tidak benar.` };

  await simpanAturanPoin({ pelanggaran: pel, tingkat: tk, diubah: new Date().toISOString(), oleh: p.nama });
  await catatAktivitas(p, "ubah", "poin", { target: "Aturan tata tertib", ket: `${pel.length} pelanggaran, ${tk.length} tingkat` });
  revalidatePath("/dashboard/poin", "layout");
  return { ok: true, pesan: "Aturan tata tertib disimpan." };
}
