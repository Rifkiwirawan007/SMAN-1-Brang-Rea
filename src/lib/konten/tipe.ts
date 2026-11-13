/**
 * Bentuk data konten situs. Datanya disimpan di data/konten/*.json dan dikelola lewat dashboard.
 * File ini aman dipakai di server maupun klien (hanya tipe dan konstanta).
 */

/** Kolom bawaan setiap item koleksi. */
export type Meta = {
  id: string;
  /** ISO waktu dibuat / terakhir diubah, dan nama pengubah terakhir. */
  dibuat?: string;
  diubah?: string;
  oleh?: string;
};

export type Status = "terbit" | "draf";

export const KATEGORI_BERITA = ["Berita", "Pengumuman", "Prestasi"] as const;
export type KategoriBerita = (typeof KATEGORI_BERITA)[number];

export type Berita = Meta & {
  slug: string;
  judul: string;
  kategori: KategoriBerita;
  /** YYYY-MM-DD (WITA). Boleh kosong ("") bila tanggal belum diketahui. */
  tanggal: string;
  ringkasan: string;
  isi: string[];
  gambar?: string;
  /** Titik fokus gambar di kartu (object-position). */
  posisiGambar?: string;
  /** Gambar utuh di bawah artikel (halaman buletin / poster). */
  halaman?: string;
  keteranganHalaman?: string;
  fotoLain?: string[];
  sumber?: string;
  status: Status;
  contoh: boolean;
};

export type Agenda = Meta & {
  tanggal: string;
  sampai?: string;
  judul: string;
  tempat: string;
  waktu: string;
  contoh: boolean;
};

export type Prestasi = Meta & {
  tahun: string;
  judul: string;
  nama?: string;
  /** "—" bila tingkat tidak diketahui. */
  tingkat: string;
  bidang: string;
  gambar?: string;
  contoh: boolean;
};

export type PosterPrestasi = Meta & {
  src: string;
  judul: string;
  ket: string;
  /** Tampil di tab Prestasi beranda (maks. 6 teratas). */
  beranda: boolean;
};

export const KATEGORI_EKSKUL = ["Organisasi", "Olahraga", "Seni", "Keagamaan", "Sains dan bahasa"] as const;
export type KategoriEkskul = (typeof KATEGORI_EKSKUL)[number];

export const IKON_EKSKUL_NAMA = ["tenda", "bendera", "hati", "musik", "bulan", "voli", "bola", "mikroskop", "bahasa", "buku"] as const;
export type IkonEkskul = (typeof IKON_EKSKUL_NAMA)[number];

export type Ekskul = Meta & {
  nama: string;
  kategori: KategoriEkskul;
  deskripsi: string;
  jadwal: string;
  gambar?: string;
  posisiGambar?: string;
  ikon: IkonEkskul;
  wajib?: boolean;
  contoh: boolean;
};

export const KATEGORI_GALERI = ["Gedung", "Upacara", "Pembelajaran", "Kegiatan", "Prestasi", "Buletin", "Karnaval budaya", "Lainnya"] as const;

export type FotoGaleri = Meta & {
  src: string;
  judul: string;
  kategori: string;
  /** Ukuran asli foto (diisi otomatis saat disimpan). */
  w: number;
  h: number;
};

export type Tautan = { label: string; href: string };

export type SlideHero = Meta & {
  tab: string;
  judul: string;
  teks: string;
  gambar: string;
  alt: string;
  posisi?: string;
  /** Titik fokus khusus layar HP (tegak). Kosong = sama dengan `posisi`. */
  posisiHp?: string;
  aksi: Tautan;
  aksi2?: Tautan;
  video?: { besar: string; kecil?: string };
  /** Gambar berupa poster yang sudah memuat judul. */
  poster?: boolean;
  /** Lama slide tampil, dalam DETIK (komponen slider memakai milidetik: kalikan 1000). */
  durasi?: number;
  aktif: boolean;
  contoh?: boolean;
};

