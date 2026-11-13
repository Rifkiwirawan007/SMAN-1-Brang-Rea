import {
  Award,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Image as IkonGambar,
  Images,
  LayoutTemplate,
  Medal,
  MessageSquareQuote,
  Newspaper,
  School,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Bidang } from "@/lib/cms/bidang";
import {
  IKON_EKSKUL_NAMA,
  KATEGORI_BERITA,
  KATEGORI_EKSKUL,
  KATEGORI_GALERI,
  type Agenda,
  type Berita,
  type Ekskul,
  type FotoGaleri,
  type NamaDokumen,
  type NamaKoleksi,
  type PosterPrestasi,
  type Prestasi,
  type SlideHero,
} from "@/lib/konten/tipe";
import { formatTanggal } from "@/lib/format";

/**
 * Konfigurasi modul dashboard. Setiap modul = satu file data/konten/<kunci>.json.
 * Koleksi: daftar item (berita, agenda, ...). Dokumen: satu isian (profil, SPMB, ...).
 */

export type GrupNav = "Konten" | "Halaman situs" | "Sekolah";

type Item = Record<string, unknown> & { id: string };

export type ModulKoleksi<T extends Item = Item> = {
  jenis: "koleksi";
  kunci: NamaKoleksi;
  label: string;
  /** Kata benda tunggal huruf kecil, mis. "berita", "agenda". */
  satuan: string;
  ikon: LucideIcon;
  grup: GrupNav;
  deskripsi: string;
  bidang: Bidang[];
  bawaan: () => Record<string, unknown>;
  /** Punya status draf/terbit. */
  status?: boolean;
  /** "manual" = urutan bisa diatur (dipakai apa adanya di situs). */
  urutan: "manual" | "tanggal-turun" | "tanggal-naik";
  judul: (x: T) => string;
  sub?: (x: T) => string;
  gambar?: (x: T) => string | undefined;
  kolom?: { label: string; isi: (x: T) => string }[];
  /** Filter daftar. Tanpa `opsi` = diambil otomatis dari data. */
  filter?: { kunci: string; label: string; opsi?: readonly string[]; ambil: (x: T) => string }[];
  publik?: (x: T) => string | null;
  contoh?: (x: T) => boolean;
  /** Unggah banyak foto sekaligus jadi item baru (galeri). */
  unggahMassal?: { bidangGambar: string; bidangJudul: string; bawaan: Record<string, unknown> };
  /** Validasi tambahan antarbidang. */
  cek?: (x: Record<string, unknown>) => Record<string, string>;
};

export type ModulDokumen = {
  jenis: "dokumen";
  kunci: NamaDokumen;
  label: string;
  ikon: LucideIcon;
  grup: GrupNav;
  deskripsi: string;
  publik?: string;
  bagian: { judul: string; deskripsi?: string; bidang: Bidang[] }[];
};

export type Modul = ModulKoleksi | ModulDokumen;

const tgl = (s?: string) => (s ? formatTanggal(s, { pendek: true }) : "Tanpa tanggal");
const hariIni = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date());

const bidContoh: Bidang = {
  jenis: "saklar",
  nama: "contoh",
  label: "Konten contoh",
  teks: "Tandai sebagai contoh",
  bantuan: "Label \"Contoh\" tampil di situs sampai data resmi diisi.",
  sisi: true,
};

const TINGKAT = ["—", "Sekolah", "Kecamatan", "Kabupaten", "Provinsi", "Provinsi NTB", "Nasional", "Internasional"] as const;

const LABEL_IKON: Record<(typeof IKON_EKSKUL_NAMA)[number], string> = {
  tenda: "Tenda (Pramuka)",
  bendera: "Bendera (Paskibra)",
  hati: "Hati (PMR / sosial)",
  musik: "Musik (seni)",
  bulan: "Bulan (keagamaan)",
  voli: "Bola voli",
  bola: "Bola (futsal / sepak bola)",
  mikroskop: "Mikroskop (sains)",
  bahasa: "Bahasa",
  buku: "Buku (literasi)",
};

/* ---------------- Koleksi ---------------- */

