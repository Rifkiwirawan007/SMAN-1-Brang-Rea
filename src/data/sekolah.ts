/**
 * Data resmi sekolah.
 * Sumber utama: Data Pokok Pendidikan (Dapodik) Kemendikdasmen, semester 2026/2027 gasal
 * dan unggahan resmi sekolah (kontak WhatsApp, email, Facebook, nama kepala sekolah).
 * Saat backend siap, objek ini bisa diganti hasil fetch dari API / database.
 */

/** Matikan (false) untuk menyembunyikan semua label "Contoh" dan "Foto ilustrasi" sekaligus. */
export const TAMPILKAN_LABEL_CONTOH = true;

export const SEKOLAH = {
  nama: "SMA Negeri 1 Brang Rea",
  namaPendek: "SMAN 1 Brang Rea",
  wilayah: "Sumbawa Barat",
  npsn: "50205583",
  status: "Negeri",
  bentuk: "SMA",
  akreditasi: {
    nilai: "B",
    sk: "239/BANSM-NTB/KP/XI/2018",
    tanggal: "22 November 2018",
  },
  pendirian: { tanggal: "18 Oktober 2006", tahun: 2006, sk: "506" },
  kepalaSekolah: "Mustaram, S.Pd.",
  operator: "Sudirman",
  alamat: {
    jalan: "Jln. Baso Busing No. 10",
    desa: "Desa Beru",
    kecamatan: "Kecamatan Brang Rea",
    kabupaten: "Kabupaten Sumbawa Barat",
    provinsi: "Nusa Tenggara Barat",
    lengkap:
      "Jln. Baso Busing No. 10, Desa Beru, Kec. Brang Rea, Kab. Sumbawa Barat, Nusa Tenggara Barat",
  },
  koordinat: { lat: -8.729683, lng: 116.90671 },
  kontak: {
    /** Dari unggahan resmi sekolah ("Call to find out more"). */
    whatsapp: "6282236901214",
    whatsappTampil: "+62 822-3690-1214",
    email: "sman1brangrea@gmail.com",
    facebook: "SMAN 1 Brang Rea",
    facebookUrl: "https://www.facebook.com/search/top?q=SMAN%201%20BRANG%20REA",
    /** Kontak yang tercatat di Dapodik (berbeda dengan unggahan; mohon dicek). */
    dapodikTelepon: "082339567867",
    dapodikEmail: "smanbrangrea@gmail.com",
  },
  tagar: "#BAREMAMEMESONA",
  statistik: {
    guru: 30,
    siswaLaki: 230,
    siswaPerempuan: 278,
    siswa: 508,
    rombel: 14,
    ruangKelas: 20,
    laboratorium: 8,
    perpustakaan: 1,
    luasTanah: 13000,
    rasioSiswaRombel: 37,
    rasioSiswaGuru: 17,
    guruKualifikasi: "100%",
    guruSertifikasi: "96,67%",
    guruPns: "83,33%",
    listrik: "PLN, 13.900 VA",
    internet: "Broadband",
    penyelenggaraan: "Pagi, 6 hari",
    semesterData: "2026/2027 gasal",
  },
  sumber: {
    dapodik:
      "https://sekolah.data.kemendikdasmen.go.id/profil-sekolah/014F1A8B-6921-481E-9606-ABB3F25F5F1F",
  },
} as const;

export const MAPS_EMBED = `https://maps.google.com/maps?q=${SEKOLAH.koordinat.lat},${SEKOLAH.koordinat.lng}&z=16&output=embed`;
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${SEKOLAH.koordinat.lat},${SEKOLAH.koordinat.lng}`;
