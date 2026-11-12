/**
 * Isi halaman Kesiswaan. Semua item bertanda `contoh: true` adalah data contoh.
 */
export type KategoriEkskul = "Organisasi" | "Olahraga" | "Seni" | "Keagamaan" | "Sains dan bahasa";

export type Ekskul = {
  nama: string;
  kategori: KategoriEkskul;
  deskripsi: string;
  jadwal: string;
  gambar?: string;
  ikon: "tenda" | "bendera" | "hati" | "musik" | "bulan" | "voli" | "bola" | "mikroskop" | "bahasa" | "buku";
  wajib?: boolean;
  contoh: boolean;
};

export const EKSKUL: Ekskul[] = [
  { nama: "Pramuka", kategori: "Organisasi", deskripsi: "Ekstrakurikuler wajib untuk kelas X: kepemimpinan, kemandirian, dan kerja regu.", jadwal: "Sabtu, 14.00 WITA", ikon: "tenda", wajib: true, contoh: true },
  { nama: "Paskibra", kategori: "Organisasi", deskripsi: "Latihan baris-berbaris dan pengibaran bendera untuk upacara dan lomba.", jadwal: "Selasa dan Kamis, 15.00 WITA", gambar: "/images/sekolah/paskibra-hormat.jpg", ikon: "bendera", contoh: true },
  { nama: "Seni tari", kategori: "Seni", deskripsi: "Tari daerah Samawa dan tari kreasi untuk pentas sekolah dan festival.", jadwal: "Rabu, 15.00 WITA", gambar: "/images/sekolah/karnaval-kostum-emas.jpg", ikon: "musik", contoh: true },
  { nama: "Rohis dan hadroh", kategori: "Keagamaan", deskripsi: "Kajian keislaman, tadarus, dan latihan hadroh untuk peringatan hari besar.", jadwal: "Jumat, 14.00 WITA", ikon: "bulan", contoh: true },
  { nama: "Bola voli", kategori: "Olahraga", deskripsi: "Pembinaan tim putra dan putri untuk turnamen antarsekolah dan O2SN.", jadwal: "Senin dan Rabu, 15.30 WITA", ikon: "voli", contoh: true },
  { nama: "Futsal", kategori: "Olahraga", deskripsi: "Latihan teknik dasar, taktik, dan kebugaran.", jadwal: "Kamis, 15.30 WITA", ikon: "bola", contoh: true },
  { nama: "Palang Merah Remaja", kategori: "Organisasi", deskripsi: "Pertolongan pertama, kesehatan remaja, dan kegiatan kemanusiaan.", jadwal: "Sabtu, 13.00 WITA", ikon: "hati", contoh: true },
  { nama: "Karya Ilmiah Remaja", kategori: "Sains dan bahasa", deskripsi: "Penelitian sederhana, olimpiade sains, dan lomba karya tulis.", jadwal: "Selasa, 14.30 WITA", ikon: "mikroskop", contoh: true },
  { nama: "English club", kategori: "Sains dan bahasa", deskripsi: "Percakapan, debat, dan persiapan lomba bahasa Inggris.", jadwal: "Kamis, 14.30 WITA", ikon: "bahasa", contoh: true },
  { nama: "Literasi dan jurnalistik", kategori: "Sains dan bahasa", deskripsi: "Menulis berita sekolah, mading, dan konten media sosial sekolah.", jadwal: "Rabu, 14.30 WITA", ikon: "buku", contoh: true },
];

export const KATEGORI_EKSKUL: KategoriEkskul[] = ["Organisasi", "Olahraga", "Seni", "Keagamaan", "Sains dan bahasa"];

export type Prestasi = { tahun: string; judul: string; tingkat: string; bidang: string; contoh: boolean };

export const PRESTASI: Prestasi[] = [
  { tahun: "2023", judul: "Juara III Accounting Week UTS 5", tingkat: "Nasional", bidang: "Akuntansi", contoh: false },
  { tahun: "2026", judul: "Juara 1 lomba hadroh", tingkat: "Kecamatan", bidang: "Keagamaan", contoh: true },
  { tahun: "2026", judul: "Juara 2 lomba keterampilan baris-berbaris", tingkat: "Kabupaten", bidang: "Paskibra", contoh: true },
  { tahun: "2025", judul: "Finalis olimpiade sains bidang biologi", tingkat: "Kabupaten", bidang: "Akademik", contoh: true },
  { tahun: "2025", judul: "Juara 3 bola voli putri O2SN", tingkat: "Kabupaten", bidang: "Olahraga", contoh: true },
  { tahun: "2025", judul: "Penampil terbaik festival tari daerah", tingkat: "Kabupaten", bidang: "Seni", contoh: true },
  { tahun: "2024", judul: "Juara 2 lomba pidato bahasa Indonesia", tingkat: "Kabupaten", bidang: "Bahasa", contoh: true },
];

export const OSIS = {
  ringkas:
    "OSIS menjadi wadah siswa belajar berorganisasi: merencanakan kegiatan, memimpin rapat, dan melayani teman-temannya.",
  bidang: [
    { nama: "Keimanan dan budi pekerti", teks: "Kegiatan keagamaan, peringatan hari besar, dan pembiasaan akhlak." },
    { nama: "Kepemimpinan dan organisasi", teks: "Latihan dasar kepemimpinan, rapat kerja, dan regenerasi pengurus." },
    { nama: "Seni, olahraga, dan kreativitas", teks: "Porseni, pentas seni, dan lomba antarkelas." },
    { nama: "Lingkungan dan kewirausahaan", teks: "Sekolah hijau, bank sampah, dan bazar siswa." },
  ],
  contoh: true,
};

export const TATA_TERTIB = {
  butir: [
    { judul: "Kehadiran", isi: ["Siswa hadir paling lambat pukul 07.10 WITA.", "Izin tidak masuk disampaikan orang tua kepada wali kelas.", "Siswa yang terlambat melapor ke guru piket."] },
    { judul: "Seragam dan penampilan", isi: ["Seragam dipakai sesuai jadwal harian.", "Rambut rapi dan sopan, atribut sekolah lengkap.", "Sepatu hitam dan kaus kaki putih pada hari biasa."] },
    { judul: "Sikap dan pergaulan", isi: ["Menghormati guru, tenaga kependidikan, dan sesama siswa.", "Tidak melakukan perundungan dalam bentuk apa pun, termasuk di media sosial.", "Menjaga kebersihan kelas dan lingkungan sekolah."] },
    { judul: "Telepon genggam", isi: ["Telepon genggam hanya dipakai untuk pembelajaran atas izin guru.", "Di luar itu, telepon disimpan dalam mode senyap."] },
  ],
  contoh: true,
};

export const LAYANAN_BK = {
  ringkas:
    "Guru bimbingan konseling mendampingi siswa dalam urusan belajar, pribadi, sosial, dan perencanaan karier.",
  layanan: [
    { nama: "Konseling pribadi", teks: "Ruang aman untuk bercerita dan mencari jalan keluar bersama." },
    { nama: "Bimbingan belajar", teks: "Cara belajar efektif dan pendampingan bagi yang tertinggal." },
    { nama: "Perencanaan karier", teks: "Info kuliah, beasiswa, dan dunia kerja untuk kelas XII." },
  ],
  contoh: true,
};