const berita: ModulKoleksi<Berita & Item> = {
  jenis: "koleksi",
  kunci: "berita",
  label: "Berita & pengumuman",
  satuan: "berita",
  ikon: Newspaper,
  grup: "Konten",
  deskripsi: "Tulis berita, pengumuman, dan kabar prestasi. Draf tidak tampil di situs sampai diterbitkan.",
  status: true,
  urutan: "tanggal-turun",
  bawaan: () => ({ kategori: "Berita", tanggal: hariIni(), isi: [], fotoLain: [], contoh: false }),
  bidang: [
    { jenis: "teks", nama: "judul", label: "Judul", wajib: true, maks: 160, placeholder: "Contoh: Siswa Barema juara 1 lomba pidato" },
    { jenis: "slug", nama: "slug", label: "Alamat halaman", dari: "judul", awalan: "/berita/", bantuan: "Terisi otomatis dari judul. Mengubahnya akan mengganti tautan berita." },
    { jenis: "teksPanjang", nama: "ringkasan", label: "Ringkasan", wajib: true, maks: 320, baris: 3, bantuan: "1–2 kalimat. Tampil di kartu berita dan di bawah judul." },
    { jenis: "paragraf", nama: "isi", label: "Isi berita", wajib: true, bantuan: "Pisahkan paragraf dengan satu baris kosong." },
    { jenis: "galeri", nama: "fotoLain", label: "Foto tambahan", bantuan: "Tampil berurutan di bawah isi berita." },
    { jenis: "gambar", nama: "halaman", label: "Gambar utuh (poster / halaman buletin)", bantuan: "Opsional. Ditampilkan utuh tanpa dipotong di bawah artikel." },
    { jenis: "teks", nama: "keteranganHalaman", label: "Keterangan gambar utuh", maks: 200 },
    { jenis: "teks", nama: "sumber", label: "Sumber", maks: 120, placeholder: "Instagram resmi SMAN 1 Brang Rea" },
    { jenis: "pilihan", nama: "kategori", label: "Kategori", wajib: true, opsi: KATEGORI_BERITA, sisi: true },
    { jenis: "tanggal", nama: "tanggal", label: "Tanggal", sisi: true, bantuan: "Kosongkan bila belum diketahui." },
    { jenis: "gambar", nama: "gambar", label: "Foto utama", sisi: true, rasio: "16/10" },
    { jenis: "fokus", nama: "posisiGambar", label: "Titik fokus foto", gambar: "gambar", sisi: true },
    bidContoh,
  ],
  judul: (x) => x.judul,
  sub: (x) => x.ringkasan,
  gambar: (x) => x.gambar ?? x.halaman,
  kolom: [
    { label: "Kategori", isi: (x) => x.kategori },
    { label: "Tanggal", isi: (x) => tgl(x.tanggal) },
  ],
  filter: [{ kunci: "kategori", label: "Kategori", opsi: KATEGORI_BERITA, ambil: (x) => x.kategori }],
  publik: (x) => (x.status === "draf" ? null : `/berita/${x.slug}`),
  contoh: (x) => !!x.contoh,
};

const agenda: ModulKoleksi<Agenda & Item> = {
  jenis: "koleksi",
  kunci: "agenda",
  label: "Agenda",
  satuan: "agenda",
  ikon: CalendarDays,
  grup: "Konten",
  deskripsi: "Kegiatan mendatang yang tampil di beranda dan halaman Berita.",
  urutan: "tanggal-naik",
  bawaan: () => ({ tanggal: hariIni(), waktu: "07.15 WITA", contoh: false }),
  bidang: [
    { jenis: "teks", nama: "judul", label: "Nama kegiatan", wajib: true, maks: 120 },
    { jenis: "tanggal", nama: "tanggal", label: "Tanggal mulai", wajib: true, lebar: "setengah" },
    { jenis: "tanggal", nama: "sampai", label: "Sampai tanggal", lebar: "setengah", bantuan: "Isi bila kegiatan lebih dari sehari." },
    { jenis: "teks", nama: "waktu", label: "Waktu", wajib: true, maks: 40, placeholder: "07.15 WITA", lebar: "setengah" },
    { jenis: "teks", nama: "tempat", label: "Tempat", wajib: true, maks: 80, placeholder: "Lapangan sekolah", lebar: "setengah" },
    bidContoh,
  ],
  cek: (x): Record<string, string> =>
    x.sampai && x.tanggal && String(x.sampai) < String(x.tanggal) ? { sampai: "Tidak boleh sebelum tanggal mulai." } : {},
  judul: (x) => x.judul,
  sub: (x) => `${x.waktu} · ${x.tempat}`,
  kolom: [
    { label: "Tanggal", isi: (x) => (x.sampai ? `${tgl(x.tanggal)} – ${tgl(x.sampai)}` : tgl(x.tanggal)) },
    { label: "Tempat", isi: (x) => x.tempat },
  ],
  filter: [
    {
      kunci: "waktu",
      label: "Waktu",
      opsi: ["Mendatang", "Sudah lewat"],
      ambil: (x) => ((x.sampai || x.tanggal) >= hariIni() ? "Mendatang" : "Sudah lewat"),
    },
  ],
  publik: () => "/berita#agenda",
  contoh: (x) => !!x.contoh,
};

const prestasi: ModulKoleksi<Prestasi & Item> = {
  jenis: "koleksi",
  kunci: "prestasi",
  label: "Prestasi",
  satuan: "prestasi",
  ikon: Trophy,
  grup: "Konten",
  deskripsi: "Tabel prestasi siswa di halaman Kesiswaan. Urutan di sini = urutan di situs.",
  urutan: "manual",
  bawaan: () => ({ tahun: String(new Date().getFullYear()), tingkat: "—", contoh: false }),
  bidang: [
    { jenis: "teks", nama: "judul", label: "Prestasi", wajib: true, maks: 160, placeholder: "Juara 1 FLS3N mata lomba baca puisi" },
    { jenis: "teks", nama: "nama", label: "Nama siswa / tim", maks: 200 },
    { jenis: "teks", nama: "tahun", label: "Tahun", wajib: true, maks: 9, lebar: "sepertiga" },
    { jenis: "pilihan", nama: "tingkat", label: "Tingkat", wajib: true, opsi: TINGKAT, lebar: "sepertiga", bantuan: "Pilih — bila tidak diketahui." },
    { jenis: "teks", nama: "bidang", label: "Bidang", wajib: true, maks: 60, placeholder: "Seni (FLS3N)", lebar: "sepertiga" },
    { jenis: "gambar", nama: "gambar", label: "Poster / foto", sisi: true },
    bidContoh,
  ],
  judul: (x) => x.judul,
  sub: (x) => x.nama ?? "",
  gambar: (x) => x.gambar,
  kolom: [
    { label: "Tahun", isi: (x) => x.tahun },
    { label: "Tingkat", isi: (x) => x.tingkat },
  ],
  filter: [
    { kunci: "tahun", label: "Tahun", ambil: (x) => x.tahun },
    { kunci: "tingkat", label: "Tingkat", ambil: (x) => x.tingkat },
  ],
  publik: () => "/kesiswaan#prestasi",
  contoh: (x) => !!x.contoh,
};