export type Sekolah = {
  nama: string;
  namaPendek: string;
  wilayah: string;
  npsn: string;
  status: string;
  bentuk: string;
  akreditasi: { nilai: string; sk: string; tanggal: string };
  pendirian: { tanggal: string; tahun: number; sk: string };
  kepalaSekolah: string;
  operator: string;
  alamat: { jalan: string; desa: string; kecamatan: string; kabupaten: string; provinsi: string; lengkap: string };
  koordinat: { lat: number; lng: number };
  kontak: {
    whatsapp: string;
    whatsappTampil: string;
    email: string;
    facebook: string;
    facebookUrl: string;
    instagram?: string;
    instagramUrl?: string;
    dapodikTelepon?: string;
    dapodikEmail?: string;
  };
  jamLayanan: { hari: string; jam: string }[];
  tagar: string;
  statistik: {
    guru: number;
    siswaLaki: number;
    siswaPerempuan: number;
    siswa: number;
    rombel: number;
    ruangKelas: number;
    laboratorium: number;
    perpustakaan: number;
    luasTanah: number;
    rasioSiswaRombel: number;
    rasioSiswaGuru: number;
    guruKualifikasi: string;
    guruSertifikasi: string;
    guruPns: string;
    listrik: string;
    internet: string;
    penyelenggaraan: string;
    semesterData: string;
  };
  sumber: { dapodik: string };
  /** Tampilkan label "Contoh" pada konten yang masih contoh. */
  tampilkanLabelContoh: boolean;
};

export type Sambutan = {
  nama: string;
  jabatan: string;
  foto: string;
  /** Pose kedua, dipakai di halaman Profil. */
  foto2?: string;
  salam: string;
  paragraf: string[];
  penutup: string;
  contoh: boolean;
};

export type Peristiwa = { tahun: string; judul: string; teks: string; contoh: boolean };
export type Pejabat = { jabatan: string; nama: string; foto?: string; contoh: boolean };

export type Profil = {
  visi: { teks: string; contoh: boolean };
  misi: { butir: string[]; contoh: boolean };
  sejarah: Peristiwa[];
  struktur: Pejabat[];
  guru: { nama: string; mapel: string }[];
  sarana: { angka: number; satuan: string; ket: string; gambar?: string }[];
};

export type ButirKalender = { tanggal: string; kegiatan: string; semester: "Ganjil" | "Genap" };

export type Akademik = {
  kurikulum: { nama: string; ringkas: string; komponen: { nama: string; teks: string }[]; contoh: boolean };
  mapel: { umum: string[]; pilihan: string[]; contoh: boolean };
  jadwal: { hari: { hari: string; jam: string; ket: string }[]; istirahat: string[]; contoh: boolean };
  kalender: { semester: "Ganjil" | "Genap"; periode: string; butir: ButirKalender[] }[];
  kalenderContoh: boolean;
};

export type Kesiswaan = {
  osis: { ringkas: string; bidang: { nama: string; teks: string }[]; contoh: boolean };
  tataTertib: { butir: { judul: string; isi: string[] }[]; contoh: boolean };
  layananBk: { ringkas: string; layanan: { nama: string; teks: string }[]; contoh: boolean };
};

export type Spmb = {
  tahunAjaran: string;
  status: string;
  contoh: boolean;
  jalur: { nama: string; kuota: string; teks: string }[];
  jadwal: { tahap: string; waktu: string; keterangan?: string }[];
  syarat: string[];
  alur: { judul: string; teks: string }[];
  tanya: { q: string; a: string }[];
};

/** Peta nama koleksi → tipe item. */
export type PetaKoleksi = {
  berita: Berita;
  agenda: Agenda;
  prestasi: Prestasi;
  "poster-prestasi": PosterPrestasi;
  ekskul: Ekskul;
  galeri: FotoGaleri;
  hero: SlideHero;
};
export type NamaKoleksi = keyof PetaKoleksi;

/** Peta nama dokumen tunggal → tipe. */
export type PetaDokumen = {
  sekolah: Sekolah;
  sambutan: Sambutan;
  profil: Profil;
  akademik: Akademik;
  kesiswaan: Kesiswaan;
  spmb: Spmb;
};
export type NamaDokumen = keyof PetaDokumen;

export const NAMA_KOLEKSI: NamaKoleksi[] = ["berita", "agenda", "prestasi", "poster-prestasi", "ekskul", "galeri", "hero"];
export const NAMA_DOKUMEN: NamaDokumen[] = ["sekolah", "sambutan", "profil", "akademik", "kesiswaan", "spmb"];

/** Tag cache tiap koleksi / dokumen (dipakai cacheTag di situs dan updateTag di dashboard). */
export const tagKonten = (nama: NamaKoleksi | NamaDokumen) => `konten:${nama}`;
