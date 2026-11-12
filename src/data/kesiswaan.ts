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
  /** object-position foto, mis. untuk menyembunyikan judul poster di bagian atas. */
  posisiGambar?: string;
  ikon: "tenda" | "bendera" | "hati" | "musik" | "bulan" | "voli" | "bola" | "mikroskop" | "bahasa" | "buku";
  wajib?: boolean;
  contoh: boolean;
};

export const EKSKUL: Ekskul[] = [
  { nama: "Pramuka", kategori: "Organisasi", deskripsi: "Ekstrakurikuler wajib untuk kelas X: kepemimpinan, kemandirian, dan kerja regu.", jadwal: "Sabtu, 14.00 WITA", ikon: "tenda", wajib: true, contoh: true },
  { nama: "Paskibra", kategori: "Organisasi", deskripsi: "Latihan baris-berbaris dan pengibaran bendera untuk upacara dan lomba.", jadwal: "Selasa dan Kamis, 15.00 WITA", gambar: "/images/sekolah/paskibra-hormat.jpg", ikon: "bendera", contoh: true },
  { nama: "Seni tari", kategori: "Seni", deskripsi: "Tari daerah Samawa dan tari kreasi untuk pentas sekolah dan festival.", jadwal: "Rabu, 15.00 WITA", gambar: "/images/sekolah/karnaval-kostum-emas.jpg", ikon: "musik", contoh: true },
  { nama: "Rohis dan hadroh", kategori: "Keagamaan", deskripsi: "Kajian keislaman, tadarus, dan latihan hadroh untuk peringatan hari besar.", jadwal: "Jumat, 14.00 WITA", gambar: "/images/ekskul/rohis-halal-bihalal.jpg", ikon: "bulan", contoh: true },
  { nama: "Bola voli", kategori: "Olahraga", deskripsi: "Pembinaan tim putra dan putri untuk turnamen antarsekolah dan O2SN.", jadwal: "Senin dan Rabu, 15.30 WITA", ikon: "voli", contoh: true },
  { nama: "Futsal", kategori: "Olahraga", deskripsi: "Latihan teknik dasar, taktik, dan kebugaran.", jadwal: "Kamis, 15.30 WITA", ikon: "bola", contoh: true },
  { nama: "Palang Merah Remaja", kategori: "Organisasi", deskripsi: "Pertolongan pertama, kesehatan remaja, dan kegiatan kemanusiaan.", jadwal: "Sabtu, 13.00 WITA", gambar: "/images/ekskul/pmr-aksi-bergizi.jpg", ikon: "hati", contoh: true },
  { nama: "Karya Ilmiah Remaja", kategori: "Sains dan bahasa", deskripsi: "Penelitian sederhana, olimpiade sains, dan lomba karya tulis.", jadwal: "Selasa, 14.30 WITA", ikon: "mikroskop", contoh: true },
  { nama: "English club", kategori: "Sains dan bahasa", deskripsi: "Percakapan, debat, dan persiapan lomba bahasa Inggris.", jadwal: "Kamis, 14.30 WITA", ikon: "bahasa", contoh: true },
  { nama: "Literasi dan jurnalistik", kategori: "Sains dan bahasa", deskripsi: "Menulis berita sekolah, mading, dan konten media sosial sekolah.", jadwal: "Rabu, 14.30 WITA", ikon: "buku", contoh: true },
];

export const KATEGORI_EKSKUL: KategoriEkskul[] = ["Organisasi", "Olahraga", "Seni", "Keagamaan", "Sains dan bahasa"];

/** `tingkat: "—"` = tingkat lomba tidak tercantum di poster. `gambar` = poster dari Instagram sekolah. */
export type Prestasi = { tahun: string; judul: string; nama?: string; tingkat: string; bidang: string; gambar?: string; contoh: boolean };

const P = "/images/prestasi";

