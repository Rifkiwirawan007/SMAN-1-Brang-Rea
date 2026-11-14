export type TautanNav = { label: string; href: string; ket?: string };
export type MenuNav = {
  label: string;
  href: string;
  ringkas: string;
  anak?: TautanNav[];
};

export const MENU_UTAMA: MenuNav[] = [
  {
    label: "Profil",
    href: "/profil",
    ringkas: "Mengenal sekolah: sambutan, sejarah, visi misi, dan identitas resmi.",
    anak: [
      { label: "Sambutan kepala sekolah", href: "/profil#sambutan", ket: "Pesan dari Mustaram, S.Pd." },
      { label: "Identitas sekolah", href: "/profil#identitas", ket: "NPSN, akreditasi, alamat" },
      { label: "Sejarah", href: "/profil#sejarah", ket: "Berdiri sejak 18 Oktober 2006" },
      { label: "Visi dan misi", href: "/profil#visi-misi", ket: "Arah dan tujuan sekolah" },
      { label: "Struktur organisasi", href: "/profil#struktur", ket: "Pimpinan dan pengelola" },
      { label: "Guru dan tenaga kependidikan", href: "/profil#guru", ket: "30 guru aktif" },
      { label: "Sarana dan prasarana", href: "/profil#sarana", ket: "Kelas, laboratorium, perpustakaan" },
    ],
  },
  {
    label: "Akademik",
    href: "/akademik",
    ringkas: "Kurikulum, rombongan belajar, mata pelajaran, jadwal, dan kalender pendidikan.",
    anak: [
      { label: "Kurikulum", href: "/akademik#kurikulum", ket: "Struktur dan fase belajar" },
      { label: "Rombongan belajar", href: "/akademik#rombel", ket: "14 rombel tahun ini" },
      { label: "Mata pelajaran", href: "/akademik#mapel", ket: "Umum dan pilihan" },
      { label: "Jadwal dan jam pelajaran", href: "/akademik#jadwal", ket: "Enam hari belajar" },
      { label: "Kalender akademik", href: "/akademik#kalender", ket: "Tanggal penting 2026/2027" },
    ],
  },
  {
    label: "Kesiswaan",
    href: "/kesiswaan",
    ringkas: "Organisasi siswa, ekstrakurikuler, prestasi, tata tertib, dan bimbingan konseling.",
    anak: [
      { label: "OSIS", href: "/kesiswaan#osis", ket: "Organisasi siswa intra sekolah" },
      { label: "Ekstrakurikuler", href: "/kesiswaan#ekstrakurikuler", ket: "Pramuka, Paskibra, seni, olahraga" },
      { label: "Prestasi", href: "/kesiswaan#prestasi", ket: "Capaian siswa" },
      { label: "Tata tertib", href: "/kesiswaan#tata-tertib", ket: "Aturan dan pembiasaan" },
      { label: "Bimbingan konseling", href: "/kesiswaan#bk", ket: "Layanan BK" },
      { label: "Lapor ke guru BK", href: "/lapor", ket: "Perundungan, kekerasan, masalah lain" },
    ],
  },
  { label: "Berita", href: "/berita", ringkas: "Berita, pengumuman, dan agenda sekolah." },
  { label: "Galeri", href: "/galeri", ringkas: "Potret kegiatan sekolah." },
  { label: "SPMB", href: "/spmb", ringkas: "Sistem Penerimaan Murid Baru." },
];

export const MENU_ATAS: TautanNav[] = [
  { label: "Kalender akademik", href: "/akademik#kalender" },
  { label: "Pengumuman", href: "/berita#pengumuman" },
  { label: "Cek absensi", href: "/cek-absen" },
  { label: "Kontak", href: "/kontak" },
];
