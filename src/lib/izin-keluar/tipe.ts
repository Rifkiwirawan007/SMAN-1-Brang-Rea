/** Tipe izin keluar siswa (keluar sekolah di jam pelajaran). Aman dipakai di server maupun klien. */

/** Pilihan cepat keperluan. "Lainnya" berarti petugas mengetik sendiri. */
export const KEPERLUAN = ["Sakit", "Urusan keluarga", "Dipanggil orang tua", "Keperluan sekolah"] as const;

/** Satu izin keluar. Disimpan per bulan di data/privat/izin-keluar/YYYY-MM.json. */
export type IzinKeluar = {
  id: string;
  /** Nomor resi, mis. "IK-261120-007" (urut per hari). */
  nomor: string;
  /** YYYY-MM-DD (WITA). */
  tanggal: string;
  /** Jam keluar (ISO). */
  jamKeluar: string;
  siswa: { id: string; nama: string; kelas: string; nisn: string };
  keperluan: string;
  /** Petugas piket yang memberi izin (akun yang sedang masuk). */
  oleh: { id: string; nama: string };
  /** Berapa kali resi dicetak ulang. */
  cetakUlang?: number;
  /** Diisi bila izin dibatalkan (salah input). Catatan tetap disimpan sebagai bukti. */
  batal?: { waktu: string; oleh: string; alasan?: string };
};

/** Data yang dicetak di resi. */
export type DataResi = Pick<IzinKeluar, "nomor" | "tanggal" | "jamKeluar" | "siswa" | "keperluan" | "oleh"> & { namaSekolah: string };