/** Prestasi asli (sumber: poster Instagram resmi sekolah dan buletin Lensa Barema). */
export const PRESTASI: Prestasi[] = [
  { tahun: "2026", judul: "Juara 1 O2SN cabang atletik", nama: "Mardiana", tingkat: "Provinsi NTB", bidang: "Olahraga (O2SN)", gambar: `${P}/o2sn-mardiana-atletik-provinsi.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 1 O2SN mata lomba atletik", nama: "Mardiana", tingkat: "—", bidang: "Olahraga (O2SN)", gambar: `${P}/o2sn-juara-1-atletik.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 1 FLS3N mata lomba komik digital", nama: "Vadia Apriliani Yosmeniar", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-1.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 1 FLS3N mata lomba jurnalistik", nama: "Fauziah Rahmah", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-1.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 1 FLS3N mata lomba kriya", nama: "Kaula Amalia Pateha", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-1.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 1 FLS3N mata lomba baca puisi", nama: "Ervina Maulana Putri", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-1.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 2 O2SN mata lomba panjat tebing", nama: "Malka Syarif Firdaus", tingkat: "—", bidang: "Olahraga (O2SN)", gambar: `${P}/o2sn-juara-2-panjat-tebing.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 2 FLS3N mata lomba menulis puisi", nama: "Angel Najmi Luthfiyah", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-2-puisi-fotografi.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 2 FLS3N mata lomba fotografi", nama: "Nur Magfiroh", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-2-puisi-fotografi.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 2 FLS3N mata lomba menyanyi solo putra", nama: "Rizky Ramadhan", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-2-menyanyi-solo.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 2 FLS3N mata lomba film pendek", nama: "Wahyu Satria Pratama, Risma Agustina, Hendra Gunawan", tingkat: "—", bidang: "Seni (FLS3N)", gambar: `${P}/fls3n-juara-2-film-pendek.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 3 O2SN mata lomba bulu tangkis putra", nama: "M. Suganda", tingkat: "—", bidang: "Olahraga (O2SN)", gambar: `${P}/o2sn-juara-3-bulu-tangkis.jpg`, contoh: false },
  { tahun: "2026", judul: "Juara 3 O2SN mata lomba bulu tangkis putri", nama: "Afifah Ibnatu Suhaemah", tingkat: "—", bidang: "Olahraga (O2SN)", gambar: `${P}/o2sn-juara-3-bulu-tangkis.jpg`, contoh: false },
  { tahun: "2024", judul: "Juara 1 Kejurnas Taekwondo Danrem Cup 162 Wira Bhakti, kategori junior pemula", nama: "Sinar Subaida", tingkat: "Nasional", bidang: "Olahraga (taekwondo)", gambar: "/images/berita/penghargaan-sinar-subaida.jpg", contoh: false },
  { tahun: "2024", judul: "Pemenang video terbaik Bootcamp Kesehatan Reproduksi Amman", nama: "Tim produksi: Bulan, Isro, Jihan, Fidya, Tesya, Kayla, Sahwa, Naufal, Karil, Raihan", tingkat: "Kabupaten", bidang: "Video edukasi", gambar: "/images/berita/pemenang-video-terbaik-bootcamp-amman.jpg", contoh: false },
  { tahun: "2023", judul: "Juara III Accounting Week UTS 5", nama: "Asti Ramania Putri, Sahwa Nurfadillah, Eka Aprianih, Jecky Sahputra", tingkat: "Nasional", bidang: "Akuntansi", gambar: "/images/buletin/01-prestasi-accounting-week.jpg", contoh: false },
];

/** Poster prestasi untuk galeri di halaman Kesiswaan (satu poster bisa berisi beberapa juara). */
export type PosterPrestasi = { src: string; judul: string; ket: string };

/**
 * Poster/foto prestasi (satu poster bisa berisi beberapa juara).
 * Enam teratas tampil di beranda (tab Prestasi); semuanya tampil di halaman Kesiswaan.
 */
export const POSTER_PRESTASI: PosterPrestasi[] = [
  { src: `${P}/o2sn-mardiana-atletik-provinsi.jpg`, judul: "Mardiana, Juara 1 O2SN atletik", ket: "2026, tingkat Provinsi NTB" },
  { src: "/images/berita/penghargaan-sinar-subaida.jpg", judul: "Sinar Subaida, Juara 1 Kejurnas Taekwondo Danrem Cup 162", ket: "2024, tingkat Nasional" },
  { src: `${P}/fls3n-juara-1.jpg`, judul: "Juara 1 FLS3N: komik digital, jurnalistik, kriya, baca puisi", ket: "2026, empat siswa" },
  { src: "/images/berita/pemenang-video-terbaik-bootcamp-amman.jpg", judul: "Video terbaik Bootcamp Kesehatan Reproduksi Amman", ket: "2024, tim produksi siswa" },
  { src: `${P}/o2sn-juara-2-panjat-tebing.jpg`, judul: "Juara 2 O2SN: panjat tebing", ket: "2026, Malka Syarif Firdaus" },
  { src: "/images/buletin/01-prestasi-accounting-week.jpg", judul: "Juara III Accounting Week UTS 5", ket: "2023, tingkat Nasional" },
  { src: `${P}/fls3n-juara-2-puisi-fotografi.jpg`, judul: "Juara 2 FLS3N: menulis puisi dan fotografi", ket: "2026" },
  { src: `${P}/fls3n-juara-2-menyanyi-solo.jpg`, judul: "Juara 2 FLS3N: menyanyi solo putra", ket: "2026, Rizky Ramadhan" },
  { src: `${P}/fls3n-juara-2-film-pendek.jpg`, judul: "Juara 2 FLS3N: film pendek", ket: "2026, tim film siswa" },
  { src: `${P}/o2sn-juara-1-atletik.jpg`, judul: "Juara 1 O2SN: atletik", ket: "2026, Mardiana" },
  { src: `${P}/o2sn-juara-3-bulu-tangkis.jpg`, judul: "Juara 3 O2SN: bulu tangkis putra dan putri", ket: "2026" },
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