const posterPrestasi: ModulKoleksi<PosterPrestasi & Item> = {
  jenis: "koleksi",
  kunci: "poster-prestasi",
  label: "Poster prestasi",
  satuan: "poster",
  ikon: Medal,
  grup: "Konten",
  deskripsi: "Kartu bergambar di tab Prestasi beranda (maks. 6 bertanda Beranda) dan galeri poster di halaman Kesiswaan.",
  urutan: "manual",
  bawaan: () => ({ beranda: false }),
  bidang: [
    { jenis: "gambar", nama: "src", label: "Poster / foto", wajib: true },
    { jenis: "teks", nama: "judul", label: "Judul", wajib: true, maks: 120, placeholder: "Juara 1 O2SN: atletik" },
    { jenis: "teks", nama: "ket", label: "Keterangan singkat", maks: 80, placeholder: "2026, tingkat Provinsi NTB" },
    { jenis: "saklar", nama: "beranda", label: "Beranda", teks: "Tampilkan di beranda", sisi: true, bantuan: "Beranda memuat maksimal 6 poster bertanda ini, sesuai urutan." },
  ],
  judul: (x) => x.judul,
  sub: (x) => x.ket,
  gambar: (x) => x.src,
  kolom: [{ label: "Beranda", isi: (x) => (x.beranda ? "Tampil" : "—") }],
  filter: [{ kunci: "beranda", label: "Beranda", opsi: ["Tampil", "Tidak"], ambil: (x) => (x.beranda ? "Tampil" : "Tidak") }],
  publik: () => "/kesiswaan#prestasi",
};

const ekskul: ModulKoleksi<Ekskul & Item> = {
  jenis: "koleksi",
  kunci: "ekskul",
  label: "Ekstrakurikuler",
  satuan: "ekskul",
  ikon: Award,
  grup: "Konten",
  deskripsi: "Daftar ekskul di beranda (5 teratas yang berfoto) dan halaman Kesiswaan.",
  urutan: "manual",
  bawaan: () => ({ kategori: "Organisasi", ikon: "buku", contoh: false, wajib: false }),
  bidang: [
    { jenis: "teks", nama: "nama", label: "Nama ekskul", wajib: true, maks: 60 },
    { jenis: "pilihan", nama: "kategori", label: "Kategori", wajib: true, opsi: KATEGORI_EKSKUL, lebar: "setengah" },
    { jenis: "teks", nama: "jadwal", label: "Jadwal latihan", wajib: true, maks: 60, placeholder: "Selasa dan Kamis, 15.00 WITA", lebar: "setengah" },
    { jenis: "teksPanjang", nama: "deskripsi", label: "Deskripsi", wajib: true, maks: 300, baris: 3 },
    { jenis: "pilihan", nama: "ikon", label: "Ikon (dipakai bila belum ada foto)", wajib: true, opsi: IKON_EKSKUL_NAMA.map((n) => ({ nilai: n, label: LABEL_IKON[n] })) },
    { jenis: "gambar", nama: "gambar", label: "Foto kegiatan", sisi: true, rasio: "4/5" },
    { jenis: "fokus", nama: "posisiGambar", label: "Titik fokus foto", gambar: "gambar", sisi: true },
    { jenis: "saklar", nama: "wajib", label: "Ekskul wajib", teks: "Wajib diikuti (mis. Pramuka kelas X)", sisi: true },
    bidContoh,
  ],
  judul: (x) => x.nama,
  sub: (x) => x.jadwal,
  gambar: (x) => x.gambar,
  kolom: [{ label: "Kategori", isi: (x) => x.kategori }],
  filter: [{ kunci: "kategori", label: "Kategori", opsi: KATEGORI_EKSKUL, ambil: (x) => x.kategori }],
  publik: () => "/kesiswaan#ekstrakurikuler",
  contoh: (x) => !!x.contoh,
};

