/** Poin pelanggaran tata tertib siswa. Aman dipakai di server maupun klien. */

/** Satu jenis pelanggaran. Bila min < maks, guru memilih poin di dalam rentang itu. */
export type JenisPelanggaran = { no: number; nama: string; min: number; maks: number };
/** Tingkat sanksi berdasarkan total poin semester. */
export type Tingkat = { kode: string; dari: number; sampai: number; sanksi: string };
export type AturanPoin = { pelanggaran: JenisPelanggaran[]; tingkat: Tingkat[]; diubah?: string; oleh?: string };

/** Satu catatan pelanggaran. Disimpan per semester di data/privat/poin/<semester>.json. */
export type CatatanPoin = {
  id: string;
  /** YYYY-MM-DD (WITA) tanggal kejadian. */
  tanggal: string;
  siswa: { id: string; nama: string; kelas: string; nisn: string };
  pelanggaran: { no: number; nama: string };
  /** Poin yang dipilih (dalam rentang), sebelum dikali 2. */
  poinDasar: number;
  /** Tidak melapor ke petugas → poin dikali 2 (aturan buku saku). */
  tidakLapor: boolean;
  /** Poin akhir yang dihitung. */
  poin: number;
  ket?: string;
  oleh: { id: string; nama: string };
  waktu: string;
  /** Catatan pembinaan / tindak lanjut (guru BK, wali kelas, admin). */
  tindakLanjut?: { teks: string; oleh: string; waktu: string }[];
  /** Diisi bila catatan dibatalkan (salah input). Tidak dihitung, tetap disimpan sebagai bukti. */
  batal?: { waktu: string; oleh: string; alasan?: string };
};

