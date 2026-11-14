/**
 * Laporan yang dikirim dari perangkat ini, disimpan di localStorage supaya siswa bisa cek status
 * tanpa mengetik kode. Hanya berjalan di browser.
 */
import { LABEL_JENIS, type JenisLaporan } from "@/lib/laporan/tipe";

export type LaporanTersimpan = { kode: string; nomor: string; jenis: JenisLaporan; dibuat: string };

const KUNCI = "laporan-bk";

export function bacaLaporanPerangkat(): LaporanTersimpan[] {
  try {
    const isi = JSON.parse(localStorage.getItem(KUNCI) ?? "[]");
    return Array.isArray(isi) ? isi.filter((x) => typeof x?.kode === "string" && x.jenis in LABEL_JENIS) : [];
  } catch {
    return [];
  }
}

export function simpanLaporanPerangkat(l: LaporanTersimpan) {
  try {
    const lain = bacaLaporanPerangkat().filter((x) => x.kode !== l.kode);
    localStorage.setItem(KUNCI, JSON.stringify([l, ...lain].slice(0, 20)));
  } catch {
    /* mode privat / penyimpanan penuh: abaikan */
  }
}

export function hapusLaporanPerangkat(kode: string) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(bacaLaporanPerangkat().filter((x) => x.kode !== kode)));
  } catch {
    /* abaikan */
  }
}
