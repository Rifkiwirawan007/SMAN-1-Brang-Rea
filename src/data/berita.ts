/**
 * Berita, pengumuman, dan agenda.
 * Berita bertanda contoh: false adalah berita asli (sumber: buletin Lensa Barema).
 * Pengumuman dan agenda bertanda contoh: true masih contoh dan akan diganti dari dashboard admin / backend.
 */

export type KategoriBerita = "Berita" | "Pengumuman" | "Prestasi";

export type Berita = {
  slug: string;
  judul: string;
  kategori: KategoriBerita;
  tanggal: string; // YYYY-MM-DD (WITA)
  ringkasan: string;
  isi: string[];
  gambar?: string;
  /** Titik fokus gambar di kartu (object-position). */
  posisiGambar?: string;
  /** Screenshot halaman buletin, ditampilkan utuh di artikel (tidak diperbesar). */
  halaman?: string;
  /** Asal tulisan, mis. edisi buletin. */
  sumber?: string;
  contoh: boolean;
};

export const BERITA: Berita[] = [
  {
    slug: "pelantikan-pengurus-osis-2023-2024",
    judul: "Upacara pelantikan pengurus OSIS Barema masa bakti 2023/2024",
    kategori: "Berita",
    tanggal: "2023-11-13",
    gambar: "/images/buletin/05-pelantikan-osis.jpg",
    posisiGambar: "center top",
    ringkasan:
      "Kepala sekolah Mustaram, S.Pd. melantik pengurus OSIS baru di lapangan upacara. Muhammad Sufni Muhadli kini memimpin OSIS masa bakti 2023/2024.",
    isi: [
      "SMA Negeri 1 Brang Rea melaksanakan pelantikan OSIS pada Senin, 13 November 2023, bertempat di lapangan upacara. Pelantikan dipimpin langsung oleh Kepala SMAN 1 Brang Rea, Mustaram, S.Pd., dan dihadiri jajaran wakil kepala sekolah, dewan guru, staf tata usaha, pengurus OSIS periode 2022/2023, pengurus OSIS masa bakti 2023/2024 yang akan dilantik, serta seluruh siswa.",
      "Acara pelantikan diawali dengan masuknya barisan pengurus OSIS yang baru ke tengah lapangan dalam formasi piramida. Kemudian kepala sekolah mengajukan beberapa pertanyaan, disertai pembacaan sumpah janji pengurus OSIS dan serah terima jabatan dari pengurus OSIS lama yang diwakili Juandi Kelana sebagai Ketua OSIS masa bakti 2022/2023 kepada pengurus OSIS baru yang diwakili Muhammad Sufni Muhadli sebagai Ketua OSIS masa bakti 2023/2024.",
      "Kegiatan dilanjutkan dengan penyampaian amanat oleh Kepala Sekolah, Mustaram, S.Pd. Beliau berpesan secara khusus kepada pengurus OSIS yang baru bahwa OSIS adalah organisasi yang diakui di satuan pendidikan dan tidak ada organisasi lain selain OSIS. Pengurus OSIS diharapkan mampu menjadi contoh dan teladan bagi peserta didik lain, mampu mengatur waktu sebagai siswa dan pengurus, bekerja sama dengan baik antarseksi, serta mengoordinasi kegiatan sekolah dengan baik dan tepat waktu.",
      "Lebih lanjut, Bapak Mustaram menyampaikan agar amanah yang diberikan dijaga sebagai sebuah kepercayaan. Dalam menjalankan tugas dan tanggung jawab, pengurus diminta tetap berpegang teguh pada prinsip kejujuran, transparansi, dan akuntabilitas, serta mendengarkan aspirasi dan ide dari seluruh anggota OSIS dan siswa. \u201cJadilah pemimpin yang berwibawa, bijaksana, dan berintegritas.\u201d",
      "Selamat kepada pengurus OSIS yang telah dilantik. Semoga kepengurusan OSIS masa bakti 2023/2024 dapat menjalankan tugasnya dengan baik dan penuh tanggung jawab untuk SMA Negeri 1 Brang Rea yang lebih maju dan berkembang.",
    ],
    halaman: "/images/buletin/05-pelantikan-osis.jpg",
    sumber: "Buletin Lensa Barema, 13 November 2023",
    contoh: false,
  },
  {
    slug: "debat-kandidat-calon-ketua-osis-2023",
    judul: "Debat kandidat calon ketua OSIS Barema 2023\u20132024",
    kategori: "Berita",
    tanggal: "2023-10-14",
    gambar: "/images/buletin/03-debat-calon-osis.jpg",
    posisiGambar: "center top",
    ringkasan:
      "Momen demokrasi di sekolah: para kandidat ketua OSIS beradu visi dan misi, dihadiri Komisioner Herman Jayadi dan Kepala Sekolah Mustaram, S.Pd.",
    isi: [
      "SMAN 1 Brang Rea menjadi saksi sebuah momen demokrasi yang berharga, yaitu debat kandidat calon ketua Organisasi Siswa Intra Sekolah (OSIS). Acara ini dihadiri Bapak Komisioner Herman Jayadi, Ketua Divisi Sosialisasi Pendidikan Pemilih, serta Bapak Kepala SMAN 1 Brang Rea, Mustaram, S.Pd.",
      "Debat kandidat OSIS kali ini merupakan bagian penting dari proses pemilihan ketua OSIS yang akan memimpin para siswa SMAN 1 Brang Rea dalam berbagai kegiatan selama satu tahun ke depan. Kehadiran Bapak Herman Jayadi menegaskan pentingnya pendidikan pemilih dan partisipasi aktif dalam kehidupan demokrasi, bahkan di tingkat sekolah. Beliau memberikan pidato inspiratif tentang pentingnya memilih calon ketua OSIS yang kompeten dan mampu mewakili suara siswa, serta menggarisbawahi nilai demokrasi, integritas, dan kepemimpinan yang harus dimiliki seorang ketua OSIS.",
      "Debat berlangsung dalam suasana penuh semangat dan interaksi aktif antara ketiga kandidat dengan seluruh siswa yang hadir. Kepala sekolah turut memberikan sambutan yang mengapresiasi semangat demokrasi di antara siswa-siswanya, dan mengingatkan bahwa pemilihan ketua OSIS adalah langkah awal dalam memahami dan menghargai proses demokrasi yang sejati.",
      "Semua peserta dan penonton berharap calon ketua OSIS yang terpilih dapat memenuhi visi dan misinya dengan baik serta membawa perubahan positif di lingkungan sekolah. Debat kandidat OSIS di SMAN 1 Brang Rea menjadi contoh bagaimana partisipasi aktif dalam demokrasi dapat menjadi fondasi yang kuat bagi masa depan.",
    ],
    halaman: "/images/buletin/03-debat-calon-osis.jpg",
    sumber: "Buletin Lensa Barema, 16 Oktober 2023",
    contoh: false,
  },
  {
    slug: "p5-kearifan-lokal-sumbawa-barat",
    judul: "Kegiatan P5 \u201cKearifan Lokal Sumbawa Barat\u201d",
    kategori: "Berita",
    tanggal: "2023-10-14",
    gambar: "/images/buletin/04-kearifan-lokal-p5.jpg",
    posisiGambar: "center top",
    ringkasan:
      "Guru tamu Fathi, S.Pd., M.Pd. mengajak siswa mengenal warisan budaya dan nilai tradisional Sumbawa Barat lewat pameran dan pertunjukan seni.",
    isi: [
      "Pada Sabtu, 14 Oktober 2023, SMAN 1 Brang Rea mengadakan kegiatan Projek Penguatan Profil Pelajar Pancasila (P5) dengan tema \u201cKearifan Lokal Sumbawa Barat\u201d. Kegiatan ini bertujuan memperkenalkan dan mengapresiasi budaya serta kearifan lokal yang kaya di wilayah Sumbawa Barat.",
      "Guru tamu Fathi, S.Pd., M.Pd., yang ahli dalam bidang budaya dan kearifan lokal Sumbawa Barat, hadir sebagai pembicara utama. Kehadiran beliau memberikan wawasan berharga kepada siswa tentang warisan budaya dan nilai-nilai tradisional yang unik dalam budaya Sumbawa Barat.",
      "Kepala Sekolah SMAN 1 Brang Rea, Mustaram, S.Pd., turut memberikan sambutan tentang pentingnya memahami dan memelihara warisan budaya lokal, serta peran sekolah dalam memfasilitasi pemahaman dan apresiasi terhadap kekayaan budaya daerah.",
      "Kegiatan P5 ini mencakup beragam acara, mulai dari pameran budaya hingga pertunjukan seni tradisional. Melalui kegiatan ini siswa dapat mendalami dan merasakan sendiri kekayaan budaya Sumbawa Barat, sekaligus belajar menghormati dan melestarikan tradisi sebagai bagian penting dari identitas daerah. Semoga kegiatan semacam ini terus menginspirasi generasi muda untuk menjadi pelindung dan pengembang warisan budaya daerah.",
    ],
    halaman: "/images/buletin/04-kearifan-lokal-p5.jpg",
    sumber: "Buletin Lensa Barema, 16 Oktober 2023",
    contoh: false,
  },
  {
    slug: "womens-basketball-event-2023-barema-vs-smandita",
    judul: "Women's Basketball Event 2023: Barema vs Smandita ditunda imbang 12:12",
    kategori: "Berita",
    tanggal: "2023-10-09",
    gambar: "/images/buletin/02-basket-putri.jpg",
    posisiGambar: "center top",
    ringkasan:
      "Laga basket putri SMAN 1 Brang Rea melawan SMAN 1 Taliwang di MAN 1 Sumbawa Barat dihentikan pada kuarter ketiga karena hari mulai gelap.",
    isi: [
      "Women's Basketball Event 2023 yang diselenggarakan di MAN 1 Sumbawa Barat menyajikan pertandingan seru antara SMAN 1 Brang Rea (Barema) melawan SMAN 1 Taliwang (Smandita). Pertandingan membuat penonton tegang hingga akhirnya ditunda sementara pada kuarter ketiga karena cahaya matahari mulai memudar.",
      "Laga ini menjadi bukti keterampilan dan determinasi para atlet muda. Lapangan MAN dipenuhi energi saat kedua tim berusaha keras menjadi yang terbaik. Penonton disuguhi kemampuan menangani bola yang luar biasa, tembakan yang tajam, dan pertahanan yang gigih dari kedua belah pihak.",
      "Gelapnya hari, pertandingan ditunda. Saat pertandingan mencapai pertengahan kuarter ketiga, cahaya alami mulai meredup dan membentuk bayangan di lapangan. Menyadari pentingnya fair play dan keselamatan pemain, para wasit memutuskan menunda pertandingan ke hari dan waktu yang berbeda agar semua orang dapat pulang dengan aman. Skor saat penundaan adalah imbang 12:12.",
      "Penundaan justru menambah semangat menjelang pertemuan berikutnya. Para penggemar basket dari kedua sekolah menantikan kelanjutan permainan ini dengan harapan melihat tim mereka keluar sebagai pemenang.",
    ],
    halaman: "/images/buletin/02-basket-putri.jpg",
    sumber: "Buletin Lensa Barema, 9 Oktober 2023",
    contoh: false,
  },
  {
    slug: "juara-3-accounting-week-uts-5-nasional-2023",
    judul: "Siswa Barema meraih Juara III Accounting Week UTS 5 se-Nasional 2023",
    kategori: "Prestasi",
    tanggal: "2023-10-08",
    gambar: "/images/buletin/01-prestasi-accounting-week.jpg",
    posisiGambar: "center top",
    ringkasan:
      "Tim Asti Ramania Putri, Sahwa Nurfadillah, Eka Aprianih, dan Jecky Sahputra menempati peringkat ketiga nasional di Sumbawa Besar.",
    isi: [
      "Siswa-siswa SMAN 1 Brang Rea meraih prestasi memuaskan di Accounting Week UTS 5 Nasional 2023 yang digelar di Sumbawa Besar. Tim yang terdiri dari Asti Ramania Putri, Sahwa Nurfadillah, Eka Aprianih, dan Jecky Sahputra berhasil menduduki peringkat ketiga.",
      "Prestasi ini diraih melalui beberapa tahapan kompetisi. Pada Technical Meeting (30 September 2023) tim mempersiapkan diri dan memahami aturan lomba. Tahap I, Action To Choose (3 Oktober 2023), menguji kemampuan memilih solusi akuntansi yang tepat. Tahap II, Action To Balance (7 Oktober 2023), menuntut tim menjaga neraca keuangan perusahaan tetap seimbang dan akurat sesuai prinsip akuntansi. Pada Tahap III, Action To Winner (8 Oktober 2023), tim meraih peringkat ketiga nasional dalam persaingan yang ketat.",
      "Meskipun bukan peringkat pertama, prestasi ini membuktikan kemampuan akuntansi yang patut diacungi jempol. Kepala SMAN 1 Brang Rea mengapresiasi dedikasi siswa-siswanya dan berharap prestasi yang lebih tinggi di masa depan.",
      "Siswa-siswa SMAN 1 Brang Rea menjadi inspirasi bagi yang lain bahwa dengan kerja keras, ketekunan, dan kemampuan, prestasi gemilang dapat dicapai. Selamat atas prestasi yang membanggakan ini!",
    ],
    halaman: "/images/buletin/01-prestasi-accounting-week.jpg",
    sumber: "Buletin Lensa Barema, 9 Oktober 2023",
    contoh: false,
  },
  {
    slug: "jadwal-sas-ganjil-2026",
    judul: "Jadwal Sumatif Akhir Semester ganjil 2026/2027",
    kategori: "Pengumuman",
    tanggal: "2026-11-09",
    ringkasan: "Sumatif akhir semester berlangsung 1–8 Desember 2026. Siswa wajib hadir pukul 07.00 WITA.",
    isi: [
      "Sumatif Akhir Semester (SAS) ganjil tahun pelajaran 2026/2027 dilaksanakan pada 1–8 Desember 2026.",
      "Siswa wajib hadir pukul 07.00 WITA, berseragam lengkap, dan membawa kartu peserta. Jadwal per mata pelajaran dibagikan wali kelas.",
    ],
    contoh: true,
  },
  {
    slug: "pembagian-rapor-ganjil",
    judul: "Pembagian rapor semester ganjil",
    kategori: "Pengumuman",
    tanggal: "2026-11-05",
    ringkasan: "Rapor dibagikan kepada orang tua atau wali murid pada Sabtu, 19 Desember 2026.",
    isi: [
      "Rapor semester ganjil dibagikan langsung kepada orang tua atau wali murid pada Sabtu, 19 Desember 2026 di ruang kelas masing-masing.",
      "Orang tua yang berhalangan hadir dapat menghubungi wali kelas untuk mengatur jadwal pengambilan.",
    ],
    contoh: true,
  },
  {
    slug: "pendataan-peserta-tka",
    judul: "Pendataan calon peserta TKA kelas XII",
    kategori: "Pengumuman",
    tanggal: "2026-10-30",
    ringkasan: "Siswa kelas XII diminta memeriksa kembali data diri dan pilihan mata pelajaran.",
    isi: [
      "Siswa kelas XII diminta memeriksa kembali nama, tanggal lahir, NISN, dan pilihan mata pelajaran untuk pendataan calon peserta TKA.",
      "Perbaikan data dapat disampaikan kepada operator sekolah paling lambat satu pekan setelah pengumuman ini.",
    ],
    contoh: true,
  },
  {
    slug: "libur-akhir-tahun-2026",
    judul: "Libur semester dan akhir tahun 2026",
    kategori: "Pengumuman",
    tanggal: "2026-10-27",
    ringkasan: "Libur semester ganjil berlangsung 21 Desember 2026 sampai 2 Januari 2027.",
    isi: [
      "Libur semester ganjil berlangsung pada 21 Desember 2026 sampai 2 Januari 2027. Kegiatan belajar semester genap dimulai Senin, 4 Januari 2027.",
    ],
    contoh: true,
  },
];