/** Sumber: Buku Saku SMAN 1 Brang Rea (disahkan 21 Juli 2023). Admin bisa mengubahnya di dashboard. */
export const PELANGGARAN_BAWAAN: JenisPelanggaran[] = [
  { no: 1, nama: "Terlambat masuk kelas", min: 5, maks: 5 },
  { no: 2, nama: "Tidak memakai ikat pinggang", min: 5, maks: 5 },
  { no: 3, nama: "Tidak mengerjakan/melaksanakan tugas", min: 10, maks: 10 },
  { no: 4, nama: "Berbelanja saat pelajaran berlangsung", min: 5, maks: 5 },
  { no: 5, nama: "Merusak bunga/taman sekolah", min: 10, maks: 10 },
  { no: 6, nama: "Tidak mengikuti upacara bendera", min: 10, maks: 10 },
  { no: 7, nama: "Tidak mengikuti kegiatan sekolah", min: 10, maks: 10 },
  { no: 8, nama: "Tidak memasukkan baju bagi siswa laki-laki", min: 10, maks: 10 },
  { no: 9, nama: "Tidak memakai sepatu/memakai sepatu tidak semestinya", min: 10, maks: 10 },
  { no: 10, nama: "Tidak membawa buku catatan", min: 10, maks: 10 },
  { no: 11, nama: "Tidak mengikuti satu mata pelajaran dalam satu hari", min: 15, maks: 15 },
  { no: 12, nama: "Keluar tanpa izin dari ruang belajar", min: 15, maks: 15 },
  { no: 13, nama: "Memalsukan/meniru tanda tangan guru, wali kelas, kepala sekolah", min: 30, maks: 30 },
  { no: 14, nama: "Tidak ikut salat berjamaah", min: 25, maks: 25 },
  { no: 15, nama: "Membolos", min: 20, maks: 20 },
  { no: 16, nama: "Tidak masuk sekolah tanpa izin/Alpa", min: 10, maks: 10 },
  { no: 17, nama: "Menulis/mencoret dinding sekolah", min: 20, maks: 20 },
  { no: 18, nama: "Menulis/mencoret meja/kursi sekolah", min: 20, maks: 20 },
  { no: 19, nama: "Menulis/mencoret pakaian sekolah", min: 15, maks: 15 },
  { no: 20, nama: "Tidak memakai seragam sekolah", min: 15, maks: 15 },
  { no: 21, nama: "Membuang sampah tidak pada tempatnya", min: 10, maks: 10 },
  { no: 22, nama: "Membawa handphone (HP) + denda Rp100.000", min: 40, maks: 40 },
  { no: 23, nama: "Memakai aksesori bagi siswa laki-laki", min: 10, maks: 10 },
  { no: 24, nama: "Memakai make-up bagi siswa laki-laki", min: 30, maks: 30 },
  { no: 25, nama: "Menyemir rambut selain warna hitam", min: 20, maks: 40 },
  { no: 26, nama: "Berambut panjang dan model tidak sopan bagi siswa laki-laki", min: 20, maks: 40 },
  { no: 27, nama: "Melubangi daun telinga bagi siswa laki-laki", min: 100, maks: 100 },
  { no: 28, nama: "Merokok di sekolah", min: 50, maks: 50 },
  { no: 29, nama: "Menyinggung perasaan guru (dengan sengaja)", min: 25, maks: 50 },
  { no: 30, nama: "Berkelahi", min: 20, maks: 80 },
  { no: 31, nama: "Membawa senjata tajam/senjata api", min: 20, maks: 100 },
  { no: 32, nama: "Merusak barang milik sekolah", min: 25, maks: 50 },
  { no: 33, nama: "Merusak barang milik guru", min: 25, maks: 50 },
  { no: 34, nama: "Membaca dan membawa bacaan/gambar/kaset/CD berbau pornografi", min: 100, maks: 100 },
  { no: 35, nama: "Mencuri barang milik teman/orang lain", min: 20, maks: 80 },
  { no: 36, nama: "Mencuri barang milik sekolah", min: 20, maks: 80 },
  { no: 37, nama: "Membawa/mengonsumsi minuman keras", min: 100, maks: 100 },
  { no: 38, nama: "Mengancam guru", min: 100, maks: 100 },
  { no: 39, nama: "Membuat keributan yang mengakibatkan kepanikan di sekolah", min: 20, maks: 80 },
  { no: 40, nama: "Dipidana/berurusan dengan aparat", min: 100, maks: 100 },
  { no: 41, nama: "Melakukan pergaulan bebas/asusila", min: 100, maks: 100 },
  { no: 42, nama: "Tato", min: 100, maks: 100 },
  { no: 43, nama: "Meloncat pagar", min: 30, maks: 30 },
  { no: 44, nama: "Merombak pakaian", min: 30, maks: 30 },
  { no: 45, nama: "Berjilbab tidak boleh kelihatan rambut (wanita)", min: 20, maks: 20 },
  { no: 46, nama: "Memakai jilbab tidak semestinya", min: 20, maks: 20 },
  { no: 47, nama: "Memakai pakaian ketat", min: 30, maks: 30 },
  { no: 48, nama: "Tidak memakai atribut upacara", min: 10, maks: 10 },
  { no: 49, nama: "Mewarnai kuku", min: 15, maks: 15 },
  { no: 50, nama: "Tidak pakai kaos kaki", min: 10, maks: 10 },
  { no: 51, nama: "Keluar tanpa izin dari lingkungan sekolah", min: 20, maks: 20 },
  { no: 52, nama: "Tawuran", min: 100, maks: 100 },
  { no: 53, nama: "Narkoba", min: 100, maks: 100 },
  { no: 54, nama: "Berpacaran", min: 50, maks: 50 },
  { no: 55, nama: "Memakai make-up berlebihan", min: 15, maks: 30 },
  { no: 56, nama: "Berbohong", min: 20, maks: 50 },
  { no: 57, nama: "Membuli", min: 20, maks: 50 },
  { no: 58, nama: "Tidur di kelas", min: 5, maks: 20 },
  { no: 59, nama: "Tidak berpakaian rapi", min: 5, maks: 10 },
];

