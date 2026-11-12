/**
 * Isi halaman Akademik. Data rombel & rasio berasal dari Dapodik (asli);
 * kurikulum, mapel, jadwal, dan kalender adalah CONTOH.
 */
export const KURIKULUM = {
  nama: "Kurikulum Merdeka",
  ringkas:
    "Pembelajaran disusun per fase: Fase E untuk kelas X dan Fase F untuk kelas XI–XII, dengan pilihan mata pelajaran mulai kelas XI.",
  komponen: [
    { nama: "Intrakurikuler", teks: "Pembelajaran mata pelajaran di kelas dan laboratorium sesuai capaian pembelajaran tiap fase." },
    { nama: "Kokurikuler", teks: "Projek lintas mata pelajaran yang menguatkan karakter dan kepedulian pada lingkungan sekitar." },
    { nama: "Ekstrakurikuler", teks: "Kegiatan pengembangan bakat dan minat di luar jam pelajaran, Pramuka wajib bagi kelas X." },
  ],
  contoh: true,
};

export const MAPEL = {
  umum: [
    "Pendidikan Agama dan Budi Pekerti",
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Matematika",
    "Bahasa Inggris",
    "Sejarah",
    "Ilmu Pengetahuan Alam",
    "Ilmu Pengetahuan Sosial",
    "Pendidikan Jasmani, Olahraga, dan Kesehatan",
    "Seni Budaya",
    "Informatika",
    "Muatan lokal",
  ],
  pilihan: [
    "Matematika tingkat lanjut",
    "Fisika",
    "Kimia",
    "Biologi",
    "Ekonomi",
    "Geografi",
    "Sosiologi",
    "Sejarah tingkat lanjut",
    "Bahasa Inggris tingkat lanjut",
    "Informatika lanjutan",
  ],
  contoh: true,
};

export const JADWAL = {
  hari: [
    { hari: "Senin", jam: "07.15 – 14.30", ket: "Upacara bendera" },
    { hari: "Selasa", jam: "07.15 – 14.30", ket: "Pembelajaran reguler" },
    { hari: "Rabu", jam: "07.15 – 14.30", ket: "Pembelajaran reguler" },
    { hari: "Kamis", jam: "07.15 – 14.30", ket: "Pembelajaran reguler" },
    { hari: "Jumat", jam: "07.15 – 11.30", ket: "Senam pagi dan imtaq" },
    { hari: "Sabtu", jam: "07.15 – 12.30", ket: "Pembelajaran dan ekstrakurikuler" },
  ],
  istirahat: ["09.45 – 10.00 WITA", "12.00 – 12.30 WITA"],
  contoh: true,
};

export type Kalender = { tanggal: string; kegiatan: string; semester: "Ganjil" | "Genap" };

export const KALENDER: { semester: "Ganjil" | "Genap"; periode: string; butir: Kalender[] }[] = [
  {
    semester: "Ganjil",
    periode: "Juli – Desember 2026",
    butir: [
      { tanggal: "13 Juli 2026", kegiatan: "Hari pertama tahun pelajaran dan MPLS", semester: "Ganjil" },
      { tanggal: "17 Agustus 2026", kegiatan: "Upacara HUT Republik Indonesia", semester: "Ganjil" },
      { tanggal: "Oktober 2026", kegiatan: "Bulan Bahasa dan sumatif tengah semester", semester: "Ganjil" },
      { tanggal: "1 – 8 Desember 2026", kegiatan: "Sumatif akhir semester", semester: "Ganjil" },
      { tanggal: "19 Desember 2026", kegiatan: "Pembagian rapor", semester: "Ganjil" },
      { tanggal: "21 Des 2026 – 2 Jan 2027", kegiatan: "Libur semester", semester: "Ganjil" },
    ],
  },
  {
    semester: "Genap",
    periode: "Januari – Juni 2027",
    butir: [
      { tanggal: "4 Januari 2027", kegiatan: "Hari pertama semester genap", semester: "Genap" },
      { tanggal: "Februari 2027", kegiatan: "Pekan olahraga dan seni", semester: "Genap" },
      { tanggal: "Maret – April 2027", kegiatan: "Tes kemampuan akademik kelas XII", semester: "Genap" },
      { tanggal: "Mei 2027", kegiatan: "Pelepasan kelas XII", semester: "Genap" },
      { tanggal: "Juni 2027", kegiatan: "Sumatif akhir tahun dan kenaikan kelas", semester: "Genap" },
    ],
  },
];

export const KALENDER_CONTOH = true;