export type Agenda = {
  tanggal: string;
  sampai?: string;
  judul: string;
  tempat: string;
  waktu: string;
  contoh: boolean;
};

export const AGENDA: Agenda[] = [
  { tanggal: "2026-11-25", judul: "Peringatan Hari Guru Nasional", tempat: "Lapangan sekolah", waktu: "07.15 WITA", contoh: true },
  { tanggal: "2026-12-01", sampai: "2026-12-08", judul: "Sumatif Akhir Semester ganjil", tempat: "Ruang kelas", waktu: "07.00 WITA", contoh: true },
  { tanggal: "2026-12-19", judul: "Pembagian rapor semester ganjil", tempat: "Ruang kelas masing-masing", waktu: "08.00 WITA", contoh: true },
  { tanggal: "2027-01-04", judul: "Hari pertama semester genap", tempat: "Lapangan sekolah", waktu: "07.15 WITA", contoh: true },
  { tanggal: "2027-02-15", sampai: "2027-02-20", judul: "Pekan olahraga dan seni (Porseni)", tempat: "Lapangan dan aula", waktu: "07.30 WITA", contoh: true },
];

export const KATEGORI_BERITA: KategoriBerita[] = ["Berita", "Pengumuman", "Prestasi"];

export function urutBerita(daftar: Berita[] = BERITA) {
  return [...daftar].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function cariBerita(slug: string) {
  return BERITA.find((b) => b.slug === slug);
}