const galeri: ModulKoleksi<FotoGaleri & Item> = {
  jenis: "koleksi",
  kunci: "galeri",
  label: "Galeri foto",
  satuan: "foto",
  ikon: Images,
  grup: "Konten",
  deskripsi: "Foto kegiatan di halaman Galeri. Unggah banyak foto sekaligus, lalu beri judul.",
  urutan: "manual",
  bawaan: () => ({ kategori: "Kegiatan" }),
  bidang: [
    { jenis: "gambar", nama: "src", label: "Foto", wajib: true },
    { jenis: "teks", nama: "judul", label: "Judul / keterangan", wajib: true, maks: 120 },
    { jenis: "pilihan", nama: "kategori", label: "Kategori", wajib: true, opsi: KATEGORI_GALERI },
  ],
  judul: (x) => x.judul,
  sub: (x) => x.kategori,
  gambar: (x) => x.src,
  kolom: [
    { label: "Kategori", isi: (x) => x.kategori },
    { label: "Ukuran", isi: (x) => (x.w ? `${x.w}×${x.h}` : "—") },
  ],
  filter: [{ kunci: "kategori", label: "Kategori", opsi: KATEGORI_GALERI, ambil: (x) => x.kategori }],
  publik: () => "/galeri",
  unggahMassal: { bidangGambar: "src", bidangJudul: "judul", bawaan: { kategori: "Kegiatan" } },
};

const tautan = (nama: string, label: string, wajib: boolean): Bidang => ({
  jenis: "grup",
  nama,
  label,
  wajib,
  bidang: [
    { jenis: "teks", nama: "label", label: "Teks tombol", wajib: true, maks: 30, lebar: "setengah" },
    { jenis: "teks", nama: "href", label: "Tautan", wajib: true, format: "tautan", placeholder: "/profil", lebar: "setengah" },
  ],
});

const hero: ModulKoleksi<SlideHero & Item> = {
  jenis: "koleksi",
  kunci: "hero",
  label: "Slider beranda",
  satuan: "slide",
  ikon: LayoutTemplate,
  grup: "Halaman situs",
  deskripsi: "Slide besar di bagian paling atas beranda. Urutan di sini = urutan tab slider.",
  urutan: "manual",
  bawaan: () => ({ aktif: true, durasi: 8, aksi: { label: "", href: "" } }),
  bidang: [
    { jenis: "teks", nama: "tab", label: "Label tab", wajib: true, maks: 30, placeholder: "SPMB 2027/2028", lebar: "setengah" },
    { jenis: "angka", nama: "durasi", label: "Lama tampil", min: 3, max: 60, satuan: "detik", lebar: "setengah", bantuan: "Kosongkan untuk bawaan (8 detik)." },
    { jenis: "teks", nama: "judul", label: "Judul besar", wajib: true, maks: 80 },
    { jenis: "teksPanjang", nama: "teks", label: "Teks pendek", wajib: true, maks: 200, baris: 2 },
    tautan("aksi", "Tombol utama", true),
    tautan("aksi2", "Tombol kedua (opsional)", false),
    { jenis: "teks", nama: "alt", label: "Deskripsi gambar", wajib: true, maks: 200, bantuan: "Untuk pembaca layar dan mesin pencari." },
    {
      jenis: "grup",
      nama: "video",
      label: "Video latar (opsional)",
      bidang: [
        { jenis: "teks", nama: "besar", label: "Video layar besar", format: "tautan", placeholder: "/video/ekskul-hd.mp4", lebar: "setengah" },
        { jenis: "teks", nama: "kecil", label: "Video HP", format: "tautan", placeholder: "/video/ekskul-hp.mp4", lebar: "setengah" },
      ],
    },
    { jenis: "saklar", nama: "aktif", label: "Status", teks: "Tampilkan di beranda", sisi: true },
    { jenis: "gambar", nama: "gambar", label: "Gambar", wajib: true, sisi: true, rasio: "16/9" },
    { jenis: "fokus", nama: "posisi", label: "Titik fokus gambar", gambar: "gambar", sisi: true },
    { jenis: "saklar", nama: "poster", label: "Poster", teks: "Gambar sudah memuat judul", bantuan: "Teks situs disembunyikan; seluruh slide menjadi tautan tombol utama.", sisi: true },
  ],
  judul: (x) => x.judul,
  sub: (x) => x.tab,
  gambar: (x) => x.gambar,
  kolom: [
    { label: "Tab", isi: (x) => x.tab },
    { label: "Status", isi: (x) => (x.aktif === false ? "Disembunyikan" : "Tampil") },
  ],
  publik: () => "/",
};

/* ---------------- Dokumen ---------------- */

const sambutan: ModulDokumen = {
  jenis: "dokumen",
  kunci: "sambutan",
  label: "Sambutan kepala sekolah",
  ikon: MessageSquareQuote,
  grup: "Halaman situs",
  deskripsi: "Tampil di bawah slider beranda dan di halaman Profil.",
  publik: "/#judul-sambutan",
  bagian: [
    {
      judul: "Kepala sekolah",
      bidang: [
        { jenis: "teks", nama: "nama", label: "Nama", wajib: true, lebar: "setengah" },
        { jenis: "teks", nama: "jabatan", label: "Jabatan", wajib: true, lebar: "setengah" },
        { jenis: "gambar", nama: "foto", label: "Foto beranda (latar transparan)", wajib: true, lebar: "setengah", rasio: "4/5" },
        { jenis: "gambar", nama: "foto2", label: "Foto halaman Profil", lebar: "setengah", rasio: "4/5" },
      ],
    },
    {
      judul: "Isi sambutan",
      bidang: [
        { jenis: "teks", nama: "salam", label: "Salam pembuka", wajib: true },
        { jenis: "paragraf", nama: "paragraf", label: "Paragraf", wajib: true, bantuan: "Paragraf pertama tampil di beranda; semuanya tampil di halaman Profil. Pisahkan dengan baris kosong." },
        { jenis: "teks", nama: "penutup", label: "Salam penutup", wajib: true },
        { ...bidContoh, sisi: false },
      ],
    },
  ],
};