export const TINGKAT_BAWAAN: Tingkat[] = [
  { kode: "A", dari: 0, sampai: 19, sanksi: "Peringatan lisan" },
  { kode: "B", dari: 20, sampai: 39, sanksi: "Hukuman ringan" },
  { kode: "C", dari: 40, sampai: 59, sanksi: "Membuat surat pernyataan yang ditembuskan kepada orang tua/wali" },
  { kode: "D", dari: 60, sampai: 79, sanksi: "Tidak diperkenankan mengikuti pelajaran sementara waktu (skorsing)" },
  { kode: "E", dari: 80, sampai: 95, sanksi: "Dititipkan sementara kepada orang tua/wali murid" },
  { kode: "F", dari: 100, sampai: 100, sanksi: "Dikeluarkan dari sekolah" },
];

export const ATURAN_BAWAAN: AturanPoin = { pelanggaran: PELANGGARAN_BAWAAN, tingkat: TINGKAT_BAWAAN };

/** Semester dari tanggal: Juli–Desember = Ganjil, Januari–Juni = Genap. Poin direset tiap semester. */
export function semesterDari(tanggal: string): { kunci: string; label: string; dari: string; sampai: string } {
  const y = Number(tanggal.slice(0, 4));
  const m = Number(tanggal.slice(5, 7));
  if (m >= 7) return { kunci: `${y}-ganjil`, label: `Semester Ganjil ${y}/${y + 1}`, dari: `${y}-07-01`, sampai: `${y}-12-31` };
  return { kunci: `${y}-genap`, label: `Semester Genap ${y - 1}/${y}`, dari: `${y}-01-01`, sampai: `${y}-06-30` };
}

export const semesterSah = (k: unknown): k is string => typeof k === "string" && /^\d{4}-(ganjil|genap)$/.test(k);

/** Semester sebelumnya (untuk pilihan riwayat). */
export function semesterSebelum(kunci: string): string {
  const [y, s] = kunci.split("-");
  return s === "genap" ? `${Number(y) - 1}-ganjil` : `${y}-genap`;
}

export function labelSemester(kunci: string): string {
  const [y, s] = kunci.split("-");
  return semesterDari(`${y}-${s === "ganjil" ? "07" : "01"}-01`).label;
}

/** Tingkat untuk total poin (poin di atas tingkat terakhir ikut tingkat terakhir). */
export function tingkatDari(poin: number, tingkat: Tingkat[]): Tingkat {
  const urut = [...tingkat].sort((a, b) => a.dari - b.dari);
  let hasil = urut[0];
  for (const t of urut) if (poin >= t.dari) hasil = t;
  return hasil;
}

/** Warna lencana per tingkat: A–B hijau/biru, C kuning, D ke atas merah. */
export function warnaTingkat(poin: number, tingkat: Tingkat[]): "hijau" | "biru" | "kuning" | "merah" {
  const urut = [...tingkat].sort((a, b) => a.dari - b.dari);
  const i = urut.indexOf(tingkatDari(poin, urut));
  return i <= 0 ? "hijau" : i === 1 ? "biru" : i === 2 ? "kuning" : "merah";
}

/** Mulai tingkat ke-3 (C, surat pernyataan) sekolah menyiapkan surat untuk orang tua. */
export function perluSurat(poin: number, tingkat: Tingkat[]): boolean {
  const urut = [...tingkat].sort((a, b) => a.dari - b.dari);
  return urut.length >= 3 && poin >= urut[2].dari;
}

export const labelPoin = (p: JenisPelanggaran) => (p.min === p.maks ? `${p.min}` : `${p.min}–${p.maks}`);

/** "0–19 poin", atau "100+ poin" untuk tingkat terakhir dengan satu angka. */
export const rentangTingkat = (t: Tingkat) => (t.dari === t.sampai ? `${t.dari}+` : `${t.dari}–${t.sampai}`);
