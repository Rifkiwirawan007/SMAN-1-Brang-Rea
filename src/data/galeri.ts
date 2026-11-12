/**
 * Galeri kegiatan: foto asli SMAN 1 Brang Rea (sumber: Instagram resmi @sman1brangrea dan buletin Lensa Barema).
 * Tambah foto: taruh file di public/images/sekolah/ lalu tambahkan baris di daftar ini.
 */
export type KategoriGaleri = "Gedung" | "Upacara" | "Pembelajaran" | "Buletin" | "Karnaval budaya";

export type FotoGaleri = {
  src: string;
  judul: string;
  kategori: KategoriGaleri;
  w: number;
  h: number;
};

export const GALERI: FotoGaleri[] = [
  { src: "/images/buletin/01-prestasi-accounting-week.jpg", judul: "Buletin: Juara III Accounting Week UTS 5", kategori: "Buletin", w: 1486, h: 1790 },
  { src: "/images/buletin/02-basket-putri.jpg", judul: "Buletin: Basket putri Barema vs Smandita", kategori: "Buletin", w: 1490, h: 1802 },
  { src: "/images/buletin/03-debat-calon-osis.jpg", judul: "Buletin: Debat kandidat calon ketua OSIS", kategori: "Buletin", w: 1486, h: 1806 },
  { src: "/images/buletin/04-kearifan-lokal-p5.jpg", judul: "Buletin: P5 Kearifan Lokal Sumbawa Barat", kategori: "Buletin", w: 1492, h: 1800 },
  { src: "/images/buletin/05-pelantikan-osis.jpg", judul: "Buletin: Pelantikan pengurus OSIS 2023/2024", kategori: "Buletin", w: 1488, h: 1806 },
  { src: "/images/hero-sekolah-baru.jpg", judul: "Gedung dan papan nama SMAN 1 Brang Rea", kategori: "Gedung", w: 1672, h: 941 },
  { src: "/images/hero-sekolah.jpg", judul: "Gedung dan halaman sekolah", kategori: "Gedung", w: 1774, h: 887 },
  { src: "/images/sekolah/apel-guru.jpg", judul: "Guru dan tenaga kependidikan di depan gedung sekolah", kategori: "Upacara", w: 1080, h: 522 },
  { src: "/images/sekolah/upacara-pembina.jpg", judul: "Pembina upacara menyampaikan amanat", kategori: "Upacara", w: 1080, h: 1010 },
  { src: "/images/sekolah/upacara-pemimpin.jpg", judul: "Pemimpin upacara", kategori: "Upacara", w: 1080, h: 1010 },
  { src: "/images/sekolah/paskibra-hormat.jpg", judul: "Petugas upacara memberi hormat", kategori: "Upacara", w: 1080, h: 1010 },
  { src: "/images/sekolah/paskibra-barisan.jpg", judul: "Barisan petugas upacara", kategori: "Upacara", w: 1080, h: 1010 },
  { src: "/images/sekolah/guru-upacara.jpg", judul: "Guru mengikuti upacara bendera", kategori: "Upacara", w: 1080, h: 1010 },
  { src: "/images/sekolah/apel-guru-2.jpg", judul: "Barisan guru di lapangan sekolah", kategori: "Upacara", w: 1080, h: 460 },
  { src: "/images/sekolah/tka-lab.jpg", judul: "Tes Kemampuan Akademik 2026 di laboratorium komputer", kategori: "Pembelajaran", w: 1080, h: 1010 },
  { src: "/images/sekolah/tka-siswa.jpg", judul: "Siswa mengerjakan TKA 2026", kategori: "Pembelajaran", w: 1080, h: 1010 },
  { src: "/images/sekolah/tka-komputer.jpg", judul: "Ruang komputer saat TKA 2026", kategori: "Pembelajaran", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-sayap-emas.jpg", judul: "Kostum sayap emas", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-spanduk.jpg", judul: "Spanduk Nunya' Rame", kategori: "Karnaval budaya", w: 1080, h: 522 },
  { src: "/images/sekolah/karnaval-kostum-hijau.jpg", judul: "Kostum hijau berhias emas", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-penari.jpg", judul: "Penari berkostum kuning", kategori: "Karnaval budaya", w: 1080, h: 402 },
  { src: "/images/sekolah/karnaval-siswi.jpg", judul: "Siswi berbusana adat", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-rumah-adat.jpg", judul: "Replika rumah adat", kategori: "Karnaval budaya", w: 1080, h: 422 },
  { src: "/images/sekolah/karnaval-bintang.jpg", judul: "Kostum bintang warna-warni", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-arak-arakan.jpg", judul: "Arak-arakan karnaval", kategori: "Karnaval budaya", w: 1080, h: 522 },
  { src: "/images/sekolah/karnaval-penari-merah.jpg", judul: "Penari berbusana merah", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-guru.jpg", judul: "Guru ikut memeriahkan karnaval", kategori: "Karnaval budaya", w: 1080, h: 484 },
  { src: "/images/sekolah/karnaval-kostum-emas.jpg", judul: "Kostum emas dan hijau", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-pengantin.jpg", judul: "Busana pengantin adat", kategori: "Karnaval budaya", w: 1080, h: 522 },
  { src: "/images/sekolah/karnaval-tongkat.jpg", judul: "Barisan pembawa tongkat", kategori: "Karnaval budaya", w: 1080, h: 460 },
  { src: "/images/sekolah/karnaval-kostum-kuning.jpg", judul: "Kostum kuning dan hijau", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-siswi-2.jpg", judul: "Siswi menyapa penonton", kategori: "Karnaval budaya", w: 1080, h: 522 },
  { src: "/images/sekolah/karnaval-payung.jpg", judul: "Kostum emas dengan payung", kategori: "Karnaval budaya", w: 1080, h: 1010 },
  { src: "/images/sekolah/karnaval-kostum-burung.jpg", judul: "Kostum burung", kategori: "Karnaval budaya", w: 1080, h: 522 },
  { src: "/images/sekolah/karnaval-barisan-hijau.jpg", judul: "Barisan berseragam hijau", kategori: "Karnaval budaya", w: 1080, h: 460 },
  { src: "/images/sekolah/karnaval-penari-tongkat.jpg", judul: "Penari pembawa tongkat bunga", kategori: "Karnaval budaya", w: 1080, h: 582 },
  { src: "/images/sekolah/karnaval-guru-2.jpg", judul: "Guru di barisan karnaval", kategori: "Karnaval budaya", w: 1080, h: 460 },
  { src: "/images/sekolah/karnaval-kostum-hijau-2.jpg", judul: "Kostum hijau dan emas", kategori: "Karnaval budaya", w: 1080, h: 460 },
  { src: "/images/sekolah/karnaval-barisan.jpg", judul: "Barisan siswa karnaval", kategori: "Karnaval budaya", w: 1080, h: 460 },
];

export const KATEGORI_GALERI: KategoriGaleri[] = ["Gedung", "Upacara", "Pembelajaran", "Buletin", "Karnaval budaya"];