const profil: ModulDokumen = {
  jenis: "dokumen",
  kunci: "profil",
  label: "Profil sekolah",
  ikon: School,
  grup: "Halaman situs",
  deskripsi: "Visi, misi, sejarah, struktur organisasi, guru, dan sarana di halaman Profil.",
  publik: "/profil",
  bagian: [
    {
      judul: "Visi dan misi",
      bidang: [
        {
          jenis: "grup",
          nama: "visi",
          label: "Visi",
          wajib: true,
          bidang: [
            { jenis: "teksPanjang", nama: "teks", label: "Visi", wajib: true, baris: 2 },
            { ...bidContoh, sisi: false },
          ],
        },
        {
          jenis: "grup",
          nama: "misi",
          label: "Misi",
          wajib: true,
          bidang: [
            { jenis: "daftarTeks", nama: "butir", label: "Butir misi", labelItem: "misi", wajib: true },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Sejarah",
      deskripsi: "Linimasa di halaman Profil.",
      bidang: [
        {
          jenis: "daftar",
          nama: "sejarah",
          label: "Peristiwa",
          labelItem: "Peristiwa",
          judulItem: "judul",
          bidang: [
            { jenis: "teks", nama: "tahun", label: "Tahun", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "judul", label: "Judul", wajib: true, lebar: "setengah" },
            { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Struktur organisasi",
      bidang: [
        {
          jenis: "daftar",
          nama: "struktur",
          label: "Pejabat",
          labelItem: "Pejabat",
          judulItem: "jabatan",
          bidang: [
            { jenis: "teks", nama: "jabatan", label: "Jabatan", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "nama", label: "Nama", wajib: true, lebar: "setengah" },
            { jenis: "gambar", nama: "foto", label: "Foto (opsional)", rasio: "1/1" },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Guru",
      bidang: [
        {
          jenis: "daftar",
          nama: "guru",
          label: "Guru",
          labelItem: "Guru",
          judulItem: "nama",
          bidang: [
            { jenis: "teks", nama: "nama", label: "Nama", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "mapel", label: "Mata pelajaran", wajib: true, lebar: "setengah" },
          ],
        },
      ],
    },
    {
      judul: "Sarana",
      bidang: [
        {
          jenis: "daftar",
          nama: "sarana",
          label: "Sarana",
          labelItem: "Sarana",
          judulItem: "satuan",
          bidang: [
            { jenis: "angka", nama: "angka", label: "Jumlah", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "teks", nama: "satuan", label: "Satuan", wajib: true, placeholder: "ruang kelas", lebar: "sepertiga" },
            { jenis: "teks", nama: "ket", label: "Keterangan", wajib: true },
            { jenis: "gambar", nama: "gambar", label: "Foto (opsional)" },
          ],
        },
      ],
    },
  ],
};

const akademik: ModulDokumen = {
  jenis: "dokumen",
  kunci: "akademik",
  label: "Akademik",
  ikon: GraduationCap,
  grup: "Halaman situs",
  deskripsi: "Kurikulum, mata pelajaran, jadwal harian, dan kalender akademik.",
  publik: "/akademik",
  bagian: [
    {
      judul: "Kurikulum",
      bidang: [
        {
          jenis: "grup",
          nama: "kurikulum",
          label: "Kurikulum",
          wajib: true,
          bidang: [
            { jenis: "teks", nama: "nama", label: "Nama kurikulum", wajib: true },
            { jenis: "teksPanjang", nama: "ringkas", label: "Ringkasan", wajib: true, baris: 3 },
            {
              jenis: "daftar",
              nama: "komponen",
              label: "Komponen",
              labelItem: "Komponen",
              judulItem: "nama",
              bidang: [
                { jenis: "teks", nama: "nama", label: "Nama", wajib: true },
                { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
              ],
            },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Mata pelajaran",
      bidang: [
        {
          jenis: "grup",
          nama: "mapel",
          label: "Mata pelajaran",
          wajib: true,
          bidang: [
            { jenis: "daftarTeks", nama: "umum", label: "Kelompok umum", labelItem: "mapel", lebar: "setengah" },
            { jenis: "daftarTeks", nama: "pilihan", label: "Kelompok pilihan", labelItem: "mapel", lebar: "setengah" },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Jadwal harian",
      bidang: [
        {
          jenis: "grup",
          nama: "jadwal",
          label: "Jadwal",
          wajib: true,
          bidang: [
            {
              jenis: "daftar",
              nama: "hari",
              label: "Hari belajar",
              labelItem: "Hari",
              judulItem: "hari",
              bidang: [
                { jenis: "teks", nama: "hari", label: "Hari", wajib: true, lebar: "sepertiga" },
                { jenis: "teks", nama: "jam", label: "Jam", wajib: true, placeholder: "07.15 – 14.30", lebar: "sepertiga" },
                { jenis: "teks", nama: "ket", label: "Keterangan", lebar: "sepertiga" },
              ],
            },
            { jenis: "daftarTeks", nama: "istirahat", label: "Jam istirahat", labelItem: "istirahat", placeholder: "09.45 – 10.00 WITA" },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Kalender akademik",
      bidang: [
        {
          jenis: "daftar",
          nama: "kalender",
          label: "Semester",
          labelItem: "Semester",
          judulItem: "periode",
          bidang: [
            { jenis: "pilihan", nama: "semester", label: "Semester", wajib: true, opsi: ["Ganjil", "Genap"], lebar: "setengah" },
            { jenis: "teks", nama: "periode", label: "Periode", wajib: true, placeholder: "Juli – Desember 2026", lebar: "setengah" },
            {
              jenis: "daftar",
              nama: "butir",
              label: "Kegiatan",
              labelItem: "Kegiatan",
              judulItem: "kegiatan",
              bidang: [
                { jenis: "teks", nama: "tanggal", label: "Tanggal", wajib: true, placeholder: "13 Juli 2026", lebar: "sepertiga" },
                { jenis: "teks", nama: "kegiatan", label: "Kegiatan", wajib: true, lebar: "setengah" },
                { jenis: "pilihan", nama: "semester", label: "Semester", wajib: true, opsi: ["Ganjil", "Genap"], lebar: "sepertiga" },
              ],
            },
          ],
        },
        { jenis: "saklar", nama: "kalenderContoh", label: "Kalender contoh", teks: "Tandai kalender sebagai contoh" },
      ],
    },
  ],
};

const kesiswaan: ModulDokumen = {
  jenis: "dokumen",
  kunci: "kesiswaan",
  label: "Kesiswaan",
  ikon: UsersRound,
  grup: "Halaman situs",
  deskripsi: "OSIS, tata tertib, dan layanan bimbingan konseling di halaman Kesiswaan.",
  publik: "/kesiswaan",
  bagian: [
    {
      judul: "OSIS",
      bidang: [
        {
          jenis: "grup",
          nama: "osis",
          label: "OSIS",
          wajib: true,
          bidang: [
            { jenis: "teksPanjang", nama: "ringkas", label: "Ringkasan", wajib: true, baris: 2 },
            {
              jenis: "daftar",
              nama: "bidang",
              label: "Bidang OSIS",
              labelItem: "Bidang",
              judulItem: "nama",
              bidang: [
                { jenis: "teks", nama: "nama", label: "Nama bidang", wajib: true },
                { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
              ],
            },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Tata tertib",
      bidang: [
        {
          jenis: "grup",
          nama: "tataTertib",
          label: "Tata tertib",
          wajib: true,
          bidang: [
            {
              jenis: "daftar",
              nama: "butir",
              label: "Kelompok aturan",
              labelItem: "Kelompok",
              judulItem: "judul",
              bidang: [
                { jenis: "teks", nama: "judul", label: "Judul", wajib: true },
                { jenis: "daftarTeks", nama: "isi", label: "Aturan", labelItem: "aturan", wajib: true },
              ],
            },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
    {
      judul: "Bimbingan konseling",
      bidang: [
        {
          jenis: "grup",
          nama: "layananBk",
          label: "Layanan BK",
          wajib: true,
          bidang: [
            { jenis: "teksPanjang", nama: "ringkas", label: "Ringkasan", wajib: true, baris: 2 },
            {
              jenis: "daftar",
              nama: "layanan",
              label: "Layanan",
              labelItem: "Layanan",
              judulItem: "nama",
              bidang: [
                { jenis: "teks", nama: "nama", label: "Nama layanan", wajib: true },
                { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
              ],
            },
            { ...bidContoh, sisi: false },
          ],
        },
      ],
    },
  ],
};

const spmb: ModulDokumen = {
  jenis: "dokumen",
  kunci: "spmb",
  label: "SPMB",
  ikon: BookOpen,
  grup: "Halaman situs",
  deskripsi: "Informasi penerimaan murid baru: jalur, jadwal, syarat, alur, dan tanya jawab.",
  publik: "/spmb",
  bagian: [
    {
      judul: "Umum",
      bidang: [
        { jenis: "teks", nama: "tahunAjaran", label: "Tahun ajaran", wajib: true, placeholder: "2027/2028", lebar: "setengah" },
        { jenis: "pilihan", nama: "status", label: "Status pendaftaran", wajib: true, opsi: ["Belum dibuka", "Dibuka", "Ditutup", "Pengumuman hasil"], lebar: "setengah" },
        { ...bidContoh, sisi: false },
      ],
    },
    {
      judul: "Jalur pendaftaran",
      bidang: [
        {
          jenis: "daftar",
          nama: "jalur",
          label: "Jalur",
          labelItem: "Jalur",
          judulItem: "nama",
          bidang: [
            { jenis: "teks", nama: "nama", label: "Nama jalur", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "kuota", label: "Kuota", wajib: true, placeholder: "min. 30%", lebar: "setengah" },
            { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
          ],
        },
      ],
    },
    {
      judul: "Jadwal",
      bidang: [
        {
          jenis: "daftar",
          nama: "jadwal",
          label: "Tahap",
          labelItem: "Tahap",
          judulItem: "tahap",
          bidang: [
            { jenis: "teks", nama: "tahap", label: "Tahap", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "waktu", label: "Waktu", wajib: true, placeholder: "2 – 6 Juni 2027", lebar: "setengah" },
            {
              jenis: "teksPanjang",
              nama: "keterangan",
              label: "Keterangan singkat",
              maks: 120,
              baris: 2,
              bantuan: "Tampil di timeline SPMB beranda. Satu kalimat pendek.",
            },
          ],
        },
      ],
    },
    { judul: "Syarat", bidang: [{ jenis: "daftarTeks", nama: "syarat", label: "Syarat pendaftaran", labelItem: "syarat" }] },
    {
      judul: "Alur pendaftaran",
      bidang: [
        {
          jenis: "daftar",
          nama: "alur",
          label: "Langkah",
          labelItem: "Langkah",
          judulItem: "judul",
          bidang: [
            { jenis: "teks", nama: "judul", label: "Judul langkah", wajib: true },
            { jenis: "teksPanjang", nama: "teks", label: "Keterangan", wajib: true, baris: 2 },
          ],
        },
      ],
    },
    {
      judul: "Tanya jawab",
      bidang: [
        {
          jenis: "daftar",
          nama: "tanya",
          label: "Pertanyaan",
          labelItem: "Pertanyaan",
          judulItem: "q",
          bidang: [
            { jenis: "teks", nama: "q", label: "Pertanyaan", wajib: true },
            { jenis: "teksPanjang", nama: "a", label: "Jawaban", wajib: true, baris: 3 },
          ],
        },
      ],
    },
  ],
};

const sekolah: ModulDokumen = {
  jenis: "dokumen",
  kunci: "sekolah",
  label: "Info & kontak sekolah",
  ikon: IkonGambar,
  grup: "Sekolah",
  deskripsi: "Identitas, alamat, kontak, jam layanan, dan data Dapodik yang dipakai di seluruh situs.",
  publik: "/kontak",
  bagian: [
    {
      judul: "Identitas",
      bidang: [
        { jenis: "teks", nama: "nama", label: "Nama resmi", wajib: true, lebar: "setengah" },
        { jenis: "teks", nama: "namaPendek", label: "Nama pendek", wajib: true, lebar: "setengah" },
        { jenis: "teks", nama: "npsn", label: "NPSN", wajib: true, lebar: "sepertiga" },
        { jenis: "teks", nama: "status", label: "Status", wajib: true, lebar: "sepertiga" },
        { jenis: "teks", nama: "bentuk", label: "Bentuk", wajib: true, lebar: "sepertiga" },
        { jenis: "teks", nama: "kepalaSekolah", label: "Kepala sekolah", wajib: true, lebar: "setengah" },
        { jenis: "teks", nama: "operator", label: "Operator Dapodik", lebar: "setengah" },
        { jenis: "teks", nama: "wilayah", label: "Wilayah (di header)", wajib: true, lebar: "setengah" },
        { jenis: "teks", nama: "tagar", label: "Tagar", lebar: "setengah" },
      ],
    },
    {
      judul: "Akreditasi dan pendirian",
      bidang: [
        {
          jenis: "grup",
          nama: "akreditasi",
          label: "Akreditasi",
          wajib: true,
          bidang: [
            { jenis: "teks", nama: "nilai", label: "Nilai", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "sk", label: "Nomor SK", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "tanggal", label: "Tanggal SK", wajib: true, lebar: "sepertiga" },
          ],
        },
        {
          jenis: "grup",
          nama: "pendirian",
          label: "Pendirian",
          wajib: true,
          bidang: [
            { jenis: "teks", nama: "tanggal", label: "Tanggal", wajib: true, lebar: "sepertiga" },
            { jenis: "angka", nama: "tahun", label: "Tahun", wajib: true, min: 1900, max: 2100, lebar: "sepertiga" },
            { jenis: "teks", nama: "sk", label: "Nomor SK", wajib: true, lebar: "sepertiga" },
          ],
        },
      ],
    },
    {
      judul: "Alamat dan peta",
      bidang: [
        {
          jenis: "grup",
          nama: "alamat",
          label: "Alamat",
          wajib: true,
          bidang: [
            { jenis: "teks", nama: "jalan", label: "Jalan", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "desa", label: "Desa", wajib: true, lebar: "setengah" },
            { jenis: "teks", nama: "kecamatan", label: "Kecamatan", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "kabupaten", label: "Kabupaten", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "provinsi", label: "Provinsi", wajib: true, lebar: "sepertiga" },
            { jenis: "teksPanjang", nama: "lengkap", label: "Alamat lengkap (tampil di situs)", wajib: true, baris: 2 },
          ],
        },
        {
          jenis: "grup",
          nama: "koordinat",
          label: "Titik peta",
          wajib: true,
          bantuan: "Buka Google Maps, klik kanan titik sekolah, lalu salin angka lintang dan bujur.",
          bidang: [
            { jenis: "angka", nama: "lat", label: "Lintang (lat)", wajib: true, min: -90, max: 90, langkah: 0.000001, lebar: "setengah" },
            { jenis: "angka", nama: "lng", label: "Bujur (lng)", wajib: true, min: -180, max: 180, langkah: 0.000001, lebar: "setengah" },
          ],
        },
      ],
    },
    {
      judul: "Kontak",
      bidang: [
        {
          jenis: "grup",
          nama: "kontak",
          label: "Kontak",
          wajib: true,
          bidang: [
            { jenis: "teks", nama: "whatsapp", label: "Nomor WhatsApp (format 62…)", wajib: true, format: "telepon", placeholder: "6282236901214", lebar: "setengah", bantuan: "Tujuan tombol dan formulir WhatsApp." },
            { jenis: "teks", nama: "whatsappTampil", label: "Nomor WhatsApp (tampilan)", wajib: true, placeholder: "+62 822-3690-1214", lebar: "setengah" },
            { jenis: "teks", nama: "email", label: "Email", wajib: true, format: "email", lebar: "setengah" },
            { jenis: "teks", nama: "facebook", label: "Nama Facebook", lebar: "setengah" },
            { jenis: "teks", nama: "facebookUrl", label: "Tautan Facebook", format: "url", lebar: "setengah" },
            { jenis: "teks", nama: "instagram", label: "Akun Instagram", placeholder: "@sman1brangrea", lebar: "setengah" },
            { jenis: "teks", nama: "instagramUrl", label: "Tautan Instagram", format: "url", lebar: "setengah" },
            { jenis: "teks", nama: "dapodikTelepon", label: "Telepon (Dapodik)", lebar: "setengah" },
            { jenis: "teks", nama: "dapodikEmail", label: "Email (Dapodik)", lebar: "setengah" },
          ],
        },
      ],
    },
    {
      judul: "Jam layanan",
      deskripsi: "Tampil di halaman Kontak.",
      bidang: [
        {
          jenis: "daftar",
          nama: "jamLayanan",
          label: "Jam layanan",
          labelItem: "Baris",
          judulItem: "hari",
          bidang: [
            { jenis: "teks", nama: "hari", label: "Hari", wajib: true, placeholder: "Senin–Kamis", lebar: "setengah" },
            { jenis: "teks", nama: "jam", label: "Jam", wajib: true, placeholder: "07.00–14.30 WITA", lebar: "setengah" },
          ],
        },
      ],
    },
    {
      judul: "Data Dapodik",
      deskripsi: "Angka di beranda dan halaman Profil.",
      bidang: [
        {
          jenis: "grup",
          nama: "statistik",
          label: "Statistik",
          wajib: true,
          bidang: [
            { jenis: "angka", nama: "siswa", label: "Peserta didik", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "siswaLaki", label: "Laki-laki", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "siswaPerempuan", label: "Perempuan", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "guru", label: "Guru", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "rombel", label: "Rombongan belajar", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "ruangKelas", label: "Ruang kelas", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "laboratorium", label: "Laboratorium", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "perpustakaan", label: "Perpustakaan", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "luasTanah", label: "Luas tanah", wajib: true, min: 0, satuan: "m²", lebar: "sepertiga" },
            { jenis: "angka", nama: "rasioSiswaRombel", label: "Siswa per rombel", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "angka", nama: "rasioSiswaGuru", label: "Siswa per guru", wajib: true, min: 0, lebar: "sepertiga" },
            { jenis: "teks", nama: "guruKualifikasi", label: "Guru berkualifikasi", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "guruSertifikasi", label: "Guru bersertifikat", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "guruPns", label: "Guru PNS", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "semesterData", label: "Semester data", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "listrik", label: "Listrik", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "internet", label: "Internet", wajib: true, lebar: "sepertiga" },
            { jenis: "teks", nama: "penyelenggaraan", label: "Penyelenggaraan", wajib: true, lebar: "sepertiga" },
          ],
        },
        {
          jenis: "grup",
          nama: "sumber",
          label: "Sumber",
          wajib: true,
          bidang: [{ jenis: "teks", nama: "dapodik", label: "Tautan profil Dapodik", wajib: true, format: "url" }],
        },
      ],
    },
    {
      judul: "Tampilan",
      bidang: [
        {
          jenis: "saklar",
          nama: "tampilkanLabelContoh",
          label: "Label konten contoh",
          teks: "Tampilkan label \"Contoh\" di situs",
          bantuan: "Matikan setelah semua konten contoh diganti data resmi.",
        },
      ],
    },
  ],
};

export const KOLEKSI: Record<NamaKoleksi, ModulKoleksi> = {
  berita: berita as unknown as ModulKoleksi,
  agenda: agenda as unknown as ModulKoleksi,
  prestasi: prestasi as unknown as ModulKoleksi,
  "poster-prestasi": posterPrestasi as unknown as ModulKoleksi,
  ekskul: ekskul as unknown as ModulKoleksi,
  galeri: galeri as unknown as ModulKoleksi,
  hero: hero as unknown as ModulKoleksi,
};

export const DOKUMEN: Record<NamaDokumen, ModulDokumen> = { sekolah, sambutan, profil, akademik, kesiswaan, spmb };

export function cariModul(kunci: string): Modul | null {
  return (KOLEKSI as Record<string, Modul>)[kunci] ?? (DOKUMEN as Record<string, Modul>)[kunci] ?? null;
}
