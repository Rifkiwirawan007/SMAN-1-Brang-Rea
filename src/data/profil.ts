/**
 * Isi halaman Profil.
 * Field `contoh: true` = teks contoh yang wajib diganti teks resmi sekolah.
 */
import { SEKOLAH } from "@/data/sekolah";

export const SAMBUTAN = {
  nama: SEKOLAH.kepalaSekolah,
  jabatan: "Kepala SMA Negeri 1 Brang Rea",
  foto: "/images/kepala-sekolah.webp",
  /** Pose kedua, dipakai di halaman Profil. */
  foto2: "/images/kepala-sekolah-biru.webp",
  salam: "Assalamu’alaikum warahmatullahi wabarakatuh.",
  paragraf: [
    "Puji syukur kita panjatkan ke hadirat Allah SWT. Selamat datang di laman resmi SMA Negeri 1 Brang Rea, rumah belajar bagi putra-putri Brang Rea dan Sumbawa Barat sejak 2006.",
    "Laman ini kami hadirkan sebagai pintu informasi bagi siswa, orang tua, alumni, dan masyarakat. Di sini Bapak dan Ibu dapat mengikuti kegiatan belajar, prestasi siswa, pengumuman resmi, hingga informasi penerimaan murid baru.",
    "Kami percaya pendidikan yang baik lahir dari kerja sama sekolah, keluarga, dan masyarakat. Mari bersama-sama menyiapkan generasi Brang Rea yang beriman, berkarakter, dan siap bersaing.",
  ],
  penutup: "Wassalamu’alaikum warahmatullahi wabarakatuh.",
  contoh: true,
};

export const VISI = {
  teks: "Terwujudnya peserta didik yang beriman, berkarakter, berprestasi, dan peduli lingkungan.",
  contoh: true,
};

export const MISI = {
  butir: [
    "Menumbuhkan keimanan dan akhlak mulia melalui pembiasaan harian di sekolah.",
    "Menyelenggarakan pembelajaran yang aktif, bermakna, dan berpusat pada murid.",
    "Mengembangkan bakat siswa melalui ekstrakurikuler dan kompetisi.",
    "Menguatkan budaya literasi, numerasi, dan kecakapan digital.",
    "Mewujudkan lingkungan sekolah yang bersih, hijau, aman, dan nyaman.",
    "Menjalin kerja sama dengan orang tua dan masyarakat Brang Rea.",
  ],
  contoh: true,
};

export type Peristiwa = { tahun: string; judul: string; teks: string; contoh: boolean };

export const SEJARAH: Peristiwa[] = [
  {
    tahun: "2006",
    judul: "Sekolah berdiri",
    teks: `SMA Negeri 1 Brang Rea resmi berdiri pada ${SEKOLAH.pendirian.tanggal} berdasarkan SK pendirian nomor ${SEKOLAH.pendirian.sk}.`,
    contoh: false,
  },
  {
    tahun: "2009",
    judul: "Lulusan angkatan pertama",
    teks: "Siswa angkatan pertama menyelesaikan pendidikan dan melanjutkan ke perguruan tinggi maupun dunia kerja.",
    contoh: true,
  },
  {
    tahun: "2018",
    judul: "Terakreditasi B",
    teks: `Ditetapkan BAN-S/M Nusa Tenggara Barat melalui SK ${SEKOLAH.akreditasi.sk} tanggal ${SEKOLAH.akreditasi.tanggal}.`,
    contoh: false,
  },
  {
    tahun: "2026",
    judul: "Hari ini",
    teks: `${SEKOLAH.statistik.siswa} peserta didik belajar dalam ${SEKOLAH.statistik.rombel} rombongan belajar bersama ${SEKOLAH.statistik.guru} guru.`,
    contoh: false,
  },
];

export type Pejabat = { jabatan: string; nama: string; foto?: string; contoh: boolean };

export const STRUKTUR: Pejabat[] = [
  { jabatan: "Kepala sekolah", nama: SEKOLAH.kepalaSekolah, foto: "/images/kepala-sekolah-avatar.webp", contoh: false },
  { jabatan: "Wakil kepala sekolah bidang kurikulum", nama: "Nama menyusul", contoh: true },
  { jabatan: "Wakil kepala sekolah bidang kesiswaan", nama: "Nama menyusul", contoh: true },
  { jabatan: "Wakil kepala sekolah bidang sarana prasarana", nama: "Nama menyusul", contoh: true },
  { jabatan: "Wakil kepala sekolah bidang humas", nama: "Nama menyusul", contoh: true },
  { jabatan: "Kepala tata usaha", nama: "Nama menyusul", contoh: true },
  { jabatan: "Operator Dapodik", nama: SEKOLAH.operator, contoh: false },
  { jabatan: "Koordinator bimbingan konseling", nama: "Nama menyusul", contoh: true },
];

export const GURU_CONTOH = [
  { nama: "Nama Guru, S.Pd.", mapel: "Matematika" },
  { nama: "Nama Guru, S.Pd.", mapel: "Bahasa Indonesia" },
  { nama: "Nama Guru, S.Pd.", mapel: "Bahasa Inggris" },
  { nama: "Nama Guru, S.Pd.", mapel: "Biologi" },
  { nama: "Nama Guru, S.Pd.", mapel: "Fisika" },
  { nama: "Nama Guru, S.Pd.", mapel: "Kimia" },
  { nama: "Nama Guru, S.Pd.", mapel: "Sejarah" },
  { nama: "Nama Guru, S.Pd.", mapel: "PJOK" },
];

export const SARANA: { angka: number; satuan: string; ket: string; gambar?: string }[] = [
  { angka: SEKOLAH.statistik.ruangKelas, satuan: "ruang kelas", ket: "Ruang belajar untuk 14 rombongan belajar.", gambar: "/images/sekolah/tka-siswa.jpg" },
  { angka: SEKOLAH.statistik.laboratorium, satuan: "laboratorium", ket: "Praktik sains dan komputer.", gambar: "/images/sekolah/tka-komputer.jpg" },
  { angka: SEKOLAH.statistik.perpustakaan, satuan: "perpustakaan", ket: "Koleksi buku pelajaran dan bacaan umum." },
  { angka: SEKOLAH.statistik.luasTanah, satuan: "m² luas lahan", ket: "Lapangan upacara dan olahraga.", gambar: "/images/sekolah/apel-guru-2.jpg" },
];
